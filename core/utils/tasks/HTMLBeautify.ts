import { IPipeHandler } from './pipe'
import { html } from 'js-beautify'
import { config } from '../../config'

const HTMLBeautify: IPipeHandler = (file) => {
  const content = String(file.contents)

  file.contents = Buffer.from(html(content, config.HTMLBeautify || {}))
}

export default HTMLBeautify
