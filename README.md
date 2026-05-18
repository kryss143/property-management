# Property Management System

A full-stack property management MVP for landlords, property managers, and tenants. It uses React, Vite, TypeScript, Tailwind CSS, Express, and Supabase.

## Features

- Supabase authentication with role-aware protected routes
- Mobile-first dashboard with summary metrics, activity, and charts
- Properties and unit management
- Tenant and lease tracking
- Rent/payment status tracking
- Maintenance requests with priority and status workflows
- Export-friendly reports
- Shared TypeScript types across frontend and backend

## Project Structure

```text
frontend/   React + Vite + TypeScript + Tailwind
backend/    Express + TypeScript + Supabase API routes
shared/     Shared domain types
supabase/   SQL schema and seed data
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

3. Create a Supabase project, then run:

```text
supabase/schema.sql
supabase/seed.sql
```

4. Start both apps:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:4000`.

## Environment

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:4000/api
```

Backend:

```env
PORT=4000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FRONTEND_ORIGIN=http://localhost:5173
```

Use `SUPABASE_SERVICE_ROLE_KEY` only on the server. Never expose it to the browser.
