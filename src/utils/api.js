export const NASA_KEY = import.meta.env.VITE_NASA_API_KEY

export const API = {
  nasaNeoWs: (startDate, endDate) =>
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_KEY}`,

  nasaApod: () =>
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`,

  issPosition: () =>
    `https://api.wheretheiss.at/v1/satellites/25544`,

  openWeather: (lat, lon, key) =>
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
}

export function formatDate(d = new Date()) {
  return d.toISOString().split('T')[0]
}

export function getDateRange(days = 7) {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + days)
  return { start: formatDate(start), end: formatDate(end) }
}

export function threatScore(asteroid) {
  const dist = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers)
  const vel = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour)
  const diam = (
    asteroid.estimated_diameter.kilometers.estimated_diameter_max +
    asteroid.estimated_diameter.kilometers.estimated_diameter_min
  ) / 2
  const distScore = Math.max(0, 100 - (dist / 750000) * 100)
  const velScore = Math.min(100, (vel / 150000) * 100)
  const diamScore = Math.min(100, diam * 200)
  return Math.round(distScore * 0.5 + velScore * 0.3 + diamScore * 0.2)
}

export function threatLevel(score, hazardous) {
  if (hazardous || score >= 60) return 'danger'
  if (score >= 30) return 'moderate'
  return 'safe'
}

export function threatLabel(score, hazardous) {
  if (hazardous || score >= 60) return 'Potentially Hazardous'
  if (score >= 30) return 'Moderate'
  return 'Safe'
}
