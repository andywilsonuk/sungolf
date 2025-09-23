export interface AnimationUpdate {
  update(deltaTime: number): void
}

let lastDeltaTime = 0
let interpolation = 0
const animations: AnimationUpdate[] = []

const render = (interpolationPercentage: number): void => {
  interpolation = interpolationPercentage
}

const update = (deltaTime: number): void => {
  for (const animation of animations) {
    animation.update(deltaTime)
  }
  lastDeltaTime = deltaTime
}

const clear = (): void => {
  animations.length = 0
}

export const interpolationCurrent = (): number => interpolation * lastDeltaTime
export const addAnimation = (animation: AnimationUpdate): AnimationUpdate => {
  animations.push(animation)
  return animation
}

export default {
  update,
  render,
  clear,
}
