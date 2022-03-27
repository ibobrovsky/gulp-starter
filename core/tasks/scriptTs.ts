import { ITask } from '../index'
import { appConfig, defaultConfig, distConfig } from '../config'
import { IS_DEV } from '../utils/env'
import { TaskCallback } from 'undertaker'
import { dest, src } from 'gulp'
import { plumber } from './utils/plumber'
import PathsHelper from '../helpers/PathsHelper'
import vinyl from 'vinyl'
import path from 'path'
import gulpIf from 'gulp-if'
import gulpRename from 'gulp-rename'
import gulpUglify from 'gulp-uglify'
// @ts-ignore
import gulpRollup from 'gulp-better-rollup'
import rollupTypescript2 from 'rollup-plugin-typescript2'
// @ts-ignore
import rollupBabel from 'rollup-plugin-babel'
import { existsSync, readdirSync } from 'fs'
import { isFile } from '../utils/isFile'
import LogHelper from '../helpers/Log'

interface ScriptsTask extends ITask {
  compileBundles: (files: string[]) => ReturnType<TaskCallback>
  compileBundle: (
    file: string,
    done: TaskCallback,
  ) => NodeJS.ReadWriteStream | ReturnType<TaskCallback>
  rollup: (bundleName: string) => NodeJS.ReadWriteStream
  dest: (sourcemaps: boolean) => NodeJS.ReadWriteStream
  uglify: () => NodeJS.ReadWriteStream
  rename: () => NodeJS.ReadWriteStream
  minifyDest: (sourcemaps: boolean) => NodeJS.ReadWriteStream
  forMinify: (fs: vinyl) => boolean
}

const scriptsTask: ScriptsTask = {
  build: 3,
  name: 'compile:scriptsTs',
  run(done) {
    if (!existsSync(PathsHelper.coreTmpDir)) {
      return done()
    }
    const files: string[] = []

    try {
      readdirSync(PathsHelper.coreTmpDir).forEach((file) => {
        const filePath = PathsHelper.joinCoreTmpDir(file)
        if (!isFile(filePath)) {
          return
        }
        const extname = path.extname(file)
        if (extname !== '.ts') {
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

    if (files.length === 1) {
      return this.compileBundle(files[0], done)
    }

    return this.compileBundles(files)
  },
  watch() {
    return [
      {
        files: PathsHelper.joinCoreTmpDir('*.ts'),
        tasks: this.name,
      },
    ]
  },
  compileBundles(files) {
    const promises: Promise<any>[] = []
    files.forEach((file) => {
      const promise = new Promise((resolve) => {
        this.compileBundle(file, resolve)
      })

      return promises.push(promise)
    })

    return Promise.all(promises)
  },
  compileBundle(file, done) {
    if (!file) {
      return done()
    }

    const options = {
      sourcemaps: appConfig.build?.sourcemaps || defaultConfig.build.sourcemaps,
    }

    const extname = path.extname(file)
    const bundleName = path.basename(file, extname)

    return src(file, options)
      .pipe(plumber())
      .pipe(this.rollup(bundleName))
      .pipe(this.dest(IS_DEV ? options.sourcemaps : false))
      .pipe(this.uglify())
      .pipe(this.rename())
      .pipe(this.minifyDest(options.sourcemaps))
      .on('end', done)
  },
  rollup(bundleName) {
    return gulpRollup(
      {
        plugins: [rollupTypescript2()],
      },
      { format: 'cjs', file: PathsHelper.joinDistDir(`${bundleName}.js`) },
    )
  },
  dest(sourcemaps) {
    return dest(PathsHelper.joinDistDir(distConfig.scripts), {
      sourcemaps: sourcemaps ? '.' : undefined,
    })
  },
  uglify() {
    return gulpIf(this.forMinify, gulpUglify())
  },
  rename() {
    return gulpIf(
      this.forMinify,
      gulpRename({
        suffix: '.min',
      }),
    )
  },
  minifyDest(sourcemaps) {
    return gulpIf(!IS_DEV, this.dest(sourcemaps))
  },
  forMinify(file) {
    return !IS_DEV && path.extname(file.path) === '.js'
  },
}

export default scriptsTask
