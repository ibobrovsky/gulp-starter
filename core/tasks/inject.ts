import { ITask } from '../index'
import { IS_DEV } from '../utils/env'
import PathsHelper from '../helpers/PathsHelper'
import { dest, src } from 'gulp'
import { plumber } from './utils/plumber'
import { pipe } from './utils/pipe'
// @ts-ignore
import htmlmin from 'gulp-htmlmin'
import { appConfig, defaultConfig } from '../config'
import HTMLBeautify from './utils/HTMLBeautify'
import injectToHTML from './utils/injectToHTML'
import path from 'path'
import store from '../store'

interface InjectTask extends ITask {
  inject: () => NodeJS.ReadWriteStream
  htmlmin: () => NodeJS.ReadWriteStream
  beautify: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
}

const injectTask: InjectTask = {
  build: 4,
  name: 'inject:data',
  run(done) {
    if (IS_DEV) {
      return done()
    }

    const files = PathsHelper.joinDistDir('*.html')

    return src(files)
      .pipe(plumber())
      .pipe(this.inject())
      .pipe(this.htmlmin())
      .pipe(this.beautify())
      .pipe(this.dest())
  },
  inject() {
    return pipe(
      (file) => {
        const fileContent = String(file.contents)
        const name = path.basename(file.path, path.extname(file.path))
        const page = store.pages.items[name]
        if (!page) {
          return
        }
        const injected = injectToHTML(fileContent, page)
        file.contents = Buffer.from(injected)
      },
      null,
      'FinalInjects',
    )
  },
  htmlmin() {
    return htmlmin({
      collapseWhitespace: true,
      removeComments: false,
    })
  },
  beautify() {
    if (
      IS_DEV ||
      (typeof appConfig.HTMLBeautify === 'boolean' && !appConfig.HTMLBeautify)
    ) {
      return pipe()
    }

    return pipe(HTMLBeautify, null, 'HTMLBeautify')
  },
  dest() {
    return dest(PathsHelper.distDir)
  },
}

export default injectTask
