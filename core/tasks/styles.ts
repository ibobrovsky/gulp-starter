import { ITask } from '../index'
import { appConfig, defaultConfig, distConfig } from '../config'
import { TaskCallback } from 'undertaker'
import { IS_DEV } from '../utils/env'
import getStyles from './utils/getStyles'
import { dest, src } from 'gulp'
import { plumber } from './utils/plumber'
import { pipe } from './utils/pipe'
import { mergeOptions } from '../utils/mergeOptions'
import injectStyleMixins from './utils/injectStyleMixins'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import gulpPostCss from 'gulp-postcss'
import postcssUrl from 'postcss-url'
import parseCssUrl from './utils/parseCssUrl'
import gulpConcat from 'gulp-concat'
import path from 'path'
import PathsHelper from '../helpers/PathsHelper'
import autoprefixer from 'autoprefixer'
// @ts-ignore
import stylefmt from 'stylefmt'
import { isFile } from '../utils/isFile'
import postcssSprites from 'postcss-sprites'
import gulpIf from 'gulp-if'
// @ts-ignore
import gulpCssnano from 'gulp-cssnano'
import vinyl from 'vinyl'
import gulpRename from 'gulp-rename'
import isSprite from './utils/isSprite'

const sass = gulpSass(dartSass)

interface IStyles {
  [key: string]: string[]
}

interface StylesTask extends ITask {
  compileBundles: (styles: IStyles) => ReturnType<TaskCallback>
  compileBundle: (
    files: string[],
    bundleName: string,
    done: TaskCallback,
  ) => NodeJS.ReadWriteStream | ReturnType<TaskCallback>
  addMixins: () => NodeJS.ReadWriteStream
  compile: () => NodeJS.ReadWriteStream
  parseURLs: () => NodeJS.ReadWriteStream
  concat: (bundleName: string) => NodeJS.ReadWriteStream
  postcss: (bundleName: string) => NodeJS.ReadWriteStream
  dest: (sourcemaps: boolean) => NodeJS.ReadWriteStream
  cssnano: () => NodeJS.ReadWriteStream
  rename: () => NodeJS.ReadWriteStream
  minifyDest: (sourcemaps: boolean) => NodeJS.ReadWriteStream
  generateSprites: (spriteName: string) => any
  forMinify: (fs: vinyl) => boolean
}

