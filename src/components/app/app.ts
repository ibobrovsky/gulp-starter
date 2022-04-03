import {
  setWindowWidth,
  setWindowHeight,
  setScrollTop,
  calculateWindowWidth,
  calculateWindowHeight,
  calculateScrollTop,
  domEventEmitter,
  DomEvents,
} from '../../helpers/dom'

const handler = () => {
  setWindowWidth(calculateWindowWidth())
  setWindowHeight(calculateWindowHeight())
  setScrollTop(calculateScrollTop())
}

const resizeHandler = () => {
  handler()
  domEventEmitter.emit(DomEvents.RESIZE)
}

const scrollHandler = () => {
  handler()
  domEventEmitter.emit(DomEvents.SCROLL)
}

document.addEventListener('scroll', scrollHandler)
window.addEventListener('resize', resizeHandler)
