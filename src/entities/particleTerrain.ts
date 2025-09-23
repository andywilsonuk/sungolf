import type { Vec2 } from 'planck'
import { addAnimation } from '../gameEngine/animator'
import { EasingAnimation, easeInCubic, easeOutCubic } from '../gameEngine/easingAnimation'
import { circle, translateHeightPadding, physicsScaleInverse } from './canvasHelpers'
import { getOneEntityByTag } from '../gameEngine/world'
import { terrainTag } from './constants'
import type Hsl from '../shared/hsl'
import type { TerrainEntityColor } from './terrainEntity'

const duration = 0.5 * 1000
const radius = 1

export default class ParticleTerrain {
  private effectAnimX: EasingAnimation
  private effectAnimY: EasingAnimation
  private effectAnimFade: EasingAnimation
  private color: Hsl | null = null
  public next?: ParticleTerrain

  constructor(doneCallback: (particle: ParticleTerrain) => void) {
    this.effectAnimX = addAnimation(new EasingAnimation(easeOutCubic, duration, this.onDone.bind(this, doneCallback))) as EasingAnimation
    this.effectAnimY = addAnimation(new EasingAnimation(easeOutCubic, duration)) as EasingAnimation
    this.effectAnimFade = addAnimation(new EasingAnimation(easeInCubic, duration)) as EasingAnimation
    this.color = null
  }

  set(startPosition: Vec2, endPosition: Vec2, alpha: number): void {
    this.effectAnimX.start(startPosition.x * physicsScaleInverse, endPosition.x * physicsScaleInverse)
    this.effectAnimY.start(startPosition.y * physicsScaleInverse, endPosition.y * physicsScaleInverse)
    this.effectAnimFade.start(alpha, 0)
    const entity = getOneEntityByTag(terrainTag) as TerrainEntityColor | null
    if (entity != null) {
      this.color = entity.terrainColor
    }
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
