import { isIE9 } from './BrowserHelper'

let transitionProp = 'transition'
let animationProp = 'animation'

if (!isIE9) {
  if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition'
  }
  if (
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation'
  }
}

export class TransitionHelper {
  static getTransitionTimeout(el?: Element | null): number {
    if (!el) {
      return 0
    }
    const styles = window.getComputedStyle(el)
    const transitionDelays = (styles[transitionProp + 'Delay'] || '').split(
      ', ',
    )
    const transitionDurations = (
      styles[transitionProp + 'Duration'] || ''
    ).split(', ')
    const transitionTimeout = this.getTimeout(
      transitionDelays,
      transitionDurations,
    )
    const animationDelays = (styles[animationProp + 'Delay'] || '').split(', ')
    const animationDurations = (styles[animationProp + 'Duration'] || '').split(
      ', ',
    )
    const animationTimeout = this.getTimeout(
      animationDelays,
      animationDurations,
    )

    return Math.max(transitionTimeout, animationTimeout) || 0
  }

  static getTimeout(delays: string[], durations: string[]): number {
    while (delays.length < durations.length) {
      delays = delays.concat(delays)
    }

    return Math.max.apply(
      null,
      durations.map((d, i) => this.toMs(d) + this.toMs(delays[i])),
    )
  }

  static toMs(s: string) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }
}
