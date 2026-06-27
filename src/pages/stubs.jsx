export function SpaceWeather() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Space Weather Center</h2>
        <p>Solar activity · Geomagnetic storms · Aurora forecasts</p>
      </div>
      <div className="stub-page" style={{ height: 'calc(100% - 100px)' }}>
        <div className="stub-icon">☁</div>
        <h2>Coming Soon</h2>
        <p>Solar wind data, Kp-index charts, and aurora visibility maps</p>
        <p style={{ fontSize: 11, color: 'var(--cyan-dim)' }}>Integrate: NOAA Space Weather API · NASA DONKI</p>
      </div>
    </div>
  )
}

export function OrbitExplorer() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>3D Orbit Explorer</h2>
        <p>Interactive Three.js globe · Satellite and planetary orbital overlays</p>
      </div>
      <div className="stub-page" style={{ height: 'calc(100% - 100px)' }}>
        <div className="stub-icon">⊕</div>
        <h2>Coming Soon</h2>
        <p>Full 3D Earth with real satellite TLE orbital overlays</p>
        <p style={{ fontSize: 11, color: 'var(--cyan-dim)' }}>Integrate: CelesTrak TLE data · satellite.js</p>
      </div>
    </div>
  )
}

export function ObservationPlanner() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Observation Planner</h2>
        <p>Location-based stargazing conditions · Upcoming celestial events</p>
      </div>
      <div className="stub-page" style={{ height: 'calc(100% - 100px)' }}>
        <div className="stub-icon">◎</div>
        <h2>Coming Soon</h2>
        <p>Sky clarity index, moon phase calendar, planet visibility windows</p>
        <p style={{ fontSize: 11, color: 'var(--cyan-dim)' }}>Integrate: OpenWeather API · Astronomy API</p>
      </div>
    </div>
  )
}
