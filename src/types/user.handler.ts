type RegisterUser = {
  body: {
    email: string
  }
}

type VerifyOTP = {
  body: {
    email: string
    otp: string
  }
}

type ResendOTP = {
  body: {
    email: string
  }
}

type LoginUser = {
  body: {
    email: string
  }
}

type UpdateUser = {
  body: {
    name?: string
  }
}

export type UserHandler = {
  RegisterUser: RegisterUser
  VerifyOTP: VerifyOTP
  ResendOTP: ResendOTP
  LoginUser: LoginUser
  UpdateUser: UpdateUser
}
