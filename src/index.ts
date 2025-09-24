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

  if (loadingScreen) {
    loadingScreen.style.display = 'none'
  }

  if (gameArea) {
    gameArea.classList.remove('hide')
  }

  if (optionsButton) {
    optionsButton.classList.remove('hide')
  }
}

const load = async (): Promise<void> => {
  initServices()
  await loadSounds(soundList)
  createWorld()
  start()

  // Show the game UI once everything is loaded
  showGameUI()
}

window.onload = load
