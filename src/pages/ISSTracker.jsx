import { useEffect, useState, useRef } from 'react'
import { API } from '../utils/api.js'

export default function ISSTracker() {
  const [pos, setPos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trail, setTrail] = useState([])
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const markerRef = useRef(null)
  const polyRef = useRef(null)

  useEffect(() => {
    let L
    import('leaflet').then(mod => {
      L = mod.default
      const map = L.map(mapRef.current, { center: [0, 0], zoom: 2, zoomControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        className: 'dark-tiles',
      }).addTo(map)

      const issIcon = L.divIcon({
        html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 0 8px #7df9ff)">🛸</div>`,
        iconSize: [30, 30], iconAnchor: [15, 15], className: ''
      })

      markerRef.current = L.marker([0, 0], { icon: issIcon }).addTo(map)
      polyRef.current = L.polyline([], { color: '#7df9ff', weight: 1.5, opacity: 0.4, dashArray: '4 4' }).addTo(map)
      leafletRef.current = { map, L }
    })

    function fetchISS() {
      fetch(API.issPosition())
        .then(r => r.json())
        .then(data => {
          setPos(data)
          setLoading(false)
          setTrail(prev => {
            const next = [...prev, [data.latitude, data.longitude]].slice(-80)
            markerRef.current?.setLatLng([data.latitude, data.longitude])
            polyRef.current?.setLatLngs(next)
            return next
          })
        })
        .catch(() => setLoading(false))
    }

    fetchISS()
    const interval = setInterval(fetchISS, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-content" style={{ paddingBottom: 0, flexShrink: 0 }}>
        <div className="page-header">
          <h2>ISS Tracker</h2>
          <p>Live International Space Station position · Updates every 5 seconds</p>
        </div>
        {loading && (
  <div style={{ textAlign: 'center', padding: '60px 0', letterSpacing: 2, color: 'rgba(125,249,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
    FETCHING ISS POSITION...
  </div>
)}
        {pos && !loading && (
          <div className="grid-4" style={{ marginBottom: 16 }}>
            {[
              ['Latitude', `${pos.latitude?.toFixed(4)}°`],
              ['Longitude', `${pos.longitude?.toFixed(4)}°`],
              ['Altitude', `${pos.altitude?.toFixed(1)} km`],
              ['Velocity', `${pos.velocity?.toFixed(0)} km/h`],
            ].map(([label, val]) => (
              <div className="card" key={label}>
                <div className="stat-label">{label}</div>
                <div className="stat-value glow" style={{ fontSize: 16 }}>{val}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, position: 'relative', margin: '0 28px 28px' }}>
        <style>{`.dark-tiles { filter: invert(1) hue-rotate(180deg) brightness(0.7) saturate(0.5); }`}</style>
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 12, border: '1px solid var(--cyan-border)', overflow: 'hidden' }} />
      </div>
    </div>
  )
}