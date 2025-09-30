import type { Body, Contact, Vec2 as Vec2Type } from 'planck'
import { Circle, Vec2 } from 'planck'
import { audioIds } from '../audio'
import { EasingAnimation, easeInCubic, linear } from '../gameEngine/easingAnimation'
import { addAnimation } from '../gameEngine/animator'
import { enqueueAudio } from '../gameEngine/audioManager'
import { delay } from '../gameEngine/delay'
import { createDynamicBody, physicsScale, registerBeginContact } from '../gameEngine/physics'
import { dispatchSignal, subscribe } from '../gameEngine/signalling'
import Hsl from '../shared/hsl'
import { contactOtherFixture } from '../shared/planckHelpers'
import { clamp } from '../shared/utils'
import { holeTotalWidth } from '../terrain/constants'
import { circle, physicsScaleInverse, translateHeightPadding } from './canvasHelpers'
import { ballCategory, ballStrokeSignal, ballTag, boundaryCategory, finalStageId, stageCompleteSignal, stageReadySignal, stageTransitioningSignal, terrainCategory, waterCategory } from './constants'
import ParticleSystem from './particleSystem'
import ParticleTerrain from './particleTerrain'
import ParticleWater from './particleWater'
import type { StageReadyPayload } from '../types/stageReady'

const radius = 3
const radiusPhysics = radius * physicsScale
const ballColorString = new Hsl(0, 17, 98).asString()
const teeOffset = holeTotalWidth * 0.5 * physicsScale
const resetAnimDuration = 1 * 1000
const resetAnimLineWidth = 2
const resetAnimColor = new Hsl(0, 0, 90)
const largeParticleExplosion = 10
const mediumParticleExplosion = 6
const smallParticleExplosion = 3
const largeParticleWater = 20
const mediumParticleWater = 10

export interface BallPhysics {
  isMoving: boolean
  applyForce: (force: Vec2Type) => void
}

export interface BallShot {
  setShot: (position: Vec2Type, force: Vec2Type) => void
}

export default class BallEntity implements BallPhysics, BallShot {
  public tags = new Set([ballTag])
  public visible = false
  private resetAnimFade: EasingAnimation
  private resetAnimScale: EasingAnimation
  private restoredPosition: Vec2Type | null = null
  private restoredStroke: Vec2Type | null = null
  private dirtyPosition: Vec2Type
  private stageId: number | null = null
  private ballBody!: Body
  public terrainParticles!: ParticleSystem
  public waterParticles!: ParticleSystem
  private startPosition!: Vec2Type

  constructor() {
    this.resetAnimFade = addAnimation(new EasingAnimation(easeInCubic, resetAnimDuration)) as EasingAnimation
    this.resetAnimScale = addAnimation(new EasingAnimation(linear, resetAnimDuration)) as EasingAnimation
    this.dirtyPosition = Vec2.zero()
  }

  spawn(): void {
    this.terrainParticles = new ParticleSystem(largeParticleExplosion * 3, ParticleTerrain)
    this.terrainParticles.spreadMinMax = [0.2, 0.5]
    this.waterParticles = new ParticleSystem(largeParticleWater, ParticleWater)
    this.waterParticles.initialMinMaxX = [-0.3, 0.3]
    this.waterParticles.initialMinMaxY = [0.4, 0.6]
    this.waterParticles.spreadMinMax = [0.2, 0.8]
  }

