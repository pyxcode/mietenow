const crypto = require('crypto');

console.log('🔐 Génération de clés sécurisées pour MieteNow\n');

// Générer JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Générer NextAuth Secret
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
console.log('NEXTAUTH_SECRET=' + nextAuthSecret);

console.log('\n✅ Copiez ces valeurs dans vos fichiers .env');
console.log('⚠️  Gardez ces clés secrètes et ne les partagez jamais !');
