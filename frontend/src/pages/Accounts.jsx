import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

const TABS = [{ role: 'student', label: 'Students' }, { role: 'teacher', label: 'Teachers' }]
const PASSWORD_MIN = 8

// The master account's page: makes the IDs and passwords students and teachers sign in with.
export default function Accounts({ token }) {
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)
  const [role, setRole] = useState('student')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setFailed(false)
    try {
      setData(await api('/api/accounts', { token }))
    } catch {
      setFailed(true)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const nameOf = (a) => (a.role === 'student' ? a.target ?? 'Section not chosen yet' : data.teachers.find((t) => t.id === a.target)?.name ?? 'Not on a timetable')
  const typed = search.trim().toLowerCase()
  const rows = (data?.accounts ?? []).filter((a) => a.role === role && `${a.id} ${nameOf(a)}`.toLowerCase().includes(typed))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Accounts</h1>
          <p className="muted">Create the IDs and passwords people sign in with</p>
        </div>
      </div>
      <div className="tabs account-tabs" role="group" aria-label="Accounts for">
        {TABS.map((t) => <button key={t.role} type="button" aria-pressed={role === t.role} onClick={() => { setRole(t.role); setSearch('') }}>{t.label}</button>)}
      </div>
      {failed && <div className="load-note"><h2>Accounts didn't load</h2><button type="button" className="btn primary" onClick={load}>Try again</button></div>}
      {data && (
        <>
          <NewAccount key={role} role={role} data={data} token={token} onSaved={load} />
          <section className="panel">
            <div className="panel-head"><h2>{role === 'student' ? 'Student' : 'Teacher'} accounts</h2><span className="muted">{data.accounts.filter((a) => a.role === role).length}</span></div>
            <label className="field account-search"><span className="sr">Search accounts</span>
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
            </label>
            {rows.length
              ? <ul className="account-list">{rows.map((a) => <Row key={a.id} account={a} name={nameOf(a)} token={token} onSaved={load} />)}</ul>
              : <p className="no-classes">{typed ? 'No accounts match.' : 'No accounts yet.'}</p>}
          </section>
        </>
      )}
    </>
  )
}

function NewAccount({ role, data, token, onSaved }) {
  const isStudent = role === 'student'
  const [id, setId] = useState('')
  const [target, setTarget] = useState('')
  const [password, setPassword] = useState('')
  const [note, setNote] = useState({})
  const [busy, setBusy] = useState(false)
  const taken = new Set(data.accounts.filter((a) => a.role === 'teacher').map((a) => a.target))
  const free = data.teachers.filter((t) => !taken.has(t.id))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNote({})
    try {
      const made = await api('/api/accounts', { token, method: 'POST', body: { role, id, target, password } })
      setNote({ done: `Created ${made.id}. Give them this password now: it can't be shown again.` })
      setId('')
      setTarget('')
      setPassword('')
      await onSaved()
    } catch (err) {
      setNote({ error: err.status ? err.message : "That didn't work. Check your connection, then try again." })
    }
    setBusy(false)
  }

  return (
    <section className="panel">
      <div className="panel-head"><h2>New {role} account</h2></div>
      <form className="account-form" onSubmit={submit}>
        {isStudent ? (
          <label className="field"><span>Enrollment number</span>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="For example 2300101892" inputMode="numeric" autoComplete="off" required />
          </label>
        ) : (
          <label className="field"><span>Teacher</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)} required>
              <option value="" disabled>{free.length ? 'Choose a teacher' : 'Every teacher has an account'}</option>
              {free.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
            </select>
          </label>
        )}
        <label className="field"><span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} minLength={PASSWORD_MIN} autoComplete="off" required />
        </label>
        <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Creating' : 'Create account'}</button>
      </form>
      {note.error && <p className="form-error" role="alert">{note.error}</p>}
      {note.done && <p className="form-done" role="status">{note.done}</p>}
    </section>
  )
}

function Row({ account, name, token, onSaved }) {
  const [resetting, setResetting] = useState(false)
  const [password, setPassword] = useState('')
  const [note, setNote] = useState({})
  const path = `/api/accounts/${account.role}/${encodeURIComponent(account.id)}`
  const failure = (err) => setNote({ error: err.status ? err.message : "That didn't work. Try again." })

  const savePassword = async (e) => {
    e.preventDefault()
    try {
      await api(path, { token, method: 'PATCH', body: { password } })
      setResetting(false)
      setPassword('')
      setNote({ done: 'Password changed. They have been signed out.' })
    } catch (err) {
      failure(err)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Delete the account ${account.id}? They won't be able to sign in.`)) return
    try {
      await api(path, { token, method: 'DELETE' })
      await onSaved()
    } catch (err) {
      failure(err)
    }
  }

  return (
    <li>
      <div className="account-row">
        <div className="account-who"><b>{account.id}</b><span>{name}</span></div>
        <div className="account-actions">
          <button type="button" className="btn ghost" aria-expanded={resetting} onClick={() => { setResetting(!resetting); setNote({}) }}>Reset password</button>
          <button type="button" className="btn ghost danger" onClick={remove}>Delete</button>
        </div>
      </div>
      {resetting && (
        <form className="account-reset" onSubmit={savePassword}>
          <label className="field"><span className="sr">New password for {account.id}</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} minLength={PASSWORD_MIN} placeholder="New password" autoComplete="off" required />
          </label>
          <button type="submit" className="btn primary">Save</button>
        </form>
      )}
      {note.error && <p className="form-error" role="alert">{note.error}</p>}
      {note.done && <p className="form-done" role="status">{note.done}</p>}
    </li>
  )
}
