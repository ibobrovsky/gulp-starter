import { TaskFunction, watch, parallel, series } from 'gulp'
import { readdirSync } from 'fs'
import { extname } from 'path'
import type { Task } from 'undertaker'
import LogHelper from './helpers/Log'
import PathsHelper from './helpers/PathsHelper'
import { requireFile } from './utils/requireFile'
import { IS_DEV } from './utils/env'
import { slashNormalize } from './utils/slashNormalize'

interface IExports {
  [name: string]: TaskFunction
}

type IBuilds = Array<TaskFunction[] | undefined>

interface IWatcher {
  files: string
  tasks?: string | string[] | TaskFunction
  options?: {
    delay?: number
  }
  on?: {
    event: string
    handler: (...args: any[]) => void
  }
}

export interface ITask {
  build: number
  name: string
  run: TaskFunction
  disabled?: boolean
  watch?: () => IWatcher[]
}

class GulpBuilder {
  protected exports: IExports = {}

  protected builds: IBuilds = []

  protected watchers: IWatcher[] = []

  getExports() {
    try {
      this.init()
      this.createDefaultTask()
      this.watch()
    } catch (e) {
      LogHelper.logError(e)
    }

    return this.exports
  }

  protected init(): void {
    readdirSync(PathsHelper.tasksDir).forEach((item) => {
      if (extname(item) !== '.ts') {
        return
      }
      const fileTask = requireFile<ITask>(PathsHelper.joinTasksDir(item))
      const { name, run, watch, build, disabled } = fileTask
      if (disabled) {
        return
      }
      if (this.exports[name]) {
        return LogHelper.logError(`The task [${name}] already exist!`)
      }

      this.exports[name] = run.bind(fileTask)
      this.exports[name].displayName = name

      if (IS_DEV && typeof watch === 'function') {
        let watchers = watch.call(fileTask)
        this.watchers.push(...watchers)
      }

      if (typeof this.builds[build] === 'undefined') {
        this.builds[build] = []
      }

      this.builds[build]?.push(this.exports[name])
    })
  }

  protected createDefaultTask(): void {
    if (!this.builds.length) {
      return
    }
    const run: Task[] = []

    this.builds.forEach((tasks) => {
      if (!tasks) {
        return
      }
      run.push(parallel(...tasks))
    })

    this.exports.default = series(...run)
  }

  protected watch(): void {
    if (!IS_DEV) {
      return
    }

    this.watchers.forEach((item) => {
      const files = slashNormalize(item.files)
      const tasks = Array.isArray(item.tasks) ? item.tasks : [item.tasks]

      const options: IWatcher['options'] = item.options
        ? JSON.parse(JSON.stringify(item.options))
        : undefined

      const run: ITask['run'][] = []

      tasks?.forEach((task) => {
        if (typeof task === 'function') {
          return run.push(task)
        }

        if (typeof task === 'string' && this.exports[task]) {
          return run.push(this.exports[task])
        }
      })

      const watcher = !run.length
        ? watch(files, options)
        : watch(files, options, series(...run))

      if (item.on) {
        watcher.on(item.on.event, item.on.handler)
      }
    })
  }
}

const gulpBuilder = new GulpBuilder()

export default gulpBuilder
