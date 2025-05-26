import { Schema, model } from 'mongoose'
import generateOTP from '@/utils/otp'
import {
  USER_MODEL_ERRORS,
  BILLING_PERIOD,
  OTP_MESSAGES,
  OTP_EXPIRY,
  ACCOUNT_STATUS,
  TOTAL_ALLOWED_INCORRECT_OTP_ATTEMPTS,
  TOTAL_TRIAL_DURATION,
  TOTAL_TRIAL_EVENTS
} from '@/utils/constants'

function generateNewOTP() {
  const data = {
    otp: generateOTP(6),
    exp: Date.now() + OTP_EXPIRY // ten minutes
  }
  return data
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, USER_MODEL_ERRORS.EMAIL_REQUIRED],
      unique: [true, USER_MODEL_ERRORS.USER_ALREADY_EXISTS],
      index: [true, null]
    },
    otp: {
      value: {
        type: String
      },
      exp: {
        type: Date
      },
      attempts: {
        type: Number,
        default: 0
      }
    },
    name: {
      type: String
    },
    password: {
      type: String
    },
    picture: {
      type: String
    },
    subscription: {
      period: {
        type: String,
        enum: Object.values(BILLING_PERIOD)
      },
      periodStart: {
        type: Date
      },
      periodEnd: {
        type: Date
      },
      invoiceId: {
        type: String
      },
      totalMonthlyEvents: {
        type: Number
      },
      monthStart: {
        type: Date
      },
      monthEnd: {
        type: Date
      }
    },
    trial: {
      start: {
        type: Date
      },
      end: {
        type: Date
      },
      totalEvents: {
        type: Number
      }
    },
    status: {
      type: Number,
      default: ACCOUNT_STATUS.UNVERIFIED,
      enum: Object.values(ACCOUNT_STATUS)
    }
  },
  {
    timestamps: true,
    versionKey: false,
    statics: {
      async createUser({ name, email }: { name: string; email: string }) {
        const otpData = generateNewOTP()
        const existingUser = await this.findOne({ email }).exec()
        if (existingUser) {
          if (
            existingUser.status === ACCOUNT_STATUS.ACTIVE ||
            existingUser.status === ACCOUNT_STATUS.SUSPENDED
          ) {
            throw new Error(USER_MODEL_ERRORS.USER_ALREADY_EXISTS)
          }
          const user = await this.findByIdAndUpdate(
            existingUser._id,
            {
              otp: { value: otpData.otp, exp: otpData.exp, attempts: 0 }
            },
            { new: true }
          )
            .lean()
            .exec()
          return {
            ...user
          }
        }
        const user = await this.create({
          name,
          email,
          status: ACCOUNT_STATUS.UNVERIFIED,
          otp: {
            value: otpData.otp,
            exp: otpData.exp
          }
        })
        return {
          ...user
        }
      },

      async verifyOTP({ email, otp }: { email: string; otp: string }) {
        const now = Date.now()
        const userData = await this.findOne({ email }).select('_id otp status').exec()
        if (!userData) {
          throw new Error(USER_MODEL_ERRORS.USER_NOT_FOUND)
        }
        const otpVerify = userData.otp
        const otpVerifyExp = new Date(otpVerify.exp).getTime()
        if (
          otpVerify &&
          otpVerify.value === otp &&
          otpVerifyExp >= now &&
          otpVerify.attempts < TOTAL_ALLOWED_INCORRECT_OTP_ATTEMPTS
        ) {
          if (userData.status === ACCOUNT_STATUS.UNVERIFIED) {
            const trialStart = Date.now()
            const trial = {
              start: trialStart,
              end: trialStart + TOTAL_TRIAL_DURATION,
              totalEvents: TOTAL_TRIAL_EVENTS
            }
            await this.findByIdAndUpdate(userData._id, {
              status: ACCOUNT_STATUS.ACTIVE,
              $unset: { otp: 1 },
              trial
            }).exec()
          } else {
            await this.findByIdAndUpdate(userData._id, { $unset: { otp: 1 } }).exec()
          }
          return userData
        }
        if (otpVerifyExp < now) {
          throw new Error(OTP_MESSAGES.EXPIRED)
        } else if (otpVerify.attempts >= TOTAL_ALLOWED_INCORRECT_OTP_ATTEMPTS) {
          throw new Error(OTP_MESSAGES.ATTEMPTS_EXCEEDED)
        } else if (otpVerify.value !== otp) {
          await this.findByIdAndUpdate(userData._id, { $inc: { 'otp.attempts': 1 } }).exec()
          throw new Error(OTP_MESSAGES.INVALID)
        } else {
          throw new Error()
        }
      },

      async resendOTP({ email }: { email: string }) {
        const now = Date.now()
        const savedOtp = await this.findOne({
          email,
          status: { $in: [ACCOUNT_STATUS.UNVERIFIED, ACCOUNT_STATUS.ACTIVE] }
        })
          .select('otp')
          .exec()
        if (!savedOtp) {
          throw new Error(USER_MODEL_ERRORS.USER_NOT_FOUND)
        }
        let otp = savedOtp.otp.value
        const otpExp = new Date(savedOtp.otp.exp).getTime()
        if (
          !otp ||
          otpExp <= now ||
          savedOtp.otp.attempts >= TOTAL_ALLOWED_INCORRECT_OTP_ATTEMPTS
        ) {
          const otpData = generateNewOTP()
          await this.findOneAndUpdate(
            { email },
            {
              otp: { value: otpData.otp, exp: otpData.exp, attempts: 0 }
            }
          ).exec()
          otp = otpData.otp
        }
        return otp
      },

      async login({ email }: { email: string }) {
        const user = await this.findOne({
          email,
          status: { $in: [ACCOUNT_STATUS.UNVERIFIED, ACCOUNT_STATUS.ACTIVE] }
        }).exec()
        if (!user) {
          throw new Error(USER_MODEL_ERRORS.USER_NOT_FOUND)
        }
        const otpData = generateNewOTP()
        const u = await this.findByIdAndUpdate(
          user._id,
          {
            otp: { value: otpData.otp, exp: otpData.exp, attempts: 0 }
          },
          { new: true }
        )
          .select('_id')
          .lean()
          .exec()
        return otpData.otp
      },

      async updateUserStatus(id: string, status: ACCOUNT_STATUS) {
        return await this.findByIdAndUpdate(id, { status }, { new: true })
          .select('_id email name picture status')
          .lean()
          .exec()
      },

      async getUserById(userId: string) {
        return await this.findById(userId)
          .where({ status: { $in: [ACCOUNT_STATUS.UNVERIFIED, ACCOUNT_STATUS.ACTIVE] } })
          .select('_id email name picture trial.end subscription.periodEnd')
          .lean()
          .exec()
      },

      async getUserByEmail(email: string) {
        return await this.findOne({ email }).select('_id email name picture').lean().exec()
      },

      async updateUser({ id, name, picture }: { id: string; name?: string; picture?: string }) {
        const dataToUpdate: {
          name?: string
          picture?: string
        } = {}
        if (name) {
          dataToUpdate.name = name
        }
        if (picture) {
          dataToUpdate.picture = picture
        }
        const user = await this.findByIdAndUpdate(id, dataToUpdate, { new: true })
          .select('_id name email picture')
          .lean()
          .exec()
        return user
      }
    }
  }
)

const UserModel = model('users', UserSchema)

export default UserModel
