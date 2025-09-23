import type { Contact, Body, Fixture, Box } from 'planck'

export const contactOtherFixture = (contact: Contact, knownBody: Body): Fixture | undefined => {
  const fixtureA = contact.getFixtureA()
  const fixtureB = contact.getFixtureB()

  if (fixtureA.getBody() === knownBody) { return fixtureB }
  if (fixtureB.getBody() === knownBody) { return fixtureA }
  return undefined
}

export const updateBoxFixtureVertices = (fixture: Fixture, width: number, height: number, x: number, y: number): void => {
  const shape = fixture.getShape() as Box
  shape.m_vertices[0].set(x, y)
  shape.m_vertices[1].set(x + width, y)
  shape.m_vertices[2].set(x + width, y + height)
  shape.m_vertices[3].set(x, y + height)
  fixture._reset()
}
