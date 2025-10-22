/**
 * Cloudinary Service - Gestion des images
 */

import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: '.env.local' })

export class CloudinaryService {
  constructor() {
    // Configuration Cloudinary depuis les variables d'environnement
    const cloudinaryUrl = process.env.CLOUDINARY_URL
    
    if (!cloudinaryUrl) {
      console.warn('⚠️ CLOUDINARY_URL not found in environment variables')
      this.isConfigured = false
      return
    }
    
    try {
      const cloudName = this.extractCloudName(cloudinaryUrl)
      const apiKey = this.extractApiKey(cloudinaryUrl)
      const apiSecret = this.extractApiSecret(cloudinaryUrl)
      
      console.log(`🔧 Cloudinary config: cloud_name=${cloudName}, api_key=${apiKey}, api_secret=${apiSecret ? '***' : 'null'}`)
      
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      })
      
      this.isConfigured = true
      console.log('✅ Cloudinary configured successfully')
    } catch (error) {
      console.error('❌ Cloudinary configuration failed:', error.message)
      this.isConfigured = false
    }
  }

  extractCloudName(url) {
    const match = url.match(/@([^@]+)$/)
    return match ? match[1] : null
  }

  extractApiKey(url) {
    const match = url.match(/cloudinary:\/\/(\d+):/)
    return match ? match[1] : null
  }

  extractApiSecret(url) {
    const match = url.match(/cloudinary:\/\/\d+:([^@]+)@/)
    return match ? match[1] : null
  }

  async uploadImage(imageUrl, listingId) {
    if (!this.isConfigured) {
      console.warn('⚠️ Cloudinary not configured, skipping image upload')
      return null
    }

    try {
      console.log(`   📤 Uploading image to Cloudinary: ${imageUrl}`)
      
      const result = await cloudinary.uploader.upload(imageUrl, {
        public_id: `listings/${listingId}`,
        folder: 'mietenow/listings',
        transformation: [
          { width: 400, height: 300, crop: 'fill' },
          { quality: 'auto', format: 'auto' }
        ],
        resource_type: 'auto'
      })
      
      console.log(`   ✅ Image uploaded successfully: ${result.secure_url}`)
      return result.secure_url
      
    } catch (error) {
      console.error(`   ❌ Failed to upload image: ${error.message}`)
      return null
    }
  }

  async deleteImage(publicId) {
    if (!this.isConfigured) {
      return false
    }

    try {
      await cloudinary.uploader.destroy(publicId)
      return true
    } catch (error) {
      console.error(`Failed to delete image ${publicId}:`, error.message)
      return false
    }
  }

  generateOptimizedUrl(publicId, options = {}) {
    if (!this.isConfigured) {
      return null
    }

    const defaultOptions = {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }

    const transformation = { ...defaultOptions, ...options }
    
    return cloudinary.url(publicId, {
      transformation: [transformation],
      secure: true
    })
  }
}
