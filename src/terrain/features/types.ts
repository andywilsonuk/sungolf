import type { Layout } from '../layout'

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
  apply: (layout: Layout, point: PlotterPoint, rand: () => number) => void
}