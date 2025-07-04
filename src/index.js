import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { registerMiddlewares } from '@/middlewares/registerMiddlewares'
import { registerRoutes } from '@/routes/registerRoutes'
import { downloadMaxmindDB } from '@/utils/maxmind'
import cron from '@elysiajs/cron'

const app = new Elysia()

const start = async (serverApp) => {
  try {
    const serverOptions = {
      port: process.env.PORT || 3000
    }

    if (process.env.SSL_KEY && process.env.SSL_CERT) {
      serverOptions.tls = {
        key: Bun.file(process.env.SSL_KEY),
        cert: Bun.file(process.env.SSL_CERT)
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      serverOptions.development = true
    }
    serverApp.listen(serverOptions)
    console.log(
      `🦊 Elysia Server is running at ${serverApp.server?.hostname}:${serverApp.server?.port}`
    )
    const dbConnection = await mongoose.connect(process.env.MONGO_URL)
    console.log(`🦊 MongoDB is connected at ${dbConnection.connection.host}`)
    // downloadMaxmindDB() // Download DB on server start
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

app.use(
  cron({
    name: 'maxmind-db-download',
    pattern: '12 0 * * 3,6', // Download new DB every Wednesday and Saturday at 12:00 PM
    run: downloadMaxmindDB
  })
)
registerMiddlewares(app)
registerRoutes(app)
start(app)
