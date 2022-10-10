import { ceilingDepth } from '../constants'
import { mesaName } from './names'

export default {
  get name () {
    return mesaName
  },
  allowed () {
    throw new Error('Not implemented')
  },
  apply (layout, { relativeX, relativeY, startY }, _rand) {
    const slope = 6
    const forcedY = startY - 200 < ceilingDepth ? ceilingDepth - startY : 200 - startY
    const endY = (forcedY * -1) + relativeY

    layout.line(slope, forcedY)
    layout.line(relativeX - slope * 2, 0)
    layout.line(slope, endY)
  }
}
