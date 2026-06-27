import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MODULES = [
  { id: '01', name: 'Asteroid Monitor',     desc: 'NEO tracking & threat scoring', path: '/asteroids' },
  { id: '02', name: 'ISS Tracker',          desc: 'Live orbital position',         path: '/iss' },
  { id: '03', name: 'Space Weather',        desc: 'Flares & geomagnetic activity', path: '/weather' },
  { id: '04', name: 'Orbit Explorer',       desc: 'Visualize orbital mechanics',   path: '/orbit' },
  { id: '05', name: 'Observation Planner',  desc: 'Plan your next stargazing run', path: '/planner' },
  { id: '06', name: 'AI Space Guide',       desc: 'Ask anything about the cosmos', path: '/guide' },
  { id: '07', name: 'Cosmic Learning Hub',  desc: 'Learn the science behind it',   path: '/learn' },
]

function useStarfield(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf, stars = [], shooters = [], W, H, nextShootAt = 1.4

    function resize() {
      W = canvas.width = canvas.clientWidth * devicePixelRatio
      H = canvas.height = canvas.clientHeight * devicePixelRatio
      const count = Math.floor((W * H) / 5200)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.4,
        drift: 0.02 + Math.random() * 0.05,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn one shooting star at a time, entering from a random edge near the
    // top and streaking diagonally down-left or down-right with a fading tail.
    function spawnShooter() {
      const dpr = devicePixelRatio
      const dir = Math.random() < 0.5 ? 1 : -1
      const slope = Math.PI * 0.16 + Math.random() * Math.PI * 0.16 // ~29°–58° from horizontal
      shooters.push({
        x: dir > 0 ? Math.random() * W * 0.5 - W * 0.1 : W * 0.6 + Math.random() * W * 0.5,
        y: -H * 0.04 + Math.random() * H * 0.32,
        dx: Math.cos(slope) * dir,
        dy: Math.sin(slope),
        speed: (380 + Math.random() * 300) * dpr,
        len: (170 + Math.random() * 210) * dpr,
        width: (1.1 + Math.random() * 0.9) * dpr,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
        opacity: 0.55 + Math.random() * 0.35,
      })
    }

    let t = 0
    function tick() {
      raf = requestAnimationFrame(tick)
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      for (const s of stars) {
        s.y += s.drift
        if (s.y > H) s.y = 0
        const b = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.fillStyle = `rgba(190,225,255,${b})`
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (t > nextShootAt && shooters.length < 2) {
        spawnShooter()
        nextShootAt = t + 2.6 + Math.random() * 4.4
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const m = shooters[i]
        m.life += 0.016
        const progress = m.life / m.maxLife
        if (progress >= 1) { shooters.splice(i, 1); continue }

        const dist = m.speed * m.life
        const headX = m.x + m.dx * dist
        const headY = m.y + m.dy * dist
        const tailX = headX - m.dx * m.len
        const tailY = headY - m.dy * m.len

        const fadeIn = Math.min(1, progress / 0.12)
        const fadeOut = Math.min(1, (1 - progress) / 0.5)
        const alpha = fadeIn * fadeOut * m.opacity

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
        grad.addColorStop(0, 'rgba(180,220,255,0)')
        grad.addColorStop(0.7, `rgba(190,230,255,${alpha * 0.6})`)
        grad.addColorStop(1, `rgba(255,255,255,${alpha})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = m.width
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()

        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.arc(headX, headY, m.width * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [canvasRef])
}

function useUtcClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')
  const date = now.toISOString().slice(0, 10)
  return { time: `${hh}:${mm}:${ss}`, date }
}

export default function LandingPage() {
  const starCanvas = useRef(null)
  useStarfield(starCanvas)
  const { time, date } = useUtcClock()
  const [armed, setArmed] = useState(false)
  const [zooming, setZooming] = useState(false)
  const navigate = useNavigate()

  function handleEnter() {
    if (zooming) return
    setZooming(true)
    setTimeout(() => navigate('/asteroids'), 760)
  }

  return (
    <div style={styles.root}>
      <div style={{ ...styles.starsLayer, ...(zooming ? styles.starsLayerFlowing : {}) }}>
        <canvas ref={starCanvas} style={styles.canvas} />
        <div style={styles.vignette} />
      </div>

      <div style={{ ...styles.contentLayer, ...(zooming ? styles.contentLayerFlowing : {}) }}>
        <div style={{ ...styles.bracket, ...styles.bracketTL }} />
        <div style={{ ...styles.bracket, ...styles.bracketTR }} />
        <div style={{ ...styles.bracket, ...styles.bracketBL }} />
        <div style={{ ...styles.bracket, ...styles.bracketBR }} />

        <div style={styles.statusBar}>
          <span style={styles.statusItem}>PROJECT ZENITH</span>
          <span style={{ ...styles.statusItem, color: 'var(--cyan)' }}>
            UTC {time} · {date}
          </span>
          <span style={{ ...styles.statusItem, color: 'var(--green)' }}>● ALL SYSTEMS NOMINAL</span>
        </div>

        <div style={styles.hero}>
          <div style={styles.eyebrow}>DEEP SPACE OBSERVATORY &nbsp;//&nbsp; LIVE TELEMETRY</div>
          <h1 style={styles.title}>ZENITH</h1>
          <p style={styles.subtitle}>
            A real-time window into near-Earth space — tracked asteroids, orbiting
            stations, and the sky above you, rendered live.
          </p>

          <button
            style={{ ...styles.enterBtn, ...(armed ? styles.enterBtnArmed : {}) }}
            onMouseEnter={() => setArmed(true)}
            onMouseLeave={() => setArmed(false)}
            onClick={handleEnter}
            disabled={zooming}
          >
            <span style={styles.enterRing} />
            {zooming ? 'DESCENDING…' : 'ENTER OBSERVATORY'}
          </button>
        </div>

        <div style={{ ...styles.manifest, ...(zooming ? { pointerEvents: 'none' } : {}) }}>
          {MODULES.map(m => (
            <div
              key={m.id}
              style={styles.manifestItem}
              onClick={() => navigate(m.path)}
            >
              <span style={styles.manifestId}>{m.id}</span>
              <div>
                <div style={styles.manifestName}>{m.name}</div>
                <div style={styles.manifestDesc}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

const styles = {
  root: {
    position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden',
    background: 'radial-gradient(ellipse at 50% 20%, #050b18 0%, #00030a 60%, #000103 100%)',
    color: 'var(--text)', fontFamily: 'var(--font-mono)',
  },
  contentLayer: {
    position: 'absolute', inset: 0,
    transition: 'transform 760ms cubic-bezier(0.65, 0, 0.35, 1), opacity 760ms ease',
  },
  contentLayerFlowing: {
    transform: 'translateY(-100vh)',
    opacity: 0,
  },
  starsLayer: {
    position: 'absolute', inset: 0,
    transition: 'transform 760ms cubic-bezier(0.65, 0, 0.35, 1)',
  },
  starsLayerFlowing: {
    transform: 'translateY(-35vh)',
  },

  canvas: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,2,6,0.85) 100%)',
    pointerEvents: 'none',
  },
  bracket: { position: 'absolute', width: 46, height: 46, opacity: 0.35 },
  bracketTL: { top: 24, left: 24, borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' },
  bracketTR: { top: 24, right: 24, borderTop: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' },
  bracketBL: { bottom: 24, left: 24, borderBottom: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' },
  bracketBR: { bottom: 24, right: 24, borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' },

  statusBar: {
    position: 'absolute', top: 28, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-between', padding: '0 90px',
    fontSize: 11, letterSpacing: 2, color: 'rgba(180,220,255,0.55)',
  },
  statusItem: { fontSize: 11, letterSpacing: 2 },

  hero: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-58%)',
    textAlign: 'center', width: 640,
  },
  eyebrow: {
    fontSize: 11, letterSpacing: 4, color: 'var(--cyan-dim, rgba(125,249,255,0.6))',
    marginBottom: 18,
  },
  title: {
    fontSize: 96, fontWeight: 800, letterSpacing: 14, margin: 0,
    fontFamily: 'var(--font-mono)',
    color: '#eaf6ff',
    textShadow: '0 0 40px rgba(125,249,255,0.35), 0 0 90px rgba(125,249,255,0.15)',
  },
  subtitle: {
    fontSize: 14, lineHeight: 1.7, color: 'rgba(210,230,250,0.7)',
    margin: '22px auto 36px', maxWidth: 460, fontFamily: 'system-ui, sans-serif',
    letterSpacing: 0.3,
  },
  enterBtn: {
    position: 'relative', padding: '16px 38px', fontSize: 12, letterSpacing: 3,
    background: 'rgba(125,249,255,0.06)', border: '1px solid rgba(125,249,255,0.4)',
    color: 'var(--cyan)', borderRadius: 999, cursor: 'pointer',
    fontFamily: 'var(--font-mono)', transition: 'all 0.3s ease',
  },
  enterBtnArmed: {
    background: 'rgba(125,249,255,0.16)', borderColor: 'var(--cyan)',
    boxShadow: '0 0 30px rgba(125,249,255,0.35)',
  },
  enterRing: {},

  manifest: {
    position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: 26, padding: '0 40px', maxWidth: 1180,
    overflowX: 'auto',
  },
  manifestItem: {
    display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0,
    paddingRight: 22, borderRight: '1px solid rgba(125,249,255,0.12)',
    cursor: 'pointer',
  },
  manifestId: { fontSize: 10, color: 'rgba(125,249,255,0.4)', letterSpacing: 1 },
  manifestName: { fontSize: 12, color: 'rgba(230,245,255,0.85)', letterSpacing: 0.5 },
  manifestDesc: { fontSize: 10, color: 'rgba(160,190,220,0.45)', marginTop: 2 },
}