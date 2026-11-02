import { Calendar } from '../Icons'

export const Brand = () => (
  <a className="brand" href="#/">
    <span className="brand-mark"><Calendar size={19} /></span>
    IntelliSched AI
  </a>
)

export const Leaves = () => (
  <div className="leaves" aria-hidden="true"><i /><i /><i /></div>
)

export const LoadProblem = ({ status, onRetry }) => {
  if (status === 'loading') return <p className="load-note">Loading the timetable</p>
  if (status === 'empty') return <div className="load-note"><h2>No timetable yet</h2><p>It will appear here once the college publishes it.</p></div>
  return (
    <div className="load-note">
      <h2>The timetable didn't load</h2>
      <p>Check your connection, then try again.</p>
      <button type="button" className="btn primary" onClick={onRetry}>Try again</button>
    </div>
  )
}
