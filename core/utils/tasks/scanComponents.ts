import { isDirectory } from '../isDirectory'
import { componentsDir, joinComponentsDir, joinNodeModulesDir } from '../path'
import store from '../../store'
import { readdirSync, readFileSync } from 'fs'
import { logError } from '../log'
import { IComponent, View } from '../../store/components'
import path, { basename, extname, join } from 'path'
import { isFile } from '../isFile'
import { requireFile } from '../requireFile'
import { Deps, JsonData } from '../../types'
import { isArray, isObject, isString } from '../type'
import { isExternal } from '../isExternal'
import { getPath, isAlias } from '../aliases'
import { checkFile } from './checkFile'

export function scanComponents() {
  if (!isDirectory(componentsDir)) {
    return
  }

  try {
    store.components.clearItems()
    readdirSync(componentsDir).forEach((componentName) => {
      scanComponent(componentName)
    })
  } catch (e) {
    logError('scanComponents', e)
  }
}

function scanComponent(componentName: string) {
  if (
    !isDirectory(joinComponentsDir(componentName)) ||
    store.components.hasItem(componentName)
  ) {
    return
  }

  const componentPath = joinComponentsDir(componentName)

  const component: IComponent = {
    name: componentName,
    path: componentPath,
  }

  const data = scanComponentData(component)

  scanComponentDeps(component)
  scanComponentTemplate(component)
  scanComponentScript(component)
  scanComponentStyle(component)

  store.components.setItem(component)
  store.pages.setData(component.name, data)
}

function scanComponentDeps(component: IComponent): void {
  const deepFilePath = join(component.path, 'deps.ts')
  if (!isFile(deepFilePath)) {
    return
  }

  const deepFileData = requireFile<Deps>(deepFilePath, true)
  if (!isObject(deepFileData)) {
    return
  }

  const injects: IComponent['injects'] = {
    scripts: [],
    styles: [],
    links: [],
  }

  const views: IComponent['views'] = []

  if (isArray(deepFileData.plugins)) {
    deepFileData.plugins.forEach((plugin) => {
      if (!plugin.from) {
        return (plugin.from = joinComponentsDir(component.name, 'assets'))
      }
      if (isExternal(plugin.from)) {
        return
      }

      if (isAlias(plugin.from)) {
        if (isDirectory(getPath(plugin.from))) {
          return (plugin.from = getPath(plugin.from))
        }
      }

      return (plugin.from = joinNodeModulesDir(plugin.from))
    })
    deepFileData.plugins.forEach((plugin) => {
      if (!plugin.inject) {
        return
      }

      if (!isArray(plugin.inject)) {
        plugin.inject = [plugin.inject]
      }

      plugin.inject.forEach((dep) => {
        if (!plugin.from) {
          return
        }

        const params = typeof dep === 'string' ? { name: dep } : dep

        const filePath = isExternal(plugin.from)
          ? plugin.from + params.name
          : path.join(plugin.from, params.name)

        if (
          !isExternal(plugin.from) &&
          !checkFile(filePath, component.name, params.name)
        ) {
          return
        }

        if (!isExternal(plugin.from)) {
          store.assets.setItem(filePath)
        }

        const ext = path.extname(params.name)

        switch (ext) {
          case '.css':
            {
              const styleIndex = injects.styles.findIndex(
                ({ path }) => path === filePath,
              )
              if (styleIndex === -1) {
                injects.styles.push({
                  path: filePath,
                  name: params.name,
                  prefetch: params.prefetch,
                  preload: params.preload,
                })
              }
            }
            break
          default:
            {
              const scriptIndex = injects.scripts.findIndex(
                ({ path }) => path === filePath,
              )
              if (scriptIndex === -1) {
                injects.scripts.push({
                  path: filePath,
                  name: params.name,
                  async: params.async,
                  defer: params.defer,
                })
              }
            }
            break
        }
      })
    })
  }

  if (isArray(deepFileData.links)) {
    deepFileData.links.forEach((link) => {
      if (!link) {
        return
      }

      if (!injects.links.find((i) => i.uid === link.uid)) {
        injects.links.push(link)
      }
    })
  }

  if (isString(deepFileData.assets)) {
    deepFileData.assets = [deepFileData.assets]
  }

  if (isArray(deepFileData.assets)) {
    deepFileData.assets.forEach((asset) => {
      asset = asset.trim()
      if (!asset || !isAlias(asset)) {
        return
      }
      const filePath = getPath(asset)
      if (isFile(filePath)) {
        store.assets.setItem(filePath)
      }
    })
  }

  if (isString(deepFileData.symbols)) {
    deepFileData.symbols = [deepFileData.symbols]
  }

  if (isArray(deepFileData.symbols)) {
    deepFileData.symbols.forEach((symbol) => {
      symbol = symbol.trim()
      if (!symbol || !isAlias(symbol)) {
        return
      }

      const filePath = getPath(symbol)
      if (isFile(filePath)) {
        store.symbols.setItem(filePath)
      }
    })
  }

  if (isArray(deepFileData.views)) {
    deepFileData.views.forEach((depsView) => {
      const componentPath = component.path

      const view: View = {
        style: undefined,
      }

      if (depsView.style) {
        const filePath = path.join(componentPath, depsView.style)
        if (isFile(filePath)) {
          const name = basename(filePath, extname(filePath))

          view.style = {
            path: filePath,
            name,
            fullName: component.name + '-' + name,
          }
        }
      }

      // if (depsView.script) {
      //   const filePath = path.join(componentPath, depsView.script)
      //   if (isFile(filePath)) {
      //     view.script = {
      //       path: filePath,
      //       name: component.name + '-' + basename(filePath, extname(filePath)),
      //     }
      //   }
      // }

      views.push(view)
    })
  }

  if (isString(deepFileData.components)) {
    deepFileData.components = [deepFileData.components]
  }

  const depsComponents: string[] = []
  if (isArray(deepFileData.components)) {
    deepFileData.components.forEach((componentName) => {
      if (depsComponents.includes(componentName)) {
        return
      }
      depsComponents.push(componentName)
    })
  }

  component.depsComponents = depsComponents
  component.injects = injects
  component.views = views
}

