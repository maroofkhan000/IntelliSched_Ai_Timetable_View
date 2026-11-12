# IntelliSched View Site: Architecture

A sign-in website for students and teachers to read their timetable. It gets timetables from the main IntelliSched app (`ProjectSection`) and never changes anything there. The reasons behind this design are in `DECISIONS.md`.

---

## 1. Principles

1. **Reading only.** Nothing on this site can change a timetable. Generating stays in the main app. The only data written here is accounts and sign-ins.
2. **One way in.** Data comes only through the main app's API, never from its database.
3. **Works alone.** Visitors are served from this site's own copy, so a main app outage doesn't take the site down.
4. **Least data.** The feed carries only what's needed to show a timetable.

## 2. Components

```mermaid
flowchart TB
    subgraph Main["Main app: ProjectSection"]
        Admin["Admin generates and saves a timetable"]
        MainAPI["Express API<br/>/api/public/timetables<br/>x-api-key"]
        MainDB[("MongoDB<br/>cluster0.miwfpdb")]
        Admin --> MainAPI
        MainAPI <--> MainDB
    end

    subgraph View["View site: ProjectViewSection"]
        Sync["sync.js<br/>refreshes the copy"]
        ViewAPI["Express API<br/>/api/timetables"]
        ViewDB[("MongoDB<br/>cluster0.dz6a5rj<br/>intellisched_view")]
        UI["React site<br/>home, sign-in, dashboard, timetable"]
        ViewAPI --> Sync
        Sync <--> ViewDB
        ViewAPI <--> ViewDB
        UI -->|same origin /api| ViewAPI
    end

    Sync -->|HTTPS with API key| MainAPI
    Student(["Students and teachers"]) --> UI
```

## 3. Backend (`backend/src`)

| File | Job |
|---|---|
| `server.js` | Checks settings at startup, serves the sign-in, timetable and account routes, handles errors. |
| `auth.js` | Password hashing, sessions, the sign-in checks on routes, and the lock after repeated wrong passwords. |
| `sync.js` | Decides when the copy is stale, downloads changes from the main API, removes timetables the main app no longer has, records the result. |
| `db.js` | Connects to MongoDB, with a retry through public DNS for home routers that fail the SRV lookup. |

### Collections

| Collection | Contents |
|---|---|
| `timetables` | One document per timetable. `_id` is the main app's database id. Holds `name`, `generatedAt`, `scope`, `days`, `periods`, `entries`. |
| `meta` | One document, `_id: "sync"`: `attemptedAt`, `syncedAt`, `failed`. |
| `accounts` | One document per login. `_id` is `role:ID`. Holds `role`, `loginId`, `target` (Teacher ID, or the student's section, empty until they choose), `passwordHash`, `createdAt`. |
| `sessions` | One document per sign-in. `_id` is the hash of the token. Removed automatically at `expiresAt`. |
| `attempts` | Wrong-password counts per ID. Removed automatically at `expiresAt`. |

## 4. Frontend (`frontend/src`)

| File | Job |
|---|---|
| `App.jsx` | Hash routing, loading data, the remembered sign-in, the clock tick. |
| `api.js` | Calls the backend with the sign-in token. |
| `timetable.js` | Pure logic: choices, joining lab periods into blocks, current and next class, stats, subject colours. |
| `download.js` | Builds the timetable PDF. |
| `pages/Landing.jsx` | Home page. |
| `pages/Access.jsx` | Role choice, the Student, Teacher and master sign-in, and a student's first section choice. |
| `pages/Portal.jsx` | Sidebar, dashboard, class view and list view. |
| `pages/Accounts.jsx` | Master account only: create, reset and delete logins. |
| `pages/Shared.jsx` | Logo, background shapes, loading and error states. |
| `Icons.jsx` | Inline icons. |
| `styles.css` | Colour tokens, layouts, phone and print rules. |

### Screens

| Route | Screen |
|---|---|
| `#/` | Home |
| `#/role` | Choose your role |
| `#/sign-in/student`, `#/sign-in/teacher`, `#/sign-in/master` | Sign in |
| `#/dashboard` | Stats, current or next class, today's classes, small week grid |
| `#/timetable` | Class view (week grid), list view (one day) and PDF download |
| `#/accounts` | Master account only: the logins for students and teachers |

## 5. Security

- `MAIN_API_KEY` stays on the view backend and is never sent to the browser.
- The main app's feed rejects requests without the matching key.
- `/api/timetables` needs a sign-in token. Students and teachers receive only their own classes, filtered on the server (decision V11).
- `/api/accounts` is for the master account only, also checked on the server.
- Passwords are stored as salted scrypt hashes, and sessions as hashes of their tokens. Five wrong passwords lock an ID for 15 minutes.
- MongoDB, API and master account credentials live only in `backend/.env`, which is git-ignored.

## 6. Deployment

Same shape as the main app: one Vercel project using `vercel.json`, with `/api/*` going to the Express backend and everything else to the React build. In development, Vite on port 5180 proxies `/api` to port 4100. The main app's backend must also be deployed with `TIMETABLE_API_KEY`.
