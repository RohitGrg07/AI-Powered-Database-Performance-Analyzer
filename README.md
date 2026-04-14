# AI-Powered Database Performance Analyzer

A small full-stack app to analyze SQL query performance using **Postgres/TimescaleDB**.

- **Frontend**: React + Vite 
- **Backend**: Express + `pg` 
- **DB**: TimescaleDB (Postgres 14) via Docker 

## Prerequisites

- **Node.js** 18+ 
- **Docker Desktop**

## Quick start

### 1) Start the database (Docker)

From the project root:

|-----powershell------|
docker compose up -d
|---------------------|

This repo mounts `db/init.sql` into `/docker-entrypoint-initdb.d/` so the schema is created automatically on first run.

### 2) Start the backend API

|--------------------------powershell-------------------------------------|

cd .\backend
npm install
$env:DATABASE_URL='postgres://postgres:postgres@localhost:5432/analyzer'
npm run dev
|-------------------------------------------------------------------------|

Backend will listen on `http://localhost:5000`.

### 3) Start the frontend

Open a new terminal:

|--------------------------powershell-------------------------------------|

cd .\frontend
npm install
npm run dev
|-------------------------------------------------------------------------|

Open `http://localhost:5173`.

## How it works

- The UI sends your SQL to the backend: `POST /api/analyze`
- For `SELECT/WITH/INSERT/UPDATE/DELETE`, the backend runs `EXPLAIN ANALYZE <query>` and returns the plan text.
- For DDL (like `CREATE TABLE`), the backend executes it normally.
- Query stats come from `pg_stat_statements` at `GET /api/stats`

## Test queries (copy/paste)

### A) Fast sanity check

```sql
SELECT now()
```

### B) Show an execution plan

```sql
SELECT generate_series(1, 100000)
```

### C) Index demo (good for screenshots)

1) Create table:


CREATE TABLE IF NOT EXISTS demo_users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)


2) Insert data:

INSERT INTO demo_users(email, created_at)
SELECT
  'user' || g || '@example.com',
  now() - (random() * interval '30 days')
FROM generate_series(1, 200000) g
```

3) Run query (before index):

SELECT *
FROM demo_users
WHERE created_at >= now() - interval '1 day'
ORDER BY created_at DESC
LIMIT 2000
```

4) Add index:

CREATE INDEX IF NOT EXISTS idx_demo_users_created_at
ON demo_users (created_at);
```

5) Run the same query again (after index) and compare execution time.


### Docker image pull fails

If you see errors pulling `timescale/timescaledb`, confirm Docker Desktop is running and your network/DNS is working.

### DB schema didn’t initialize

The init script runs only on first DB creation. To reset:

```powershell
docker compose down -v
docker compose up -d
```
**SCREENSHOTS-**
<img width="1920" height="1080" alt="Screenshot (99)" src="https://github.com/user-attachments/assets/a559ba6a-e371-4512-9631-b4bab14e83aa" />
<img width="1920" height="1080" alt="Screenshot (101)" src="https://github.com/user-attachments/assets/1fc4f0fb-c998-4d2e-9f10-2d73835258f7" />
<img width="1920" height="1080" alt="Screenshot (102)" src="https://github.com/user-attachments/assets/733714be-211e-4830-8153-503bb6eacf47" />
<img width="1920" height="1080" alt="Screenshot (103)" src="https://github.com/user-attachments/assets/f7cc9341-c03d-41ab-974b-905b2db9e516" />
<img width="1920" height="1080" alt="Screenshot (100)" src="https://github.com/user-attachments/assets/393f240f-0028-46f6-bed2-4888588440de" />
