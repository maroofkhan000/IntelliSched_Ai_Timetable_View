# IntelliSched View Site: Flow

How a saved timetable reaches a student or teacher. Diagrams are Mermaid; they render on GitHub and in VS Code with a Mermaid preview.

---

## 1. End to end

```mermaid
flowchart TD
    A[Admin generates a timetable<br/>in the main app] --> B[Main app saves it in its MongoDB]
    B --> C[A visitor opens the view site]
    C --> D{Last sync attempt older<br/>than SYNC_MINUTES?}
    D -->|No| G[Serve the saved copy]
    D -->|Yes| E[Ask the main API for the list]
    E -->|Works| F[Download changed timetables<br/>Remove deleted ones]
    E -->|Fails| H[Record the failure]
    F --> G
    H --> G
    G --> I[Show the timetable]
    H -.->|Page shows a note| I
```

## 2. Sync

```mermaid
sequenceDiagram
    participant V as Visitor
    participant B as View backend
    participant D as View MongoDB
    participant M as Main API

    V->>B: GET /api/timetables
    B->>D: Read last sync attempt
    alt Copy is stale
        B->>M: GET /api/public/timetables (x-api-key)
        M-->>B: id, name, generatedAt for each
        loop Each timetable with a changed generatedAt
            B->>M: GET /api/public/timetables/:id
            M-->>B: Display data only
            B->>D: Replace the saved copy
        end
        B->>D: Delete copies the main app no longer has
        B->>D: Record the result
    end
    B->>D: Read the list
    B-->>V: timetables, syncFailed
```

If the main API fails or rejects the key, the visitor still gets the saved copy with `syncFailed: true`, and the page says it may not be the latest version. If there's no saved copy at all, the page offers Try again.

## 3. What a visitor does

```mermaid
flowchart TD
    H[Home] --> R[Choose your role]
    R -->|Student| S[Enrollment number and password]
    R -->|Teacher| T[Teacher ID and password]
    T -->|Use the master account| M[Master ID and password]
    S & T & M -->|Wrong| E[Error message<br/>locked for 15 minutes after five]
    S & T & M -->|Checked by the server| Dash[Dashboard]
    Dash <--> TT[Timetable<br/>class view, list view, Download PDF]
    Dash --> Out[Sign out] --> H
    TT --> Out
    M -.->|Master account only| Acc[Accounts<br/>create, reset, delete]
```

The sign-in token is remembered in the browser for 7 days, so returning visitors can go straight to `#/dashboard`. When it expires, or the master account resets the password or deletes the account, they're sent back to choose a role. The master account sees the same pages, with a bar on top for switching between any teacher or section, plus the Accounts page.

## 3a. Creating a login

1. The master account opens Accounts and picks Students or Teachers.
2. For a student, it enters the enrollment number and sets a password. For a teacher, it chooses the teacher from the timetables, whose Teacher ID becomes the login, and sets a password.
3. The server stores a hash of the password.
4. The master account passes the password on. It can't be shown again, only reset.
5. The master account can set a student's section when creating the account. Otherwise, the first time the student signs in, they choose their section once, and it's saved to their account.

## 4. Building the display

1. `choices` lists the sections or teachers who appear in the entries.
2. `blocksFor` keeps one person's entries and joins each lab's two periods into one block, using `cont: true`.
3. `nowOrNext` compares today's blocks with the clock to find the class on now, or the next one, looking up to a week ahead. The page rechecks every 30 seconds.
4. `Week` places blocks on a grid with one row per period and break. `Agenda` lists one day. Below 860px, only `Agenda` shows.
