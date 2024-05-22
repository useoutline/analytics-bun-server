import AppController from '@/controllers/App.controller'
import { authHandle } from '@/middlewares/auth'

function registerAppRoutes(app, group) {
  app.group(`${group}/app`, (app) => {
    app.onBeforeHandle(authHandle)
    app.post('/create', AppController.createApp)
    app.get('/:id', AppController.getApp)
    app.delete('/:id', AppController.deleteApp)
    app.patch('/:id/update', AppController.updateAppDetails)
    app.put('/:id/events/add', AppController.addEvent)
    app.patch('/:id/events/:eventId/update', AppController.updateEvent)
    app.put('/:id/events/delete', AppController.deleteEvents)
    return app
  })

  app.get(`${group}/apps`, AppController.fetchApps, { beforeHandle: authHandle })
}

export { registerAppRoutes }
