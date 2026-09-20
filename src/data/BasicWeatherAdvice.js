// ============================================================================
// BASIC WEATHER ADVICE — Structured, Warm, No Emojis
//
// This module does NOT parse dates, hunt for hour indexes, or guess anything.
// The weather resolver already:
//   - figured out which day/hour the user asked about
//   - looked it up in Open-Meteo's own ISO timestamp arrays
//   - hoisted the correct values to the top of the bundle
//
// This file just reads `data.temp`, `data.wind`, `data.condition`, etc.
// and writes warm, human prose. No arithmetic. No fallbacks. No math.
// ============================================================================

// ─── TEXT HELPERS ──────────────────────────────────────────────────────

function getTemperatureDescription(temp) {
  if (temp == null) return 'unknown'
  if (temp > 35) return 'extremely hot'
  if (temp > 30) return 'hot'
  if (temp > 25) return 'warm'
  if (temp > 20) return 'mild'
  if (temp > 15) return 'cool'
  if (temp > 10) return 'chilly'
  if (temp > 5) return 'cold'
  if (temp > -5) return 'very cold'
  return 'freezing'
}

function getWindDescription(wind) {
  if (wind == null) return 'calm'
  if (wind > 50) return 'dangerously strong'
  if (wind > 35) return 'very strong'
  if (wind > 20) return 'moderately windy'
  if (wind > 10) return 'slightly breezy'
  return 'calm'
}

function getRainDescription(prob) {
  if (prob == null) return 'no significant rain is expected'
  if (prob >= 80) return 'rain is nearly certain'
  if (prob > 50) return 'rain is likely'
  if (prob > 30) return 'there is a chance of rain'
  if (prob > 10) return 'there is a slight chance of rain'
  return 'no significant rain is expected'
}

function isRainCode(code) {
  if (code == null) return false
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
}

function isSnowCode(code) {
  if (code == null) return false
  return (code >= 71 && code <= 77) || code === 85 || code === 86
}

function isStormCode(code) {
  return code != null && code >= 95
}

function isFogCode(code) {
  return code === 45 || code === 48
}

function getConditionName(code) {
  if (code === 0) return 'clear sky'
  if (code === 1) return 'mainly clear'
  if (code === 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code === 45) return 'fog'
  if (code === 48) return 'depositing rime fog'
  if (code === 51) return 'light drizzle'
  if (code === 53) return 'moderate drizzle'
  if (code === 55) return 'dense drizzle'
  if (code === 56 || code === 57) return 'freezing drizzle'
  if (code === 61) return 'slight rain'
  if (code === 63) return 'moderate rain'
  if (code === 65) return 'heavy rain'
  if (code === 66 || code === 67) return 'freezing rain'
  if (code === 71) return 'slight snow'
  if (code === 73) return 'moderate snow'
  if (code === 75) return 'heavy snow'
  if (code === 77) return 'snow grains'
  if (code === 80) return 'slight rain showers'
  if (code === 81) return 'moderate rain showers'
  if (code === 82) return 'violent rain showers'
  if (code === 85) return 'slight snow showers'
  if (code === 86) return 'heavy snow showers'
  if (code === 95) return 'thunderstorm'
  if (code === 96) return 'thunderstorm with slight hail'
  if (code === 99) return 'thunderstorm with heavy hail'
  return 'mixed conditions'
}

// ─── VERDICT LOGIC ─────────────────────────────────────────────────────

/**
 * Decide the top-line verdict based on the question and bundle.
 * The bundle is already correct for the moment the user asked about.
 */
