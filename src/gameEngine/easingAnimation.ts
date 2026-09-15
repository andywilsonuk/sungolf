// https://github.com/phegman/animate-vanilla-js/
import type { AnimationUpdate } from "./animator"
import { interpolationCurrent } from "./animator"

type EasingFunction = (t: number, b: number, c: number, d: number) => number

export const linear: EasingFunction = (t, b, c, d) => (c * t) / d + b
export const easeInQuad: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d
  return c * normalizedTime * normalizedTime + b
}
export const easeOutQuad: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d
  return -c * normalizedTime * (normalizedTime - 2) + b
}
export const easeInOutQuad: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d / 2
  return normalizedTime < 1 ? (c / 2) * normalizedTime * normalizedTime + b : (-c / 2) * ((normalizedTime - 1) * (normalizedTime - 3) - 1) + b
}
export const easeInCubic: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d
  return c * normalizedTime * normalizedTime * normalizedTime + b
}
export const easeOutCubic: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d - 1
  return c * (normalizedTime * normalizedTime * normalizedTime + 1) + b
}
export const easeInOutCubic: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d / 2
  return normalizedTime < 1 ? (c / 2) * normalizedTime * normalizedTime * normalizedTime + b : (c / 2) * ((normalizedTime - 2) * (normalizedTime - 2) * (normalizedTime - 2) + 2) + b
}
export const easeInQuart: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d
  return c * normalizedTime * normalizedTime * normalizedTime * normalizedTime + b
}
export const easeOutQuart: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d - 1
  return -c * (normalizedTime * normalizedTime * normalizedTime * normalizedTime - 1) + b
}
export const easeInOutQuart: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d / 2
  return normalizedTime < 1 ? (c / 2) * normalizedTime * normalizedTime * normalizedTime * normalizedTime + b : (-c / 2) * ((normalizedTime - 2) * (normalizedTime - 2) * (normalizedTime - 2) * (normalizedTime - 2) - 2) + b
}
export const easeInQuint: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d
  return c * normalizedTime * normalizedTime * normalizedTime * normalizedTime * normalizedTime + b
}
export const easeOutQuint: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d - 1
  return c * (normalizedTime * normalizedTime * normalizedTime * normalizedTime * normalizedTime + 1) + b
}
export const easeInOutQuint: EasingFunction = (t, b, c, d) => {
  const normalizedTime = t / d / 2
  return normalizedTime < 1 ? (c / 2) * normalizedTime * normalizedTime * normalizedTime * normalizedTime * normalizedTime + b : (c / 2) * ((normalizedTime - 2) * (normalizedTime - 2) * (normalizedTime - 2) * (normalizedTime - 2) * (normalizedTime - 2) + 2) + b
}

export class EasingAnimation implements AnimationUpdate {
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
    if (!this.running) {
      return
    }
    this.progress += deltaTime
    if (this.progress < this.duration) {
      return
    }
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
    if (this.finished && this.final !== null) {
      return this.final
    }
    if (this.initial === null || this.change === null) {
      return 0
    }
    return this.easing(this.progress + interpolationCurrent(), this.initial, this.change, this.duration)
  }
}
