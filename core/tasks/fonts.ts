import { ITask } from '../index'
import store from '../store'
import { dest, lastRun, src } from 'gulp'
import { plumber } from './utils/plumber'
import PathsHelper from '../helpers/PathsHelper'
import editTime from './utils/editTime'
import path from 'path'
import { distConfig } from '../config'
import File from 'vinyl'
import { SrcOptions } from 'vinyl-fs'

interface FontsTask extends ITask {
  globs: string[]
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => number | Date | undefined
}

const fontsTask: FontsTask = {
  build: 4,
  name: 'copy:fonts',
  globs: ['*', 'fonts', '*.{eot,svg,ttf,woff,woff2}'],
  run(done) {
    const files = [...store.fonts.items]

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
    const isModule = !file.path.includes(PathsHelper.componentsDir)
    return isModule ? undefined : lastRun(this.name)
  },
  watch() {
    return [
      {
        files: PathsHelper.joinComponentsDir(...this.globs),
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
      return PathsHelper.joinDistDir(distConfig.fonts)
    })
  },
}

export default fontsTask
