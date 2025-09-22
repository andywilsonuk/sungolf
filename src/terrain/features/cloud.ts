import { cloudName } from './names'
import type { TerrainFeature } from './types'

const cloud: TerrainFeature = {
  get name() {
    return cloudName
  },
  get isSpecial() {
    return true
  },
  allowed() {
    throw new Error('Not implemented')
  },
  apply(layout, { relativeX, relativeY }) {
    layout.line(relativeX, relativeY)
  },
}

export default cloud
