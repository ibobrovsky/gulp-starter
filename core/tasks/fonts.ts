import { ITask } from '../index'
import store from '../store'
import { SrcOptions } from 'vinyl-fs'
import { dest, lastRun, src } from 'gulp'
import File from 'vinyl'
import { plumber } from '../utils/tasks/plumber'
import { componentsDir, joinComponentsDir, joinDistDir } from '../utils/path'
import editTime from '../utils/tasks/editTime'
import path from 'path'
import { config } from '../config'
import { IS_DEV } from '../utils/env'

interface FontsTask extends ITask {
  globs: string[]
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => number | Date | undefined
}

export const fontsTaskName = 'copy:fonts'

const fontsTask: FontsTask = {
  build: 3,
  name: fontsTaskName,
  globs: ['*', 'fonts', '*.{eot,svg,ttf,woff,woff2}'],
  run(done) {
    const files = [...store.fonts.getItems()]

    if (IS_DEV) {
      const all = joinComponentsDir(...this.globs)
      if (!files.includes(all)) {
        files.push(all)
      }
    }

    if (!files.length) {
      return done()
    }

    const options: SrcOptions = {
      // @ts-ignore
      since: this.since.bind(this),
    }

    return src(files, options).pipe(plumber()).pipe(this.dest())
  },
  since(file) {
    const isModule = !file.path.includes(componentsDir)
    return isModule ? undefined : lastRun(this.name)
  },
  watch() {
    return [
      {
        files: joinComponentsDir(...this.globs),
        tasks: this.name,
        on: {
          event: 'add',
          handler: editTime,
        },
      },
    ]
  },
  dest() {
    return dest((file) => {
      const basename = path.basename(file.path)
      file.path = path.join(file.base, basename)
      return joinDistDir(config.dist.fonts)
    })
  },
}

export default fontsTask
