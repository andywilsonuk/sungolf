const entities = []
const beginFrameEntities = []
const updateEntities = []
const renderEntities = []
const endFrameEntities = []
const tags = new Map()
const empty = []

export const addEntity = (entity) => {
  entities.push(entity)

  if (entity.tags) {
    entity.tags.forEach((tag) => {
      if (tags.has(tag)) {
        tags.get(tag).push(entity)
      } else {
        tags.set(tag, [entity])
      }
    })
  }

  if (entity.beginFrame) {
    beginFrameEntities.push(entity)
  }
  if (entity.update) {
    updateEntities.push(entity)
  }
  if (entity.render) {
    renderEntities.push(entity)
  }
  if (entity.endFrame) {
    endFrameEntities.push(entity)
  }

  return entity
}

export const getEntityByTag = (tag) => tags.get(tag) ?? empty
export const getOneEntityByTag = (tag) => tags.get(tag)[0]

const init = () => {
  const spawned = []

  let nextSpawn = entities.filter((en) => en.spawn).filter(en => spawned.indexOf(en) === -1)
  while (nextSpawn.length !== 0) {
    nextSpawn.forEach(en => en.spawn())
    spawned.push(...nextSpawn)
    nextSpawn = entities.filter((en) => en.spawn).filter(en => spawned.indexOf(en) === -1)
  }

  entities.filter((en) => en.init).forEach((en) => en.init())
}

const renderInitial = () => {
  entities.filter((en) => en.renderInitial).forEach((en) => en.renderInitial())
}

const beginFrame = (timestamp) => {
  const { length } = beginFrameEntities
  for (let i = 0; i < length; i++) {
    beginFrameEntities[i].beginFrame(timestamp)
  }
}

const update = (deltaTime) => {
  const { length } = updateEntities
  for (let i = 0; i < length; i++) {
    updateEntities[i].update(deltaTime)
  }
}

const render = () => {
  const { length } = renderEntities
  for (let i = 0; i < length; i++) {
    renderEntities[i].render()
  }
}

const endFrame = () => {
  const { length } = endFrameEntities
  for (let i = 0; i < length; i++) {
    endFrameEntities[i].endFrame()
  }
}

const clear = () => {
  entities.filter((en) => en.destroy).forEach((en) => en.destroy())
  entities.length = 0
  beginFrameEntities.length = 0
  updateEntities.length = 0
  renderEntities.length = 0
  endFrameEntities.length = 0
  tags.clear()
}

export default {
  init,
  renderInitial,
  beginFrame,
  update,
  render,
  endFrame,
  clear
}
