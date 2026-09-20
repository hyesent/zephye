;// ============================================================================
// ROUTE ADVICE — Full directions, all modes, weather-along-the-way
//
// The weather resolver + response merger do the heavy lifting:
//   - resolver: parses from/to, geocodes, fetches route via ORS,
//               samples waypoints, batch-fetches weather
//   - merger:   runs this module with { _route, _waypoints } pre-populated
//
// This module just narrates. No fetching. No parsing. No truncation.
// ============================================================================

// ─── SAFE HELPERS ──────────────────────────────────────────────────────

function safeStr(v, fallback = '') {
  if (v == null) return fallback
  if (typeof v === 'string') return v
  try { return String(v) } catch { return fallback }
}

function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return null
  const totalMin = Math.round(seconds / 60)
  if (totalMin < 1) return 'less than a minute'
  if (totalMin < 60) return `${totalMin} min`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return null
  const km = meters / 1000
  if (km < 1) return `${Math.round(meters)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

f'\
  [unction modeLabel(mode) {
  const map = {
    car: 'Car', driving: 'Car',
    hgv: 'Truck', truck: 'Truck',
    walk: 'Walking', walking: 'Walking', foot: 'Walking',
    hike: 'Hiking', hiking: 'Hiking',
    cycle: 'Cycling', cycling: 'Cycling', bike: 'Cycling', bicycle: 'Cycling',
    roadbike: 'Road Cycling', mtb: 'Mountain Biking', ebike: 'E-Bike',
    wheelchair: 'Wheelchair',
  }
  return map[mode] || 'Driving'
}

function modeEmoji(mode) {
  const map = {
    car: '🚗', driving: '🚗',
    hgv: '🚚', truck: '🚚',
    walk: '🚶', walking: '🚶', foot: '🚶',
    hike: '🥾', hiking: '🥾',
    cycle: '🚴', cycling: '🚴', bike: '🚴', bicycle: '🚴',
    roadbike: '🚴', mtb: '🚵', ebike: '⚡🚴',
    wheelchair: '♿',
  }
  return map[mode] || '🚗'
}

function weatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌧️'
  if (code >= 85 && code <= 86) return '❄️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

function isWetCode(code) {
  if (code == null) return false
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}

function isStormCode(code) {
  return code != null && code >= 95
}

function isSnowCode(code) {
  return code != null && ((code >= 71 && code <= 77) || code === 85 || code === 86)
}

// ─── MULTI-STOP WEATHER DIAGRAM ────────────────────────────────────────

/**
 * Build a one-line diagram showing weather at each waypoint.
 *
 *   Home → ☀️ → Stop 1 → 🌧️ → Stop 2 → ⛅ → Work
 */
function buildWeatherDiagram(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) return ''

  const parts = []
  waypoints.forEach((wp, i) => {
    const emoji = weatherEmoji(wp.weather?.conditionCode)
    const label = safeStr(wp.label || `Stop ${i + 1}`).trim()
    parts.push(label)
    parts.push(emoji)
  })

  // Trailing destination label without an emoji
  return parts.join(' → ')
}

// ─── WEATHER ALONG THE ROUTE SUMMARY ───────────────────────────────────

function buildWeatherNarrative(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) return ''

  const wetIndices = []
  const snowIndices = []
  const stormIndices = []

  waypoints.forEach((wp, i) => {
    const code = wp.weather?.conditionCode
    const rain = wp.weather?.precipitationProb ?? 0
    if (isStormCode(code)) stormIndices.push(i)
    else if (isSnowCode(code)) snowIndices.push(i)
    else if (isWetCode(code) || rain > 60) wetIndices.push(i)
  })

  const parts = []

  if (stormIndices.length === waypoints.length) {
    parts.push('Thunderstorms throughout the route — postpone if possible.')
  } else if (stormIndices.length > 0) {
    const labels = stormIndices.map(i => waypoints[i].label).filter(Boolean)
    parts.push(`Thunderstorms around ${labels.join(', ')}. Take shelter if caught.`)
  } else if (wetIndices.length === waypoints.length) {
    parts.push('Rain throughout the journey — wet roads, drive carefully.')
  } else if (snowIndices.length === waypoints.length) {
    parts.push('Snow throughout the route — winter tires and slow speeds essential.')
  } else if (snowIndices.length > 0) {
    const labels = snowIndices.map(i => waypoints[i].label).filter(Boolean)
    parts.push(`Snow around ${labels.join(', ')} — allow extra time.`)
  } else if (wetIndices.length > 0) {
    const first = waypoints[wetIndices[0]]?.label
    const last = waypoints[wetIndices[wetIndices.length - 1]]?.label
    if (wetIndices.length === 1) {
      parts.push(`Rain expected around ${first}. Watch for wet roads in that section.`)
    } else if (first === last) {
      parts.push(`Rain expected around ${first}.`)
    } else {
      parts.push(`Rain from ${first} to ${last}. Drive carefully through the wet section.`)
    }
  } else {
    // No rain anywhere — mention temp spread
    const temps = waypoints.map(w => w.weather?.temp).filter(t => t != null)
    if (temps.length > 1) {
      const min = Math.min(...temps)
      const max = Math.max(...temps)
      if (max - min >= 5) {
        parts.push(`Temperatures range from ${Math.round(min)}°C to ${Math.round(max)}°C along the route.`)
      } else {
        parts.push(`Consistent conditions throughout — around ${Math.round((min + max) / 2)}°C.`)
      }
    } else if (temps.length === 1) {
      parts.push(`Around ${Math.round(temps[0])}°C along the route.`)
    }
  }

  // Wind warning
  const windyWaypoints = waypoints.filter(wp => (wp.weather?.wind ?? 0) > 40)
  if (windyWaypoints.length > 0) {
    const labels = windyWaypoints.map(w => w.label).filter(Boolean)
    parts.push(`Strong wind near ${labels.join(', ')} — expect crosswinds.`)
  }

  // Fog warning
  const foggyWaypoints = waypoints.filter(wp => wp.weather?.visibility != null && wp.weather.visibility < 1)
  if (foggyWaypoints.length > 0) {
    const labels = foggyWaypoints.map(w => w.label).filter(Boolean)
    parts.push(`Low visibility near ${labels.join(', ')} — reduce speed.`)
  }

  return parts.join(' ')
}

// ─── MODE-SPECIFIC ADVICE ──────────────────────────────────────────────

function buildModeAdvice(mode, route, waypoints) {
  const advice = []
  const m = (mode || 'car').toLowerCase()

  // Extract weather signals from waypoints
  const anyRain = waypoints.some(w => isWetCode(w.weather?.conditionCode) || (w.weather?.precipitationProb ?? 0) > 40)
  const anySnow = waypoints.some(w => isSnowCode(w.weather?.conditionCode))
  const maxWind = Math.max(0, ...waypoints.map(w => w.weather?.wind ?? 0))
  const maxUV = Math.max(0, ...waypoints.map(w => w.weather?.uvIndex ?? 0))
  const anyHeat = waypoints.some(w => (w.weather?.temp ?? 0) > 30)
  const anyCold = waypoints.some(w => (w.weather?.temp ?? 0) < 5)

  if (m === 'car' || m === 'driving' || m === 'hgv' || m === 'truck') {
    if (anyRain) advice.push('Wet roads — reduce speed, increase following distance.')
    if (anySnow) advice.push('Snow/ice possible — winter tires recommended.')
    if (maxWind > 40) advice.push('High winds — take care with high-sided vehicles and bridges.')
    if (waypoints.some(w => (w.weather?.visibility ?? 10) < 2)) {
      advice.push('Low visibility — use fog lights if fitted.')
    }
  }

  if (m === 'walk' || m === 'walking' || m === 'foot' || m === 'hike' || m === 'hiking') {
    if (anyRain) advice.push('Bring a rain jacket — you will get wet otherwise.')
    if (maxUV >= 6) advice.push('High UV — sunscreen, hat, sunglasses.')
    if (anyHeat) advice.push('Hot — carry water, take shade breaks.')
    if (anyCold) advice.push('Cold — layers recommended.')
    if (m === 'hike' || m === 'hiking') {
      advice.push('Sturdy footwear essential — surfaces vary along the trail.')
    }
  }

  if (m === 'cycle' || m === 'cycling' || m === 'bike' || m === 'bicycle' ||
      m === 'roadbike' || m === 'mtb' || m === 'ebike') {
    if (maxWind > 30) advice.push('Strong headwind possible — expect slower pace.')
    if (anyRain) advice.push('Wet roads — braking distance increases, take corners carefully.')
    if (maxUV >= 6) advice.push('High UV — cover exposed skin.')
    advice.push('High-visibility clothing recommended, especially near traffic.')
  }

  if (m === 'wheelchair') {
    if (anyRain) advice.push('Wet surfaces — take extra care on ramps and smooth paths.')
    if (anySnow) advice.push('Snow/ice — plan for alternative routes if possible.')
    if (anyHeat) advice.push('Hot surfaces — be aware of metal and pavement heat.')
  }

  return advice
}

// ─── STEP EXTRACTION ───────────────────────────────────────────────────

/**
 * Extract clean step lines from ORS step objects.
 * Returns array of { instruction, distance } — NEVER truncated.
 */
function extractSteps(route) {
  if (!route?.steps || !Array.isArray(route.steps)) return []

  return route.steps
    .map(s => {
      const instruction = safeStr(s?.instruction).trim()
      if (!instruction) return null
      return {
        instruction,
        distance: s.distance ?? null,
      }
    })
    .filter(Boolean)
}

// ─── WARNINGS ──────────────────────────────────────────────────────────

function collectWarnings(waypoints, route, mode) {
  const warnings = []

  waypoints.forEach(wp => {
    const w = wp.weather
    if (!w) return
    const label = wp.label || 'route'
    if (isStormCode(w.conditionCode)) {
      warnings.push(`Thunderstorm at ${label}`)
    }
    if ((w.wind ?? 0) > 60) {
      warnings.push(`Dangerous wind at ${label} (${Math.round(w.wind)} km/h)`)
    }
    if (w.visibility != null && w.visibility < 0.5) {
      warnings.push(`Dense fog at ${label}`)
    }
    if ((w.temp ?? 0) > 40) {
      warnings.push(`Extreme heat at ${label} (${Math.round(w.temp)}°C)`)
    }
    if ((w.temp ?? 0) < -20) {
      warnings.push(`Extreme cold at ${label} (${Math.round(w.temp)}°C)`)
    }
  })

  if (mode === 'walking' && route?.distance > 15000) {
    warnings.push('Long walking distance — plan for breaks and hydration.')
  }

  return [...new Set(warnings)]
}

// ─── MAIN ENTRY POINT ──────────────────────────────────────────────────

/**
 * Get route advice.
 *
 * The resolver + merger already computed the route and fetched weather
 * for every waypoint. This module just narrates.
 *
 * @param {Object} data — bundle with _route and _waypoints pre-populated
 * @param {string} question — original question
 * @returns {Object} — { type, title, from, to, mode, distance, duration,
 *                       summary, waypoints, directions, warnings }
 */
export const getRouteAdvice = (data, question = '') => {
  if (!data) {
    return {
      type: 'route',
      title: 'Route',
      from: null,
      to: null,
      mode: 'car',
      distance: null,
      duration: null,
      summary: "I don't have route data right now.",
      waypoints: [],
      directions: [],
      warnings: [],
    }
  }

  const route = data._route || null
  const waypoints = Array.isArray(data._waypoints) ? data._waypoints : []

  // ─── No route resolved — return honest failure ─────────────────────
  if (!route) {
    return {
      type: 'route',
      title: 'Route',
      from: null,
      to: null,
      mode: 'car',
      distance: null,
      duration: null,
      summary: "I couldn't find a route for that. Try rephrasing with a clear origin and destination.",
      waypoints: [],
      directions: [],
      warnings: [],
    }
  }

  const mode = route.mode || 'car'
  const fromLabel = safeStr(route.from?.label || route.from?.name, 'Origin')
  const toLabel = safeStr(route.to?.label || route.to?.name, 'Destination')

  // ─── Basic info ────────────────────────────────────────────────────
  const distanceLabel = formatDistance(route.distance)
  const durationLabel = formatDuration(route.duration)

  // ─── Weather narrative + diagram ───────────────────────────────────
  const diagram = buildWeatherDiagram(waypoints)
  const narrative = buildWeatherNarrative(waypoints)

  // ─── Full step list (never truncated) ──────────────────────────────
  const steps = extractSteps(route)
  const directions = steps.map(s => {
    if (s.distance == null) return s.instruction
    const distLabel = formatDistance(s.distance)
    return distLabel ? `${s.instruction} (${distLabel})` : s.instruction
  })

  // ─── Mode-specific advice ──────────────────────────────────────────
  const modeAdvice = buildModeAdvice(mode, route, waypoints)

  // ─── Warnings ──────────────────────────────────────────────────────
  const warnings = collectWarnings(waypoints, route, mode)

  // ─── Assemble summary ──────────────────────────────────────────────
  const summaryParts = []
  if (narrative) summaryParts.push(narrative)
  if (modeAdvice.length > 0) summaryParts.push(modeAdvice.join(' '))
  const summary = summaryParts.join(' ')

  // ─── Full text (used by merger to build the expandable fullText) ───
  const fullParts = []
  if (diagram) fullParts.push(diagram)

  if (waypoints.length > 0) {
    fullParts.push('')
    fullParts.push('Weather along the way:')
    waypoints.forEach(wp => {
      const w = wp.weather || {}
      const bits = []
      if (w.temp != null) bits.push(`${Math.round(w.temp)}°C`)
      if (w.condition) bits.push(w.condition)
      if (w.precipitationProb > 20) bits.push(`${Math.round(w.precipitationProb)}% rain`)
      if (w.wind > 20) bits.push(`${Math.round(w.wind)} km/h wind`)
      fullParts.push(`  ${wp.label} — ${bits.join(' · ')}`)
    })
  }

  if (directions.length > 0) {
    fullParts.push('')
    fullParts.push(`Directions (${directions.length} steps):`)
    directions.forEach((step, i) => {
      fullParts.push(`  ${i + 1}. ${step}`)
    })
  }

  if (warnings.length > 0) {
    fullParts.push('')
    fullParts.push('Warnings:')
    warnings.forEach(w => fullParts.push(`  • ${w}`))
  }

  const fullText = fullParts.join('\n')

  return {
    type: 'route',
    title: `${modeEmoji(mode)} ${fromLabel} → ${toLabel}`,
    from: fromLabel,
    to: toLabel,
    mode,
    modeLabel: modeLabel(mode),
    distance: distanceLabel,
    duration: durationLabel,
    diagram,
    summary,
    waypoints: waypoints.map(wp => ({
      label: wp.label,
      role: wp.role,
      weather: wp.weather
        ? {
            temp: wp.weather.temp,
            feelsLike: wp.weather.feelsLike,
            condition: wp.weather.condition,
            conditionCode: wp.weather.conditionCode,
            precipitationProb: wp.weather.precipitationProb,
            wind: wp.weather.wind,
            humidity: wp.weather.humidity,
          }
        : null,
    })),
    directions,
    warnings,
    fullText,
  }
}

export default getRouteAdvice
