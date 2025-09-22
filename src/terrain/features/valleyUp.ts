import { randomInt } from '../../shared/random'
import { valleyUpName } from './names'
import type { TerrainFeature } from './types'

const valleyUp: TerrainFeature = {
  get name() {
    return valleyUpName
  },
  allowed({ relativeY }) {
    return relativeY < -10
  },
  apply(layout, { relativeX, relativeY }, rand) {
    const peak2X = randomInt(rand, relativeX * 0.5, relativeX)
    const peak1X = randomInt(rand, 0, Math.min(relativeX - peak2X, relativeX * 0.5))
    layout.cubic(relativeX, relativeY, peak1X, 0, peak2X, 0)
  },
}

export default valleyUp
