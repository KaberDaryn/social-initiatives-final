# Social Initiatives Hub (WT2 Final Project)

Full-stack web application for managing **social initiative events** with **user registrations** and an **admin content feed** (updates + comments).

**Stack:** Node.js, Express, MongoDB (Mongoose), Vanilla JS frontend (served as static files).

---

## Features

### Authentication & RBAC
- **JWT Authentication** (register / login)
- **Role-Based Access Control (RBAC)**
  - **Admin**: create/update/delete events, change event status, create updates, view all bookings
  - **User**: join/cancel event booking, view "My bookings", comment on updates

### Core Domain
- **Events** (CRUD) + **statuses**: `draft | published | cancelled | completed`
- **Bookings** (registrations) with:
  - **Capacity** enforcement
  - **Uniqueness**: only **one ACTIVE booking** per user per event (MongoDB partial unique index)
- **Updates** (admin posts) under events
- **Comments** under updates (user-generated)

### Production-like Quality
- MVC + **services layer** (no business logic inside controllers)
- **Zod validation** for all inputs (body/params/query)
- Centralized error handling (consistent JSON errors)
- `.env` configuration (no hard-coded secrets)
- Pagination & filtering on list endpoints

---

## Architecture

### Folder Structure
```
src/
  config/        # env, db, cors
  constants/     # roles, event enums
  controllers/   # request/response only
  middleware/    # auth, validate, errors
  models/        # Mongoose schemas
  routes/        # API routes
  services/      # business logic
  utils/         # helpers (jwt, password, response, ApiError)
  validators/    # zod schemas
public/
  index.html     # SPA shell
  css/           # responsive styles
  js/            # router, api client, pages
scripts/
  seedAdmin.js   # create/update admin
  seedDemo.js    # seed sample events
```

### Data Model (MongoDB)
- `User` (role: `user|admin`)
- `Event` → `organizerUser: ObjectId(User)`
- `Booking` → `user: ObjectId(User)`, `event: ObjectId(Event)`
- `Update` → `event: ObjectId(Event)`, `author: ObjectId(User)`
- `Comment` → `update: ObjectId(Update)`, `author: ObjectId(User)`

---

## Getting Started (Local)

### 1) Install
```bash
npm install
```

### 2) Configure environment
Copy the example and fill values:
```bash
cp .env.example .env
```

Required:
- `MONGO_URI`
- `JWT_SECRET`

Optional but recommended:
- `CORS_ORIGIN` (if frontend is deployed separately)

### 3) Seed admin (recommended)
```bash
npm run seed:admin
```
This uses:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

### 4) Seed demo events (optional)
```bash
npm run seed:demo
```

### 5) Run
```bash
npm run dev
```
Open:
- Frontend: `http://localhost:3000`
- API Health: `http://localhost:3000/api/health`

---

## Frontend Usage

- Register or login.
- Users can join published events and see **My bookings**.
- Admin can manage events and view bookings in **Admin** page.

> If you deploy frontend separately (Netlify/Vercel), update `public/js/config.js`:
> ```js
> export const API_BASE = 'https://<your-render-backend>';
> ```

---

## API (Summary)

Base URL: `/api`

### Health
- `GET /health`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Events
- `GET /events` (public; admin can pass token + status filter)
- `GET /events/:id` (public for published; admin sees all)
- `POST /events` (**admin**)
- `PUT /events/:id` (**admin**)
- `DELETE /events/:id` (**admin**)
- `PATCH /events/:id/status` (**admin**)

### Bookings
- `POST /bookings` (user/admin) — join event
- `GET /bookings/status/:eventId` (user/admin) — check if I joined
- `DELETE /bookings/:id` (owner or admin) — cancel

### Me
- `GET /me` — current user
- `GET /me/bookings` — my active bookings

### Updates
- `GET /updates/event/:eventId` (public for published; admin allowed)
- `POST /updates` (**admin**)
- `DELETE /updates/:id` (**admin**)

### Comments
- `GET /comments/update/:updateId` (public)
- `POST /comments` (user/admin)
- `DELETE /comments/:id` (author or admin)

---

## Deployment

### Option A (Simplest): Single Render Service (backend + frontend together)
This project serves the frontend from `public/`.

**Render settings:**
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables:
  - `NODE_ENV=production`
  - `MONGO_URI=...`
  - `JWT_SECRET=...`
  - `JWT_EXPIRES_IN=7d`
  - `CORS_ORIGIN=*` (or your domain)
  - `ADMIN_EMAIL=...` / `ADMIN_PASSWORD=...`

After first deploy, run admin seeding (Render Shell):
```bash
npm run seed:admin
npm run seed:demo
```

### Option B: Separate Frontend (Netlify/Vercel) + Backend (Render)
- Backend: set `CORS_ORIGIN=https://<your-frontend-domain>`
- Frontend: set `API_BASE` in `public/js/config.js` to Render URL

---

## Postman

Postman collection is included in `postman/`.
- Import collection
- Set `baseUrl` in environment (example: `http://localhost:3000`)
- Use the "Login (User)" and "Login (Admin)" requests to automatically store tokens.

---

## Defense Notes (what to explain)

1. MVC separation + services layer
2. JWT authentication + RBAC middleware
3. Relational integrity using ObjectId refs
4. Validation with zod + centralized error handling
5. Booking rules: capacity + unique active booking
6. Deployment strategy (Render, optional separate frontend)


### Key points
- Why **services layer**: controllers stay thin, business logic reusable/testable.
- How **RBAC** works: `requireAuth` + `requireRoles('admin')`.
- How **relational integrity** works in MongoDB: ObjectId refs + checks.
- How **capacity** and **unique booking** are enforced (count ACTIVE + partial unique index).
- How **validation** prevents bad data: zod schema per endpoint.
- How **deployment** works on Render (single service) and optional split frontend.

---


