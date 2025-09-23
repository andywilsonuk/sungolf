import type { Body, Vec2 } from 'planck-js'
import { Circle, Vec2 as Vec2Constructor } from 'planck-js'
import { createBody, physicsScale } from '../gameEngine/physics'
import Hsl from '../shared/hsl'
import { specialWidth } from '../terrain/constants'
import { skullName } from '../terrain/features/names'
import { circle, translatePhysics } from './canvasHelpers'
import { objectCategory } from './constants'

const path = new window.Path2D('m-6.4454 12.348c-1.2523-0.25377-3.218-0.69907-3.0512-2.3355-0.071312-1.0182 0.28445-2.9666 1.7182-2.3565 1.2397 0.27123 2.4694 0.91295 3.7697 0.6403 0.63617-1.3306-0.8502-2.4794-2.0085-2.8061-1.4076-0.13461-2.5932-1.4175-2.0446-2.7612-0.55099-1.0069-2.46-1.6354-1.6086-3.0518 0.61384-1.5629 0.63194-3.2793 1.2074-4.8469 1.2889-2.8581 3.4857-5.4585 6.4814-6.6415 2.5634-0.99437 5.7598-0.74077 7.8617 1.1259 1.5866 1.2335 3.0545 2.7432 3.8859 4.5765 0.35983 1.8895-0.18849 3.7914-0.45703 5.6572-0.35167 1.8135-0.75969 3.7681-2.1681 5.0926-0.52253 0.70978-1.7305 1.8415-2.3279 0.74201-0.85903 0.67183-0.85131 1.9712-1.1162 2.9613-0.02889 1.5131-1.4922 1.9389-2.6392 2.4973-1.1164 0.68105-2.276 1.4018-3.6399 1.4056-1.2656 0.06761-2.5759 0.02738-3.814 0.13506zm2.6026-9.0791c0.3779-1.5741-0.9459-2.9086-0.88591-4.469-0.12609-1.3013-0.11644-2.9841-1.4683-3.6781-1.0585-0.85213-2.6527 0.23012-2.4878 1.5021 0.2677 1.0929-0.25529 2.5059 0.71984 3.3429 1.1476 0.65086 2.5996 0.02467 3.7373 0.67272 0.7331 1.0245-1.4506 0.73104-2.0489 1.0269-1.541 1.2635 1.144 2.4499 2.2588 1.6842l0.175-0.081838zm4.8385-1.8525c1.5831-0.49905 2.2865-2.9211 0.87358-3.9752-0.893-0.72011-2.1571-1.6036-3.3287-0.98478-0.94773 0.77177-0.61278 2.1753-0.71435 3.2474-0.026451 1.5305 1.9428 2.0537 3.1695 1.7126z')
const fixtureOptions = {
  friction: 0.05,
  filterCategoryBits: objectCategory
}
const hitBoxSize = 12 * physicsScale
const offset = Vec2Constructor(specialWidth * physicsScale * -0.5, -0.1)
const backgroundColorString = new Hsl(0, 0, 20).asString()
const foregroundColorString = new Hsl(21, 20, 86).asString()

export default class SkullEntity {
  private path!: Path2D
  private body!: Body
  private visible = false
  private position: Vec2 | null = null

  get name(): string { return skullName }

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

    circle(ctx, 8, -1, -1)
    ctx.fillStyle = backgroundColorString
    ctx.fill()
    ctx.fillStyle = foregroundColorString
    ctx.fill(this.path)

    ctx.restore()
  }
}