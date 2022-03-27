import { HTMLBeautifyOptions } from 'js-beautify'
import { TypeNotRequired } from '../types'
import { mergeOptions } from '../utils/mergeOptions'
import LogHelper from '../helpers/Log'
import PathsHelper from '../helpers/PathsHelper'
import { isFile } from '../utils/isFile'
import { requireFile } from '../utils/requireFile'
import { Plugin } from 'svgo'

interface DistConfig {
  styles: string
  fonts: string
  images: string
  svg: string
  scripts: string
  static: string
  favicons: string
}

interface BuildConfig {
  bundleName: string
  splitBundleInPages: boolean
  sourcemaps: boolean
  autoprefixer: boolean | string | string[]
  addVersions: boolean
  HTMLRoot: string
  injectSvg: boolean
}

interface TwigConfig {
  data?: Object
  base?: string
  errorLogToConsole?: boolean
  onError?: () => void
  cache?: boolean
  debug?: boolean
  trace?: boolean
  extname?: boolean | string
  useFileContents?: boolean
  [key: string]: any
}

interface SassConfig {}

interface ManifestConfig {
  appName?: string
  appShortName?: string
  appDescription?: string
  developerName?: string
  developerURL?: string
  lang?: string
  background?: string
  theme_color?: string
  appleStatusBarStyle?: 'black-translucent' | 'default' | 'black'
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  orientation?: 'any' | 'natural' | 'portrait' | 'landscape'
  scope?: string
  start_url?: string
  url?: string
  version?: string
  preferRelatedApplications?: boolean
  safariPinnedTab?: string
  icons?: {
    android?: boolean
    appleIcon?: boolean
    appleStartup?: boolean
    coast?: boolean
    favicons?: boolean
    firefox?: boolean
    windows?: boolean
    yandex?: boolean
  }
  [key: string]: any
}

interface ImageminSvgConfig {
  plugins: Plugin[]
}

interface ImageminJpgConfig {
  quality?: number
  progressive?: boolean
  targa?: boolean
  revert?: boolean
  fastCrush?: boolean
  dcScanOpt?: number
  trellisDC?: boolean
  tune?: string
  overshoot?: boolean
  arithmetic?: boolean
  dct?: string
  quantBaseline?: boolean
  quantTable?: number
  smooth?: number
  maxMemory?: number
  sample?: string[]
  [key: string]: any
}

interface ImageminPngConfig {
  optimizationLevel?: number
  bitDepthReduction?: boolean
  colorTypeReduction?: boolean
  paletteReduction?: boolean
  interlaced?: boolean | null
  errorRecovery?: boolean
  [key: string]: any
}

interface ImageminGifConfig {
  interlaced?: boolean
  optimizationLevel?: number
  colors?: number
  [key: string]: any
}

export type ImageminConfig = {
  svg?: ImageminSvgConfig | boolean
  jpg?: ImageminJpgConfig | boolean
  png?: ImageminPngConfig | boolean
  gif?: ImageminGifConfig | boolean
}

export interface DefaultConfig {
  stylesMixins: string | string[]
  globalStyles: string | string[]
  globalScripts: string | string[]
  importComponentsInPages: boolean
  HTMLBeautify: HTMLBeautifyOptions
  build: BuildConfig
  dist: DistConfig
  twig: TwigConfig
  sass: SassConfig
  cssNano: Object
  manifest: ManifestConfig
  imagemin: ImageminConfig
}

export interface AppConfig {
  stylesMixins?: string | string[]
  globalStyles?: string | string[]
  globalScripts?: string | string[]
  importComponentsInPages?: boolean
  HTMLBeautify?: boolean | HTMLBeautifyOptions
  build?: TypeNotRequired<BuildConfig>
  dist?: TypeNotRequired<DistConfig>
  twig?: TwigConfig
  sass?: SassConfig
  cssNano?: Object
  manifest?: TypeNotRequired<ManifestConfig>
  imagemin?: ImageminConfig
}

export const defaultConfig: DefaultConfig = {
  importComponentsInPages: true,
  HTMLBeautify: {
    indent_size: 2,
    indent_char: ' ',
    indent_with_tabs: false,
    end_with_newline: false,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    content_unformatted: ['pre', 'textarea'],
  },
  build: {
    bundleName: 'app',
    splitBundleInPages: false,
    sourcemaps: true,
    autoprefixer: ['last 3 versions', 'ie 10', 'ie 11'],
    addVersions: false,
    HTMLRoot: './',
    injectSvg: false,
  },
  dist: {
    favicons: 'favicons',
    scripts: 'scripts',
    static: 'static',
    styles: 'styles',
    fonts: 'styles/fonts',
    images: 'styles/images',
    svg: 'svg',
  },
  globalScripts: [],
  stylesMixins: [],
  globalStyles: [],
  twig: {
    errorLogToConsole: true,
    useFileContents: true,
  },
  sass: {},
  cssNano: {},
  manifest: {
    icons: {
      android: false,
      appleIcon: false,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      windows: false,
      yandex: false,
    },
    safariPinnedTab: '#424b5f',
  },
  imagemin: {
    svg: {
      plugins: [
        {
          name: 'cleanupIDs',
          active: false,
        },
        {
          name: 'removeViewBox',
          active: false,
        },
        {
          name: 'mergePaths',
          active: false,
        },
      ],
    },
    jpg: {
      arithmetic: false,
      progressive: true,
    },
    png: {
      optimizationLevel: 5,
      bitDepthReduction: true,
      colorTypeReduction: true,
      paletteReduction: true,
    },
    gif: {
      optimizationLevel: 1,
      interlaced: true,
    },
  },
}

export const appConfig: AppConfig = loadAppConfig() || {}

export const distConfig: DistConfig = {
  favicons: appConfig.dist?.favicons || defaultConfig.dist.favicons,
  fonts: appConfig.dist?.fonts || defaultConfig.dist.fonts,
  images: appConfig.dist?.images || defaultConfig.dist.images,
  svg: appConfig.dist?.svg || defaultConfig.dist.svg,
  static: appConfig.dist?.static || defaultConfig.dist.static,
  scripts: appConfig.dist?.scripts || defaultConfig.dist.scripts,
  styles: appConfig.dist?.styles || defaultConfig.dist.styles,
}

function loadAppConfig(): AppConfig | undefined {
  try {
    const fileConfig = PathsHelper.joinSrcDir('config.ts')
    if (!isFile(fileConfig)) {
      return undefined
    }
    return requireFile<AppConfig>(fileConfig)
  } catch (e) {
    LogHelper.logError(e)
  }
  return undefined
}
