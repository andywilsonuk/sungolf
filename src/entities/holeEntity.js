import { Box, Vec2 } from 'planck-js'
import { getTimestamp } from '../gameEngine/gameLoop'
import { createBody, registerBeginContact, registerEndContact, physicsScale } from '../gameEngine/physics'
import { dispatchSignal, subscribe } from '../gameEngine/signalling'
import { holeDepth, holeTotalWidth } from '../terrain/constants'
import { finalStageId, stageCompleteSignal, stageReadySignal } from './constants'

const delayBeforeComplete = 0.5 * 1000

export default class HoleEntity {
  constructor () {
    this.stageId = null
    this.completeTimestamp = null
  }

  init () {
    this.holeBody = createBody({
      active: false
    })
    this.holeBody.createFixture(Box(holeTotalWidth * 0.5 * physicsScale, holeDepth * 0.25 * physicsScale, Vec2(holeTotalWidth * -0.5 * physicsScale, holeDepth * 0.75 * physicsScale)), {
      isSensor: true
    })

    subscribe(stageReadySignal, this.enableHole.bind(this))
    subscribe(stageCompleteSignal, this.disableHole.bind(this))
    registerBeginContact(this.contactTest.bind(this))
    registerEndContact(this.endContactTest.bind(this))
  }

  enableHole ({ stageId, holePosition }) {
    if (stageId === finalStageId) { return }
    this.stageId = stageId
    this.holeBody.setPosition(holePosition)
    this.holeBody.setActive(true)
  }

  disableHole () {
    this.holeBody.setActive(false)
  }

  beginFrame (timestamp) {
    if (this.completeTimestamp === null || timestamp < this.completeTimestamp) { return }
    this.holeComplete()
  }

  contactTest (contact) {
    if (this.completeTimestamp === null && this.isContactWithHole(contact)) {
      this.completeTimestamp = getTimestamp() + delayBeforeComplete
    }
  }

  endContactTest (contact) {
    if (this.isContactWithHole(contact)) {
      this.completeTimestamp = null
    }
  }

  isContactWithHole (contact) {
    const bodyA = contact.getFixtureA().getBody()
    const bodyB = contact.getFixtureB().getBody()
    const holeBody = this.holeBody

    return bodyA === holeBody || bodyB === holeBody
  }

  holeComplete () {
    dispatchSignal(stageCompleteSignal, this.stageId)
    this.completeTimestamp = null
  }
}
