import { addAnimation } from '../gameEngine/animator'
import { Animation, easeInCubic, easeOutCubic } from '../gameEngine/animation'
import { circle, translateHeightPadding, physicsScaleInverse } from './canvasHelpers'
import { getOneEntityByTag } from '../gameEngine/world'
import { terrainTag } from './constants'

const duration = 0.5 * 1000
const radius = 1

export default class ParticleTerrain {
  constructor (doneCallback) {
    this.effectAnimX = addAnimation(new Animation(easeOutCubic, duration, this.onDone.bind(this, doneCallback)))
    this.effectAnimY = addAnimation(new Animation(easeOutCubic, duration))
    this.effectAnimFade = addAnimation(new Animation(easeInCubic, duration))
    this.color = null
  }

  set (startPosition, endPosition, alpha) {
    this.effectAnimX.start(startPosition.x * physicsScaleInverse, endPosition.x * physicsScaleInverse)
    this.effectAnimY.start(startPosition.y * physicsScaleInverse, endPosition.y * physicsScaleInverse)
    this.effectAnimFade.start(alpha, 0)
    this.color = getOneEntityByTag(terrainTag).terrainColor
  }

  setNext (next) {
    this.next = next
  }

  render (ctx) {
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

  onDone (doneCallback) {
    doneCallback(this)
  }
}
