import debugLog from '../gameEngine/debugLog'

// Extend Document interface for webkit fullscreen
declare global {
  interface Document {
    webkitFullscreenElement?: Element
    webkitExitFullscreen?: () => void
  }
  
  interface Element {
    webkitRequestFullscreen?: (options?: FullscreenOptions) => void
  }
}

export const goFullscreen = async (): Promise<void> => {
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

export const exitFullscreen = async (): Promise<void> => {
  if (document.fullscreenElement != null) {
    await document.exitFullscreen()
  } else if (document.webkitFullscreenElement != null) {
    document.webkitExitFullscreen?.()
  }
}
