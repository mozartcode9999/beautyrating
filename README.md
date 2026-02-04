# BeautyRate - Application de Notation de Beauté

Application mobile permettant aux utilisateurs de recevoir une note de beauté sur 10 de la part de la communauté.

## Fonctionnalités

- **Inscription/Connexion** par email
- **Upload de 3 selfies** pour créer son profil
- **Notation des autres utilisateurs** (de 1 à 10)
- **Voir sa note moyenne** après avoir noté 3 personnes
- Interface moderne avec dégradé violet/bleu

## Prérequis

1. Un compte [Expo](https://expo.dev/) (gratuit)
2. Un compte [Firebase](https://firebase.google.com/) (gratuit jusqu'à un certain volume)
3. Node.js installé sur votre ordinateur
4. Pour publier :
   - Un compte Apple Developer (99€/an) pour l'App Store
   - Un compte Google Play Developer (25$ une fois) pour le Play Store

---

## ÉTAPE 1 : Configurer Firebase (GRATUIT)

### 1.1 Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquer sur **"Ajouter un projet"**
3. Nommer le projet (ex: "beautyrate-app")
4. Désactiver Google Analytics (optionnel)
5. Cliquer sur **"Créer le projet"**

### 1.2 Activer Authentication

1. Dans le menu de gauche, cliquer sur **"Authentication"**
2. Cliquer sur **"Commencer"**
3. Dans l'onglet "Sign-in method", activer **"Adresse e-mail/Mot de passe"**

### 1.3 Créer la base de données Firestore

1. Dans le menu de gauche, cliquer sur **"Firestore Database"**
2. Cliquer sur **"Créer une base de données"**
3. Choisir **"Démarrer en mode test"** (pour le développement)
4. Choisir une région proche de vous (ex: europe-west1)

### 1.4 Activer Storage (pour les photos)

1. Dans le menu de gauche, cliquer sur **"Storage"**
2. Cliquer sur **"Commencer"**
3. Choisir **"Démarrer en mode test"**

### 1.5 Récupérer la configuration Firebase

1. Cliquer sur l'icône **engrenage** (paramètres) en haut à gauche
2. Cliquer sur **"Paramètres du projet"**
3. Défiler jusqu'à **"Vos applications"**
4. Cliquer sur l'icône **"</>"** (Web)
5. Nommer l'app (ex: "beautyrate-web")
6. Copier les valeurs de `firebaseConfig`

### 1.6 Mettre à jour le fichier de configuration

Ouvrir le fichier `src/config/firebase.ts` et remplacer les valeurs :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 1.7 Configurer les règles de sécurité Firestore

Dans Firestore > Règles, copier ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 1.8 Configurer les règles de sécurité Storage

Dans Storage > Règles, copier ces règles :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ÉTAPE 2 : Tester l'application localement

### 2.1 Installer les dépendances

```bash
npm install
```

### 2.2 Lancer l'application

```bash
npx expo start
```

### 2.3 Tester sur votre téléphone

1. Télécharger l'app **Expo Go** sur votre téléphone (App Store / Play Store)
2. Scanner le QR code affiché dans le terminal

---

## ÉTAPE 3 : Préparer la publication

### 3.1 Créer un compte Expo

1. Aller sur [expo.dev](https://expo.dev)
2. Créer un compte gratuit
3. Dans le terminal, se connecter :

```bash
npx expo login
```

### 3.2 Installer EAS CLI

```bash
npm install -g eas-cli
```

### 3.3 Configurer EAS

```bash
eas build:configure
```

### 3.4 Personnaliser l'application

1. **Modifier le nom** dans `app.json` :
   - `"name"` : Le nom affiché sur le téléphone
   - `"slug"` : L'identifiant unique (minuscules, pas d'espaces)

2. **Modifier les identifiants** :
   - `ios.bundleIdentifier` : ex: "com.votrenom.beautyrate"
   - `android.package` : ex: "com.votrenom.beautyrate"

3. **Créer des icônes** (512x512 pixels) :
   - Remplacer `assets/icon.png`
   - Remplacer `assets/adaptive-icon.png`
   - Remplacer `assets/splash-icon.png`

---

## ÉTAPE 4 : Publier sur les stores

### 4.1 Build pour iOS (App Store)

```bash
eas build --platform ios --profile production
```

Puis soumettre :

```bash
eas submit --platform ios
```

**Prérequis iOS :**
- Compte Apple Developer (99€/an)
- Créer l'app sur [App Store Connect](https://appstoreconnect.apple.com)
- Renseigner `appleId` et `ascAppId` dans `eas.json`

### 4.2 Build pour Android (Google Play)

```bash
eas build --platform android --profile production
```

Puis soumettre :

```bash
eas submit --platform android
```

**Prérequis Android :**
- Compte Google Play Developer (25$ une fois)
- Créer l'app sur [Google Play Console](https://play.google.com/console)
- Créer un Service Account et télécharger la clé JSON
- Renommer le fichier `google-service-account.json` et le placer à la racine

---

## ÉTAPE 5 : Après la publication

### Passer Firebase en production

1. Aller dans Firebase Console
2. Firestore > Règles : changer le mode test vers des règles sécurisées
3. Storage > Règles : idem

### Monitoring

- Utilisez **Firebase Analytics** pour suivre l'utilisation
- Utilisez **Firebase Crashlytics** pour les bugs

---

## Structure du projet

```
beautyrate/
├── App.tsx                 # Point d'entrée
├── app.json                # Configuration Expo
├── eas.json                # Configuration déploiement
├── src/
│   ├── config/
│   │   └── firebase.ts     # Configuration Firebase
│   ├── context/
│   │   └── AuthContext.tsx # Gestion authentification
│   ├── screens/
│   │   ├── AuthScreen.tsx      # Connexion/Inscription
│   │   ├── UploadScreen.tsx    # Upload des selfies
│   │   ├── RateScreen.tsx      # Noter les autres
│   │   └── ProfileScreen.tsx   # Voir sa note
│   └── types/
│       └── index.ts        # Types TypeScript
└── assets/                 # Images et icônes
```

---

## Coûts estimés

| Service | Coût |
|---------|------|
| Firebase (gratuit jusqu'à ~50k utilisateurs) | 0€ |
| Expo (gratuit) | 0€ |
| Apple Developer Program | 99€/an |
| Google Play Developer | 25€ (une fois) |
| **Total pour publier** | ~125€ |

---

## FAQ

**Q: Puis-je modifier les couleurs ?**
R: Oui, cherchez `#667eea` et `#764ba2` dans les fichiers et remplacez-les.

**Q: Comment ajouter plus de photos ?**
R: Modifiez le tableau dans `UploadScreen.tsx` et les règles de validation.

**Q: L'app peut-elle fonctionner hors-ligne ?**
R: Non, elle nécessite une connexion internet pour Firebase.

**Q: Comment modérer les contenus inappropriés ?**
R: Vous pouvez ajouter Firebase ML Kit pour la détection d'images ou modérer manuellement via la console Firebase.

---

## Support

Pour toute question technique, consultez :
- [Documentation Expo](https://docs.expo.dev/)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation React Native](https://reactnative.dev/)
