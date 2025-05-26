import { isEmail } from 'validator'
import HttpStatus from 'http-status'
import { OTP_MESSAGES, USER_CONTROLLER_ERROR_CODES, USER_MODEL_ERRORS } from '@/utils/constants'
import UserModel from '@/models/User.model'
import Mailer from '@/utils/mailer'
import type { UserHandler } from '@/types/user.handler'
import type { HandlerError } from '@/types/error'
import type { Cookie } from 'elysia/cookies'
import type { AuthStore } from '@/types/auth.store'
import { sendRouteError } from '@/utils/sendRouteError'
import { sendInternalServerError } from '@/utils/sendInternalServerError'
import { signJwt } from '@/utils/jwt'

class UserController {
  private ACCESS_TOKEN_EXPIRY = 15 * 60 * 60 // 15 minutes in seconds
  private REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 // 30 days in seconds
  private user: typeof UserModel
  private mailer: typeof Mailer

  constructor() {
    this.user = UserModel
    this.mailer = Mailer
  }

  async registerUser({
    body: { name, email },
    error
  }: {
    body: UserHandler['RegisterUser']['body']
    error: HandlerError
  }) {
    if (!isEmail(email)) {
      return error(
        HttpStatus.UNPROCESSABLE_ENTITY,
        sendRouteError(USER_CONTROLLER_ERROR_CODES.INVALID_EMAIL, 'Invalid email')
      )
    }
    try {
      const user = await this.user.createUser({ name, email })
      await this.mailer.send({
        subject: 'Verify your email',
        recipientEmail: email,
        text: `Your OTP is ${user.otp.value}`,
        html: `Your OTP is <strong>${user.otp.value}</strong>`
      })
      return {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      }
    } catch (err) {
      if (err.message?.includes(USER_MODEL_ERRORS.USER_ALREADY_EXISTS)) {
        return error(
          HttpStatus.UNPROCESSABLE_ENTITY,
          sendRouteError(USER_CONTROLLER_ERROR_CODES.USER_ALREADY_EXISTS, 'Account already exists')
        )
      }
      sendInternalServerError(error)
    }
  }

  async verifyOTP({
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
      const user = await this.user.verifyOTP({ email, otp })
      const accessToken = signJwt({ id: user._id.toString(), email })
      const refreshToken = signJwt({ id: user._id.toString(), email }, 'REFRESH')
      cookie.auth.set({
        value: refreshToken,
        maxAge: this.REFRESH_TOKEN_EXPIRY, // 30 days in seconds
        expires: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY * 1000),
        path: '/auth/refresh',
        secure: true,
        httpOnly: true,
        secrets: ['auth']
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

  async resendOTP({
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
      const otp = await this.user.resendOTP({ email })
      await this.mailer.send({
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
      return error(HttpStatus.INTERNAL_SERVER_ERROR, {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong.'
      })
    }
  }

  async loginUser({
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
      const otp = await this.user.login({ email })
      await this.mailer.send({
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
      return error(HttpStatus.INTERNAL_SERVER_ERROR, {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong.'
      })
    }
  }

  async updateUser({
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
      const updatedUser = await this.user.updateUser({ id: userId, name })
      return {
        success: true,
        code: HttpStatus.OK,
        user: updatedUser
      }
    } catch (err) {
      return error(HttpStatus.INTERNAL_SERVER_ERROR, {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong.'
      })
    }
  }

  async getUser({
    store: {
      user: { id: userId }
    }
  }: {
    store: AuthStore
  }) {
    const user = await this.user.getUserById(userId)
    return {
      success: true,
      code: HttpStatus.OK,
      user
    }
  }
}

export default new UserController()
