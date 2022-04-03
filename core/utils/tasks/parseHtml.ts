import { IPipeHandler } from './pipe'
import path, { basename, extname } from 'path'
import { Parser } from 'htmlparser2'
import { getPath, isAlias } from '../aliases'
import { isFile } from '../isFile'
import { config } from '../../config'
import store from '../../store'
import getSymbolId from './getSymbolId'
import { IPage } from '../../store/pages'
import { IS_DEV } from '../env'
import { isExternal } from '../isExternal'
import { componentsDir, joinPageDir } from '../path'
import { slashNormalize } from '../slashNormalize'
import injectToHTML from './injectToHTML'

const parseHtml: IPipeHandler = (file) => {
  const pageName = basename(file.path, extname(file.path))
  const pageContent = String(file.contents)

  const page: IPage = {
    name: pageName,
    path: joinPageDir(pageName + '.twig'),
    components: [],
    symbols: false,
  }
  const parser = new Parser(
    {
      onopentag(tagName, attribs) {
        if (tagName === 'use') {
          return parseXLink(attribs['xlink:href'], page)
        }

        if (attribs.class?.length) {
          parseClasses(attribs.class, page)
        }

        Object.keys(attribs).forEach((attr) => parseAssets(attribs[attr]))
      },
      onend() {
        store.pages.setItem(page)
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

function parseXLink(value: string, page: IPage): void {
  if (!isAlias(value)) {
    return
  }

  const filePath = getPath(value)
  if (!isFile(filePath) || store.symbols.hasItem(filePath)) {
    return
  }

  const symbolId = `#${getSymbolId(filePath)}`

  store.assets.setReplace({
    oldPath: value,
    newPath: config.build.injectSymbols
      ? symbolId
      : config.build.HTMLRoot + config.dist.symbols + `/sprite.svg${symbolId}`,
  })
  store.symbols.setItem(filePath)
  if (!page.symbols) {
    page.symbols = true
  }
}

function parseClasses(classes: string, page: IPage): void {
  classes.split(' ').forEach((className) => {
    className = className.trim()
    if (!className.length) {
      return
    }

    if (
      !store.components.hasItem(className) ||
      page.components.includes(className)
    ) {
      return
    }

    if (!page.components) {
      page.components = []
    }
    page.components.push(className)
  })
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
      if (!v || isExternal(v) || !isAlias(v)) {
        return
      }

      const filePath = getPath(v)
      if (!isFile(filePath) || store.assets.hasItem(filePath)) {
        return
      }

      let arr = path.relative(componentsDir, filePath).split(path.sep)

      let asset = store.components.hasItem(arr[0])
        ? arr.filter((i) => i !== 'assets').join(path.sep)
        : arr[arr.length - 1]

      store.assets.setReplace({
        oldPath: v,
        newPath:
          config.build.HTMLRoot +
          config.dist.static +
          '/' +
          slashNormalize(asset),
      })
      store.assets.setItem(filePath)
    })
  })
}
