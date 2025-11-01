# Guide de Test des Préférences

## ✅ Vérifications Effectuées

### 1. **Conversion des Chambres ("2+" → 2)**
- ✅ Conversion avec validation (`parseInt` + vérification `!isNaN` + `> 0`)
- ✅ Appliquée immédiatement lors de la sélection
- ✅ Appliquée aussi avant la redirection finale
- ✅ Logs de débogage ajoutés

### 2. **Sauvegarde de min_price**
- ✅ `min_price` est bien défini dans le modèle User
- ✅ Sauvegarde dans `/criteria/price/page.tsx` avec validation
- ✅ API préserve `min_price` même si égal à 0
- ✅ Vérification spéciale dans l'API pour s'assurer que `min_price` n'est pas écrasé

### 3. **Sauvegarde de tous les choix**
- ✅ **Type (housingType)** → sauvegardé comme `type` immédiatement
- ✅ **Furnishing** → sauvegardé immédiatement
- ✅ **Min Bedrooms** → converti et sauvegardé immédiatement
- ✅ **Min Price & Max Price** → sauvegardés avec validation
- ✅ **Address** → sauvegardée avec vérification de non-vide
- ✅ **Coordinates** → sauvegardées avec l'adresse

### 4. **Paiement et Onboarding**
- ✅ `onboarding_completed` défini à `true` lors du paiement
- ✅ `last_payment_date` défini lors du paiement
- ✅ `plan_expires_at` défini lors du paiement
- ✅ Plan mis à jour correctement

## 🧪 Comment Tester

### Test 1: Vérifier un utilisateur spécifique

```bash
node scripts/test-preferences-saving.js [USER_ID]
```

Exemple:
```bash
node scripts/test-preferences-saving.js 690610e27efe92e1933a9bab
```

### Test 2: Lister tous les utilisateurs récents

```bash
node scripts/test-preferences-saving.js
```

### Test 3: Test manuel du flow complet

1. **Page Criteria** (`/criteria`)
   - Sélectionner un type (ex: "Room") → Vérifier console: `✅ Converted bedrooms...`
   - Sélectionner furnishing (ex: "Furnished") → Vérifier console: `✅ Criteria preferences saved`
   - Sélectionner bedrooms (ex: "2+") → Vérifier console: conversion en nombre

2. **Page Price** (`/criteria/price`)
   - Définir min_price (ex: 900) et max_price (ex: 1500)
   - Cliquer "Continue" → Vérifier console: `💾 Saving price preferences`
   - Vérifier que `min_price: 900` est bien dans les logs

3. **Page Address** (`/criteria/address`)
   - Entrer une adresse → Vérifier console: `💾 Saving address preferences`
   - Vérifier que `address` est bien sauvegardée

4. **Après Paiement**
   - Vérifier dans la BDD que:
     - `plan` n'est pas "empty"
     - `plan_expires_at` est défini
     - `last_payment_date` est défini
     - `onboarding_completed` est `true`

## 📋 Checklist de Validation

Pour chaque utilisateur, vérifier:

- [ ] `min_price` est présent dans `search_preferences`
- [ ] `max_price` est présent et correct
- [ ] `type` n'est pas "Any" (si l'utilisateur a sélectionné)
- [ ] `furnishing` n'est pas "Any" (si l'utilisateur a sélectionné)
- [ ] `min_bedrooms` est un nombre > 0 (si l'utilisateur a sélectionné)
- [ ] `address` n'est pas vide
- [ ] `coordinates` sont présentes (lat et lng)
- [ ] Si `subscription_status === 'active'`:
  - [ ] `plan` n'est pas "empty"
  - [ ] `last_payment_date` est défini
  - [ ] `plan_expires_at` est défini
  - [ ] `onboarding_completed` est `true`

## 🔍 Logs à Surveiller

### Côté Client (Console Navigateur)
- `💾 Saving criteria preferences:` - Sauvegarde des critères
- `✅ Converted bedrooms "2+" to number 2` - Conversion des chambres
- `💾 Saving price preferences:` - Sauvegarde des prix
- `💾 Saving address preferences:` - Sauvegarde de l'adresse

### Côté Serveur (Logs API)
- `📥 POST /api/user/preferences - Body received:` - Réception des données
- `📋 Existing preferences:` - Préférences existantes
- `📋 New preferences to merge:` - Nouvelles préférences
- `✅ Merged min_price:` - Fusion réussie de min_price
- `✅✅ min_price explicitly set to:` - min_price explicitement défini
- `✅ User updated successfully. Saved preferences:` - Préférences sauvegardées

## 🐛 Problèmes Potentiels

1. **min_price manquant**: Vérifier que la valeur n'est pas `undefined` ou `null` avant sauvegarde
2. **Valeurs écrasées par défauts**: Vérifier les logs de merge dans l'API
3. **userId manquant**: Vérifier que `userId` est bien passé dans les headers ou le body
4. **Adresse vide**: Vérifier que l'utilisateur a bien sélectionné une adresse depuis AddressPicker

## 📝 Notes

- `min_price` peut être 0, donc on ne peut pas utiliser `|| defaultValue`
- Les valeurs doivent être vérifiées avec `!== undefined && !== null`
- L'adresse doit être vérifiée avec `.trim()` pour éviter les espaces
- Les conversions de "2+" utilisent `parseInt(value, 10)` avec validation


