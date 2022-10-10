import { towerName } from './names'

export default {
  get name () {
    return towerName
  },
  get isSpecial () {
    return true
  },
  allowed () {
    throw new Error('Not implemented')
  },
  apply (layout, { relativeX, relativeY }, rand) {
    const side = 1
    layout.line(side, 0)
    const peakX = relativeX * 0.5
    const peakY = -20
    layout.quadratic(relativeX - side * 2, relativeY, peakX, peakY)
    layout.line(side, 0)
  }
}
