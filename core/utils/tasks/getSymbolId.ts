import path from 'path'
import getComponentNameFromPath from './getComponentNameFromPath'

const getSymbolId = (filePath: string): string => {
  const extname = path.extname(filePath)
  const basename = path.basename(filePath, extname)

  const componentName = getComponentNameFromPath(filePath)
  return componentName ? `${componentName}__${basename}` : basename
}

export default getSymbolId
