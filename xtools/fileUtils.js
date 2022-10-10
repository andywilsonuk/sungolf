import { mkdir, rm, stat } from 'fs/promises'

export const removeReservedCharacters = (input) => input.replace(/[/\\?%*:|"<>]/g, '-')

export const removeFolder = async (path) => {
  await rm(path, { recursive: true, force: true })
}

export const folderExists = async path => !!(await stat(path).catch(e => false))

export const createFolder = async (path) => {
  if (await folderExists(path)) { return }
  await mkdir(path)
}
