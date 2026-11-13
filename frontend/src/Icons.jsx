const Svg = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

export const Calendar = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
export const Home = (p) => <Svg {...p}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></Svg>
export const Book = (p) => <Svg {...p}><path d="M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2z" /><path d="M4 20a2 2 0 0 0 2 2h14v-4" /></Svg>
export const People = (p) => <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.9.8 3.1 2.6 3.5 5.2" /></Svg>
export const Clock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>
export const Exit = (p) => <Svg {...p}><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" /></Svg>
export const Download = (p) => <Svg {...p}><path d="M12 4v11M7 10.5l5 5 5-5M4 20h16" /></Svg>
export const Arrow =(p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
export const Cap = (p) => <Svg {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c1.6 1.5 3.6 2.2 6 2.2s4.4-.7 6-2.2v-4.5M22 9v5" /></Svg>
export const Shield = (p) => <Svg {...p}><path d="M12 3l8 3v6c0 4.5-3 7.8-8 9-5-1.2-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></Svg>
export const CalendarDots = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01" strokeWidth="2.6" /></Svg>
export const Sparkle = (p) => <Svg {...p}><path d="M10 3.5l1.6 4.4L16 9.5l-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6z" fill="currentColor" stroke="none" /><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8zM18.5 3.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" fill="currentColor" stroke="none" /></Svg>
export const Sun = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Svg>
export const Moon = (p) => <Svg {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></Svg>
export const Trend = (p) => <Svg {...p}><path d="M4 20h16" /><path d="M5 16l4.5-4.5 3 3L19 8" /><path d="M15 8h4v4" /><path d="M6 20v-2M10 20v-4M14 20v-3M18 20v-5" opacity=".55" /></Svg>
export const BookOpen = (p) => <Svg {...p}><path d="M12 6.5C10 5 7.5 4.5 3.5 4.5v13c4 0 6.5.5 8.5 2 2-1.5 4.5-2 8.5-2v-13c-4 0-6.5.5-8.5 2z" /><path d="M12 6.5v13" /></Svg>
export const Board = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="13" rx="2" /><circle cx="8.5" cy="9.5" r="2" /><path d="M5.5 14.5c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2M14 8.5h4M14 11.5h3M8 21l2-4M16 21l-2-4" /></Svg>
export const Group = (p) => <Svg {...p}><circle cx="12" cy="7.5" r="3" /><circle cx="5.5" cy="9.5" r="2.2" /><circle cx="18.5" cy="9.5" r="2.2" /><path d="M7 19.5c.4-3.3 2.4-5.2 5-5.2s4.6 1.9 5 5.2M2 18.5c.3-2.3 1.6-3.7 3.5-3.7.9 0 1.6.3 2.2.8M22 18.5c-.3-2.3-1.6-3.7-3.5-3.7-.9 0-1.6.3-2.2.8" /></Svg>
export const Sliders = (p) => <Svg {...p}><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></Svg>
export const Bolt = (p) => <Svg {...p}><path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z" fill="currentColor" stroke="none" /></Svg>
export const ShieldCheck = (p) => <Svg {...p}><path d="M12 2.8l8 3v6.2c0 4.6-3.1 8-8 9.2-4.9-1.2-8-4.6-8-9.2V5.8z" fill="currentColor" stroke="none" /><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2.2" /></Svg>
export const Layers = (p) => <Svg {...p}><path d="M12 3l9 4.5-9 4.5-9-4.5z" /><path d="M3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" /></Svg>
export const ArrowLeft = (p) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
