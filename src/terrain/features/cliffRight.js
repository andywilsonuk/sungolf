import { randomInt } from '../../shared/random'
import { clamp } from '../../shared/utils'
import { ceilingDepth, floorDepth } from '../constants'
import { cliffRightName, holeName, spurRightName } from './names'

export default {
  get name () {
    return cliffRightName
  },
  allowed ({ previous, relativeX, relativeY, y }) {
    if (previous.isFirst) { return false }
    if (previous.segment?.name === spurRightName) { return false }
    if (previous.segment?.name === cliffRightName) { return false }
    if (relativeX < 80) { return false }
    return relativeY > 30 && y + 50 < floorDepth
  },
  apply (layout, { relativeX, relativeY, startY, next }, rand) {
    const holeNext = next.segment?.name === holeName
    const peak1X = randomInt(rand, 0, relativeX * 0.75)
    const peak1Y = clamp(ceilingDepth - startY, 0, randomInt(rand, relativeY * -0.5, relativeY * -3))
    const peak2X = clamp(0, relativeX + 100, randomInt(rand, 0, relativeX * (holeNext ? 1.4 : 1.8)))
    const peak2Y = clamp(0, floorDepth - startY, randomInt(rand, 0, 30)) * (peak1Y < 0 ? -1 : 1)

    layout.cubic(relativeX, relativeY, peak1X, peak1Y, peak2X, peak2Y)
  }
}
