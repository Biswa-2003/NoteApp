# Notes App – Project Summary

This document records what was built, the decisions made along the way, and the current state of the project.

**Date:** 14 November 2026
**Location:** `E:\NoteAPP\notes-app`

---

## 1. What the app does

A simple full-stack notes app:

- Add a note (title + content)
- See all notes as cards, newest first
- Edit a note inline (Save / Cancel)
- Delete a note (with a confirmation)
- Loading, empty, and error states

No login and no extra features, as requested.

---

## 2. Tech stack (versions installed)

| Part     | Technology                          | Version |
| -------- | ----------------------------------- | ------- |
| Frontend | React                               | 19.3.1  |
|          | Vite                                | 8.3.8   |
|          | Styling                             | Plain CSS |
| Backend  | Node.js                             | 22.12.0 |
|          | Express                             | 5.3.0   |
|          | Prisma (ORM)                        | 7.10.1  |
|          | @prisma/adapter-pg + pg (driver)    | 7.10.1 / 8.23.1 |
| Database | PostgreSQL                          | 16.11   |

---

## 3. Work completed, phase by phase

### Phase 1 – Backend ✅

- Created an Express API in `backend/` using ES modules.
- Defined the `Note` table in Prisma and ran the first migration (`init`).
- Built all routes:

| Method | Path             | Result                         |
| ------ | ---------------- | ------------------------------ |
| GET    | `/health`        | `{ "status": "ok" }`           |
| GET    | `/api/notes`     | All notes, newest first        |
| POST   | `/api/notes`     | Creates a note (201)           |
| PUT    | `/api/notes/:id` | Updates a note (200)           |
| DELETE | `/api/notes/:id` | Deletes a note (204)           |

- **Validation:** title and content must be non-empty strings, otherwise 400 with a clear message.
- **Not found:** an unknown id returns 404 `"Note not found"`.
- **Errors:** one central error handler; bad JSON gets a 400, anything unexpected gets a 500 `"Internal server error"`. Stack traces are never sent to the client.
- **Tested with curl:** every route plus every error case. All returned the expected result.

### Phase 2 – Frontend ✅

- Built a React + Vite app in `frontend/`.
- All API calls go through one file (`src/api.js`) that reads `VITE_API_URL`.
- Checked that the production build works and that the backend accepts requests from the frontend (CORS) and rejects other sites.

### Phase 3 – README ✅

- `README.md` covers setup and run steps for both folders, the API reference, curl examples, scripts, and an AWS deployment overview.

### Extra – UI redesign ✅

Done in two rounds after the first version:

1. **3D look:** tilting cards and raised buttons.
2. **Modern redesign** (current version):
   - Dark theme with soft color glows; switches to light theme automatically in light mode
   - Frosted-glass cards with a colored accent line
   - Inter font, logo, and note count in the header
   - Edit / Delete as icon buttons that appear on hover
   - Friendly dates ("5 minutes ago", "Edited yesterday")
   - Shimmering placeholder cards while loading, and a clear empty state
   - Gentle 3D tilt with a light sheen that follows the mouse
   - Animations turn off for users who prefer reduced motion

---

## 4. Database

| Setting  | Value                                  |
| -------- | -------------------------------------- |
| Server   | Local PostgreSQL 16, `localhost:5432`  |
| Database | `notes_app`                            |
| User     | `postgres`                             |
| Password | Stored in `backend/.env` (not in this document) |

The database was created automatically by Prisma when the migration ran. It appears in pgAdmin under **Servers → PostgreSQL 16 → Databases** (right-click **Databases → Refresh** if it is not shown).

**Tables:**

- `Note`: `id`, `title`, `content`, `createdAt`, `updatedAt`
- `_prisma_migrations`: Prisma's migration history (do not edit)

To query notes in pgAdmin, quote the table name because of the capital N:

```sql
SELECT * FROM "Note";
```

---

## 5. Configuration (environment variables)

Nothing is hardcoded. All settings come from `.env` files, which are ignored by git. Each folder has a `.env.example` to copy from.

| File            | Variable       | Purpose                                   |
| --------------- | -------------- | ----------------------------------------- |
| `backend/.env`  | `PORT`         | Port the API listens on (4000)            |
|                 | `DATABASE_URL` | PostgreSQL connection string              |
|                 | `CORS_ORIGIN`  | Frontend URL allowed to call the API      |
| `frontend/.env` | `VITE_API_URL` | Base URL of the backend                   |

---

## 6. How to run

Make sure PostgreSQL is running, then open two terminals:

```bash
# Terminal 1 – backend (http://localhost:4000)
cd E:\NoteAPP\notes-app\backend
npm run dev

# Terminal 2 – frontend (http://localhost:5173)
cd E:\NoteAPP\notes-app\frontend
npm run dev
```

Open **http://localhost:5173** in the browser.

---

## 7. Files

```
notes-app/
  README.md                     Setup and run guide
  PROJECT_SUMMARY.md            This document

  backend/
    .env / .env.example         Settings (.env is private)
    package.json                Scripts: dev, start, db:migrate, db:deploy
    prisma.config.js            Prisma settings (reads DATABASE_URL)
    prisma/schema.prisma        Note model
    prisma/migrations/          SQL migration (init)
    src/server.js               Starts the server on PORT
    src/app.js                  Express app, CORS, routes, 404
    src/db.js                   Shared database client
    src/routes/notes.js         Note routes + validation
    src/middleware/errorHandler.js   Central error handler

  frontend/
    .env / .env.example         Settings (.env is private)
    index.html                  Page shell, loads Inter font
    vite.config.js              Vite settings
    src/main.jsx                React entry point
    src/App.jsx                 Page layout, loading/empty/error states
    src/api.js                  All calls to the backend
    src/index.css               All styling
    src/components/NoteForm.jsx Add-note form
    src/components/NoteCard.jsx Note card with edit/delete
    src/components/Icons.jsx    Small built-in icons
```

---

## 8. Decisions and issues along the way

| Issue | What was done |
| ----- | ------------- |
| npm's "latest" Prisma was a release candidate (8.0.0-rc) | Used the latest stable release, 7.10.1 |
| Prisma 7's new generator only outputs TypeScript | Used the `prisma-client-js` generator, which outputs plain JavaScript |
| `npm install` would fail on a server without `.env` | Prisma config reads `DATABASE_URL` directly, so install works without it |
| `prisma` is needed on the server for migrations | Moved `prisma` to normal dependencies |
| Database password | `admin@123` was rejected; the working password is `admin123` |
| The Vite project generator created a TypeScript project instead of React | Wrote the React files by hand |
| `E:\NoteAPP` is not a git repository | `.gitignore` files are ready; run `git init` in `notes-app` when needed |

---

## 9. Suggested next steps

- **Change the database password** if this PostgreSQL is used for anything beyond local development; it was shared in chat.
- **Start version control:** run `git init` inside `notes-app` and make a first commit. The `.env` files will be ignored automatically.
- **Deploy to AWS** (see README): RDS for the database, EC2 for the backend, and S3 + CloudFront for the frontend. Remember to set `VITE_API_URL` before running `npm run build`.
