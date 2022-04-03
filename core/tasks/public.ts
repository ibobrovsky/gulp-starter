import { ITask } from '../index'
import { existsSync, readdirSync } from 'fs'
import { distDir, joinPublicDir, publicDir } from '../utils/path'
import { isFile } from '../utils/isFile'
import { logError } from '../utils/log'
import { SrcOptions } from 'vinyl-fs'
import { dest, lastRun, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import editTime from '../utils/tasks/editTime'

interface PublicTask extends ITask {
  dest: () => NodeJS.ReadWriteStream
}

export const publicTaskName = 'copy:public'

const publicTask: PublicTask = {
  build: 2,
  name: publicTaskName,
  run(done) {
    if (!existsSync(publicDir)) {
      return done()
    }
    const files: string[] = []

    try {
      readdirSync(publicDir).forEach((file) => {
        const filePath = joinPublicDir(file)
        if (!isFile(filePath)) {
          return
        }

        files.push(filePath)
      })
    } catch (e) {
      logError(e)
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
        files: joinPublicDir('*.*'),
        tasks: this.name,
        on: {
          event: 'add',
          handler: editTime,
        },
      },
    ]
  },
  dest() {
    return dest(distDir)
  },
}

export default publicTask
