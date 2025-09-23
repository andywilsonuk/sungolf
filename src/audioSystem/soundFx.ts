import { createFromBuffer, createGain, ensureContext } from './audioContext'
import SoundFxInstance from './soundFxInstance'

const maxInstances = 5

export default class SoundFx {
  id: string
  filepath: string | URL
  volume: number
  loop: boolean
  audioBuffer: AudioBuffer | null
  audioBufferRaw: ArrayBuffer | null
  audioGain: GainNode | null
  instances: SoundFxInstance[]
  endedCallback: (() => void) | null
  playRequested: boolean
  initRequested: boolean

  constructor(id: string, filepath: string | URL, volume = 1, looped = false) {
    this.id = id
    this.filepath = filepath
    this.volume = volume
    this.loop = looped
    this.audioBuffer = null
    this.audioBufferRaw = null
    this.audioGain = null
    this.instances = Array.from({ length: maxInstances }, () => new SoundFxInstance())
    this.endedCallback = null
    this.playRequested = false
    this.initRequested = false
  }

  pause(): void {
    for (const instance of this.instances) {
      instance.stop(true)
    }
  }

  resume(): void {
    for (const instance of this.instances) {
      if (!instance.paused) { continue }
      instance.start(this.connectTrack(instance), this.loop)
    }
  }

  play(): SoundFxInstance | undefined {
    if (this.audioBuffer === null) {
      this.playRequested = true
      return undefined
    }
    ensureContext()
    for (const instance of this.instances) {
      if (!instance.available) { continue }
      instance.start(this.connectTrack(instance), this.loop)
      return instance
    }
    return undefined
  }

  stop(): void {
    for (const instance of this.instances) {
      instance.stop(false)
    }
  }

  ended(instance: SoundFxInstance): void {
    if (instance.source === null) { return }
    const looping = this.loop && instance.looping
    const playbackRate = instance.source.playbackRate.value
    instance.stop()
    if (this.endedCallback) {
      this.endedCallback()
    }
    if (looping) {
      instance.start(this.connectTrack(instance), true)
      instance.source.playbackRate.value = playbackRate
    }
  }

  onEnd(callback: () => void): void {
    this.endedCallback = callback
  }

  connectTrack(instance: SoundFxInstance): AudioBufferSourceNode {
    if (!this.audioBuffer || !this.audioGain) {
      throw new Error('Audio buffer or gain not initialized')
    }
    const source = createFromBuffer(this.audioBuffer, this.audioGain)
    source.addEventListener('ended', this.ended.bind(this, instance))
    return source
  }

  async load(): Promise<void> {
    const response = await window.fetch(this.filepath)
    this.audioBufferRaw = await response.arrayBuffer()
    if (this.initRequested) {
      await this.init()
    }
  }

  async init(): Promise<void> {
    if (this.audioBufferRaw === null) {
      this.initRequested = true
      return
    }
    const context = ensureContext()
    this.audioGain = createGain(this.volume)
    const buffer = await context.decodeAudioData(this.audioBufferRaw)
    this.audioBuffer = buffer
    if (this.playRequested) {
      this.resume()
    }
  }
}
