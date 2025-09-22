import LocalStorageFacade from './localStorageFacade'
import { objectToCodedText, textToObject, type SerializationTemplate } from './serializer'

interface OptionsState extends SerializationTemplate {
  sound: boolean
  fullscreen: boolean
}

const store = new LocalStorageFacade('options')
const template: OptionsState = {
  sound: true,
  fullscreen: true,
}

export const saveState = (sound: boolean, fullscreen: boolean): void => {
  const data = { sound, fullscreen }
  const serialised = objectToCodedText(data, template)
  store.write(serialised)
}

export const loadState = (): OptionsState => {
  if (!store.exists()) { return template }
  const serialised = store.read()
  if (!serialised) { return template }
  const data = textToObject(serialised, template) as OptionsState
  return data
}
