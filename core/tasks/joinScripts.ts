import { ITask } from '../index'
import { appConfig, defaultConfig } from '../config'
import getScripts from './utils/getScripts'
import { IS_DEV } from '../utils/env'
import { TaskCallback } from 'undertaker'
import { dest, src } from 'gulp'
import { plumber } from './utils/plumber'
import joinScripts from './utils/joinScripts'
import PathsHelper from '../helpers/PathsHelper'
import { existsSync, mkdirSync, rmSync } from 'fs'

interface IScripts {
  [key: string]: string[]
}

interface JoinScriptsTask extends ITask {
  compileBundles: (scripts: IScripts) => ReturnType<TaskCallback>
  compileBundle: (
    files: string[],
    bundleName: string,
    done: TaskCallback,
  ) => NodeJS.ReadWriteStream | ReturnType<TaskCallback>
  joinScripts: (bundleName: string) => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
}

const joinScriptsTask: JoinScriptsTask = {
  build: 2,
  name: 'compile:joinScripts',
  run(done) {
    const bundleName =
      appConfig.build?.bundleName || defaultConfig.build.bundleName

    const splitBundleInPages =
      appConfig.build?.splitBundleInPages ||
      defaultConfig.build.splitBundleInPages

    rmSync(PathsHelper.coreTmpDir, { recursive: true, force: true })

    const scripts = getScripts()

    if (IS_DEV || !splitBundleInPages) {
      const files = scripts[bundleName] || []
      return this.compileBundle(files, bundleName, done)
    }

    return this.compileBundles(scripts)
  },
  watch() {
    return [
      {
        files: PathsHelper.joinComponentsDir('!(deps).ts'),
        tasks: this.name,
      },
    ]
  },
  compileBundles(this: JoinScriptsTask, scripts) {
    const promises: Promise<any>[] = []
    Object.keys(scripts).forEach((bundleName) => {
      const files = scripts[bundleName]
      if (!files.length) {
        return
      }
      const promise = new Promise((resolve) => {
        this.compileBundle(files, bundleName, resolve)
      })

      return promises.push(promise)
    })
    return Promise.all(promises)
  },
  compileBundle(files, bundleName, done) {
    if (files.length === 0) {
      return done()
    }

    const options = {
      sourcemaps: appConfig.build?.sourcemaps || defaultConfig.build.sourcemaps,
    }

    return src(files, options)
      .pipe(plumber())
      .pipe(this.joinScripts(bundleName))
      .pipe(this.dest())
      .on('end', done)
  },
  joinScripts(bundleName) {
    return joinScripts(bundleName, PathsHelper.coreTmpDir)
  },
  dest() {
    const dir = PathsHelper.coreTmpDir
    if (!existsSync(dir)) {
      mkdirSync(dir)
    }

    return dest(dir)
  },
}

export default joinScriptsTask