function scanComponentData(component: IComponent): JsonData | undefined {
  const dataFileNames: string[] = ['data.json']

  if (component.name !== 'data') {
    dataFileNames.unshift('data.ts')
  }

  let res: JsonData | undefined = undefined

  dataFileNames.forEach((name) => {
    if (res) {
      return
    }
    const jsonFilePath = join(component.path, name)
    if (!isFile(jsonFilePath)) {
      return
    }

    try {
      let jsonFileData = undefined
      if (name == 'data.json') {
        jsonFileData = JSON.parse(readFileSync(jsonFilePath).toString())
      } else if (name == 'data.ts') {
        jsonFileData = requireFile(jsonFilePath, true)
      }

      if (isObject(jsonFileData)) {
        res = jsonFileData
      }
    } catch (e: any) {
      throw new Error(
        `\n\n\x1b[41mFAIL\x1b[0m: A JSON "\x1b[36m${join(
          component.name,
          name,
        )}\x1b[0m" have SyntaxError:\n${e?.message}\n\n`,
      )
    }
  })

  return res
}

function scanComponentTemplate(component: IComponent): void {
  const templateFilePath = join(component.path, `${component.name}.twig`)
  if (!isFile(templateFilePath)) {
    return
  }

  component.template = templateFilePath
}

function scanComponentScript(component: IComponent): void {
  const scriptFilePath = join(component.path, `${component.name}.ts`)
  if (!isFile(scriptFilePath)) {
    return
  }

  component.script = scriptFilePath
}

function scanComponentStyle(component: IComponent): void {
  const styleFilePath = join(component.path, `${component.name}.scss`)
  if (!isFile(styleFilePath)) {
    return
  }

  component.style = styleFilePath
}
