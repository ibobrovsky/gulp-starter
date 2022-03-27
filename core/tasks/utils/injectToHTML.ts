import { IPage } from '../../store/modules/pages'
import { appConfig, defaultConfig, distConfig } from '../../config'
import { IS_DEV } from '../../utils/env'
import getPageInjects from './getPageInjects'
import PathsHelper from '../../helpers/PathsHelper'
import { isFile } from '../../utils/isFile'
import { isExternal } from '../../utils/isExternal'
import store from '../../store'

interface ResultInject {
  links: string[]
  styles: string[]
  favicons: string[]
  scripts: string[]
  [k: string]: string[]
}

interface Attrs {
  [key: string]: string | undefined
}

const injectToHTML = (pageContent: string, page: IPage): string => {
  const bundleName: string =
    appConfig.build?.bundleName || defaultConfig.build.bundleName
  const version: string =
    appConfig.build?.addVersions || defaultConfig.build.addVersions
      ? `?v=${Date.now()}`
      : ''

  const HTMLRoot = appConfig.build?.HTMLRoot || defaultConfig.build.HTMLRoot
  const injectSvg = appConfig.build?.injectSvg || defaultConfig.build.injectSvg

  const comment: RegExp = /(\s+)?(<!--(\s+)?INJECT:([\w]+)(\s+)?-->)/gi
  const newLine: RegExp = /(?:\r\n|\r|\n)/g

  const resultInject: ResultInject = {
    links: [],
    styles: [],
    favicons: [],
    scripts: [],
  }
  const injects = getPageInjects(page.name)

  // added bundle
  if (IS_DEV) {
    const cssName = `${bundleName}.css`
    const jsName = `${bundleName}.js`
    injects.styles.push({
      name: cssName,
      path: PathsHelper.joinDistDir(distConfig.styles, cssName),
    })
    injects.scripts.push({
      name: jsName,
      path: PathsHelper.joinDistDir(distConfig.scripts, jsName),
    })
  } else {
    const splitBundleInPages =
      appConfig.build?.splitBundleInPages ||
      defaultConfig.build.splitBundleInPages

    const cssName = `${splitBundleInPages ? page.name : bundleName}.min.css`
    const jsName = `${splitBundleInPages ? page.name : bundleName}.min.js`
    if (isFile(PathsHelper.joinDistDir(distConfig.styles, cssName))) {
      injects.styles.push({
        name: cssName,
        path: PathsHelper.joinDistDir(distConfig.styles, cssName),
      })
    }
    if (isFile(PathsHelper.joinDistDir(distConfig.scripts, jsName))) {
      injects.scripts.push({
        name: jsName,
        path: PathsHelper.joinDistDir(distConfig.scripts, jsName),
      })
    }
  }

  injects.styles.forEach((style) => {
    const attrs: Attrs = {}
    attrs.rel = 'stylesheet'
    attrs.href = isExternal(style.path)
      ? style.path
      : `${HTMLRoot}${distConfig.styles}/${style.name}${version}`

    if (style.preload) {
      attrs.rel = 'preload'
      attrs.as = 'style'
    } else if (style.prefetch) {
      attrs.rel = 'prefetch'
      attrs.as = 'style'
    }

    resultInject.styles.push(renderTag('link', attrs))
  })

  injects.scripts.forEach((script) => {
    const attrs: Attrs = {}
    attrs.src = isExternal(script.path)
      ? script.path
      : `${HTMLRoot}${distConfig.scripts}/${script.name}${version}`

    if (script.async) {
      attrs.async = undefined
    }
    if (script.defer) {
      attrs.defer = undefined
    }

    resultInject.scripts.push(renderTag('script', attrs))
  })

  injects.links.forEach(({ uid, ...attrs }) => {
    resultInject.links.push(renderTag('link', { ...attrs }))
  })

  if (!IS_DEV) {
    const favicons: {
      tag: 'meta' | 'link'
      name: string
      attrs: Attrs
    }[] = [
      {
        tag: 'meta',
        name: 'browserconfig.xml',
        attrs: {
          name: 'msapplication-config',
          content: `${HTMLRoot}${distConfig.favicons}/browserconfig.xml`,
        },
      },
      {
        tag: 'link',
        name: 'favicon.ico',
        attrs: {
          rel: 'shortcut icon',
          href: `${HTMLRoot}${distConfig.favicons}/favicon.ico`,
          type: 'image/x-icon',
        },
      },
      {
        tag: 'link',
        name: 'favicon-16x16.png',
        attrs: {
          rel: 'icon',
          href: `${HTMLRoot}${distConfig.favicons}/favicon-16x16.png`,
          sizes: '16x16',
          type: 'image/png',
        },
      },
      {
        tag: 'link',
        name: 'favicon-32x32.png',
        attrs: {
          rel: 'icon',
          href: `${HTMLRoot}${distConfig.favicons}/favicon-32x32.png`,
          sizes: '32x32',
          type: 'image/png',
        },
      },
      {
        tag: 'link',
        name: 'apple-touch-icon.png',
        attrs: {
          rel: 'apple-touch-icon',
          href: `${HTMLRoot}${distConfig.favicons}/apple-touch-icon.png`,
          sizes: '180x180',
        },
      },
      {
        tag: 'link',
        name: 'safari-pinned-tab.svg',
        attrs: {
          rel: 'mask-icon',
          href: `${HTMLRoot}${distConfig.favicons}/safari-pinned-tab.svg`,
          color:
            appConfig.manifest?.safariPinnedTab ||
            defaultConfig.manifest.safariPinnedTab ||
            '#424b5f',
        },
      },
      {
        tag: 'link',
        name: 'manifest.json',
        attrs: {
          rel: 'manifest',
          href: `${HTMLRoot}${distConfig.favicons}/manifest.json`,
        },
      },
    ]

    favicons.forEach((favicon) => {
      const filePath = PathsHelper.joinDistDir(
        distConfig.favicons,
        favicon.name,
      )
      if (!isFile(filePath)) {
        return
      }

      resultInject.favicons.push(renderTag(favicon.tag, favicon.attrs))
    })
  }

  let injected = pageContent
  injected = injected.replace(comment, (str, indent, com, space, name) => {
    if (!indent) {
      indent = ''
    }
    indent = '\n' + indent?.replace(newLine, '')
    name = name.trim().toLowerCase()

    let instead = ''

    if (resultInject[name]?.length) {
      instead = indent + resultInject[name].join(indent)
    }

    if (name === 'svg' && injectSvg) {
      instead = indent + (store.svg.content || com)
    }

    return instead
  })

  store.assets.replaces.forEach((replace) => {
    injected = injected.replace(new RegExp(replace.old, 'g'), replace.new)
  })

  return injected
}

export default injectToHTML

function renderTag(name: 'meta' | 'script' | 'link', attrs: Attrs): string {
  switch (name) {
    case 'script':
      return `<script ${attrsToString(attrs)}></script>`
    default:
      return `<${name} ${attrsToString(attrs)} />`
  }
}

function attrsToString(attrs: Attrs): string {
  return Object.keys(attrs)
    .map(
      (attr) =>
        attr + (typeof attrs[attr] === 'string' ? `="${attrs[attr]}"` : ''),
    )
    .join(' ')
}
