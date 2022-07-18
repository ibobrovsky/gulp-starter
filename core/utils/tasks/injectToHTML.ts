import { IPage } from '../../store/pages'
import { config } from '../../config'
import store from '../../store'
import getPageDepsInjects from './getPageDepsInjects'
import { IS_DEV } from '../env'
import { joinDistDir } from '../path'
import { isFile } from '../isFile'
import { isExternal } from '../isExternal'

interface ResultInject {
  links: string[]
  favicons: string[]
  styles: string[]
  scripts: string[]
}

interface Attrs {
  [key: string]: string | undefined
}

const injectToHTML = (pageContent: string, page: IPage): string => {
  const bundleName = config.build.bundleName
  const HTMLRoot = config.build.HTMLRoot
  const version: string = config.build.addVersion ? `?v=${Date.now()}` : ''
  const comment: RegExp = /(\s+)?(<!--(\s+)?INJECT:([\w]+)(\s+)?-->)/gi
  const newLine: RegExp = /(?:\r\n|\r|\n)/g

  const resultInject: ResultInject = {
    links: [],
    styles: [],
    favicons: [],
    scripts: [],
  }

  const injects = getPageDepsInjects(page)

  // added bundles
  if (IS_DEV) {
    const cssName = `${bundleName}.css`
    const jsName = `${bundleName}.js`
    injects.styles.push({
      name: cssName,
      path: joinDistDir(config.dist.styles, cssName),
    })
    injects.scripts.push({
      name: jsName,
      path: joinDistDir(config.dist.scripts, jsName),
    })
  } else {
    const splitBundle = config.build.splitBundle
    const splitCss =
      typeof splitBundle === 'boolean'
        ? splitBundle
        : splitBundle.includes('css')
    const splitJs =
      typeof splitBundle === 'boolean'
        ? splitBundle
        : splitBundle.includes('js')

    const templateBundleName = config.build.templateBundleName

    const cssTemplateName = splitCss ? `${templateBundleName}.min.css` : null
    const cssName = `${splitCss ? page.name : bundleName}.min.css`
    const jsTemplateName = splitJs ? `${templateBundleName}.min.js` : null
    const jsName = `${splitJs ? page.name : bundleName}.min.js`

    if (
      cssTemplateName &&
      isFile(joinDistDir(config.dist.styles, cssTemplateName))
    ) {
      injects.styles.push({
        name: cssTemplateName,
        path: joinDistDir(config.dist.styles, cssTemplateName),
      })
    }
    if (isFile(joinDistDir(config.dist.styles, cssName))) {
      injects.styles.push({
        name: cssName,
        path: joinDistDir(config.dist.styles, cssName),
      })
    }
    if (
      jsTemplateName &&
      isFile(joinDistDir(config.dist.scripts, jsTemplateName))
    ) {
      injects.scripts.push({
        name: jsTemplateName,
        path: joinDistDir(config.dist.scripts, jsTemplateName),
      })
    }
    if (isFile(joinDistDir(config.dist.scripts, jsName))) {
      injects.scripts.push({
        name: jsName,
        path: joinDistDir(config.dist.scripts, jsName),
      })
    }
  }

  page.views.forEach(({ fullName, path }) => {
    if (injects.styles.find((i) => i.path === path)) {
      return
    }

    injects.styles.push({
      name: fullName + '.css',
      path,
    })
  })

  injects.styles.forEach((style) => {
    const attrs: Attrs = {}
    attrs.rel = 'stylesheet'
    attrs.href = isExternal(style.path)
      ? style.path
      : `${HTMLRoot}${config.dist.styles}/${style.name}${version}`

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
      : `${HTMLRoot}${config.dist.scripts}/${script.name}${version}`

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

  if (!IS_DEV && config.manifest) {
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
          content: `${HTMLRoot}${config.dist.favicons}/browserconfig.xml`,
        },
      },
      {
        tag: 'link',
        name: 'favicon.ico',
        attrs: {
          rel: 'shortcut icon',
          href: `${HTMLRoot}${config.dist.favicons}/favicon.ico`,
          type: 'image/x-icon',
        },
      },
      {
        tag: 'link',
        name: 'favicon-16x16.png',
        attrs: {
          rel: 'icon',
          href: `${HTMLRoot}${config.dist.favicons}/favicon-16x16.png`,
          sizes: '16x16',
          type: 'image/png',
        },
      },
      {
        tag: 'link',
        name: 'favicon-32x32.png',
        attrs: {
          rel: 'icon',
          href: `${HTMLRoot}${config.dist.favicons}/favicon-32x32.png`,
          sizes: '32x32',
          type: 'image/png',
        },
      },
      {
        tag: 'link',
        name: 'apple-touch-icon.png',
        attrs: {
          rel: 'apple-touch-icon',
          href: `${HTMLRoot}${config.dist.favicons}/apple-touch-icon.png`,
          sizes: '180x180',
        },
      },
      {
        tag: 'link',
        name: 'safari-pinned-tab.svg',
        attrs: {
          rel: 'mask-icon',
          href: `${HTMLRoot}${config.dist.favicons}/safari-pinned-tab.svg`,
          color: config.manifest?.safariPinnedTab || '#424b5f',
        },
      },
      {
        tag: 'link',
        name: 'manifest.json',
        attrs: {
          rel: 'manifest',
          href: `${HTMLRoot}${config.dist.favicons}/manifest.json`,
        },
      },
    ]

    favicons.forEach((favicon) => {
      const filePath = joinDistDir(config.dist.favicons, favicon.name)
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

    if (name === 'symbols' && config.build.injectSymbols) {
      instead = indent + (store.symbols.getContent() || com)
    }

    return instead
  })

  store.assets.getReplaces().forEach(({ oldPath, newPath }) => {
    injected = injected.replace(new RegExp(oldPath, 'g'), newPath)
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
