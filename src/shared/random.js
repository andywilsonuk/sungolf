import Alea from 'alea'
import { scaleInt, scaleRange } from './utils.js'

export const randomGenerator = (seed) => new Alea(seed)
export const randomInt = (rand, min, max) => scaleInt(rand.next(), min, max) // max inclusive
export const randomRange = (rand, min, max) => scaleRange(rand.next(), min, max)
export const randomTernary = (rand, value1 = false, value2 = true) => rand.next() < 0.5 ? value1 : value2
export const randomShuffle = (rand, list) => {
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
export const randomItem = (rand, list) => {
  if (list === undefined) { return undefined }
  const { length } = list
  if (length === 0) { return undefined }
  if (length === 1) { return list[0] }
  return list[randomInt(rand, 0, length - 1)]
}
// bias is between min and max, influence 0-1
export const randomBiased = (rand, min, max, bias, influence = 1) => {
  // based on https://stackoverflow.com/a/29325222
  const rnd = randomRange(rand, min, max)
  const mix = rand.next() * influence
  const bias2 = bias ?? (min + (max - min + 1) * 0.5)
  return rnd * (1 - mix) + bias2 * mix
}
export const randomBiasedInt = (generator, min, max, bias, influence) => Math.round(randomBiased(generator, min, max, bias, influence))
export const randomOneIn = (generator, chance) => randomInt(generator, 1, chance) === 1
export const randomFillArray = (generator, length) => Array.from({ length }, () => generator.next())
