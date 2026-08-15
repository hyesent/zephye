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
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
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
  SUGGESTION_ROTATION_INTERVAL: 10000
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
// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const SAMPLE_QUESTIONS = [
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
  "What should I wear today?",
  "Do I need an umbrella?",
  "Is it cold outside?",
  "Should I bring a jacket?",
  "Can I wear shorts?",
  "Do I need a raincoat?",
  "Is it hoodie weather?",
  "Should I wear sandals?",
  "Will I need sunglasses?",
  "What layers should I wear?",
  "Is it sweater weather?",
  "Do I need gloves?",
  "What shoes should I wear?",
  "Is it too hot for jeans?",
  "Should I wear a hat?",
  "Do I need sunscreen?",
  "Can I go jogging today?",
  "Is it good weather for a walk?",
  "Should I work out outside?",
  "Can I go to the park?",
  "Is it safe to run right now?",
  "Best time to exercise today?",
  "Can I walk my dog?",
  "Should I do outdoor yoga?",
  "Is it good cycling weather?",
  "Can I have a picnic today?",
  "Should I eat lunch outside?",
  "Is it good for reading in the park?",
  "Can I see stars tonight?",
  "Is it good for stargazing?",
  "Will the moon ruin stargazing?",
  "Can I see the Milky Way?",
  "Is it clear enough for a telescope?",
  "Best time to stargaze tonight?",
  "Will clouds block the stars?",
  "Can I see planets tonight?",
  "Is it good for meteor watching?",
  "Can I see the ISS tonight?",
  "Is Jupiter visible?",
  "Can I see Saturn's rings?",
  "Will fog be an issue?",
  "Is it safe to play football today?",
  "Should I cancel my marathon?",
  "Good weather for tennis?",
  "Is it too hot for soccer practice?",
  "Can kids play outside?",
  "Should I run in this weather?",
  "Is the field too wet for sports?",
  "Will wind affect my golf game?",
  "Is it safe for outdoor workouts?",
  "Should I swim outdoors today?",
  "Can I cycle in this wind?",
  "Is it safe for hiking?",
  "Basketball court too hot?",
  "Is it safe to walk my dog?",
  "Should I take my cat outside?",
  "Can my pet get heat stroke?",
  "Is the pavement too hot?",
  "Should I leave my dog in the car?",
  "Is it too cold for my pet?",
  "Can my dog play outside?",
  "Will my pet get sunburn?",
  "Is air quality bad for pets?",
  "Is it safe to go outside today?",
  "Will the weather affect my migraines?",
  "Is it bad for my arthritis?",
  "Should I worry about heat stroke?",
  "Will my allergies act up?",
  "Is it safe for elderly to go out?",
  "Can I exercise with my heart condition?",
  "Will humidity affect my breathing?",
  "Should I stay inside today?",
  "Is it a high pollution day?",
  "Will my sinuses be bad today?",
  "Should I worry about frostbite?",
  "Can I paint outside today?",
  "Is it good weather for concrete work?",
  "Should I stain my deck?",
  "Can I use power tools outside?",
  "Is it too humid for woodworking?",
  "Good day for roofing work?",
  "Will rain ruin my construction project?",
  "Can I pour concrete today?",
  "Is it safe to use a ladder?",
  "Is it good lighting for photos today?",
  "Should I do a photoshoot now?",
  "Is golden hour good today?",
  "Will clouds ruin my photos?",
  "Good weather for outdoor photography?",
  "Is it too harsh for portraits?",
  "Best time for landscape photos?",
  "Will rain affect my shoot?",
  "Should I bring lighting equipment?",
  "Is it good for astrophotography tonight?",
  "Can I shoot the Milky Way?",
  "Should I have my wedding outdoors today?",
  "Is it good weather for a picnic?",
  "Can I host a BBQ this weekend?",
  "Is it safe for an outdoor concert?",
  "Should I move my event indoors?",
  "Will rain cancel my party?",
  "Is it too windy for tents?",
  "Good weather for a beach day?",
  "Should I rent heaters for my event?",
  "Is it safe to drive today?",
  "Should I cycle to work?",
  "Good weather for motorbike?",
  "Are roads slippery?",
  "Is it too windy for cycling?",
  "Should I drive or take a cab?",
  "Will rain affect my commute?",
  "Is visibility bad for driving?",
  "Safe to ride my bike?",
  "Should I water my crops today?",
  "Is it good weather for planting?",
  "Will there be frost tonight?",
  "Do I need to irrigate?",
  "Is it safe to spray pesticides?",
  "Will rain damage my crops?",
  "Is it good harvesting weather?",
  "Should I cover my plants?",
  "Will humidity cause crop disease?",
  "Should I run AC today?",
  "Will my heating bill be high?",
  "Is it good weather to air out the house?",
  "Should I close windows?",
  "Do I need to run a dehumidifier?",
  "Will solar panels work well today?",
  "Should I use fans or AC?",
  "Is it cheap to heat the house today?",
  "Will my hair get frizzy today?",
  "Do I need sunscreen?",
  "Is it bad for my skin today?",
  "Will my makeup melt?",
  "Should I moisturize more?",
  "Is the air drying my skin?",
  "Do I need a hat?",
  "Will I get sunburned?",
  "Is it humid enough for curly hair?",
  "Traveling from Paris to London, weather?",
  "Mumbai to Delhi, what to expect?",
  "New York to Tokyo, should I pack a jacket?",
  "Lagos to Abuja, is there storm?",
  "Toronto to Montreal, flight weather?",
  "Road trip from LA to Vegas, weather?",
  "Flying to Dubai tomorrow, what should I wear?",
  "Train from Rome to Florence, conditions?",
  "Is there traffic on my route?",
  "Are there any accidents near me?",
  "What's the traffic like right now?",
  "Is there a road closure?",
  "How bad is the traffic today?",
  "Any traffic incidents in my area?",
  "Traffic to work?",
  "Is the highway congested?",
  "How do I get to Lagos?",
  "What's the route from Abuja to Kano?",
  "How long will it take to drive to work?",
  "What's the distance between Lagos and Ibadan?",
  "Give me directions to the airport",
  "Route from home to school",
  "Traffic on my way to work",
  "How long to get to the office?",
  "Show me the route with traffic",
  "What's the fastest way to get there?"
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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SCORING ENGINE ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── INTENT DETECTION ────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MERGE RESPONSES ─────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const mergeResponses = (responses, intents, question) => {
  if (responses.length === 0) return null
  if (responses.length === 1) return responses[0]

  let merged = ''
  
  for (let i = 0; i < responses.length; i++) {
    const text = responses[i]
    const intent = intents[i]?.intent
    const isPrimary = intents[i]?.isPrimary || false
    
    if (typeof text === 'string') {
      merged += `${intent?.section || 'Advice'}\n`
      merged += text
      merged += '\n\n'
    } else if (text && typeof text === 'object') {
      merged += `${intent?.section || 'Advice'}\n`
      merged += text.summary || text.verdict || ''
      merged += '\n\n'
    }
  }

  return merged.trim()
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SMART VERDICT GENERATOR ──────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
      
      if (cloudCover > 70) {
        verdict = 'No'
        confidence = 90
      } else if (cloudCover > 40) {
        verdict = 'Maybe'
        confidence = 60
      } else if (moonIllumination > 80) {
        verdict = 'Maybe'
        confidence = 65
      } else if (cloudCover < 30 && moonIllumination < 50) {
        verdict = 'Yes'
        confidence = 80
      } else {
        verdict = 'Maybe'
        confidence = 55
      }
      break
    }
    
    case 'weather': {
      const rainChance = data.precipitationProb || 0
      const temp = data.temp || 0
      
      if (q.includes('rain') || q.includes('storm')) {
        if (rainChance > 70) {
          verdict = 'Yes'
          confidence = 90
        } else if (rainChance > 40) {
          verdict = 'Maybe'
          confidence = 60
        } else {
          verdict = 'No'
          confidence = 85
        }
      } else if (q.includes('hot') || q.includes('warm')) {
        if (temp > 28) {
          verdict = 'Yes'
          confidence = 90
        } else if (temp > 22) {
          verdict = 'Maybe'
          confidence = 60
        } else {
          verdict = 'No'
          confidence = 85
        }
      } else if (q.includes('cold')) {
        if (temp < 10) {
          verdict = 'Yes'
          confidence = 90
        } else if (temp < 18) {
          verdict = 'Maybe'
          confidence = 60
        } else {
          verdict = 'No'
          confidence = 85
        }
      } else if (q.includes('clear') || q.includes('sunny')) {
        if (data.cloudCover < 30) {
          verdict = 'Yes'
          confidence = 90
        } else if (data.cloudCover < 60) {
          verdict = 'Maybe'
          confidence = 60
        } else {
          verdict = 'No'
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
          verdict = 'No'
          confidence = 90
        } else if (rainChance > 60 || wind > 40) {
          verdict = 'No'
          confidence = 85
        } else if (rainChance > 30 || wind > 25 || temp > 30 || temp < 5) {
          verdict = 'Maybe'
          confidence = 55
        } else {
          verdict = 'Yes'
          confidence = 90
        }
      }
      break
    }
    
    default: {
      const rainChance = data.precipitationProb || 0
      if (rainChance > 60) {
        verdict = 'Maybe'
        confidence = 55
      } else {
        verdict = 'Yes'
        confidence = 70
      }
    }
  }
  
  if (!verdict) {
    verdict = 'Maybe'
    confidence = 50
  }
  
  return verdict
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── COMPARISON DETECTION ────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const detectComparison = (question) => {
  const q = question.toLowerCase()
  
  const timeWords = [
    'today', 'tomorrow', 'now', 'later', 
    'evening', 'morning', 'afternoon', 'night', 'tonight',
    'weekend', 'weekday', 'monday', 'tuesday', 
    'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'this morning', 'this afternoon', 'this evening',
    'noon', 'midnight', 'sunrise', 'sunset',
    'rush hour', 'commute time', 'lunch time'
  ]
  
  const savedLocs = getSavedLocations()
  const locationWords = savedLocs.map(l => l.label?.toLowerCase()).filter(Boolean)
  const activityWords = ['run', 'bike', 'drive', 'walk', 'cycle', 'jog', 'hike', 'swim', 'sport', 'gym']
  const compareWords = ['vs', 'versus', 'compare', 'difference', 'or', 'vs.', 'and', 'better', 'best', 'rather']
  
  const hasCompare = compareWords.some(w => q.includes(w))
  
  if (hasCompare) {
    const foundTimes = timeWords.filter(w => q.includes(w))
    const foundLocations = locationWords.filter(w => q.includes(w))
    const foundActivities = activityWords.filter(w => q.includes(w))
    
    if (foundTimes.length >= 2) {
      return { type: 'time', time1: foundTimes[0], time2: foundTimes[1] }
    }
    if (foundLocations.length >= 2) {
      return { type: 'location', locations: foundLocations }
    }
    if (foundActivities.length >= 2) {
      return { type: 'activity', activities: foundActivities }
    }
  }
  
  if (q.includes('today') && q.includes('tomorrow')) {
    return { type: 'time', time1: 'today', time2: 'tomorrow' }
  }
  
  return null
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── STRUCTURED RESPONSE COMPONENT ──────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function StructuredResponse({ data, isSpeaking, onSpeak, onCopy }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showFull, setShowFull] = useState(false)

  // If data is a string, wrap it
  if (typeof data === 'string') {
    return (
      <div className="structured-response">
        <div className="summary">{data}</div>
        <div className="response-actions">
          <button className="action-btn" onClick={() => setShowFull(!showFull)}>
            {showFull ? 'Show less' : 'More details'}
          </button>
        </div>
        {showFull && (
          <div className="full-section">
            <div className="full-text">{data}</div>
          </div>
        )}
      </div>
    )
  }

  // If data is an object with verdict, use structured format
  if (data && typeof data === 'object' && data.verdict) {
    return (
      <div className="structured-response">
        <div className="verdict">{data.verdict}</div>
        <div className="summary">{data.summary}</div>
        {data.note && <div className="note">{data.note}</div>}
        
        <div className="response-actions">
          {data.details && data.details.length > 0 && (
            <button className="action-btn" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide details' : 'Why?'}
            </button>
          )}
          {data.fullText && (
            <button className="action-btn" onClick={() => setShowFull(!showFull)}>
              {showFull ? 'Show less' : 'More details'}
            </button>
          )}
        </div>
        
        {showDetails && data.details && data.details.length > 0 && (
          <div className="details-section">
            <div className="details-title">Why this recommendation?</div>
            {data.details.map((d, i) => (
              <div key={i} className="detail-row">
                <span className="detail-label">{d.label}</span>
                <span className="detail-value">{d.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {showFull && data.fullText && (
          <div className="full-section">
            <div className="full-text">{data.fullText}</div>
          </div>
        )}
      </div>
    )
  }

  // Fallback: show as string
  return <div className="msg-content">{String(data)}</div>
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN COMPONENT ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
  const [savedLocations, setSavedLocations] = useState([])

  // Translation & Voice State
  const [detectedLanguage, setDetectedLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [genderPref, setGenderPref] = useState('female')

  // Suggestions State
  const [suggestions, setSuggestions] = useState([])
  const suggestionIntervalRef = useRef(null)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const ghostIntervalRef = useRef(null)

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
        const shuffled = [...SAMPLE_QUESTIONS]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled.slice(0, 4)
      }
      
      setSuggestions(getRandomSuggestions())
      
      suggestionIntervalRef.current = setInterval(() => {
        setSuggestions(getRandomSuggestions())
      }, CONFIG.SUGGESTION_ROTATION_INTERVAL)
      
      return () => {
        if (suggestionIntervalRef.current) {
          clearInterval(suggestionIntervalRef.current)
        }
      }
    } else {
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
    if (aqi <= 150) return { label: 'Unhealthy for sensitive groups', color: '#f97316' }
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
          content: {
            verdict: `${greeting || 'Hello'}, ${userName || location?.name?.split(',')[0] || 'there'}`,
            summary: `${location?.name || 'Your location'} • ${weatherData.temp}°C • ${condition} • AQI ${aqiLevel.label}`,
            note: 'What can I help you with today?',
            details: [],
            fullText: ''
          }
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
      'Ask "stargazing tonight"',
      'Try "what should I wear"',
      'Ask "will it rain"',
      'Compare "today vs tomorrow"',
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
    
    let speakableText = text
    if (typeof text === 'object' && text !== null) {
      speakableText = `${text.verdict || ''} ${text.summary || ''} ${text.note || ''}`
    }
    
    const cleanText = String(speakableText)
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/•/g, '')
      .replace(/\n/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (!cleanText) return
    
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
    let copyableText = text
    if (typeof text === 'object' && text !== null) {
      copyableText = `${text.verdict || ''}\n${text.summary || ''}\n${text.note || ''}`
      if (text.fullText) copyableText += `\n\n${text.fullText}`
    }
    navigator.clipboard.writeText(String(copyableText))
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

  // ─── ROUTE QUESTION ──────────────────────────────────────────────────

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
      // Simple comparison handling
      if (comparison.type === 'time') {
        const time1Data = getTimeShiftedData(data, comparison.time1, question)
        const time2Data = getTimeShiftedData(data, comparison.time2, question)
        
        const response1 = await getWeatherAdvice(time1Data, question)
        const response2 = await getWeatherAdvice(time2Data, question)
        
        return {
          type: 'comparison',
          title: `${comparison.time1} vs ${comparison.time2}`,
          items: [
            { label: comparison.time1, content: response1 },
            { label: comparison.time2, content: response2 }
          ]
        }
      }
      
      if (comparison.type === 'location') {
        const locations = comparison.locations
        const results = []
        
        for (const locName of locations) {
          const savedLoc = findSavedLocation(locName)
          if (savedLoc) {
            const freshData = await fetchFullWeather(savedLoc.lat, savedLoc.lon)
            if (freshData) {
              freshData.city = savedLoc.label || savedLoc.name
              const response = await getWeatherAdvice(freshData, question)
              results.push({ label: savedLoc.label || savedLoc.name, content: response })
            }
          }
        }
        
        if (results.length > 0) {
          return {
            type: 'comparison',
            title: 'Location Comparison',
            items: results
          }
        }
      }
    }

    const detectedIntents = detectIntents(q)
    
    if (detectedIntents.length === 0) {
      const response = await getWeatherAdvice(data, question)
      return response
    }

    // If only one intent, return the response directly (string or structured)
    if (detectedIntents.length === 1) {
      const intent = detectedIntents[0].intent
      const isAsync = ['farming', 'stargazing', 'route', 'traffic'].includes(intent.id)
      const response = isAsync 
        ? await intent.fn(data, question)
        : intent.fn(data, question)
      
      return response
    }

    // Multiple intents - merge
    const results = await Promise.all(
      detectedIntents.map(async (detected) => {
        try {
          const isAsync = ['farming', 'stargazing', 'route', 'traffic'].includes(detected.intent.id)
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

    const validResults = results.filter(r => r !== null)
    if (validResults.length === 0) {
      const response = await getWeatherAdvice(data, question)
      return response
    }

    // Build merged response
    let mergedSummary = ''
    const mergedDetails = []
    
    for (const result of validResults) {
      const content = result.response
      if (typeof content === 'object' && content.verdict) {
        mergedSummary += `${result.detected.intent.section}: ${content.verdict}\n`
        if (content.details) {
          mergedDetails.push({
            section: result.detected.intent.section,
            details: content.details
          })
        }
      } else if (typeof content === 'string') {
        mergedSummary += `${result.detected.intent.section}: ${content.slice(0, 100)}...\n`
      }
    }

    return {
      verdict: 'Here\'s what I found',
      summary: mergedSummary.trim(),
      note: 'Multiple topics covered.',
      details: mergedDetails.flatMap(d => d.details || []),
      fullText: validResults.map(r => {
        const content = r.response
        if (typeof content === 'object' && content.fullText) return content.fullText
        if (typeof content === 'string') return content
        return JSON.stringify(content)
      }).join('\n\n---\n\n')
    }
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
        if (typeof answer === 'object' && answer.verdict) {
          finalAnswer = {
            ...answer,
            verdict: await translateText(answer.verdict, detectedLang),
            summary: await translateText(answer.summary, detectedLang),
            note: answer.note ? await translateText(answer.note, detectedLang) : '',
            fullText: answer.fullText ? await translateText(answer.fullText, detectedLang) : '',
            details: answer.details ? await Promise.all(answer.details.map(async (d) => ({
              ...d,
              value: await translateText(d.value, detectedLang)
            }))) : []
          }
        } else if (typeof answer === 'string') {
          finalAnswer = await translateText(answer, detectedLang)
        } else {
          finalAnswer = answer
        }
        setIsTranslating(false)
      }

      // Stream response
      let streamText = ''
      if (typeof finalAnswer === 'string') {
        for (const word of finalAnswer.split(' ')) {
          streamText += word + ' '
          setStreamingText(streamText)
          await new Promise(r => setTimeout(r, CONFIG.STREAM_DELAY_MS))
        }
      } else if (typeof finalAnswer === 'object' && finalAnswer.verdict) {
        const fullText = `${finalAnswer.verdict} ${finalAnswer.summary} ${finalAnswer.note || ''}`
        for (const word of fullText.split(' ')) {
          streamText += word + ' '
          setStreamingText(streamText)
          await new Promise(r => setTimeout(r, CONFIG.STREAM_DELAY_MS))
        }
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: finalAnswer,
        originalLang: detectedLang,
        originalEnglish: needsTranslation && typeof answer === 'object' ? answer : null
      }])
      setStreamingText('')

      if (voiceToUse) speakText(finalAnswer)

    } catch (e) {
      console.error('Error:', e)
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
  // ─── RENDER ──────────────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
                <span>{cityName}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{temp}°C</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{condition}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span style={{ color: aqiLevel.color }}>AQI {aqiLabel}</span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>
                Good {getTimeOfDay()}, {userName || 'there'}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                How can I help you today?
              </p>

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
            messages.map((msg, i) => {
              const isStructured = msg.content && typeof msg.content === 'object' && msg.content.verdict
              
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
                        {typeof msg.originalEnglish === 'object' 
                          ? msg.originalEnglish.verdict || msg.originalEnglish.summary || ''
                          : msg.originalEnglish}
                      </div>
                    )}
                    
                    {/* ─── Handle both structured and string responses ─── */}
                    {isStructured ? (
                      <StructuredResponse 
                        data={msg.content}
                        isSpeaking={isSpeaking}
                        onSpeak={() => speakText(msg.content)}
                        onCopy={() => copyText(msg.content)}
                      />
                    ) : typeof msg.content === 'string' ? (
                      <StructuredResponse 
                        data={msg.content}
                        isSpeaking={isSpeaking}
                        onSpeak={() => speakText(msg.content)}
                        onCopy={() => copyText(msg.content)}
                      />
                    ) : (
                      <div className="msg-content">{String(msg.content)}</div>
                    )}
                    
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
            })
          )}

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

        /* ─── Structured Response Styles ──────────────────────────────── */
        .structured-response {
          width: 100%;
        }

        .structured-response .verdict {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text);
        }

        .structured-response .summary {
          font-size: 14px;
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .structured-response .note {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 12px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          border-left: 2px solid var(--accent);
        }

        .structured-response .response-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .structured-response .action-btn {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .structured-response .action-btn:hover {
          background: rgba(255,255,255,0.12);
          color: var(--text);
        }

        .structured-response .details-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .structured-response .details-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .structured-response .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .structured-response .detail-row:last-child {
          border-bottom: none;
        }

        .structured-response .detail-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .structured-response .detail-value {
          color: var(--text);
          text-align: right;
        }

        .structured-response .full-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .structured-response .full-text {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
          white-space: pre-wrap;
          background: rgba(255,255,255,0.03);
          padding: 12px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
