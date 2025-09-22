import Alea from 'alea'
import { scaleInt, scaleRange } from './utils'

interface RandomGenerator {
  next(): number
}

export const randomGenerator = (seed: string | number): RandomGenerator => new (Alea as any)(seed)

export const randomInt = (rand: RandomGenerator, min: number, max: number): number => 
  scaleInt(rand.next(), min, max) // max inclusive

export const randomRange = (rand: RandomGenerator, min: number, max: number): number => 
  scaleRange(rand.next(), min, max)

export const randomTernary = <T>(
  rand: RandomGenerator, 
  value1: T = false as T, 
  value2: T = true as T
): T => 
  rand.next() < 0.5 ? value1 : value2

export const randomShuffle = <T>(rand: RandomGenerator, list: T[]): T[] => {
  // based on https://stackoverflow.com/a/2450976
  let currentIndex = list.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(rand.next() * currentIndex)
    currentIndex -= 1;

    [list[currentIndex], list[randomIndex]] = [list[randomIndex], list[currentIndex]]
  }

  return list
}

export const randomItem = <T>(rand: RandomGenerator, list?: T[]): T | undefined => {
  if (list === undefined) { return undefined }
  const { length } = list
  if (length === 0) { return undefined }
  if (length === 1) { return list[0] }
  return list[randomInt(rand, 0, length - 1)]
}

// bias is between min and max, influence 0-1
export const randomBiased = (
  rand: RandomGenerator, 
  min: number, 
  max: number, 
  bias?: number, 
  influence: number = 1
): number => {
  // based on https://stackoverflow.com/a/29325222
  const rnd = randomRange(rand, min, max)
  const mix = rand.next() * influence
  const bias2 = bias ?? (min + (max - min + 1) * 0.5)
  return rnd * (1 - mix) + bias2 * mix
}

export const randomBiasedInt = (
  generator: RandomGenerator, 
  min: number, 
  max: number, 
  bias?: number, 
  influence?: number
): number => 
  Math.round(randomBiased(generator, min, max, bias, influence))

export const randomOneIn = (generator: RandomGenerator, chance: number): boolean => 
  randomInt(generator, 1, chance) === 1

export const randomFillArray = (generator: RandomGenerator, length: number): number[] => 
  Array.from({ length }, () => generator.next())
