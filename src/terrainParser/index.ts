import { Settings, Vec2 } from 'planck-js'
import { quickDecomp, removeCollinearPoints } from 'poly-decomp'
import debugLog from '../gameEngine/debugLog'
import { physicsScale } from '../gameEngine/physics'
import { absoluteFloorDepth } from '../terrain/constants'

// References:
// https://github.com/liabru/matter-js/blob/master/src/factory/Bodies.js
// https://github.com/wout/svg.topoly.js/blob/master/svg.topoly.js

interface PathCommand {
  command: string
  x: number
  y: number
}

type Point = [number, number]

const svgNS = 'http://www.w3.org/2000/svg'
const curved = new Set(['C', 'T', 'S', 'Q', 'A'])
const lineSampleLength = 50
const curveSampleLength = 19
const minimumArea = 45

const commandsToPoints = (commands: PathCommand[]): Point[] => {
  const element = document.createElementNS(svgNS, 'path') as SVGPathElement
  const points: Point[] = []
  let previousLength = 0
  let currentPath = ''

  commands.forEach(({ command, x, y }) => {
    currentPath += command
    element.setAttribute('d', currentPath)
    const commandLetter = command[0]
    const isCurved = curved.has(commandLetter)
    const newLength = element.getTotalLength()
    let accumulation = newLength - previousLength
    let currentLength = previousLength
    const sampleLength = isCurved ? curveSampleLength : lineSampleLength

    while (accumulation > sampleLength) {
      currentLength += sampleLength
      const { x: px, y: py } = element.getPointAtLength(currentLength)
      points.push([px, py])
      accumulation -= sampleLength
    }

    points.push([x, y])
    previousLength = newLength
  })

  return points
}

const area = (vertices: Point[]): number => {
  let area = 0
  let j = vertices.length - 1

  for (let i = 0; i < vertices.length; i++) {
    area += (vertices[j][0] - vertices[i][0]) * (vertices[j][1] + vertices[i][1])
    j = i
  }

  return Math.abs(area) * 0.5
}

const filterMinArea = (chunk: Point[], minimumArea: number): boolean => area(chunk) >= minimumArea

const filter3PointsMin = (chunk: Point[]): boolean => chunk.length > 2

const roundPoints = (chunk: Point[]): void => {
  chunk.forEach(point => {
    point[0] = Math.round(point[0])
    point[1] = Math.round(point[1])
  })
}

const validateParts = (parts: Point[][], stageId: number): void => {
  const roundingGrace = 1
  const maxY = absoluteFloorDepth + roundingGrace
  parts.forEach(chunkVertices => {
    if (chunkVertices.some(([_x, y]) => y > maxY)) {
      debugLog(`Stage ${stageId}: Bad y: ${JSON.stringify(chunkVertices)}`)
    }
    if (chunkVertices.length > Settings.maxPolygonVertices) {
      debugLog(`Stage ${stageId}: Vertex count ${chunkVertices.length} exceeded ${Settings.maxPolygonVertices}: ${JSON.stringify(chunkVertices)}`)
    }
  })
}

export default (commands: PathCommand[], stageId: number) => {
  const concave = commandsToPoints(commands)
  let chunks = quickDecomp(concave)
  chunks.forEach(chunk => {
    roundPoints(chunk)
    removeCollinearPoints(chunk, 0)
  })
  chunks = chunks.filter(chunk => filter3PointsMin(chunk))
  chunks = chunks.filter(chunk => filterMinArea(chunk, minimumArea))
  validateParts(chunks, stageId)

  const result = chunks.map(chunkVertices => chunkVertices.map(([x, y]) => Vec2(x * physicsScale, y * physicsScale)))
  return result
}
