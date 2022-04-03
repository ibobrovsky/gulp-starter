interface ImagesState {
  items: string[]
}

const images: ImagesState = {
  items: [],
}

export function getItems(): ImagesState['items'] {
  return images.items
}

export function hasItem(filePath: string) {
  return images.items.includes(filePath)
}

export function setItem(filePath: string) {
  if (!hasItem(filePath)) {
    images.items.push(filePath)
  }
}
