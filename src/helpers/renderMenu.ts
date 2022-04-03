import { getWindowWidth, domEventEmitter, DomEvents, clean } from './dom'

interface RenderMenuClassNames {
  groupsClassName: string
  groupClassName: string
  itemsClassName: string
  itemClassName: string
}

interface RenderMenuProps extends RenderMenuClassNames {
  el: HTMLElement
  startCols: number
  cols: {
    [key: number]: number
  }
}

class RenderMenu {
  private readonly $el: HTMLElement

  private nodes: Node[] = []

  private curCols: number

  private resizeHandlerBound: (this: RenderMenu) => void

  private constructor(private params: RenderMenuProps) {
    this.$el = params.el

    this.curCols = this.getCols()

    this.resizeHandlerBound = this.resizeHandler.bind(this)

    this.init()
  }

  static create(params: RenderMenuProps): void {
    if (!params.el) {
      return
    }
    new RenderMenu({
      ...params,
      el: params.el,
    })
  }

  get classNames(): RenderMenuClassNames {
    return {
      groupsClassName: this.params.groupsClassName,
      groupClassName: this.params.groupClassName,
      itemsClassName: this.params.itemsClassName,
      itemClassName: this.params.itemClassName,
    }
  }

  init(): void {
    this.setNodes()
    this.initEvents()
    if (this.params.startCols !== this.curCols) {
      this.render()
    }
  }

  setNodes(): void {
    const items = this.$el.querySelectorAll<HTMLElement>(
      `.${this.classNames.itemClassName}`,
    )
    this.nodes = Array.from(items).map((node) => node.cloneNode(true))
  }

  getGroupsRef(): HTMLElement | null {
    return this.$el.querySelector(`.${this.classNames.groupsClassName}`)
  }

  clearGroupsNode(): void {
    const node = this.getGroupsRef()
    clean(node)
  }

  renderGroups(): DocumentFragment {
    const fragment = document.createDocumentFragment()

    const groups = this.calculateGroups(this.nodes, this.curCols)
    groups.forEach((items) => {
      fragment.appendChild(this.createGroup(items))
    })
    return fragment
  }

  createGroup(items: Node[]): HTMLElement {
    const itemsEl = document.createElement('ul')
    itemsEl.classList.add(this.classNames.itemsClassName)
    items.forEach((item) => {
      itemsEl.appendChild(item)
    })

    const groupEl = document.createElement('div')
    groupEl.classList.add(this.classNames.groupClassName)
    groupEl.appendChild(itemsEl)

    return groupEl
  }

  calculateGroups<T extends Node>(items: T[], cols: number): T[][] {
    const length = items.length
    if (!length) {
      return []
    }
    const groupLength = Math.ceil(length / cols)

    const remains = length % cols ? cols - (length % cols) : 0
    const groups: T[][] = []
    let i = 1
    let group: T[] = []

    for (const item of items) {
      const colNum = groups.length + 1

      group.push(item)

      if (
        i === groupLength ||
        (remains > 0 && colNum > cols - remains && i === groupLength - 1)
      ) {
        groups.push(group)
        i = 0
        group = []
      }
      i++
    }

    return groups
  }

  mountGroups(nodes: Node) {
    const node = this.getGroupsRef()
    node?.appendChild(nodes)
  }

  initEvents(): void {
    domEventEmitter.on(DomEvents.RESIZE, this.resizeHandlerBound)
  }

  resizeHandler() {
    const cols = this.getCols()
    if (cols !== this.curCols) {
      this.curCols = cols
      this.render()
    }
  }

  getCols(): number {
    let cols = this.params.startCols
    Object.keys(this.params.cols).forEach((size) => {
      if (getWindowWidth() >= parseInt(size)) {
        cols = this.params.cols[size]
      }
    })

    return cols
  }

  render(): void {
    this.clearGroupsNode()
    const nodes = this.renderGroups()
    this.mountGroups(nodes)
  }
}

export default RenderMenu
