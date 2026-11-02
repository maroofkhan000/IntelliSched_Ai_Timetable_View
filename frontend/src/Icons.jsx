const Svg = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

export const Calendar = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
export const Home = (p) => <Svg {...p}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></Svg>
export const Book = (p) => <Svg {...p}><path d="M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2z" /><path d="M4 20a2 2 0 0 0 2 2h14v-4" /></Svg>
export const People = (p) => <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.9.8 3.1 2.6 3.5 5.2" /></Svg>
export const Clock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>
export const Exit = (p) => <Svg {...p}><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" /></Svg>
export const Arrow = (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
export const Cap = (p) => <Svg {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c1.6 1.5 3.6 2.2 6 2.2s4.4-.7 6-2.2v-4.5M22 9v5" /></Svg>
export const Shield = (p) => <Svg {...p}><path d="M12 3l8 3v6c0 4.5-3 7.8-8 9-5-1.2-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></Svg>
