import { subscribe } from '../gameEngine/signalling'
import Hsl from '../shared/hsl'
import { lerp, normalize } from '../shared/utils'
import { circle } from './canvasHelpers'
import { finalStageId, stageReadySignal } from './constants'

const debug = false
const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180)
const sunColor = new Hsl(60, 100, 43)
const debugColorString = new Hsl(0, 0, 8).asString()

export default class SunEntity {
  private normalizedAngle = 0
  private normalizedAlpha = 0

  init(): void {
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [{ stageId }] = args as [{ stageId: number }]
      this.stageReady({ stageId })
    })
    this.normalizedAngle = 0
    this.normalizedAlpha = 0
  }

  stageReady({ stageId }: { stageId: number }): void {
    const sunDownStart = finalStageId - 50
    const initial = -55
    const stop = -170
    const end = -210
    const defaultAlpha = 0.3

    if (stageId > sunDownStart) {
      this.normalizedAngle = degreesToRadians(lerp(stop, end, normalize(stageId, sunDownStart, finalStageId)))
      this.normalizedAlpha = lerp(defaultAlpha, 0, normalize(stageId, sunDownStart, finalStageId))
    } else {
      this.normalizedAngle = degreesToRadians(lerp(initial, stop, normalize(stageId, 0, sunDownStart)))
      this.normalizedAlpha = defaultAlpha
    }
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    const centerX = 450
    const centerY = 420
    const radius = 350
    const current = this.normalizedAngle

    const dx = Math.cos(current) * radius
    const dy = Math.sin(current) * radius
    const x = Math.floor(centerX + dx)
    const y = Math.floor(centerY + dy)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (debug) {
      circle(ctx, radius, centerX, centerY)
      ctx.strokeStyle = debugColorString
      ctx.setLineDash([5, 4])
      ctx.stroke()
    }

    circle(ctx, 22, x, y)
    ctx.fillStyle = sunColor.asString(this.normalizedAlpha)
    ctx.fill()
    circle(ctx, 20, x, y)
    ctx.fill()
    ctx.restore()
  }
}
