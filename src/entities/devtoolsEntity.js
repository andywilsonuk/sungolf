import { entries } from '../gameEngine/debugLog'
import { dispatchSignal } from '../gameEngine/signalling'
import { getOneEntityByTag } from '../gameEngine/world'
import { zoneRanges } from '../orchestration'
import { randomGenerator, randomInt } from '../shared/random'
import { finalStageId, stageCompleteSignal, stateTag, terrainTag } from './constants'
import { addClass, basicElement } from './htmlHelpers'

const enabled = window.location.hash === '#devtools'

const button = (text, action, id) => {
  const button = basicElement('button', id ? { id } : {})
  button.innerText = text
  button.addEventListener('click', action)
  return button
}
const input = (action, id = '') => {
  const input = basicElement('input', { type: 'text', id })
  input.addEventListener('change', (event) => action(Number(event.target.value)))
  return input
}

export default class DevtoolsEntity {
  init () {
    if (!enabled) { return }
    document.addEventListener('keydown', this.keyPress.bind(this))
    this.terrainEntity = getOneEntityByTag(terrainTag)
    this.stateEntity = getOneEntityByTag(stateTag)
    this.rand = randomGenerator(Math.random())
    this.keyCode = null
  }

  beginFrame () {
    if (this.keyCode === null) { return }
    switch (this.keyCode) {
      case 'ArrowLeft': this.movePrevious(); break
      case 'ArrowRight': this.moveNext(); break
      case 'KeyR': this.moveRandom(); break
      default: return
    }
    this.keyCode = null
  }

  renderInitial () {
    const devToolsElement = document.getElementById('devtools')
    if (!enabled) {
      devToolsElement.parentElement.removeChild(devToolsElement)
      return
    }
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
    devToolsElement.parentNode.insertBefore(this.devlogElement, devToolsElement)
    addClass(this.devlogElement, 'dialog', 'hide')
  }

  keyPress ({ code }) {
    this.keyCode = code
  }

  moveNext () {
    this.terrainEntity.setStage(this.terrainEntity.stageId + 1)
  }

  movePrevious () {
    this.terrainEntity.setStage(this.terrainEntity.stageId - 1)
  }

  moveTo (id) {
    this.terrainEntity.setStage(id)
  }

  moveRandom () {
    this.terrainEntity.setStage(randomInt(this.rand, 0, finalStageId))
  }

  wireframe () {
    this.terrainEntity.toggleWireframe()
  }

  advance () {
    dispatchSignal(stageCompleteSignal, this.terrainEntity.stageId)
  }

  nextZone () {
    const currentStageId = this.terrainEntity.stageId
    const ranges = zoneRanges()
    const currentZoneIndex = ranges.findIndex(z => currentStageId >= z.start && currentStageId <= z.end)
    this.moveTo(ranges[currentZoneIndex + 1].start)
  }

  previousZone () {
    const currentStageId = this.terrainEntity.stageId
    const ranges = zoneRanges()
    const currentZoneIndex = ranges.findIndex(z => currentStageId >= z.start && currentStageId <= z.end)
    this.moveTo(ranges[currentZoneIndex - 1].start)
  }

  toggleDevlog () {
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
