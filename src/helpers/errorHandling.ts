import { isFunction, isPromise } from './utils'

export function callWithErrorHandling(fn: Function, args?: unknown[]) {
  let res
  try {
    res = args ? fn(...args) : fn()
  } catch (err) {
    logError(err)
  }
  return res
}

export function callWithAsyncErrorHandling(
  fn: Function | Function[],
  args?: unknown[],
): any[] {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, args)
    if (res && isPromise(res)) {
      res.catch((err) => {
        logError(err)
      })
    }
    return res
  }

  const values: any[] = []
  for (let i = 0; i < fn.length; i++) {
    values.push(callWithAsyncErrorHandling(fn[i], args))
  }
  return values
}

export function logError(err: unknown, callThrow = true): void {
  if (callThrow) {
    throw err
  } else {
    console.error(err)
  }
}
