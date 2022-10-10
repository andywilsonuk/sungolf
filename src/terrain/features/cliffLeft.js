import { randomInt } from '../../shared/random'
import { clamp } from '../../shared/utils'
import { ceilingDepth } from '../constants'
import { cliffLeftName, holeName, spurRightName } from './names'

export default {
  get name () {
    return cliffLeftName
  },
  allowed ({ previous, next, relativeY, y }) {
    if (previous.segment?.name === spurRightName) { return false }
    if (next.segment?.name === holeName) { return false }
    return relativeY > -100 && relativeY < -30 && y - 50 > ceilingDepth
  },
  apply (layout, { relativeX, relativeY, startY }, rand) {
    const depth2X = randomInt(rand, 0, relativeX * 0.9)
    const depth1X = clamp(0, relativeX + 100, randomInt(rand, relativeX * 2, relativeX * 2.5) - depth2X)
    const depthY = clamp(ceilingDepth - startY, 0, randomInt(rand, relativeY * -1, relativeY * -2.2))

    const innerSteepness = clamp(ceilingDepth - startY, 0, randomInt(rand, -50, 0))

    layout.cubic(relativeX, relativeY, depth1X, depthY, depth2X, innerSteepness)
  }
}
