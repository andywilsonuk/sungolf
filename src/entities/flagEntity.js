import { Vec2 } from 'planck-js'
import { Animation, linear } from '../gameEngine/animation'
import { addAnimation } from '../gameEngine/animator'
import { physicsScale, rayCast } from '../gameEngine/physics'
import { subscribeResize } from '../gameEngine/renderCanvas'
import { subscribe } from '../gameEngine/signalling'
import Hsl from '../shared/hsl'
import { holeDepth, holeWidth } from '../terrain/constants'
import { flipHorizontal, translatePhysics } from './canvasHelpers'
import { finalStageId, stageCompleteSignal, stageReadySignal } from './constants'

const flagColor = new Hsl(55, 100, 50).asString()
const poleColor = new Hsl(0, 0, 4).asString()
const flagFinalOffsetY = 30
const height = 13
const poleWidth = 3
const poleHeight = flagFinalOffsetY + holeDepth + 2
const flagPointWidth = 5
const flagPointOffset = 3
const flagRaiseAnimDuration = 1 * 1000
const obstructionCastLength = height * 3 * physicsScale

export default class FlagEntity {
  constructor () {
    this.visible = false
    this.stageId = null
    this.position = null
    this.leftObstructed = false
    this.rightObstructed = false
    this.flagRaiseAnimY = addAnimation(new Animation(linear, flagRaiseAnimDuration))
    this.boundaryRight = 0
    this.dirty = false
  }

  init () {
    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, this.show.bind(this))
    subscribe(stageCompleteSignal, this.hide.bind(this))
  }

  show ({ stageId, holePosition }) {
    if (stageId === finalStageId) { return }
    const x = holePosition.x + holeWidth * -0.5 * physicsScale
    const y = holePosition.y
    this.visible = true
    this.stageId = stageId
    this.position = Vec2(x, y)
    this.leftObstructed = false
    this.rightObstructed = false

    const rayY = y - flagFinalOffsetY * physicsScale + height * 0.5 * physicsScale
    const p1 = Vec2(x, rayY)
    const p2 = Vec2(x + obstructionCastLength, rayY)

    if (p2.x > this.boundaryRight) {
      this.obstructedRight()
    } else {
      rayCast(p1, p2, this.obstructedRight.bind(this))
    }
    const p2b = Vec2(x - obstructionCastLength, p2.y)
    rayCast(p1, p2b, this.obstructedLeft.bind(this))

    this.flagRaiseAnimY.start(0, -flagFinalOffsetY * physicsScale)
    this.dirty = true
  }

  hide () {
    this.visible = false
    this.flagRaiseAnimY.stop()
    this.dirty = true
  }

  obstructedLeft () {
    this.leftObstructed = true
    return 0
  }

  obstructedRight () {
    this.rightObstructed = true
    return 0
  }

  onResize ({ width }) {
    this.boundaryRight = width * physicsScale
  }

  renderOnCanvas (ctx) {
    this.dirty = this.flagRaiseAnimY.running
    if (!this.visible) { return }
    ctx.save()
    translatePhysics(ctx, this.position.x, this.position.y + this.flagRaiseAnimY.final)

    const leftDirection = this.rightObstructed && !this.leftObstructed

    ctx.fillStyle = poleColor
    ctx.fillRect(-poleWidth, -1, poleWidth, poleHeight)

    const flagText = this.stageId === 0 ? ' ' : this.stageId
    const poleEdge = leftDirection ? -poleWidth * physicsScale : 0
    translatePhysics(ctx, poleEdge, this.flagRaiseAnimY.current - this.flagRaiseAnimY.final)

    ctx.font = `${height}px Main`
    ctx.textBaseline = 'middle'
    const width = ctx.measureText(flagText).width + flagPointOffset

    if (leftDirection) { flipHorizontal(ctx) }
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(width, 0)
    ctx.lineTo(width + flagPointWidth, height * 0.5)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = flagColor
    ctx.fill()

    if (leftDirection) { flipHorizontal(ctx) }
    const textX = leftDirection ? width * -1 - 1 : 1
    ctx.fillStyle = poleColor
    ctx.fillText(flagText, textX, height * 0.5)

    ctx.restore()
  }
}
