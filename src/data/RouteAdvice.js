// ============================================================================
// ROUTE ADVICE — Full Route Calculation with Traffic + Saved Locations
// ============================================================================

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONSTANTS ──────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkzZGIxMDYzZDZmOTQyOGZiZGFlMzk2OTA3ZWJkZjA4IiwiaCI6Im11cm11cjY0In0="
const MAPBOX_KEY = "pk.eyJ1IjoiaHllc2VudCIsImEiOiJjbXNkd2Fsd20wMTRjMndxeHZ1MXZkdWk5In0.oo-poQNG7epNSEADCQFZPQ"

const TRAFFIC_CACHE_TTL = 8 * 60 * 60 * 1000 // 8 hours
const ROUTE_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const sampleQuestions = [
  // BASIC ROUTES
  "How do I get to Lagos?",
  "What's the route from Abuja to Kano?",
  "How long will it take to drive to work?",
  "What's the distance between Lagos and Ibadan?",
  "Give me directions to the airport",
  "Route from home to school",
  "Traffic on my way to work",
  "How long to get to the office?",
  "Show me the route with traffic",
  "What's the fastest way to get there?",
  
  // ADVANCED
  "Is there a faster route to the mall?",
  "Should I take the highway or local roads?",
  "What's the best route during rush hour?",
  "Can I avoid toll roads?",
  "Show me a scenic route to the coast",
  "What's the shortest route to the city center?",
  "Is there traffic on the expressway?",
  "How long is the drive to the beach?",
  
  // SAVED LOCATIONS
  "Route from home to my office",
  "Directions from work to the gym",
  "How to get from home to the supermarket?",
  "Traffic from home to school",
  "Route from my saved location to the airport",
  
  // MULTI-STOP
  "Can I go from home to work and then to the store?",
  "Route with stops at the bank and pharmacy",
  "Best route with multiple stops",
  "How to get from point A to B to C?",
  
  // COMPARISON
  "Compare driving time vs public transport",
  "Is it faster to drive or take the train?",
  "Should I drive or take a taxi?",
  "Which route has less traffic?"
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CACHE HELPERS ─────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const getTrafficCacheKey = (lat, lon) => {
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLon = Math.round(lon * 100) / 100
  return `zephye_traffic_incidents_${roundedLat}_${roundedLon}`
}

const getRouteCacheKey = (startLat, startLon, endLat, endLon) => {
  const slat = Math.round(startLat * 100) / 100
  const slon = Math.round(startLon * 100) / 100
  const elat = Math.round(endLat * 100) / 100
  const elon = Math.round(endLon * 100) / 100
  return `zephye_route_${slat}_${slon}_${elat}_${elon}`
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

const getCachedRoute = (startLat, startLon, endLat, endLon) => {
  try {
    const key = getRouteCacheKey(startLat, startLon, endLat, endLon)
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const data = JSON.parse(cached)
    if (Date.now() - data.timestamp > ROUTE_CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return data.value
  } catch {
    return null
  }
}

const setCachedRoute = (startLat, startLon, endLat, endLon, routeData) => {
  try {
    const key = getRouteCacheKey(startLat, startLon, endLat, endLon)
    localStorage.setItem(key, JSON.stringify({
      value: routeData,
      timestamp: Date.now()
    }))
  } catch {}
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── ENHANCED HELPERS ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

/**
 * Geocode a location name to coordinates with multiple attempts
 */
const geocodeLocation = async (locationName) => {
  if (!locationName) return null
  
  try {
    // Try Open-Meteo geocoding first
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
        country_code: r.country_code,
        population: r.population || 0,
        timezone: r.timezone || 'unknown',
        elevation: r.elevation || 0
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Enhanced location resolution with multiple strategies
 */
const resolveLocation = async (locationName, savedLocations, currentLocation) => {
  if (!locationName) return null
  
  // Check if it's a saved location
  const saved = findSavedLocation(locationName, savedLocations)
  if (saved) return saved
  
  // Check for common references
  const lower = locationName.toLowerCase().trim()
  if (lower === 'home' || lower === 'my place') {
    return currentLocation ? { ...currentLocation, isSaved: true } : null
  }
  if (lower === 'work' || lower === 'office') {
    const work = savedLocations.find(l => 
      l.label?.toLowerCase().includes('work') || 
      l.label?.toLowerCase().includes('office')
    )
    if (work) return work
  }
  
  // Try geocoding
  return await geocodeLocation(locationName)
}

/**
 * Enhanced saved location search
 */
const findSavedLocation = (name, savedLocations) => {
  if (!savedLocations || savedLocations.length === 0) return null
  
  const lowerName = name.toLowerCase().trim()
  
  // Exact match on label
  let match = savedLocations.find(loc => 
    loc.label && loc.label.toLowerCase() === lowerName
  )
  if (match) return match
  
  // Contains match
  match = savedLocations.find(loc => {
    const label = loc.label?.toLowerCase() || ''
    const locName = loc.name?.toLowerCase() || ''
    return label.includes(lowerName) || locName.includes(lowerName)
  })
  
  return match || null
}

/**
 * Get traffic incidents with enhanced details
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
 * Get traffic incidents for a specific route
 */
const getRouteTraffic = async (startLat, startLon, endLat, endLon) => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?` +
      `annotations=congestion,incidents&` +
      `access_token=${MAPBOX_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      return { incidents: [], delay: 0, congestion: [] }
    }

    const route = data.routes[0]
    const incidents = route.incidents || []
    const congestion = route.legs?.[0]?.annotation?.congestion || []
    
    // Calculate traffic delay
    let delay = 0
    if (route.duration) {
      // Compare with typical duration (estimate based on distance and speed)
      const typicalSpeed = 50 // km/h average
      const distance = route.distance / 1000 // km
      const typicalDuration = (distance / typicalSpeed) * 60 // minutes
      const actualDuration = route.duration / 60 // minutes
      delay = Math.max(0, Math.round(actualDuration - typicalDuration))
    }

    return { incidents, delay, congestion }
  } catch {
    return { incidents: [], delay: 0, congestion: [] }
  }
}

/**
 * Enhanced route calculation with multiple options
 */
const calculateRoute = async (startLat, startLon, endLat, endLon, options = {}) => {
  const cacheKey = getRouteCacheKey(startLat, startLon, endLat, endLon)
  const cached = getCachedRoute(startLat, startLon, endLat, endLon)
  if (cached && !options.forceRefresh) {
    return cached
  }

  try {
    let url = `https://api.openrouteservice.org/v2/directions/driving-car?` +
      `api_key=${ORS_API_KEY}&` +
      `start=${startLon},${startLat}&` +
      `end=${endLon},${endLat}`

    // Add preferences
    if (options.avoidTolls) {
      url += `&options={"avoid_features":["toll"]}`
    }
    if (options.avoidHighways) {
      url += `&options={"avoid_features":["highway"]}`
    }
    if (options.avoidFerries) {
      url += `&options={"avoid_features":["ferry"]}`
    }

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      setCachedRoute(startLat, startLon, endLat, endLon, data)
      return data
    }

    return null
  } catch (error) {
    console.error('Route calculation failed:', error)
    return null
  }
}

/**
 * Calculate alternative routes
 */
const calculateAlternativeRoutes = async (startLat, startLon, endLat, endLon) => {
  try {
    // ORS doesn't provide multiple routes directly, so we'll use Mapbox
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?` +
      `alternatives=true&` +
      `steps=true&` +
      `access_token=${MAPBOX_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.routes && data.routes.length > 1) {
      return data.routes.slice(1).map(route => ({
        distance: route.distance / 1000,
        duration: route.duration / 60,
        geometry: route.geometry,
        legs: route.legs
      }))
    }

    return []
  } catch {
    return []
  }
}

/**
 * Calculate route summary for multiple destinations
 */
const calculateMultiStopRoute = async (stops) => {
  if (stops.length < 2) return null

  try {
    // Build coordinate string for ORS
    const coords = stops.map(s => `${s.lon},${s.lat}`).join(';')
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?` +
      `api_key=${ORS_API_KEY}&` +
      `start=${coords}&` +
      `end=${coords}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      return data.features[0]
    }

    return null
  } catch {
    return null
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── FORMATTING FUNCTIONS ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
 * Format duration with more detail
 */
const formatDurationDetailed = (minutes) => {
  if (minutes < 1) return 'less than a minute'
  if (minutes < 60) return `${Math.round(minutes)} minutes`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  let result = `${hours} hour${hours > 1 ? 's' : ''}`
  if (mins > 0) {
    result += ` and ${mins} minute${mins > 1 ? 's' : ''}`
  }
  return result
}

/**
 * Format distance in a readable way
 */
const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} meters`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

/**
 * Format speed in a readable way
 */
const formatSpeed = (kmh) => {
  if (kmh < 10) return `${Math.round(kmh * 10) / 10} km/h (slow)`
  if (kmh < 30) return `${Math.round(kmh)} km/h (moderate)`
  if (kmh < 50) return `${Math.round(kmh)} km/h (normal)`
  if (kmh < 70) return `${Math.round(kmh)} km/h (fast)`
  return `${Math.round(kmh)} km/h (very fast)`
}

/**
 * Get time of day greeting
 */
const getTimeGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN FUNCTION ─────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const getRouteAdvice = async (data, question, options = {}) => {
  const q = question.toLowerCase()
  const { 
    lat, lon, city, 
    homeLat, homeLon, homeName, 
    savedLocations = [],
    condition,
    temp,
    wind,
    precipitation
  } = data

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── PARSE LOCATIONS FROM QUESTION ──────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  let fromLocation = options.from || 'home'
  let toLocation = options.to || null
  let isMultiStop = false
  let stops = []

  // Check for multi-stop routes
  const stopMatch = q.match(/(?:from|starting|start)\s+([\w\s]+?)\s+(?:to|via|through)\s+([\w\s]+?)\s+(?:then|and|to)\s+([\w\s]+?)(?:\s*$|[\?\.])/i)
  if (stopMatch) {
    isMultiStop = true
    stops = [stopMatch[1].trim(), stopMatch[2].trim(), stopMatch[3].trim()]
  }

  // Parse destination
  if (!toLocation) {
    const toMatch = q.match(/to\s+([\w\s]+?)(?:\s*$|[\?\.]|,)/i)
    if (toMatch) toLocation = toMatch[1].trim()
  }

  // Parse origin
  if (!fromLocation || fromLocation === 'home' || fromLocation === 'my location' || fromLocation === 'here') {
    const fromMatch = q.match(/from\s+([\w\s]+?)(?:\s+to|\s*$)/i)
    if (fromMatch) fromLocation = fromMatch[1].trim()
  }

  // Check for route preferences
  const avoidTolls = q.includes('avoid toll') || q.includes('no toll')
  const avoidHighways = q.includes('avoid highway') || q.includes('no highway') || q.includes('local roads')
  const scenicRoute = q.includes('scenic') || q.includes('beautiful') || q.includes('coastal')
  const fastestRoute = q.includes('fastest') || q.includes('quickest') || q.includes('shortest time')
  const shortestRoute = q.includes('shortest distance') || q.includes('closest')

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── RESOLVE LOCATIONS ──────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const currentLocation = { lat: homeLat || lat, lon: homeLon || lon, name: homeName || city || 'Your Location' }
  
  // Resolve start
  let startResolved = null
  if (typeof fromLocation === 'object' && fromLocation.isSaved) {
    startResolved = fromLocation
  } else if (typeof fromLocation === 'string') {
    startResolved = await resolveLocation(fromLocation, savedLocations, currentLocation)
  }

  // Resolve destination
  let endResolved = null
  if (typeof toLocation === 'object' && toLocation.isSaved) {
    endResolved = toLocation
  } else if (typeof toLocation === 'string') {
    endResolved = await resolveLocation(toLocation, savedLocations, currentLocation)
  }

  // Resolve multi-stop locations
  let stopLocations = []
  if (isMultiStop && stops.length > 0) {
    for (const stopName of stops) {
      const resolved = await resolveLocation(stopName, savedLocations, currentLocation)
      if (resolved) {
        stopLocations.push(resolved)
      }
    }
  }

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── HANDLE MISSING LOCATIONS ───────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  if (!startResolved) {
    return `I couldn't find the starting location "${fromLocation}". Please specify a valid location or use "home".`
  }

  if (!endResolved && !isMultiStop) {
    return `I couldn't find the destination "${toLocation}". Please specify where you want to go.`
  }

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── MULTI-STOP ROUTE ──────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  if (isMultiStop && stopLocations.length >= 2) {
    const allStops = [startResolved, ...stopLocations]
    const route = await calculateMultiStopRoute(allStops)
    
    if (route) {
      const segments = route.properties.segments || []
      let totalDistance = 0
      let totalDuration = 0
      let stepList = []

      segments.forEach((seg, idx) => {
        totalDistance += seg.distance || 0
        totalDuration += seg.duration || 0
        const steps = seg.steps || []
        steps.forEach(step => {
          if (step.instruction) {
            stepList.push(`  ${stepList.length + 1}. ${step.instruction}`)
          }
        })
      })

      const distanceKm = totalDistance / 1000
      const durationMin = totalDuration / 60

      let response = `MULTI-STOP ROUTE:\n\n`
      response += `Start: ${startResolved.label || startResolved.name}\n`
      stopLocations.forEach((loc, i) => {
        response += `Stop ${i + 1}: ${loc.label || loc.name}\n`
      })
      response += `\nTotal distance: ${formatDistance(distanceKm)}\n`
      response += `Total estimated time: ${formatDuration(durationMin)}\n\n`
      response += `Directions:\n`
      stepList.slice(0, 15).forEach(s => response += `${s}\n`)
      if (stepList.length > 15) {
        response += `  ... and ${stepList.length - 15} more steps.\n`
      }
      return response
    }
  }

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── SINGLE ROUTE CALCULATION ──────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const routePrefs = {
    avoidTolls: avoidTolls || false,
    avoidHighways: avoidHighways || false,
    scenic: scenicRoute || false
  }

  const routeData = await calculateRoute(
    startResolved.lat, startResolved.lon,
    endResolved.lat, endResolved.lon,
    { forceRefresh: false, ...routePrefs }
  )

  if (!routeData) {
    return `Could not find a route from ${startResolved.label || startResolved.name} to ${endResolved.label || endResolved.name}. Please try different locations.`
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
  const avgSpeed = durationMin > 0 ? (distanceKm / (durationMin / 60)) : 0

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── GET TRAFFIC DATA ──────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const traffic = await getRouteTraffic(
    startResolved.lat, startResolved.lon,
    endResolved.lat, endResolved.lon
  )

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── GET ALTERNATIVE ROUTES ────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const alternatives = await calculateAlternativeRoutes(
    startResolved.lat, startResolved.lon,
    endResolved.lat, endResolved.lon
  )

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── BUILD RESPONSE ────────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  let response = `=== ROUTE ADVISORY ===\n`
  response += `${getTimeGreeting()}\n\n`

  // Route summary
  response += `ROUTE SUMMARY:\n`
  response += `  From: ${startResolved.label || startResolved.name}\n`
  response += `  To: ${endResolved.label || endResolved.name}\n`
  response += `  Distance: ${formatDistance(distanceKm)}\n`
  response += `  Estimated time: ${formatDuration(durationMin)}\n`
  if (avgSpeed > 0) {
    response += `  Average speed: ${formatSpeed(avgSpeed)}\n`
  }
  if (startResolved.isSaved) {
    response += `  Start location is saved\n`
  }
  if (endResolved.isSaved) {
    response += `  Destination is saved\n`
  }

  // Traffic info
  if (traffic.incidents.length > 0) {
    response += `\nTRAFFIC INCIDENTS (${traffic.incidents.length}):\n`
    traffic.incidents.slice(0, 5).forEach((inc, i) => {
      const type = inc.type || inc.iconCategory || 'unknown'
      const desc = inc.description || inc.properties?.description || 'Incident reported'
      const severity = inc.severity || inc.properties?.severity || ''
      const severityText = severity ? ` (${severity})` : ''
      response += `  ${i + 1}. ${type.charAt(0).toUpperCase() + type.slice(1)}${severityText}\n`
      response += `     ${desc}\n`
      if (inc.length) {
        response += `     Affects: ${Math.round(inc.length)}m\n`
      }
      if (inc.lanesBlocked) {
        response += `     Lanes blocked: ${inc.lanesBlocked}\n`
      }
    })
    if (traffic.incidents.length > 5) {
      response += `  ... and ${traffic.incidents.length - 5} more incidents.\n`
    }
    if (traffic.delay > 5) {
      response += `\n  Estimated delay: ${traffic.delay} minutes\n`
    }
  } else {
    response += `\nNo major traffic incidents reported on this route.\n`
  }

  // Route preferences
  if (avoidTolls) {
    response += `\n  Toll roads avoided\n`
  }
  if (avoidHighways) {
    response += `\n  Highways avoided\n`
  }
  if (scenicRoute) {
    response += `\n  Scenic route preferred\n`
  }

  // Alternative routes
  if (alternatives.length > 0) {
    response += `\nALTERNATIVE ROUTES:\n`
    alternatives.slice(0, 2).forEach((alt, i) => {
      const timeDiff = Math.round(alt.duration - durationMin)
      const distDiff = Math.round(alt.distance - distanceKm)
      response += `  Option ${i + 1}: ${formatDistance(alt.distance)}`
      response += `, ${formatDuration(alt.duration)}`
      if (timeDiff > 0) {
        response += ` (${timeDiff} min longer)`
      } else if (timeDiff < 0) {
        response += ` (${Math.abs(timeDiff)} min faster)`
      }
      if (distDiff > 0) {
        response += `, ${distDiff} km longer`
      } else if (distDiff < 0) {
        response += `, ${Math.abs(distDiff)} km shorter`
      }
      response += `\n`
    })
    response += `  Ask "show alternative route" for more options.\n`
  }

  // Step-by-step directions
  if (steps && steps.length > 0) {
    response += `\nDIRECTIONS:\n`
    const maxSteps = 20
    steps.slice(0, maxSteps).forEach((step, i) => {
      const instruction = step.instruction || step.maneuver?.instruction || ''
      const stepDist = step.distance ? ` (${formatDistance(step.distance / 1000)})` : ''
      if (instruction) {
        response += `  ${i + 1}. ${instruction}${stepDist}\n`
      }
    })
    if (steps.length > maxSteps) {
      response += `  ... and ${steps.length - maxSteps} more steps.\n`
      response += `  Ask "show full directions" for all steps.\n`
    }
  }

  // Weather impact
  if (condition) {
    const cond = condition.toLowerCase()
    let weatherNote = false
    if (cond.includes('rain') || cond.includes('storm') || cond.includes('thunder')) {
      response += `\nWEATHER WARNING: ${condition} conditions\n`
      response += `  Drive with extra caution. Reduce speed. Increase following distance.\n`
      weatherNote = true
    }
    if (temp && temp < 5) {
      response += `\nCOLD WEATHER: ${Math.round(temp)}°C\n`
      response += `  Roads may be icy in shaded areas. Watch for black ice on bridges.\n`
      weatherNote = true
    }
    if (temp && temp > 35) {
      response += `\nHOT WEATHER: ${Math.round(temp)}°C\n`
      response += `  Ensure your vehicle is cooled. Carry water. Check tire pressure.\n`
      weatherNote = true
    }
    if (!weatherNote) {
      response += `\nWeather conditions are favorable for driving.\n`
    }
  }

  // Travel tips
  response += `\nTRAVEL TIPS:\n`
  
  if (distanceKm > 200) {
    response += `  • Long journey — plan for breaks every 2-3 hours.\n`
    response += `  • Check your fuel level before leaving.\n`
    response += `  • Pack snacks and water for the trip.\n`
  } else if (distanceKm > 100) {
    response += `  • Consider a break halfway for refreshments.\n`
    response += `  • Check your fuel level before leaving.\n`
  }

  if (durationMin > 120) {
    response += `  • Stretch your legs during rest stops.\n`
    response += `  • Share your route and ETA with someone.\n`
  } else if (durationMin > 60) {
    response += `  • Allow extra time for unexpected delays.\n`
  }

  if (traffic.delay > 15) {
    response += `  • Significant delays expected. Consider leaving earlier.\n`
  }

  // Nearest saved location
  if (savedLocations.length > 0) {
    const nearest = savedLocations.reduce((nearest, loc) => {
      const dist = Math.sqrt(
        Math.pow(loc.lat - endResolved.lat, 2) + 
        Math.pow(loc.lon - endResolved.lon, 2)
      )
      if (!nearest || dist < nearest.dist) {
        return { ...loc, dist }
      }
      return nearest
    }, null)
    
    if (nearest && nearest.dist < 0.5) {
      response += `\nYou are near "${nearest.label || nearest.name}" — a saved location.\n`
    }
  }

  // Arrival time estimate
  const arrivalTime = new Date(Date.now() + durationMin * 60000 + (traffic.delay || 0) * 60000)
  response += `\nEstimated arrival: ${arrivalTime.toLocaleTimeString()}\n`

  // Final advice
  response += `\nDrive safely and enjoy the journey!`

  return response
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── EXPORT ────────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export default getRouteAdvice
