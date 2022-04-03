import { ITask } from '../index'
import { IS_DEV } from '../utils/env'
import { distDir, joinDistDir } from '../utils/path'
import { dest, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import path from 'path'
import { pipe } from '../utils/tasks/pipe'
import store from '../store'
import injectToHTML from '../utils/tasks/injectToHTML'
import { config } from '../config'
// @ts-ignore
import gulpHtmlmin from 'gulp-htmlmin'
import HTMLBeautify from '../utils/tasks/HTMLBeautify'

interface InjectTask extends ITask {
  inject: () => NodeJS.ReadWriteStream
  htmlmin: () => NodeJS.ReadWriteStream
  beautify: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
}

export const injectTaskName = 'inject:data'

const injectTask: InjectTask = {
  build: 3,
  name: injectTaskName,
  run(done) {
    if (IS_DEV) {
      return done()
    }

    const files = joinDistDir('*.html')

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
        const page = store.pages.getItem(name)
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
    return gulpHtmlmin({
      collapseWhitespace: true,
      removeComments: false,
    })
  },
  beautify() {
    if (!config.HTMLBeautify) {
      return pipe()
    }

    return pipe(HTMLBeautify, null, 'HTMLBeautify')
  },
  dest() {
    return dest(distDir)
  },
}

export default injectTask
