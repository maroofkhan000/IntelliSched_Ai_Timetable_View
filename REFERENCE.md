# IntelliSched View Site: Reference

Quick lookup for ports, settings, API routes, data and design. To run the site, see `README.md`.

## Ports

| Service | Port |
|---|---|
| Main app backend | 4000 |
| View backend | 4100 |
| View frontend | 5180 |

## Settings (`backend/.env`)

| Name | Required | Meaning |
|---|---|---|
| `MONGODB_URI` | Yes | The view site's own cluster. |
| `MONGODB_DB` | No | Database name. Default `intellisched_view`. |
| `MAIN_API_URL` | Yes | Main backend address, without `/api`. |
| `MAIN_API_KEY` | Yes | Must equal `TIMETABLE_API_KEY` in the main backend's `.env`. |
| `MASTER_ID` | Yes | ID for the master account, which is also the admin. |
| `MASTER_PASSWORD` | Yes | Its password, at least 10 characters. Keep it long and random. Restart after changing. |
| `SYNC_MINUTES` | No | Minutes between sync attempts. Default 5. |
| `PORT` | No | Default 4100. Not used on Vercel. |

## API

### Main app (`ProjectSection/backend/src/server.js`)

Both routes need the header `x-api-key: <TIMETABLE_API_KEY>`. A missing or wrong key gets `401`.

| Route | Returns |
|---|---|
| `GET /api/public/timetables` | `[{ id, name, generatedAt }]` |
| `GET /api/public/timetables/:id` | `{ id, name, generatedAt, scope, days, periods, entries }`, or `404` |

### View site (`backend/src/server.js`)

Signed-in routes need the header `Authorization: Bearer <token>`. Without a valid token they answer `401`. Account routes answer `403` to anyone but the master account.

| Route | Who | Returns |
|---|---|---|
| `POST /api/auth/sign-in` | Anyone | Body `{ role, id, password }`, where `role` is `student`, `teacher` or `master`. `{ token, role, id, target }`, `401` if wrong, or `429` while locked. |
| `POST /api/auth/sign-out` | Anyone | Ends the session in the header. `{ ok: true }`. |
| `GET /api/timetables` | Signed in | `{ timetables: [{ id, name, generatedAt }], syncFailed }`. Students and teachers only get timetables they appear on. May sync first. |
| `GET /api/timetables/:id` | Signed in | The saved copy, with only that person's entries unless it's the master account, or `404`. |
| `GET /api/accounts` | Master | `{ accounts: [{ id, role, target, createdAt }], sections, teachers }`. |
| `POST /api/accounts` | Master | Students: body `{ role, id, password }`. Teachers: body `{ role, target, password }`, where `target` is the Teacher ID and the login. `201`, `400` if invalid, or `409` if it exists. |
| `GET /api/auth/sections` | Signed in | `{ sections }`, for a student's first sign-in. |
| `POST /api/auth/section` | Student | Body `{ section }`. Saves it, once. `{ target }`, `400` if unknown, or `409` if already set. |
| `PATCH /api/accounts/:role/:id` | Master | Body `{ password }`. Resets the password and ends that person's sessions. |
| `DELETE /api/accounts/:role/:id` | Master | Deletes the account and ends that person's sessions. |

Login IDs are 3 to 32 letters, digits or hyphens, and aren't case sensitive. Passwords are 8 to 128 characters.

## Data

```json
{
  "id": "4ece03a7-...",
  "name": "My first database",
  "generatedAt": "2026-10-16T04:26:33.885Z",
  "scope": { "term": "all", "branch": "" },
  "days": ["Monday", "Tuesday"],
  "periods": [
    { "period": 4, "start": "11:30", "end": "12:20", "break": { "start": "12:20", "end": "12:40", "minutes": 20 } }
  ],
  "entries": [
    { "SectionID": "CE-Y1S1-A", "Day": "Monday", "Period": 1, "SubjectCode": "CE102", "SubjectName": "Civil Engineering Drawing", "Type": "Lab", "TeacherID": "TT0021", "TeacherName": "Dr. Ayesha Jahan Warsi", "RoomID": "B013" }
  ]
}
```

- Periods count from 1.
- Each entry covers one period.
- The second period of a lab has `"cont": true`.
- `break` is `null` when no break follows that period. Breaks are only sent when the main app's timing mode is automatic.
- Teacher IDs start with `TT` (theory) or `TL` (lab), and come from the main app.

## Design

The look follows `docs/ui-reference.jpeg`, without its sign-in options and admin pages (decision V7).

| Token | Value | Use |
|---|---|---|
| `--green` | `#0b5d4e` | Buttons, logo, active items |
| `--green-deep` | `#074438` | Headings, button gradient |
| `--accent` | `#1f9d7a` | Highlighted headline word, focus ring |
| `--mint` | `#e2f3ec` | Active backgrounds, banner, background shapes |
| `--page` | `#f6fbf8` | Page background |
| `--ink` | `#12302a` | Text |
| `--muted` | `#5a716b` | Secondary text |

- **Font:** Plus Jakarta Sans.
- **Subject colours:** six pastels, `tone-0` to `tone-5`. `toneOf` picks one from the subject code, so a subject keeps its colour across pages.
- **Download:** Download PDF on the Timetable page saves a landscape table of the week, named after the section or teacher.

## Related documents

- `DECISIONS.md`: why it's built this way
- `ARCHITECTURE.md`: the parts and how they connect
- `FLOW.md`: how data and visitors move through the site
- `ProjectSection/DECISIONS.md`: the main app's decisions
