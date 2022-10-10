import Hsl from './hsl'

export const normalize = (val, min, max) => val === min ? 0 : (val - min) / (max - min)
export const scaleInt = (value, min, max) => (min === max ? min : Math.floor(value * (max - min + 1) + min)) // inclusive
export const scaleRange = (value, min, max) => (value * (max - min) + min)

export const sequence = (count, initial = 0) => count <= 0 ? [] : [...Array(count).keys()].map(i => i + initial)
export const clamp = (min, max, value) => {
  if (value > max) { return max }
  if (value < min) { return min }
  return value
}
export const clearArray = (arr, fn = () => undefined) => {
  for (let index = 0; index < arr.length; index++) {
    arr[index] = fn()
  }
}
// https://stackoverflow.com/a/53092728
export const arrayMinus = (arr, exclude) => arr.filter(n => !exclude.includes(n))

// https://stackoverflow.com/a/7343013
export const roundDecimal = (value, precision) => {
  const multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}
export const mod = (n, m) => ((n % m) + m) % m
export const lerp = (first, last, offset) => (last - first) * offset + first
export const lerpColor = (from, to, n) => {
  const l1 = lerp(from.hue, to.hue, n)
  const l2 = lerp(from.saturation, to.saturation, n)
  const l3 = lerp(from.lightness, to.lightness, n)
  return new Hsl(l1, l2, l3)
}
export const lerpMinMax = ([minCurrent, maxCurrent], [minNext, maxNext], n) => {
  const min = lerp(minCurrent, minNext, n)
  const max = lerp(maxCurrent, maxNext, n)
  return [min, max]
}

export const isFunction = value => typeof value === 'function'
export const isBoolean = value => value === false || value === true

// phase = 0 - 1
export const sinWave = (time, period, offset, amplitude, phase = 0) => {
  // https://riptutorial.com/javascript/example/10173/periodic-functions-using-math-sin
  const frequency = 1 / period
  const output = (Math.sin(time * frequency * Math.PI * 2 + phase * Math.PI * 2) + 1) * 0.5 * amplitude + offset
  return Math.floor(output)
}
export const oneIn = (randValue, chance) => scaleInt(randValue, 1, chance) === 1
export const biasedInt = (randValue1, randValue2, min, max, bias, influence = 1) => {
  // based on https://stackoverflow.com/a/29325222
  const rnd = scaleRange(randValue1, min, max)
  const mix = randValue2 * influence
  const bias2 = bias ?? (min + (max - min + 1) * 0.5)
  return Math.round(rnd * (1 - mix) + bias2 * mix)
}
