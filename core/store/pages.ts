import { JsonData } from '../types'
import { hasOwn } from '../utils/hasOwn'
import { mergeOptions } from '../utils/mergeOptions'
import { View } from './components'

type PageView = { path: string; name: string; fullName: string }

export interface IPage {
  name: string
  path: string
  components: string[]
  views: PageView[]
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
  const index = pages.items.findIndex((_page) => _page.name === page.name)

  if (index === -1) {
    pages.items.push(page)
  } else {
    pages.items.splice(index, 1, mergeOptions(pages.items[index], page, true))
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
