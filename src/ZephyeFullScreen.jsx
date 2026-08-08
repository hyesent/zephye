import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAudio } from './AudioContext'
import { getMoonPhase, mapWeatherCode, getMoonIllumination } from './data/calculations.js'

import { getClothingAdvice } from './data/ClothingAdvice.js'
import { getLifestyleAdvice } from './data/Lifestyle.js'
import { getSkinHairAdvice } from './data/SkinHair.js'
import { getDrivingAdvice } from './data/Driving.js'
import { getTravelingAdvice } from './data/Traveling.js'
import { getFarmingAdvice } from './data/Farming.js'
import { getStargazingAdvice } from './data/Stargazing.js'
import { getPhotographyAdvice } from './data/Photography.js'
import { getEventsAdvice } from './data/Events.js'
import { getSportsAdvice } from './data/Sports.js'
import { getHealthAdvice } from './data/Health.js'
import { getDIYConstructionAdvice } from './data/DIYconstruction.js'
import { getPetsAdvice } from './data/Pets.js'
import { getEnergyHomeAdvice } from './data/EnergyHome.js'
import { getWeatherAdvice } from './data/BasicWeatherAdvice.js'
import { getTrafficAdvice } from './data/TrafficAdvice.js'
import { getRouteAdvice } from './data/RouteAdvice.js'

// ─── CONFIG ────────────────────────────────────────────────────────────────

const CONFIG = {
  MAX_SUGGESTIONS: 8,
  STREAM_DELAY_MS: 12,
  MAX_INTENTS: 5,
  MIN_SCORE_THRESHOLD: 1.5,
  SECONDARY_THRESHOLD: 0.3,
  MAX_SECONDARY_LINES: 4,
  MAX_WARNINGS: 8,
  TTS_API: 'https://hyezen.onrender.com/api/tts',
  CACHE_DURATION: 5 * 60 * 1000,
  MAX_HISTORY: 20
}

// ─── LOCATION DATABASE ─────────────────────────────────────────────────────

