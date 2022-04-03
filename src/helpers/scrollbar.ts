interface ScrollbarProps {
  classFixed?: string
}

export class Scrollbar {
  protected classFixed: string

  protected isBodyOverflowing: boolean = false

  protected firstIsModalOverflowing: boolean = false

  protected firstIsBodyOverflowing: boolean = false

  protected scrollbarWidth: number = 0

  protected readonly data = new WeakMap()

  protected count: number = 0

  constructor(protected params?: ScrollbarProps) {
    this.classFixed = params?.classFixed || 'fixed-content'
  }

  static getScrollbarWidth(): number {
    const scrollDiv = document.createElement('div')
    scrollDiv.style.position = 'absolute'
    scrollDiv.style.top = '-9999px'
    scrollDiv.style.width = '50px'
    scrollDiv.style.height = '50px'
    scrollDiv.style.overflow = 'scroll'
    document.body.appendChild(scrollDiv)
    const scrollbarWidth =
      scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
    document.body.removeChild(scrollDiv)
    return scrollbarWidth
  }

  checkScrollbar(): void {
    const rect = document.body.getBoundingClientRect()
    this.isBodyOverflowing = rect.left + rect.right < window.innerWidth
    this.scrollbarWidth = Scrollbar.getScrollbarWidth()
  }

  setScrollbar(): void {
    if (!this.isBodyOverflowing) {
      return
    }

    const fixedElements = document.querySelectorAll<HTMLElement>(
      `.${this.classFixed}`,
    )

    for (let i = 0; i < fixedElements.length; i++) {
      const element = fixedElements[i]
      const actualPadding = element.style.paddingRight
      const computedStyle = window.getComputedStyle(element, null)
      const calculatedPadding = computedStyle.paddingRight
      this.data.set(element, actualPadding)
      element.style.paddingRight = `${
        parseFloat(calculatedPadding) + this.scrollbarWidth
      }px`
    }

    const actualPadding = document.body.style.paddingRight
    const bodyComputedStyle = window.getComputedStyle(document.body, null)
    const calculatedPadding = bodyComputedStyle.paddingRight

    this.data.set(document.body, actualPadding)
    document.body.style.paddingRight = `${
      parseFloat(calculatedPadding) + this.scrollbarWidth
    }px`
  }

  adjustDialog(el?: HTMLElement | null): void {
    if (!el) {
      return
    }

    const isModalOverflowing =
      el.scrollHeight > document.documentElement.clientHeight

    if (this.count === 1) {
      this.firstIsModalOverflowing = isModalOverflowing
      this.firstIsBodyOverflowing = this.isBodyOverflowing
    }

    if (
      (!this.isBodyOverflowing && isModalOverflowing) ||
      // fix double open
      (!this.firstIsBodyOverflowing && this.firstIsModalOverflowing)
    ) {
      el.style.paddingLeft = `${this.scrollbarWidth}px`
    }

    if (
      (this.isBodyOverflowing && !isModalOverflowing) ||
      // fix double open
      (this.firstIsBodyOverflowing && !this.firstIsModalOverflowing)
    ) {
      el.style.paddingRight = `${this.scrollbarWidth}px`
    }
  }

  static resetAdjustments(el?: HTMLElement | null): void {
    if (!el) {
      return
    }

    el.style.paddingLeft = ''
    el.style.paddingRight = ''
  }

  resetScrollbar(): void {
    const fixedElements = document.querySelectorAll<HTMLElement>(
      `.${this.classFixed}`,
    )
    for (let i = 0; i < fixedElements.length; i++) {
      const element = fixedElements[i]
      const padding = this.data.get(element)
      if (typeof padding !== 'undefined') {
        element.style.paddingRight = padding + ''
        this.data.delete(element)
      }
    }

    const bodyPadding = this.data.get(document.body)
    if (typeof bodyPadding !== 'undefined') {
      document.body.style.paddingRight = bodyPadding + ''
      this.data.delete(document.body)
    }
  }

  add(el?: HTMLElement | null) {
    this.count++
    this.checkScrollbar()
    this.setScrollbar()
    this.adjustDialog(el)
    document.body.style.overflowY = 'hidden'
  }

  remove(el?: HTMLElement | null, timeout: number = 0) {
    setTimeout(() => {
      Scrollbar.resetAdjustments(el)
      if (this.count === 1) {
        document.body.style.overflowY = ''
        this.resetScrollbar()
      }
      this.count--
    }, timeout || 0)
  }
}

export const scrollbarFixedClass: string = 'js-scrollbar-fixed'

export const scrollbar = new Scrollbar({
  classFixed: scrollbarFixedClass,
})
