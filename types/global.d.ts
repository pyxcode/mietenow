import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
  var $crisp: any[]
  var CRISP_WEBSITE_ID: string
}
