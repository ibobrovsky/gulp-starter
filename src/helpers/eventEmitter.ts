import { isArray } from './utils'
import { callWithAsyncErrorHandling } from './errorHandling'

export interface EventMap {
  [event: string]: any
}

interface EventFn<T = any> {
  (payload: T): void
  fn?: (payload: T) => void
}

type EventRegistry<T extends EventMap> = {
  [K in keyof T]: EventFn<T[K]>[] | undefined
}

export class EventEmitter<T extends EventMap = EventMap> {
  protected events: EventRegistry<T> = Object.create(null)

  on<K extends keyof T>(event: K | K[], fn: EventFn<T[K]>): void {
    if (isArray(event)) {
      event.forEach((e) => this.on(e, fn))
    } else {
      // @ts-ignore
      ;(this.events[event] || (this.events[event] = [])).push(fn)
    }
  }

  once<K extends keyof T>(event: K, fn: EventFn<T[K]>): void {
    const wrapped: EventFn<T[K]> = (payload: T[K]) => {
      this.off(event, wrapped)
      fn.call(null, payload)
    }
    wrapped.fn = fn
    this.on(event, wrapped)
  }

  off<K extends keyof T>(event?: K | K[], fn?: EventFn<T[K]>) {
    if (!event) {
      this.events = Object.create(null)
      return
    }

    if (isArray(event)) {
      event.forEach((e) => this.off(e, fn))
      return
    }

    const cbs = this.events[event!]
    if (!cbs) {
      return
    }
    if (!fn) {
      this.events[event!] = undefined
      return
    }
    this.events[event!] = cbs.filter(
      (cb) => !(cb === fn || (cb as any).fn === fn),
    )
  }

  emit<K extends keyof T>(event: K, payload?: T) {
    const cbs = this.events[event]
    if (cbs) {
      callWithAsyncErrorHandling(cbs, payload ? [payload] : [])
    }
  }
}
