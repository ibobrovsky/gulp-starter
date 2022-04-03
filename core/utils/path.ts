import { resolve, join } from 'path'

export const rootDir: string = resolve(__dirname, '../../')

export const nodeModulesDir: string = join(rootDir, 'node_modules')

export const srcDir: string = join(rootDir, 'src')

export const distDir: string = join(rootDir, 'dist')

export const coreDir: string = join(rootDir, 'core')

export const tasksDir: string = join(coreDir, 'tasks')

export const componentsDir: string = join(srcDir, 'components')

export const pagesDir: string = join(srcDir, 'pages')

export const publicDir: string = join(srcDir, 'public')

export function joinRootDir(...args: string[]): string {
  return join(rootDir, ...args)
}

export function joinNodeModulesDir(...args: string[]): string {
  return join(nodeModulesDir, ...args)
}

export function joinSrcDir(...args: string[]): string {
  return join(srcDir, ...args)
}

export function joinDistDir(...args: string[]): string {
  return join(distDir, ...args)
}

export function joinCoreDir(...args: string[]): string {
  return join(coreDir, ...args)
}

export function joinTasksDir(...args: string[]): string {
  return join(tasksDir, ...args)
}

export function joinComponentsDir(...args: string[]): string {
  return join(componentsDir, ...args)
}

export function joinPageDir(...args: string[]): string {
  return join(pagesDir, ...args)
}

export function joinPublicDir(...args: string[]): string {
  return join(publicDir, ...args)
}
