type SerializationTemplate = Record<string, unknown>

export type { SerializationTemplate }

export const dehydrate = <T extends Record<string, unknown>>(
  o: T,
  template?: SerializationTemplate,
): unknown[] => {
  const templateKeys = template === undefined ? undefined : Object.keys(template).sort()
  const objectKeys = Object.keys(o).sort()

  if (templateKeys !== undefined && objectKeys.length !== templateKeys.length) {
    const set = new Set(objectKeys)
    templateKeys.forEach((k) => set.delete(k))
    throw new Error(`Missing object keys for dehydrate: ${[...set.keys()].join(', ')}`)
  }

  return objectKeys.map((key) => o[key])
}

export const rehydrate = <T extends SerializationTemplate>(
  arr: unknown[],
  template: T,
): T => {
  const keys = Object.keys(template).sort()
  const o: Record<string, unknown> = {}

  if (arr.length !== keys.length) {
    throw new Error('Rehydration length issue')
  }

  for (let index = 0; index < keys.length; index++) {
    o[keys[index]] = arr[index]
  }
  return o as T
}

export const textToObject = <T extends SerializationTemplate>(
  text: string,
  template: T,
): T | Record<string, unknown> => {
  if (text.startsWith('{')) {
    return JSON.parse(text) as T | Record<string, unknown>
  }
  const base64Data = text.substring(1)
  const decodedData = window.atob(base64Data)
  const parsedArray = JSON.parse(decodedData) as unknown[]
  return rehydrate(parsedArray, template)
}

export const objectToText = (obj: unknown): string => JSON.stringify(obj)

export const objectToCodedText = (
  obj: Record<string, unknown>,
  template: SerializationTemplate,
): string =>
  `a${window.btoa(JSON.stringify(dehydrate(obj, template)))}`
