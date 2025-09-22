import { finalStageId } from '../entities/constants'
import { randomGenerator, randomItem } from '../shared/random'
import { segmentDepthMax, ceilingDepth, floorDepth, holeTotalWidth } from './constants'
import terrainFeatures from './features'
import crag from './features/crag'
import { holeName } from './features/names'
import type { TerrainFeature } from './features/types'
import { Layout } from './layout'
import { Plotter } from './plotter'
import plotterDrift from './plotterDrift'
import plotterMinimalVertical from './plotterMinimalVertical'
import plotterSegments from './plotterSegments'

const debug = false
const featureMap = new Map(terrainFeatures.map(f => [f.name, f]))

interface StageParameters {
  initialDepth: number
  holeDepth: number
  holeDistance: number
  drift: number
  allowedFeatures: string[]
  preferCrags: boolean
  specialFeature?: {
    name: string
    distance: number
    width: number
  }
}

interface SpecialFeaturePlacement {
  name: string
  x: number
  y: number
}

export class Stage {
  id: number
  initialDepth: number
  parameters: StageParameters
  plotter: Plotter
  layout: Layout
  specialFeaturePlacement: SpecialFeaturePlacement | null

  constructor(id: number, parameters: StageParameters) {
    this.id = id
    this.initialDepth = parameters.initialDepth
    this.parameters = parameters

    this.plotter = new Plotter(ceilingDepth, floorDepth, segmentDepthMax)
    this.plotter.addAbsolutePoint(0, this.initialDepth)
    this.layout = new Layout(this.initialDepth)
    this.specialFeaturePlacement = null
  }

  layoutSegments(): void {
    if (debug) { console.log(`---> stage ${this.id}`, Object.entries(this.parameters)) }
    const { holeDepth, holeDistance, drift, allowedFeatures, preferCrags, specialFeature } = this.parameters
    const features = allowedFeatures.map(name => featureMap.get(name)!).filter(f => f)

    const segmentMarkers: Array<{
      segment: TerrainFeature
      distance: number
      relativeX: number
    }> = []

    if (this.id !== finalStageId) {
      segmentMarkers.push({ segment: featureMap.get(holeName)!, distance: holeDistance, relativeX: holeTotalWidth })
    }
    if (specialFeature !== undefined) {
      const { name, distance, width } = specialFeature
      let distance2 = distance
      if (distance + width > holeDistance) {
        distance2 = holeDistance - width
      }
      segmentMarkers.push({
        segment: featureMap.get(name)!,
        distance: distance2,
        relativeX: width
      })
    }

    const randPlotter = randomGenerator(`plotter${this.id}`)
    plotterSegments(this.plotter, segmentMarkers, randPlotter)
    plotterMinimalVertical(this.plotter, holeDepth, randPlotter)
    plotterDrift(this.plotter, drift, randPlotter)

    const randSelection = randomGenerator(`selection${this.id}`)

    for (let i = 1; i < this.plotter.count; i++) { // skip the initial point
      const p = this.plotter.getByIndex(i)
      let { segment } = p

      if (segment === null) {
        const allowed = features.filter(s => s.allowed(p))
        if (allowed.length === 0) {
          console.warn('No features allowed', p)
        }
        const cragSegment = preferCrags ? allowed.find(x => x === crag) : undefined
        segment = cragSegment ?? randomItem(randSelection, allowed)
        p.setSegment(segment!)
      }
      segment!.apply(this.layout, p, randSelection)

      if (segment!.isSpecial) {
        this.specialFeaturePlacement = { name: segment!.name, x: p.x, y: p.y }
      }
      if (debug) { console.log(`${segment!.name} w${p.relativeX} h${p.relativeY} x${p.x} y${p.y}`) }
    }

    this.layout.finalise()

    if (debug) { console.log(this.layout.commands) }
  }

  get distance(): number {
    return this.plotter.last!.x
  }

  get commands(): Array<{ command: string; x: number; y: number }> {
    return this.layout.commands
  }
}
