interface FontsState {
  items: string[]
}

const fonts: FontsState = {
  items: [],
}

export function getItems(): FontsState['items'] {
  return fonts.items
}

export function hasItem(filePath: string) {
  return fonts.items.includes(filePath)
}

export function setItem(filePath: string) {
  if (!hasItem(filePath)) {
    fonts.items.push(filePath)
  }
}
