# SkillBarter — Project Structure

```
SkillBarter/
├── backend/                  ← Node.js + TypeScript + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts         ← MongoDB Atlas connection
│   │   ├── models/           ← Mongoose models (9 collections)
│   │   │   ├── User.ts
│   │   │   ├── Skill.ts
│   │   │   ├── UserSkill.ts
│   │   │   ├── Availability.ts
│   │   │   ├── Session.ts
│   │   │   ├── Escrow.ts
│   │   │   ├── Wallet.ts
│   │   │   ├── Transaction.ts
│   │   │   └── Notification.ts
│   │   ├── routes/           ← API endpoints
│   │   │   ├── auth.ts       ← /api/auth/register, /api/auth/login
│   │   │   ├── skills.ts     ← /api/skills
│   │   │   ├── users.ts      ← /api/users (directory)
│   │   │   ├── sessions.ts   ← /api/sessions
│   │   │   ├── wallet.ts     ← /api/wallet
│   │   │   └── notifications.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts       ← JWT middleware
│   │   │   └── validate.ts   ← Input validation middleware
│   │   └── index.ts          ← Main server entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  ← MongoDB URI + JWT Secret
│
└── frontend/                 ← React + TypeScript + Tailwind CSS
    ├── src/
    │   ├── components/       ← Reusable components
    │   ├── pages/            ← All 8 screens
    │   │   ├── Register.tsx
    │   │   ├── Login.tsx
    │   │   ├── SkillProfile.tsx
    │   │   ├── UserDirectory.tsx
    │   │   ├── SwapProposal.tsx
    │   │   ├── BookSession.tsx
    │   │   ├── Wallet.tsx
    │   │   └── Dashboard.tsx
    │   ├── api/              ← Axios API calls
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── tailwind.config.js
```
