import { Vec2 } from 'planck-js'
import { subscribe } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { clamp, normalize } from '../shared/utils'
import { ballTag, stageCompleteSignal, stageReadySignal } from './constants'
import { inputState } from '../gameEngine/inputManager'
import { subscribeResize } from '../gameEngine/renderCanvas'
import { scalePixelRatio } from './canvasHelpers'
import Hsl from '../shared/hsl'

const minPullback = 10
const maxPullback = 600 * 0.5
const minNormalisedLengthForVisual = 0.01
const minLengthForProject = 25
const stiffness = 0.0025
const stiffnessMultiplier = 4
const arrowColorString = new Hsl(224, 75, 45).asString()
const shadowColorString = new Hsl(225, 6, 13).asString()

const draw = (ctx, headSize, length, dash) => {
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
  constructor () {
    this.downPosition = Vec2.zero()
    this.upPosition = Vec2.zero()
    this.allowed = false
    this.isDown = false
    this.dirty = false
  }

  init () {
    this.ballEntity = getOneEntityByTag(ballTag)
    subscribe(stageReadySignal, this.start.bind(this))
    subscribe(stageCompleteSignal, this.stop.bind(this))
    subscribeResize(this.onResize.bind(this))
  }

  beginFrame (_timestamp) {
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

  onResize ({ renderWidth, renderHeight }) {
    this.canvasElement = document.getElementById('pullback')
    this.canvasElement.width = renderWidth
    this.canvasElement.height = renderHeight
  }

  renderInitial () {
    this.ctx = this.canvasElement.getContext('2d')
  }

  render () {
    if (!this.dirty) { return }
    const { ctx } = this
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!this.isDown) { return }

    const delta = Vec2.sub(this.upPosition, this.downPosition)
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

  project () {
    if (this.ballEntity.isMoving) { return }
    const delta = Vec2.sub(this.downPosition, this.upPosition)
    const currentLength = delta.length()
    if (currentLength < minLengthForProject) { return }
    const difference = Math.min(0.25, currentLength / maxPullback) * stiffnessMultiplier
    const force = Vec2.mul(delta, difference * stiffness)

    this.ballEntity.applyForce(force)
  }

  start () {
    this.allowed = true
  }

  stop () {
    this.allowed = false
    this.isDown = false
    this.dirty = true
  }
}