function decideVerdict(data, question) {
  const q = (question || '').toLowerCase()
  const temp = data.temp ?? data.tempMax ?? 0
  const rainProb = data.precipitationProb ?? 0
  const code = data.conditionCode ?? 0

  // ─── Rain / storm questions ────────────────────────────────────────
  if (q.includes('rain') || q.includes('storm') || q.includes('umbrella')) {
    if (isStormCode(code) || rainProb > 70) {
      return { verdict: 'Yes — rain is expected.', confidence: 'high' }
    }
    if (rainProb > 40 || isRainCode(code)) {
      return { verdict: 'Possibly — rain is possible.', confidence: 'moderate' }
    }
    return { verdict: 'No — rain is unlikely.', confidence: 'high' }
  }

  // ─── Snow questions ────────────────────────────────────────────────
  if (q.includes('snow')) {
    if (isSnowCode(code)) {
      return { verdict: 'Yes — snow is expected.', confidence: 'high' }
    }
    if (temp < 2) {
      return { verdict: 'Possibly — cold enough for snow.', confidence: 'moderate' }
    }
    return { verdict: 'No — snow is unlikely.', confidence: 'high' }
  }

  // ─── Hot questions ─────────────────────────────────────────────────
  if (q.includes('hot') || q.includes('warm')) {
    if (temp > 28) return { verdict: 'Yes — it will be hot.', confidence: 'high' }
    if (temp > 22) return { verdict: 'Possibly — it will feel warm.', confidence: 'moderate' }
    return { verdict: 'No — it will not be hot.', confidence: 'high' }
  }

  // ─── Cold questions ────────────────────────────────────────────────
  if (q.includes('cold')) {
    if (temp < 10) return { verdict: 'Yes — it will be cold.', confidence: 'high' }
    if (temp < 18) return { verdict: 'Possibly — it may feel cool.', confidence: 'moderate' }
    return { verdict: 'No — it will not be cold.', confidence: 'high' }
  }

  // ─── Sunny / clear questions ───────────────────────────────────────
  if (q.includes('sunny') || q.includes('clear')) {
    if (code === 0 || code === 1) {
      return { verdict: 'Yes — it will be clear.', confidence: 'high' }
    }
    if (code === 2) {
      return { verdict: 'Partly — some clear spells.', confidence: 'moderate' }
    }
    return { verdict: 'No — it will be cloudy.', confidence: 'high' }
  }

  // ─── Cloudy questions ──────────────────────────────────────────────
  if (q.includes('cloud')) {
    if (code >= 2) return { verdict: 'Yes — it will be cloudy.', confidence: 'high' }
    return { verdict: 'No — it looks mostly clear.', confidence: 'moderate' }
  }

  // ─── Windy questions ───────────────────────────────────────────────
  if (q.includes('wind')) {
    const wind = data.wind ?? data.windMax ?? 0
    if (wind > 30) return { verdict: 'Yes — it will be windy.', confidence: 'high' }
    if (wind > 18) return { verdict: 'Breezy — some wind about.', confidence: 'moderate' }
    return { verdict: 'No — winds will be light.', confidence: 'high' }
  }

  // ─── Fallback — describe conditions ────────────────────────────────
  return {
    verdict: `Conditions at this time: ${getConditionName(code)}.`,
    confidence: 'general',
  }
}

// ─── NARRATIVE BUILDERS ────────────────────────────────────────────────

function buildSummary(data) {
  const temp = data.temp ?? data.tempMax ?? null
  const feels = data.feelsLike ?? data.feelsMax ?? temp
  const code = data.conditionCode ?? 0
  const rainProb = data.precipitationProb ?? 0
  const condition = getConditionName(code)

  const parts = []

  // Core condition + temperature
  if (temp != null) {
    const tempDesc = getTemperatureDescription(temp)
    parts.push(`It's ${tempDesc} with ${condition}.`)
  } else {
    parts.push(`Currently ${condition}.`)
  }

  // Feels-like difference
  if (feels != null && temp != null && Math.abs(feels - temp) >= 3) {
    parts.push(`It feels closer to ${Math.round(feels)}°C.`)
  }

  // Rain
  if (rainProb >= 60) {
    parts.push(`Rain is very likely, so plan accordingly.`)
  } else if (rainProb > 30) {
    parts.push(`There's a decent chance of rain.`)
  } else if (rainProb > 10) {
    parts.push(`A slight chance of rain, but nothing serious.`)
  } else {
    parts.push(`Rain isn't a concern.`)
  }

  // Wind note if significant
  const wind = data.wind ?? data.windMax
  if (wind != null && wind > 25) {
    parts.push(`It's also ${getWindDescription(wind)} — worth keeping in mind.`)
  }

  return parts.join(' ')
}

