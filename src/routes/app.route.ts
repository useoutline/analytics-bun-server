import AppController from '@/controllers/App.controller'
import { authHandle } from '@/middlewares/auth'
import type { ElysiaApp } from '@/app'

function registerAppRoutes(app: ElysiaApp, group: string) {
  app.group(`${group}/app`, (app) => {
    app.onBeforeHandle(authHandle)
    app.post('/create', AppController.createApp, AppHanderTypes.CreateApp)
    app.get('/:id', AppController.getApp, AppHanderTypes.GetApp)
    app.delete('/:id', AppController.deleteApp, AppHanderTypes.DeleteApp)
    app.patch('/:id/update', AppController.updateAppDetails, AppHanderTypes.UpdateAppDetails)
    app.put('/:id/events/add', AppController.addEvent, AppHanderTypes.AddEvent)
    app.patch('/:id/events/:eventId/update', AppController.updateEvent, AppHanderTypes.UpdateEvent)
    app.put('/:id/events/delete', AppController.deleteEvents, AppHanderTypes.DeleteEvents)
    return app
  })

  app.get(`${group}/apps`, AppController.fetchApps, { beforeHandle: authHandle })
}

export { registerAppRoutes }
