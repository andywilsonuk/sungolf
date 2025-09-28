import { getOneEntityByTag } from '../gameEngine/world'
import { subscribeResize } from '../gameEngine/renderCanvas'
import { stageReadySignal, terrainTag } from './constants'
import type { TerrainEntityColor } from './terrainEntity'
import { subscribe } from '../gameEngine/signalling'

export default class HorizonEntity {
  public dirty = true
  private width: number | null = null
  private element!: HTMLElement
  private terrain: TerrainEntityColor | null = null

  init(): void {
    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, this.stageReady.bind(this))
    this.terrain = (getOneEntityByTag(terrainTag) as TerrainEntityColor)
  }

  onResize({ gameAreaWidth }: { gameAreaWidth: number }): void {
    this.width = gameAreaWidth
    this.dirty = true
  }

  renderInitial(): void {
    const element = document.getElementById('horizon')
    if (!element) {
      throw new Error('Background element not found')
    }
    this.element = element
  }

  render(): void {
    if (!this.dirty) { return }
    if (this.terrain === null) { throw new Error('Terrain not set') }
    if (this.terrain.terrainColor === null) { throw new Error('Terrain not set') }

    const color = this.terrain.terrainColor.asString()

    this.element.style.width = `calc(100vw - ${this.width ?? 0}px + 4vw)`
    this.element.style.backgroundColor = color

    this.dirty = false
  }

  stageReady(): void {
    this.dirty = true
  }
}
