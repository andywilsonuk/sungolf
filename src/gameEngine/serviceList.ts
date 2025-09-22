interface GameService {
  init?: () => void
  renderInitial?: () => void
  clear?: () => void
  beginFrame?: (timestamp: number) => void
  update?: (deltaTime: number) => void
  render?: (interpolationPercentage: number) => void
  endFrame?: (panic: boolean) => void
  paused?: () => void
  resumed?: () => void
}

const serviceList: GameService[] = []
const beginFrameBindings: ((timestamp: number) => void)[] = []
const updateBindings: ((deltaTime: number) => void)[] = []
const renderBindings: ((interpolationPercentage: number) => void)[] = []
const endFrameBindings: ((panic: boolean) => void)[] = []
const pausedBindings: (() => void)[] = []
const resumedBindings: (() => void)[] = []

export const addService = (service: GameService): void => {
  serviceList.push(service)
  if (service.beginFrame) {
    beginFrameBindings.push(service.beginFrame)
  }
  if (service.update) {
    updateBindings.push(service.update)
  }
  if (service.render) {
    renderBindings.push(service.render)
  }
  if (service.endFrame) {
    endFrameBindings.push(service.endFrame)
  }
  if (service.paused) {
    pausedBindings.push(service.paused)
  }
  if (service.resumed) {
    resumedBindings.push(service.resumed)
  }
}

const init = (): void => {
  serviceList.filter((s) => s.init).forEach((s) => s.init!())
  serviceList.filter((s) => s.renderInitial).forEach((s) => s.renderInitial!())
}

const clear = (): void => {
  serviceList.filter((s) => s.clear).forEach((s) => s.clear!())
}

const beginFrame = (timestamp: number): void => {
  const services = beginFrameBindings
  for (let i = 0; i < services.length; i++) {
    services[i](timestamp)
  }
}

const update = (deltaTime: number): void => {
  const services = updateBindings
  for (let i = 0; i < services.length; i++) {
    services[i](deltaTime)
  }
}

const render = (interpolationPercentage: number): void => {
  const services = renderBindings
  for (let i = 0; i < services.length; i++) {
    services[i](interpolationPercentage)
  }
}

const endFrame = (panic: boolean): void => {
  const services = endFrameBindings
  for (let i = 0; i < services.length; i++) {
    services[i](panic)
  }
}

const paused = (): void => {
  const services = pausedBindings
  for (let i = 0; i < services.length; i++) {
    services[i]()
  }
}

const resume = (): void => {
  const services = resumedBindings
  for (let i = 0; i < services.length; i++) {
    services[i]()
  }
}

export default {
  init,
  beginFrame,
  update,
  render,
  endFrame,
  paused,
  resume,
  clear
}
