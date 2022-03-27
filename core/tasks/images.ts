import { ITask } from '../index'
import store from '../store'
import { dest, lastRun, src } from 'gulp'
import { plumber } from './utils/plumber'
import PathsHelper from '../helpers/PathsHelper'
import editTime from './utils/editTime'
import path from 'path'
import { distConfig } from '../config'
import getImageId from './utils/getImageId'
import File from 'vinyl'
import { SrcOptions } from 'vinyl-fs'

interface ImagesTask extends ITask {
  globs: string[]
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => number | Date | undefined
}

const imagesTask: ImagesTask = {
  build: 4,
  name: 'copy:images',
  globs: ['*', 'images', '**', '*.{webp,png,jpg,jpeg,svg,gif,ico}'],
  run(done) {
    const files = [...store.images.items]
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
      file.path = path.join(file.base, getImageId(file.path))
      return PathsHelper.joinDistDir(distConfig.images)
    })
  },
}

export default imagesTask
