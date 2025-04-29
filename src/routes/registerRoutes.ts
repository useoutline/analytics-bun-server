import HttpStatus from 'http-status'
import { registerUserRoutes } from '@/routes/user.route'
import { registerTrackingRoutes } from '@/routes/tracking.route'
import { registerAppRoutes } from '@/routes/app.route'
import type { ElysiaApp } from '@/app'
import { APP_CONTROLLER_ERROR_CODES, USER_CONTROLLER_ERROR_CODES } from '@/utils/constants'
import { t } from 'elysia'
// import { registerStatsRoutes } from '@/routes/stats.route'

const urlPrefixV1 = '/v1'
const analyticsUrlPrefixV1 = `${urlPrefixV1}/:analyticsId`
const consoleUrlPrefixV1 = `${urlPrefixV1}`

function registerRoutes(app: ElysiaApp) {
  app.get('favicon.ico', ({ set }) => {
    set.headers['Cache-Control'] = 'public, max-age=31536000'
    set.headers['Content-Type'] = 'image/png'
    return Bun.file('public/favicon.png')
  })

  registerUserRoutes(app, consoleUrlPrefixV1)
  registerTrackingRoutes(app, analyticsUrlPrefixV1)
  registerAppRoutes(app, consoleUrlPrefixV1)
  // registerStatsRoutes(app, consoleUrlPrefixV1)

  app.get(
    'error_codes',
    ({ set }) => {
      set.headers['Cache-Control'] = 'public, max-age=31536000'
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

  app.all('*', ({ error }) => {
    return error(HttpStatus.NOT_FOUND, {
      error: true,
      code: HttpStatus.NOT_FOUND,
      message: 'Invalid Endpoint'
    })
  })
}

export { registerRoutes }
