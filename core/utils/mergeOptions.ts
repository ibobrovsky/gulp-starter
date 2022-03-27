import { hasOwn } from './hasOwn'

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal
}

export function mergeDeep<T extends Object, S extends Object>(
  target: T,
  ...sources: S[]
): T | (T & S) {
  if (!sources.length) {
    return target
  }

  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        // @ts-ignore
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        // @ts-ignore
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

export function mergeOptions<R extends Object = Object>(
  parent?: Object,
  child?: Object,
  deep: boolean = false,
): R {
  if (typeof parent !== 'object') {
    parent = {}
  }
  if (typeof child !== 'object') {
    child = {}
  }
  if (deep) {
    // @ts-ignore
    return mergeDeep({}, parent, child)
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField(key: string) {
    // @ts-ignore
    options[key] = defaultStrat(parent[key], child[key])
  }
  // @ts-ignore
  return options
}