const CITY_DATABASE = {
  'london': { lat: 51.5074, lon: -0.1278, country: 'UK' },
  'paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
  'new york': { lat: 40.7128, lon: -74.0060, country: 'USA' },
  'new york city': { lat: 40.7128, lon: -74.0060, country: 'USA' },
  'nyc': { lat: 40.7128, lon: -74.0060, country: 'USA' },
  'tokyo': { lat: 35.6762, lon: 139.6503, country: 'Japan' },
  'sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
  'lagos': { lat: 6.5244, lon: 3.3792, country: 'Nigeria' },
  'abuja': { lat: 9.0765, lon: 7.3986, country: 'Nigeria' },
  'dubai': { lat: 25.2048, lon: 55.2708, country: 'UAE' },
  'singapore': { lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  'hong kong': { lat: 22.3193, lon: 114.1694, country: 'Hong Kong' },
  'mumbai': { lat: 19.0760, lon: 72.8777, country: 'India' },
  'delhi': { lat: 28.7041, lon: 77.1025, country: 'India' },
  'bangalore': { lat: 12.9716, lon: 77.5946, country: 'India' },
  'berlin': { lat: 52.5200, lon: 13.4050, country: 'Germany' },
  'madrid': { lat: 40.4168, lon: -3.7038, country: 'Spain' },
  'rome': { lat: 41.9028, lon: 12.4964, country: 'Italy' },
  'amsterdam': { lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
  'barcelona': { lat: 41.3851, lon: 2.1734, country: 'Spain' },
  'moscow': { lat: 55.7558, lon: 37.6173, country: 'Russia' },
  'istanbul': { lat: 41.0082, lon: 28.9784, country: 'Turkey' },
  'cairo': { lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  'cape town': { lat: -33.9249, lon: 18.4241, country: 'South Africa' },
  'nairobi': { lat: -1.2921, lon: 36.8219, country: 'Kenya' },
  'mexico city': { lat: 19.4326, lon: -99.1332, country: 'Mexico' },
  'toronto': { lat: 43.6532, lon: -79.3832, country: 'Canada' },
  'vancouver': { lat: 49.2827, lon: -123.1207, country: 'Canada' },
  'chicago': { lat: 41.8781, lon: -87.6298, country: 'USA' },
  'los angeles': { lat: 34.0522, lon: -118.2437, country: 'USA' },
  'la': { lat: 34.0522, lon: -118.2437, country: 'USA' },
  'san francisco': { lat: 37.7749, lon: -122.4194, country: 'USA' },
  'seattle': { lat: 47.6062, lon: -122.3321, country: 'USA' },
  'miami': { lat: 25.7617, lon: -80.1918, country: 'USA' },
  'boston': { lat: 42.3601, lon: -71.0589, country: 'USA' },
  'austin': { lat: 30.2672, lon: -97.7431, country: 'USA' },
  'denver': { lat: 39.7392, lon: -104.9903, country: 'USA' },
  'phoenix': { lat: 33.4484, lon: -112.0740, country: 'USA' },
  'las vegas': { lat: 36.1699, lon: -115.1398, country: 'USA' },
  'orlando': { lat: 28.5383, lon: -81.3792, country: 'USA' },
  'atlanta': { lat: 33.7490, lon: -84.3880, country: 'USA' },
  'dallas': { lat: 32.7767, lon: -96.7970, country: 'USA' },
  'houston': { lat: 29.7604, lon: -95.3698, country: 'USA' },
  'portland': { lat: 45.5152, lon: -122.6784, country: 'USA' },
  'beijing': { lat: 39.9042, lon: 116.4074, country: 'China' },
  'shanghai': { lat: 31.2304, lon: 121.4737, country: 'China' },
  'seoul': { lat: 37.5665, lon: 126.9780, country: 'South Korea' },
  'bangkok': { lat: 13.7563, lon: 100.5018, country: 'Thailand' },
  'jakarta': { lat: -6.2088, lon: 106.8456, country: 'Indonesia' }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

const getSavedLocations = () => {
  try {
    const saved = localStorage.getItem('zephye_saved_locations')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.filter(loc => loc.lat && loc.lon)
    }
    return []
  } catch {
    return []
  }
}

const findSavedLocation = (name) => {
  const locations = getSavedLocations()
  const lowerName = name.toLowerCase().trim()
  
  let match = locations.find(loc => 
    loc.label && loc.label.toLowerCase() === lowerName
  )
  if (match) return match
  
  match = locations.find(loc => {
    const label = loc.label?.toLowerCase() || ''
    const locName = loc.name?.toLowerCase() || ''
    return label.includes(lowerName) || locName.includes(lowerName)
  })
  
  return match || null
}

// ─── FETCH FULL WEATHER DATA ────────────────────────────────────────────

const fetchFullWeather = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_gusts_10m,pressure_msl,relative_humidity_2m,wind_speed_10m,cloud_cover,visibility,uv_index,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,sunrise,sunset,precipitation_sum,precipitation_probability_max,cloud_cover&timezone=auto`
    )
    const om = await res.json()
    
    return {
      hourly: om.hourly || { time: [], temperature_2m: [], weather_code: [], precipitation_probability: [], precipitation: [], apparent_temperature: [], wind_gusts_10m: [], pressure_msl: [], relative_humidity_2m: [], cloud_cover: [], visibility: [], uv_index: [], wind_speed_10m: [] },
      daily: om.daily || { time: [], temperature_2m_max: [], temperature_2m_min: [], weather_code: [], uv_index_max: [], sunrise: [], sunset: [], precipitation_sum: [], precipitation_probability_max: [], cloud_cover: [] },
      temp: Math.round(om.current_weather?.temperature ?? 0),
      feelsLike: Math.round(om.hourly?.apparent_temperature?.[0] ?? om.current_weather?.temperature ?? 0),
      humidity: om.hourly?.relative_humidity_2m?.[0] ?? 50,
      wind: om.current_weather?.windspeed ?? 0,
      windDir: om.current_weather?.winddirection ?? 0,
      windGust: om.hourly?.wind_gusts_10m?.[0] ?? 0,
      uvIndex: om.hourly?.uv_index?.[0] ?? om.daily?.uv_index_max?.[0] ?? 0,
      conditionCode: om.current_weather?.weathercode ?? 0,
      condition: mapWeatherCode(om.current_weather?.weathercode ?? 0),
      cloudCover: om.hourly?.cloud_cover?.[0] ?? om.daily?.cloud_cover?.[0] ?? 0,
      precipitationProb: om.hourly?.precipitation_probability?.[0] ?? 0,
      precipitation: om.hourly?.precipitation?.[0] ?? 0,
      pressure: om.hourly?.pressure_msl?.[0] ?? 0,
      visibility: om.hourly?.visibility?.[0] ? om.hourly.visibility[0] / 1000 : 10,
      tempMax: om.daily?.temperature_2m_max?.[0] ?? 0,
      tempMin: om.daily?.temperature_2m_min?.[0] ?? 0,
      sunrise: om.daily?.sunrise?.[0] ?? '',
      sunset: om.daily?.sunset?.[0] ?? ''
    }
  } catch {
    return null
  }
}

// ─── WEATHER CACHE ────────────────────────────────────────────────────────

const weatherCache = new Map()

const getCachedWeather = (lat, lon) => {
  const key = `${lat},${lon}`
  const cached = weatherCache.get(key)
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedWeather = (lat, lon, data) => {
  const key = `${lat},${lon}`
  weatherCache.set(key, { data, timestamp: Date.now() })
}

const fetchWeatherWithCache = async (lat, lon) => {
  const cached = getCachedWeather(lat, lon)
  if (cached) return cached
  
  const data = await fetchFullWeather(lat, lon)
  if (data) {
    setCachedWeather(lat, lon, data)
  }
  return data
}

// ─── LOCATION DETECTION ─────────────────────────────────────────────────

const detectLocationNames = (question) => {
  const q = question.toLowerCase()
  const mentionedLocations = []
  const savedLocations = getSavedLocations()
  
  const locationDB = { ...CITY_DATABASE }
  
  savedLocations.forEach(loc => {
    if (loc.label) {
      locationDB[loc.label.toLowerCase()] = { 
        lat: loc.lat, 
        lon: loc.lon, 
        country: 'Saved',
        isSaved: true,
        displayName: loc.label
      }
    }
    if (loc.name) {
      locationDB[loc.name.toLowerCase()] = { 
        lat: loc.lat, 
        lon: loc.lon, 
        country: 'Saved',
        isSaved: true,
        displayName: loc.label || loc.name
      }
    }
  })
  
  const inMatches = q.match(/in\s+([a-z\s]+?)(?:\s*$|[\.,\?]|and|or|vs|by|at)/gi)
  if (inMatches) {
    for (const match of inMatches) {
      const locationName = match.replace(/in\s+/i, '').trim()
      const normalized = locationName.toLowerCase()
      if (locationDB[normalized]) {
        const loc = locationDB[normalized]
        if (!mentionedLocations.some(m => m.name === normalized)) {
          mentionedLocations.push({
            name: normalized,
            displayName: loc.displayName || normalized.charAt(0).toUpperCase() + normalized.slice(1),
            lat: loc.lat,
            lon: loc.lon,
            country: loc.country,
            isSaved: loc.isSaved || false
          })
        }
      }
    }
  }
  
  const atMatches = q.match(/at\s+([a-z\s]+?)(?:\s*$|[\.,\?]|and|or|vs|by)/gi)
  if (atMatches) {
    for (const match of atMatches) {
      const locationName = match.replace(/at\s+/i, '').trim()
      const normalized = locationName.toLowerCase()
      if (locationDB[normalized]) {
        const loc = locationDB[normalized]
        if (!mentionedLocations.some(m => m.name === normalized)) {
          mentionedLocations.push({
            name: normalized,
            displayName: loc.displayName || normalized.charAt(0).toUpperCase() + normalized.slice(1),
            lat: loc.lat,
            lon: loc.lon,
            country: loc.country,
            isSaved: loc.isSaved || false
          })
        }
      }
    }
  }
  
  const vsMatches = q.match(/([a-z\s]+?)\s+(?:vs|versus|or)\s+([a-z\s]+?)(?:\s*$|[\.,\?])/i)
  if (vsMatches) {
    const loc1 = vsMatches[1].trim().toLowerCase()
    const loc2 = vsMatches[2].trim().toLowerCase()
    
    if (locationDB[loc1] && !mentionedLocations.some(m => m.name === loc1)) {
      const loc = locationDB[loc1]
      mentionedLocations.push({
        name: loc1,
        displayName: loc.displayName || loc1.charAt(0).toUpperCase() + loc1.slice(1),
        lat: loc.lat,
        lon: loc.lon,
        country: loc.country,
        isSaved: loc.isSaved || false
      })
    }
    if (locationDB[loc2] && !mentionedLocations.some(m => m.name === loc2)) {
      const loc = locationDB[loc2]
      mentionedLocations.push({
        name: loc2,
        displayName: loc.displayName || loc2.charAt(0).toUpperCase() + loc2.slice(1),
        lat: loc.lat,
        lon: loc.lon,
        country: loc.country,
        isSaved: loc.isSaved || false
      })
    }
  }
  
  const words = q.split(/\s+/)
  for (const word of words) {
    const normalized = word.toLowerCase()
    if (locationDB[normalized] && !mentionedLocations.some(m => m.name === normalized)) {
      const loc = locationDB[normalized]
      mentionedLocations.push({
        name: normalized,
        displayName: loc.displayName || normalized.charAt(0).toUpperCase() + normalized.slice(1),
        lat: loc.lat,
        lon: loc.lon,
        country: loc.country,
        isSaved: loc.isSaved || false
      })
    }
  }
  
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i+1]}`.toLowerCase()
    if (locationDB[twoWord] && !mentionedLocations.some(m => m.name === twoWord)) {
      const loc = locationDB[twoWord]
      mentionedLocations.push({
        name: twoWord,
        displayName: loc.displayName || twoWord.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        lat: loc.lat,
        lon: loc.lon,
        country: loc.country,
        isSaved: loc.isSaved || false
      })
    }
  }
  
  if (q.includes('home') || q.includes('my location')) {
    const currentLoc = {
      name: 'home',
      displayName: 'My Location',
      lat: 0,
      lon: 0,
      country: 'Current',
      isSaved: false,
      isHome: true
    }
    if (!mentionedLocations.some(m => m.isHome)) {
      mentionedLocations.push(currentLoc)
    }
  }
  
  return mentionedLocations
}

// ─── TIME SHIFTING ENGINE ──────────────────────────────────────────────

const findClosestHourIndex = (times, targetDate) => {
  if (!times || times.length === 0) return -1
  let closest = 0
  let closestDiff = Infinity
  const targetTime = targetDate.getTime()
  
  for (let i = 0; i < times.length; i++) {
    const time = new Date(times[i])
    const diff = Math.abs(time.getTime() - targetTime)
    if (diff < closestDiff) {
      closestDiff = diff
      closest = i
    }
  }
  return closest
}

const getTimeShiftedData = (baseData, timeContext, question = '') => {
  const data = { ...baseData }
  const now = new Date()
  let targetDate = new Date(now)
  let dayOffset = 0
  
  const timeLower = timeContext.toLowerCase().trim()
  
  // Parse day context
  if (timeLower.includes('tomorrow')) {
    dayOffset = 1
    targetDate.setDate(targetDate.getDate() + 1)
  } else if (timeLower.includes('yesterday')) {
    dayOffset = -1
    targetDate.setDate(targetDate.getDate() - 1)
  } else if (timeLower.includes('weekend')) {
    const day = targetDate.getDay()
    const daysUntilSat = (6 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilSat)
  } else if (timeLower.includes('weekday')) {
    const day = targetDate.getDay()
    if (day === 0 || day === 6) {
      targetDate.setDate(targetDate.getDate() + (day === 0 ? 1 : 2))
    }
  } else if (timeLower.includes('monday')) {
    const day = targetDate.getDay()
    const daysUntilMon = (1 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilMon)
  } else if (timeLower.includes('tuesday')) {
    const day = targetDate.getDay()
    const daysUntilTue = (2 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilTue)
  } else if (timeLower.includes('wednesday')) {
    const day = targetDate.getDay()
    const daysUntilWed = (3 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilWed)
  } else if (timeLower.includes('thursday')) {
    const day = targetDate.getDay()
    const daysUntilThu = (4 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilThu)
  } else if (timeLower.includes('friday')) {
    const day = targetDate.getDay()
    const daysUntilFri = (5 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilFri)
  } else if (timeLower.includes('saturday')) {
    const day = targetDate.getDay()
    const daysUntilSat = (6 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilSat)
  } else if (timeLower.includes('sunday')) {
    const day = targetDate.getDay()
    const daysUntilSun = (0 - day + 7) % 7
    targetDate.setDate(targetDate.getDate() + daysUntilSun)
  }
  
  // Parse time of day - support "by 7pm", "by 8pm", "at 12pm", etc.
  const byTimeMatch = timeLower.match(/by\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  const atTimeMatch = timeLower.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  const timeMatch = byTimeMatch || atTimeMatch
  
  if (timeMatch) {
    let hour = parseInt(timeMatch[1])
    const minute = parseInt(timeMatch[2]) || 0
    const ampm = timeMatch[3]?.toLowerCase()
    
    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (!ampm && hour < 12 && !timeLower.includes('pm') && !timeLower.includes('am')) {
      if (timeLower.includes('morning') || timeLower.includes('am')) {
        if (hour === 12) hour = 0
      } else if (timeLower.includes('afternoon') || timeLower.includes('evening') || timeLower.includes('night') || timeLower.includes('pm')) {
        if (hour < 12) hour += 12
      }
    }
    
    targetDate.setHours(hour, minute, 0, 0)
  } else if (timeLower.includes('morning')) {
    targetDate.setHours(9, 0, 0, 0)
  } else if (timeLower.includes('afternoon')) {
    targetDate.setHours(14, 0, 0, 0)
  } else if (timeLower.includes('evening') || timeLower.includes('tonight')) {
    targetDate.setHours(19, 0, 0, 0)
  } else if (timeLower.includes('night')) {
    targetDate.setHours(23, 0, 0, 0)
  } else if (timeLower.includes('noon') || timeLower.includes('midday')) {
    targetDate.setHours(12, 0, 0, 0)
  } else if (timeLower.includes('midnight')) {
    targetDate.setHours(0, 0, 0, 0)
  } else if (timeLower.includes('sunrise')) {
    if (baseData.sunrise) {
      const sunrise = new Date(baseData.sunrise)
      targetDate.setHours(sunrise.getHours(), sunrise.getMinutes(), 0, 0)
    }
  } else if (timeLower.includes('sunset')) {
    if (baseData.sunset) {
      const sunset = new Date(baseData.sunset)
      targetDate.setHours(sunset.getHours(), sunset.getMinutes(), 0, 0)
    }
  } else if (timeLower.includes('rush hour') || timeLower.includes('commute')) {
    targetDate.setHours(8, 0, 0, 0)
  } else if (timeLower.includes('lunch')) {
    targetDate.setHours(12, 30, 0, 0)
  }
  
  // Try to find matching data in hourly forecast
  if (baseData.hourly && baseData.hourly.time) {
    const hourIndex = findClosestHourIndex(baseData.hourly.time, targetDate)
    if (hourIndex !== -1) {
      data._hourIndex = hourIndex
      data._targetDate = targetDate
      data._timeLabel = timeContext
      data._dayOffset = dayOffset
      
      if (baseData.hourly.temperature_2m?.[hourIndex] !== undefined) {
        data.temp = Math.round(baseData.hourly.temperature_2m[hourIndex])
      }
      if (baseData.hourly.precipitation_probability?.[hourIndex] !== undefined) {
        data.precipitationProb = baseData.hourly.precipitation_probability[hourIndex]
      }
      if (baseData.hourly.cloud_cover?.[hourIndex] !== undefined) {
        data.cloudCover = baseData.hourly.cloud_cover[hourIndex]
      }
      if (baseData.hourly.wind_speed_10m?.[hourIndex] !== undefined) {
        data.wind = baseData.hourly.wind_speed_10m[hourIndex]
      }
      if (baseData.hourly.relative_humidity_2m?.[hourIndex] !== undefined) {
        data.humidity = baseData.hourly.relative_humidity_2m[hourIndex]
      }
      if (baseData.hourly.weather_code?.[hourIndex] !== undefined) {
        data.conditionCode = baseData.hourly.weather_code[hourIndex]
        data.condition = mapWeatherCode(baseData.hourly.weather_code[hourIndex])
      }
      if (baseData.hourly.precipitation?.[hourIndex] !== undefined) {
        data.precipitation = baseData.hourly.precipitation[hourIndex]
      }
      if (baseData.hourly.wind_gusts_10m?.[hourIndex] !== undefined) {
        data.windGust = baseData.hourly.wind_gusts_10m[hourIndex]
      }
      if (baseData.hourly.uv_index?.[hourIndex] !== undefined) {
        data.uvIndex = baseData.hourly.uv_index[hourIndex]
      }
      if (baseData.hourly.visibility?.[hourIndex] !== undefined) {
        data.visibility = baseData.hourly.visibility[hourIndex] / 1000
      }
    }
  }
  
  if (data.conditionCode !== undefined && data.conditionCode !== null) {
    data.condition = mapWeatherCode(data.conditionCode)
  }
  
  return data
}

// ─── INTENT MAP ───────────────────────────────────────────────────────────

const INTENT_MAP = [
  {
    id: 'weather',
    name: 'Weather',
    keys: ['rain', 'storm', 'weather', 'temperature', 'hot', 'cold', 'windy', 'humid', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'tonight', 'this week', 'weekend', 'forecast', 'snow', 'cloudy', 'clear', 'will it rain', 'temperature today', 'weather forecast', 'degrees', 'celsius', 'fahrenheit', 'precipitation', 'humidity', 'wind speed'],
    fn: getWeatherAdvice,
    priority: 1,
    section: 'Weather'
  },
  {
    id: 'sports',
    name: 'Sports',
    keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog', 'tennis', 'golf', 'swim', 'hike', 'ski', 'marathon', 'safe to run', 'athlete', 'basketball', 'baseball', 'cycling', 'fitness', 'cardio', 'strength', 'physical', 'bike', 'biking', 'ride', 'mountain bike', 'road bike', 'cyclist', 'trail run', 'track', 'sprint', 'sports', 'match', 'tournament', 'practice', 'fitness'],
    fn: getSportsAdvice,
    priority: 1,
    section: 'Sports'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    keys: ['wear', 'clothes', 'outfit', 'clothing', 'dress', 'jacket', 'shirt', 'pants', 'layer', 'sweater', 'coat', 'shorts', 'sandals', 'hoodie', 'umbrella', 'raincoat', 'hat', 'gloves', 'scarf', 'what should i wear', 'dress code', 'fashion', 'style', 'formal', 'casual'],
    fn: getClothingAdvice,
    priority: 2,
    section: 'Clothing'
  },
  {
    id: 'route',
    name: 'Route',
    keys: ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'trip', 'commute', 'eta', 'travel time', 'how far', 'navigate', 'direction', 'map', 'navigation', 'road trip', 'distance between', 'travel duration', 'way', 'bike route', 'cycling route', 'path', 'trail', 'route planner'],
    fn: getRouteAdvice,
    priority: 2,
    section: 'Route'
  },
  {
    id: 'traffic',
    name: 'Traffic',
    keys: ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill', 'traffic conditions', 'is there traffic', 'traffic report', 'bumper to bumper', 'delay', 'construction traffic', 'road closure', 'car crash', 'traffic jam', 'stuck in traffic', 'rush hour', 'commute traffic'],
    fn: getTrafficAdvice,
    priority: 2,
    section: 'Traffic'
  },
  {
    id: 'driving',
    name: 'Driving',
    keys: ['drive', 'driving', 'road', 'car', 'commute', 'trip car', 'highway', 'cycling', 'bike', 'motorbike', 'motorcycle', 'bicycle', 'fog', 'black ice', 'hydroplaning', 'safe to drive', 'vehicle', 'transport', 'freeway', 'intersection', 'driving conditions', 'road conditions'],
    fn: getDrivingAdvice,
    priority: 3,
    section: 'Driving'
  },
  {
    id: 'health',
    name: 'Health',
    keys: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'headache', 'medical', 'migraine', 'arthritis', 'heart', 'diabetes', 'copd', 'breathing', 'safe to go outside', 'doctor', 'hospital', 'symptoms', 'medicine', 'condition', 'chronic', 'pain', 'injury', 'wellness', 'air quality', 'pollution', 'allergies', 'pollen', 'dust', 'smoke', 'fever', 'cough', 'sneeze'],
    fn: getHealthAdvice,
    priority: 3,
    section: 'Health'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    keys: ['lifestyle', 'mood', 'energy', 'vibe', 'feel', 'tired', 'productivity', 'motivation', 'jogging', 'walk', 'park', 'picnic', 'grill', 'bbq', 'bonfire', 'laundry', 'car wash', 'can i go', 'meditat', 'yoga', 'outdoor activity', 'leisure', 'recreation', 'fun', 'relax', 'walking', 'bike ride', 'hammock', 'read outside', 'garden', 'bird watching'],
    fn: getLifestyleAdvice,
    priority: 3,
    section: 'Lifestyle'
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    keys: ['star', 'moon', 'astro', 'planet', 'meteor', 'telescope', 'night sky', 'constellation', 'milky way', 'galaxy', 'nebula', 'iss', 'aurora', 'comet', 'eclipse', 'stargazing', 'astronomy', 'space', 'satellite', 'shooting star', 'celestial', 'observatory', 'night vision', 'astrophotography', 'deep space', 'see stars', 'clear sky', 'dark sky'],
    fn: getStargazingAdvice,
    priority: 3,
    section: 'Stargazing'
  },
  {
    id: 'farming',
    name: 'Farming',
    keys: ['farm', 'crop', 'plant', 'harvest', 'soil', 'irrigation', 'seed', 'garden', 'gardening', 'watering', 'lawn', 'fertilize', 'greenhouse', 'cow', 'chicken', 'livestock', 'poultry', 'yield', 'tractor', 'agriculture', 'orchard', 'ranch', 'cultivation', 'compost', 'mulch', 'prune', 'weed', 'pesticide', 'fertilizer'],
    fn: getFarmingAdvice,
    priority: 3,
    section: 'Farming'
  },
  {
    id: 'photography',
    name: 'Photography',
    keys: ['photo', 'camera', 'golden hour', 'shoot', 'picture', 'photography', 'lighting', 'lens', 'drone', 'portrait', 'landscape', 'macro', 'photoshoot', 'photos', 'photographer', 'composition', 'exposure', 'aperture', 'shutter speed', 'videography', 'visual', 'image', 'editing', 'sunset photo', 'sunrise photo'],
    fn: getPhotographyAdvice,
    priority: 3,
    section: 'Photography'
  },
  {
    id: 'events',
    name: 'Events',
    keys: ['event', 'party', 'wedding', 'outdoor', 'bbq', 'picnic', 'gathering', 'concert', 'festival', 'ceremony', 'celebration', 'venue', 'birthday', 'anniversary', 'corporate', 'block party', 'fair', 'reception', 'social', 'occasion', 'gala', 'fundraiser', 'conference', 'meeting'],
    fn: getEventsAdvice,
    priority: 3,
    section: 'Events'
  },
  {
    id: 'pets',
    name: 'Pets',
    keys: ['pet', 'dog', 'cat', 'walk', 'animal', 'puppy', 'kitten', 'paw', 'horse', 'bird', 'rabbit', 'chicken', 'fish pond', 'walk my dog', 'pet care', 'veterinarian', 'puppy training', 'cat care', 'dog walking', 'vet', 'animal shelter', 'wildlife', 'fish', 'hamster', 'guinea pig', 'reptile', 'snake'],
    fn: getPetsAdvice,
    priority: 3,
    section: 'Pets'
  },
  {
    id: 'diy',
    name: 'DIY',
    keys: ['diy', 'build', 'concrete', 'paint', 'construction', 'renovation', 'hammer', 'drill', 'roof', 'deck', 'stain', 'woodwork', 'masonry', 'drywall', 'paint drying', 'home repair', 'fix', 'remodel', 'contractor', 'carpentry', 'plumbing', 'electrical', 'home improvement', 'handyman', 'project', 'saw', 'screwdriver', 'wrench', 'tool', 'workshop'],
    fn: getDIYConstructionAdvice,
    priority: 3,
    section: 'DIY'
  },
  {
    id: 'energy',
    name: 'EnergyHome',
    keys: ['energy', 'power', 'solar', 'home', 'electricity', 'bill', 'ac', 'heating', 'hvac', 'dehumidifier', 'humidifier', 'thermostat', 'pipe', 'freeze', 'utility', 'electric', 'gas', 'insulation', 'efficiency', 'smart home', 'temperature control', 'climate control', 'savings', 'kwh', 'solar panel', 'inverter', 'battery', 'generator'],
    fn: getEnergyHomeAdvice,
    priority: 3,
    section: 'Energy'
  },
  {
    id: 'traveling',
    name: 'Traveling',
    keys: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport', 'tourist', 'pack', 'train', 'cruise', 'ferry', 'bus', 'road trip', 'flying', 'journey', 'traveling', 'destination', 'tourism', 'business trip', 'holiday', 'abroad', 'international', 'domestic', 'itinerary', 'layover', 'baggage', 'luggage', 'suitcase'],
    fn: getTravelingAdvice,
    priority: 3,
    section: 'Travel'
  },
  {
    id: 'skin_hair',
    name: 'SkinHair',
    keys: ['skin', 'hair', 'sunscreen', 'uv', 'sunburn', 'tan', 'spf', 'dry skin', 'frizzy', 'makeup', 'moisturize', 'acne', 'eczema', 'curl', 'frizz', 'blowout', 'beauty', 'skincare', 'hair care', 'beauty routine', 'cosmetics', 'face', 'scalp', 'complexion', 'rosacea', 'dandruff', 'oily skin', 'dry hair', 'curly hair', 'straight hair', 'shampoo', 'conditioner'],
    fn: getSkinHairAdvice,
    priority: 3,
    section: 'Beauty'
  }
]

