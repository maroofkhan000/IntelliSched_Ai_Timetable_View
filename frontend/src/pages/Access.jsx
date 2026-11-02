import { useState } from 'react'
import { Arrow, Cap, People } from '../Icons'
import { choices } from '../timetable'
import { Brand, Leaves, LoadProblem } from './Shared'

const ROLE_CARDS = [
  { role: 'student', Icon: Cap, title: 'I am a student', text: 'See your class timetable and what comes next.' },
  { role: 'teacher', Icon: People, title: 'I am a teacher', text: 'See the classes and rooms you teach this week.' },
]

export default function Access({ route, state, onRetry, onSignIn }) {
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
        {role === 'master' ? <MasterForm onSignIn={onSignIn} /> : state.status === 'ready'
          ? <SignInForm key={role} role={role} timetable={state.timetable} onSignIn={onSignIn} />
          : <LoadProblem status={state.status} onRetry={onRetry} />}
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

function SignInForm({ role, timetable, onSignIn }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const options = choices(timetable, role)

  const submit = (e) => {
    e.preventDefault()
    const typed = value.trim().toUpperCase()
    const match = options.find((o) => o.value.toUpperCase() === typed)
    if (!match) return setError(role === 'student' ? 'Choose your section.' : `${value.trim() || 'That ID'} isn't on the timetable. Check your Teacher ID and try again.`)
    onSignIn({ role, id: match.value })
  }

  return (
    <form onSubmit={submit}>
      {role === 'student' ? (
        <label className="field"><span>Section</span>
          <select value={value} onChange={(e) => { setValue(e.target.value); setError('') }}>
            <option value="" disabled>Choose your section</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      ) : (
        <label className="field"><span>Teacher ID</span>
          <input value={value} onChange={(e) => { setValue(e.target.value); setError('') }} placeholder="For example TT0021" autoComplete="off" autoCapitalize="characters" />
        </label>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn primary wide">Sign in <Arrow size={18} /></button>
      {role === 'teacher' && <a className="form-link" href="#/sign-in/master">Use the master account</a>}
    </form>
  )
}

function MasterForm({ onSignIn }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth/master', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password }) })
      if (res.ok) return onSignIn({ role: 'master' })
      setError(res.status === 401 ? 'Wrong ID or password.' : "Sign-in didn't work. Try again.")
    } catch {
      setError("Sign-in didn't work. Check your connection, then try again.")
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit}>
      <label className="field"><span>Master ID</span>
        <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required />
      </label>
      <label className="field"><span>Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn primary wide" disabled={busy}>{busy ? 'Signing in' : 'Sign in'} <Arrow size={18} /></button>
      <a className="form-link" href="#/sign-in/teacher">Sign in with a Teacher ID</a>
    </form>
  )
}
