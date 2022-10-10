import { randomFillArray, randomGenerator, randomInt } from '../shared/random'
import { biasedInt, clamp, isFunction, lerp, lerpColor, lerpMinMax, normalize, scaleInt } from '../shared/utils'
import { holeDistanceMax, holeDistanceMin } from '../terrain/constants'
import data from './data'

const expandFunction = (relativeStageId, zone) => (value, r) => isFunction(value) ? value(relativeStageId, r, zone) : value

const getDataIndexForStage = (id) => {
  let dataIndex = 0

  if (id < 0) { return 0 } // special case for -1

  while (dataIndex < data.length) {
    const d = data[dataIndex]
    if (d.end >= id) { return dataIndex }
    dataIndex++
  }
  return data.length - 2 // special case for end
}

const getHoleRand = (stageId) => randomGenerator(`hole${stageId}`)
const getExpandHoleRand = (stageId) => randomGenerator(`expandHole${stageId}`)
const getOrchestrationRand = (stageId) => randomGenerator(`orchestration${stageId}`)

const expandHoleDepthMinMax = (stageId) => {
  const { start, depthMinMax } = data[getDataIndexForStage(stageId)]
  const randValue = getExpandHoleRand(stageId).next()
  const functionExpander = expandFunction(stageId - start)
  return functionExpander(depthMinMax, randValue)
}

const getHoleDepth = (stageId) => {
  const d = data[getDataIndexForStage(stageId)]
  const { start, end, depthMinMax } = d
  const n = normalize(stageId, start, end)
  const next = data[getDataIndexForStage(stageId) + 1] ?? data[data.length - 1]

  let minMax
  if (isFunction(depthMinMax)) {
    minMax = expandHoleDepthMinMax(stageId)
  } else {
    const lerpStart = depthMinMax
    const lerpEnd = expandHoleDepthMinMax(next.start)
    minMax = lerpMinMax(lerpStart, lerpEnd, n)
  }

  const [depthMin, depthMax] = minMax
  return randomInt(getHoleRand(stageId), depthMin, depthMax)
}

export default (stageId) => {
  if (stageId < 0) { stageId = 0 }
  const zone = data[getDataIndexForStage(stageId)]
  const {
    start, end, name: zoneName, color, backgroundColor, backgroundColorStop, holeMinDistanceBias, driftMinMax,
    allowedFeatures, preferCrags, water, specialFeature
  } = zone
  const next = data[getDataIndexForStage(stageId) + 1] ?? data[data.length - 1]
  const n = clamp(0, 1, normalize(stageId, start, end))

  const initialDepth = getHoleDepth(stageId - 1 < 0 ? 0 : stageId - 1)
  const holeDepth = getHoleDepth(stageId)

  const randValues = randomFillArray(getOrchestrationRand(stageId), 10)
  const functionExpander = expandFunction(stageId - start, zone)

  let driftMin, driftMax
  if (isFunction(driftMinMax)) {
    [driftMin, driftMax] = functionExpander(driftMinMax, randValues[0])
  } else {
    const lerpStart = driftMinMax
    const randNext = getOrchestrationRand(next.start).next()
    const lerpEnd = functionExpander(next.driftMinMax, randNext);
    [driftMin, driftMax] = lerpMinMax(lerpStart, lerpEnd, n)
  }

  const expandedSpecialFeature = expandSpecial(functionExpander(specialFeature, randValues[9]), randValues[5], randValues[6])

  const result = {
    stageId,
    zoneName,
    initialDepth,
    holeDepth,
    holeDistance: biasedInt(randValues[1], randValues[2], holeDistanceMin, holeDistanceMax, holeDistanceMin, holeMinDistanceBias),
    color: lerpColor(color, next.color, n),
    backgroundColor: lerpColor(backgroundColor, next.backgroundColor, n),
    backgroundColorStop: lerp(backgroundColorStop, next.backgroundColorStop, n),
    drift: scaleInt(randValues[3], driftMin, driftMax),
    allowedFeatures: functionExpander(allowedFeatures, randValues[4]),
    preferCrags: functionExpander(preferCrags, randValues[7]),
    water: functionExpander(water, randValues[8]),
    specialFeature: expandedSpecialFeature
  }
  return result
}
function expandSpecial (specialFeature, randValue1, randValue2) {
  if (specialFeature === undefined) { return }
  const { feature, distanceMinMax: [distanceMin, distanceMax], widthMinMax: [widthMin, widthMax] } = specialFeature
  return {
    name: feature,
    distance: scaleInt(randValue1, distanceMin, distanceMax),
    width: scaleInt(randValue2, widthMin, widthMax)
  }
}
