import { ITask } from '../index'
import { joinDistDir, joinSrcDir } from '../utils/path'
import { IS_DEV } from '../utils/env'
import { isFile } from '../utils/isFile'
import { dest, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import { config } from '../config'
// @ts-ignore
import gulpFavicons from 'gulp-favicons'

interface FaviconsTask extends ITask {
  dest: () => NodeJS.ReadWriteStream
  favicons: () => NodeJS.ReadWriteStream
}

export const faviconsTaskName = 'generate:favicons'

const faviconsTask: FaviconsTask = {
  build: 2,
  name: faviconsTaskName,
  run(done) {
    const icon = joinSrcDir('icon.png')

    if (IS_DEV || !isFile(icon)) {
      done()
    }

    return src(icon).pipe(plumber()).pipe(this.favicons()).pipe(this.dest())
  },
  favicons() {
    return gulpFavicons(config.manifest)
  },
  dest() {
    return dest(joinDistDir(config.dist.favicons))
  },
}

export default faviconsTask
