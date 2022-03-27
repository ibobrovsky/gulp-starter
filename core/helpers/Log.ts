// @ts-ignore
import { onError } from 'gulp-notify'

export default class LogHelper {
  static log(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams)
  }
  static logError(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams)
  }

  static gulpNotify(error?: any): void {
    this.logError(error)
    onError('Error')(error)
  }
}
