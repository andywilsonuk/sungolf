import { applyPixelScale, applyRatioScale, subscribeResize } from '../gameEngine/renderCanvas'
import { addEntity } from '../gameEngine/world'
import BallEntity from './ballEntity'

export default class DynamicsEntity {
  private ballEntity!: BallEntity
  private terrainParticlesEntity: any
  private waterParticlesEntity: any
  private canvasElement!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private dirty = false

  spawn(): void {
    this.ballEntity = addEntity(new BallEntity())
  }

  init(): void {
    subscribeResize(this.onResize.bind(this))
    this.terrainParticlesEntity = this.ballEntity.terrainParticles
    this.waterParticlesEntity = this.ballEntity.waterParticles
  }

  onResize({ renderWidth, renderHeight }: { renderWidth: number; renderHeight: number }): void {
    this.canvasElement = document.getElementById('dynamics')! as HTMLCanvasElement
    this.canvasElement.width = renderWidth
    this.canvasElement.height = renderHeight
    this.dirty = true
  }

  renderInitial(): void {
    this.ctx = this.canvasElement.getContext('2d')!
  }

  get dirtyChildren(): boolean {
    return this.ballEntity.dirty || this.terrainParticlesEntity.dirty || this.waterParticlesEntity.dirty
  }

  render(): void {
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