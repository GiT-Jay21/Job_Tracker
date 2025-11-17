# Job Tracker Frontend (Vite + React + Ant Design)

This is a minimal Vite + React + TypeScript frontend scaffold for the Job Tracker project.

Install dependencies

```powershell
cd 'c:\Users\jaybe_pisaqql\OneDrive\Desktop\Pr\Job Tracker\frontend'
npm install
# or to add axios and antd explicitly (if you started from a blank template):
npm install axios antd
```

Run the dev server

```powershell
npm run dev
```

Proxy note

The `vite.config.ts` file contains a `server.proxy` entry that forwards any request starting
with `/api` to `http://localhost:3000` and strips the `/api` prefix. Example:
- Browser request: `/api/jobs`
- Vite proxy forwards to: `http://localhost:3000/jobs`

This avoids CORS during development because the browser communicates with the Vite dev server origin,
and Vite forwards the request to your backend.
