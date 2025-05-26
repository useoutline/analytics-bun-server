import UserController from '@/controllers/User.controller'
import { authHandle } from '@/middlewares/auth'
import {
  GetUser,
  LoginUser,
  RegisterUser,
  ResendOTP,
  UpdateUser,
  VerifyOTP
} from '@/types/user.handler'
import { AnyElysia } from 'elysia'

function registerUserRoutes(elysiaApp: AnyElysia, group: string) {
  elysiaApp.group(`${group}/user`, (app) => {
    app
      .guard({
        tags: ['console']
      })
      .post('/register', UserController.registerUser, RegisterUser)
      .post('/otp/verify', UserController.verifyOTP, VerifyOTP)
      .post('/otp/resend', UserController.resendOTP, ResendOTP)
      .post('/login', UserController.loginUser, LoginUser)
    return app
  })

  elysiaApp.group(`${group}/user`, (app) => {
    app
      .guard({
        tags: ['console']
      })
      .onBeforeHandle(authHandle)
      .patch('/update', UserController.updateUser, UpdateUser)
      .get('/me', UserController.getUser, GetUser)
    return app
  })
}

export { registerUserRoutes }
