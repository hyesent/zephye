// ──────────────────────────────────────────────────────────────────────────────
// ─── ZEPHYE BRAIN v3.0 - Unified Intelligence Engine ──────────────────────
// ─── Merges: Intent routing + Scoring engine + Comparison + Time-shift ────
// ──────────────────────────────────────────────────────────────────────────────

import {
  getMoonPhase,
  mapWeatherCode,
  getMoonIllumination,
  getCloudCover,
  getWindDirection,
  getBeaufortScale,
  calcHeatIndex,
  calcWindChill,
  calcDewPoint,
  getUVLevel,
  getAQICategory,
  getComfortIndex,
  getTimeOfDay,
  getSeason,
  getSunPosition,
  getDayLength,
  getSeeingConditions,
  getTransparency,
  getDarkSkyRating,
  getMilkyWayVisibility,
  getMeteorShowerCalendar,
  getISSFlyoverTimes,
  getAuroraForecast,
  getPlanetVisibility,
  getPaintDryingTime,
  getConcreteCuringTemp,
  getStoppingDistance,
  getRoadCondition,
  random
} from './data/calculations.js'

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

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  MIN_SCORE_THRESHOLD: 1.5,
  SECONDARY_THRESHOLD: 0.35,
  MAX_INTENTS: 3,
  MAX_SUGGESTIONS: 8,
  MAX_SECONDARY_LINES: 4,
  MAX_WARNINGS: 8,
  STREAM_DELAY_MS: 12
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TIME SHIFTING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

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
  
  // Parse time of day
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
  
  // Try hourly data
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
  
  // If no hourly data, use daily data with day offset
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
  
  // Rough fallback approximations
  if (data._hourIndex === undefined && data._dayOffset === undefined) {
    const hour = targetDate.getHours()
    if (hour >= 6 && hour < 12) {
      data.temp = (data.temp || 0) - 2
    } else if (hour >= 12 && hour < 17) {
      data.temp = (data.temp || 0) + 2
    } else if (hour >= 17 && hour < 21) {
      data.temp = (data.temp || 0) - 1
    } else {
      data.temp = (data.temp || 0) - 4
    }
  }
  
  // Ensure condition and conditionCode are always in sync
  if (data.conditionCode !== undefined && data.conditionCode !== null) {
    data.condition = mapWeatherCode(data.conditionCode)
  }
  
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INTENT MAP
// ═══════════════════════════════════════════════════════════════════════════════

