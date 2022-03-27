export function toCamelCase(str: string) {
  if (!(str.length && str.includes('-'))) {
    return str
  }

  str = (' ' + str)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
      return chr.toUpperCase()
    })

  return str[0].toLowerCase() + str.substr(1)
}
