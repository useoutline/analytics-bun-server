import { t } from 'elysia'
import { USER_CONTROLLER_ERROR_CODES } from '@/utils/constants'

export const AuthHeader = t.Object({
  authorization: t.String({
    title: 'Authorization',
    description:
      'Bearer token for authentication, received from the /user/login or /user/refresh endpoint',
    error: {
      success: false,
      code: USER_CONTROLLER_ERROR_CODES.INVALID_AUTHORIZATION,
      message: 'Authorization header is required'
    }
  })
})
