import { clearArray } from '../shared/utils'

type DelayedItem = [number | undefined, (() => void) | undefined]

const maxQueue = 10
const emptyItemFn = (): DelayedItem => [undefined, undefined]
const delayed: DelayedItem[] = Array.from({ length: maxQueue }, emptyItemFn)
let delayedLength = 0
let nowOffset = 0
let previousTimestamp: number | undefined

export const delay = (fn: () => void, time: number): void => {
  for (const d of delayed) {
    if (d[0] !== undefined) { continue }
    d[0] = nowOffset + time
    d[1] = fn
    break
  }
  delayedLength += 1
  if (delayedLength >= maxQueue) {
    throw new Error(`Maxed queue: delay. max ${maxQueue}`)
  }
}

const beginFrame = (timestamp: number): void => {
  if (previousTimestamp) {
    nowOffset = nowOffset + timestamp - previousTimestamp
  }
  previousTimestamp = timestamp
  if (delayedLength === 0) { return }
  for (const d of delayed) {
    const time = d[0]
    if (time === undefined) { continue }
    if (time <= nowOffset) {
      d[1]?.()
      d[0] = undefined
      d[1] = undefined
      delayedLength -= 1
    }
  }
}

const clear = (): void => {
  clearArray(delayed, emptyItemFn)
  delayedLength = 0
  nowOffset = 0
}

export default {
  beginFrame,
  clear,
}
