import { skullName } from './names'
import type { TerrainFeature } from './types'

const skull: TerrainFeature = {
  get name() {
    return skullName
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

export default skull
