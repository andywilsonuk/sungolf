import { deferUntilRender } from '../gameEngine/deferredRender'
import { dispatchSignal, subscribe } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { gamePausedSignal, gameResumedSignal, scoreTag, stageCompleteSignal, stageReadySignal, terrainTag } from './constants'
import { addClass, removeClass } from './htmlHelpers'

const strokesUntilSkippable = 20

export default class ScoreEntity {
  public tags = new Set([scoreTag])
  private stageId = 0
  private score = 0
  private stroke = 0
  private skipVisible = false
  private terrainEntity: any
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
    this.terrainEntity = getOneEntityByTag(terrainTag)
    subscribe(stageReadySignal, this.stageReady.bind(this))
    subscribe(gamePausedSignal, this.toggleSkip.bind(this, false))
    subscribe(gameResumedSignal, this.toggleSkip.bind(this, true))
  }

  renderInitial(): void {
    this.scoreElement = document.getElementById('score')!
    this.strokeElement = document.getElementById('stroke')!
    this.skipElement = document.getElementById('skip')!
    addClass(this.skipElement, 'hide')
    this.skipElement.addEventListener('click', this.skipStage.bind(this))
  }

  setScore(score: number, stroke: number): void {
    this.score = score
    this.stroke = stroke
    deferUntilRender(this.renderScore.bind(this))
  }

  stageReady({ stageId }: { stageId: number }): void {
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