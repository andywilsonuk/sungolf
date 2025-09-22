// https://github.com/phegman/animate-vanilla-js/
import { interpolationCurrent } from './animator'

type EasingFunction = (t: number, b: number, c: number, d: number) => number

export const linear: EasingFunction = (t, b, c, d) => (c * t) / d + b
export const easeInQuad: EasingFunction = (t, b, c, d) => c * (t /= d) * t + b
export const easeOutQuad: EasingFunction = (t, b, c, d) => -c * (t /= d) * (t - 2) + b
export const easeInOutQuad: EasingFunction = (t, b, c, d) =>
  (t /= d / 2) < 1 ? (c / 2) * t * t + b : (-c / 2) * (--t * (t - 2) - 1) + b
export const easeInCubic: EasingFunction = (t, b, c, d) => c * (t /= d) * t * t + b
export const easeOutCubic: EasingFunction = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b
export const easeInOutCubic: EasingFunction = (t, b, c, d) =>
  (t /= d / 2) < 1
    ? (c / 2) * t * t * t + b
    : (c / 2) * ((t -= 2) * t * t + 2) + b
export const easeInQuart: EasingFunction = (t, b, c, d) => c * (t /= d) * t * t * t + b
export const easeOutQuart: EasingFunction = (t, b, c, d) => -c * ((t = t / d - 1) * t * t * t - 1) + b
export const easeInOutQuart: EasingFunction = (t, b, c, d) =>
  (t /= d / 2) < 1
    ? (c / 2) * t * t * t * t + b
    : (-c / 2) * ((t -= 2) * t * t * t - 2) + b
export const easeInQuint: EasingFunction = (t, b, c, d) => c * (t /= d) * t * t * t * t + b
export const easeOutQuint: EasingFunction = (t, b, c, d) => c * ((t = t / d - 1) * t * t * t * t + 1) + b
export const easeInOutQuint: EasingFunction = (t, b, c, d) =>
  (t /= d / 2) < 1
    ? (c / 2) * t * t * t * t * t + b
    : (c / 2) * ((t -= 2) * t * t * t * t + 2) + b

export class Animation {
  easing: EasingFunction
  duration: number
  onDone?: () => void
  initial: number | null = null
  change: number | null = null
  final: number | null = null
  running = false
  finished = false
  progress = 0

  constructor(easing: EasingFunction, duration: number, onDone?: () => void) {
    this.easing = easing
    this.duration = duration
    this.onDone = onDone
  }

  start(from: number, to: number): void {
    this.initial = from
    this.change = to - from
    this.final = to
    this.running = true
    this.finished = false
    this.progress = 0
  }

  update(deltaTime: number): void {
    if (!this.running) { return }
    this.progress += deltaTime
    if (this.progress < this.duration) { return }
    this.running = false
    this.finished = true
    if (this.onDone) {
      this.onDone()
    }
  }

  stop(): void {
    this.running = false
  }

  get current(): number {
    if (this.finished) { return this.final! }
    return this.easing(this.progress + interpolationCurrent(), this.initial!, this.change!, this.duration)
  }
}
