import { useEffect, useState } from 'react'
import { api } from '../api'
import { Arrow, ArrowLeft, Board, BookOpen, Cap, CalendarDots, Group, Sliders, Trend } from '../Icons'
import { Scenery, StudentArt, TeacherArt } from './Illustrations'
import { SiteBrand, ThemeButton } from './Shared'

const ID_FIELD = {
  student: { label: 'Enrollment number', placeholder: 'For example 2300101892', inputMode: 'numeric' },
  teacher: { label: 'Teacher ID', placeholder: 'For example TT0021', autoCapitalize: 'characters' },
  master: { label: 'Master ID' },
}

export default function Access({ route, onSignIn }) {
  const role = route.endsWith('/master') ? 'master' : route.endsWith('/teacher') ? 'teacher' : 'student'
  const tone = role === 'student' ? 'student' : 'teacher'
  return (
    <AuthShell tone={tone} title={<>Welcome <em>back</em></>} text="Sign in to see your timetable">
      <div className="auth-tabs" role="group" aria-label="Sign in as">
        <a href="#/sign-in/student" aria-current={role === 'student' ? 'true' : undefined}><Cap size={18} /> Student</a>
        <a href="#/sign-in/teacher" aria-current={role !== 'student' ? 'true' : undefined}><Board size={18} /> Teacher</a>
      </div>
      <SignInForm key={role} role={role} onSignIn={onSignIn} />
    </AuthShell>
  )
}

const ART = {
  student: { Art: StudentArt, heading: 'Your classes, rooms and teachers for the whole week.', perks: [[CalendarDots, 'My Timetable'], [Trend, 'Class Updates'], [BookOpen, 'Study Planner']] },
  teacher: { Art: TeacherArt, heading: 'Your teaching schedule, sections and rooms in one place.', perks: [[CalendarDots, 'Teaching Schedule'], [Group, 'Class & Room Allocation'], [Sliders, 'Scheduling Preferences']] },
}

// The role page's sky and header around a two-panel card: artwork on one side, the form on the other.
function AuthShell({ tone, title, text, children }) {
  const { Art, heading, perks } = ART[tone]
  return (
    <div className="role-page">
      <div className="rp-hero">
        <Scenery />
        <header className="rp-nav">
          <SiteBrand />
          <div className="rp-actions">
            <ThemeButton />
            <a className="rp-back" href="#/role"><ArrowLeft size={18} /> All roles</a>
          </div>
        </header>
        <main className="auth-main">
          <section className={`auth-card ${tone}`}>
            <div className="auth-side" aria-hidden="true">
              <p>{heading}</p>
              <ul className="rp-perks">
                {perks.map(([PerkIcon, label]) => <li key={label}><PerkIcon size={24} />{label}</li>)}
              </ul>
              <div className="auth-art"><Art /></div>
            </div>
            <div className="auth-body">
              <h1>{title}</h1>
              <p className="auth-lead">{text}</p>
              {children}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

// Shown once, the first time a student signs in.
export function ChooseSection({ token, onChosen, onExpired }) {
  const [sections, setSections] = useState(null)
  const [section, setSection] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/api/auth/sections', { token }).then((d) => setSections(d.sections)).catch((err) => {
      if (err.status === 401) onExpired()
      else setError("Sections didn't load. Reload the page, then try again.")
    })
  }, [token, onExpired])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { target } = await api('/api/auth/section', { token, method: 'POST', body: { section } })
      return onChosen(target)
    } catch (err) {
      setError(err.status ? err.message : "That didn't work. Check your connection, then try again.")
    }
    setBusy(false)
  }

  return (
    <AuthShell tone="student" title={<>Choose your <em>section</em></>} text="You only need to do this once">
      <form onSubmit={submit}>
        <label className="field"><span>Section</span>
          <select value={section} onChange={(e) => setSection(e.target.value)} required>
            <option value="" disabled>{sections ? 'Choose your section' : 'Loading'}</option>
            {sections?.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>Continue <Arrow size={18} /></button>
      </form>
    </AuthShell>
  )
}

function SignInForm({ role, onSignIn }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { label, ...idProps } = ID_FIELD[role]

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      return onSignIn(await api('/api/auth/sign-in', { method: 'POST', body: { role, id, password } }))
    } catch (err) {
      setError(err.status === 401 || err.status === 429 ? err.message : "Sign-in didn't work. Check your connection, then try again.")
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit}>
      <label className="field"><span>{label}</span>
        <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required {...idProps} />
      </label>
      <label className="field"><span>Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="auth-submit" disabled={busy}>{busy ? 'Signing in' : 'Sign in'} <Arrow size={18} /></button>
      {role === 'teacher' && <a className="form-link" href="#/sign-in/master">Use the master account</a>}
      {role === 'master' && <a className="form-link" href="#/sign-in/teacher">Sign in with a Teacher ID</a>}
    </form>
  )
}
