let changedThisFrame = false
let currentX, currentY
let held = false
let cancelled = false
let element

const down = (e) => {
  e.preventDefault()
  held = true
  currentX = e.clientX
  currentY = e.clientY
  changedThisFrame = true
}
const move = (e) => {
  if (!held) { return }
  e.stopImmediatePropagation()
  currentX = e.clientX
  currentY = e.clientY
  changedThisFrame = true
}
const up = (e) => {
  e.preventDefault()
  held = false
  currentX = e.clientX
  currentY = e.clientY
  changedThisFrame = true
}
const cancel = (e) => {
  e.preventDefault()
  held = false
  cancelled = true
  changedThisFrame = true
}

export const bindListeners = () => {
  element = document.getElementById('pullback')
  element.addEventListener('mousedown', down)
  element.addEventListener('mousemove', move)
  element.addEventListener('mouseup', up)
  element.addEventListener('mouseleave', cancel)
}
export const unbindListeners = () => {
  element.removeEventListener('mousedown', down)
  element.removeEventListener('mousemove', move)
  element.removeEventListener('mouseup', up)
  element.removeEventListener('mouseleave', cancel)
}
export const current = (inputState) => {
  if (!changedThisFrame) { return }
  inputState.position = [currentX, currentY]
  inputState.held = held
  inputState.cancelled = cancelled
  cancelled = false
}
