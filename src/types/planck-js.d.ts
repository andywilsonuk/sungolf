// Type definitions for planck-js library
declare module 'planck-js' {
  export interface Vec2Constructor {
    new (x?: number, y?: number): Vec2
    (x?: number, y?: number): Vec2
  }

  export interface Vec2 {
    x: number
    y: number
    set(x: number, y: number): Vec2
    add(other: Vec2): Vec2
    sub(other: Vec2): Vec2
    mul(scalar: number): Vec2
    length(): number
    lengthSquared(): number
    normalize(): Vec2
    clone(): Vec2
  }

  export const Vec2: Vec2Constructor

  export interface Body {
    setPosition(position: Vec2): void
    getPosition(): Vec2
    setLinearVelocity(velocity: Vec2): void
    getLinearVelocity(): Vec2
    setActive(active: boolean): void
    setAwake(awake: boolean): void
    getWorld(): World
    createFixture(shape: Shape, density?: number): Fixture
    destroyFixture(fixture: Fixture): void
    setUserData(data: unknown): void
    getUserData(): unknown
    applyLinearImpulse(impulse: Vec2, point?: Vec2, wake?: boolean): void
  }

  export interface Fixture {
    getBody(): Body
    getShape(): Shape
    setUserData(data: unknown): void
    getUserData(): unknown
    _reset?(): void
  }

  export interface Shape {
    getType(): string
    getVertex?(index: number): Vec2
  }

  export interface BoxShape extends Shape {
    getVertex(index: number): Vec2
  }

  export interface CircleShape extends Shape {
    getRadius(): number
    getCenter(): Vec2
  }

  export interface Contact {
    getFixtureA(): Fixture
    getFixtureB(): Fixture
    getManifold(): Manifold
  }

  export interface Manifold {
    pointCount: number
  }

  export interface World {
    createBody(def?: BodyDef): Body
    destroyBody(body: Body): void
    step(timeStep: number, velocityIterations?: number, positionIterations?: number): void
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void
  }

  export interface BodyDef {
    type?: string
    position?: Vec2
    angle?: number
    userData?: unknown
  }

  export interface Settings {
    maxPolygonVertices: number
  }

  export const Settings: Settings

  export interface BoxConstructor {
    new (hx: number, hy: number, center?: Vec2, angle?: number): BoxShape
    (hx: number, hy: number, center?: Vec2, angle?: number): BoxShape
  }

  export const Box: BoxConstructor

  export interface CircleConstructor {
    new (radius: number, center?: Vec2): CircleShape
    (radius: number, center?: Vec2): CircleShape
  }

  export const Circle: CircleConstructor

  export interface PolygonConstructor {
    new (vertices: Vec2[]): Shape
    (vertices: Vec2[]): Shape
  }

  export const Polygon: PolygonConstructor

  export interface WorldConstructor {
    new (gravity?: Vec2): World
    (gravity?: Vec2): World
  }

  export const World: WorldConstructor
}
