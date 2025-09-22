import { absoluteFloorDepth } from '../constants'
import { sinkholeName } from './names'
import type { TerrainFeature } from './types'

const sinkhole: TerrainFeature = {
  get name() {
    return sinkholeName
  },
  allowed() {
    throw new Error('Not implemented')
  },
  apply(layout, { relativeX, relativeY, startY }, _rand) {
    const slope = 6
    const forcedY = absoluteFloorDepth - startY - 0.01
    const endY = -forcedY + relativeY

    layout.line(slope, forcedY)
    layout.line(relativeX - slope * 2, 0)
    layout.line(slope, endY)
  },
}

export default sinkhole
