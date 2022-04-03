import type { EventMap } from './eventEmitter'
import { EventEmitter } from './eventEmitter'

export const enum AppEvents {
  SHOW_MOBILE_MENU = 'show-mobile-menu',
  HIDE_MOBILE_MENU = 'hide-mobile-menu',
}

interface AppEventEmitterMap extends EventMap {
  [AppEvents.SHOW_MOBILE_MENU]: undefined
  [AppEvents.HIDE_MOBILE_MENU]: undefined
}

export const appEventEmitter = new EventEmitter<AppEventEmitterMap>()
