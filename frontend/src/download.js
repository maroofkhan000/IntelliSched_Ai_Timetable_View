const cellText = (b, role) => [b.SubjectName + (b.Type === 'Lab' ? ' (Lab)' : ''), b.RoomID, role === 'student' ? b.TeacherName : b.SectionID].join('\n')

// One row per period and break, one column per day. A lab appears in each period it covers.
export function pdfRows(timetable, byDay, role) {
  const { days, periods } = timetable
  const rows = []
  for (const p of periods) {
    const time = p.start ? `${p.start}-${p.end}` : `Period ${p.period}`
    rows.push([time, ...days.map((d) => {
      const b = byDay[d].find((x) => x.from <= p.period && p.period <= x.to)
      return b ? cellText(b, role) : ''
    })])
    if (p.break) rows.push([{ content: `Break ${p.break.start} to ${p.break.end}`, colSpan: days.length + 1, styles: { halign: 'center', textColor: [90, 113, 107] } }])
  }
  return rows
}

// The PDF libraries load only when someone downloads, so the site stays quick to open.
export async function downloadTimetable({ timetable, byDay, role, who }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(`Timetable: ${who}`, 14, 15)
  doc.setFontSize(9)
  doc.setTextColor(90, 113, 107)
  doc.text(`${timetable.name}, published ${new Date(timetable.generatedAt).toLocaleDateString()}`, 14, 21)
  autoTable(doc, {
    startY: 26,
    margin: { left: 14, right: 14, bottom: 10 },
    head: [['Time', ...timetable.days]],
    body: pdfRows(timetable, byDay, role),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5, lineColor: [223, 236, 230], valign: 'middle' },
    headStyles: { fillColor: [11, 93, 78], textColor: 255 },
    columnStyles: { 0: { cellWidth: 24, fontStyle: 'bold' } },
  })
  doc.save(`timetable-${who.replace(/[^A-Za-z0-9-]+/g, '-')}.pdf`)
}
