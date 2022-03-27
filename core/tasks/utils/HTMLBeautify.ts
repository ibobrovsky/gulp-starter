import { IPipeHandler } from './pipe'
import { html } from 'js-beautify'
import { appConfig, defaultConfig } from '../../config'

const HTMLBeautify: IPipeHandler = (file) => {
  if (typeof appConfig.HTMLBeautify === 'boolean' && !appConfig.HTMLBeautify) {
    return
  }

  const content = String(file.contents)
  file.contents = Buffer.from(
    html(
      content,
      typeof appConfig.HTMLBeautify === 'boolean'
        ? defaultConfig.HTMLBeautify
        : appConfig.HTMLBeautify,
    ),
  )
}

export default HTMLBeautify
