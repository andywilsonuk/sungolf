import { Stage } from './stage'
import orchestration from '../orchestration'

interface TerrainResult {
  commands: { command: string }[]
  path: string
  startY: number
  distance: number
  special?: {
    name: string
    x: number
    y: number
  } | null
}

export default (stageId: number): TerrainResult => {
  const parameters = orchestration(stageId)
  const stage = new Stage(stageId, parameters)

  stage.layoutSegments()

  const commands = stage.commands
  const path = commands.map(({ command }) => command).join(' ')

  return { commands, path, startY: parameters.initialDepth, distance: stage.distance, special: stage.specialFeaturePlacement }
}
