import { absoluteFloorDepth } from './constants'

export class Layout {
  constructor (initialDepth) {
    this.commands = []
    this.initialDepth = initialDepth
    this.add(`M0 ${initialDepth}`, 0, initialDepth)
  }

  line (distance, depth) {
    const x = this.currentDistance + distance
    const y = this.currentDepth + depth
    this.add(`L${x} ${y}`, x, y)
  }

  cubic (distance, depth, peak1X, peak1Y, peak2X, peak2Y) {
    const x = this.currentDistance + distance
    const y = this.currentDepth + depth
    const x1 = this.currentDistance + peak1X
    const y1 = this.currentDepth + peak1Y
    const x2 = this.currentDistance + peak2X
    const y2 = this.currentDepth + peak2Y
    this.add(`C${x1} ${y1},${x2},${y2},${x} ${y}`, x, y)
  }

  quadratic (distance, depth, peakX, peakY) {
    const x = this.currentDistance + distance
    const y = this.currentDepth + depth
    const x1 = this.currentDistance + peakX
    const y1 = this.currentDepth + peakY
    this.add(`Q${x1} ${y1},${x} ${y}`, x, y)
  }

  spacer (distance) {
    this.currentDistance += distance
  }

  add (command, x, y) {
    this.commands.push({ command, x, y })
    this.currentDistance = x
    this.currentDepth = y
  }

  finalise () {
    const distance = this.currentDistance
    const initialDepth = this.initialDepth
    this.add(`L${distance} ${absoluteFloorDepth}`, distance, absoluteFloorDepth)
    this.add(`L${0} ${absoluteFloorDepth}`, 0, absoluteFloorDepth)
    this.add(`L${0} ${initialDepth}`, 0, initialDepth)
  }
}
