export const referenceWidth = 800
export const referenceHeight = 600
const expandedWidthMax = 1.5
const expandedHeightMax = 1.8

let ratio = referenceWidth / referenceHeight
let devicePixelRatio
let expandedWidthPercent = 1
let expandedHeightPercent = 1
let gameAreaElement
let renderWidth, renderHeight
const resizeSubscribers = []

const init = () => {
  gameAreaElement = document.getElementById('gameArea')
  window.addEventListener('resize', debouncedResize, false)
  window.screen.orientation?.addEventListener('change', debouncedResize, false)
}

const renderInitial = () => {
  updateSize()
}

let pending = false

const debouncedResize = () => {
  if (pending) { return }
  pending = true
  window.requestAnimationFrame(updateSize)
}

const updateSize = () => {
  const refWidthToHeight = referenceWidth / referenceHeight
  const windowWidth = document.documentElement.clientWidth
  const windowHeight = document.documentElement.clientHeight
  const newWidthToHeight = windowWidth / windowHeight
  let newWidth = windowWidth
  let newHeight = windowHeight

  if (newWidthToHeight > refWidthToHeight) {
    newWidth = newHeight * refWidthToHeight
  } else {
    newHeight = newWidth / refWidthToHeight
  }
  ratio = Math.min(newWidth / referenceWidth, newHeight / referenceHeight)

  if (newWidth < windowWidth) {
    const expandedWidth = Math.min(windowWidth, newWidth * expandedWidthMax)
    expandedWidthPercent = expandedWidth / newWidth
    newWidth = expandedWidth
  } else {
    expandedWidthPercent = 1
  }
  if (newHeight < windowHeight) {
    const expandedHeight = Math.min(windowHeight, newHeight * expandedHeightMax)
    expandedHeightPercent = expandedHeight / newHeight
    newHeight = expandedHeight
  } else {
    expandedHeightPercent = 1
  }

  gameAreaElement.style.width = `${newWidth}px`
  gameAreaElement.style.height = `${newHeight}px`

  devicePixelRatio = window.devicePixelRatio
  renderWidth = newWidth * devicePixelRatio
  renderHeight = newHeight * devicePixelRatio

  notifySubscribers()
  pending = false
}

export const applyPixelScale = (ctx2) => {
  ctx2.resetTransform()
  ctx2.scale(devicePixelRatio, devicePixelRatio)
}
export const applyRatioScale = (ctx2) => {
  ctx2.scale(ratio, ratio)
}

export const heightPadding = () => {
  if (expandedHeightPercent === 1) { return 0 }
  return referenceHeight * (1 - expandedHeightPercent)
}

export const subscribeResize = (callback) => {
  resizeSubscribers.push(callback)
}

const notifySubscribers = () => {
  const payload = {
    width: referenceWidth * expandedWidthPercent,
    height: referenceHeight * expandedHeightPercent,
    renderWidth,
    renderHeight
  }
  for (let i = 0; i < resizeSubscribers.length; i++) {
    const subscriberCallback = resizeSubscribers[i]
    subscriberCallback(payload)
  }
}

export default {
  init,
  renderInitial
}
