import { addAnimation } from '../gameEngine/animator'
import { Animation, easeInCubic, easeOutCubic, linear } from '../gameEngine/animation'
import { circle, translateHeightPadding, physicsScaleInverse } from './canvasHelpers'
import { waterColor } from './constants'
import { randomGenerator, randomRange } from '../shared/random'

const duration = 0.6 * 1000
const radius = 1.4
const rand = randomGenerator('particles')

export default class ParticleWater {
  constructor (doneCallback) {
    this.effectAnimX = addAnimation(new Animation(easeOutCubic, duration, this.onDone.bind(this, doneCallback)))
    this.effectAnimY = addAnimation(new Animation(easeOutCubic, duration))
    this.effectAnimFade = addAnimation(new Animation(easeInCubic, duration))
    this.effectAnimGravity = addAnimation(new Animation(linear, duration))
    this.effectAnimLightness = addAnimation(new Animation(linear, duration * 0.5))
    this.color = waterColor.clone()
  }

  set (startPosition, endPosition, alpha) {
    this.effectAnimX.start(startPosition.x * physicsScaleInverse, endPosition.x * physicsScaleInverse)
    this.effectAnimY.start(startPosition.y * physicsScaleInverse, endPosition.y * physicsScaleInverse)
    this.effectAnimFade.start(alpha, 0)
    this.effectAnimGravity.start(0, 30)
    this.effectAnimLightness.start(randomRange(rand, 15, 70), 50)
  }

  setNext (next) {
    this.next = next
  }

  render (ctx) {
    const x = this.effectAnimX.current + radius * 0.5
    const y = this.effectAnimY.current + radius * 0.5 + this.effectAnimGravity.current
    const alpha = this.effectAnimFade.current

    ctx.save()
    translateHeightPadding(ctx)
    circle(ctx, radius, x, y)
    this.color.setLightness(this.effectAnimLightness.current)
    ctx.fillStyle = waterColor.asString(alpha)
    ctx.fill()
    ctx.restore()
  }

  onDone (doneCallback) {
    doneCallback(this)
  }
}
