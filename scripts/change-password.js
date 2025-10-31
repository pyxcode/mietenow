#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import readline from 'readline';

config({ path: '.env.local' });

// User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  plan: { type: String, default: 'empty' },
  plan_expires_at: { type: Date, default: null },
  preferences: {
    address: String,
    radius: Number,
    minPrice: Number,
    maxPrice: Number,
    bedrooms: Number,
    housingType: String,
    furnishing: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
});

const User = mongoose.model('User', userSchema);

async function changePassword() {
  try {
    // Utiliser la variable d'environnement MONGODB_URI
    const mongoUri = process.env.MONGODB_URI;
    const DB_NAME = 'mietenow-prod';
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Si c'est une URI mongodb+srv://, la convertir en mongodb:// direct
    let connectionUri = mongoUri;
    if (mongoUri.includes('mongodb+srv://')) {
      const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/);
      if (match) {
        const [, username, password, host, database, query] = match;
        connectionUri = `mongodb://${username}:${password}@${host}:27017/${database || DB_NAME}${query || ''}`;
      }
    }
    
    // S'assurer que la base de données est dans l'URI
    if (connectionUri.includes('/?') || connectionUri.endsWith('/')) {
      connectionUri = connectionUri.replace(/\/(\?|$)/, `/${DB_NAME}$1`);
    } else if (!connectionUri.match(/\/[^/]+(\?|$)/)) {
      connectionUri = connectionUri.replace(/\/$/, `/${DB_NAME}`);
    }
    
    await mongoose.connect(connectionUri);
    console.log('✅ Connecté à MongoDB - Base:', DB_NAME);

    // Lister tous les utilisateurs
    const users = await User.find({}, 'email firstName lastName plan').limit(10);
    console.log('\n📋 Utilisateurs trouvés:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - Plan: ${user.plan}`);
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    // Demander l'email
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const email = await new Promise((resolve) => {
      rl.question('\n📧 Entrez l\'email de l\'utilisateur: ', resolve);
    });

    // Demander le nouveau mot de passe
    const newPassword = await new Promise((resolve) => {
      rl.question('🔑 Entrez le nouveau mot de passe: ', resolve);
    });

    rl.close();

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Mettre à jour le mot de passe
    await User.updateOne({ email }, { password_hash: hashedPassword });
    
    console.log(`✅ Mot de passe mis à jour pour ${user.email}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nom: ${user.firstName} ${user.lastName}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

changePassword();
