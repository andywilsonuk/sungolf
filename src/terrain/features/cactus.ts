import { cactusName } from './names'
import type { TerrainFeature } from './types'

const cactus: TerrainFeature = {
  get name() {
    return cactusName
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

export default cactus
