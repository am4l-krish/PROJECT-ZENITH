import { NavLink } from 'react-router-dom'

const links = [
  { to: '/asteroids', label: 'Asteroid Monitor',    id: '01' },
  { to: '/iss',       label: 'ISS Tracker',         id: '02' },
  { to: '/weather',   label: 'Space Weather',       id: '03' },
  { to: '/orbit',     label: 'Orbit Explorer',      id: '04' },
  { to: '/planner',   label: 'Observation Planner', id: '05' },
  { to: '/learn',     label: 'Learning Hub',        id: '06' },
]

export default function TopNav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center',
      background: 'rgba(0,4,12,0.7)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(125,249,255,0.12)',
      padding: '0 28px',
      height: 52,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 36, flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '1.5px solid rgba(125,249,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'var(--cyan)',
        }}>✦</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>
          PROJECT ZENITH
        </span>
      </div>

      {/* Nav links — manifest style */}
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
              // Keep active link at full opacity
              if (!e.currentTarget.className?.includes?.('active')) {
                e.currentTarget.style.opacity = e.currentTarget.getAttribute('aria-current') ? 1 : 0.6
              }
            }}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: isActive ? 'rgba(125,249,255,0.7)' : 'rgba(125,249,255,0.3)',
                  letterSpacing: 1,
                }}>
                  {l.id}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(125,249,255,0.4)', letterSpacing: 2 }}>LIVE</span>
      </div>
    </nav>
  )
}