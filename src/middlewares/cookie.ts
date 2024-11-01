import Elysia from 'elysia'

export function cookie() {
  return new Elysia({
    cookie: {
      secure: true,
      httpOnly: true,
      sign: ['auth'],
      path: '/'
    }
  })
}
