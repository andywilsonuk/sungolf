import type { Body, BodyDef, Contact, Fixture, World as WorldType } from 'planck'
import { Settings, World, Vec2 } from 'planck'

export const physicsScale = 0.01
const maxPolygonVertices = 40

let world: WorldType | undefined

const worldOrThrow = () => {
  if (!world) { throw new Error('World not created') }
  return world
}

export const createBody = (props: BodyDef): Body => worldOrThrow().createBody(props)

// Adding back the missing export
export const createDynamicBody = (props: BodyDef): Body => {
  const body = worldOrThrow().createBody({ type: 'dynamic', ...props })
  return body
}

export const registerBeginContact = (callback: (contact: Contact) => void): void => {
  worldOrThrow().on('begin-contact', callback as (...args: unknown[]) => void)
}

export const registerEndContact = (callback: (contact: Contact) => void): void => {
  worldOrThrow().on('end-contact', callback as (...args: unknown[]) => void)
}

export const rayCast = (p1: Vec2, p2: Vec2, callback: (fixture: Fixture, point: Vec2, normal: Vec2, fraction: number) => number): void => {
  worldOrThrow().rayCast(p1, p2, callback)
}

const init = (): void => {
  world = new World(new Vec2(0, 10))
  Settings.maxPolygonVertices = maxPolygonVertices
}

const update = (deltaTime: number): void => {
  worldOrThrow().step(deltaTime * 0.001)
}

export default {
  init,
  update,
}
