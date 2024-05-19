import { Elysia } from 'elysia'
import { gzipSync } from 'bun'

export function compression() {
  return new Elysia({
    name: '@useoutline/elysia-compression'
  }).mapResponse(({ response }) => {
    return new Response(
      gzipSync(typeof response === 'object' ? JSON.stringify(response) : response.toString())
    )
  })
}