function buildNote(data) {
  const parts = []

  // UV
  const uv = data.uvIndex
  if (uv != null) {
    if (uv >= 8) parts.push('UV is high, sunscreen is a good idea.')
    else if (uv >= 6) parts.push('UV is moderate — some sun protection recommended.')
    else if (uv >= 3) parts.push('UV is mild, minimal sun protection needed.')
  }

  // AQI
  const aqi = data.aqi
  if (aqi != null) {
    if (aqi > 150) parts.push('Air quality is unhealthy — sensitive groups should limit outdoor time.')
    else if (aqi > 100) parts.push('Air quality is moderate — sensitive individuals may want to be careful.')
  }

  // Visibility
  if (data.visibility != null && data.visibility < 2) {
    parts.push('Visibility is reduced — allow extra time if driving.')
  }

  // Pressure trend (if available from daily)
  if (data.pressure != null) {
    if (data.pressure > 1020) parts.push('Pressure is high and stable.')
    else if (data.pressure < 1005) parts.push('Pressure is low — unsettled weather possible.')
  }

  return parts.join(' ')
}

function buildDetails(data) {
  const details = []

  const push = (label, value) => {
    if (value == null || value === '') return
    details.push({ label, value: String(value) })
  }

  // ─── Temperature ───────────────────────────────────────────────────
  if (data.temp != null) push('Temperature', `${Math.round(data.temp)}°C`)
  if (data.feelsLike != null && data.feelsLike !== data.temp) {
    push('Feels like', `${Math.round(data.feelsLike)}°C`)
  }
  if (data.tempMax != null && data.tempMin != null) {
    push('Daily high / low', `${Math.round(data.tempMax)}° / ${Math.round(data.tempMin)}°`)
  }
  if (data.dewPoint != null) push('Dew point', `${Math.round(data.dewPoint)}°C`)

  // ─── Condition ─────────────────────────────────────────────────────
  push('Condition', getConditionName(data.conditionCode ?? 0))

  // ─── Rain ──────────────────────────────────────────────────────────
  if (data.precipitationProb != null) push('Rain chance', `${Math.round(data.precipitationProb)}%`)
  if (data.precipitation != null && data.precipitation > 0) {
    push('Precipitation', `${data.precipitation.toFixed(1)} mm`)
  }
  if (data.precipitationSum != null && data.precipitationSum > 0) {
    push('Daily precipitation', `${data.precipitationSum.toFixed(1)} mm`)
  }

  // ─── Wind ──────────────────────────────────────────────────────────
  if (data.wind != null) {
    const dir = data.windDir != null ? ` ${degreesToCompass(data.windDir)}` : ''
    push('Wind', `${Math.round(data.wind)} km/h${dir}`)
  }
  if (data.windGust != null && data.windGust > data.wind + 5) {
    push('Gusts', `${Math.round(data.windGust)} km/h`)
  }
  if (data.windMax != null && data.windMax !== data.wind) {
    push('Max wind today', `${Math.round(data.windMax)} km/h`)
  }

  // ─── Atmosphere ────────────────────────────────────────────────────
  if (data.humidity != null) push('Humidity', `${Math.round(data.humidity)}%`)
  if (data.pressure != null) push('Pressure', `${Math.round(data.pressure)} hPa`)
  if (data.visibility != null) push('Visibility', `${data.visibility.toFixed(1)} km`)
  if (data.cloudCover != null) push('Cloud cover', `${Math.round(data.cloudCover)}%`)

  // ─── Sun / UV ──────────────────────────────────────────────────────
  if (data.uvIndex != null) push('UV index', `${Math.round(data.uvIndex)}${uvLevelLabel(data.uvIndex)}`)
  if (data.sunrise) push('Sunrise', formatTime(data.sunrise))
  if (data.sunset) push('Sunset', formatTime(data.sunset))

  // ─── AQI ───────────────────────────────────────────────────────────
  if (data.aqi != null) push('Air quality (US AQI)', String(Math.round(data.aqi)))

  return details
}

