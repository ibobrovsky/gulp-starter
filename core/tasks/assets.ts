import { ITask } from '../index'
import store from '../store'
import { IS_DEV } from '../utils/env'
import { SrcOptions } from 'vinyl-fs'
import { dest, lastRun, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import { componentsDir, joinComponentsDir, joinDistDir } from '../utils/path'
import editTime from '../utils/tasks/editTime'
import File from 'vinyl'
import path from 'path'
import { config } from '../config'

interface AssetsTask extends ITask {
  globs: string[]
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => number | Date | undefined
}

export const assetsTaskName = 'copy:assets'

const assetsTask: AssetsTask = {
  build: 2,
  name: assetsTaskName,
  globs: ['*', 'assets', '**', '*.*'],
  run(done) {
    const files: string[] = [...store.assets.getItems()]

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
  since(file) {
    const isModule = !file.path.includes(componentsDir)
    return isModule ? undefined : lastRun(this.name)
  },
  dest() {
    return dest((file) => {
      const basename = path.basename(file.path)
      const extname = path.extname(basename)

      if (extname === '.js') {
        file.path = path.join(file.base, basename)
        return joinDistDir(config.dist.scripts)
      } else if (extname === '.css') {
        file.path = path.join(file.base, basename)
        return joinDistDir(config.dist.styles)
      } else {
        let arr = path.relative(componentsDir, file.path).split(path.sep)

        const componentNames = store.components
          .getItems()
          .map(({ name }) => name)

        let asset = componentNames.includes(arr[0])
          ? arr.filter((i) => i !== 'assets').join(path.sep)
          : arr[arr.length - 1]

        file.path = path.join(file.base, asset)
        return joinDistDir(config.dist.static)
      }
    })
  },
}

export default assetsTask
