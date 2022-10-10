import { clearArray } from '../shared/utils'

const maxQueue = 10
const emptyItemFn = () => [undefined, undefined]
const delayed = Array.from({ length: maxQueue }, emptyItemFn)
let delayedLength = 0
let nowOffset = 0
let previousTimestamp

export const delay = (fn, time) => {
  for (let i = 0; i < delayed.length; i++) {
    const d = delayed[i]
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

const beginFrame = (timestamp) => {
  if (previousTimestamp) {
    nowOffset = nowOffset + timestamp - previousTimestamp
  }
  previousTimestamp = timestamp
  if (delayedLength === 0) { return }
  for (let i = 0; i < delayed.length; i++) {
    const d = delayed[i]
    const time = d[0]
    if (time === undefined) { continue }
    if (time <= nowOffset) {
      d[1]()
      d[0] = undefined
      d[1] = undefined
      delayedLength -= 1
    }
  }
}

const clear = () => {
  clearArray(delayed, emptyItemFn)
  delayedLength = 0
  nowOffset = 0
}

export default {
  beginFrame,
  clear
}
