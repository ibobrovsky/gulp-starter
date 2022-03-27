import { DomHelper } from '../../helpers/DomHelper'

const handler = () => {
  DomHelper.setWindowWidth(DomHelper.calculateWindowWidth())
  DomHelper.setWindowHeight(DomHelper.calculateWindowHeight())
  DomHelper.setScrollTop(DomHelper.calculateScrollTop())
}

const resizeHandler = () => {
  handler()
  DomHelper.$emit('resize')
}

const scrollHandler = () => {
  handler()
  DomHelper.$emit('scroll')
}

document.addEventListener('scroll', scrollHandler)
window.addEventListener('resize', resizeHandler)
