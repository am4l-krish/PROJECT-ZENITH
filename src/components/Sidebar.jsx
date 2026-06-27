import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',          icon: '✦',  label: 'Dashboard' },
  { to: '/asteroids', icon: '☄',  label: 'Asteroid Monitor' },
  { to: '/iss',       icon: '🛸', label: 'ISS Tracker' },
  { to: '/weather',   icon: '☁',  label: 'Space Weather' },
  { to: '/orbit',     icon: '⊕',  label: '3D Orbit Explorer' },
  { to: '/planner',   icon: '◎',  label: 'Observation Planner' },
  { to: '/guide',     icon: '✧',  label: 'AI Space Guide' },
  { to: '/learn',     icon: '◈',  label: 'Cosmic Learning Hub' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Project<br />Zenith</h1>
        <p>The Celestial Eye</p>
      </div>

      <span className="nav-section">Modules</span>

      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--cyan-border)' }}>
        <p style={{ fontSize: '9px', color: 'var(--cyan-dim)', letterSpacing: '1px', lineHeight: 1.6 }}>
          TEAM NOVA<br />
          AMAL KRISHNA M · ALWIN SEBASTIAN · AMAL KRISHNA P
        </p>
      </div>
    </aside>
  )
}
