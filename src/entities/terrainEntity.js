import { finalStageId, stageCompleteSignal, stageReadySignal, stageTransitioningSignal, terrainCategory, terrainTag } from './constants'
import terrainGen from '../terrain'
import { createBody, physicsScale } from '../gameEngine/physics'
import { Polygon, Vec2 } from 'planck-js'
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

export default class TerrainEntity {
  constructor () {
    this.tags = new Set([terrainTag])
    this.terrain = new TerrainManager()
    this.stageLoaded = false
    this.wireframe = false
    this.transitionAnim = addAnimation(new Animation(linear, transitionDuration, this.transitionDone.bind(this)))
    this.terrainColor = null
    this.dirty = false
  }

  spawn () {
    this.specialObjects = new Map([
      [cloudName, addEntity(new CloudEntity())],
      [cactusName, addEntity(new CactusEntity())],
      [skullName, addEntity(new SkullEntity())],
      [towerName, addEntity(new TowerEntity())]
    ])
  }

  init () {
    subscribe(stageCompleteSignal, this.stageComplete.bind(this))
  }

  populateTerrainData (stageId) {
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

    const specialObject = this.specialObjects.get(special?.name)
    specialObject?.show(Vec2(special.x * physicsScale, special.y * physicsScale))
    this.terrain.add(new TerrainData(path, startY * physicsScale, (distance - 1) * physicsScale, body, specialObject))
  }

  get terrainOffsetX () {
    const transitionAnim = this.transitionAnim
    return transitionAnim.running ? transitionAnim.current : this.terrain.offsetX
  }

  renderOnCanvas (ctx) {
    this.dirty = this.transitionAnim.running
    if (!this.stageLoaded) { return }

    const definitions = this.terrain.definitions
    const transitionAnim = this.transitionAnim
    const offsetX = transitionAnim.running ? transitionAnim.current : this.terrain.offsetX

    ctx.save()
    ctx.fillStyle = this.terrainColor.asString()

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

      definition.specialObject?.renderOnCanvas(ctx)

      translatePhysics(ctx, definition.distance, 0)
    }

    ctx.restore()

    if (!this.wireframe) { return }
    for (let i = 0; i < definitions.length; i++) {
      const definition = definitions[i]
      debugBodyRender(ctx, definition.body, true)
    }
  }

  setStage (stageId) {
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

  notifyReady (stageId) {
    this.stageId = stageId
    this.stageLoaded = true

    const stageTerrain = this.terrain.current
    const nextTerrain = this.terrain.next

    const startPosition = Vec2(startOffset, stageTerrain.startY)
    const holePosition = Vec2(stageTerrain.distance + startOffset + teeWidth, nextTerrain?.startY ?? absoluteFloorDepth)

    dispatchSignal(stageReadySignal, { stageId, startPosition, holePosition })
  }

  transitionStart () {
    this.terrain.disable()
    this.transitionAnim.start(this.terrain.offsetX, this.terrain.offsetX - this.terrain.current.distance + 0.01)
    enqueueAudio(audioIds.stageTransition)
    dispatchSignal(stageTransitioningSignal)
  }

  transitionDone () {
    this.terrain.setOffset(this.transitionAnim.final)
    this.terrainColor = orchestration(this.stageId + 1).color
    this.terrain.enable()
    this.notifyReady(this.stageId + 1)
  }

  stageComplete () {
    this.populateTerrainData(this.stageId + 2)
    delay(this.transitionStart.bind(this), transitionDelay)
    enqueueAudio(audioIds.stageComplete)
  }

  toggleWireframe () {
    this.wireframe = !this.wireframe
    this.dirty = true
  }
}
