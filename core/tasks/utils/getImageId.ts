import PathsHelper from '../../helpers/PathsHelper'
import path from 'path'
import isSprite from './isSprite'

const getImageId = (filePath: string): string => {
  const basename = path.basename(filePath)

  const componentName = PathsHelper.getComponentName(filePath)

  return (
    (isSprite(filePath) ? 'sprite_' : '') +
    (componentName ? `${componentName}__${basename}` : basename)
  )
}

export default getImageId
