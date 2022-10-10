
import calculator from './calculator'
import data from './data'

const debug = false
const cache = []

const getFromCache = (id) => {
  for (let i = 0; i < cache.length; i++) {
    const result = cache[i]
    if (result.stageId === id) { return result }
  }
  return undefined
}
const setCache = (d) => {
  cache.push(d)
  if (cache.length > 5) {
    cache.shift()
  }
}

export default (stageId) => {
  const cached = getFromCache(stageId)
  if (cached !== undefined) { return cached }
  const result = calculator(stageId)
  setCache(result)
  return result
}

export const zoneColors = () => data.map(({ color }) => color)
export const zoneRanges = () => data.map(({ start, end }) => ({ start, end }))
if (debug) {
  data.forEach(zone => console.log(`${zone.name}@${zone.start} for ${zone.duration}`))
}
