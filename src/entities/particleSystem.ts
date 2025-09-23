import type { Vec2 } from 'planck-js'
import { Vec2 as Vec2Constructor } from 'planck-js'
import { randomGenerator, randomRange } from '../shared/random'

interface RandomGenerator {
  next(): number
}

const rand: RandomGenerator = randomGenerator('particles')

interface Particle {
  next?: Particle | null
  set(startPosition: Vec2, endPosition: Vec2, alpha: number): void
  setNext(next: Particle | null): void
  render(ctx: CanvasRenderingContext2D): void
}

interface ParticleConstructor {
  new (doneCallback: (particle: Particle) => void): Particle
}

export default class ParticleSystem {
  private inactiveHead: Particle | null = null
  private activeHead: Particle | null = null
  public initialMinMaxX: [number, number] = [0, 1]
  public initialMinMaxY: [number, number] = [0, 1]
  public spreadMinMax: [number, number] = [0, 1]

  constructor(particleCount: number, Template: ParticleConstructor) {
    this.createParticles(particleCount, Template)
  }

  private createParticles(particleCount: number, Template: ParticleConstructor): void {
    let current: Particle | null = null

    for (let i = 0; i < particleCount; i++) {
      const particle = new Template(this.onDone.bind(this))
      particle.setNext(current)
      current = particle
    }
    this.inactiveHead = current
  }

  execute(count: number, startPosition: Vec2, velocityUnit: Vec2): void {
    let remaining = count
    while (remaining > 0) {
      const particle = this.inactiveHead
      if (particle === null) { return }
      this.inactiveHead = particle.next ?? null

      const x = randomRange(rand, this.initialMinMaxX[0], this.initialMinMaxX[1]) * velocityUnit.x
      const y = randomRange(rand, this.initialMinMaxY[0], this.initialMinMaxY[1]) * velocityUnit.y
      const length = randomRange(rand, this.spreadMinMax[0], this.spreadMinMax[1])
      const alpha = randomRange(rand, 0.5, 1)

      const endPosition = Vec2Constructor(x, y)
      endPosition.mul(length)
      endPosition.add(startPosition)

      particle.set(startPosition, endPosition, alpha)
      particle.setNext(this.activeHead)
      this.activeHead = particle
      remaining--
    }
  }

  get dirty(): boolean { return this.activeHead !== null }

  private onDone(particle: Particle): void {
    if (this.activeHead === particle) {
      this.activeHead = particle.next ?? null
    } else {
      let previous = this.activeHead
      while (previous?.next !== particle) {
        previous = previous?.next ?? null
      }
      if (previous) {
        previous.setNext(particle.next ?? null)
      }
    }

    particle.setNext(this.inactiveHead)
    this.inactiveHead = particle
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    let active = this.activeHead
    while (active !== null) {
      active.render(ctx)
      active = active.next ?? null
    }
  }
}