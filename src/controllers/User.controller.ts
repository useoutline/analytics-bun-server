import { isEmail } from 'validator'
import HttpStatus from 'http-status'
import { OTP_MESSAGES, USER_CONTROLLER_ERROR_CODES, USER_MODEL_ERRORS } from '@/utils/constants'
import UserModel from '@/models/User.model'
import { sendMail } from '@/utils/mailer'
import type { UserHandler } from '@/types/user.handler'
import type { HandlerError } from '@/types/error'
import type { Cookie } from 'elysia/cookies'
import type { AuthStore } from '@/types/auth.store'

const ACCESS_TOKEN_EXPIRY = 90 * 24 * 60 * 60 // 90 days in seconds

async function registerUser({
  body: { email },
  error
}: {
  body: UserHandler['RegisterUser']['body']
  error: HandlerError
}) {
  if (!isEmail(email)) {
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL,
      message: 'Invalid email'
    })
  }
  try {
    const user = await UserModel.createUser({ email })
    await sendMail({
      subject: 'Verify your email',
      recipientEmail: email,
      text: `Your OTP is ${user.otp.value}`,
      html: `Your OTP is <strong>${user.otp.value}</strong>`
    })
    return {
      success: true,
      code: HttpStatus.OK
    }
  } catch (err) {
    if (err.message?.includes(USER_MODEL_ERRORS.USER_ALREADY_EXISTS)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: USER_CONTROLLER_ERROR_CODES.USER_ALREADY_EXISTS,
        message: 'Account already exists'
      })
    }
    console.error('registerUser', err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function verifyOTP({
  body: { email, otp },
  error,
  cookie
}: {
  body: UserHandler['VerifyOTP']['body']
  error: HandlerError
  cookie: Record<string, Cookie<string>>
}) {
  if (!isEmail(email)) {
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL,
      message: 'Invalid email'
    })
  }
  if (!otp || otp.length !== 6) {
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: USER_CONTROLLER_ERROR_CODES.INVALID_OTP,
      message: 'Invalid OTP'
    })
  }
  try {
    const user = await UserModel.verifyOTP({ email, otp })
    cookie.auth.set({
      value: user.tokens.access,
      maxAge: ACCESS_TOKEN_EXPIRY, // 90 days in seconds
      expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000),
      path: '/',
      secure: true,
      httpOnly: true,
      // @ts-ignore
      sign: ['auth'],
      // @ts-ignore
      path: '/'
    })
    return {
      success: true,
      code: HttpStatus.OK
    }
  } catch (err) {
    if (err.message === OTP_MESSAGES.EXPIRED) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: USER_CONTROLLER_ERROR_CODES.OTP_EXPIRED,
        message: 'OTP expired'
      })
    }
    if (err.message === OTP_MESSAGES.INVALID) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: USER_CONTROLLER_ERROR_CODES.INCORRECT_OTP,
        message: 'Incorrect OTP'
      })
    }
    if (err.message === OTP_MESSAGES.ATTEMPTS_EXCEEDED) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: USER_CONTROLLER_ERROR_CODES.OTP_ATTEMPTS_EXCEEDED,
        message: 'OTP attempts exceeded'
      })
    }
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function resendOTP({
  body: { email },
  error
}: {
  body: UserHandler['ResendOTP']['body']
  error: HandlerError
}) {
  if (!isEmail(email)) {
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL,
      message: 'Invalid email'
    })
  }
  try {
    const otp = await UserModel.resendOTP({ email })
    await sendMail({
      subject: 'OTP for login',
      recipientEmail: email,
      text: `Your OTP is ${otp}`,
      html: `Your OTP is <strong>${otp}</strong>`
    })
    return {
      success: true,
      code: HttpStatus.OK
    }
  } catch (err) {
    if (err.message?.includes(USER_MODEL_ERRORS.USER_NOT_FOUND)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: USER_CONTROLLER_ERROR_CODES.USER_NOT_FOUND,
        message: 'Account does not exist'
      })
    }
    console.error('resendOTP', err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function loginUser({
  body: { email },
  error
}: {
  body: UserHandler['LoginUser']['body']
  error: HandlerError
}) {
  if (!isEmail(email)) {
    return error(HttpStatus.BAD_REQUEST, {
      success: false,
      code: USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL,
      message: 'Invalid email'
    })
  }
  try {
    const otp = await UserModel.login({ email })
    await sendMail({
      subject: 'OTP for login',
      recipientEmail: email,
      text: `Your OTP is ${otp}`,
      html: `Your OTP is <strong>${otp}</strong>`
    })
    return {
      success: true,
      code: HttpStatus.OK
    }
  } catch (err) {
    if (err.message?.includes(USER_MODEL_ERRORS.USER_NOT_FOUND)) {
      return error(HttpStatus.BAD_REQUEST, {
        success: false,
        code: USER_CONTROLLER_ERROR_CODES.USER_NOT_FOUND,
        message: 'Account does not exist'
      })
    }
    console.error('loginUser', err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function updateUser({
  body: { name },
  error,
  store: {
    user: { id: userId }
  }
}: {
  body: UserHandler['UpdateUser']['body']
  error: HandlerError
  store: AuthStore
}) {
  try {
    const updatedUser = await UserModel.updateUser({ id: userId, name })
    return {
      success: true,
      code: HttpStatus.OK,
      user: updatedUser
    }
  } catch (err) {
    console.error('updateUser', err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function getUser({
  store: {
    user: { id: userId }
  }
}: {
  store: AuthStore
}) {
  const user = await UserModel.getUserById(userId)
  return {
    success: true,
    code: HttpStatus.OK,
    user
  }
}

export default { registerUser, verifyOTP, resendOTP, loginUser, updateUser, getUser }
