import { Elysia } from 'elysia'

export function helmet() {
  return new Elysia({
    name: '@useoutline/elysia-helmet'
  }).onRequest(({ set }) => {
    set.headers['Content-Security-Policy'] =
      "base-uri 'self';form-action 'self';upgrade-insecure-requests"
    set.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    set.headers['Origin-Agent-Cluster'] = '?1'
    set.headers['Referrer-Policy'] = 'no-referrer'
    set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    set.headers['X-Content-Type-Options'] = 'nosniff'
    set.headers['X-DNS-Prefetch-Control'] = 'off'
    set.headers['X-Download-Options'] = 'noopen'
    set.headers['X-Frame-Options'] = 'SAMEORIGIN'
    set.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
    delete set.headers['X-Powered-By']
  })
}