// ─── SCORING ENGINE ──────────────────────────────────────────────────────

const scoreQuestion = (question, intent) => {
  const q = question.toLowerCase()
  let score = 0
  const matched = []

  for (const key of intent.keys) {
    const keyLower = key.toLowerCase()
    if (q.includes(keyLower)) {
      const weight = Math.min(keyLower.length / 2, 5)
      score += weight
      matched.push(keyLower)
    }
  }

  const words = q.split(/\s+/)
  for (const word of words) {
    if (word.length < 3) continue
    for (const key of intent.keys) {
      if (key.includes(word) && word.length > 2) {
        score += 0.5
      }
    }
  }

  score += (10 - intent.priority) * 0.5
  return { score, matched }
}

// ─── INTENT DETECTION ────────────────────────────────────────────────────

const detectIntents = (question) => {
  const results = []

  for (const intent of INTENT_MAP) {
    const { score, matched } = scoreQuestion(question, intent)
    if (score > CONFIG.MIN_SCORE_THRESHOLD) {
      results.push({ intent, score, matched, isPrimary: false })
    }
  }

  results.sort((a, b) => b.score - a.score)

  if (results.length > 0) {
    results[0].isPrimary = true
  }

  const primaryScore = results[0]?.score || 0
  const selected = results.filter(r => r.score > primaryScore * CONFIG.SECONDARY_THRESHOLD)
  
  return selected.slice(0, CONFIG.MAX_INTENTS)
}

