// import cors from '@elysiajs/cors'
import { logger } from '@/middlewares/logger'
import { rateLimit } from 'elysia-rate-limit'
import { helmet } from '@/middlewares/helmet'
import { compression } from '@/middlewares/compression'
import { allowConsoleCors } from '@/middlewares/cors'
import { cookie } from '@/middlewares/cookie'
import type { ElysiaApp } from '@/app'
import { setSwagger } from '@/middlewares/swagger'

function registerMiddlewares(elysiaApp: ElysiaApp) {
  elysiaApp.use(compression())
  elysiaApp.use(logger())
  if (process.env.NODE_ENV === 'production') {
    elysiaApp.use(
      rateLimit({
        max: 50,
        duration: 5000,
        generator: (request, server) => {
          return request.headers.get('X-Forwarded-For') || server.requestIP(request)?.address || ''
        }
      })
    )
  }
  elysiaApp.use(
    setSwagger({
      exclude: ['/favicon.ico', '/json', /docs/, /user/, /app/, /apps/]
    })
  )
  elysiaApp.use(
    setSwagger({
      path: '/docs/admin',
      exclude: [
        '/favicon.ico',
        '/json',
        '/v1/{analyticsId}/event',
        '/v1/{analyticsId}/session',
        '/v1/{analyticsId}/events',
        '/error_codes',
        '/'
      ]
    })
  )
  elysiaApp.use(helmet())
  elysiaApp.use(cookie())
}

export { registerMiddlewares }
