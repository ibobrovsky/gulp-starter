import { ITask } from '../index'
import LogHelper from '../helpers/Log'
import { existsSync, readdirSync } from 'fs'
import PathsHelper from '../helpers/PathsHelper'
import { isFile } from '../utils/isFile'
import { dest, lastRun, src } from 'gulp'
import { SrcOptions } from 'vinyl-fs'
import { plumber } from './utils/plumber'
import editTime from './utils/editTime'

interface PublicTask extends ITask {
  dest: () => NodeJS.ReadWriteStream
}

const publicTask: PublicTask = {
  build: 3,
  name: 'copy:public',
  run(done) {
    if (!existsSync(PathsHelper.publicDir)) {
      return done()
    }
    const files: string[] = []

    try {
      readdirSync(PathsHelper.publicDir).forEach((file) => {
        const filePath = PathsHelper.joinPublicDir(file)
        if (!isFile(filePath)) {
          return
        }

        files.push(filePath)
      })
    } catch (e) {
      LogHelper.logError(e)
    }

    if (!files.length) {
      return done()
    }

    const options: SrcOptions = {
      since: lastRun(this.name),
    }

    return src(files, options).pipe(plumber()).pipe(this.dest())
  },
  watch() {
    return [
      {
        files: PathsHelper.joinPublicDir('*.*'),
        tasks: this.name,
        on: {
          event: 'add',
          handler: editTime,
        },
      },
    ]
  },
  dest() {
    return dest(PathsHelper.distDir)
  },
}

export default publicTask
