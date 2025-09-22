interface Entity {
  tags?: string[]
  spawn?(): void
  init?(): void
  renderInitial?(): void
  beginFrame?(timestamp: number): void
  update?(deltaTime: number): void
  render?(): void
  endFrame?(): void
  destroy?(): void
}

const entities: Entity[] = []
const beginFrameEntities: Entity[] = []
const updateEntities: Entity[] = []
const renderEntities: Entity[] = []
const endFrameEntities: Entity[] = []
const tags = new Map<string, Entity[]>()
const empty: Entity[] = []

export const addEntity = (entity: Entity): Entity => {
  entities.push(entity)

  if (entity.tags) {
    entity.tags.forEach((tag) => {
      if (tags.has(tag)) {
        tags.get(tag)!.push(entity)
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

export const getEntityByTag = (tag: string): Entity[] => tags.get(tag) ?? empty
export const getOneEntityByTag = (tag: string): Entity => tags.get(tag)![0]

const init = (): void => {
  const spawned: Entity[] = []

  let nextSpawn = entities.filter((en) => en.spawn).filter((en) => !spawned.includes(en))
  while (nextSpawn.length !== 0) {
    nextSpawn.forEach((en) => { en.spawn!() })
    spawned.push(...nextSpawn)
    nextSpawn = entities.filter((en) => en.spawn).filter((en) => !spawned.includes(en))
  }

  entities.filter((en) => en.init).forEach((en) => { en.init!() })
}

const renderInitial = (): void => {
  entities.filter((en) => en.renderInitial).forEach((en) => { en.renderInitial!() })
}

const beginFrame = (timestamp: number): void => {
  const { length } = beginFrameEntities
  for (let i = 0; i < length; i++) {
    beginFrameEntities[i].beginFrame!(timestamp)
  }
}

const update = (deltaTime: number): void => {
  const { length } = updateEntities
  for (let i = 0; i < length; i++) {
    updateEntities[i].update!(deltaTime)
  }
}

const render = (): void => {
  const { length } = renderEntities
  for (let i = 0; i < length; i++) {
    renderEntities[i].render!()
  }
}

const endFrame = (): void => {
  const { length } = endFrameEntities
  for (let i = 0; i < length; i++) {
    endFrameEntities[i].endFrame!()
  }
}

const clear = (): void => {
  entities.filter((en) => en.destroy).forEach((en) => { en.destroy!() })
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
  clear,
}
