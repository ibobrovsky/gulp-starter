import path from 'path'
import { componentsDir } from '../path'

const getComponentNameFromPath = (filePath: string): string | null => {
  if (!filePath.includes(componentsDir)) {
    return null
  }

  const componentPath = filePath.substring(componentsDir.length)
  const arr = componentPath.split(path.sep).filter((str) => str.trim().length)
  return arr[0] || null
}

export default getComponentNameFromPath
