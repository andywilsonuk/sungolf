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
  driftMinMax?: [number, number] | number[] | ((relativeStageId: number, randValue: number) => [number, number] | number[])
  holeMinDistanceBias?: number
  allowedFeatures?: string[] | ((relativeStageId: number) => string[])
  specialFeature?: SpecialFeature | ((relativeStageId: number, randValue?: number) => SpecialFeature | undefined) | undefined
  preferCrags?: boolean | ((relativeStageId: number, randValue: number) => boolean)
  water?: boolean | ((relativeStageId: number, randValue: number) => boolean)
}

const defaultColor = new Hsl(43, 89, 38)
const maxDrift = 800
const midDrift = Math.floor(maxDrift * 0.5)
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
  driftMinMax: (relativeStageId: number, randValue: number) =>
    relativeStageId > 10 && oneIn(randValue, 5)
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
  specialFeature: (_, randValue) => oneIn(randValue, 30)
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
  duration: 104,
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
const pink1aZone = {
  name: 'Pink1a',
  duration: 66,
  color: new Hsl(6, 33, 48),
  backgroundColor: redBackgroundColor,
  backgroundColorStop: redBackgroundColorStop,
  depthMinMax: [ceilingDepth, ceilingDepth + 100],
  driftMinMax: [maxDrift - 100, maxDrift],
  preferCrags: true,
}
const pink1bZone = {
  ...pink1aZone,
  name: 'Pink1b',
  duration: 66,
  color: new Hsl(356, 39, 48),
}
const pink1cZone = {
  ...pink1aZone,
  name: 'Pink1c',
  duration: 66,
  color: new Hsl(356, 69, 40),
}
const towerZone = {
  ...pink1cZone,
  name: 'Tower',
  duration: 1,
  specialFeature: {
    feature: towerName,
    distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
    widthMinMax: [specialWidth, specialWidth],
  },
}
const pink1dZone = {
  ...pink1aZone,
  name: 'Pink1d',
  duration: 49,
  color: new Hsl(0, 74, 40),
}
const green1aZone = {
  name: 'Green1a',
  duration: 20,
  color: new Hsl(89, 46, 46),
  backgroundColor: greenBackgroundColor,
  backgroundColorStop: greenBackgroundColorStop,
  depthMinMax: [floorDepth - 50, floorDepth],
  holeMinDistanceBias: 0.7,
  driftMinMax: [0, 60],
  allowedFeatures: (_, randValue) => oneIn(randValue, 6) ? greenFeaturesPlus : greenFeatures,
  specialFeature: (_, randValue, zone) => {
    if (!oneIn(randValue, 8) || zone.depthMinMax[1] < floorDepth - 10) { return }
    return {
      feature: sinkholeName,
      distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
      widthMinMax: [sinkholeWidthMin, sinkholeWidthMin],
    }
  },
  water: true,
}
const green1bZone = {
  ...green1aZone,
  name: 'Green1b',
  duration: 20,
  color: new Hsl(91, 50, 41),
}
const green1cZone = {
  ...green1aZone,
  name: 'Green1c',
  duration: 30,
  color: new Hsl(91, 53, 32),
  depthMinMax: [floorDepth - 100, floorDepth],
  driftMinMax: [60, 100],
}
const yellow2Zone = {
  name: 'Yellow2',
  duration: 150,
  color: defaultColor,
  depthMinMax: [ceilingDepth, floorDepth],
  driftMinMax: [0, maxDrift],
  specialFeature: (_, randValue) => {
    const chance = scaleInt(randValue, 1, 60)
    if (chance === 1) {
      return {
        feature: sinkholeName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [sinkholeWidthMin, sinkholeWidthMin],
      }
    } else if (chance === 2) {
      return {
        feature: mesaName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [mesaWidth, mesaWidth],
      }
    }
  },
  preferCrags: true,
}
const redZone = {
  name: 'Red',
  duration: 20,
  color: new Hsl(356, 98, 21),
  backgroundColor: redBackgroundColor,
  backgroundColorStop: redBackgroundColorStop,
  depthMinMax: [ceilingDepth, ceilingDepth + 100],
  driftMinMax: [maxDrift, maxDrift],
  preferCrags: true,
}
const gray1aZone = {
  name: 'Gray1a',
  duration: 20,
  color: new Hsl(0, 27, 38),
  backgroundColor: grayBackgroundColor,
  backgroundColorStop: grayBackgroundColorStop,
  depthMinMax: [ceilingDepth, floorDepth],
  driftMinMax: [midDrift - 100, maxDrift],
}
const gray1bZone = {
  ...gray1aZone,
  name: 'Gray1b',
  duration: 20,
  color: new Hsl(12, 61, 30),
}
const gray1cZone = {
  ...gray1aZone,
  name: 'Gray1c',
  duration: 20,
  color: new Hsl(21, 36, 58),
}
const wet1aZone = {
  name: 'Wet1a',
  duration: 20,
  color: new Hsl(36, 33, 53),
  backgroundColor: grayBackgroundColor,
  backgroundColorStop: grayBackgroundColorStop,
  depthMinMax: [floorDepth - 150, floorDepth],
  driftMinMax: (_, randValue) => oneIn(randValue, 5) ? [50, 100] : [0, 0],
  specialFeature: (_, randValue) => oneIn(randValue, 5)
    ? {
        feature: sinkholeName,
        distanceMinMax: [specialFeatureDistanceMin, specialFeatureDistanceMax],
        widthMinMax: [sinkholeWidthMin, sinkholeWidthMax],
      }
    : undefined,
  holeMinDistanceBias: 0.6,
  water: true,
}
const wet1bZone = {
  ...wet1aZone,
  name: 'Wet1b',
  duration: 20,
  color: new Hsl(36, 33, 33),
}
const wet1cZone = {
  ...wet1aZone,
  name: 'Wet1c',
  duration: 20,
  color: new Hsl(37, 33, 41),
}
const wet1dZone = {
  ...wet1aZone,
  name: 'Wet1d',
  duration: 20,
  color: new Hsl(36, 33, 51),
}
const yellow3Zone = {
  name: 'Yellow3',
  duration: 120,
  color: defaultColor,
  depthMinMax: [ceilingDepth, floorDepth],
  driftMinMax: [0, maxDrift],
  specialFeature: (_, randValue) => {
    const chance = scaleInt(randValue, 1, 60)
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
  preferCrags: (_, randValue) => oneIn(randValue, 3),
  water: (_, randValue) => oneIn(randValue, 40),
}
const endAZone = {
  ...yellow3Zone,
  name: 'endA',
  duration: 1,
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
const transitionZone = (duration: number): ZoneData => ({ name: transitionZoneName, duration })

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
  pink1aZone,
  pink1bZone,
  pink1cZone,
  towerZone,
  pink1dZone,
  transitionZone(60),
  green1aZone,
  green1bZone,
  green1cZone,
  transitionZone(60),
  yellow2Zone,
  transitionZone(60),
  redZone,
  transitionZone(60),
  gray1aZone,
  gray1bZone,
  gray1cZone,
  transitionZone(60),
  wet1aZone,
  wet1bZone,
  wet1cZone,
  wet1dZone,
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
