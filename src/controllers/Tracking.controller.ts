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
import type { TrackingHandler } from '@/types/tracking.handler'
import type { HTTPHeaders } from 'elysia/types'
import type { HandlerError } from '@/types/error'

async function trackEvent({
  headers,
  body: { uid: user, event, eventType, page, data },
  ip,
  error,
  params: { analyticsId: app }
}: {
  headers: HTTPHeaders
  body: TrackingHandler['TrackEvent']['body']
  ip: string
  error: HandlerError
  params: TrackingHandler['TrackEvent']['params']
}) {
  try {
    const { browser, os, platform } = getUserAgentDetails(headers)
    const ipDetails = await getLocationFromIp(ip)

    await EventModel.createEvent({
      app,
      user,
      event,
      eventType: EVENT_TYPES[eventType] || EVENT_TYPES.external,
      page: page ? getPageData(page) : undefined,
      browsingData: getBrowsingData({
        browser,
        os,
        platform,
        ipDetails
      }),
      referrer: page?.referrer,
      utm: page ? getUtmData(page.fullpath) : undefined,
      capturedAt: Date.now(),
      data: data && isJSON(JSON.stringify(data)) && Object.keys(data).length < 4 ? data : undefined
    })
    return { success: true }
  } catch (err) {
    console.error('trackEvent', err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      error: true
    })
  }
}

async function trackSession({
  headers,
  body: { uid: user, page, visitedAt, leftAt, sessionId, data },
  ip,
  error,
  params: { analyticsId: app }
}: {
  headers: HTTPHeaders
  body: TrackingHandler['TrackSession']['body']
  ip: string
  error: HandlerError
  params: TrackingHandler['TrackSession']['params']
}) {
  try {
    const { browser, os, platform } = getUserAgentDetails(headers)
    const ipDetails = await getLocationFromIp(ip)

    await EventModel.createEvent({
      eventType: EVENT_TYPES.session,
      event: 'session',
      app,
      user,
      page: page ? getPageData(page) : undefined,
      browsingData: getBrowsingData({
        browser,
        os,
        platform,
        ipDetails
      }),
      referrer: page?.referrer,
      utm: page ? getUtmData(page.fullpath) : undefined,
      capturedAt: Date.now(),
      visitedAt,
      leftAt,
      sessionId,
      data: data && isJSON(JSON.stringify(data)) && Object.keys(data).length < 4 ? data : undefined
    })
    return { success: true }
  } catch (err) {
    console.error('trackSession', err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      error: true
    })
  }
}

async function getEvents({
  params: { analyticsId }
}: {
  params: TrackingHandler['GetEvents']['params']
}) {
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
