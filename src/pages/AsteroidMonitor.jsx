import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { API, getDateRange, threatScore, threatLevel, threatLabel } from '../utils/api.js'

const COLOR = { safe: 0x00ff88, moderate: 0xffcc00, danger: 0xff4444 }
const COLOR_CSS = { safe: 'var(--green)', moderate: 'var(--yellow)', danger: 'var(--red)' }

// ── 2D starfield ───────────────────────────────────────────────────────────────
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

    function spawnShooter() {
      const dpr = devicePixelRatio
      const dir = Math.random() < 0.5 ? 1 : -1
      const slope = Math.PI * 0.16 + Math.random() * Math.PI * 0.16
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
// ─────────────────────────────────────────────────────────────────────────────

function buildScene(canvas) {
  const W = canvas.clientWidth, H = canvas.clientHeight
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 3000)
  camera.position.set(0, 0, 11)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  // Earth
  const earthGeo = new THREE.SphereGeometry(1.8, 64, 64)
  const earthMat = new THREE.MeshPhongMaterial({ color: 0x1a5c7a, emissive: 0x071828, specular: 0x112244, shininess: 20 })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  scene.add(earth)

  earth.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.804, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0x7df9ff, wireframe: true, transparent: true, opacity: 0.055 })
  ))

  ;[{ r: 1.96, o: 0.055, c: 0x0099dd }, { r: 1.88, o: 0.04, c: 0x00ccff }, { r: 2.1, o: 0.018, c: 0x0077bb }].forEach(({ r, o, c }) => {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.BackSide })
    ))
  })

  const ringGeo = new THREE.RingGeometry(4.8, 4.82, 128)
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.06, side: THREE.DoubleSide }))
  ring.rotation.x = Math.PI / 2
  scene.add(ring)

  scene.add(new THREE.AmbientLight(0x334466, 1.6))
  const sun = new THREE.DirectionalLight(0xfff5e8, 2.8)
  sun.position.set(8, 4, 6)
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x223355, 0.8)
  fill.position.set(-5, -2, -4)
  scene.add(fill)
  const back = new THREE.DirectionalLight(0x553322, 0.4)
  back.position.set(0, -5, -8)
  scene.add(back)

  return { scene, camera, renderer, earth }
}

const ORBIT_TILTS = [
  { tx:  15, tz:   0 },
  { tx: -15, tz:  20 },
  { tx:  30, tz: -15 },
  { tx: -30, tz:  10 },
  { tx:  10, tz:  35 },
  { tx: -10, tz: -35 },
  { tx:  45, tz:   5 },
  { tx: -45, tz: -10 },
]

function getSaturnOrbitParams(index, total, dist, moonDist) {
  const r = Math.max(2.8, Math.min(4.6, 2.6 + (dist / moonDist) * 2.0))
  const t = ORBIT_TILTS[index % ORBIT_TILTS.length]
  const tiltX = THREE.MathUtils.degToRad(t.tx)
  const tiltZ = THREE.MathUtils.degToRad(t.tz)
  return { a: r, b: r * 0.72, tiltX, tiltZ }
}

