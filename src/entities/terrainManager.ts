import { Vec2, Body } from 'planck-js'

interface SpecialObject {
  hide?(): void
  disable?(): void
  enable?(offset: Vec2): void
}

export class TerrainData {
  renderPath: Path2D
  startY: number
  distance: number
  body: Body
  specialObject?: SpecialObject

  constructor (path: string, startY: number, distance: number, body: Body, specialObject?: SpecialObject) {
    this.renderPath = new window.Path2D(path)
    this.startY = startY
    this.distance = distance
    this.body = body
    this.specialObject = specialObject
  }
}

export default class TerrainManager {
  definitions: TerrainData[]
  offsetX: number

  constructor () {
    this.definitions = []
    this.offsetX = 0
  }

  add (newData: TerrainData): void {
    this.definitions.push(newData)
  }

  removeHead (): void {
    const discard = this.definitions.shift()
    if (discard === undefined) { return }
    const world = discard.body.getWorld()
    world.destroyBody(discard.body)
    discard.specialObject?.hide?.()
    this.offsetX += discard.distance - 0.01
  }

  get previous (): TerrainData {
    return this.definitions[0]
  }

  get current (): TerrainData {
    return this.definitions[1]
  }

  get next (): TerrainData {
    return this.definitions[2]
  }

  setInitialOffset (offset: number): void {
    this.offsetX = -this.previous.distance + offset
  }

  setOffset (offsetX: number): void {
    this.offsetX = offsetX
  }

  disable (): void {
    for (let i = 0; i < this.definitions.length; i++) {
      const { body, specialObject } = this.definitions[i]
      body.setActive(false)
      specialObject?.disable?.()
    }
  }

  enable (): void {
    if (this.definitions.length > 3) {
      this.removeHead()
    }

    let currentOffset = this.offsetX
    for (let i = 0; i < this.definitions.length; i++) {
      const { body, specialObject, distance } = this.definitions[i]
      const offset = Vec2(currentOffset, 0)
      body.setPosition(offset)
      body.setActive(true)
      specialObject?.enable?.(offset)
      currentOffset += distance
    }
  }

  clear (): void {
    while (this.definitions.length !== 0) {
      this.removeHead()
    }
  }
}
