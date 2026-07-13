# PROJECT.md — Kinetic Sales System

> **Last Updated:** 2026-07-08
> **Version:** 0.1.0 (Milestone 1)
> **Status:** Project scaffold complete. Dev environment ready.

---

## What Is Kinetic?

Kinetic is an AI-powered Sales Operating System (SaaS).
It helps businesses automate sales conversations — from the first customer
message through to a qualified lead handoff to a human salesperson.

---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Backend Runtime** | Node.js v24 + TypeScript | Server-side application |
| **Backend Framework** | Express.js | HTTP server and API routing |
| **Database** | PostgreSQL (Supabase) | Data storage |
| **Database ORM** | Drizzle ORM | Type-safe database queries and migrations |
| **Authentication** | Supabase Auth | User signup, login, sessions |
| **AI** | Google Gemini API (`@google/genai`) | AI sales conversations |
| **Logging** | Pino | Structured JSON logging |
| **Security** | Helmet, CORS, express-rate-limit | HTTP security headers, request limiting |
| **Frontend** | React 19 + Vite 6 + TypeScript | Admin dashboard |
| **Frontend Auth** | @supabase/supabase-js | Client-side authentication |

---

## Folder Structure

```
Project - Kinetic Sales System/
├── .gitignore                    # Root gitignore
├── PROJECT.md                    # ← You are here
│
├── backend/                      # Node.js + Express + TypeScript API
│   ├── .env.example              # Template for environment variables
│   ├── .gitignore
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── src/
│       ├── app.ts                # Main entry point (starts the server)
│       ├── config/
│       │   ├── env.ts            # Loads and validates environment variables
│       │   ├── supabase.ts       # Supabase auth clients (anon + admin)
│       │   └── database.ts       # Drizzle ORM database connection
│       ├── db/
│       │   └── schema/
│       │       └── index.ts      # Database table definitions (Drizzle)
│       ├── middleware/
│       │   ├── error-handler.ts  # Centralized error handling
│       │   └── request-logger.ts # Request logging with unique IDs
│       ├── routes/
│       │   ├── index.ts          # Route aggregator
│       │   └── health.ts         # Health check endpoint
│       ├── controllers/          # Route handler functions (future)
│       └── services/             # Business logic (future)
│
└── frontend/                     # React + Vite admin dashboard
    ├── .env.example              # Template for frontend env vars
    ├── .gitignore
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html                # Entry HTML
    └── src/
        ├── main.tsx              # React entry point
        ├── App.tsx               # Root component
        ├── App.css
        ├── index.css
        └── assets/               # Static assets
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Where to Find It | Description |
|:---------|:-----------------|:------------|
| `PORT` | Set yourself (default: 3001) | Port the server listens on |
| `NODE_ENV` | Set yourself (default: development) | Environment mode |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` `public` | Public API key (respects RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` | Admin key (bypasses RLS) ⚠️ KEEP SECRET |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string → URI | Direct PostgreSQL connection |
| `GEMINI_API_KEY` | Google AI Studio → API Keys | Your Gemini API key |

### Frontend (`frontend/.env`)

| Variable | Where to Find It | Description |
|:---------|:-----------------|:------------|
| `VITE_SUPABASE_URL` | Same as SUPABASE_URL above | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Same as SUPABASE_ANON_KEY above | Public key (safe for browser) |
| `VITE_API_BASE_URL` | Your backend URL | API base URL (default: http://localhost:3001/api/v1) |

> ⚠️ **SECURITY:** Frontend variables prefixed with `VITE_` are visible to anyone
> visiting your website. NEVER put secret keys in frontend `.env` files.

---

## API Endpoints

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| `GET` | `/api/v1/health` | None | Health check — returns server and database status |

*More endpoints will be added in future milestones.*

---

## Development Commands

### Backend
```powershell
cd backend

# Start development server (auto-reloads on file changes)
npm run dev

# Type-check without building
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```powershell
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Architectural Decisions

### 1. Why Drizzle ORM instead of Prisma?
- Lighter runtime (Prisma adds ~10MB to the bundle)
- SQL-like syntax gives more control for complex multi-tenant queries
- Better performance for the patterns we need (workspace-scoped queries)
- Still gives us type safety and migrations

### 2. Why Supabase Auth instead of building our own?
- Eliminates an entire class of security bugs (password hashing, session management, etc.)
- Handles email verification, password reset, social logins out of the box
- Free tier is generous enough for development and early users
- Integrated with Supabase RLS for database-level security

### 3. Why direct PostgreSQL connection + Drizzle instead of Supabase's API?
- Full SQL control for complex queries
- Type-safe queries with compile-time checking
- No runtime API layer overhead
- Version-controlled migrations
- Supabase Auth handles auth; we handle data directly

### 4. Why Express instead of Fastify/Hono?
- Largest ecosystem and community
- Best AI coding assistant support (most training data)
- Battle-tested in production for 10+ years
- Middleware pattern is simple and well-understood

### 5. Why Pino instead of Winston/console.log?
- Fastest Node.js logger (important in production)
- Outputs structured JSON (essential for log analysis)
- Pretty-prints in development for readability
- Request tracing with unique IDs

---

## Security Measures (Active)

- ✅ **Helmet** — sets secure HTTP headers on every response
- ✅ **CORS** — controls which websites can call the API
- ✅ **Rate Limiting** — 100 requests per 15 minutes per IP
- ✅ **Body Size Limit** — max 10KB JSON payloads
- ✅ **Environment Validation** — server refuses to start if any secret is missing
- ✅ **Git Protection** — `.env` files excluded from version control

---

## Development Roadmap

- [x] **Milestone 1:** Project scaffold, dev environment, Supabase connection
- [ ] **Milestone 2:** Database schema, migrations, workspace/user tables
- [ ] **Milestone 3:** Authentication (signup, login, session management)
- [ ] **Milestone 4:** AI chat engine (Gemini integration, streaming)
- [ ] **Milestone 5:** Lead qualification engine
- [ ] **Milestone 6:** Admin dashboard UI
- [ ] **Milestone 7:** Embeddable chat widget
- [ ] **Milestone 8:** Polish, testing, deployment

---

## Deployment

*Not yet configured. Will be set up in a later milestone.*

Planned: Backend on Render (free tier), Frontend on Vercel (free tier), Database on Supabase (free tier).
