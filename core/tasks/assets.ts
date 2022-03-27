import { ITask } from '../index'
import { dest, lastRun, src } from 'gulp'
import { plumber } from './utils/plumber'
import { SrcOptions } from 'vinyl-fs'
import store from '../store'
import PathsHelper from '../helpers/PathsHelper'
import editTime from './utils/editTime'
import path from 'path'
import { distConfig } from '../config'
import File from 'vinyl'

interface AssetsTask extends ITask {
  globs: string[]
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => number | Date | undefined
}

const assetsTask: AssetsTask = {
  build: 3,
  name: 'copy:assets',
  globs: ['*', 'assets', '**', '*.*'],
  run(done) {
    const files: string[] = [...store.assets.items]

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
      const extname = path.extname(basename)

      if (extname === '.js') {
        file.path = path.join(file.base, basename)
        return PathsHelper.joinDistDir(distConfig.scripts)
      } else if (extname === '.css') {
        file.path = path.join(file.base, basename)
        return PathsHelper.joinDistDir(distConfig.styles)
      } else {
        let arr = path
          .relative(PathsHelper.componentsDir, file.path)
          .split(path.sep)

        const componentNames = Object.keys(store.components)

        let asset = componentNames.includes(arr[0])
          ? arr.filter((i) => i !== 'assets').join(path.sep)
          : arr[arr.length - 1]

        file.path = path.join(file.base, asset)
        return PathsHelper.joinDistDir(distConfig.static)
      }
    })
  },
}

export default assetsTask
