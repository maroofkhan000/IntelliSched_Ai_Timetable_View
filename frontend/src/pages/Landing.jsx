import { Brand, Leaves } from './Shared'
import { Arrow, Clock, People, Shield } from '../Icons'

const TONES = [0, 3, 1, 4, 5, 2, 4, 1, 0, 5, 3, 2, 1, 5, 2, 0, 4, 3, 0, 1]

const FEATURES = [
  { Icon: Clock, title: 'Your day first', text: 'See the class on now and what comes next' },
  { Icon: Shield, title: 'Always the latest', text: 'Updated from the college timetable' },
  { Icon: People, title: 'Students and teachers', text: 'One timetable, shown your way' },
]

export default function Landing() {
  return (
    <div className="landing">
      <Leaves />
      <header className="land-nav">
        <Brand />
        <div className="land-actions">
          <a className="btn ghost" href="#/role">Sign in</a>
          <a className="btn primary" href="#/role">Get started</a>
        </div>
      </header>

      <main className="hero">
        <div className="hero-copy">
          <h1>Smarter timetables for a <em>better</em> tomorrow</h1>
          <p>Find your classes, rooms and teachers for the whole week, wherever you are on campus.</p>
          <div className="hero-actions">
            <a className="btn primary" href="#/role">Get started <Arrow size={18} /></a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-card">
            <div className="art-rings"><i /><i /><i /><i /><i /><i /></div>
            <div className="art-grid">{TONES.map((t, i) => <span key={i} className={`tone-${t}`} />)}</div>
          </div>
          <span className="art-badge">AI</span>
          <span className="art-clock"><Clock size={46} /></span>
        </div>
      </main>

      <ul className="features">
        {FEATURES.map(({ Icon, title, text }) => (
          <li key={title}>
            <span className="soft-icon"><Icon /></span>
            <b>{title}</b>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
