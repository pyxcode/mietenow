/**
 * Helper simple pour obtenir le modèle User sur mietenow-prod
 */

import mongoose, { Model, Schema } from 'mongoose'
import { IUser } from '@/models/User'

const DB_NAME = 'mietenow-prod'

// Cache du schéma
let UserSchema: Schema | null = null

async function getUserSchema(): Promise<Schema> {
  if (!UserSchema) {
    const UserModule = await import('@/models/User')
    UserSchema = UserModule.UserSchema as Schema
    if (!UserSchema) {
      throw new Error('UserSchema not found')
    }
  }
  return UserSchema
}

/**
 * Obtient le modèle User sur mietenow-prod
 * CRITIQUE: Force toujours l'utilisation de mietenow-prod
 */
export async function getUserModel(): Promise<Model<IUser>> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready. Call connectDB() first.')
  }
  
  // VÉRIFICATION STRICTE: S'assurer qu'on utilise bien mietenow-prod
  const dbName = mongoose.connection.db?.databaseName
  if (!dbName || dbName !== DB_NAME) {
    const errorMsg = `CRITICAL: getUserModel() appelé sur la base "${dbName}" au lieu de "${DB_NAME}"`
    console.error(`❌ ${errorMsg}`)
    throw new Error(errorMsg)
  }
  
  // Si le modèle existe déjà sur cette connexion, vérifier qu'il est sur la bonne base
  if (mongoose.connection.models.User) {
    // Vérifier que le modèle est bien sur la bonne base
    const existingModel = mongoose.connection.models.User as any
    const modelDb = existingModel.db?.databaseName
    
    if (modelDb && modelDb !== DB_NAME) {
      // Le modèle existe mais sur la mauvaise base - on ne peut pas le supprimer car models est readonly
      // On va créer un nouveau modèle avec un nom unique pour forcer la recréation
      console.warn(`⚠️ Modèle User sur mauvaise base: ${modelDb}, création d'un nouveau modèle...`)
      // Créer avec un nom unique pour éviter le conflit, puis récupérer le modèle
      const schema = await getUserSchema()
      // Supprimer l'ancien modèle en utilisant deleteModel si disponible, sinon créer avec un nom unique
      try {
        // Essayer de supprimer via deleteModel (nouvelle API Mongoose)
        if (mongoose.connection.deleteModel) {
          mongoose.connection.deleteModel('User')
        }
      } catch (e) {
        // Si deleteModel n'existe pas ou échoue, on va créer le modèle quand même
        // Mongoose écrasera l'ancien si on utilise le même nom
      }
      // Créer le nouveau modèle
      const model = mongoose.connection.model<IUser>('User', schema)
      return model as Model<IUser>
    } else {
      // Le modèle existe et est sur la bonne base
      return mongoose.connection.models.User as Model<IUser>
    }
  }
  
  // Créer le modèle sur la connexion active (qui doit être mietenow-prod grâce à connectDB)
  const schema = await getUserSchema()
  const model = mongoose.connection.model<IUser>('User', schema)
  
  // Vérification finale
  const modelDb = (model as any).db?.databaseName
  if (modelDb && modelDb !== DB_NAME) {
    throw new Error(`CRITICAL: Modèle User créé sur "${modelDb}" au lieu de "${DB_NAME}"`)
  }
  
  return model
}
