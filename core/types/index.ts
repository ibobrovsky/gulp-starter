export type TypeNotRequired<T extends object> = {
  [K in keyof T]?: T[K]
}

export interface IJsonData {
  [key: string]: string | number | boolean | Date | IJsonData
}

export type DefaultFile = {
  name: string
  path: string
}

type InjectDepsFile =
  | string
  | {
      name: string
      async?: boolean
      defer?: boolean
      prefetch?: boolean
      preload?: boolean
    }

type IImportDepsFile = string

interface DepsPlugin {
  from?: string
  inject?: InjectDepsFile | InjectDepsFile[]
  import?: IImportDepsFile | IImportDepsFile[]
}

export interface DepsLinks {
  uid: string
  href: string
  rel?: string
  as?: string
  type?: string
  sizes?: string
  media?: string
  crossorigin?: string
  hreflang?: string
  importance?: string
  integrity?: string
  referrerpolicy?: string
  title?: string
}

export interface Deps {
  plugins?: DepsPlugin[]
  links?: DepsLinks[]
  assets?: string | string[]
  svg?: string | string[]
}
