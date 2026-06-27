export default function SpaceWeather() {
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
