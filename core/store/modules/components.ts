import { DefaultFile, DepsLinks } from '../../types'

type ImportsStyles = DefaultFile

type ImportsScripts = DefaultFile

type InjectsStyles = {
  prefetch?: boolean
  preload?: boolean
} & DefaultFile

type InjectsScripts = {
  async?: boolean
  defer?: boolean
} & DefaultFile

export interface InjectsLinks extends DepsLinks {}

export interface Imports {
  styles: ImportsStyles[]
  scripts: ImportsScripts[]
}

export interface Injects {
  styles: InjectsStyles[]
  scripts: InjectsScripts[]
  links: InjectsLinks[]
}

export type IComponent = {
  imports?: Imports
  injects?: Injects
  template?: string
  script?: string
  style?: string
} & DefaultFile

interface ComponentState {
  [name: string]: IComponent
}

const components: ComponentState = {}

export default components
