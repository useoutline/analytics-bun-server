import type { ElysiaApp } from '@/app'
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

function registerUserRoutes(app: ElysiaApp, group: string) {
  app.group(`${group}/user`, (app) => {
    app.post('/register', UserController.registerUser, RegisterUser)
    app.post('/otp/verify', UserController.verifyOTP, VerifyOTP)
    app.post('/otp/resend', UserController.resendOTP, ResendOTP)
    app.post('/login', UserController.loginUser, LoginUser)
    return app
  })

  app.group(`${group}/user`, (app) => {
    app
      .onBeforeHandle(authHandle)
      .patch('/update', UserController.updateUser, UpdateUser)
      .get('/me', UserController.getUser, GetUser)
    return app
  })
}

export { registerUserRoutes }
