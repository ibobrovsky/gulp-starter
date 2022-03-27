import type { PathLike } from 'fs'
import fs from 'fs'

export function isDirectory(directoryPath: PathLike): boolean {
  try {
    const dir = fs.lstatSync(directoryPath)
    if (dir) {
      return dir.isDirectory()
    }
  } catch (e) {}

  return false
}
