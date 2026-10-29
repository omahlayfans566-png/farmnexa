# FarmNexa Deployment Guide

This guide details recommended deployment options for hosting the FarmNexa Agricultural Marketplace in production.

---

## 1. Architecture Split

The application consists of two decoupled tiers:
- **Frontend SPA**: React 18 + Vite + Tailwind CSS (`client/`)
- **Backend API**: Node.js + Express + TypeScript (`server/`)
- **Database**: MongoDB Atlas Cluster
- **Media Storage**: Cloudinary v2 CDN

---

## 2. Deploying the Backend API (Render / Railway / Fly.io)

### Recommended: Render.com Web Service
1. Create a new **Web Service** on Render connected to your repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18+ or 20+
3. Configure Environment Variables in the Render dashboard:
   - `PORT`: `5000` (or leave default, Render sets `PORT`)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://farmnexa.com` (your frontend domain)
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure 64+ char random string
   - `GOOGLE_CLIENT_ID`: Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
   - `GOOGLE_CALLBACK_URL`: `https://api.yourdomain.com/api/auth/google/callback`
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY`: Cloudinary API Key
   - `CLOUDINARY_API_SECRET`: Cloudinary API Secret
   - `PAYSTACK_ENABLED`: `false` (or `true` if live keys configured)
   - `FARMNEXA_WHATSAPP_NUMBER`: 2348000000000 (your corporate WhatsApp number)

---

## 3. Deploying the Frontend (Vercel / Netlify / Cloudflare Pages)

### Recommended: Vercel
1. Import repository on Vercel.
2. Select **Root Directory**: `client`.
3. Framework Preset: **Vite**.
4. Configure Build & Output:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://api.yourdomain.com/api`
6. Add SPA redirect rule in `client/vercel.json` if not already present:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 4. Google OAuth Production Notice
When deploying to your production domain:
1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Web Client credentials:
   - Add your production frontend domain to **Authorized JavaScript origins** (e.g. `https://farmnexa.com`).
   - Add your production backend callback URL to **Authorized redirect URIs** (e.g. `https://api.yourdomain.com/api/auth/google/callback`).
