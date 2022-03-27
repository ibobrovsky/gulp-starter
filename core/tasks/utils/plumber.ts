import gulpPlumber from 'gulp-plumber'
// @ts-ignore
// import { onError } from 'gulp-notify'
import LogHelper from '../../helpers/Log'

export function plumber(): NodeJS.ReadWriteStream {
  return gulpPlumber((error) => {
    LogHelper.logError(error)
    // return onError('Error')(error)
  })
}
