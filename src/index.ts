import './styles/all.css'
import createWorld from './entities/createWorld'
import { start } from './gameEngine/gameLoop'
import initServices from './gameEngine'
import { loadSounds } from './audioSystem'
import { soundList } from './audio'

const showGameUI = (): void => {
  const loadingScreen = document.getElementById('loadingScreen')
  const gameArea = document.getElementById('gameArea')
  const optionsButton = document.getElementById('optionsButton')
  const options = document.getElementById('options')
  const fixtures = document.getElementById('fixtures')
  const title = document.getElementById('title')

  if (loadingScreen) {
    loadingScreen.style.display = 'none'
  }
  if (gameArea) {
    gameArea.style.display = ''
  }
  if (optionsButton) {
    optionsButton.style.display = ''
  }
  if (options) {
    options.style.display = ''
  }
  if (fixtures) {
    fixtures.style.display = ''
  }
  if (title) {
    title.style.display = ''
  }
}

const load = async (): Promise<void> => {
  initServices()
  await loadSounds(soundList)
  createWorld()
  start()
  showGameUI()
}

window.onload = load
