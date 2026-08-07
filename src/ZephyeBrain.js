// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── ZEPHYE BRAIN v2.0 - Complete Architecture ──────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ============================================================================
// 1. SEMANTIC PARSER - Extracts meaning from natural language
// ============================================================================

const SemanticParser = {
  extractIntent: (question) => {
    const q = question.toLowerCase()
    const intents = []
    
    const activityMap = {
      'sports': { keywords: ['run', 'jog', 'marathon', 'sprint', 'track', 'gym', 'workout', 'exercise', 'fitness', 'cardio', 'training', 'practice'], weight: 1.0 },
      'football': { keywords: ['football', 'soccer', 'pitch', 'goal', 'match'], weight: 1.2 },
      'basketball': { keywords: ['basketball', 'hoop', 'court'], weight: 1.2 },
      'tennis': { keywords: ['tennis', 'racket', 'serve', 'volley'], weight: 1.2 },
      'golf': { keywords: ['golf', 'tee', 'green', 'course'], weight: 1.2 },
      'cycling': { keywords: ['bike', 'cycle', 'cycling', 'ride', 'mountain bike'], weight: 1.1 },
      'swimming': { keywords: ['swim', 'pool', 'lap', 'water'], weight: 1.1 },
      'hiking': { keywords: ['hike', 'trail', 'trek', 'mountain'], weight: 1.1 },
      'skiing': { keywords: ['ski', 'snowboard', 'slope', 'resort'], weight: 1.1 },
      'painting': { keywords: ['paint', 'painting', 'brush', 'roller', 'spray', 'color'], weight: 1.0 },
      'concrete': { keywords: ['concrete', 'cement', 'pour', 'foundation', 'slab'], weight: 1.0 },
      'woodworking': { keywords: ['wood', 'carpentry', 'saw', 'drill', 'furniture', 'cabinet'], weight: 1.0 },
      'roofing': { keywords: ['roof', 'shingle', 'gutter', 'solar'], weight: 1.0 },
      'driving': { keywords: ['drive', 'driving', 'car', 'commute', 'road trip'], weight: 1.2 },
      'flight': { keywords: ['fly', 'flight', 'plane', 'airport', 'travel', 'trip'], weight: 1.2 },
      'route': { keywords: ['route', 'direction', 'map', 'navigate', 'get to', 'how long', 'distance', 'from', 'to'], weight: 1.3 },
      'traffic': { keywords: ['traffic', 'congestion', 'jam', 'accident', 'delay', 'slow'], weight: 1.3 },
      'health': { keywords: ['health', 'allergy', 'asthma', 'cold', 'flu', 'breathing', 'sick', 'pain', 'headache', 'migraine'], weight: 1.2 },
      'skin': { keywords: ['skin', 'sunscreen', 'uv', 'sunburn', 'rash', 'eczema', 'psoriasis', 'dry skin', 'acne'], weight: 1.0 },
      'hair': { keywords: ['hair', 'frizz', 'curl', 'dry', 'oily', 'scalp', 'damage', 'color', 'humidity'], weight: 1.0 },
      'walking': { keywords: ['walk', 'stroll', 'park', 'nature', 'garden'], weight: 1.0 },
      'pet': { keywords: ['dog', 'cat', 'pet', 'walk dog', 'puppy', 'animal', 'paw'], weight: 1.0 },
      'photography': { keywords: ['photo', 'camera', 'shoot', 'golden hour', 'picture', 'lens'], weight: 1.0 },
      'stargazing': { keywords: ['star', 'moon', 'telescope', 'astronomy', 'galaxy', 'night sky', 'planet', 'milky way'], weight: 1.2 },
      'event': { keywords: ['event', 'party', 'wedding', 'bbq', 'picnic', 'concert', 'festival'], weight: 1.0 },
      'farming': { keywords: ['farm', 'crop', 'plant', 'harvest', 'garden', 'soil', 'irrigation', 'seed'], weight: 1.0 },
      'energy': { keywords: ['energy', 'ac', 'heating', 'solar', 'bill', 'electricity', 'power'], weight: 1.0 }
    }
    
    for (const [activity, config] of Object.entries(activityMap)) {
      let score = 0
      const matched = []
      for (const keyword of config.keywords) {
        if (q.includes(keyword)) {
          const wordWeight = Math.min(keyword.length / 3, 3)
          score += wordWeight * config.weight
          matched.push(keyword)
        }
      }
      if (score > 1.5) {
        intents.push({ activity, score, matched, confidence: Math.min(score / 5, 1) })
      }
    }
    
    intents.sort((a, b) => b.score - a.score)
    
    return {
      primary: intents[0] || { activity: 'generic', score: 0, confidence: 0 },
      secondary: intents.slice(1, 3),
      all: intents
    }
  },
  
  extractTime: (question) => {
    const q = question.toLowerCase()
    const now = new Date()
    
    const timeContexts = {
      today: { keywords: ['today', 'this day'], offset: 0 },
      tomorrow: { keywords: ['tomorrow', 'tmr', 'next day'], offset: 1 },
      tonight: { keywords: ['tonight', 'this night', 'this evening'], offset: 0, hour: 21 },
      morning: { keywords: ['morning', 'am', 'sunrise', 'dawn'], hour: 9 },
      afternoon: { keywords: ['afternoon', 'pm', 'noon'], hour: 14 },
      evening: { keywords: ['evening', 'sunset', 'dusk'], hour: 19 },
      night: { keywords: ['night', 'midnight', 'late'], hour: 23 },
      weekend: { keywords: ['weekend', 'sat', 'sun', 'saturday', 'sunday'], offset: 'weekend' },
      weekday: { keywords: ['weekday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'], offset: 'weekday' },
      this_week: { keywords: ['this week'], offset: 'week' },
      next_week: { keywords: ['next week'], offset: 7 },
      rush_hour: { keywords: ['rush hour', 'commute time', 'peak hour'], hour: 8 }
    }
    
    let bestMatch = { type: 'now', offset: 0, hour: now.getHours() }
    let bestScore = 0
    
    for (const [type, config] of Object.entries(timeContexts)) {
      for (const keyword of config.keywords) {
        if (q.includes(keyword)) {
          const score = keyword.length / 2
          if (score > bestScore) {
            bestScore = score
            bestMatch = { type, offset: config.offset || 0, hour: config.hour || null }
          }
        }
      }
    }
    
    const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2]) || 0
      const ampm = timeMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      bestMatch.hour = hour
      bestMatch.minute = minute
    }
    
    return bestMatch
  },
  
  extractLocation: (question) => {
    const q = question.toLowerCase()
    const locationPatterns = [
      /(?:in|at|near|around)\s+([\w\s]+?)(?:\?|$|\.|,|\s+for|\s+with|\s+and)/i,
      /(?:to|from)\s+([\w\s]+?)(?:\s+to|\s+for|\?|$)/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = q.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    return null
  },
  
  extractConstraints: (question) => {
    const q = question.toLowerCase()
    const constraints = []
    
    const constraintMap = {
      safety: ['safe', 'danger', 'risky', 'accident', 'injure', 'dangerous'],
      speed: ['fast', 'quick', 'shortest', 'time', 'efficient', 'delay', 'late'],
      comfort: ['comfort', 'comfortable', 'easy', 'relax', 'convenient', 'enjoy'],
      health: ['health', 'allergy', 'breathing', 'asthma', 'sick', 'pain'],
      cost: ['cheap', 'cost', 'price', 'money', 'expensive', 'save'],
      exercise: ['exercise', 'workout', 'fit', 'fitness', 'health', 'active'],
      quality: ['best', 'perfect', 'ideal', 'good', 'beautiful'],
      weather: ['rain', 'sun', 'wind', 'hot', 'cold', 'storm']
    }
    
    for (const [constraint, keywords] of Object.entries(constraintMap)) {
      for (const keyword of keywords) {
        if (q.includes(keyword)) {
          constraints.push(constraint)
          break
        }
      }
    }
    
    return constraints
  },
  
  extractComparison: (question) => {
    const q = question.toLowerCase()
    
    const timeWords = ['today', 'tomorrow', 'now', 'later', 'tonight', 'morning', 'afternoon', 'evening', 'night', 'weekend', 'weekday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const compareWords = ['vs', 'versus', 'compare', 'difference', 'or', 'vs.', 'and', 'better', 'best', 'rather']
    
    const hasCompare = compareWords.some(w => q.includes(w))
    const foundTimes = timeWords.filter(w => q.includes(w))
    
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
    
    return null
  }
}

// ============================================================================
// 2. USER MEMORY ENGINE
// ============================================================================

class UserMemoryEngine {
  constructor() {
    this.profile = this.loadProfile()
  }
  
  loadProfile() {
    try {
      const saved = localStorage.getItem('zephye_user_profile_v2')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {}
    
    return {
      health: {
        asthma: false,
        allergies: false,
        heatSensitive: false,
        coldSensitive: false,
        respiratory: false,
        skinSensitive: false,
        conditions: []
      },
      preferences: {
        preferBike: 0.5,
        preferDrive: 0.5,
        preferWalk: 0.3,
        preferPublic: 0.2,
        tolerateRain: 0.5,
        tolerateHeat: 0.5,
        tolerateCold: 0.5,
        exercisePriority: 0.5,
        speedPriority: 0.5,
        comfortPriority: 0.5,
        activities: []
      },
      learned: {
        rainTolerance: 'moderate',
        heatTolerance: 'moderate',
        coldTolerance: 'moderate',
        morningMode: 'bike',
        eveningMode: 'drive',
        weekendMode: 'walk',
        frequentActivities: [],
        avoidedConditions: []
      },
      history: {
        questions: [],
        decisions: [],
        feedback: [],
        interactions: 0
      }
    }
  }
  
  saveProfile() {
    try {
      localStorage.setItem('zephye_user_profile_v2', JSON.stringify(this.profile))
    } catch {}
  }
  
  updateFromStatement(question) {
    const q = question.toLowerCase()
    let updated = false
    
    if (q.includes('i have asthma') || q.includes('i am asthmatic')) {
      this.profile.health.asthma = true
      this.profile.health.conditions.push('asthma')
      updated = true
    }
    if (q.includes('allergic') || q.includes('allergies') || q.includes('pollen')) {
      this.profile.health.allergies = true
      this.profile.health.conditions.push('allergies')
      updated = true
    }
    if (q.includes('sensitive to heat') || q.includes('hate heat') || q.includes('can\'t stand heat')) {
      this.profile.health.heatSensitive = true
      updated = true
    }
    if (q.includes('sensitive to cold') || q.includes('hate cold') || q.includes('can\'t stand cold')) {
      this.profile.health.coldSensitive = true
      updated = true
    }
    if (q.includes('i bike') || q.includes('i cycle') || q.includes('i prefer bike')) {
      this.profile.preferences.preferBike = 0.9
      this.profile.learned.morningMode = 'bike'
      updated = true
    }
    if (q.includes('i drive') || q.includes('i prefer driving')) {
      this.profile.preferences.preferDrive = 0.9
      this.profile.learned.morningMode = 'drive'
      updated = true
    }
    if (q.includes('i walk') || q.includes('i prefer walking')) {
      this.profile.preferences.preferWalk = 0.9
      this.profile.learned.morningMode = 'walk'
      updated = true
    }
    if (q.includes('i run') || q.includes('i jog') || q.includes('i prefer running')) {
      this.profile.preferences.exercisePriority = 0.9
      if (!this.profile.preferences.activities.includes('running')) {
        this.profile.preferences.activities.push('running')
      }
      updated = true
    }
    
    if (updated) this.saveProfile()
    return updated
  }
  
  getContext(parsed) {
    return {
      health: { ...this.profile.health },
      preferences: { ...this.profile.preferences },
      learned: { ...this.profile.learned },
      history: this.profile.history
    }
  }
  
  learn(question, decision, userAction) {
    this.profile.history.interactions++
    this.profile.history.questions.push({
      question,
      decision,
      action: userAction,
      timestamp: Date.now()
    })
    
    if (this.profile.history.questions.length > 200) {
      this.profile.history.questions = this.profile.history.questions.slice(-200)
    }
    
    if (userAction === 'followed') {
      const decisionType = decision.recommendation
      if (decisionType === 'GO') {
        const activity = question.match(/(\w+)/)?.[1]
        if (activity && !this.profile.learned.frequentActivities.includes(activity)) {
          this.profile.learned.frequentActivities.push(activity)
        }
      }
    } else if (userAction === 'ignored') {
      if (decision.recommendation === 'NO' && decision.score > 50) {
        if (question.includes('rain')) this.profile.learned.rainTolerance = 'high'
        if (question.includes('hot')) this.profile.learned.heatTolerance = 'high'
        if (question.includes('cold')) this.profile.learned.coldTolerance = 'high'
      }
    }
    
    this.saveProfile()
  }
}

// ============================================================================
// 3. FACT GATHERER
// ============================================================================

const FactGatherer = {
  gather: (weatherData, parsedIntent, userMemory) => {
    const facts = {
      weather: {},
      environment: {},
      health: {},
      activity: {},
      time: {},
      location: {},
      user: {}
    }
    
    const w = weatherData
    facts.weather = {
      temp: w.temp || 0,
      feelsLike: w.feelsLike || w.temp || 0,
      tempMin: w.tempMin || 0,
      tempMax: w.tempMax || 0,
      humidity: w.humidity || 0,
      wind: w.wind || 0,
      windGust: w.windGust || 0,
      windDir: w.windDir || 'N',
      uvIndex: w.uvIndex || 0,
      aqi: w.aqi || 0,
      visibility: w.visibility || 10,
      condition: w.condition || 'clear',
      conditionCode: w.conditionCode || 0,
      cloudCover: w.cloudCover || 0,
      precipitation: w.precipitation || 0,
      precipitationProb: w.precipitationProb || 0,
      pressure: w.pressure || 1013,
      dewPoint: w.dewPoint || 0,
      solarRadiation: w.solarRadiation || 0,
      sunrise: w.sunrise || '',
      sunset: w.sunset || '',
      season: w.season || 'summer',
      timeOfDay: w.timeOfDay || 'afternoon',
      moonPhase: w.moonPhase || 0,
      city: w.city || 'Unknown'
    }
    
    facts.environment = {
      pavementTemp: getPavementTemp ? getPavementTemp(facts.weather.temp, facts.weather.condition) : facts.weather.temp + 15,
      comfortScore: getComfortIndex ? getComfortIndex(facts.weather.temp, facts.weather.humidity, facts.weather.wind, facts.weather.uvIndex) : 70,
      heatIndex: calcHeatIndex(facts.weather.temp, facts.weather.humidity),
      windChill: calcWindChill(facts.weather.temp, facts.weather.wind),
      burnTime: getBurnTime ? getBurnTime(facts.weather.uvIndex) : 60,
      uvLevel: getUVLevel ? getUVLevel(facts.weather.uvIndex) : 'Moderate',
      aqiCategory: getAQICategory ? getAQICategory(facts.weather.aqi) : 'Moderate',
      pollenIndex: getPollenIndex ? getPollenIndex(facts.weather.season, facts.weather.temp, facts.weather.humidity, facts.weather.wind) : 3,
      isRaining: ['rain', 'drizzle', 'thunderstorm'].includes(facts.weather.condition),
      isStorm: facts.weather.condition === 'thunderstorm',
      isSnow: facts.weather.condition === 'snow',
      isFog: facts.weather.visibility < 2,
      isDaytime: new Date().getHours() >= 6 && new Date().getHours() <= 18
    }
    
    facts.health = {
      heatRisk: facts.environment.heatIndex > 32 ? 'extreme' : facts.environment.heatIndex > 28 ? 'high' : 'moderate',
      coldRisk: facts.environment.windChill < -10 ? 'extreme' : facts.environment.windChill < 0 ? 'high' : 'moderate',
      uvRisk: facts.weather.uvIndex > 8 ? 'extreme' : facts.weather.uvIndex > 6 ? 'high' : 'moderate',
      airQualityRisk: facts.weather.aqi > 150 ? 'extreme' : facts.weather.aqi > 100 ? 'high' : 'moderate',
      userConditions: userMemory?.health || {}
    }
    
    facts.activity = {
      primary: parsedIntent.primary,
      secondary: parsedIntent.secondary,
      constraints: parsedIntent.constraints || [],
      time: parsedIntent.time || { type: 'now' },
      location: parsedIntent.location || null,
      isComparison: parsedIntent.comparison || null
    }
    
    const now = new Date()
    const targetTime = new Date(now)
    if (facts.activity.time.offset) {
      targetTime.setDate(targetTime.getDate() + facts.activity.time.offset)
    }
    if (facts.activity.time.hour !== undefined) {
      targetTime.setHours(facts.activity.time.hour, facts.activity.time.minute || 0, 0, 0)
    }
    
    facts.time = {
      current: now,
      target: targetTime,
      hour: targetTime.getHours(),
      day: targetTime.getDay(),
      isWeekend: [0, 6].includes(targetTime.getDay()),
      isRushHour: (targetTime.getHours() >= 7 && targetTime.getHours() <= 9) || 
                  (targetTime.getHours() >= 16 && targetTime.getHours() <= 18),
      isDaytime: targetTime.getHours() >= 6 && targetTime.getHours() <= 18
    }
    
    facts.location = {
      current: facts.weather.city,
      lat: w.lat || 0,
      lon: w.lon || 0,
      named: facts.activity.location || null,
      savedLocations: w.savedLocations || []
    }
    
    facts.user = {
      health: userMemory?.health || {},
      preferences: userMemory?.preferences || {},
      learned: userMemory?.learned || {},
      history: userMemory?.history || []
    }
    
    return facts
  }
}

// ============================================================================
// 4. SCORING ENGINE
// ============================================================================

const ScoringEngine = {
  score: (facts) => {
    const scores = []
    scores.push(ScoringEngine.scoreWeather(facts))
    scores.push(ScoringEngine.scoreHealth(facts))
    scores.push(ScoringEngine.scoreActivity(facts))
    scores.push(ScoringEngine.scoreEnvironment(facts))
    scores.push(ScoringEngine.scoreTime(facts))
    scores.push(ScoringEngine.scoreUser(facts))
    return scores
  },
  
  scoreWeather: (facts) => {
    const w = facts.weather
    let score = 100
    const positives = []
    const negatives = []
    const warnings = []
    
    if (w.temp > 35) { score -= 25; negatives.push('Extreme heat'); warnings.push('Heat stroke risk') }
    else if (w.temp > 30) { score -= 10; negatives.push('Very hot') }
    else if (w.temp < -5) { score -= 25; negatives.push('Extreme cold'); warnings.push('Frostbite risk') }
    else if (w.temp < 5) { score -= 10; negatives.push('Very cold') }
    else if (w.temp >= 18 && w.temp <= 26) { positives.push('Ideal temperature') }
    
    if (w.precipitationProb > 70) { score -= 30; negatives.push('High rain chance'); warnings.push('Heavy rain expected') }
    else if (w.precipitationProb > 40) { score -= 15; negatives.push('Rain possible') }
    else { positives.push('Low rain chance') }
    
    if (w.wind > 40) { score -= 20; negatives.push('Very windy'); warnings.push('Strong winds') }
    else if (w.wind > 25) { score -= 10; negatives.push('Windy') }
    else { positives.push('Calm wind') }
    
    if (w.uvIndex > 8) { score -= 20; negatives.push('Extreme UV'); warnings.push('Sun protection essential') }
    else if (w.uvIndex > 6) { score -= 10; negatives.push('High UV') }
    else { positives.push('Low UV') }
    
    if (w.aqi > 150) { score -= 25; negatives.push('Poor air quality'); warnings.push('Unhealthy air') }
    else if (w.aqi > 100) { score -= 15; negatives.push('Moderate air quality') }
    else { positives.push('Good air quality') }
    
    if (w.visibility < 1) { score -= 20; negatives.push('Very low visibility'); warnings.push('Dangerous visibility') }
    else if (w.visibility < 3) { score -= 10; negatives.push('Reduced visibility') }
    
    return {
      module: 'weather',
      score: Math.max(0, score),
      confidence: 90,
      positives,
      negatives,
      warnings,
      recommendation: score > 70 ? 'Good' : score > 40 ? 'Fair' : 'Poor'
    }
  },
  
  scoreHealth: (facts) => {
    const h = facts.health
    const user = facts.user.health
    let score = 100
    const positives = []
    const negatives = []
    const warnings = []
    
    if (h.heatRisk === 'extreme') { score -= 25; negatives.push('Extreme heat stress'); warnings.push('Heat exhaustion risk') }
    else if (h.heatRisk === 'high') { score -= 15; negatives.push('High heat stress') }
    
    if (h.coldRisk === 'extreme') { score -= 25; negatives.push('Extreme cold stress'); warnings.push('Hypothermia risk') }
    else if (h.coldRisk === 'high') { score -= 15; negatives.push('High cold stress') }
    
    if (h.uvRisk === 'extreme') { score -= 20; negatives.push('Extreme UV'); warnings.push('Skin damage risk') }
    else if (h.uvRisk === 'high') { score -= 10; negatives.push('High UV') }
    
    if (h.airQualityRisk === 'extreme') { score -= 25; negatives.push('Hazardous air quality'); warnings.push('Lung damage risk') }
    else if (h.airQualityRisk === 'high') { score -= 15; negatives.push('Unhealthy air quality') }
    
    if (user.asthma && facts.weather.aqi > 50) {
      score -= 20
      warnings.push('Asthma risk: poor air quality')
      negatives.push('Asthma trigger present')
    }
    if (user.allergies && facts.environment.pollenIndex > 7) {
      score -= 15
      warnings.push('Allergy risk: high pollen')
      negatives.push('Pollen allergy trigger')
    }
    if (user.heatSensitive && facts.environment.heatIndex > 28) {
      score -= 15
      warnings.push('Heat sensitivity: stay cool')
    }
    if (user.coldSensitive && facts.environment.windChill < 5) {
      score -= 15
      warnings.push('Cold sensitivity: dress warmly')
    }
    
    return {
      module: 'health',
      score: Math.max(0, score),
      confidence: 85,
      positives,
      negatives,
      warnings,
      recommendation: score > 70 ? 'Safe' : score > 40 ? 'Caution' : 'Avoid'
    }
  },
  
  scoreActivity: (facts) => {
    const activity = facts.activity.primary.activity
    const w = facts.weather
    let score = 100
    const positives = []
    const negatives = []
    const warnings = []
    const recommendations = []
    
    const activityScoring = {
      running: { idealTemp: [10, 20], maxWind: 20, maxUV: 6, maxAQI: 100, rainTolerance: 1 },
      cycling: { idealTemp: [15, 25], maxWind: 25, maxUV: 7, maxAQI: 100, rainTolerance: 2 },
      walking: { idealTemp: [5, 28], maxWind: 30, maxUV: 8, maxAQI: 150, rainTolerance: 3 },
      swimming: { idealTemp: [25, 32], maxWind: 20, maxUV: 9, maxAQI: 100, rainTolerance: 4 },
      hiking: { idealTemp: [10, 25], maxWind: 25, maxUV: 7, maxAQI: 100, rainTolerance: 2 },
      driving: { idealTemp: [5, 35], maxWind: 40, maxUV: 10, maxAQI: 200, rainTolerance: 5 },
      stargazing: { idealTemp: [5, 25], maxWind: 15, maxUV: 0, maxAQI: 100, rainTolerance: 0 },
      painting: { idealTemp: [15, 27], maxWind: 20, maxUV: 8, maxAQI: 150, rainTolerance: 0 },
      gardening: { idealTemp: [15, 28], maxWind: 20, maxUV: 7, maxAQI: 150, rainTolerance: 2 },
      photography: { idealTemp: [10, 30], maxWind: 20, maxUV: 8, maxAQI: 150, rainTolerance: 2 },
      event: { idealTemp: [18, 28], maxWind: 20, maxUV: 7, maxAQI: 100, rainTolerance: 1 },
      sports: { idealTemp: [15, 25], maxWind: 25, maxUV: 7, maxAQI: 100, rainTolerance: 2 },
      football: { idealTemp: [15, 25], maxWind: 25, maxUV: 7, maxAQI: 100, rainTolerance: 3 },
      tennis: { idealTemp: [18, 28], maxWind: 20, maxUV: 7, maxAQI: 100, rainTolerance: 1 },
      golf: { idealTemp: [18, 28], maxWind: 20, maxUV: 8, maxAQI: 150, rainTolerance: 2 }
    }
    
    const config = activityScoring[activity] || activityScoring.walking
    
    if (w.temp < config.idealTemp[0]) {
      score -= 20
      negatives.push(`Too cold for ${activity}`)
      recommendations.push(`Wait until temperature reaches ${config.idealTemp[0]}°C`)
    } else if (w.temp > config.idealTemp[1]) {
      score -= 20
      negatives.push(`Too hot for ${activity}`)
      recommendations.push(`Do ${activity} in early morning or evening`)
    } else {
      positives.push(`Ideal temperature for ${activity}`)
    }
    
    if (w.wind > config.maxWind) {
      score -= 15
      negatives.push(`Windy conditions for ${activity}`)
      warnings.push(`Wind ${w.wind}km/h may affect ${activity}`)
    }
    
    if (w.uvIndex > config.maxUV) {
      score -= 10
      negatives.push(`High UV for ${activity}`)
      recommendations.push('Use sunscreen and seek shade')
    }
    
    if (facts.environment.isRaining && config.rainTolerance < 2) {
      score -= 25
      negatives.push(`Rain unsuitable for ${activity}`)
      warnings.push('Rain will impact this activity')
    }
    
    if (w.aqi > config.maxAQI) {
      score -= 20
      negatives.push(`Poor air quality for ${activity}`)
      warnings.push('Air quality concerns for this activity')
    }
    
    return {
      module: 'activity',
      score: Math.max(0, score),
      confidence: 80,
      positives,
      negatives,
      warnings,
      recommendations,
      recommendation: score > 70 ? 'Recommended' : score > 40 ? 'Possible' : 'Not recommended'
    }
  },
  
  scoreEnvironment: (facts) => {
    const env = facts.environment
    let score = 100
    const positives = []
    const negatives = []
    const warnings = []
    
    if (env.comfortScore > 80) { positives.push('Excellent comfort conditions') }
    else if (env.comfortScore > 60) { positives.push('Good comfort conditions') }
    else if (env.comfortScore > 40) { score -= 15; negatives.push('Uncomfortable conditions') }
    else { score -= 25; negatives.push('Extreme discomfort') }
    
    if (env.pavementTemp > 45) {
      score -= 15
      warnings.push(`Pavement ${env.pavementTemp}°C - burns risk`)
    }
    
    if (facts.weather.visibility < 1) {
      score -= 20
      warnings.push('Dense fog - dangerous conditions')
    }
    
    if (env.pollenIndex > 7) {
      score -= 10
      warnings.push('High pollen - allergy sufferers beware')
    }
    
    return {
      module: 'environment',
      score: Math.max(0, score),
      confidence: 85,
      positives,
      negatives,
      warnings,
      recommendation: score > 70 ? 'Favorable' : score > 40 ? 'Acceptable' : 'Unfavorable'
    }
  },
  
  scoreTime: (facts) => {
    const time = facts.time
    let score = 100
    const positives = []
    const negatives = []
    
    if (time.hour >= 11 && time.hour <= 15 && facts.weather.uvIndex > 6) {
      score -= 15
      negatives.push('Peak UV hours - avoid direct sun')
    } else if (time.hour >= 6 && time.hour <= 9) {
      positives.push('Morning - good conditions for outdoor activities')
    } else if (time.hour >= 17 && time.hour <= 19) {
      positives.push('Golden hour - beautiful lighting')
    }
    
    if (time.isRushHour) {
      score -= 10
      negatives.push('Rush hour - traffic delays expected')
    }
    
    if (time.isWeekend) {
      positives.push('Weekend - good for leisure activities')
    }
    
    return {
      module: 'time',
      score: Math.max(0, score),
      confidence: 90,
      positives,
      negatives,
      recommendation: score > 70 ? 'Good timing' : 'Poor timing'
    }
  },
  
  scoreUser: (facts) => {
    const user = facts.user
    let score = 100
    const positives = []
    const recommendations = []
    
    if (user.preferences?.preferBike > 0.7 && facts.activity.primary.activity === 'cycling') {
      positives.push('Matches your preference for cycling')
      score += 5
    }
    if (user.preferences?.preferDrive > 0.7 && facts.activity.primary.activity === 'driving') {
      positives.push('Matches your preference for driving')
      score += 5
    }
    if (user.learned?.rainTolerance === 'high' && facts.environment.isRaining) {
      positives.push('You tolerate rain well - go ahead')
      score += 10
    }
    if (user.learned?.heatTolerance === 'low' && facts.weather.temp > 28) {
      score -= 10
      recommendations.push('You prefer cooler conditions - consider indoor options')
    }
    
    return {
      module: 'user',
      score: Math.min(100, score),
      confidence: 75,
      positives,
      recommendations,
      recommendation: score > 70 ? 'Personalized fit' : 'Needs adjustment'
    }
  }
}

// ============================================================================
// 5. REASONING ENGINE
// ============================================================================

const ReasoningEngine = {
  reason: (scores, facts, userMemory) => {
    const weights = {
      weather: 1.0,
      health: 1.2,
      activity: 1.5,
      environment: 1.0,
      time: 0.8,
      user: 0.6
    }
    
    if (userMemory?.health?.asthma) weights.health = 1.8
    if (userMemory?.health?.allergies) weights.health += 0.3
    if (userMemory?.preferences?.exercisePriority > 0.7) weights.activity = 1.8
    
    let totalWeighted = 0
    let totalWeight = 0
    const allWarnings = []
    const allPositives = []
    const allNegatives = []
    const allRecommendations = []
    const moduleScores = {}
    
    for (const score of scores) {
      const weight = weights[score.module] || 1.0
      totalWeighted += score.score * weight
      totalWeight += weight
      moduleScores[score.module] = score.score
      
      if (score.warnings) allWarnings.push(...score.warnings)
      if (score.positives) allPositives.push(...score.positives)
      if (score.negatives) allNegatives.push(...score.negatives)
      if (score.recommendations) allRecommendations.push(...score.recommendations)
    }
    
    const finalScore = totalWeighted / totalWeight
    
    const conflicts = []
    const weatherScore = moduleScores.weather || 50
    const activityScore = moduleScores.activity || 50
    const healthScore = moduleScores.health || 50
    
    if (activityScore > 70 && healthScore < 50) {
      conflicts.push({
        type: 'activity_vs_health',
        message: 'Activity is good but health conditions suggest caution',
        resolution: 'Consider modifications to the activity'
      })
    }
    
    if (weatherScore > 70 && activityScore < 50) {
      conflicts.push({
        type: 'weather_vs_activity',
        message: 'Weather is good but activity may not be suitable',
        resolution: 'Consider an alternative activity'
      })
    }
    
    const explanation = {
      score: Math.round(finalScore),
      recommendation: finalScore > 70 ? 'GO' : finalScore > 50 ? 'MIGHT' : 'NO',
      confidence: Math.min(95, 70 + (finalScore / 100) * 25),
      positives: allPositives.slice(0, 5),
      negatives: allNegatives.slice(0, 5),
      warnings: allWarnings.slice(0, 8),
      recommendations: allRecommendations.slice(0, 5),
      conflicts,
      moduleScores,
      summary: generateSummary(finalScore, scores, facts)
    }
    
    return explanation
  }
}

function generateSummary(finalScore, scores, facts) {
  const activity = facts.activity.primary.activity || 'activity'
  const weather = facts.weather
  
  let summary = ''
  
  if (finalScore > 80) {
    summary = `Excellent conditions for ${activity}. `
    summary += `Temperature ${weather.temp}°C, ${weather.condition}, `
    summary += `wind ${weather.wind}km/h. `
  } else if (finalScore > 60) {
    summary = `Good but with considerations for ${activity}. `
    summary += `${weather.temp}°C, ${weather.condition}. `
    const warnings = scores.flatMap(s => s.warnings || []).slice(0, 2)
    if (warnings.length) {
      summary += `Note: ${warnings.join('; ')}. `
    }
  } else if (finalScore > 40) {
    summary = `Challenging conditions for ${activity}. `
    summary += `Consider alternatives or modifications. `
  } else {
    summary = `Not recommended for ${activity}. `
    summary += `Weather conditions are unfavorable. `
  }
  
  return summary
}

// ============================================================================
// 6. ALTERNATIVES & BETTER TIME GENERATOR
// ============================================================================

const AlternativesGenerator = {
  getAlternatives: (activity, facts) => {
    const alternatives = {
      'running': [
        'Run on a treadmill indoors',
        'Do a home workout instead',
        'Go for a walk when weather improves',
        'Try indoor cycling or rowing'
      ],
      'cycling': [
        'Use a stationary bike indoors',
        'Go for a walk instead',
        'Try indoor cardio workout',
        'Drive to a covered track'
      ],
      'walking': [
        'Walk indoors (mall, gym track)',
        'Do indoor stretching or yoga',
        'Try a home workout',
        'Walk during better weather window'
      ],
      'stargazing': [
        'Watch astronomy documentaries',
        'Use a stargazing app indoors',
        'Visit a planetarium',
        'Try stargazing photography when clear'
      ],
      'photography': [
        'Shoot indoors (studio, macro, product)',
        'Edit existing photos',
        'Plan future shoots',
        'Try indoor portrait photography'
      ],
      'farming': [
        'Do indoor farm work (records, equipment)',
        'Plan crop rotation',
        'Research new techniques',
        'Maintain indoor seedlings'
      ],
      'painting': [
        'Paint indoors in a ventilated space',
        'Prep surfaces indoors',
        'Plan color schemes',
        'Clean and organize painting supplies'
      ],
      'driving': [
        'Delay your trip',
        'Take public transport',
        'Work from home',
        'Car pool with someone more experienced'
      ],
      'swimming': [
        'Swim in an indoor pool',
        'Do dry-land exercises',
        'Try water aerobics indoors',
        'Focus on strength training'
      ],
      'gardening': [
        'Start indoor seedlings',
        'Plan garden layout',
        'Research plants',
        'Clean and organize gardening tools'
      ],
      'hiking': [
        'Walk indoors on a treadmill',
        'Try indoor climbing gym',
        'Go for a nature walk when better',
        'Plan future hikes'
      ],
      'football': [
        'Play indoor football',
        'Watch game footage and analyze',
        'Do indoor strength training',
        'Practice ball control indoors'
      ],
      'tennis': [
        'Play indoor tennis',
        'Practice on a wall',
        'Watch tennis technique videos',
        'Do footwork drills indoors'
      ],
      'golf': [
        'Use an indoor golf simulator',
        'Practice putting indoors',
        'Work on swing technique',
        'Visit a driving range with cover'
      ],
      'sports': [
        'Try indoor sports',
        'Do strength training',
        'Cardio workout indoors',
        'Watch and analyze your sport'
      ]
    }
    
    const defaultAlts = [
      'Choose an indoor version of this activity',
      'Wait for better weather conditions',
      'Try a different activity today',
      'Plan ahead for better conditions'
    ]
    
    return alternatives[activity] || defaultAlts
  },
  
  getBetterTime: (facts) => {
    const weather = facts.weather
    
    if (weather.condition === 'rain' || weather.condition === 'drizzle') {
      if (weather.precipitationProb) {
        return `After the ${weather.precipitationProb > 70 ? 'heavy rain' : 'drizzle'} clears`
      }
      return 'When the rain stops'
    }
    
    if (weather.temp > 30) {
      return 'Early morning (before 8 AM) or evening (after 6 PM)'
    }
    
    if (weather.temp < 5) {
      return 'Midday (11 AM - 2 PM) when warmest'
    }
    
    if (weather.uvIndex > 6) {
      return 'Before 10 AM or after 4 PM (avoid peak UV)'
    }
    
    if (weather.wind > 25) {
      return 'Early morning or after sunset (winds typically calm)'
    }
    
    return null
  }
}

// ============================================================================
// 7. RESPONSE FORMATTER - Clean, minimal emojis, full data
// ============================================================================

const ResponseFormatter = {
  format: (decision, facts, detailedAdvice) => {
    const activity = facts.activity.primary.activity || 'activity'
    const weather = facts.weather
    
    let response = ''
    
    const verdict = decision.recommendation === 'GO' ? 'YES' : 
                    decision.recommendation === 'MIGHT' ? 'MAYBE' : 'NO'
    
    response += `${verdict} (${decision.confidence.toFixed(0)}% confidence)\n\n`
    response += `${decision.summary}\n\n`
    
    response += `Score: ${decision.score}/100\n\n`
    
    if (decision.positives.length > 0) {
      response += `Why it works:\n`
      decision.positives.forEach(p => response += `  • ${p}\n`)
      response += '\n'
    }
    
    if (decision.negatives.length > 0) {
      response += `Concerns:\n`
      decision.negatives.forEach(n => response += `  • ${n}\n`)
      response += '\n'
    }
    
    if (decision.warnings.length > 0) {
      response += `Warnings:\n`
      decision.warnings.forEach(w => response += `  • ${w}\n`)
      response += '\n'
    }
    
    if (decision.recommendations.length > 0) {
      response += `Recommendations:\n`
      decision.recommendations.forEach(r => response += `  • ${r}\n`)
      response += '\n'
    }
    
    if (decision.recommendation === 'NO') {
      const alternatives = AlternativesGenerator.getAlternatives(activity, facts)
      response += `Alternatives:\n`
      alternatives.forEach(alt => response += `  • ${alt}\n`)
      response += '\n'
      
      const betterTime = AlternativesGenerator.getBetterTime(facts)
      if (betterTime) {
        response += `Better time: ${betterTime}\n\n`
      }
    }
    
    // ─── Full Weather Details ──────────────────────────────────────────────
    response += `Weather Conditions:\n`
    response += `  • Temperature: ${weather.temp}°C (feels like ${weather.feelsLike || weather.temp}°C)\n`
    response += `  • Condition: ${weather.condition}\n`
    response += `  • Wind: ${weather.wind} km/h`
    if (weather.windGust) response += ` (gusts ${weather.windGust} km/h)`
    response += `\n`
    response += `  • Humidity: ${weather.humidity}%\n`
    if (weather.uvIndex > 0) response += `  • UV Index: ${weather.uvIndex}\n`
    if (weather.aqi > 0) response += `  • AQI: ${weather.aqi}\n`
    if (weather.cloudCover !== undefined) response += `  • Cloud Cover: ${weather.cloudCover}%\n`
    if (weather.precipitationProb > 0) response += `  • Rain Chance: ${weather.precipitationProb}%\n`
    if (weather.visibility) response += `  • Visibility: ${weather.visibility} km\n`
    if (weather.pressure) response += `  • Pressure: ${weather.pressure} hPa\n`
    if (weather.sunrise) response += `  • Sunrise: ${weather.sunrise}\n`
    if (weather.sunset) response += `  • Sunset: ${weather.sunset}\n`
    response += '\n'
    
    // ─── Full Activity Advice ──────────────────────────────────────────────
    response += `${activity.charAt(0).toUpperCase() + activity.slice(1)} Advice:\n`
    
    if (detailedAdvice) {
      const lines = detailedAdvice.split('\n').filter(l => l.trim())
      lines.forEach(line => response += `  ${line}\n`)
    } else {
      response += `  Check the full ${activity} advice for details.\n`
    }
    response += '\n'
    
    // ─── Bottom Line ──────────────────────────────────────────────────────
    response += `Bottom Line:\n`
    if (decision.recommendation === 'GO') {
      response += `  Go ahead. Conditions are favorable.\n`
    } else if (decision.recommendation === 'MIGHT') {
      response += `  Proceed with caution. Conditions are acceptable but have concerns.\n`
    } else {
      response += `  Not recommended today. Consider alternatives above.\n`
    }
    
    const wisdom = [
      "Weather doesn't control you. Your decisions do.",
      "The best decisions are made with all the facts."
    ]
    response += `\n${wisdom[Math.floor(Math.random() * wisdom.length)]}`
    
    return response
  }
}

// ============================================================================
// 8. MAIN BRAIN
// ============================================================================

class ZephyeBrain {
  constructor() {
    this.userMemory = new UserMemoryEngine()
    this.initialized = false
  }
  
  async ask(question, weatherData) {
    const parsed = {
      intent: SemanticParser.extractIntent(question),
      time: SemanticParser.extractTime(question),
      location: SemanticParser.extractLocation(question),
      constraints: SemanticParser.extractConstraints(question),
      comparison: SemanticParser.extractComparison(question)
    }
    
    this.userMemory.updateFromStatement(question)
    
    const userContext = this.userMemory.getContext(parsed)
    const facts = FactGatherer.gather(weatherData, parsed, userContext)
    
    const scores = ScoringEngine.score(facts)
    const decision = ReasoningEngine.reason(scores, facts, this.userMemory.profile)
    
    // ─── Get detailed advice from the appropriate module ──────────────────
    let detailedAdvice = null
    const activity = facts.activity.primary.activity
    const adviceMap = {
      'sports': getSportsAdvice,
      'running': getSportsAdvice,
      'cycling': getSportsAdvice,
      'hiking': getLifestyleAdvice,
      'walking': getLifestyleAdvice,
      'driving': getDrivingAdvice,
      'stargazing': getStargazingAdvice,
      'photography': getPhotographyAdvice,
      'painting': getDIYConstructionAdvice,
      'concrete': getDIYConstructionAdvice,
      'gardening': getLifestyleAdvice,
      'farming': getFarmingAdvice,
      'event': getEventsAdvice,
      'health': getHealthAdvice,
      'pet': getPetsAdvice,
      'hair': getSkinHairAdvice,
      'skin': getSkinHairAdvice,
      'energy': getEnergyHomeAdvice,
      'traffic': getTrafficAdvice,
      'route': getRouteAdvice,
      'travel': getTravelingAdvice
    }
    
    const adviceFn = adviceMap[activity] || getLifestyleAdvice
    try {
      detailedAdvice = adviceFn(weatherData, activity)
    } catch (e) {
      console.error('Detailed advice error:', e)
    }
    
    const response = ResponseFormatter.format(decision, facts, detailedAdvice)
    
    this.userMemory.learn(question, decision, 'presented')
    
    return {
      response,
      decision,
      facts,
      scores,
      parsed,
      detailedAdvice
    }
  }
  
  getProfile() {
    return this.userMemory.profile
  }
  
  updateProfile(updates) {
    Object.assign(this.userMemory.profile, updates)
    this.userMemory.saveProfile()
  }
  
  getHistory() {
    return this.userMemory.profile.history
  }
  
  clearHistory() {
    this.userMemory.profile.history = { questions: [], decisions: [], feedback: [], interactions: 0 }
    this.userMemory.saveProfile()
  }
}

// ============================================================================
// 9. EXPORT
// ============================================================================

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
