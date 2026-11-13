# IntelliSched View Site: Decision Log

Every significant design decision made on the view site, in the order it was made: what was decided, why, and what it costs. The main app's own decisions are in `ProjectSection/DECISIONS.md`.

Format per entry: **Context** (the problem), **Decision**, **Why**, **Trade-offs / consequences**.

---

## V1. A separate website that only shows timetables

- **Context:** Students and teachers need to see the timetable, but the main app is a data-entry and generation tool for admins and feeders.
- **Decision:** A separate project in `ProjectViewSection`, with its own frontend, backend and deployment.
- **Why:** People who only read a timetable never get near admin screens or data entry, and each site can change without breaking the other.
- **Trade-offs:** There are two projects to run and deploy, and a new timetable has to travel from one to the other.

## V2. Read the main app through an API, never its database

- **Context:** The new site needs timetable data. Connecting straight to the main MongoDB would be the shortest route.
- **Decision:** The main backend exposes two read-only endpoints, `/api/public/timetables` and `/api/public/timetables/:id`. They sit before the login check and take an `x-api-key` header instead.
- **Why:** The main database is shared and edited by others, and holds far more than a timetable. The API limits access to one reading job, and hides the main app's internal data structure.
- **Trade-offs:** The main app needed a code change, and both sides must hold the same key.

## V3. Send only display fields

- **Context:** A saved timetable also holds stats, solver details, feedback and the list of unplaced classes.
- **Decision:** The feed sends the name, date, scope, days, periods and these entry fields: section, day, period, subject, type, teacher, room and `cont`. Period times and breaks are worked out by the main backend.
- **Why:** Admin details stay in the admin tool, and the view site doesn't need a copy of the timing rules (auto or manual mode).
- **Trade-offs:** Showing a new field on this site means changing the main backend first.

## V4. The view site keeps its own copy in a separate cluster

- **Context:** The MongoDB login given for this site turned out to be a different, empty cluster (`cluster0.dz6a5rj`), not the main app's (`cluster0.miwfpdb`).
- **Decision:** The view backend stores a copy of each timetable in database `intellisched_view`, and visitors are served from that copy.
- **Why:** Visitors never put load on the main app, and the site keeps working when the main API is down.
- **Trade-offs:** The copy can be out of date, so the page shows a note when updates stop arriving.

## V5. Refresh when a visitor arrives, not on a timer

- **Context:** Vercel functions don't run in the background, so a timer wouldn't work once deployed.
- **Decision:** When a visitor loads the timetable list and the last sync attempt is older than `SYNC_MINUTES` (default 5), the backend syncs first. Only timetables with a changed `generatedAt` are downloaded, and only one sync runs at a time per server. A failed attempt also waits out the same interval.
- **Why:** It needs no scheduler, and it does nothing when nobody is visiting.
- **Trade-offs:** A new timetable can take up to `SYNC_MINUTES` to appear, and the first visitor after that gap waits slightly longer. Each Vercel instance has its own in-flight guard, so two could occasionally sync at once. That's harmless, because a sync just replaces the same documents.

## V6. Identify people without passwords (replaced by V11)

- **Context:** The UI reference shows an email and password form with Google and Microsoft sign-in. The project has no student accounts, and these people have no passwords in the system. Only Student and Teacher sign-in were wanted.
- **Decision:** Students choose their section. Teachers enter their Teacher ID, which must appear on the timetable. The choice is remembered in the browser under `timetable-session`, and there's no server session.
- **Why:** A password box with nothing behind it would only look secure. This keeps the reference's Student and Teacher flow with no accounts to manage.
- **Trade-offs:** **This is not real security.** The sign-in only picks which timetable to show. `/api/timetables` is public, so anyone can read every timetable, including teacher names. Real privacy would need accounts and a server-side check.

## V7. Follow the green UI reference, but only the pages that apply

