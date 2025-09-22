import { mute, unmute } from '../audioSystem'
import { deferAddClass, deferRemoveClass } from '../gameEngine/deferredRender'
import { subscribe } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { exitFullscreen, goFullscreen } from '../shared/fullscreenHelper'
import { loadState, saveState } from '../shared/optionsPersister'
import { ballStrokeSignal, gameResumedSignal, optionsTag, stateTag } from './constants'
import { addClass, removeClass, svgIcon } from './htmlHelpers'

const optionsToggleIcon = 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'
const checkedIcon = 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
const uncheckedIcon = 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'

const assignToggleState = (element, toggledOn) => {
  element.children[0].children[0].setAttribute('d', toggledOn ? checkedIcon : uncheckedIcon)
}

const bindToggleButton = (id, onClick) => {
  const element = document.getElementById(id)
  element.appendChild(svgIcon(checkedIcon))
  element.addEventListener('click', onClick)
  addClass(element, 'iconContainer')
  return element
}
const bindButton = (id, onClick) => {
  const element = document.getElementById(id)
  element.addEventListener('click', onClick)
  return element
}

export default class OptionsEntity {
  constructor () {
    this.tags = new Set([optionsTag])
  }

  init () {
    const { sound, fullscreen } = loadState()
    this.soundOn = sound
    this.fullscreenOn = fullscreen
    this.hidden = true
    this.stateEntity = getOneEntityByTag(stateTag)
    subscribe(gameResumedSignal, this.hide.bind(this))
    subscribe(ballStrokeSignal, this.hide.bind(this))
  }

  renderInitial () {
    this.optionsButton = document.getElementById('optionsButton')
    addClass(this.optionsButton, 'iconContainer')
    const button = svgIcon(optionsToggleIcon)
    this.optionsButton.appendChild(button)
    this.optionsButton.addEventListener('click', this.toggleOptionsPane.bind(this), true)

    this.optionsElement = document.getElementById('options')
    this.soundToggleElement = bindToggleButton('soundToggle', this.toggleSound.bind(this, undefined))
    this.fullscreenToggleElement = bindToggleButton('fullscreenToggle', this.toggleFullscreen.bind(this, undefined))
    this.startOverElement = bindButton('startOver', this.showStartOverConfirm.bind(this))
    this.startOverConfirmElement = bindButton('startOverConfirm', this.startOverConfirmed.bind(this))

    this.toggleSound(this.soundOn)
    this.toggleFullscreen(this.fullscreenOn)
  }

  show () {
    addClass(this.optionsElement, 'fadeIn')
    removeClass(this.optionsElement, 'fadeOut')
    removeClass(this.optionsElement, 'hide')
    removeClass(this.startOverElement, 'disabled')
    addClass(this.startOverConfirmElement, 'hide')
    this.hidden = false
  }

  hide () {
    removeClass(this.optionsElement, 'fadeIn')
    addClass(this.optionsElement, 'fadeOut')
    this.hidden = true
  }

  toggleOptionsPane () {
    if (this.hidden) {
      this.show()
    } else {
      this.hide()
    }
  }

  save () {
    saveState(this.soundOn, this.fullscreenOn)
  }

  toggleSound (state) {
    this.soundOn = state ?? !this.soundOn
    if (state === undefined) { this.save() }
    assignToggleState(this.soundToggleElement, this.soundOn)
    if (this.soundOn) {
      unmute()
    } else {
      mute()
    }
  }

  async toggleFullscreen (state) {
    this.fullscreenOn = state ?? !this.fullscreenOn
    const stateForced = state !== undefined
    if (!stateForced) { this.save() }
    assignToggleState(this.fullscreenToggleElement, this.fullscreenOn)
    if (stateForced) { return }
    if (this.fullscreenOn) {
      await goFullscreen()
    } else {
      await exitFullscreen()
    }
  }

  showStartOverConfirm () {
    deferRemoveClass(this.startOverConfirmElement, 'hide')
    deferAddClass(this.startOverElement, 'disabled')
  }

  startOverConfirmed () {
    this.hide()
    this.stateEntity.reset.bind(this.stateEntity)
  }
}
