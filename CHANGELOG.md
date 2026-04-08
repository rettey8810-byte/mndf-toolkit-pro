# Changelog

All notable changes to MNDF Toolkit Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-08

### Added

#### Core Features
- **Tool Inventory Management**
  - Add, edit, delete tools with full details
  - Categorize tools (IT Equipment, Carpentry Tools)
  - Image upload support for tools
  - Real-time quantity tracking (total vs available)
  - Search and filter functionality
  - Location tracking

- **Staff Management System**
  - Full CRUD operations for staff records
  - 30 pre-loaded MNDF staff members with ranks and departments
  - Department and rank categorization
  - Contact information management
  - Searchable staff directory

- **Tool Issuing & Receiving**
  - Issue tools to staff with dropdown selection
  - Staff details display (rank, department, contact)
  - Expected return date tracking
  - Overdue item detection and highlighting
  - Return condition logging (Good, Damaged, Under Maintenance)
  - Transaction history

- **Maintenance Tracking**
  - Log maintenance activities
  - Track technician assignments
  - Cost tracking for repairs
  - Status management (Under Maintenance, Fixed, Scrap)
  - Maintenance history per tool

- **User Management & Permissions**
  - Role-based access control (Super Admin, User)
  - Granular feature permissions:
    - View Inventory
    - Add Tools
    - Edit Tools
    - Delete Tools
    - Lend/Issue Tools
    - Return/Receive Tools
    - Maintenance Access
  - User creation with custom permission sets
  - Permission editing for existing users

- **Dashboard**
  - Real-time statistics (Total, Available, Borrowed, Maintenance)
  - Overdue alerts
  - Low stock warnings (< 5 units)
  - Quick action buttons
  - Database setup tools for Super Admin

#### UI/UX Features
- Military/camouflage color theme (olive, sand, military palettes)
- Responsive design for mobile, tablet, and desktop
- Side navigation with permissions-based visibility
- Mobile-friendly hamburger menu
- Loading states and spinners
- Modal forms for CRUD operations
- Toast-style notifications via alerts
- Footer with developer credits

#### Data & Import
- Pre-configured tool database (50 tools)
  - 20 IT Equipment items
  - 30 Carpentry Tools
- Staff database (30 MNDF personnel)
- Import tools button for quick database setup
- Firestore integration for real-time data

#### Security
- Firebase Authentication
- Role-based access control
- Permission-based feature visibility
- Firestore security rules support

### Technical Implementation

#### Architecture
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS 4 with custom theme
- Firebase (Auth + Firestore)
- React Router for navigation
- Context API for state management

#### Components
- `Layout.tsx` - Main app layout with navigation
- `ImportToolsButton.tsx` - Database import utility
- `ImageUpload.tsx` - Cloudinary image upload
- `SetupWizard.tsx` - Initial setup component
- `Staff.tsx` - Staff management page
- `IssueTools.tsx` - Tool issuing (renamed from Lending)
- `ReceiveTools.tsx` - Tool receiving (renamed from Returns)

#### Custom Styling
- Custom color palette:
  - Olive (50-950 scale)
  - Sand (50-900 scale)
  - Military (green, dark, tan, brown, navy)
- Military-themed UI elements
- Consistent spacing and typography

### Changed
- Renamed "Lending" to "Issue Tools" for clarity
- Renamed "Returns" to "Receive Tools" for clarity
- Updated navigation routes (`/issue`, `/receive`)
- Reduced font sizes for better UI density
- Increased logo sizes in sidebar and header
- Mobile sidebar now opens from right side

### Fixed
- Login page h1/h2 tag mismatch
- Missing `RotateCcw` import in Dashboard
- Mobile menu opening direction

## [0.9.0] - 2026-04-01

### Added
- Initial project setup
- Firebase integration
- Basic CRUD operations
- User authentication
- Tool management foundation
- Responsive layout foundation

### Technical
- Project initialized with Vite + React + TypeScript
- Tailwind CSS configured
- Firebase SDK integrated
- Basic routing implemented

---

## Roadmap

### Planned for v1.1.0
- [ ] Tool barcode/QR code scanning
- [ ] Email notifications for overdue tools
- [ ] Advanced reporting and analytics
- [ ] Tool reservation system
- [ ] Bulk import/export functionality
- [ ] Audit logs for all actions

### Planned for v1.2.0
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Multi-location inventory support
- [ ] Tool usage analytics
- [ ] Automated maintenance scheduling

### Planned for v2.0.0
- [ ] Integration with MNDF ERP systems
- [ ] Advanced search with filters
- [ ] Tool request workflow
- [ ] Procurement tracking
- [ ] Budget and cost center integration

---

## Contributing

When adding changes to this changelog:
1. Add new entries under the `[Unreleased]` section
2. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Reference issue numbers where applicable
4. Keep entries concise but descriptive

## Contributors

- **RettsWebDev** - Lead Developer
- **Hawaain 4 Brothers** - Project Management & Support

---

© 2026 MNDF Toolkit Pro - Maldives National Defence Force
