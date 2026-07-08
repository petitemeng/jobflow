# JobFlow — Personal Job Tracker

A full-stack job application tracker built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Tech Stack

- **Frontend**: React + TypeScript, Vite
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL
- **Cloud**: Render (Web Service + managed PostgreSQL) — see deployment section
- **CI/CD**: GitHub Actions (auto-deploy on push to `main`)

## Live Demo

[jobflow-vicw.onrender.com](https://jobflow-vicw.onrender.com)

## Features

- Add, edit, delete job applications
- Track status: Saved → Applied → Interview → Offer / Rejected
- Stats dashboard (total, applied, interviews, offers)
- Filter by status
- Notes per application

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

### Backend

```
cd backend
npm install
DATABASE_URL=postgresql://localhost:5432/jobflow node server.js
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>

## API Endpoints

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | /api/jobs     | List all jobs      |
| POST   | /api/jobs     | Create a job       |
| PATCH  | /api/jobs/:id | Update a job       |
| DELETE | /api/jobs/:id | Delete a job       |
| GET    | /api/stats    | Get pipeline stats |

## Deployment (Render)

1. Push the repo to GitHub and connect it to [Render](https://render.com)
2. Create a **PostgreSQL** instance on Render (free tier) and copy its internal `DATABASE_URL`
3. Create a **Web Service**, pointing to the `backend` directory
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - Add the `DATABASE_URL` environment variable from step 2
4. Build the frontend (`npm run build` in `frontend`) and either:
   - Deploy it as a separate Render Static Site, or
   - Serve the built files directly from the Express backend
5. Render automatically redeploys on every push to `main` via the connected GitHub repo

## GitHub Actions CI/CD

See `.github/workflows/deploy.yml` — runs tests and triggers deployment on push to `main`.
