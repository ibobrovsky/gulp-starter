import { ITask } from '../index'
import { IS_DEV } from '../utils/env'
import browserSync from 'browser-sync'
import PathsHelper from '../helpers/PathsHelper'
import { slashNormalize } from '../utils/slashNormalize'

interface BrowserSyncTask extends ITask {}

const browserSyncTask: BrowserSyncTask = {
  build: 5,
  name: 'browserSync:watch',
  run(done) {
    if (!IS_DEV) {
      return done()
    }

    const bS = browserSync.create()
    const files = slashNormalize(PathsHelper.joinDistDir('**', '*.*'))

    bS.init({
      server: PathsHelper.distDir,
      port: parseInt(process.env.PORT || '3000'),
      tunnel: process.env.TUNNEL || false,
      snippetOptions: {
        rule: {
          match: /<\/body>/i,
        },
      },
    })

    bS.watch(files).on('change', bS.reload)
  },
}

export default browserSyncTask
