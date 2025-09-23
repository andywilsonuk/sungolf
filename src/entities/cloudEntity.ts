import type { Vec2 } from 'planck'
import { Vec2 as Vec2Ctor } from 'planck'
import { physicsScale } from '../gameEngine/physics'
import Hsl from '../shared/hsl'
import { specialWidth } from '../terrain/constants'
import { cloudName } from '../terrain/features/names'
import { translatePhysics } from './canvasHelpers'
import type { SpecialObject } from '@/terrain/features/types'

const path = new window.Path2D('m29.21 8.5214c-0.74429-1.8202-4.2662-0.93125-4.043-3.3442-0.18212-2.08-1.4128-4.1218-3.2464-5.1576-1.9109-0.81981-3.9728 0.16709-5.9289-0.099805-1.9096-0.76909-1.3006-3.751-3.4198-4.2944-2.9294-1.0493-6.3859-0.53914-8.9409 1.1963-1.7067 0.85737-1.6282 3.0368-2.5152 4.1956-1.6395 0.74997-3.629 0.67777-5.0266 1.9534-1.2511 1.1503-1.1174 2.9844-1.8239 4.4158-1.3729 1.1287-3.8532 1.2505-4.097 3.4096-0.47916 1.9219 1.0901 4.1822 3.1838 3.9964 2.5454-5e-3 5.0892-0.12236 7.6347-0.03695 10.134-0.10644 20.006 0.67187 24.82-0.47068 4.8134-1.1426 4.5684-4.206 3.4034-5.7635z')
const offset = new Vec2Ctor(specialWidth * physicsScale * -0.5, -1)
const colorString = new Hsl(84, 11, 91).asString()

export default class CloudEntity implements SpecialObject {
  private path!: Path2D
  private visible = false
  private position!: Vec2

  get name(): string { return cloudName }

  init(): void {
    this.path = new window.Path2D(path)
  }

  show(position: Vec2): void {
    if (this.visible) { return }
    this.visible = true
    this.position = position.add(offset)
  }

  hide(): void {
    if (!this.visible) { return }
    this.visible = false
  }

  enable(): void {
  }

  disable(): void {
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    const { x, y } = this.position
    translatePhysics(ctx, x, y)

    ctx.fillStyle = colorString
    ctx.fill(this.path)
    ctx.restore()
  }
}
