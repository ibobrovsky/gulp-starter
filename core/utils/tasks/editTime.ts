import fs from 'fs'
import { log } from '../log'

const editTime = (path: string) => {
  try {
    const time = Date.now() / 1000
    fs.utimesSync(path, time, time)
  } catch (e) {
    log(e)
  }
}

export default editTime
