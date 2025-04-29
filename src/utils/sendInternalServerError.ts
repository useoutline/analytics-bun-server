import { HandlerError } from '@/types/error'
import HttpStatus from 'http-status'
import { sendRouteError } from '@/utils/sendRouteError'

export function sendInternalServerError(error: HandlerError) {
  return error(
    HttpStatus.INTERNAL_SERVER_ERROR,
    sendRouteError(HttpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong')
  )
}
