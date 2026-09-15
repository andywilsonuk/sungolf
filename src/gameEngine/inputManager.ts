import { bindListeners as bindMouseListeners, current as currentMouse, unbindListeners as unbindMouseListeners } from "./mouseInput"
import { bindListeners as bindTouchListeners, current as currentTouch, unbindListeners as unbindTouchListeners } from "./touchInput"

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
  bindMouseListeners()
  bindTouchListeners()
}

const beginFrame = (): void => {
  current.position = null
  current.held = false
  current.cancelled = false
  currentMouse(current)
  currentTouch(current)
}

const clear = (): void => {
  unbindMouseListeners()
  unbindTouchListeners()
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
