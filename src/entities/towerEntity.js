import { Polygon, Vec2 } from 'planck-js'
import { createBody, physicsScale } from '../gameEngine/physics'
import Hsl from '../shared/hsl'
import { specialWidth } from '../terrain/constants'
import { towerName } from '../terrain/features/names'
import { translatePhysics } from './canvasHelpers'
import { objectCategory } from './constants'

const path = new window.Path2D('m-13 1l6 0l0 10l14 0l0 -10l6 0l-13 -20z')
const points = [[-13, 1], [-7, 1], [-7, 11], [7, 11], [7, 1], [13, 1], [0, -19]]
const fixtureOptions = {
  friction: 0.05,
  filterCategoryBits: objectCategory
}
const offset = Vec2(specialWidth * physicsScale * -0.5, -0.2)
const colorString = new Hsl(10, 53, 28).asString()

export default class TowerEntity {
  get name () { return towerName }

  init () {
    this.path = new window.Path2D(path)
    const body = createBody({
      active: false
    })
    const scaledPoints = points.map(p => Vec2(p[0], p[1]).mul(physicsScale))
    body.createFixture(Polygon(scaledPoints), fixtureOptions)
    this.body = body
    this.visible = false
    this.position = null
  }

  show (position) {
    if (this.visible) { return }
    this.visible = true
    this.position = position.add(offset)
  }

  hide () {
    if (!this.visible) { return }
    this.visible = false
    this.disable()
  }

  enable (terrainOffset) {
    this.body.setPosition(Vec2.add(this.position, terrainOffset))
    this.body.setActive(true)
  }

  disable () {
    this.body.setActive(false)
  }

  renderOnCanvas (ctx) {
    ctx.save()

    const { x, y } = this.position
    translatePhysics(ctx, x, y)

    ctx.fillStyle = colorString
    ctx.fill(this.path)

    ctx.restore()
  }
}
