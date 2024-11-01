import mongoose from 'mongoose'
import BrowsingDataSchema from '@/models/BrowsingData.schema'
import PageDataSchema from '@/models/PageData.schema'
import UtmSchema from '@/models/Utm.schema'
import { EVENT_MODEL_ERRORS, EVENT_TYPES } from '@/utils/constants'

const eventSchema = new mongoose.Schema(
  {
    app: {
      type: String,
      required: [true, EVENT_MODEL_ERRORS.APP_REQUIRED],
      ref: 'apps'
    },
    user: {
      type: String,
      required: [true, EVENT_MODEL_ERRORS.USER_REQUIRED]
    },
    event: {
      type: String,
      required: [true, EVENT_MODEL_ERRORS.EVENT_REQUIRED]
    },
    eventType: {
      type: Number
    },
    page: PageDataSchema,
    browsingData: BrowsingDataSchema,
    referrer: {
      type: String
    },
    utm: UtmSchema,
    sessionId: {
      type: String
    },
    capturedAt: {
      type: Date
    },
    visitedAt: {
      type: Date
    },
    leftAt: {
      type: Date
    },
    data: {
      type: Object
    }
  },
  {
    timestamps: true,
    versionKey: false,
    statics: {
      async createEvent(eventData) {
        return await this.create(eventData)
      },

      async getLatestEventsByAppId(appId, { page = 1, limit = 10 } = {}) {
        const skip = (page - 1) * limit
        return await this.find({ app: appId })
          .sort({ capturedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec()
      }
    }
  }
)

const EventModel = mongoose.model('events', eventSchema)

export default EventModel

export { EVENT_TYPES }
