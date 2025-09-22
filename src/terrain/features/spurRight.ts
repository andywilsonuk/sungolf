import { randomInt } from '../../shared/random'
import { mesaName, spurRightName } from './names'
import type { TerrainFeature } from './types'

const spurRight: TerrainFeature = {
  get name() {
    return spurRightName
  },
  allowed({ previous, next, relativeY }) {
    if (previous?.segment?.name === spurRightName) { return false }
    if (next?.segment?.name === mesaName) { return false }
    return relativeY > 30
  },
  apply(layout, { relativeX, relativeY }, rand) {
    const peak1X = Math.min(randomInt(rand, relativeX * 1.8, relativeX * 2), 250)
    const peak2X = randomInt(rand, 0, relativeX * 1.3)
    layout.cubic(relativeX, relativeY, peak1X, 0, peak2X, 0)
  },
}

export default spurRight
