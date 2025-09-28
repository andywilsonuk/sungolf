const svgNS = 'http://www.w3.org/2000/svg'
const zero: [number, number] = [0, 0]
const svgRootId = 'scene'

type AttributeRecord = Record<string, string | number>

const applyAttributes = (element: Element, attributes?: AttributeRecord): void => {
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => { element.setAttribute(key, value.toString()) })
  }
}

export const rect = ([x, y]: [number, number], width: number, height: number, attributes?: AttributeRecord): SVGRectElement => {
  const element = document.createElementNS(svgNS, 'rect')
  element.setAttribute('x', x.toString())
  element.setAttribute('y', y.toString())
  element.setAttribute('width', width.toString())
  element.setAttribute('height', height.toString())
  applyAttributes(element, attributes)
  return element
}

export const square = (xy: [number, number], size: number, attributes?: AttributeRecord): SVGRectElement => rect(xy, size, size, attributes)

export const circle = ([x, y]: [number, number], radius: number, attributes?: AttributeRecord): SVGCircleElement => {
  const element = document.createElementNS(svgNS, 'circle')
  element.setAttribute('cx', x.toString())
  element.setAttribute('cy', y.toString())
  element.setAttribute('r', radius.toString())
  applyAttributes(element, attributes)
  return element
}

export const group = (attributes?: AttributeRecord): SVGGElement => {
  const element = document.createElementNS(svgNS, 'g')
  applyAttributes(element, attributes)
  return element
}

export const path = (p: string, attributes?: AttributeRecord): SVGPathElement => {
  const element = document.createElementNS(svgNS, 'path')
  element.setAttribute('d', p)
  applyAttributes(element, attributes)
  return element
}

export const mask = (id: string): SVGMaskElement => {
  const element = document.createElementNS(svgNS, 'mask')
  element.setAttribute('id', id)
  return element
}

export const text = ([x, y]: [number, number], t: string, attributes?: AttributeRecord): SVGTextElement => {
  const element = document.createElementNS(svgNS, 'text')
  element.setAttribute('x', x.toString())
  element.setAttribute('y', y.toString())
  element.appendChild(document.createTextNode(t))
  applyAttributes(element, attributes)
  return element
}

export const svgIcon = (p: string, viewBox?: string, attributes?: AttributeRecord): SVGSVGElement => {
  const element = document.createElementNS(svgNS, 'svg')
  element.setAttribute('viewBox', viewBox ?? '0 0 24 24')
  const pathElement = path(p)
  element.appendChild(pathElement)
  applyAttributes(element, attributes)
  return element
}

export const polygon = (points: string, attributes?: AttributeRecord): SVGPolygonElement => {
  const element = document.createElementNS(svgNS, 'polygon')
  element.setAttribute('points', points)
  applyAttributes(element, attributes)
  return element
}

export const polyline = (points: string, attributes?: AttributeRecord): SVGPolylineElement => {
  const element = document.createElementNS(svgNS, 'polyline')
  element.setAttribute('points', points)
  applyAttributes(element, attributes)
  return element
}

export const basicElement = (tag: string, attributes?: AttributeRecord): HTMLElement => {
  const element = document.createElement(tag)
  applyAttributes(element, attributes)
  return element
}

export const addClass = (element: Element, ...classNames: string[]): void => {
  for (const className of classNames) {
    element.classList.add(className)
  }
}

export const removeClass = (element: Element, className: string): void => { element.classList.remove(className) }

export const createTranslate = (element: SVGGraphicsElement, position: [number, number] = zero): SVGTransform => {
  const svgElement = document.getElementById(svgRootId)
  if (!(svgElement instanceof SVGSVGElement)) {
    throw new Error(`Element with id '${svgRootId}' is not an SVGSVGElement`)
  }
  const transform = svgElement.createSVGTransform()
  transform.setTranslate(position[0], position[1])
  element.transform.baseVal.appendItem(transform)
  return transform
}

export const createRotate = (element: SVGGraphicsElement, angle = 0, position: [number, number] = zero): SVGTransform => {
  const svgElement = document.getElementById(svgRootId)
  if (!(svgElement instanceof SVGSVGElement)) {
    throw new Error(`Element with id '${svgRootId}' is not an SVGSVGElement`)
  }
  const transform = svgElement.createSVGTransform()
  transform.setRotate(angle, position[0], position[1])
  element.transform.baseVal.appendItem(transform)
  return transform
}

export const opacityHide = (element: SVGElement): void => {
  element.setAttribute('opacity', '0')
}

export const opacityShow = (element: SVGElement): void => {
  element.setAttribute('opacity', '1')
}
