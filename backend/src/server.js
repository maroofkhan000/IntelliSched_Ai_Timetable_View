import 'dotenv/config'
import express from 'express'
import * as store from './db.js'
import { LOCK_MINUTES, clearFailures, endSession, endSessionsOf, hashPassword, isLocked, recordFailure, requireMaster, requireSignIn, sameText, startSession, verifyPassword } from './auth.js'
import { refreshIfStale } from './sync.js'

for (const k of ['MONGODB_URI', 'MAIN_API_URL', 'MAIN_API_KEY', 'MASTER_ID', 'MASTER_PASSWORD']) if (!process.env[k]?.trim()) throw new Error(`Missing ${k} (set it in backend/.env locally, or in Vercel's environment variables)`)
if (process.env.MASTER_PASSWORD.length < 10) throw new Error('MASTER_PASSWORD must be at least 10 characters')

const app = express()
app.use(express.json({ limit: '10kb' }))

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const fail = (res, code, message) => res.status(code).json({ error: message })

// Which timetable field an account's `target` is matched against.
const ENTRY_KEY = { student: 'SectionID', teacher: 'TeacherID' }
const LOGIN_ID = /^[A-Z0-9-]{3,32}$/
const PASSWORD_MIN = 8
const PASSWORD_MAX = 128

const accountId = (role, id) => `${role}:${id}`
const cleanId = (id) => String(id ?? '').trim().toUpperCase()
const okPassword = (password) => typeof password === 'string' && password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX
const BAD_PASSWORD = `Password must be ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`

// The master account lives in the environment; students and teachers are in the database.
async function checkSignIn(role, id, password) {
  if (role === 'master') return sameText(id, process.env.MASTER_ID.trim()) && sameText(password, process.env.MASTER_PASSWORD) ? { accountId: 'master', role, id } : null
  const account = await store.accounts.findOne({ _id: accountId(role, id) })
  const ok = await verifyPassword(password, account?.passwordHash)
  return ok && account ? { accountId: account._id, role, id, target: account.target } : null
}

app.post('/api/auth/sign-in', wrap(async (req, res) => {
  const { role, id, password } = req.body ?? {}
  if (role !== 'master' && !ENTRY_KEY[role]) return fail(res, 400, 'Choose student or teacher.')
  if (typeof password !== 'string' || password.length > PASSWORD_MAX) return fail(res, 401, 'Wrong ID or password.')
  const loginId = role === 'master' ? String(id ?? '').trim() : cleanId(id)
  const key = accountId(role, loginId)
  if (await isLocked(key)) return fail(res, 429, `Too many wrong tries. Wait ${LOCK_MINUTES} minutes, then try again.`)
  const who = await checkSignIn(role, loginId, password)
  if (!who) {
    await recordFailure(key)
    return fail(res, 401, 'Wrong ID or password.')
  }
  await clearFailures(key)
  res.json({ token: await startSession(who), role, id: loginId, target: who.target })
}))

app.post('/api/auth/sign-out', wrap(async (req, res) => {
  await endSession(req)
  res.json({ ok: true })
}))

// A student's account has no section until they choose one, which they can do once.
app.get('/api/auth/sections', wrap(requireSignIn), wrap(async (_req, res) => {
  res.json({ sections: (await people()).sections })
}))

app.post('/api/auth/section', wrap(requireSignIn), wrap(async (req, res) => {
  const { section } = req.body ?? {}
  if (req.session.role !== 'student') return fail(res, 403, 'Students only.')
  if (!(await people()).sections.includes(section)) return fail(res, 400, "That section isn't on any timetable.")
  const { matchedCount } = await store.accounts.updateOne({ _id: req.session.accountId, target: null }, { $set: { target: section } })
  if (!matchedCount) return fail(res, 409, 'Your section is already set.')
  await store.sessions.updateMany({ accountId: req.session.accountId }, { $set: { target: section } })
  res.json({ target: section })
}))

app.use('/api/timetables', wrap(requireSignIn))
app.use('/api/accounts', wrap(requireSignIn), requireMaster)

// Students and teachers only ever receive their own classes; the master account gets everything.
const ownEntries = (session) => (session.role === 'master' ? {} : { [`entries.${ENTRY_KEY[session.role]}`]: session.target })

