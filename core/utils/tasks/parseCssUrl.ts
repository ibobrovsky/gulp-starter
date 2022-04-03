import path from 'path'
import { isExternal } from '../isExternal'
import { IS_DEV } from '../env'
import { slashNormalize } from '../slashNormalize'
import { joinDistDir, rootDir } from '../path'
import isImageSprite from './isImageSprite'
import { config } from '../../config'
import getImageSpriteId from './getImageSpriteId'
import store from '../../store'

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

  const isSprite = isImageSprite(asset.absolutePath)
  const basename = path.basename(asset.url)

  if (isSprite && !IS_DEV) {
    return slashNormalize(path.relative(rootDir, asset.absolutePath))
  }

  let name = ''
  let dist = ''

  if (isFont) {
    store.fonts.setItem(asset.absolutePath)

    dist = path.relative(
      joinDistDir(config.dist.styles),
      joinDistDir(config.dist.fonts),
    )
    name = basename
  } else {
    store.images.setItem(asset.absolutePath)

    dist = path.relative(
      joinDistDir(config.dist.styles),
      joinDistDir(config.dist.images),
    )
    name = getImageSpriteId(asset.absolutePath)
  }

  return slashNormalize(path.join(dist, name))
}

export default parseCssUrl
