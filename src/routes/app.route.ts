import AppController from '@/controllers/App.controller'
import { authHandle } from '@/middlewares/auth'
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
import { AnyElysia } from 'elysia'

function registerAppRoutes(elysiaApp: AnyElysia, group: string) {
  elysiaApp.group(`${group}/app`, (app) => {
    app
      .guard({
        tags: ['console']
      })
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

  elysiaApp.group(`${group}/apps`, (app) => {
    app
      .guard({
        tags: ['console']
      })
      .onBeforeHandle(authHandle)
      .get(`/`, AppController.fetchApps, FetchApps)
    return app
  })
}

export { registerAppRoutes }
