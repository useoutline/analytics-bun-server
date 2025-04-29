import { USER_CONTROLLER_ERROR_CODES } from '@/utils/constants'
import { sendRouteError } from '@/utils/sendRouteError'
import { t } from 'elysia'
import { GenericErrorResponseTypebox } from '@/types/error'
import { AuthHeader } from '@/types/headers'

const RegisterUser = {
  body: t.Object({
    name: t.String({
      title: 'Name',
      minLength: 1,
      error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_NAME, 'Invalid name')
    }),
    email: t.String({
      title: 'Email',
      format: 'email',
      error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL, 'Invalid email')
    }),
    password: t.String({
      title: 'Password',
      minLength: 8,
      error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_PASSWORD, 'Invalid password')
    })
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      user: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

const VerifyOTP = {
  body: t.Object({
    email: t.String({
      title: 'Email',
      format: 'email',
      error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL, 'Invalid email')
    }),
    otp: t.String({
      title: 'OTP',
      minLength: 6,
      maxLength: 6,
      error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_OTP, 'Invalid OTP')
    })
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      user: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String()
      }),
      tokens: t.Object({
        access: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

const ResendOTP = {
  body: t.Object({
    email: t.String({
      title: 'Email',
      format: 'email',
      error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL, 'Invalid email')
    })
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      message: t.String()
    }),
    ...GenericErrorResponseTypebox
  }
}

const LoginUser = {
  body: t.Union([
    t.Object({
      type: t.Literal('password'),
      email: t.String({
        title: 'Email',
        format: 'email',
        error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL, 'Invalid email')
      }),
      password: t.String({
        title: 'Password',
        minLength: 8,
        error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_PASSWORD, 'Invalid password')
      })
    }),
    t.Object({
      type: t.Literal('otp'),
      email: t.String({
        title: 'Email',
        format: 'email',
        error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL, 'Invalid email')
      }),
      otp: t.String({
        title: 'Password',
        minLength: 6,
        maxLength: 6,
        error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INCORRECT_OTP, 'Incorrect OTP')
      })
    })
  ]),
  response: {
    200: t.Object({
      success: t.Boolean(),
      user: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String()
      }),
      tokens: t.Object({
        access: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

const UpdateUser = {
  body: t.Partial(
    t.Object({
      name: t.String({
        title: 'Name',
        minLength: 1,
        error: sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_NAME, 'Invalid name')
      })
    })
  ),
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      user: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

const GetUser = {
  headers: AuthHeader,
  response: {
    200: t.Object({
      success: t.Boolean(),
      user: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String()
      })
    }),
    ...GenericErrorResponseTypebox
  }
}

export { RegisterUser, VerifyOTP, ResendOTP, LoginUser, UpdateUser, GetUser }

export type UserHandler = {
  RegisterUser: {
    body: typeof RegisterUser.body.static
  }
  VerifyOTP: {
    body: typeof VerifyOTP.body.static
  }
  ResendOTP: {
    body: typeof ResendOTP.body.static
  }
  LoginUser: {
    body: typeof LoginUser.body.static
  }
  UpdateUser: {
    body: typeof UpdateUser.body.static
  }
}
