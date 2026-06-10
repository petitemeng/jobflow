import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
const { Pool } = pg;

app.use(cors({
  origin: '*'
}));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/jobflow'
});

// Init DB
await pool.query(`
  CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    url TEXT,
    location VARCHAR(255),
    salary VARCHAR(100),
    status VARCHAR(50) DEFAULT 'saved',
    notes TEXT,
    applied_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`);

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
  res.json(result.rows);
});

// GET single job
app.get('/api/jobs/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// POST create job
app.post('/api/jobs', async (req, res) => {
  const { company, role, url, location, salary, status, notes, applied_date } = req.body;
  const result = await pool.query(
    `INSERT INTO jobs (company, role, url, location, salary, status, notes, applied_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [company, role, url, location, salary, status || 'saved', notes, applied_date]
  );
  res.status(201).json(result.rows[0]);
});

// PATCH update job
app.patch('/api/jobs/:id', async (req, res) => {
  const { company, role, url, location, salary, status, notes, applied_date } = req.body;
  const result = await pool.query(
    `UPDATE jobs SET
      company = COALESCE($1, company),
      role = COALESCE($2, role),
      url = COALESCE($3, url),
      location = COALESCE($4, location),
      salary = COALESCE($5, salary),
      status = COALESCE($6, status),
      notes = COALESCE($7, notes),
      applied_date = COALESCE($8, applied_date),
      updated_at = NOW()
     WHERE id = $9 RETURNING *`,
    [company, role, url, location, salary, status, notes, applied_date, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
  await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

// GET stats
app.get('/api/stats', async (req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'applied') as applied,
      COUNT(*) FILTER (WHERE status = 'interview') as interviews,
      COUNT(*) FILTER (WHERE status = 'offer') as offers,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected
    FROM jobs
  `);
  res.json(result.rows[0]);
});

app.listen(3001, () => console.log('JobFlow API running on http://localhost:3001'));
