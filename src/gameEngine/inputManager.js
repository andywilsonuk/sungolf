import * as mouse from './mouseInput'
import * as touch from './touchInput'

const current = {
  position: null,
  held: false,
  cancelled: false
}

const init = () => {
  mouse.bindListeners()
  touch.bindListeners()
}

const beginFrame = () => {
  current.position = null
  current.held = false
  current.cancelled = false
  mouse.current(current)
  touch.current(current)
}

const clear = () => {
  mouse.unbindListeners()
  touch.unbindListeners()
}

export const inputState = () => current

const paused = () => {
  clear()
}
const resumed = () => {
  init()
}

export default {
  init,
  beginFrame,
  clear,
  paused,
  resumed
}
