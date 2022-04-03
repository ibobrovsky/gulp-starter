import path from 'path'
import { IPipeHandler } from './pipe'
import { config } from '../../config'
import { getPath, isAlias } from '../aliases'
import { joinNodeModulesDir } from '../path'
import { isFile } from '../isFile'
import { slashNormalize } from '../slashNormalize'

const injectStyleMixins: IPipeHandler = (file) => {
  const extname = path.extname(file.path)
  const dirname = path.dirname(file.path)
  const content = String(file.contents)

  if (extname !== '.scss') {
    return
  }

  let imports = config.stylesMixins

  if (!Array.isArray(imports)) {
    imports = [imports]
  }

  let injected = ''

  imports.forEach((item) => {
    item = item?.trim()

    if (!item) {
      return
    }

    const file = isAlias(item)
      ? getPath(item)
      : path.isAbsolute(item)
      ? item
      : joinNodeModulesDir(item)

    if (!isFile(file)) {
      return console.log(
        `\n\x1b[41mFAIL\x1b[0m: Style mixin for import "\x1b[36m${item}\x1b[0m" not found!\nFullpath: "${file}"\n`,
      )
    }

    injected += `@import "${slashNormalize(path.relative(dirname, file))}";\n`
  })

  file.contents = Buffer.from(injected + content)
}

export default injectStyleMixins
