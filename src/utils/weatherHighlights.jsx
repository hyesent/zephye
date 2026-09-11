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
  }))

  const rainyDays = days.filter(d => d.rainProb > 50).length

  const validHighs = days.map(d => d.high).filter(v => v > 0)
  const validLows = days.map(d => d.low).filter(v => v > 0)

  const avgHigh = validHighs.length > 0
    ? Math.round(validHighs.reduce((a, b) => a + b, 0) / validHighs.length)
    : 0
  const avgLow = validLows.length > 0
    ? Math.round(validLows.reduce((a, b) => a + b, 0) / validLows.length)
    : 0

  let summary = 'Mostly dry week ahead. Great for outdoor plans!'
  if (rainyDays >= 5) summary = 'Very rainy week ahead. Keep the umbrella handy!'
  else if (rainyDays >= 3) summary = `${rainyDays} rainy days ahead. Umbrella recommended.`
  else if (rainyDays >= 1) summary = `${rainyDays} rainy day${rainyDays > 1 ? 's' : ''} ahead. Keep an umbrella close.`

  return { days, rainyDays, avgHigh, avgLow, summary }
}

// ─── Get hourly slice for hourly share ─────────────────────────────────
export const getHourlySlice = (hourly, count = 12) => {
  if (!hourly?.time) return []

  return hourly.time.slice(0, count).map((time, i) => {
    const date = new Date(time)
    return {
      time,
      hour: date.getHours(),
      hourLabel: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      }),
      temp: hourly.temperature_2m?.[i] != null ? Math.round(hourly.temperature_2m[i]) : 0,
      code: hourly.weather_code?.[i] ?? 0,
      rainProb: hourly.precipitation_probability?.[i] ?? 0,
      wind: hourly.wind_speed_10m?.[i] != null ? Math.round(hourly.wind_speed_10m[i]) : 0,
      humidity: hourly.relative_humidity_2m?.[i] != null ? Math.round(hourly.relative_humidity_2m[i]) : 0,
      feelsLike: hourly.apparent_temperature?.[i] != null ? Math.round(hourly.apparent_temperature[i]) : 0,
      uv: hourly.uv_index?.[i] ?? 0,
      isNow: i === 0
    }
  })
}

// ─── Get single hour data ──────────────────────────────────────────────
export const getSingleHourData = (hourly, index) => {
  if (!hourly?.time || !hourly.time[index]) return null

  const time = hourly.time[index]
  const date = new Date(time)

  return {
    time,
    index,
    hour: date.getHours(),
    hourLabel: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    dateLabel: date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }),
    temp: hourly.temperature_2m?.[index] != null ? Math.round(hourly.temperature_2m[index]) : 0,
    code: hourly.weather_code?.[index] ?? 0,
    rainProb: hourly.precipitation_probability?.[index] ?? 0,
    wind: hourly.wind_speed_10m?.[index] != null ? Math.round(hourly.wind_speed_10m[index]) : 0,
    humidity: hourly.relative_humidity_2m?.[index] != null ? Math.round(hourly.relative_humidity_2m[index]) : 0,
    feelsLike: hourly.apparent_temperature?.[index] != null ? Math.round(hourly.apparent_temperature[index]) : 0,
    uv: hourly.uv_index?.[index] ?? 0
  }
}

// ─── Weather code to emoji ─────────────────────────────────────────────
export const codeToEmoji = (code) => {
  const map = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️',
    80: '🌧️', 81: '🌧️', 82: '🌧️',
    85: '❄️', 86: '❄️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  }
  return map[code] || '🌤️'
}

// ─── Weather code to name ──────────────────────────────────────────────
export const codeToName = (code) => {
  const map = {
    0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    71: 'Light Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    80: 'Rain Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
    85: 'Snow Showers', 86: 'Heavy Snow Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Heavy Thunderstorm'
  }
  return map[code] || 'Unknown'
}
