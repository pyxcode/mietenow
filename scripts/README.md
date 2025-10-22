# Scripts de gestion des utilisateurs

Ce dossier contient des scripts utilitaires pour gérer les utilisateurs de l'application Mietenow.

## 📋 Scripts disponibles

### 1. `change-password-simple.js` - Changement de mot de passe

Script simple et efficace pour changer le mot de passe d'un utilisateur.

#### Usage :
```bash
# Lister tous les utilisateurs
node scripts/change-password-simple.js list

# Changer le mot de passe d'un utilisateur
node scripts/change-password-simple.js <email> <nouveau_mot_de_passe>
```

#### Exemples :
```bash
# Lister les utilisateurs
node scripts/change-password-simple.js list

# Changer le mot de passe
node scripts/change-password-simple.js user@example.com newpassword123
```

### 2. `create-test-user.js` - Création d'utilisateur de test

Script pour créer un utilisateur de test avec des données par défaut.

#### Usage :
```bash
node scripts/create-test-user.js
```

#### Utilisateur de test créé :
- **Email** : `test@example.com`
- **Mot de passe** : `password123`
- **Nom** : Test User
- **Plan** : Free

### 3. `change-password.js` - Script complet (interactif)

Script complet avec interface interactive pour changer les mots de passe.

#### Usage :
```bash
# Mode interactif
node scripts/change-password.js

# Mode direct
node scripts/change-password.js <email> <nouveau_mot_de_passe>

# Lister les utilisateurs
node scripts/change-password.js list
```

## 🔧 Configuration

Les scripts tentent automatiquement de se connecter à :
1. **Base locale** : `mongodb://localhost:27017/mietenow-prod`
2. **Base cloud** : `mongodb+srv://louan:louan123@mietenow-cluster.6srfa0f.mongodb.net/`

## 🔐 Sécurité

- Les mots de passe sont hachés avec bcrypt (12 rounds de salt)
- Les connexions MongoDB sont sécurisées
- Les scripts vérifient l'existence de l'utilisateur avant modification

## 📝 Exemples d'utilisation

### Scénario 1 : Utilisateur oublie son mot de passe
```bash
# 1. Lister les utilisateurs pour trouver l'email
node scripts/change-password-simple.js list

# 2. Changer le mot de passe
node scripts/change-password-simple.js user@example.com newpassword123
```

### Scénario 2 : Créer un utilisateur de test
```bash
# Créer l'utilisateur de test
node scripts/create-test-user.js

# Vérifier qu'il a été créé
node scripts/change-password-simple.js list
```

### Scénario 3 : Mode interactif
```bash
# Lancer le script interactif
node scripts/change-password.js

# Suivre les instructions à l'écran
```

## ⚠️ Notes importantes

1. **Sauvegarde** : Toujours faire une sauvegarde de la base de données avant de modifier des utilisateurs
2. **Permissions** : Les scripts doivent être exécutés avec les bonnes permissions
3. **Logs** : Tous les changements sont loggés avec horodatage
4. **Validation** : Les mots de passe doivent contenir au moins 6 caractères

## 🐛 Dépannage

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
sudo systemctl status mongod

# Ou pour MongoDB local
brew services start mongodb-community
```

### Erreur "Module not found"
```bash
# Installer les dépendances
npm install bcryptjs mongodb
```

### Erreur "User not found"
```bash
# Lister les utilisateurs pour vérifier l'email
node scripts/change-password-simple.js list
```

## 📞 Support

En cas de problème, vérifiez :
1. La connexion à la base de données
2. Les permissions des scripts
3. Les logs d'erreur détaillés
4. La configuration MongoDB
