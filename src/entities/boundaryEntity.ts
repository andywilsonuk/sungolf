import { Polygon, Vec2, type Body, type Fixture } from 'planck-js'
import { createBody, physicsScale } from '../gameEngine/physics'
import { subscribeResize } from '../gameEngine/renderCanvas'
import { updateBoxFixtureVertices } from '../shared/planckHelpers'
import { boundaryCategory } from './constants'

const createBoundaryBox = (body: Body): Fixture =>
  body.createFixture(Polygon([Vec2.zero(), Vec2.zero(), Vec2.zero(), Vec2.zero()]), {
    isSensor: true,
    filterCategoryBits: boundaryCategory,
  })

export default class BoundaryEntity {
  boundaryBody!: Body
  leftBoundary!: Fixture
  rightBoundary!: Fixture
  topBoundary!: Fixture
  bottomBoundary!: Fixture

  init(): void {
    this.boundaryBody = createBody({ })
    this.leftBoundary = createBoundaryBox(this.boundaryBody)
    this.rightBoundary = createBoundaryBox(this.boundaryBody)
    this.topBoundary = createBoundaryBox(this.boundaryBody)
    this.bottomBoundary = createBoundaryBox(this.boundaryBody)

    subscribeResize(this.onResize.bind(this))
  }

  onResize({ width, height }: { width: number, height: number }): void {
    const sceneWidth = width * physicsScale
    const sceneHeight = height * physicsScale
    const boundaryThickness = 50 * physicsScale
    updateBoxFixtureVertices(this.leftBoundary, boundaryThickness, sceneHeight * 2, -boundaryThickness - 0.05, sceneHeight * -1)
    updateBoxFixtureVertices(this.rightBoundary, boundaryThickness, sceneHeight * 2, sceneWidth, sceneHeight * -1)
    updateBoxFixtureVertices(this.topBoundary, sceneWidth * 2, boundaryThickness, sceneWidth * -0.5, -sceneHeight) // top is way up in the sky
    updateBoxFixtureVertices(this.bottomBoundary, sceneWidth * 2, boundaryThickness, sceneWidth * -0.5, sceneHeight - 0.05)
  }
}
