import { ITask } from '../index'
import { config } from '../config'
import { IS_DEV } from '../utils/env'
import {
  getBundleScripts,
  getSplitScripts,
  IScripts,
} from '../utils/tasks/getScripts'
import { TaskCallback } from 'undertaker'
import { dest, src } from 'gulp'
import { plumber } from '../utils/tasks/plumber'
import { pipe } from '../utils/tasks/pipe'
import joinScripts from '../utils/tasks/joinScripts'
import { joinComponentsDir, joinDistDir } from '../utils/path'
import vinyl from 'vinyl'
// @ts-ignore
import gulpRollup from 'gulp-better-rollup'
import rollupTypescript2 from 'rollup-plugin-typescript2'
import path from 'path'
import gulpIf from 'gulp-if'
import gulpRename from 'gulp-rename'
import gulpUglify from 'gulp-uglify'
import { isFile } from '../utils/isFile'
import { unlink } from 'fs'
import { logError } from '../utils/log'

interface ScriptsTask extends ITask {
  compileBundles: (scripts: IScripts) => ReturnType<TaskCallback>
  compileBundle: (
    files: string[],
    bundleName: string,
    done: TaskCallback,
  ) => NodeJS.ReadWriteStream | ReturnType<TaskCallback>
  joinScripts: (bundleName: string) => NodeJS.ReadWriteStream
  destTs: () => NodeJS.ReadWriteStream
  rollup: (bundleName: string) => NodeJS.ReadWriteStream
  dest: (sourcemaps: boolean) => NodeJS.ReadWriteStream
  uglify: () => NodeJS.ReadWriteStream
  rename: () => NodeJS.ReadWriteStream
  wrap: () => NodeJS.ReadWriteStream
  minifyDest: (sourcemaps: boolean) => NodeJS.ReadWriteStream
  forMinify: (fs: vinyl) => boolean
}

export const scriptsTaskName = 'compile:scripts'

const scriptsTask: ScriptsTask = {
  build: 2,
  name: scriptsTaskName,
  run(done) {
    const splitBundleJs =
      typeof config.build.splitBundle === 'boolean'
        ? config.build.splitBundle
        : config.build.splitBundle.includes('js')

    const bundleName = config.build.bundleName

    if (IS_DEV || !splitBundleJs) {
      return this.compileBundle(getBundleScripts(), bundleName, done)
    }

    return this.compileBundles(getSplitScripts())
  },
  watch() {
    return [
      {
        files: joinComponentsDir('**', '!(deps.ts|data.ts)'),
        tasks: this.name,
      },
    ]
  },
  compileBundles(scripts) {
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
    if (!files.length) {
      return done()
    }

    const sourcemaps =
      typeof config.build.sourcemaps === 'boolean'
        ? config.build.sourcemaps
        : config.build.sourcemaps.includes('js')

    const options = {
      sourcemaps,
    }

    return src(files, options)
      .pipe(plumber())
      .pipe(this.joinScripts(bundleName))
      .pipe(this.destTs())
      .pipe(this.rollup(bundleName))
      .pipe(this.wrap())
      .pipe(this.dest(IS_DEV ? options.sourcemaps : false))
      .pipe(this.uglify())
      .pipe(this.rename())
      .pipe(this.minifyDest(options.sourcemaps))
      .on('end', () => {
        if (!IS_DEV) {
          const filePath = joinDistDir(config.dist.scripts, `${bundleName}.ts`)
          if (isFile(filePath)) {
            try {
              unlink(filePath, () => {})
            } catch (e) {
              logError('unset TS file error: ', e)
            }
          }
        }

        done()
      })
  },
  joinScripts(bundleName) {
    return joinScripts(bundleName, joinDistDir(config.dist.scripts))
  },
  destTs() {
    return dest(joinDistDir(config.dist.scripts))
  },
  rollup(bundleName) {
    return gulpRollup(
      {
        plugins: [rollupTypescript2()],
      },
      {
        format: 'cjs',
        file: joinDistDir(config.dist.scripts, `${bundleName}.js`),
      },
    )
  },
  wrap() {
    return pipe(
      (file) => {
        const ext = path.extname(file.path)
        if (ext === '.ts') {
          return
        }

        const content = String(file.contents)
        const prev = ';(function(window) {'
        const next = `})(
  typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
);`

        file.contents = Buffer.from(prev + content + next)
      },
      null,
      'wrapScript',
    )
  },
  dest(sourcemaps) {
    return dest(joinDistDir(config.dist.scripts), {
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
