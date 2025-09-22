import { arrayMinus } from '../../shared/utils'

export const cliffLeftName = 'cliffLeft'
export const cliffRightName = 'cliffRight'
export const cragName = 'crag'
export const depressionName = 'depression'
export const flatName = 'flat'
export const hillName = 'hill'
export const ridgeDownName = 'ridgeDown'
export const ridgeUpName = 'ridgeUp'
export const slopeName = 'slope'
export const spurLeftName = 'spurLeft'
export const spurRightName = 'spurRight'
export const valleyDownName = 'valleyDown'
export const valleyUpName = 'valleyUp'
export const holeName = 'hole'
export const sinkholeName = 'sinkhole'
export const mesaName = 'mesa'
export const skullName = 'skull'
export const cloudName = 'cloud'
export const cactusName = 'cactus'
export const towerName = 'tower'
export const endingName = 'ending'

export const standardFeatures = [
  flatName,
  slopeName,
  hillName,
  depressionName,
  ridgeDownName,
  ridgeUpName,
  valleyDownName,
  valleyUpName,
  spurLeftName,
  spurRightName,
  cliffLeftName,
  cliffRightName,
  cragName,
]
export const greenFeatures = [
  flatName,
  slopeName,
  ridgeDownName,
  ridgeUpName,
]
export const greenFeaturesPlus = [
  ...greenFeatures,
  hillName,
  depressionName,
]
export const trainingFeatures = [
  flatName,
  slopeName,
]
export const earlyFeatures = arrayMinus(standardFeatures, [cliffRightName])
