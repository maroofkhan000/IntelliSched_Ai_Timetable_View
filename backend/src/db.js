import dns from 'node:dns'
import { MongoClient } from 'mongodb'

let client
export let timetables, meta

export async function connect() {
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
}
