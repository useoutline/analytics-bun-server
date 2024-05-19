import UserController from '@/controllers/User.controller'
import { authHandle } from '@/middlewares/auth'

function registerUserRoutes(app, group) {
  app.group(`${group}/user`, (app) => {
    app.post('/register', UserController.registerUser)
    app.post('/otp/verify', UserController.verifyOTP)
    app.post('/otp/resend', UserController.resendOTP)
    app.post('/login', UserController.loginUser)
    app.put('/update', UserController.updateUser, { beforeHandle: authHandle })
    app.get('/me', UserController.getUser, { beforeHandle: authHandle })
    return app
  })
}

export { registerUserRoutes }
