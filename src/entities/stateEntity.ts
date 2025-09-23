import type { Vec2 } from 'planck-js'
import { Vec2 as Vec2Constructor } from 'planck-js'
import { loadState, saveState } from '../shared/statePersister'
import { getOneEntityByTag } from '../gameEngine/world'
import { ballStrokeSignal, ballTag, scoreTag, stageCompleteSignal, stageReadySignal, terrainTag, stateTag } from './constants'
import { subscribe } from '../gameEngine/signalling'

export default class StateEntity {
  public tags = new Set([stateTag])
  private terrainEntity: any
  private scoreEntity: any
  private ballEntity: any
  private stage!: number
  private score!: number
  private stroke!: number
  private ballPosition!: [number, number] | null
  private ballForce!: [number, number] | null

  init(): void {
    this.terrainEntity = getOneEntityByTag(terrainTag)
    this.scoreEntity = getOneEntityByTag(scoreTag)
    this.ballEntity = getOneEntityByTag(ballTag)
    subscribe(stageCompleteSignal, this.stageComplete.bind(this))
    subscribe(stageReadySignal, this.stageReady.bind(this))
    subscribe(ballStrokeSignal, this.onStroke.bind(this))
  }

  renderInitial(): void {
    this.restoreState()
  }

  restoreState(): void {
    const { stage, score, stroke, ballPosition, ballForce } = loadState()
    this.stage = stage
    this.score = score
    this.stroke = stroke
    this.ballPosition = ballPosition
    this.ballForce = ballForce
    this.terrainEntity.setStage(stage)
    this.scoreEntity.setScore(score, stroke)
    if (ballPosition && ballForce) {
      this.ballEntity.setShot(Vec2Constructor(ballPosition[0], ballPosition[1]), Vec2Constructor(ballForce[0], ballForce[1]))
    }
  }

  stageReady({ stageId }: { stageId: number }): void {
    if (this.stage !== stageId) {
      this.ballPosition = null
      this.ballForce = null
    }
    this.stage = stageId
    this.save()
  }

  stageComplete(stageId: number): void {
    this.stage = stageId + 1
    this.score = this.score + this.stroke
    this.stroke = 0
    this.ballPosition = null
    this.ballForce = null
    this.save()
  }

  onStroke({ position, stroke }: { position: Vec2, stroke: Vec2 }): void {
    this.stroke += this.stage === 0 ? 0 : 1
    this.ballPosition = [position.x, position.y]
    this.ballForce = [stroke.x, stroke.y]
    this.save()
  }

  save(): void {
    this.scoreEntity.setScore(this.score, this.stroke)
    saveState(this.stage, this.score, this.stroke, this.ballPosition, this.ballForce)
  }

  reset(): void {
    this.stage = 0
    this.score = 0
    this.stroke = 0
    this.ballPosition = null
    this.ballForce = null
    this.save()
    this.restoreState()
  }

  forceStroke(stroke: number): void {
    this.stroke += stroke
    this.save()
  }
}