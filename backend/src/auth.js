import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import * as store from './db.js'

const SESSION_DAYS = 7
const MAX_FAILURES = 5
export const LOCK_MINUTES = 15

const derive = promisify(scrypt)
const sha256 = (text) => createHash('sha256').update(String(text)).digest()

export const sameText = (a, b) => timingSafeEqual(sha256(a), sha256(b))

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await derive(password, salt, 64)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

// Compared against when the ID doesn't exist, so a wrong ID takes as long as a wrong password.
const NO_ACCOUNT = await hashPassword(randomBytes(16).toString('hex'))

export async function verifyPassword(password, stored = NO_ACCOUNT) {
  const [salt, key] = stored.split(':')
  const attempt = await derive(password, Buffer.from(salt, 'hex'), 64)
  return timingSafeEqual(attempt, Buffer.from(key, 'hex'))
}

// Only a hash of the token is stored, so reading the database doesn't reveal a usable session.
export async function startSession({ accountId, role, id, target }) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000)
  await store.sessions.insertOne({ _id: sha256(token).toString('hex'), accountId, role, id, target, expiresAt })
  return token
}

const tokenOf = (req) => req.get('authorization')?.match(/^Bearer (\S+)$/)?.[1]

export const endSession = (req) => store.sessions.deleteOne({ _id: sha256(tokenOf(req) ?? '').toString('hex') })
export const endSessionsOf = (accountId) => store.sessions.deleteMany({ accountId })

export async function requireSignIn(req, res, next) {
  const token = tokenOf(req)
  const session = token && await store.sessions.findOne({ _id: sha256(token).toString('hex'), expiresAt: { $gt: new Date() } })
  if (!session) return res.status(401).json({ error: 'Sign in first.' })
  req.session = session
  next()
}

export const requireMaster = (req, res, next) => (req.session.role === 'master' ? next() : res.status(403).json({ error: 'Master account only.' }))

// Counted per ID, because client addresses aren't dependable behind Vercel.
export async function isLocked(key) {
  const row = await store.attempts.findOne({ _id: key })
  return Boolean(row && row.count >= MAX_FAILURES && row.expiresAt > new Date())
}

export async function recordFailure(key) {
  await store.attempts.deleteOne({ _id: key, expiresAt: { $lte: new Date() } })
  await store.attempts.updateOne({ _id: key }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + LOCK_MINUTES * 60_000) } }, { upsert: true })
}

export const clearFailures = (key) => store.attempts.deleteOne({ _id: key })
