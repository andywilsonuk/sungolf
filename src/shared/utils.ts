import Hsl from './hsl'

type MinMaxTuple = [number, number]

export const normalize = (val: number, min: number, max: number): number => 
  val === min ? 0 : (val - min) / (max - min)

export const scaleInt = (value: number, min: number, max: number): number => 
  (min === max ? min : Math.floor(value * (max - min + 1) + min)) // inclusive

export const scaleRange = (value: number, min: number, max: number): number => 
  (value * (max - min) + min)

export const sequence = (count: number, initial: number = 0): number[] => 
  count <= 0 ? [] : [...Array(count).keys()].map(i => i + initial)

export const clamp = (min: number, max: number, value: number): number => {
  if (value > max) { return max }
  if (value < min) { return min }
  return value
}

export const clearArray = <T>(arr: T[], fn: () => T = () => undefined as T): void => {
  for (let index = 0; index < arr.length; index++) {
    arr[index] = fn()
  }
}

// https://stackoverflow.com/a/53092728
export const arrayMinus = <T>(arr: T[], exclude: T[]): T[] => 
  arr.filter(n => !exclude.includes(n))

// https://stackoverflow.com/a/7343013
export const roundDecimal = (value: number, precision?: number): number => {
  const multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

export const mod = (n: number, m: number): number => ((n % m) + m) % m

export const lerp = (first: number, last: number, offset: number): number => 
  (last - first) * offset + first

export const lerpColor = (from: Hsl, to: Hsl, n: number): Hsl => {
  const l1 = lerp(from.hue, to.hue, n)
  const l2 = lerp(from.saturation, to.saturation, n)
  const l3 = lerp(from.lightness, to.lightness, n)
  return new Hsl(l1, l2, l3)
}

export const lerpMinMax = (
  [minCurrent, maxCurrent]: MinMaxTuple, 
  [minNext, maxNext]: MinMaxTuple, 
  n: number
): MinMaxTuple => {
  const min = lerp(minCurrent, minNext, n)
  const max = lerp(maxCurrent, maxNext, n)
  return [min, max]
}

export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => typeof value === 'function'

export const isBoolean = (value: unknown): value is boolean => value === false || value === true

// phase = 0 - 1
export const sinWave = (
  time: number, 
  period: number, 
  offset: number, 
  amplitude: number, 
  phase: number = 0
): number => {
  // https://riptutorial.com/javascript/example/10173/periodic-functions-using-math-sin
  const frequency = 1 / period
  const output = (Math.sin(time * frequency * Math.PI * 2 + phase * Math.PI * 2) + 1) * 0.5 * amplitude + offset
  return Math.floor(output)
}

export const oneIn = (randValue: number, chance: number): boolean => 
  scaleInt(randValue, 1, chance) === 1

export const biasedInt = (
  randValue1: number, 
  randValue2: number, 
  min: number, 
  max: number, 
  bias?: number, 
  influence: number = 1
): number => {
  // based on https://stackoverflow.com/a/29325222
  const rnd = scaleRange(randValue1, min, max)
  const mix = randValue2 * influence
  const bias2 = bias ?? (min + (max - min + 1) * 0.5)
  return Math.round(rnd * (1 - mix) + bias2 * mix)
}
