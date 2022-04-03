// @ts-ignore
import { onError } from 'gulp-notify'

export function log(message?: any, ...optionalParams: any[]): void {
  console.log(message, ...optionalParams)
}

export function logWarn(message?: any, ...optionalParams: any[]): void {
  console.warn(message, ...optionalParams)
}

export function logError(message?: any, ...optionalParams: any[]): void {
  console.error(message, ...optionalParams)
}

export function gulpNotify(error?: any): void {
  logError(error)
  onError('Error')(error)
}
