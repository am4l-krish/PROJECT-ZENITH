import { useEffect, useState } from 'react'

const NASA_KEY = import.meta.env.VITE_NASA_API_KEY

const API = {
  flares:   `https://api.nasa.gov/DONKI/FLR?startDate=${daysAgo(7)}&endDate=${today()}&api_key=${NASA_KEY}`,
  cme:      `https://api.nasa.gov/DONKI/CME?startDate=${daysAgo(7)}&endDate=${today()}&api_key=${NASA_KEY}`,
  gst:      `https://api.nasa.gov/DONKI/GST?startDate=${daysAgo(7)}&endDate=${today()}&api_key=${NASA_KEY}`,
  kp:       'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
  solarWind:'https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function flareClass(cls) {
  if (!cls) return 'safe'
  if (cls.startsWith('X')) return 'danger'
  if (cls.startsWith('M')) return 'moderate'
  return 'safe'
}

function kpLevel(kp) {
  if (kp >= 7) return 'danger'
  if (kp >= 5) return 'moderate'
  return 'safe'
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function KpSparkline({ data }) {
  if (!data?.length) return null
  const vals = data.slice(-48).map(d => parseFloat(d[1]) || 0)
  const max = Math.max(...vals, 9)
  const W = 320, H = 56
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - (v / max) * H}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      <line x1="0" y1={H - (5 / max) * H} x2={W} y2={H - (5 / max) * H}
        stroke="rgba(255,204,0,0.3)" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="0" y1={H - (7 / max) * H} x2={W} y2={H - (7 / max) * H}
        stroke="rgba(255,68,68,0.3)" strokeWidth="1" strokeDasharray="4,4" />
      <polyline points={pts} fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.85" />
      {vals.length > 0 && (
        <circle cx={W} cy={H - (vals[vals.length - 1] / max) * H} r="3" fill="var(--cyan)" />
      )}
    </svg>
  )
}

export default function SpaceWeather() {
  const [flares,   setFlares]   = useState([])
  const [cmes,     setCmes]     = useState([])
  const [gsts,     setGsts]     = useState([])
  const [kpData,   setKpData]   = useState([])
  const [windData, setWindData] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(API.flares).then(r => r.json()).catch(() => []),
      fetch(API.cme).then(r => r.json()).catch(() => []),
      fetch(API.gst).then(r => r.json()).catch(() => []),
      fetch(API.kp).then(r => r.json()).catch(() => []),
      fetch(API.solarWind).then(r => r.json()).catch(() => []),
    ]).then(([fl, cm, gs, kp, wind]) => {
      setFlares(Array.isArray(fl) ? fl.reverse() : [])
      setCmes(Array.isArray(cm) ? cm.reverse() : [])
      setGsts(Array.isArray(gs) ? gs.reverse() : [])
      setKpData(Array.isArray(kp) ? kp.slice(1) : [])
      if (Array.isArray(wind) && wind.length > 1) {
        const last = wind[wind.length - 1]
        setWindData({ speed: parseFloat(last[1]), density: parseFloat(last[2]) })
      }
      setLoading(false)
    }).catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const latestKp    = kpData.length ? parseFloat(kpData[kpData.length - 1][1]) : null
  const kpLvl       = latestKp !== null ? kpLevel(latestKp) : 'safe'
  const latestFlare = flares[0]
  const flareLvl    = latestFlare ? flareClass(latestFlare.classType) : 'safe'
  const activeGst   = gsts[0]

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Space Weather Center</h2>
        <p>Solar activity · Geomagnetic storms · NASA DONKI + NOAA SWPC</p>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height: 'calc(100% - 100px)' }}>
          <p>FETCHING SOLAR DATA...</p>
        </div>
      ) : (
        <>
          {!NASA_KEY && (
            <div className="card" style={{ borderColor: 'rgba(255,68,68,0.3)', marginBottom: 16 }}>
              <div className="card-title" style={{ color: 'var(--red)' }}>⚠ Missing API Key</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                VITE_NASA_API_KEY is not set. Add it to .env.local and restart the dev server.
              </p>
            </div>
          )}

          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="card stat-block">
              <div className="stat-label">Kp Index</div>
              <div className="stat-value">{latestKp !== null ? latestKp.toFixed(1) : '—'}</div>
              <div className="stat-sub">
                <span className={`badge badge-${kpLvl}`}>
                  {latestKp !== null ? (kpLvl === 'danger' ? 'Severe storm' : kpLvl === 'moderate' ? 'Active' : 'Quiet') : 'No data'}
                </span>
              </div>
            </div>
            <div className="card stat-block">
              <div className="stat-label">Latest Flare</div>
              <div className="stat-value">{latestFlare?.classType || '—'}</div>
              <div className="stat-sub">{latestFlare ? formatDate(latestFlare.beginTime) : 'None in 7 days'}</div>
            </div>
            <div className="card stat-block">
              <div className="stat-label">Solar Wind</div>
              <div className="stat-value">{windData ? `${Math.round(windData.speed)} km/s` : '—'}</div>
              <div className="stat-sub">{windData ? `Density ${windData.density?.toFixed(1)} p/cc` : 'No data'}</div>
            </div>
            <div className="card stat-block">
              <div className="stat-label">Geo Storm</div>
              <div className="stat-value">{activeGst ? `Kp ${activeGst.allKpIndex?.[0]?.kpIndex ?? '—'}` : 'None'}</div>
              <div className="stat-sub">{activeGst ? formatDate(activeGst.startTime) : 'No active storm'}</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Kp Index — 48h History</div>
            <KpSparkline data={kpData} />
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="card">
              <div className="card-title">Solar Flares <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>· {flares.length} events</span></div>
              {flares.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px 0' }}>No flares detected</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                  {flares.slice(0, 10).map((f, i) => {
                    const lvl = flareClass(f.classType)
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--cyan-faint)' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>{f.classType || '—'}</div>
                          <div className="stat-sub">{formatDate(f.beginTime)} · {f.sourceLocation || 'Unknown region'}</div>
                        </div>
                        <span className={`badge badge-${lvl}`}>{lvl.toUpperCase()}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Coronal Mass Ejections <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>· {cmes.length} events</span></div>
              {cmes.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px 0' }}>No CMEs detected</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                  {cmes.slice(0, 8).map((c, i) => {
                    const analysis = c.cmeAnalyses?.[0]
                    const speed = analysis?.speed ? `${Math.round(analysis.speed)} km/s` : '—'
                    const type = analysis?.type || '—'
                    return (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--cyan-faint)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className="stat-sub">{formatDate(c.startTime)}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: type === 'S' ? 'var(--red)' : 'var(--yellow)' }}>{type}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Speed <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{speed}</span>
                          {analysis?.halfAngle && <> · Half-angle <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(analysis.halfAngle)}°</span></>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {gsts.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(255,68,68,0.3)' }}>
              <div className="card-title" style={{ color: 'var(--red)' }}>⚠ Geomagnetic Storms — Last 7 Days</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gsts.slice(0, 5).map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,68,68,0.08)' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text)' }}>{formatDate(g.startTime)}</div>
                      <div className="stat-sub">{g.allKpIndex?.length ? `${g.allKpIndex.length} Kp readings` : 'Storm event'}</div>
                    </div>
                    <span className="badge badge-danger">Kp {g.allKpIndex?.[0]?.kpIndex ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}