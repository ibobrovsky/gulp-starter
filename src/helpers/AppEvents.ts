import { EventsHelper } from './EventsHelper'

type AppEvents = string

export const AppEvents = new EventsHelper<AppEvents>()
