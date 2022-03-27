import { DomHelper, getOffset } from '../../helpers/DomHelper'
import { scrollbarFixedClass } from '../../helpers/ScrollbarHelper'

const header = document.querySelector<HTMLElement>('.header')

const isFixed = (): boolean => {
  if (!header) {
    return false
  }

  const { top } = getOffset(header)
  const scrollTop = DomHelper.getScrollTop()

  return scrollTop > 0 && scrollTop >= top && !DomHelper.isLg()
}

const handler = (): void => {
  if (!header) {
    return
  }
  const method = isFixed() ? 'add' : 'remove'
  header.classList[method]('header--fixed')
  const container = header.querySelector<HTMLElement>('.header__container')
  if (container) {
    container.classList[method](scrollbarFixedClass)
  }
}

DomHelper.$on(['scroll', 'resize'], handler)
