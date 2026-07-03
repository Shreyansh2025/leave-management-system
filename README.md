# LeaveDesk — Employee Leave Management System

A full-stack MVP that lets employees apply for and track leave requests, and lets managers review, approve, or reject them — replacing the manual email/spreadsheet process.

## Project Overview

Employees log in, apply for leave, and track the status of their requests. Managers log in to a separate view, see pending requests, and approve/reject them with comments. Both roles get a dashboard summarizing activity.

## Features

**Auth**: JWT-based login, role-based access (employee/manager), protected routes, logout.

**Employee**: dashboard, apply for leave, view/search/filter leave history, edit or cancel *pending* requests.

**Manager**: dashboard, pending approvals queue, approve/reject with comments, browse employees, view any employee's full leave history.

**Cross-cutting**: server-side + client-side validation, consistent error responses with proper HTTP status codes, loading and empty states, responsive layout, keyboard-focus styling.

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite + React Router + Tailwind CSS v4 | Fast dev loop, no boilerplate state library needed for this scope |
| Backend | Node.js + Express | Minimal, explicit routing/middleware, easy to reason about for review |
| Database | SQLite via [sql.js](https://sql.js.org/) (pure JS/WASM, no native compilation) | Zero external DB server to install; portable `.sqlite` file. See "Swapping the database engine" below to move to Postgres/MySQL |
| Auth | JWT (jsonwebtoken) + bcryptjs | Stateless, simple to demo via Postman |
| Validation | Zod | Schema-based, readable error messages |

## Folder Structure

```
leave-management/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # DB connection + query helpers
│   │   ├── models/schema.sql     # table definitions, constraints, indexes
│   │   ├── middleware/           # auth, validation, error handling
│   │   ├── controllers/          # request handlers
│   │   ├── routes/               # route definitions
│   │   ├── utils/                # JWT helper, ApiError, Zod schemas
│   │   └── app.js                # Express app assembly
│   ├── database/                 # generated .sqlite file lives here (gitignored)
│   ├── server.js                 # entry point
│   ├── seed.js                   # sample data seeder
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # axios instance + JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/           # AppShell, ProtectedRoute, StatusPill, etc.
│   │   ├── pages/                # one file per route
│   │   └── App.jsx               # routing
│   └── .env.example
├── database/                     # schema lives in backend/src/models; this folder holds ERD notes
├── docs/API.md                   # full endpoint reference
├── postman/                      # importable Postman collection
└── README.md
```

## Installation Steps

Prerequisites: **Node.js 18+** and **npm**.

### 1. Clone and install
```bash
git clone <your-repo-url>
cd leave-management

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

**backend/.env** (copy from `backend/.env.example`):
```
PORT=5000
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
DB_FILE=./database/leave_management.sqlite
NODE_ENV=development
```

**frontend/.env** (copy from `frontend/.env.example`) — leave `VITE_API_BASE_URL` blank for local dev; Vite's dev server proxies `/api` to the backend automatically (see `vite.config.js`).

### 3. Database Setup
No separate install needed — the schema in `backend/src/models/schema.sql` is applied automatically the first time the server (or seed script) runs, creating `backend/database/leave_management.sqlite`.

Seed sample data (a manager, 3 employees, a few leave requests):
```bash
cd backend
npm run seed
```

### 4. Backend Setup & Run
```bash
cd backend
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```
API runs at `http://localhost:5000`. Health check: `GET /health`.

### 5. Frontend Setup & Run
```bash
cd frontend
npm run dev
```
App runs at `http://localhost:5173`.

### 6. Running the Application
1. Start the backend (`npm run dev` in `/backend`)
2. Start the frontend (`npm run dev` in `/frontend`)
3. Open `http://localhost:5173`, log in with a sample account below.

## Sample Login Credentials
Seeded by `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Manager | manager@company.com | Password123! |
| Employee | aarav@company.com | Password123! |
| Employee | sana@company.com | Password123! |
| Employee | rohan@company.com | Password123! |

## Database Schema

Two normalized tables (see `backend/src/models/schema.sql` for the full DDL):

**employees** — `id (PK)`, `name`, `email (unique)`, `password (bcrypt hash)`, `department`, `role (employee|manager)`, `manager_id (FK → employees.id, self-referencing)`, timestamps.

**leaves** — `id (PK)`, `employee_id (FK → employees.id, cascade delete)`, `leave_type`, `start_date`, `end_date`, `reason`, `status (Pending|Approved|Rejected|Cancelled)`, `manager_comments`, `reviewed_by (FK → employees.id)`, timestamps.

Constraints: `CHECK` on enum-like fields (`role`, `leave_type`, `status`) since SQLite lacks native enums; `CHECK (end_date >= start_date)`.

Indexes: `employees(email)` for login lookups; `leaves(employee_id)`, `leaves(status)`, and a composite `leaves(employee_id, status)` for the query patterns that dominate this app (an employee's own leaves, a manager's pending queue).

### Swapping the database engine
The schema is portable SQL. To move to PostgreSQL: replace `backend/src/config/db.js` with a `pg` connection pool, adjust `AUTOINCREMENT` → `SERIAL`/`IDENTITY` and `datetime('now')` → `now()` in `schema.sql`, and update `.env`. Everything else (controllers, routes) is unaffected since they only depend on the `run/get/all` interface.

## API Documentation
Full endpoint reference: [`docs/API.md`](./docs/API.md)
Importable collection: [`postman/Leave-Management-System.postman_collection.json`](./postman/Leave-Management-System.postman_collection.json) (the Login request auto-saves its token to a collection variable used by every other request).

## Assumptions
- One manager approves all leave requests for the MVP (no multi-level approval chains).
- Leave balance/quota tracking is out of scope — see Future Enhancements.
- A "cancel" is a soft cancel (status → `Cancelled`), not a hard delete, to preserve history.
- Employees can only edit/cancel their own requests, and only while `Pending`.
- JWT stored in `localStorage` on the client for MVP simplicity (see Known Limitations).

## Known Limitations
- **Token storage**: JWT is kept in `localStorage`, which is vulnerable to XSS. A production version should use an httpOnly cookie.
- **No refresh tokens**: sessions simply expire after `JWT_EXPIRES_IN` (default 1 day); the user must log in again.
- **No pagination**: employee/leave lists load in full — fine at demo scale, would need pagination for a large org.
- **Single-tenant**: no multi-organization/company support.
- **No email notifications** on approval/rejection.
- **SQLite via sql.js**: great for zero-setup local dev/demo; a production deployment should move to Postgres/MySQL (see "Swapping the database engine" above) for concurrent-write safety.

## Future Enhancements
- JWT refresh tokens + httpOnly cookie storage
- Leave balance/quota calculation per employee per leave type
- Email notifications on status change
- Audit log of all approval/rejection actions
- Pagination + server-side sorting on list endpoints
- Docker Compose for one-command local setup
- Unit/integration tests (Jest + Supertest) and a CI pipeline (GitHub Actions)
- Dark mode

## Git Workflow
This repo was built with incremental, logically-scoped commits (see commit history) rather than one large drop, covering: project scaffolding → database schema → auth → leave CRUD → manager operations → frontend auth/routing → employee pages → manager pages → docs/Postman → final polish.
