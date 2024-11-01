import type { HTTPHeaders } from 'elysia/types'

const consoleRestrictedOrigin = process.env.CONSOLE_APIS_ALLOWED_ORIGIN || '*'
const adminRestrictedOrigin = process.env.ADMIN_APIS_ALLOWED_ORIGIN || '*'

type CorsProps = {
  set: {
    headers: HTTPHeaders
    status?: number
    redirect?: string
  }
}

export function allowAllCors({ set }: CorsProps) {
  set.headers['Access-Control-Allow-Origin'] = '*'
  set.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, HEAD'
  set.headers['Access-Control-Allow-Headers'] = '*'
}

export function allowConsoleCors({ set }: CorsProps) {
  set.headers['Access-Control-Allow-Origin'] = consoleRestrictedOrigin
  set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
  set.headers['Access-Control-Allow-Headers'] = '*'
  set.headers['Vary'] = 'Origin'
}

export function allowAdminCors({ set }: CorsProps) {
  set.headers['Access-Control-Allow-Origin'] = adminRestrictedOrigin
  set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
  set.headers['Access-Control-Allow-Headers'] = '*'
  set.headers['Vary'] = 'Origin'
}
