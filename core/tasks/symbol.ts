import { ITask } from '../index'
import { TaskCallback } from 'undertaker'
import store from '../store'
import {
  joinComponentsDir,
  joinDistDir,
  joinPageDir,
  rootDir,
} from '../utils/path'
import { IS_DEV } from '../utils/env'
import { dest, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import File from 'vinyl'
import getSymbolId from '../utils/tasks/getSymbolId'
import gulpSvgSprite from 'gulp-svg-sprite'
import spriter from 'svg-sprite'
import { config } from '../config'
import editTime from '../utils/tasks/editTime'

interface SymbolTask extends ITask {
  globs: string[]
  ready: (done: TaskCallback) => void
  symbols: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
  generateID: (name: string, file: File) => string
}

export const symbolTaskName = 'generate:symbol'

const symbolTask: SymbolTask = {
  build: 2,
  name: symbolTaskName,
  globs: ['*', 'symbols', '*.svg'],
  run(done) {
    const files: string[] = IS_DEV
      ? [joinComponentsDir(...this.globs)]
      : [...store.symbols.getItems()]

    if (!files.length) {
      return done()
    }

    const ready = this.ready.bind(this, done)

    return src(files)
      .pipe(plumber())
      .pipe(this.symbols())
      .pipe(this.dest())
      .on('end', ready)
  },
  watch() {
    return [
      {
        files: joinComponentsDir(...this.globs),
        tasks: this.name,
      },
    ]
  },
  ready(done) {
    if (!IS_DEV) {
      return done()
    }

    store.pages.getItems().forEach(({ name, path, symbols }) => {
      if (name === config.build.bundleName) {
        return
      }

      if (symbols) {
        return editTime(path)
      }
    })
  },
  symbols() {
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
          dest: joinDistDir(config.dist.symbols),
          sprite: 'sprite.svg',
        },
      },
    }

    return gulpSvgSprite(conf)
  },
  generateID(name, file) {
    return getSymbolId(file.path)
  },
  dest() {
    return dest((file) => {
      store.symbols.setContent(String(file.contents))
      return rootDir
    })
  },
}

export default symbolTask