  init(): void {
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [StageReadyPayload]
      this.start(payload)
    })
    subscribe(stageCompleteSignal, this.stop.bind(this))
    subscribe(stageTransitioningSignal, this.hide.bind(this))
    registerBeginContact(this.onHit.bind(this))

    const ball = createDynamicBody({
      bullet: true,
      fixedRotation: true,
      linearDamping: 0.05,
      active: false,
    })
    ball.createFixture(new Circle(radiusPhysics), {
      friction: 0.5,
      restitution: 0.2,
      filterCategoryBits: ballCategory,
    })
    ball.setMassData({
      mass: 0.0459,
      center: Vec2.zero(),
      I: 1,
    })
    this.ballBody = ball
  }

  get dirty(): boolean {
    return this.resetAnimScale.running || !Vec2.areEqual(this.ballBody.getPosition(), this.dirtyPosition)
  }

  setShot(position: Vec2Type, force: Vec2Type): void {
    this.restoredPosition = position
    this.restoredStroke = force
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) { return }

    const { x, y } = this.ballBody.getPosition()
    const centerX = x * physicsScaleInverse + radius * 0.5
    const centerY = y * physicsScaleInverse + radius * 0.5

    ctx.save()
    translateHeightPadding(ctx)
    circle(ctx, radius, centerX, centerY)
    ctx.fillStyle = ballColorString
    ctx.fill()

    const resetScaleAnim = this.resetAnimScale
    if (resetScaleAnim.running) {
      const scale = resetScaleAnim.current
      const alpha = this.resetAnimFade.current
      circle(ctx, radius * scale, centerX, centerY)
      ctx.lineWidth = resetAnimLineWidth
      ctx.strokeStyle = resetAnimColor.asString(alpha)
      ctx.fillStyle = resetAnimColor.asString(alpha * 0.5)
      ctx.stroke()
      ctx.fill()
    }

    ctx.restore()
    this.dirtyPosition.set(x, y)
  }

  outOfBounds(): void {
    this.visible = false
    this.stop()
    if (this.stageId === finalStageId) {
      return
    }
    delay(this.reset.bind(this), 1000)
  }

  reset(): void {
    this.ballBody.setPosition(this.startPosition)
    this.ballBody.setActive(true)
    this.visible = true
    enqueueAudio(audioIds.resetBall)
    this.resetAnimScale.start(0, 6)
    this.resetAnimFade.start(1, 0)
  }

  start({ stageId, startPosition }: StageReadyPayload): void {
    this.startPosition = new Vec2(startPosition.x + teeOffset, startPosition.y - radiusPhysics * 5)
    const restoring = this.restoredPosition !== null

    if (restoring && this.restoredPosition && this.restoredStroke) {
      this.ballBody.setPosition(this.restoredPosition)
      this.ballBody.applyLinearImpulse(this.restoredStroke, Vec2.zero(), true)
    } else {
      this.ballBody.setPosition(this.startPosition)
      enqueueAudio(audioIds.stageStart)
    }
    this.ballBody.setActive(true)
    this.visible = true
    this.restoredPosition = null
    this.restoredStroke = null
    this.stageId = stageId
  }

  stop(): void {
    this.ballBody.setActive(false)
    this.ballBody.setLinearVelocity(Vec2.zero())
    this.ballBody.setPosition(Vec2.zero())
  }

  hide(): void {
    this.visible = false
  }

  get isMoving(): boolean {
    return this.ballBody.getLinearVelocity().lengthSquared() > 0.5
  }

  applyForce(force: Vec2Type): void {
    if (!this.visible) { return }
    this.ballBody.applyLinearImpulse(force, Vec2.zero(), true)
    this.resetAnimFade.stop()
    this.resetAnimScale.stop()

    dispatchSignal(ballStrokeSignal, { position: this.ballBody.getPosition(), stroke: force })

    if (force.lengthSquared() < 0.015) {
      enqueueAudio(audioIds.putt)
    } else {
      enqueueAudio(audioIds.swing)
    }
  }

  onHit(contact: Contact): void {
    if (!this.visible) { return }

    const target = contactOtherFixture(contact, this.ballBody)
    if (target === undefined) { return }
    const category = target.getFilterCategoryBits()

    const isBoundaryHit = category === boundaryCategory
    const isTerrainHit = category === terrainCategory
    const isWaterHit = category === waterCategory && target.getBody().isActive()

    if (isBoundaryHit) {
      // can't change ballBody inside of contact callback
      delay(this.outOfBounds.bind(this), 0)
      return
    }
    if (!isTerrainHit && !isWaterHit) { return }

    const velocityUnit = this.ballBody.getLinearVelocity().clone().neg()
    const position = this.ballBody.getPosition().clone()

    if (isTerrainHit) {
      this.showTerrainParticles(velocityUnit, position)
    } else {
      this.showWaterParticles(velocityUnit, position)
      delay(this.outOfBounds.bind(this), 0)
    }
  }

  showTerrainParticles(velocityUnit: Vec2Type, position: Vec2Type): void {
    const magnitude = velocityUnit.normalize()
    let count = 0

    if (magnitude < 4) { return }

    if (magnitude > 10) {
      count = largeParticleExplosion
    } else if (magnitude > 6) {
      count = mediumParticleExplosion
    } else {
      count = smallParticleExplosion
    }
    this.terrainParticles.execute(count, position, velocityUnit)
    enqueueAudio(count === largeParticleExplosion ? audioIds.largeImpact : audioIds.smallImpact)
  }

  showWaterParticles(velocityUnit: Vec2Type, position: Vec2Type): void {
    const magnitude = velocityUnit.normalize()
    let count = 0

    if (magnitude > 6) {
      count = largeParticleWater
    } else {
      count = mediumParticleWater
    }

    velocityUnit.mul(clamp(2.5, 3, magnitude * 0.3))
    this.waterParticles.execute(count, position, velocityUnit)
    enqueueAudio(audioIds.water)
  }
}
