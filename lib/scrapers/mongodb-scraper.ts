import connectDB from '../mongodb'
import Listing from '../../models/Listing'
import { BaseScraper } from './base-scraper'
import { Listing as IListing, SearchCriteria, ScraperResult } from '@/types/listing'

export abstract class MongoScraper extends BaseScraper {
  protected async saveListings(listings: IListing[]): Promise<void> {
    await connectDB()
    
    for (const listing of listings) {
      try {
        // Vérifier si l'annonce existe déjà
        const existingListing = await Listing.findOne({ url: listing.url })
        
        if (existingListing) {
          // Mettre à jour l'annonce existante
          await Listing.updateOne(
            { url: listing.url },
            {
              $set: {
                ...listing,
                lastChecked: new Date(),
                updatedAt: new Date()
              }
            }
          )
        } else {
          // Créer une nouvelle annonce
          const newListing = new Listing({
            ...listing,
            lastChecked: new Date()
          })
          await newListing.save()
        }
      } catch (error) {
        console.error(`Failed to save listing ${listing.url}:`, error)
      }
    }
  }

  protected async getExistingListings(source: string): Promise<IListing[]> {
    await connectDB()
    
    const listings = await Listing.find({
      source,
      isActive: true,
      isAvailable: true
    }).lean()

    return listings.map((listing: any) => ({
      id: listing._id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      location: listing.location,
      city: listing.city,
      district: listing.district,
      rooms: listing.rooms,
      size: listing.size,
      images: listing.images,
      url: listing.url,
      source: listing.source,
      sourceId: listing.sourceId,
      publishedAt: listing.publishedAt,
      updatedAt: listing.updatedAt,
      isActive: listing.isActive,
      features: listing.features,
      contactInfo: listing.contactInfo
    }))
  }

  protected async markListingAsUnavailable(url: string): Promise<void> {
    await connectDB()
    
    await Listing.updateOne(
      { url },
      {
        $set: {
          isAvailable: false,
          updatedAt: new Date()
        }
      }
    )
  }

  protected async searchListings(criteria: SearchCriteria): Promise<IListing[]> {
    await connectDB()
    
    const query: any = {
      isActive: true,
      isAvailable: true
    }

    // Filtres de base
    if (criteria.city) {
      query.city = new RegExp(criteria.city, 'i')
    }

    if (criteria.minPrice || criteria.maxPrice) {
      query.price = {}
      if (criteria.minPrice) query.price.$gte = criteria.minPrice
      if (criteria.maxPrice) query.price.$lte = criteria.maxPrice
    }

    if (criteria.minRooms || criteria.maxRooms) {
      query.rooms = {}
      if (criteria.minRooms) query.rooms.$gte = criteria.minRooms
      if (criteria.maxRooms) query.rooms.$lte = criteria.maxRooms
    }

    if (criteria.minSize || criteria.maxSize) {
      query.size = {}
      if (criteria.minSize) query.size.$gte = criteria.minSize
      if (criteria.maxSize) query.size.$lte = criteria.maxSize
    }

    if (criteria.districts && criteria.districts.length > 0) {
      query.district = { $in: criteria.districts }
    }

    const listings = await Listing.find(query)
      .sort({ publishedAt: -1 })
      .limit(100)
      .lean()

    return listings.map((listing: any) => ({
      id: listing._id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      location: listing.location,
      city: listing.city,
      district: listing.district,
      rooms: listing.rooms,
      size: listing.size,
      images: listing.images,
      url: listing.url,
      source: listing.source,
      sourceId: listing.sourceId,
      publishedAt: listing.publishedAt,
      updatedAt: listing.updatedAt,
      isActive: listing.isActive,
      features: listing.features,
      contactInfo: listing.contactInfo
    }))
  }
}
