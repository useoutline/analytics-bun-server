import { isEmail } from 'validator'
import HttpStatus from 'http-status'
import { OTP_MESSAGES, USER_CONTROLLER_ERROR_CODES, USER_MODEL_ERRORS } from '@/utils/constants'
import UserModel from '@/models/User.model'
import { sendMail } from '@/utils/mailer'

const ACCESS_TOKEN_EXPIRY = 90 * 24 * 60 * 60 // 90 days in seconds

async function registerUser({ body, error }) {
  const { email } = body
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
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function verifyOTP({ body, error, cookie }) {
  const { email, otp } = body
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

async function resendOTP({ body, error }) {
  const { email } = body
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
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function loginUser({ body, error }) {
  const { email } = body
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
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function updateUser({ body, error, store }) {
  const { name } = body
  try {
    const updatedUser = await UserModel.updateUser({ id: store.user.id, name })
    return {
      success: true,
      code: HttpStatus.OK,
      user: updatedUser
    }
  } catch (err) {
    console.error(err.message)
    return error(HttpStatus.INTERNAL_SERVER_ERROR, {
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.'
    })
  }
}

async function getUser({ store }) {
  const user = await UserModel.getUserById(store.user.id)
  return {
    success: true,
    code: HttpStatus.OK,
    user
  }
}

export default { registerUser, verifyOTP, resendOTP, loginUser, updateUser, getUser }
