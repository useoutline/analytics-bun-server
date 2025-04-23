import { Schema } from 'mongoose'

const PageDataSchema = new Schema(
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

export interface PageData {
  path?: string
  query?: Record<string, string>
  hash?: string
  fullpath?: string
  title?: string
  meta?: Record<string, string>
}

export default PageDataSchema
