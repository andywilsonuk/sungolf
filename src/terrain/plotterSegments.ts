import { randomInt } from '../shared/random'
import { segmentDistanceMax, segmentDistanceMin } from './constants'
import type { Plotter } from './plotter'
import type { TerrainFeature } from './features/types'

interface SegmentMarker {
  segment: TerrainFeature
  distance: number
  relativeX: number
}

export default (plotter: Plotter, segmentMarkers: SegmentMarker[], rand: () => number): void => {
  let current = 0
  const remainingMarkers = [...segmentMarkers]
  remainingMarkers.sort((a, b) => a.distance - b.distance)

  while (remainingMarkers.length !== 0) {
    const nearestMarker = remainingMarkers[0]
    const { distance: nearestDistance } = nearestMarker

    if (current + segmentDistanceMin >= nearestDistance) {
      remainingMarkers.splice(0, 1)
      const point = plotter.addRelativePoint(nearestMarker.relativeX, 0)
      point.setSegment(nearestMarker.segment)
      current += nearestMarker.relativeX
      continue
    }

    const remaining = nearestDistance - current
    const maxDistance = Math.min(remaining, segmentDistanceMax)
    const distance = randomInt(rand, segmentDistanceMin, maxDistance)
    plotter.addRelativePoint(distance, 0)
    current += distance
  }
}
