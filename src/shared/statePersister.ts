import LocalStorageFacade from './localStorageFacade'
import { objectToCodedText, textToObject, type SerializationTemplate } from './serializer'

interface GameState extends SerializationTemplate {
  stage: number
  score: number
  stroke: number
  ballPosition: [number, number] | null
  ballForce: [number, number] | null
}

const store = new LocalStorageFacade('state')
const template: GameState = {
  stage: 0,
  score: 0,
  stroke: 0,
  ballPosition: null,
  ballForce: null,
}

export const saveState = (
  stage: number,
  score: number,
  stroke: number,
  ballPosition: [number, number] | null,
  ballForce: [number, number] | null,
): void => {
  const data = { stage, score, stroke, ballPosition, ballForce }
  const serialised = objectToCodedText(data, template)
  store.write(serialised)
}

export const loadState = (): GameState => {
  if (!store.exists()) { return template }
  const serialised = store.read()
  if (!serialised) { return template }
  const data = textToObject(serialised, template) as GameState
  return data
}
