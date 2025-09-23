import Hsl from '../shared/hsl'
import { clamp, oneIn, scaleInt, sinWave } from '../shared/utils'
import { ceilingDepth, floorDepth, specialFeatureDistanceMax, specialFeatureDistanceMin, sinkholeWidthMin, mesaWidth, sinkholeWidthMax, specialWidth } from '../terrain/constants'
import { cactusName, cloudName, earlyFeatures, endingName, greenFeatures, greenFeaturesPlus, mesaName, sinkholeName, skullName, standardFeatures, towerName, trainingFeatures } from '../terrain/features/names'

interface SpecialFeature {
  feature: string
  distanceMinMax: [number, number] | number[]
  widthMinMax: [number, number] | number[]
}

interface ZoneData {
  name: string
  duration: number
  start?: number
  end?: number
  color?: Hsl
  backgroundColor?: Hsl
  backgroundColorStop?: number
  depthMinMax?: [number, number] | number[] | ((relativeStageId: number, randValue: number) => [number, number] | number[])
  driftMinMax?: [number, number] | number[] | ((relativeStageId: number, randValue?: number) => [number, number] | number[])
  holeMinDistanceBias?: number
  allowedFeatures?: string[] | ((relativeStageId: number, randValue?: number, zone?: unknown) => string[])
  specialFeature?: SpecialFeature | ((relativeStageId: number, randValue?: number, zone?: unknown) => SpecialFeature | undefined) | undefined
  preferCrags?: boolean | ((relativeStageId: number, randValue?: number) => boolean)
  water?: boolean | ((relativeStageId: number, randValue?: number) => boolean)
}

const defaultColor = new Hsl(43, 89, 38)
const maxDrift = 800
const defaultBackgroundColor = new Hsl(34, 44, 69)
const defaultBackgroundColorStop = 0.4
const greenBackgroundColor = new Hsl(209, 43, 73)
const greenBackgroundColorStop = 0.6
const redBackgroundColor = new Hsl(0, 61, 60)
const redBackgroundColorStop = 0.4
const grayBackgroundColor = new Hsl(44, 41, 66)
const grayBackgroundColorStop = 0.6
const endingBackgroundColor = new Hsl(34, 51, 9)
const endingBackgroundColorStop = 0

const defaultValues: Partial<ZoneData> = {
  color: defaultColor,
  backgroundColor: defaultBackgroundColor,
  backgroundColorStop: defaultBackgroundColorStop,
  holeMinDistanceBias: 0,
  allowedFeatures: standardFeatures,
  specialFeature: undefined,
  preferCrags: false,
  water: false,
}

