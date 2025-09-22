import { randomInt } from '../../shared/random'
import { valleyDownName } from './names'
import type { TerrainFeature } from './types'

const valleyDown: TerrainFeature = {
  get name() {
    return valleyDownName
  },
  allowed({ relativeY }) {
    return relativeY > 30
  },
  apply(layout, { relativeX, relativeY }, rand) {
    const peak1X = randomInt(rand, relativeX * 0.5, relativeX)
    const peak2X = -randomInt(rand, 0, (relativeX * 1.2) - peak1X)
    layout.cubic(relativeX, relativeY, peak1X, 0, peak2X, 0)
  },
}

export default valleyDown
