# FarmNexa Architecture Documentation

## 1. System Overview

FarmNexa is a production-grade agricultural e-commerce marketplace built specifically for Nigerian agricultural producers, processors, cooperatives, domestic wholesale/retail customers, and international export buyers.

The platform bridges local farmgate supply with global buyers through transparent trade pricing, verifiable phytosanitary specifications, minimum order quantity (MOQ) management, real-time sensory shipment tracking (DHT-22/telemetry), and direct WhatsApp order coordination.

```
+-------------------------------------------------------------------------+
|                              CLIENT (SPA)                               |
|              React 18 + TypeScript + Vite + Tailwind CSS                |
|  - Stitch Design System (Manrope, Inter, Tabular Trade Numbers)         |
|  - Dual Domestic (NGN) & Export (USD) Currency Toggle                   |
|  - Multi-Package Spec Selector & Destination Feasibility Checker        |
|  - Dynamic 6-Stage Consignment Tracking & Sensor Telemetry Visualizer   |
|  - Unified Cart & Checkout Modal with WhatsApp Coordination             |
|  - Admin Dashboard: Produce & Category CRUD + Cloudinary Media Uploader|
+------------------------------------+------------------------------------+
                                     |
                          REST API / HTTP-only JWT
                                     |
                                     v
+-------------------------------------------------------------------------+
|                           SERVER (REST API)                             |
|                 Node.js + Express + TypeScript + Zod                    |
|  - Helmet security headers & CORS policy                                |
|  - Rate limiting (Auth endpoints & general API)                         |
|  - JWT Authentication (Cookies & Bearer header)                         |
|  - Google OAuth 2.0 Web Client integration                              |
|  - Multer + Cloudinary v2 Stream Uploads                                |
|  - Paystack Gateway (Prepared HMAC SHA512 webhooks & safe disabled state|
+-------------------+--------------------+-------------------+------------+
                    |                    |                   |
                    v                    v                   v
            +---------------+   +----------------+   +---------------+
            | MongoDB Atlas |   | Cloudinary v2  |   | Paystack /    |
            |   Database    |   | Media Storage  |   | WhatsApp API  |
            +---------------+   +----------------+   +---------------+
```

---

## 2. Database Schema Architecture

### User Collection (`User.ts`)
- `name`: string
- `email`: string (unique, indexed)
- `passwordHash`: string (bcrypt hashed)
- `role`: `'customer' | 'admin'` (default `'customer'`)
- `googleId`: string (optional, for OAuth linked accounts)
- `avatar`: string (optional URL)
- `phone`: string (optional)
- `address`: `{ street, city, state, country, postalCode }`
- `createdAt`, `updatedAt`

### Category Collection (`Category.ts`)
- `name`: string (unique)
- `slug`: string (unique, URL-friendly)
- `description`: string
- `icon`: string (Material Symbols name)
- `image`: string (Cloudinary URL)
- `productCount`: number
- `isFeatured`: boolean

### Product Collection (`Product.ts`)
- `name`: string
- `slug`: string (unique)
- `category`: ObjectId ref to Category
- `sku`: string (unique)
- `description`: string
- `shortDescription`: string
- `pricing`:
  - `domestic`: `{ pricePerUnit, unit, minOrderQty, currency: 'NGN' }`
  - `export`: `{ pricePerUnit, unit, minOrderQty, currency: 'USD' }`
- `packagingSpecs`: array of `{ size, unit, packagingType, grossWeightKg, priceMultiplier }`
- `qualityAndCertifications`:
  - `grade`: string (e.g. `'Grade 1 Export Standard'`)
  - `moistureContentPercent`: number
  - `shelfLifeMonths`: number
  - `phytosanitaryCertified`: boolean
  - `nafdacRegNo`: string
  - `originState`: string
  - `cooperativeName`: string
- `inventory`:
  - `stockQuantity`: number
  - `lowStockThreshold`: number
  - `warehouseLocation`: string
- `images`: array of `{ url, publicId, isPrimary }`
- `tags`: array of string
- `isFeatured`: boolean
- `isExportReady`: boolean
- `status`: `'active' | 'out_of_stock' | 'draft'`

### Order Collection (`Order.ts`)
- `orderReference`: string (unique, e.g. `FNX-20261029-ABCD`)
- `user`: ObjectId ref to User (optional for guest checkout)
- `items`: array of:
  - `product`: ObjectId ref to Product
  - `name`: string
  - `quantity`: number
  - `unit`: string
  - `packagingSize`: string
  - `unitPrice`: number
  - `currency`: `'NGN' | 'USD'`
  - `totalPrice`: number
- `totalAmount`: number
- `currency`: `'NGN' | 'USD'`
- `orderType`: `'domestic' | 'export'`
- `customerWhatsApp`: string (required primary coordination channel)
- `shippingAddress`: `{ fullName, street, city, state, country, postalCode }`
- `paymentStatus`: `'pending' | 'paid' | 'failed' | 'refunded'`
- `paymentReference`: string
- `fulfillmentStatus`: `'pending' | 'confirmed' | 'processing' | 'phytosanitary_inspection' | 'customs_cleared' | 'in_transit' | 'delivered' | 'cancelled'`
- `tracking`:
  - `airwayBillNumber`: string
  - `carrier`: string (e.g. `'DHL Express Global'`)
  - `estimatedDelivery`: Date
  - `currentStatusStage`: number (1 to 6)
  - `lastKnownLocation`: string
  - `sensorTelemetry`: `{ temperatureCelsius, humidityPercent, batteryLevelPercent, lastUpdated }`
- `history`: array of `{ status, notes, timestamp }`

### Wishlist Collection (`Wishlist.ts`)
- `user`: ObjectId ref to User (unique per user)
- `products`: array of ObjectId refs to Product
