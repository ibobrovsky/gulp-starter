import { config } from '../../config'
import path from 'path'
import { getPath, isAlias } from '../aliases'
import { joinNodeModulesDir } from '../path'
import { isFile } from '../isFile'
import { logError, logWarn } from '../log'
import store from '../../store'
import getDepsComponents from './getDepsComponents'

export interface IStyles {
  [key: string]: string[]
}

export const getBundleStyles = (): string[] => {
  const bundleName = config.build.bundleName

  const globalStyles = getGlobalStyles()

  const bundleStyles: string[] = [...globalStyles]

  store.pages.getItems().forEach((page) => {
    if (bundleName === page.name) {
      logWarn(
        `Page name matches bundle name. Please rename page "${page.name}" or rename bundle name`,
      )
    }

    getDepsComponents(page.components).forEach(({ style }) => {
      if (!style) {
        return
      }

      if (!bundleStyles.includes(style)) {
        bundleStyles.push(style)
      }
    })
  })

  return bundleStyles
}

export const getSplitStyles = (): IStyles => {
  const bundleName = config.build.bundleName
  const templateBundleName = config.build.templateBundleName

  const styles: IStyles = {
    [bundleName]: getBundleStyles(),
  }

  const globalStyles = getGlobalStyles()

  const depsTemplateComponents = getDepsComponents(
    config.build.layoutComponents,
  )

  const templateStyles: string[] = (styles[templateBundleName] = [
    ...globalStyles,
  ])

  depsTemplateComponents.forEach(({ style }) => {
    if (!style) {
      return
    }

    if (!templateStyles.includes(style)) {
      templateStyles.push(style)
    }
  })

  const templateComponentsNames: string[] = depsTemplateComponents.map(
    ({ name }) => name,
  )

  store.pages.getItems().forEach((page) => {
    const pageStyles: string[] = (styles[page.name] = [])

    getDepsComponents(page.components).forEach(({ name, style }) => {
      if (!style || templateComponentsNames.includes(name)) {
        return
      }

      if (!pageStyles.includes(style)) {
        pageStyles.push(style)
      }
    })
  })

  return styles
}

function getGlobalStyles(): string[] {
  const styles: string[] = []

  let globalStyles = config.globalStyles
  if (!Array.isArray(globalStyles)) {
    globalStyles = [globalStyles]
  }

  globalStyles.forEach((stylePath) => {
    if (!stylePath) {
      return
    }

    let file = isAlias(stylePath)
      ? getPath(stylePath)
      : path.isAbsolute(stylePath)
      ? stylePath
      : joinNodeModulesDir(stylePath)

    if (!isFile(file)) {
      return logError(
        `\n\x1b[41mFAIL\x1b[0m: Global style for import "\x1b[36m${stylePath}\x1b[0m" not found!\nFullpath: "${file}"\n`,
      )
    }
    styles.push(file)
  })

  return styles
}
