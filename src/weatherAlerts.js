// ============================================================================
// WEATHER ALERTS — Fire OS-level notifications for severe weather
//
// Triggers:
//   - Thunderstorm in the next 2 hours
//   - Extreme heat (heat index > 40°C)
//   - Extreme cold (wind chill < -15°C)
//   - Dangerous wind (gusts > 60 km/h)
//   - Hazardous air quality (AQI > 150)
//   - Heavy rain (probability > 85% + amount > 5mm in next 3h)
//
// One alert per type per day — no spam.
// Uses the browser Notification API (already permission-requested in App.jsx).
// ============================================================================

const STORAGE_KEY = 'zephye_alerts_sent'

// ─── DEDUPE STORAGE ────────────────────────────────────────────────────

function loadSent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function saveSent(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Was this alert already fired today for this location?
 */
function alreadySent(alertType, locationKey) {
  const sent = loadSent()
  const day = todayKey()
  const bucket = sent[day] || {}
  return !!bucket[`${locationKey}_${alertType}`]
}

function markSent(alertType, locationKey) {
  const sent = loadSent()
  const day = todayKey()
  if (!sent[day]) sent[day] = {}

  // Prune old days (keep only today + yesterday)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  Object.keys(sent).forEach(k => {
    if (k !== day && k !== yesterdayKey) delete sent[k]
  })

  sent[day][`${locationKey}_${alertType}`] = Date.now()
  saveSent(sent)
}

// ─── SAFE NOTIFY ───────────────────────────────────────────────────────

function dispatchNotification(title, body, tag) {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission !== 'granted') return false
  try {
    new Notification(title, {
      body,
      tag,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      silent: false,
    })
    return true
  } catch {
    return false
  }
}

// ─── ALERT DETECTION ───────────────────────────────────────────────────

/**
 * Look ahead in the hourly forecast for severe weather.
 * Returns array of { type, title, body } alerts to fire.
 */
function detectAlerts(weather, aqi) {
  const alerts = []
  if (!weather?.hourly?.time?.length) return alerts

  const h = weather.hourly
  const now = Date.now()
  const lookaheadMs = 3 * 60 * 60 * 1000 // next 3 hours

  // Slice the next 3 hours from the current moment
  const upcoming = []
  for (let i = 0; i < h.time.length; i++) {
    const t = new Date(h.time[i]).getTime()
    if (t < now - 30 * 60 * 1000) continue // skip past
    if (t > now + lookaheadMs) break
    upcoming.push({
      time: h.time[i],
      temp: h.temperature_2m?.[i],
      feelsLike: h.apparent_temperature?.[i],
      code: h.weather_code?.[i],
      wind: h.wind_speed_10m?.[i],
      gust: h.wind_gusts_10m?.[i],
      precip: h.precipitation?.[i],
      precipProb: h.precipitation_probability?.[i],
      isDay: h.is_day?.[i],
    })
  }

  if (upcoming.length === 0) return alerts

  // ─── Thunderstorm ──────────────────────────────────────────────────
  const storm = upcoming.find(u => u.code >= 95)
  if (storm) {
    alerts.push({
      type: 'thunderstorm',
      title: '⛈️ Thunderstorm incoming',
      body: `Thunderstorms expected around ${formatHour(storm.time)}. Move indoors and stay away from windows.`,
    })
  }

  // ─── Extreme heat ──────────────────────────────────────────────────
  const hot = upcoming.find(u => (u.feelsLike ?? u.temp) >= 40)
  if (hot) {
    alerts.push({
      type: 'extreme_heat',
      title: '🔥 Extreme heat warning',
      body: `Feels like ${Math.round(hot.feelsLike ?? hot.temp)}°C around ${formatHour(hot.time)}. Hydrate and avoid prolonged sun exposure.`,
    })
  }

  // ─── Extreme cold ──────────────────────────────────────────────────
  const cold = upcoming.find(u => u.temp <= -15)
  if (cold) {
    alerts.push({
      type: 'extreme_cold',
      title: '🥶 Extreme cold warning',
      body: `${Math.round(cold.temp)}°C around ${formatHour(cold.time)}. Cover all exposed skin.`,
    })
  }

  // ─── Dangerous wind ────────────────────────────────────────────────
  const windy = upcoming.find(u => (u.gust ?? 0) >= 60)
  if (windy) {
    alerts.push({
      type: 'dangerous_wind',
      title: '💨 Strong winds incoming',
      body: `Gusts up to ${Math.round(windy.gust)} km/h around ${formatHour(windy.time)}. Secure loose items.`,
    })
  }

  // ─── Heavy rain ────────────────────────────────────────────────────
  const heavyRain = upcoming.find(u => (u.precipProb ?? 0) >= 85 && (u.precip ?? 0) >= 3)
  if (heavyRain) {
    alerts.push({
      type: 'heavy_rain',
      title: '🌧️ Heavy rain incoming',
      body: `Heavy rain expected around ${formatHour(heavyRain.time)}. Bring an umbrella and watch for flooding.`,
    })
  }

  // ─── Hazardous air quality ─────────────────────────────────────────
  if (aqi?.us_aqi != null && aqi.us_aqi >= 150) {
    alerts.push({
      type: 'hazardous_aqi',
      title: '😷 Air quality alert',
      body: `Air quality is unhealthy (AQI ${Math.round(aqi.us_aqi)}). Sensitive groups should stay indoors.`,
    })
  }

  return alerts
}

function formatHour(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    })
  } catch {
    return 'soon'
  }
}

// ─── PUBLIC API ────────────────────────────────────────────────────────

/**
 * Check weather + AQI for severe conditions and fire notifications.
 * Deduped per alert type per day per location.
 *
 * @param {Object} weather — normalized weather object
 * @param {Object} aqi — normalized aqi object (or {us_aqi})
 * @param {Object} location — { lat, lon, name }
 */
export function checkAndNotify(weather, aqi, location) {
  if (!weather || !location) return []

  const locationKey = location.name || `${location.lat},${location.lon}`
  const alerts = detectAlerts(weather, aqi)
  const fired = []

  for (const alert of alerts) {
    if (alreadySent(alert.type, locationKey)) continue
    const ok = dispatchNotification(alert.title, alert.body, `zephye-${alert.type}`)
    if (ok) {
      markSent(alert.type, locationKey)
      fired.push(alert)
    }
  }

  return fired
}

/**
 * Clear dedupe state — useful for testing.
 */
export function clearAlertHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export default { checkAndNotify, clearAlertHistory }