// ─── SMART RESPONSE MERGER ──────────────────────────────────────────────

const mergeResponses = (responses, intents, question) => {
  if (responses.length === 0) return null
  if (responses.length === 1) return responses[0]

  const parsedSections = []

  for (let i = 0; i < responses.length; i++) {
    const text = responses[i]
    const intent = intents[i]?.intent
    const isPrimary = intents[i]?.isPrimary || false
    const lines = text.split('\n').filter(l => l.trim())

    const section = {
      header: intent?.section || 'Advice',
      isPrimary,
      score: intents[i]?.score || 0,
      contentLines: [],
      warnings: [],
      bottomLine: '',
      raw: text
    }

    let currentSection = 'content'
    let warningBuffer = []
    let bottomBuffer = []

    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.includes('WARNING') || trimmed.includes('Warning')) {
        currentSection = 'warnings'
        warningBuffer = []
        continue
      }
      
      if (trimmed.includes('BOTTOM') || trimmed.includes('Bottom') || trimmed.includes('Verdict') || trimmed.includes('Bottom Line')) {
        currentSection = 'bottom'
        bottomBuffer = []
        continue
      }

      if (trimmed.includes('---') || trimmed.includes('===')) continue

      if (currentSection === 'warnings') {
        if (trimmed && !trimmed.includes('WARNING') && !trimmed.includes('Warning') && !trimmed.includes('BOTTOM')) {
          warningBuffer.push(trimmed)
        }
      } else if (currentSection === 'bottom') {
        if (trimmed && !trimmed.includes('BOTTOM') && !trimmed.includes('Bottom') && !trimmed.includes('Verdict')) {
          bottomBuffer.push(trimmed)
        }
      } else {
        if (!trimmed.includes('WARNING') && !trimmed.includes('Warning') && 
            !trimmed.includes('BOTTOM') && !trimmed.includes('Bottom') &&
            !trimmed.includes('Verdict') &&
            trimmed.length > 2) {
          section.contentLines.push(trimmed)
        }
      }
    }

    if (warningBuffer.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if ((trimmed.includes('WARNING') || trimmed.includes('Warning')) &&
            !trimmed.includes('Warnings:') && !trimmed.includes('Warning:')) {
          warningBuffer.push(trimmed)
        }
      }
    }

    if (bottomBuffer.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if ((trimmed.includes('BOTTOM LINE') || trimmed.includes('Bottom Line') || trimmed.includes('Verdict')) &&
            !trimmed.includes('Bottom Line:')) {
          bottomBuffer.push(trimmed)
        }
      }
    }

    section.warnings = warningBuffer
    section.bottomLine = bottomBuffer.join('\n')
    parsedSections.push(section)
  }

  parsedSections.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return b.score - a.score
  })

  let merged = ''
  const primary = parsedSections.find(s => s.isPrimary) || parsedSections[0]
  const secondary = parsedSections.filter(s => !s.isPrimary)

  merged += `${primary.header}\n`
  merged += primary.contentLines.join('\n')
  
  if (primary.warnings.length > 0) {
    merged += '\n\nWarnings:\n'
    merged += primary.warnings.join('\n')
  }
  
  if (primary.bottomLine) {
    merged += '\n\nBottom Line:\n'
    merged += primary.bottomLine
  }
  merged += '\n\n'

  if (secondary.length > 0) {
    merged += 'Also consider:\n\n'
    for (const sec of secondary) {
      merged += `${sec.header}\n`
      const topLines = sec.contentLines.slice(0, CONFIG.MAX_SECONDARY_LINES)
      merged += topLines.join('\n')
      if (sec.contentLines.length > CONFIG.MAX_SECONDARY_LINES) {
        merged += `\n  ... and ${sec.contentLines.length - CONFIG.MAX_SECONDARY_LINES} more items`
      }
      merged += '\n\n'
    }
  }

  const allWarnings = []
  for (const sec of parsedSections) {
    for (const w of sec.warnings) {
      const key = w.substring(0, 30)
      if (!allWarnings.some(existing => existing.includes(key) || key.includes(existing.substring(0, 30)))) {
        allWarnings.push(w)
      }
    }
  }

  if (allWarnings.length > 0 && primary.warnings.length === 0) {
    merged += 'Warnings:\n'
    for (const w of allWarnings.slice(0, CONFIG.MAX_WARNINGS)) {
      merged += `${w}\n`
    }
    if (allWarnings.length > CONFIG.MAX_WARNINGS) {
      merged += `... and ${allWarnings.length - CONFIG.MAX_WARNINGS} more\n`
    }
    merged += '\n'
  }

  const allBottomLines = parsedSections
    .map(s => s.bottomLine)
    .filter(Boolean)
    .filter((line, index, self) => self.indexOf(line) === index)

  if (allBottomLines.length > 0) {
    const primaryBottom = parsedSections.find(s => s.isPrimary)?.bottomLine
    const bestBottom = primaryBottom || allBottomLines[0]
    merged += `Bottom Line:\n${bestBottom}\n`
  }

  return merged
}