const INTENT_MAP = [
  {
    id: 'weather',
    name: 'Weather',
    keys: ['rain', 'storm', 'weather', 'temperature', 'hot', 'cold', 'windy', 'humid', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'tonight', 'this week', 'weekend', 'forecast', 'snow', 'cloudy', 'clear', 'will it rain', 'temperature today', 'weather forecast', 'degrees', 'celsius', 'fahrenheit', 'precipitation', 'humidity', 'wind speed'],
    fn: getWeatherAdvice,
    priority: 1,
    section: 'Weather',
    icon: '🌡️',
    keywords: ['weather', 'forecast', 'temperature', 'rain', 'storm']
  },
  {
    id: 'sports',
    name: 'Sports',
    keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog', 'tennis', 'golf', 'swim', 'hike', 'ski', 'marathon', 'safe to run', 'athlete', 'basketball', 'baseball', 'cycling', 'fitness', 'cardio', 'strength', 'physical', 'bike', 'biking', 'ride', 'mountain bike', 'road bike', 'peloton', 'spin', 'cyclist', 'trail run', 'track', 'sprint', 'match', 'tournament', 'practice'],
    fn: getSportsAdvice,
    priority: 1,
    section: 'Sports',
    icon: '🏃',
    keywords: ['bike', 'biking', 'ride', 'run', 'gym', 'exercise', 'sport', 'workout', 'training', 'game', 'football', 'tennis', 'swim', 'hike']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    keys: ['wear', 'clothes', 'outfit', 'clothing', 'dress', 'jacket', 'shirt', 'pants', 'layer', 'sweater', 'coat', 'shorts', 'sandals', 'hoodie', 'umbrella', 'raincoat', 'hat', 'gloves', 'scarf', 'what should i wear', 'dress code', 'fashion', 'style', 'formal', 'casual', 'sweatshirt', 't-shirt', 'sweatpants', 'leggings', 'athletic wear', 'running shoes', 'cycling kit'],
    fn: getClothingAdvice,
    priority: 2,
    section: 'Clothing',
    icon: '👕',
    keywords: ['wear', 'clothes', 'outfit', 'dress', 'jacket', 'fashion', 'style']
  },
  {
    id: 'route',
    name: 'Route',
    keys: ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'trip', 'commute', 'eta', 'travel time', 'how far', 'navigate', 'direction', 'map', 'navigation', 'road trip', 'distance between', 'travel duration', 'way', 'bike route', 'cycling route', 'path', 'trail', 'route planner', 'shortest route', 'fastest route', 'scenic route'],
    fn: getRouteAdvice,
    priority: 2,
    section: 'Route',
    icon: '🗺️',
    keywords: ['route', 'distance', 'how long', 'get to', 'from', 'to', 'directions', 'map', 'navigate']
  },
  {
    id: 'traffic',
    name: 'Traffic',
    keys: ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill', 'traffic conditions', 'is there traffic', 'traffic report', 'bumper to bumper', 'delay', 'construction traffic', 'road closure', 'car crash', 'bike lane blocked', 'cycle lane', 'traffic jam', 'stuck in traffic', 'rush hour', 'commute traffic'],
    fn: getTrafficAdvice,
    priority: 2,
    section: 'Traffic',
    icon: '🚦',
    keywords: ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow']
  },
  {
    id: 'driving',
    name: 'Driving',
    keys: ['drive', 'driving', 'road', 'car', 'commute', 'trip car', 'highway', 'cycling', 'bike', 'motorbike', 'motorcycle', 'bicycle', 'fog', 'black ice', 'hydroplaning', 'safe to drive', 'vehicle', 'transport', 'freeway', 'intersection', 'road bike', 'bike on road', 'cycle lane', 'driving conditions', 'road conditions', 'pavement', 'roads'],
    fn: getDrivingAdvice,
    priority: 3,
    section: 'Driving',
    icon: '🚗',
    keywords: ['drive', 'driving', 'road', 'car', 'vehicle', 'highway']
  },
  {
    id: 'health',
    name: 'Health',
    keys: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'headache', 'medical', 'migraine', 'arthritis', 'heart', 'diabetes', 'copd', 'breathing', 'safe to go outside', 'doctor', 'hospital', 'symptoms', 'medicine', 'condition', 'chronic', 'pain', 'injury', 'wellness', 'air quality', 'pollution', 'allergies', 'pollen', 'dust', 'smoke', 'fever', 'cough', 'sneeze'],
    fn: getHealthAdvice,
    priority: 3,
    section: 'Health',
    icon: '🏥',
    keywords: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'breathing', 'air quality', 'pain']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    keys: ['lifestyle', 'mood', 'energy', 'vibe', 'feel', 'tired', 'productivity', 'motivation', 'jogging', 'walk', 'park', 'picnic', 'grill', 'bbq', 'bonfire', 'laundry', 'car wash', 'can i go', 'meditat', 'yoga', 'outdoor activity', 'leisure', 'recreation', 'fun', 'relax', 'exercise light', 'walking', 'bike ride', 'casual ride', 'leisure bike', 'hammock', 'read outside', 'garden', 'bird watching'],
    fn: getLifestyleAdvice,
    priority: 3,
    section: 'Lifestyle',
    icon: '🌿',
    keywords: ['lifestyle', 'mood', 'walk', 'park', 'picnic', 'relax', 'leisure', 'bike ride']
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    keys: ['star', 'moon', 'astro', 'planet', 'meteor', 'telescope', 'night sky', 'constellation', 'milky way', 'galaxy', 'nebula', 'iss', 'aurora', 'comet', 'eclipse', 'stargazing', 'astronomy', 'space', 'satellite', 'shooting star', 'celestial', 'observatory', 'night vision', 'astrophotography', 'deep space', 'see stars', 'clear sky', 'dark sky'],
    fn: getStargazingAdvice,
    priority: 3,
    section: 'Stargazing',
    icon: '🌙',
    keywords: ['star', 'moon', 'night sky', 'telescope', 'astronomy', 'galaxy', 'milky way', 'planet']
  },
  {
    id: 'farming',
    name: 'Farming',
    keys: ['farm', 'crop', 'plant', 'harvest', 'soil', 'irrigation', 'seed', 'garden', 'gardening', 'watering', 'lawn', 'fertilize', 'greenhouse', 'cow', 'chicken', 'livestock', 'poultry', 'yield', 'tractor', 'agriculture', 'orchard', 'ranch', 'cultivation', 'compost', 'mulch', 'prune', 'weed', 'pesticide', 'fertilizer'],
    fn: getFarmingAdvice,
    priority: 3,
    section: 'Farming',
    icon: '🌾',
    keywords: ['farm', 'crop', 'plant', 'garden', 'soil', 'harvest']
  },
  {
    id: 'photography',
    name: 'Photography',
    keys: ['photo', 'camera', 'golden hour', 'shoot', 'picture', 'photography', 'lighting', 'lens', 'drone', 'portrait', 'landscape', 'macro', 'photoshoot', 'photos', 'photographer', 'composition', 'exposure', 'aperture', 'shutter speed', 'videography', 'visual', 'image', 'RAW', 'lightroom', 'photoshop', 'editing', 'sunset photo', 'sunrise photo'],
    fn: getPhotographyAdvice,
    priority: 3,
    section: 'Photography',
    icon: '📸',
    keywords: ['photo', 'camera', 'photography', 'shoot', 'picture', 'lens']
  },
  {
    id: 'events',
    name: 'Events',
    keys: ['event', 'party', 'wedding', 'outdoor', 'bbq', 'picnic', 'gathering', 'concert', 'festival', 'ceremony', 'celebration', 'venue', 'birthday', 'anniversary', 'corporate', 'block party', 'fair', 'reception', 'social', 'occasion', 'gala', 'fundraiser', 'conference', 'meeting'],
    fn: getEventsAdvice,
    priority: 3,
    section: 'Events',
    icon: '🎉',
    keywords: ['event', 'party', 'wedding', 'bbq', 'picnic', 'festival', 'concert']
  },
  {
    id: 'pets',
    name: 'Pets',
    keys: ['pet', 'dog', 'cat', 'walk', 'animal', 'puppy', 'kitten', 'paw', 'horse', 'bird', 'rabbit', 'chicken', 'fish pond', 'walk my dog', 'pet care', 'veterinarian', 'puppy training', 'cat care', 'dog walking', 'vet', 'animal shelter', 'wildlife', 'fish', 'hamster', 'guinea pig', 'reptile', 'snake'],
    fn: getPetsAdvice,
    priority: 3,
    section: 'Pets',
    icon: '🐾',
    keywords: ['pet', 'dog', 'cat', 'animal', 'walk my dog', 'puppy']
  },
  {
    id: 'diy',
    name: 'DIY',
    keys: ['diy', 'build', 'concrete', 'paint', 'construction', 'renovation', 'hammer', 'drill', 'roof', 'deck', 'stain', 'woodwork', 'masonry', 'drywall', 'paint drying', 'home repair', 'fix', 'remodel', 'contractor', 'carpentry', 'plumbing', 'electrical', 'home improvement', 'handyman', 'project', 'saw', 'screwdriver', 'wrench', 'tool', 'workshop'],
    fn: getDIYConstructionAdvice,
    priority: 3,
    section: 'DIY',
    icon: '🔧',
    keywords: ['diy', 'build', 'construction', 'paint', 'renovation', 'repair']
  },
  {
    id: 'energy',
    name: 'EnergyHome',
    keys: ['energy', 'power', 'solar', 'home', 'electricity', 'bill', 'ac', 'heating', 'hvac', 'dehumidifier', 'humidifier', 'thermostat', 'pipe', 'freeze', 'utility', 'electric', 'gas', 'insulation', 'efficiency', 'smart home', 'temperature control', 'climate control', 'savings', 'kwh', 'solar panel', 'inverter', 'battery', 'generator'],
    fn: getEnergyHomeAdvice,
    priority: 3,
    section: 'Energy',
    icon: '⚡',
    keywords: ['energy', 'power', 'electricity', 'bill', 'ac', 'heating', 'solar']
  },
  {
    id: 'traveling',
    name: 'Traveling',
    keys: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport', 'tourist', 'pack', 'train', 'cruise', 'ferry', 'bus', 'road trip', 'flying', 'journey', 'traveling', 'destination', 'tourism', 'business trip', 'holiday', 'abroad', 'international', 'domestic', 'itinerary', 'layover', 'baggage', 'luggage', 'suitcase'],
    fn: getTravelingAdvice,
    priority: 3,
    section: 'Travel',
    icon: '✈️',
    keywords: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport']
  },
  {
    id: 'skin_hair',
    name: 'SkinHair',
    keys: ['skin', 'hair', 'sunscreen', 'uv', 'sunburn', 'tan', 'spf', 'dry skin', 'frizzy', 'makeup', 'moisturize', 'acne', 'eczema', 'curl', 'frizz', 'blowout', 'beauty', 'skincare', 'hair care', 'beauty routine', 'cosmetics', 'face', 'scalp', 'complexion', 'rosacea', 'dandruff', 'oily skin', 'dry hair', 'curly hair', 'straight hair', 'shampoo', 'conditioner'],
    fn: getSkinHairAdvice,
    priority: 3,
    section: 'Beauty',
    icon: '💄',
    keywords: ['skin', 'hair', 'sunscreen', 'makeup', 'beauty', 'skincare']
  }
]

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INTENT SCORING & DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// 4. COMPARISON DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

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
  
  // Multi-time comparison (3+ times)
  const foundTimes = timeWords.filter(w => q.includes(w))
  if (hasCompare && foundTimes.length >= 3) {
    return {
      type: 'multi_time',
      times: foundTimes,
      count: foundTimes.length
    }
  }
  
  // Location comparison
  const foundLocations = locationWords.filter(w => q.includes(w))
  if (hasCompare && foundLocations.length >= 2) {
    return {
      type: 'location',
      locations: foundLocations,
      count: foundLocations.length
    }
  }
  
  // Activity comparison
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
  
  // Scenario comparison (drive vs bike to work)
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
  
  // Standard two-time comparison
  if (hasCompare && foundTimes.length >= 2) {
    return {
      type: 'time',
      time1: foundTimes[0],
      time2: foundTimes[1]
    }
  }
  
  // Implicit time comparison
  if (q.includes('today') && q.includes('tomorrow')) {
    return { type: 'time', time1: 'today', time2: 'tomorrow' }
  }
  
  if (q.includes('now') && q.includes('later')) {
    return { type: 'time', time1: 'now', time2: 'later' }
  }
  
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. VERDICT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

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
        verdict = 'NO'
        confidence = 90
      } else if (cloudCover > 40) {
        verdict = 'MIGHT'
        confidence = 60
      } else if (moonIllumination > 80) {
        verdict = 'MIGHT'
        confidence = 65
      } else if (cloudCover < 20 && moonIllumination < 30) {
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

// ═══════════════════════════════════════════════════════════════════════════════
// 6. RESPONSE MERGER
// ═══════════════════════════════════════════════════════════════════════════════

const extractKeyPoints = (response, maxLines = 5) => {
  const lines = response.split('\n').filter(l => l.trim() && !l.includes('---') && !l.includes('==='))
  return lines.slice(0, maxLines).join('\n')
}

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
      icon: intent?.icon || '📌',
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
      
      if (trimmed.includes('⚠️') && (trimmed.includes('WARNING') || trimmed.includes('Warning'))) {
        currentSection = 'warnings'
        warningBuffer = []
        continue
      }
      
      if (trimmed.includes('💡') && (trimmed.includes('BOTTOM') || trimmed.includes('Bottom') || trimmed.includes('Verdict'))) {
        currentSection = 'bottom'
        bottomBuffer = []
        continue
      }

      if (trimmed.includes('---') || trimmed.includes('===')) continue

      if (currentSection === 'warnings') {
        if (trimmed && !trimmed.includes('⚠️') && !trimmed.includes('💡')) {
          warningBuffer.push(trimmed)
        }
      } else if (currentSection === 'bottom') {
        if (trimmed && !trimmed.includes('💡') && !trimmed.includes('⚠️')) {
          bottomBuffer.push(trimmed)
        }
      } else {
        if (!trimmed.includes('⚠️') && !trimmed.includes('💡') && 
            !trimmed.includes('BOTTOM') && !trimmed.includes('Bottom') &&
            trimmed.length > 2) {
          section.contentLines.push(trimmed)
        }
      }
    }

    // Fallback warning extraction
    if (warningBuffer.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if ((trimmed.includes('⚠️') || trimmed.includes('WARNING') || trimmed.includes('🚨')) &&
            !trimmed.includes('⚠️ **Warnings:**') && !trimmed.includes('⚠️ **Warning:')) {
          warningBuffer.push(trimmed)
        }
      }
    }

    // Fallback bottom line extraction
    if (bottomBuffer.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if ((trimmed.includes('BOTTOM LINE') || trimmed.includes('Bottom Line') || trimmed.includes('Verdict')) &&
            !trimmed.includes('💡 **Bottom Line:**')) {
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

  merged += `${primary.icon} ${primary.header}\n`
  merged += primary.contentLines.join('\n')
  
  if (primary.warnings.length > 0) {
    merged += '\n\n⚠️ Warnings:\n'
    merged += primary.warnings.join('\n')
  }
  
  if (primary.bottomLine) {
    merged += '\n\n💡 Bottom Line:\n'
    merged += primary.bottomLine
  }
  merged += '\n\n'

  if (secondary.length > 0) {
    merged += `📋 Also consider:\n\n`
    for (const sec of secondary) {
      merged += `${sec.icon} ${sec.header}\n`
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
    merged += `⚠️ Warnings:\n`
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
    merged += `💡 Bottom Line:\n${bestBottom}\n`
  }

  return merged
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. COMPARISON VERDICT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

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
            verdict += `🌡️ ${hottest} is hottest at ${max}°C, ${coldest} is coolest at ${min}°C. `
          } else {
            verdict += `🌡️ Temperatures are similar across all times (${Math.round(temps.reduce((a,b) => a + b, 0) / temps.length)}°C avg). `
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
            verdict += `☔ ${rainiest} is rainier (${max}%) than ${driest} (${min}%). `
          } else {
            verdict += `☀️ Low rain chance across all times (${Math.round(rains.reduce((a,b) => a + b, 0) / rains.length)}% avg). `
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
            verdict += `☁️ ${cloudiest} is cloudiest (${max}%), ${clearest} is clearest (${min}%). `
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
            verdict += `🌡️ ${hottest} is warmer (${max}°C) than ${coldest} (${min}°C). `
          }
        }
      }
      
      verdict += `📍 Weather can vary by location. Check details above.`
      break
    }
    
    case 'activity': {
      const activities = comparison.activities
      verdict = `🏃 Comparing ${activities.join(' vs ')}. `
      verdict += `Consider weather impact on each activity. `
      verdict += `Check the details above for specific recommendations.`
      break
    }
    
    case 'scenario': {
      const scenarios = comparison.scenarios
      const dest = comparison.destination
      verdict = `🚗 Comparing ${scenarios.join(' vs ')} to ${dest}. `
      verdict += `Consider time, weather, and traffic for each option.`
      break
    }
    
    default:
      verdict = 'Comparison complete. See details above.'
  }
  
  return verdict
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ENHANCED SCORING ENGINE (merged from v2.0)
// ═══════════════════════════════════════════════════════════════════════════════

