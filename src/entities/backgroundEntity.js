import { subscribe } from '../gameEngine/signalling'
import orchestration from '../orchestration'
import Hsl from '../shared/hsl'
import { stageReadySignal } from './constants'

export default class BackgroundEntity {
  constructor () {
    this.stage = null
    this.dirty = false
    this.backgroundColor = null
    this.backgroundColorStop = null
  }

  init () {
    subscribe(stageReadySignal, this.stageReady.bind(this))
  }

  stageReady ({ stageId }) {
    const orchestrated = orchestration(stageId)
    this.stage = stageId
    this.backgroundColor = orchestrated.backgroundColor
    this.backgroundColorStop = orchestrated.backgroundColorStop
    this.dirty = true
  }

  renderInitial () {
    this.backgroundElement = document.getElementById('background')
  }

  render () {
    if (!this.dirty) { return }

    const initialStopColorString = new Hsl(0, 0, 90).asString()

    this.backgroundElement.style.background = `linear-gradient(${initialStopColorString}, ${this.backgroundColorStop * 100}%, ${this.backgroundColor.asString()} )`

    this.dirty = false
  }
}
