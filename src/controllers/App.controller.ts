import AppModel from '@/models/App.model'
import { APP_CONTROLLER_ERROR_CODES, APP_STATUS } from '@/utils/constants'
import HttpStatus from 'http-status'
import isURL from 'validator/lib/isURL'
import { APP_MODEL_ERRORS } from '@/utils/constants'
import { AppHander } from '@/handlerTypes/app.hander'
import type { HandlerError } from '@/handlerTypes/error'
import type { AuthStore } from '@/handlerTypes/auth.store'

async function createApp({
  body: { name, domain },
  error,
  store: {
    user: { id: owner }
  }
}: {
  body: typeof AppHander.CreateApp.body.static
  error: HandlerError
  store: AuthStore
}) {
  if (
    !domain ||
    typeof domain !== 'string' ||
    !isURL(domain, {
      protocols: ['http', 'https'],
      require_protocol: true,
      allow_fragments: false,
      allow_query_components: false
    })
  ) {
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.INVALID_APP_DOMAIN,
      message: 'Invalid app domain'
    })
  }

  try {
    const app = await AppModel.createApp({
      owner,
      name,
      domain
    })
    return {
      success: true,
      code: HttpStatus.OK,
      app: {
        _id: app._id,
        name: app.name,
        domain: app.domain
      }
    }
  } catch (err) {
    if (err.message?.includes(APP_MODEL_ERRORS.APP_NAME_REQUIRED)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.APP_NAME_REQUIRED,
        message: 'App name is required'
      })
    }
    if (err.message?.includes(APP_MODEL_ERRORS.MAX_APPS_REACHED)) {
      return error(HttpStatus.FORBIDDEN, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.MAX_APPS_REACHED,
        message: 'Maximum apps limit exceeded.'
      })
    }
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function getApp({
  params: { id: appId },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: typeof AppHander.GetApp.params.static
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.getAppById(appId, owner)
    if (app) {
      return {
        success: true,
        code: HttpStatus.OK,
        app: {
          ...app,
          status: APP_STATUS[app.status]
        }
      }
    }
    return error(HttpStatus.NOT_FOUND, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND,
      message: 'App not found'
    })
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function deleteApp({
  params: { id: appId },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: typeof AppHander.DeleteApp.params.static
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.softDeleteApp(appId, owner)
    if (app) {
      return {
        success: true,
        code: HttpStatus.OK,
        app: {
          _id: app._id,
          status: APP_STATUS[app.status]
        }
      }
    }
    return error(HttpStatus.NOT_FOUND, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND,
      message: 'App not found'
    })
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
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
  params: typeof AppHander.UpdateAppDetails.params.static
  body: typeof AppHander.UpdateAppDetails.body.static
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
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.INVALID_APP_DOMAIN,
      message: 'Invalid app domain'
    })
  }
  try {
    const detailsToUpdate: any = {}
    if (name) {
      detailsToUpdate.name = name
    }
    if (domain) {
      detailsToUpdate.domain = domain
    }
    const app = await AppModel.updateApp(appId, owner, detailsToUpdate)
    if (app) {
      return {
        success: true,
        code: HttpStatus.OK,
        app: {
          ...app,
          status: APP_STATUS[app.status]
        }
      }
    }
    return error(HttpStatus.NOT_FOUND, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND,
      message: 'App not found'
    })
  } catch (err) {
    if (err.message?.includes(APP_MODEL_ERRORS.APP_NAME_REQUIRED)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.APP_NAME_REQUIRED,
        message: 'App name is required'
      })
    }
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function addEvent({
  params: { id: appId },
  body: { event, selectorType, selector, text, trigger, page },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: typeof AppHander.AddEvent.params.static
  body: typeof AppHander.AddEvent.body.static
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
    if (app) {
      return {
        success: true,
        code: HttpStatus.OK,
        app: {
          ...app,
          status: APP_STATUS[app.status]
        }
      }
    }
    return error(HttpStatus.NOT_FOUND, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND,
      message: 'App not found'
    })
  } catch (err) {
    if (err.message?.includes(APP_MODEL_ERRORS.EVENT_REQUIRED)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.EVENT_REQUIRED,
        message: 'Event is required'
      })
    }
    if (err.message?.includes(APP_MODEL_ERRORS.SELECTOR_TYPE_REQUIRED)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.SELECTOR_TYPE_REQUIRED,
        message: 'Selector type is required'
      })
    }
    if (err.message?.includes(APP_MODEL_ERRORS.SELECTOR_TYPE_INVALID)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.SELECTOR_TYPE_INVALID,
        message: 'Invalid selector type'
      })
    }
    if (err.message?.includes(APP_MODEL_ERRORS.SELECTOR_REQUIRED)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.SELECTOR_REQUIRED,
        message: 'Selector is required'
      })
    }
    if (err.message?.includes(APP_MODEL_ERRORS.TRIGGER_REQUIRED)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: APP_CONTROLLER_ERROR_CODES.TRIGGER_REQUIRED,
        message: 'Trigger is required'
      })
    }
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function updateEvent({
  params: { id: appId, eventId },
  body: { event, selectorType, selector, text, trigger, page },
  error,
  store: {
    user: { id: owner }
  }
}: {
  params: typeof AppHander.UpdateEvent.params.static
  body: typeof AppHander.UpdateEvent.body.static
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
    if (app) {
      return {
        success: true,
        code: HttpStatus.OK,
        app: {
          ...app,
          status: APP_STATUS[app.status]
        }
      }
    }
    return error(HttpStatus.NOT_FOUND, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND,
      message: 'App not found'
    })
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
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
  params: typeof AppHander.DeleteEvents.params.static
  body: typeof AppHander.DeleteEvents.body.static
  error: HandlerError
  store: AuthStore
}) {
  try {
    const app = await AppModel.deleteEvents(appId, owner, eventIds)
    if (app) {
      return {
        success: true,
        code: HttpStatus.OK,
        app: {
          ...app,
          status: APP_STATUS[app.status],
          deletedEvents: eventIds
        }
      }
    }
    return error(HttpStatus.NOT_FOUND, {
      success: false,
      code: APP_CONTROLLER_ERROR_CODES.APP_NOT_FOUND,
      message: 'App not found'
    })
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
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
      code: HttpStatus.OK,
      apps: apps.map((app) => ({
        ...app,
        status: APP_STATUS[app.status]
      }))
    }
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
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
