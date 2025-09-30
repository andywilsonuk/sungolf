import { deferUntilRender } from '../gameEngine/deferredRender'
import { dispatchSignal, subscribe } from '../gameEngine/signalling'
import { gamePausedSignal, gameResumedSignal, scoreTag, stageCompleteSignal, stageReadySignal } from './constants'
import { addClass, removeClass } from './htmlHelpers'
import type { StageReadyPayload } from '../types/stageReady'

const strokesUntilSkippable = 20

export interface SetScore {
  setScore: (score: number, stroke: number) => void
}

export default class ScoreEntity implements SetScore {
  public tags = new Set([scoreTag])
  private stageId = 0
  private score = 0
  private stroke = 0
  private skipVisible = false
  private scoreElement!: HTMLElement
  private strokeElement!: HTMLElement
  private skipElement!: HTMLElement

  constructor() {
    this.tags = new Set([scoreTag])
    this.stageId = 0
    this.score = 0
    this.stroke = 0
    this.skipVisible = false
  }

  init(): void {
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [StageReadyPayload]
      this.stageReady(payload)
    })
    subscribe(gamePausedSignal, this.toggleSkip.bind(this, false))
    subscribe(gameResumedSignal, this.toggleSkip.bind(this, true))
  }

  renderInitial(): void {
    const scoreElement = document.getElementById('score')
    if (!scoreElement) {
      throw new Error('Score element not found')
    }
    this.scoreElement = scoreElement

    const strokeElement = document.getElementById('stroke')
    if (!strokeElement) {
      throw new Error('Stroke element not found')
    }
    this.strokeElement = strokeElement

    const skipElement = document.getElementById('skip')
    if (!skipElement) {
      throw new Error('Skip element not found')
    }
    this.skipElement = skipElement
    addClass(this.skipElement, 'hide')
    this.skipElement.addEventListener('click', this.skipStage.bind(this))
  }

  setScore(score: number, stroke: number): void {
    this.score = score
    this.stroke = stroke
    deferUntilRender(this.renderScore.bind(this))
  }

  stageReady({ stageId }: StageReadyPayload): void {
    this.stageId = stageId
    deferUntilRender(this.renderScore.bind(this))
  }

  skipStage(): void {
    dispatchSignal(stageCompleteSignal, this.stageId)
  }

  toggleSkip(visible: boolean): void {
    this.skipVisible = visible
    deferUntilRender(this.renderScore.bind(this))
  }

  renderScore(): void {
    this.scoreElement.innerText = String(this.score)
    this.strokeElement.innerText = `+${this.stroke}`

    if (this.stageId === 0) {
      addClass(this.scoreElement, 'hide')
    } else {
      removeClass(this.scoreElement, 'hide')
    }
    if (this.stroke === 0) {
      addClass(this.strokeElement, 'hide')
      addClass(this.skipElement, 'hide')
    } else {
      removeClass(this.strokeElement, 'hide')
      if (this.skipVisible && this.stroke >= strokesUntilSkippable) {
        removeClass(this.skipElement, 'hide')
      } else {
        addClass(this.skipElement, 'hide')
      }
    }
  }
}
