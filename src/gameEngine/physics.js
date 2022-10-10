import { Settings, Vec2, World } from 'planck-js'

export const physicsScale = 0.01
const maxPolygonVertices = 40

let world

export const createBody = (props) => world.createBody(props)
export const createDynamicBody = (props) => world.createDynamicBody(props)
export const registerBeginContact = (callback) => {
  world.on('begin-contact', callback)
}
export const registerEndContact = (callback) => {
  world.on('end-contact', callback)
}
export const rayCast = (p1, p2, callback) => {
  world.rayCast(p1, p2, callback)
}

const init = () => {
  world = new World(Vec2(0, 10))
  Settings.maxPolygonVertices = maxPolygonVertices
}

const update = (deltaTime) => {
  world.step(deltaTime * 0.001)
}

export default {
  init,
  update
}
