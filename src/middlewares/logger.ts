import { Elysia } from 'elysia'
import color from 'chalk'

type LoggerStore = {
  beforeTime: bigint
}

/* Code inspired from @grottto/logysia */
/* Source Code: https://github.com/tristanisham/logysia */
export function logger() {
  return new Elysia({
    name: '@useoutline/elysia-logger'
  })
    .onRequest(({ store }: { store: Record<string, any> }) => {
      store.beforeTime = process.hrtime.bigint()
    })
    .onAfterResponse({ as: 'global' }, ({ store, request, response }) => {
      const logStr = []
      logStr.push(request.method)
      logStr.push(new URL(request.url).pathname)
      const beforeTime = (store as LoggerStore).beforeTime
      logStr.push(durationString(beforeTime))
      if ((response as any)?.error) {
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

      // @ts-expect-error
      logStr.push(error.message)
      const beforeTime = (store as LoggerStore).beforeTime
      logStr.push(durationString(beforeTime))

      console.log(color.red(logStr.join(' ')))
    })
}

function durationString(beforeTime: bigint) {
  const now = process.hrtime.bigint()
  const timeDifference = now - beforeTime
  const nanoseconds = Number(timeDifference)

  const durationInMicroseconds = (nanoseconds / 1_000).toFixed(2) // Convert to microseconds
  const durationInMilliseconds = (nanoseconds / 1_000_000).toFixed(2) // Convert to milliseconds
  let timeMessage = ''

  if (nanoseconds >= 1_000_000_000) {
    const seconds = (nanoseconds / 1_000_000_000).toFixed(2)
    timeMessage = `${seconds}s`
  } else if (nanoseconds >= 1_000_000) {
    timeMessage = `${durationInMilliseconds}ms`
  } else if (nanoseconds >= 1_000) {
    timeMessage = `${durationInMicroseconds}µs`
  } else {
    timeMessage = `${nanoseconds}ns`
  }

  return timeMessage
}
