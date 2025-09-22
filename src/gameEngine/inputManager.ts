import * as mouse from './mouseInput'
import * as touch from './touchInput'

interface InputState {
  position: [number, number] | null
  held: boolean
  cancelled: boolean
}

const current: InputState = {
  position: null,
  held: false,
  cancelled: false,
}

const init = (): void => {
  mouse.bindListeners()
  touch.bindListeners()
}

const beginFrame = (): void => {
  current.position = null
  current.held = false
  current.cancelled = false
  mouse.current(current)
  touch.current(current)
}

const clear = (): void => {
  mouse.unbindListeners()
  touch.unbindListeners()
}

export const inputState = (): InputState => current

const paused = (): void => {
  clear()
}
const resumed = (): void => {
  init()
}

export default {
  init,
  beginFrame,
  clear,
  paused,
  resumed,
}
