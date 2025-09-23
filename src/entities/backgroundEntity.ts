import { subscribe } from '../gameEngine/signalling'
import orchestration from '../orchestration'
import Hsl from '../shared/hsl'
import { stageReadySignal } from './constants'

export default class BackgroundEntity {
  stage: number | null
  dirty: boolean
  backgroundColor: Hsl | null
  backgroundColorStop: number | null
  backgroundElement!: HTMLElement

  constructor() {
    this.stage = null
    this.dirty = false
    this.backgroundColor = null
    this.backgroundColorStop = null
  }

  init(): void {
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [{ stageId: number }]
      this.stageReady(payload)
    })
  }

  stageReady({ stageId }: { stageId: number }): void {
    const orchestrated = orchestration(stageId)
    this.stage = stageId
    this.backgroundColor = orchestrated.backgroundColor
    this.backgroundColorStop = orchestrated.backgroundColorStop
    this.dirty = true
  }

  renderInitial(): void {
    const element = document.getElementById('background')
    if (!element) {
      throw new Error('Background element not found')
    }
    this.backgroundElement = element
  }

  render(): void {
    if (!this.dirty || !this.backgroundColor || this.backgroundColorStop === null) { return }

    const initialStopColorString = new Hsl(0, 0, 90).asString()

    this.backgroundElement.style.background = `linear-gradient(${initialStopColorString}, ${this.backgroundColorStop * 100}%, ${this.backgroundColor.asString()} )`

    this.dirty = false
  }
}
