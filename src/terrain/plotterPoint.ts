import type { TerrainFeature } from './features/types'

export class PlotterPoint {
  absolute: [number, number]
  relative: [number, number]
  previous: PlotterPoint | null
  next: PlotterPoint | null
  segment: TerrainFeature | null

  constructor(x: number, y: number) {
    this.absolute = [x, y]
    this.relative = [0, 0]
    this.previous = null
    this.next = null
    this.segment = null
  }

  get x(): number { return this.absolute[0] }

  get y(): number { return this.absolute[1] }

  get relativeX(): number { return this.relative[0] }

  get relativeY(): number { return this.relative[1] }

  get isFirst(): boolean { return this.previous === null }

  get startY(): number { return this.y + this.relativeY * -1 }

  recalcRelative(): void {
    const x = this.x - (this.previous?.x ?? 0)
    const y = this.y - (this.previous?.y ?? 0)
    this.relative[0] = x
    this.relative[1] = y
  }

  setByDelta(dx: number, dy: number): void {
    this.absolute[0] += dx
    this.absolute[1] += dy
    this.relative[0] += dx
    this.relative[1] += dy
  }

  set(x: number, y: number): void {
    this.absolute[0] = x
    this.absolute[1] = y
  }

  shiftByDelta(dx: number, dy: number): void {
    this.setByDelta(dx, dy)

    let tail = this.next
    while (tail !== null) {
      tail.absolute[0] += dx
      tail.absolute[1] += dy
      tail = tail.next
    }
  }

  setSegment(segment: TerrainFeature): void {
    this.segment = segment
  }
}
