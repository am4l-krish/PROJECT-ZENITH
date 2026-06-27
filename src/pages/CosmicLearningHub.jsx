export default function CosmicLearningHub() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Cosmic Learning Hub</h2>
        <p>NASA Astronomy Picture of the Day · Educational resources · Space news</p>
      </div>
      <div className="stub-page" style={{ height: 'calc(100% - 100px)' }}>
        <div className="stub-icon">✦</div>
        <h2>Coming Soon</h2>
        <p>Daily NASA imagery, curated learning resources, and space news</p>
        <p style={{ fontSize: 11, color: 'var(--cyan-dim)' }}>Integrate: NASA APOD API</p>
      </div>
    </div>
  )
}