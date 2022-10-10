import { loadState, saveState } from '../shared/statePersister'
import { getOneEntityByTag } from '../gameEngine/world'
import { ballStrokeSignal, ballTag, scoreTag, stageCompleteSignal, stageReadySignal, terrainTag, stateTag } from './constants'
import { subscribe } from '../gameEngine/signalling'
import { Vec2 } from 'planck-js'

export default class StateEntity {
  constructor () {
    this.tags = new Set([stateTag])
  }

  init () {
    this.terrainEntity = getOneEntityByTag(terrainTag)
    this.scoreEntity = getOneEntityByTag(scoreTag)
    this.ballEntity = getOneEntityByTag(ballTag)
    subscribe(stageCompleteSignal, this.stageComplete.bind(this))
    subscribe(stageReadySignal, this.stageReady.bind(this))
    subscribe(ballStrokeSignal, this.onStroke.bind(this))
  }

  renderInitial () {
    this.restoreState()
  }

  restoreState () {
    const { stage, score, stroke, ballPosition, ballForce } = loadState()
    this.stage = stage
    this.score = score
    this.stroke = stroke
    this.ballPosition = ballPosition
    this.ballForce = ballForce
    this.terrainEntity.setStage(stage)
    this.scoreEntity.setScore(score, stroke)
    if (ballPosition) {
      this.ballEntity.setShot(Vec2(ballPosition[0], ballPosition[1]), Vec2(ballForce[0], ballForce[1]))
    }
  }

  stageReady ({ stageId }) {
    if (this.stage !== stageId) {
      this.ballPosition = null
      this.ballForce = null
    }
    this.stage = stageId
    this.save()
  }

  stageComplete (stageId) {
    this.stage = stageId + 1
    this.score = this.score + this.stroke
    this.stroke = 0
    this.ballPosition = null
    this.ballForce = null
    this.save()
  }

  onStroke ({ position, stroke }) {
    this.stroke += this.stage === 0 ? 0 : 1
    this.ballPosition = [position.x, position.y]
    this.ballForce = [stroke.x, stroke.y]
    this.save()
  }

  save () {
    this.scoreEntity.setScore(this.score, this.stroke)
    saveState(this.stage, this.score, this.stroke, this.ballPosition, this.ballForce)
  }

  reset () {
    this.stage = 0
    this.score = 0
    this.stroke = 0
    this.ballPosition = null
    this.ballForce = null
    this.save()
    this.restoreState()
  }

  forceStroke (stroke) {
    this.stroke += stroke
    this.save()
  }
}
