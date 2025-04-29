import { APP_CONTROLLER_ERROR_CODES } from '@/utils/constants'
import { t } from 'elysia'
import { ErrorResponseTypebox, GenericErrorResponseTypebox } from '@/types/error'
import { AuthHeader } from '@/types/headers'
import { sendRouteError } from '@/utils/sendRouteError'

const AppIdParam = t.Object({
  id: t.String({
    title: 'App ID',
    error: {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.INVALID_APP_ID,
      message: 'Invalid app ID'
    }
  })
})

const App = t.Object({
  id: t.String(),
  name: t.String(),
  domain: t.String(),
  status: t.Union([t.Literal('ACTIVE'), t.Literal('PAUSED'), t.Literal('SUSPENDED')]),
  events: t.Array(
    t.Object({
      id: t.String(),
      event: t.String(),
      selector_type: t.Union([
        t.Literal('id'),
        t.Literal('class'),
        t.Literal('attribute'),
        t.Literal('text'),
        t.Literal('selector')
      ]),
      selector: t.String(),
      trigger: t.String()
    })
  )
})

const CreateApp = {
  body: t.Object({
    name: t.String({
      title: 'App Name',
      minLength: 1,
      maxLength: 100,
      error({ errors }) {
        switch (errors[0].type) {
          case 45:
            return sendRouteError(
              APP_CONTROLLER_ERROR_CODES.APP_NAME_REQUIRED,
              'App name is required'
            )
          case 51: {
            return sendRouteError(
              APP_CONTROLLER_ERROR_CODES.APP_NAME_INVALID,
              'App name cannot be more than 100 characters'
            )
          }
          case 52: {
            return sendRouteError(
              APP_CONTROLLER_ERROR_CODES.APP_NAME_INVALID,
              'App name cannot be empty'
            )
          }
          default:
            return sendRouteError(
              APP_CONTROLLER_ERROR_CODES.APP_NAME_INVALID,
              'App name should be a string'
            )
        }
      }
    }),
    domain: t.Optional(
      t.String({
        title: 'App Domain',
        error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_DOMAIN, 'Invalid app domain')
      })
    )
  }),
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: t.Object({
        id: t.String(),
        name: t.String(),
        domain: t.String()
      })
    }),
    ...GenericErrorResponseTypebox,
    403: ErrorResponseTypebox
  }
}

const GetApp = {
  params: AppIdParam,
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: App
    }),
    ...GenericErrorResponseTypebox
  }
}

const DeleteApp = {
  params: AppIdParam,
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: t.Object({
        id: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

const UpdateAppDetails = {
  params: AppIdParam,
  headers: AuthHeader,
  body: t.Partial(
    t.Object({
      name: t.String({
        title: 'App Name',
        minLength: 1,
        maxLength: 100,
        error: sendRouteError(APP_CONTROLLER_ERROR_CODES.APP_NAME_INVALID, 'Invalid app name')
      }),
      domain: t.String({
        title: 'App Domain',
        error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_DOMAIN, 'Invalid app domain')
      })
    })
  ),
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: t.Object({
        id: t.String(),
        name: t.String(),
        domain: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

const FetchApps = {
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      apps: t.Array(App)
    }),
    500: ErrorResponseTypebox
  }
}

const EventData = t.Object({
  event: t.String({
    title: 'Event Name',
    minLength: 1,
    error: sendRouteError(APP_CONTROLLER_ERROR_CODES.EVENT_REQUIRED, 'Event is required')
  }),
  selector_type: t.Union(
    [
      t.Literal('id'),
      t.Literal('class'),
      t.Literal('attribute'),
      t.Literal('text'),
      t.Literal('selector')
    ],
    {
      title: 'Selector Type',
      error: sendRouteError(
        APP_CONTROLLER_ERROR_CODES.SELECTOR_TYPE_REQUIRED,
        'Selector type is required'
      )
    }
  ),
  selector: t.String({
    title: 'Selector',
    minLength: 1,
    error: sendRouteError(APP_CONTROLLER_ERROR_CODES.SELECTOR_REQUIRED, 'Selector is required')
  }),
  text: t.Optional(
    t.String({
      title: 'Text',
      minLength: 1,
      error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_TEXT, 'Invalid Text')
    })
  ),
  trigger: t.String({
    title: 'Trigger',
    minLength: 1,
    error: sendRouteError(APP_CONTROLLER_ERROR_CODES.TRIGGER_REQUIRED, 'Trigger is required')
  }),
  page: t.Optional(
    t.String({
      title: 'Page',
      format: 'uri',
      minLength: 1,
      error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_PAGE, 'Invalid Page')
    })
  )
})

const AddEvent = {
  params: t.Object({
    id: t.String({
      title: 'App ID',
      error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_ID, 'Invalid app ID')
    })
  }),
  body: EventData,
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: App
    }),
    ...GenericErrorResponseTypebox
  }
}

const UpdateEvent = {
  params: t.Object({
    id: t.String({
      title: 'App ID',
      error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_ID, 'Invalid app ID')
    }),
    eventId: t.String({
      title: 'Event ID',
      error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_EVENT_IDS, 'Invalid event IDs')
    })
  }),
  headers: AuthHeader,
  body: t.Partial(EventData),
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: App
    }),
    ...GenericErrorResponseTypebox
  }
}

const DeleteEvents = {
  params: t.Object({
    id: t.String({
      title: 'App ID',
      error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_ID, 'Invalid app ID')
    })
  }),
  body: t.Object({
    eventIds: t.Array(
      t.String({
        error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_EVENT_IDS, 'Invalid event IDs')
      }),
      {
        title: 'Event IDs',
        error: sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_EVENT_IDS, 'Invalid event IDs')
      }
    )
  }),
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      app: App
    }),
    ...GenericErrorResponseTypebox
  }
}

export {
  CreateApp,
  GetApp,
  DeleteApp,
  UpdateAppDetails,
  FetchApps,
  AddEvent,
  UpdateEvent,
  DeleteEvents
}

export type AppHandler = {
  CreateApp: {
    body: typeof CreateApp.body.static
  }
  GetApp: {
    params: typeof GetApp.params.static
  }
  DeleteApp: {
    params: typeof DeleteApp.params.static
  }
  UpdateAppDetails: {
    params: typeof UpdateAppDetails.params.static
    body: typeof UpdateAppDetails.body.static
  }
  AddEvent: {
    params: typeof AddEvent.params.static
    body: typeof AddEvent.body.static
  }
  UpdateEvent: {
    params: typeof UpdateEvent.params.static
    body: typeof UpdateEvent.body.static
  }
  DeleteEvents: {
    params: typeof DeleteEvents.params.static
    body: typeof DeleteEvents.body.static
  }
}
