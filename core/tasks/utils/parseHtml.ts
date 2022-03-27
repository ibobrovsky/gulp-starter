import { IPipeHandler } from './pipe'
import path, { basename, extname } from 'path'
import store from '../../store'
import { Parser } from 'htmlparser2'
import { IPage } from '../../store/modules/pages'
import PathsHelper from '../../helpers/PathsHelper'
import { isFile } from '../../utils/isFile'
import { isExternal } from '../../utils/isExternal'
import { IS_DEV } from '../../utils/env'
import injectToHTML from './injectToHTML'
import { appConfig, defaultConfig, distConfig } from '../../config'
import { slashNormalize } from '../../utils/slashNormalize'
import getSvgId from './getSvgId'

const parseHtml: IPipeHandler = (file) => {
  const pageName = basename(file.path, extname(file.path))
  const pageContent = String(file.contents)

  const page = (store.pages.items[pageName] = {
    name: pageName,
  })

  const parser = new Parser(
    {
      onopentag(tagName, attribs) {
        if (tagName === 'use') {
          return parseXLink(attribs['xlink:href'])
        }

        if (attribs.class?.length) {
          parseClasses(attribs.class, page)
        }

        Object.keys(attribs).forEach((attr) => parseAssets(attribs[attr]))
      },
      onend() {
        if (!IS_DEV) {
          return
        }

        const injected = injectToHTML(pageContent, page)
        file.contents = Buffer.from(injected)
      },
    },
    { decodeEntities: true },
  )

  parser.write(pageContent)
  parser.end()
}

export default parseHtml

function parseClasses(classes: string, page: IPage): void {
  const componentsNames = Object.keys(store.components)

  classes.split(' ').forEach((className) => {
    className = className.trim()
    if (!className.length) {
      return
    }

    if (
      componentsNames.includes(className) &&
      !page.components?.includes(className)
    ) {
      if (!page.components) {
        page.components = []
      }
      page.components.push(className)
    }
  })
}

function parseXLink(tag: string): void {
  if (!PathsHelper.isAlias(tag)) {
    return
  }

  const filePath = PathsHelper.getAliasPath(tag)
  if (!isFile(filePath)) {
    return
  }

  const injectSvg = appConfig.build?.injectSvg || defaultConfig.build.injectSvg

  if (!store.svg.items.includes(filePath)) {
    const svgId = `#${getSvgId(filePath)}`

    store.assets.replaces.push({
      old: tag,
      new: injectSvg
        ? svgId
        : (appConfig.build?.HTMLRoot || defaultConfig.build.HTMLRoot) +
          distConfig.svg +
          `/sprite.svg${svgId}`,
    })
    store.svg.items.push(filePath)
  }
}

function parseAssets(attrValue: string): void {
  const values = attrValue.split(',')

  values.forEach((value) => {
    value = value.trim()

    if (!value || isExternal(value)) {
      return
    }

    value.split(' ').forEach((v) => {
      v = v.trim()
      if (!v || !PathsHelper.isAlias(v)) {
        return
      }

      const filePath = PathsHelper.getAliasPath(v)
      if (isFile(filePath) && !store.assets.items.includes(filePath)) {
        let arr = path
          .relative(PathsHelper.componentsDir, filePath)
          .split(path.sep)

        const componentNames = Object.keys(store.components)

        let asset = componentNames.includes(arr[0])
          ? arr.filter((i) => i !== 'assets').join(path.sep)
          : arr[arr.length - 1]

        store.assets.replaces.push({
          old: v,
          new:
            (appConfig.build?.HTMLRoot || defaultConfig.build.HTMLRoot) +
            distConfig.static +
            '/' +
            slashNormalize(asset),
        })
        store.assets.items.push(filePath)
      }
    })
  })
}
