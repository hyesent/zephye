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
  MAX_INTENTS: 3,
  MIN_SCORE_THRESHOLD: 1.5,
  SECONDARY_THRESHOLD: 0.35,
  MAX_SECONDARY_LINES: 4,
  MAX_WARNINGS: 8,
  TTS_API: 'https://hyezen.onrender.com/api/tts'
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

// ─── INTENT MAP ───────────────────────────────────────────────────────────

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
    keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog', 'tennis', 'golf', 'swim', 'hike', 'ski', 'marathon', 'safe to run', 'athlete', 'basketball', 'baseball', 'cycling', 'fitness', 'cardio', 'strength', 'physical', 'bike', 'biking', 'ride', 'mountain bike', 'road bike', 'peloton', 'spin', 'cyclist', 'trail run', 'track', 'sprint', 'workout', 'exercise', 'sports', 'game', 'match', 'tournament', 'practice', 'training', 'fitness'],
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

    if (warningBuffer.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if ((trimmed.includes('⚠️') || trimmed.includes('WARNING') || trimmed.includes('🚨')) &&
            !trimmed.includes('⚠️ **Warnings:**') && !trimmed.includes('⚠️ **Warning:')) {
          warningBuffer.push(trimmed)
        }
      }
    }

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

// ─── SUGGESTIONS ENGINE ──────────────────────────────────────────────────

