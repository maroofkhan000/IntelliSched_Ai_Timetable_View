import { useState } from 'react'
import { Arrow, Board, Bolt, BookOpen, Cap, CalendarDots, Group, Layers, ShieldCheck, Sliders, Sparkle, Trend } from '../Icons'
import { Scenery, StudentArt, TeacherArt } from './Illustrations'
import { SiteBrand, ThemeButton } from './Shared'

// The first page: pick student or teacher, then sign in.

const ROLES = [
  {
    role: 'student', Art: StudentArt, Icon: Cap, name: 'Student',
    text: 'View your class timetable, track updates, and manage your study preferences.',
    perks: [[CalendarDots, 'My Timetable'], [Trend, 'Class Updates'], [BookOpen, 'Study Planner']],
  },
  {
    role: 'teacher', Art: TeacherArt, Icon: Board, name: 'Teacher',
    text: 'Manage your teaching schedule, classes, room allocation, and preferences.',
    perks: [[CalendarDots, 'Teaching Schedule'], [Group, 'Class & Room Allocation'], [Sliders, 'Scheduling Preferences']],
  },
]

const STRENGTHS = [
  [Bolt, 'AI Timetable Generation', 'blue'],
  [ShieldCheck, 'Conflict Detection', 'green'],
  [Sliders, 'Personalized Preferences', 'purple'],
  [Layers, 'Multi-Role Support', 'violet'],
]

const STEPS = [
  ['Choose your role', 'Student or teacher, so the timetable is shown your way.'],
  ['Sign in', 'Use your enrollment number or Teacher ID and your password.'],
  ['See your week', 'Your classes, rooms and teachers, always the latest copy.'],
]

const NAV = [['top', 'Home'], ['features', 'Features'], ['how', 'How It Works'], ['about', 'About']]

export default function Landing() {
  const [section, setSection] = useState('top')

  const jump = (id) => {
    setSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: id === 'top' ? 'start' : 'center' })
  }

  return (
    <div className="role-page" id="top">
      <div className="rp-hero">
        <Scenery />
        <header className="rp-nav">
          <SiteBrand />
          <nav aria-label="Page">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" aria-current={section === id ? 'true' : undefined} onClick={() => jump(id)}>{label}</button>
            ))}
          </nav>
          <div className="rp-actions">
            <ThemeButton />
            <a className="rp-start" href="#/sign-in/student">Get Started <Arrow size={18} /></a>
          </div>
        </header>

        <main className="rp-main">
          <span className="rp-pill"><Sparkle size={18} /> AI-Powered Timetable</span>
          <h1>Choose <em>Your Role</em><span className="rp-dash" aria-hidden="true"><i /><i /><i /></span></h1>
          <p className="rp-lead">Get a personalized, conflict-free timetable for your academic journey.</p>

          <div className="rp-cards">
            {ROLES.map(({ role, Art, Icon, name, text, perks }) => (
              <section key={role} className={`rp-card ${role}`} aria-labelledby={`rp-${role}`}>
                <div className="rp-art"><Art /></div>
                <div className="rp-body">
                  <span className="rp-badge"><Icon size={30} /></span>
                  <h2 id={`rp-${role}`}>I am a <em>{name}</em></h2>
                  <p>{text}</p>
                  <ul className="rp-perks">
                    {perks.map(([PerkIcon, label]) => <li key={label}><PerkIcon size={26} />{label}</li>)}
                  </ul>
                  <a className="rp-go" href={`#/sign-in/${role}`}>Continue as {name} <Arrow size={20} /></a>
                </div>
              </section>
            ))}
          </div>

          <ul className="rp-strengths" id="features">
            {STRENGTHS.map(([Icon, label, tone]) => (
              <li key={label}><span className={`rp-dot ${tone}`}><Icon size={22} /></span>{label}</li>
            ))}
          </ul>
        </main>
      </div>

      <section className="rp-more" id="how" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol className="rp-steps">
          {STEPS.map(([title, text], i) => <li key={title}><span>{i + 1}</span><b>{title}</b><p>{text}</p></li>)}
        </ol>
      </section>

      <section className="rp-more" id="about" aria-labelledby="about-title">
        <h2 id="about-title">About</h2>
        <p>IntelliSched AI builds the college timetable without clashes between teachers, rooms and sections. This site shows that timetable to each student and teacher, kept in step with the latest version the college publishes.</p>
      </section>
    </div>
  )
}
