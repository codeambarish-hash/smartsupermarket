# Smart AI Checkout System

A futuristic, AI-powered retail checkout system with premium Apple-inspired glassmorphism interface.

## Features

### 🎨 Design
- Modern glassmorphism UI with frosted glass panels
- Smooth animations and transitions
- Dark/Light theme with animated toggle
- Responsive design for desktop and tablet
- Gradient lighting effects and layered depth

### 🛒 Billing System
- **Customer Management**: Auto-retrieval by phone number
- **Multiple Scan Modes**:
  - Barcode Scanner
  - AI Vision Detection (with confidence scores)
  - Multi-Scan Mode (continuous scanning)
- **Real-time Cart**: Add/remove items, adjust quantities
- **Search**: Manual product search by name or barcode
- **Camera Assistance**: Visual feedback with bounding boxes
- **Hand Gesture Control** (demo mode)

### 💰 Payment System
- **Cash Payment**: Denomination entry calculator with automatic change calculation
- **UPI Payment**: QR code display (configurable UPI ID)
- **Split Payment**: Combine cash + UPI
- **Indian Rupee Format**: ₹1,000 • ₹10,000 • ₹1,00,000

### 🎁 Loyalty Points
- Automatic points calculation (1 point per ₹100)
- Points redemption for discounts
- Points display and management

### 📄 Invoice System
- Professional PDF generation with company branding
- Detailed itemized billing
- Downloadable invoices
- Print-ready format

### 📊 Seller Dashboard
- **Analytics**:
  - Total revenue, customers, transactions
  - Top 10 selling products
  - Sales trends (7-day charts)
  - Average bill value
  - Peak hours analysis
  - Category distribution
- **Product Management**: Add, edit, delete products
- **Customer Management**: View all customer data
- **Agent Management**: Add/remove agents with role-based access
- **System Logs**: Complete activity tracking
- **Backup System**: Password-protected Excel export

### 👥 User Roles & Access Control
- **Admin**: Full system access
- **Manager**: View analytics and sales data
- **Cashier**: Billing access only

### 🔌 Offline Mode
- System works without internet
- Data syncs when connection returns
- Live online/offline indicator

### 🔊 Sound System
- Button clicks
- Successful scans
- Item deletion
- Payment success
- Error alerts

### 📱 Notifications
- Animated floating cards
- Smooth slide/fade transitions
- Auto-dismiss timers

## Default Credentials

### Agent Login
- **Agent ID**: 7777
- **Password**: 12345678

### Seller/Admin Login
- **Admin ID**: 1111
- **Password**: admin123

### Manager Login
- **Manager ID**: 2222
- **Password**: manager123

### Backup Password
- **Default**: backup2026

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router (Data Mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Excel Export**: XLSX
- **Icons**: Lucide React
- **State Management**: React Context API
- **Storage**: LocalStorage (offline-first)

## Key Components

- `/src/app/pages/` - All main screens
- `/src/app/components/` - Reusable components
- `/src/app/context/` - Global state management
- `/src/app/utils/` - Helper functions and utilities

## Features Not Requiring Backend

This system is fully functional without a backend server. All data is stored locally using browser LocalStorage, making it perfect for:
- Small retail shops
- Pop-up stores
- Market stalls
- Demonstration purposes
- Offline environments

## Indian Currency Format

The system uses proper Indian number grouping:
- ₹45
- ₹1,000
- ₹10,000
- ₹1,00,000
- ₹10,00,000

## Responsive Design

Optimized for:
- Desktop (1920x1080+)
- Laptop (1366x768+)
- Tablet (768x1024+)
