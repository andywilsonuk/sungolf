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

const down = (e: MouseEvent): void => {
  e.preventDefault()
  held = true
  currentX = e.clientX
  currentY = e.clientY
  changedThisFrame = true
}
const move = (e: MouseEvent): void => {
  if (!held) { return }
  e.stopImmediatePropagation()
  currentX = e.clientX
  currentY = e.clientY
  changedThisFrame = true
}
const up = (e: MouseEvent): void => {
  e.preventDefault()
  held = false
  currentX = e.clientX
  currentY = e.clientY
  changedThisFrame = true
}
const cancel = (e: MouseEvent): void => {
  e.preventDefault()
  held = false
  cancelled = true
  changedThisFrame = true
}

export const bindListeners = (): void => {
  element = document.getElementById('pullback')
  element?.addEventListener('mousedown', down)
  element?.addEventListener('mousemove', move)
  element?.addEventListener('mouseup', up)
  element?.addEventListener('mouseleave', cancel)
}
export const unbindListeners = (): void => {
  element?.removeEventListener('mousedown', down)
  element?.removeEventListener('mousemove', move)
  element?.removeEventListener('mouseup', up)
  element?.removeEventListener('mouseleave', cancel)
}
export const current = (inputState: InputState): void => {
  if (!changedThisFrame) { return }
  inputState.position = [currentX, currentY]
  inputState.held = held
  inputState.cancelled = cancelled
  cancelled = false
}
