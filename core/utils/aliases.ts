import { joinComponentsDir, joinSrcDir } from './path'

export function isAlias(filePath: string): boolean {
  return isComponentsAlias(filePath) || isSrcAlias(filePath)
}

export function getPath(alias: string): string {
  if (isComponentsAlias(alias)) {
    return joinComponentsDir(alias.substring(2))
  } else if (isSrcAlias(alias)) {
    return joinSrcDir(alias.substring(1))
  }

  return alias
}

function isSrcAlias(filePath: string): boolean {
  return filePath.substring(0, 1) === '@'
}

function isComponentsAlias(filePath: string): boolean {
  return filePath.substring(0, 2) === '@@'
}
