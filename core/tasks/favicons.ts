import { ITask } from '../index'
import PathsHelper from '../helpers/PathsHelper'
import { dest, src } from 'gulp'
import { appConfig, defaultConfig, distConfig } from '../config'
import { IS_DEV } from '../utils/env'
import { isFile } from '../utils/isFile'
import { plumber } from './utils/plumber'
// @ts-ignore
import gulpFavicons from 'gulp-favicons'
import { mergeOptions } from '../utils/mergeOptions'

interface FaviconsTask extends ITask {
  dest: () => NodeJS.ReadWriteStream
  favicons: () => NodeJS.ReadWriteStream
}

const faviconsTask: FaviconsTask = {
  build: 3,
  name: 'generate:favicons',
  run(done) {
    const icon = PathsHelper.joinSrcDir('icon.png')

    if (IS_DEV || !isFile(icon)) {
      done()
    }

    return src(icon).pipe(plumber()).pipe(this.favicons()).pipe(this.dest())
  },
  favicons() {
    let params = mergeOptions(appConfig.manifest, defaultConfig.manifest, true)

    return gulpFavicons(params)
  },
  dest() {
    return dest(PathsHelper.joinDistDir(distConfig.favicons))
  },
}

export default faviconsTask
