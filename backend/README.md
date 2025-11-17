# Job Tracker Backend (Axum + MongoDB)

This is a small example backend (Rust + Axum) that uses MongoDB to store job applications.

Quick run (PowerShell)

```powershell
# from the repo
cd 'c:\Users\jaybe_pisaqql\OneDrive\Desktop\Pr\Job Tracker\backend'

# optionally set your MongoDB URI (defaults to mongodb://localhost:27017)
$env:MONGO_URI = 'mongodb://localhost:27017'

# build and run
cargo run
```

API examples

Create a new job (POST /jobs)

```bash
curl -X POST http://127.0.0.1:3000/jobs \
  -H 'Content-Type: application/json' \
  -d '{"title":"Frontend Intern","company":"Acme","notes":"Applied via site"}'
```

Get all jobs (GET /jobs)

```bash
curl http://127.0.0.1:3000/jobs
```

Get a job by id (GET /jobs/:id)

```bash
curl http://127.0.0.1:3000/jobs/1690000000
```

Delete (soft-delete) a job (DELETE /jobs/:id)

```bash
curl -X DELETE http://127.0.0.1:3000/jobs/1690000000
```

Notes

- The example uses a simple timestamp-based numeric `id` for brevity. For production, prefer `ObjectId` or UUIDs.
- Ensure MongoDB is running locally or set `MONGO_URI` to a reachable instance.
Job Tracker Backend (Axum + MongoDB)

This is a small, educational backend scaffold for tracking job applications.
It uses Axum for HTTP, MongoDB for storage, and Tokio as the async runtime.

Quick start (PowerShell):

1) Install Rust toolchain (if you don't have it):
   https://rustup.rs

2) From the repository root, change into the backend folder:

```powershell
cd .\backend
```

3) Set the MongoDB connection URI (optional, defaults to mongodb://localhost:27017):

```powershell
$env:MONGO_URI = "mongodb://localhost:27017"
```

4) Run the server:

```powershell
cargo run
```

The server listens on http://127.0.0.1:3000 by default.

API (simple):
- GET  /               -> health
- GET  /jobs           -> list jobs
- POST /jobs           -> create job (JSON body CreateJobDto)
- GET  /jobs/:id       -> get a single job
- PUT  /jobs/:id       -> update a job
- DELETE /jobs/:id     -> soft-delete a job

Notes & learning tips:
- IDs are naive (timestamp-based) to keep serialization simple for a beginner project.
- In production consider using ObjectId or UUID and adding proper validation.
- This scaffold focuses on readability and clarity rather than robust production practices.

Next steps (frontend):
- Create a Vite React app under /frontend and connect to these endpoints.
- Use Ant Design components for a nice UI.
