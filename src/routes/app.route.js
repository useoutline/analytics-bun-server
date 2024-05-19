import AppController from '@/controllers/App.controller'
import { authHandle } from '@/middlewares/auth'

function registerAppRoutes(app, group) {
  app.group(`${group}/app`, (app) => {
    app.onBeforeHandle(authHandle)
    app.post('/create', AppController.createApp)
    app.get('/:id', AppController.getApp)
    app.delete('/:id', AppController.deleteApp)
    app.put('/:id/update', AppController.updateAppDetails)
    app.post('/:id/events/add', AppController.addEvent)
    app.put('/:id/events/:eventId/update', AppController.updateEvent)
    app.delete('/:id/events/delete', AppController.deleteEvents)
    app.get('/:id/events', AppController.fetchEvents)
    return app
  })

  app.get(`${group}/apps`, AppController.fetchApps, { beforeHandle: authHandle })
}

export { registerAppRoutes }