const stylesTask: StylesTask = {
  build: 3,
  name: 'compile:styles',
  run(this: StylesTask, done) {
    const bundleName =
      appConfig.build?.bundleName || defaultConfig.build.bundleName
    const splitBundleInPages =
      appConfig.build?.splitBundleInPages ||
      defaultConfig.build.splitBundleInPages

    const styles = getStyles()

    if (IS_DEV || !splitBundleInPages) {
      const files = styles[bundleName] || []
      return this.compileBundle(files, bundleName, done)
    }

    return this.compileBundles(styles)
  },
  watch() {
    return [
      {
        files: PathsHelper.joinComponentsDir(`*{.css,.scss`),
        tasks: this.name,
      },
    ]
  },
  compileBundles(this: StylesTask, styles) {
    const promises: Promise<any>[] = []
    Object.keys(styles).forEach((bundleName) => {
      const files = styles[bundleName]
      if (!files.length) {
        return
      }
      const promise = new Promise((resolve) => {
        this.compileBundle(files, bundleName, resolve)
      })

      return promises.push(promise)
    })
    return Promise.all(promises)
  },
  compileBundle(this: StylesTask, files, bundleName, done) {
    if (files.length === 0) {
      return done()
    }

    const options = {
      sourcemaps: appConfig.build?.sourcemaps || defaultConfig.build.sourcemaps,
    }

    return src(files, options)
      .pipe(plumber())
      .pipe(this.addMixins())
      .pipe(this.compile())
      .pipe(this.parseURLs())
      .pipe(this.concat(bundleName))
      .pipe(this.postcss(bundleName))
      .pipe(this.dest(IS_DEV ? options.sourcemaps : false))
      .pipe(this.cssnano())
      .pipe(this.rename())
      .pipe(this.minifyDest(options.sourcemaps))
      .on('end', done)
  },
  addMixins(this: StylesTask) {
    if (!appConfig.stylesMixins?.length) {
      return pipe()
    }

    return pipe(injectStyleMixins, null, 'injectStyleMixins')
  },
  compile(this: StylesTask) {
    return sass(mergeOptions({}, appConfig.sass || defaultConfig.sass))
  },
  parseURLs(this: StylesTask) {
    return gulpPostCss([
      // @ts-ignore
      postcssUrl({
        url: parseCssUrl,
      }),
    ])
  },
  concat(bundleName) {
    return gulpConcat({
      path: path.join(PathsHelper.rootDir, `${bundleName}.css`),
    })
  },
  postcss(bundleName) {
    const plugins: any[] = []

    if (appConfig.build?.autoprefixer !== false) {
      const defaultOverrideBrowserslist =
        typeof defaultConfig.build.autoprefixer === 'boolean'
          ? []
          : typeof defaultConfig.build.autoprefixer === 'string'
          ? [defaultConfig.build.autoprefixer]
          : defaultConfig.build.autoprefixer

      let overrideBrowserslist: string | string[] = []
      if (appConfig.build?.autoprefixer === true) {
        overrideBrowserslist = defaultOverrideBrowserslist
      } else if (typeof appConfig.build?.autoprefixer !== 'undefined') {
        overrideBrowserslist = appConfig.build.autoprefixer
      }

      plugins.push(
        autoprefixer({
          remove: false,
          overrideBrowserslist,
        }),
      )
    }

    if (!IS_DEV) {
      const stylelintrcFile = PathsHelper.joinRootDir('.stylelintrc')
      const stylefmtOptions: { configFile?: string } = {}
      if (isFile(stylelintrcFile)) {
        stylefmtOptions.configFile = stylelintrcFile
      }
      plugins.push(this.generateSprites(bundleName), stylefmt(stylefmtOptions))
    }

    return gulpPostCss(plugins)
  },
  generateSprites(spriteName) {
    // @ts-ignore
    return postcssSprites({
      spriteName,
      spritePath: PathsHelper.joinDistDir(distConfig.images),
      stylesheetPath: PathsHelper.joinDistDir(distConfig.styles),
      spritesmith: {
        padding: 1,
        algorithm: 'binary-tree',
      },
      svgsprite: {
        shape: {
          spacing: {
            padding: 1,
          },
        },
      },
      retina: true,
      verbose: false,
      filterBy: (image: any) => {
        if (isSprite(image?.path || '')) {
          return Promise.resolve()
        }

        return Promise.reject()
      },
      hooks: {
        onSaveSpritesheet: (config: any, spritesheet: any) => {
          if (!spritesheet.groups.length) {
            spritesheet.groups.push('')
          }

          const basename = `sprite_${config.spriteName}`
          const extname = spritesheet.groups
            .concat(spritesheet.extension)
            .join('.')

          return path.join(config.spritePath, basename + extname)
        },
      },
    })
  },
  dest(sourcemaps) {
    return dest(PathsHelper.joinDistDir(distConfig.styles), {
      sourcemaps: sourcemaps ? '.' : undefined,
    })
  },
  cssnano() {
    return gulpIf(
      this.forMinify,
      gulpCssnano(
        mergeOptions(
          {
            reduceTransforms: false,
            discardUnused: false,
            convertValues: false,
            normalizeUrl: false,
            autoprefixer: false,
            reduceIdents: false,
            mergeIdents: false,
            zindex: false,
            calc: false,
          },
          appConfig.cssNano || defaultConfig.cssNano,
        ),
      ),
    )
  },
  rename() {
    return gulpIf(
      this.forMinify,
      gulpRename({
        suffix: '.min',
      }),
    )
  },
  minifyDest(sourcemaps) {
    return gulpIf(!IS_DEV, this.dest(sourcemaps))
  },
  forMinify(file) {
    return !IS_DEV && path.extname(file.path) === '.css'
  },
}

export default stylesTask
