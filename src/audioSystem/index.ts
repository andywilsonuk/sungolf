import { setMasterVolume } from './audioContext'
import SoundFx from './soundFx'
import type SoundFxInstance from './soundFxInstance'

let audioPlayers: SoundFx[]
let audioPlayersMap: Map<string, SoundFx>
let initialized = false

export const loadSounds = async (sounds: SoundFx[]): Promise<void> => {
  audioPlayersMap = new Map(sounds.map((s) => [s.id, s]))
  audioPlayers = sounds
  audioPlayers.filter((player) => player instanceof SoundFx).forEach((player) => player.load())
}

export const initTracks = async (): Promise<void> => {
  if (initialized) { return }
  initialized = true
  audioPlayers.filter((player) => player instanceof SoundFx).forEach((player) => player.init())
}

export const playAudio = (audioId: string): SoundFxInstance | undefined => audioPlayersMap.get(audioId)?.play()
export const stopAudio = (audioId: string): void => audioPlayersMap.get(audioId)?.stop()

export const mute = (): void => { setMasterVolume(0) }
export const unmute = (): void => { setMasterVolume(1) }
