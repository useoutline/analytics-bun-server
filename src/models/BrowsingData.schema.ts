import { Schema } from 'mongoose'

const BrowsingDataSchema = new Schema(
  {
    browser: {
      type: String
    },
    os: {
      type: String
    },
    platform: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      name: {
        type: String
      },
      code: {
        type: String
      }
    },
    continent: {
      type: String
    },
    coords: {
      type: {
        type: String
      },
      coordinates: [Number, Number]
    },
    timezone: {
      type: String
    }
  },
  {
    _id: false,
    versionKey: false
  }
)

export interface BrowsingData {
  browser?: string
  os?: string
  platform?: string
  city?: string
  country?: {
    name: string
    code?: string
  }
  continent?: string
  coords?: {
    type: string
    coordinates: [number, number]
  }
  timezone?: string
}

export default BrowsingDataSchema
