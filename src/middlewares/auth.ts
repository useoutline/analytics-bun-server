import type { HandlerError } from '@/types/error'
import { verifyJwt } from '@/utils/jwt'
import HttpStatus from 'http-status'

export async function authHandle({
  headers,
  error,
  store
}: {
  headers: Record<string, string>
  error: HandlerError
  store: any
}) {
  const token = headers.authorization
  try {
    if (!token || !token.startsWith('Bearer ')) {
      throw new Error()
    }
    const tokenToVerify = token.split(' ')[1]
    const decoded = verifyJwt(tokenToVerify)
    store.user = decoded
  } catch (err) {
    return error(HttpStatus.UNAUTHORIZED, {
      success: false,
      code: HttpStatus.UNAUTHORIZED,
      message: 'Please login to continue'
    })
  }
}
