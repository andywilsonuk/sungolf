import { cactusName } from './names'

export default {
  get name () {
    return cactusName
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
