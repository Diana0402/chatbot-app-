# TrendWear Assist

A responsive fashion customer-support web app built with Next.js, TypeScript, Tailwind CSS, Prisma and Railway PostgreSQL.

## Features
- Customer chat with sample catalogue-based assistant responses (Mock AI)
- Persistent chat sessions and messages in PostgreSQL
- Product catalogue and product guidance
- Size, material and garment-care guidance
- System prompt presets
- Temperature and Top-P controls
- Responsive desktop and mobile layout

## Deploy to Railway
1. Connect this GitHub repository to a Railway service.
2. Add a Railway PostgreSQL service.
3. In the app service, set `DATABASE_URL` to `${{Postgres.DATABASE_URL}}`.
4. Railway runs `npm run build`; start command runs migrations and Next.js.
5. Generate a public domain in Settings → Networking.

## Local development (optional)
Requires Node.js and a PostgreSQL database.
1. `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. `npx prisma migrate deploy`
4. `npm run db:seed`
5. `npm run dev`

The included catalogue is sample data for the assignment and should be replaced with the official product CSV if supplied.
