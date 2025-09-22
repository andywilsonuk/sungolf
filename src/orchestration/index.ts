
import type Hsl from '../shared/hsl'
import calculator from './calculator'
import data from './data'

interface CachedResult {
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
  specialFeature?: {
    name: string
    distance: number
    width: number
  }
}

const debug = false
const cache: CachedResult[] = []

const getFromCache = (id: number): CachedResult | undefined => {
  for (let i = 0; i < cache.length; i++) {
    const result = cache[i]
    if (result.stageId === id) { return result }
  }
  return undefined
}

const setCache = (d: CachedResult): void => {
  cache.push(d)
  if (cache.length > 5) {
    cache.shift()
  }
}

export default (stageId: number): CachedResult => {
  const cached = getFromCache(stageId)
  if (cached !== undefined) { return cached }
  const result = calculator(stageId)
  setCache(result)
  return result
}

export const zoneColors = (): (Hsl | undefined)[] => data.map(({ color }) => color)
export const zoneRanges = (): { start: number | undefined, end: number | undefined }[] => data.map(({ start, end }) => ({ start, end }))

if (debug) {
  data.forEach(zone => console.log(`${zone.name}@${zone.start} for ${zone.duration}`))
}
