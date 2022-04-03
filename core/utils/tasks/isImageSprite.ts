import path from 'path'

const isImageSprite = (filePath: string): boolean => {
  return filePath.includes(path.join('images', 'sprite'))
}

export default isImageSprite
