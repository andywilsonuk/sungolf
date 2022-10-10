import { flatName } from './names'

export default {
  get name () {
    return flatName
  },
  allowed ({ relativeY }) {
    return relativeY === 0
  },
  apply (layout, { relativeX }, _rand) {
    layout.line(relativeX, 0)
  }
}
