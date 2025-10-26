# Upload Video to Cloudinary

Ce script permet d'uploader la vidéo commerciale sur Cloudinary et de générer automatiquement une miniature à la 16ème seconde.

## Configuration requise

1. **Variables d'environnement** : Créez un fichier `.env.local` avec vos credentials Cloudinary :
```bash
CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@YOUR_CLOUD_NAME
```

2. **Obtenir vos credentials Cloudinary** :
   - Connectez-vous à votre compte Cloudinary
   - Allez dans le Dashboard
   - Copiez l'URL complète depuis la section "API Environment variable"

## Utilisation

### Option 1 : Via npm script
```bash
npm run upload-video
```

### Option 2 : Exécution directe
```bash
node scripts/upload-video-to-cloudinary.js
```

## Fonctionnalités

- ✅ Upload de la vidéo sur Cloudinary
- ✅ Génération automatique d'une miniature à la 16ème seconde
- ✅ Optimisation automatique de la qualité et du format
- ✅ Organisation dans le dossier `mietenow/videos`
- ✅ URLs sécurisées (HTTPS)

## Résultat

Le script affichera :
- 📹 URL de la vidéo uploadée
- 🖼️ URL de la miniature générée
- 📁 Public ID pour référence future

## Personnalisation

Vous pouvez modifier les paramètres dans le script :
- `timeOffset` : Position de la miniature (par défaut 16 secondes)
- `publicId` : Nom du fichier sur Cloudinary
- Dimensions de la miniature (par défaut 400x300)
