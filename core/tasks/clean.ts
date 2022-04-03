import { ITask } from '../index'
import del from 'del'
import { distDir } from '../utils/path'

export const cleanTaskName = 'clean'

const cleanTask: ITask = {
  build: 0,
  name: cleanTaskName,
  run() {
    return del([distDir])
  },
}

export default cleanTask
