import { Polygon, Vec2 } from 'planck-js'
import { createBody, physicsScale } from '../gameEngine/physics'
import { subscribeResize } from '../gameEngine/renderCanvas'
import { subscribe } from '../gameEngine/signalling'
import orchestration from '../orchestration'
import { updateBoxFixtureVertices } from '../shared/planckHelpers'
import { absoluteFloorDepth } from '../terrain/constants'
import { scalePhysics, translateHeightPadding } from './canvasHelpers'
import { stageReadySignal, waterCategory, waterColor } from './constants'

const colorString = waterColor.asString()
const visibleOffset = 12 * physicsScale
const boundaryThickness = 50 * physicsScale

const createBoundaryBox = (body) =>
  body.createFixture(Polygon([Vec2.zero(), Vec2.zero(), Vec2.zero(), Vec2.zero()]), {
    isSensor: true,
    filterCategoryBits: waterCategory
  })

export default class WaterEntity {
  constructor () {
    this.visible = false
    this.width = null
    this.y = null
    this.dirty = false
  }

  init () {
    this.waterBody = createBody({ active: false })
    this.waterBoundary = createBoundaryBox(this.waterBody)

    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, this.stageReady.bind(this))
  }

  onResize ({ width }) {
    this.width = width * physicsScale
    this.y = absoluteFloorDepth * physicsScale - visibleOffset
    updateBoxFixtureVertices(this.waterBoundary, this.width, boundaryThickness, 0, this.y)
  }

  stageReady ({ stageId }) {
    this.visible = orchestration(stageId - 1).water || orchestration(stageId).water || orchestration(stageId + 1).water
    this.waterBody.setActive(this.visible)
    this.dirty = true
  }

  renderOnCanvas (ctx) {
    this.dirty = false
    if (!this.visible) { return }

    ctx.save()
    translateHeightPadding(ctx)
    scalePhysics(ctx)
    ctx.fillStyle = colorString
    ctx.fillRect(0, this.y, this.width, boundaryThickness)
    ctx.restore()
  }
}
