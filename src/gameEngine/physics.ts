import type { Body, BodyDef, Contact } from 'planck-js'
import { Settings, Vec2, World } from 'planck-js'

export const physicsScale = 0.01
const maxPolygonVertices = 40

let world: World

export const createBody = (props: BodyDef): Body => world.createBody(props)

// Adding back the missing export
export const createDynamicBody = (props: BodyDef): Body => {
  const body = world.createBody({ type: 'dynamic', ...props })
  return body
}

export const registerBeginContact = (callback: (contact: Contact) => void): void => {
  world.on('begin-contact', callback as (...args: unknown[]) => void)
}

export const registerEndContact = (callback: (contact: Contact) => void): void => {
  world.on('end-contact', callback as (...args: unknown[]) => void)
}

export const rayCast = (p1: Vec2, p2: Vec2, callback: (fixture: any, point: Vec2, normal: Vec2, fraction: number) => number): void => {
  // Cast to any to bypass typing issues with the planck-js types
  ;(world as any).rayCast(p1, p2, callback)
}

const init = (): void => {
  world = new World(Vec2(0, 10))
  Settings.maxPolygonVertices = maxPolygonVertices
}

const update = (deltaTime: number): void => {
  world.step(deltaTime * 0.001)
}

export default {
  init,
  update,
}
