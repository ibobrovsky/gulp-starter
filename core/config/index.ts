import { HTMLBeautifyOptions } from 'js-beautify'
import { TypeNotRequired } from '../types'
import { joinSrcDir } from '../utils/path'
import { isFile } from '../utils/isFile'
import { requireFile } from '../utils/requireFile'
import { logError } from '../utils/log'
import { Plugin } from 'svgo'

interface DistConfig {
  styles: string
  fonts: string
  images: string
  symbols: string
  scripts: string
  static: string
  favicons: string
}

interface BuildConfig {
  bundleName: string
  templateBundleName: string
  addVersion: boolean
  sourcemaps: boolean | 'css' | 'js'
  splitBundle: boolean | 'css' | 'js'
  layoutComponents: string[]
  HTMLRoot: string
  injectSymbols: boolean
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

interface SassConfig {}

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
  importComponentsInPages: boolean
  dist: DistConfig
  build: BuildConfig
  twig: TwigConfig
  HTMLBeautify: false | HTMLBeautifyOptions
  manifest: false | ManifestConfig
  sass: SassConfig
  autoprefixer: false | string | string[]
  cssNano: Object
  imagemin: false | ImageminConfig
}

export interface AppConfig {
  stylesMixins?: DefaultConfig['stylesMixins']
  globalStyles?: DefaultConfig['globalStyles']
  importComponentsInPages?: DefaultConfig['importComponentsInPages']
  dist?: TypeNotRequired<DistConfig>
  build?: TypeNotRequired<BuildConfig>
  twig?: DefaultConfig['twig']
  HTMLBeautify?: DefaultConfig['HTMLBeautify']
  manifest?: DefaultConfig['manifest']
  sass?: DefaultConfig['sass']
  autoprefixer?: DefaultConfig['autoprefixer']
  cssNano?: DefaultConfig['cssNano']
  imagemin?: DefaultConfig['imagemin']
}

const defaultConfig: DefaultConfig = {
  stylesMixins: [],
  globalStyles: [],
  importComponentsInPages: true,
  build: {
    bundleName: 'app',
    templateBundleName: 'template',
    addVersion: false,
    sourcemaps: false,
    splitBundle: false,
    layoutComponents: [],
    HTMLRoot: './',
    injectSymbols: false,
  },
  dist: {
    favicons: 'favicons',
    scripts: 'scripts',
    static: 'static',
    styles: 'styles',
    fonts: 'styles/fonts',
    images: 'styles/images',
    symbols: 'symbols',
  },
  twig: {
    errorLogToConsole: true,
    useFileContents: true,
  },
  HTMLBeautify: {
    indent_size: 2,
    indent_char: ' ',
    indent_with_tabs: false,
    end_with_newline: false,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    content_unformatted: ['pre', 'textarea'],
  },
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
  sass: {},
  autoprefixer: ['last 3 versions', 'ie 10', 'ie 11'],
  cssNano: {
    reduceTransforms: false,
    discardUnused: false,
    convertValues: false,
    normalizeUrl: false,
    autoprefixer: false,
    reduceIdents: false,
    mergeIdents: false,
    zindex: false,
    calc: false,
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

const appConfig: AppConfig = loadAppConfig() || {}

export const config: DefaultConfig = {
  stylesMixins: appConfig.stylesMixins || defaultConfig.stylesMixins,
  globalStyles: appConfig.globalStyles || defaultConfig.globalStyles,
  importComponentsInPages:
    typeof appConfig.importComponentsInPages === 'undefined'
      ? defaultConfig.importComponentsInPages
      : appConfig.importComponentsInPages,
  dist: {
    favicons: appConfig.dist?.favicons || defaultConfig.dist.favicons,
    fonts: appConfig.dist?.fonts || defaultConfig.dist.fonts,
    images: appConfig.dist?.images || defaultConfig.dist.images,
    symbols: appConfig.dist?.symbols || defaultConfig.dist.symbols,
    static: appConfig.dist?.static || defaultConfig.dist.static,
    scripts: appConfig.dist?.scripts || defaultConfig.dist.scripts,
    styles: appConfig.dist?.styles || defaultConfig.dist.styles,
  },
  build: !appConfig.build
    ? defaultConfig.build
    : {
        bundleName:
          appConfig.build.bundleName || defaultConfig.build.bundleName,
        templateBundleName:
          appConfig.build.templateBundleName ||
          defaultConfig.build.templateBundleName,
        addVersion:
          typeof appConfig.build.addVersion === 'undefined'
            ? defaultConfig.build.addVersion
            : appConfig.build.addVersion,
        sourcemaps:
          typeof appConfig.build.sourcemaps === 'undefined'
            ? defaultConfig.build.sourcemaps
            : appConfig.build.sourcemaps,
        splitBundle:
          typeof appConfig.build.splitBundle === 'undefined'
            ? defaultConfig.build.splitBundle
            : appConfig.build.splitBundle,
        layoutComponents:
          appConfig.build.layoutComponents ||
          defaultConfig.build.layoutComponents,
        HTMLRoot: appConfig.build.HTMLRoot || defaultConfig.build.HTMLRoot,
        injectSymbols:
          typeof appConfig.build.injectSymbols === 'undefined'
            ? defaultConfig.build.injectSymbols
            : appConfig.build.injectSymbols,
      },
  twig: appConfig.twig || defaultConfig.twig,
  HTMLBeautify:
    typeof appConfig.HTMLBeautify === 'undefined' ||
    appConfig.HTMLBeautify === false
      ? defaultConfig.HTMLBeautify
      : appConfig.HTMLBeautify,
  manifest:
    typeof appConfig.manifest === 'undefined' || appConfig.manifest === false
      ? defaultConfig.manifest
      : appConfig.manifest,
  sass: appConfig.sass || defaultConfig.sass,
  autoprefixer:
    typeof appConfig.autoprefixer === 'undefined' ||
    appConfig.autoprefixer === false
      ? defaultConfig.autoprefixer
      : appConfig.autoprefixer,
  cssNano: appConfig.cssNano || defaultConfig.cssNano,
  imagemin:
    typeof appConfig.imagemin === 'undefined' || appConfig.imagemin === false
      ? defaultConfig.imagemin
      : appConfig.imagemin,
}

function loadAppConfig(): AppConfig | undefined {
  try {
    const fileConfig = joinSrcDir('config.ts')
    if (!isFile(fileConfig)) {
      return undefined
    }
    return requireFile<AppConfig>(fileConfig)
  } catch (e) {
    logError(e)
  }
  return undefined
}
