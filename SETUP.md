# MNDF Toolkit Pro - Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Firebase account (free tier)
- A Cloudinary account (free tier)

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Name it "mndf-toolkit-pro"
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Authentication
1. Go to "Build" > "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Save

### 1.3 Enable Firestore
1. Go to "Build" > "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select location (us-central recommended)
5. Click "Enable"

### 1.4 Get Firebase Config
1. Go to Project Settings (gear icon)
2. Under "Your apps", click the web icon (</>)
3. Register app with nickname "mndf-toolkit-pro-web"
4. Copy the config values to your `.env` file

## Step 2: Cloudinary Setup

### 2.1 Create Account
1. Go to https://cloudinary.com
2. Sign up for free account
3. Verify email

### 2.2 Get Cloud Name
1. In Dashboard, copy "Cloud name"
2. Add to `.env` file

### 2.3 Create Upload Preset
1. Go to Settings > Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Name: "mndf_toolkit"
5. Signing Mode: "Unsigned"
6. Click "Save"
7. Copy preset name to `.env` file

## Step 3: Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all values from Firebase and Cloudinary

## Step 4: Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at http://localhost:5173

## Step 5: Create First Super Admin

### Option 1: Manual Firestore Entry
1. Go to Firebase Console > Firestore Database
2. Create collection "users"
3. Add document with auto-ID:
   ```json
   {
     "email": "admin@mndf.com",
     "name": "Super Admin",
     "role": "super_admin",
     "permissions": {
       "viewInventory": true,
       "addTools": true,
       "editTools": true,
       "deleteTools": true,
       "lendTools": true,
       "returnTools": true,
       "maintenanceAccess": true
     },
     "createdAt": <timestamp>
   }
   ```
4. Go to Authentication > Add user
5. Email: "admin@mndf.com", Password: "admin123"

### Option 2: Using the App (after Firebase Auth setup)
1. Register a user through the app
2. Manually change their role to "super_admin" in Firestore

## Step 6: Firestore Security Rules

In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is super admin
    function isSuperAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Helper to check specific permission
    function hasPermission(permission) {
      return isSuperAdmin() || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions[permission] == true;
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    match /tools/{toolId} {
      allow read: if hasPermission('viewInventory');
      allow create: if hasPermission('addTools');
      allow update: if hasPermission('editTools');
      allow delete: if hasPermission('deleteTools');
    }
    
    match /transactions/{transactionId} {
      allow read: if isAuthenticated();
      allow create: if hasPermission('lendTools');
      allow update: if hasPermission('returnTools');
    }
    
    match /maintenance_logs/{logId} {
      allow read: if isAuthenticated();
      allow write: if hasPermission('maintenanceAccess');
    }
  }
}
```

## Default Login
- Email: `admin@mndf.com`
- Password: `admin123`

## Troubleshooting

### "Permission Denied" errors
- Check Firestore security rules are published
- Verify user has correct permissions in Firestore
- Ensure user is authenticated

### Images not uploading
- Check Cloudinary cloud name and upload preset in .env
- Verify upload preset is set to "Unsigned"
- Check browser console for errors

### Firebase auth errors
- Ensure Email/Password provider is enabled
- Check Firebase config values are correct
- Verify domain is authorized (localhost should work by default)
