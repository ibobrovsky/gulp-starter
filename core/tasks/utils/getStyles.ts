import { appConfig, defaultConfig } from '../../config'
import PathsHelper from '../../helpers/PathsHelper'
import path from 'path'
import { isFile } from '../../utils/isFile'
import LogHelper from '../../helpers/Log'
import store from '../../store'

interface IStyles {
  [key: string]: string[]
}

const getStyles = (): IStyles => {
  const bundleName =
    appConfig.build?.bundleName || defaultConfig.build.bundleName

  const styles: IStyles = {}

  const globalStyles = getGlobalStyles()

  const mainStyles = (styles[bundleName] = [...globalStyles])

  Object.keys(store.pages.items).forEach((pageName) => {
    const page = store.pages.items[pageName]
    if (!page) {
      return
    }

    const pageStyles = (styles[pageName] = [...globalStyles])

    page.components?.forEach((componentName) => {
      const component = store.components[componentName]
      if (!component) {
        return
      }

      component.imports?.styles.forEach((importsStyles) => {
        if (!pageStyles.includes(importsStyles.path)) {
          pageStyles.push(importsStyles.path)
        }
        if (!mainStyles.includes(importsStyles.path)) {
          mainStyles.push(importsStyles.path)
        }
      })
      if (component.style) {
        if (!pageStyles.includes(component.style)) {
          pageStyles.push(component.style)
        }
        if (!mainStyles.includes(component.style)) {
          mainStyles.push(component.style)
        }
      }
    })
  })

  return styles
}

export default getStyles

function getGlobalStyles(): string[] {
  const styles: string[] = []

  let globalStyles = appConfig.globalStyles || defaultConfig.globalStyles
  if (!Array.isArray(globalStyles)) {
    globalStyles = [globalStyles]
  }

  globalStyles.forEach((stylePath) => {
    if (!stylePath) {
      return
    }

    let file = PathsHelper.isAlias(stylePath)
      ? PathsHelper.getAliasPath(stylePath)
      : path.isAbsolute(stylePath)
      ? stylePath
      : PathsHelper.joinNodeModulesDir(stylePath)

    if (!isFile(file)) {
      return LogHelper.logError(
        `\n\x1b[41mFAIL\x1b[0m: Global style for import "\x1b[36m${stylePath}\x1b[0m" not found!\nFullpath: "${file}"\n`,
      )
    }
    styles.push(file)
  })

  return styles
}
