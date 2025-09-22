interface Animation {
  update(deltaTime: number): void
}

let lastDeltaTime = 0
let interpolation = 0
const animations: Animation[] = []

const render = (interpolationPercentage: number): void => {
  interpolation = interpolationPercentage
}

const update = (deltaTime: number): void => {
  for (let i = 0; i < animations.length; i++) {
    const animation = animations[i]
    animation.update(deltaTime)
  }
  lastDeltaTime = deltaTime
}

const clear = (): void => {
  animations.length = 0
}

export const interpolationCurrent = (): number => interpolation * lastDeltaTime
export const addAnimation = (animation: Animation): Animation => {
  animations.push(animation)
  return animation
}

export default {
  update,
  render,
  clear,
}