app.get('/api/timetables', wrap(async (req, res) => {
  const status = await refreshIfStale()
  const list = await store.timetables.find(ownEntries(req.session), { projection: { name: 1, generatedAt: 1 } }).sort({ generatedAt: -1 }).toArray()
  res.json({ timetables: list.map(({ _id, ...t }) => ({ id: _id, ...t })), syncFailed: Boolean(status?.failed) })
}))

app.get('/api/timetables/:id', wrap(async (req, res) => {
  const t = await store.timetables.findOne({ _id: req.params.id, ...ownEntries(req.session) })
  if (!t) return fail(res, 404, 'Timetable not found.')
  const { _id, entries, ...rest } = t
  const key = ENTRY_KEY[req.session.role]
  res.json({ id: _id, ...rest, entries: key ? entries.filter((e) => e[key] === req.session.target) : entries })
}))

// Everyone an account can be linked to, across all saved timetables.
async function people() {
  const saved = await store.timetables.find({}, { projection: { 'entries.SectionID': 1, 'entries.TeacherID': 1, 'entries.TeacherName': 1 } }).toArray()
  const sections = new Set()
  const teachers = new Map()
  for (const e of saved.flatMap((t) => t.entries)) {
    sections.add(e.SectionID)
    teachers.set(e.TeacherID, e.TeacherName)
  }
  return {
    sections: [...sections].sort((a, b) => a.localeCompare(b)),
    teachers: [...teachers].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
  }
}

app.get('/api/accounts', wrap(async (_req, res) => {
  const accounts = await store.accounts.find({}, { projection: { passwordHash: 0 } }).sort({ role: 1, loginId: 1 }).toArray()
  res.json({ accounts: accounts.map(({ _id, loginId, ...a }) => ({ id: loginId, ...a })), ...await people() })
}))

app.post('/api/accounts', wrap(async (req, res) => {
  const { role, id, target, password } = req.body ?? {}
  if (!ENTRY_KEY[role]) return fail(res, 400, 'Choose student or teacher.')
  // A teacher signs in with their ID from the timetable, so it's what links them to it.
  const loginId = role === 'teacher' ? cleanId(target) : cleanId(id)
  if (!LOGIN_ID.test(loginId)) return fail(res, 400, 'IDs are 3 to 32 letters, digits or hyphens.')
  if (!okPassword(password)) return fail(res, 400, BAD_PASSWORD)
  const known = await people()
  if (role === 'teacher' && !known.teachers.some((t) => t.id === target)) return fail(res, 400, "That teacher isn't on any timetable.")
  if (role === 'student' && target && !known.sections.includes(target)) return fail(res, 400, "That section isn't on any timetable.")
  const linked = target || null // a student without a section chooses it at first sign-in
  try {
    await store.accounts.insertOne({ _id: accountId(role, loginId), role, loginId, target: linked, passwordHash: await hashPassword(password), createdAt: new Date() })
  } catch (err) {
    if (err.code === 11000) return fail(res, 409, `${loginId} already has an account.`)
    throw err
  }
  res.status(201).json({ role, id: loginId, target: linked })
}))

app.patch('/api/accounts/:role/:id', wrap(async (req, res) => {
  const { password } = req.body ?? {}
  if (!okPassword(password)) return fail(res, 400, BAD_PASSWORD)
  const key = accountId(req.params.role, req.params.id)
  const { matchedCount } = await store.accounts.updateOne({ _id: key }, { $set: { passwordHash: await hashPassword(password) } })
  if (!matchedCount) return fail(res, 404, 'Account not found.')
  await Promise.all([endSessionsOf(key), clearFailures(key)])
  res.json({ ok: true })
}))

app.delete('/api/accounts/:role/:id', wrap(async (req, res) => {
  const key = accountId(req.params.role, req.params.id)
  const { deletedCount } = await store.accounts.deleteOne({ _id: key })
  if (!deletedCount) return fail(res, 404, 'Account not found.')
  await endSessionsOf(key)
  res.json({ ok: true })
}))

app.use((err, _req, res, _next) => {
  if (err.status >= 400 && err.status < 500) return fail(res, err.status, 'Bad request.') // e.g. malformed JSON
  console.error(err)
  fail(res, 500, 'Server error.')
})

await store.connect()

// On Vercel the exported app runs as a function; locally we listen on a port.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 4100
  app.listen(port, () => console.log(`IntelliSched view API on http://localhost:${port}`))
}

export default app
