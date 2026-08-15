// ============================================================================
// BASIC WEATHER ADVICE — Structured, Warm, No Emojis
// ============================================================================

import { getCloudCover, mapWeatherCode } from './calculations'

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── HELPERS ──────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
  } else if (q.includes('this weekend') || q.includes('on the weekend') || (q.includes('saturday') && !q.includes('next')) || (q.includes('sunday') && !q.includes('next'))) {
    const day = target.getDay()
    const daysUntilSat = (6 - day + 7) % 7
    target.setDate(target.getDate() + daysUntilSat)
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

  return target
}

/**
 * Parse a time reference from a question
 * Returns a Date object with the correct time set
 */
function parseTimeReference(question, date) {
  const q = question.toLowerCase()
  const target = new Date(date)

  const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (timeMatch) {
    let hour = parseInt(timeMatch[1])
    const minute = parseInt(timeMatch[2]) || 0
    const ampm = timeMatch[3]?.toLowerCase()

    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (!ampm && hour < 12 && !q.includes('pm') && !q.includes('am')) {
      if (q.includes('morning') || q.includes('am')) {
        if (hour === 12) hour = 0
      } else if (q.includes('afternoon') || q.includes('evening') || q.includes('night') || q.includes('pm')) {
        if (hour < 12) hour += 12
      }
    }

    target.setHours(hour, minute, 0, 0)
    return target
  }

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

function getTemperatureDescription(temp) {
  if (temp > 35) return 'extremely hot'
  if (temp > 30) return 'hot'
  if (temp > 25) return 'warm'
  if (temp > 20) return 'mild'
  if (temp > 15) return 'cool'
  if (temp > 10) return 'chilly'
  if (temp > 5) return 'cold'
  return 'freezing'
}

function getWindDescription(wind) {
  if (wind > 50) return 'dangerously strong'
  if (wind > 35) return 'very strong'
  if (wind > 20) return 'moderately windy'
  if (wind > 10) return 'slightly breezy'
  return 'calm'
}

function getRainDescription(prob, precip) {
  if (prob > 80) return 'heavy rain is expected'
  if (prob > 50) return 'rain is likely'
  if (prob > 30) return 'there is a chance of rain'
  if (prob > 10) return 'there is a slight chance of rain'
  return 'no significant rain is expected'
}

function getVerdict(data, question) {
  const q = question.toLowerCase()
  const rainChance = data.precipitationProb || 0
  const temp = data.temp || 0
  const wind = data.wind || 0

  if (q.includes('rain') || q.includes('storm')) {
    if (rainChance > 70) return { verdict: 'Yes', confidence: 'high', text: 'rain is expected' }
    if (rainChance > 40) return { verdict: 'Possibly', confidence: 'moderate', text: 'rain is possible' }
    return { verdict: 'No', confidence: 'high', text: 'rain is unlikely' }
  }

  if (q.includes('hot') || q.includes('warm')) {
    if (temp > 28) return { verdict: 'Yes', confidence: 'high', text: 'it will be hot' }
    if (temp > 22) return { verdict: 'Possibly', confidence: 'moderate', text: 'it may feel warm' }
    return { verdict: 'No', confidence: 'high', text: 'it will not be hot' }
  }

  if (q.includes('cold')) {
    if (temp < 10) return { verdict: 'Yes', confidence: 'high', text: 'it will be cold' }
    if (temp < 18) return { verdict: 'Possibly', confidence: 'moderate', text: 'it may feel cool' }
    return { verdict: 'No', confidence: 'high', text: 'it will not be cold' }
  }

  if (q.includes('clear') || q.includes('sunny')) {
    if (data.cloudCover < 30) return { verdict: 'Yes', confidence: 'high', text: 'it will be clear' }
    if (data.cloudCover < 60) return { verdict: 'Possibly', confidence: 'moderate', text: 'it may clear up' }
    return { verdict: 'No', confidence: 'high', text: 'it will likely be cloudy' }
  }

  return { verdict: 'Probably', confidence: 'moderate', text: 'conditions look reasonable' }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN FUNCTION ────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const getWeatherAdvice = (data, question = '') => {
  if (!data) {
    return {
      verdict: "I'm sorry",
      summary: "I don't have weather data right now.",
      note: "Please check your connection and try again.",
      details: [],
      fullText: "Unable to access weather information at the moment."
    }
  }

  const q = question.toLowerCase()
  const now = new Date()

  const targetDay = parseDateReference(q, now)
  const targetTime = parseTimeReference(q, targetDay)

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

  if (closestIndex === -1 || times.length === 0) {
    return {
      verdict: "I'm not sure",
      summary: "I couldn't find weather data for that exact time.",
      note: "Try asking about a specific day or hour, like tomorrow morning or 2 PM.",
      details: [],
      fullText: "Unable to find weather data for the requested time."
    }
  }

  const targetTemp = temps[closestIndex] ?? data.temp ?? 'N/A'
  const targetCode = codes[closestIndex] ?? data.conditionCode ?? 0
  const targetPrecipProb = precipProbs[closestIndex] ?? 0
  const targetPrecip = precip[closestIndex] ?? 0
  const targetWind = wind[closestIndex] ?? data.wind ?? 0
  const targetHumidity = humidity[closestIndex] ?? data.humidity ?? 0
  const targetPressure = pressure[closestIndex] ?? data.pressure ?? 0
  const targetGust = gust[closestIndex] ?? 0

  const conditionName = getConditionName(targetCode)
  const tempDesc = getTemperatureDescription(targetTemp)
  const windDesc = getWindDescription(targetWind)
  const rainDesc = getRainDescription(targetPrecipProb, targetPrecip)

  const timeLabel = formatDateTime(targetTime)
  const isToday = targetTime.toDateString() === now.toDateString()
  const isTomorrow = targetTime.toDateString() === new Date(now.getTime() + 86400000).toDateString()

  const verdictData = getVerdict(data, question)
  const isYes = verdictData.verdict === 'Yes'
  const isNo = verdictData.verdict === 'No'

  // ─── SUMMARY ──────────────────────────────────────────────────────

  let summary = ''

  if (isYes) {
    if (q.includes('rain') || q.includes('storm')) {
      summary = `Yes, rain is expected around ${timeLabel}. It's worth planning ahead and bringing something waterproof.`
    } else if (q.includes('hot') || q.includes('warm')) {
      summary = `Yes, it's going to be warm — around ${Math.round(targetTemp)}°C. It'll feel comfortable for most outdoor plans.`
    } else if (q.includes('clear') || q.includes('sunny')) {
      summary = `Yes, it looks like it'll be clear and bright at ${timeLabel}. Perfect for getting outside.`
    } else {
      summary = `Yes, the weather at ${timeLabel} looks good for your plans. It'll be ${tempDesc} with ${conditionName.toLowerCase()}.`
    }
  } else if (isNo) {
    if (q.includes('rain') || q.includes('storm')) {
      summary = `No, rain isn't expected around ${timeLabel}. You should be fine without an umbrella.`
    } else if (q.includes('hot') || q.includes('warm')) {
      summary = `No, it won't be hot — around ${Math.round(targetTemp)}°C. It'll feel mild and comfortable.`
    } else if (q.includes('clear') || q.includes('sunny')) {
      summary = `No, it'll likely be cloudy at ${timeLabel}. Not ideal for sunbathing, but still a reasonable day.`
    } else {
      summary = `No, the conditions at ${timeLabel} aren't ideal right now. It's ${tempDesc} with ${conditionName.toLowerCase()}.`
    }
  } else {
    summary = `The weather at ${timeLabel} is mixed. It's ${tempDesc} with ${conditionName.toLowerCase()}.`
  }

  if (targetPrecipProb > 50) {
    summary += ` Rain is likely, so you may want to plan accordingly.`
  } else if (targetPrecipProb > 20) {
    summary += ` There's a chance of rain, but it shouldn't be too disruptive.`
  } else {
    summary += ` Rain doesn't look like a concern at that time.`
  }

  if (targetWind > 25) {
    summary += ` It's also quite windy, which is worth keeping in mind.`
  }

  // ─── NOTE ─────────────────────────────────────────────────────────

  let note = ''

  const uvIndex = data.uvIndex || 0
  if (uvIndex > 6) {
    note = `The UV is high at that time, so sunscreen is a good idea if you're heading out.`
  } else if (uvIndex > 3) {
    note = `The UV is moderate. You might want to consider some sun protection.`
  }

  const aqi = data.aqi || 0
  if (aqi > 100) {
    note += ` Air quality is moderate, which may affect sensitive individuals.`
  }

  if (targetWind > 35) {
    note = `The wind is strong, so it may feel cooler than the temperature suggests.`
  }

  if (targetCode >= 95) {
    note = `Thunderstorms are expected. It's best to stay indoors and avoid outdoor activities.`
  }

  if (targetCode >= 71 && targetCode <= 86) {
    note = `Snow is expected. Dress warmly and watch for slippery surfaces.`
  }

  if (targetCode === 45 || targetCode === 48) {
    note = `Fog is expected. Drive slowly and maintain a safe distance from other vehicles.`
  }

  // ─── DETAILS ──────────────────────────────────────────────────────

  const details = [
    { label: "Time", value: timeLabel },
    { label: "Temperature", value: `${Math.round(targetTemp)}°C` },
    { label: "Condition", value: conditionName },
    { label: "Rain chance", value: `${Math.round(targetPrecipProb)}%` },
    { label: "Wind", value: `${Math.round(targetWind)} km/h${targetGust > 20 ? ` (gusts up to ${Math.round(targetGust)} km/h)` : ''}` },
    { label: "Humidity", value: `${Math.round(targetHumidity)}%` }
  ]

  if (targetPressure > 0) {
    const trend = targetPressure > 1020 ? 'rising' : targetPressure < 1005 ? 'falling' : 'stable'
    details.push({ label: "Pressure", value: `${Math.round(targetPressure)} hPa (${trend})` })
  }

  const cloudCover = getCloudCover(targetCode)
  details.push({ label: "Cloud cover", value: `${Math.round(cloudCover)}%` })

  if (data.feelsLike) {
    details.push({ label: "Feels like", value: `${Math.round(data.feelsLike)}°C` })
  }

  // ─── FULL TEXT ────────────────────────────────────────────────────

  let fullText = `Weather forecast for ${timeLabel}:\n\n`
  fullText += `Temperature: ${Math.round(targetTemp)}°C`
  if (data.feelsLike) fullText += ` (feels like ${Math.round(data.feelsLike)}°C)`
  fullText += `\n`
  fullText += `Condition: ${conditionName}\n`
  fullText += `Rain chance: ${Math.round(targetPrecipProb)}%\n`
  fullText += `Wind: ${Math.round(targetWind)} km/h`
  if (targetGust > 20) fullText += ` (gusts up to ${Math.round(targetGust)} km/h)`
  fullText += `\n`
  fullText += `Humidity: ${Math.round(targetHumidity)}%\n`
  fullText += `Cloud cover: ${Math.round(cloudCover)}%\n`
  if (targetPressure > 0) fullText += `Pressure: ${Math.round(targetPressure)} hPa\n\n`

  if (isYes) {
    fullText += `The weather looks good for your plans at that time. `
  } else if (isNo) {
    fullText += `The weather may not be ideal at that time. `
  } else {
    fullText += `The weather is mixed at that time, so it's worth being prepared. `
  }

  fullText += `It's ${tempDesc} with ${conditionName.toLowerCase()}. `
  if (targetPrecipProb > 50) fullText += `Rain is likely, so you may want to plan accordingly. `
  else if (targetPrecipProb > 20) fullText += `There's a chance of rain, but it shouldn't be too heavy. `
  else fullText += `Rain doesn't look like a concern at that time. `

  if (targetWind > 25) fullText += `It's also quite windy, which is worth keeping in mind. `
  if (uvIndex > 6) fullText += `The UV is high, so sunscreen is a good idea if you're heading out. `
  else if (uvIndex > 3) fullText += `The UV is moderate, so you might want to consider some sun protection. `
  if (aqi > 100) fullText += `Air quality is moderate, which may affect sensitive individuals. `

  if (targetCode >= 95) fullText += `Thunderstorms are expected. It's best to stay indoors. `
  else if (targetCode >= 71 && targetCode <= 86) fullText += `Snow is expected. Dress warmly and take care on slippery surfaces. `
  else if (targetCode === 45 || targetCode === 48) fullText += `Fog is expected. Drive carefully and allow extra time for your journey. `

  fullText += `\n\nOverall, it's a reasonable time for most activities with the right preparation.`

  // ─── RETURN ────────────────────────────────────────────────────────

  return {
    verdict: `${verdictData.verdict} — ${verdictData.text}`,
    summary: summary,
    note: note,
    details: details,
    fullText: fullText
  }
}

export default getWeatherAdvice
