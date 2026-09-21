// ============================================================================
// FLIGHT DELAY — Weather-based delay risk assessment for flights
//
// This is a heuristic based on weather conditions at origin/destination.
// It does NOT use airline data or actual flight status.
//
// The output explicitly says this in the "caveat" field.
// ============================================================================

// ─── RISK FACTORS ──────────────────────────────────────────────────────
// Each condition contributes a weighted risk. Total 0-100.
// 0-20   low
// 21-45  moderate
// 46-70  high
// 71+    severe

const WEIGHTS = {
  thunderstorm: 40,
  heavyRain: 15,
  moderateRain: 8,
  snow: 30,
  freezingRain: 35,
  strongWind: 25,   // gusts > 60 km/h
  wind: 12,         // gusts > 40 km/h
  lowVisibility: 30, // < 1 km
  reducedVisibility: 12, // < 3 km
  extremeHeat: 15,  // > 40°C
  extremeCold: 12,  // < -15°C
  icing: 20,        // temp 0 to -5 with any precip
}

function isRainCode(code) {
  if (code == null) return false
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
}
function isHeavyRainCode(code) {
  return code === 65 || code === 82
}
function isModerateRainCode(code) {
  return code === 63 || code === 81
}
function isThunderstorm(code) {
  return code != null && code >= 95
}
function isSnowCode(code) {
  if (code == null) return false
  return (code >= 71 && code <= 77) || code === 85 || code === 86
}
function isFreezingRainCode(code) {
  return code === 66 || code === 67
}
function isFogCode(code) {
  return code === 45 || code === 48
}

// ─── SCORING ───────────────────────────────────────────────────────────

/**
 * Score a single airport's weather at a specific hour.
 * Returns { score, factors: [...] }
 */
function scoreAirportAtHour(hourly, idx) {
  if (!hourly) return { score: 0, factors: [] }

  const factors = []
  let score = 0

  const code = hourly.weather_code?.[idx] ?? 0
  const temp = hourly.temperature_2m?.[idx]
  const gust = hourly.wind_gusts_10m?.[idx] ?? 0
  const wind = hourly.wind_speed_10m?.[idx] ?? 0
  const vis = hourly.visibility?.[idx] != null ? hourly.visibility[idx] / 1000 : 10
  const precip = hourly.precipitation?.[idx] ?? 0

  // ─── Precip type ─────────────────────────────────────────────────
  if (isThunderstorm(code)) {
    score += WEIGHTS.thunderstorm
    factors.push('thunderstorm')
  } else if (isFreezingRainCode(code)) {
    score += WEIGHTS.freezingRain
    factors.push('freezing rain')
  } else if (isSnowCode(code)) {
    score += WEIGHTS.snow
    factors.push('snow')
  } else if (isHeavyRainCode(code) || precip > 5) {
    score += WEIGHTS.heavyRain
    factors.push('heavy rain')
  } else if (isModerateRainCode(code) || precip > 2) {
    score += WEIGHTS.moderateRain
    factors.push('moderate rain')
  } else if (isRainCode(code) || precip > 0.5) {
    score += WEIGHTS.moderateRain * 0.5
    factors.push('light rain')
  }

  // ─── Wind (gusts matter most for flight ops) ─────────────────────
  if (gust > 60) {
    score += WEIGHTS.strongWind
    factors.push(`strong gusts (${Math.round(gust)} km/h)`)
  } else if (gust > 40 || wind > 35) {
    score += WEIGHTS.wind
    factors.push(`gusty winds (${Math.round(gust || wind)} km/h)`)
  }

  // ─── Visibility ──────────────────────────────────────────────────
  if (vis < 1) {
    score += WEIGHTS.lowVisibility
    factors.push('low visibility')
  } else if (vis < 3 || isFogCode(code)) {
    score += WEIGHTS.reducedVisibility
    factors.push('reduced visibility')
  }

  // ─── Extreme temps ───────────────────────────────────────────────
  if (temp != null) {
    if (temp > 40) { score += WEIGHTS.extremeHeat; factors.push('extreme heat') }
    else if (temp < -15) { score += WEIGHTS.extremeCold; factors.push('extreme cold') }
    else if (temp >= -5 && temp <= 0 && precip > 0) {
      score += WEIGHTS.icing
      factors.push('icing risk')
    }
  }

  return { score, factors }
}

// ─── PUBLIC API ────────────────────────────────────────────────────────

/**
 * Analyze weather at origin and destination for delay risk.
 *
 * @param {Object} originWeather — normalized weather for origin airport
 * @param {Object} destWeather — normalized weather for destination (optional)
 * @param {Date} targetDate — when the flight is scheduled
 * @returns {Object} — { risk, score, origin, destination, caveat, summary }
 */
export function assessFlightDelay(originWeather, destWeather, targetDate = new Date()) {
  if (!originWeather?.hourly?.time) {
    return {
      risk: 'unknown',
      score: 0,
      summary: 'Could not fetch origin weather data.',
      origin: null,
      destination: null,
      caveat: 'Weather-based estimate only. Not official airline data.',
    }
  }

  const originHourly = originWeather.hourly
  const targetMs = targetDate.getTime()

  // Find the hourly index closest to the target time
  function closestIdx(hourly) {
    if (!hourly?.time?.length) return -1
    let best = 0
    let bestDiff = Infinity
    hourly.time.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - targetMs)
      if (diff < bestDiff) { bestDiff = diff; best = i }
    })
    return best
  }

  const oIdx = closestIdx(originHourly)
  const originScore = oIdx >= 0 ? scoreAirportAtHour(originHourly, oIdx) : { score: 0, factors: [] }

  let destScore = { score: 0, factors: [] }
  let dIdx = -1
  if (destWeather?.hourly?.time) {
    dIdx = closestIdx(destWeather.hourly)
    if (dIdx >= 0) {
      destScore = scoreAirportAtHour(destWeather.hourly, dIdx)
    }
  }

  // Combined score: origin slightly weighted more (departures are the risk)
  const totalScore = Math.round(originScore.score * 0.65 + destScore.score * 0.35)

  let risk = 'low'
  if (totalScore >= 71) risk = 'severe'
  else if (totalScore >= 46) risk = 'high'
  else if (totalScore >= 21) risk = 'moderate'

  const parts = []
  if (originScore.score >= 25) {
    parts.push(`Origin: ${originScore.factors.join(', ')}`)
  }
  if (destScore.score >= 25) {
    parts.push(`Destination: ${destScore.factors.join(', ')}`)
  }

  let summary = ''
  if (risk === 'low') summary = 'No significant weather disruption expected.'
  else if (risk === 'moderate') summary = `Some risk — ${parts.join('. ')}`
  else if (risk === 'high') summary = `High risk of delay — ${parts.join('. ')}`
  else summary = `Severe weather — delays or cancellations likely. ${parts.join('. ')}`

  return {
    risk,
    score: totalScore,
    summary,
    origin: {
      score: originScore.score,
      factors: originScore.factors,
      time: oIdx >= 0 ? originHourly.time[oIdx] : null,
    },
    destination: destWeather ? {
      score: destScore.score,
      factors: destScore.factors,
      time: dIdx >= 0 ? destWeather.hourly.time[dIdx] : null,
    } : null,
    caveat: 'Weather-based estimate only. Not official airline data.',
  }
}

export default { assessFlightDelay }
