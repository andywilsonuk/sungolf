import LocalStorageFacade from './localStorageFacade'
import { objectToCodedText, textToObject } from './serializer'

const store = new LocalStorageFacade('state')
const template = {
  stage: 0,
  score: 0,
  stroke: 0,
  ballPosition: null,
  ballForce: null
}

export const saveState = (stage, score, stroke, ballPosition, ballForce) => {
  const data = { stage, score, stroke, ballPosition, ballForce }
  const serialised = objectToCodedText(data, template)
  store.write(serialised)
}

export const loadState = () => {
  if (!store.exists()) { return template }
  const serialised = store.read()
  const data = textToObject(serialised, template)
  return data
}
