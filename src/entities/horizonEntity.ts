import { getOneEntityByTag } from "../gameEngine/world"
import { subscribeResize, type ResizePayload } from "../gameEngine/renderCanvas"
import { stageReadySignal, terrainTag } from "./constants"
import type { TerrainEntityColor } from "./terrainEntity"
import { subscribe } from "../gameEngine/signalling"
import type { StageReadyPayload } from "../types/stageReady"
import { clamp } from "../shared/utils"

export default class HorizonEntity {
  public dirty = true
  private width: number | null = null
  private height: number | null = null
  private expandedWidth: number | null = null
  private horizonElement!: HTMLElement
  private horizonBlurElement!: HTMLElement
  private terrain: TerrainEntityColor | null = null

  init(): void {
    subscribeResize(this.onResize.bind(this))
    subscribe(stageReadySignal, (...args: unknown[]) => {
      const [payload] = args as [StageReadyPayload]
      this.stageReady(payload)
    })
    this.terrain = getOneEntityByTag(terrainTag) as TerrainEntityColor
  }

  onResize({ gameAreaWidth, gameAreaHeight, width }: ResizePayload): void {
    this.width = gameAreaWidth
    this.height = gameAreaHeight
    this.expandedWidth = width
    this.dirty = true
  }

  renderInitial(): void {
    const horizonElement = document.getElementById("horizon")
    const horizonBlurElement = document.getElementById("horizonBlur")
    if (!horizonElement || !horizonBlurElement) {
      throw new Error("Background element not found")
    }
    this.horizonElement = horizonElement
    this.horizonBlurElement = horizonBlurElement
  }

  render(): void {
    if (!this.dirty) {
      return
    }
    if (this.width === null) {
      return
    }
    if (this.expandedWidth === null) {
      return
    }
    if (this.terrain === null) {
      throw new Error("Terrain not set")
    }
    if (this.terrain.terrainColor === null) {
      throw new Error("Terrain not set")
    }

    const color = this.terrain.terrainColor.asString()

    // Thresholds based on expandedWidth (not gameAreaWidth)
    const blurStartThreshold = 1300 // No blur below this
    const blurFullThreshold = 1580 // Full blur (20vw) at this point
    const minBlurVw = 6
    const maxBlurVw = 20
    const curveExponent = 2

    const isBlurredHorizon = this.expandedWidth > blurStartThreshold
    const progress = clamp(0, 1, (this.expandedWidth - blurStartThreshold) / (blurFullThreshold - blurStartThreshold))
    const clampedWidth = minBlurVw + (maxBlurVw - minBlurVw) * progress ** curveExponent

    this.horizonElement.style.display = isBlurredHorizon ? "block" : "none"
    this.horizonElement.style.left = `calc(${this.width ?? 0}px - ${clampedWidth}vw)`
    this.horizonElement.style.height = `${this.height}px`
    this.horizonBlurElement.style.backgroundColor = color

    this.dirty = false
  }

  stageReady(_payload: StageReadyPayload): void {
    this.dirty = true
  }
}
