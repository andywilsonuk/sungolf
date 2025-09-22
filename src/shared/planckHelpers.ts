import { Contact, Body, Fixture, BoxShape } from 'planck-js'

export const contactOtherFixture = (contact: Contact, knownBody: Body): Fixture | undefined => {
  const fixtureA = contact.getFixtureA()
  const fixtureB = contact.getFixtureB()

  if (fixtureA.getBody() === knownBody) { return fixtureB }
  if (fixtureB.getBody() === knownBody) { return fixtureA }
  return undefined
}

export const updateBoxFixtureVertices = (
  fixture: Fixture, 
  width: number, 
  height: number, 
  x: number, 
  y: number
): void => {
  const shape = fixture.getShape() as BoxShape
  shape.getVertex(0).set(x, y)
  shape.getVertex(1).set(x + width, y)
  shape.getVertex(2).set(x + width, y + height)
  shape.getVertex(3).set(x, y + height)
  fixture._reset?.()
}
