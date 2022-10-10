export const dehydrate = (o, template) => {
  const templateKeys = template === undefined ? undefined : Object.keys(template).sort()
  const objectKeys = Object.keys(o).sort()

  if (templateKeys !== undefined && objectKeys.length !== templateKeys.length) {
    const set = new Set(objectKeys)
    templateKeys.forEach((k) => set.delete(k))
    throw new Error(`Missing object keys for dehydrate: ${[...set.keys()]}`)
  }

  return objectKeys.map((key) => o[key])
}
export const rehydrate = (arr, template) => {
  const keys = Object.keys(template).sort()
  const o = {}

  if (arr.length !== keys.length) {
    throw new Error('Rehydration length issue')
  }

  for (let index = 0; index < keys.length; index++) {
    o[keys[index]] = arr[index]
  }
  return o
}
export const textToObject = (text, template) => (text[0] === '{' ? JSON.parse(text) : rehydrate(JSON.parse(window.atob(text.substr(1))), template))
export const objectToText = (obj) => JSON.stringify(obj)
export const objectToCodedText = (obj, template) => `a${window.btoa(JSON.stringify(dehydrate(obj, template)))}`
