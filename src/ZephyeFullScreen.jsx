import { useState, useEffect, useRef } from 'react'
import { useAudio } from './AudioContext'
import { getMoonPhase, mapWeatherCode } from './data/calculations.js'

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── HELPERS ────────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── ULTRA-SMART INTENT MAP ───────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const INTENT_MAP = [
  {
    id: 'weather',
    name: 'Weather',
    keys: ['rain', 'storm', 'weather', 'temperature', 'hot', 'cold', 'windy', 'humid', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'tonight', 'this week', 'weekend', 'forecast', 'snow', 'cloudy', 'clear', 'will it rain', 'temperature today', 'weather forecast', 'degrees', 'celsius', 'fahrenheit', 'precipitation', 'humidity', 'wind speed'],
    fn: getWeatherAdvice,
    priority: 1,
    section: '🌡️ Weather',
    keywords: ['weather', 'forecast', 'temperature', 'rain', 'storm']
  },
  {
    id: 'sports',
    name: 'Sports',
    keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog', 'tennis', 'golf', 'swim', 'hike', 'ski', 'marathon', 'safe to run', 'athlete', 'basketball', 'baseball', 'cycling', 'fitness', 'cardio', 'strength', 'physical', 'bike', 'biking', 'ride', 'mountain bike', 'road bike', 'peloton', 'spin', 'cyclist', 'trail run', 'track', 'sprint', 'workout', 'exercise', 'sports', 'game', 'match', 'tournament', 'practice', 'training', 'workout', 'fitness'],
    fn: getSportsAdvice,
    priority: 1,
    section: '🏃 Sports',
    keywords: ['bike', 'biking', 'ride', 'run', 'gym', 'exercise', 'sport', 'workout', 'training', 'game', 'football', 'tennis', 'swim', 'hike']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    keys: ['wear', 'clothes', 'outfit', 'clothing', 'dress', 'jacket', 'shirt', 'pants', 'layer', 'sweater', 'coat', 'shorts', 'sandals', 'hoodie', 'umbrella', 'raincoat', 'hat', 'gloves', 'scarf', 'what should i wear', 'dress code', 'fashion', 'style', 'formal', 'casual', 'sweatshirt', 't-shirt', 'sweatpants', 'leggings', 'athletic wear', 'running shoes', 'cycling kit'],
    fn: getClothingAdvice,
    priority: 2,
    section: '👕 Clothing',
    keywords: ['wear', 'clothes', 'outfit', 'dress', 'jacket', 'fashion', 'style']
  },
  {
    id: 'route',
    name: 'Route',
    keys: ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'trip', 'commute', 'eta', 'travel time', 'how far', 'navigate', 'direction', 'map', 'navigation', 'road trip', 'distance between', 'travel duration', 'way', 'bike route', 'cycling route', 'path', 'trail', 'route planner', 'shortest route', 'fastest route', 'scenic route'],
    fn: getRouteAdvice,
    priority: 2,
    section: '🗺️ Route',
    keywords: ['route', 'distance', 'how long', 'get to', 'from', 'to', 'directions', 'map', 'navigate']
  },
  {
    id: 'traffic',
    name: 'Traffic',
    keys: ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill', 'traffic conditions', 'is there traffic', 'traffic report', 'bumper to bumper', 'delay', 'construction traffic', 'road closure', 'car crash', 'bike lane blocked', 'cycle lane', 'traffic jam', 'stuck in traffic', 'rush hour', 'commute traffic'],
    fn: getTrafficAdvice,
    priority: 2,
    section: '🚦 Traffic',
    keywords: ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow']
  },
  {
    id: 'driving',
    name: 'Driving',
    keys: ['drive', 'driving', 'road', 'car', 'commute', 'trip car', 'highway', 'cycling', 'bike', 'motorbike', 'motorcycle', 'bicycle', 'fog', 'black ice', 'hydroplaning', 'safe to drive', 'vehicle', 'transport', 'freeway', 'intersection', 'road bike', 'bike on road', 'cycle lane', 'driving conditions', 'road conditions', 'pavement', 'roads'],
    fn: getDrivingAdvice,
    priority: 3,
    section: '🚗 Driving',
    keywords: ['drive', 'driving', 'road', 'car', 'vehicle', 'highway']
  },
  {
    id: 'health',
    name: 'Health',
    keys: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'headache', 'medical', 'migraine', 'arthritis', 'heart', 'diabetes', 'copd', 'breathing', 'safe to go outside', 'doctor', 'hospital', 'symptoms', 'medicine', 'condition', 'chronic', 'pain', 'injury', 'wellness', 'air quality', 'pollution', 'allergies', 'pollen', 'dust', 'smoke', 'fever', 'cough', 'sneeze'],
    fn: getHealthAdvice,
    priority: 3,
    section: '🏥 Health',
    keywords: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'breathing', 'air quality', 'pain']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    keys: ['lifestyle', 'mood', 'energy', 'vibe', 'feel', 'tired', 'productivity', 'motivation', 'jogging', 'walk', 'park', 'picnic', 'grill', 'bbq', 'bonfire', 'laundry', 'car wash', 'can i go', 'meditat', 'yoga', 'outdoor activity', 'leisure', 'recreation', 'fun', 'relax', 'exercise light', 'walking', 'bike ride', 'casual ride', 'leisure bike', 'hammock', 'read outside', 'garden', 'bird watching'],
    fn: getLifestyleAdvice,
    priority: 3,
    section: '🌿 Lifestyle',
    keywords: ['lifestyle', 'mood', 'walk', 'park', 'picnic', 'relax', 'leisure', 'bike ride']
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    keys: ['star', 'moon', 'astro', 'planet', 'meteor', 'telescope', 'night sky', 'constellation', 'milky way', 'galaxy', 'nebula', 'iss', 'aurora', 'comet', 'eclipse', 'stargazing', 'astronomy', 'space', 'satellite', 'shooting star', 'celestial', 'observatory', 'night vision', 'astrophotography', 'deep space'],
    fn: getStargazingAdvice,
    priority: 3,
    section: '🌙 Stargazing',
    keywords: ['star', 'moon', 'night sky', 'telescope', 'astronomy']
  },
  {
    id: 'farming',
    name: 'Farming',
    keys: ['farm', 'crop', 'plant', 'harvest', 'soil', 'irrigation', 'seed', 'garden', 'gardening', 'watering', 'lawn', 'fertilize', 'greenhouse', 'cow', 'chicken', 'livestock', 'poultry', 'yield', 'tractor', 'agriculture', 'orchard', 'ranch', 'cultivation', 'compost', 'mulch', 'prune', 'weed', 'pesticide', 'fertilizer'],
    fn: getFarmingAdvice,
    priority: 3,
    section: '🌾 Farming',
    keywords: ['farm', 'crop', 'plant', 'garden', 'soil', 'harvest']
  },
  {
    id: 'photography',
    name: 'Photography',
    keys: ['photo', 'camera', 'golden hour', 'shoot', 'picture', 'photography', 'lighting', 'lens', 'drone', 'portrait', 'landscape', 'macro', 'photoshoot', 'photos', 'photographer', 'composition', 'exposure', 'aperture', 'shutter speed', 'videography', 'visual', 'image', 'RAW', 'lightroom', 'photoshop', 'editing', 'sunset photo', 'sunrise photo'],
    fn: getPhotographyAdvice,
    priority: 3,
    section: '📸 Photography',
    keywords: ['photo', 'camera', 'photography', 'shoot', 'picture', 'lens']
  },
  {
    id: 'events',
    name: 'Events',
    keys: ['event', 'party', 'wedding', 'outdoor', 'bbq', 'picnic', 'gathering', 'concert', 'festival', 'ceremony', 'celebration', 'venue', 'birthday', 'anniversary', 'corporate', 'block party', 'fair', 'reception', 'social', 'occasion', 'gala', 'fundraiser', 'conference', 'meeting'],
    fn: getEventsAdvice,
    priority: 3,
    section: '🎉 Events',
    keywords: ['event', 'party', 'wedding', 'bbq', 'picnic', 'festival', 'concert']
  },
  {
    id: 'pets',
    name: 'Pets',
    keys: ['pet', 'dog', 'cat', 'walk', 'animal', 'puppy', 'kitten', 'paw', 'horse', 'bird', 'rabbit', 'chicken', 'fish pond', 'walk my dog', 'pet care', 'veterinarian', 'puppy training', 'cat care', 'dog walking', 'vet', 'animal shelter', 'wildlife', 'fish', 'hamster', 'guinea pig', 'reptile', 'snake'],
    fn: getPetsAdvice,
    priority: 3,
    section: '🐾 Pets',
    keywords: ['pet', 'dog', 'cat', 'animal', 'walk my dog', 'puppy']
  },
  {
    id: 'diy',
    name: 'DIY',
    keys: ['diy', 'build', 'concrete', 'paint', 'construction', 'renovation', 'hammer', 'drill', 'roof', 'deck', 'stain', 'woodwork', 'masonry', 'drywall', 'paint drying', 'home repair', 'fix', 'remodel', 'contractor', 'carpentry', 'plumbing', 'electrical', 'home improvement', 'handyman', 'project', 'saw', 'screwdriver', 'wrench', 'tool', 'workshop'],
    fn: getDIYConstructionAdvice,
    priority: 3,
    section: '🔧 DIY',
    keywords: ['diy', 'build', 'construction', 'paint', 'renovation', 'repair']
  },
  {
    id: 'energy',
    name: 'EnergyHome',
    keys: ['energy', 'power', 'solar', 'home', 'electricity', 'bill', 'ac', 'heating', 'hvac', 'dehumidifier', 'humidifier', 'thermostat', 'pipe', 'freeze', 'utility', 'electric', 'gas', 'insulation', 'efficiency', 'smart home', 'temperature control', 'climate control', 'savings', 'kwh', 'solar panel', 'inverter', 'battery', 'generator'],
    fn: getEnergyHomeAdvice,
    priority: 3,
    section: '⚡ Energy',
    keywords: ['energy', 'power', 'electricity', 'bill', 'ac', 'heating', 'solar']
  },
  {
    id: 'traveling',
    name: 'Traveling',
    keys: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport', 'tourist', 'pack', 'train', 'cruise', 'ferry', 'bus', 'road trip', 'flying', 'journey', 'traveling', 'destination', 'tourism', 'business trip', 'holiday', 'abroad', 'international', 'domestic', 'itinerary', 'layover', 'baggage', 'luggage', 'suitcase'],
    fn: getTravelingAdvice,
    priority: 3,
    section: '✈️ Travel',
    keywords: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport']
  },
  {
    id: 'skin_hair',
    name: 'SkinHair',
    keys: ['skin', 'hair', 'sunscreen', 'uv', 'sunburn', 'tan', 'spf', 'dry skin', 'frizzy', 'makeup', 'moisturize', 'acne', 'eczema', 'curl', 'frizz', 'blowout', 'beauty', 'skincare', 'hair care', 'beauty routine', 'cosmetics', 'face', 'scalp', 'complexion', 'rosacea', 'dandruff', 'oily skin', 'dry hair', 'curly hair', 'straight hair', 'shampoo', 'conditioner'],
    fn: getSkinHairAdvice,
    priority: 3,
    section: '💄 Beauty',
    keywords: ['skin', 'hair', 'sunscreen', 'makeup', 'beauty', 'skincare']
  }
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SCORING ENGINE ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const scoreQuestion = (question, intent) => {
  const q = question.toLowerCase()
  let score = 0
  const matched = []
  const exactMatches = []

  for (const key of intent.keys) {
    const keyLower = key.toLowerCase()
    if (q.includes(keyLower)) {
      // Longer keys = more specific = higher score
      const weight = Math.min(keyLower.length / 2, 5)
      score += weight
      matched.push(keyLower)
      if (keyLower.length > 8 && q.split(/\s+/).some(w => w === keyLower)) {
        exactMatches.push(keyLower)
        score += 3 // Bonus for exact word match
      }
    }
  }

  // Check for word overlap (partial matches)
  const words = q.split(/\s+/)
  for (const word of words) {
    if (word.length < 3) continue
    for (const key of intent.keys) {
      if (key.includes(word) && word.length > 2) {
        score += 1
      }
    }
  }

  // Priority bonus (higher priority = more likely)
  score += (10 - intent.priority) * 0.5

  return { score, matched, exactMatches }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MULTI-INTENT DETECTION ──────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const detectIntents = (question) => {
  const results = []
  const q = question.toLowerCase()
  
  // Score all intents
  for (const intent of INTENT_MAP) {
    const { score, matched } = scoreQuestion(q, intent)
    if (score > 1.5) {
      results.push({
        intent,
        score,
        matched,
        isPrimary: false
      })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  // Determine primary intent (highest score)
  if (results.length > 0) {
    results[0].isPrimary = true
  }

  // Return top 2-3 intents if they're close in score
  const primaryScore = results[0]?.score || 0
  const selected = results.filter(r => r.score > primaryScore * 0.4)
  
  return selected.slice(0, 3) // Max 3 intents
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── RESPONSE MERGER ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const mergeResponses = (responses, intents, question) => {
  if (responses.length === 0) return null
  if (responses.length === 1) return responses[0]

  // Extract key sections from each response
  const sections = []
  const allLines = []
  const warnings = []
  const bottomLines = []

  for (let i = 0; i < responses.length; i++) {
    const text = responses[i]
    const intent = intents[i]?.intent
    const isPrimary = intents[i]?.isPrimary || false

    // Split into lines
    const lines = text.split('\n').filter(l => l.trim())
    
    // Extract the section header if present
    const sectionHeader = intent?.section || `📌 ${intent?.name || 'Advice'}`

    let sectionLines = []
    let warningLines = []
    let bottomLine = ''

    for (const line of lines) {
      if (line.includes('⚠️') || line.includes('WARNING') || line.includes('🚨')) {
        warningLines.push(line)
      } else if (line.includes('BOTTOM LINE') || line.includes('Bottom Line') || line.includes('💡')) {
        bottomLine = line
      } else if (!line.includes('---') && !line.includes('===') && !line.includes('Conditions') && line.trim().length > 3) {
        sectionLines.push(line)
      }
    }

    sections.push({
      header: sectionHeader,
      lines: sectionLines.slice(0, 6), // Limit to 6 lines per section
      warnings: warningLines,
      bottomLine: bottomLine,
      isPrimary,
      raw: text
    })
  }

  // Build merged response
  let merged = ``
  
  // Add the primary section first (full)
  const primary = sections.find(s => s.isPrimary) || sections[0]
  if (primary) {
    merged += `${primary.header}\n`
    merged += primary.lines.join('\n')
    merged += '\n\n'
  }

  // Add secondary sections (condensed)
  const secondary = sections.filter(s => !s.isPrimary)
  if (secondary.length > 0) {
    merged += `📋 **Also consider:**\n\n`
    for (const sec of secondary) {
      merged += `${sec.header}\n`
      // Only show the most important lines (first 3)
      const topLines = sec.lines.slice(0, 3)
      merged += topLines.join('\n')
      if (sec.lines.length > 3) {
        merged += `\n  ... and ${sec.lines.length - 3} more items`
      }
      merged += '\n\n'
    }
  }

  // Add warnings section (deduplicated)
  const allWarnings = []
  for (const sec of sections) {
    for (const w of sec.warnings) {
      if (!allWarnings.some(existing => existing.includes(w.substring(0, 20)))) {
        allWarnings.push(w)
      }
    }
  }

  if (allWarnings.length > 0) {
    merged += `⚠️ **Warnings:**\n`
    for (const w of allWarnings.slice(0, 5)) {
      merged += `${w}\n`
    }
    if (allWarnings.length > 5) {
      merged += `... and ${allWarnings.length - 5} more warnings\n`
    }
    merged += '\n'
  }

  // Add bottom line (use primary, or merge)
  const bottomLinesList = sections.map(s => s.bottomLine).filter(Boolean)
  if (bottomLinesList.length > 0) {
    merged += `💡 **Bottom Line:**\n`
    merged += bottomLinesList[0]
    if (bottomLinesList.length > 1) {
      merged += `\n• ${bottomLinesList.slice(1).join('\n• ')}`
    }
    merged += '\n'
  }

  return merged
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── GHOST SUGGESTIONS ─────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const getDynamicSuggestions = () => {
  const savedLocs = getSavedLocations()
  const suggestions = [
    'Ask "stargazing tonight" or "moon phase"',
    'Try "what should I wear" or "safe to run"',
    'Ask "will it rain" or "UV burn time"',
    'Type "paint drying time" or "best photo hour"',
    'Ask "will it rain tomorrow at 2 PM"',
    'Try "farming advice" or "should I water"',
    'Ask "can I go biking" or "traffic to work"'
  ]
  
  if (savedLocs.length > 0) {
    const locNames = savedLocs.map(l => l.label || 'Untitled').filter(Boolean)
    if (locNames.length > 0) {
      suggestions.push(`Ask "route to ${locNames[0]}" or "traffic to ${locNames[0]}"`)
    }
    if (locNames.length > 1) {
      suggestions.push(`Ask "route from ${locNames[0]} to ${locNames[1]}"`)
    }
  }
  
  return suggestions
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
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

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const temp = Math.round(weather?.current?.temperature_2m || 0)
  const humidity = weather?.current?.relative_humidity_2m
  const wind = weather?.current?.wind_speed_10m
  const uv = weather?.current?.uv_index || weather?.daily?.uv_index_max?.[0]
  const conditionCode = weather?.current?.weather_code

  useEffect(() => {
    if (isOpen) {
      setSavedLocations(getSavedLocations())
    }
  }, [isOpen])

  function getAqiLevel(aqi) {
    if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
    if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
    if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
    if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316' }
    return { label: 'Hazardous', color: '#ef4444' }
  }

  const aqiLevel = getAqiLevel(aqi?.us_aqi)

  useEffect(() => {
    if (isOpen && location?.lat && location?.lon) {
      getMoonPhase(location.lat, location.lon).then(setMoonPhase)
    }
  }, [isOpen, location])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const condition = mapWeatherCode(conditionCode)
      setMessages([
        {
          role: 'assistant',
          content: `${greeting}, ${userName || location?.name?.split(',')[0] || 'there'}\n${location?.name || 'Your location'}\n${temp}°C • ${condition} • AQI ${aqiLevel.label}`
        }
      ])
    }
  }, [isOpen])

  useEffect(() => {
    if (input) {
      setGhostText('')
      return
    }
    
    const suggestions = getDynamicSuggestions()
    let i = 0
    setGhostText(suggestions[0])
    const interval = setInterval(() => {
      i = (i + 1) % suggestions.length
      setGhostText(suggestions[i])
    }, 3000)
    return () => clearInterval(interval)
  }, [input, savedLocations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── SMART ROUTING ENGINE ────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const routeQuestion = async (question) => {
    const q = question.toLowerCase()
    const data = {
      temp,
      feelsLike: weather?.current?.apparent_temperature || temp,
      humidity,
      wind,
      windDir: weather?.current?.wind_direction_10m,
      uvIndex: uv,
      aqi: aqi?.us_aqi,
      visibility: weather?.current?.visibility ? weather.current.visibility / 1000 : 10,
      conditionCode,
      condition: mapWeatherCode(conditionCode),
      pressure: weather?.current?.pressure_msl,
      precipitation: weather?.current?.precipitation || 0,
      city: location?.name,
      lat: location?.lat,
      lon: location?.lon,
      sunrise: weather?.daily?.sunrise?.[0],
      sunset: weather?.daily?.sunset?.[0],
      solarRadiation: weather?.current?.shortwave_radiation,
      tempMax: weather?.daily?.temperature_2m_max?.[0],
      tempMin: weather?.daily?.temperature_2m_min?.[0],
      moonPhase,
      dewPoint: weather?.current?.dew_point,
      windGust: weather?.current?.wind_gusts_10m || weather?.hourly?.wind_gusts_10m?.[0],
      precipitationProbability: weather?.hourly?.precipitation_probability?.[0],
      visibilityCategory: weather?.current?.visibility ? (weather.current.visibility / 1000 < 1 ? 'fog' : weather.current.visibility / 1000 < 5 ? 'poor' : 'good') : 'good',
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
      season: ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'][new Date().getMonth()],
      hourly: weather?.hourly || {},
      homeLat: location?.lat,
      homeLon: location?.lon,
      homeName: location?.name,
      savedLocations: savedLocations
    }

    // ─── Detect all intents ──────────────────────────────────────────────
    const detectedIntents = detectIntents(q)
    
    console.log(`🧠 Detected intents:`, detectedIntents.map(d => `${d.intent.name} (${d.score.toFixed(1)})`).join(', '))

    // ─── If no intents detected ──────────────────────────────────────────
    if (detectedIntents.length === 0) {
      // Check for route/traffic keywords
      const routeKeywords = ['route', 'how long', 'distance', 'drive', 'driving time', 'get to', 'from', 'to', 'eta', 'travel time', 'how far', 'navigate', 'commute']
      const trafficKeywords = ['traffic', 'accident', 'jam', 'congestion', 'gridlock', 'slow', 'standstill', 'traffic conditions']

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
          if (savedFrom) {
            fromLocation = { ...savedFrom, isSaved: true }
          } else {
            fromLocation = fromName
          }
        }

        if (toMatch) {
          const toName = toMatch[1].trim()
          const savedTo = findSavedLocation(toName)
          if (savedTo) {
            toLocation = { ...savedTo, isSaved: true }
          } else {
            toLocation = toName
          }
        }

        if (toLocation && !fromLocation) {
          fromLocation = 'home'
        }

        if (hasTraffic && !toLocation) {
          return await getTrafficAdvice(data, question, {})
        }

        if (hasRoute && toLocation) {
          return await getRouteAdvice(data, question, { from: fromLocation, to: toLocation, savedLocations })
        }
      }

      // Weather fallback
      if (q.match(/rain|storm|cloud|sun|wind|humid|cold|hot|weather|tomorrow|today|forecast|weekend|temperature/)) {
        return await getWeatherAdvice(data, question)
      }

      // Default response
      return `I'm not sure what you're asking. Try asking about weather, clothing, routes, traffic, sports, farming, stargazing, or health. Current temp is ${temp}°C.`
    }

    // ─── Get responses for all detected intents ──────────────────────────
    const responses = []
    const intents = []

    for (const detected of detectedIntents) {
      try {
        const response = await detected.intent.fn(data, question)
        responses.push(response)
        intents.push(detected)
      } catch (e) {
        console.error(`Error getting advice for ${detected.intent.name}:`, e)
      }
    }

    // ─── If no responses, fallback ──────────────────────────────────────
    if (responses.length === 0) {
      return await getWeatherAdvice(data, question)
    }

    // ─── If only one response, return it directly ──────────────────────
    if (responses.length === 1) {
      return responses[0]
    }

    // ─── Merge multiple responses ──────────────────────────────────────
    const merged = mergeResponses(responses, intents, question)
    return merged || responses[0]
  }

  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
  // ─── HANDLE ASK ──────────────────────────────────────────────────────────
  // ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

  const handleAsk = async (question) => {
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
        await new Promise(r => setTimeout(r, 20))
      }

      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
      setStreamingText('')

      if (voiceToUse) speakText(answer)

    } catch (e) {
      const fallback = `Error getting advice. Current temp is ${temp}°C with ${mapWeatherCode(conditionCode)}.`
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = async (text) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }
    try {
      const res = await fetch('https://hyezen.onrender.com/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceToUse, type: 'fair' })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`https://hyezen.onrender.com${data.url}`, voiceToUse)
      }
    } catch {}
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
  }

  const startListening = () => {
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
  }

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

  // ─── Quick Action Chips ──────────────────────────────────────────────────

  const getQuickActionChips = () => {
    const chips = [
      'Will it rain tomorrow?',
      'What should I wear?',
      'Stargazing tonight?',
      'Farming advice?',
      'Safe to drive?',
      'Traffic incidents near me?',
      'Can I go biking?'
    ]

    const savedLocs = savedLocations.slice(0, 2)
    if (savedLocs.length > 0) {
      const label = savedLocs[0].label || 'saved location'
      chips.push(`Route to ${label}?`)
      chips.push(`Traffic to ${label}?`)
    }
    if (savedLocs.length > 1) {
      const label1 = savedLocs[0].label || 'location 1'
      const label2 = savedLocs[1].label || 'location 2'
      chips.push(`Route from ${label1} to ${label2}?`)
    }

    return chips
  }

  return (
    <div className="ai-fullscreen">
      {/* HEADER */}
      <div className="ai-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 10px' }}>
            ←
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="capsule-switch">
            <button
              className={`capsule-option ${activeTab === 'ask' ? 'active' : ''}`}
              onClick={() => setActiveTab('ask')}
            >
              Ask Zephye
            </button>
            <button
              className="capsule-option pro"
              onClick={() => {}}
              title="Pro — coming soon"
            >
              Pro
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="weather-badge">
            <span>{location?.name?.split(',')[0] || 'City'}</span>
            <span>{temp}°C</span>
            <span className="aqi-badge">{aqiLevel.label}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      {messages.length <= 1 && (
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          padding: '10px 16px', 
          overflowX: 'auto',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {getQuickActionChips().map((q, i) => (
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
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* BODY (messages) */}
      <div className="ai-body">
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', marginBottom: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="msg-actions-top">
                    <button
                      className="speak-btn"
                      onClick={() => speakText(msg.content)}
                      title={isSpeaking ? 'Stop' : 'Speak'}
                    >
                      {isSpeaking ? '⏹️' : '🔊'}
                    </button>
                    <button
                      className="speak-btn"
                      onClick={() => copyText(msg.content)}
                      title="Copy"
                    >
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
              <div className="chat-bubble ai">
                {streamingText}▋
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div className="chat-bubble ai text-muted">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA */}
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
            <button
              className="mic-btn"
              onClick={startListening}
              title="Voice input"
            >
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
        .capsule-option.pro::after {
          content: ' 🔒';
          font-size: 10px;
          opacity: 0.6;
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
        }
      `}</style>
    </div>
  )
}
