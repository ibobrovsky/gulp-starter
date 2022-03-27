import { ITask } from '../index'
import store from '../store'
import PathsHelper from '../helpers/PathsHelper'
import scanComponents from './utils/scanComponents'
import { plumber } from './utils/plumber'
import { src, dest, lastRun } from 'gulp'
import { pipe } from './utils/pipe'
import path, { basename, dirname, extname, relative } from 'path'
import { appConfig, defaultConfig } from '../config'
import { slashNormalize } from '../utils/slashNormalize'
import { toCamelCase } from '../utils/toCamelCase'
// @ts-ignore
import gulpTwig from 'gulp-twig'
import { mergeOptions } from '../utils/mergeOptions'
import parseHtml from './utils/parseHtml'
import { IS_DEV } from '../utils/env'
// @ts-ignore
import htmlmin from 'gulp-htmlmin'
import HTMLBeautify from './utils/HTMLBeautify'
import { SrcOptions } from 'vinyl-fs'
import { isFile } from '../utils/isFile'
import editTime from './utils/editTime'
import { TaskCallback } from 'undertaker'
import File from 'vinyl'

interface TemplatesTask extends ITask {
  globs: string
  injectComponentsInTemplates: () => NodeJS.ReadWriteStream
  compile: () => NodeJS.ReadWriteStream
  parse: () => NodeJS.ReadWriteStream
  htmlmin: () => NodeJS.ReadWriteStream
  beautify: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
  checkDeps: (file: string) => void
  checkIsOnPage: (file: string) => void
  ready: (done: TaskCallback) => ReturnType<TaskCallback>
  since: (file: File) => number | Date | undefined
}

const templatesTask: TemplatesTask = {
  build: 1,
  name: 'compile:templates',
  globs: '!(_*).twig',
  run(this: TemplatesTask, done) {
    scanComponents()
    const files = PathsHelper.joinPageDir(this.globs)
    const ready = this.ready.bind(this, done)

    const options: SrcOptions = {
      // @ts-ignore
      since: this.since.bind(this),
    }

    return src(files, options)
      .pipe(plumber())
      .pipe(this.injectComponentsInTemplates())
      .pipe(this.compile())
      .pipe(this.parse())
      .pipe(this.htmlmin())
      .pipe(this.beautify())
      .pipe(this.dest())
      .on('end', ready)
  },
  watch() {
    return [
      {
        files: PathsHelper.joinPageDir(this.globs),
        tasks: this.name,
        options: {
          delay: 500,
        },
      },
      {
        files: PathsHelper.joinComponentsDir('**', 'deps.ts'),
        tasks: [
          'compile:templates',
          'compile:joinScripts',
          'compile:scriptsTs',
          'compile:styles',
          'copy:assets',
          'copy:fonts',
          'copy:images',
        ],
        options: {
          delay: 250,
        },
        on: {
          event: 'change',
          handler: this.checkDeps.bind(this),
        },
      },
      {
        files: PathsHelper.joinComponentsDir('**', '(data.json|*.twig)'),
        on: {
          event: 'change',
          handler: this.checkIsOnPage.bind(this),
        },
      },
    ]
  },
  since(file) {
    const page = path.basename(file.path)
    const pageInDeps = store.pages.depsChanged.includes(page)
    return pageInDeps ? undefined : lastRun(this.name)
  },
  checkDeps(file) {
    const componentName = path.dirname(file).split(path.sep).pop()

    Object.keys(store.pages.items).forEach((pageName) => {
      if (
        pageName ===
        (appConfig.build?.bundleName || defaultConfig.build.bundleName)
      ) {
        return
      }

      if (
        componentName &&
        store.pages.items[pageName]?.components?.includes(componentName)
      ) {
        pageName = pageName + '.twig'
        if (!store.pages.depsChanged.includes(pageName)) {
          store.pages.depsChanged.push(pageName)
        }
      }
    })
  },
  checkIsOnPage(file) {
    let name = path.basename(file)
    if (['data.json', 'deps.ts'].includes(name)) {
      const newName = path.dirname(file).split(path.sep).pop()
      if (newName) {
        name = newName
      }
    } else {
      name = path.basename(file, path.extname(file))
    }

    Object.keys(store.pages.items).forEach((pageName) => {
      if (
        pageName ===
        (appConfig.build?.bundleName || defaultConfig.build.bundleName)
      ) {
        return
      }

      if (store.pages.items[pageName]?.components?.includes(name)) {
        const file = PathsHelper.joinPageDir(pageName + '.twig')
        if (isFile(file)) {
          return editTime(file)
        }
      }
    })
  },
  injectComponentsInTemplates() {
    return pipe(
      (file) => {
        const fileExt = extname(file.path)
        if (
          !(
            appConfig.importComponentsInPages ||
            defaultConfig.importComponentsInPages
          ) ||
          fileExt !== `.twig`
        ) {
          return
        }

        let importedComponents = ''
        const components = store.components

        Object.keys(components).forEach((componentName) => {
          const component = components[componentName]
          if (!component || !component.template) {
            return
          }

          const fileDir = dirname(file.path)
          const filePath = slashNormalize(relative(fileDir, component.template))

          const name = toCamelCase(basename(component.template, fileExt))
          importedComponents += `{% from "${filePath}" import ${name} %}\n`
        })

        if (importedComponents.length) {
          file.contents = Buffer.from(
            importedComponents + String(file.contents),
          )
        }
      },
      null,
      'injectComponentsInTemplates',
    )
  },
  compile() {
    return gulpTwig(
      mergeOptions(
        appConfig.twig || defaultConfig.twig,
        {
          data: {
            global: store.data,
          },
        },
        true,
      ),
    )
  },
  parse() {
    store.pages.items = {}
    return pipe(parseHtml, null, 'parseHtml')
  },
  htmlmin() {
    if (IS_DEV) {
      return pipe()
    }

    return htmlmin({
      collapseWhitespace: true,
      removeComments: false,
    })
  },
  beautify() {
    if (
      IS_DEV ||
      (typeof appConfig.HTMLBeautify === 'boolean' && !appConfig.HTMLBeautify)
    ) {
      return pipe()
    }

    return pipe(HTMLBeautify, null, 'HTMLBeautify')
  },
  dest() {
    return dest(PathsHelper.distDir)
  },
  ready(done) {
    store.pages.depsChanged = []

    return done()
  },
}

export default templatesTask
