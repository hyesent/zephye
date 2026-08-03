// ============================================================================
// BASIC WEATHER ADVICE - Time-aware weather Q&A for Zephye AI
// Follows same pattern as Stargazing.js
// ============================================================================

import { getCloudCover, mapWeatherCode, random } from './calculations'

export const sampleQuestions = [
  "Will it rain tomorrow?",
  "What's the weather like at 2 PM?",
  "Will it be sunny this weekend?",
  "Is it going to rain tonight?",
  "What time will it rain tomorrow?",
  "Will it be hot tomorrow?",
  "Is it going to storm on Saturday?",
  "What's the forecast for Monday morning?",
  "Will it rain in the afternoon?",
  "Is it going to be windy tomorrow?",
  "Will it snow this week?",
  "What's the temperature going to be tomorrow?",
  "Will it be clear tonight?",
  "Is it going to rain on my commute?",
  "Will the weather be good this weekend?",
  "What's the weather like at 5 PM?",
  "Is it going to rain tomorrow morning?",
  "Will it be cloudy tomorrow?",
  "What's the forecast for next week?",
  "Will it rain on Tuesday?"
]

// ============================================================================
// TIME PARSING HELPERS
// ============================================================================

/**
 * Parse a date reference from a question
 * Returns a Date object set to the referenced day
 */
function parseDateReference(question, now) {
  const q = question.toLowerCase()
  const target = new Date(now)
  target.setHours(0, 0, 0, 0)

  if (q.includes('tomorrow')) {
    target.setDate(target.getDate() + 1)
  } else if (q.includes('next week') || q.includes('in a week') || q.includes('next monday') || q.includes('next tuesday') || q.includes('next wednesday') || q.includes('next thursday') || q.includes('next friday') || q.includes('next saturday') || q.includes('next sunday')) {
    target.setDate(target.getDate() + 7)
  } else if (q.includes('this weekend') || q.includes('on the weekend') || q.includes('saturday') && !q.includes('next') || q.includes('sunday') && !q.includes('next')) {
    const day = target.getDay()
    const daysUntilSat = (6 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilSat)
  } else if (q.includes('tonight') || q.includes('this evening') || q.includes('later tonight')) {
    // Keep today
  } else if (q.includes('this week') && !q.includes('end')) {
    // Keep today
  } else if (q.includes('monday') && !q.includes('next')) {
    const day = target.getDay()
    const daysUntilMon = (1 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilMon)
  } else if (q.includes('tuesday') && !q.includes('next')) {
    const day = target.getDay()
    const daysUntilTue = (2 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilTue)
  } else if (q.includes('wednesday') && !q.includes('next')) {
    const day = target.getDay()
    const daysUntilWed = (3 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilWed)
  } else if (q.includes('thursday') && !q.includes('next')) {
    const day = target.getDay()
    const daysUntilThu = (4 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilThu)
  } else if (q.includes('friday') && !q.includes('next')) {
    const day = target.getDay()
    const daysUntilFri = (5 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilFri)
  }
  // Else: keep today

  return target
}

/**
 * Parse a time reference from a question
 * Returns a Date object with the correct time set
 */
