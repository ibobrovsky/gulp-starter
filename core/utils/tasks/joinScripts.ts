import through, { FlushCallback, TransformFunction } from 'through2'
import File from 'vinyl'
import path from 'path'
import { slashNormalize } from '../slashNormalize'
import { isFile } from '../isFile'

const joinScripts = (
  fileName: string,
  distDir: string,
): ReturnType<typeof through.obj> => {
  const newLine = '\n'

  let latestFile: File
  let latestMod: number

  const concat: File[] = []

  const bufferContents: TransformFunction = function (file, enc, cb) {
    if (file.isNull()) {
      cb()
      return
    }

    if (file.isStream()) {
      this.emit('error', new Error('joinScripts: Streaming not supported'))
      cb()
      return
    }

    if (!latestMod || (file.stat && file.stat.mtime > latestMod)) {
      latestFile = file
      latestMod = file.stat && file.stat.mtime
    }

    concat.push(file)
    cb()
  }

  const endStream: FlushCallback = function (cb) {
    if (!latestFile || !concat.length) {
      cb()
      return
    }

    let joinedFile = latestFile.clone({ contents: false })
    joinedFile.path = path.join(latestFile.base, `${fileName}.ts`)
    joinedFile.contents = Buffer.from(
      getConcatContent(concat, distDir, newLine),
    )

    this.push(joinedFile)
    cb()
  }

  return through.obj(bufferContents, endStream)
}

export default joinScripts

function getConcatContent(
  items: File[],
  distDir: string,
  newLine: string,
): string {
  let content = ''

  items.forEach((file) => {
    const filePath = slashNormalize(path.relative(distDir, file.path))

    if (!isFile(file.path)) {
      return
    }

    const ext = path.extname(filePath)
    const importPath = filePath.substring(0, filePath.length - ext.length)

    content += `import '${importPath}'${newLine}`
  })

  return content
}
