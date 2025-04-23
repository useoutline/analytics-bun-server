import type { HandlerError } from '@/types/error'
import { verifyJwt } from '@/utils/jwt'
import HttpStatus from 'http-status'

export async function authHandle({
  cookie,
  error,
  store
}: {
  cookie: {
    auth?: {
      value: string
    }
  }
  error: HandlerError
  store: any
}) {
  const token = cookie.auth?.value
  try {
    if (!token) {
      throw new Error()
    }
    const decoded = verifyJwt(token)
    store.user = decoded
  } catch (err) {
    return error(HttpStatus.UNAUTHORIZED, {
      success: false,
      code: HttpStatus.UNAUTHORIZED,
      message: 'Please login to continue'
    })
  }
}
