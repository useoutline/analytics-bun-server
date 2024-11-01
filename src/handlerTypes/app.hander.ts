import { t } from 'elysia'

export const AppHander = {
  CreateApp: {
    body: t.Object({
      name: t.String(),
      domain: t.String()
    })
  },

  GetApp: {
    params: t.Object({
      id: t.String()
    })
  },

  DeleteApp: {
    params: t.Object({
      id: t.String()
    })
  },

  UpdateAppDetails: {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      domain: t.Optional(t.String())
    })
  },

  AddEvent: {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      event: t.String(),
      selectorType: t.String(),
      selector: t.String(),
      text: t.Optional(t.String()),
      trigger: t.String(),
      page: t.Optional(t.String())
    })
  },

  UpdateEvent: {
    params: t.Object({
      id: t.String(),
      eventId: t.String()
    }),
    body: t.Object({
      event: t.String(),
      selectorType: t.String(),
      selector: t.String(),
      text: t.Optional(t.String()),
      trigger: t.String(),
      page: t.Optional(t.String())
    })
  },

  DeleteEvents: {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      eventIds: t.Array(t.String())
    })
  }
}
