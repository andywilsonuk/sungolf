import Hsl from '../shared/hsl'

export const ballTag = 'ball'
export const terrainTag = 'terrain'
export const scoreTag = 'score'
export const stateTag = 'state'
export const optionsTag = 'options'
export const holeTag = 'hole'

export const ballStrokeSignal = 'ballStroke'
export const stageReadySignal = 'stageReady'
export const stageCompleteSignal = 'stageComplete'
export const stageTransitioningSignal = 'stageTransitioning'
export const gameResumedSignal = 'gameResumed'
export const gamePausedSignal = 'gamePaused'

export const terrainCategory = 0x0002
export const ballCategory = 0x0004
export const waterCategory = 0x0008
export const objectCategory = 0x0016
export const boundaryCategory = 0x0032

export const finalStageId = 1857

export const waterColor = new Hsl(200, 100, 44)
