export interface EventsHelperCallback {
  (...args: any[]): void
  callback?: (...args: any[]) => void
}

interface EventsHelperStore {
  [key: string]: EventsHelperCallback[] | undefined
}

export interface EventsHelperInstance<T extends string = string> {
  $on: (event: T | T[], callback: EventsHelperCallback) => void
  $once: (event: T | T[], callback: EventsHelperCallback) => void
  $off: (event: T | T[], callback: EventsHelperCallback) => void
  $emit: (event: T, ...args: any[]) => void
}

export class EventsHelper<T extends string = string>
  implements EventsHelperInstance<T>
{
  private events: EventsHelperStore = {}

  $on(event: T | T[], callback: EventsHelperCallback): void {
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$on(event[i], callback)
      }
    } else {
      if (!Array.isArray(this.events[event])) {
        this.events[event] = []
      }
      // @ts-ignore
      this.events[event].push(callback)
    }
  }

  $once(event: T | T[], callback: EventsHelperCallback): void {
    const self = this
    const on: EventsHelperCallback = function (...args: any[]): void {
      self.$off(event, on)
      args ? callback.apply(self, args) : callback.call(self)
    }
    on.callback = callback
    this.$on(event, on)
  }

  $off(event?: T | T[], callback?: EventsHelperCallback): void {
    if (!event && !callback) {
      this.events = {}
      return
    }

    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$off(event[i], callback)
      }
      return
    } else if (!event) {
      return
    }

    const cbs = this.events[event]
    if (!cbs) {
      return
    }

    if (!callback) {
      this.events[event] = undefined
      return
    }

    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === callback || cb.callback === callback) {
        cbs.splice(i, 1)
        break
      }
    }
  }

  $emit(event: T, ...args: any[]): void {
    const cbs = this.events[event]
    if (!cbs) {
      return cbs
    }

    cbs.forEach((cb) => {
      if (typeof cb !== 'function') {
        return
      }
      args ? cb.apply(this, args) : cb.call(this)
    })
  }
}
