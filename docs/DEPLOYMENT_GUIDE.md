# LAZARUS V3 DEPLOYMENT GUIDE

This guide details the steps required to deploy Lazarus V3 to production environments (e.g., Vercel for Frontend and Render/Railway/DigitalOcean for Backend) with hosted Neon PostgreSQL.

---

## 1. ENVIRONMENT CONFIGURATION

### Backend Environment Variables (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_URL=https://your-backend-domain.com

# Neon PostgreSQL Database (Production Connection Pooling)
DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[HOST]-pooler.c-5.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:[PASSWORD]@[HOST].c-5.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication
JWT_SECRET="generate-a-secure-random-64-character-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Token Encryption Key (AES-256-GCM Master Key)
TOKEN_ENCRYPTION_KEY="generate-a-secure-random-32-byte-token-encryption-key"

# Google / YouTube OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="https://your-backend-domain.com/api/integrations/youtube/callback"

# Meta / Instagram Graph API Credentials
INSTAGRAM_CLIENT_ID="your-meta-app-id"
INSTAGRAM_CLIENT_SECRET="your-meta-app-secret"
INSTAGRAM_REDIRECT_URI="https://your-backend-domain.com/api/integrations/instagram/callback"

# Twitch OAuth & Helix API Credentials
TWITCH_CLIENT_ID="your-twitch-client-id"
TWITCH_CLIENT_SECRET="your-twitch-client-secret"
TWITCH_REDIRECT_URI="https://your-backend-domain.com/api/integrations/twitch/callback"

# Gemini AI (Optional Content Ideation)
GEMINI_API_KEY="your-gemini-api-key"
```

### Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_URL="https://your-backend-domain.com"
```

---

## 2. DATABASE DEPLOYMENT STEPS

1. **Verify Connection**:
   Ensure `DATABASE_URL` (pooler) and `DIRECT_URL` (direct) are configured in the backend environment.
2. **Apply Migrations**:
   Run:
   ```bash
   npx prisma generate
   npx prisma db push # or prisma migrate deploy
   ```
3. **Verify Database Health**:
   Send HTTP GET to `/` to ensure status returns `healthy`.

---

## 3. BACKEND DEPLOYMENT (Render / Railway / Docker)

1. **Root Directory**: `backend`
2. **Build Command**: `npm install && npx prisma generate`
3. **Start Command**: `node src/server.js`
4. **Health Check Path**: `/`

---

## 4. FRONTEND DEPLOYMENT (Vercel)

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variable**: Set `VITE_API_URL` to the public backend domain.
