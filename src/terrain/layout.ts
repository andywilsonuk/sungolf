import { absoluteFloorDepth } from './constants'

interface Command {
  command: string
  x: number
  y: number
}

export class Layout {
  commands: Command[]
  initialDepth: number
  currentDistance: number = 0
  currentDepth: number = 0

  constructor(initialDepth: number) {
    this.commands = []
    this.initialDepth = initialDepth
    this.add(`M0 ${initialDepth}`, 0, initialDepth)
  }

  line(distance: number, depth: number): void {
    const x = this.currentDistance + distance
    const y = this.currentDepth + depth
    this.add(`L${x} ${y}`, x, y)
  }

  cubic(distance: number, depth: number, peak1X: number, peak1Y: number, peak2X: number, peak2Y: number): void {
    const x = this.currentDistance + distance
    const y = this.currentDepth + depth
    const x1 = this.currentDistance + peak1X
    const y1 = this.currentDepth + peak1Y
    const x2 = this.currentDistance + peak2X
    const y2 = this.currentDepth + peak2Y
    this.add(`C${x1} ${y1},${x2},${y2},${x} ${y}`, x, y)
  }

  quadratic(distance: number, depth: number, peakX: number, peakY: number): void {
    const x = this.currentDistance + distance
    const y = this.currentDepth + depth
    const x1 = this.currentDistance + peakX
    const y1 = this.currentDepth + peakY
    this.add(`Q${x1} ${y1},${x} ${y}`, x, y)
  }

  spacer(distance: number): void {
    this.currentDistance += distance
  }

  add(command: string, x: number, y: number): void {
    this.commands.push({ command, x, y })
    this.currentDistance = x
    this.currentDepth = y
  }

  finalise(): void {
    const distance = this.currentDistance
    const initialDepth = this.initialDepth
    this.add(`L${distance} ${absoluteFloorDepth}`, distance, absoluteFloorDepth)
    this.add(`L${0} ${absoluteFloorDepth}`, 0, absoluteFloorDepth)
    this.add(`L${0} ${initialDepth}`, 0, initialDepth)
  }
}
