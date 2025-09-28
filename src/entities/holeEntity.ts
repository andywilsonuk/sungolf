import type { Body, Contact } from 'planck'
import { Box, Vec2 } from 'planck'
import { getTimestamp } from '../gameEngine/gameLoop'
import { createBody, registerBeginContact, registerEndContact, physicsScale } from '../gameEngine/physics'
import { dispatchSignal, subscribe } from '../gameEngine/signalling'
import { holeDepth, holeTotalWidth } from '../terrain/constants'
import { finalStageId, stageCompleteSignal, stageReadySignal } from './constants'
import type { StageReadyPayload } from '../types/stageReady'

const delayBeforeComplete = 0.5 * 1000

export default class HoleEntity {
  private stageId: number | null = null
  private completeTimestamp: number | null = null
  private holeBody!: Body

  constructor() {
    this.stageId = null
    this.completeTimestamp = null
  }

  init(): void {
    this.holeBody = createBody({
      active: false,
    })
    this.holeBody.createFixture(new Box(holeTotalWidth * 0.5 * physicsScale, holeDepth * 0.25 * physicsScale, Vec2(holeTotalWidth * -0.5 * physicsScale, holeDepth * 0.75 * physicsScale)), {
      isSensor: true,
    })

    subscribe(stageReadySignal, (payload) => {
      this.enableHole(payload as StageReadyPayload)
    })
    subscribe(stageCompleteSignal, this.disableHole.bind(this))
    registerBeginContact(this.contactTest.bind(this))
    registerEndContact(this.endContactTest.bind(this))
  }

  enableHole({ stageId, holePosition }: StageReadyPayload): void {
    if (stageId === finalStageId) { return }
    this.stageId = stageId
    this.holeBody.setPosition(holePosition)
    this.holeBody.setActive(true)
  }

  disableHole(): void {
    this.holeBody.setActive(false)
  }

  beginFrame(timestamp: number): void {
    if (this.completeTimestamp === null || timestamp < this.completeTimestamp) { return }
    this.holeComplete()
  }

  contactTest(contact: Contact): void {
    if (this.completeTimestamp === null && this.isContactWithHole(contact)) {
      this.completeTimestamp = getTimestamp() + delayBeforeComplete
    }
  }

  endContactTest(contact: Contact): void {
    if (this.isContactWithHole(contact)) {
      this.completeTimestamp = null
    }
  }

  isContactWithHole(contact: Contact): boolean {
    const bodyA = contact.getFixtureA().getBody()
    const bodyB = contact.getFixtureB().getBody()
    const holeBody = this.holeBody

    return bodyA === holeBody || bodyB === holeBody
  }

  holeComplete(): void {
    if (this.stageId === null) return
    dispatchSignal(stageCompleteSignal, this.stageId)
    this.completeTimestamp = null
  }
}
