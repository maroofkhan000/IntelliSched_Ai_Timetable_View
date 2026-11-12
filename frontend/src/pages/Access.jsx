import { useEffect, useState } from 'react'
import { api } from '../api'
import { Arrow, Cap, People } from '../Icons'
import { Brand, Leaves } from './Shared'

const ROLE_CARDS = [
  { role: 'student', Icon: Cap, title: 'I am a student', text: 'See your class timetable and what comes next.' },
  { role: 'teacher', Icon: People, title: 'I am a teacher', text: 'See the classes and rooms you teach this week.' },
]

const ID_FIELD = {
  student: { label: 'Enrollment number', placeholder: 'For example 2300101892', inputMode: 'numeric' },
  teacher: { label: 'Teacher ID', placeholder: 'For example TT0021', autoCapitalize: 'characters' },
  master: { label: 'Master ID' },
}

export default function Access({ route, onSignIn }) {
  if (route === '/role') return <ChooseRole />
  const role = route.endsWith('/master') ? 'master' : route.endsWith('/teacher') ? 'teacher' : 'student'
  return (
    <div className="access">
      <Leaves />
      <main className="sign-in">
        <Brand />
        <h1>Welcome back</h1>
        <p className="muted">Sign in to see your timetable</p>
        <div className="role-tabs" role="group" aria-label="Sign in as">
          <a href="#/sign-in/student" aria-current={role === 'student' ? 'true' : undefined}><Cap size={18} /> Student</a>
          <a href="#/sign-in/teacher" aria-current={role !== 'student' ? 'true' : undefined}><People size={18} /> Teacher</a>
        </div>
        <SignInForm key={role} role={role} onSignIn={onSignIn} />
      </main>
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
    <div className="access">
      <Leaves />
      <main className="sign-in">
        <Brand />
        <h1>Choose your section</h1>
        <p className="muted">You only need to do this once</p>
        <form onSubmit={submit}>
          <label className="field"><span>Section</span>
            <select value={section} onChange={(e) => setSection(e.target.value)} required>
              <option value="" disabled>{sections ? 'Choose your section' : 'Loading'}</option>
              {sections?.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn primary wide" disabled={busy}>Continue <Arrow size={18} /></button>
        </form>
      </main>
    </div>
  )
}

function ChooseRole() {
  return (
    <div className="access">
      <Leaves />
      <main className="choose">
        <Brand />
        <h1>Choose your role</h1>
        <p className="muted">Get a timetable made for how you use it</p>
        <div className="role-cards">
          {ROLE_CARDS.map(({ role, Icon, title, text }) => (
            <a key={role} href={`#/sign-in/${role}`}>
              <span className="soft-icon big"><Icon size={44} /></span>
              <h2>{title}</h2>
              <p>{text}</p>
              <span className="round-arrow"><Arrow size={20} /></span>
            </a>
          ))}
        </div>
      </main>
    </div>
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
      <button type="submit" className="btn primary wide" disabled={busy}>{busy ? 'Signing in' : 'Sign in'} <Arrow size={18} /></button>
      {role === 'teacher' && <a className="form-link" href="#/sign-in/master">Use the master account</a>}
      {role === 'master' && <a className="form-link" href="#/sign-in/teacher">Sign in with a Teacher ID</a>}
    </form>
  )
}
