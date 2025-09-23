import type { Vec2 } from 'planck-js'
import { Vec2 as Vec2Constructor } from 'planck-js'
import { EasingAnimation, linear } from '../gameEngine/easingAnimation'
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
  private visible = false
  private stageId: number | null = null
  private position: Vec2 | null = null
  private leftObstructed = false
  private rightObstructed = false
  private flagRaiseAnimY: EasingAnimation
  private boundaryRight = 0
  public dirty = false

  constructor() {
    this.visible = false
    this.stageId = null
    this.position = null
    this.leftObstructed = false
    this.rightObstructed = false
    this.flagRaiseAnimY = addAnimation(new EasingAnimation(linear, flagRaiseAnimDuration)) as EasingAnimation
    this.boundaryRight = 0
    this.dirty = false
  }

  init(): void {
    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [{ stageId: number, holePosition: Vec2 }]
      this.show(payload)
    })
    subscribe(stageCompleteSignal, this.hide.bind(this))
  }

  show({ stageId, holePosition }: { stageId: number, holePosition: Vec2 }): void {
    if (stageId === finalStageId) { return }
    const x = holePosition.x + holeWidth * -0.5 * physicsScale
    const y = holePosition.y
    this.visible = true
    this.stageId = stageId
    this.position = Vec2Constructor(x, y)
    this.leftObstructed = false
    this.rightObstructed = false

    const rayY = y - flagFinalOffsetY * physicsScale + height * 0.5 * physicsScale
    const p1 = Vec2Constructor(x, rayY)
    const p2 = Vec2Constructor(x + obstructionCastLength, rayY)

    if (p2.x > this.boundaryRight) {
      this.obstructedRight()
    } else {
      rayCast(p1, p2, this.obstructedRight.bind(this))
    }
    const p2b = Vec2Constructor(x - obstructionCastLength, p2.y)
    rayCast(p1, p2b, this.obstructedLeft.bind(this))

    this.flagRaiseAnimY.start(0, -flagFinalOffsetY * physicsScale)
    this.dirty = true
  }

  hide(): void {
    this.visible = false
    this.flagRaiseAnimY.stop()
    this.dirty = true
  }

  obstructedLeft(): number {
    this.leftObstructed = true
    return 0
  }

  obstructedRight(): number {
    this.rightObstructed = true
    return 0
  }

  onResize({ width }: { width: number }): void {
    this.boundaryRight = width * physicsScale
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    this.dirty = this.flagRaiseAnimY.running
    if (!this.visible || !this.position) { return }
    ctx.save()
    translatePhysics(ctx, this.position.x, this.position.y + (this.flagRaiseAnimY.final ?? 0))

    const leftDirection = this.rightObstructed && !this.leftObstructed

    ctx.fillStyle = poleColor
    ctx.fillRect(-poleWidth, -1, poleWidth, poleHeight)

    const flagText = this.stageId === 0 ? ' ' : String(this.stageId)
    const poleEdge = leftDirection ? -poleWidth * physicsScale : 0
    translatePhysics(ctx, poleEdge, this.flagRaiseAnimY.current - (this.flagRaiseAnimY.final ?? 0))

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
