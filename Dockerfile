# 🐳 Dockerfile pour MieteNow - Mode Serveur Next.js
# Ce Dockerfile force Render à utiliser le mode serveur

FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application en mode serveur
CMD ["npm", "start"]
