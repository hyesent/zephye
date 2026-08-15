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

import { 
  detectLanguageFromText, 
  translateText, 
  getVoiceForDetectedLanguage,
  LANGUAGE_NAMES,
  getVoiceForLocation
} from './zephyeHelpers'

// ─── SVG ICONS ──────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const SpeakIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
)

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="12" cy="19" r="1.5"/>
  </svg>
)

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

// ─── CONFIG ────────────────────────────────────────────────────────────────

const CONFIG = {
  MAX_SUGGESTIONS: 8,
  STREAM_DELAY_MS: 12,
  MAX_INTENTS: 3,
  MIN_SCORE_THRESHOLD: 1.5,
  SECONDARY_THRESHOLD: 0.35,
  MAX_SECONDARY_LINES: 4,
  MAX_WARNINGS: 8,
  TTS_API: 'https://hyezen.onrender.com/api/tts',
  SUGGESTION_ROTATION_INTERVAL: 10000 // 10 seconds
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
      sunset: om.daily?.sunset?.[0] ?? '',
      dewPoint: om.hourly?.dew_point?.[0] ?? 0,
      lat,
      lon
    }
  } catch {
    return null
  }
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
  
  if (timeLower.includes('morning')) {
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
  
  if (data._hourIndex === undefined && dayOffset !== 0) {
    if (baseData.daily) {
      const dayIndex = dayOffset > 0 ? dayOffset : 0
      if (baseData.daily.temperature_2m_max?.[dayIndex] !== undefined) {
        data.temp = Math.round(baseData.daily.temperature_2m_max[dayIndex])
      }
      if (baseData.daily.weather_code?.[dayIndex] !== undefined) {
        data.conditionCode = baseData.daily.weather_code[dayIndex]
        data.condition = mapWeatherCode(baseData.daily.weather_code[dayIndex])
      }
      if (baseData.daily.precipitation_probability_max?.[dayIndex] !== undefined) {
        data.precipitationProb = baseData.daily.precipitation_probability_max[dayIndex]
      }
      if (baseData.daily.cloud_cover?.[dayIndex] !== undefined) {
        data.cloudCover = baseData.daily.cloud_cover[dayIndex]
      }
    }
  }
  
  if (data._hourIndex === undefined && data._dayOffset === undefined) {
    const hour = targetDate.getHours()
    if (hour >= 6 && hour < 12) {
      data.temp = (data.temp || 0) - 2
      data.cloudCover = data.cloudCover || 20
    } else if (hour >= 12 && hour < 17) {
      data.temp = (data.temp || 0) + 2
      data.cloudCover = data.cloudCover || 10
    } else if (hour >= 17 && hour < 21) {
      data.temp = (data.temp || 0) - 1
      data.cloudCover = data.cloudCover || 30
    } else {
      data.temp = (data.temp || 0) - 4
      data.cloudCover = data.cloudCover || 40
    }
  }
  
  if (data.conditionCode !== undefined && data.conditionCode !== null) {
    data.condition = mapWeatherCode(data.conditionCode)
  }
  
  return data
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SAMPLE QUESTIONS FROM ALL FILES ──────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

import { sampleQuestions as weatherQuestions } from './data/BasicWeatherAdvice.js'
import { sampleQuestions as clothingQuestions } from './data/ClothingAdvice.js'
import { sampleQuestions as lifestyleQuestions } from './data/Lifestyle.js'
import { sampleQuestions as skinHairQuestions } from './data/SkinHair.js'
import { sampleQuestions as drivingQuestions } from './data/Driving.js'
import { sampleQuestions as travelingQuestions } from './data/Traveling.js'
import { sampleQuestions as farmingQuestions } from './data/Farming.js'
import { sampleQuestions as stargazingQuestions } from './data/Stargazing.js'
import { sampleQuestions as photographyQuestions } from './data/Photography.js'
import { sampleQuestions as eventsQuestions } from './data/Events.js'
import { sampleQuestions as sportsQuestions } from './data/Sports.js'
import { sampleQuestions as healthQuestions } from './data/Health.js'
import { sampleQuestions as diyQuestions } from './data/DIYconstruction.js'
import { sampleQuestions as petsQuestions } from './data/Pets.js'
import { sampleQuestions as energyQuestions } from './data/EnergyHome.js'
import { sampleQuestions as trafficQuestions } from './data/TrafficAdvice.js'
import { sampleQuestions as routeQuestions } from './data/RouteAdvice.js'

const ALL_SAMPLE_QUESTIONS = [
  ...weatherQuestions,
  ...clothingQuestions,
  ...lifestyleQuestions,
  ...skinHairQuestions,
  ...drivingQuestions,
  ...travelingQuestions,
  ...farmingQuestions,
  ...stargazingQuestions,
  ...photographyQuestions,
  ...eventsQuestions,
  ...sportsQuestions,
  ...healthQuestions,
  ...diyQuestions,
  ...petsQuestions,
  ...energyQuestions,
  ...trafficQuestions,
  ...routeQuestions
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── INTENT MAP ──────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
    keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog', 'tennis', 'golf', 'swim', 'hike', 'ski', 'marathon', 'safe to run', 'athlete', 'basketball', 'baseball', 'cycling', 'fitness', 'cardio', 'strength', 'physical', 'bike', 'biking', 'ride', 'mountain bike', 'road bike', 'peloton', 'spin', 'cyclist', 'trail run', 'track', 'sprint', 'workout', 'exercise', 'sports', 'game', 'match', 'tournament', 'practice', 'training', 'fitness'],
    fn: getSportsAdvice,
    priority: 1,
    section: 'Sports'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    keys: ['wear', 'clothes', 'outfit', 'clothing', 'dress', 'jacket', 'shirt', 'pants', 'layer', 'sweater', 'coat', 'shorts', 'sandals', 'hoodie', 'umbrella', 'raincoat', 'hat', 'gloves', 'scarf', 'what should i wear', 'dress code', 'fashion', 'style', 'formal', 'casual', 'sweatshirt', 't-shirt', 'sweatpants', 'leggings', 'athletic wear', 'running shoes', 'cycling kit'],
    fn: getClothingAdvice,
    priority: 2,
    section: 'Clothing'
  },
  {
    id: 'route',
    name: 'Route',
    keys: ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'trip', 'commute', 'eta', 'travel time', 'how far', 'navigate', 'direction', 'map', 'navigation', 'road trip', 'distance between', 'travel duration', 'way', 'bike route', 'cycling route', 'path', 'trail', 'route planner', 'shortest route', 'fastest route', 'scenic route'],
    fn: getRouteAdvice,
    priority: 2,
    section: 'Route'
  },
  {
    id: 'traffic',
    name: 'Traffic',
    keys: ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill', 'traffic conditions', 'is there traffic', 'traffic report', 'bumper to bumper', 'delay', 'construction traffic', 'road closure', 'car crash', 'bike lane blocked', 'cycle lane', 'traffic jam', 'stuck in traffic', 'rush hour', 'commute traffic'],
    fn: getTrafficAdvice,
    priority: 2,
    section: 'Traffic'
  },
  {
    id: 'driving',
    name: 'Driving',
    keys: ['drive', 'driving', 'road', 'car', 'commute', 'trip car', 'highway', 'cycling', 'bike', 'motorbike', 'motorcycle', 'bicycle', 'fog', 'black ice', 'hydroplaning', 'safe to drive', 'vehicle', 'transport', 'freeway', 'intersection', 'road bike', 'bike on road', 'cycle lane', 'driving conditions', 'road conditions', 'pavement', 'roads'],
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
    keys: ['lifestyle', 'mood', 'energy', 'vibe', 'feel', 'tired', 'productivity', 'motivation', 'jogging', 'walk', 'park', 'picnic', 'grill', 'bbq', 'bonfire', 'laundry', 'car wash', 'can i go', 'meditat', 'yoga', 'outdoor activity', 'leisure', 'recreation', 'fun', 'relax', 'exercise light', 'walking', 'bike ride', 'casual ride', 'leisure bike', 'hammock', 'read outside', 'garden', 'bird watching'],
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
    keys: ['photo', 'camera', 'golden hour', 'shoot', 'picture', 'photography', 'lighting', 'lens', 'drone', 'portrait', 'landscape', 'macro', 'photoshoot', 'photos', 'photographer', 'composition', 'exposure', 'aperture', 'shutter speed', 'videography', 'visual', 'image', 'RAW', 'lightroom', 'photoshop', 'editing', 'sunset photo', 'sunrise photo'],
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
      if (keyLower.length > 8 && q.split(/\s+/).some(w => w === keyLower)) {
        score += 3
      }
    }
  }

  const words = q.split(/\s+/)
  for (const word of words) {
    if (word.length < 3) continue
    for (const key of intent.keys) {
      if (key.includes(word) && word.length > 2) {
        score += 1
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
    merged += `Also consider:\n\n`
    for (const sec of secondary) {
      merged += `${sec.header}\n`
      
      const isRoute = sec.header === 'Route'
      const maxLines = isRoute ? 999 : CONFIG.MAX_SECONDARY_LINES
      
      const topLines = sec.contentLines.slice(0, maxLines)
      merged += topLines.join('\n')
      
      if (!isRoute && sec.contentLines.length > CONFIG.MAX_SECONDARY_LINES) {
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
    merged += `Warnings:\n`
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

// ─── SMART VERDICT GENERATOR ──────────────────────────────────────────

const generateVerdict = (question, data, intent) => {
  const q = question.toLowerCase()
  let verdict = ''
  let confidence = 85
  
  const isYesNo = q.match(/^(will|is|are|can|do|does|should|would|could|did|have|has|was|were|am|may|might|shall|must|need to|got to|able to|going to)/i)
  
  if (!isYesNo) {
    return null
  }
  
  const intentId = intent?.id || 'weather'
  
  switch (intentId) {
    case 'stargazing': {
      const cloudCover = data.cloudCover || 0
      const moonIllumination = data.moonPhase ? Math.round(getMoonIllumination(data.moonPhase) * 100) : 0
      const seeing = data.seeing || 5
      
      if (cloudCover > 70) {
        verdict = 'NO'
        confidence = 90
      } else if (cloudCover > 40) {
        verdict = 'MIGHT'
        confidence = 60
      } else if (moonIllumination > 80) {
        verdict = 'MIGHT'
        confidence = 65
      } else if (seeing <= 3 && cloudCover < 20 && moonIllumination < 30) {
        verdict = 'YES'
        confidence = 95
      } else if (cloudCover < 30 && moonIllumination < 50) {
        verdict = 'YES'
        confidence = 80
      } else {
        verdict = 'MIGHT'
        confidence = 55
      }
      break
    }
    
    case 'weather': {
      const rainChance = data.precipitationProb || 0
      const temp = data.temp || 0
      
      if (q.includes('rain') || q.includes('storm')) {
        if (rainChance > 70) {
          verdict = 'YES'
          confidence = 90
        } else if (rainChance > 40) {
          verdict = 'MIGHT'
          confidence = 60
        } else {
          verdict = 'NO'
          confidence = 85
        }
      } else if (q.includes('hot') || q.includes('warm')) {
        if (temp > 28) {
          verdict = 'YES'
          confidence = 90
        } else if (temp > 22) {
          verdict = 'MIGHT'
          confidence = 60
        } else {
          verdict = 'NO'
          confidence = 85
        }
      } else if (q.includes('cold')) {
        if (temp < 10) {
          verdict = 'YES'
          confidence = 90
        } else if (temp < 18) {
          verdict = 'MIGHT'
          confidence = 60
        } else {
          verdict = 'NO'
          confidence = 85
        }
      } else if (q.includes('clear') || q.includes('sunny')) {
        if (data.cloudCover < 30) {
          verdict = 'YES'
          confidence = 90
        } else if (data.cloudCover < 60) {
          verdict = 'MIGHT'
          confidence = 60
        } else {
          verdict = 'NO'
          confidence = 85
        }
      }
      break
    }
    
    case 'sports': {
      const rainChance = data.precipitationProb || 0
      const temp = data.temp || 0
      const wind = data.wind || 0
      
      if (q.includes('run') || q.includes('jog') || q.includes('bike') || q.includes('cycle')) {
        if (temp > 35 || temp < -5) {
          verdict = 'NO'
          confidence = 90
        } else if (rainChance > 60 || wind > 40) {
          verdict = 'NO'
          confidence = 85
        } else if (rainChance > 30 || wind > 25 || temp > 30 || temp < 5) {
          verdict = 'MIGHT'
          confidence = 55
        } else {
          verdict = 'YES'
          confidence = 90
        }
      }
      break
    }
    
    case 'driving': {
      const rainChance = data.precipitationProb || 0
      const visibility = data.visibility || 10
      const wind = data.wind || 0
      const condition = data.condition || ''
      
      if (condition === 'thunderstorm' || condition === 'snow') {
        verdict = 'NO'
        confidence = 95
      } else if (rainChance > 70 || visibility < 2 || wind > 50) {
        verdict = 'NO'
        confidence = 85
      } else if (rainChance > 40 || visibility < 5 || wind > 30) {
        verdict = 'MIGHT'
        confidence = 60
      } else {
        verdict = 'YES'
        confidence = 90
      }
      break
    }
    
    case 'traffic': {
      const hour = new Date().getHours()
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)
      const isWeekend = [0, 6].includes(new Date().getDay())
      
      if (isRushHour && !isWeekend) {
        verdict = 'YES'
        confidence = 80
      } else if ((isRushHour && isWeekend) || (hour >= 12 && hour <= 13)) {
        verdict = 'MIGHT'
        confidence = 55
      } else {
        verdict = 'NO'
        confidence = 75
      }
      break
    }
    
    case 'clothing': {
      const temp = data.temp || 0
      const rainChance = data.precipitationProb || 0
      
      if (q.includes('jacket') || q.includes('coat')) {
        if (temp < 10) {
          verdict = 'YES'
          confidence = 90
        } else if (temp < 18) {
          verdict = 'MIGHT'
          confidence = 60
        } else {
          verdict = 'NO'
          confidence = 85
        }
      } else if (q.includes('umbrella') || q.includes('raincoat')) {
        if (rainChance > 60) {
          verdict = 'YES'
          confidence = 90
        } else if (rainChance > 30) {
          verdict = 'MIGHT'
          confidence = 60
        } else {
          verdict = 'NO'
          confidence = 85
        }
      }
      break
    }
    
    default: {
      const rainChance = data.precipitationProb || 0
      if (rainChance > 60) {
        verdict = 'MIGHT'
        confidence = 55
      } else {
        verdict = 'YES'
        confidence = 70
      }
    }
  }
  
  if (!verdict) {
    verdict = 'MIGHT'
    confidence = 50
  }
  
  let confidenceLabel = ''
  if (confidence >= 90) confidenceLabel = ' (high confidence)'
  else if (confidence >= 70) confidenceLabel = ' (moderate confidence)'
  else if (confidence >= 50) confidenceLabel = ' (low confidence)'
  
  return `${verdict}${confidenceLabel}`
}

// ─── COMPARISON DETECTION ──────────────────────────────────────────────

const detectComparison = (question) => {
  const q = question.toLowerCase()
  
  const timeWords = [
    'today', 'tomorrow', 'now', 'later', 
    'evening', 'morning', 'afternoon', 'night', 'tonight',
    'weekend', 'weekday', 'monday', 'tuesday', 
    'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'this morning', 'this afternoon', 'this evening',
    '6 PM', '7 PM', '8 PM', '9 PM', '10 PM',
    '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    'noon', 'midnight', 'sunrise', 'sunset',
    'rush hour', 'commute time', 'lunch time'
  ]
  
  const savedLocs = getSavedLocations()
  const locationWords = savedLocs.map(l => l.label?.toLowerCase()).filter(Boolean)
  
  const activityWords = ['run', 'bike', 'drive', 'walk', 'cycle', 'jog', 'hike', 'swim', 'sport', 'gym']
  const compareWords = ['vs', 'versus', 'compare', 'difference', 'or', 'vs.', 'and', 'better', 'best', 'rather']
  
  const hasCompare = compareWords.some(w => q.includes(w))
  
  const foundTimes = timeWords.filter(w => q.includes(w))
  if (hasCompare && foundTimes.length >= 3) {
    return {
      type: 'multi_time',
      times: foundTimes,
      count: foundTimes.length
    }
  }
  
  const foundLocations = locationWords.filter(w => q.includes(w))
  if (hasCompare && foundLocations.length >= 2) {
    return {
      type: 'location',
      locations: foundLocations,
      count: foundLocations.length
    }
  }
  
  const foundActivities = activityWords.filter(w => q.includes(w))
  if (hasCompare && foundActivities.length >= 2) {
    if (q.includes('vs') || q.includes('or') || q.includes('versus') || q.includes('rather')) {
      return {
        type: 'activity',
        activities: foundActivities,
        count: foundActivities.length
      }
    }
  }
  
  const scenarioKeywords = ['drive', 'bike', 'walk', 'cycle', 'run', 'commute', 'travel']
  const foundScenarios = scenarioKeywords.filter(w => q.includes(w))
  if (hasCompare && foundScenarios.length >= 2) {
    if (q.includes('to work') || q.includes('to school') || q.includes('to the') || q.includes('commute')) {
      return {
        type: 'scenario',
        scenarios: foundScenarios,
        destination: q.match(/to\s+([\w\s]+?)(?:\?|$)/)?.[1]?.trim() || 'destination'
      }
    }
  }
  
  if (hasCompare && foundTimes.length >= 2) {
    return {
      type: 'time',
      time1: foundTimes[0],
      time2: foundTimes[1]
    }
  }
  
  if (q.includes('today') && q.includes('tomorrow')) {
    return { type: 'time', time1: 'today', time2: 'tomorrow' }
  }
  
  if (q.includes('now') && q.includes('later')) {
    return { type: 'time', time1: 'now', time2: 'later' }
  }
  
  return null
}

// ─── COMPARISON HELPERS ──────────────────────────────────────────────────

const extractKeyPoints = (response, maxLines = 5) => {
  const lines = response.split('\n').filter(l => l.trim() && !l.includes('---') && !l.includes('==='))
  return lines.slice(0, maxLines).join('\n')
}

const generateComparisonVerdict = (results, comparison, intent) => {
  let verdict = ''
  
  switch (comparison.type) {
    case 'time':
    case 'multi_time': {
      const times = comparison.type === 'multi_time' ? comparison.times : [comparison.time1, comparison.time2]
      const tempValues = results.map(r => r.temp)
      const rainValues = results.map(r => r.rain)
      const cloudValues = results.map(r => r.cloudCover)
      
      if (tempValues.some(v => v !== null && v !== undefined)) {
        const temps = tempValues.filter(v => v !== null && v !== undefined).map(Number)
        if (temps.length > 1) {
          const max = Math.max(...temps)
          const min = Math.min(...temps)
          const diff = max - min
          if (diff > 3) {
            const hottest = times[tempValues.indexOf(max)]
            const coldest = times[tempValues.indexOf(min)]
            verdict += `${hottest} is hottest at ${max}°C, ${coldest} is coolest at ${min}°C. `
          } else {
            verdict += `Temperatures are similar across all times (${Math.round(temps.reduce((a,b) => a + b, 0) / temps.length)}°C avg). `
          }
        }
      }
      
      if (rainValues.some(v => v !== null && v !== undefined)) {
        const rains = rainValues.filter(v => v !== null && v !== undefined).map(Number)
        if (rains.length > 1) {
          const max = Math.max(...rains)
          const min = Math.min(...rains)
          if (max > 40) {
            const rainiest = times[rainValues.indexOf(max)]
            const driest = times[rainValues.indexOf(min)]
            verdict += `${rainiest} is rainier (${max}%) than ${driest} (${min}%). `
          } else {
            verdict += `Low rain chance across all times (${Math.round(rains.reduce((a,b) => a + b, 0) / rains.length)}% avg). `
          }
        }
      }
      
      if (cloudValues.some(v => v !== null && v !== undefined)) {
        const clouds = cloudValues.filter(v => v !== null && v !== undefined).map(Number)
        if (clouds.length > 1) {
          const max = Math.max(...clouds)
          const min = Math.min(...clouds)
          if (max - min > 30) {
            const cloudiest = times[cloudValues.indexOf(max)]
            const clearest = times[cloudValues.indexOf(min)]
            verdict += `${cloudiest} is cloudiest (${max}%), ${clearest} is clearest (${min}%). `
          }
        }
      }
      
      if (!verdict) {
        const timeList = times.join(', ')
        verdict = `The conditions across ${timeList} are fairly similar. Check the details above.`
      }
      break
    }
    
    case 'location': {
      const locs = comparison.locations
      const tempValues = results.map(r => r.temp)
      
      if (tempValues.some(v => v !== null && v !== undefined)) {
        const temps = tempValues.filter(v => v !== null && v !== undefined).map(Number)
        if (temps.length > 1) {
          const max = Math.max(...temps)
          const min = Math.min(...temps)
          const diff = max - min
          if (diff > 5) {
            const hottest = locs[tempValues.indexOf(max)]
            const coldest = locs[tempValues.indexOf(min)]
            verdict += `${hottest} is warmer (${max}°C) than ${coldest} (${min}°C). `
          }
        }
      }
      
      verdict += `Weather can vary by location. Check details above.`
      break
    }
    
    case 'activity': {
      const activities = comparison.activities
      verdict = `Comparing ${activities.join(' vs ')}. `
      verdict += `Consider weather impact on each activity. `
      verdict += `Check the details above for specific recommendations.`
      break
    }
    
    case 'scenario': {
      const scenarios = comparison.scenarios
      const dest = comparison.destination
      verdict = `Comparing ${scenarios.join(' vs ')} to ${dest}. `
      verdict += `Consider time, weather, and traffic for each option.`
      break
    }
    
    default:
      verdict = 'Comparison complete. See details above.'
  }
  
  return verdict
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
  voiceToUse: propVoiceToUse
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

  // ─── Translation & Voice State ────────────────────────────────────────
  const [detectedLanguage, setDetectedLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [genderPref, setGenderPref] = useState('female')

  // ─── Suggestions State ──────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const suggestionIntervalRef = useRef(null)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const ghostIntervalRef = useRef(null)

  // ─── Determine which voice to use ──────────────────────────────────────
  const voiceToUse = useMemo(() => {
    if (detectedLanguage !== 'en' && detectedLanguage !== lang) {
      const detectedVoice = getVoiceForDetectedLanguage(detectedLanguage, genderPref)
      if (detectedVoice) return detectedVoice
    }
    return propVoiceToUse
  }, [detectedLanguage, genderPref, propVoiceToUse, lang])

  // ─── Detect language on input change ──────────────────────────────────
  useEffect(() => {
    if (input && input.trim().length > 2) {
      const detected = detectLanguageFromText(input)
      if (detected !== 'en') {
        setDetectedLanguage(detected)
      } else {
        setDetectedLanguage('en')
      }
    }
  }, [input])

  // ─── Rotate suggestions every 10 seconds ──────────────────────────────
  useEffect(() => {
    if (messages.length === 1) {
      const getRandomSuggestions = () => {
        const shuffled = [...ALL_SAMPLE_QUESTIONS]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled.slice(0, 4)
      }
      
      setSuggestions(getRandomSuggestions())
      setShowSuggestions(true)
      
      suggestionIntervalRef.current = setInterval(() => {
        setSuggestions(getRandomSuggestions())
      }, CONFIG.SUGGESTION_ROTATION_INTERVAL)
      
      return () => {
        if (suggestionIntervalRef.current) {
          clearInterval(suggestionIntervalRef.current)
        }
      }
    } else {
      setShowSuggestions(false)
      if (suggestionIntervalRef.current) {
        clearInterval(suggestionIntervalRef.current)
        suggestionIntervalRef.current = null
      }
    }
  }, [messages.length])

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
    homeName: location?.name
  }), [weather, aqi, location, moonPhase, savedLocations])

  const aqiLevel = useMemo(() => {
    if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
    if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
    if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
    if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316' }
    return { label: 'Hazardous', color: '#ef4444' }
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
    
    const suggestionsList = [
      'Ask "stargazing tonight" or "moon phase"',
      'Try "what should I wear" or "safe to run"',
      'Ask "will it rain" or "UV burn time"',
      'Type "paint drying time" or "best photo hour"',
      'Compare "today vs tomorrow" for anything',
      'Ask "biking vs running today?"',
      'Try "drive or bike to work?"'
    ]
    
    let i = 0
    setGhostText(suggestionsList[0])
    
    ghostIntervalRef.current = setInterval(() => {
      i = (i + 1) % suggestionsList.length
      setGhostText(suggestionsList[i])
    }, 3000)
    
    return () => {
      if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current)
    }
  }, [input])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // ─── Speaking ─────────────────────────────────────────────────────────

  const speakText = useCallback(async (text) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/•/g, '')
      .replace(/\n/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()
    
    try {
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

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── ROUTE QUESTION ──────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const routeQuestion = useCallback(async (question) => {
    const q = question.toLowerCase()
    let data = weatherData
    
    if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) {
      const fetched = await fetchFullWeather(data.lat, data.lon)
      if (fetched) {
        data = { ...data, ...fetched }
      }
    }

    const comparison = detectComparison(question)
    
    if (comparison) {
      if (comparison.type === 'multi_time') {
        const times = comparison.times
        const detectedIntents = detectIntents(q)
        
        if (detectedIntents.length === 0) {
          return "I can compare multiple times. Try asking 'Compare today, tomorrow, and this weekend for stargazing?'"
        }
        
        const primaryIntent = detectedIntents[0].intent
        const results = []
        
        for (const time of times) {
          const timeData = getTimeShiftedData(data, time, question)
          const response = await primaryIntent.fn(timeData, question)
          const tempMatch = response.match(/(\d+)°C/)
          const rainMatch = response.match(/(\d+)% rain/i)
          const cloudMatch = response.match(/Cloud Cover:\s*(\d+)%/)
          results.push({
            time,
            response: extractKeyPoints(response, 4),
            temp: tempMatch ? parseInt(tempMatch[1]) : null,
            rain: rainMatch ? parseInt(rainMatch[1]) : null,
            cloudCover: cloudMatch ? parseInt(cloudMatch[1]) : null
          })
        }
        
        let comparisonResponse = `Multi-Time Comparison:\n\n`
        
        for (const result of results) {
          comparisonResponse += `${result.time.toUpperCase()}:\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
        comparisonResponse += `Verdict: ${verdict}`
        
        return comparisonResponse
      }
      
      if (comparison.type === 'location') {
        const locations = comparison.locations
        const detectedIntents = detectIntents(q)
        
        if (detectedIntents.length === 0) {
          return "I can compare locations. Try asking 'Compare Lagos and Abuja weather?'"
        }
        
        const primaryIntent = detectedIntents[0].intent
        const results = []
        
        for (const locName of locations) {
          const savedLoc = findSavedLocation(locName)
          if (!savedLoc) {
            return `I couldn't find "${locName}" in your saved locations. Please save it first.`
          }
          
          const freshData = await fetchFullWeather(savedLoc.lat, savedLoc.lon)
          if (!freshData) {
            results.push({
              location: locName,
              response: `Could not fetch weather for ${locName}`,
              temp: null
            })
            continue
          }
          
          freshData.city = savedLoc.label || savedLoc.name
          freshData.savedLocations = savedLocations
          freshData.lat = savedLoc.lat
          freshData.lon = savedLoc.lon
          
          const response = await primaryIntent.fn(freshData, question)
          const tempMatch = response.match(/(\d+)°C/)
          results.push({
            location: locName,
            response: extractKeyPoints(response, 4),
            temp: tempMatch ? parseInt(tempMatch[1]) : freshData.temp
          })
        }
        
        let comparisonResponse = `Location Comparison:\n\n`
        
        for (const result of results) {
          comparisonResponse += `${result.location.toUpperCase()}:\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
        comparisonResponse += `Verdict: ${verdict}`
        
        return comparisonResponse
      }
      
      if (comparison.type === 'activity') {
        const activities = comparison.activities
        
        const activityToIntent = {
          'run': 'sports',
          'bike': 'sports',
          'cycle': 'sports',
          'drive': 'driving',
          'walk': 'lifestyle',
          'jog': 'sports',
          'hike': 'sports',
          'swim': 'sports'
        }
        
        const results = []
        
        for (const activity of activities) {
          const intentId = activityToIntent[activity] || 'sports'
          const intent = INTENT_MAP.find(i => i.id === intentId)
          
          if (!intent) continue
          
          const activityQuestion = `Is it good for ${activity}?`
          const response = await intent.fn(data, activityQuestion)
          
          results.push({
            activity,
            response: extractKeyPoints(response, 4)
          })
        }
        
        if (results.length === 0) {
          return "I couldn't compare those activities. Try 'Biking vs running today?'"
        }
        
        let comparisonResponse = `Activity Comparison:\n\n`
        
        for (const result of results) {
          comparisonResponse += `${result.activity.toUpperCase()}:\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, { id: 'sports' })
        comparisonResponse += `Verdict: ${verdict}`
        
        return comparisonResponse
      }
      
      if (comparison.type === 'scenario') {
        const scenarios = comparison.scenarios
        const dest = comparison.destination
        
        const scenarioToIntent = {
          'drive': 'driving',
          'bike': 'sports',
          'cycle': 'sports',
          'walk': 'lifestyle',
          'run': 'sports',
          'commute': 'route',
          'travel': 'route'
        }
        
        const results = []
        
        for (const scenario of scenarios) {
          const intentId = scenarioToIntent[scenario] || 'route'
          const intent = INTENT_MAP.find(i => i.id === intentId)
          
          if (!intent) continue
          
          const scenarioQuestion = `${scenario} to ${dest}?`
          const response = await intent.fn(data, scenarioQuestion)
          
          results.push({
            scenario,
            response: extractKeyPoints(response, 4)
          })
        }
        
        if (results.length === 0) {
          return "I couldn't compare those scenarios. Try 'Drive or bike to work?'"
        }
        
        let comparisonResponse = `Scenario Comparison: ${dest.toUpperCase()}\n\n`
        
        for (const result of results) {
          comparisonResponse += `${result.scenario.toUpperCase()}:\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, { id: 'route' })
        comparisonResponse += `Verdict: ${verdict}`
        
        return comparisonResponse
      }
      
      const detectedIntents = detectIntents(q)
      
      if (detectedIntents.length === 0) {
        return "I can compare times. Try asking 'Stargazing tonight vs tomorrow?'"
      }
      
      const primaryIntent = detectedIntents[0].intent
      const results = []
      
      const time1Data = getTimeShiftedData(data, comparison.time1, question)
      const time2Data = getTimeShiftedData(data, comparison.time2, question)
      
      const [response1, response2] = await Promise.all([
        primaryIntent.fn(time1Data, question),
        primaryIntent.fn(time2Data, question)
      ])
      
      const temp1 = response1.match(/(\d+)°C/)
      const temp2 = response2.match(/(\d+)°C/)
      const rain1 = response1.match(/(\d+)% rain/i)
      const rain2 = response2.match(/(\d+)% rain/i)
      const cloud1 = response1.match(/Cloud Cover:\s*(\d+)%/)
      const cloud2 = response2.match(/Cloud Cover:\s*(\d+)%/)
      
      results.push({
        time: comparison.time1,
        response: extractKeyPoints(response1, 4),
        temp: temp1 ? parseInt(temp1[1]) : null,
        rain: rain1 ? parseInt(rain1[1]) : null,
        cloudCover: cloud1 ? parseInt(cloud1[1]) : null
      })
      
      results.push({
        time: comparison.time2,
        response: extractKeyPoints(response2, 4),
        temp: temp2 ? parseInt(temp2[1]) : null,
        rain: rain2 ? parseInt(rain2[1]) : null,
        cloudCover: cloud2 ? parseInt(cloud2[1]) : null
      })
      
      let comparisonResponse = `Comparison: ${comparison.time1} vs ${comparison.time2}\n\n`
      
      for (const result of results) {
        comparisonResponse += `${result.time.toUpperCase()}:\n${result.response}\n\n`
      }
      
      const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
      comparisonResponse += `Verdict: ${verdict}`
      
      return comparisonResponse
    }

    const detectedIntents = detectIntents(q)
    
    console.log(`Intents:`, detectedIntents.map(d => 
      `${d.intent.name} (${d.score.toFixed(1)})`
    ).join(', '))

    if (detectedIntents.length === 0) {
      const routeKeywords = ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'eta', 'travel time', 'how far', 'navigate', 'commute']
      const trafficKeywords = ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill']

      const hasRoute = routeKeywords.some(k => q.includes(k))
      const hasTraffic = trafficKeywords.some(k => q.includes(k))

      if (hasRoute || hasTraffic) {
        const fromMatch = q.match(/from\s+([\w\s]+?)(?:\s+to|\s*$)/i)
        const toMatch = q.match(/to\s+([\w\s]+?)(?:\s*$|[\?\.])/i)

        let fromLocation = null
        let toLocation = null

        if (fromMatch) {
          const fromName = fromMatch[1].trim()
          const savedFrom = findSavedLocation(fromName)
          fromLocation = savedFrom ? { ...savedFrom, isSaved: true } : fromName
        }

        if (toMatch) {
          const toName = toMatch[1].trim()
          const savedTo = findSavedLocation(toName)
          toLocation = savedTo ? { ...savedTo, isSaved: true } : toName
        }

        if (toLocation && !fromLocation) fromLocation = 'home'

        if (hasTraffic && !toLocation) {
          const response = await getTrafficAdvice(data, question, {})
          const verdict = generateVerdict(question, data, { id: 'traffic' })
          return verdict ? `${verdict}\n\n${response}` : response
        }

        if (hasRoute && toLocation) {
          const response = await getRouteAdvice(data, question, { from: fromLocation, to: toLocation, savedLocations })
          const verdict = generateVerdict(question, data, { id: 'route' })
          return verdict ? `${verdict}\n\n${response}` : response
        }
      }

      if (q.match(/rain|storm|cloud|sun|wind|humid|cold|hot|weather|tomorrow|today|forecast|weekend|temperature/)) {
        const response = await getWeatherAdvice(data, question)
        const verdict = generateVerdict(question, data, { id: 'weather' })
        return verdict ? `${verdict}\n\n${response}` : response
      }

      return `I'm not sure what you're asking. Try asking about weather, clothing, routes, traffic, sports, farming, stargazing, or health. Current temp is ${data.temp}°C.`
    }

    const results = await Promise.all(
      detectedIntents.map(async (detected) => {
        try {
          const isAsync = ['farming', 'stargazing'].includes(detected.intent.id)
          const response = isAsync 
            ? await detected.intent.fn(data, question)
            : detected.intent.fn(data, question)
          return { response, detected }
        } catch (e) {
          console.error(`Error in ${detected.intent.name}:`, e)
          return null
        }
      })
    )

    const responses = []
    const intents = []

    for (const result of results) {
      if (result) {
        responses.push(result.response)
        intents.push(result.detected)
      }
    }

    if (responses.length === 0) {
      const response = await getWeatherAdvice(data, question)
      const verdict = generateVerdict(question, data, { id: 'weather' })
      return verdict ? `${verdict}\n\n${response}` : response
    }

    const primaryIntent = intents[0]?.intent
    let verdict = null
    
    if (primaryIntent) {
      verdict = generateVerdict(question, data, primaryIntent)
    }

    let mergedResponse = responses.length === 1 
      ? responses[0] 
      : mergeResponses(responses, intents, question)

    if (verdict) {
      mergedResponse = `${verdict}\n\n${mergedResponse}`
    }

    return mergedResponse || responses[0]
  }, [weatherData, savedLocations])

  // ─── Handle Ask ──────────────────────────────────────────────────────

  const handleAsk = useCallback(async (question) => {
    if (!question.trim()) return

    const detectedLang = detectLanguageFromText(question)
    if (detectedLang !== 'en') {
      setDetectedLanguage(detectedLang)
    }

    let englishQuestion = question
    const needsTranslation = detectedLang !== 'en' && detectedLang !== lang

    if (needsTranslation) {
      setIsTranslating(true)
      englishQuestion = await translateText(question, 'en')
      setIsTranslating(false)
    }

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: question,
      originalLang: detectedLang
    }])
    setInput('')
    setIsLoading(true)
    setStreamingText('')

    try {
      const answer = await routeQuestion(englishQuestion)

      let finalAnswer = answer
      if (needsTranslation) {
        setIsTranslating(true)
        finalAnswer = await translateText(answer, detectedLang)
        setIsTranslating(false)
      }

      let text = ''
      for (const word of finalAnswer.split(' ')) {
        text += word + ' '
        setStreamingText(text)
        await new Promise(r => setTimeout(r, CONFIG.STREAM_DELAY_MS))
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: finalAnswer,
        originalLang: detectedLang,
        originalEnglish: needsTranslation ? answer : null
      }])
      setStreamingText('')

      if (voiceToUse) speakText(finalAnswer)

    } catch (e) {
      const fallback = `Error getting advice. Current temp is ${weatherData.temp}°C with ${weatherData.condition}.`
      const finalFallback = needsTranslation 
        ? await translateText(fallback, detectedLang)
        : fallback
      setMessages(prev => [...prev, { role: 'assistant', content: finalFallback }])
    } finally {
      setIsLoading(false)
    }
  }, [routeQuestion, weatherData, voiceToUse, speakText, lang])

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── MENU DROPDOWN ────────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const cityName = location?.name?.split(',')[0] || 'City'
  const temp = weatherData.temp
  const aqiLabel = aqiLevel.label
  const condition = weatherData.condition

  // ─── Time of day helper ──────────────────────────────────────────────
  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  return (
    <div className="ai-fullscreen">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="ai-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        minHeight: '64px'
      }}>
        {/* Left: Back + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 6px' }}>
            <BackIcon />
          </button>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px', lineHeight: '1.3' }}>
              ZEPHYE
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              fontWeight: '400',
              letterSpacing: '0.2px'
            }}>
              Weather Intelligence
            </div>
          </div>
        </div>

        {/* Right: Location + Temp + AQI + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1px'
          }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '500',
              color: 'var(--text)'
            }}>
              {cityName} · {temp}°C
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>AQI</span>
              <span style={{ color: aqiLevel.color, fontWeight: '500' }}>{aqiLabel}</span>
            </div>
          </div>

          {/* Menu Dropdown (3 dots) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                padding: '4px 6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <MoreIcon />
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '180px',
                background: 'rgba(15,23,42,0.96)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {/* Voice Gender */}
                <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Voice
                </div>
                <button
                  onClick={() => { setGenderPref('female'); setIsMenuOpen(false) }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: genderPref === 'female' ? 'rgba(56,189,248,0.15)' : 'transparent',
                    border: 'none',
                    color: genderPref === 'female' ? 'var(--accent)' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  Female
                </button>
                <button
                  onClick={() => { setGenderPref('male'); setIsMenuOpen(false) }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: genderPref === 'male' ? 'rgba(56,189,248,0.15)' : 'transparent',
                    border: 'none',
                    color: genderPref === 'male' ? 'var(--accent)' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  Male
                </button>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                {/* Language */}
                {detectedLanguage !== 'en' && (
                  <>
                    <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Language
                    </div>
                    <div style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GlobeIcon />
                      {LANGUAGE_NAMES[detectedLanguage] || detectedLanguage}
                      {isTranslating && ' ⌛'}
                    </div>
                  </>
                )}

                {/* Show Original */}
                {detectedLanguage !== 'en' && (
                  <button
                    onClick={() => { setShowOriginal(!showOriginal); setIsMenuOpen(false) }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: showOriginal ? 'rgba(56,189,248,0.15)' : 'transparent',
                      border: 'none',
                      color: showOriginal ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {showOriginal ? 'Hide Original' : 'Show Original'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BODY ────────────────────────────────────────────────────────── */}
      <div className="ai-body" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', width: '100%' }}>
          
          {/* ─── WELCOME STATE ────────────────────────────────────────────── */}
          {messages.length === 1 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              minHeight: '300px',
              textAlign: 'center',
              padding: '20px'
            }}>
              {/* Location + Weather */}
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--text-muted)', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <span>{cityName}, NG</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{temp}°C</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{condition}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span style={{ color: aqiLevel.color }}>AQI {aqiLabel}</span>
              </div>

              {/* Greeting */}
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>
                Good {getTimeOfDay()}, {userName || 'there'}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                How can I help you today?
              </p>

              {/* 4 Dynamic Suggestions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                width: '100%',
                maxWidth: '420px'
              }}>
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(q)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      textAlign: 'left',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      lineHeight: '1.4',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            {/* ─── CONVERSATION ────────────────────────────────────────────── */}
            <>
              {messages.map((msg, i) => {
                // Skip the first welcome message if you want to hide it
                // Or show it as part of the conversation
                return (
                  <div key={i} style={{ 
                    display: 'flex', 
                    marginBottom: 12, 
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                  }}>
                    <div className={`chat-bubble ${msg.role}`}>
                      {msg.role === 'assistant' && (
                        <div className="msg-actions-top">
                          <button className="speak-btn" onClick={() => speakText(msg.content)} title={isSpeaking ? 'Stop' : 'Speak'}>
                            {isSpeaking ? <StopIcon /> : <SpeakIcon />}
                          </button>
                          <button className="speak-btn" onClick={() => copyText(msg.content)} title="Copy">
                            <CopyIcon />
                          </button>
                        </div>
                      )}
                      
                      {showOriginal && msg.originalEnglish && msg.role === 'assistant' && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-muted)', 
                          marginBottom: '8px',
                          paddingBottom: '8px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {msg.originalEnglish}
                        </div>
                      )}
                      
                      <div className="msg-content">{msg.content}</div>
                      
                      {msg.originalLang && msg.originalLang !== 'en' && (
                        <div style={{ 
                          fontSize: '10px', 
                          color: 'var(--text-muted)', 
                          marginTop: '6px',
                          opacity: 0.5
                        }}>
                          {LANGUAGE_NAMES[msg.originalLang] || msg.originalLang}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

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
            </>
          )}
        </div>
      </div>

      {/* ─── INPUT ────────────────────────────────────────────────────────── */}
      <div className="ai-input-wrap" style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        flexShrink: 0,
        background: 'var(--bg-deep)'
      }}>
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
              <MicIcon />
            </button>
          </div>
          <button
            onClick={() => handleAsk(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 16px', borderRadius: '40px' }}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      <style jsx>{`
        .ai-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-deep);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .ai-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scroll-behavior: smooth;
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
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          border-radius: 30px;
          transition: 0.2s;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .input-wrapper .mic-btn:hover {
          color: var(--accent);
          background: rgba(56,189,248,0.12);
        }

        .btn-primary {
          background: var(--accent);
          color: var(--bg-deep);
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.85;
          transform: scale(0.97);
        }
        .btn-primary:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-ghost {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: 0.2s;
          display: flex;
          align-items: center;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text);
        }

        .chat-bubble {
          max-width: 92%;
          padding: 14px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          position: relative;
          word-break: break-word;
        }
        .chat-bubble.user {
          background: var(--accent);
          color: var(--bg-deep);
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.ai {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-bottom-left-radius: 4px;
        }
        .chat-bubble .msg-actions-top {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .chat-bubble:hover .msg-actions-top {
          opacity: 1;
        }
        .chat-bubble .speak-btn {
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
        .chat-bubble .speak-btn:hover {
          background: rgba(255,255,255,0.12);
        }
        .chat-bubble .msg-content {
          white-space: pre-wrap;
        }

        .text-muted {
          color: var(--text-muted);
        }

        .aqi-badge {
          background: rgba(255,255,255,0.06);
          padding: 0 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }

        /* Scrollbar styling */
        .ai-body::-webkit-scrollbar {
          width: 4px;
        }
        .ai-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .ai-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .ai-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  )
}
