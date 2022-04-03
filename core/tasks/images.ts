import { ITask } from '../index'
import store from '../store'
import { SrcOptions } from 'vinyl-fs'
import { dest, lastRun, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import { IS_DEV } from '../utils/env'
import { componentsDir, joinComponentsDir, joinDistDir } from '../utils/path'
import path from 'path'
import File from 'vinyl'
import editTime from '../utils/tasks/editTime'
import { config } from '../config'
import getImageSpriteId from '../utils/tasks/getImageSpriteId'

interface ImagesTask extends ITask {
  globs: string[]
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => number | Date | undefined
}

export const imagesTaskName = 'copy:images'

const imagesTask: ImagesTask = {
  build: 3,
  name: imagesTaskName,
  globs: ['*', 'images', '**', '*.{webp,png,jpg,jpeg,svg,gif,ico}'],
  run(done) {
    const files = [...store.images.getItems()]

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
      file.path = path.join(file.base, getImageSpriteId(file.path))
      return joinDistDir(config.dist.images)
    })
  },
}

export default imagesTask
