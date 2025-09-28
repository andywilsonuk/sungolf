export const referenceWidth = 800
export const referenceHeight = 600
const expandedWidthMax = 1.5
const expandedHeightMax = 1.8

let ratio = referenceWidth / referenceHeight
let devicePixelRatio: number
let expandedWidthPercent = 1
let expandedHeightPercent = 1
let gameAreaElement: HTMLElement
let renderWidth: number, renderHeight: number
let gameAreaWidth: number, gameAreaHeight: number

interface ResizePayload {
  width: number
  height: number
  renderWidth: number
  renderHeight: number
  gameAreaWidth: number
  gameAreaHeight: number
}

type ResizeCallback = (payload: ResizePayload) => void

const resizeSubscribers: ResizeCallback[] = []

const init = (): void => {
  const element = document.getElementById('gameArea')
  if (!element) {
    throw new Error('Game area element not found')
  }
  gameAreaElement = element
  window.addEventListener('resize', debouncedResize, false)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window.screen.orientation) {
    window.screen.orientation.addEventListener('change', debouncedResize, false)
  }
}

const renderInitial = (): void => {
  updateSize()
}

let pending = false

const debouncedResize = (): void => {
  if (pending) { return }
  pending = true
  window.requestAnimationFrame(updateSize)
}

const updateSize = (): void => {
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

  gameAreaWidth = newWidth
  gameAreaHeight = newHeight
  gameAreaElement.style.width = `${newWidth}px`
  gameAreaElement.style.height = `${newHeight}px`

  devicePixelRatio = window.devicePixelRatio
  renderWidth = newWidth * devicePixelRatio
  renderHeight = newHeight * devicePixelRatio

  notifySubscribers()
  pending = false
}

export const applyPixelScale = (ctx2: CanvasRenderingContext2D): void => {
  ctx2.resetTransform()
  ctx2.scale(devicePixelRatio, devicePixelRatio)
}

export const applyRatioScale = (ctx2: CanvasRenderingContext2D): void => {
  ctx2.scale(ratio, ratio)
}

export const heightPadding = (): number => {
  if (expandedHeightPercent === 1) { return 0 }
  return referenceHeight * (1 - expandedHeightPercent)
}

export const subscribeResize = (callback: ResizeCallback): void => {
  resizeSubscribers.push(callback)
}

const notifySubscribers = (): void => {
  const payload: ResizePayload = {
    width: referenceWidth * expandedWidthPercent,
    height: referenceHeight * expandedHeightPercent,
    renderWidth,
    renderHeight,
    gameAreaWidth,
    gameAreaHeight,
  }
  for (const subscriberCallback of resizeSubscribers) {
    subscriberCallback(payload)
  }
}

export default {
  init,
  renderInitial,
}
