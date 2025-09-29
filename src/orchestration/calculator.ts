import type Hsl from '../shared/hsl'
import HslClass from '../shared/hsl'
import { randomFillArray, randomGenerator, randomInt } from '../shared/random'
import { biasedInt, clamp, isFunction, lerp, lerpColor, lerpMinMax, normalize, scaleInt } from '../shared/utils'
import { holeDistanceMax, holeDistanceMin } from '../terrain/constants'
import data, { type ZoneData, type SpecialFeature } from './data'

const defaultColor = new HslClass(200, 50, 50)
const defaultBackgroundColor = new HslClass(220, 30, 80)

interface ExpandedSpecialFeature {
  name: string
  distance: number
  width: number
}

interface CalculatorResult {
  stageId: number
  zoneName: string
  initialDepth: number
  holeDepth: number
  holeDistance: number
  color: Hsl
  backgroundColor: Hsl
  backgroundColorStop: number
  drift: number
  allowedFeatures: string[]
  preferCrags: boolean
  water: boolean
  specialFeature?: ExpandedSpecialFeature
}

type FunctionExpanderValue = ZoneData['depthMinMax'] | ZoneData['driftMinMax'] | ZoneData['allowedFeatures'] | ZoneData['specialFeature'] | ZoneData['preferCrags'] | ZoneData['water']

const expandFunction = (relativeStageId: number, zone?: ZoneData) =>
  (value: FunctionExpanderValue, r?: number) =>
    isFunction(value) ? value(relativeStageId, r, zone) : value

const getDataIndexForStage = (id: number): number => {
  let dataIndex = 0

  if (id < 0) { return 0 } // special case for -1

  while (dataIndex < data.length) {
    const d = data[dataIndex]
    if (d.end !== undefined && d.end >= id) { return dataIndex }
    dataIndex++
  }
  return data.length - 2 // special case for end
}

const getHoleRand = (stageId: number) => randomGenerator(`hole${stageId}`)
const getExpandHoleRand = (stageId: number) => randomGenerator(`expandHole${stageId}`)
const getOrchestrationRand = (stageId: number) => randomGenerator(`orchestration${stageId}`)

const expandHoleDepthMinMax = (stageId: number): [number, number] => {
  const { start, depthMinMax } = data[getDataIndexForStage(stageId)]
  const randValue = getExpandHoleRand(stageId).next()
  const functionExpander = expandFunction(stageId - (start ?? 0))
  const result = functionExpander(depthMinMax, randValue)
  return Array.isArray(result) ? result as [number, number] : [0, 0]
}

const getHoleDepth = (stageId: number): number => {
  const d = data[getDataIndexForStage(stageId)]
  const { start, end, depthMinMax } = d
  const n = normalize(stageId, start ?? 0, end ?? 0)
  const next = data[getDataIndexForStage(stageId) + 1] ?? data[data.length - 1]

  let minMax: [number, number]
  if (isFunction(depthMinMax)) {
    minMax = expandHoleDepthMinMax(stageId)
  } else {
    const lerpStart = depthMinMax as [number, number] | number[]
    const lerpEnd = expandHoleDepthMinMax(next.start ?? 0)
    minMax = lerpMinMax(lerpStart as [number, number], lerpEnd, n)
  }

  const [depthMin, depthMax] = minMax
  return randomInt(getHoleRand(stageId), depthMin, depthMax)
}

export default (stageId: number): CalculatorResult => {
  if (stageId < 0) { stageId = 0 }
  const zone = data[getDataIndexForStage(stageId)]
  const {
    start, end, name: _zoneName, color, backgroundColor, backgroundColorStop, holeMinDistanceBias, driftMinMax,
    allowedFeatures, preferCrags, water, specialFeature,
  } = zone
  const next = data[getDataIndexForStage(stageId) + 1] ?? data[data.length - 1]
  const n = clamp(0, 1, normalize(stageId, start ?? 0, end ?? 0))

  const initialDepth = getHoleDepth(stageId - 1 < 0 ? 0 : stageId - 1)
  const holeDepth = getHoleDepth(stageId)

  const randValues = randomFillArray(getOrchestrationRand(stageId), 10)
  const functionExpander = expandFunction(stageId - (start ?? 0), zone)

  let driftMin: number, driftMax: number
  if (isFunction(driftMinMax)) {
    const driftResult = functionExpander(driftMinMax, randValues[0]);
    [driftMin, driftMax] = Array.isArray(driftResult) ? driftResult as [number, number] : [0, 0]
  } else {
    const lerpStart = driftMinMax as [number, number] | number[]

    const randNext = getOrchestrationRand(next.start ?? 0).next()
    const lerpEnd = functionExpander(next.driftMinMax, randNext);
    [driftMin, driftMax] = lerpMinMax(lerpStart as [number, number], lerpEnd as [number, number], n)
  }

  const expandedSpecialFeature = expandSpecial(functionExpander(specialFeature, randValues[9]) as SpecialFeature | undefined, randValues[5], randValues[6])

  const result: CalculatorResult = {
    stageId,
    zoneName: zone.name,
    initialDepth,
    holeDepth,
    holeDistance: biasedInt(randValues[1], randValues[2], holeDistanceMin, holeDistanceMax, holeDistanceMin, holeMinDistanceBias ?? 0),
    color: lerpColor(
      color ?? zone.color ?? defaultColor,
      next.color ?? zone.color ?? defaultColor,
      n,
    ),
    backgroundColor: lerpColor(
      backgroundColor ?? zone.backgroundColor ?? defaultBackgroundColor,
      next.backgroundColor ?? zone.backgroundColor ?? defaultBackgroundColor,
      n,
    ),
    backgroundColorStop: lerp(backgroundColorStop ?? 0, next.backgroundColorStop ?? 0, n),
    drift: scaleInt(randValues[3], driftMin, driftMax),
    allowedFeatures: functionExpander(allowedFeatures, randValues[4]) as string[],
    preferCrags: functionExpander(preferCrags, randValues[7]) as boolean,
    water: functionExpander(water, randValues[8]) as boolean,
    specialFeature: expandedSpecialFeature,
  }
  return result
}

function expandSpecial(specialFeature: SpecialFeature | undefined, randValue1: number, randValue2: number): ExpandedSpecialFeature | undefined {
  if (specialFeature === undefined) { return }

  const [distanceMin, distanceMax] = specialFeature.distanceMinMax as [number, number]
  const [widthMin, widthMax] = specialFeature.widthMinMax as [number, number]

  return {
    name: specialFeature.feature,
    distance: scaleInt(randValue1, distanceMin, distanceMax),
    width: scaleInt(randValue2, widthMin, widthMax),
  }
}
