// import cors from '@elysiajs/cors'
import { logger } from '@/middlewares/logger'
import { rateLimit } from 'elysia-rate-limit'
import { helmet } from '@/middlewares/helmet'
import { compression } from '@/middlewares/compression'
import { allowConsoleCors } from '@/middlewares/cors'
import { cookie } from '@/middlewares/cookie'
import type { ElysiaApp } from '@/app'

function registerMiddlewares(app: ElysiaApp) {
  app.use(compression())
  app.use(logger())
  if (process.env.NODE_ENV === 'production') {
    app.use(
      rateLimit({
        max: 10,
        duration: 1000,
        responseCode: 429,
        responseMessage: 'Too many requests',
        generator: (request, server) => {
          return request.headers.get('X-Forwarded-For') || server.requestIP(request)?.address || ''
        }
      })
    )
  }
  app.use(helmet())
  app.onRequest(allowConsoleCors)
  app.use(cookie())
}

export { registerMiddlewares }
