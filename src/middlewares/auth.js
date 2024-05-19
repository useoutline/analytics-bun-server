import { verifyJwt } from '@/utils/jwt'
import HttpStatus from 'http-status'

export async function authHandle({ cookie, error, store }) {
  const token = cookie.auth.value
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
