import type { Vec2 } from 'planck'

export interface StageReadyPayload {
  stageId: number
  startPosition: Vec2
  holePosition: Vec2
}
