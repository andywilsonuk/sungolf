interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext
  webkitAudioBufferSourceNode?: typeof AudioBufferSourceNode
  webkitGainNode?: typeof GainNode
}

const getAudioContext = (): typeof AudioContext => {
  const windowWithWebkit = window as WindowWithWebkit
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return window.AudioContext || windowWithWebkit.webkitAudioContext
}

const getAudioBufferSourceNode = (): typeof AudioBufferSourceNode => {
  const windowWithWebkit = window as WindowWithWebkit
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return window.AudioBufferSourceNode || windowWithWebkit.webkitAudioBufferSourceNode
}

const getGainNode = (): typeof GainNode => {
  const windowWithWebkit = window as WindowWithWebkit
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return window.GainNode || windowWithWebkit.webkitGainNode
}

let context: AudioContext | undefined
let masterGain: GainNode | undefined
let muted = false

const createGainNode = (gain: number): GainNode => {
  if (!context) {
    throw new Error('Audio context not initialized')
  }
  const GainNodeConstructor = getGainNode()
  return new GainNodeConstructor(context, {
    gain,
  })
}

export const ensureContext = (): AudioContext => {
  if (context === undefined) {
    const AudioContextConstructor = getAudioContext()
    context = new AudioContextConstructor()
    masterGain = createGainNode(muted ? 0 : 1)
  }
  if (context.state === 'suspended') {
    context.resume().catch(() => {
      return null
    })
  }
  return context
}

export const createGain = (gain: number): GainNode => {
  ensureContext()
  return createGainNode(gain)
}

export const createFromAudio = (audio: HTMLAudioElement, node: GainNode): MediaElementAudioSourceNode => {
  ensureContext()
  if (!context || !masterGain) {
    throw new Error('Audio context not initialized')
  }
  const source = context.createMediaElementSource(audio)
  source.connect(node).connect(masterGain).connect(context.destination)
  return source
}

export const createFromBuffer = (buffer: AudioBuffer, gain: GainNode): AudioBufferSourceNode => {
  ensureContext()
  if (!context || !masterGain) {
    throw new Error('Audio context not initialized')
  }
  const AudioBufferSourceNodeConstructor = getAudioBufferSourceNode()
  const source = new AudioBufferSourceNodeConstructor(context, {
    buffer,
  })
  source.connect(gain).connect(masterGain).connect(context.destination)
  return source
}

export const pause = (): void => {
  if (context === undefined) { return }
  context.suspend().catch(() => {
    return null
  })
}

export const resume = (): void => {
  if (context === undefined) { return }
  context.resume().catch(() => {
    return null
  })
}

export const setMasterVolume = (volume: number): void => {
  muted = volume === 0
  if (masterGain === undefined) { return }
  masterGain.gain.value = volume
}

export const now = (): number => {
  if (!context) {
    throw new Error('Audio context not initialized')
  }
  return context.currentTime
}
