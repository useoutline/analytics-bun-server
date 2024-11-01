import StatsController from '@/controllers/Stats.controller'
import type { ElysiaApp } from '@/app'

function registerStatsRoutes(app: ElysiaApp, group: string) {
  app.group(`${group}/stats`, (app) => {
    app
      .get('/pageviews', StatsController.fetchPageviewStats)
      .get('/sessions', StatsController.fetchSessionStats)
    return app
  })
}

export { registerStatsRoutes }
