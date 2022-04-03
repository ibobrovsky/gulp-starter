import { config } from '../../config'
import { logWarn } from '../log'
import store from '../../store'
import getDepsComponents from './getDepsComponents'

export interface IScripts {
  [key: string]: string[]
}

export const getBundleScripts = (): string[] => {
  const bundleName = config.build.bundleName

  const bundleScripts: string[] = []

  store.pages.getItems().forEach((page) => {
    if (bundleName === page.name) {
      logWarn(
        `Page name matches bundle name. Please rename page "${page.name}" or rename bundle name`,
      )
    }

    getDepsComponents(page.components).forEach(({ script }) => {
      if (!script) {
        return
      }

      if (!bundleScripts.includes(script)) {
        bundleScripts.push(script)
      }
    })
  })

  return bundleScripts
}

export const getSplitScripts = (): IScripts => {
  const bundleName = config.build.bundleName
  const templateBundleName = config.build.templateBundleName

  const scripts: IScripts = {
    [bundleName]: getBundleScripts(),
  }

  const depsTemplateComponents = getDepsComponents(
    config.build.layoutComponents,
  )

  const templateScripts: string[] = (scripts[templateBundleName] = [])

  depsTemplateComponents.forEach(({ script }) => {
    if (!script) {
      return
    }

    if (!templateScripts.includes(script)) {
      templateScripts.push(script)
    }
  })

  const templateComponentsNames: string[] = depsTemplateComponents.map(
    ({ name }) => name,
  )

  store.pages.getItems().forEach((page) => {
    const pageScripts: string[] = (scripts[page.name] = [])

    getDepsComponents(page.components).forEach(({ name, script }) => {
      if (!script || templateComponentsNames.includes(name)) {
        return
      }

      if (!pageScripts.includes(script)) {
        pageScripts.push(script)
      }
    })
  })

  return scripts
}
