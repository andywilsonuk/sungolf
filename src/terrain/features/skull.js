import { skullName } from './names'

export default {
  get name () {
    return skullName
  },
  get isSpecial () {
    return true
  },
  allowed () {
    throw new Error('Not implemented')
  },
  apply (layout, { relativeX, relativeY }) {
    layout.line(relativeX, relativeY)
  }
}