- **Context:** The reference (`docs/ui-reference.jpeg`) also shows Generate, Conflicts, Settings, Calendar and a search bar.
- **Decision:** Keep the home page, role choice, sign-in, dashboard and timetable. Leave out admin pages, Google and Microsoft sign-in, password recovery, sign-up, notifications and search.
- **Why:** This site only shows timetables, and generating and fixing conflicts stay in the main app.
- **Trade-offs:** The site has less on it than the reference image. A first design in ink blue and yellow was replaced by this one. V11 later added one admin page, Accounts, for the master account only.

## V8. Phones get one day at a time

- **Context:** A six-day, eight-period grid doesn't fit on a phone.
- **Decision:** Below 860px the week grid is hidden. The timetable shows one day with day tabs, and the sidebar becomes a bottom bar.
- **Why:** On a phone, people mostly want to know what's next today.
- **Trade-offs:** There's no whole-week view on the phone screen, though the PDF download (V12) gives one.

## V9. Hash routes and no router package

- **Context:** The site has only five screens.
- **Decision:** Routes live in the URL hash (`#/dashboard`), handled in `App.jsx`.
- **Why:** The back button works with no extra dependency and no server rewrite rules for each page.
- **Trade-offs:** URLs contain a `#`. If the site grows much, a router package would be worth adding.

## V10. A master account on the Teacher sign-in, held in the environment (trade-offs replaced by V11)

- **Context:** One account was wanted that can look at everyone's timetable, with its ID and password in the env file.
- **Decision:** `MASTER_ID` and `MASTER_PASSWORD` live in `backend/.env`. "Use the master account" on the Teacher sign-in opens an ID and password form, checked by `POST /api/auth/master` with a constant-time comparison. Once signed in, a bar lets the account switch between any teacher or section. Ordinary Teacher ID sign-in is unchanged.
- **Why:** The password stays on the server and out of the browser code, and changing it needs no database.
- **Trade-offs:** **It's a convenience, not a lock** (see V6). The timetable routes stay public, and the browser only remembers `{ role: 'master' }`, so someone who edits their own browser storage could reach the same view, of data that's already public. There's no limit on password guesses, so the password must stay long and random. There's one shared account with no per-person history.

## V11. Real accounts, created by the master account

- **Context:** Students and teachers should sign in with an ID and password that an admin gives them: the enrollment number for students, the Teacher ID for teachers.
- **Decision:** The master account is the admin. Its Accounts page creates logins, resets passwords and deletes accounts. A student's section can be set when the account is created; if it isn't, the student chooses it once, at first sign-in, and it's saved to their account. A teacher account is linked to a Teacher ID chosen from the timetables. Passwords are stored as salted scrypt hashes. Sign-in returns a random token, kept in the browser for 7 days; only its hash is stored, in `sessions`. Every timetable route now needs a token, and the server sends students and teachers only their own classes. Five wrong passwords lock an ID for 15 minutes.
- **Why:** A password box over public routes would only look secure (V6), so the protection has to be on the server. Filtering on the server means the browser never receives anyone else's classes. Node's built-in `scrypt` needs no new dependency, and database sessions end at once when a password is reset or an account is deleted, which suits Vercel functions too.
- **Trade-offs:** The master account can now change data, so `MASTER_PASSWORD` must be strong. Nobody can sign in until an account is made, and accounts are created one at a time. Passwords can't be shown again, only reset, and people can't change their own. Anyone can lock an ID for 15 minutes by guessing wrongly on purpose. The site trusts the section a student picks, so a wrong choice shows the wrong timetable. To change it, the master account deletes the account and makes it again, and the student picks afresh. The token sits in `localStorage`, so a script injected into the page could read it.

## V12. Download a PDF instead of printing

- **Context:** The Timetable page had a Print button, which didn't help on phones, where the week grid is hidden.
- **Decision:** A Download PDF button builds the week in the browser with `jspdf` and `jspdf-autotable`, named after the section or teacher. Labs appear in each period they cover, and breaks are full-width rows.
- **Why:** People get a file they can keep or share on any device. The libraries load only on the first download, so the site opens as fast as before.
- **Trade-offs:** Two new frontend dependencies. The PDF is a plain table, without the site's subject colours.
