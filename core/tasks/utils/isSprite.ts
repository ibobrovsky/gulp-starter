import path from 'path'

const isSprite = (filePath: string): boolean => {
  return filePath.includes(path.join('images', 'sprite'))
}

export default isSprite
