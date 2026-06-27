import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const TOPBAR_FONT = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"

const links = [
  { to: '/asteroids', label: 'Asteroid Monitor',    id: '01' },
  { to: '/iss',       label: 'ISS Tracker',         id: '02' },
  { to: '/weather',   label: 'Space Weather',       id: '03' },
  { to: '/orbit',     label: 'Orbit Explorer',      id: '04' },
  { to: '/planner',   label: 'Observation Planner', id: '05' },
  { to: '/learn',     label: 'Learning Hub',        id: '06' },
]

export default function TopNav() {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (document.getElementById('topnav-font-link')) return
    const link = document.createElement('link')
    link.id = 'topnav-font-link'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap'
    document.head.appendChild(link)
  }, [])

  // Fade in after mount — same pattern as AsteroidMonitor
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 20)
    return () => clearTimeout(id)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center',
      background: 'rgba(0,4,12,0.7)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(125,249,255,0.12)',
      padding: '0 28px',
      height: 52,
      // Slide down from above + fade in
      opacity: entered ? 1 : 0,
      transform: entered ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'opacity 500ms ease 60ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 60ms',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 36, flexShrink: 0, textDecoration: 'none' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '1.5px solid rgba(125,249,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'var(--cyan)',
        }}>✦</div>
        <span style={{ fontFamily: TOPBAR_FONT, fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>
          PROJECT ZENITH
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0 }}>
        {links.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'baseline', gap: 6,
              padding: '0 16px',
              borderRight: i < links.length - 1 ? '1px solid rgba(125,249,255,0.1)' : 'none',
              textDecoration: 'none',
              opacity: isActive ? 1 : 0.6,
              transition: 'opacity 0.2s',
            })}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => {
              if (!e.currentTarget.className?.includes?.('active')) {
                e.currentTarget.style.opacity = e.currentTarget.getAttribute('aria-current') ? 1 : 0.6
              }
            }}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  fontFamily: TOPBAR_FONT, fontSize: 9,
                  color: isActive ? 'rgba(125,249,255,0.7)' : 'rgba(125,249,255,0.3)',
                  letterSpacing: 1,
                }}>
                  {l.id}
                </span>
                <span style={{
                  fontFamily: TOPBAR_FONT, fontSize: 11,
                  color: isActive ? 'rgba(230,245,255,0.95)' : 'rgba(230,245,255,0.55)',
                  letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                }}>
                  {l.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
        <span style={{ fontFamily: TOPBAR_FONT, fontSize: 9, color: 'rgba(125,249,255,0.4)', letterSpacing: 2 }}>LIVE</span>
      </div>
    </nav>
  )
}