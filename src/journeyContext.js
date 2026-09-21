// ============================================================================
// JOURNEY CONTEXT — Derive "what the whole trip looks like" from waypoints
//
// Takes the waypoints the resolver already produced for a route and
// summarizes them into a bundle downstream advice modules can read:
//
//   data._journey = {
//     hasRain, hasHeavyRain, hasThunderstorm, hasSnow, hasIce,
//     tempMin, tempMax, windMax,
//     rainStart, rainEnd,          // labels
//     worstWaypoint, bestWaypoint, // { label, reason }
//     from, to, mode, distance, duration,
//     waypoints,                    // full list
//     narrative,                    // one-line summary
//   }
//
// ClothingAdvice, SkinHair, Health, Pets, etc. read this if present
// and fall through to normal behavior if not.
// ============================================================================

// ─── CODE CLASSIFIERS ───────────────────────────────────────────────────

function isRainCode(code) {
  if (code == null) return false
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
}
function isHeavyRainCode(code) {
  return code === 65 || code === 82
}
function isThunderstorm(code) {
  return code != null && code >= 95
}
function isSnowCode(code) {
  if (code == null) return false
  return (code >= 71 && code <= 77) || code === 85 || code === 86
}
function isFreezingCode(code) {
  return code === 66 || code === 67 || code === 56 || code === 57
}

// ─── WAYPOINT HELPERS ───────────────────────────────────────────────────

function waypointSignals(wp) {
  const w = wp.weather || {}
  const code = w.conditionCode
  const temp = w.temp
  const wind = w.wind
  const rain = w.precipitationProb
  const vis = w.visibility

  return {
    label: wp.label || 'Point',
    code,
    temp,
    wind,
    rain,
    vis,
    isRain: isRainCode(code) || (rain ?? 0) >= 60,
    isHeavyRain: isHeavyRainCode(code),
    isStorm: isThunderstorm(code),
    isSnow: isSnowCode(code),
    isFreezing: isFreezingCode(code),
    isWet: isRainCode(code) || (rain ?? 0) > 40,
    isFoggy: (vis != null && vis < 1) || code === 45 || code === 48,
  }
}

// ─── MAIN BUILDER ───────────────────────────────────────────────────────

/**
 * Build a journey context from route + waypoints.
 * Returns null if there's no route data.
 */
