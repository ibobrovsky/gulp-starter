import fs from 'fs'
import LogHelper from '../../helpers/Log'

const editTime = (path: string) => {
  try {
    const time = Date.now() / 1000
    fs.utimesSync(path, time, time)
  } catch (e) {
    LogHelper.log(e)
  }
}

export default editTime
