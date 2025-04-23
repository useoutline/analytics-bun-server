type AnalyticsParams = {
  analyticsId: string
}

type GetEvents = {
  params: AnalyticsParams
}

type TrackEvent = {
  params: AnalyticsParams
  body: {
    uid: string
    event: string
    eventType: string
    page?: {
      fullpath: string
      title: string
      meta: Record<string, string>
      referrer: string
    }
    data?: Record<string, any>
  }
}

type TrackSession = {
  params: AnalyticsParams
  body: {
    uid: string
    page?: {
      fullpath: string
      title: string
      meta: Record<string, string>
      referrer: string
    }
    visitedAt: number
    leftAt: number
    sessionId: string
    data?: Record<string, any>
  }
}

export type TrackingHandler = {
  GetEvents: GetEvents
  TrackEvent: TrackEvent
  TrackSession: TrackSession
}
