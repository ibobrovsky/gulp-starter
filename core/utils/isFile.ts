import type { PathLike } from 'fs'
import fs from 'fs'

export function isFile(filePath: PathLike): boolean {
  try {
    const file = fs.statSync(filePath)
    if (file) {
      return !file.isDirectory()
    }
  } catch (e) {}

  return false
}
