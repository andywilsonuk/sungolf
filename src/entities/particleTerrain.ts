import type { Vec2 } from 'planck-js'
import type { Animation } from '../gameEngine/animation'
import { addAnimation } from '../gameEngine/animator'
import { Animation as AnimationClass, easeInCubic, easeOutCubic } from '../gameEngine/animation'
import { circle, translateHeightPadding, physicsScaleInverse } from './canvasHelpers'
import { getOneEntityByTag } from '../gameEngine/world'
import { terrainTag } from './constants'
import type Hsl from '../shared/hsl'

const duration = 0.5 * 1000
const radius = 1

export default class ParticleTerrain {
  private effectAnimX: Animation
  private effectAnimY: Animation
  private effectAnimFade: Animation
  private color: Hsl | null = null
  public next?: ParticleTerrain

  constructor(doneCallback: (particle: ParticleTerrain) => void) {
    this.effectAnimX = addAnimation(new AnimationClass(easeOutCubic, duration, this.onDone.bind(this, doneCallback)))
    this.effectAnimY = addAnimation(new AnimationClass(easeOutCubic, duration))
    this.effectAnimFade = addAnimation(new AnimationClass(easeInCubic, duration))
    this.color = null
  }

  set(startPosition: Vec2, endPosition: Vec2, alpha: number): void {
    this.effectAnimX.start(startPosition.x * physicsScaleInverse, endPosition.x * physicsScaleInverse)
    this.effectAnimY.start(startPosition.y * physicsScaleInverse, endPosition.y * physicsScaleInverse)
    this.effectAnimFade.start(alpha, 0)
    this.color = getOneEntityByTag(terrainTag).terrainColor
  }

  setNext(next: ParticleTerrain): void {
    this.next = next
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.color) return
    
    const x = this.effectAnimX.current + radius * 0.5
    const y = this.effectAnimY.current + radius * 0.5
    const alpha = this.effectAnimFade.current

    ctx.save()
    translateHeightPadding(ctx)
    circle(ctx, radius, x, y)
    ctx.fillStyle = this.color.asString(alpha)
    ctx.fill()
    ctx.restore()
  }

  onDone(doneCallback: (particle: ParticleTerrain) => void): void {
    doneCallback(this)
  }
}