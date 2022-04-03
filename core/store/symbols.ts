interface SymbolsState {
  items: string[]
  content: string
}

const symbols: SymbolsState = {
  items: [],
  content: '',
}

export function getItems(): SymbolsState['items'] {
  return symbols.items
}

export function hasItem(filePath: string): boolean {
  return !!symbols.items.find((item) => item === filePath)
}

export function setItem(item: string): void {
  if (!hasItem(item)) {
    symbols.items.push(item)
  }
}

export function getContent(): SymbolsState['content'] {
  return symbols.content
}

export function setContent(content: SymbolsState['content']): void {
  symbols.content = content
}
