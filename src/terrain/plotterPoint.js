export class PlotterPoint {
  constructor (x, y) {
    this.absolute = [x, y]
    this.relative = [0, 0]
    this.previous = null
    this.next = null
    this.segment = null
  }

  get x () { return this.absolute[0] }

  get y () { return this.absolute[1] }

  get relativeX () { return this.relative[0] }

  get relativeY () { return this.relative[1] }

  get isFirst () { return this.previous === null }

  get startY () { return this.y + this.relativeY * -1 }

  recalcRelative () {
    const x = this.x - (this.previous?.x ?? 0)
    const y = this.y - (this.previous?.y ?? 0)
    this.relative[0] = x
    this.relative[1] = y
  }

  setByDelta (dx, dy) {
    this.absolute[0] += dx
    this.absolute[1] += dy
    this.relative[0] += dx
    this.relative[1] += dy
  }

  set (x, y) {
    this.absolute[0] = x
    this.absolute[1] = y
  }

  shiftByDelta (dx, dy) {
    this.setByDelta(dx, dy)

    let tail = this.next
    while (tail !== null) {
      tail.absolute[0] += dx
      tail.absolute[1] += dy
      tail = tail.next
    }
  }

  setSegment (segment) {
    this.segment = segment
  }
}
