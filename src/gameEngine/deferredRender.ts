import { addClass, opacityHide, opacityShow, removeClass } from '../entities/htmlHelpers'
import { clearArray } from '../shared/utils'

const maxQueue = 30
const queue: (() => void)[] = Array.from({ length: maxQueue })
let queueLength = 0

export const deferUntilRender = (fn: () => void): void => {
  queue[queueLength] = fn
  queueLength += 1
}
export const deferAddClass = (element: Element, className: string): void => deferUntilRender(addClass.bind(undefined, element, className))
export const deferRemoveClass = (element: Element, className: string): void => deferUntilRender(removeClass.bind(undefined, element, className))
export const deferOpacityShow = (element: SVGElement): void => deferUntilRender(opacityShow.bind(undefined, element))
export const deferOpacityHide = (element: SVGElement): void => deferUntilRender(opacityHide.bind(undefined, element))

const render = (): void => {
  if (queueLength === 0) { return }
  if (queueLength >= maxQueue) {
    throw new Error(`Maxed queue: deferredRender. max ${maxQueue}, current ${queueLength}`)
  }

  for (let i = 0; i < queueLength; i++) {
    queue[i]()
  }
  queueLength = 0
}
const clear = (): void => {
  clearArray(queue)
  queueLength = 0
}

export default {
  render,
  clear,
}
