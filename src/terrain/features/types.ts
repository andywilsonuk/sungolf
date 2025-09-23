import type { Layout } from '../layout'
import type { RandomGenerator } from '../../shared/random'
import type { Vec2 } from 'planck'

export interface PlotterPoint {
  x: number
  y: number
  relativeX: number
  relativeY: number
  startY: number
  previous: PlotterPoint | null
  next: PlotterPoint | null
  segment: TerrainFeature | null
  readonly isFirst: boolean
}

export interface TerrainFeature {
  readonly name: string
  readonly isSpecial?: boolean
  allowed: (point: PlotterPoint) => boolean
  apply: (layout: Layout, point: PlotterPoint, rand: RandomGenerator) => void
}

export interface SpecialObject {
  show?(position: Vec2): void
  hide?(): void
  disable?(): void
  enable?(offset: Vec2): void
  renderOnCanvas?(ctx: CanvasRenderingContext2D): void
}
