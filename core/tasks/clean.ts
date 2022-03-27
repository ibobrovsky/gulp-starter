import { ITask } from '../index'
import del from 'del'
import PathsHelper from '../helpers/PathsHelper'

const cleanTask: ITask = {
  build: 0,
  name: 'clean',
  run() {
    return del([PathsHelper.distDir, PathsHelper.coreTmpDir])
  },
}

export default cleanTask
