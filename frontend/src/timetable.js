export const ROLES = {
  student: { label: 'Student', pick: 'Section', key: 'SectionID' },
  teacher: { label: 'Teacher', pick: 'Teacher', key: 'TeacherID' },
}

// A subject keeps the same soft colour everywhere it appears.
export const toneOf = (code) => `tone-${[...String(code)].reduce((n, c) => n + c.charCodeAt(0), 0) % 6}`

export function weekStats(byDay, role, today) {
  const all = Object.values(byDay).flat()
  const people = role === 'student' ? all.map((b) => b.TeacherID) : all.map((b) => b.SectionID)
  return { today: (byDay[today] ?? []).length, week: all.length, subjects: new Set(all.map((b) => b.SubjectCode)).size, people: new Set(people).size }
}

const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

// The people to choose from, based on who actually appears in the timetable.
export function choices(timetable, role) {
  const seen = new Map()
  for (const e of timetable.entries) {
    if (role === 'student') seen.set(e.SectionID, e.SectionID)
    else seen.set(e.TeacherID, e.TeacherName)
  }
  return [...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label))
}

// One person's classes, with the two entries of a lab joined into a single block.
export function blocksFor(timetable, role, id) {
  const key = ROLES[role].key
  const mine = timetable.entries.filter((e) => e[key] === id).sort((a, b) => a.Period - b.Period)
  const byDay = Object.fromEntries(timetable.days.map((d) => [d, []]))
  for (const e of mine) {
    const day = byDay[e.Day]
    if (!day) continue
    if (e.cont && day.length) day[day.length - 1].to = e.Period
    else day.push({ ...e, from: e.Period, to: e.Period })
  }
  return byDay
}

export const timeOf = (timetable, b) => ({
  start: timetable.periods.find((p) => p.period === b.from)?.start ?? '',
  end: timetable.periods.find((p) => p.period === b.to)?.end ?? '',
})

export const todayName = (now = new Date()) => WEEK[now.getDay()]

// What this person has on right now, or what's next this week (wrapping round to next week).
export function nowOrNext(timetable, byDay, now = new Date()) {
  const today = now.getDay()
  const minute = now.getHours() * 60 + now.getMinutes()
  for (let ahead = 0; ahead < 7; ahead++) {
    const day = WEEK[(today + ahead) % 7]
    for (const b of byDay[day] ?? []) {
      const { start, end } = timeOf(timetable, b)
      if (!start || !end) continue
      if (ahead === 0 && toMin(end) <= minute) continue
      const current = ahead === 0 && toMin(start) <= minute
      return { block: b, day, start, end, current, later: ahead === 0 ? 'today' : ahead === 1 ? 'tomorrow' : day }
    }
  }
  return null
}

export const isCurrent = (timetable, b, day, now = new Date()) => {
  const { start, end } = timeOf(timetable, b)
  if (day !== todayName(now) || !start || !end) return false
  const minute = now.getHours() * 60 + now.getMinutes()
  return toMin(start) <= minute && minute < toMin(end)
}