const trainingZone: ZoneData = {
  name: 'Training',
  duration: 2,
  depthMinMax: (relativeStageId) => relativeStageId <= 0 ? [floorDepth - 200, floorDepth - 200] : [floorDepth - 205, floorDepth - 205],
  driftMinMax: (relativeStageId) => relativeStageId <= 0 ? [0, 0] : [20, 20],
  holeMinDistanceBias: 1,
  allowedFeatures: trainingFeatures,
}
const initialZone: ZoneData = {
  name: 'Initial',
  duration: 310,
  depthMinMax: (relativeStageId: number, randValue: number) => {
    if (relativeStageId > 20 && oneIn(randValue, 10)) {
      return [ceilingDepth, ceilingDepth + 100]
    }
    const mid = Math.floor((floorDepth - ceilingDepth) / 6) * 4
    const max = floorDepth - mid - 50
    const sin = sinWave(relativeStageId, 30, mid, max)
    return [sin - 30, sin]
  },
  driftMinMax: (relativeStageId: number, randValue?: number) =>
    relativeStageId > 10 && oneIn(randValue ?? 0, 5)
      ? [300, 300]
      : [100, clamp(100, maxDrift, relativeStageId * 4)],
  holeMinDistanceBias: 1,
  allowedFeatures: (relativeStageId) => relativeStageId <= 5 ? earlyFeatures : standardFeatures,
}
const cactusZone: ZoneData = {
  name: 'Cactus',
  duration: 5,
  depthMinMax: [floorDepth - 50, floorDepth - 50],
  driftMinMax: [0, 0],
  holeMinDistanceBias: 0,
  specialFeature: (relativeStageId) => relativeStageId === 0 || relativeStageId === 4
    ? {
        feature: cactusName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [specialWidth, specialWidth],
      }
    : undefined,
}
const yellow1aZone = {
  name: 'Yellow1a',
  duration: 19,
  depthMinMax: [ceilingDepth + 100, floorDepth - 100],
  driftMinMax: [150, 350],
  holeMinDistanceBias: 0.5,
}
const flatZone = {
  name: 'Flat',
  duration: 2,
  depthMinMax: [300, 300],
  driftMinMax: [0, 0],
  allowedFeatures: trainingFeatures,
}
const yellow1bZone = {
  name: 'Yellow1b',
  duration: 119,
  depthMinMax: [ceilingDepth + 100, floorDepth - 100],
  driftMinMax: [150, 350],
  holeMinDistanceBias: 0.5,
}
const initialSinkholeZone = {
  name: 'Sinkhole',
  duration: 1,
  depthMinMax: [floorDepth - 50, floorDepth - 50],
  driftMinMax: [100, 100],
  holeMinDistanceBias: 0,
  specialFeature: {
    feature: sinkholeName,
    distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
    widthMinMax: [sinkholeWidthMin, sinkholeWidthMin],
  },
}
const yellow1cZone = {
  name: 'Yellow1c',
  duration: 63,
  depthMinMax: [ceilingDepth + 100, floorDepth],
  driftMinMax: [150, 400],
  specialFeature: (_: number, randValue?: number) => oneIn(randValue ?? 0, 30)
    ? {
        feature: sinkholeName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [sinkholeWidthMin, sinkholeWidthMin],
      }
    : undefined,
}
const cloudZone = {
  ...yellow1bZone,
  name: 'Cloud',
  duration: 1,
  specialFeature: {
    feature: cloudName,
    distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
    widthMinMax: [specialWidth, specialWidth],
  },
}
const yellow1dZone = {
  ...yellow1cZone,
  name: 'Yellow1c',
  duration: 93,
}
const skullZone = {
  ...yellow1bZone,
  name: 'Skull',
  duration: 1,
  specialFeature: {
    feature: skullName,
    distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
    widthMinMax: [specialWidth, specialWidth],
  },
}
const yellow1eZone = {
  ...yellow1cZone,
  name: 'Yellow1d',
  duration: 1,
}
const redZone = {
  name: 'Red',
  duration: 20,
  color: new Hsl(6, 33, 48),
  backgroundColor: redBackgroundColor,
  backgroundColorStop: redBackgroundColorStop,
  depthMinMax: [ceilingDepth, ceilingDepth + 100],
  driftMinMax: [maxDrift - 100, maxDrift],
  preferCrags: true,
}
const towerZone = {
  ...redZone,
  name: 'Tower',
  duration: 1,
  specialFeature: {
    feature: towerName,
    distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
    widthMinMax: [specialWidth, specialWidth],
  },
}
const green1aZone = {
  name: 'Green1a',
  duration: 20,
  color: new Hsl(91, 53, 32),
  backgroundColor: greenBackgroundColor,
  backgroundColorStop: greenBackgroundColorStop,
  depthMinMax: [floorDepth - 100, floorDepth],
  holeMinDistanceBias: 0.7,
  driftMinMax: [0, 80],
  allowedFeatures: (_: number, randValue?: number) => oneIn(randValue ?? 0, 6) ? greenFeaturesPlus : greenFeatures,
  specialFeature: (_: number, randValue?: number, zone?: { depthMinMax?: number[] }) => {
    if (!oneIn(randValue ?? 0, 8) || (zone?.depthMinMax?.[1] ?? 0) < floorDepth - 10) { return }
    return {
      feature: sinkholeName,
      distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
      widthMinMax: [sinkholeWidthMin, sinkholeWidthMin],
    }
  },
  water: true,
}
const wet1aZone = {
  name: 'Wet1a',
  duration: 20,
  color: new Hsl(37, 33, 41),
  backgroundColor: grayBackgroundColor,
  backgroundColorStop: grayBackgroundColorStop,
  depthMinMax: [floorDepth - 150, floorDepth],
  driftMinMax: (_: number, randValue?: number) => oneIn(randValue ?? 0, 5) ? [50, 100] : [0, 0],
  specialFeature: (_: number, randValue?: number) => oneIn(randValue ?? 0, 5)
    ? {
        feature: sinkholeName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [sinkholeWidthMin, sinkholeWidthMax],
      }
    : undefined,
  holeMinDistanceBias: 0.6,
  water: true,
}
const yellow3Zone = {
  name: 'Yellow3',
  duration: 20,
  color: defaultColor,
  depthMinMax: [ceilingDepth, floorDepth],
  driftMinMax: [0, maxDrift],
  specialFeature: (_: number, randValue?: number) => {
    const chance = scaleInt(randValue ?? 0, 1, 60)
    if (chance === 1) {
      return {
        feature: sinkholeName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [sinkholeWidthMin, sinkholeWidthMin],
      }
    } else if (chance > 50) {
      return {
        feature: mesaName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [mesaWidth, mesaWidth],
      }
    }
  },
  preferCrags: (_: number, randValue?: number) => oneIn(randValue ?? 0, 3),
  water: (_: number, randValue?: number) => oneIn(randValue ?? 0, 40),
}
const endAZone = {
  ...yellow3Zone,
  name: 'endA',
  duration: 2,
  depthMinMax: [floorDepth - 10, floorDepth - 10],
  driftMinMax: [200, 200],
  color: new Hsl(19, 77, 19),
  backgroundColor: endingBackgroundColor,
  backgroundColorStop: endingBackgroundColorStop,
  specialFeature: undefined,
  water: true,
}
const endBZone = {
  ...endAZone,
  name: 'endB',
  driftMinMax: [0, 0],
  specialFeature: {
    feature: endingName,
    distanceMinMax: [specialFeatureDistanceMax, specialFeatureDistanceMax],
    widthMinMax: [sinkholeWidthMax, sinkholeWidthMax],
  },
}

const transitionZoneName = 'transition'
const transitionZone = (duration: number): ZoneData => ({ name: transitionZoneName, duration, specialFeature: undefined })

const zones: ZoneData[] = [
  trainingZone,
  initialZone,
  cactusZone,
  yellow1aZone,
  flatZone,
  yellow1bZone,
  initialSinkholeZone,
  yellow1cZone,
  cloudZone,
  yellow1dZone,
  skullZone,
  yellow1eZone,
  transitionZone(60),
  redZone,
  towerZone,
  transitionZone(60),
  green1aZone,
  transitionZone(60),
  wet1aZone,
  transitionZone(60),
  yellow3Zone,
  transitionZone(60),
  endAZone,
  endBZone,
]
const allData = (): ZoneData[] => {
  let start = 0
  let previous: ZoneData | undefined
  return zones.map((d) => {
    const end = start + d.duration - 1
    const result: ZoneData = d.name === transitionZoneName ? { ...previous, ...d, start, end } : { ...defaultValues, ...d, start, end }
    start = end + 1
    previous = result
    return result
  })
}
export default allData()
