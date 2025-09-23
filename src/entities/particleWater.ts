import type { Vec2 } from 'planck-js'
import { addAnimation } from '../gameEngine/animator'
import { EasingAnimation, easeInCubic, easeOutCubic, linear } from '../gameEngine/easingAnimation'
import { circle, translateHeightPadding, physicsScaleInverse } from './canvasHelpers'
import { waterColor } from './constants'
import type { RandomGenerator } from '../shared/random'
import { randomGenerator, randomRange } from '../shared/random'
import type Hsl from '../shared/hsl'

const duration = 0.6 * 1000
const radius = 1.4
const rand: RandomGenerator = randomGenerator('particles')

export default class ParticleWater {
  private effectAnimX: EasingAnimation
  private effectAnimY: EasingAnimation
  private effectAnimFade: EasingAnimation
  private effectAnimGravity: EasingAnimation
  private effectAnimLightness: EasingAnimation
  private color: Hsl
  public next?: ParticleWater

  constructor(doneCallback: (particle: ParticleWater) => void) {
    this.effectAnimX = addAnimation(new EasingAnimation(easeOutCubic, duration, this.onDone.bind(this, doneCallback))) as EasingAnimation
    this.effectAnimY = addAnimation(new EasingAnimation(easeOutCubic, duration)) as EasingAnimation
    this.effectAnimFade = addAnimation(new EasingAnimation(easeInCubic, duration)) as EasingAnimation
    this.effectAnimGravity = addAnimation(new EasingAnimation(linear, duration)) as EasingAnimation
    this.effectAnimLightness = addAnimation(new EasingAnimation(linear, duration * 0.5)) as EasingAnimation
    this.color = waterColor.clone()
  }

  set(startPosition: Vec2, endPosition: Vec2, alpha: number): void {
    this.effectAnimX.start(startPosition.x * physicsScaleInverse, endPosition.x * physicsScaleInverse)
    this.effectAnimY.start(startPosition.y * physicsScaleInverse, endPosition.y * physicsScaleInverse)
    this.effectAnimFade.start(alpha, 0)
    this.effectAnimGravity.start(0, 30)
    this.effectAnimLightness.start(randomRange(rand, 15, 70), 50)
  }

  setNext(next: ParticleWater): void {
    this.next = next
  }

  render(ctx: CanvasRenderingContext2D): void {
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

  onDone(doneCallback: (particle: ParticleWater) => void): void {
    doneCallback(this)
  }
}
