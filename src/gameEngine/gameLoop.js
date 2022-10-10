import MainLoop from 'mainloop.js'

let servicesRef
let now

export const start = () => {
  servicesRef.init()
  MainLoop.start()
}
export const stop = () => {
  MainLoop.stop()
  servicesRef.clear()
}

export const getTimestamp = () => now

const beginFrame = (timestamp) => {
  now = timestamp
  servicesRef.beginFrame(timestamp)
}

const update = (deltaTime) => {
  servicesRef.update(deltaTime)
}

const render = (interpolationPercentage) => {
  servicesRef.render(interpolationPercentage)
}

const endFrame = (fps, panic) => {
  if (panic) {
    MainLoop.resetFrameDelta()
  }
  servicesRef.endFrame()
}

export const pause = () => {
  MainLoop.stop()
  servicesRef.paused()
}
export const resume = () => {
  MainLoop.start()
  servicesRef.resumed()
}

export default (services) => {
  servicesRef = services
  MainLoop
    .setBegin(beginFrame)
    .setUpdate(update)
    .setDraw(render)
    .setEnd(endFrame)
}
