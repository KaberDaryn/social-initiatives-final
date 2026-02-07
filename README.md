SOCIAL INITIATIVES HUB (WT2 FINAL PROJECT)
=========================================

Full-stack web application for managing social initiative events. Users can register/login, browse published events, join/cancel bookings, view their profile bookings, and interact with event updates/comments. Admins can create/manage events, publish/cancel them, post updates, and review bookings.



KEY FEATURES
------------
Authentication & Security
- JWT authentication (token stored in browser localStorage)
- Password hashing with bcrypt
- Role-Based Access Control (RBAC): user vs admin
- Centralized error handling (consistent error responses)
- .env for all secrets (no hardcoded credentials)

Core Domain
- Admins create events and publish/cancel them
- Users can join/cancel an event (booking)
- Relational integrity via MongoDB ObjectId references
- Updates (admin posts) and comments (user/admin) inside event details

Frontend (SPA)
- Hash routes:
  /#/            (Events)
  /#/login
  /#/register
  /#/event/<id>
  /#/me
  /#/admin       (admin only)
- Dynamic UI updates after API operations
- Responsive layout (mobile-friendly)


RBAC (ROLE ACCESS)
------------------
Public:
- View published events
- View event details
- View updates/comments

User:
- All Public actions
- Join event (create booking)
- Cancel own booking
- View own bookings
- Comment on updates

Admin:
- All User actions
- Create/Update/Delete event
- Publish/Cancel event
- View bookings for events
- Create updates for events


DATA MODEL (MONGODB)
--------------------
User
- name: string
- email: string (unique)
- passwordHash: string
- role: "user" | "admin"

Event
- title: string
- type: "workshop" | "community" | "other"
- location: string
- capacity: number
- status: "draft" | "published" | "cancelled"
- startsAt: Date (optional)
- organizerUser: ObjectId -> User

Booking
- event: ObjectId -> Event
- user: ObjectId -> User
- status: "active" | "cancelled"
- unique rule: one active booking per (event, user)

Update
- event: ObjectId -> Event
- author: ObjectId -> User (admin)
- title: string
- content: string

Comment
- update: ObjectId -> Update
- author: ObjectId -> User
- text: string


PROJECT STRUCTURE
-----------------
public/                 Frontend (static)
src/                    Backend (MVC + services)
scripts/                Seed scripts
postman/                Postman collection + env


LOCAL SETUP
-----------
1) Install
npm install

2) Create .env (root folder, next to package.json)
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

3) Seed admin and demo data
npm run seed:admin
npm run seed:demo

4) Run dev server
npm run dev

Open:
http://localhost:3000
http://localhost:3000/api/health


POSTMAN TESTING
---------------
Import from postman/ folder:
- Social_Initiatives_Hub_WT2_Final.postman_collection.json
- SIH_Local.postman_environment.json

Set baseUrl:
- http://localhost:3000 (local)


Run Login Admin and Login User to store tokens, then run CRUD + flows.


DEPLOYMENT (RENDER)
-------------------
Build Command: npm install
Start Command: npm start

Env vars:
MONGO_URI
JWT_SECRET
JWT_EXPIRES_IN (optional)
CORS_ORIGIN (set to your frontend domain or your Render URL)

After deploy (Render Shell):
npm run seed:admin
npm run seed:demo


AUTHOR
------
Kaber Daryn (SE-2430)
