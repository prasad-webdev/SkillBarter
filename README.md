# SkillBarter 🔄
### Peer-to-Peer Collaborative Knowledge Exchange Platform
**MES Institute of Management and Career Courses, Pune**
FY MCA 2026–28 | Division A

| Team Member | Roll No |
|---|---|
| Prasad Devidas Bairagi | 2601008 |
| Pranav Shivdas Hasnale | 2601074 |

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Local DB | SQLite (dev) |
| Cloud DB | PostgreSQL — Neon (production) |
| Auth | JWT (JSON Web Tokens) |

---

## Modules
1. User Authentication & Role Management
2. Skill Profiling & Onboarding
3. User Directory & Skill Listings
4. Dual Transaction Engine (Skill Swap + Credits)
5. Automated Escrow System
6. Session Scheduling & Meeting Link Management
7. Wallet, Notifications & Dashboard

---

## How to Run

### Prerequisites
- Node.js v18+
- npm

### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
# → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### View Database (GUI)
```bash
cd backend
npx prisma studio
# → http://localhost:5555
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/users | User directory (search/filter) |
| GET | /api/users/:id | Single user profile |
| POST | /api/skills/profile | Save skill profile |
| GET/POST | /api/sessions | List / Book session |
| PATCH | /api/sessions/:id/meeting-link | Add meeting link |
| PATCH | /api/sessions/:id/complete | Complete session + release escrow |
| GET | /api/wallet | Wallet balance + transactions |
| GET/POST | /api/proposals | List / Send swap proposal |
| PATCH | /api/proposals/:id | Accept / Reject proposal |
| GET | /api/notifications | User notifications |

---

## Environment Setup

Copy `.env.example` to `.env` in the backend folder:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=skillbarter_secret_2026
PORT=5000
NODE_ENV=development
```

---

## Activity 4 — GUI Screens with Validation

| Screen | URL | Validation |
|---|---|---|
| Register | /register | Name, email, password, role |
| Login | /login | Email, password |
| Skill Profile | /profile | Bio, skills, availability |
| Dashboard | /dashboard | Protected route |
| User Directory | /directory | Search + filter |
| Book Session | /book/:mentorId | Date, time, credits |
| Swap Proposal | /proposals/:userId | Skill offer/want |
| Wallet | /wallet | Credit history |
