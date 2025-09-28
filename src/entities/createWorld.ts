import { addEntity } from '../gameEngine/world'
import BoundaryEntity from './boundaryEntity'
import DevtoolsEntity from './devtoolsEntity'
import TitlesEntity from './titlesEntity'
import DynamicsEntity from './dynamicsEntity'
import PullbackEntity from './pullbackEntity'
import ScoreEntity from './scoreEntity'
import StateEntity from './stateEntity'
import OptionsEntity from './optionsEntity'
import BackgroundEntity from './backgroundEntity'
import TopographyEntity from './topographyEntity'
import HoleEntity from './holeEntity'
import HorizonEntity from './horizonEntity'

export default (): void => {
  addEntity(new StateEntity())
  addEntity(new BoundaryEntity())
  addEntity(new HoleEntity())
  addEntity(new BackgroundEntity())
  addEntity(new TopographyEntity())
  addEntity(new DynamicsEntity())
  addEntity(new HorizonEntity())
  addEntity(new PullbackEntity())
  addEntity(new ScoreEntity())
  addEntity(new OptionsEntity())
  addEntity(new TitlesEntity())
  addEntity(new DevtoolsEntity())
}
