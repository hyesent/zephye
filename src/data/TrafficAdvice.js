// ============================================================================
// TRAFFIC ADVICE — Traffic incidents, congestion, road conditions
// ============================================================================

import { getCachedTraffic, setCachedTraffic } from '../MapTab.jsx'

// ─── Sample Questions ──────────────────────────────────────────────────────

export const sampleQuestions = [
  "Is there traffic on my route?",
  "Are there any accidents near me?",
  "What's the traffic like right now?",
  "Is there a road closure?",
  "How bad is the traffic today?",
  "Any traffic incidents in my area?"
]

// ─── Main Function ─────────────────────────────────────────────────────────

export const getTrafficAdvice = async (data, question) => {
  const q = question.toLowerCase()
  const { lat, lon, city, homeLat, homeLon, homeName } = data

  // Fetch traffic incidents (using caching)
  let incidents = getCachedTraffic(lat, lon)

  if (!incidents) {
    try {
      // Fetch from Mapbox (or TomTom fallback)
      const MAPBOX_KEY = "pk.eyJ1IjoiaHllc2VudCIsImEiOiJjbXNkd2Fsd20wMTRjMndxeHZ1MXZkdWk5In0.oo-poQNG7epNSEADCQFZPQ"
      const destLat = lat + 0.1
      const destLon = lon + 0.1
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon},${lat};${destLon},${destLat}?` +
        `annotations=congestion,incidents&` +
        `access_token=${MAPBOX_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        incidents = data.routes[0].incidents || []
        setCachedTraffic(lat, lon, incidents)
      } else {
        incidents = []
      }
    } catch {
      incidents = []
    }
  }

  // ─── Build Response ──────────────────────────────────────────────────────

  let response = `🚦 **Traffic Report for ${city || 'Your Area'}**\n\n`

  if (!incidents || incidents.length === 0) {
    response += `✅ No traffic incidents reported in your area.\n`
    response += `🌐 Roads appear clear with normal flow.\n`
    return response
  }

  // ─── Count by Type ──────────────────────────────────────────────────────

  const typeCounts = {}
  incidents.forEach(inc => {
    const type = inc.type || inc.iconCategory || 'unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  response += `📊 **Incident Summary:**\n`
  Object.entries(typeCounts).forEach(([type, count]) => {
    const emoji = {
      accident: '🚗',
      construction: '🚧',
      roadClosure: '🚫',
      hazard: '⚠️',
      weather: '🌧️',
      event: '🎪'
    } [type] || '📌'
    response += `  ${emoji} ${count} ${type}${count > 1 ? 's' : ''}\n`
  })

  response += `\n📋 **Details:**\n`

  incidents.slice(0, 5).forEach((inc, i) => {
    const type = inc.type || inc.iconCategory || 'unknown'
    const emoji = {
      accident: '🚗',
      construction: '🚧',
      roadClosure: '🚫',
      hazard: '⚠️',
      weather: '🌧️',
      event: '🎪'
    } [type] || '📌'
    const desc = inc.description || inc.properties?.description || 'Traffic incident reported'

    response += `  ${i + 1}. ${emoji} **${type.charAt(0).toUpperCase() + type.slice(1)}**\n`
    response += `     ${desc}\n`

    if (inc.startTime) {
      response += `     🕐 Started: ${new Date(inc.startTime).toLocaleString()}\n`
    }
    if (inc.endTime) {
      response += `     ⏳ Ends: ${new Date(inc.endTime).toLocaleString()}\n`
    }
    if (inc.length) {
      response += `     📏 Length: ${inc.length}m\n`
    }
    response += `\n`
  })

  if (incidents.length > 5) {
    response += `  ... and ${incidents.length - 5} more incidents reported.\n`
  }

  // ─── Driving Advice ──────────────────────────────────────────────────────

  response += `\n💡 **Advice:**\n`

  if (typeCounts.accident > 0) {
    response += `  ⚠️ Accidents reported — drive with caution in the area.\n`
  }
  if (typeCounts.construction > 0) {
    response += `  🚧 Construction zones — expect delays and lane closures.\n`
  }
  if (typeCounts.roadClosure > 0) {
    response += `  🚫 Road closures — plan alternative routes.\n`
  }

  response += `\n📍 ${homeName || 'Your location'} — Stay safe on the road!`

  return response
}

export default getTrafficAdvice
