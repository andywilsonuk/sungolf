import { clearArray } from '../shared/utils'

type SignalCallback = (...args: unknown[]) => void
type UnsubscribeFunction = () => void

const signals = new Map<string, SignalCallback[]>()
const emptyItemFn = (): [string | undefined, SignalCallback | undefined] => [undefined, undefined]
const dispatchQueueA = Array.from({ length: 15 }, emptyItemFn)
const dispatchQueueB = Array.from({ length: 15 }, emptyItemFn)
let dispatchQueueLength = 0
let dispatchQueue = dispatchQueueA
const unsubscribeQueue = Array.from({ length: 5 }, emptyItemFn)
let unsubscribeQueueLength = 0

const unsubscribe = (signal: string, callback: SignalCallback): void => {
  unsubscribeQueue[unsubscribeQueueLength][0] = signal
  unsubscribeQueue[unsubscribeQueueLength][1] = callback
  unsubscribeQueueLength += 1
}

export const subscribe = (signal: string, callback: SignalCallback): UnsubscribeFunction => {
  let subscribers = signals.get(signal)
  if (subscribers === undefined) {
    subscribers = []
    signals.set(signal, subscribers)
  }
  subscribers.push(callback)
  return () => { unsubscribe(signal, callback) }
}

export const dispatchSignal = (signal: string, ...args: unknown[]): void => {
  if (dispatchQueueLength >= dispatchQueue.length) { throw new Error('Maxed queue: signalling') }
  dispatchQueue[dispatchQueueLength][0] = signal
  dispatchQueue[dispatchQueueLength][1] = args as unknown as SignalCallback
  dispatchQueueLength += 1
}

const unsubscribePending = (): void => {
  if (unsubscribeQueueLength === 0) { return }
  if (unsubscribeQueueLength >= unsubscribeQueue.length) { throw new Error('Maxed queue: signalling') }

  for (let i = 0; i < unsubscribeQueueLength; i++) {
    const [signal, callback] = unsubscribeQueue[i]
    if (!signal || !callback) continue
    const subscribers = signals.get(signal)
    if (!subscribers) continue
    const index = subscribers.indexOf(callback)
    if (index === -1) { return }
    subscribers.splice(index, 1)
  }
}

const dispatchPending = (): void => {
  const currentQueue = dispatchQueue
  const currentQueueLength = dispatchQueueLength
  if (currentQueueLength === 0) { return }
  dispatchQueue = currentQueue === dispatchQueueA ? dispatchQueueB : dispatchQueueA
  dispatchQueueLength = 0

  for (let i = 0; i < currentQueueLength; i++) {
    const [signal, args] = currentQueue[i]
    if (!signal) continue
    const subscribers = signals.get(signal)
    if (subscribers === undefined) { continue }
    for (const subscriber of subscribers) {
      subscriber(...(args as unknown as unknown[]))
    }
  }
}

const update = (): void => {
  unsubscribePending()
  dispatchPending()
}

const clear = (): void => {
  signals.clear()
  clearArray(dispatchQueue, emptyItemFn)
  clearArray(unsubscribeQueue, emptyItemFn)
  dispatchQueueLength = 0
  unsubscribeQueueLength = 0
}

export default {
  update,
  clear,
}
