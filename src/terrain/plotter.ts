import { PlotterPoint } from './plotterPoint'
import type { TerrainFeature } from './features/types'

export class Plotter {
  points: PlotterPoint[]
  minimumY: number
  maximumY: number
  maximumYRelative: number

  constructor(minimumY: number, maximumY: number, maximumYRelative: number) {
    this.points = []
    this.minimumY = minimumY
    this.maximumY = maximumY
    this.maximumYRelative = maximumYRelative
  }

  get first(): PlotterPoint | null {
    return this.points[0] ?? null
  }

  get last(): PlotterPoint | null {
    return this.points[this.points.length - 1] ?? null
  }

  get count(): number {
    return this.points.length
  }

  addAbsolutePoint(x: number, y: number): PlotterPoint {
    const point = new PlotterPoint(x, y)
    const last = this.last
    point.previous = last
    this.points.push(point)
    if (last !== null) {
      last.next = point
    }
    point.recalcRelative()
    return point
  }

  addRelativePoint(dx: number, dy: number): PlotterPoint {
    const previous = this.last
    if (previous === null) { throw new Error('No points') }
    const x = previous.x + dx
    const y = previous.y + dy
    const point = new PlotterPoint(x, y)
    this.points.push(point)
    point.previous = previous
    previous.next = point
    point.recalcRelative()
    return point
  }

  getByIndex(index: number): PlotterPoint {
    return this.points[index]
  }

  getBySegment(segment: TerrainFeature): PlotterPoint | undefined {
    return this.points.find((p) => p.segment === segment)
  }

  getPoints(): [number, number][] {
    return this.points.map((p) => p.absolute)
  }

  availableYDistance(point: PlotterPoint, downwards: boolean): number {
    const previousPointY = point.previous?.y ?? 0
    const nextPointY = point.next?.y ?? 0
    const deltaAdjacent = downwards && previousPointY - nextPointY < 0 ? point.relativeY : (point.next?.relativeY ?? 0)
    const pointRemainingY = Math.min(
      downwards ? this.maximumY - point.y : point.y - this.minimumY,
      this.maximumYRelative - Math.min(0, deltaAdjacent),
    )
    return pointRemainingY
  }

  ensureMinimum(): void {
    const minX = this.points.reduce((acc, p) => Math.min(acc, p.x), Number.MAX_SAFE_INTEGER)
    const xAdjust = Math.max(0, 0 - minX)
    for (const p of this.points) {
      p.set(p.x + xAdjust, p.y)
    }
    for (const p of this.points) {
      p.recalcRelative()
    }
    const minY = this.points.reduce((acc, p) => Math.min(acc, p.y), Number.MAX_SAFE_INTEGER)
    const yAdjust = Math.max(0, this.minimumY - minY)
    for (const p of this.points) {
      p.set(p.x, p.y + yAdjust)
    }
    for (const p of this.points) {
      p.recalcRelative()
    }
  }

  clampVertical(): void {
    for (const p of this.points) {
      const absoluteY = Math.min(this.maximumY, Math.max(this.minimumY, p.y))
      p.set(p.x, absoluteY)
    }
    for (const p of this.points) {
      p.recalcRelative()
    }
  }

  cleanUp(): void {
    this.ensureMinimum()
    this.clampVertical()
  }
}
