import debugLog from '../gameEngine/debugLog'
import { randomInt, randomShuffle, randomTernary } from '../shared/random'
import { sequence } from '../shared/utils'

export default (plotter, delta, rand) => {
  let remaining = Math.abs(delta)
  const indexes = sequence(plotter.count - 3, 1) // not first, last or hole

  while (remaining > 0) {
    const loopRemaining = remaining
    randomShuffle(rand, indexes)

    for (let i = 0; i < indexes.length; i++) {
      const point = plotter.getByIndex(indexes[i])
      if (point.segment?.isSpecial) { continue }

      let sign = randomTernary(rand, -1, 1)
      let pointRemainingY = plotter.availableYDistance(point, sign === 1)
      if (pointRemainingY === 0) {
        sign = sign * -1
        pointRemainingY = plotter.availableYDistance(point, sign === 1)
      }

      if (pointRemainingY === 0) { continue }

      let value = randomInt(rand, 1, Math.min(remaining, pointRemainingY)) * sign
      const next = point.next
      point.setByDelta(0, value)
      if (next) {
        next.recalcRelative()
        if (next.segment?.isSpecial) {
          const ry = next.relativeY
          next.setByDelta(0, ry * -1)
          next.next?.recalcRelative()
          value += Math.abs(ry)
        } else {
          next.recalcRelative()
        }
      }

      remaining -= Math.abs(value)
      if (remaining === 0) { break }
    }

    if (remaining === loopRemaining) {
      debugLog(`Drift maxed, ${remaining} remaining of ${Math.abs(delta)}`)
      return
    }
  }
}
