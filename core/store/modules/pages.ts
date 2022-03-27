export type IPage = {
  name: string
  components?: string[]
}

export type PagesState = {
  items: {
    [K: string]: IPage
  }
  depsChanged: string[]
}

const pages: PagesState = {
  items: {},
  depsChanged: [],
}

export default pages
