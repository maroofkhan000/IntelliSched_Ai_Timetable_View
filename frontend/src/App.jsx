import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import Access, { ChooseSection } from './pages/Access'
import Landing from './pages/Landing'
import Portal from './pages/Portal'
import { choices } from './timetable'

const SAVED = 'timetable-session'
const savedSession = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED))
    return saved?.token ? saved : null // older saved sign-ins have no token
  } catch {
    return null
  }
}
const saveSession = (value) => {
  try {
    if (value) localStorage.setItem(SAVED, JSON.stringify(value))
    else localStorage.removeItem(SAVED)
  } catch { /* the page works without it */ }
}

const routeNow = () => window.location.hash.slice(1) || '/'
export const go = (route) => { window.location.hash = route }

export default function App() {
  const [route, setRoute] = useState(routeNow)
  const [state, setState] = useState({ status: 'loading' })
  const [selected, setSelected] = useState(null) // id of the timetable, when there are several
  const [session, setSession] = useState(savedSession) // { token, role, id, target }; target is the section or Teacher ID
  const [now, setNow] = useState(() => new Date())
  const token = session?.token
  const needsSection = session?.role === 'student' && !session.target

  useEffect(() => {
    const onChange = () => setRoute(routeNow())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const forget = useCallback(() => {
    setSession(null)
    saveSession(null)
    setSelected(null)
    setState({ status: 'loading' })
  }, [])

  const load = useCallback(async () => {
    if (!token || needsSection) return
    setState({ status: 'loading' })
    try {
      const { timetables, syncFailed } = await api('/api/timetables', { token })
      if (!timetables.length) return setState({ status: syncFailed ? 'error' : 'empty' })
      const id = timetables.some((t) => t.id === selected) ? selected : timetables[0].id
      setState({ status: 'ready', timetables, syncFailed, timetable: await api(`/api/timetables/${id}`, { token }) })
    } catch (err) {
      if (err.status === 401) return forget() // expired, or the account was changed
      setState({ status: 'error' })
    }
  }, [selected, token, needsSection, forget])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const signIn = (value) => {
    setSession(value)
    saveSession(value)
    go('/dashboard')
  }
  const signOut = () => {
    setRoute('/') // now, not on hashchange: the portal would otherwise redirect to role choice first
    api('/api/auth/sign-out', { token, method: 'POST' }).catch(() => {}) // the browser forgets it either way
    forget()
    go('/')
  }

  if (route === '/') return <Landing />
  if (route === '/role' || route.startsWith('/sign-in')) return <Access route={route} onSignIn={signIn} />

  if (!session) {
    go('/role')
    return null
  }
  if (needsSection) return <ChooseSection token={token} onChosen={(target) => signIn({ ...session, target })} onExpired={forget} />
  const teacherName = session.role === 'teacher' && state.status === 'ready' ? choices(state.timetable, 'teacher').find((o) => o.value === session.target)?.label : null
  const person = { label: session.role === 'master' ? 'Master account' : teacherName ?? session.id }
  return <Portal route={route} state={state} session={session} person={person} now={now} onRetry={load} onTimetable={setSelected} onSignOut={signOut} />
}
