import { ITask } from '../index'
import store from '../store'
import { TaskCallback } from 'undertaker'
import { dest, src } from 'gulp'
import { plumber } from './utils/plumber'
import PathsHelper from '../helpers/PathsHelper'
import gulpSvgSprite from 'gulp-svg-sprite'
import spriter from 'svg-sprite'
import { appConfig, defaultConfig, distConfig } from '../config'
import File from 'vinyl'
import getSvgId from './utils/getSvgId'
import { IS_DEV } from '../utils/env'

interface SVGTask extends ITask {
  globs: string[]
  ready: (done: TaskCallback) => void
  svg: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
  generateID: (name: string, file: File) => string
}

const svgTask: SVGTask = {
  build: 3,
  name: 'generate:symbol',
  globs: ['*', 'svg', '*.svg'],
  run(done) {
    const files = [...store.svg.items]
    if (!files.length) {
      return done()
    }

    const ready = this.ready.bind(this, done)

    return src(files)
      .pipe(plumber())
      .pipe(this.svg())
      .pipe(this.dest())
      .on('end', ready)
  },
  watch() {
    return [
      {
        files: PathsHelper.joinComponentsDir(...this.globs),
        tasks: this.name,
      },
    ]
  },
  ready(done) {
    if (!IS_DEV) {
      return done()
    }

    // Object.keys(store.pages.items).forEach((pageName) => {
    //   if (
    //     pageName == (config.build?.bundleName || defaultConfig.build.bundleName)
    //   ) {
    //     return
    //   }
    //
    //   if (store.pages.items[pageName].) {
    //
    //   }
    // })

    return done()
  },
  svg() {
    const conf: spriter.Config = {
      svg: {
        namespaceClassnames: false,
        xmlDeclaration: false,
        doctypeDeclaration: false,
        rootAttributes: {
          style:
            'position:absolute;top:0;left:0;width:1px;height:1px;visibility:hidden;opacity:0;',
          'aria-hidden': 'true',
        },
      },
      shape: {
        id: {
          // @ts-ignore
          generator: this.generateID.bind(this),
        },
      },
      mode: {
        symbol: {
          dest: PathsHelper.joinDistDir(distConfig.svg),
          sprite: 'sprite.svg',
        },
      },
    }

    return gulpSvgSprite(conf)
  },
  generateID(name, file) {
    return getSvgId(file.path)
  },
  dest() {
    return dest((file) => {
      store.svg.content = String(file.contents)
      return PathsHelper.rootDir
    })
  },
}

export default svgTask
