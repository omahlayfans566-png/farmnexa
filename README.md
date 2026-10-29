# FarmNexa — Complete Agricultural E-Commerce Marketplace

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js%2018+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary%20v2-3448C5?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

**FarmNexa** is a production-oriented agricultural e-commerce marketplace connecting verified Nigerian farmers, processors, and cooperatives directly with domestic wholesale/retail customers and international diaspora/institutional buyers.

---

## Table of Contents
- [Visual Design & Stitch Authority](#visual-design--stitch-authority)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Quick Start Guide](#quick-start-guide)
- [Seed Data & Pre-Configured Accounts](#seed-data--pre-configured-accounts)
- [API Reference](#api-reference)
- [Payment Gateway & WhatsApp Coordination](#payment-gateway--whatsapp-coordination)
- [Automated Testing & Build Verification](#automated-testing--build-verification)
- [Additional Documentation](#additional-documentation)

---

## Visual Design & Stitch Authority

FarmNexa's user interface is built strictly from the Google Stitch design specifications extracted from `stitch_farmnexa_agricultural_marketplace_website.zip`:
- **Color System**:
  - `primary`: `#003b1b` (Deep Nigerian Forest Green)
  - `primary-hover`: `#004d24`
  - `secondary`: `#2b6954` (Sage Teal)
  - `tertiary`: `#674000` (Warm Export Amber)
  - `surface-light`: `#f3fcef` (Fresh Organic Mint Surface)
  - `surface-variant`: `#e0ede2`
- **Typography**:
  - Headings: `Manrope` (800, 700, 600 weight)
  - Body & Specs: `Inter`
  - Prices & Numbers: Tabular numbers enabled (`font-feature-settings: "tnum" 1`) for trade precision.
- **Agricultural Trade Components**:
  - Dual Domestic (NGN) & Export (USD) currency toggle with live conversion.
  - Export MOQ (Minimum Order Quantity) badges and NAFDAC / Phytosanitary compliance tags.
  - Multi-packaging specification selector (e.g. 5kg, 10kg, 25kg, 50kg bags).
  - Destination feasibility checker for European & North American delivery ports.
  - 6-Stage consignment tracking timeline with simulated real-time DHT-22 sensory telemetry (temperature, relative humidity, battery level, location sparklines).

---

## Key Features

1. **Omni-Search & Smart Agricultural Filters**:
   - Filter by Produce Category (Tubers & Flours, Grains, Cash Crops, Spices, Oils, Pulses, Livestock).
   - Filter by Quality Grade (Grade 1 Export, Domestic Wholesale, Organic).
   - Filter by Origin Region (South West, South East, Middle Belt, Northern Savanna).
   - Filter by NAFDAC / Phytosanitary export readiness.
2. **Product Detail Engine**:
   - High-resolution interactive image gallery with thumbnail switcher.
   - Dynamic package configuration with automatic price updates.
   - Live Lagos hub inventory meter.
   - Technical Specifications & Sourcing Provenance tabbed display.
3. **Cart & Streamlined Checkout**:
   - Slide-out cart drawer with real-time subtotal calculation.
   - Clean checkout modal requiring only the customer's WhatsApp phone number and delivery address.
   - Automatic generation of unique order references (e.g. `FNX-20261029-XXXX`).
4. **Order Tracking & WhatsApp Coordination**:
   - Airway Bill / Order Reference tracking portal.
   - Live status progress: Order Placed -> Phytosanitary Inspection -> Customs Cleared -> Air Freight In Transit -> Delivered.
   - Direct WhatsApp confirmation button with pre-formatted message for trade desk reps.
5. **Admin Operations Management**:
   - Dashboard with aggregate metrics: Revenue, Total Orders, Active Produce, Export Consignments.
   - Full Product CRUD with direct Cloudinary image upload.
   - Category CRUD.
   - Live Order status updater with direct customer WhatsApp click-to-chat links.
6. **Authentication & Security**:
   - Dual authentication: Email/Password (bcryptjs) and Google OAuth 2.0 Web Client.
   - Protected routes and role-based access control (`customer` vs `admin`).
   - Security headers with Helmet, CORS lockdown, and strict API rate limiting.

---

## Architecture & Tech Stack

```
farm-nexa/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProductCard, CartDrawer, CheckoutModal
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/              # Home, Category, ProductDetail, Tracking, Admin, Customer Dashboard
│   │   ├── services/           # Axios API instance with token interceptors
│   │   └── types/              # Full TypeScript definitions matching backend
│   └── tailwind.config.js      # Stitch design tokens
├── server/                     # Backend REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # MongoDB Atlas connection (with Windows SRV fix) & Cloudinary
│   │   ├── controllers/        # Auth, Products, Categories, Orders, Payments, Upload, Wishlist
│   │   ├── middleware/         # Auth, RequireAdmin, RateLimiter, ErrorHandler
│   │   ├── models/             # Mongoose schemas (User, Category, Product, Order, Transaction)
│   │   ├── routes/             # Express route handlers
│   │   ├── services/           # Paystack (isolated/disabled safety) & Cloudinary
│   │   ├── seed.ts             # Complete database seeder with Stitch produce
│   │   └── index.ts            # App entry point
├── docs/                       # Comprehensive operational guides
└── package.json                # Root workspace orchestrator
```

---

## Quick Start Guide

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher

### 1. Install Dependencies
Run from the root directory:
```bash
# Install root, client, and server dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Environment Configuration
The backend requires a `server/.env` file. A verified configuration is already set up in `server/.env`.
For a fresh environment, copy the example:
```bash
cp server/.env.example server/.env
```

Key variables configured:
- `MONGODB_URI`: Pre-configured with live MongoDB Atlas database.
- `JWT_SECRET`: Secure encryption key.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Configured for Google OAuth.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Pre-configured media storage.
- `PAYSTACK_ENABLED=false`: Safe mode until live payment gateway keys are activated.

### 3. Seed Database
To populate the categories and verified export products:
```bash
cd server
npx tsx src/seed.ts
cd ..
```
*Output: Seeds 8 categories, 8 verified products with high-res assets, and creates default admin account.*

### 4. Run Development Servers
You can start both frontend and backend concurrently or independently:

```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:server

# Terminal 2: Start Frontend Client (Port 5173)
npm run dev:client
```

Open your browser to: **`http://localhost:5173`**

---

## Seed Data & Pre-Configured Accounts

### Default Admin Account
- **Email**: `admin@farmnexa.com`
- **Password**: `FarmNexaAdmin2026!`
- **Access**: Full access to `/admin` dashboard (Create/Edit produce, upload imagery, update order fulfillment stages, view customer orders).

### Default Test Customer Account
- Register a new account at `/register` or sign in via the **Continue with Google** button.

---

## API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | Public |
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | Login with email and password | Public |
| `GET` | `/api/auth/google/url` | Get Google OAuth consent URL | Public |
| `GET` | `/api/auth/google/callback` | Exchange OAuth code for JWT | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | User |
| `GET` | `/api/categories` | List all categories with product counts | Public |
| `GET` | `/api/products` | Query products (filtering, search, pagination) | Public |
| `GET` | `/api/products/:slug` | Retrieve single product details | Public |
| `POST` | `/api/orders` | Place new order (generates FNX reference) | Public / User |
| `GET` | `/api/orders/:reference` | Get order details & tracking data | Public |
| `GET` | `/api/orders/user/me` | Current user's order history | User |
| `POST` | `/api/upload` | Upload produce image to Cloudinary CDN | Admin |
| `POST` | `/api/admin/products` | Create new produce item | Admin |
| `PUT` | `/api/admin/orders/:id/status` | Update fulfillment stage | Admin |

---

## Payment Gateway & WhatsApp Coordination

1. **Paystack Architecture**:
   - The platform includes a complete Paystack service in `server/src/services/paystack.ts` with HMAC SHA512 signature validation and idempotent webhook handling.
   - Per production safety rules, payments are currently configured in safe disabled mode (`PAYSTACK_ENABLED=false`).
   - See [PAYSTACK_INTEGRATION_GUIDE.md](docs/PAYSTACK_INTEGRATION_GUIDE.md) to activate live Paystack payments in 3 steps.
2. **WhatsApp Order Desk**:
   - Every order generates a unique reference (e.g. `FNX-20261029-ABCD`).
   - Customers receive an instant **"Discuss on WhatsApp"** button which launches WhatsApp pre-populated with order items, total amount, and reference code to finalize trade details with FarmNexa dispatchers.

---

## Automated Testing & Build Verification

The application includes automated unit/integration tests and zero-warning TypeScript compilation:

```bash
# Run server test suite (Vitest)
npm run test:server
# Result: 7/7 passed

# Build both server and client for production
npm run build
# Result: server tsc (0 errors) & client vite build (0 errors)
```

---

## Additional Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Database schema, data flows, and security model.
- [docs/PAYSTACK_INTEGRATION_GUIDE.md](docs/PAYSTACK_INTEGRATION_GUIDE.md) — Live payment setup & webhook configuration.
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — Production hosting instructions (Render & Vercel).
