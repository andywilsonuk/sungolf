import { PlotterPoint } from './plotterPoint'

export class Plotter {
  constructor (minimumY, maximumY, maximumYRelative) {
    this.points = []
    this.minimumY = minimumY
    this.maximumY = maximumY
    this.maximumYRelative = maximumYRelative
  }

  get first () {
    return this.points[0] ?? null
  }

  get last () {
    return this.points[this.points.length - 1] ?? null
  }

  get count () {
    return this.points.length
  }

  addAbsolutePoint (x, y) {
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

  addRelativePoint (dx, dy) {
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

  getByIndex (index) {
    return this.points[index]
  }

  getBySegment (segment) {
    return this.points.find(p => p.segment === segment)
  }

  getPoints () {
    return this.points.map(p => p.absolute)
  }

  availableYDistance (point, downwards) {
    const previousPointY = this.previous?.y ?? 0
    const nextPointY = this.next?.y ?? 0
    const deltaAdjacent = downwards && previousPointY - nextPointY < 0 ? this.relativeY : (this.next?.relativeY ?? 0)
    const pointRemainingY = Math.min(
      downwards ? this.maximumY - point.y : point.y - this.minimumY,
      this.maximumYRelative - Math.min(0, deltaAdjacent)
    )
    return pointRemainingY
  }
}
