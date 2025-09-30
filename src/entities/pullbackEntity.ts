import { Vec2 } from 'planck'
import { subscribe } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { clamp, normalize } from '../shared/utils'
import { ballTag, stageCompleteSignal, stageReadySignal } from './constants'
import type { StageReadyPayload } from '../types/stageReady'
import { inputState } from '../gameEngine/inputManager'
import { subscribeResize, type ResizePayload } from '../gameEngine/renderCanvas'
import { scalePixelRatio } from './canvasHelpers'
import Hsl from '../shared/hsl'
import type { BallPhysics } from './ballEntity'

const minPullback = 10
const maxPullback = 600 * 0.5
const minNormalisedLengthForVisual = 0.01
const minLengthForProject = 25
const stiffness = 0.0025
const stiffnessMultiplier = 4
const arrowColorString = new Hsl(224, 75, 45).asString()
const shadowColorString = new Hsl(225, 6, 13).asString()

const draw = (ctx: CanvasRenderingContext2D, headSize: number, length: number, dash: number[]): void => {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(headSize, headSize * -0.25)
  ctx.moveTo(0, 0)
  ctx.lineTo(headSize, headSize * 0.25)
  ctx.setLineDash([])
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(length * maxPullback, 0)
  ctx.setLineDash(dash)
  ctx.stroke()
}

export default class PullbackEntity {
  private downPosition: Vec2 = Vec2.zero()
  private upPosition: Vec2 = Vec2.zero()
  private allowed = false
  private isDown = false
  public dirty = false
  private ballEntity: BallPhysics | null = null
  private canvasElement!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D

  constructor() {
    this.downPosition = Vec2.zero()
    this.upPosition = Vec2.zero()
    this.allowed = false
    this.isDown = false
    this.dirty = false
  }

  init(): void {
    this.ballEntity = getOneEntityByTag(ballTag) as BallPhysics
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [_payload] = args as [StageReadyPayload]
      this.start()
    })
    subscribe(stageCompleteSignal, this.stop.bind(this))
    subscribeResize(this.onResize.bind(this))
  }

  beginFrame(_timestamp: number): void {
    if (!this.allowed) { return }
    const { position, held, cancelled } = inputState()
    const isAlreadyDown = this.isDown

    if (position === null || cancelled) {
      if (isAlreadyDown) {
        this.isDown = false
        this.dirty = true
      }
      return
    }

    const [x, y] = position

    this.dirty = this.upPosition.x !== x || this.upPosition.y !== y
    this.upPosition = this.upPosition.set(x, y)

    if (!isAlreadyDown && held) {
      this.downPosition = this.downPosition.set(x, y)
      this.isDown = true
      this.dirty = true
      return
    }
    if (isAlreadyDown && !held) {
      this.project()
      this.isDown = false
      this.dirty = true
    }
  }

  onResize({ renderWidth, renderHeight }: ResizePayload): void {
    const canvasElement = document.getElementById('pullback')
    if (!canvasElement) {
      throw new Error('Canvas element with id "pullback" not found')
    }
    this.canvasElement = canvasElement as HTMLCanvasElement
    this.canvasElement.width = renderWidth
    this.canvasElement.height = renderHeight
  }

  renderInitial(): void {
    const ctx = this.canvasElement.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2d context from canvas')
    }
    this.ctx = ctx
  }

  render(): void {
    if (!this.dirty) { return }
    const { ctx } = this
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!this.isDown) { return }

    const delta = this.upPosition.sub(this.downPosition)
    const normalizedLength = normalize(delta.length(), minPullback, maxPullback)
    const currentLength = clamp(0, 1, normalizedLength)

    ctx.save()
    scalePixelRatio(ctx)

    // pullback uses absolute canvas coordinates
    const { x, y } = this.downPosition
    ctx.translate(x, y)
    ctx.lineWidth = 2

    if (currentLength < minNormalisedLengthForVisual) {
      const radius = 3
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = arrowColorString
      ctx.stroke()
    } else {
      const rotation = Math.atan2(delta.y, delta.x)
      const arrowSize = (currentLength + 0.1) * 50

      ctx.rotate(rotation)

      ctx.strokeStyle = shadowColorString
      ctx.lineWidth = 4
      draw(ctx, arrowSize, currentLength, [7, 2])

      ctx.translate(1, 0)
      ctx.strokeStyle = arrowColorString
      ctx.lineWidth = 2
      draw(ctx, arrowSize, currentLength, [5, 4])
    }
    ctx.restore()
  }

  project(): void {
    if (!this.ballEntity || this.ballEntity.isMoving) { return }
    const delta = this.downPosition.sub(this.upPosition)
    const currentLength = delta.length()
    if (currentLength < minLengthForProject) { return }
    const difference = Math.min(0.25, currentLength / maxPullback) * stiffnessMultiplier
    const force = delta.mul(difference * stiffness)

    this.ballEntity.applyForce(force)
  }

  start(): void {
    this.allowed = true
  }

  stop(): void {
    this.allowed = false
    this.isDown = false
    this.dirty = true
  }
}
