# App Wrapper Store - Architecture

## Overview

App Wrapper Store is a modular system for creating native-looking Android and iOS apps from websites. The architecture consists of four main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Store                           │
│              (Web Interface for Users)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                              │
│        (App Management & Build Orchestration)               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  App Generator   │    │ Wrapper Template │
│ (APK/IPA Build)  │    │  (React Native)  │
└──────────────────┘    └──────────────────┘
```

## Components

### 1. Backend API (`/backend`)

**Purpose:** Manage app configurations and orchestrate builds

**Key Responsibilities:**
- Store and retrieve app configurations
- Trigger build processes
- Track build status
- Provide REST API for frontend

**Technology Stack:**
- Express.js (HTTP server)
- Node.js (Runtime)
- TypeScript (Type safety)

**API Endpoints:**

```
POST   /api/apps              # Create app
GET    /api/apps              # List apps
GET    /api/apps/:id          # Get app details
PUT    /api/apps/:id          # Update app
DELETE /api/apps/:id          # Delete app
POST   /api/apps/:id/build    # Trigger build
GET    /api/builds/:buildId   # Get build status
GET    /api/apps/:id/builds   # Get app builds
```

### 2. Frontend Store (`/frontend`)

**Purpose:** User interface for browsing and creating apps

**Key Features:**
- App catalog with search/filter
- App creation wizard
- Build status tracking
- Download management

**Technology Stack:**
- React (UI framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)

### 3. App Generator (`/app-generator`)

**Purpose:** Automate APK and IPA generation

**Key Responsibilities:**
- Generate APK files from configurations
- Generate IPA files (iOS)
- Sign and optimize builds
- Manage build artifacts

**Technology Stack:**
- Node.js scripts
- Expo CLI (for React Native builds)
- Android SDK / Xcode (for compilation)

**Build Process:**

```
1. Fetch app configuration from Backend
2. Clone wrapper template
3. Inject configuration (env vars, assets)
4. Build APK/IPA using Expo
5. Sign the build
6. Upload to storage
7. Return download URL
```

### 4. Wrapper Template (`/wrapper-template`)

**Purpose:** React Native app that displays websites in WebView

**Key Features:**
- WebView-based URL loading
- Configuration injection
- Native feature access (sharing, notifications)
- Responsive design

**Technology Stack:**
- React Native (Mobile framework)
- Expo (Build tooling)
- WebView (Web content display)

**Configuration:**

```typescript
// Environment variables injected at build time
EXPO_PUBLIC_APP_URL           # URL to load
EXPO_PUBLIC_APP_NAME          # App display name
EXPO_PUBLIC_PRIMARY_COLOR     # Theme color
EXPO_PUBLIC_ICON_URL          # App icon
```

## Data Flow

### Creating an App

```
1. User fills form in Frontend Store
   ↓
2. POST /api/apps (Backend)
   ↓
3. Backend stores configuration
   ↓
4. Returns app ID to frontend
   ↓
5. User clicks "Build APK"
   ↓
6. POST /api/apps/:id/build (Backend)
   ↓
7. Backend triggers App Generator
   ↓
8. App Generator clones template
   ↓
9. Injects configuration
   ↓
10. Builds APK
    ↓
11. Uploads to storage
    ↓
12. Backend updates build status
    ↓
13. Frontend polls for status
    ↓
14. Download link becomes available
```

## Security Considerations

### WebView Security

- **URL Validation:** Only allow HTTPS URLs
- **CSP Headers:** Implement Content Security Policy
- **JavaScript Isolation:** Limit injected scripts
- **Cookie Management:** Secure cookie handling

### Build Security

- **Code Signing:** Sign all APK/IPA files
- **No Secrets in Code:** Use environment variables
- **Dependency Scanning:** Regular security audits
- **Build Isolation:** Separate build environments

### Data Privacy

- **No Tracking:** No analytics or user tracking
- **Local Storage:** User data stays on device
- **No Telemetry:** No data collection
- **Open Source:** Code is publicly auditable

## Scalability

### Horizontal Scaling

- **Stateless Backend:** Can run multiple instances
- **Distributed Build Queue:** Multiple build workers
- **Shared Storage:** S3 or similar for build artifacts
- **Load Balancing:** Distribute requests

### Database

- **Current:** In-memory (development)
- **Production:** PostgreSQL or MongoDB
- **Caching:** Redis for build status

## Deployment

### Development

```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
cd frontend && npm install && npm start

# Terminal 3: App Generator
cd app-generator && npm install && npm run dev
```

### Production

- **Backend:** Docker container on cloud (AWS, GCP, Azure)
- **Frontend:** Static hosting (Vercel, Netlify, GitHub Pages)
- **App Generator:** Serverless functions or dedicated workers
- **Storage:** S3 or cloud storage for builds

## Future Enhancements

- [ ] Push notifications support
- [ ] Offline mode with service workers
- [ ] Advanced customization (CSS injection, etc.)
- [ ] App analytics (privacy-focused)
- [ ] Community app sharing
- [ ] Version management
- [ ] Automated updates
- [ ] Multiple language support

## Contributing

See CONTRIBUTING.md for guidelines on contributing to this architecture.
