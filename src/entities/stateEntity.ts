import type { Vec2 } from 'planck'
import { Vec2 as Vec2Ctor } from 'planck'
import { loadState, saveState } from '../shared/statePersister'
import { getOneEntityByTag } from '../gameEngine/world'
import { ballStrokeSignal, ballTag, scoreTag, stageCompleteSignal, stageReadySignal, terrainTag, stateTag } from './constants'
import { subscribe } from '../gameEngine/signalling'
import type { BallShot } from './ballEntity'
import type { SetScore } from './scoreEntity'
import type { SetStageTerrain } from './terrainEntity'
import type { StageReadyPayload } from '../types/stageReady'

export interface ResetState {
  reset: () => void
}

export default class StateEntity implements ResetState {
  public tags = new Set([stateTag])
  private terrainEntity: SetStageTerrain | null = null
  private scoreEntity: SetScore | null = null
  private ballEntity: BallShot | null = null
  private stage!: number
  private score!: number
  private stroke!: number
  private ballPosition!: [number, number] | null
  private ballForce!: [number, number] | null

  init(): void {
    this.terrainEntity = getOneEntityByTag(terrainTag) as SetStageTerrain
    this.scoreEntity = getOneEntityByTag(scoreTag) as SetScore
    this.ballEntity = getOneEntityByTag(ballTag) as BallShot
    subscribe(stageCompleteSignal, (...args: unknown[]) => {
      const [stageId] = args as [number]
      this.stageComplete(stageId)
    })
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [StageReadyPayload]
      this.stageReady(payload)
    })
    subscribe(ballStrokeSignal, (...args: unknown[]) => {
      const [{ position, stroke }] = args as [{ position: Vec2, stroke: Vec2 }]
      this.onStroke({ position, stroke })
    })
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
    if (this.terrainEntity) {
      this.terrainEntity.setStage(stage)
    }
    if (this.scoreEntity) {
      this.scoreEntity.setScore(score, stroke)
    }
    if (ballPosition && ballForce && this.ballEntity) {
      this.ballEntity.setShot(new Vec2Ctor(ballPosition[0], ballPosition[1]), new Vec2Ctor(ballForce[0], ballForce[1]))
    }
  }

  stageReady({ stageId }: StageReadyPayload): void {
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
    if (this.scoreEntity) {
      this.scoreEntity.setScore(this.score, this.stroke)
    }
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
