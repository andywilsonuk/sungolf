import './styles/all.css'
import createWorld from './entities/createWorld'
import { start } from './gameEngine/gameLoop'
import initServices from './gameEngine'
import { loadSounds } from './audioSystem'
import { soundList } from './audio'
import appInstall from './appInstall'

appInstall()

window.addEventListener('load', async () => {
  initServices()
  await loadSounds(soundList)
  createWorld()
  start()
})