const getDynamicSuggestions = (savedLocations = []) => {
  const base = [
    'Ask "stargazing tonight" or "moon phase"',
    'Try "what should I wear" or "safe to run"',
    'Ask "will it rain" or "UV burn time"',
    'Type "paint drying time" or "best photo hour"',
    'Compare "today vs tomorrow" for anything',
    'Ask "biking vs running today?"',
    'Try "drive or bike to work?"'
  ]
  
  const suggestions = [...base]
  
  if (savedLocations.length > 0) {
    const locNames = savedLocations.map(l => l.label || 'Untitled').filter(Boolean)
    if (locNames.length > 0) {
      suggestions.push(`Route to ${locNames[0]}?`)
      suggestions.push(`Traffic to ${locNames[0]}?`)
    }
    if (locNames.length > 1) {
      suggestions.push(`Compare ${locNames[0]} and ${locNames[1]} weather?`)
      suggestions.push(`Route from ${locNames[0]} to ${locNames[1]}?`)
    }
  }
  
  return suggestions
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
    'evening', 'morning', 'afternoon', 'night',
    'weekend', 'weekday', 'monday', 'tuesday', 
    'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'tonight', 'this morning', 'this afternoon', 'this evening',
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
      
      if (tempValues.some(v => v !== null && v !== undefined)) {
        const temps = tempValues.filter(v => v !== null && v !== undefined).map(Number)
        if (temps.length > 1) {
          const max = Math.max(...temps)
          const min = Math.min(...temps)
          const diff = max - min
          if (diff > 5) {
            const hottest = times[tempValues.indexOf(max)]
            verdict += `Temperature: ${hottest} is hottest at ${max}°C. `
          }
        }
      }
      
      if (rainValues.some(v => v !== null && v !== undefined)) {
        const rains = rainValues.filter(v => v !== null && v !== undefined).map(Number)
        if (rains.length > 1) {
          const max = Math.max(...rains)
          const min = Math.min(...rains)
          if (max > 50 && min < 30) {
            const rainiest = times[rainValues.indexOf(max)]
            const driest = times[rainValues.indexOf(min)]
            verdict += `Rain: ${rainiest} is rainier (${max}%) than ${driest} (${min}%). `
          }
        }
      }
      
      if (!verdict) {
        const timeList = times.join(', ')
        verdict = `The conditions across ${timeList} are similar. Check the details above for specifics.`
      }
      break
    }
    
    case 'location': {
      const locs = comparison.locations
      verdict = `Comparing ${locs.join(' and ')}. Weather can vary significantly between locations.`
      break
    }
    
    case 'activity': {
      const activities = comparison.activities
      verdict = `Comparing ${activities.join(' vs ')}. Consider weather impact on each activity.`
      break
    }
    
    case 'scenario': {
      const scenarios = comparison.scenarios
      const dest = comparison.destination
      verdict = `Comparing ${scenarios.join(' vs ')} to ${dest}. Consider time, weather, and traffic for each option.`
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
    
    const suggestions = getDynamicSuggestions(savedLocations)
    let i = 0
    setGhostText(suggestions[0])
    
    ghostIntervalRef.current = setInterval(() => {
      i = (i + 1) % suggestions.length
      setGhostText(suggestions[i])
    }, 3000)
    
    return () => {
      if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current)
    }
  }, [input, savedLocations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

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
      'Biking vs running today?'
    ]

    const locs = savedLocations.slice(0, 2)
    if (locs.length > 0) {
      chips.push(`Route to ${locs[0].label || 'saved location'}?`)
      chips.push(`Traffic to ${locs[0].label || 'saved location'}?`)
    }
    if (locs.length > 1) {
      chips.push(`Compare ${locs[0].label} and ${locs[1].label} weather?`)
      chips.push(`Route from ${locs[0].label} to ${locs[1].label}?`)
    }

    return chips
  }, [savedLocations])

  // ─── Speaking ─────────────────────────────────────────────────────────

  const speakText = useCallback(async (text) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }
    try {
      const res = await fetch(CONFIG.TTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceToUse, type: 'fair' })
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
    const data = weatherData

    // ─── Check for comparison mode ──────────────────────────────────────
    const comparison = detectComparison(question)
    
    if (comparison) {
      console.log(`🔀 Comparison detected:`, comparison)
      
      // ─── Multi-time comparison ──────────────────────────────────────
      if (comparison.type === 'multi_time') {
        const times = comparison.times
        const detectedIntents = detectIntents(q)
        
        if (detectedIntents.length === 0) {
          return "I can compare multiple times. Try asking 'Compare today, tomorrow, and this weekend for stargazing?'"
        }
        
        const primaryIntent = detectedIntents[0].intent
        const results = []
        
        for (const time of times) {
          const timeData = { ...data, _timeContext: time }
          const response = await primaryIntent.fn(timeData, question)
          const tempMatch = response.match(/(\d+)°C/)
          const rainMatch = response.match(/(\d+)% rain/i)
          results.push({
            time,
            response: extractKeyPoints(response, 4),
            temp: tempMatch ? parseInt(tempMatch[1]) : null,
            rain: rainMatch ? parseInt(rainMatch[1]) : null
          })
        }
        
        let comparisonResponse = `📊 **Multi-Time Comparison:**\n\n`
        
        for (const result of results) {
          comparisonResponse += `**${result.time.toUpperCase()}:**\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
        comparisonResponse += `**Verdict:** ${verdict}`
        
        return comparisonResponse
      }
      
      // ─── Location comparison ──────────────────────────────────────────
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
          
          const locData = { 
            ...data, 
            _locationContext: locName,
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
        
        return comparisonResponse
      }
      
      // ─── Activity comparison ──────────────────────────────────────────
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
            response: extractKeyPoints(response, 4),
            icon: intent.icon
          })
        }
        
        if (results.length === 0) {
          return "I couldn't compare those activities. Try 'Biking vs running today?'"
        }
        
        let comparisonResponse = `📊 **Activity Comparison:**\n\n`
        
        for (const result of results) {
          comparisonResponse += `${result.icon} **${result.activity.toUpperCase()}:**\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, { id: 'sports' })
        comparisonResponse += `**Verdict:** ${verdict}`
        
        return comparisonResponse
      }
      
      // ─── Scenario comparison ──────────────────────────────────────────
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
            response: extractKeyPoints(response, 4),
            icon: intent.icon
          })
        }
        
        if (results.length === 0) {
          return "I couldn't compare those scenarios. Try 'Drive or bike to work?'"
        }
        
        let comparisonResponse = `📊 **Scenario Comparison: ${dest.toUpperCase()}**\n\n`
        
        for (const result of results) {
          comparisonResponse += `${result.icon} **${result.scenario.toUpperCase()}:**\n${result.response}\n\n`
        }
        
        const verdict = generateComparisonVerdict(results, comparison, { id: 'route' })
        comparisonResponse += `**Verdict:** ${verdict}`
        
        return comparisonResponse
      }
      
      // ─── Standard two-time comparison ────────────────────────────────
      const detectedIntents = detectIntents(q)
      
      if (detectedIntents.length === 0) {
        return "I can compare times. Try asking 'Stargazing tonight vs tomorrow?'"
      }
      
      const primaryIntent = detectedIntents[0].intent
      const results = []
      
      const time1Data = { ...data, _timeContext: comparison.time1 }
      const time2Data = { ...data, _timeContext: comparison.time2 }
      
      const [response1, response2] = await Promise.all([
        primaryIntent.fn(time1Data, question),
        primaryIntent.fn(time2Data, question)
      ])
      
      const temp1 = response1.match(/(\d+)°C/)
      const temp2 = response2.match(/(\d+)°C/)
      const rain1 = response1.match(/(\d+)% rain/i)
      const rain2 = response2.match(/(\d+)% rain/i)
      
      results.push({
        time: comparison.time1,
        response: extractKeyPoints(response1, 4),
        temp: temp1 ? parseInt(temp1[1]) : null,
        rain: rain1 ? parseInt(rain1[1]) : null
      })
      
      results.push({
        time: comparison.time2,
        response: extractKeyPoints(response2, 4),
        temp: temp2 ? parseInt(temp2[1]) : null,
        rain: rain2 ? parseInt(rain2[1]) : null
      })
      
      let comparisonResponse = `📊 **Comparison: ${comparison.time1} vs ${comparison.time2}**\n\n`
      
      for (const result of results) {
        comparisonResponse += `**${result.time.toUpperCase()}:**\n${result.response}\n\n`
      }
      
      const verdict = generateComparisonVerdict(results, comparison, primaryIntent)
      comparisonResponse += `**Verdict:** ${verdict}`
      
      return comparisonResponse
    }

    // ─── NORMAL FLOW ──────────────────────────────────────────────────────
    const detectedIntents = detectIntents(q)
    
    console.log(`🧠 Intents:`, detectedIntents.map(d => 
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

    // ─── PARALLEL FETCHING ──────────────────────────────────────────────
    const results = await Promise.all(
      detectedIntents.map(async (detected) => {
        try {
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
              Pro
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="weather-badge">
            <span>{location?.name?.split(',')[0] || 'City'}</span>
            <span>{weatherData.temp}°C</span>
            <span className="aqi-badge">{aqiLevel.label}</span>
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
                      {isSpeaking ? '⏹️' : '🔊'}
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