function makeRockMesh(level) {
  const geo = new THREE.IcosahedronGeometry(0.18, 3)
  const pos = geo.attributes.position
  const s1 = Math.random() * 100, s2 = Math.random() * 100

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const low  = Math.sin(x * 3.1 + s1) * Math.cos(y * 2.8 + s2) * Math.sin(z * 3.4)
    const mid  = Math.sin(x * 7.2 + s2) * Math.cos(y * 6.8) * Math.sin(z * 7.1 + s1)
    const high = Math.sin(x * 14 + s1 * 0.5) * Math.cos(y * 13 + s2) * Math.sin(z * 15)
    const squash = 1.0 + 0.35 * Math.sin(s1)
    const n = 0.78 + 0.13 * low + 0.07 * mid + 0.025 * high
    pos.setXYZ(i, x * n * squash, y * n, z * n * (1 / squash) * 0.85)
  }
  geo.computeVertexNormals()

  const S = 512
  const tc = document.createElement('canvas')
  tc.width = S; tc.height = S
  const tctx = tc.getContext('2d')
  tctx.fillStyle = '#5a5248'
  tctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 300; i++) {
    const px = Math.random() * S, py = Math.random() * S, pr = 6 + Math.random() * 30
    const v = Math.round(60 + Math.random() * 80)
    tctx.fillStyle = `rgba(${v},${v - 4},${v - 10},0.45)`
    tctx.beginPath()
    tctx.ellipse(px, py, pr, pr * (0.4 + Math.random() * 0.9), Math.random() * Math.PI, 0, Math.PI * 2)
    tctx.fill()
  }
  for (let i = 0; i < 28; i++) {
    const x1 = Math.random() * S, y1 = Math.random() * S, len = 20 + Math.random() * 80, angle = Math.random() * Math.PI
    tctx.strokeStyle = `rgba(18,14,10,${0.5 + Math.random() * 0.4})`
    tctx.lineWidth = 0.5 + Math.random() * 2.5
    tctx.beginPath(); tctx.moveTo(x1, y1)
    let cx = x1, cy = y1
    const steps = 4 + Math.floor(Math.random() * 5)
    for (let s = 0; s < steps; s++) {
      cx += (Math.cos(angle) + (Math.random() - 0.5) * 0.8) * (len / steps)
      cy += (Math.sin(angle) + (Math.random() - 0.5) * 0.8) * (len / steps)
      tctx.lineTo(cx, cy)
    }
    tctx.stroke()
  }
  for (let i = 0; i < 22; i++) {
    const cx = Math.random() * S, cy = Math.random() * S, cr = 4 + Math.random() * 20
    const gd = tctx.createRadialGradient(cx, cy, 0, cx, cy, cr)
    gd.addColorStop(0, 'rgba(10,8,6,0.9)'); gd.addColorStop(0.5, 'rgba(20,16,12,0.5)'); gd.addColorStop(1, 'rgba(0,0,0,0)')
    tctx.fillStyle = gd; tctx.beginPath(); tctx.arc(cx, cy, cr, 0, Math.PI * 2); tctx.fill()
    tctx.strokeStyle = `rgba(180,168,150,0.35)`; tctx.lineWidth = 1.2
    tctx.beginPath(); tctx.arc(cx - cr * 0.1, cy - cr * 0.1, cr * 1.15, 0, Math.PI * 2); tctx.stroke()
  }
  for (let i = 0; i < 60; i++) {
    const fx = Math.random() * S, fy = Math.random() * S, fr = 0.5 + Math.random() * 2
    tctx.fillStyle = `rgba(220,205,180,${0.3 + Math.random() * 0.5})`
    tctx.beginPath(); tctx.arc(fx, fy, fr, 0, Math.PI * 2); tctx.fill()
  }
  const tex = new THREE.CanvasTexture(tc)

  const rc = document.createElement('canvas'); rc.width = 256; rc.height = 256
  const rctx = rc.getContext('2d'); rctx.fillStyle = '#aaa'; rctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 60; i++) {
    const rx = Math.random() * 256, ry = Math.random() * 256, rr = 2 + Math.random() * 16
    rctx.fillStyle = `rgba(20,20,20,0.7)`; rctx.beginPath(); rctx.arc(rx, ry, rr, 0, Math.PI * 2); rctx.fill()
  }
  const roughTex = new THREE.CanvasTexture(rc)

  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map: tex, roughnessMap: roughTex,
    color: new THREE.Color(1, 1, 1), roughness: 0.97, metalness: 0.02,
    emissive: new THREE.Color(0.015, 0.015, 0.015), emissiveIntensity: 1.0,
  }))
}

function makeWarningBeaconSprite() {
  const S = 160, c = document.createElement('canvas'); c.width = S; c.height = S
  const ctx = c.getContext('2d'), cx = S / 2, cy = S / 2 + 6
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 50)
  glow.addColorStop(0, 'rgba(255, 70, 40, 0.35)'); glow.addColorStop(1, 'rgba(255, 70, 40, 0)')
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fill()
  const r = 34, p1 = [cx, cy - r], p2 = [cx - r * 0.92, cy + r * 0.75], p3 = [cx + r * 0.92, cy + r * 0.75]
  ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.lineTo(...p3); ctx.closePath()
  ctx.fillStyle = 'rgba(255, 60, 40, 0.18)'; ctx.fill()
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255, 70, 45, 0.95)'; ctx.lineJoin = 'round'; ctx.stroke()
  ctx.fillStyle = 'rgba(255, 90, 60, 0.95)'
  ctx.fillRect(cx - 2.5, cy - r * 0.32, 5, r * 0.62)
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.5, 3.2, 0, Math.PI * 2); ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  sprite.scale.set(0.42, 0.42, 1)
  return sprite
}

