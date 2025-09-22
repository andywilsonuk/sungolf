import { randomInt } from '../../shared/random'
import { clamp } from '../../shared/utils'
import { holeName, sinkholeName, spurLeftName } from './names'
import type { TerrainFeature, PlotterPoint } from './types'

const spurLeft: TerrainFeature = {
  get name() {
    return spurLeftName
  },
  allowed({ next, relativeY }: PlotterPoint) {
    if (next?.segment?.name === holeName) { return false }
    return relativeY < -30
  },
  apply(layout, { relativeX, relativeY, next }, rand) {
    const peak1X = clamp(0, 125, randomInt(rand, relativeX * 1.4, relativeX * (relativeX < 60 ? 1.6 : 1.9)))
    const peak2X = next?.segment?.name === sinkholeName ? 0 : randomInt(rand, peak1X * -0.5, relativeX * 1.1)
    layout.cubic(relativeX, relativeY, peak1X, 0, peak2X, 0)
  },
}

export default spurLeft
