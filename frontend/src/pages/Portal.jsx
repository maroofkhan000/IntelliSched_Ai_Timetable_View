import { useMemo, useState } from 'react'
import { Book, Calendar, Clock, Exit, Home, People } from '../Icons'
import { ROLES, blocksFor, choices, isCurrent, nowOrNext, timeOf, todayName, toneOf, weekStats } from '../timetable'
import { Brand, LoadProblem } from './Shared'

const NAV = [
  { route: '/dashboard', label: 'Dashboard', Icon: Home },
  { route: '/timetable', label: 'Timetable', Icon: Calendar },
]

export default function Portal({ route, state, session, person, now, onRetry, onTimetable, onSignOut }) {
  const page = route === '/timetable' ? '/timetable' : '/dashboard'
  const ready = state.status === 'ready'
  const initial = (person?.label ?? '?').replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, '')[0]

  return (
    <div className="portal">
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Main">
          {NAV.map(({ route: r, label, Icon }) => (
            <a key={r} href={`#${r}`} aria-current={page === r ? 'page' : undefined}><Icon size={19} /> {label}</a>
          ))}
        </nav>
        <div className="me">
          <span className="avatar">{initial}</span>
          <div className="me-text"><b>{person?.label}</b><span>{session?.role === 'master' ? 'All timetables' : session?.role === 'teacher' ? 'Teacher' : 'Student'}</span></div>
          <button type="button" className="icon-btn" onClick={onSignOut} aria-label="Sign out" title="Sign out"><Exit size={19} /></button>
        </div>
      </aside>

      <main className="content">
        {ready ? <Page {...{ page, state, session, now, onTimetable }} /> : <LoadProblem status={state.status} onRetry={onRetry} />}
      </main>
    </div>
  )
}

