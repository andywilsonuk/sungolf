import { Vec2 } from 'planck-js'

export class TerrainData {
  constructor (path, startY, distance, body, specialObject) {
    this.renderPath = new window.Path2D(path)
    this.startY = startY
    this.distance = distance
    this.body = body
    this.specialObject = specialObject
  }
}

export default class TerrainManager {
  constructor () {
    this.definitions = []
    this.offsetX = 0
  }

  add (newData) {
    this.definitions.push(newData)
  }

  removeHead () {
    const discard = this.definitions.shift()
    if (discard === undefined) { return }
    const world = discard.body.getWorld()
    world.destroyBody(discard.body)
    discard.specialObject?.hide()
    this.offsetX += discard.distance - 0.01
  }

  get previous () {
    return this.definitions[0]
  }

  get current () {
    return this.definitions[1]
  }

  get next () {
    return this.definitions[2]
  }

  setInitialOffset (offset) {
    this.offsetX = -this.previous.distance + offset
  }

  setOffset (offsetX) {
    this.offsetX = offsetX
  }

  disable () {
    for (let i = 0; i < this.definitions.length; i++) {
      const { body, specialObject } = this.definitions[i]
      body.setActive(false)
      specialObject?.disable()
    }
  }

  enable () {
    if (this.definitions.length > 3) {
      this.removeHead()
    }

    let currentOffset = this.offsetX
    for (let i = 0; i < this.definitions.length; i++) {
      const { body, specialObject, distance } = this.definitions[i]
      const offset = Vec2(currentOffset, 0)
      body.setPosition(offset)
      body.setActive(true)
      specialObject?.enable(offset)
      currentOffset += distance
    }
  }

  clear () {
    while (this.definitions.length !== 0) {
      this.removeHead()
    }
  }
}
