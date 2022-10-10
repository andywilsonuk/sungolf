import { setMasterVolume } from './audioContext'
import SoundFx from './soundFx'

let audioPlayers, audioPlayersMap
let initialized = false

export const loadSounds = async (sounds) => {
  audioPlayersMap = new Map(sounds.map((s) => [s.id, s]))
  audioPlayers = sounds
  audioPlayers.filter((player) => player instanceof SoundFx).forEach((player) => player.load())
}

export const initTracks = async () => {
  if (initialized) { return }
  initialized = true
  audioPlayers.filter((player) => player instanceof SoundFx).forEach((player) => player.init())
}

export const playAudio = (audioId) => audioPlayersMap.get(audioId).play()
export const stopAudio = (audioId) => audioPlayersMap.get(audioId).stop()

export const mute = () => setMasterVolume(0)
export const unmute = () => setMasterVolume(1)
