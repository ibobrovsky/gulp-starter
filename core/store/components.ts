import { DefaultFile, DepsLinks } from '../types'

type InjectsStyles = {
  prefetch?: boolean
  preload?: boolean
} & DefaultFile

type InjectsScripts = {
  async?: boolean
  defer?: boolean
} & DefaultFile

export interface InjectsLinks extends DepsLinks {}

export interface Injects {
  styles: InjectsStyles[]
  scripts: InjectsScripts[]
  links: InjectsLinks[]
}

export type IComponent = {
  injects?: Injects
  template?: string
  script?: string
  style?: string
  depsComponents?: string[]
} & DefaultFile

interface ComponentsState {
  items: IComponent[]
}

const components: ComponentsState = {
  items: [],
}

export function hasItem(name: string): boolean {
  return !!components.items.find((component) => component.name === name)
}

export function getItem(name: string): IComponent | undefined {
  return components.items.find((component) => component.name === name)
}

export function getItems(): ComponentsState['items'] {
  return components.items
}

export function clearItems(): void {
  components.items = []
}

export function setItem(component: IComponent): void {
  if (!hasItem(component.name)) {
    components.items.push(component)
  }
}
