import { Schema } from 'mongoose'

const UtmSchema = new Schema(
  {
    utm_source: {
      type: String
    },
    utm_medium: {
      type: String
    },
    utm_campaign: {
      type: String
    },
    utm_term: {
      type: String
    },
    utm_content: {
      type: String
    }
  },
  {
    _id: false,
    versionKey: false
  }
)

export default UtmSchema
