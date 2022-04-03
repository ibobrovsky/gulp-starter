import {
  getScrollTop,
  getOffset,
  domEventEmitter,
  DomEvents,
} from '../../helpers/dom'
import { scrollbarFixedClass } from '../../helpers/scrollbar'

const header = document.querySelector<HTMLElement>('.header')

const isFixed = (): boolean => {
  if (!header) {
    return false
  }

  const { top } = getOffset(header)
  const scrollTop = getScrollTop()

  return scrollTop > 0 && scrollTop >= top
}

const handler = (): void => {
  if (!header) {
    return
  }
  const method = isFixed() ? 'add' : 'remove'
  header.classList[method]('header--fixed')
  const container = header.querySelector('.header__container')
  container?.classList[method](scrollbarFixedClass)
}

domEventEmitter.on([DomEvents.SCROLL, DomEvents.RESIZE], handler)
