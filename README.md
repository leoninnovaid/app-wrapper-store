# App Wrapper Store

**Open-source platform to create Android and iOS apps from any website or existing app without native implementation.**

## Vision

App Wrapper Store enables users to:
- Convert any website into a native-looking Android/iOS app
- Create custom app wrappers with branding and configuration
- Share apps locally without publishing to official app stores
- Build a decentralized app ecosystem

## Features

- 🌐 **WebView-based Wrappers:** Convert websites to native apps using WebView
- 📱 **Multi-platform:** Support for Android and iOS
- 🎨 **Customization:** Branding, icons, app names, and themes
- 🔧 **No Native Code Required:** Simple configuration-based app creation
- 🏪 **Store Interface:** Browse and create apps from a central hub
- 🔓 **Open Source:** Fully open-source, no ads, community-driven
- 📦 **Local Distribution:** Apps are not published to official stores

## Project Structure

```
app-wrapper-store/
├── backend/              # API server for app management
│   ├── src/
│   ├── config/
│   └── package.json
├── frontend/             # Store web interface
│   ├── src/
│   ├── public/
│   └── package.json
├── app-generator/        # APK/IPA generation tool
│   ├── templates/
│   ├── scripts/
│   └── config/
├── wrapper-template/     # React Native wrapper app template
│   ├── app/
│   ├── app.config.ts
│   └── package.json
├── docs/                 # Documentation
├── examples/             # Example app configurations
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (for mobile app generation)
- Android SDK / Xcode (for building APK/IPA)
- Git

### Installation

```bash
git clone https://github.com/leoninnovaid/app-wrapper-store.git
cd app-wrapper-store

# Install backend and start API (http://localhost:3000)
cd backend
npm install
npm run dev

# In a second terminal, install frontend and start UI (http://localhost:5173)
cd ../frontend
npm install
npm run dev

# Optional: run app generator helper
cd ../app-generator
npm install
npm run dev -- android
```

## Proof of Concept: ChatGPT Codex on Android

**Goal:** Create an Android app wrapper for ChatGPT Codex (originally iOS-only) using the App Wrapper Store.

### How it works:

1. **Configuration:** Define the app metadata (name, URL, icon, theme)
2. **WebView Wrapper:** React Native app loads ChatGPT Codex in a WebView
3. **APK Generation:** Build Android APK from the wrapper template
4. **Installation:** Install APK directly on Android device

### Example Configuration:

```json
{
  "name": "ChatGPT Codex",
  "description": "OpenAI's ChatGPT Codex on Android",
  "url": "https://chat.openai.com",
  "icon": "https://example.com/icon.png",
  "theme": {
    "primaryColor": "#10a37f",
    "accentColor": "#ffffff"
  },
  "features": {
    "enablePushNotifications": false,
    "enableOfflineMode": false,
    "enableNativeSharing": true,
    "enableDeepLinking": false
  }
}
```

## Architecture

### Backend API

REST API for managing app configurations:

```
POST   /api/apps              - Create new app
GET    /api/apps              - List all apps
GET    /api/apps/:id          - Get app details
PUT    /api/apps/:id          - Update app
DELETE /api/apps/:id          - Delete app
POST   /api/apps/:id/build    - Trigger APK build
GET    /api/builds/:buildId   - Get build status
```

### Frontend Store

Web interface for browsing and creating apps:
- App catalog with search and filtering
- App creation wizard
- Build status tracking
- Download management

### App Generator

Automated tool to generate APK/IPA files:
- Template-based generation
- Expo build integration
- Signing and optimization
- Download and distribution

### Wrapper Template

React Native app template that:
- Loads URLs in WebView
- Handles app lifecycle
- Manages permissions
- Provides native features (sharing, notifications)

## Security Considerations

- **WebView Security:** Implement CSP headers and URL validation
- **Data Privacy:** No data collection or tracking
- **App Signing:** Secure APK signing process
- **Permissions:** Minimal required permissions

## Roadmap

- [ ] Backend API implementation
- [ ] Frontend store interface
- [ ] APK generation tool
- [ ] iOS support (IPA generation)
- [ ] Push notifications
- [ ] Offline mode support
- [ ] App analytics (optional, privacy-focused)
- [ ] Community app sharing
- [ ] Advanced customization options

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Disclaimer

This project is for educational and personal use. Users are responsible for ensuring they have the right to wrap and distribute any website or app. Respect copyright and terms of service of original content providers.

---

**Status:** Early Development - Proof of Concept Phase

**Last Updated:** 2026-04-03
