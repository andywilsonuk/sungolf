import services, { addService } from './serviceList'
import gameLoop from './gameLoop'
import world from './world'
import deferredRender from './deferredRender'
import signalling from './signalling'
import delay from './delay'
import physics from './physics'
import renderCanvas from './renderCanvas'
import audioManager from './audioManager'
import inputManager from './inputManager'
import animator from './animator'

export default () => {
  addService(renderCanvas)
  addService(animator)
  addService(inputManager)
  addService(delay)
  addService(signalling)
  addService(physics)
  addService(world)
  addService(deferredRender)
  addService(audioManager)
  gameLoop(services)
}
