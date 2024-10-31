import AppModel from '@/models/App.model'
import { APP_CONTROLLER_ERROR_CODES, APP_STATUS } from '@/utils/constants'
import HttpStatus from 'http-status'
import isURL from 'validator/lib/isURL'
import { APP_MODEL_ERRORS } from '@/utils/constants'

async function createApp({ body, error, store }) {
  const { name, domain } = body
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
  const owner = store.user.id
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

async function getApp({ params, error, store }) {
  const appId = params.id
  const owner = store.user.id
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

async function deleteApp({ params, error, store }) {
  const appId = params.id
  const owner = store.user.id
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

async function updateAppDetails({ params, body, error, store }) {
  const appId = params.id
  const owner = store.user.id
  const { name, domain } = body
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
    const detailsToUpdate = {}
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

async function addEvent({ params, body, error, store }) {
  const appId = params.id
  const owner = store.user.id
  const { event, selectorType, selector, text, trigger, page } = body
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

async function updateEvent({ params, body, error, store }) {
  const appId = params.id
  const owner = store.user.id
  const eventId = params.eventId
  const { event, selectorType, selector, text, trigger, page } = body
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

async function deleteEvents({ params, body, error, store }) {
  const appId = params.id
  const owner = store.user.id
  const eventIds = body.eventIds
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

async function fetchApps({ error, store }) {
  try {
    const owner = store.user.id
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
