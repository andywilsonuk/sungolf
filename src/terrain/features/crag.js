import { randomInt } from '../../shared/random'
import { clamp } from '../../shared/utils'
import { ceilingDepth, floorDepth } from '../constants'
import { cragName } from './names'

export default {
  get name () {
    return cragName
  },
  allowed ({ relativeY, y }) {
    return relativeY > 30 && relativeY < 100 && y + 50 < floorDepth
  },
  apply (layout, { relativeX, relativeY, startY }, rand) {
    const halfX = relativeX * 0.5
    const halfY = relativeY * 0.5
    const depth1X = randomInt(rand, 0, halfX)
    const depthY = clamp(ceilingDepth - startY, 0, randomInt(rand, halfY * -1, halfY * -2.2))
    const depth2X = randomInt(rand, 0, halfX * 0.5)
    const innerSteepness = clamp(ceilingDepth - startY, 0, randomInt(rand, -50, 0))
    layout.cubic(halfX, halfY, depth1X, depthY, depth2X, innerSteepness)

    const overhangX = randomInt(rand, halfX * 0.25, halfX * 0.5)
    const slope = clamp(ceilingDepth - startY, 0, randomInt(rand, halfY * -0.5, halfY * -3))
    const depth = randomInt(rand, 0, halfX)
    const thickness = clamp(0, floorDepth - startY, randomInt(rand, 0, 30))
    layout.cubic(halfX, halfY, overhangX, slope, depth, thickness)
  }
}
