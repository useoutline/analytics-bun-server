import mongoose from 'mongoose'

const PageDataSchema = new mongoose.Schema(
  {
    path: {
      type: String
    },
    query: {
      type: Object
    },
    hash: {
      type: String
    },
    fullpath: {
      type: String
    },
    title: {
      type: String
    },
    meta: {
      type: Object
    }
  },
  {
    _id: false,
    versionKey: false
  }
)

export default PageDataSchema
