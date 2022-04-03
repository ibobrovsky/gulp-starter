import gulpPlumber from 'gulp-plumber'
import { logError } from '../log'

export function plumber(): NodeJS.ReadWriteStream {
  return gulpPlumber((error) => {
    logError(error)
  })
}
