import { pause, resume } from '../audioSystem/audioContext'
import { playAudio } from '../audioSystem'

const maxQueue = 10
const queue: string[] = Array.from({ length: maxQueue })
let queueLength = 0
const framePlayed: string[] = Array.from({ length: maxQueue })
let framePlayedLength = 0

export const enqueueAudio = (audioId: string): void => {
  queue[queueLength] = audioId
  queueLength += 1
}
const isPlayedThisFrame = (id: string): boolean => {
  for (let j = 0; j < framePlayedLength; j++) {
    const previous = framePlayed[j]
    if (previous === id) {
      return true
    }
  }
  return false
}

const endFrame = (panic: boolean): void => {
  if (queueLength === 0) { return }
  if (queueLength >= maxQueue) {
    throw new Error('Maxed queue: audio')
  }
  if (!panic) {
    for (let i = 0; i < queueLength; i++) {
      const id = queue[i]
      if (isPlayedThisFrame(id)) { continue }
      playAudio(id)
      framePlayed[framePlayedLength] = id
      framePlayedLength += 1
    }
  }
  queueLength = 0
  framePlayedLength = 0
}

const paused = (): void => {
  pause()
}
const resumed = (): void => {
  resume()
}

export default {
  endFrame,
  paused,
  resumed,
}
