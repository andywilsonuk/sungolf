import { physicsScale } from '../gameEngine/physics'
import { applyPixelScale, applyRatioScale, heightPadding } from '../gameEngine/renderCanvas'
import Hsl from '../shared/hsl'

const lineWidth = 0.01
const fixtureAlpha = 0.5
export const physicsScaleInverse = 1 / physicsScale

const colorMap = new Map()
const colors = [
  new Hsl(4, 84, 57),
  new Hsl(198, 97, 41),
  new Hsl(29, 96, 49),
  new Hsl(58, 99, 50),
  new Hsl(82, 94, 39)
].map(color => color.asString(fixtureAlpha))
let colorNext = 0
const getColor = (body) => {
  const existing = colorMap.get(body)
  if (existing !== undefined) { return existing }
  colorMap.set(body, colors[colorNext])
  colorNext = (colorNext + 1) % colors.length
  return colorMap.get(body)
}

const drawPolygon = (ctx, body, shape) => {
  const vertices = shape.m_vertices
  if (!vertices.length) {
    return
  }

  const { x, y } = body.getPosition()

  ctx.translate(x + lineWidth * 2, y + lineWidth * 2)
  ctx.beginPath()
  for (let i = 0; i < vertices.length; ++i) {
    const v = vertices[i]
    const x = v.x - lineWidth
    const y = v.y - lineWidth
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  if (vertices.length > 2) {
    ctx.closePath()
  }

  ctx.fill()
  ctx.stroke()
}

const drawCircle = (ctx, body, shape) => {
  const radius = shape.m_radius
  const { x, y } = body.getPosition()

  circle(ctx, radius, x + lineWidth, y + lineWidth)
  ctx.stroke()
  ctx.fill()
}

export const debugBodyRender = (ctx, body, applyOffsetY = false) => {
  const debugRenderStrokeColor = new Hsl(0, 0, 0)

  for (
    let fixture = body.getFixtureList();
    fixture;
    fixture = fixture.getNext()
  ) {
    const type = fixture.getType()
    const shape = fixture.getShape()
    const isActive = body.isActive()
    const color = getColor(body)

    ctx.save()
    applyPixelScale(ctx)
    applyRatioScale(ctx)
    if (applyOffsetY) {
      translateHeightPadding(ctx)
    }
    scalePhysics(ctx)
    ctx.strokeStyle = debugRenderStrokeColor.asString()

    if (isActive) {
      ctx.fillStyle = color
    } else {
      ctx.fillStyle = debugRenderStrokeColor.asString(0.2)
      ctx.setLineDash([5 * physicsScale, 4 * physicsScale])
    }
    ctx.lineWidth = lineWidth

    if (type === 'circle') {
      drawCircle(ctx, body, shape)
    } else {
      drawPolygon(ctx, body, shape)
    }
    ctx.restore()
  }
}

export const debugHorizontalLine = (ctx, y) => {
  ctx.save()
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, y, 1000, 1)
  ctx.restore()
}

export const scalePixelRatio = (ctx) => {
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
}

export const scalePhysics = (ctx) => {
  ctx.scale(physicsScaleInverse, physicsScaleInverse)
}
export const translatePhysics = (ctx, x, y) => {
  ctx.translate(x * physicsScaleInverse, y * physicsScaleInverse)
}
export const translateHeightPadding = (ctx) => {
  ctx.translate(0, -heightPadding())
}

export const flipHorizontal = (ctx) => {
  ctx.scale(-1, 1)
}

export const circle = (ctx, radius, x = 0, y = 0) => {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.closePath()
}
