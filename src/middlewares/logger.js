import { Elysia } from 'elysia'
import color from 'chalk'

/* Code inspired from @grottto/logysia */
/* Source Code: https://github.com/tristanisham/logysia */
export function logger() {
  return new Elysia({
    name: '@useoutline/elysia-logger'
  })
    .onRequest((ctx) => {
      ctx.store = { ...ctx.store, beforeTime: process.hrtime.bigint() }
    })
    .onAfterResponse({ as: 'global' }, (ctx) => {
      const logStr = []
      logStr.push(ctx.request.method)
      logStr.push(new URL(ctx.request.url).pathname)
      const beforeTime = ctx.store.beforeTime
      logStr.push(durationString(beforeTime))
      if (ctx.response?.error) {
        console.log(color.red(logStr.join(' | ')))
      } else {
        console.log(color.green(logStr.join(' | ')))
      }
    })
    .onError({ as: 'global' }, ({ request, error, store }) => {
      const logStr = []
      logStr.push(request.method)
      logStr.push(new URL(request.url).pathname)

      logStr.push('Error')
      if ('status' in error) {
        logStr.push(String(error.status))
      }

      logStr.push(error.message)
      const beforeTime = store.beforeTime
      logStr.push(durationString(beforeTime))

      console.log(color.red(logStr.join(' ')))
    })
}

function durationString(beforeTime) {
  const now = process.hrtime.bigint()
  const timeDifference = now - beforeTime
  const nanoseconds = Number(timeDifference)

  const durationInMicroseconds = (nanoseconds / 1e3).toFixed(0) // Convert to microseconds
  const durationInMilliseconds = (nanoseconds / 1e6).toFixed(0) // Convert to milliseconds
  let timeMessage = ''

  if (nanoseconds >= 1e9) {
    const seconds = (nanoseconds / 1e9).toFixed(2)
    timeMessage = `${seconds}s`
  } else if (nanoseconds >= 1e6) {
    timeMessage = `${durationInMilliseconds}ms`
  } else if (nanoseconds >= 1e3) {
    timeMessage = `${durationInMicroseconds}µs`
  } else {
    timeMessage = `${nanoseconds}ns`
  }

  return timeMessage
}