function parseTimeReference(question, date) {
  const q = question.toLowerCase()
  const target = new Date(date)

  // Try to find specific time: "2 PM", "2:30", "14:00", "morning", "afternoon", "evening", "night"
  const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (timeMatch) {
    let hour = parseInt(timeMatch[1])
    const minute = parseInt(timeMatch[2]) || 0
    const ampm = timeMatch[3]?.toLowerCase()

    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (!ampm && hour < 12 && !q.includes('pm') && !q.includes('am')) {
      // No AM/PM specified — check context
      if (q.includes('morning') || q.includes('am')) {
        if (hour === 12) hour = 0
      } else if (q.includes('afternoon') || q.includes('evening') || q.includes('night') || q.includes('pm')) {
        if (hour < 12) hour += 12
      }
    }

    target.setHours(hour, minute, 0, 0)
    return target
  }

  // No specific time — use time-of-day keywords
  if (q.includes('morning')) {
    target.setHours(9, 0, 0, 0)
  } else if (q.includes('afternoon')) {
    target.setHours(14, 0, 0, 0)
  } else if (q.includes('evening') || q.includes('tonight')) {
    target.setHours(19, 0, 0, 0)
  } else if (q.includes('night') || q.includes('midnight')) {
    target.setHours(23, 0, 0, 0)
  } else if (q.includes('noon') || q.includes('midday')) {
    target.setHours(12, 0, 0, 0)
  } else if (q.includes('commute') || q.includes('driving')) {
    target.setHours(8, 0, 0, 0)
  } else {
    // Default to noon
    target.setHours(12, 0, 0, 0)
  }

  return target
}

/**
 * Format a date/time for display
 */
function formatDateTime(date) {
  const day = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  return `${day} at ${time}`
}

/**
 * Get weather condition name from WMO code
 */
function getConditionName(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  }
  return map[code] || 'Unknown'
}

/**
 * Get emoji for weather condition
 */
function getWeatherEmoji(code) {
  if (code === 0 || code === 1) return '☀️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 95) return '⛈️'
  if (code >= 61 && code <= 82) return '🌧️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code === 45 || code === 48) return '🌫️'
  return '🌤️'
}

// ============================================================================
// MAIN WEATHER ADVICE FUNCTION
// ============================================================================

