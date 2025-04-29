import AppController from '@/controllers/App.controller'
import { authHandle } from '@/middlewares/auth'
import type { ElysiaApp } from '@/app'
import {
  AddEvent,
  CreateApp,
  DeleteApp,
  DeleteEvents,
  FetchApps,
  GetApp,
  UpdateAppDetails,
  UpdateEvent
} from '@/types/app.hander'

function registerAppRoutes(app: ElysiaApp, group: string) {
  app.group(`${group}/app`, (app) => {
    app
      .onBeforeHandle(authHandle)
      .post('/create', AppController.createApp, CreateApp)
      .get('/:id', AppController.getApp, GetApp)
      .delete('/:id', AppController.deleteApp, DeleteApp)
      .patch('/:id/update', AppController.updateAppDetails, UpdateAppDetails)
      .put('/:id/events/add', AppController.addEvent, AddEvent)
      .patch('/:id/events/:eventId/update', AppController.updateEvent, UpdateEvent)
      .put('/:id/events/delete', AppController.deleteEvents, DeleteEvents)
    return app
  })

  app.group(`${group}/apps`, (app) => {
    app.onBeforeHandle(authHandle).get(`/`, AppController.fetchApps, FetchApps)
    return app
  })
}

export { registerAppRoutes }
