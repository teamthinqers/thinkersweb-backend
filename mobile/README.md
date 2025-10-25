# DotSpark Mobile App

Native iOS and Android app built with React Native and Expo.

## Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Features

- ✅ Google Sign-In with Firebase
- ✅ Social Neura Feed (browse thoughts)
- ✅ Quick Capture (create thoughts)
- ✅ Profile Management
- ✅ Offline support
- ✅ Native mobile UI

## Project Structure

```
mobile/
├── src/
│   ├── screens/        # App screens
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── services/       # API and services
│   ├── hooks/          # Custom hooks
│   └── types/          # TypeScript types
├── assets/             # Images, fonts, icons
├── App.tsx             # Entry point
└── app.json            # Expo configuration
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Publishing to App Stores

Follow the [Expo EAS Build guide](https://docs.expo.dev/build/introduction/) for submitting to App Store and Play Store.
