
const AudioContext = window.AudioContext || (window as any).webkitAudioContext
const AudioBufferSourceNode = window.AudioBufferSourceNode || (window as any).webkitAudioBufferSourceNode
const GainNode = window.GainNode || (window as any).webkitGainNode

let context: AudioContext | undefined
let masterGain: GainNode | undefined
let muted = false

const createGainNode = (gain: number): GainNode => {
  return new GainNode(context!, {
    gain,
  })
}

export const ensureContext = (): AudioContext => {
  if (context === undefined) {
    context = new AudioContext()
    masterGain = createGainNode(muted ? 0 : 1)
  }
  if (context.state === 'suspended') {
    context.resume()
  }
  return context
}

export const createGain = (gain: number): GainNode => {
  ensureContext()
  return createGainNode(gain)
}

export const createFromAudio = (audio: HTMLAudioElement, node: GainNode): MediaElementAudioSourceNode => {
  ensureContext()
  const source = context!.createMediaElementSource(audio)
  source.connect(node).connect(masterGain!).connect(context!.destination)
  return source
}

export const createFromBuffer = (buffer: AudioBuffer, gain: GainNode): AudioBufferSourceNode => {
  ensureContext()
  const source = new AudioBufferSourceNode(context!, {
    buffer,
  })
  source.connect(gain).connect(masterGain!).connect(context!.destination)
  return source
}

export const pause = (): void => {
  if (context === undefined) { return }
  context.suspend()
}

export const resume = (): void => {
  if (context === undefined) { return }
  context.resume()
}

export const setMasterVolume = (volume: number): void => {
  muted = volume === 0
  if (masterGain === undefined) { return }
  masterGain.gain.value = volume
}

export const now = (): number => context!.currentTime