export function buildJourneyContext({ route, waypoints }) {
  if (!route || !Array.isArray(waypoints) || waypoints.length === 0) {
    return null
  }

  const signals = waypoints.map(waypointSignals)

  // ─── Flags ───────────────────────────────────────────────────────
  const hasRain = signals.some(s => s.isRain)
  const hasHeavyRain = signals.some(s => s.isHeavyRain)
  const hasThunderstorm = signals.some(s => s.isStorm)
  const hasSnow = signals.some(s => s.isSnow)
  const hasIce = signals.some(s => s.isFreezing)
  const hasFog = signals.some(s => s.isFoggy)

  // ─── Ranges ──────────────────────────────────────────────────────
  const temps = signals.map(s => s.temp).filter(t => t != null)
  const winds = signals.map(s => s.wind).filter(w => w != null)

  const tempMin = temps.length > 0 ? Math.round(Math.min(...temps)) : null
  const tempMax = temps.length > 0 ? Math.round(Math.max(...temps)) : null
  const windMax = winds.length > 0 ? Math.round(Math.max(...winds)) : null

  // ─── Wet section ─────────────────────────────────────────────────
  const wetSignals = signals.filter(s => s.isWet || s.isStorm || s.isSnow)
  const rainStart = wetSignals[0]?.label || null
  const rainEnd = wetSignals[wetSignals.length - 1]?.label || null

  // ─── Worst / best waypoint ───────────────────────────────────────
  let worstWaypoint = null
  let bestWaypoint = null

  const scoreWaypoint = (s) => {
    let score = 100
    if (s.isStorm) score -= 100
    else if (s.isHeavyRain) score -= 60
    else if (s.isSnow) score -= 70
    else if (s.isRain) score -= 30
    if (s.wind != null && s.wind > 40) score -= 25
    if (s.temp != null && s.temp > 38) score -= 30
    if (s.temp != null && s.temp < -10) score -= 25
    if (s.isFoggy) score -= 20
    return score
  }

  const scored = signals.map(s => ({ ...s, score: scoreWaypoint(s) }))
  const worst = scored.reduce((a, b) => (b.score < a.score ? b : a), scored[0])
  const best = scored.reduce((a, b) => (b.score > a.score ? b : a), scored[0])

  if (worst) {
    worstWaypoint = {
      label: worst.label,
      reason: worst.isStorm ? 'thunderstorm'
        : worst.isHeavyRain ? 'heavy rain'
        : worst.isSnow ? 'snow'
        : worst.isRain ? 'rain'
        : worst.wind > 40 ? 'strong wind'
        : worst.temp > 38 ? 'extreme heat'
        : worst.temp < -10 ? 'extreme cold'
        : worst.isFoggy ? 'low visibility'
        : 'mixed conditions',
    }
  }

  if (best) {
    bestWaypoint = {
      label: best.label,
      reason: best.score >= 90 ? 'clear conditions'
        : best.score >= 70 ? 'pleasant'
        : 'least bad',
    }
  }

  // ─── Narrative ───────────────────────────────────────────────────
  const narrative = buildNarrative({
    hasRain, hasHeavyRain, hasThunderstorm, hasSnow, hasIce, hasFog,
    rainStart, rainEnd, tempMin, tempMax, windMax,
  })

  // ─── Distance / duration ─────────────────────────────────────────
  const distanceKm = route.distance ? route.distance / 1000 : null
  const durationMin = route.duration ? route.duration / 60 : null

  const distanceLabel = distanceKm != null
    ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m`
      : distanceKm < 10 ? `${distanceKm.toFixed(1)} km`
      : `${Math.round(distanceKm)} km`)
    : null

  const durationLabel = durationMin != null
    ? (durationMin < 60 ? `${Math.round(durationMin)} min`
      : `${Math.floor(durationMin / 60)}h ${Math.round(durationMin % 60)}m`)
    : null

  return {
    // Route basics
    from: route.from?.label || route.from?.name || null,
    to: route.to?.label || route.to?.name || null,
    mode: route.mode || 'car',
    distance: distanceLabel,
    duration: durationLabel,
    distanceKm,
    durationMin,

    // Journey flags
    hasRain,
    hasHeavyRain,
    hasThunderstorm,
    hasSnow,
    hasIce,
    hasFog,
    isWetJourney: hasRain || hasSnow || hasIce,

    // Ranges
    tempMin,
    tempMax,
    tempSwing: (tempMin != null && tempMax != null) ? tempMax - tempMin : null,
    windMax,

    // Where rain/wet hits
    rainStart,
    rainEnd,

    // Highlights
    worstWaypoint,
    bestWaypoint,

    // Full list for modules that want details
    waypoints: waypoints.map((wp, i) => ({
      label: wp.label,
      labelMedium: wp.labelMedium,
      labelFull: wp.labelFull,
      role: wp.role,
      temp: wp.weather?.temp,
      condition: wp.weather?.condition,
      conditionCode: wp.weather?.conditionCode,
      precipitationProb: wp.weather?.precipitationProb,
      wind: wp.weather?.wind,
    })),

    // One-liner
    narrative,
  }
}

// ─── NARRATIVE ──────────────────────────────────────────────────────────

function buildNarrative({
  hasRain, hasHeavyRain, hasThunderstorm, hasSnow, hasIce, hasFog,
  rainStart, rainEnd, tempMin, tempMax, windMax,
}) {
  const parts = []

  if (hasThunderstorm) {
    parts.push('Thunderstorms along the route — postpone if possible')
  } else if (hasSnow) {
    parts.push('Snow on the route — winter tires and caution')
  } else if (hasIce) {
    parts.push('Freezing conditions — watch for ice')
  } else if (hasHeavyRain) {
    parts.push('Heavy rain along the way')
  } else if (hasRain) {
    if (rainStart && rainEnd && rainStart !== rainEnd) {
      parts.push(`Rain from ${rainStart} to ${rainEnd}`)
    } else if (rainStart) {
      parts.push(`Rain around ${rainStart}`)
    } else {
      parts.push('Rain on the route')
    }
  } else {
    parts.push('Dry journey')
  }

  if (hasFog) parts.push('low visibility in places')

  if (tempMax != null && tempMin != null) {
    if (tempMax - tempMin >= 8) {
      parts.push(`temperature ${tempMin}°C to ${tempMax}°C`)
    } else if (tempMax >= 35) {
      parts.push(`hot at ${tempMax}°C`)
    } else if (tempMin <= 0) {
      parts.push(`cold at ${tempMin}°C`)
    }
  }

  if (windMax != null && windMax > 40) {
    parts.push(`strong wind up to ${windMax} km/h`)
  }

  return parts.join(', ') + '.'
}

// ─── DEFAULT EXPORT ─────────────────────────────────────────────────────

export default { buildJourneyContext }
