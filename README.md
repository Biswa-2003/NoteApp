# Notes App

A small full-stack notes app: create, list, edit, and delete notes.

| Part     | Tech                                          |
| -------- | --------------------------------------------- |
| Frontend | React 19 + Vite 8 (JavaScript), plain CSS     |
| Backend  | Node.js + Express 5 (JavaScript, ES modules)  |
| Database | PostgreSQL + Prisma 7                         |

```
notes-app/
  backend/    Express API + Prisma
  frontend/   React app
  README.md
```

## Prerequisites

- Node.js 20.19 or newer (`node -v`)
- PostgreSQL 14 or newer, running locally or remotely

## 1. Backend setup

```bash
cd backend
npm install
```

`npm install` also runs `prisma generate`, which creates the database client.

Create your environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

| Variable       | Description                                          | Example                                                   |
| -------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `PORT`         | Port the API listens on                              | `4000`                                                    |
| `DATABASE_URL` | PostgreSQL connection string                         | `postgresql://postgres:mypassword@localhost:5432/notes_app` |
| `CORS_ORIGIN`  | Frontend URL(s) allowed to call the API (comma-separated) | `http://localhost:5173`                              |

> If your database password contains special characters such as `@`, `#` or `/`,
> URL-encode them in `DATABASE_URL` (for example `@` becomes `%40`).

Create the database table (this also creates the `notes_app` database if it does not exist):

```bash
npm run db:migrate
```

Start the API:

```bash
npm run dev     # development, restarts on file changes
npm start       # production
```

Check it works:

```bash
curl http://localhost:4000/health
# {"status":"ok"}
```

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

| Variable       | Description                          | Example                 |
| -------------- | ------------------------------------ | ----------------------- |
| `VITE_API_URL` | Base URL of the backend (no trailing slash) | `http://localhost:4000` |

Start the app:

```bash
npm run dev
```

Open http://localhost:5173.

> On Windows, `cp` works in Git Bash and PowerShell. In Command Prompt use `copy .env.example .env`.

## API reference

| Method | Path             | Body                   | Success                      | Errors   |
| ------ | ---------------- | ---------------------- | ---------------------------- | -------- |
| GET    | `/health`        | –                      | `200 { "status": "ok" }`     | –        |
| GET    | `/api/notes`     | –                      | `200` array, newest first    | –        |
| POST   | `/api/notes`     | `{ title, content }`   | `201` created note           | 400      |
| PUT    | `/api/notes/:id` | `{ title, content }`   | `200` updated note           | 400, 404 |
| DELETE | `/api/notes/:id` | –                      | `204` no content             | 404      |

Errors are always JSON: `{ "error": "message" }`.
`title` and `content` must be non-empty strings.

### Example requests

> In Windows PowerShell, type `curl.exe` instead of `curl`.

```bash
# List notes
curl http://localhost:4000/api/notes

# Create a note
curl -X POST http://localhost:4000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My note","content":"Some text"}'

# Update a note
curl -X PUT http://localhost:4000/api/notes/<NOTE_ID> \
  -H "Content-Type: application/json" \
  -d '{"title":"Edited","content":"New text"}'

# Delete a note
curl -i -X DELETE http://localhost:4000/api/notes/<NOTE_ID>
```

## Scripts

**backend/**

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the API and restart on file changes            |
| `npm start`          | Start the API                                        |
| `npm run db:migrate` | Create/apply migrations in development               |
| `npm run db:deploy`  | Apply existing migrations in production              |

**frontend/**

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the dev server                          |
| `npm run build`   | Build static files into `frontend/dist/`      |
| `npm run preview` | Preview the production build locally          |

## Deploying (overview)

The app is configured only through environment variables, so nothing in the code needs to change between local and AWS.

- **Database (RDS):** create a PostgreSQL instance and set `DATABASE_URL` on the server to point to it.
- **Backend (EC2):** copy `backend/`, then run `npm install`, `npm run db:deploy`, and `npm start` (ideally under a process manager such as pm2 or systemd). Set `PORT`, `DATABASE_URL`, and `CORS_ORIGIN` (your CloudFront URL).
- **Frontend (S3 + CloudFront):** set `VITE_API_URL` to the public backend URL **before** building, run `npm run build`, and upload the contents of `frontend/dist/` to the S3 bucket.

> `VITE_API_URL` is baked into the files at build time. If the API URL changes, rebuild and re-upload the frontend.

## Project structure

```
backend/
  prisma/
    schema.prisma          Note model
    migrations/            SQL migrations (commit these)
  prisma.config.js         Prisma CLI config (reads DATABASE_URL)
  src/
    server.js              Reads PORT and starts the server
    app.js                 Express app: CORS, JSON, routes, error handling
    db.js                  Shared Prisma client
    routes/notes.js        /api/notes routes + validation
    middleware/errorHandler.js   Central error handler (no stack traces)

frontend/
  index.html
  vite.config.js
  src/
    main.jsx               React entry point
    App.jsx                Loads notes; loading/empty/error states
    api.js                 All API calls (uses VITE_API_URL)
    index.css              Styles
    components/
      NoteForm.jsx         Add-note form
      NoteCard.jsx         Note card with inline edit and delete
```
