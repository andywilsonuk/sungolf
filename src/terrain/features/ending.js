import { absoluteFloorDepth } from '../constants'
import { endingName } from './names'

export default {
  get name () {
    return endingName
  },
  allowed () {
    throw new Error('Not implemented')
  },
  apply (layout, { relativeX, startY }, _rand) {
    const slope = 6
    const forcedY = absoluteFloorDepth - startY - 0.01

    layout.line(slope, forcedY)
    layout.line(relativeX - slope * 2, 0)
  }
}
