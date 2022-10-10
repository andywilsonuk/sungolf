import debugLog from '../gameEngine/debugLog'

export const goFullscreen = async () => {
  try {
    if (document.body.webkitRequestFullscreen) {
      document.body.webkitRequestFullscreen({ navigationUI: 'hide' })
    } else if (document.body.requestFullscreen) {
      await document.body.requestFullscreen({ navigationUI: 'hide' })
    }
  } catch (error) {
    debugLog(error)
  }
}

export const exitFullscreen = async () => {
  if (document.fullscreenElement != null) {
    await document.exitFullscreen()
  } else if (document.webkitFullscreenElement != null) {
    document.webkitExitFullscreen()
  }
}
