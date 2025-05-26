import TrackingController from '@/controllers/Tracking.controller'
import { allowAllCors } from '@/middlewares/cors'
import { AnyElysia } from 'elysia'

function registerTrackingRoutes(elysiaApp: AnyElysia, group: string) {
  elysiaApp.group(group, (app) => {
    app
      .guard({
        tags: ['public']
      })
      .onRequest(allowAllCors)
      .get('/events', TrackingController.getEvents)
      .post('/event', TrackingController.trackEvent)
      .post('/session', TrackingController.trackSession)
    return app
  })
}

export { registerTrackingRoutes }
