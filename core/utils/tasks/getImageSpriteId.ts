import path from 'path'
import isImageSprite from './isImageSprite'
import getComponentNameFromPath from './getComponentNameFromPath'

const getImageSpriteId = (filePath: string): string => {
  const basename = path.basename(filePath)

  const componentName = getComponentNameFromPath(filePath)

  return (
    (isImageSprite(filePath) ? 'sprite_' : '') +
    (componentName ? `${componentName}__${basename}` : basename)
  )
}

export default getImageSpriteId
