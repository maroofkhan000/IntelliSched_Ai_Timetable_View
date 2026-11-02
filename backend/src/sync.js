import * as store from './db.js'

const STATUS = 'sync'
const staleAfter = () => (Number(process.env.SYNC_MINUTES) || 5) * 60_000

const fromMain = async (path) => {
  const res = await fetch(`${process.env.MAIN_API_URL.replace(/\/$/, '')}/api/public/${path}`, {
    headers: { 'x-api-key': process.env.MAIN_API_KEY },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Main API answered ${res.status} for ${path}`)
  return res.json()
}

// Copies new or changed timetables from the main app, and drops ones it no longer has.
async function sync() {
  const list = await fromMain('timetables')
  const saved = await store.timetables.find({}, { projection: { generatedAt: 1 } }).toArray()
  const known = new Map(saved.map((t) => [t._id, t.generatedAt]))
  for (const t of list) {
    if (known.get(t.id) === t.generatedAt) continue
    const { id, ...doc } = await fromMain(`timetables/${t.id}`)
    await store.timetables.replaceOne({ _id: id }, doc, { upsert: true })
  }
  await store.timetables.deleteMany({ _id: { $nin: list.map((t) => t.id) } })
}

// One sync at a time, however many visitors arrive together.
let running = null

// Refreshes the copy when it's old. A failed sync never blocks a visitor: they get the saved copy.
export async function refreshIfStale() {
  const status = await store.meta.findOne({ _id: STATUS })
  const age = Date.now() - (status?.attemptedAt?.getTime() ?? 0)
  if (age < staleAfter()) return status
  running ??= (async () => {
    const attemptedAt = new Date()
    try {
      await sync()
      await store.meta.replaceOne({ _id: STATUS }, { attemptedAt, syncedAt: attemptedAt, failed: false }, { upsert: true })
    } catch (e) {
      console.error('sync failed:', e.message)
      await store.meta.replaceOne({ _id: STATUS }, { attemptedAt, syncedAt: status?.syncedAt ?? null, failed: true }, { upsert: true })
    } finally {
      running = null
    }
  })()
  await running
  return store.meta.findOne({ _id: STATUS })
}
