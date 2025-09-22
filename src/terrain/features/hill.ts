import { randomInt } from '../../shared/random'
import { clamp } from '../../shared/utils'
import { ceilingDepth } from '../constants'
import { hillName, spurRightName } from './names'
import type { TerrainFeature } from './types'

const side = 1

const hill: TerrainFeature = {
  get name() {
    return hillName
  },
  allowed({ previous, y, relativeY }) {
    if (previous?.segment?.name === spurRightName) { return false }
    if (previous?.segment?.name === hillName) { return false }
    return relativeY > -10 && relativeY < 10 && y - 50 > ceilingDepth
  },
  apply(layout, { relativeX, relativeY, startY }, rand) {
    layout.line(side, 0)
    const peakX = relativeY === 0 ? relativeX * 0.5 : randomInt(rand, relativeX * 0.1, relativeX * 0.9)
    const peakY = clamp(ceilingDepth - startY, 0, randomInt(rand, -50, -20))
    layout.quadratic(relativeX - side * 2, relativeY, peakX, peakY)
    layout.line(side, 0)
  },
}

export default hill
