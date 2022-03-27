import { isFile } from '../../utils/isFile'
import { IS_DEV } from '../../utils/env'
import LogHelper from '../../helpers/Log'

export function checkFile(
  file: string,
  component: string,
  name: string,
): boolean {
  if (!isFile(file)) {
    const message = `\n\n\x1b[41mFAIL\x1b[0m: Component "\x1b[36m${component}\x1b[0m" has dependency "\x1b[36m${name}\x1b[0m", but this file not found, please install plugin or remove it from "\x1b[36m${component}/deps.ts\x1b[0m"!\n\nNot found: ${file}.\n\n`
    if (!IS_DEV) {
      throw new Error(message)
    }

    LogHelper.logError(message)

    return false
  }

  return true
}
