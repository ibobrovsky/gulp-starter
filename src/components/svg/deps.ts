import { Deps } from '../../../core/types'

const deps: Deps = {
  plugins: [
    {
      from: 'svg4everybody/dist',
      inject: 'svg4everybody.min.js',
    },
    {
      from: 'svgxuse',
      inject: {
        name: 'svgxuse.min.js',
        defer: true,
      },
    },
  ],
  links: [
    {
      uid: 'sprite',
      rel: 'preload',
      href: './svg/sprite.svg',
      as: 'image',
      type: 'image/svg+xml',
    },
  ],
}

export default deps