export const getWeatherAdvice = (data, question = '') => {
  if (!data) return "Loading weather data..."

  const q = question.toLowerCase()
  const now = new Date()

  // Parse the user's time reference
  const targetDay = parseDateReference(q, now)
  const targetTime = parseTimeReference(q, targetDay)

  // Get hourly data from the weather object
  const hourly = data.hourly || {}
  const times = hourly.time || []
  const temps = hourly.temperature_2m || []
  const codes = hourly.weather_code || []
  const precipProbs = hourly.precipitation_probability || []
  const precip = hourly.precipitation || []
  const wind = hourly.wind_speed_10m || []
  const humidity = hourly.relative_humidity_2m || []
  const pressure = hourly.pressure_msl || []
  const gust = hourly.wind_gusts_10m || []

  // Find the closest matching hour
  let closestIndex = -1
  let closestDiff = Infinity

  times.forEach((timeStr, i) => {
    const time = new Date(timeStr)
    const diff = Math.abs(time.getTime() - targetTime.getTime())
    if (diff < closestDiff) {
      closestDiff = diff
      closestIndex = i
    }
  })

  // If no match found, return fallback
  if (closestIndex === -1 || times.length === 0) {
    return "I couldn't find weather data for that time. Please try asking about a specific day or hour."
  }

  // Extract the matching data
  const targetTemp = temps[closestIndex] ?? data.temp ?? 'N/A'
  const targetCode = codes[closestIndex] ?? data.conditionCode ?? 0
  const targetPrecipProb = precipProbs[closestIndex] ?? 0
  const targetPrecip = precip[closestIndex] ?? 0
  const targetWind = wind[closestIndex] ?? data.wind ?? 0
  const targetHumidity = humidity[closestIndex] ?? data.humidity ?? 0
  const targetPressure = pressure[closestIndex] ?? data.pressure ?? 0
  const targetGust = gust[closestIndex] ?? 0

  // Get condition name and emoji
  const conditionName = getConditionName(targetCode)
  const emoji = getWeatherEmoji(targetCode)

  // Build the response
  const timeLabel = formatDateTime(targetTime)
  const dayLabel = targetTime.toLocaleDateString('en-US', { weekday: 'long' })
  const isToday = targetTime.toDateString() === now.toDateString()
  const isTomorrow = targetTime.toDateString() === new Date(now.getTime() + 86400000).toDateString()

  // Determine the time frame
  let timeFrame = ''
  if (isToday && targetTime.getHours() > 18) timeFrame = 'tonight'
  else if (isToday) timeFrame = 'today'
  else if (isTomorrow) timeFrame = 'tomorrow'
  else timeFrame = `on ${dayLabel}`

  // Build the response string
  let response = `📅 **${timeLabel}**\n\n`
  response += `🌡️ **Temperature:** ${Math.round(targetTemp)}°C\n`
  
  // Add feels like if available
  if (data.feelsLike) {
    response += `🌡️ **Feels like:** ${Math.round(data.feelsLike)}°C\n`
  }

  response += `☁️ **Condition:** ${emoji} ${conditionName}\n`

  // Precipitation
  if (targetPrecipProb > 0) {
    response += `🌧️ **Rain chance:** ${Math.round(targetPrecipProb)}%`
    if (targetPrecip > 0.1) {
      response += ` (${Math.round(targetPrecip * 10) / 10}mm expected)`
    }
    response += '\n'
  }

  // Wind
  if (targetWind > 0) {
    response += `💨 **Wind:** ${Math.round(targetWind)} km/h`
    if (targetGust > 20) {
      response += ` (gusts up to ${Math.round(targetGust)} km/h)`
    }
    response += '\n'
  }

  // Humidity
  if (targetHumidity > 0) {
    response += `💧 **Humidity:** ${Math.round(targetHumidity)}%\n`
  }

  // Pressure
  if (targetPressure > 0) {
    const trend = targetPressure > 1020 ? 'rising' : targetPressure < 1005 ? 'falling' : 'stable'
    response += `📊 **Pressure:** ${Math.round(targetPressure)} hPa (${trend})\n`
  }

  // ========================================================================
  // ADVICE SECTION
  // ========================================================================

  response += '\n---\n\n'

  // Create a detailed advice block based on conditions
  let advice = []

  // Temperature advice
  if (targetTemp > 35) {
    advice.push('🔥 **Extreme heat!** Stay hydrated, avoid prolonged sun exposure, and wear light clothing.')
  } else if (targetTemp > 30) {
    advice.push('☀️ **Hot day.** Stay hydrated and wear light clothing. Use sunscreen if outdoors.')
  } else if (targetTemp > 25) {
    advice.push('🌤️ **Warm and pleasant.** Great day for outdoor activities.')
  } else if (targetTemp > 20) {
    advice.push('🌥️ **Mild and comfortable.** Enjoy the weather!')
  } else if (targetTemp > 15) {
    advice.push('🌬️ **Cool.** A light jacket might be needed.')
  } else if (targetTemp > 10) {
    advice.push('🧥 **Chilly.** Wear a jacket or sweater.')
  } else if (targetTemp > 5) {
    advice.push('🧥 **Cold.** Bundle up with a warm coat.')
  } else {
    advice.push('🥶 **Very cold!** Dress in layers and limit time outdoors.')
  }

  // Rain advice
  if (targetPrecipProb >= 80 && (targetPrecip > 1 || targetCode >= 61)) {
    advice.push('☔ **Heavy rain expected!** Bring an umbrella and waterproof shoes. Consider indoor plans.')
  } else if (targetPrecipProb >= 50) {
    advice.push('🌂 **Rain possible.** A jacket or umbrella is recommended.')
  } else if (targetPrecipProb >= 30) {
    advice.push('🌦️ **Light rain possible.** Be prepared just in case.')
  } else if (targetPrecipProb >= 10) {
    advice.push('🌤️ **Low rain chance.** Most likely dry.')
  } else if (targetPrecipProb < 10) {
    advice.push('☀️ **No rain expected.** Clear skies ahead!')
  }

  // Thunderstorm advice
  if (targetCode >= 95) {
    advice.push('⛈️ **Thunderstorms expected!** Stay indoors and avoid outdoor activities. Lightning is dangerous.')
  }

  // Wind advice
  if (targetWind > 50) {
    advice.push('💨 **Severe winds!** Secure outdoor items and avoid driving if possible.')
  } else if (targetWind > 35) {
    advice.push('💨 **Strong winds.** Secure lightweight outdoor items and drive carefully.')
  } else if (targetWind > 20) {
    advice.push('🌬️ **Breezy.** Pleasant but hold onto your hat!')
  }

  // UV advice (if available)
  if (data.uvIndex && data.uvIndex > 6) {
    advice.push('☀️ **High UV index!** Use sunscreen, wear a hat, and limit sun exposure between 10 AM and 4 PM.')
  } else if (data.uvIndex && data.uvIndex > 3) {
    advice.push('☀️ **Moderate UV.** Sunscreen recommended if outdoors for extended periods.')
  }

  // Fog advice
  if (targetCode === 45 || targetCode === 48) {
    advice.push('🌫️ **Foggy conditions.** Drive slowly, use fog lights, and maintain safe distance from other vehicles.')
  }

  // Snow advice
  if (targetCode >= 71 && targetCode <= 86) {
    advice.push('❄️ **Snow expected.** Dress warmly, watch for slippery surfaces, and allow extra travel time.')
  }

  // Cloud cover advice
  const cloudCover = getCloudCover(targetCode)
  if (cloudCover >= 80) {
    advice.push('☁️ **Mostly cloudy.** Limited sunshine today.')
  } else if (cloudCover <= 20) {
    advice.push('☀️ **Clear skies.** Perfect for outdoor activities and stargazing at night.')
  }

  // Air quality advice
  if (data.aqi && data.aqi > 100) {
    advice.push('😷 **Poor air quality.** Sensitive groups should limit outdoor activity.')
  } else if (data.aqi && data.aqi > 50) {
    advice.push('🌬️ **Moderate air quality.** Sensitive individuals may want to limit prolonged outdoor exertion.')
  }

  // Add the advice to response
  advice.forEach(a => response += `${a}\n`)

  // ========================================================================
  // BOTTOM LINE
  // ========================================================================

  response += '\n---\n\n'

  // Determine the overall verdict
  let verdict = ''
  if (targetCode >= 95) {
    verdict = '⚠️ **Verdict:** Severe weather — stay indoors and stay safe.'
  } else if (targetPrecipProb > 70 && targetPrecip > 1) {
    verdict = '☔ **Verdict:** Significant rain expected. Plan indoor activities.'
  } else if (targetPrecipProb > 40) {
    verdict = '🌦️ **Verdict:** Rain is possible. Keep an umbrella handy.'
  } else if (targetTemp > 30) {
    verdict = '☀️ **Verdict:** Hot but dry. Great for the beach or pool!'
  } else if (targetTemp > 20 && targetPrecipProb < 30) {
    verdict = '🌤️ **Verdict:** Excellent weather! Perfect for outdoor plans.'
  } else if (targetTemp > 10 && targetPrecipProb < 40) {
    verdict = '🌥️ **Verdict:** Good weather. A light jacket might be needed.'
  } else if (targetTemp > 5) {
    verdict = '🧥 **Verdict:** Cool and possibly wet. Dress warmly.'
  } else {
    verdict = '🥶 **Verdict:** Very cold. Limit time outdoors and bundle up.'
  }

  response += verdict

  // ========================================================================
  // CONCLUSION
  // ========================================================================

  const conclusions = [
    "\n\nStay safe and enjoy your day! 🌟",
    "\n\nThat's the forecast for your requested time. Let me know if you need more details! 🌤️",
    "\n\nHave a great day! ☀️",
    "\n\nHope that helps with your plans! 🎯",
    "\n\nZephye's got you covered! 🌦️",
    "\n\nWeather wisdom: Always be prepared! 🌈"
  ]

  response += random(conclusions)

  return response
}

export default getWeatherAdvice
