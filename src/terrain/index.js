import { Stage } from './stage'
import orchestration from '../orchestration'

export default (stageId) => {
  const parameters = orchestration(stageId)
  const stage = new Stage(stageId, parameters)

  stage.layoutSegments()

  const commands = stage.commands
  const path = commands.map(({ command }) => command).join(' ')

  return { commands, path, startY: parameters.initialDepth, distance: stage.distance, special: stage.specialFeaturePlacement }
}
