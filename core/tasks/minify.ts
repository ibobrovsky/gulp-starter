import { ITask } from '../index'
import gulpImagemin from 'gulp-imagemin'
import { Plugin } from 'imagemin'
import { appConfig, defaultConfig, ImageminConfig } from '../config'
import { mergeOptions } from '../utils/mergeOptions'
import { dest, src } from 'gulp'
import { IS_DEV } from '../utils/env'
import { plumber } from './utils/plumber'
import PathsHelper from '../helpers/PathsHelper'

interface MinifyTask extends ITask {
  imagemin: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
}

type PluginsMap = {
  [K in keyof ImageminConfig]: string
}

const minifyTask: MinifyTask = {
  build: 5,
  name: 'minify:images',
  run(done) {
    const files: string[] = []

    if (!appConfig.imagemin) {
      return done()
    }

    let minify: string[] = []
    Object.keys(appConfig.imagemin).forEach((key) => {
      // @ts-ignore
      if (!!config.imagemin[key]) {
        minify.push(key)
      }
    })

    if (minify.length) {
      files.push(PathsHelper.joinDistDir(`**/*.{${minify.join(',')}}`))
    }

    if (IS_DEV || !files.length) {
      return done()
    }

    return src(files).pipe(plumber()).pipe(this.imagemin()).pipe(this.dest())
  },
  imagemin() {
    const plugins: Plugin[] = []

    const pluginsMap: PluginsMap = {
      svg: 'svgo',
      jpg: 'mozjpeg',
      png: 'optipng',
      gif: 'gifsicle',
    }

    // @ts-ignore
    Object.keys(pluginsMap).forEach((key: keyof PluginsMap) => {
      if (!appConfig.imagemin?.[key]) {
        return
      }

      plugins.push(
        // @ts-ignore
        gulpImagemin[pluginsMap[key]](
          typeof appConfig.imagemin[key] === 'boolean'
            ? defaultConfig.imagemin[key]
            : mergeOptions(
                defaultConfig.imagemin[key],
                appConfig.imagemin[key],
                true,
              ),
        ),
      )
    })

    return gulpImagemin(plugins, { verbose: true })
  },
  dest() {
    return dest((file) => file.base)
  },
}

export default minifyTask
