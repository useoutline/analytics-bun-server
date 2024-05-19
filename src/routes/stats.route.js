import StatsController from '@/controllers/Stats.controller'

function registerStatsRoutes(app, group) {
  app.group(`${group}/stats`, (app) => {
    app
      .get('/pageviews', StatsController.fetchPageviewStats)
      .get('/sessions', StatsController.fetchSessionStats)
    return app
  })
}

export { registerStatsRoutes }
