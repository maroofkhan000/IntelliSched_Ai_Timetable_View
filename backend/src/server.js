import 'dotenv/config'
import express from 'express'
import { createHash, timingSafeEqual } from 'node:crypto'
import * as store from './db.js'
import { refreshIfStale } from './sync.js'

for (const k of ['MONGODB_URI', 'MAIN_API_URL', 'MAIN_API_KEY', 'MASTER_ID', 'MASTER_PASSWORD']) if (!process.env[k]?.trim()) throw new Error(`Missing ${k} (set it in backend/.env locally, or in Vercel's environment variables)`)
if (process.env.MASTER_PASSWORD.length < 10) throw new Error('MASTER_PASSWORD must be at least 10 characters')

const app = express()
app.use(express.json({ limit: '10kb' }))

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const fail = (res, code, message) => res.status(code).json({ error: message })

const sameText = (a, b) => timingSafeEqual(createHash('sha256').update(String(a)).digest(), createHash('sha256').update(String(b)).digest())

// The master account lives in the environment. It chooses what the site shows, nothing more:
// the timetable routes below are public, so there's no token to issue.
app.post('/api/auth/master', (req, res) => {
  const { id = '', password = '' } = req.body ?? {}
  const idOk = sameText(id, process.env.MASTER_ID.trim())
  const passwordOk = sameText(password, process.env.MASTER_PASSWORD)
  if (!idOk || !passwordOk) return fail(res, 401, 'Wrong ID or password.')
  res.json({ ok: true })
})

// Students and teachers need no account: this site only reads timetables.
app.get('/api/timetables', wrap(async (_req, res) => {
  const status = await refreshIfStale()
  const list = await store.timetables.find({}, { projection: { name: 1, generatedAt: 1 } }).sort({ generatedAt: -1 }).toArray()
  res.json({ timetables: list.map(({ _id, ...t }) => ({ id: _id, ...t })), syncFailed: Boolean(status?.failed) })
}))

app.get('/api/timetables/:id', wrap(async (req, res) => {
  const t = await store.timetables.findOne({ _id: req.params.id })
  if (!t) return fail(res, 404, 'Timetable not found.')
  const { _id, ...rest } = t
  res.json({ id: _id, ...rest })
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
