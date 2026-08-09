// ============================================================================
// ROUTE ADVICE — Full Route Calculation with Traffic + Saved Locations
// ============================================================================

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONSTANTS ──────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkzZGIxMDYzZDZmOTQyOGZiZGFlMzk2OTA3ZWJkZjA4IiwiaCI6Im11cm11cjY0In0="
const MAPBOX_KEY = "pk.eyJ1IjoiaHllc2VudCIsImEiOiJjbXNkd2Fsd20wMTRjMndxeHZ1MXZkdWk5In0.oo-poQNG7epNSEADCQFZPQ"

const TRAFFIC_CACHE_TTL = 8 * 60 * 60 * 1000 // 8 hours

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const sampleQuestions = [
  "How do I get to Lagos?",
  "What's the route from Abuja to Kano?",
  "How long will it take to drive to work?",
  "What's the distance between Lagos and Ibadan?",
  "Give me directions to the airport",
  "Route from home to school",
  "Traffic on my way to work",
  "How long to get to the office?",
  "Show me the route with traffic",
  "What's the fastest way to get there?"
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

/**
 * Geocode a location name to coordinates
 */
const geocodeLocation = async (locationName) => {
  if (!locationName) return null
  
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`
    )
    const data = await res.json()
    
    if (data.results && data.results.length > 0) {
      const r = data.results[0]
      return {
        lat: r.latitude,
        lon: r.longitude,
        name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}, ${r.country}`,
        admin1: r.admin1,
        country: r.country,
        country_code: r.country_code
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Find a saved location by name
 */
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
 * Get traffic incidents for an area
 */
const fetchTrafficIncidents = async (lat, lon) => {
  const cached = getCachedTraffic(lat, lon)
  if (cached) {
    console.log('Using cached traffic data for', lat, lon)
    return cached
  }

  try {
    const destLat = lat + 0.1
    const destLon = lon + 0.1
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon},${lat};${destLon},${destLat}?` +
      `annotations=congestion,incidents&` +
      `access_token=${MAPBOX_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    let incidents = []

    if (data.routes && data.routes.length > 0) {
      incidents = data.routes[0].incidents || []
    }

    if (incidents.length === 0) {
      const widerUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon - 0.2},${lat - 0.2};${lon + 0.2},${lat + 0.2}?` +
        `annotations=incidents&` +
        `access_token=${MAPBOX_KEY}`

      const widerResponse = await fetch(widerUrl)
      const widerData = await widerResponse.json()

      if (widerData.routes && widerData.routes.length > 0) {
        incidents = widerData.routes[0].incidents || []
      }
    }

    setCachedTraffic(lat, lon, incidents)
    return incidents

  } catch (error) {
    console.error('Failed to fetch traffic incidents:', error)
    return []
  }
}

/**
 * Format duration in a readable way
 */
const formatDuration = (minutes) => {
  if (minutes < 1) return 'less than a minute'
  if (minutes < 60) return `${Math.round(minutes)} minutes`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${hours}h ${mins}m`
}

/**
 * Format distance in a readable way
 */
const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} meters`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN FUNCTION ─────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const getRouteAdvice = async (data, question, options = {}) => {
  const q = question.toLowerCase()
  const { 
    lat, lon, city, 
    homeLat, homeLon, homeName, 
    savedLocations = [] 
  } = data

  // ─── Parse locations from question ──────────────────────────────────────

  let fromLocation = options.from || 'home'
  let toLocation = options.to || null

  if (!toLocation) {
    const toMatch = q.match(/to\s+([\w\s]+?)(?:\s*$|[\?\.])/i)
    if (toMatch) toLocation = toMatch[1].trim()
  }

  if (!fromLocation || fromLocation === 'home' || fromLocation === 'my location' || fromLocation === 'here') {
    const fromMatch = q.match(/from\s+([\w\s]+?)(?:\s+to|\s*$)/i)
    if (fromMatch) fromLocation = fromMatch[1].trim()
  }

  // ─── Check if user mentioned any saved location ─────────────────────────

  let mentionedSavedLocation = null
  for (const loc of savedLocations) {
    const label = loc.label?.toLowerCase() || ''
    const locName = loc.name?.toLowerCase() || ''
    if (q.includes(label) || q.includes(locName)) {
      mentionedSavedLocation = loc
      break
    }
  }

  // ─── Resolve start location ─────────────────────────────────────────────

  let startCoords = null
  let startLabel = null
  let startIsSaved = false

  if (typeof fromLocation === 'object' && fromLocation.isSaved) {
    startCoords = { lat: fromLocation.lat, lon: fromLocation.lon, name: fromLocation.label || fromLocation.name }
    startLabel = fromLocation.label || fromLocation.name
    startIsSaved = true
  } else if (typeof fromLocation === 'string') {
    if (fromLocation === 'home' || fromLocation === 'my location' || fromLocation === 'here' || fromLocation === 'my place') {
      startCoords = { lat: homeLat || lat, lon: homeLon || lon, name: homeName || city || 'Your Location' }
      startLabel = 'Home'
    } else {
      const saved = findSavedLocation(fromLocation, savedLocations)
      if (saved) {
        startCoords = { lat: saved.lat, lon: saved.lon, name: saved.label || saved.name }
        startLabel = saved.label || saved.name
        startIsSaved = true
      } else {
        startCoords = await geocodeLocation(fromLocation)
        if (startCoords) {
          startLabel = startCoords.name
        }
      }
    }
  }

  // ─── Resolve destination location ────────────────────────────────────────

  let endCoords = null
  let endLabel = null
  let endIsSaved = false

  if (typeof toLocation === 'object' && toLocation.isSaved) {
    endCoords = { lat: toLocation.lat, lon: toLocation.lon, name: toLocation.label || toLocation.name }
    endLabel = toLocation.label || toLocation.name
    endIsSaved = true
  } else if (typeof toLocation === 'string') {
    const saved = findSavedLocation(toLocation, savedLocations)
    if (saved) {
      endCoords = { lat: saved.lat, lon: saved.lon, name: saved.label || saved.name }
      endLabel = saved.label || saved.name
      endIsSaved = true
    } else {
      endCoords = await geocodeLocation(toLocation)
      if (endCoords) {
        endLabel = endCoords.name
      }
    }
  }

  // ─── If user mentioned a saved location but didn't specify from/to ──────

  if (mentionedSavedLocation && !toLocation && !fromLocation) {
    startCoords = { lat: homeLat || lat, lon: homeLon || lon, name: homeName || city || 'Your Location' }
    startLabel = 'Home'
    endCoords = { lat: mentionedSavedLocation.lat, lon: mentionedSavedLocation.lon, name: mentionedSavedLocation.label || mentionedSavedLocation.name }
    endLabel = mentionedSavedLocation.label || mentionedSavedLocation.name
    endIsSaved = true
  }

  // ─── Check if user asked "traffic to [location]" without route ──────────

  const isTrafficOnly = q.includes('traffic') && !q.includes('route') && !q.includes('drive') && !q.includes('go to')
  
  if (isTrafficOnly && endCoords && !startCoords) {
    startCoords = { lat: homeLat || lat, lon: homeLon || lon, name: homeName || city || 'Your Location' }
    startLabel = 'Your Location'
  }

  // ─── If we couldn't resolve locations ────────────────────────────────────

  if (!endCoords && !toLocation) {
    return `I couldn't find a destination. Please specify where you want to go, e.g., "Route to Lagos" or "How long to get to work?"`
  }

  if (!endCoords) {
    const savedNames = savedLocations.map(l => `"${l.label || l.name}"`).join(', ')
    return `I couldn't find the destination "${toLocation}". ${savedLocations.length > 0 ? `Your saved locations: ${savedNames}` : 'Try saving locations in the app first.'}`
  }

  if (!startCoords) {
    return `I couldn't find the starting location "${fromLocation}". Try "from home" or specify a city.`
  }

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── CALCULATE ROUTE ─────────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?` +
      `api_key=${ORS_API_KEY}&` +
      `start=${startCoords.lon},${startCoords.lat}&` +
      `end=${endCoords.lon},${endCoords.lat}`

    const response = await fetch(url)
    const routeData = await response.json()

    if (!routeData.features || routeData.features.length === 0) {
      return `Could not find a route from ${startLabel || startCoords.name} to ${endLabel || endCoords.name}. Please try different locations.`
    }

    const feature = routeData.features[0]
    const properties = feature.properties
    const segments = properties.segments || []

    if (segments.length === 0) {
      return `No route found between these locations.`
    }

    const segment = segments[0]
    const distance = segment.distance || 0
    const duration = segment.duration || 0
    const steps = segment.steps || []

    const distanceKm = distance / 1000
    const durationMin = duration / 60

    // ─── Build response ────────────────────────────────────────────────────

    let responseText = `Route from ${startLabel || startCoords.name} to ${endLabel || endCoords.name}\n\n`

    if (startIsSaved) {
      responseText += `Start: ${startLabel} (saved location)\n`
    } else {
      responseText += `Start: ${startLabel || startCoords.name}\n`
    }
    
    if (endIsSaved) {
      responseText += `Destination: ${endLabel} (saved location)\n`
    } else {
      responseText += `Destination: ${endLabel || endCoords.name}\n`
    }

    responseText += `\nDistance: ${formatDistance(distanceKm)}\n`
    responseText += `Estimated driving time: ${formatDuration(durationMin)}\n`

    // ─── Fetch traffic incidents for the route ────────────────────────────

    let incidents = []
    let trafficDelay = 0

    try {
      const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?` +
        `annotations=congestion,incidents&` +
        `access_token=${MAPBOX_KEY}`

      const mapboxRes = await fetch(mapboxUrl)
      const mapboxData = await mapboxRes.json()

      if (mapboxData.routes && mapboxData.routes.length > 0) {
        const route = mapboxData.routes[0]
        incidents = route.incidents || []
        
        if (route.duration && duration) {
          const mapboxDuration = route.duration / 60
          if (mapboxDuration > durationMin * 1.05) {
            trafficDelay = Math.round(mapboxDuration - durationMin)
          }
        }
      }

      if (incidents.length === 0) {
        const cached = getCachedTraffic((startCoords.lat + endCoords.lat) / 2, (startCoords.lon + endCoords.lon) / 2)
        if (cached) {
          incidents = cached
        }
      }

    } catch {
      // Traffic data unavailable — proceed without it
    }

    // ─── Display traffic incidents ────────────────────────────────────────

    if (incidents && incidents.length > 0) {
      const incidentCount = incidents.length
      responseText += `\n${incidentCount} traffic incident${incidentCount > 1 ? 's' : ''} on route:\n`
      
      incidents.slice(0, 5).forEach((inc, i) => {
        const type = inc.type || inc.iconCategory || 'unknown'
        const desc = inc.description || inc.properties?.description || 'Traffic incident reported'
        const severity = inc.severity || inc.properties?.severity || ''
        const severityText = severity ? ` (${severity})` : ''

        responseText += `  ${i + 1}. ${type.charAt(0).toUpperCase() + type.slice(1)}${severityText}\n`
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
      })

      if (incidents.length > 5) {
        responseText += `  ... and ${incidents.length - 5} more incidents on the route.\n`
      }

      if (trafficDelay > 5) {
        responseText += `\nTraffic delay: ~${trafficDelay} minutes extra\n`
        responseText += `   Consider leaving earlier or finding an alternate route.\n`
      }
    } else {
      responseText += `\nNo major traffic incidents reported on this route.\n`
    }

    // ─── Step-by-step directions (ALL STEPS - NO TRUNCATION) ──────────────

    if (steps && steps.length > 0) {
      responseText += `\nDirections:\n`
      
      // ─── FIX: Show ALL steps, no truncation ──────────────────────────────
      steps.forEach((step, i) => {
        const instruction = step.instruction || step.maneuver?.instruction || ''
        const stepDist = step.distance ? ` (${formatDistance(step.distance / 1000)})` : ''
        if (instruction) {
          responseText += `  ${i + 1}. ${instruction}${stepDist}\n`
        }
      })
    }

    // ─── Alternative routes (if available) ────────────────────────────────

    if (routeData.features.length > 1) {
      responseText += `\n${routeData.features.length - 1} alternative route${routeData.features.length - 1 > 1 ? 's' : ''} available.\n`
      responseText += `   Ask "show alternative route" for more options.\n`
    }

    // ─── Weather impact on driving ────────────────────────────────────────

    if (data.condition) {
      const condition = data.condition.toLowerCase()
      if (condition.includes('rain') || condition.includes('storm') || condition.includes('thunder')) {
        responseText += `\nWeather warning: ${data.condition} conditions — drive with extra caution.\n`
      }
      if (data.temp && data.temp < 5) {
        responseText += `Cold weather: ${Math.round(data.temp)}°C — roads may be icy in shaded areas.\n`
      }
      if (data.temp && data.temp > 35) {
        responseText += `Hot weather: ${Math.round(data.temp)}°C — ensure your vehicle is cooled and carry water.\n`
      }
    }

    // ─── Travel tips ──────────────────────────────────────────────────────

    responseText += `\nTravel tips:\n`
    
    if (distanceKm > 100) {
      responseText += `  • Long journey — plan for breaks every 2-3 hours.\n`
    }
    
    if (durationMin > 60) {
      responseText += `  • Pack snacks and water for the trip.\n`
      responseText += `  • Check your fuel level before leaving.\n`
    }
    
    if (trafficDelay > 10) {
      responseText += `  • Significant delays expected — consider leaving earlier.\n`
    }

    // Find the nearest saved location
    if (savedLocations.length > 0 && !endIsSaved) {
      const nearest = savedLocations.reduce((nearest, loc) => {
        const dist = Math.sqrt(
          Math.pow(loc.lat - endCoords.lat, 2) + 
          Math.pow(loc.lon - endCoords.lon, 2)
        )
        if (!nearest || dist < nearest.dist) {
          return { ...loc, dist }
        }
        return nearest
      }, null)
      
      if (nearest && nearest.dist < 0.5) {
        responseText += `\nYou're near "${nearest.label || nearest.name}" — a saved location!\n`
      }
    }

    responseText += `\nDrive safely!`

    return responseText

  } catch (error) {
    console.error('Route calculation failed:', error)
    return `Error calculating route. Please try again later.`
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── EXPORT ────────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export default getRouteAdvice
