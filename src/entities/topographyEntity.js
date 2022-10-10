import TerrainEntity from './terrainEntity'
import FlagEntity from './flagEntity'
import { addEntity } from '../gameEngine/world'
import TeeEntity from './teeEntity'
import { applyPixelScale, applyRatioScale, subscribeResize } from '../gameEngine/renderCanvas'
import WaterEntity from './waterEntity'
import PaletteEntity from './paletteEntity'
import { translateHeightPadding } from './canvasHelpers'
import SunEntity from './sunEntity'

export default class TopographyEntity {
  spawn () {
    this.waterEntity = addEntity(new WaterEntity())
    this.terrainEntity = addEntity(new TerrainEntity())
    this.flagEntity = addEntity(new FlagEntity())
    this.teeEntity = addEntity(new TeeEntity())
    this.paletteEntity = addEntity(new PaletteEntity())
    this.sunEntity = addEntity(new SunEntity())
  }

  init () {
    subscribeResize(this.onResize.bind(this))
  }

  onResize ({ renderWidth, renderHeight }) {
    this.canvasElement = document.getElementById('topography')
    this.canvasElement.width = renderWidth
    this.canvasElement.height = renderHeight
    this.dirty = true
  }

  renderInitial () {
    this.ctx = this.canvasElement.getContext('2d')
  }

  get dirtyChildren () {
    return this.waterEntity.dirty || this.terrainEntity.dirty || this.flagEntity.dirty || this.teeEntity.dirty
  }

  render () {
    if (this.dirty || this.dirtyChildren) {
      this.dirty = false
      const { ctx } = this
      applyPixelScale(ctx)
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      applyRatioScale(ctx)
      this.paletteEntity.renderOnCanvas(ctx)
      this.waterEntity.renderOnCanvas(ctx)
      this.sunEntity.renderOnCanvas(ctx)

      translateHeightPadding(ctx)
      this.terrainEntity.renderOnCanvas(ctx)
      this.teeEntity.renderOnCanvas(ctx)
      this.flagEntity.renderOnCanvas(ctx)
    }
  }
}
