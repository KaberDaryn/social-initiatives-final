Below is a **complete, longer, fact-based README.md** (English). Copy–paste it into your repo as `README.md`. Replace placeholders like `<YOUR_RENDER_URL>` and adjust credentials if needed.

```md
# Social Initiatives Hub (WT2 Final Project)

Full-stack web application for managing social initiative events: users can register/login, browse published events, join/cancel bookings, view their profile bookings, and interact with event updates/comments. Admins can create/manage events, publish/cancel them, post updates, and review bookings.

**Stack:** Node.js, Express, MongoDB (Atlas), Vanilla JS (SPA), JWT Auth, RBAC, MVC + Services.

---

## Live Demo (Deployment)

- **Live URL:** `<YOUR_RENDER_URL>`  
- **API Health:** `<YOUR_RENDER_URL>/api/health`

> This project can be deployed as a single Render service (backend + static frontend served from `public/`).

---

## Key Features

### Authentication & Security
- JWT authentication (access token stored in browser `localStorage`)
- Password hashing with bcrypt
- Role-Based Access Control (RBAC): `user` vs `admin`
- Centralized error handling (consistent error responses)
- `.env` for all secrets (no hardcoded credentials)

### Core Domain
- Events are created by admins and can be published/cancelled
- Users can join/cancel an event (booking)
- Relational integrity via MongoDB ObjectId references
- Updates (admin posts) and comments (user/admin) inside event details

### Frontend (SPA)
- Hash-based routing:
  - `/#/` (Events)
  - `/#/login`
  - `/#/register`
  - `/#/event/<id>`
  - `/#/me`
  - `/#/admin` (admin only)
- Dynamic UI updates after API operations
- Responsive layout (mobile-friendly)

---

## RBAC (Role Access Matrix)

| Action | Public | User | Admin |
|---|---:|---:|---:|
| View published events | ✅ | ✅ | ✅ |
| View event details | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ✅ | ✅ |
| Join event (create booking) | ❌ | ✅ | ✅ |
| Cancel own booking | ❌ | ✅ | ✅ |
| View own bookings | ❌ | ✅ | ✅ |
| Create / Update / Delete event | ❌ | ❌ | ✅ |
| Publish / Cancel event | ❌ | ❌ | ✅ |
| View all event bookings | ❌ | ❌ | ✅ |
| Create updates for event | ❌ | ❌ | ✅ |
| Comment on updates | ❌ | ✅ | ✅ |

---

## Data Model (MongoDB)

### User
- `name: string`
- `email: string` (unique)
- `passwordHash: string`
- `role: "user" | "admin"`

### Event
- `title: string`
- `type: "workshop" | "community" | "other"`
- `location: string`
- `capacity: number`
- `status: "draft" | "published" | "cancelled"`
- `startsAt: Date` (optional)
- `organizerUser: ObjectId -> User`

### Booking
- `event: ObjectId -> Event`
- `user: ObjectId -> User`
- `status: "active" | "cancelled"`
- Unique constraint: **one active booking per (event, user)**

### Update
- `event: ObjectId -> Event`
- `author: ObjectId -> User` (admin)
- `title: string`
- `content: string`

### Comment
- `update: ObjectId -> Update`
- `author: ObjectId -> User`
- `text: string`

---

## Project Structure (MVC + Services)

