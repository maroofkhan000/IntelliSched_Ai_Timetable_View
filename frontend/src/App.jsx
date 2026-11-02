import { useCallback, useEffect, useState } from 'react'
import Access from './pages/Access'
import Landing from './pages/Landing'
import Portal from './pages/Portal'
import { choices } from './timetable'

const SAVED = 'timetable-session'
const savedSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED))
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

const getJson = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} answered ${res.status}`)
  return res.json()
}

const routeNow = () => window.location.hash.slice(1) || '/'
export const go = (route) => { window.location.hash = route }

export default function App() {
  const [route, setRoute] = useState(routeNow)
  const [state, setState] = useState({ status: 'loading' })
  const [selected, setSelected] = useState(null) // id of the timetable, when there are several
  const [session, setSession] = useState(savedSession) // { role, id }, or { role: 'master' }
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const onChange = () => setRoute(routeNow())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const { timetables, syncFailed } = await getJson('/api/timetables')
      if (!timetables.length) return setState({ status: syncFailed ? 'error' : 'empty' })
      const id = timetables.some((t) => t.id === selected) ? selected : timetables[0].id
      setState({ status: 'ready', timetables, syncFailed, timetable: await getJson(`/api/timetables/${id}`) })
    } catch {
      setState({ status: 'error' })
    }
  }, [selected])

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
    setSession(null)
    saveSession(null)
    go('/')
  }

  if (route === '/') return <Landing />
  if (route === '/role' || route.startsWith('/sign-in')) return <Access route={route} state={state} onRetry={load} onSignIn={signIn} />

  // a person who is no longer on the timetable goes back to sign in
  const isMaster = session?.role === 'master'
  const person = isMaster ? { label: 'Master account' } : state.status === 'ready' && session ? choices(state.timetable, session.role).find((o) => o.value === session.id) : null
  if (state.status === 'ready' && !person) {
    go('/role')
    return null
  }
  return <Portal route={route} state={state} session={session} person={person} now={now} onRetry={load} onTimetable={setSelected} onSignOut={signOut} />
}
