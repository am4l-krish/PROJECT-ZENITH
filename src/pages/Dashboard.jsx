import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, getDateRange, threatScore } from '../utils/api.js'

const modules = [
  { to: '/asteroids', icon: '☄',  label: 'Asteroid Monitor',     desc: 'Near-Earth objects & proximity alerts' },
  { to: '/iss',       icon: '🛸', label: 'ISS Tracker',          desc: 'Live International Space Station position' },
  { to: '/weather',   icon: '☁',  label: 'Space Weather Center', desc: 'Solar activity & aurora forecasts' },
  { to: '/orbit',     icon: '⊕',  label: '3D Orbit Explorer',    desc: 'Interactive globe with orbital overlays' },
  { to: '/planner',   icon: '◎',  label: 'Observation Planner',  desc: 'Stargazing conditions for your location' },
  { to: '/guide',     icon: '✧',  label: 'AI Space Guide',       desc: 'Conversational astronomy assistant' },
  { to: '/learn',     icon: '◈',  label: 'Cosmic Learning Hub',  desc: 'NASA APOD & educational articles' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: '—', hazardous: '—', closest: '—' })
  const [apod, setApod] = useState(null)

  useEffect(() => {
    const { start, end } = getDateRange(7)
    fetch(API.nasaNeoWs(start, end))
      .then(r => r.json())
      .then(data => {
        const all = Object.values(data.near_earth_objects).flat()
        const hazardous = all.filter(a => a.is_potentially_hazardous_asteroid)
        const sorted = [...all].sort((a, b) =>
          parseFloat(a.close_approach_data[0].miss_distance.kilometers) -
          parseFloat(b.close_approach_data[0].miss_distance.kilometers)
        )
        const closestKm = parseFloat(sorted[0]?.close_approach_data[0].miss_distance.kilometers)
        setStats({
          total: all.length,
          hazardous: hazardous.length,
          closest: closestKm ? (closestKm / 1000).toFixed(0) + 'k km' : '—',
        })
      })
      .catch(() => {})

    fetch(API.nasaApod())
      .then(r => r.json())
      .then(setApod)
      .catch(() => {})
  }, [])

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Mission Control</h2>
        <p>Real-time celestial intelligence platform · {new Date().toDateString()}</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Asteroids (7 days)</div>
          <div className="stat-value glow">{stats.total}</div>
          <div className="stat-sub">Near-Earth objects tracked</div>
        </div>
        <div className="card">
          <div className="stat-label">Potentially Hazardous</div>
          <div className="stat-value" style={{ color: stats.hazardous > 0 ? 'var(--red)' : 'var(--green)' }}>
            {stats.hazardous}
          </div>
          <div className="stat-sub">Flagged by NASA</div>
        </div>
        <div className="card">
          <div className="stat-label">Closest Approach</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{stats.closest}</div>
          <div className="stat-sub">Next 7 days</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {apod && (
          <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div className="card-title" style={{ marginBottom: 0, writingMode: 'vertical-rl', transform: 'rotate(180deg)', flexShrink: 0 }}>
              APOD
            </div>
            {apod.media_type === 'image' && (
              <img src={apod.url} alt={apod.title} style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--cyan-border)' }} />
            )}
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--cyan)', marginBottom: 6 }}>{apod.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {apod.explanation?.slice(0, 220)}...
              </p>
              <button className="btn" style={{ marginTop: 10, fontSize: 10 }} onClick={() => navigate('/learn')}>
                View in Learning Hub →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card-title">All Modules</div>
      <div className="grid-3" style={{ gap: 12 }}>
        {modules.map(m => (
          <div
            key={m.to}
            className="card"
            style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => navigate(m.to)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cyan-border)'}
          >
            <div style={{ fontSize: 24, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--cyan)', marginBottom: 4, letterSpacing: 0.5 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
