import './styles/all.css'
import createWorld from './entities/createWorld'
import { start } from './gameEngine/gameLoop'
import initServices from './gameEngine'
import { loadSounds } from './audioSystem'
import { soundList } from './audio'

const load = async (): Promise<void> => {
  initServices()
  await loadSounds(soundList)
  createWorld()
  start()
}

window.onload = load
