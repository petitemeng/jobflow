# JobFlow — Personal Job Tracker

A full-stack job application tracker built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Tech Stack
- **Frontend**: React + TypeScript, Vite
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL
- **Cloud**: AWS (EC2 + RDS) — see deployment section
- **CI/CD**: GitHub Actions

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
```bash
cd backend
npm install
DATABASE_URL=postgresql://localhost:5432/jobflow node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List all jobs |
| POST | /api/jobs | Create a job |
| PATCH | /api/jobs/:id | Update a job |
| DELETE | /api/jobs/:id | Delete a job |
| GET | /api/stats | Get pipeline stats |

## Deployment (AWS)

1. Launch EC2 instance (t2.micro free tier)
2. Create RDS PostgreSQL instance
3. Set `DATABASE_URL` environment variable
4. Use PM2 to keep Node server running
5. Deploy frontend build to S3 or serve via Nginx

## GitHub Actions CI/CD

See `.github/workflows/deploy.yml` — runs tests and deploys on push to main.
