import { Vec2 } from 'planck-js'
import { randomGenerator, randomRange } from '../shared/random'

const rand = randomGenerator('particles')

export default class ParticleSystem {
  constructor (particleCount, Template) {
    this.inactiveHead = null
    this.activeHead = null
    this.initialMinMaxX = [0, 1]
    this.initialMinMaxY = [0, 1]
    this.spreadMinMax = [0, 1]
    this.createParticles(particleCount, Template)
  }

  createParticles (particleCount, Template) {
    let current = null

    for (let i = 0; i < particleCount; i++) {
      const particle = new Template(this.onDone.bind(this))
      particle.setNext(current)
      current = particle
    }
    this.inactiveHead = current
  }

  execute (count, startPosition, velocityUnit) {
    let remaining = count
    while (remaining > 0) {
      const particle = this.inactiveHead
      if (particle === null) { return }
      this.inactiveHead = particle.next

      const x = randomRange(rand, this.initialMinMaxX[0], this.initialMinMaxX[1]) * velocityUnit.x
      const y = randomRange(rand, this.initialMinMaxY[0], this.initialMinMaxY[1]) * velocityUnit.y
      const length = randomRange(rand, this.spreadMinMax[0], this.spreadMinMax[1])
      const alpha = randomRange(rand, 0.5, 1)

      const endPosition = Vec2(x, y)
      endPosition.mul(length)
      endPosition.add(startPosition)

      particle.set(startPosition, endPosition, alpha)
      particle.setNext(this.activeHead)
      this.activeHead = particle
      remaining--
    }
  }

  get dirty () { return this.activeHead !== null }

  onDone (particle) {
    if (this.activeHead === particle) {
      this.activeHead = particle.next
    } else {
      let previous = this.activeHead
      while (previous.next !== particle) {
        previous = previous.next
      }
      previous.setNext(particle.next)
    }

    particle.setNext(this.inactiveHead)
    this.inactiveHead = particle
  }

  renderOnCanvas (ctx) {
    let active = this.activeHead
    while (active !== null) {
      active.render(ctx)
      active = active.next
    }
  }
}