function Page({ page, state, session, now, onTimetable }) {
  const { timetable, timetables, syncFailed } = state
  // the master account picks whose timetable to view; everyone else sees their own
  const isMaster = session.role === 'master'
  const [viewing, setViewing] = useState({ role: 'teacher', id: '' })
  const role = isMaster ? viewing.role : session.role
  const options = useMemo(() => (isMaster ? choices(timetable, role) : []), [isMaster, timetable, role])
  const id = isMaster ? (options.find((o) => o.value === viewing.id) ?? options[0])?.value : session.id
  const byDay = useMemo(() => blocksFor(timetable, role, id), [timetable, role, id])
  const published = new Date(timetable.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      {timetables.length > 1 && (
        <label className="source"><span className="sr">Timetable</span>
          <select value={timetable.id} onChange={(e) => onTimetable(e.target.value)}>
            {timetables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )}
      {isMaster && (
        <div className="master-bar">
          <div className="tabs" role="group" aria-label="View timetables of">
            {['teacher', 'student'].map((r) => <button key={r} type="button" aria-pressed={role === r} onClick={() => setViewing({ role: r, id: '' })}>{r === 'teacher' ? 'Teachers' : 'Sections'}</button>)}
          </div>
          <label><span className="sr">{ROLES[role].pick}</span>
            <select value={id ?? ''} onChange={(e) => setViewing({ role, id: e.target.value })}>
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      )}
      {page === '/timetable'
        ? <TimetablePage timetable={timetable} byDay={byDay} role={role} now={now} />
        : <Dashboard timetable={timetable} byDay={byDay} role={role} now={now} />}
      <footer className="published">
        <p>Published {published}</p>
        {syncFailed && <p>Updates aren't arriving right now, so this may not be the latest version.</p>}
      </footer>
    </>
  )
}

const who = (b, role) => (role === 'student' ? b.TeacherName : b.SectionID)

function Dashboard({ timetable, byDay, role, now }) {
  const today = todayName(now)
  const stats = weekStats(byDay, role, today)
  const tiles = [
    { Icon: Clock, tone: 'tone-1', value: stats.today, label: 'Classes today' },
    { Icon: Calendar, tone: 'tone-4', value: stats.week, label: 'Classes this week' },
    { Icon: Book, tone: 'tone-2', value: stats.subjects, label: 'Subjects' },
    { Icon: People, tone: 'tone-0', value: stats.people, label: role === 'student' ? 'Teachers' : 'Sections' },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Your day and week at a glance</p>
        </div>
        <span className="date-chip"><Calendar size={17} /> {now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      <div className="tiles">
        {tiles.map(({ Icon, tone, value, label }) => (
          <div key={label} className="tile"><span className={`tile-icon ${tone}`}><Icon size={22} /></span><div><strong>{value}</strong><span>{label}</span></div></div>
        ))}
      </div>

      <Status timetable={timetable} byDay={byDay} now={now} />

      <div className="two-up">
        <section className="panel">
          <div className="panel-head"><h2>Today's schedule</h2><a href="#/timetable">View full timetable</a></div>
          {byDay[today]?.length
            ? <ol className="class-list">{byDay[today].map((b) => <ClassRow key={b.from} timetable={timetable} block={b} day={today} role={role} now={now} />)}</ol>
            : <p className="no-classes">No classes today.</p>}
        </section>
        <section className="panel week-panel">
          <div className="panel-head"><h2>Weekly timetable</h2></div>
          <Week timetable={timetable} byDay={byDay} role={role} now={now} compact />
        </section>
      </div>
    </>
  )
}

function Status({ timetable, byDay, now }) {
  const s = nowOrNext(timetable, byDay, now)
  if (!s) return <p className="banner">No classes this week.</p>
  const { SubjectName, RoomID } = s.block
  return <p className="banner"><Clock size={20} /> {s.current ? `On now: ${SubjectName} in ${RoomID} until ${s.end}` : `Next: ${SubjectName} in ${RoomID}, ${s.later} at ${s.start}`}</p>
}

function TimetablePage({ timetable, byDay, role, now }) {
  const [view, setView] = useState('class')
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Timetable</h1>
          <p className="muted">Your full week</p>
        </div>
        <button type="button" className="btn ghost print-btn" onClick={() => window.print()}>Print</button>
      </div>
      <section className="panel">
        <div className="tabs" role="group" aria-label="Timetable view">
          <button type="button" aria-pressed={view === 'class'} onClick={() => setView('class')}>Class view</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>List view</button>
        </div>
        {view === 'class' && <Week timetable={timetable} byDay={byDay} role={role} now={now} />}
        <Agenda timetable={timetable} byDay={byDay} role={role} now={now} phoneOnly={view === 'class'} />
      </section>
    </>
  )
}

function ClassRow({ timetable, block: b, day, role, now }) {
  const { start, end } = timeOf(timetable, b)
  const live = isCurrent(timetable, b, day, now)
  return (
    <li className={toneOf(b.SubjectCode)}>
      <div className="when"><b>{start || `Period ${b.from}`}</b>{end && <span>{end}</span>}</div>
      <div className="what">
        <h3>{b.SubjectName}{b.Type === 'Lab' && <span className="lab-tag">Lab</span>}</h3>
        <p>{who(b, role)}, room {b.RoomID}</p>
      </div>
      {live && <span className="ongoing">Ongoing</span>}
    </li>
  )
}

// The whole week, with rows for periods and for breaks. `compact` shows subject codes only.
function Week({ timetable, byDay, role, now, compact = false }) {
  const { days, periods } = timetable
  const rowOf = new Map()
  const rows = []
  let row = 2
  for (const p of periods) {
    rowOf.set(p.period, row)
    rows.push({ type: 'period', row: row++, ...p })
    if (p.break) rows.push({ type: 'break', row: row++, ...p.break })
  }
  const today = todayName(now)

  return (
    <div className={`week${compact ? ' compact' : ''}`} style={{ gridTemplateColumns: `${compact ? '3rem' : '4.5rem'} repeat(${days.length}, minmax(0, 1fr))`, gridTemplateRows: `auto repeat(${rows.length}, auto)` }}>
      {days.map((d, i) => <div key={d} className={`day-head${d === today ? ' today' : ''}`} style={{ gridColumn: i + 2 }}>{compact ? d.slice(0, 3) : d}</div>)}
      {rows.map((r) => (r.type === 'break' ? (
        <div key={`b${r.row}`} className="break-row" style={{ gridRow: r.row }}>{compact ? '' : `Break ${r.start} to ${r.end}`}</div>
      ) : (
        <div key={r.row} className="time" style={{ gridRow: r.row }}><b>{r.start || `P${r.period}`}</b></div>
      )))}
      {days.flatMap((d, i) => byDay[d].map((b) => (
        <article key={`${d}${b.from}`} className={`block ${toneOf(b.SubjectCode)}${isCurrent(timetable, b, d, now) ? ' live' : ''}`} style={{ gridColumn: i + 2, gridRow: `${rowOf.get(b.from)} / ${rowOf.get(b.to) + 1}` }} title={compact ? b.SubjectName : undefined}>
          {compact ? <b>{b.SubjectCode}</b> : (
            <>
              <h3>{b.SubjectName}{b.Type === 'Lab' && <span className="lab-tag">Lab</span>}</h3>
              <p>{b.RoomID}</p>
              <p>{who(b, role)}</p>
            </>
          )}
        </article>
      )))}
    </div>
  )
}

// One day at a time: the list view, and the only view on phones.
function Agenda({ timetable, byDay, role, now, phoneOnly }) {
  const { days } = timetable
  const today = todayName(now)
  const [day, setDay] = useState(days.includes(today) ? today : days[0])

  return (
    <div className={`agenda${phoneOnly ? ' phone-only' : ''}`}>
      <div className="day-tabs" role="group" aria-label="Day">
        {days.map((d) => <button key={d} type="button" aria-pressed={d === day} onClick={() => setDay(d)}>{d.slice(0, 3)}</button>)}
      </div>
      {byDay[day].length
        ? <ol className="class-list">{byDay[day].map((b) => <ClassRow key={b.from} timetable={timetable} block={b} day={day} role={role} now={now} />)}</ol>
        : <p className="no-classes">No classes on {day}.</p>}
    </div>
  )
}
