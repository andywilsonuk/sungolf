import { initTracks } from '../audioSystem'
import { dispatchSignal } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { goFullscreen } from '../shared/fullscreenHelper'
import { gamePausedSignal, gameResumedSignal, optionsTag } from './constants'
import { addClass, removeClass } from './htmlHelpers'

export default class TitlesEntity {
  init () {
    this.options = getOneEntityByTag(optionsTag)
  }

  renderInitial () {
    this.titleElement = document.getElementById('title')
    this.callback = this.onPlay.bind(this)

    document.addEventListener('visibilitychange', this.onVisibilityChanged.bind(this))

    this.show()
  }

  show () {
    removeClass(this.titleElement, 'fadeOut')
    this.titleElement.addEventListener('click', this.callback, true)
    dispatchSignal(gamePausedSignal)
  }

  hide () {
    this.titleElement.removeEventListener('click', this.callback, true)
    addClass(this.titleElement, 'fadeOut')
    dispatchSignal(gameResumedSignal)
  }

  async onPlay () {
    this.hide()
    await initTracks()

    if (this.options.fullscreenOn) {
      await goFullscreen()
    }
  }

  onVisibilityChanged () {
    if (document.visibilityState === 'hidden') {
      this.show()
    }
  }
}