function ellipsePoint(a, b, tiltX, tiltZ, theta) {
  const lx = a * Math.cos(theta), lz = b * Math.sin(theta)
  const y1 = -lz * Math.sin(tiltX), z1 = lz * Math.cos(tiltX)
  const x2 = lx * Math.cos(tiltZ) - y1 * Math.sin(tiltZ), y2 = lx * Math.sin(tiltZ) + y1 * Math.cos(tiltZ)
  return new THREE.Vector3(x2, y2, z1)
}

export default function AsteroidMonitor() {
  const canvasRef     = useRef(null)
  const starCanvasRef = useRef(null)
  const sceneRef      = useRef(null)
  const asteroidsRef  = useRef([])
  const animRef       = useRef(null)
  const mouseRef      = useRef({ x: 0, y: 0 })
  const autoRotRef    = useRef(true)
  const zoomTargetRef = useRef(null)
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0))

  const [asteroids, setAsteroids] = useState([])
  const [selected, setSelected]   = useState(null)
  const [filter, setFilter]       = useState('all')
  const [loading, setLoading]     = useState(true)
  const [hovered, setHovered]     = useState(null)
  const [stats, setStats]         = useState({ total: 0, hazardous: 0, closest: '—' })
  const [chatOpen, setChatOpen]   = useState(false)
  const [messages, setMessages]   = useState([
    { role: 'assistant', text: "Hello! I'm your AI Space Guide. Ask me anything about asteroids, NEOs, space weather, or what you're seeing on screen." }
  ])
  const [input, setInput]         = useState('')
  const [thinking, setThinking]   = useState(false)
  const chatEndRef                = useRef(null)
  const [entered, setEntered]     = useState(false)

  useStarfield(starCanvasRef)

  // Simple fade-in — no translateY, so there's no motion clash with
  // the landing page's upward exit animation.
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 20)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const s = buildScene(canvas)
    sceneRef.current = s
    const { scene, camera, renderer, earth } = s
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points.threshold = 0.08
    const clock = new THREE.Clock()

    function animate() {
      animRef.current = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const elapsed = clock.elapsedTime
      earth.rotation.y += 0.0008

      if (zoomTargetRef.current?.objRef) {
        const lp = zoomTargetRef.current.objRef.mesh.position
        zoomTargetRef.current.x = lp.x; zoomTargetRef.current.y = lp.y; zoomTargetRef.current.z = lp.z
      }

      let desiredCam, desiredLook
      if (zoomTargetRef.current) {
        const zt = zoomTargetRef.current
        const astPos = new THREE.Vector3(zt.x, zt.y, zt.z)
        const dir = astPos.clone().normalize()
        desiredCam  = dir.multiplyScalar(astPos.length() + 2.2)
        desiredLook = astPos.clone()
      } else {
        const mx = mouseRef.current.x * 0.5, my = mouseRef.current.y * 0.3
        desiredCam  = new THREE.Vector3(mx, my, 11)
        desiredLook = new THREE.Vector3(0, 0, 0)
      }

      // Exponential smoothing — frame-rate independent, no spring bounce
      const camAlpha  = 1 - Math.exp(-2.2 * delta)
      const lookAlpha = 1 - Math.exp(-1.8 * delta)
      camera.position.lerp(desiredCam, camAlpha)
      lookTargetRef.current.lerp(desiredLook, lookAlpha)
      camera.lookAt(lookTargetRef.current)

      asteroidsRef.current.forEach(obj => {
        if (!obj.mesh.visible) return
        obj.angle += obj.speed * delta
        const pos = ellipsePoint(obj.a, obj.b, obj.tiltX, obj.tiltZ, obj.angle)
        obj.mesh.position.copy(pos)
        obj.mesh.rotation.x += 0.003 * delta * 60
        obj.mesh.rotation.y += 0.002 * delta * 60
        if (obj.beacon) {
          obj.beacon.position.set(pos.x, pos.y + 0.32, pos.z)
          obj.beacon.material.opacity = Math.sin(elapsed * 3.4 + obj.angle) > 0.2 ? 1 : 0.15
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    function onMouseMove(e) {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
      const rect = canvas.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera({ x: mx, y: my }, camera)
      const hits = raycaster.intersectObjects(asteroidsRef.current.map(a => a.mesh))
      if (hits.length) {
        const obj = asteroidsRef.current.find(a => a.mesh === hits[0].object)
        setHovered(obj ? { data: obj.data, x: e.clientX, y: e.clientY } : null)
        canvas.style.cursor = 'pointer'
      } else {
        setHovered(null); canvas.style.cursor = 'default'
      }
    }

    function onClick(e) {
      const rect = canvas.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera({ x: mx, y: my }, camera)
      const hits = raycaster.intersectObjects(asteroidsRef.current.map(a => a.mesh), true)
      if (hits.length) {
        const obj = asteroidsRef.current.find(a => a.mesh === hits[0].object || a.mesh === hits[0].object.parent)
        if (obj) {
          setSelected(obj); autoRotRef.current = false
          const p = obj.mesh.position
          zoomTargetRef.current = { x: p.x, y: p.y, z: p.z, dist: p.length(), objRef: obj }
        }
      } else {
        setSelected(null); autoRotRef.current = true; zoomTargetRef.current = null
      }
    }

    function onResize() {
      const w = canvas.clientWidth, h = canvas.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onClick)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    const { start, end } = getDateRange(7)
    fetch(API.nasaNeoWs(start, end))
      .then(r => r.json())
      .then(data => {
        const all = Object.values(data.near_earth_objects).flat()
          .sort((a, b) =>
            parseFloat(a.close_approach_data[0].miss_distance.kilometers) -
            parseFloat(b.close_approach_data[0].miss_distance.kilometers)
          )
        setAsteroids(all)
        setLoading(false)
        const haz = all.filter(a => a.is_potentially_hazardous_asteroid)
        const closestKm = parseFloat(all[0]?.close_approach_data[0].miss_distance.kilometers)
        setStats({ total: all.length, hazardous: haz.length, closest: closestKm ? (closestKm / 1000).toFixed(0) + 'k km' : '—' })
        placeAsteroids(all)
      })
      .catch(() => setLoading(false))
  }, [])

  function placeAsteroids(data) {
    const { scene } = sceneRef.current
    asteroidsRef.current.forEach(o => {
      scene.remove(o.mesh)
      if (o.beacon) scene.remove(o.beacon)
    })
    asteroidsRef.current = []

    const moonDist = 384400
    const total = Math.min(data.length, 35)

    data.slice(0, total).forEach((a, i) => {
      const score = threatScore(a)
      const level = threatLevel(score, a.is_potentially_hazardous_asteroid)
      const dist  = parseFloat(a.close_approach_data[0].miss_distance.kilometers)
      const { a: semiA, b: semiB, tiltX, tiltZ } = getSaturnOrbitParams(i, total, dist, moonDist)
      const initAngle = (i / total) * Math.PI * 2
      const mesh = makeRockMesh(level)
      const initPos = ellipsePoint(semiA, semiB, tiltX, tiltZ, initAngle)
      mesh.position.copy(initPos)
      scene.add(mesh)

      let beacon = null
      if (level === 'danger') {
        beacon = makeWarningBeaconSprite()
        beacon.position.set(initPos.x, initPos.y + 0.32, initPos.z)
        scene.add(beacon)
      }

      asteroidsRef.current.push({
        mesh, beacon, data: a, score, level,
        angle: initAngle, a: semiA, b: semiB, tiltX, tiltZ,
        speed: 0.008 + (i % 5) * 0.002,
      })
    })
  }

  useEffect(() => {
    asteroidsRef.current.forEach(obj => {
      const show = filter === 'all' || obj.data.is_potentially_hazardous_asteroid
      obj.mesh.visible = show
      if (obj.beacon) obj.beacon.visible = show
    })
  }, [filter])

  async function sendMessage() {
    const text = input.trim()
    if (!text || thinking) return
    const userMsg = { role: 'user', text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setThinking(true)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const contextNote = stats.total
        ? `The user is viewing the Asteroid Monitor. Current stats: ${stats.total} tracked NEOs, ${stats.hazardous} hazardous, closest approach ${stats.closest}.`
        : 'The user is viewing the Asteroid Monitor.'

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: `You are an expert AI Space Guide embedded in Project Zenith, a real-time space intelligence dashboard. ${contextNote} Answer questions about asteroids, near-Earth objects, orbital mechanics, space weather, the ISS, and astronomy. Keep answers concise and engaging. Use plain text only, no markdown.`
            },
            ...next.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text })),
          ],
        }),
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error. Please try again.' }])
    } finally {
      setThinking(false)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  const ca = selected?.data?.close_approach_data[0]
  const selScore = selected ? selected.score : 0
  const selLevel = selected ? selected.level : 'safe'

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 20%, #050b18 0%, #00030a 60%, #000103 100%)',
      // Pure opacity fade — no translateY so there's zero motion clash with
      // the landing page sliding upward on exit.
      opacity: entered ? 1 : 0,
      transition: 'opacity 500ms ease 40ms',
    }}>
      {/* 2D starfield — sits behind Three.js canvas */}
      <canvas ref={starCanvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,2,6,0.75) 100%)',
        zIndex: 1,
      }} />

      {/* Three.js canvas — alpha:true so starfield shows through */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        display: 'block', zIndex: 2,
      }} />

      {/* Stats — bottom left */}
      <div style={{ position: 'absolute', bottom: 28, left: 28, display: 'flex', gap: 20, alignItems: 'flex-end', zIndex: 10 }}>
        {[
          { label: 'Tracked',   value: loading ? '—' : stats.total,     color: 'var(--cyan)'   },
          { label: 'Hazardous', value: loading ? '—' : stats.hazardous, color: 'var(--red)'    },
          { label: 'Closest',   value: stats.closest,                    color: 'var(--yellow)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(0,4,12,0.7)', border: '1px solid rgba(125,249,255,0.15)', borderRadius: 10, padding: '10px 16px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 9, color: 'var(--cyan-dim)', letterSpacing: 2, marginBottom: 3, textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Legend — bottom right */}
      <div style={{ position: 'absolute', bottom: 28, right: 92, display: 'flex', gap: 14, alignItems: 'center', zIndex: 10 }}>
        {[['var(--green)', 'Safe'], ['var(--yellow)', 'Moderate'], ['var(--red)', 'Hazardous']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />{l}
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ position: 'absolute', top: 68, right: 20, display: 'flex', gap: 8, zIndex: 10 }}>
        <button className={`btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`btn${filter === 'hazardous' ? ' active' : ''}`} onClick={() => setFilter('hazardous')}>Hazardous Only</button>
      </div>

      {/* Lunar orbit label */}
      <div style={{ position: 'absolute', top: '50%', right: 28, transform: 'translateY(-50%)', fontSize: 9, color: 'rgba(125,249,255,0.25)', letterSpacing: 1.5, writingMode: 'vertical-rl', zIndex: 10 }}>
        LUNAR ORBIT REFERENCE
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: 'fixed', left: hovered.x + 14, top: hovered.y - 16, pointerEvents: 'none',
          background: 'rgba(0,4,12,0.92)', border: '1px solid rgba(125,249,255,0.3)',
          borderRadius: 8, padding: '6px 12px', fontSize: 11, color: 'var(--cyan)',
          letterSpacing: 1, whiteSpace: 'nowrap', zIndex: 200,
        }}>
          {hovered.data.name.replace(/[()]/g, '')}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          color: 'var(--cyan-dim)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 3,
          animation: 'pulse 1.5s ease-in-out infinite', zIndex: 10,
        }}>
          Loading NASA data...
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div style={{
          position: 'absolute', top: '50%', right: 20, transform: 'translateY(-50%)',
          width: 300, background: 'rgba(0,4,12,0.94)', border: '1px solid rgba(125,249,255,0.25)',
          borderRadius: 14, padding: 24, backdropFilter: 'blur(16px)', zIndex: 50,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan-dim)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
            Near-Earth Object
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 12, lineHeight: 1.3 }}>
            {selected.data.name.replace(/[()]/g, '')}
          </div>
          <div className={`badge badge-${selLevel === 'danger' ? 'danger' : selLevel === 'moderate' ? 'moderate' : 'safe'}`} style={{ marginBottom: 18 }}>
            {threatLabel(selScore, selected.data.is_potentially_hazardous_asteroid)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
            {[
              ['Close Approach', ca?.close_approach_date_full || ca?.close_approach_date],
              ['Miss Distance',  `${Math.round(parseFloat(ca?.miss_distance.kilometers)).toLocaleString()} km`],
              ['Velocity',       `${Math.round(parseFloat(ca?.relative_velocity.kilometers_per_hour)).toLocaleString()} km/h`],
              ['Diameter',       `${Math.round(selected.data.estimated_diameter.meters.estimated_diameter_min)}–${Math.round(selected.data.estimated_diameter.meters.estimated_diameter_max)} m`],
              ['Magnitude',      `${selected.data.absolute_magnitude_h.toFixed(1)} H`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(125,249,255,0.07)', paddingBottom: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--cyan-dim)', letterSpacing: 1 }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--cyan-dim)', letterSpacing: 1 }}>THREAT SCORE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: COLOR_CSS[selLevel] }}>{selScore}/100</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
              <div style={{ width: `${selScore}%`, height: '100%', background: COLOR_CSS[selLevel], borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
          </div>

          <button className="btn" style={{ width: '100%' }} onClick={() => { setSelected(null); autoRotRef.current = true; zoomTargetRef.current = null }}>
            ← Back to scene
          </button>
        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={() => setChatOpen(o => !o)}
        style={{
          position: 'absolute', bottom: 28, right: 28,
          width: 52, height: 52, borderRadius: '50%', zIndex: 60,
          background: chatOpen ? 'rgba(125,249,255,0.2)' : 'rgba(0,4,12,0.85)',
          border: '1px solid rgba(125,249,255,0.5)',
          color: 'var(--cyan)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, backdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(125,249,255,0.2)',
          transition: 'all 0.3s ease',
        }}
        title="AI Space Guide"
      >
        {chatOpen ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div style={{
          position: 'absolute', bottom: 92, right: 28, width: 350,
          height: 480, zIndex: 55,
          background: 'rgba(0,4,12,0.95)', border: '1px solid rgba(125,249,255,0.25)',
          borderRadius: 16, backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid rgba(125,249,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid rgba(125,249,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: 'var(--cyan)',
            }}>✦</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>AI SPACE GUIDE</div>
              <div style={{ fontSize: 9, color: 'rgba(125,249,255,0.4)', letterSpacing: 1, marginTop: 1 }}>POWERED BY GROQ</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }} />
              <span style={{ fontSize: 9, color: 'rgba(125,249,255,0.4)', letterSpacing: 1 }}>ONLINE</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: 8, alignItems: 'flex-start',
              }}>
                {m.role === 'assistant' && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid rgba(125,249,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'var(--cyan)', marginTop: 2,
                  }}>✦</div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '8px 12px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? 'rgba(125,249,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(125,249,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  fontSize: 12, color: m.role === 'user' ? 'rgba(230,245,255,0.9)' : 'rgba(210,230,250,0.8)',
                  lineHeight: 1.6,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: '1px solid rgba(125,249,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'var(--cyan)', marginTop: 2,
                }}>✦</div>
                <div style={{
                  padding: '8px 14px', borderRadius: '12px 12px 12px 2px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{
                      width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)',
                      animation: 'pulse 1.2s ease-in-out infinite',
                      animationDelay: `${d * 0.2}s`, opacity: 0.7,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{
            padding: '12px 14px', borderTop: '1px solid rgba(125,249,255,0.1)',
            display: 'flex', gap: 8, flexShrink: 0,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about asteroids, orbits..."
              style={{
                flex: 1, background: 'rgba(125,249,255,0.05)',
                border: '1px solid rgba(125,249,255,0.2)', borderRadius: 8,
                padding: '8px 12px', fontSize: 12, color: 'var(--text)',
                fontFamily: 'var(--font-sans)', outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={thinking || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: input.trim() ? 'rgba(125,249,255,0.15)' : 'rgba(125,249,255,0.04)',
                border: '1px solid rgba(125,249,255,0.3)', color: 'var(--cyan)',
                cursor: input.trim() ? 'pointer' : 'default',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >↑</button>
          </div>
        </div>
      )}
    </div>
  )
}