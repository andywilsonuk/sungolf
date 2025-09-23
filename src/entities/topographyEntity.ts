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
  private waterEntity!: WaterEntity
  private terrainEntity!: TerrainEntity
  private flagEntity!: FlagEntity
  private teeEntity!: TeeEntity
  private paletteEntity!: PaletteEntity
  private sunEntity!: SunEntity
  private canvasElement!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private dirty = false

  spawn(): void {
    this.waterEntity = addEntity(new WaterEntity()) as WaterEntity
    this.terrainEntity = addEntity(new TerrainEntity()) as TerrainEntity
    this.flagEntity = addEntity(new FlagEntity()) as FlagEntity
    this.teeEntity = addEntity(new TeeEntity()) as TeeEntity
    this.paletteEntity = addEntity(new PaletteEntity()) as PaletteEntity
    this.sunEntity = addEntity(new SunEntity()) as SunEntity
  }

  init(): void {
    subscribeResize(this.onResize.bind(this))
  }

  onResize({ renderWidth, renderHeight }: { renderWidth: number, renderHeight: number }): void {
    const canvasElement = document.getElementById('topography')
    if (!canvasElement) {
      throw new Error('Canvas element with id "topography" not found')
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
    return this.waterEntity.dirty || this.terrainEntity.dirty || this.flagEntity.dirty || this.teeEntity.dirty
  }

  render(): void {
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
