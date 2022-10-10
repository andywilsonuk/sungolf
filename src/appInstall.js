let deferredPrompt

const before = (e) => {
  e.preventDefault()
  deferredPrompt = e
}
const initServiceWorker = async () => {
  if (window.location.hostname === 'localhost') { return }
  navigator.serviceWorker.register(new URL('service-worker.js', import.meta.url), { type: 'module' })
}

export default () => {
  if (!('serviceWorker' in navigator)) { return }
  window.addEventListener('beforeinstallprompt', before)
  window.addEventListener('load', initServiceWorker)
}

export const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches
export const canInstall = () => deferredPrompt != null

export const installPrompt = async () => {
  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
}
