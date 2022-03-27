interface Replaces {
  old: string
  new: string
}

export type AssetsState = {
  items: string[]
  replaces: Replaces[]
}

const assets: AssetsState = {
  items: [],
  replaces: [],
}

export default assets
