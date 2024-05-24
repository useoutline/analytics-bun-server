import HttpStatus from 'http-status'
import { registerUserRoutes } from '@/routes/user.route'
import { registerTrackingRoutes } from '@/routes/tracking.route'
import { registerAppRoutes } from '@/routes/app.route'
// import { registerStatsRoutes } from '@/routes/stats.route'

const urlPrefixV1 = '/v1'
const analyticsUrlPrefixV1 = `${urlPrefixV1}/:analyticsId`
const consoleUrlPrefixV1 = `${urlPrefixV1}`

function registerRoutes(app) {
  app.get('/', ({ set }) => {
    set.headers['Cache-Control'] = 'public, max-age=31536000'
    return 'Outline Analytics API v1 (https://api.useoutline.xyz)'
  })

  app.get('favicon.ico', ({ set }) => {
    set.headers['Cache-Control'] = 'public, max-age=31536000'
    set.headers['Content-Type'] = 'image/png'
    return Bun.file('public/favicon.png')
  })

  registerUserRoutes(app, consoleUrlPrefixV1)
  registerTrackingRoutes(app, analyticsUrlPrefixV1)
  registerAppRoutes(app, consoleUrlPrefixV1)
  // registerStatsRoutes(app, consoleUrlPrefixV1)

  app.all('*', ({ error }) => {
    return error(HttpStatus.NOT_FOUND, {
      error: true,
      code: HttpStatus.NOT_FOUND,
      message: 'Invalid Endpoint'
    })
  })
}

export { registerRoutes }
