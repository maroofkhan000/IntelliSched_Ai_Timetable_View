import dns from 'node:dns'
import { MongoClient } from 'mongodb'

let client
export let timetables, meta, accounts, sessions, attempts

// Atlas ends the TLS handshake with "internal error" (alert 80) when this machine's IP isn't on its access list.
const isAtlasIpBlock = (err) => /alert internal error|SSL alert number 80/.test(`${err?.message} ${err?.cause?.message}`)

export async function connect() {
  try {
    await open()
  } catch (err) {
    if (!isAtlasIpBlock(err)) throw err
    console.error('\nMongoDB Atlas refused the connection: this computer\'s IP address is not on the cluster\'s access list.')
    console.error('Fix: Atlas -> Network Access -> Add IP Address -> Add Current IP Address, wait a minute, then restart.\n')
    process.exit(1)
  }
}

async function open() {
  client = new MongoClient(process.env.MONGODB_URI)
  try {
    await client.connect()
  } catch (err) {
    // Some home routers answer the mongodb+srv SRV lookup badly. Retry once through public resolvers.
    if (err?.syscall !== 'querySrv') throw err
    console.warn(`SRV lookup failed (${err.code}); retrying with public DNS`)
    dns.setServers(['1.1.1.1', '8.8.8.8'])
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
  }
  const db = client.db(process.env.MONGODB_DB || 'intellisched_view')
  timetables = db.collection('timetables') // one copy per timetable saved in the main app
  meta = db.collection('meta') // when the last sync ran and whether it worked
  accounts = db.collection('accounts') // student and teacher sign-ins, made by the master account
  sessions = db.collection('sessions') // who is signed in
  attempts = db.collection('attempts') // recent wrong passwords, per ID
  await Promise.all([sessions, attempts].map((c) => c.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })))
}
