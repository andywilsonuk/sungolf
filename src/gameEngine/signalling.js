import { clearArray } from '../shared/utils'

const signals = new Map()
const emptyItemFn = () => [undefined, undefined]
const dispatchQueueA = Array.from({ length: 15 }, emptyItemFn)
const dispatchQueueB = Array.from({ length: 15 }, emptyItemFn)
let dispatchQueueLength = 0
let dispatchQueue = dispatchQueueA
const unsubscribeQueue = Array.from({ length: 5 }, emptyItemFn)
let unsubscribeQueueLength = 0

const unsubscribe = (signal, callback) => {
  unsubscribeQueue[unsubscribeQueueLength][0] = signal
  unsubscribeQueue[unsubscribeQueueLength][1] = callback
  unsubscribeQueueLength += 1
}

export const subscribe = (signal, callback) => {
  let subscribers = signals.get(signal)
  if (subscribers === undefined) {
    subscribers = []
    signals.set(signal, subscribers)
  }
  subscribers.push(callback)
  return () => unsubscribe(signal, callback)
}

export const dispatchSignal = (signal, ...args) => {
  if (dispatchQueueLength >= dispatchQueue.length) { throw new Error('Maxed queue: signalling') }
  dispatchQueue[dispatchQueueLength][0] = signal
  dispatchQueue[dispatchQueueLength][1] = args
  dispatchQueueLength += 1
}

const unsubscribePending = () => {
  if (unsubscribeQueueLength === 0) { return }
  if (unsubscribeQueueLength >= unsubscribeQueue.length) { throw new Error('Maxed queue: signalling') }

  for (let i = 0; i < unsubscribeQueueLength; i++) {
    const [signal, callback] = unsubscribeQueue[i]
    const subscribers = signals.get(signal)
    const index = subscribers.indexOf(callback)
    if (index === -1) { return }
    subscribers.splice(index, 1)
  }
}

const dispatchPending = () => {
  const currentQueue = dispatchQueue
  const currentQueueLength = dispatchQueueLength
  if (currentQueueLength === 0) { return }
  dispatchQueue = currentQueue === dispatchQueueA ? dispatchQueueB : dispatchQueueA
  dispatchQueueLength = 0

  for (let i = 0; i < currentQueueLength; i++) {
    const [signal, args] = currentQueue[i]
    const subscribers = signals.get(signal)
    if (subscribers === undefined) { continue }
    for (let j = 0; j < subscribers.length; j++) {
      const subscriber = subscribers[j]
      subscriber(...args)
    }
  }
}
const update = () => {
  unsubscribePending()
  dispatchPending()
}
const clear = () => {
  signals.clear()
  clearArray(dispatchQueue, emptyItemFn)
  clearArray(unsubscribeQueue, emptyItemFn)
  dispatchQueueLength = 0
  unsubscribeQueueLength = 0
}

export default {
  update,
  clear
}
