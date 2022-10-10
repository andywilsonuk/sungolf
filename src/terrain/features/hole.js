import { holeDepth, holeSide, holeSlope, holeWidth } from '../constants'
import { holeName } from './names'

const edgeSlope = 2

export default {
  get name () {
    return holeName
  },
  allowed () {
    throw new Error('Not implemented')
  },
  apply (layout, _point, _rand) {
    layout.line(holeSide, edgeSlope)
    layout.line(holeSlope, holeDepth - edgeSlope)
    layout.line(holeWidth, 0)
    layout.line(holeSlope, -(holeDepth - edgeSlope))
    layout.line(holeSide, -edgeSlope)
  }
}
