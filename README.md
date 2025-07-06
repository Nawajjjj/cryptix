# 🔐 Cryptix – Secure Password Manager App

Cryptix is a sleek and secure offline password manager built with React Native and Expo. It allows users to securely store, view, edit, search, and manage credentials for platforms like Instagram, Facebook, Gmail, Netflix, and more. The app uses `expo-secure-store` for encrypted storage and supports fingerprint/PIN login for quick access.

---

## 📱 Features

- 🔐 Set and use a **4-digit PIN** or **fingerprint authentication**
- ➕ Add multiple credentials with platform, username/email, and password
- 🧾 View, copy, and search saved passwords
- 🖊️ Edit or delete credentials
- 🔍 Real-time search by platform
- 📤 Secure local storage using `expo-secure-store`
- 🌙 Clean, dark-themed UI with professional animations
- 📛 Shake animation for wrong PIN entries
- 🧠 Intelligent local indexing system (`cryptix-index`)


## 🛠️ Tech Stack

- React Native
- Expo SDK
- SecureStore (`expo-secure-store`)
- Fingerprint Auth (`expo-local-authentication`)
- Gesture Handler & Swipeable
- AsyncStorage (for indexing)
- Icons: `@expo/vector-icons`

---

## 🔧 Installation
npm install

## Run the app
npx expo start

##Build APK for Sharing
To create a distributable APK:
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview

##🔐 Security Notes
All passwords are encrypted locally via expo-secure-store
PIN is stored securely and validated before access
App can be further enhanced with:
AES encryption
Screenshot prevention
Inactivity lock
Export/import functionality

##🔐 Security Notes
All passwords are encrypted locally via expo-secure-store
PIN is stored securely and validated before access
App can be further enhanced with:
AES encryption
Screenshot prevention
Inactivity lock
Export/import functionality

##👨‍💻 Developed By
Nawaj Ahmed
React Native Developer | Tech Explorer | Final Year Student at LPU
📍 Khalilabad, Uttar Pradesh, India

### 1. Clone the repo

```bash
 https://github.com/Nawajjjj/cryptix.git
cd cryptix
