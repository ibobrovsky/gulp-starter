export function isExternal(str: string): boolean {
  return (
    /^(?:https?\:)?\/\//i.test(str) ||
    str.indexOf('data:') === 0 ||
    str.charAt(0) === '#'
  )
}
