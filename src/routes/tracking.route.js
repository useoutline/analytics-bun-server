import TrackingController from '@/controllers/Tracking.controller'
import { allowAllCors } from '@/middlewares/cors'

function registerTrackingRoutes(app, group) {
  app.group(group, (app) => {
    app.onRequest(allowAllCors)
    app.get('/events', TrackingController.getEvents)
    app.post('/event', TrackingController.trackEvent)
    app.post('/session', TrackingController.trackSession)
    return app
  })
}

export { registerTrackingRoutes }
