import HttpStatus from 'http-status'
import { registerUserRoutes } from '@/routes/user.route'
import { registerTrackingRoutes } from '@/routes/tracking.route'
import { registerAppRoutes } from '@/routes/app.route'
import type { ElysiaApp } from '@/app'
import { APP_CONTROLLER_ERROR_CODES, USER_CONTROLLER_ERROR_CODES } from '@/utils/constants'
import { t } from 'elysia'
import { setCacheHeaders } from '@/middlewares/cache'
import { allowConsoleCors } from '@/middlewares/cors'
// import { registerStatsRoutes } from '@/routes/stats.route'

const urlPrefixV1 = '/v1'
const analyticsUrlPrefixV1 = `${urlPrefixV1}/:analyticsId`
const consoleUrlPrefixV1 = `${urlPrefixV1}`

function registerRoutes(elysiaApp: ElysiaApp) {
  elysiaApp.group('', (app) => {
    app
      .get('favicon.ico', ({ set }) => {
        setCacheHeaders({ set })
        set.headers['Content-Type'] = 'image/png'
        return Bun.file('public/favicon.png')
      })
      .get(
        'error_codes',
        ({ set }) => {
          setCacheHeaders({ set })
          return {
            success: true,
            error_codes: {
              app: APP_CONTROLLER_ERROR_CODES,
              user: USER_CONTROLLER_ERROR_CODES
            }
          }
        },
        {
          response: t.Object({
            success: t.Boolean(),
            error_codes: t.Object({
              app: t.Record(t.String(), t.Union([t.String(), t.Number()])),
              user: t.Record(t.String(), t.Union([t.String(), t.Number()]))
            })
          })
        }
      )
    return app
  })

  elysiaApp.group('', (app) => {
    app
      .guard({
        tags: ['console']
      })
      .onRequest(allowConsoleCors)
    registerUserRoutes(app, consoleUrlPrefixV1)
    registerAppRoutes(app, consoleUrlPrefixV1)
    return app
  })

  elysiaApp.group('', (app) => {
    app.guard({
      tags: ['public']
    })
    registerTrackingRoutes(app, analyticsUrlPrefixV1)
    return app
  })
  // registerStatsRoutes(app, consoleUrlPrefixV1)

  elysiaApp.all('*', ({ error }) => {
    return error(HttpStatus.NOT_FOUND, {
      error: true,
      code: HttpStatus.NOT_FOUND,
      message: 'Invalid Endpoint'
    })
  })
}

export { registerRoutes }
