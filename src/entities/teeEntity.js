import { Box, Vec2 } from 'planck-js'
import { createBody, physicsScale } from '../gameEngine/physics'
import { subscribe } from '../gameEngine/signalling'
import Hsl from '../shared/hsl'
import { holeDepth, holeTotalWidth } from '../terrain/constants'
import { translatePhysics } from './canvasHelpers'
import { stageCompleteSignal, stageReadySignal, stageTransitioningSignal, terrainCategory } from './constants'

const colorString = new Hsl(0, 0, 67).asString()
const teeWidth = holeTotalWidth * 0.5 * physicsScale
const teeHeight = holeDepth * 0.5 * physicsScale
const teeDepth = 6

export default class TeeEntity {
  constructor () {
    this.position = null
    this.visible = false
    this.dirty = false
  }

  init () {
    this.teeBody = createBody({
      active: false
    })
    this.teeBody.createFixture(Box(teeWidth, teeHeight, Vec2(teeWidth, teeHeight)), {
      friction: 1,
      filterCategoryBits: terrainCategory
    })
    subscribe(stageReadySignal, this.start.bind(this))
    subscribe(stageCompleteSignal, this.stop.bind(this))
    subscribe(stageTransitioningSignal, this.hide.bind(this))
  }

  renderOnCanvas (ctx) {
    this.dirty = false
    if (!this.visible) { return }

    const { x, y } = this.teeBody.getPosition()
    ctx.save()
    translatePhysics(ctx, x, y)
    ctx.fillStyle = colorString
    ctx.fillRect(0, 0, holeTotalWidth, teeDepth)
    ctx.restore()
  }

  start ({ startPosition }) {
    this.teeBody.setPosition(startPosition)
    this.teeBody.setActive(true)
    this.visible = true
    this.dirty = true
  }

  stop () {
    this.teeBody.setActive(false)
  }

  hide () {
    this.visible = false
    this.dirty = true
  }
}
