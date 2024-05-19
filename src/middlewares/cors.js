const consoleRestrictedOrigin = process.env.CONSOLE_APIS_ALLOWED_ORIGIN || '*'
const adminRestrictedOrigin = process.env.ADMIN_APIS_ALLOWED_ORIGIN || '*'

export function allowAllCors({ set }) {
  set.headers['Access-Control-Allow-Origin'] = '*'
  set.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, HEAD'
  set.headers['Access-Control-Allow-Headers'] = '*'
}

export function allowConsoleCors({ set }) {
  set.headers['Access-Control-Allow-Origin'] = consoleRestrictedOrigin
  set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
  set.headers['Access-Control-Allow-Headers'] = '*'
  set.headers['Vary'] = 'Origin'
}

export function allowAdminCors({ set }) {
  set.headers['Access-Control-Allow-Origin'] = adminRestrictedOrigin
  set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
  set.headers['Access-Control-Allow-Headers'] = '*'
  set.headers['Vary'] = 'Origin'
}
