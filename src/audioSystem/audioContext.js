
const AudioContext = window.AudioContext || window.webkitAudioContext
const AudioBufferSourceNode = window.AudioBufferSourceNode || window.webkitAudioBufferSourceNode
const GainNode = window.GainNode || window.webkitGainNode

let context, masterGain
let muted = false

const createGainNode = (gain) => {
  return new GainNode(context, {
    gain
  })
}

export const ensureContext = () => {
  if (context === undefined) {
    context = new AudioContext()
    masterGain = createGainNode(muted ? 0 : 1)
  }
  if (context.state === 'suspended') {
    context.resume()
  }
  return context
}

export const createGain = (gain) => {
  ensureContext()
  return createGainNode(gain)
}

export const createFromAudio = (audio, node) => {
  ensureContext()
  const source = context.createMediaElementSource(audio)
  source.connect(node).connect(masterGain).connect(context.destination)
  return source
}

export const createFromBuffer = (buffer, gain) => {
  ensureContext()
  const source = new AudioBufferSourceNode(context, {
    buffer
  })
  source.connect(gain).connect(masterGain).connect(context.destination)
  return source
}

export const pause = () => {
  if (context === undefined) { return }
  context.suspend()
}

export const resume = () => {
  if (context === undefined) { return }
  context.resume()
}

export const setMasterVolume = (volume) => {
  muted = volume === 0
  if (masterGain === undefined) { return }
  masterGain.gain.value = volume
}

export const now = () => context.currentTime
