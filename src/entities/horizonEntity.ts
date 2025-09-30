import { getOneEntityByTag } from '../gameEngine/world'
import { subscribeResize, type ResizePayload } from '../gameEngine/renderCanvas'
import { stageReadySignal, terrainTag } from './constants'
import type { TerrainEntityColor } from './terrainEntity'
import { subscribe } from '../gameEngine/signalling'
import type { StageReadyPayload } from '../types/stageReady'

export default class HorizonEntity {
  public dirty = true
  private width: number | null = null
  private height: number | null = null
  private horizonElement!: HTMLElement
  private horizonBlurElement!: HTMLElement
  private terrain: TerrainEntityColor | null = null

  init(): void {
    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [StageReadyPayload]
      this.stageReady(payload)
    })
    this.terrain = (getOneEntityByTag(terrainTag) as TerrainEntityColor)
  }

  onResize({ gameAreaWidth, gameAreaHeight }: ResizePayload): void {
    this.width = gameAreaWidth
    this.height = gameAreaHeight
    this.dirty = true
  }

  renderInitial(): void {
    const horizonElement = document.getElementById('horizon')
    const horizonBlurElement = document.getElementById('horizonBlur')
    if (!horizonElement || !horizonBlurElement) {
      throw new Error('Background element not found')
    }
    this.horizonElement = horizonElement
    this.horizonBlurElement = horizonBlurElement
  }

  render(): void {
    if (!this.dirty) { return }
    if (this.terrain === null) { throw new Error('Terrain not set') }
    if (this.terrain.terrainColor === null) { throw new Error('Terrain not set') }

    const color = this.terrain.terrainColor.asString()

    this.horizonElement.style.width = `calc(100vw - ${this.width ?? 0}px + 4vw)`
    this.horizonElement.style.height = `${this.height}px`
    this.horizonBlurElement.style.backgroundColor = color

    this.dirty = false
  }

  stageReady(_payload: StageReadyPayload): void {
    this.dirty = true
  }
}
