import { JsonData } from '../types'
import { hasOwn } from '../utils/hasOwn'
import { mergeOptions } from '../utils/mergeOptions'

export interface IPage {
  name: string
  path: string
  components: string[]
  symbols: boolean
}

interface PagesState {
  items: IPage[]
  data: JsonData
  depsChanged: string[]
}

const pages: PagesState = {
  items: [],
  data: {},
  depsChanged: [],
}

export function getItems(): PagesState['items'] {
  return pages.items
}

export function hasItem(name: string): boolean {
  return !!pages.items.find((page) => page.name === name)
}

export function getItem(name: string): IPage | undefined {
  return pages.items.find((page) => page.name === name)
}

export function setItem(page: IPage): void {
  if (!hasItem(page.name)) {
    pages.items.push(page)
  }
}

export function getData(): PagesState['data'] {
  return pages.data
}

export function setData(
  key: string,
  data: JsonData = {},
  updated: boolean = true,
): void {
  if (hasOwn(pages.data, key)) {
    pages.data[key] = updated ? mergeOptions(pages.data[key], data, true) : data
  } else {
    pages.data[key] = data
  }
}

export function getDepsChanged(): PagesState['depsChanged'] {
  return pages.depsChanged
}

export function clearDepsChanged(): void {
  pages.depsChanged = []
}

export function hasDepChanged(pageName: string): boolean {
  return pages.depsChanged.includes(pageName)
}

export function setDepChanged(pageName: string): void {
  if (!hasDepChanged(pageName)) {
    pages.depsChanged.push(pageName)
  }
}
