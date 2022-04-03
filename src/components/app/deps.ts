import { Deps } from '../../../core/types'

const deps: Deps = {
  plugins: [
    {
      from: 'focus-visible/dist',
      inject: 'focus-visible.min.js',
    },
    {
      from: 'normalize.css',
      inject: {
        name: 'normalize.css',
        preload: true,
      },
    },
  ],
  links: [
    {
      uid: 'googleapis',
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      uid: 'gstatic',
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: undefined,
    },
    {
      uid: 'google-fonts',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap',
      rel: 'stylesheet',
    },
  ],
}

export default deps
