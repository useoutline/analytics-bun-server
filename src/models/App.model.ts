import { Schema, model } from 'mongoose'
import { APP_MODEL_ERRORS, APP_STATUS, TOTAL_ALLOWED_USER_APPS } from '@/utils/constants'
import { customNanoId } from '@/utils/nanoid'

const AppSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => `OA-${customNanoId()}`
    },
    owner: {
      type: String,
      required: true,
      ref: 'users'
    },
    name: {
      type: String,
      required: [true, APP_MODEL_ERRORS.APP_NAME_REQUIRED]
    },
    domain: {
      type: String
    },
    events: [
      {
        event: {
          type: String,
          required: [true, APP_MODEL_ERRORS.EVENT_REQUIRED]
        },
        selectorType: {
          type: String,
          required: [true, APP_MODEL_ERRORS.SELECTOR_TYPE_REQUIRED],
          default: 'selector',
          enum: {
            values: ['id', 'text', 'selector'],
            message: APP_MODEL_ERRORS.SELECTOR_TYPE_INVALID
          }
        },
        selector: {
          type: String,
          required: [true, APP_MODEL_ERRORS.SELECTOR_REQUIRED]
        },
        text: {
          type: String
        },
        trigger: {
          type: String,
          required: [true, APP_MODEL_ERRORS.TRIGGER_REQUIRED]
        },
        page: {
          type: String
        }
      }
    ],
    status: {
      type: Number,
      default: APP_STATUS.ACTIVE,
      enum: Object.values(APP_STATUS)
    }
  },
  {
    timestamps: true,
    versionKey: false,
    statics: {
      async createApp({ owner, name, domain }) {
        const totalApps = await this.countDocuments({ owner })
          .where({ status: { $ne: APP_STATUS.DELETED } })
          .exec()
        if (totalApps >= TOTAL_ALLOWED_USER_APPS) {
          throw new Error(APP_MODEL_ERRORS.MAX_APPS_REACHED)
        }
        return await this.create({
          owner,
          name,
          domain
        })
      },

      async getAppsByOwner(owner) {
        return await this.find({
          owner
        })
          .where({ status: { $ne: APP_STATUS.DELETED } })
          .sort({ updatedAt: -1 })
          .select('-owner -events')
          .lean()
          .exec()
      },

      async getAppById(appId, owner) {
        return await this.findById(appId)
          .where({ owner, status: { $ne: APP_STATUS.DELETED } })
          .select('-owner')
          .lean()
          .exec()
      },

      async updateApp(appId, owner, details) {
        return await this.findByIdAndUpdate(
          appId,
          { $set: details },
          { new: true, runValidators: true }
        )
          .where({ owner, status: APP_STATUS.ACTIVE })
          .lean()
          .exec()
      },

      async addEvent(appId, owner, event) {
        return await this.findByIdAndUpdate(
          appId,
          { $push: { events: event } },
          { new: true, runValidators: true }
        )
          .where({ owner, status: APP_STATUS.ACTIVE, 'events.event': { $ne: event.event } })
          .lean()
          .exec()
      },

      async updateEvent(appId, owner, eventId, event) {
        const partialUpdateSet = {}
        if (event && Object.keys(event)) {
          for (let key of Object.keys(event)) {
            partialUpdateSet[`events.$.${key}`] = event[key]
          }
        }
        return await this.findOneAndUpdate(
          { _id: appId, 'events._id': eventId },
          { $set: partialUpdateSet },
          { new: true, runValidators: true }
        )
          .where({ owner, status: APP_STATUS.ACTIVE, 'events.event': { $ne: event.event } })
          .lean()
          .exec()
      },

      async deleteEvents(appId, owner, eventIds) {
        return await this.findByIdAndUpdate(
          appId,
          { $pull: { events: { _id: { $in: eventIds } } } },
          { new: true }
        )
          .where({ owner, status: APP_STATUS.ACTIVE })
          .lean()
          .exec()
      },

      async getEventsByAppId(appId) {
        return await this.findOne({
          _id: appId,
          status: APP_STATUS.ACTIVE
        })
          .select('events')
          .lean()
          .exec()
      },

      async softDeleteApp(appId, owner) {
        return await this.findByIdAndUpdate(
          appId,
          { $set: { status: APP_STATUS.DELETED } },
          { new: true }
        )
          .where({ owner })
          .lean()
          .exec()
      },

      async resumeApp(appId) {
        return await this.findByIdAndUpdate(
          appId,
          { $set: { status: APP_STATUS.ACTIVE } },
          { new: true }
        )
          .lean()
          .exec()
      },

      async pauseApp(appId) {
        return await this.findByIdAndUpdate(
          appId,
          { $set: { status: APP_STATUS.PAUSED } },
          { new: true }
        )
          .lean()
          .exec()
      },

      async suspendApp(appId) {
        return await this.findByIdAndUpdate(
          appId,
          { $set: { status: APP_STATUS.SUSPENDED } },
          { new: true }
        )
          .lean()
          .exec()
      },

      async permanentDeleteApp(appId) {
        return await this.findByIdAndDelete(appId).exec()
      },

      async getDeletedAppsByOwner(owner) {
        return await this.find({
          owner,
          status: APP_STATUS.DELETED
        })
          .select('-events')
          .lean()
          .exec()
      }
    }
  }
)

const AppModel = model('apps', AppSchema)

export default AppModel
