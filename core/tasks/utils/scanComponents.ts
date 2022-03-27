import LogHelper from '../../helpers/Log'
import store from '../../store'
import { readdirSync, readFileSync } from 'fs'
import PathsHelper from '../../helpers/PathsHelper'
import { isDirectory } from '../../utils/isDirectory'
import { IComponent } from '../../store/modules/components'
import { Deps, IJsonData } from '../../types'
import path, { join } from 'path'
import { isFile } from '../../utils/isFile'
import { isExternal } from '../../utils/isExternal'
import { requireFile } from '../../utils/requireFile'
import { checkFile } from './checkFile'

const scanComponents = () => {
  try {
    store.components = {}
    store.data = {}

    readdirSync(PathsHelper.componentsDir).forEach((componentName) => {
      if (!isDirectory(PathsHelper.joinComponentsDir(componentName))) {
        return
      }

      const componentPath = PathsHelper.joinComponentsDir(componentName)

      const component: IComponent = {
        name: componentName,
        path: componentPath,
      }

      const data = scanData(component)
      scanDeps(component)
      scanTemplate(component)
      scanScript(component)
      scanStyle(component)

      store.components[componentName] = component
      if (data) {
        store.data[componentName] = data
      }
    })
  } catch (e) {
    LogHelper.gulpNotify(e)
  }
}

export default scanComponents

function scanData(component: IComponent): IJsonData | undefined {
  const jsonFilePath = join(component.path, 'data.json')
  if (!isFile(jsonFilePath)) {
    return
  }

  try {
    const jsonFileData = JSON.parse(readFileSync(jsonFilePath).toString())
    return typeof jsonFileData === 'object' ? jsonFileData : undefined
  } catch (e: any) {
    throw new Error(
      `\n\n\x1b[41mFAIL\x1b[0m: A JSON "\x1b[36m${join(
        component.name,
        'data.json',
      )}\x1b[0m" have SyntaxError:\n${e?.message}\n\n`,
    )
  }
}

function scanDeps(component: IComponent): void {
  const deepFilePath = join(component.path, 'deps.ts')
  if (!isFile(deepFilePath)) {
    return
  }

  const deepFileData = requireFile<Deps>(deepFilePath, true)
  if (typeof deepFileData !== 'object') {
    return
  }

  const imports: IComponent['imports'] = {
    scripts: [],
    styles: [],
  }

  const injects: IComponent['injects'] = {
    scripts: [],
    styles: [],
    links: [],
  }

  if (Array.isArray(deepFileData.plugins)) {
    deepFileData.plugins.forEach((item) => {
      if (!item.from) {
        return (item.from = join(component.path))
      }
      if (isExternal(item.from)) {
        return
      }

      if (PathsHelper.isAlias(item.from)) {
        return (item.from = PathsHelper.getAliasPath(item.from))
      }

      return (item.from = PathsHelper.joinNodeModulesDir(item.from))
    })

    deepFileData.plugins.forEach((plugin) => {
      if (plugin.import) {
        if (!Array.isArray(plugin.import)) {
          plugin.import = [plugin.import]
        }

        plugin.import.forEach((name) => {
          if (!plugin.from) {
            return
          }

          if (isExternal(plugin.from)) {
            return
          }

          const file = path.join(plugin.from, name)

          if (!checkFile(file, component.name, name)) {
            return
          }

          const ext = path.extname(name)

          switch (ext) {
            case '.js':
              {
                const scriptIndex = imports.scripts.findIndex(
                  ({ path }) => path === file,
                )
                if (scriptIndex === -1) {
                  imports.scripts.push({
                    name,
                    path: file,
                  })
                }
              }
              break
            case '.css':
              {
                const styleIndex = imports.styles.findIndex(
                  ({ path }) => path === file,
                )
                if (styleIndex === -1) {
                  imports.styles.push({
                    name,
                    path: file,
                  })
                }
              }
              break
          }
        })
      }

      if (plugin.inject) {
        if (!Array.isArray(plugin.inject)) {
          plugin.inject = [plugin.inject]
        }

        plugin.inject.forEach((item) => {
          if (!plugin.from) {
            return
          }

          const params = typeof item === 'string' ? { name: item } : item

          const file = isExternal(plugin.from)
            ? plugin.from + params.name
            : path.join(plugin.from, params.name)

          if (
            !isExternal(plugin.from) &&
            !checkFile(file, component.name, params.name)
          ) {
            return
          }

          if (!isExternal(plugin.from) && !store.assets.items.includes(file)) {
            store.assets.items.push(file)
          }

          const ext = path.extname(params.name)

          switch (ext) {
            case '.js':
              {
                const scriptIndex = injects.scripts.findIndex(
                  ({ path }) => path === file,
                )
                if (scriptIndex === -1) {
                  injects.scripts.push({
                    path: file,
                    name: params.name,
                    async: params.async,
                    defer: params.defer,
                  })
                }
              }
              break
            case '.css':
              {
                const styleIndex = injects.styles.findIndex(
                  ({ path }) => path === file,
                )
                if (styleIndex === -1) {
                  injects.styles.push({
                    path: file,
                    name: params.name,
                    prefetch: params.prefetch,
                    preload: params.preload,
                  })
                }
              }
              break
          }
        })
      }
    })
  }

  if (Array.isArray(deepFileData.links)) {
    deepFileData.links.forEach((link) => {
      if (!link) {
        return
      }

      if (!injects.links.find((i) => i.uid === link.uid)) {
        injects.links.push(link)
      }
    })
  }

  if (typeof deepFileData.assets === 'string') {
    deepFileData.assets = [deepFileData.assets]
  }

  if (Array.isArray(deepFileData.assets)) {
    deepFileData.assets.forEach((asset) => {
      asset = asset.trim()
      if (!asset || !PathsHelper.isAlias(asset)) {
        return
      }
      const path = PathsHelper.getAliasPath(asset)
      if (isFile(path) && !store.assets.items.includes(path)) {
        store.assets.items.push(path)
      }
    })
  }

  if (typeof deepFileData.svg === 'string') {
    deepFileData.svg = [deepFileData.svg]
  }

  if (Array.isArray(deepFileData.svg)) {
    deepFileData.svg.forEach((svg) => {
      svg = svg.trim()
      if (!svg || !PathsHelper.isAlias(svg)) {
        return
      }
      const path = PathsHelper.getAliasPath(svg)
      if (isFile(path) && !store.svg.items.includes(path)) {
        store.svg.items.push(path)
      }
    })
  }

  component.imports = imports
  component.injects = injects
}

function scanTemplate(component: IComponent): void {
  const templateFilePath = join(component.path, `${component.name}.twig`)
  if (!isFile(templateFilePath)) {
    return
  }

  component.template = templateFilePath
}

function scanScript(component: IComponent): void {
  const scriptFilePath = join(component.path, `${component.name}.ts`)
  if (!isFile(scriptFilePath)) {
    return
  }

  component.script = scriptFilePath
}

function scanStyle(component: IComponent): void {
  const styleFilePath = join(component.path, `${component.name}.scss`)
  if (!isFile(styleFilePath)) {
    return
  }

  component.style = styleFilePath
}
