import type { Body, Vec2 } from 'planck-js'
import { Polygon, Vec2 as Vec2Constructor } from 'planck-js'
import type Hsl from '../shared/hsl'
import { finalStageId, stageCompleteSignal, stageReadySignal, stageTransitioningSignal, terrainCategory, terrainTag } from './constants'
import terrainGen from '../terrain'
import { createBody, physicsScale } from '../gameEngine/physics'
import { dispatchSignal, subscribe } from '../gameEngine/signalling'
import TerrainManager, { TerrainData } from './terrainManager'
import { absoluteFloorDepth, holeDepth, holeTotalWidth, teeWidth as teeWidthBase, teeX } from '../terrain/constants'
import { enqueueAudio } from '../gameEngine/audioManager'
import { audioIds } from '../audio'
import { delay } from '../gameEngine/delay'
import { debugBodyRender, translatePhysics } from './canvasHelpers'
import terrainParser from '../terrainParser'
import { Animation, linear } from '../gameEngine/animation'
import { addAnimation } from '../gameEngine/animator'
import orchestration from '../orchestration'
import debugLog from '../gameEngine/debugLog'
import { addEntity } from '../gameEngine/world'
import SkullEntity from './skullEntity'
import CloudEntity from './cloudEntity'
import CactusEntity from './cactusEntity'
import { cactusName, cloudName, skullName, towerName } from '../terrain/features/names'
import TowerEntity from './towerEntity'

const bodyOptions = {
  active: false
}
const fixtureOptions = {
  friction: 0.8,
  filterCategoryBits: terrainCategory
}
const teeWidth = teeWidthBase * physicsScale
const startOffset = teeX * physicsScale
const transitionDelay = 0.75 * 1000
const transitionDuration = 1 * 1000

interface SpecialObject {
  show?(position: Vec2): void
  hide?(): void
  disable?(): void
  enable?(offset: Vec2): void
  renderOnCanvas?(ctx: CanvasRenderingContext2D): void
}

export default class TerrainEntity {
  public tags = new Set([terrainTag])
  private terrain = new TerrainManager()
  private stageLoaded = false
  public wireframe = false
  private transitionAnim: Animation
  public terrainColor: Hsl | null = null
  public dirty = false
  public stageId!: number
  private specialObjects!: Map<string, SpecialObject>

  constructor() {
    this.transitionAnim = addAnimation(new Animation(linear, transitionDuration, this.transitionDone.bind(this)))
  }

  spawn(): void {
    this.specialObjects = new Map([
      [cloudName, addEntity(new CloudEntity())],
      [cactusName, addEntity(new CactusEntity())],
      [skullName, addEntity(new SkullEntity())],
      [towerName, addEntity(new TowerEntity())]
    ])
  }

  init(): void {
    subscribe(stageCompleteSignal, this.stageComplete.bind(this))
  }

  populateTerrainData(stageId: number): void {
    const { commands, path, startY, distance, special } = terrainGen(stageId)
    const body = createBody(bodyOptions)

    if (stageId > finalStageId) {
      this.terrain.add(new TerrainData('', startY * physicsScale, 0, body, undefined))
      return
    }

    const terrainParts = terrainParser(commands, stageId)
    terrainParts.forEach((part, partId) => {
      const polygon = Polygon(part)
      const fixture = body.createFixture(polygon, fixtureOptions)
      fixture.setUserData(`${stageId},${partId}`)
      if (fixture.getShape().m_vertices[0].y === -1) {
        debugLog('bad shape', fixture.getUserData(), part)
      }
    })
    body.setUserData(stageId)

    const specialObject = this.specialObjects.get(special?.name ?? '')
    specialObject?.show?.(Vec2Constructor(special?.x ?? 0 * physicsScale, special?.y ?? 0 * physicsScale))
    this.terrain.add(new TerrainData(path, startY * physicsScale, (distance - 1) * physicsScale, body, specialObject))
  }

  get terrainOffsetX(): number {
    const transitionAnim = this.transitionAnim
    return transitionAnim.running ? transitionAnim.current : this.terrain.offsetX
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    this.dirty = this.transitionAnim.running
    if (!this.stageLoaded) { return }

    const definitions = this.terrain.definitions
    const transitionAnim = this.transitionAnim
    const offsetX = transitionAnim.running ? transitionAnim.current : this.terrain.offsetX

    ctx.save()
    ctx.fillStyle = this.terrainColor?.asString() ?? ''

    translatePhysics(ctx, offsetX, 0)

    // tee cover
    ctx.save()
    const teeX = this.terrain.previous.distance - startOffset
    const teeY = this.terrain.current.startY
    translatePhysics(ctx, teeX, teeY)
    ctx.fillRect(0, 1, holeTotalWidth, holeDepth)
    ctx.restore()

    for (let i = 0; i < definitions.length; i++) {
      const definition = definitions[i]
      ctx.fill(definition.renderPath)

      definition.specialObject?.renderOnCanvas?.(ctx)

      translatePhysics(ctx, definition.distance, 0)
    }

    ctx.restore()

    if (!this.wireframe) { return }
    for (let i = 0; i < definitions.length; i++) {
      const definition = definitions[i]
      debugBodyRender(ctx, definition.body, true)
    }
  }

  setStage(stageId: number): void {
    if (this.stageLoaded) {
      this.terrain.clear()
    }

    this.populateTerrainData(stageId - 1)
    this.populateTerrainData(stageId)
    this.populateTerrainData(stageId + 1)

    this.terrain.setInitialOffset(startOffset + teeWidth)
    this.terrainColor = orchestration(stageId).color
    this.terrain.enable()
    this.notifyReady(stageId)
  }

  notifyReady(stageId: number): void {
    this.stageId = stageId
    this.stageLoaded = true

    const stageTerrain = this.terrain.current
    const nextTerrain = this.terrain.next

    const startPosition = Vec2Constructor(startOffset, stageTerrain.startY)
    const holePosition = Vec2Constructor(stageTerrain.distance + startOffset + teeWidth, nextTerrain?.startY ?? absoluteFloorDepth)

    dispatchSignal(stageReadySignal, { stageId, startPosition, holePosition })
  }

  transitionStart(): void {
    this.terrain.disable()
    this.transitionAnim.start(this.terrain.offsetX, this.terrain.offsetX - this.terrain.current.distance + 0.01)
    enqueueAudio(audioIds.stageTransition)
    dispatchSignal(stageTransitioningSignal)
  }

  transitionDone(): void {
    this.transitionAnim.final !== undefined && this.terrain.setOffset(this.transitionAnim.final)
    this.terrainColor = orchestration(this.stageId + 1).color
    this.terrain.enable()
    this.notifyReady(this.stageId + 1)
  }

  stageComplete(): void {
    this.populateTerrainData(this.stageId + 2)
    delay(this.transitionStart.bind(this), transitionDelay)
    enqueueAudio(audioIds.stageComplete)
  }

  toggleWireframe(): void {
    this.wireframe = !this.wireframe
    this.dirty = true
  }
}