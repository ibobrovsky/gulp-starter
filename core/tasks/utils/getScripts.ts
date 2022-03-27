import { appConfig, defaultConfig } from '../../config'
import PathsHelper from '../../helpers/PathsHelper'
import path from 'path'
import { isFile } from '../../utils/isFile'
import LogHelper from '../../helpers/Log'
import store from '../../store'

interface IScripts {
  [key: string]: string[]
}

const getScripts = (): IScripts => {
  const bundleName =
    appConfig.build?.bundleName || defaultConfig.build.bundleName

  const scripts: IScripts = {}

  const globalScripts = getGlobalScripts()

  const mainScripts = (scripts[bundleName] = [...globalScripts])

  Object.keys(store.pages.items).forEach((pageName) => {
    const page = store.pages.items[pageName]
    if (!page) {
      return
    }

    const pageScripts = (scripts[pageName] = [...globalScripts])

    page.components?.forEach((componentName) => {
      const component = store.components[componentName]
      if (!component) {
        return
      }

      component.imports?.scripts.forEach((importsScript) => {
        if (!pageScripts.includes(importsScript.path)) {
          pageScripts.push(importsScript.path)
        }
        if (!mainScripts.includes(importsScript.path)) {
          mainScripts.push(importsScript.path)
        }
      })
      if (component.script) {
        if (!pageScripts.includes(component.script)) {
          pageScripts.push(component.script)
        }
        if (!mainScripts.includes(component.script)) {
          mainScripts.push(component.script)
        }
      }
    })
  })

  return scripts
}

export default getScripts

function getGlobalScripts(): string[] {
  const scripts: string[] = []

  let globalScripts = appConfig.globalScripts || defaultConfig.globalScripts
  if (!Array.isArray(globalScripts)) {
    globalScripts = [globalScripts]
  }

  globalScripts.forEach((scriptPath) => {
    if (!scriptPath) {
      return
    }

    let file = PathsHelper.isAlias(scriptPath)
      ? PathsHelper.getAliasPath(scriptPath)
      : path.isAbsolute(scriptPath)
      ? scriptPath
      : PathsHelper.joinNodeModulesDir(scriptPath)

    if (!isFile(file)) {
      return LogHelper.logError(
        `\n\x1b[41mFAIL\x1b[0m: Global script for import "\x1b[36m${scriptPath}\x1b[0m" not found!\nFullpath: "${file}"\n`,
      )
    }
    scripts.push(file)
  })

  return scripts
}
