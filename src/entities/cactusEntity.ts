import type { Body, Vec2 } from 'planck-js'
import { Circle, Vec2 as Vec2Constructor } from 'planck-js'
import { createBody, physicsScale } from '../gameEngine/physics'
import Hsl from '../shared/hsl'
import { specialWidth } from '../terrain/constants'
import { cactusName } from '../terrain/features/names'
import { translatePhysics } from './canvasHelpers'
import { objectCategory } from './constants'

const path = new window.Path2D('m-3.5935 14.405c0.67236-3.4767 0.56428-5.1322 0.67741-7.3042-0.72791-1.2333-1.4558-1.8016-2.1838-2.0333-0.57472-0.22591-1.6131-0.45183-2.7861-0.67775-1.3646-0.51682-1.801-1.9427-1.9578-3.3134-0.0441-4.2608-0.38689-8.8206 2.0333-10.618 1.5451-0.65931 1.9709 0.0245 2.4849 0.60241 0 0 0.45181 4.0662 0.37652 4.443-0.0753 0.37653 0 3.8403 0 3.8403 0.93603 1.7612 1.1373 0.58318 1.506 0.0753 0.10506-5.3187 0.35434-11.701 1.4307-12.425 0.20667-1.677 4.0436-4.2406 5.6476 2.7109l-0.30121 6.8523c0.66849 1.5674 1.4713 0.70308 1.9578 0.37653 0 0-0.0753-5.4218 0.22591-6.8524 0.3012-1.4307 1.2801-1.7319 1.2801-1.7319s2.1084-1.2048 2.4096 2.1837c1.1328 5.2231 1.5422 11.432-3.238 11.521-0.53873 0.35215-2.2849 0.63406-2.1084 3.7652 2e-3 0.0294-0.14264 8.3173-0.753 9.3375-0.47325 0.79096-7.6442 1.2011-6.7018-0.75301z')
const fixtureOptions = {
  friction: 0.05,
  filterCategoryBits: objectCategory
}
const hitBoxSize = 12 * physicsScale
const offset = Vec2Constructor(specialWidth * physicsScale * -0.5, -0.15)
const colorString = new Hsl(139, 89, 38).asString()

export default class CactusEntity {
  private path!: Path2D
  private body!: Body
  private visible = false
  private position: Vec2 | null = null

  get name(): string { return cactusName }

  init(): void {
    this.path = new window.Path2D(path)
    const body = createBody({
      active: false
    })
    body.createFixture(Circle(hitBoxSize), fixtureOptions)
    this.body = body
    this.visible = false
    this.position = null
  }

  show(position: Vec2): void {
    if (this.visible) { return }
    this.visible = true
    this.position = position.add(offset)
  }

  hide(): void {
    if (!this.visible) { return }
    this.visible = false
    this.disable()
  }

  enable(terrainOffset: Vec2): void {
    if (!this.position) return
    this.body.setPosition(this.position.add(terrainOffset))
    this.body.setActive(true)
  }

  disable(): void {
    this.body.setActive(false)
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    if (!this.position) return
    
    ctx.save()

    const { x, y } = this.position
    translatePhysics(ctx, x, y)

    ctx.fillStyle = colorString
    ctx.fill(this.path)

    ctx.restore()
  }
}