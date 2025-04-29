// import cors from '@elysiajs/cors'
import { logger } from '@/middlewares/logger'
import { rateLimit } from 'elysia-rate-limit'
import { helmet } from '@/middlewares/helmet'
import { compression } from '@/middlewares/compression'
import { allowConsoleCors } from '@/middlewares/cors'
import { cookie } from '@/middlewares/cookie'
import type { ElysiaApp } from '@/app'
import { swagger } from '@elysiajs/swagger'

function registerMiddlewares(app: ElysiaApp) {
  app.use(compression())
  app.use(logger())
  if (process.env.NODE_ENV === 'production') {
    app.use(
      rateLimit({
        max: 50,
        duration: 5000,
        generator: (request, server) => {
          return request.headers.get('X-Forwarded-For') || server.requestIP(request)?.address || ''
        }
      })
    )
  }
  app.use(helmet())
  app.onRequest(allowConsoleCors)
  app.use(cookie())
  app.use(
    swagger({
      path: '/',
      version: '1.0.0',
      scalarConfig: {
        darkMode: false
      },
      swaggerOptions: {
        syntaxHighlight: {
          activate: true
        }
      },
      documentation: {
        info: {
          title: 'Outline Analytics API',
          version: '1.0.0',
          description: 'API documentation for the application'
        }
      }
    })
  )
}

export { registerMiddlewares }
