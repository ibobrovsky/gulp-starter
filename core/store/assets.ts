interface Replaces {
  oldPath: string
  newPath: string
}

interface AssetsState {
  items: string[]
  replaces: Replaces[]
}

const assets: AssetsState = {
  items: [],
  replaces: [],
}

export function getItems(): AssetsState['items'] {
  return assets.items
}

export function hasItem(filePath: string): boolean {
  return !!assets.items.find((item) => item === filePath)
}

export function setItem(item: string): void {
  if (!hasItem(item)) {
    assets.items.push(item)
  }
}

export function getReplaces(): AssetsState['replaces'] {
  return assets.replaces
}

export function hasReplace(item: Replaces): boolean {
  return !!assets.replaces.find(({ oldPath }) => oldPath === item.oldPath)
}

export function setReplace(item: Replaces): void {
  const index = assets.replaces.findIndex(
    ({ oldPath }) => oldPath === item.oldPath,
  )
  if (index === -1) {
    assets.replaces.push(item)
  } else {
    assets.replaces.splice(index, 1, item)
  }
}
