import type { ElysiaApp } from '@/app'
import TrackingController from '@/controllers/Tracking.controller'
import { allowAllCors } from '@/middlewares/cors'

function registerTrackingRoutes(app: ElysiaApp, group: string) {
  app.group(group, (app) => {
    app.onRequest(allowAllCors)
    app.get('/events', TrackingController.getEvents)
    app.post('/event', TrackingController.trackEvent)
    app.post('/session', TrackingController.trackSession)
    return app
  })
}

export { registerTrackingRoutes }
