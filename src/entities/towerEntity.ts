import type { Body, Vec2 } from 'planck'
import { Polygon as PolygonCtor, Vec2 as Vec2Ctor } from 'planck'
import { createBody, physicsScale } from '../gameEngine/physics'
import Hsl from '../shared/hsl'
import { specialWidth } from '../terrain/constants'
import { towerName } from '../terrain/features/names'
import { translatePhysics } from './canvasHelpers'
import { objectCategory } from './constants'
import type { SpecialObject } from '@/terrain/features/types'

const path = new window.Path2D('m-13 1l6 0l0 10l14 0l0 -10l6 0l-13 -20z')
const points = [[-13, 1], [-7, 1], [-7, 11], [7, 11], [7, 1], [13, 1], [0, -19]]
const fixtureOptions = {
  friction: 0.05,
  filterCategoryBits: objectCategory,
}
const offset = new Vec2Ctor(specialWidth * physicsScale * -0.5, -0.2)
const colorString = new Hsl(10, 53, 28).asString()

export default class TowerEntity implements SpecialObject {
  private path!: Path2D
  private body!: Body
  private visible = false
  private position: Vec2 | null = null

  get name(): string { return towerName }

  init(): void {
    this.path = new window.Path2D(path)
    const body = createBody({
      active: false,
    })
    const scaledPoints = points.map((p) => new Vec2Ctor(p[0], p[1]).mul(physicsScale))
    body.createFixture(new PolygonCtor(scaledPoints), fixtureOptions)
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
    translatePhysics(ctx, x - 0.5, y)

    ctx.fillStyle = colorString
    ctx.fill(this.path)

    ctx.restore()
  }
}
