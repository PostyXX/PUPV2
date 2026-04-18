# PUP Backend (Node + Express + Prisma + MySQL)

## Prerequisites
- Node.js 18+
- MySQL (Workbench ok) and a database e.g. `pup_db`

## Setup
1. Copy `.env.sample` to `.env` and edit `DATABASE_URL`, `PORT`, `JWT_SECRET`.
2. Install deps:
```
npm install
```
3. Generate Prisma client and run migrations:
```
npx prisma generate
npx prisma migrate dev --name init
```
4. (Optional) Seed sample data:
```
npm run seed
```
5. Start dev server:
```
npm run dev
```

Server runs at `http://127.0.0.1:4000`

## API Notes
- Auth: POST /auth/register, POST /auth/login -> returns JWT
- Use `Authorization: Bearer <token>` for protected routes
- Pets:
  - GET /pets (user -> my pets)
  - POST /pets (user)
  - POST /pets/link/by-petid (hospital/admin)
- Appointments: GET /appointments, POST /appointments, PATCH /appointments/:id/status
- Vaccinations: GET /vaccinations, POST /vaccinations
- Medical Records: GET /medical-records, POST /medical-records (hospital/admin)
