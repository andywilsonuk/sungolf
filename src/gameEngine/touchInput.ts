interface InputState {
  position: [number, number] | null
  held: boolean
  cancelled: boolean
}

let changedThisFrame = false
let currentX: number
let currentY: number
let held = false
let cancelled = false
let element: HTMLElement | null

const down = (e: TouchEvent): void => {
  const { clientX, clientY } = e.changedTouches[0]
  const { left, top, right, bottom, width, height } = element!.getBoundingClientRect()
  const pad = Math.min(width, height) * 0.05
  if (clientX < left + pad || clientX > right - pad || clientY < top + pad || clientY > bottom - pad) {
    return
  }
  if (e.cancelable) { e.preventDefault() }
  held = true
  currentX = clientX
  currentY = clientY
  changedThisFrame = true
}
const move = (e: TouchEvent): void => {
  if (!held) { return }
  e.stopImmediatePropagation()
  const { clientX, clientY } = e.changedTouches[0]
  currentX = clientX
  currentY = clientY
  changedThisFrame = true
}
const up = (e: TouchEvent): void => {
  if (!held) { return }
  if (e.cancelable) { e.preventDefault() }

  const { clientX, clientY } = e.changedTouches[0]
  currentX = clientX
  currentY = clientY
  held = false
  changedThisFrame = true
}
const cancel = (e?: TouchEvent): void => {
  if (!held) { return }
  if (e && e.cancelable) { e.preventDefault() }
  held = false
  cancelled = true
  changedThisFrame = true
}

export const bindListeners = (): void => {
  element = document.getElementById('pullback')
  element?.addEventListener('touchstart', down)
  element?.addEventListener('touchmove', move)
  element?.addEventListener('touchend', up)
  element?.addEventListener('touchcancel', cancel)
}
export const unbindListeners = (): void => {
  element?.removeEventListener('touchstart', down)
  element?.removeEventListener('touchmove', move)
  element?.removeEventListener('touchend', up)
  element?.removeEventListener('touchcancel', cancel)
}
export const current = (inputState: InputState): void => {
  if (!changedThisFrame) { return }
  inputState.position = [currentX, currentY]
  inputState.held = held
  inputState.cancelled = cancelled
  cancelled = false
}
