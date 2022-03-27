import type { EventsHelperCallback } from './EventsHelper'
import { EventsHelper } from './EventsHelper'

type DomEvent = 'scroll' | 'resize'

const events = new EventsHelper<DomEvent>()

export class DomHelper {
  static breakXs: number = 360

  static breakSm: number = 768

  static breakMd: number = 1024

  static breakLg: number = 1376

  static windowWidth: number = this.calculateWindowWidth()

  static windowHeight: number = this.calculateWindowHeight()

  static scrollTop: number = this.calculateScrollTop()

  static getWindowWidth(): number {
    return this.windowWidth
  }

  static getWindowHeight(): number {
    return this.windowHeight
  }

  static getScrollTop(): number {
    return this.scrollTop
  }

  static setWindowWidth(newWidth: number = 0): void {
    this.windowWidth = newWidth
  }

  static setWindowHeight(newHeight: number = 0): void {
    this.windowHeight = newHeight
  }

  static setScrollTop(newScrollTop: number = 0): void {
    this.scrollTop = newScrollTop
  }

  static isXs(): boolean {
    return this.windowWidth > 0 && this.windowWidth < this.breakSm
  }

  static isSm(): boolean {
    return this.windowWidth >= this.breakSm && this.windowWidth < this.breakMd
  }

  static isMd(): boolean {
    return this.windowWidth >= this.breakMd && this.windowWidth < this.breakLg
  }

  static isLg(): boolean {
    return this.windowWidth >= this.breakLg
  }

  static calculateWindowWidth(): number {
    return window.innerWidth || document.documentElement.clientWidth || 0
  }

  static calculateWindowHeight(): number {
    return window.innerHeight || document.documentElement.clientHeight || 0
  }

  static calculateScrollTop(): number {
    return window.pageYOffset || document.documentElement.scrollTop || 0
  }

  static $on(event: DomEvent | DomEvent[], callback: EventsHelperCallback) {
    events.$on(event, callback)
  }

  static $once(event: DomEvent | DomEvent[], callback: EventsHelperCallback) {
    events.$once(event, callback)
  }

  static $off(event: DomEvent | DomEvent[], callback: EventsHelperCallback) {
    events.$off(event, callback)
  }

  static $emit(event: DomEvent, ...args: any[]) {
    events.$emit(event, ...args)
  }
}

export function getOffset(el?: HTMLElement) {
  if (!el) {
    return {
      top: 0,
      left: 0,
    }
  }

  const rect = el.getBoundingClientRect()
  const win = el.ownerDocument.defaultView

  return {
    top: rect.top + (win?.pageYOffset || 0),
    left: rect.left + (win?.pageXOffset || 0),
  }
}

export function clean(element?: HTMLElement) {
  if (!element) {
    return
  }
  while (element.childNodes.length > 0) {
    if (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }
}
