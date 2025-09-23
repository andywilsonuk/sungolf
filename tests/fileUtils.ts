import { mkdir, rm, stat } from 'fs/promises'

export const removeReservedCharacters = (input: string): string => input.replace(/[/\\?%*:|"<>]/g, '-')

export const removeFolder = async (path: string): Promise<void> => {
  await rm(path, { recursive: true, force: true })
}

export const folderExists = async (path: string): Promise<boolean> => !!(await stat(path).catch(() => false))

export const createFolder = async (path: string): Promise<void> => {
  if (await folderExists(path)) { return }
  await mkdir(path)
}
