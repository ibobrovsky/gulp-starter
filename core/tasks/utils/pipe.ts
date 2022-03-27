import through from 'through2'
import PluginError from 'plugin-error'
import File from 'vinyl'

export interface IPipeHandler<T = any> {
  (file: File, options?: T): void
  displayName?: string
}

export function pipe<T = any>(
  handler?: IPipeHandler<T>,
  options?: T,
  handlerName?: string,
): ReturnType<typeof through.obj> {
  const name = handlerName || handler?.displayName || 'core:pipe'
  if (typeof handler !== 'function') {
    return through.obj()
  }

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file)
    }

    if (file.isStream())
      return cb(new PluginError(name, 'Streaming not supported'))

    if (file.isBuffer()) {
      try {
        handler(file, options)
      } catch (e) {
        // @ts-ignore
        return cb(new PluginError(name, e))
      }
    }

    return cb(null, file)
  })
}
