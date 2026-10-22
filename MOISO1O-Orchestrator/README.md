# MOISO1 Orchestrator

The project is split into two applications:

- `backoffice/` - React + TypeScript frontend (Vite)
- `backend/` - Node.js + Express API

## Run locally

Open two terminals:

```sh
cd backend
npm install
npm run dev
```

```sh
cd backoffice
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the
backend at `http://localhost:3000`. Check the backend with
`http://localhost:3000/api/health`.
