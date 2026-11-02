# IntelliSched AI (view site)

A read-only website where students and teachers look up their timetable. Students choose their section and teachers enter their Teacher ID; there are no accounts or passwords.

More detail: [DECISIONS.md](DECISIONS.md), [ARCHITECTURE.md](ARCHITECTURE.md), [FLOW.md](FLOW.md) and [REFERENCE.md](REFERENCE.md).

```text
IntelliSched backend (ProjectSection)
        |  GET /api/public/timetables, with the API key
        v
View backend (this folder, port 4100)  <-->  its own MongoDB copy
        |  GET /api/timetables
        v
View frontend (port 5180)
```

The view backend refreshes its copy when a visitor arrives and the copy is older than
`SYNC_MINUTES`. It never connects to the main app's database. If the main API is down,
visitors still get the last saved copy.

## Run it

Start the main IntelliSched backend first, so it has the new endpoints, then:

```powershell
cd backend; npm install; npm run dev     # first terminal
cd frontend; npm install; npm run dev    # second terminal
```

Open http://localhost:5180.

## Settings

`backend/.env` is not committed; `backend/.env.example` lists what it needs.
`MAIN_API_KEY` here must equal `TIMETABLE_API_KEY` in the main backend's `.env`.

## Deploy

Deploy this folder as its own Vercel project, and set every value from `backend/.env` in its
environment variables, with `MAIN_API_URL` set to the deployed main app. The main app's Vercel
project needs `TIMETABLE_API_KEY` too. MongoDB Atlas must allow connections from Vercel.
