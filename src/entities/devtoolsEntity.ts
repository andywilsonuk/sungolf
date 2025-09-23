import { entries } from '../gameEngine/debugLog'
import { dispatchSignal } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { zoneRanges } from '../orchestration'
import { randomGenerator, randomInt } from '../shared/random'
import { finalStageId, stageCompleteSignal, stateTag, terrainTag } from './constants'
import { addClass, basicElement } from './htmlHelpers'

interface RandomGenerator {
  next(): number
}

const enabled = window.location.hash === '#devtools'

const button = (text: string, action: () => void, id?: string): HTMLButtonElement => {
  const button = basicElement('button', id ? { id } : {}) as HTMLButtonElement
  button.innerText = text
  button.addEventListener('click', action)
  return button
}

const input = (action: (value: number) => void, id = ''): HTMLInputElement => {
  const input = basicElement('input', { type: 'text', id }) as HTMLInputElement
  input.addEventListener('change', (event) => action(Number((event.target as HTMLInputElement).value)))
  return input
}

export default class DevtoolsEntity {
  private terrainEntity: any
  private stateEntity: any
  private rand!: RandomGenerator
  private keyCode: string | null = null
  private devlogElement!: HTMLElement

  init(): void {
    if (!enabled) { return }
    document.addEventListener('keydown', this.keyPress.bind(this))
    this.terrainEntity = getOneEntityByTag(terrainTag)
    this.stateEntity = getOneEntityByTag(stateTag)
    this.rand = randomGenerator(Math.random())
    this.keyCode = null
  }

  beginFrame(): void {
    if (this.keyCode === null) { return }
    switch (this.keyCode) {
      case 'ArrowLeft': this.movePrevious(); break
      case 'ArrowRight': this.moveNext(); break
      case 'KeyR': this.moveRandom(); break
      default: return
    }
    this.keyCode = null
  }

  renderInitial(): void {
    const devToolsElement = document.getElementById('devtools')
    if (!enabled) {
      devToolsElement?.parentElement?.removeChild(devToolsElement)
      return
    }
    if (!devToolsElement) return

    devToolsElement.appendChild(button('Previous stage', this.movePrevious.bind(this)))
    devToolsElement.appendChild(button('Next stage', this.moveNext.bind(this)))
    devToolsElement.appendChild(button('Advance stage', this.advance.bind(this)))
    devToolsElement.appendChild(button('Random stage', this.moveRandom.bind(this)))
    devToolsElement.appendChild(input(this.moveTo.bind(this), 'moveTo'))
    devToolsElement.appendChild(button('Previous zone', this.previousZone.bind(this)))
    devToolsElement.appendChild(button('Next zone', this.nextZone.bind(this)))
    devToolsElement.appendChild(button('Wireframe', this.wireframe.bind(this), 'wireframes'))
    devToolsElement.appendChild(button('Reset', this.stateEntity.reset.bind(this.stateEntity)))
    devToolsElement.appendChild(button('Stroke skippable', this.stateEntity.forceStroke.bind(this.stateEntity, 20)))
    devToolsElement.appendChild(button('Devlog', this.toggleDevlog.bind(this)))

    this.devlogElement = basicElement('div', { id: 'devlog' })
    devToolsElement.parentNode?.insertBefore(this.devlogElement, devToolsElement)
    addClass(this.devlogElement, 'dialog', 'hide')
  }

  keyPress({ code }: { code: string }): void {
    this.keyCode = code
  }

  moveNext(): void {
    this.terrainEntity.setStage(this.terrainEntity.stageId + 1)
  }

  movePrevious(): void {
    this.terrainEntity.setStage(this.terrainEntity.stageId - 1)
  }

  moveTo(id: number): void {
    this.terrainEntity.setStage(id)
  }

  moveRandom(): void {
    this.terrainEntity.setStage(randomInt(this.rand, 0, finalStageId))
  }

  wireframe(): void {
    this.terrainEntity.toggleWireframe()
  }

  advance(): void {
    dispatchSignal(stageCompleteSignal, this.terrainEntity.stageId)
  }

  nextZone(): void {
    const currentStageId = this.terrainEntity.stageId
    const ranges = zoneRanges()
    const currentZoneIndex = ranges.findIndex(z => currentStageId >= (z.start ?? 0) && currentStageId <= (z.end ?? 0))
    const nextZone = ranges[currentZoneIndex + 1]
    if (nextZone?.start !== undefined) {
      this.moveTo(nextZone.start)
    }
  }

  previousZone(): void {
    const currentStageId = this.terrainEntity.stageId
    const ranges = zoneRanges()
    const currentZoneIndex = ranges.findIndex(z => currentStageId >= (z.start ?? 0) && currentStageId <= (z.end ?? 0))
    const prevZone = ranges[currentZoneIndex - 1]
    if (prevZone?.start !== undefined) {
      this.moveTo(prevZone.start)
    }
  }

  toggleDevlog(): void {
    this.devlogElement.classList.toggle('hide')
    this.devlogElement.innerHTML = ''
    const log = [...entries()].reverse()
    log.forEach(l => {
      const el = basicElement('div')
      el.innerText = l
      this.devlogElement.appendChild(el)
    })
  }
}