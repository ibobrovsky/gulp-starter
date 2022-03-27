export function slashNormalize(str: string): string {
  const isExtendedLengthPath = /^\\\\\?\\/.test(str)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(str) // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) return str

  return str.replace(/\\/g, '/')
}