function buildFullText(data, question) {
  const lines = []

  const temp = data.temp ?? data.tempMax ?? null
  const code = data.conditionCode ?? 0
  const rainProb = data.precipitationProb ?? 0
  const wind = data.wind ?? data.windMax ?? null

  lines.push(`Conditions: ${getConditionName(code)}.`)
  if (temp != null) lines.push(`Temperature: ${Math.round(temp)}°C.`)
  if (rainProb > 0) lines.push(`Rain chance: ${Math.round(rainProb)}%.`)
  if (wind != null) lines.push(`Wind: ${Math.round(wind)} km/h.`)

  // Warnings
  if (isStormCode(code)) {
    lines.push('Thunderstorms are expected. Best to stay indoors and avoid open areas.')
  } else if (isSnowCode(code)) {
    lines.push('Snow is expected. Dress warmly and watch for slippery surfaces.')
  } else if (isFogCode(code)) {
    lines.push('Fog is present. Drive slowly and maintain safe distance.')
  }

  // UV warning
  if (data.uvIndex != null && data.uvIndex >= 8) {
    lines.push('UV is high. Sunscreen is strongly recommended.')
  }

  // AQI note
  if (data.aqi != null && data.aqi > 100) {
    lines.push('Air quality is moderate to unhealthy — sensitive groups should limit outdoor exposure.')
  }

  return lines.join(' ')
}

function degreesToCompass(deg) {
  if (deg == null) return ''
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const idx = Math.round(deg / 45) % 8
  return dirs[idx]
}

function uvLevelLabel(uv) {
  if (uv >= 11) return ' (Extreme)'
  if (uv >= 8) return ' (Very High)'
  if (uv >= 6) return ' (High)'
  if (uv >= 3) return ' (Moderate)'
  return ' (Low)'
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return ''
  }
}

// ─── MAIN ENTRY POINT ──────────────────────────────────────────────────

/**
 * Get weather advice for a question.
 *
 * The bundle passed in is ALREADY correct for the time + location the user
 * asked about. This function does not do any date math — it just narrates
 * the values it was handed.
 *
 * @param {Object} data — bundle from weatherResolver
 * @param {string} question — original question (English)
 * @returns {Object} — { verdict, summary, note, details, fullText }
 */
export const getWeatherAdvice = (data, question = '') => {
  if (!data) {
    return {
      verdict: "I don't have weather data right now.",
      summary: 'Try again in a moment.',
      note: '',
      details: [],
      fullText: '',
      _empty: true,
    }
  }

  // ─── Unpack ────────────────────────────────────────────────────────
  const {
    temp,
    feelsLike,
    humidity,
    wind,
    windGust,
    windDir,
    conditionCode,
    precipitation,
    precipitationProb,
    precipitationSum,
    cloudCover,
    pressure,
    visibility,
    uvIndex,
    dewPoint,
    tempMax,
    tempMin,
    sunrise,
    sunset,
    aqi,
    city,
    _timeLabel,
  } = data

  // ─── Prepare a normalized bundle for downstream builders ──────────
  const bundle = {
    temp,
    feelsLike,
    humidity,
    wind,
    windGust,
    windDir,
    conditionCode,
    precipitation,
    precipitationProb,
    precipitationSum,
    cloudCover,
    pressure,
    visibility,
    uvIndex,
    dewPoint,
    tempMax,
    tempMin,
    sunrise,
    sunset,
    aqi,
  }

  // ─── Verdict ───────────────────────────────────────────────────────
  const { verdict } = decideVerdict(bundle, question)

  // ─── Summary ───────────────────────────────────────────────────────
  const summary = buildSummary(bundle)

  // ─── Note ──────────────────────────────────────────────────────────
  const note = buildNote(bundle)

  // ─── Details ───────────────────────────────────────────────────────
  const details = buildDetails(bundle)

  // ─── Full text ─────────────────────────────────────────────────────
  const fullText = buildFullText(bundle, question)

  return {
    verdict,
    summary,
    note,
    details,
    fullText,
    // Context for the formatter to render header
    _city: city,
    _timeLabel: _timeLabel,
  }
}

export default getWeatherAdvice
