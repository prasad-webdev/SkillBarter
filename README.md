# SkillBarter

Peer-to-peer collaborative knowledge exchange platform. Users teach what they know, learn what they want, and pay with skill credits instead of money.

## Features

**Working now**
- Register and login with JWT authentication and password hashing
- Role selection: Mentor, Learner or PeerSwapper
- Skill profile: skills offered, skills wanted, proficiency, availability, bio and links
- User directory with search and role filter
- Session booking with credits held in escrow
- Wallet with transaction history (new users start with 50 credits)
- In-app notifications (list, mark one or all as read)

**Planned**
- User directory, swap proposal, booking, wallet and dashboard screens
- Proposal (skill swap request) API
- Session completion and escrow release

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, TypeScript, express-validator |
| Database | PostgreSQL (Neon) with Prisma ORM |
| Auth | JWT + bcryptjs |

## Project Structure

```
SkillBarter/
├── backend/
│   ├── prisma/schema.prisma      # database models
│   └── src/
│       ├── config/db.ts          # Prisma + Neon connection
│       ├── middleware/auth.ts    # JWT middleware
│       ├── routes/               # auth, skills, users, sessions, wallet, notifications
│       └── index.ts              # server entry
├── frontend/
│   └── src/
│       ├── api/axios.ts          # Axios instance with token
│       ├── pages/                # Register, Login, SkillProfile
│       ├── App.tsx               # routes + protected routes
│       └── main.tsx
└── docs/                         # structure notes and UI mockups
```

## Getting Started

### Prerequisites
- Node.js 18+
- A free PostgreSQL database (Neon, Supabase or local)

### 1. Clone

```bash
git clone https://github.com/prasad-webdev/SkillBarter.git
cd SkillBarter
```

### 2. Backend

```bash
cd backend
npm install
```

Create the env file from the template:

```bash
# PowerShell
Copy-Item .env.example .env
```

Fill in `.env`:

```
DATABASE_URL="your pooled connection string"
DIRECT_URL="your direct connection string"
JWT_SECRET="a long random secret"
PORT=5000
NODE_ENV=development
```

Set up the database and start the server:

```bash
npm run db:generate
npm run db:push
npm run dev
```

Check that it works: http://localhost:5000/api/health

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. Requests to `/api` are proxied to the backend on port 5000.

## API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| POST | `/api/skills/profile` | Save skill profile | Yes |
| GET | `/api/users` | Directory (`?search=` and `?role=`) | Yes |
| POST | `/api/sessions` | Book a session (credits held in escrow) | Yes |
| GET | `/api/wallet` | Balance and recent transactions | Yes |
| GET | `/api/notifications` | List notifications | Yes |
| PATCH | `/api/notifications/:id/read` | Mark one as read | Yes |
| PATCH | `/api/notifications/read-all` | Mark all as read | Yes |
| GET | `/api/health` | Health check | No |

Protected routes need the header `Authorization: Bearer <token>`.

## Database Models

User, SkillOffered, SkillWanted, Availability, Wallet, Transaction, Session, Escrow, Proposal, Notification.

## Scripts

**Backend:** `npm run dev`, `npm run build`, `npm start`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`

**Frontend:** `npm run dev`, `npm run build`, `npm run preview`

## Git Workflow

- `main` is always stable
- Each feature gets its own branch: `feature/<name>`, fixes use `fix/<name>`
- Merge through Pull Requests
- Never commit `.env`

## Author

Prasad Bairagi, [GitHub](https://github.com/prasad-webdev)