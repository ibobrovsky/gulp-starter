export function requireFile<R = any>(filePath: string, delCache = false): R {
  if (delCache) {
    delete require.cache[require.resolve(filePath)]
  }

  let file = require(filePath)
  if (file && file.__esModule) {
    return file.default
  }
  return file
}
