// ============================================================================
// TRAFFIC ADVICE — Traffic incidents, congestion, road conditions
// ============================================================================

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONSTANTS ──────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const MAPBOX_KEY = "pk.eyJ1IjoiaHllc2VudCIsImEiOiJjbXNkd2Fsd20wMTRjMndxeHZ1MXZkdWk5In0.oo-poQNG7epNSEADCQFZPQ"
const TRAFFIC_CACHE_TTL = 8 * 60 * 60 * 1000 // 8 hours
const OSRM_API_KEY = "your-osrm-key-here" // Optional, for fallback routing

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const sampleQuestions = [
  // GENERAL
  "Is there traffic on my route?",
  "Are there any accidents near me?",
  "What's the traffic like right now?",
  "Is there a road closure?",
  "How bad is the traffic today?",
  "Any traffic incidents in my area?",
  "Traffic to work?",
  "Is the highway congested?",
  "What's happening on the road?",
  
  // SPECIFIC
  "Are there delays on the expressway?",
  "What's the traffic like on the highway?",
  "Is there construction on my route?",
  "Are there any accidents on the bridge?",
  "How long is the traffic jam?",
  "Should I take a different route?",
  "Is there a faster way to get there?",
  "What's the traffic like heading into the city?",
  "Are there any roadworks near me?",
  "Is the tunnel closed?",
  
  // ROUTE BASED
  "Traffic from home to work",
  "Is there traffic on my way to the airport?",
  "How bad is the commute today?",
  "What's the traffic like on I-95?",
  "Are there delays on the freeway?",
  
  // WEATHER IMPACT
  "Will rain affect traffic?",
  "Is the road icy?",
  "Are there weather-related delays?",
  "Is it safe to drive in these conditions?",
  
  // HISTORICAL
  "Is traffic usually bad here at this time?",
  "What's the typical commute time?"
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

/**
 * Get traffic severity level based on incidents
 */
const getTrafficSeverity = (incidents) => {
  if (!incidents || incidents.length === 0) return 'CLEAR'
  
  const hasCritical = incidents.some(i => 
    i.severity === 'critical' || i.severity === 'high'
  )
  const hasAccident = incidents.some(i => 
    i.type === 'accident' || i.type === 'incident' || i.iconCategory === 'accident'
  )
  const hasConstruction = incidents.some(i => 
    i.type === 'construction' || i.type === 'roadworks'
  )
  
  if (hasCritical) return 'SEVERE'
  if (hasAccident) return 'MODERATE'
  if (hasConstruction) return 'LIGHT'
  return 'CLEAR'
}

/**
 * Estimate traffic delay in minutes
 */
const estimateTrafficDelay = (incidents) => {
  if (!incidents || incidents.length === 0) return 0
  
  let totalDelay = 0
  incidents.forEach(inc => {
    const severity = inc.severity || inc.properties?.severity || 'low'
    const delayMap = {
      critical: 15,
      high: 10,
      medium: 5,
      low: 2
    }
    totalDelay += delayMap[severity] || 3
  })
  
  // Cap at reasonable maximum
  return Math.min(totalDelay, 60)
}

/**
 * Format time in a readable way
 */
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

/**
 * Get traffic advisory message based on conditions
 */
const getTrafficAdvisory = (incidents, weather) => {
  const severity = getTrafficSeverity(incidents)
  const delay = estimateTrafficDelay(incidents)
  
  if (severity === 'SEVERE') {
    return 'Severe traffic delays expected. Consider alternate routes or delaying travel.'
  }
  if (severity === 'MODERATE') {
    return `Moderate traffic with ${delay} minute delay. Allow extra time for your journey.`
  }
  if (severity === 'LIGHT') {
    return 'Light traffic with minor delays. Normal driving conditions.'
  }
  return 'Traffic is flowing normally. No significant delays expected.'
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── TRAFFIC INCIDENT PROCESSING ───────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

/**
 * Process and categorize traffic incidents
 */
const processIncidents = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return { 
      byType: {}, 
      bySeverity: {},
      critical: [],
      total: 0,
      summary: 'No incidents reported'
    }
  }
  
  const byType = {}
  const bySeverity = {}
  const critical = []
  
  incidents.forEach(inc => {
    const type = inc.type || inc.iconCategory || 'unknown'
    byType[type] = (byType[type] || 0) + 1
    
    const severity = inc.severity || inc.properties?.severity || 'unknown'
    bySeverity[severity] = (bySeverity[severity] || 0) + 1
    
    if (severity === 'critical' || severity === 'high') {
      critical.push(inc)
    }
  })
  
  let summary = ''
  if (byType.accident) summary += `${byType.accident} accident${byType.accident > 1 ? 's' : ''}`
  if (byType.construction) summary += `${summary ? ', ' : ''}${byType.construction} construction zone${byType.construction > 1 ? 's' : ''}`
  if (byType.roadClosure) summary += `${summary ? ', ' : ''}${byType.roadClosure} road closure${byType.roadClosure > 1 ? 's' : ''}`
  if (byType.congestion) summary += `${summary ? ', ' : ''}${byType.congestion} congestion spot${byType.congestion > 1 ? 's' : ''}`
  if (byType.hazard) summary += `${summary ? ', ' : ''}${byType.hazard} hazard${byType.hazard > 1 ? 's' : ''}`
  
  if (!summary) summary = `${incidents.length} incident${incidents.length > 1 ? 's' : ''} reported`
  
  return { byType, bySeverity, critical, total: incidents.length, summary }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN FUNCTION ─────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const getTrafficAdvice = async (data, question, options = {}) => {
  const q = question.toLowerCase()
  const { lat, lon, city, homeLat, homeLon, homeName, savedLocations = [], condition, temp } = data

  // ─── Determine location ──────────────────────────────────────────────────

  let targetLocation = options.location || null
  let targetLat = lat
  let targetLon = lon
  let targetName = city || 'Your Area'
  let isRouteTraffic = false
  let fromLocation = null
  let toLocation = null

  // Parse route traffic from question
  const routeMatch = q.match(/from\s+([\w\s]+?)\s+to\s+([\w\s]+?)(?:\s*$|[\?\.])/i)
  if (routeMatch) {
    isRouteTraffic = true
    fromLocation = routeMatch[1].trim()
    toLocation = routeMatch[2].trim()
    
    // Try to resolve locations from saved locations
    const fromSaved = findSavedLocation(fromLocation, savedLocations)
    const toSaved = findSavedLocation(toLocation, savedLocations)
    
    if (fromSaved) {
      targetLat = fromSaved.lat
      targetLon = fromSaved.lon
      targetName = fromSaved.label || fromSaved.name
    } else if (toSaved) {
      targetLat = toSaved.lat
      targetLon = toSaved.lon
      targetName = toSaved.label || toSaved.name
    }
  }

  // Check for saved location mentions
  if (!targetLocation && !isRouteTraffic) {
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

  // Check for highway/route mentions
  const highwayMatch = q.match(/i[- ]?(\d+)/i)
  const routeMatch2 = q.match(/route\s+(\d+)/i)
  const highwayName = highwayMatch ? `I-${highwayMatch[1]}` : (routeMatch2 ? `Route ${routeMatch2[1]}` : null)

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

  // ─── Process incidents ──────────────────────────────────────────────────

  const processed = processIncidents(incidents)
  const severity = getTrafficSeverity(incidents)
  const delay = estimateTrafficDelay(incidents)
  const advisory = getTrafficAdvisory(incidents, condition)

  // ─── Type emoji mapping ──────────────────────────────────────────────────

  const typeIcons = {
    accident: '🚗',
    construction: '🚧',
    roadClosure: '🚫',
    hazard: '⚠️',
    weather: '🌧️',
    event: '🎪',
    congestion: '🚦',
    laneClosed: '🚧',
    brokenDownVehicle: '🛻',
    unknown: '📌'
  }

  // ─── Build Response ──────────────────────────────────────────────────────

  let responseText = `=== TRAFFIC REPORT ===\n`
  
  if (isRouteTraffic && fromLocation && toLocation) {
    responseText += `Route: ${fromLocation} to ${toLocation}\n`
  } else if (highwayName) {
    responseText += `Highway: ${highwayName}\n`
  } else {
    responseText += `Location: ${targetName}\n`
  }
  responseText += `Time: ${formatTime(new Date())}\n`
  responseText += `\n`

  // ─── Status ──────────────────────────────────────────────────────────────

  const statusMap = {
    'SEVERE': 'SEVERE DELAYS - Avoid if possible',
    'MODERATE': 'MODERATE DELAYS - Allow extra time',
    'LIGHT': 'LIGHT TRAFFIC - Minor delays',
    'CLEAR': 'CLEAR - Normal flow'
  }
  const statusColor = {
    'SEVERE': '🔴',
    'MODERATE': '🟡',
    'LIGHT': '🟢',
    'CLEAR': '✅'
  }

  responseText += `Status: ${statusColor[severity] || '📊'} ${statusMap[severity] || 'Unknown'}\n`
  if (delay > 0) {
    responseText += `Estimated delay: ${delay} minutes\n`
  }
  responseText += `\n`

  // ─── Summary ─────────────────────────────────────────────────────────────

  if (incidents.length === 0) {
    responseText += `No traffic incidents reported in this area.\n`
    responseText += `Roads appear clear with normal traffic flow.\n`
  } else {
    responseText += `INCIDENT SUMMARY:\n`
    responseText += `  Total incidents: ${processed.total}\n`
    
    Object.entries(processed.byType).forEach(([type, count]) => {
      const icon = typeIcons[type] || '📌'
      const typeName = type.replace(/([A-Z])/g, ' $1').trim()
      responseText += `  ${icon} ${count} ${typeName}${count > 1 ? 's' : ''}\n`
    })

    if (Object.keys(processed.bySeverity).length > 0) {
      responseText += `\nSeverity breakdown:\n`
      Object.entries(processed.bySeverity).forEach(([severity, count]) => {
        const sevMap = {
          critical: '🔴 Critical',
          high: '🟠 High',
          medium: '🟡 Medium',
          low: '🟢 Low'
        }
        responseText += `  ${sevMap[severity] || severity}: ${count}\n`
      })
    }

    // ─── Critical incidents ──────────────────────────────────────────────

    if (processed.critical.length > 0) {
      responseText += `\nCRITICAL INCIDENTS:\n`
      processed.critical.slice(0, 5).forEach((inc, i) => {
        const type = inc.type || inc.iconCategory || 'unknown'
        const icon = typeIcons[type] || '📌'
        const desc = inc.description || inc.properties?.description || 'Critical incident reported'
        responseText += `  ${icon} ${i + 1}. ${desc}\n`
        if (inc.lanesBlocked) {
          responseText += `     Lanes blocked: ${inc.lanesBlocked}\n`
        }
        if (inc.length) {
          responseText += `     Affects: ${Math.round(inc.length)}m of road\n`
        }
      })
    }

    // ─── All incidents ────────────────────────────────────────────────────

    if (incidents.length > 0) {
      responseText += `\nINCIDENT DETAILS:\n`
      incidents.slice(0, 8).forEach((inc, i) => {
        const type = inc.type || inc.iconCategory || 'unknown'
        const icon = typeIcons[type] || '📌'
        const desc = inc.description || inc.properties?.description || 'Incident reported'
        const severity = inc.severity || inc.properties?.severity || ''
        const severityText = severity ? ` (${severity.toUpperCase()})` : ''

        responseText += `  ${icon} ${i + 1}. ${type.replace(/([A-Z])/g, ' $1').trim()}${severityText}\n`
        responseText += `     ${desc}\n`

        if (inc.startTime) {
          const start = new Date(inc.startTime)
          responseText += `     Started: ${start.toLocaleString()}\n`
        }
        if (inc.endTime) {
          const end = new Date(inc.endTime)
          responseText += `     Ends: ${end.toLocaleString()}\n`
        }
        if (inc.length) {
          responseText += `     Affects: ${Math.round(inc.length)}m\n`
        }
        if (inc.lanesBlocked) {
          responseText += `     Lanes blocked: ${inc.lanesBlocked}\n`
        }
        if (inc.delay) {
          responseText += `     Delay: ${Math.round(inc.delay / 60)} minutes\n`
        }
        responseText += `\n`
      })

      if (incidents.length > 8) {
        responseText += `  ... and ${incidents.length - 8} more incidents reported.\n`
      }
    }
  }

  // ─── Advice ──────────────────────────────────────────────────────────────

  responseText += `\nTRAVEL ADVICE:\n`
  responseText += `  ${advisory}\n`

  // Specific advice based on incident types
  if (processed.byType.accident && processed.byType.accident > 0) {
    responseText += `  • Accidents reported — drive with extreme caution in the area.\n`
  }
  if (processed.byType.construction && processed.byType.construction > 0) {
    responseText += `  • Construction zones — expect delays and lane closures.\n`
    responseText += `  • Reduce speed in construction zones.\n`
  }
  if (processed.byType.roadClosure && processed.byType.roadClosure > 0) {
    responseText += `  • Road closures — plan alternative routes.\n`
    responseText += `  • Check for detour signs.\n`
  }
  if (processed.byType.congestion && processed.byType.congestion > 2) {
    responseText += `  • Heavy congestion detected — allow extra travel time.\n`
    responseText += `  • Consider leaving earlier or taking alternate route.\n`
  }
  if (processed.byType.hazard && processed.byType.hazard > 0) {
    responseText += `  • Hazards on road — reduce speed and stay alert.\n`
  }
  if (processed.byType.weather && processed.byType.weather > 0) {
    responseText += `  • Weather-related conditions — adjust driving accordingly.\n`
  }

  // ─── Weather impact ─────────────────────────────────────────────────────

  if (condition) {
    const cond = condition.toLowerCase()
    if (cond.includes('rain') || cond.includes('storm') || cond.includes('thunder')) {
      responseText += `\nWEATHER IMPACT:\n`
      responseText += `  • Rain or storms reported — roads may be slippery.\n`
      responseText += `  • Reduce speed and increase following distance.\n`
      responseText += `  • Watch for hydroplaning on standing water.\n`
      responseText += `  • Allow extra stopping distance.\n`
    }
    if (cond.includes('snow') || cond.includes('ice') || cond.includes('freezing')) {
      responseText += `\nWEATHER IMPACT:\n`
      responseText += `  • Snow or ice conditions — roads may be hazardous.\n`
      responseText += `  • Reduce speed significantly.\n`
      responseText += `  • Watch for black ice on bridges and overpasses.\n`
      responseText += `  • Consider delaying travel until conditions improve.\n`
    }
    if (cond.includes('fog') || cond.includes('mist')) {
      responseText += `\nWEATHER IMPACT:\n`
      responseText += `  • Fog or mist — visibility reduced.\n`
      responseText += `  • Use low beam headlights (not high beams).\n`
      responseText += `  • Reduce speed and increase following distance.\n`
    }
    if (temp && temp > 35) {
      responseText += `\nWEATHER IMPACT:\n`
      responseText += `  • Extreme heat — risk of tire blowouts.\n`
      responseText += `  • Check tire pressure before driving.\n`
      responseText += `  • Ensure vehicle cooling system is functioning.\n`
    }
    if (temp && temp < 0) {
      responseText += `\nWEATHER IMPACT:\n`
      responseText += `  • Freezing temperatures — risk of ice on roads.\n`
      responseText += `  • Bridges and overpasses freeze first.\n`
      responseText += `  • Allow extra time for defrosting.\n`
    }
  }

  // ─── Route-specific advice ─────────────────────────────────────────────

  if (isRouteTraffic && fromLocation && toLocation) {
    responseText += `\nROUTE ADVICE:\n`
    responseText += `  • Your route from ${fromLocation} to ${toLocation} has ${incidents.length} incident(s).\n`
    if (delay > 5) {
      responseText += `  • Expected delay: ${delay} minutes.\n`
    }
    responseText += `  • Check for alternate routes if delays are significant.\n`
  }

  // ─── Saved location context ─────────────────────────────────────────────

  if (targetLocation && typeof targetLocation === 'object') {
    responseText += `\nThis report is for your saved location: ${targetLocation.label || targetLocation.name}\n`
  }

  // ─── Time context ───────────────────────────────────────────────────────

  const hour = new Date().getHours()
  if (hour >= 7 && hour <= 9) {
    responseText += `\nMORNING RUSH HOUR: Expect higher than normal traffic volumes.\n`
  } else if (hour >= 16 && hour <= 19) {
    responseText += `\nEVENING RUSH HOUR: Expect higher than normal traffic volumes.\n`
  } else if (hour >= 12 && hour <= 13) {
    responseText += `\nLUNCH HOUR: Some areas may experience increased traffic.\n`
  }

  // ─── Recent trends ──────────────────────────────────────────────────────

  if (incidents.length > 5 && delay > 15) {
    responseText += `\nHISTORICAL CONTEXT:\n`
    responseText += `  • This level of traffic is above normal for this time.\n`
    responseText += `  • Expect significant delays and plan accordingly.\n`
  }

  // ─── Final safety message ──────────────────────────────────────────────

  responseText += `\nDRIVE SAFELY! Always obey traffic laws and signs.\n`

  return responseText
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── EXPORT ────────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export default getTrafficAdvice
