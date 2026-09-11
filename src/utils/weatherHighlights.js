// ============================================================================
// WEATHER HIGHLIGHT CALCULATIONS
// For Today Summary and Weekly Summary share cards
// ============================================================================

// ─── Get most common weather code from hourly data ─────────────────────
export const getMostCommonCode = (hourlyCodes) => {
  if (!hourlyCodes || hourlyCodes.length === 0) return 0
  const counts = {}
  hourlyCodes.forEach(code => {
    if (code != null) counts[code] = (counts[code] || 0) + 1
  })
  let maxCount = 0
  let mostCommon = 0
  Object.entries(counts).forEach(([code, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommon = parseInt(code)
    }
  })
  return mostCommon
}

// ─── Today highlights ──────────────────────────────────────────────────
export const calculateTodayHighlights = (hourly, daily, todayStats, aqi) => {
  if (!hourly?.time) {
    return {
      high: 0, low: 0, sunHours: 0, rainHours: 0, thunderHours: 0,
      maxRainProb: 0, maxWind: 0, maxHumidity: 0, uvPeak: 0,
      sunrise: '--:--', sunset: '--:--', rainPeriods: [],
      dominantCode: 0, aqi: aqi?.us_aqi || null, aqiLabel: 'Unknown'
    }
  }

  const todaySlice = hourly.time.slice(0, 24)

  // Max humidity
  const humidityValues = (hourly.relative_humidity_2m || []).slice(0, 24).filter(v => v != null)
  const maxHumidity = humidityValues.length > 0 ? Math.max(...humidityValues) : 0

  // Max wind
  const windValues = (hourly.wind_speed_10m || []).slice(0, 24).filter(v => v != null)
  const maxWind = windValues.length > 0 ? Math.max(...windValues) : 0

  // Dominant code
  const dominantCode = getMostCommonCode(
    (hourly.weather_code || []).slice(0, 24)
  )

  // AQI label
  const aqiLabel = aqi?.us_aqi == null ? 'Unknown'
    : aqi.us_aqi <= 50 ? 'Good'
    : aqi.us_aqi <= 100 ? 'Moderate'
    : aqi.us_aqi <= 150 ? 'Unhealthy'
    : 'Hazardous'

  return {
    high: daily?.temperature_2m_max?.[0] != null ? Math.round(daily.temperature_2m_max[0]) : 0,
    low: daily?.temperature_2m_min?.[0] != null ? Math.round(daily.temperature_2m_min[0]) : 0,
    sunHours: todayStats?.sunHours || 0,
    rainHours: todayStats?.rainHours || 0,
    thunderHours: todayStats?.thunderHours || 0,
    maxRainProb: todayStats?.maxRainProb || 0,
    maxWind: Math.round(maxWind),
    maxHumidity: Math.round(maxHumidity),
    uvPeak: daily?.uv_index_max?.[0] != null ? Math.round(daily.uv_index_max[0]) : 0,
    sunrise: todayStats?.sunrise || '--:--',
    sunset: todayStats?.sunset || '--:--',
    rainPeriods: todayStats?.rainPeriods || [],
    dominantCode,
    aqi: aqi?.us_aqi ?? null,
    aqiLabel
  }
}

// ─── Weekly summary ────────────────────────────────────────────────────
export const calculateWeeklySummary = (daily) => {
  if (!daily?.time) {
    return {
      days: [],
      rainyDays: 0,
      avgHigh: 0,
      avgLow: 0,
      summary: 'Forecast unavailable'
    }
  }

  const days = daily.time.slice(0, 7).map((time, i) => ({
    date: time,
    dayName: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
    high: daily.temperature_2m_max?.[i] != null ? Math.round(daily.temperature_2m_max[i]) : 0,
    low: daily.temperature_2m_min?.[i] != null ? Math.round(daily.temperature_2m_min[i]) : 0,
    code: daily.weather_code?.[i] ?? 0,
    rainProb: daily.precipitation_probability_max?.[i] ?? 0
