# MNDF Toolkit Pro - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login & Authentication](#login--authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Tool Inventory Management](#tool-inventory-management)
5. [Issue Tools](#issue-tools)
6. [Receive Tools](#receive-tools)
7. [Staff Management](#staff-management)
8. [Maintenance Tracking](#maintenance-tracking)
9. [User Management (Admin)](#user-management-admin)
10. [Permissions & Access Control](#permissions--access-control)

---

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Screen resolution: 1024x768 or higher recommended

### First Time Setup

1. Navigate to the application URL (e.g., `http://localhost:5173` for local development)
2. Login with your provided credentials
3. Upon first login, the Super Admin should:
   - Import tools to Firestore (Dashboard → Database Setup)
   - Add staff members (Staff page)
   - Create additional users with appropriate permissions (Users page)

---

## Login & Authentication

### Login Screen

1. Enter your email address
2. Enter your password
3. Click "Sign In"

### Password Security

- Keep your password confidential
- Use strong passwords (minimum 8 characters with letters and numbers)
- Contact your administrator if you forget your password

---

## Dashboard Overview

The Dashboard provides a real-time overview of your tool inventory:

### Statistics Cards

- **Total Tools**: Total number of tools in inventory
- **Available**: Tools ready to be issued
- **Borrowed/Issued**: Currently issued tools
- **Maintenance**: Tools under repair or servicing

### Alerts Section

- **Overdue Items**: Tools that haven't been returned on time (highlighted in red)
- **Low Stock Items**: Tools with less than 5 available units

### Quick Actions

Available for users with appropriate permissions:
- Add New Tool
- Issue Tool
- Return/Receive Tool

### Database Setup (Admin Only)

Super Admin can import the pre-configured tool list:
1. Go to Dashboard
2. Scroll to "Database Setup" section
3. Click "Import Tools to Firestore"
4. Confirm to import 50 tools (20 IT Equipment + 30 Carpentry Tools)

---

## Tool Inventory Management

### Viewing Tools

1. Click "Tools" in the left sidebar
2. Use the search bar to find specific tools
3. Filter by category using the dropdown

### Adding a New Tool

1. Click "+ Add Tool" button
2. Fill in the form:
   - **Name**: Tool name (e.g., "Hammer - Claw")
   - **Category**: Select IT Equipment or Carpentry Tools
   - **Quantity**: Total stock quantity
   - **Condition**: Good, Damaged, or Under Maintenance
   - **Location**: Storage location (e.g., "IT Storage Room A")
   - **Image**: Upload tool photo (optional)
3. Click "Add Tool"

### Editing a Tool

1. Find the tool in the list
2. Click the pencil icon
3. Update the desired fields
4. Click "Save Changes"

### Deleting a Tool

1. Find the tool in the list
2. Click the trash icon
3. Confirm deletion

**Note**: Only available for Super Admin or users with delete permissions.

---

## Issue Tools

### Issuing a Tool to Staff

1. Click "Issue Tools" in the left sidebar
2. Click "Issue Tool" button
3. Fill in the form:
   - **Select Tool**: Choose from available tools dropdown
   - **Quantity**: Number of units to issue (cannot exceed available quantity)
   - **Issue To Staff**: Select from pre-loaded staff list (shows rank, department, contact info)
   - **Expected Return Date**: When the tool should be returned
   - **Notes**: Any additional information (optional)
4. Click "Issue Tool"

### Viewing Active Issues

The "Active Issues" section shows all currently issued tools:
- Tool name and quantity
- Staff member who received it
- Issue date
- Expected return date
- Overdue status (highlighted in red)

---

## Receive Tools

### Receiving a Returned Tool

1. Click "Receive Tools" in the left sidebar
2. Find the tool in "Tools to Receive" section
3. Click "Receive Tool" button
4. Fill in the form:
   - **Return Condition**: Good, Damaged, or Under Maintenance
   - **Notes**: Any issues or observations (optional)
5. Click "Confirm Receive"

### Overdue Items

Overdue items are highlighted with a red border and badge. The system tracks:
- How many days overdue
- Staff member responsible
- Contact information

---

## Staff Management

### Viewing Staff

1. Click "Staff" in the left sidebar
2. Use search to find staff by name, email, department, or rank
3. View staff details including contact information

### Adding a New Staff Member (Admin)

1. Click "Add Staff" button
2. Fill in the form:
   - **Full Name**: Staff member's complete name
   - **Email**: Official email address
   - **Department**: Select from dropdown (IT Division, Engineering, etc.)
   - **Rank**: Select from dropdown (Private, Corporal, Sergeant, etc.)
   - **Phone**: Contact number with country code
3. Click "Add Staff"

### Editing Staff Information

1. Find the staff member in the list
2. Click the pencil icon
3. Update the desired fields
4. Click "Save Changes"

### Deleting a Staff Member

1. Find the staff member in the list
2. Click the trash icon
3. Confirm deletion

---

## Maintenance Tracking

### Logging Maintenance

1. Click "Maintenance" in the left sidebar
2. Click "Add Maintenance Log"
3. Fill in the form:
   - **Select Tool**: Choose tool needing maintenance
   - **Issue Description**: Describe the problem
   - **Technician**: Name of person performing maintenance
   - **Cost**: Estimated or actual cost (optional)
   - **Notes**: Additional details
4. Click "Add Log"

### Viewing Maintenance History

The maintenance page shows:
- Current tools under maintenance
- Maintenance history
- Status of each maintenance log (Under Maintenance, Fixed, Scrap)

---

## User Management (Admin)

**Note**: Only Super Admin can access this feature.

### Adding a New User

1. Click "Users" in the left sidebar
2. Click "Add User" button
3. Fill in user details:
   - **Name**: Full name
   - **Email**: Login email address
   - **Password**: Initial password (user should change later)
4. Configure Permissions (see below)
5. Click "Create User"

### Configuring User Permissions

When creating or editing a user, you can set granular permissions:

| Permission | Description |
|------------|-------------|
| View Inventory | Can view tools and dashboard |
| Add Tools | Can add new tools to inventory |
| Edit Tools | Can modify tool information |
| Delete Tools | Can remove tools from inventory |
| Lend Tools | Can issue tools to staff |
| Return Tools | Can receive returned tools |
| Maintenance Access | Can access maintenance logs |

### Editing User Permissions

1. Find the user in the list
2. Click the pencil icon
3. Toggle desired permissions on/off
4. Click "Save Changes"

### Deleting a User

1. Find the user in the list
2. Click the trash icon
3. Confirm deletion

**Important**: Super Admin accounts cannot be deleted through this interface.

---

## Permissions & Access Control

### User Roles

**Super Admin**
- Full system access
- Can manage users and permissions
- Can delete any record
- Can import data to Firestore

**Regular User**
- Access based on assigned permissions
- Cannot manage other users
- Cannot import data

### Permission Matrix

| Feature | View Inventory | Add Tools | Edit Tools | Delete Tools | Lend Tools | Return Tools | Maintenance |
|---------|---------------|-----------|------------|--------------|------------|--------------|-------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tools List | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add Tool | - | ✓ | ✓ | ✓ | - | - | - |
| Edit Tool | - | - | ✓ | ✓ | - | - | - |
| Delete Tool | - | - | - | ✓ | - | - | - |
| Issue Tools | - | - | - | - | ✓ | ✓ | - |
| Receive Tools | - | - | - | - | ✓ | ✓ | - |
| Maintenance | - | - | - | - | - | - | ✓ |
| Staff | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Best Practices

1. **Principle of Least Privilege**: Give users only the permissions they need
2. **Regular Reviews**: Periodically review user access
3. **Document Changes**: Keep a log of permission changes
4. **Password Policy**: Enforce strong passwords

---

## Support & Troubleshooting

### Common Issues

**Cannot Login**
- Verify email and password are correct
- Check internet connection
- Contact administrator if account is locked

**Cannot See Certain Features**
- Your account may not have required permissions
- Contact Super Admin to request access

**Tools Not Appearing**
- Check search/filter settings
- Verify tools have been imported (Admin → Dashboard → Database Setup)

### Contact Support

For technical support or feature requests:
- **Developer**: RettsWebDev
- **Managed by**: Hawaain 4 Brothers
- **Email**: support@mndftoolpro.com

---

## Appendix: Pre-loaded Data

### Default Tool Categories

- **IT Equipment**: Laptops, desktops, monitors, printers, cables, network equipment
- **Carpentry Tools**: Hammers, saws, drills, sanders, measuring tools, safety equipment

### Default Staff Departments

- IT Division
- Engineering
- Maintenance
- Logistics
- Operations
- Administration
- Training

### Default Ranks

- Private
- Private First Class
- Corporal
- Sergeant
- Warrant Officer
- Lieutenant
- Captain
- Major
- Colonel
- General

---

**Document Version**: 1.0.0  
**Last Updated**: April 2026  
**Application Version**: MNDF Toolkit Pro v1.0.0
