import { referenceHeight, referenceWidth } from '../gameEngine/renderCanvas'

export const holeDepth = 18

export const ceilingDepth = 100
export const absoluteFloorDepth = referenceHeight
export const floorDepth = absoluteFloorDepth - holeDepth - 15

export const holeSide = 3
export const holeSlope = 2
export const holeWidth = 16
export const holeTotalWidth = holeSide + holeSlope + holeWidth + holeSlope + holeSide

export const teeX = holeTotalWidth
export const teeWidth = holeTotalWidth

export const holeDistanceMin = 600
export const holeDistanceMax = referenceWidth - teeX - teeWidth - holeTotalWidth

export const specialFeatureDistanceMin = 200
export const specialFeatureDistanceMax = 500

export const sinkholeWidthMin = 80
export const sinkholeWidthMax = 500
export const mesaWidth = 50
export const specialWidth = 50

export const segmentDistanceMin = 40
export const segmentDistanceMax = 200
export const segmentDepthMin = 20
export const segmentDepthMax = 200