```

public/                 # Frontend (static files)
index.html
css/styles.css
js/app.js             # SPA router + UI
js/api.js             # API wrapper (JWT injection)
js/config.js          # API_BASE config

src/
config/
env.js              # env validation/loading
db.js               # mongoose connection
models/               # Mongoose schemas
controllers/          # HTTP handlers
services/             # business logic (DRY)
routes/               # Express routers
middleware/           # auth, rbac, error handling
validators/           # zod validation schemas
utils/                # helpers (responses, async, etc.)
server.js             # app bootstrap

scripts/
seedAdmin.js
seedDemo.js

postman/
Social_Initiatives_Hub_WT2_Final.postman_collection.json
SIH_Local.postman_environment.json

````

---

## API Overview (Main Endpoints)

### Auth
- `POST /api/auth/register`  
- `POST /api/auth/login`

### Events
- `GET /api/events` (public, shows published)
- `GET /api/events/:id` (public)
- `POST /api/events` (admin)
- `PATCH /api/events/:id` (admin)
- `DELETE /api/events/:id` (admin)
- `PATCH /api/events/:id/status` (admin) — publish/cancel

### Bookings
- `POST /api/events/:id/book` (user/admin)
- `DELETE /api/events/:id/book` (user/admin) — cancel own booking
- `GET /api/me/bookings` (user/admin)
- `GET /api/admin/events/:id/bookings` (admin)

### Updates & Comments
- `POST /api/events/:id/updates` (admin)
- `GET /api/events/:id/updates` (public)
- `POST /api/updates/:id/comments` (user/admin)
- `GET /api/updates/:id/comments` (public)

> Exact request/response examples are available in the Postman collection.

---

## Local Setup (Windows / macOS / Linux)

### 1) Install dependencies
```bash
npm install
````

### 2) Create `.env`

Create a `.env` file in the project root (same folder as `package.json`).
Example:

```env
NODE_ENV=development
PORT=3000

MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/sih_final?retryWrites=true&w=majority
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

ADMIN_EMAIL=admin@sih.local
ADMIN_PASSWORD=Admin12345!
ADMIN_NAME=Admin

DEMO_EVENTS_COUNT=6
```

### 3) Seed admin and demo events

```bash
npm run seed:admin
npm run seed:demo
```

### 4) Run the server (dev)

```bash
npm run dev
```

Open:

* Frontend: `http://localhost:3000`
* Health: `http://localhost:3000/api/health`

---

## Frontend Usage (Demo Flow)

1. Register a new user (`Register`)
2. Login as the user (`Login`)
3. Browse Events → open an event → `Join`
4. Go to `My Profile` to see bookings
5. Logout → login as admin:

   * **Email:** `admin@sih.local`
   * **Password:** `Admin12345!`
6. Admin can create/publish/cancel events and post updates.
7. User can comment on updates.

---

## Postman Testing

Folder: `postman/`

* Import:

  * `Social_Initiatives_Hub_WT2_Final.postman_collection.json`
  * `SIH_Local.postman_environment.json`
* Set environment `baseUrl` to:

  * `http://localhost:3000` (local)
  * or `<YOUR_RENDER_URL>` (deployment)
* Run:

  * Login Admin → token saved as `adminToken`
  * Login User → token saved as `userToken`
* Then execute CRUD requests and flows (Events → Bookings → Updates → Comments).

---

## Deployment (Render)

This project can be deployed as **one Render Web Service** (backend + frontend).

### Render settings

* **Build Command:** `npm install`
* **Start Command:** `npm start`

### Required env vars on Render

* `MONGO_URI`
* `JWT_SECRET`
* `JWT_EXPIRES_IN` (optional, default `7d`)
* `CORS_ORIGIN` (set to your Render URL or `*` for quick demo)

Optional (for seeding admin on production):

* `ADMIN_EMAIL`
* `ADMIN_PASSWORD`
* `ADMIN_NAME`
* `DEMO_EVENTS_COUNT`

### Seed on Render

After deploy, open Render Shell:

```bash
npm run seed:admin
npm run seed:demo
```

---

## Quality Notes (Why this is production-ready)

* Clear separation of concerns:

  * Controllers: HTTP layer only
  * Services: business rules and validations (DRY)
  * Models: schema + DB rules
* Centralized error handling and consistent API responses
* Strict input validation (zod) for body/params/query
* RBAC middleware to protect sensitive actions
* `.env` configuration and safe defaults

---

## Author

Kaber Daryn (SE-2430)

```

```