// ─── SUGGESTIONS ENGINE ──────────────────────────────────────────────────

const getDynamicSuggestions = (savedLocations = [], userMemory = null) => {
  const base = [
    'Ask "stargazing tonight"',
    'Try "what should I wear"',
    'Ask "will it rain"',
    'Compare "today vs tomorrow"',
    'Ask "biking vs running today?"',
    'Try "drive or bike to work?"'
  ]
  
  const suggestions = [...base]
  
  if (savedLocations.length > 0) {
    const locNames = savedLocations.map(l => l.label || 'Untitled').filter(Boolean)
    if (locNames.length > 0) {
      suggestions.push(`Route to ${locNames[0]}?`)
      suggestions.push(`Traffic to ${locNames[0]}?`)
      suggestions.push(`Weather in ${locNames[0]} tomorrow?`)
    }
    if (locNames.length > 1) {
      suggestions.push(`Compare ${locNames[0]} and ${locNames[1]} weather?`)
    }
  }
  
  const cityNames = Object.keys(CITY_DATABASE).slice(0, 3)
  if (cityNames.length > 0) {
    const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)]
    suggestions.push(`Weather in ${randomCity} this weekend?`)
  }
  
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 9) {
    suggestions.push('Morning commute conditions?')
    suggestions.push('What to wear today?')
  } else if (hour >= 11 && hour < 14) {
    suggestions.push('Lunch time walk weather?')
  } else if (hour >= 17 && hour < 20) {
    suggestions.push('Evening driving conditions?')
    suggestions.push('Stargazing tonight?')
  }
  
  if (userMemory && userMemory.frequentQuestions) {
    const topIntents = Object.entries(userMemory.preferredIntents || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([intent]) => intent)
    
    const activityMap = {
      'sports': ['run', 'bike', 'exercise'],
      'stargazing': ['stars', 'moon', 'astronomy'],
      'driving': ['drive', 'commute', 'road'],
      'farming': ['garden', 'crops', 'plants'],
      'weather': ['rain', 'temperature', 'forecast'],
      'clothing': ['wear', 'outfit', 'jacket'],
      'pets': ['walk my dog', 'pet', 'dog']
    }
    
    for (const intent of topIntents) {
      const activities = activityMap[intent] || ['check']
      if (activities.length > 0) {
        suggestions.push(`${activities[0]} tomorrow?`)
      }
    }
  }
  
  return [...new Set(suggestions)].slice(0, 10)
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────

