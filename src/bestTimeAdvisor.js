// ============================================================================
// BEST TIME ADVISOR — Scan hourly weather for a route, find best departure
// windows.
//
// Input: route waypoints with hourly weather arrays, route duration, and a
// starting "search from" time (usually now).
//
// Output: ranked list of { startTime, endTime, score, reason } windows.
//
// Scoring: penalize rain, thunderstorm, extreme temps, strong wind, low
// visibility. Bonus for dry, mild, calm.
// ============================================================================

// ─── SCORE WEIGHTS ─────────────────────────────────────────────────────

const PENALTY = {
  rain: 25,           // wet during any leg
  heavyRain: 40,
  thunderstorm: 100,  // instant disqualify
  snow: 60,
  extremeHeat: 30,    // > 38°C
  heat: 15,           // > 32°C
  extremeCold: 30,    // < -10°C
  cold: 10,           // < 0°C
  strongWind: 20,     // > 40 km/h
  wind: 8,            // > 25 km/h
  lowVisibility: 40,  // < 1 km
  reducedVisibility: 15, // < 3 km
}

const BONUS = {
  clear: 5,
  mild: 8,            // 15-25°C, no rain, low wind
}

// ─── HELPERS ───────────────────────────────────────────────────────────

function isRainCode(code) {
  if (code == null) return false
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
}
function isHeavyRainCode(code) {
  if (code == null) return false
  return code === 65 || code === 82
}
function isThunderstorm(code) {
  return code != null && code >= 95
}
function isSnowCode(code) {
  if (code == null) return false
  return (code >= 71 && code <= 77) || code === 85 || code === 86
}
function isClearCode(code) {
  return code === 0 || code === 1
}

