import { ITask } from '../index'
import {
  IStyles,
  getBundleStyles,
  getSplitStyles,
} from '../utils/tasks/getStyles'
import { TaskCallback } from 'undertaker'
import { IS_DEV } from '../utils/env'
import { config } from '../config'
import { dest, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import { pipe } from '../utils/tasks/pipe'
import injectStyleMixins from '../utils/tasks/injectStyleMixins'
import vinyl from 'vinyl'
import {
  joinComponentsDir,
  joinRootDir,
  joinDistDir,
  rootDir,
} from '../utils/path'
import { mergeOptions } from '../utils/mergeOptions'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import gulpPostCss from 'gulp-postcss'
import postcssUrl from 'postcss-url'
import parseCssUrl from '../utils/tasks/parseCssUrl'
import gulpConcat from 'gulp-concat'
import path from 'path'
import autoprefixer from 'autoprefixer'
import { isFile } from '../utils/isFile'
// @ts-ignore
import stylefmt from 'stylefmt'
import postcssSprites from 'postcss-sprites'
import isImageSprite from '../utils/tasks/isImageSprite'
import gulpIf from 'gulp-if'
// @ts-ignore
import gulpCssnano from 'gulp-cssnano'
import gulpRename from 'gulp-rename'

const sass = gulpSass(dartSass)

interface StylesTask extends ITask {
  compileBundles: (
    styles: IStyles,
    done: TaskCallback,
  ) => ReturnType<TaskCallback>
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

export const stylesTaskName = 'compile:styles'

const stylesTask: StylesTask = {
  build: 2,
  name: stylesTaskName,
  run(done) {
    return this.compileBundles(getSplitStyles(), done)
  },
  watch() {
    return [
      {
        files: joinComponentsDir('**', `*{.css,.scss}`),
        tasks: this.name,
      },
    ]
  },
  async compileBundles(styles, done) {
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

    Promise.all(promises).then(() => {
      done()
    })
  },
  compileBundle(files, bundleName, done) {
    if (!files.length) {
      return done()
    }

    const sourcemaps =
      typeof config.build.sourcemaps === 'boolean'
        ? config.build.sourcemaps
        : config.build.sourcemaps.includes('css')

    const options = {
      sourcemaps,
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
    if (!config.stylesMixins.length) {
      return pipe()
    }

    return pipe(injectStyleMixins, null, 'injectStyleMixins')
  },
  compile(this: StylesTask) {
    return sass(mergeOptions({}, config.sass))
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
      path: path.join(rootDir, `${bundleName}.css`),
    })
  },
  postcss(bundleName) {
    const plugins: any[] = []

    if (config.autoprefixer) {
      plugins.push(
        autoprefixer({
          remove: false,
          overrideBrowserslist: config.autoprefixer,
        }),
      )
    }

    if (!IS_DEV) {
      const stylelintrcFile = joinRootDir('.stylelintrc')
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
      spritePath: joinDistDir(config.dist.images),
      stylesheetPath: joinDistDir(config.dist.styles),
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
        if (isImageSprite(image?.path || '')) {
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
    return dest(joinDistDir(config.dist.styles), {
      sourcemaps: sourcemaps ? '.' : undefined,
    })
  },
  cssnano() {
    return gulpIf(this.forMinify, gulpCssnano(config.cssNano))
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
