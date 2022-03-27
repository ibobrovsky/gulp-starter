import { isExternal } from '../../utils/isExternal'
import path from 'path'
import PathsHelper from '../../helpers/PathsHelper'
import { distConfig } from '../../config'
import { IS_DEV } from '../../utils/env'
import store from '../../store'
import { slashNormalize } from '../../utils/slashNormalize'
import _isSprite from './isSprite'
import getImageId from './getImageId'

type TransformFunction = (
  asset: {
    /**
     * Original URL.
     */
    url: string

    /**
     * URL pathname.
     */
    pathname?: string | undefined

    /**
     * Absolute path to asset.
     */
    absolutePath?: string | undefined

    /**
     * Current relative path to asset.
     */
    relativePath?: string | undefined

    /**
     * Querystring from URL.
     */
    search?: string | undefined

    /**
     * Hash from URL.
     */
    hash?: string | undefined
  },
  dir: {
    /**
     * PostCSS from option.
     */
    from?: string | undefined

    /**
     * PostCSS to option.
     */
    to?: string | undefined

    /**
     * File path.
     */
    file?: string | undefined
  },
  options: {},
  decl: {
    prop: string
  },
) => string

const parseCssUrl: TransformFunction = (asset, dir, options, decl) => {
  if (isExternal(asset.url) || !asset.absolutePath) {
    return asset.url
  }

  const extname = path.extname(asset.absolutePath)
  const isFont =
    decl.prop === 'src' &&
    ['.eot', '.svg', '.ttf', '.woff', '.woff2'].includes(extname)

  const isSprite = _isSprite(asset.absolutePath)
  const basename = path.basename(asset.url)

  if (isSprite && !IS_DEV) {
    return slashNormalize(
      path.relative(PathsHelper.rootDir, asset.absolutePath),
    )
  }

  let name = ''
  let dist = ''

  if (isFont) {
    if (!store.fonts.items.includes(asset.absolutePath)) {
      store.fonts.items.push(asset.absolutePath)
    }

    dist = path.relative(
      PathsHelper.joinDistDir(distConfig.styles),
      PathsHelper.joinDistDir(distConfig.fonts),
    )
    name = basename
  } else {
    if (!store.images.items.includes(asset.absolutePath)) {
      store.images.items.push(asset.absolutePath)
    }

    dist = path.relative(
      PathsHelper.joinDistDir(distConfig.styles),
      PathsHelper.joinDistDir(distConfig.images),
    )
    name = getImageId(asset.absolutePath)
  }

  return slashNormalize(path.join(dist, name))
}

export default parseCssUrl
