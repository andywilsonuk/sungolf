import { randomInt } from '../../shared/random'
import { ridgeUpName } from './names'
import type { TerrainFeature } from './types'

const ridgeUp: TerrainFeature = {
  get name() {
    return ridgeUpName
  },
  allowed({ relativeY }) {
    return relativeY < -10
  },
  apply(layout, { relativeX, relativeY }, rand) {
    const peak1X = randomInt(rand, relativeX * 0.2, relativeX - 10)
    const peak2X = randomInt(rand, 0, Math.min(relativeX - peak1X, relativeX * 0.5))
    layout.cubic(relativeX, relativeY, peak1X, 0, peak2X, 0)
  },
}

export default ridgeUp
