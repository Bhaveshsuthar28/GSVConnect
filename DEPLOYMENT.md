# Deployment guide (Frontend + Backend)

This repo is a 2-app setup:
- `Frontend/` (Vite + React)
- `Backend/` (Node + Express + MongoDB)

## 1) Environment variables

### Backend
- Create env vars from `Backend/.env.example`
- Required for production auth cookies:
  - Use HTTPS
  - Set `COOKIE_SAMESITE=none`
  - Ensure `CORS_ORIGINS` includes your exact frontend origin(s)

### Frontend
- Create env vars from `Frontend/.env.example`
- `VITE_BASE_URL` must include `/api/v1`

## 2) CORS + cookies (important)

This backend uses **httpOnly cookies** (`accessToken`, `refreshToken`). For this to work in production:
- Backend must be HTTPS
- Frontend must call backend with `withCredentials: true` (already configured)
- Backend must allow your frontend origin(s): set `CORS_ORIGINS=https://your-frontend-domain` (comma-separated supported)
- If frontend and backend are on different sites, use `COOKIE_SAMESITE=none`

## 3) Recommended hosting options

### Option A: Vercel (Frontend) + Render/Railway (Backend)

Frontend (Vercel):
- Build command: `npm run build`
- Output: `dist`
- Add env vars from `Frontend/.env.example`

Backend (Render/Railway):
- Start command: `npm start`
- Add env vars from `Backend/.env.example`
- Make sure the platform sets `PORT` automatically (your code respects `process.env.PORT`)

### Option B: Single-machine VPS (Nginx reverse proxy)

- Run backend with `node Backend/Server.js`
- Serve frontend via static hosting (`Frontend/dist`) or a separate Node/static server
- Configure Nginx:
  - HTTPS (LetsEncrypt)
  - Proxy `/api` to backend
  - Set `X-Forwarded-Proto` so secure cookies work (the app trusts proxy)

## 4) Post-deploy smoke checks

- `GET /healthz` on backend → `{ ok: true }`
- Login should set cookies in browser storage (Application → Cookies)
- Refresh token flow: leaving the app idle then triggering an API call should auto-refresh
- CORS: confirm requests include `Origin` and backend returns `Access-Control-Allow-Credentials: true`

## 5) Common deployment pitfalls

- **Cookies not set**: usually missing HTTPS or `COOKIE_SAMESITE=none`.
- **CORS blocked**: `CORS_ORIGINS` must match the exact origin (including `https://` and no trailing slash).
- **Google OAuth redirect**: set `FRONTEND_URL` on backend, and ensure Google OAuth callback URL matches your backend route.
