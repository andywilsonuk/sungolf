let lastDeltaTime = 0
let interpolation = 0
const animations = []

const render = (interpolationPercentage) => {
  interpolation = interpolationPercentage
}

const update = (deltaTime) => {
  for (let i = 0; i < animations.length; i++) {
    const animation = animations[i]
    animation.update(deltaTime)
  }
  lastDeltaTime = deltaTime
}

const clear = () => {
  animations.length = 0
}

export const interpolationCurrent = () => interpolation * lastDeltaTime
export const addAnimation = (animation) => {
  animations.push(animation)
  return animation
}

export default {
  update,
  render,
  clear
}
