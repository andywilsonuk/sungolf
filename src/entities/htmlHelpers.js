const svgNS = 'http://www.w3.org/2000/svg'
const zero = [0, 0]
const svgRootId = 'scene'

const applyAttributes = (element, attributes) => {
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
  }
}

export const rect = ([x, y], width, height, attributes) => {
  const element = document.createElementNS(svgNS, 'rect')
  element.setAttribute('x', x)
  element.setAttribute('y', y)
  element.setAttribute('width', width)
  element.setAttribute('height', height)
  applyAttributes(element, attributes)
  return element
}
export const square = (xy, size, attributes) => rect(xy, size, size, attributes)
export const circle = ([x, y], radius, attributes) => {
  const element = document.createElementNS(svgNS, 'circle')
  element.setAttribute('cx', x)
  element.setAttribute('cy', y)
  element.setAttribute('r', radius)
  applyAttributes(element, attributes)
  return element
}
export const group = (attributes) => {
  const element = document.createElementNS(svgNS, 'g')
  applyAttributes(element, attributes)
  return element
}
export const path = (p, attributes) => {
  const element = document.createElementNS(svgNS, 'path')
  element.setAttribute('d', p)
  applyAttributes(element, attributes)
  return element
}
export const mask = (id) => {
  const element = document.createElementNS(svgNS, 'mask')
  element.setAttribute('id', id)
  return element
}
export const text = ([x, y], t, attributes) => {
  const element = document.createElementNS(svgNS, 'text')
  element.setAttribute('x', x)
  element.setAttribute('y', y)
  element.appendChild(document.createTextNode(t))
  applyAttributes(element, attributes)
  return element
}
export const svgIcon = (p, viewBox, attributes) => {
  const element = document.createElementNS(svgNS, 'svg')
  element.setAttribute('viewBox', viewBox ?? '0 0 24 24')
  const pathElement = path(p)
  element.appendChild(pathElement)
  applyAttributes(element, attributes)
  return element
}
export const polygon = (points, attributes) => {
  const element = document.createElementNS(svgNS, 'polygon')
  element.setAttribute('points', points)
  applyAttributes(element, attributes)
  return element
}
export const polyline = (points, attributes) => {
  const element = document.createElementNS(svgNS, 'polyline')
  element.setAttribute('points', points)
  applyAttributes(element, attributes)
  return element
}
export const basicElement = (tag, attributes) => {
  const element = document.createElement(tag)
  applyAttributes(element, attributes)
  return element
}

export const addClass = (element, ...classNames) => {
  for (let i = 0; i < classNames.length; i++) {
    element.classList.add(classNames[i])
  }
}
export const removeClass = (element, className) => element.classList.remove(className)

export const createTranslate = (element, position = zero) => {
  const transform = document.getElementById(svgRootId).createSVGTransform()
  transform.setTranslate(position[0], position[1])
  element.transform.baseVal.appendItem(transform)
  return transform
}
export const createRotate = (element, angle = 0, position = zero) => {
  const transform = document.getElementById(svgRootId).createSVGTransform()
  transform.setRotate(angle, position[0], position[1])
  element.transform.baseVal.appendItem(transform)
  return transform
}
export const opacityHide = (element) => {
  element.setAttribute('opacity', 0)
}
export const opacityShow = (element) => {
  element.setAttribute('opacity', 1)
}
