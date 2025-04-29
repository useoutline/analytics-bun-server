import AppModel from '@/models/App.model'
import { APP_CONTROLLER_ERROR_CODES, APP_STATUS } from '@/utils/constants'
import HttpStatus from 'http-status'
import isURL from 'validator/lib/isURL'
import { APP_MODEL_ERRORS } from '@/utils/constants'
import type { AppHandler } from '@/types/app.hander'
import type { HandlerError } from '@/types/error'
import type { AuthStore } from '@/types/auth.store'
import { sendRouteError } from '@/utils/sendRouteError'
import { sendInternalServerError } from '@/utils/sendInternalServerError'

function sendAppNotFoundError(error: HandlerError) {
  return error(
    HttpStatus.NOT_FOUND,
    sendRouteError(APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND, 'App not found')
  )
}

async function createApp({
  body: { name, domain },
  error,
  store: {
    user: { id: owner }
  }
}: {
  body: AppHandler['CreateApp']['body']
  error: HandlerError
  store: AuthStore
}) {
  if (
    domain &&
    !isURL(domain, {
      protocols: ['http', 'https'],
      require_protocol: true,
      allow_fragments: false,
      allow_query_components: false
    })
  ) {
    return error(
      HttpStatus.UNPROCESSABLE_ENTITY,
      sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_DOMAIN, 'Invalid app domain')
    )
  }

  try {
    const app = await AppModel.createApp({
      owner,
      name,
      domain
    })
    return {
      success: true,
      app: {
        id: app._id,
        name: app.name,
        domain: app.domain
      }
    }
  } catch (err) {
    if (err.message?.includes(APP_MODEL_ERRORS.MAX_APPS_REACHED)) {
      return error(
        HttpStatus.FORBIDDEN,
        sendRouteError(APP_CONTROLLER_ERROR_CODES.MAX_APPS_REACHED, 'Maximum apps limit exceeded')
      )
    }
    return sendInternalServerError(error)
  }
}

async function getApp({
  params: { id: appId },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: AppHandler['GetApp']['params']
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.getAppById(appId, owner)
    if (!app) {
      return sendAppNotFoundError(error)
    }
    return {
      success: true,
      app: {
        id: app._id,
        name: app.name,
        domain: app.domain,
        events: app.events.map((event) => ({
          id: event._id,
          event: event.event,
          selector_type: event.selectorType,
          selector: event.selector,
          trigger: event.trigger
        })),
        status: APP_STATUS[app.status]
      }
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

async function deleteApp({
  params: { id: appId },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: AppHandler['DeleteApp']['params']
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.softDeleteApp(appId, owner)
    if (!app) {
      return sendAppNotFoundError(error)
    }
    return {
      success: true,
      app: {
        id: app._id
      }
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

async function updateAppDetails({
  params: { id: appId },
  body: { name, domain },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: AppHandler['UpdateAppDetails']['params']
  body: AppHandler['UpdateAppDetails']['body']
  error: HandlerError
  store: AuthStore
}) {
  if (
    domain &&
    (typeof domain !== 'string' ||
      !isURL(domain, {
        protocols: ['http', 'https'],
        require_protocol: true,
        allow_fragments: false,
        allow_query_components: false
      }))
  ) {
    return error(
      HttpStatus.UNPROCESSABLE_ENTITY,
      sendRouteError(APP_CONTROLLER_ERROR_CODES.INVALID_APP_DOMAIN, 'Invalid app domain')
    )
  }
  try {
    const detailsToUpdate: Partial<{ name: string; domain: string }> = {}
    if (name && name.length) {
      detailsToUpdate.name = name
    }
    if (domain) {
      detailsToUpdate.domain = domain
    }
    const app = await AppModel.updateApp(appId, owner, detailsToUpdate)
    if (!app) {
      return sendAppNotFoundError(error)
    }
    return {
      success: true,
      app: {
        id: app._id,
        name: app.name,
        domain: app.domain
      }
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

async function addEvent({
  params: { id: appId },
  body: { event, selector_type: selectorType, selector, text, trigger, page },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: AppHandler['AddEvent']['params']
  body: AppHandler['AddEvent']['body']
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.addEvent(appId, owner, {
      event,
      selectorType,
      selector,
      text,
      trigger,
      page
    })
    if (!app) {
      return sendAppNotFoundError(error)
    }
    return {
      success: true,
      app: {
        id: app._id,
        name: app.name,
        domain: app.domain,
        events: app.events.map((event) => ({
          id: event._id.toString(),
          event: event.event,
          selector_type: event.selectorType,
          selector: event.selector,
          trigger: event.trigger
        })),
        status: APP_STATUS[app.status]
      }
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

async function updateEvent({
  params: { id: appId, eventId },
  body: { event, selector_type: selectorType, selector, text, trigger, page },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: AppHandler['UpdateEvent']['params']
  body: AppHandler['UpdateEvent']['body']
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.updateEvent(appId, owner, eventId, {
      event,
      selectorType,
      selector,
      text,
      trigger,
      page
    })
    if (!app) {
      return sendAppNotFoundError(error)
    }
    return {
      success: true,
      code: HttpStatus.OK,
      app: {
        id: app._id,
        name: app.name,
        domain: app.domain,
        events: app.events.map((event) => ({
          id: event._id.toString(),
          event: event.event,
          selector_type: event.selectorType,
          selector: event.selector,
          trigger: event.trigger
        })),
        status: APP_STATUS[app.status]
      }
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

async function deleteEvents({
  params: { id: appId },
  body: { eventIds },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: AppHandler['DeleteEvents']['params']
  body: AppHandler['DeleteEvents']['body']
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.deleteEvents(appId, owner, eventIds)
    if (!app) {
      return sendAppNotFoundError(error)
    }
    return {
      success: true,
      app: {
        id: app._id,
        name: app.name,
        domain: app.domain,
        events: app.events.map((event) => ({
          id: event._id.toString(),
          event: event.event,
          selector_type: event.selectorType,
          selector: event.selector,
          trigger: event.trigger
        })),
        status: APP_STATUS[app.status]
      },
      deleted_events: eventIds
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

async function fetchApps({
  error,
  store: {
    user: { id: owner }
  }
}: {
  error: HandlerError
  store: AuthStore
}) {
  try {
    const apps = await AppModel.getAppsByOwner(owner)
    return {
      success: true,
      apps: apps.map((app) => ({
        id: app._id,
        name: app.name,
        domain: app.domain,
        events: app.events.map((event) => ({
          id: event._id,
          event: event.event,
          selector_type: event.selectorType,
          selector: event.selector,
          trigger: event.trigger
        })),
        status: APP_STATUS[app.status]
      }))
    }
  } catch (err) {
    return sendInternalServerError(error)
  }
}

export default {
  createApp,
  getApp,
  deleteApp,
  updateAppDetails,
  addEvent,
  updateEvent,
  deleteEvents,
  fetchApps
}
