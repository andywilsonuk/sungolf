const serviceList = []
const beginFrameBindings = []
const updateBindings = []
const renderBindings = []
const endFrameBindings = []
const pausedBindings = []
const resumedBindings = []

export const addService = (service) => {
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
const init = () => {
  serviceList.filter((s) => s.init).forEach((s) => s.init())
  serviceList.filter((s) => s.renderInitial).forEach((s) => s.renderInitial())
}
const clear = () => {
  serviceList.filter((s) => s.clear).forEach((s) => s.clear())
}
const beginFrame = (timestamp) => {
  const services = beginFrameBindings
  for (let i = 0; i < services.length; i++) {
    services[i](timestamp)
  }
}
const update = (deltaTime) => {
  const services = updateBindings
  for (let i = 0; i < services.length; i++) {
    services[i](deltaTime)
  }
}
const render = (interpolationPercentage) => {
  const services = renderBindings
  for (let i = 0; i < services.length; i++) {
    services[i](interpolationPercentage)
  }
}
const endFrame = (panic) => {
  const services = endFrameBindings
  for (let i = 0; i < services.length; i++) {
    services[i](panic)
  }
}
const paused = () => {
  const services = pausedBindings
  for (let i = 0; i < services.length; i++) {
    services[i]()
  }
}
const resume = () => {
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
