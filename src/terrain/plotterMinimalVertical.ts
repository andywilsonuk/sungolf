import debugLog from '../gameEngine/debugLog'
import { randomInt, randomShuffle, type RandomGenerator } from '../shared/random'
import { sequence } from '../shared/utils'
import type { Plotter } from './plotter'

export default (plotter: Plotter, targetY: number, rand: RandomGenerator): void => {
  const firstPoint = plotter.first
  if (!firstPoint) {
    throw new Error('Plotter has no first point')
  }
  const delta = targetY - firstPoint.y

  const sign = Math.sign(delta)
  let remaining = Math.abs(delta)
  const indexes = sequence(plotter.count - 2, 1) // not last or hole

  while (remaining > 0) {
    const loopRemaining = remaining
    randomShuffle(rand, indexes)

    for (const index of indexes) {
      const point = plotter.getByIndex(index)
      if (point.segment?.isSpecial) { continue }

      const pointRemainingY = plotter.availableYDistance(point, sign === 1)
      if (pointRemainingY === 0) { continue }

      const value = randomInt(rand, 1, Math.min(remaining, pointRemainingY)) * sign
      point.shiftByDelta(0, value)

      remaining -= Math.abs(value)
      if (remaining === 0) { break }
    }

    if (remaining === loopRemaining) {
      debugLog('Minimal vertical maxed')
      return
    }
  }
}
