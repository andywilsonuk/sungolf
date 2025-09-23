interface Entity {
  tags?: string[] | Set<string>
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
const beginFrameFunctions: ((timestamp: number) => void)[] = []
const updateFunctions: ((deltaTime: number) => void)[] = []
const renderFunctions: (() => void)[] = []
const endFrameFunctions: (() => void)[] = []
const tags = new Map<string, Entity[]>()
const empty: Entity[] = []

export const addEntity = (entity: Entity): Entity => {
  entities.push(entity)

  if (entity.tags) {
    const tagList = Array.isArray(entity.tags) ? entity.tags : Array.from(entity.tags)
    tagList.forEach((tag) => {
      if (tags.has(tag)) {
        tags.get(tag)?.push(entity)
      } else {
        tags.set(tag, [entity])
      }
    })
  }

  if (entity.beginFrame) {
    beginFrameFunctions.push(entity.beginFrame.bind(entity))
  }
  if (entity.update) {
    updateFunctions.push(entity.update.bind(entity))
  }
  if (entity.render) {
    renderFunctions.push(entity.render.bind(entity))
  }
  if (entity.endFrame) {
    endFrameFunctions.push(entity.endFrame.bind(entity))
  }

  return entity
}

export const getEntityByTag = (tag: string): Entity[] => tags.get(tag) ?? empty
export const getOneEntityByTag = (tag: string): Entity => {
  const entityList = tags.get(tag)
  if (!entityList || entityList.length === 0) {
    throw new Error(`No entity found with tag: ${tag}`)
  }
  return entityList[0]
}

const init = (): void => {
  const spawned: Entity[] = []

  let nextSpawn = entities.filter((en) => en.spawn !== undefined).filter((en) => !spawned.includes(en))
  while (nextSpawn.length !== 0) {
    nextSpawn.forEach((en) => {
      if (en.spawn === undefined) { return }
      en.spawn()
    })
    spawned.push(...nextSpawn)
    nextSpawn = entities.filter((en) => en.spawn !== undefined).filter((en) => !spawned.includes(en))
  }

  entities.forEach((en) => {
    if (en.init === undefined) { return }
    en.init()
  })
}

const renderInitial = (): void => {
  entities.forEach((en) => {
    if (en.renderInitial === undefined) { return }
    en.renderInitial()
  })
}

const beginFrame = (timestamp: number): void => {
  const { length } = beginFrameFunctions
  for (let i = 0; i < length; i++) {
    const fn = beginFrameFunctions[i]
    fn(timestamp)
  }
}

const update = (deltaTime: number): void => {
  const { length } = updateFunctions
  for (let i = 0; i < length; i++) {
    const fn = updateFunctions[i]
    fn(deltaTime)
  }
}

const render = (): void => {
  const { length } = renderFunctions
  for (let i = 0; i < length; i++) {
    const fn = renderFunctions[i]
    fn()
  }
}

const endFrame = (): void => {
  const { length } = endFrameFunctions
  for (let i = 0; i < length; i++) {
    const fn = endFrameFunctions[i]
    fn()
  }
}

const clear = (): void => {
  entities.forEach((en) => {
    if (en.destroy === undefined) { return }
    en.destroy()
  })
  entities.length = 0
  beginFrameFunctions.length = 0
  updateFunctions.length = 0
  renderFunctions.length = 0
  endFrameFunctions.length = 0
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
