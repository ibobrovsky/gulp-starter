export type TypeNotRequired<T extends object> = {
  [K in keyof T]?: T[K]
}

export interface JsonData {
  [key: string]: string | number | boolean | Date | JsonData
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

interface DepsPlugin {
  from?: string
  inject?: InjectDepsFile | InjectDepsFile[]
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

export interface View {
  style?: string
}

export interface Deps {
  plugins?: DepsPlugin[]
  links?: DepsLinks[]
  assets?: string | string[]
  symbols?: string | string[]
  components?: string | string[]
  views?: View[]
}
