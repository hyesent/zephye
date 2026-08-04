// ============================================================================
// TRAFFIC ADVICE — Traffic incidents, congestion, road conditions
// ============================================================================

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONSTANTS ──────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const MAPBOX_KEY = "pk.eyJ1IjoiaHllc2VudCIsImEiOiJjbXNkd2Fsd20wMTRjMndxeHZ1MXZkdWk5In0.oo-poQNG7epNSEADCQFZPQ"
const TRAFFIC_CACHE_TTL = 8 * 60 * 60 * 1000 // 8 hours

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const sampleQuestions = [
  "Is there traffic on my route?",
  "Are there any accidents near me?",
  "What's the traffic like right now?",
  "Is there a road closure?",
  "How bad is the traffic today?",
  "Any traffic incidents in my area?",
  "Traffic to work?",
  "Is the highway congested?",
  "What's happening on the road?"
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CACHE HELPERS ─────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const getTrafficCacheKey = (lat, lon) => {
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLon = Math.round(lon * 100) / 100
  return `zephye_traffic_incidents_${roundedLat}_${roundedLon}`
}

const getCachedTraffic = (lat, lon) => {
  try {
    const key = getTrafficCacheKey(lat, lon)
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const data = JSON.parse(cached)
    if (Date.now() - data.timestamp > TRAFFIC_CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return data.value
  } catch {
    return null
  }
}

const setCachedTraffic = (lat, lon, incidents) => {
  try {
    const key = getTrafficCacheKey(lat, lon)
    localStorage.setItem(key, JSON.stringify({
      value: incidents,
      timestamp: Date.now()
    }))
  } catch {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('zephye_traffic_')) {
        try {
          const data = JSON.parse(localStorage.getItem(k))
          if (Date.now() - data.timestamp > TRAFFIC_CACHE_TTL) {
            localStorage.removeItem(k)
          }
        } catch {}
      }
    })
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── HELPERS ────────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const findSavedLocation = (name, savedLocations) => {
  if (!savedLocations || savedLocations.length === 0) return null
  const lowerName = name.toLowerCase().trim()
  
  let match = savedLocations.find(loc => 
    loc.label && loc.label.toLowerCase() === lowerName
  )
  if (match) return match
  
  match = savedLocations.find(loc => {
    const label = loc.label?.toLowerCase() || ''
    const locName = loc.name?.toLowerCase() || ''
    return label.includes(lowerName) || locName.includes(lowerName)
  })
  
  return match || null
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN FUNCTION ─────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const getTrafficAdvice = async (data, question, options = {}) => {
  const q = question.toLowerCase()
  const { lat, lon, city, homeLat, homeLon, homeName, savedLocations = [] } = data

  // ─── Check if user mentioned a saved location ──────────────────────────

  let targetLocation = options.location || null
  let targetLat = lat
  let targetLon = lon
  let targetName = city || 'Your Area'

  // Parse from question
  if (!targetLocation) {
    // Check for saved location mentions
    for (const loc of savedLocations) {
      const label = loc.label?.toLowerCase() || ''
      const locName = loc.name?.toLowerCase() || ''
      if (q.includes(label) || q.includes(locName)) {
        targetLocation = loc
        break
      }
    }
  }

  if (targetLocation && typeof targetLocation === 'object' && targetLocation.lat) {
    targetLat = targetLocation.lat
    targetLon = targetLocation.lon
    targetName = targetLocation.label || targetLocation.name || 'saved location'
  }

  // ─── Fetch traffic incidents ────────────────────────────────────────────

  let incidents = getCachedTraffic(targetLat, targetLon)

  if (!incidents) {
    try {
      const destLat = targetLat + 0.1
      const destLon = targetLon + 0.1
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${targetLon},${targetLat};${destLon},${destLat}?` +
        `annotations=congestion,incidents&` +
        `access_token=${MAPBOX_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        incidents = data.routes[0].incidents || []
        setCachedTraffic(targetLat, targetLon, incidents)
      } else {
        incidents = []
      }
    } catch {
      incidents = []
    }
  }

  // ─── Build Response ──────────────────────────────────────────────────────

  let responseText = `🚦 **Traffic Report for ${targetName}**\n\n`

  if (!incidents || incidents.length === 0) {
    responseText += `✅ No traffic incidents reported in this area.\n`
    responseText += `🌐 Roads appear clear with normal flow.\n`
    return responseText
  }

  // ─── Count by Type ──────────────────────────────────────────────────────

  const typeCounts = {}
  const severityCounts = {}

  incidents.forEach(inc => {
    const type = inc.type || inc.iconCategory || 'unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
    
    const severity = inc.severity || inc.properties?.severity || 'unknown'
    severityCounts[severity] = (severityCounts[severity] || 0) + 1
  })

  // ─── Summary ─────────────────────────────────────────────────────────────

  responseText += `📊 **Incident Summary:**\n`
  
  const typeEmojis = {
    accident: '🚗',
    construction: '🚧',
    roadClosure: '🚫',
    hazard: '⚠️',
    weather: '🌧️',
    event: '
