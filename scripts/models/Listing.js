const mongoose = require('mongoose')

const ListingSchema = new mongoose.Schema({
  title: String,
  price: Number,
  link: String,
  image: String,
  platform: String,
  provider: String,
  external_id: String,
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  surface: Number,
  bedrooms: Number,
  description: String,
  type: String,
  furnishing: String,
  active: { type: Boolean, default: true },
  status_checked_at: Date,
  status_error: String,
  last_seen_at: Date,
  last_checked: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Index pour optimiser les recherches
ListingSchema.index({ platform: 1, external_id: 1 }, { unique: true })
ListingSchema.index({ active: 1 })
ListingSchema.index({ created_at: -1 })
ListingSchema.index({ status_checked_at: 1 })

module.exports = mongoose.model('Listing', ListingSchema)
