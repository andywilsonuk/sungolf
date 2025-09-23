import { applyPixelScale, applyRatioScale, subscribeResize } from '../gameEngine/renderCanvas'
import { addEntity } from '../gameEngine/world'
import BallEntity from './ballEntity'
import type ParticleSystem from './particleSystem'

export default class DynamicsEntity {
  private ballEntity!: BallEntity
  private terrainParticlesEntity!: ParticleSystem
  private waterParticlesEntity!: ParticleSystem
  private canvasElement!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private dirty = false

  spawn(): void {
    this.ballEntity = addEntity(new BallEntity()) as BallEntity
  }

  init(): void {
    subscribeResize(this.onResize.bind(this))
    this.terrainParticlesEntity = this.ballEntity.terrainParticles
    this.waterParticlesEntity = this.ballEntity.waterParticles
  }

  onResize({ renderWidth, renderHeight }: { renderWidth: number, renderHeight: number }): void {
    const canvasElement = document.getElementById('dynamics')
    if (!canvasElement) {
      throw new Error('Canvas element with id "dynamics" not found')
    }
    this.canvasElement = canvasElement as HTMLCanvasElement
    this.canvasElement.width = renderWidth
    this.canvasElement.height = renderHeight
    this.dirty = true
  }

  renderInitial(): void {
    const ctx = this.canvasElement.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2d context from canvas')
    }
    this.ctx = ctx
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
