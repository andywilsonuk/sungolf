import MainLoop from 'mainloop.js'

interface Services {
  init(): void
  clear(): void
  beginFrame(timestamp: number): void
  update(deltaTime: number): void
  render(interpolationPercentage: number): void
  endFrame(): void
  paused(): void
  resumed(): void
}

let servicesRef: Services
let now: number

export const start = (): void => {
  servicesRef.init()
  MainLoop.start()
}

export const stop = (): void => {
  MainLoop.stop()
  servicesRef.clear()
}

export const getTimestamp = (): number => now

const beginFrame = (timestamp: number): void => {
  now = timestamp
  servicesRef.beginFrame(timestamp)
}

const update = (deltaTime: number): void => {
  servicesRef.update(deltaTime)
}

const render = (interpolationPercentage: number): void => {
  servicesRef.render(interpolationPercentage)
}

const endFrame = (fps: number, panic: boolean): void => {
  if (panic) {
    MainLoop.resetFrameDelta()
  }
  servicesRef.endFrame()
}

export const pause = (): void => {
  MainLoop.stop()
  servicesRef.paused()
}

export const resume = (): void => {
  MainLoop.start()
  servicesRef.resumed()
}

export default (services: Services): void => {
  servicesRef = services
  MainLoop
    .setBegin(beginFrame)
    .setUpdate(update)
    .setDraw(render)
    .setEnd(endFrame)
}
