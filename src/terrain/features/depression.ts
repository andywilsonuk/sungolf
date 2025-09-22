import { randomInt } from '../../shared/random'
import { floorDepth } from '../constants'
import { depressionName } from './names'
import type { TerrainFeature } from './types'

const depression: TerrainFeature = {
  get name() {
    return depressionName
  },
  allowed({ previous, y, relativeY }) {
    if (previous?.segment?.name === depressionName) { return false }
    return relativeY > -10 && relativeY < 10 && y < floorDepth - 90
  },
  apply(layout, { relativeX, relativeY }, rand) {
    const peakX = randomInt(rand, relativeX * 0.1, relativeX * 0.9)
    const peakY = randomInt(rand, 20, 90)
    layout.quadratic(relativeX, relativeY, peakX, peakY)
  },
}

export default depression
