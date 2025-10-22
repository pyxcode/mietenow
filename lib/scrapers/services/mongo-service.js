/**
 * MongoDB Service - Gestion des données
 */

import { MongoClient } from 'mongodb'

export class MongoService {
  constructor() {
    this.client = null
    this.db = null
    this.collection = null
    
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    this.dbName = 'mietenow'
    this.collectionName = 'listings'
  }

  async connect() {
    try {
      this.client = new MongoClient(this.mongoUri)
      await this.client.connect()
      this.db = this.client.db(this.dbName)
      this.collection = this.db.collection(this.collectionName)
      
      console.log('✅ Connected to MongoDB')
      return true
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message)
      return false
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close()
        console.log('✅ Disconnected from MongoDB')
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message)
    }
  }

  async saveListings(listings, platform) {
    if (!this.collection) {
      const connected = await this.connect()
      if (!connected) return 0
    }

    let savedCount = 0
    
    for (const listing of listings) {
      try {
        // Vérifier si l'annonce existe déjà
        const existingListing = await this.collection.findOne({ id: listing.id })
        
        if (existingListing) {
          console.log(`   ⚠️ Listing already exists: ${listing.id}`)
          continue
        }
        
        // Ajouter des métadonnées
        listing.platform = platform
        listing.scrapedAt = new Date()
        listing.createdAt = new Date()
        listing.updatedAt = new Date()
        
        // Insérer dans MongoDB
        await this.collection.insertOne(listing)
        savedCount++
        
        console.log(`   ✅ Saved listing: ${listing.title}`)
        
      } catch (error) {
        console.log(`   ⚠️ Error saving listing: ${error.message}`)
      }
    }
    
    return savedCount
  }

  async getListings(filter = {}, limit = 100) {
    if (!this.collection) {
      const connected = await this.connect()
      if (!connected) return []
    }

    try {
      const listings = await this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()
      
      return listings
    } catch (error) {
      console.error('❌ Error fetching listings:', error.message)
      return []
    }
  }

  async getListingById(id) {
    if (!this.collection) {
      const connected = await this.connect()
      if (!connected) return null
    }

    try {
      const listing = await this.collection.findOne({ id })
      return listing
    } catch (error) {
      console.error('❌ Error fetching listing:', error.message)
      return null
    }
  }

  async updateListing(id, updates) {
    if (!this.collection) {
      const connected = await this.connect()
      if (!connected) return false
    }

    try {
      updates.updatedAt = new Date()
      const result = await this.collection.updateOne(
        { id },
        { $set: updates }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      console.error('❌ Error updating listing:', error.message)
      return false
    }
  }

  async deleteListing(id) {
    if (!this.collection) {
      const connected = await this.connect()
      if (!connected) return false
    }

    try {
      const result = await this.collection.deleteOne({ id })
      return result.deletedCount > 0
    } catch (error) {
      console.error('❌ Error deleting listing:', error.message)
      return false
    }
  }

  async getStats() {
    if (!this.collection) {
      const connected = await this.connect()
      if (!connected) return null
    }

    try {
      const total = await this.collection.countDocuments()
      const byPlatform = await this.collection.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]).toArray()
      
      return {
        total,
        byPlatform: byPlatform.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      }
    } catch (error) {
      console.error('❌ Error getting stats:', error.message)
      return null
    }
  }
}
