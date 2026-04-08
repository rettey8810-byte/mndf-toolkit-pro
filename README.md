# MNDF Toolkit Pro

A comprehensive tool and equipment management system designed for the Maldives National Defence Force (MNDF). Built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

- **Tool Inventory Management**: Track IT equipment, carpentry tools, and other assets
- **Staff Management**: Maintain records of 30+ MNDF personnel with ranks and departments
- **Issue & Receive Tools**: Streamlined tool lending and return process
- **Maintenance Tracking**: Log and monitor tool repairs and servicing
- **Role-Based Access Control**: Granular permissions for different user levels
- **Real-Time Dashboard**: View statistics and alerts at a glance
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4 with custom military/camouflage theme
- **Backend**: Firebase (Auth + Firestore)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase account
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/mndf-toolkit-pro.git
cd mndf-toolkit-pro
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Default Login

**Super Admin:**
- Email: `faix@mndftoolpro.com`
- Password: `Faix@123`

## Project Structure

```
mndf-toolkit-pro/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/         # React context (Auth, etc.)
│   ├── data/            # Static data (tools.json, staff.json)
│   ├── pages/           # Route components
│   ├── scripts/         # Utility scripts (imports, etc.)
│   ├── types.ts         # TypeScript interfaces
│   ├── firebase.ts      # Firebase configuration
│   └── index.css        # Global styles
├── public/              # Static assets (logo, etc.)
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Documentation

- [User Manual](USER_MANUAL.md) - Detailed usage instructions
- [Changelog](CHANGELOG.md) - Version history and updates

## License

© 2026 MNDF Toolkit Pro - Developed by RettsWebDev for Maldives National Defence Force

