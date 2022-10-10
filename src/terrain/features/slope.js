import { slopeName, spurRightName } from './names'

const side = 0.5

export default {
  get name () {
    return slopeName
  },
  allowed ({ relativeX, relativeY, previous }) {
    if (relativeY === 0) { return false }
    if (previous.segment?.name === spurRightName && relativeX < 75 && relativeY < -20) { return false }
    return true
  },
  apply (layout, { relativeX, relativeY }, _rand) {
    layout.line(side, 0)
    layout.line(relativeX - side * 2, relativeY)
    layout.line(side, 0)
  }
}
