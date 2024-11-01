import EventModel from '@/models/Event.model'
import AppModel from '@/models/App.model'
import {
  getBrowsingData,
  getLocationFromIp,
  getUserAgentDetails,
  getPageData,
  getUtmData
} from '@/utils/browsing-data'
import HttpStatus from 'http-status'
import { EVENT_TYPES } from '@/utils/constants'
import { isJSON } from 'validator'

async function trackEvent({ headers, body, ip, error, params }) {
  try {
    const { browser, os, platform } = getUserAgentDetails(headers)
    const ipDetails = await getLocationFromIp(ip)

    await EventModel.createEvent({
      app: params.analyticsId,
      user: body.uid,
      event: body.event,
      eventType: EVENT_TYPES[body.eventType] || EVENT_TYPES.external,
      page: body.page ? getPageData(body) : undefined,
      browsingData: getBrowsingData({
        browser,
        os,
        platform,
        ipDetails
      }),
      referrer: body.page?.referrer,
      utm: body.page ? getUtmData(body) : undefined,
      capturedAt: Date.now(),
      data:
        body.data && isJSON(JSON.stringify(body.data)) && Object.keys(body.data).length < 4
          ? body.data
          : undefined
    })
    return { success: true }
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      error: true
    })
  }
}

async function trackSession({ headers, body, ip, error, params }) {
  try {
    const { browser, os, platform } = getUserAgentDetails(headers)
    const ipDetails = await getLocationFromIp(ip)

    await EventModel.createEvent({
      eventType: EVENT_TYPES.session,
      event: 'session',
      app: params.analyticsId,
      user: body.uid,
      page: body.page ? getPageData(body) : undefined,
      browsingData: getBrowsingData({
        browser,
        os,
        platform,
        ipDetails
      }),
      referrer: body.page?.referrer,
      utm: body.page ? getUtmData(body) : undefined,
      capturedAt: Date.now(),
      visitedAt: body.visitedAt,
      leftAt: body.leftAt,
      sessionId: body.sessionId,
      data:
        body.data && isJSON(JSON.stringify(body.data)) && Object.keys(body.data).length < 4
          ? body.data
          : undefined
    })
    return { success: true }
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      error: true
    })
  }
}

async function getEvents({ params }) {
  const analyticsId = params.analyticsId
  const { events } = await AppModel.getEventsByAppId(analyticsId)
  return {
    success: true,
    events
  }
}

export default {
  trackEvent,
  trackSession,
  getEvents
}
