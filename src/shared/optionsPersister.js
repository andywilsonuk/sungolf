import LocalStorageFacade from './localStorageFacade'
import { objectToCodedText, textToObject } from './serializer'

const store = new LocalStorageFacade('options')
const template = {
  sound: true,
  fullscreen: true
}

export const saveState = (sound, fullscreen) => {
  const data = { sound, fullscreen }
  const serialised = objectToCodedText(data, template)
  store.write(serialised)
}

export const loadState = () => {
  if (!store.exists()) { return template }
  const serialised = store.read()
  const data = textToObject(serialised, template)
  return data
}
