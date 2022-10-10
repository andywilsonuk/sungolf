import { addClass, opacityHide, opacityShow, removeClass } from '../entities/htmlHelpers'
import { clearArray } from '../shared/utils'

const maxQueue = 30
const queue = Array.from({ length: maxQueue })
let queueLength = 0

export const deferUntilRender = (fn) => {
  queue[queueLength] = fn
  queueLength += 1
}
export const deferAddClass = (element, className) => deferUntilRender(addClass.bind(undefined, element, className))
export const deferRemoveClass = (element, className) => deferUntilRender(removeClass.bind(undefined, element, className))
export const deferOpacityShow = (element) => deferUntilRender(opacityShow.bind(undefined, element))
export const deferOpacityHide = (element) => deferUntilRender(opacityHide.bind(undefined, element))

const render = () => {
  if (queueLength === 0) { return }
  if (queueLength >= maxQueue) {
    throw new Error(`Maxed queue: deferredRender. max ${maxQueue}, current ${queueLength}`)
  }

  for (let i = 0; i < queueLength; i++) {
    queue[i]()
  }
  queueLength = 0
}
const clear = () => {
  clearArray(queue)
  queueLength = 0
}

export default {
  render,
  clear
}
