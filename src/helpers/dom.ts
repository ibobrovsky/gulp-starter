import type { EventMap } from './eventEmitter'
import { EventEmitter } from './eventEmitter'

export const enum DomEvents {
  SCROLL = 'scroll',
  RESIZE = 'resize',
}

interface DomEventEmitterMap extends EventMap {
  [DomEvents.SCROLL]: undefined
  [DomEvents.RESIZE]: undefined
}

export const domEventEmitter = new EventEmitter<DomEventEmitterMap>()

export const breakXs: number = 375

export const breakSm: number = 768

export const breakMd: number = 1024

export const breakLg: number = 1280

export const breakXl: number = 1400

export const breakXXl: number = 1920

export function calculateWindowWidth(): number {
  return window.innerWidth || document.documentElement.clientWidth || 0
}

export function calculateWindowHeight(): number {
  return window.innerHeight || document.documentElement.clientHeight || 0
}

export function calculateScrollTop(): number {
  return window.pageYOffset || document.documentElement.scrollTop || 0
}

let windowWidth: number = calculateWindowWidth()

let windowHeight: number = calculateWindowHeight()

let scrollTop: number = calculateScrollTop()

export function getWindowWidth(): number {
  return windowWidth
}

export function getWindowHeight(): number {
  return windowHeight
}

export function getScrollTop(): number {
  return scrollTop
}

export function setWindowWidth(newWidth: number = 0): void {
  windowWidth = newWidth
}

export function setWindowHeight(newHeight: number = 0): void {
  windowHeight = newHeight
}

export function setScrollTop(newScrollTop: number = 0): void {
  scrollTop = newScrollTop
}

export function isXs(): boolean {
  return windowWidth > 0 && windowWidth < breakSm
}

export function isSm(): boolean {
  return windowWidth >= breakSm && windowWidth < breakMd
}

export function isMd(): boolean {
  return windowWidth >= breakMd && windowWidth < breakLg
}

export function isLg(): boolean {
  return windowWidth >= breakLg && windowWidth < breakXl
}

export function isXl(): boolean {
  return windowWidth >= breakXl && windowWidth < breakXXl
}

export function isXXl(): boolean {
  return windowWidth >= breakXXl
}

export function getOffset(el?: HTMLElement | null) {
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

export function clean(element?: HTMLElement | null) {
  if (!element) {
    return
  }
  while (element.childNodes.length > 0) {
    if (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }
}
