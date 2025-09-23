/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { zoneColors } from '../orchestration'

const debug = false

export default class PaletteEntity {
  tags?: string[] | Set<string>

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    if (!debug) { return }

    const size = 15
    ctx.save()

    const zones = zoneColors()
    for (let i = 0; i < zones.length; i++) {
      const color = zones[i]
      if (color) {
        ctx.fillStyle = color.asString()
        ctx.fillRect(60 + size * i, 60, size, size)
      }
    }

    ctx.restore()
  }
}
