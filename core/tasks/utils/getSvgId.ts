import PathsHelper from '../../helpers/PathsHelper'
import path from 'path'

const getSvgId = (filePath: string): string => {
  const extname = path.extname(filePath)
  const basename = path.basename(filePath, extname)

  const componentName = PathsHelper.getComponentName(filePath)
  return componentName ? `${componentName}__${basename}` : basename
}

export default getSvgId
