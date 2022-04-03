import { ITask } from '../index'
import { IS_DEV } from '../utils/env'
import browserSync from 'browser-sync'
import { slashNormalize } from '../utils/slashNormalize'
import { distDir, joinDistDir } from '../utils/path'

interface BrowserSyncTask extends ITask {}

export const browserSyncTaskName = 'browserSync:watch'

const browserSyncTask: BrowserSyncTask = {
  build: 4,
  name: browserSyncTaskName,
  run(done) {
    if (!IS_DEV) {
      return done()
    }

    const bS = browserSync.create()
    const files = slashNormalize(joinDistDir('**', '*.*'))

    bS.init({
      server: distDir,
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