const ScoringEngine = {
  score: (weatherData, question, intents) => {
    const w = weatherData
    const scores = []
    let overallScore = 100
    const positives = []
    const negatives = []
    const warnings = []
    
    // Temperature scoring
    if (w.temp > 35) { overallScore -= 25; negatives.push('Extreme heat'); warnings.push('Heat stroke risk - stay hydrated') }
    else if (w.temp > 30) { overallScore -= 10; negatives.push('Very hot conditions') }
    else if (w.temp < -5) { overallScore -= 25; negatives.push('Extreme cold'); warnings.push('Frostbite risk - limit exposure') }
    else if (w.temp < 5) { overallScore -= 10; negatives.push('Very cold conditions') }
    else if (w.temp >= 18 && w.temp <= 26) { positives.push('Ideal temperature') }
    
    // Rain scoring
    if (w.precipitationProb > 70) { overallScore -= 30; negatives.push('High rain probability'); warnings.push('Heavy rain expected') }
    else if (w.precipitationProb > 40) { overallScore -= 15; negatives.push('Rain possible - bring rain gear') }
    else { positives.push('Low rain chance') }
    
    // Wind scoring
    if (w.wind > 40) { overallScore -= 20; negatives.push('Very windy'); warnings.push('Strong winds - secure loose items') }
    else if (w.wind > 25) { overallScore -= 10; negatives.push('Windy conditions') }
    else { positives.push('Calm wind conditions') }
    
    // UV scoring
    if (w.uvIndex > 8) { overallScore -= 20; negatives.push('Extreme UV'); warnings.push('Sun protection essential - SPF 50+') }
    else if (w.uvIndex > 6) { overallScore -= 10; negatives.push('High UV - use sunscreen') }
    else { positives.push('Low UV levels') }
    
    // AQI scoring
    if (w.aqi > 150) { overallScore -= 25; negatives.push('Poor air quality'); warnings.push('Unhealthy air - limit outdoor activity') }
    else if (w.aqi > 100) { overallScore -= 15; negatives.push('Moderate air quality') }
    else { positives.push('Good air quality') }
    
    // Visibility scoring
    if (w.visibility < 1) { overallScore -= 20; negatives.push('Very low visibility'); warnings.push('Dangerous visibility conditions') }
    else if (w.visibility < 3) { overallScore -= 10; negatives.push('Reduced visibility - drive carefully') }
    
    // Comfort scoring
    const comfortScore = getComfortIndex ? getComfortIndex(w.temp, w.humidity, w.wind, w.uvIndex) : 70
    if (comfortScore > 80) { positives.push('Excellent comfort conditions') }
    else if (comfortScore > 60) { positives.push('Good comfort conditions') }
    else if (comfortScore > 40) { overallScore -= 15; negatives.push('Uncomfortable conditions') }
    else { overallScore -= 25; negatives.push('Extreme discomfort') }
    
    // Heat index & wind chill
    const heatIndex = calcHeatIndex(w.temp, w.humidity)
    const windChill = calcWindChill(w.temp, w.wind)
    
    if (heatIndex > 32) { overallScore -= 20; warnings.push(`Heat index ${Math.round(heatIndex)}°C - risk of heat exhaustion`) }
    if (windChill < -10) { overallScore -= 20; warnings.push(`Wind chill ${Math.round(windChill)}°C - risk of hypothermia`) }
    
    // Activity-specific scoring
    const primaryIntent = intents[0]?.intent
    if (primaryIntent) {
      const activityScoring = {
        running: { idealTemp: [10, 20], maxWind: 20, maxUV: 6 },
        cycling: { idealTemp: [15, 25], maxWind: 25, maxUV: 7 },
        stargazing: { maxWind: 15, maxCloudCover: 30 },
        photography: { idealTemp: [10, 30], maxWind: 20 },
        driving: { maxWind: 40, minVisibility: 3 },
        hiking: { idealTemp: [10, 25], maxWind: 25, maxRain: 30 },
        painting: { idealTemp: [15, 27], maxRain: 10 },
        events: { idealTemp: [18, 28], maxRain: 20, maxWind: 20 }
      }
      
      const config = activityScoring[primaryIntent.id]
      if (config) {
        if (config.idealTemp && (w.temp < config.idealTemp[0] || w.temp > config.idealTemp[1])) {
          overallScore -= 15
          negatives.push(`Temperature outside ideal range for ${primaryIntent.name}`)
        }
        if (config.maxWind && w.wind > config.maxWind) {
          overallScore -= 10
          negatives.push(`Wind exceeds recommended limit for ${primaryIntent.name}`)
        }
        if (config.maxRain && w.precipitationProb > config.maxRain) {
          overallScore -= 15
          negatives.push(`Rain chance too high for ${primaryIntent.name}`)
        }
        if (config.maxCloudCover && w.cloudCover > config.maxCloudCover) {
          overallScore -= 20
          negatives.push(`Too cloudy for ${primaryIntent.name}`)
        }
        if (config.maxUV && w.uvIndex > config.maxUV) {
          overallScore -= 10
          negatives.push(`UV too high for ${primaryIntent.name}`)
        }
        if (config.minVisibility && w.visibility < config.minVisibility) {
          overallScore -= 15
          warnings.push(`Low visibility affects ${primaryIntent.name}`)
        }
      }
    }
    
    // Time of day scoring
    const hour = new Date().getHours()
    if (hour >= 11 && hour <= 15 && w.uvIndex > 6) {
      overallScore -= 10
      negatives.push('Peak UV hours - avoid direct sun exposure')
    }
    if (hour >= 6 && hour <= 9) {
      positives.push('Morning hours - good time for outdoor activities')
    }
    
    return {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      comfortScore,
      heatIndex,
      windChill,
      positives,
      negatives,
      warnings,
      recommendation: overallScore > 70 ? 'GO' : overallScore > 40 ? 'MIGHT' : 'NO',
      confidence: Math.min(95, 65 + (overallScore / 100) * 30)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MAIN BRAIN CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class ZephyeBrain {
  constructor() {
    this.initialized = true
  }

  async ask(question, weatherData) {
    const q = question.toLowerCase().trim()
    const data = { ...weatherData }

    // ─── STEP 1: Check for comparison mode ──────────────────────────────────
    const comparison = detectComparison(question)
    
    if (comparison) {
      return this.handleComparison(question, data, comparison)
    }

    // ─── STEP 2: Detect intents ──────────────────────────────────────────────
    const detectedIntents = detectIntents(q)
    
    console.log(`🧠 Intents:`, detectedIntents.map(d => 
      `${d.intent.name} (${d.score.toFixed(1)})`
    ).join(', '))

    // ─── STEP 3: Route & Traffic special handling ────────────────────────────
    if (detectedIntents.length === 0) {
      return this.handleFallback(question, data, q)
    }

    // ─── STEP 4: Parallel fetching of all intent responses ───────────────────
    const results = await Promise.all(
      detectedIntents.map(async (detected) => {
        try {
          // Handle route/traffic with location parsing
          if (detected.intent.id === 'route' || detected.intent.id === 'traffic') {
            return await this.handleRouteTraffic(question, data, detected)
          }
          
          const response = await detected.intent.fn(data, question)
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

    // ─── STEP 5: Fallback if no responses ────────────────────────────────────
    if (responses.length === 0) {
      const response = await getWeatherAdvice(data, question)
      const verdict = generateVerdict(question, data, { id: 'weather' })
      return {
        response: verdict ? `${verdict}\n\n${response}` : response,
        decision: null,
        facts: { weather: data },
        scores: null
      }
    }

    // ─── STEP 6: Generate verdict ────────────────────────────────────────────
    const primaryIntent = intents[0]?.intent
    let verdict = null
    
    if (primaryIntent) {
      verdict = generateVerdict(question, data, primaryIntent)
    }

    // ─── STEP 7: Merge or return single response ─────────────────────────────
    let mergedResponse = responses.length === 1 
      ? responses[0] 
      : mergeResponses(responses, intents, question)

    // ─── STEP 8: Enhance with scoring ────────────────────────────────────────
    const scores = ScoringEngine.score(data, question, intents)
    
    // Add score summary if not already present in merged response
    if (!mergedResponse.includes('Score:')) {
      const scoreSummary = `\n\n📊 **Score:** ${Math.round(scores.overallScore)}/100 (${scores.recommendation})`
      mergedResponse += scoreSummary
    }

    // Prepend verdict if available
    if (verdict && !mergedResponse.startsWith(verdict)) {
      mergedResponse = `${verdict}\n\n${mergedResponse}`
    }

    return {
      response: mergedResponse || responses[0],
      decision: {
        recommendation: scores.recommendation,
        score: scores.overallScore,
        confidence: scores.confidence
      },
      facts: { weather: data, scores },
      scores,
      intents: detectedIntents
    }
  }

  // ─── Comparison Handler ──────────────────────────────────────────────────

  async handleComparison(question, data, comparison) {
    const q = question.toLowerCase()
    const savedLocations = getSavedLocations()

    // Multi-time comparison
    if (comparison.type === 'multi_time') {
      const times = comparison.times
      const detectedIntents = detectIntents(q)
      
      if (detectedIntents.length === 0) {
        return {
          response: "I can compare multiple times. Try asking 'Compare today, tomorrow, and this weekend for stargazing?'",
          decision: null,
          facts: null,
          scores: null
        }
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
      
      let comparisonResponse = `📊 **Multi-Time Comparison:**\n\n`
      
      for (const result of results) {
        comparisonResponse += `**${result.time.toUpperCase()}:**\n${result.response}\n\n`
      }
      
      const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
      comparisonResponse += `**Verdict:** ${verdict}`
      
      return {
        response: comparisonResponse,
        decision: null,
        facts: null,
        scores: null
      }
    }
    
    // Location comparison
    if (comparison.type === 'location') {
      const locations = comparison.locations
      const detectedIntents = detectIntents(q)
      
      if (detectedIntents.length === 0) {
        return {
          response: "I can compare locations. Try asking 'Compare Lagos and Abuja weather?'",
          decision: null,
          facts: null,
          scores: null
        }
      }
      
      const primaryIntent = detectedIntents[0].intent
      const results = []
      
      for (const locName of locations) {
        const savedLoc = findSavedLocation(locName)
        if (!savedLoc) {
          return {
            response: `I couldn't find "${locName}" in your saved locations. Please save it first.`,
            decision: null,
            facts: null,
            scores: null
          }
        }
        
        const locData = { 
          ...data, 
          city: savedLoc.label,
          lat: savedLoc.lat,
          lon: savedLoc.lon
        }
        
        const response = await primaryIntent.fn(locData, question)
        const tempMatch = response.match(/(\d+)°C/)
        results.push({
          location: locName,
          response: extractKeyPoints(response, 4),
          temp: tempMatch ? parseInt(tempMatch[1]) : null
        })
      }
      
      let comparisonResponse = `📊 **Location Comparison:**\n\n`
      
      for (const result of results) {
        comparisonResponse += `**${result.location.toUpperCase()}:**\n${result.response}\n\n`
      }
      
      const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
      comparisonResponse += `**Verdict:** ${verdict}`
      
      return {
        response: comparisonResponse,
        decision: null,
        facts: null,
        scores: null
      }
    }
    
    // Activity comparison
    if (comparison.type === 'activity') {
      const activities = comparison.activities
      
      const activityToIntent = {
        'run': INTENT_MAP.find(i => i.id === 'sports'),
        'bike': INTENT_MAP.find(i => i.id === 'sports'),
        'cycle': INTENT_MAP.find(i => i.id === 'sports'),
        'drive': INTENT_MAP.find(i => i.id === 'driving'),
        'walk': INTENT_MAP.find(i => i.id === 'lifestyle'),
        'jog': INTENT_MAP.find(i => i.id === 'sports'),
        'hike': INTENT_MAP.find(i => i.id === 'sports'),
        'swim': INTENT_MAP.find(i => i.id === 'sports')
      }
      
      const results = []
      
      for (const activity of activities) {
        const intent = activityToIntent[activity]
        
        if (!intent) continue
        
        const activityQuestion = `Is it good for ${activity}?`
        const response = await intent.fn(data, activityQuestion)
        
        results.push({
          activity,
          response: extractKeyPoints(response, 4),
          icon: intent.icon
        })
      }
      
      if (results.length === 0) {
        return {
          response: "I couldn't compare those activities. Try 'Biking vs running today?'",
          decision: null,
          facts: null,
          scores: null
        }
      }
      
      let comparisonResponse = `📊 **Activity Comparison:**\n\n`
      
      for (const result of results) {
        comparisonResponse += `${result.icon} **${result.activity.toUpperCase()}:**\n${result.response}\n\n`
      }
      
      const verdict = generateComparisonVerdict(results, comparison, { id: 'sports' })
      comparisonResponse += `**Verdict:** ${verdict}`
      
      return {
        response: comparisonResponse,
        decision: null,
        facts: null,
        scores: null
      }
    }
    
    // Scenario comparison
    if (comparison.type === 'scenario') {
      const scenarios = comparison.scenarios
      const dest = comparison.destination
      
      const scenarioToIntent = {
        'drive': INTENT_MAP.find(i => i.id === 'driving'),
        'bike': INTENT_MAP.find(i => i.id === 'sports'),
        'cycle': INTENT_MAP.find(i => i.id === 'sports'),
        'walk': INTENT_MAP.find(i => i.id === 'lifestyle'),
        'run': INTENT_MAP.find(i => i.id === 'sports'),
        'commute': INTENT_MAP.find(i => i.id === 'route'),
        'travel': INTENT_MAP.find(i => i.id === 'route')
      }
      
      const results = []
      
      for (const scenario of scenarios) {
        const intent = scenarioToIntent[scenario]
        
        if (!intent) continue
        
        const scenarioQuestion = `${scenario} to ${dest}?`
        const response = await intent.fn(data, scenarioQuestion)
        
        results.push({
          scenario,
          response: extractKeyPoints(response, 4),
          icon: intent.icon
        })
      }
      
      if (results.length === 0) {
        return {
          response: "I couldn't compare those scenarios. Try 'Drive or bike to work?'",
          decision: null,
          facts: null,
          scores: null
        }
      }
      
      let comparisonResponse = `📊 **Scenario Comparison: ${dest.toUpperCase()}**\n\n`
      
      for (const result of results) {
        comparisonResponse += `${result.icon} **${result.scenario.toUpperCase()}:**\n${result.response}\n\n`
      }
      
      const verdict = generateComparisonVerdict(results, comparison, { id: 'route' })
      comparisonResponse += `**Verdict:** ${verdict}`
      
      return {
        response: comparisonResponse,
        decision: null,
        facts: null,
        scores: null
      }
    }
    
    // Standard two-time comparison
    const detectedIntents = detectIntents(q)
    
    if (detectedIntents.length === 0) {
      return {
        response: "I can compare times. Try asking 'Stargazing tonight vs tomorrow?'",
        decision: null,
        facts: null,
        scores: null
      }
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
    
    let comparisonResponse = `📊 **Comparison: ${comparison.time1} vs ${comparison.time2}**\n\n`
    
    for (const result of results) {
      comparisonResponse += `**${result.time.toUpperCase()}:**\n${result.response}\n\n`
    }
    
    const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
    comparisonResponse += `**Verdict:** ${verdict}`
    
    return {
      response: comparisonResponse,
      decision: null,
      facts: null,
      scores: null
    }
  }

  // ─── Route/Traffic Handler ──────────────────────────────────────────────

  async handleRouteTraffic(question, data, detected) {
    const q = question.toLowerCase()
    const savedLocations = getSavedLocations()
    
    // Parse from/to from question
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

    // Auto-detect location from question context
    if (!toLocation) {
      const words = q.split(/\s+/)
      for (const word of words) {
        const saved = findSavedLocation(word)
        if (saved) {
          toLocation = { ...saved, isSaved: true }
          break
        }
      }
    }

    if (toLocation && !fromLocation) fromLocation = 'home'

    // Traffic without destination
    if (detected.intent.id === 'traffic' && !toLocation) {
      const response = await detected.intent.fn(data, question)
      const verdict = generateVerdict(question, data, detected.intent)
      return { 
        response: verdict ? `${verdict}\n\n${response}` : response, 
        detected 
      }
    }

    // Route with destination
    if (toLocation) {
      const response = await detected.intent.fn(data, question, { 
        from: fromLocation, 
        to: toLocation, 
        savedLocations 
      })
      const verdict = generateVerdict(question, data, detected.intent)
      return { 
        response: verdict ? `${verdict}\n\n${response}` : response, 
        detected 
      }
    }

    // Fallback
    const response = await detected.intent.fn(data, question)
    return { response, detected }
  }

  // ─── Fallback Handler ───────────────────────────────────────────────────

  async handleFallback(question, data, q) {
    const routeKeywords = ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'eta', 'travel time', 'how far', 'navigate', 'commute', 'direction']
    const trafficKeywords = ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill', 'delay']
    const weatherKeywords = ['rain', 'storm', 'cloud', 'sun', 'wind', 'humid', 'cold', 'hot', 'weather', 'tomorrow', 'today', 'forecast', 'weekend', 'temperature']

    const hasRoute = routeKeywords.some(k => q.includes(k))
    const hasTraffic = trafficKeywords.some(k => q.includes(k))
    const hasWeather = weatherKeywords.some(k => q.includes(k))

    // Parse locations for route/traffic
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

    // Traffic fallback
    if (hasTraffic) {
      const response = await getTrafficAdvice(data, question)
      const verdict = generateVerdict(question, data, { id: 'traffic' })
      return {
        response: verdict ? `${verdict}\n\n${response}` : response,
        decision: null,
        facts: null,
        scores: null
      }
    }

    // Route fallback
    if (hasRoute && toLocation) {
      const response = await getRouteAdvice(data, question, { from: fromLocation, to: toLocation, savedLocations: getSavedLocations() })
      const verdict = generateVerdict(question, data, { id: 'route' })
      return {
        response: verdict ? `${verdict}\n\n${response}` : response,
        decision: null,
        facts: null,
        scores: null
      }
    }

    // Weather fallback
    if (hasWeather) {
      const response = await getWeatherAdvice(data, question)
      const verdict = generateVerdict(question, data, { id: 'weather' })
      return {
        response: verdict ? `${verdict}\n\n${response}` : response,
        decision: null,
        facts: null,
        scores: null
      }
    }

    // Ultimate fallback
    return {
      response: `I'm not sure what you're asking. Try asking about:\n\n🌡️ Weather: "Will it rain tomorrow?"\n👕 Clothing: "What should I wear?"\n🏃 Sports: "Can I go biking?"\n🌙 Stargazing: "Stargazing tonight?"\n🚗 Driving: "Safe to drive?"\n🚦 Traffic: "Traffic to work?"\n🗺️ Routes: "Route to [saved location]?"\n\nCurrent: ${data.temp}°C, ${data.condition}, wind ${data.wind} km/h`,
      decision: null,
      facts: { weather: data },
      scores: null
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

let brainInstance = null

export const getBrain = () => {
  if (!brainInstance) {
    brainInstance = new ZephyeBrain()
  }
  return brainInstance
}

export const askZephye = async (question, weatherData) => {
  const brain = getBrain()
  return brain.ask(question, weatherData)
}

export default ZephyeBrain
