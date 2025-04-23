import { t } from 'elysia'

const CreateApp = {
  body: t.Object({
    name: t.String(),
    domain: t.RegExp(
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    )
  })
}

type GetApp = {
  params: {
    id: string
  }
}

type DeleteApp = {
  params: {
    id: string
  }
}

type UpdateAppDetails = {
  params: {
    id: string
  }
  body: {
    name?: string
    domain?: string
  }
}

type EventData = {
  event: string
  selectorType: string
  selector: string
  text?: string
  trigger: string
  page?: string
}

type AddEvent = {
  params: {
    id: string
  }
  body: EventData
}

type UpdateEvent = {
  params: {
    id: string
    eventId: string
  }
  body: EventData
}

type DeleteEvents = {
  params: {
    id: string
  }
  body: {
    eventIds: string[]
  }
}

export type AppHandler = {
  CreateApp: CreateApp
  GetApp: GetApp
  DeleteApp: DeleteApp
  UpdateAppDetails: UpdateAppDetails
  AddEvent: AddEvent
  UpdateEvent: UpdateEvent
  DeleteEvents: DeleteEvents
}
