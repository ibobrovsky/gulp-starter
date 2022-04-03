import { ITask } from '../index'
import { distDir, joinComponentsDir, joinPageDir } from '../utils/path'
import { plumber } from '../utils/tasks/plumber'
import { dest, lastRun, src } from 'gulp'
import { scanComponents } from '../utils/tasks/scanComponents'
import store from '../store'
import path, { basename, dirname, extname, relative } from 'path'
import { pipe } from '../utils/tasks/pipe'
import { config } from '../config'
import { slashNormalize } from '../utils/slashNormalize'
import { toCamelCase } from '../utils/toCamelCase'
// @ts-ignore
import gulpTwig from 'gulp-twig'
import { mergeOptions } from '../utils/mergeOptions'
import { IS_DEV } from '../utils/env'
import parseHtml from '../utils/tasks/parseHtml'
// @ts-ignore
import gulpHtmlmin from 'gulp-htmlmin'
import HTMLBeautify from '../utils/tasks/HTMLBeautify'
import { SrcOptions } from 'vinyl-fs'
import File from 'vinyl'
import getComponentNameFromPath from '../utils/tasks/getComponentNameFromPath'
import { isFile } from '../utils/isFile'
import editTime from '../utils/tasks/editTime'
import { stylesTaskName } from './styles'
import { scriptsTaskName } from './scripts'
import { assetsTaskName } from './assets'
import { symbolTaskName } from './symbol'
import { fontsTaskName } from './fonts'
import { imagesTaskName } from './images'

interface TemplatesTask extends ITask {
  globs: string
  extName: string
  injectComponentsInTemplates: () => NodeJS.ReadWriteStream
  compile: () => NodeJS.ReadWriteStream
  parse: () => NodeJS.ReadWriteStream
  htmlmin: () => NodeJS.ReadWriteStream
  beautify: () => NodeJS.ReadWriteStream
  dest: () => NodeJS.ReadWriteStream
  since: (file: File) => SrcOptions['since']
  checkDeps: (file: string) => void
  checkIsOnPage: (file: string) => void
}

export const templatesTaskName = 'compile:templates'

const templatesTask: TemplatesTask = {
  build: 1,
  name: templatesTaskName,
  extName: '.twig',
  globs: '!(_*).twig',
  run(done) {
    scanComponents()
    const files = joinPageDir(this.globs)

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
      .on('end', () => {
        store.pages.clearDepsChanged()
        done()
      })
  },
  watch() {
    return [
      {
        files: joinPageDir(this.globs),
        tasks: this.name,
        options: {
          delay: 500,
        },
      },
      {
        files: joinComponentsDir('**', 'deps.ts'),
        tasks: [
          this.name,
          stylesTaskName,
          scriptsTaskName,
          assetsTaskName,
          symbolTaskName,
          fontsTaskName,
          imagesTaskName,
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
        files: joinComponentsDir('**', `(data.json|*${this.extName})`),
        on: {
          event: 'change',
          handler: this.checkIsOnPage.bind(this),
        },
      },
    ]
  },
  since(file) {
    const pageName = path.basename(file.path)
    return store.pages.hasDepChanged(pageName) ? undefined : lastRun(this.name)
  },
  checkDeps(filePath) {
    const componentName = getComponentNameFromPath(filePath)
    store.pages.getItems().forEach(({ name, components }) => {
      if (
        name === config.build.bundleName ||
        !componentName ||
        !components.includes(componentName)
      ) {
        return
      }

      store.pages.setDepChanged(name + this.extName)
    })
  },
  /**
   * Следит за изменением фалов ('data.json' и '*.twig') компонентов
   * Страница обновится если у нее есть изменяемый компонент
   * @param filePath
   */
  checkIsOnPage(filePath) {
    let componentName = getComponentNameFromPath(filePath)

    store.pages.getItems().forEach(({ name, path, components }) => {
      if (
        name === config.build.bundleName ||
        !componentName ||
        !components.includes(componentName)
      ) {
        return
      }

      if (isFile(path)) {
        return editTime(path)
      }
    })
  },
  /**
   * Подключает компоненты на страницы
   */
  injectComponentsInTemplates() {
    if (!config.importComponentsInPages) {
      return pipe()
    }

    return pipe(
      (file) => {
        const fileExt = extname(file.path)

        if (fileExt !== this.extName) {
          return
        }

        let importedComponents = ''
        const components = store.components.getItems()

        components.forEach((component) => {
          if (!component.template) {
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
        config.twig,
        {
          data: {
            global: store.pages.getData(),
          },
        },
        true,
      ),
    )
  },
  parse() {
    return pipe(parseHtml, null, 'parseHtml')
  },
  htmlmin() {
    if (IS_DEV) {
      return pipe()
    }

    return gulpHtmlmin({
      collapseWhitespace: true,
      removeComments: false,
    })
  },
  beautify() {
    if (IS_DEV || !config.HTMLBeautify) {
      return pipe()
    }

    return pipe(HTMLBeautify, null, 'HTMLBeautify')
  },
  dest() {
    return dest(distDir)
  },
}

export default templatesTask