function formatHourLabel(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ─── SCORING A SINGLE HOUR ─────────────────────────────────────────────

/**
 * Score one hour of one waypoint's weather.
 * Returns { score, reasons: [...] } — score is 0-100, higher = better.
 */
function scoreHour(wp, hourIdx) {
  const w = wp.weather || {}
  const h = w.hourly || {}
  const reasons = []
  let penalty = 0

  const temp = h.temperature_2m?.[hourIdx]
  const code = h.weather_code?.[hourIdx] ?? 0
  const precipProb = h.precipitation_probability?.[hourIdx] ?? 0
  const precip = h.precipitation?.[hourIdx] ?? 0
  const wind = h.wind_speed_10m?.[hourIdx] ?? 0
  const gust = h.wind_gusts_10m?.[hourIdx] ?? 0
  const vis = h.visibility?.[hourIdx] != null ? h.visibility[hourIdx] / 1000 : 10

  // ─── Rain ────────────────────────────────────────────────────────
  if (isThunderstorm(code)) {
    penalty += PENALTY.thunderstorm
    reasons.push('thunderstorm')
  } else if (isSnowCode(code)) {
    penalty += PENALTY.snow
    reasons.push('snow')
  } else if (isHeavyRainCode(code) || precip > 2) {
    penalty += PENALTY.heavyRain
    reasons.push('heavy rain')
  } else if (isRainCode(code) || precip > 0.2 || precipProb >= 70) {
    penalty += PENALTY.rain
    reasons.push('rain')
  }

  // ─── Temperature ─────────────────────────────────────────────────
  if (temp != null) {
    if (temp > 38) { penalty += PENALTY.extremeHeat; reasons.push('extreme heat') }
    else if (temp > 32) { penalty += PENALTY.heat; reasons.push('hot') }
    else if (temp < -10) { penalty += PENALTY.extremeCold; reasons.push('extreme cold') }
    else if (temp < 0) { penalty += PENALTY.cold; reasons.push('cold') }
  }

  // ─── Wind ────────────────────────────────────────────────────────
  const effectiveWind = Math.max(wind, gust * 0.8)
  if (effectiveWind > 40) { penalty += PENALTY.strongWind; reasons.push('strong wind') }
  else if (effectiveWind > 25) { penalty += PENALTY.wind; reasons.push('windy') }

  // ─── Visibility ──────────────────────────────────────────────────
  if (vis < 1) { penalty += PENALTY.lowVisibility; reasons.push('low visibility') }
  else if (vis < 3) { penalty += PENALTY.reducedVisibility; reasons.push('reduced visibility') }

  // ─── Bonus ───────────────────────────────────────────────────────
  let bonus = 0
  if (isClearCode(code) && temp != null && temp >= 15 && temp <= 25 && effectiveWind < 15) {
    bonus += BONUS.mild
  } else if (isClearCode(code)) {
    bonus += BONUS.clear
  }

  const raw = 100 - penalty + bonus
  const score = Math.max(0, Math.min(100, raw))

  return { score, reasons, penalty, bonus }
}

// ─── ROUTE-WIDE SCORING ────────────────────────────────────────────────

/**
 * Score the ENTIRE route at a given departure hour.
 * Combines scores from all waypoints (worst case dominant).
 */
function scoreRouteAtHour(waypoints, startHourIdx, legHours) {
  if (!waypoints || waypoints.length === 0) return { score: 0, reasons: [] }

  const perWaypoint = []

  for (const wp of waypoints) {
    if (!wp.weather?.hourly?.time) continue

    // A waypoint is affected during the window it will be reached
    // Simplification: check the hour closest to (start + travel fraction)
    const fraction = wp._travelFraction ?? 0.5
    const hoursIn = Math.round(legHours * fraction)
    const idx = startHourIdx + hoursIn

    if (idx >= (wp.weather.hourly.time?.length || 0)) continue

    const { score, reasons } = scoreHour(wp, idx)
    perWaypoint.push({ score, reasons, label: wp.label })
  }

  if (perWaypoint.length === 0) return { score: 0, reasons: [] }

  // Route score = average but worst-case weighted
  const avg = perWaypoint.reduce((s, p) => s + p.score, 0) / perWaypoint.length
  const worst = Math.min(...perWaypoint.map(p => p.score))

  // Emphasize the worst (bottleneck) waypoint
  const combined = avg * 0.4 + worst * 0.6

  // Collect all unique reasons from waypoints below 70
  const reasonSet = new Set()
  perWaypoint.forEach(p => {
    if (p.score < 70) p.reasons.forEach(r => reasonSet.add(r))
  })

  return {
    score: Math.round(combined),
    reasons: [...reasonSet],
  }
}

// ─── WINDOW GROUPING ───────────────────────────────────────────────────

/**
 * Group consecutive hours with score >= threshold into windows.
 */
function groupIntoWindows(hourScores, threshold = 70) {
  const windows = []
  let current = null

  for (const hs of hourScores) {
    if (hs.score >= threshold) {
      if (!current) {
        current = { startIdx: hs.idx, endIdx: hs.idx, hours: [hs] }
      } else {
        current.endIdx = hs.idx
        current.hours.push(hs)
      }
    } else {
      if (current) {
        windows.push(current)
        current = null
      }
    }
  }
  if (current) windows.push(current)

  return windows.map(w => ({
    startIdx: w.startIdx,
    endIdx: w.endIdx,
    hourCount: w.hours.length,
    avgScore: Math.round(w.hours.reduce((s, h) => s + h.score, 0) / w.hours.length),
    reasons: [...new Set(w.hours.flatMap(h => h.reasons))],
    _hours: w.hours,
  }))
}

// ─── PUBLIC API ────────────────────────────────────────────────────────

/**
 * Find best departure windows for a route.
 *
 * @param {Object} route — from resolver (has .distance, .duration in seconds)
 * @param {Array} waypoints — route waypoints with .weather.hourly arrays
 * @param {Object} opts — { searchHours: 12, now: Date }
 * @returns {Object} — { bestWindow, alternates, hourlyScores, reason }
 */
export function findBestDepartureWindows(route, waypoints, opts = {}) {
  if (!route || !Array.isArray(waypoints) || waypoints.length === 0) {
    return { bestWindow: null, alternates: [], hourlyScores: [], reason: 'No route data' }
  }

  const now = opts.now || new Date()
  const searchHours = opts.searchHours || 12

  // Route duration in hours (min 0.25 to avoid zero)
  const durationHours = Math.max(0.25, (route.duration || 0) / 3600)

  // Assign travel fraction to each waypoint (0 = start, 1 = end)
  waypoints.forEach((wp, i) => {
    wp._travelFraction = waypoints.length > 1 ? i / (waypoints.length - 1) : 0
  })

  // Find the starting hourly index
  const firstWp = waypoints[0]
  const hourlyTimes = firstWp?.weather?.hourly?.time || []
  if (hourlyTimes.length === 0) {
    return { bestWindow: null, alternates: [], hourlyScores: [], reason: 'No hourly data' }
  }

  let startIdx = 0
  const nowMs = now.getTime()
  for (let i = 0; i < hourlyTimes.length; i++) {
    const t = new Date(hourlyTimes[i]).getTime()
    if (t >= nowMs - 30 * 60 * 1000) { startIdx = i; break }
  }

  // Score each hour in the search window
  const hourlyScores = []
  const maxIdx = Math.min(startIdx + searchHours, hourlyTimes.length - 1)

  for (let i = startIdx; i <= maxIdx; i++) {
    const { score, reasons } = scoreRouteAtHour(waypoints, i, durationHours)
    hourlyScores.push({
      idx: i,
      time: hourlyTimes[i],
      score,
      reasons,
    })
  }

  if (hourlyScores.length === 0) {
    return { bestWindow: null, alternates: [], hourlyScores: [], reason: 'No hour data in range' }
  }

  // Group into windows (score >= 70)
  let windows = groupIntoWindows(hourlyScores, 70)
  if (windows.length === 0) {
    // Relax to 55
    windows = groupIntoWindows(hourlyScores, 55)
  }
  if (windows.length === 0) {
    // Just pick the best single hour
    const best = hourlyScores.reduce((a, b) => (b.score > a.score ? b : a))
    return {
      bestWindow: {
        startTime: best.time,
        endTime: best.time,
        hourCount: 1,
        avgScore: best.score,
        reasons: best.reasons,
      },
      alternates: [],
      hourlyScores,
      reason: 'No clear window — best single hour shown',
    }
  }

  // Sort windows by score, then by earliest
  windows.sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
    return a.startIdx - b.startIdx
  })

  const best = windows[0]
  const alternates = windows.slice(1, 3)

  return {
    bestWindow: {
      startTime: hourlyTimes[best.startIdx],
      endTime: hourlyTimes[Math.min(best.endIdx + 1, hourlyTimes.length - 1)],
      hourCount: best.hourCount,
      avgScore: best.avgScore,
      reasons: best.reasons,
    },
    alternates: alternates.map(w => ({
      startTime: hourlyTimes[w.startIdx],
      endTime: hourlyTimes[Math.min(w.endIdx + 1, hourlyTimes.length - 1)],
      hourCount: w.hourCount,
      avgScore: w.avgScore,
      reasons: w.reasons,
    })),
    hourlyScores,
    reason: best.reasons.length > 0
      ? `Best window because: ${best.reasons.slice(0, 2).join(', ')}`
      : 'Clear conditions throughout the window',
  }
}

/**
 * Format a best-time result into a readable object for the merger.
 */
export function formatBestTimeResult(result) {
  if (!result?.bestWindow) return null

  const { bestWindow, alternates, hourlyScores } = result

  return {
    bestWindow: {
      start: formatHourLabel(new Date(bestWindow.startTime)),
      end: formatHourLabel(new Date(bestWindow.endTime)),
      score: bestWindow.avgScore,
      reasons: bestWindow.reasons,
    },
    alternates: alternates.map(a => ({
      start: formatHourLabel(new Date(a.startTime)),
      end: formatHourLabel(new Date(a.endTime)),
      score: a.avgScore,
      reasons: a.reasons,
    })),
    hourly: hourlyScores.map(h => ({
      time: formatHourLabel(new Date(h.time)),
      score: h.score,
      good: h.score >= 70,
    })),
  }
}

export default { findBestDepartureWindows, formatBestTimeResult }
