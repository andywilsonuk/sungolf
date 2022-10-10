// https://github.com/phegman/animate-vanilla-js/
import { interpolationCurrent } from './animator'

export const linear = (t, b, c, d) => (c * t) / d + b
export const easeInQuad = (t, b, c, d) => c * (t /= d) * t + b
export const easeOutQuad = (t, b, c, d) => -c * (t /= d) * (t - 2) + b
export const easeInOutQuad = (t, b, c, d) =>
  (t /= d / 2) < 1 ? (c / 2) * t * t + b : (-c / 2) * (--t * (t - 2) - 1) + b
export const easeInCubic = (t, b, c, d) => c * (t /= d) * t * t + b
export const easeOutCubic = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b
export const easeInOutCubic = (t, b, c, d) =>
  (t /= d / 2) < 1
    ? (c / 2) * t * t * t + b
    : (c / 2) * ((t -= 2) * t * t + 2) + b
export const easeInQuart = (t, b, c, d) => c * (t /= d) * t * t * t + b
export const easeOutQuart = (t, b, c, d) => -c * ((t = t / d - 1) * t * t * t - 1) + b
export const easeInOutQuart = (t, b, c, d) =>
  (t /= d / 2) < 1
    ? (c / 2) * t * t * t * t + b
    : (-c / 2) * ((t -= 2) * t * t * t - 2) + b
export const easeInQuint = (t, b, c, d) => c * (t /= d) * t * t * t * t + b
export const easeOutQuint = (t, b, c, d) => c * ((t = t / d - 1) * t * t * t * t + 1) + b
export const easeInOutQuint = (t, b, c, d) =>
  (t /= d / 2) < 1
    ? (c / 2) * t * t * t * t * t + b
    : (c / 2) * ((t -= 2) * t * t * t * t + 2) + b

export class Animation {
  constructor (easing, duration, onDone) {
    this.easing = easing
    this.duration = duration
    this.onDone = onDone
    this.initial = null
    this.change = null
    this.final = null
    this.running = false
    this.finished = false
    this.progress = 0
  }

  start (from, to) {
    this.initial = from
    this.change = to - from
    this.final = to
    this.running = true
    this.finished = false
    this.progress = 0
  }

  update (deltaTime) {
    if (!this.running) { return }
    this.progress += deltaTime
    if (this.progress < this.duration) { return }
    this.running = false
    this.finished = true
    if (this.onDone) {
      this.onDone()
    }
  }

  stop () {
    this.running = false
  }

  get current () {
    if (this.finished) { return this.final }
    const value = this.easing(this.progress + interpolationCurrent(), this.initial, this.change, this.duration)
    return value
  }
}
