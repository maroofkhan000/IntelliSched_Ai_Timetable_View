import { useEffect, useState } from 'react'
import { CalendarDots, Moon, Sun } from '../Icons'

const THEME = 'theme'
const savedTheme = () => {
  try { return localStorage.getItem(THEME) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}
export const applyTheme = (theme = savedTheme()) => { document.documentElement.dataset.theme = theme }

export const useTheme = () => {
  const [theme, setTheme] = useState(savedTheme)
  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(THEME, theme) } catch { /* the page works without it */ }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

export const Brand = () => (
  <a className="brand" href="#/">
    <span className="brand-mark"><CalendarDots size={19} /></span>
    IntelliSched AI
  </a>
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

// Header pieces shared by the role page and the sign-in pages.
export const SiteBrand = () => (
  <a className="rp-brand" href="#/">
    <span className="rp-logo"><CalendarDots size={24} /></span>
    <span><b>IntelliSched AI</b><small>Smart Timetable System</small></span>
  </a>
)

export const ThemeButton = () => {
  const [theme, toggleTheme] = useTheme()
  return (
    <button type="button" className="rp-theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>
      {theme === 'dark' ? <Moon size={20} /> : <Sun size={22} />}
    </button>
  )
}
