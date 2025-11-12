# Pharmacy Inventory Backend (Node + Express + TypeScript + MongoDB)

Minimal backend to get you started. Includes:
- MongoDB connection (Mongoose)
- JWT auth (create first admin with `/auth/register-if-empty`)
- Items CRUD + stock adjust
- CORS for Vite frontend

## Quick Start

```bash
cd pharmacy-backend
cp .env.example .env
# Edit .env -> MONGO_URI, JWT_SECRET, CLIENT_ORIGINS
npm i
npm run dev
```

### Auth
- Create first admin (only allowed when no users exist):
  - `POST /auth/register-if-empty` body: `{ "name": "Admin", "email": "admin@example.com", "password": "pass" }`
- Login:
  - `POST /auth/login` body: `{ "email": "admin@example.com", "password": "pass" }`
  - Response: `{ token, user }` → send `Authorization: Bearer <token>` for protected routes

### Items
- `GET /items?q=paracetamol` (requires token)
- `POST /items` (admin only)
- `GET /items/:id` (requires token)
- `PUT /items/:id` (admin only)
- `DELETE /items/:id` (admin only)
- `PATCH /items/:id/adjust` body: `{ "delta": 5 }` (admin only)

## Frontend integration
Set Vite env: `VITE_API_BASE_URL=http://localhost:5000`
Then call e.g. `fetch(\`\${import.meta.env.VITE_API_BASE_URL}/items\`, { headers: { Authorization: 'Bearer ' + token } })`

---
Add suppliers/purchases/sales later; this scaffold keeps things clean & extendable.
