import { ITask } from '../index'
import { config } from '../config'
import gulpImagemin from 'gulp-imagemin'
import { Plugin } from 'imagemin'
import { joinDistDir } from '../utils/path'
import { IS_DEV } from '../utils/env'
import { dest, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'

interface MinifyTask extends ITask {
  imagemin: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
}

export const minifyTaskName = 'minify:images'

const minifyTask: MinifyTask = {
  build: 4,
  name: minifyTaskName,
  run(done) {
    if (!config.imagemin || IS_DEV) {
      return done()
    }
    const files: string[] = []

    let minify: string[] = []
    Object.keys(config.imagemin).forEach((key) => {
      // @ts-ignore
      if (!!config.imagemin[key]) {
        minify.push(key)
      }
    })

    if (minify.length) {
      files.push(joinDistDir(`**/*.{${minify.join(',')}}`))
    }

    if (!files.length) {
      return done()
    }

    return src(files).pipe(plumber()).pipe(this.imagemin()).pipe(this.dest())
  },
  imagemin() {
    const plugins: Plugin[] = []

    const pluginsMap = {
      svg: 'svgo',
      jpg: 'mozjpeg',
      png: 'optipng',
      gif: 'gifsicle',
    }

    Object.keys(pluginsMap).forEach((key) => {
      if (!config.imagemin[key]) {
        return
      }

      // @ts-ignore
      plugins.push(gulpImagemin[pluginsMap[key]](config.imagemin[key]))
    })

    return gulpImagemin(plugins, { verbose: true })
  },
  dest() {
    return dest((file) => file.base)
  },
}

export default minifyTask
