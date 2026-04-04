# App Wrapper Store - Frontend

React + Vite + TypeScript frontend for the App Wrapper Store.

## Features

- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite
- 🔒 Type-safe with TypeScript
- 📦 State management with Zustand
- 🌐 API integration with Axios
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # React components
│   ├── Header.tsx
│   ├── CreateAppForm.tsx
│   ├── AppList.tsx
│   └── AppCard.tsx
├── services/         # API services
│   └── api.ts
├── store/           # State management
│   └── appStore.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Components

### Header
Navigation header with links to GitHub and documentation.

### CreateAppForm
Form to create new app configurations with:
- App name, description, URL
- Icon and theme colors
- Feature toggles

### AppList
Displays all apps with search/filter functionality.

### AppCard
Individual app card with:
- App info and icon
- Build button
- Delete button
- Expandable details

## API Integration

The frontend communicates with the backend API:

```
GET    /api/apps              # List all apps
POST   /api/apps              # Create app
GET    /api/apps/:id          # Get app details
PUT    /api/apps/:id          # Update app
DELETE /api/apps/:id          # Delete app
POST   /api/apps/:id/build    # Trigger build
GET    /api/builds/:buildId   # Get build status
```

## State Management

Using Zustand for global state:

```typescript
const { apps, loading, error, setApps, addApp } = useAppStore();
```

## Styling

Tailwind CSS for styling with custom colors:
- Primary: `#10a37f`
- Secondary: `#ffffff`
- Dark: `#1a1a1a`
- Light: `#f5f5f5`

## Environment Variables

Create a `.env.local` file:

```
REACT_APP_API_URL=http://localhost:3000/api
```

## Contributing

See the main repository's CONTRIBUTING.md

## License

MIT
