import { flatName } from './names'
import type { TerrainFeature } from './types'

const flat: TerrainFeature = {
  get name() {
    return flatName
  },
  allowed({ relativeY }) {
    return relativeY === 0
  },
  apply(layout, { relativeX }, _rand) {
    layout.line(relativeX, 0)
  },
}

export default flat
