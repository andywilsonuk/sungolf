import { applyPixelScale, applyRatioScale, subscribeResize } from '../gameEngine/renderCanvas'
import { addEntity } from '../gameEngine/world'
import BallEntity from './ballEntity'

export default class DynamicsEntity {
  spawn () {
    this.ballEntity = addEntity(new BallEntity())
  }

  init () {
    subscribeResize(this.onResize.bind(this))
    this.terrainParticlesEntity = this.ballEntity.terrainParticles
    this.waterParticlesEntity = this.ballEntity.waterParticles
  }

  onResize ({ renderWidth, renderHeight }) {
    this.canvasElement = document.getElementById('dynamics')
    this.canvasElement.width = renderWidth
    this.canvasElement.height = renderHeight
    this.dirty = true
  }

  renderInitial () {
    this.ctx = this.canvasElement.getContext('2d')
  }

  get dirtyChildren () {
    return this.ballEntity.dirty || this.terrainParticlesEntity.dirty || this.waterParticlesEntity.dirty
  }

  render () {
    if (this.dirty || this.dirtyChildren) {
      this.dirty = false
      const { ctx } = this
      applyPixelScale(ctx)
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      applyRatioScale(ctx)
      this.ballEntity.renderOnCanvas(ctx)
      this.terrainParticlesEntity.renderOnCanvas(ctx)
      this.waterParticlesEntity.renderOnCanvas(ctx)
    }
  }
}
