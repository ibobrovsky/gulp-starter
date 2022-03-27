import path, { resolve, join } from 'path'
import trimStart from 'lodash/trimStart'

export default class PathsHelper {
  static rootDir: string = resolve(__dirname, '../../')

  static nodeModulesDir: string = join(this.rootDir, 'node_modules')

  static srcDir: string = join(this.rootDir, 'src')

  static distDir: string = join(this.rootDir, 'dist')

  static coreDir: string = join(this.rootDir, 'core')

  static coreTmpDir: string = join(this.coreDir, 'tmp')

  static tasksDir: string = join(this.coreDir, 'tasks')

  static componentsDir: string = join(this.srcDir, 'components')

  static pagesDir: string = join(this.srcDir, 'pages')

  static publicDir: string = join(this.srcDir, 'public')

  static joinRootDir(...args: string[]): string {
    return join(this.rootDir, ...args)
  }

  static joinNodeModulesDir(...args: string[]): string {
    return join(this.nodeModulesDir, ...args)
  }

  static joinSrcDir(...args: string[]): string {
    return join(this.srcDir, ...args)
  }

  static joinDistDir(...args: string[]): string {
    return join(this.distDir, ...args)
  }

  static joinCoreDir(...args: string[]): string {
    return join(this.coreDir, ...args)
  }

  static joinCoreTmpDir(...args: string[]): string {
    return join(this.coreTmpDir, ...args)
  }

  static joinTasksDir(...args: string[]): string {
    return join(this.tasksDir, ...args)
  }

  static joinComponentsDir(...args: string[]): string {
    return join(this.componentsDir, ...args)
  }

  static joinPageDir(...args: string[]): string {
    return join(this.pagesDir, ...args)
  }

  static joinPublicDir(...args: string[]): string {
    return join(this.publicDir, ...args)
  }

  static isSrcAlias(path: string): boolean {
    return path.substring(0, 1) === '@'
  }

  static isComponentsAlias(path: string): boolean {
    return path.substring(0, 2) === '@@'
  }

  static isAlias(path: string): boolean {
    return this.isComponentsAlias(path) || this.isSrcAlias(path)
  }

  static getAliasPath(path: string): string {
    if (this.isComponentsAlias(path)) {
      return this.joinComponentsDir(path.substring(2))
    } else if (this.isSrcAlias(path)) {
      return this.joinSrcDir(path.substring(1))
    }

    return path
  }

  static getComponentName(filePath: string): string | undefined {
    if (!filePath.includes(this.componentsDir)) {
      return
    }

    const componentPath = filePath.substring(this.componentsDir.length)
    const arr = componentPath.split(path.sep).filter((str) => str.trim().length)
    return arr[0] || undefined
  }
}
