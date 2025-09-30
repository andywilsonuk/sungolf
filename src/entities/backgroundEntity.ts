import { subscribe } from '../gameEngine/signalling'
import orchestration from '../orchestration'
import Hsl from '../shared/hsl'
import { stageReadySignal } from './constants'
import type { StageReadyPayload } from '../types/stageReady'
import { subscribeResize, type ResizePayload } from '../gameEngine/renderCanvas'

export default class BackgroundEntity {
  stage: number | null
  dirty: boolean
  backgroundColor: Hsl | null
  backgroundColorStop: number | null
  backgroundElement!: HTMLElement
  height: number | null = null

  constructor() {
    this.stage = null
    this.dirty = false
    this.backgroundColor = null
    this.backgroundColorStop = null
  }

  init(): void {
    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [StageReadyPayload]
      this.stageReady(payload)
    })
  }

  stageReady({ stageId }: StageReadyPayload): void {
    const orchestrated = orchestration(stageId)
    this.stage = stageId
    this.backgroundColor = orchestrated.backgroundColor
    this.backgroundColorStop = orchestrated.backgroundColorStop
    this.dirty = true
  }

  onResize({ gameAreaHeight }: ResizePayload): void {
    this.height = gameAreaHeight
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
    if (!this.dirty) { return }

    this.backgroundElement.style.height = `${this.height}px`

    if (this.backgroundColor && this.backgroundColorStop !== null) {
      const initialStopColorString = new Hsl(0, 0, 90).asString()
      const gradient = [
        initialStopColorString,
        `${this.backgroundColorStop * 100}%`,
        `${this.backgroundColor.asString()} 98%`,
        `var(--background) 100%`,
      ]
      this.backgroundElement.style.background = `linear-gradient(${gradient.join(',')})`
    }

    this.dirty = false
  }
}