export default function ZephyeFullScreen({
  isOpen,
  onClose,
  weather,
  location,
  todayStats,
  aqi,
  userName,
  lang = 'en',
  greeting,
  voiceToUse
}) {
  const { playGlobal, stopGlobal, isSpeaking } = useAudio()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [ghostText, setGhostText] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [moonPhase, setMoonPhase] = useState(0)
  const [activeTab, setActiveTab] = useState('ask')
  const [savedLocations, setSavedLocations] = useState([])
  const [currentLocationContext, setCurrentLocationContext] = useState(null)
  const [userMemory, setUserMemory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zephye_memory')) || {
        frequentQuestions: [],
        preferredIntents: {},
        lastContexts: [],
        learnedPatterns: {},
        interactionCount: 0,
        firstVisit: new Date().toISOString()
      }
    } catch { 
      return { 
        frequentQuestions: [], 
        preferredIntents: {}, 
        lastContexts: [], 
        learnedPatterns: {},
        interactionCount: 0,
        firstVisit: new Date().toISOString()
      } 
    }
  })

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const ghostIntervalRef = useRef(null)

  // ─── Weather Data ──────────────────────────────────────────────────────

  const weatherData = useMemo(() => ({
    temp: Math.round(weather?.current?.temperature_2m || 0),
    feelsLike: Math.round(weather?.current?.apparent_temperature || weather?.current?.temperature_2m || 0),
    humidity: weather?.current?.relative_humidity_2m || 0,
    wind: weather?.current?.wind_speed_10m || 0,
    windDir: weather?.current?.wind_direction_10m || 0,
    windGust: weather?.current?.wind_gusts_10m || weather?.hourly?.wind_gusts_10m?.[0] || 0,
    uvIndex: weather?.current?.uv_index || weather?.daily?.uv_index_max?.[0] || 0,
    aqi: aqi?.us_aqi || 0,
    visibility: weather?.current?.visibility ? weather.current.visibility / 1000 : 10,
    conditionCode: weather?.current?.weather_code || 0,
    condition: mapWeatherCode(weather?.current?.weather_code || 0),
    pressure: weather?.current?.pressure_msl || 0,
    precipitation: weather?.current?.precipitation || 0,
    precipitationProb: weather?.hourly?.precipitation_probability?.[0] || 0,
    cloudCover: weather?.current?.cloud_cover || weather?.hourly?.cloud_cover?.[0] || 0,
    dewPoint: weather?.current?.dew_point || weather?.hourly?.dew_point?.[0] || 0,
    solarRadiation: weather?.current?.shortwave_radiation || 0,
    tempMax: weather?.daily?.temperature_2m_max?.[0] || 0,
    tempMin: weather?.daily?.temperature_2m_min?.[0] || 0,
    sunrise: weather?.daily?.sunrise?.[0] || '',
    sunset: weather?.daily?.sunset?.[0] || '',
    city: location?.name || 'Unknown',
    lat: location?.lat || 0,
    lon: location?.lon || 0,
    moonPhase: moonPhase,
    season: ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'][new Date().getMonth()],
    timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
    hourly: weather?.hourly || {},
    daily: weather?.daily || {},
    savedLocations: savedLocations,
    homeLat: location?.lat,
    homeLon: location?.lon,
    homeName: location?.name,
    isExternalLocation: false
  }), [weather, aqi, location, moonPhase, savedLocations])

  const aqiLevel = useMemo(() => {
    if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
    if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
    if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316' }
    if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444' }
    return { label: 'Hazardous', color: '#dc2626' }
  }, [aqi])

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setSavedLocations(getSavedLocations())
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && location?.lat && location?.lon) {
      getMoonPhase(location.lat, location.lon).then(setMoonPhase)
    }
  }, [isOpen, location])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const condition = mapWeatherCode(weatherData.conditionCode)
      setMessages([
        {
          role: 'assistant',
          content: `${greeting || 'Hello'}, ${userName || location?.name?.split(',')[0] || 'there'}\n${location?.name || 'Your location'}\n${weatherData.temp}°C • ${condition} • AQI ${aqiLevel.label}`
        }
      ])
    }
  }, [isOpen, messages.length, greeting, userName, location, weatherData, aqiLevel])

  useEffect(() => {
    if (input) {
      setGhostText('')
      return
    }
    
    const suggestions = getDynamicSuggestions(savedLocations, userMemory)
    let i = 0
    setGhostText(suggestions[0])
    
    ghostIntervalRef.current = setInterval(() => {
      i = (i + 1) % suggestions.length
      setGhostText(suggestions[i])
    }, 3000)
    
    return () => {
      if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current)
    }
  }, [input, savedLocations, userMemory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // ─── Learn from interactions ──────────────────────────────────────────

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages.length > 1) {
      const lastQuestion = messages[messages.length - 2]?.content || ''
      const lastAnswer = messages[messages.length - 1]?.content || ''
      
      if (lastQuestion && lastAnswer && !lastAnswer.includes('Error')) {
        const detected = detectIntents(lastQuestion)
        if (detected.length > 0) {
          const intentId = detected[0].intent.id
          const updatedMemory = {
            ...userMemory,
            frequentQuestions: [...userMemory.frequentQuestions.slice(-CONFIG.MAX_HISTORY), lastQuestion],
            preferredIntents: {
              ...userMemory.preferredIntents,
              [intentId]: (userMemory.preferredIntents[intentId] || 0) + 1
            },
            lastContexts: [...userMemory.lastContexts.slice(-5), {
              intent: intentId,
              time: new Date().toISOString(),
              weather: weatherData.condition,
              temp: weatherData.temp,
              location: weatherData.city
            }],
            interactionCount: userMemory.interactionCount + 1
          }
          
          setUserMemory(updatedMemory)
          localStorage.setItem('zephye_memory', JSON.stringify(updatedMemory))
        }
      }
    }
  }, [messages, weatherData])

  // ─── Quick Actions ────────────────────────────────────────────────────

  const quickActionChips = useMemo(() => {
    const chips = [
      'Will it rain tomorrow?',
      'What should I wear?',
      'Stargazing tonight?',
      'Safe to drive?',
      'Traffic incidents near me?',
      'Can I go biking?',
      'Compare today vs tomorrow',
      'Biking vs running today?',
      'Walk my dog at 7pm?'
    ]

    const locs = savedLocations.slice(0, 2)
    if (locs.length > 0) {
      chips.push(`Route to ${locs[0].label || 'saved location'}?`)
      chips.push(`Traffic to ${locs[0].label || 'saved location'}?`)
      chips.push(`Weather in ${locs[0].label || 'saved location'} tomorrow?`)
    }
    if (locs.length > 1) {
      chips.push(`Compare ${locs[0].label} and ${locs[1].label} weather?`)
    }
    
    const cityNames = Object.keys(CITY_DATABASE).slice(0, 3)
    for (const city of cityNames) {
      chips.push(`Weather in ${city} this weekend?`)
    }

    return chips.slice(0, 12)
  }, [savedLocations])

  // ─── Speaking ─────────────────────────────────────────────────────────

  const speakText = useCallback(async (text) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }
    try {
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/#/g, '')
        .replace(/•/g, '')
        .replace(/\n/g, '. ')
        .replace(/\s+/g, ' ')
        .trim()
      
      const res = await fetch(CONFIG.TTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice: voiceToUse, type: 'fair' })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`https://hyezen.onrender.com${data.url}`, voiceToUse)
      }
    } catch {
      // Silent fail
    }
  }, [isSpeaking, stopGlobal, playGlobal, voiceToUse])

  const copyText = useCallback((text) => {
    navigator.clipboard.writeText(text)
  }, [])

  // ─── Voice Recognition ───────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) return
    const recognition = new webkitSpeechRecognition()
    recognition.lang = lang
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      setInput(text)
      handleAsk(text)
    }
    recognitionRef.current = recognition
    recognition.start()
  }, [lang])

  // ─── ENHANCED ROUTE QUESTION ──────────────────────────────────────────

  const routeQuestion = useCallback(async (question) => {
    const q = question.toLowerCase()
    
    // ─── DETECT LOCATIONS ────────────────────────────────────────────────
    const detectedLocations = detectLocationNames(question)
    let locationData = { ...weatherData }
    let isExternalLocation = false
    let locationDisplayName = null
    
    if (detectedLocations.length > 0) {
      const primaryLocation = detectedLocations[0]
      
      const isDifferentLocation = 
        primaryLocation.lat !== weatherData.lat || 
        primaryLocation.lon !== weatherData.lon
        
      if (isDifferentLocation && primaryLocation.lat && primaryLocation.lon) {
        const fetchedWeather = await fetchWeatherWithCache(primaryLocation.lat, primaryLocation.lon)
        if (fetchedWeather) {
          locationData = {
            ...weatherData,
            ...fetchedWeather,
            city: primaryLocation.displayName || primaryLocation.name,
            lat: primaryLocation.lat,
            lon: primaryLocation.lon,
            isExternalLocation: true,
            _locationName: primaryLocation.displayName || primaryLocation.name
          }
          isExternalLocation = true
          locationDisplayName = primaryLocation.displayName || primaryLocation.name
        }
      } else if (primaryLocation.isHome) {
        locationData = { ...weatherData, isExternalLocation: false }
        locationDisplayName = weatherData.city || 'Your location'
      }
    }
    
    // ─── EXTRACT TIME CONTEXT ─────────────────────────────────────────────
    let timeContext = ''
    
    // Check for "by" time patterns
    const byMatch = q.match(/by\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (byMatch) {
      let hour = parseInt(byMatch[1])
      const minute = parseInt(byMatch[2]) || 0
      const ampm = byMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      timeContext = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
    
    // Check for "at" time patterns
    const atMatch = q.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (atMatch && !timeContext) {
      let hour = parseInt(atMatch[1])
      const minute = parseInt(atMatch[2]) || 0
      const ampm = atMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      timeContext = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
    
    if (q.includes('morning') && !timeContext) timeContext = 'morning'
    if (q.includes('afternoon') && !timeContext) timeContext = 'afternoon'
    if (q.includes('evening') || q.includes('tonight')) timeContext = 'evening'
    if (q.includes('night')) timeContext = 'night'
    if (q.includes('noon') || q.includes('midday')) timeContext = 'noon'
    if (q.includes('midnight')) timeContext = 'midnight'
    if (q.includes('sunrise')) timeContext = 'sunrise'
    if (q.includes('sunset')) timeContext = 'sunset'
    if (q.includes('rush hour') || q.includes('commute')) timeContext = 'rush hour'
    if (q.includes('lunch')) timeContext = 'lunch'
    if (q.includes('tomorrow')) timeContext = 'tomorrow'
    if (q.includes('weekend')) timeContext = 'weekend'
    
    // Apply time shift if we have a time context
    if (timeContext) {
      locationData = getTimeShiftedData(locationData, timeContext, question)
    }
    
    // ─── DETECT INTENTS ──────────────────────────────────────────────────
    const detectedIntents = detectIntents(q)
    
    // ─── HANDLE MULTI-INTENT QUESTIONS ──────────────────────────────────
    if (detectedIntents.length >= 2) {
      const results = []
      
      for (const detected of detectedIntents) {
        try {
          const isAsync = ['farming', 'stargazing', 'route', 'traffic'].includes(detected.intent.id)
          const response = isAsync 
            ? await detected.intent.fn(locationData, question)
            : detected.intent.fn(locationData, question)
          results.push({ response, detected })
        } catch (e) {
          console.error(`Error in ${detected.intent.name}:`, e)
        }
      }
      
      const responses = results.map(r => r.response)
      const intents = results.map(r => r.detected)
      
      if (responses.length === 0) {
        const response = await getWeatherAdvice(locationData, question)
        return response
      }
      
      const merged = mergeResponses(responses, intents, question)
      
      // Add location context if external
      if (isExternalLocation && locationDisplayName) {
        return `Location: ${locationDisplayName}\n\n${merged}`
      }
      
      return merged || responses[0]
    }
    
    // ─── SINGLE INTENT FLOW ──────────────────────────────────────────────
    if (detectedIntents.length > 0) {
      const primaryIntent = detectedIntents[0].intent
      
      try {
        const isAsync = ['farming', 'stargazing', 'route', 'traffic'].includes(primaryIntent.id)
        const response = isAsync 
          ? await primaryIntent.fn(locationData, question)
          : primaryIntent.fn(locationData, question)
        
        // Add location context if external
        if (isExternalLocation && locationDisplayName) {
          return `Location: ${locationDisplayName}\n\n${response}`
        }
        
        return response
      } catch (e) {
        console.error(`Error in ${primaryIntent.name}:`, e)
        const fallbackResponse = await getWeatherAdvice(locationData, question)
        return fallbackResponse
      }
    }
    
    // ─── NO INTENT DETECTED ──────────────────────────────────────────────
    // Try route/traffic detection
    const routeKeywords = ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'eta', 'travel time', 'how far', 'navigate', 'commute']
    const trafficKeywords = ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill']

    const hasRoute = routeKeywords.some(k => q.includes(k))
    const hasTraffic = trafficKeywords.some(k => q.includes(k))

    if (hasRoute || hasTraffic) {
      try {
        const response = hasRoute 
          ? await getRouteAdvice(locationData, question, { savedLocations })
          : await getTrafficAdvice(locationData, question)
        
        if (isExternalLocation && locationDisplayName) {
          return `Location: ${locationDisplayName}\n\n${response}`
        }
        return response
      } catch (e) {
        // Fall through to weather
      }
    }
    
    // ─── FALLBACK: WEATHER ──────────────────────────────────────────────
    if (q.match(/rain|storm|cloud|sun|wind|humid|cold|hot|weather|tomorrow|today|forecast|weekend|temperature|degree/)) {
      const response = await getWeatherAdvice(locationData, question)
      if (isExternalLocation && locationDisplayName) {
        return `Location: ${locationDisplayName}\n\n${response}`
      }
      return response
    }
    
    // ─── FINAL FALLBACK ──────────────────────────────────────────────────
    const locationPrefix = isExternalLocation ? `Location: ${locationDisplayName}\n\n` : ''
    return `${locationPrefix}I'm not sure what you're asking. Try asking about weather, clothing, routes, traffic, sports, farming, stargazing, health, pets, DIY, photography, events, energy, lifestyle, skin/hair, or travel. Current temp is ${locationData.temp}°C with ${locationData.condition}.`
    
  }, [weatherData, savedLocations])

  // ─── Handle Ask ──────────────────────────────────────────────────────

  const handleAsk = useCallback(async (question) => {
    if (!question.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setIsLoading(true)
    setStreamingText('')

    try {
      const answer = await routeQuestion(question)

      let text = ''
      for (const word of answer.split(' ')) {
        text += word + ' '
        setStreamingText(text)
        await new Promise(r => setTimeout(r, CONFIG.STREAM_DELAY_MS))
      }

      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
      setStreamingText('')

      if (voiceToUse) speakText(answer)

    } catch (e) {
      const fallback = `Error getting advice. Current temp is ${weatherData.temp}°C with ${weatherData.condition}.`
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setIsLoading(false)
    }
  }, [routeQuestion, weatherData, voiceToUse, speakText])

  // ─── Render ──────────────────────────────────────────────────────────

  if (!isOpen) return null

  if (!weather) {
    return (
      <div className="ai-fullscreen">
        <div className="ai-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-muted">Loading weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-fullscreen">
      {/* HEADER */}
      <div className="ai-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 10px' }}>
            ←
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {currentLocationContext ? `📍 ${currentLocationContext.name}` : `📍 ${location?.name?.split(',')[0] || 'City'}`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="capsule-switch">
            <button
              className={`capsule-option ${activeTab === 'ask' ? 'active' : ''}`}
              onClick={() => setActiveTab('ask')}
            >
              Ask Zephye
            </button>
            <button className="capsule-option pro" onClick={() => {}} title="Pro — coming soon">
              Pro 🔒
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="weather-badge">
            <span>{location?.name?.split(',')[0] || 'City'}</span>
            <span>{weatherData.temp}°C</span>
            <span className="aqi-badge" style={{ color: aqiLevel.color }}>{aqiLevel.label}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          padding: '10px 16px', 
          overflowX: 'auto',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {quickActionChips.slice(0, 10).map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.12)'
                e.target.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.06)'
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* BODY */}
      <div className="ai-body">
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', marginBottom: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="msg-actions-top">
                    <button className="speak-btn" onClick={() => speakText(msg.content)} title={isSpeaking ? 'Stop' : 'Speak'}>
                      {isSpeaking ? '⏹' : '🔊'}
                    </button>
                    <button className="speak-btn" onClick={() => copyText(msg.content)} title="Copy">
                      📋
                    </button>
                  </div>
                )}
                <div className="msg-content">{msg.content}</div>
              </div>
            </div>
          ))}

          {streamingText && (
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div className="chat-bubble ai">{streamingText}▋</div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div className="chat-bubble ai text-muted">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="ai-input-wrap">
        <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="input-wrapper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
              placeholder={ghostText || "Ask Zephye..."}
              disabled={isLoading}
            />
            <button className="mic-btn" onClick={startListening} title="Voice input">
              🎤
            </button>
          </div>
          <button
            onClick={() => handleAsk(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        .capsule-switch {
          display: flex;
          background: rgba(255,255,255,0.06);
          border-radius: 40px;
          padding: 3px;
          border: 1px solid var(--glass-border);
        }
        .capsule-option {
          padding: 5px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: 0.2s;
          letter-spacing: -0.2px;
        }
        .capsule-option.active {
          background: var(--accent);
          color: var(--bg-deep);
          box-shadow: 0 2px 8px rgba(56,189,248,0.25);
        }
        .capsule-option.pro {
          opacity: 0.5;
          cursor: default;
        }

        .weather-badge {
          background: rgba(255,255,255,0.06);
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--glass-border);
          white-space: nowrap;
        }
        .aqi-badge {
          background: rgba(255,255,255,0.1);
          padding: 0 8px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 600;
        }

        .input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.06);
          border-radius: 40px;
          padding: 2px 2px 2px 18px;
          border: 1.5px solid var(--glass-border);
          transition: 0.2s;
        }
        .input-wrapper:focus-within {
          border-color: var(--accent);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        .input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 11px 4px 11px 0;
          font-size: 14px;
          outline: none;
          color: var(--text);
        }
        .input-wrapper input::placeholder {
          color: var(--text-muted);
        }
        .input-wrapper .mic-btn {
          background: transparent;
          border: none;
          font-size: 20px;
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          border-radius: 30px;
          transition: 0.2s;
          color: var(--text-muted);
        }
        .input-wrapper .mic-btn:hover {
          color: var(--accent);
          background: rgba(56,189,248,0.12);
        }

        .msg-actions-top {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .chat-bubble:hover .msg-actions-top {
          opacity: 1;
        }
        .speak-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
        }
        .speak-btn:hover {
          background: rgba(255,255,255,0.12);
        }
        .msg-content {
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}
