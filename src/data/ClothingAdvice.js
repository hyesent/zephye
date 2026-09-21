// ============================================================================
// COMPREHENSIVE CLOTHING ADVICE SYSTEM
//
// Returns a structured object: { verdict, summary, note, details, fullText }
//
// Reads:
//   - data.temp / feelsLike / humidity / wind / windGust / uvIndex
//   - data.precipitation / precipitationProb / condition / conditionCode
//   - data.dewPoint / pressure / visibility / cloudCover / aqi
//   - data.hourly / daily / _hourIndex / _dayOffset (when available)
//   - data._journey (route context — rain along the way, temp swings)
//   - preferences (gender, formality, style, runsHot, ageGroup)
//
// Uses:
//   - FABRIC_DATABASE to warn against specific fabrics
//   - COLOR_HEAT_DATA to suggest optimal colors
//   - CLOTHING_ITEMS to name specific items
//   - ACTIVITY_REQUIREMENTS to tailor for the question's activity
// ============================================================================

import {
  calcHeatIndex,
  calcWindChill,
  getUVLevel,
  random,
  getSeason,
  getTimeOfDay,
  mapWeatherCode
} from './calculations'

// ─── PREFERENCES (safe read) ────────────────────────────────────────────

function readPreference(key, fallback) {
  try {
    // preferences.js may export getters with specific names
    // We safely try; fall back if absent.
    // eslint-disable-next-line global-require
    const mod = require('../preferences.js')
    const fn = mod[`get${key}`]
    if (typeof fn === 'function') {
      const v = fn()
      return v != null ? v : fallback
    }
    return fallback
  } catch {
    return fallback
  }
}

const DEFAULT_PREFS = {
  clothingGender: 'neutral',
  clothingFormality: 'casual',
  clothingStyle: 'any',
  clothingAge: 'adult',
  runsHot: false,
}

function getPrefs() {
  return {
    gender: readPreference('ClothingGender', DEFAULT_PREFS.clothingGender),
    formality: readPreference('ClothingFormality', DEFAULT_PREFS.clothingFormality),
    style: readPreference('ClothingStyle', DEFAULT_PREFS.clothingStyle),
    ageGroup: readPreference('ClothingAge', DEFAULT_PREFS.clothingAge),
    runsHot: readPreference('ClothingRunsHot', DEFAULT_PREFS.runsHot),
  }
}

// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────

export const sampleQuestions = [
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
  "What about wind chill?",
  "Is it breathable fabric day?",
  "Can I wear white today?",
  "Do I need thermal underwear?",
  "Is it parka weather?",
  "Should I bring a change of clothes?",
  "What's the comfort index?",
  "Can I wear my new suede shoes?",
  "Is it scarf weather?",
  "Do I need ear protection?",
  "What about my baby/toddler?",
  "Elderly person clothing advice?",
  "Running outfit today?",
  "Office attire weather advice?",
  "Date night outfit weather?",
  "Beach day clothing?",
  "Hiking gear needed?",
  "Cycling clothes today?",
  "Gym outfit weather impact?",
  "Travel outfit for today?",
  "Photography session clothes?",
  "Wedding guest outfit weather?",
  "Interview attire + weather?",
  "Casual Friday weather fit?"
]

// ─── FABRIC & MATERIAL DATABASE ────────────────────────────────────────

const FABRIC_DATABASE = {
  cotton:    { breathability: 9, warmth: 3, waterResistance: 1, windResistance: 2, dryingTime: 'slow', bestFor: [20, 35], worstFor: ['rain', 'extreme cold'], static: false, weight: 'light-medium', care: 'easy' },
  linen:     { breathability: 10, warmth: 2, waterResistance: 1, windResistance: 1, dryingTime: 'fast', bestFor: [25, 40], worstFor: ['cold', 'formal'], static: false, weight: 'light', care: 'wrinkles easily' },
  wool:      { breathability: 7, warmth: 9, waterResistance: 6, windResistance: 8, dryingTime: 'slow', bestFor: [-10, 10], worstFor: ['hot', 'sensitive skin'], static: true, weight: 'medium-heavy', care: 'dry clean or hand wash' },
  merino:    { breathability: 8, warmth: 8, waterResistance: 5, windResistance: 7, dryingTime: 'medium', bestFor: [-5, 15], worstFor: ['extreme heat'], static: false, weight: 'light-medium', care: 'machine washable' },
  polyester: { breathability: 4, warmth: 4, waterResistance: 8, windResistance: 9, dryingTime: 'very fast', bestFor: [5, 20], worstFor: ['sensitive skin', 'hot yoga'], static: true, weight: 'light', care: 'easy' },
  nylon:     { breathability: 3, warmth: 3, waterResistance: 9, windResistance: 9, dryingTime: 'very fast', bestFor: [0, 15], worstFor: ['high heat', 'breathability needed'], static: true, weight: 'light', care: 'easy' },
  fleece:    { breathability: 5, warmth: 8, waterResistance: 3, windResistance: 5, dryingTime: 'medium', bestFor: [-5, 10], worstFor: ['rain', 'formal'], static: true, weight: 'medium', care: 'machine washable' },
  down:      { breathability: 6, warmth: 10, waterResistance: 1, windResistance: 7, dryingTime: 'very slow', bestFor: [-20, 0], worstFor: ['rain', 'wet conditions'], static: false, weight: 'light', care: 'special cleaning' },
  synthetic_insulation: { breathability: 5, warmth: 8, waterResistance: 7, windResistance: 8, dryingTime: 'medium', bestFor: [-10, 5], worstFor: ['extreme cold without layers'], static: true, weight: 'medium', care: 'machine washable' },
  silk:      { breathability: 8, warmth: 6, waterResistance: 2, windResistance: 2, dryingTime: 'fast', bestFor: [10, 25], worstFor: ['rain', 'rough activities'], static: true, weight: 'very light', care: 'hand wash or dry clean' },
  denim:     { breathability: 5, warmth: 5, waterResistance: 3, windResistance: 6, dryingTime: 'very slow', bestFor: [5, 25], worstFor: ['extreme heat', 'rain'], static: false, weight: 'heavy', care: 'machine washable' },
  leather:   { breathability: 2, warmth: 7, waterResistance: 8, windResistance: 10, dryingTime: 'slow', bestFor: [-5, 15], worstFor: ['rain', 'heat'], static: false, weight: 'heavy', care: 'special cleaning' },
  bamboo:    { breathability: 9, warmth: 4, waterResistance: 2, windResistance: 2, dryingTime: 'medium', bestFor: [18, 32], worstFor: ['extreme cold'], static: false, weight: 'light', care: 'machine washable' },
  hemp:      { breathability: 9, warmth: 3, waterResistance: 3, windResistance: 3, dryingTime: 'medium', bestFor: [20, 35], worstFor: ['formal', 'cold'], static: false, weight: 'medium', care: 'machine washable' },
  cashmere:  { breathability: 7, warmth: 9, waterResistance: 3, windResistance: 4, dryingTime: 'slow', bestFor: [-5, 10], worstFor: ['rain', 'rough use'], static: true, weight: 'light', care: 'dry clean or hand wash' },
  goretex:   { breathability: 8, warmth: 5, waterResistance: 10, windResistance: 10, dryingTime: 'fast', bestFor: [-5, 15], worstFor: ['budget conscious'], static: false, weight: 'medium', care: 'special cleaning' },
  spandex:   { breathability: 6, warmth: 3, waterResistance: 4, windResistance: 4, dryingTime: 'fast', bestFor: [15, 30], worstFor: ['cold', 'formal'], static: true, weight: 'light', care: 'machine washable' },
  corduroy:  { breathability: 4, warmth: 7, waterResistance: 4, windResistance: 6, dryingTime: 'slow', bestFor: [0, 15], worstFor: ['rain', 'heat'], static: true, weight: 'heavy', care: 'machine washable' },
  velvet:    { breathability: 3, warmth: 7, waterResistance: 2, windResistance: 4, dryingTime: 'slow', bestFor: [5, 18], worstFor: ['rain', 'casual'], static: true, weight: 'medium-heavy', care: 'dry clean' },
}

// ─── COLOR & HEAT ABSORPTION ────────────────────────────────────────────

const COLOR_HEAT_DATA = {
  white:       { absorption: 0.10, reflection: 0.90, bestTemp: [25, 45], worstTemp: [-10, 10] },
  cream:       { absorption: 0.15, reflection: 0.85, bestTemp: [23, 42], worstTemp: [-8, 12] },
  beige:       { absorption: 0.20, reflection: 0.80, bestTemp: [22, 40], worstTemp: [-5, 12] },
  yellow:      { absorption: 0.25, reflection: 0.75, bestTemp: [20, 38], worstTemp: [-5, 15] },
  light_blue:  { absorption: 0.30, reflection: 0.70, bestTemp: [18, 35], worstTemp: [-3, 18] },
  light_green: { absorption: 0.30, reflection: 0.70, bestTemp: [18, 35], worstTemp: [-3, 18] },
  pink:        { absorption: 0.35, reflection: 0.65, bestTemp: [15, 33], worstTemp: [0, 20] },
  orange:      { absorption: 0.40, reflection: 0.60, bestTemp: [12, 30], worstTemp: [2, 22] },
  red:         { absorption: 0.50, reflection: 0.50, bestTemp: [10, 28], worstTemp: [5, 25] },
  purple:      { absorption: 0.55, reflection: 0.45, bestTemp: [8, 25], worstTemp: [5, 28] },
  brown:       { absorption: 0.60, reflection: 0.40, bestTemp: [5, 22], worstTemp: [8, 30] },
  dark_green:  { absorption: 0.70, reflection: 0.30, bestTemp: [0, 20], worstTemp: [12, 32] },
  navy:        { absorption: 0.75, reflection: 0.25, bestTemp: [-5, 15], worstTemp: [15, 35] },
  dark_gray:   { absorption: 0.80, reflection: 0.20, bestTemp: [-8, 12], worstTemp: [18, 38] },
  black:       { absorption: 0.90, reflection: 0.10, bestTemp: [-10, 8], worstTemp: [20, 40] },
  charcoal:    { absorption: 0.85, reflection: 0.15, bestTemp: [-8, 10], worstTemp: [18, 38] },
}

// ─── CLOTHING ITEMS ────────────────────────────────────────────────────

const CLOTHING_ITEMS = {
  tank_top:         { type: 'top', warmth: 1, coverage: 'minimal', fabric: ['cotton', 'linen', 'bamboo'], temperatureRange: [25, 40], formality: 'casual' },
  t_shirt:          { type: 'top', warmth: 2, coverage: 'short sleeve', fabric: ['cotton', 'linen', 'bamboo', 'merino', 'polyester'], temperatureRange: [20, 35], formality: 'casual' },
  long_sleeve_tee:  { type: 'top', warmth: 3, coverage: 'long sleeve', fabric: ['cotton', 'merino', 'bamboo', 'polyester'], temperatureRange: [15, 25], formality: 'casual' },
  polo_shirt:       { type: 'top', warmth: 2.5, coverage: 'short sleeve', fabric: ['cotton', 'polyester', 'bamboo'], temperatureRange: [18, 30], formality: 'smart casual' },
  button_down:      { type: 'top', warmth: 3, coverage: 'long sleeve', fabric: ['cotton', 'linen', 'silk', 'polyester'], temperatureRange: [12, 28], formality: 'business casual' },
  dress_shirt:      { type: 'top', warmth: 3.5, coverage: 'long sleeve', fabric: ['cotton', 'silk', 'polyester'], temperatureRange: [10, 25], formality: 'formal' },
  sweater:          { type: 'top', warmth: 6, coverage: 'long sleeve', fabric: ['wool', 'cashmere', 'cotton', 'fleece'], temperatureRange: [-5, 15], formality: 'casual to smart casual' },
  turtleneck:       { type: 'top', warmth: 7, coverage: 'long sleeve + neck', fabric: ['wool', 'cashmere', 'cotton', 'fleece'], temperatureRange: [-10, 10], formality: 'smart casual to formal' },
  hoodie:           { type: 'top', warmth: 6, coverage: 'long sleeve + hood', fabric: ['cotton', 'fleece', 'polyester'], temperatureRange: [-5, 18], formality: 'casual' },
  cardigan:         { type: 'top', warmth: 5, coverage: 'long sleeve', fabric: ['wool', 'cotton', 'cashmere'], temperatureRange: [0, 18], formality: 'smart casual' },
  blazer:           { type: 'top', warmth: 4, coverage: 'long sleeve', fabric: ['wool', 'cotton', 'linen', 'polyester'], temperatureRange: [5, 25], formality: 'business to formal' },
  denim_jacket:     { type: 'top', warmth: 4, coverage: 'long sleeve', fabric: ['denim'], temperatureRange: [5, 22], formality: 'casual' },
  leather_jacket:   { type: 'top', warmth: 6, coverage: 'long sleeve', fabric: ['leather'], temperatureRange: [-5, 18], formality: 'casual to smart casual' },
  bomber_jacket:    { type: 'top', warmth: 5, coverage: 'long sleeve', fabric: ['nylon', 'polyester', 'leather'], temperatureRange: [0, 18], formality: 'casual' },
  light_jacket:     { type: 'top', warmth: 3, coverage: 'long sleeve', fabric: ['cotton', 'nylon', 'polyester'], temperatureRange: [10, 22], formality: 'casual' },
  raincoat:         { type: 'top', warmth: 2, coverage: 'long sleeve + hood', fabric: ['nylon', 'polyester', 'goretex'], temperatureRange: [0, 25], formality: 'casual' },
  trench_coat:      { type: 'top', warmth: 5, coverage: 'long sleeve + long', fabric: ['cotton', 'wool', 'polyester'], temperatureRange: [0, 18], formality: 'smart casual to formal' },
  parka:            { type: 'top', warmth: 9, coverage: 'long sleeve + hood + long', fabric: ['nylon', 'polyester', 'down', 'synthetic_insulation'], temperatureRange: [-25, 0], formality: 'casual' },
  puffer_jacket:    { type: 'top', warmth: 10, coverage: 'long sleeve', fabric: ['nylon', 'polyester', 'down', 'synthetic_insulation'], temperatureRange: [-30, 5], formality: 'casual' },
  windbreaker:      { type: 'top', warmth: 2, coverage: 'long sleeve', fabric: ['nylon', 'polyester'], temperatureRange: [5, 22], formality: 'casual to sporty' },
  softshell_jacket: { type: 'top', warmth: 5, coverage: 'long sleeve', fabric: ['polyester', 'fleece', 'nylon'], temperatureRange: [-5, 15], formality: 'sporty casual' },
  hardshell_jacket: { type: 'top', warmth: 3, coverage: 'long sleeve + hood', fabric: ['goretex', 'nylon'], temperatureRange: [-5, 15], formality: 'technical' },
  shorts:           { type: 'bottom', warmth: 1, coverage: 'above knee', fabric: ['cotton', 'linen', 'polyester', 'nylon'], temperatureRange: [22, 40], formality: 'casual' },
  cargo_shorts:     { type: 'bottom', warmth: 1.5, coverage: 'knee length', fabric: ['cotton', 'polyester', 'nylon'], temperatureRange: [20, 38], formality: 'casual' },
  chino_shorts:     { type: 'bottom', warmth: 1.5, coverage: 'above knee', fabric: ['cotton', 'linen'], temperatureRange: [20, 35], formality: 'smart casual' },
  jeans:            { type: 'bottom', warmth: 5, coverage: 'full leg', fabric: ['denim'], temperatureRange: [-5, 25], formality: 'casual' },
  chinos:           { type: 'bottom', warmth: 3, coverage: 'full leg', fabric: ['cotton', 'linen'], temperatureRange: [5, 30], formality: 'smart casual' },
  dress_pants:      { type: 'bottom', warmth: 4, coverage: 'full leg', fabric: ['wool', 'cotton', 'polyester', 'silk'], temperatureRange: [0, 25], formality: 'formal' },
  sweatpants:       { type: 'bottom', warmth: 6, coverage: 'full leg', fabric: ['cotton', 'fleece', 'polyester'], temperatureRange: [-5, 15], formality: 'casual/loungewear' },
  cargo_pants:      { type: 'bottom', warmth: 5, coverage: 'full leg', fabric: ['cotton', 'polyester', 'nylon'], temperatureRange: [0, 25], formality: 'casual' },
  thermal_leggings: { type: 'bottom', warmth: 7, coverage: 'full leg', fabric: ['wool', 'synthetic_insulation', 'polyester'], temperatureRange: [-15, 5], formality: 'base layer' },
  skirt:            { type: 'bottom', warmth: 2, coverage: 'varies', fabric: ['cotton', 'wool', 'polyester', 'silk', 'denim'], temperatureRange: [5, 30], formality: 'varies' },
  dress:            { type: 'full body', warmth: 2.5, coverage: 'varies', fabric: ['cotton', 'silk', 'polyester', 'wool', 'linen'], temperatureRange: [5, 35], formality: 'varies' },
}

// ─── ACTIVITY REQUIREMENTS ─────────────────────────────────────────────

const ACTIVITY_REQUIREMENTS = {
  running:      { breathability: 9, moistureWicking: 9, flexibility: 9, special: ['reflective elements', 'moisture-wicking socks'] },
  cycling:      { breathability: 8, moistureWicking: 8, windResistance: 8, visibility: 'critical', special: ['padded shorts', 'windproof front'] },
  hiking:       { breathability: 7, durability: 9, waterResistance: 7, layering: 'essential', special: ['merino wool socks', 'broken-in boots'] },
  yoga:         { breathability: 9, flexibility: 10, moistureWicking: 8, special: ['non-slip', 'form-fitting', '4-way stretch'] },
  office:       { formality: 7, breathability: 5, layering: 'recommended', special: ['indoor temperature consideration', 'commute adjustment'] },
  date_night:   { formality: 6, style: 9, comfort: 7, special: ['venue consideration', 'evening temperature drop'] },
  travel:       { comfort: 9, layering: 'essential', wrinkleResistance: 8, special: ['compression socks for flights', 'easy-remove shoes'] },
  beach:        { uvProtection: 10, quickDrying: 9, special: ['cover-up', 'water shoes'] },
  gym:          { moistureWicking: 9, breathability: 8, flexibility: 8, special: ['compression options', 'headband'] },
  construction: { durability: 10, safety: 'critical', visibility: 'essential', special: ['steel-toe boots', 'hard hat'] },
}

// ─── CALCULATORS ───────────────────────────────────────────────────────

function calculateComfortIndex(temp, humidity, wind, uvIndex) {
  let c = 100
  if (temp < -10) c -= 30; else if (temp < 0) c -= 20; else if (temp < 10) c -= 10
  else if (temp > 35) c -= 30; else if (temp > 30) c -= 20; else if (temp > 28) c -= 10
  if (humidity > 90) c -= 15; else if (humidity > 80) c -= 10; else if (humidity > 70) c -= 5
  else if (humidity < 20) c -= 10; else if (humidity < 30) c -= 5
  if (wind > 50) c -= 20; else if (wind > 40) c -= 15; else if (wind > 30) c -= 10; else if (wind > 20) c -= 5
  if (uvIndex > 11) c -= 15; else if (uvIndex > 8) c -= 10; else if (uvIndex > 6) c -= 5
  return Math.max(0, Math.min(100, c))
}

function calculateLayeringIndex(temp, wind, humidity) {
  const wc = calcWindChill(temp, wind)
  const eff = wc < temp ? wc : temp
  if (eff < -20) return { layers: 5, description: 'Expedition level' }
  if (eff < -10) return { layers: 4, description: 'Heavy winter layering' }
  if (eff < 0) return { layers: 3, description: 'Winter layering' }
  if (eff < 10) return { layers: 2, description: 'Light layering' }
  if (eff < 20) return { layers: 1, description: 'Single layer' }
  return { layers: 0, description: 'Minimal clothing' }
}

// ─── FABRIC PICKER ─────────────────────────────────────────────────────

function pickFabricsForConditions({ temp, humidity, isRaining, isSnowing, wind }) {
  const recommended = []
  const avoided = []

  for (const [name, f] of Object.entries(FABRIC_DATABASE)) {
    const tooHot = f.bestFor[0] > temp + 5
    const tooCold = f.bestFor[1] < temp - 5
    const wetBad = (isRaining || isSnowing) && f.waterResistance < 4
    const windBad = wind > 25 && f.windResistance < 4

    if (tooHot || tooCold || wetBad || windBad) {
      if (wetBad) avoided.push({ name, reason: 'soaks through in rain' })
      else if (windBad) avoided.push({ name, reason: 'wind cuts through' })
      else if (tooHot) avoided.push({ name, reason: 'too warm for today' })
      else if (tooCold) avoided.push({ name, reason: 'not warm enough' })
      continue
    }

    let score = 0
    if (f.breathability >= 8 && temp > 22) score += 3
    if (f.warmth >= 7 && temp < 10) score += 3
    if (f.waterResistance >= 7 && isRaining) score += 3
    if (f.windResistance >= 7 && wind > 20) score += 2
    if (score >= 2) recommended.push(name)
  }

  return { recommended: [...new Set(recommended)], avoided }
}

// ─── COLOR PICKER ──────────────────────────────────────────────────────

function pickColorsForConditions({ temp, uvIndex, isClear, visibility }) {
  const good = []
  const bad = []

  if (temp > 28) {
    for (const [name, c] of Object.entries(COLOR_HEAT_DATA)) {
      if (c.absorption <= 0.30) good.push(name)
      else if (c.absorption >= 0.70) bad.push(name)
    }
  } else if (temp < 5) {
    for (const [name, c] of Object.entries(COLOR_HEAT_DATA)) {
      if (c.absorption >= 0.60) good.push(name)
      else if (c.absorption <= 0.15) bad.push(name)
    }
  }

  const notes = []
  if (uvIndex > 6) notes.push('Dark or bright colors block more UV than white')
  if (visibility != null && visibility < 2) notes.push('Bright or reflective colors improve visibility in low light')

  return { good: [...new Set(good)], bad: [...new Set(bad)], notes }
}

// ─── ITEM PICKER ───────────────────────────────────────────────────────

function pickItemsForTemp(temp, gender, formality) {
  const tops = []
  const bottoms = []
  const isFormal = formality === 'formal' || formality === 'business'

  for (const [name, item] of Object.entries(CLOTHING_ITEMS)) {
    const [min, max] = item.temperatureRange
    if (temp < min || temp > max) continue
    if (isFormal && item.formality && !item.formality.includes('formal') && !item.formality.includes('business')) continue
    if (gender === 'male' && (name === 'skirt' || name === 'dress')) continue

    if (item.type === 'top') tops.push(name.replace(/_/g, ' '))
    if (item.type === 'bottom') bottoms.push(name.replace(/_/g, ' '))
  }

  return { tops: tops.slice(0, 4), bottoms: bottoms.slice(0, 3) }
}

// ─── EXTREME CONDITION HANDLERS ────────────────────────────────────────

function handleExtremeCold(data) {
  const { temp, wind } = data
  const wc = calcWindChill(temp, wind)
  const advice = []
  if (wc < -50) {
    advice.push("Life-threatening cold: exposed skin freezes in under 2 minutes")
    advice.push("Full expedition gear: thermal base, 2-3 insulating layers, windproof outer")
    advice.push("Face mask, goggles, mittens (not gloves), hand warmers")
  } else if (wc < -40) {
    advice.push("Extreme cold: frostbite possible in 5-10 minutes")
    advice.push("Heavy parka, snow pants, balaclava, ski goggles")
    advice.push("Multiple wool or synthetic layers. No cotton anywhere")
  } else if (wc < -30) {
    advice.push("Severe cold: frostbite risk in 10-30 minutes")
    advice.push("Insulated winter coat, snow pants, face protection")
    advice.push("Mittens warmer than gloves. Wool socks plus insulated boots")
  } else if (wc < -20) {
    advice.push("Very cold: cover all exposed skin")
    advice.push("Heavy winter coat, hat, gloves, scarf essential")
    advice.push("Layer: thermal plus fleece plus windproof outer")
  }
  return advice
}

function handleExtremeHeat(data) {
  const { temp, humidity } = data
  const hi = calcHeatIndex(temp, humidity)
  const advice = []
  if (hi > 54) {
    advice.push("Extreme heat danger: heat stroke imminent")
    advice.push("Stay in air conditioning. Do not go outside")
    advice.push("If must go out: white or light clothing, wide brim hat, SPF 100")
  } else if (hi > 41) {
    advice.push("Dangerous heat: heat exhaustion likely with prolonged exposure")
    advice.push("Loose, light-colored, breathable fabrics only (linen, cotton)")
    advice.push("No dark colors — they absorb 90% more heat")
    advice.push("Cooling towel around neck. Electrolyte drinks")
  } else if (hi > 32) {
    advice.push("Extreme caution: heat cramps and exhaustion possible")
    advice.push("Lightweight, light-colored clothing. Sun protection essential")
    advice.push("Take frequent shade breaks. Know heat illness symptoms")
  }
  return advice
}

function handleHeavyRain(data) {
  const { temp, precipitation } = data
  const advice = []
  if (precipitation > 50) {
    advice.push("Torrential rain: flooding possible. Stay off roads if possible")
    advice.push("Full waterproof gear: raincoat, rain pants, waterproof boots")
    advice.push("Avoid canvas and leather — they will be ruined")
    advice.push("Bring complete change of clothes in waterproof bag")
  } else if (precipitation > 25) {
    advice.push("Heavy rain: you will get wet without proper gear")
    advice.push("Waterproof jacket plus pants plus boots. Umbrella won't help in wind")
    advice.push("Quick-dry fabrics underneath. Avoid cotton (stays wet, causes chills)")
  } else if (precipitation > 10) {
    advice.push("Steady rain: waterproof jacket or sturdy umbrella needed")
    advice.push("Water-resistant shoes at minimum. Watch for puddles")
    advice.push("Layer underneath — rain gear traps heat")
  }
  if (temp < 10) {
    advice.push("Cold rain alert: hypothermia risk if wet. Stay dry at all costs")
  }
  return advice
}

function handleHighWind(data) {
  const { wind, windGust, temp } = data
  const advice = []
  if (wind > 60 || windGust > 80) {
    advice.push("Dangerous wind: seek shelter. Avoid travel")
    advice.push("Flying debris risk. Eye protection essential if outside")
    advice.push("No loose clothing, scarves, or umbrellas — they become hazards")
  } else if (wind > 40 || windGust > 60) {
    advice.push("Strong wind: difficult to walk. Driving dangerous for high vehicles")
    advice.push("Windproof outer layer critical. Secure all loose items")
    advice.push("Form-fitting clothes prevent wind from catching. No skirts or dresses")
  } else if (wind > 25) {
    advice.push("Windy: wind chill will make it feel significantly colder")
    advice.push("Windbreaker or tightly woven outer layer recommended")
    advice.push("Secure hats. Hair will tangle — braid or tie back")
  }
  return advice
}

function handleThunderstorm() {
  return [
    "Thunderstorm: lightning risk. Avoid open areas, tall objects, water",
    "If outside: no umbrellas (lightning risk). Seek proper shelter",
    "Waterproof gear essential. Avoid metal accessories (jewelry, belts)",
    "Rubber-soled shoes provide no lightning protection (common myth)"
  ]
}

function handleSnowConditions(data) {
  const { temp, snow } = data
  const advice = []
  if (snow > 20) {
    advice.push("Heavy snow: travel only if necessary. Full snow gear required")
    advice.push("Waterproof snow boots, snow pants, heavy parka")
    advice.push("Goggles better than sunglasses. Face protection essential")
  } else if (snow > 5) {
    advice.push("Snow: waterproof boots with good tread essential")
    advice.push("Insulated, waterproof gloves. Extra socks in bag")
    advice.push("Layer up — you can always remove layers if too warm")
  } else {
    advice.push("Light snow: boots with grip recommended. Watch for ice")
    advice.push("Waterproof outer layer. Snow sticks and melts equals wet clothes")
  }
  if (temp > 0 && temp < 4) {
    advice.push("Wet snow: most dangerous — heavy, slushy, soaks through clothes")
    advice.push("Completely waterproof gear needed. Change of clothes essential")
  }
  return advice
}

// ─── TIME ADJUSTMENTS ──────────────────────────────────────────────────

function getTimeBasedAdjustments(data) {
  const hour = new Date().getHours()
  const adjustments = []
  const temp = data.temp
  const tempMin = data.tempMin || temp - 5
  const tempMax = data.tempMax || temp + 5

  if (hour >= 5 && hour < 9) {
    adjustments.push("Morning: temperature will rise. Dress for current temp but bring removable layer")
    if (tempMin < 10 && tempMax > 20) {
      adjustments.push("Big temperature swing today. Layer strategy: warm morning layer that fits in bag later")
    }
  }
  if (hour >= 10 && hour <= 15) {
    adjustments.push("Peak sun hours. UV protection critical even if cool")
    if (temp > 28) adjustments.push("Hottest part of day. Light colors, breathable fabrics only")
  }
  if (hour >= 16 && hour <= 20) {
    adjustments.push("Evening: temperature dropping. Bring a layer for later")
    if (temp > 25 && tempMin < 15) {
      adjustments.push("Significant evening cool-down expected. Jacket or sweater recommended")
    }
  }
  if (hour >= 21 || hour < 5) {
    adjustments.push("Nighttime: dark colors fine. Visibility or reflective gear if walking near roads")
    if (temp < 10) adjustments.push("Cold night: insulated layers. Body temperature drops while sleeping")
  }
  return adjustments
}

// ─── PERSON-SPECIFIC ADVICE ────────────────────────────────────────────

function getBabyToddlerAdvice(data) {
  const { temp, uvIndex } = data
  const advice = ["Baby or toddler rule: one more layer than you would wear yourself"]
  if (temp < 0) {
    advice.push("No outdoor exposure for infants. Frostbite risk on cheeks and fingers")
    advice.push("If must go out: full snowsuit, mittens (no thumbs), balaclava")
  } else if (temp < 10) {
    advice.push("Snowsuit or bunting bag. Hat that ties (won't fall off)")
    advice.push("Mittens, warm booties. Blanket over stroller cuts wind")
    advice.push("Check baby's neck (not hands) to gauge temperature")
  } else if (temp < 20) {
    advice.push("Layers: onesie plus sweater plus light jacket. Hat recommended")
    advice.push("Easy to remove layers for car seat safety")
  } else if (temp > 28) {
    advice.push("Infants overheat quickly. Minimal clothing — diaper plus light onesie")
    advice.push("Sun protection: UV clothing, wide-brim hat, SPF 50+ for 6 months and older")
    advice.push("Never cover stroller with blanket (creates oven effect)")
  }
  if (uvIndex > 3) advice.push("Baby sunglasses exist and are worth it. Protect developing eyes")
  return advice
}

function getElderlyAdvice(data) {
  const { temp, humidity } = data
  const advice = ["Elderly considerations: reduced temperature sensation and circulation"]
  if (temp < 15) {
    advice.push("Dress warmer than you think. Aging reduces cold perception")
    advice.push("Compression socks improve circulation. Insulated slippers indoors")
    advice.push("Layer strategy: thermal plus wool plus windproof. Scarf over mouth in cold")
  }
  if (temp > 30) {
    advice.push("High risk: elderly heat stroke common. Air conditioning essential if possible")
    advice.push("Cool, loose, light clothing. Cooling towel on neck and forehead")
    advice.push("Don't rely on thirst — drink water on schedule every hour")
  }
  if (humidity > 80) advice.push("High humidity makes temperature regulation harder")
  return advice
}

function getPregnancyAdvice(data) {
  const { temp } = data
  const advice = ["Pregnancy note: body temperature already elevated. Easier to overheat"]
  if (temp > 25) {
    advice.push("Extra heat sensitive. Flowy dresses, loose tops essential")
    advice.push("Compression socks for swelling. Supportive, slip-on shoes")
    advice.push("Cooling accessories: neck fan, cold water bottle, shade umbrella")
  }
  if (temp < 5) {
    advice.push("Maternity coat or coat extender. Belly needs coverage too")
    advice.push("Layer easily — pregnancy hot flashes are real")
  }
  return advice
}

// ─── ACTIVITY DETECTION ────────────────────────────────────────────────

function detectActivity(questionLower) {
  for (const key of Object.keys(ACTIVITY_REQUIREMENTS)) {
    const k = key.replace('_', ' ')
    if (questionLower.includes(k) || questionLower.includes(key)) return key
  }
  return null
}

// ─── JOURNEY-AWARE ADVICE ──────────────────────────────────────────────

function getJourneyAdvice(journey, prefs) {
  if (!journey) return { layers: [], accessories: [], notes: [] }

  const layers = []
  const accessories = []
  const notes = []

  if (journey.hasThunderstorm) {
    accessories.push("Thunderstorm on your route — waterproof everything, no umbrella outdoors")
  } else if (journey.hasHeavyRain) {
    accessories.push("Heavy rain along the way — waterproof jacket plus rain pants")
  } else if (journey.hasRain) {
    if (journey.rainStart && journey.rainEnd && journey.rainStart !== journey.rainEnd) {
      accessories.push(`Rain from ${journey.rainStart} to ${journey.rainEnd} — bring a light waterproof layer`)
    } else {
      accessories.push("Rain somewhere along the route — pack a compact rain jacket")
    }
  }

  if (journey.hasSnow) {
    accessories.push("Snow on the route — waterproof boots, extra socks, gloves")
  }
  if (journey.hasIce) {
    notes.push("Freezing conditions — watch for ice, insulated soles recommended")
  }

  if (journey.tempSwing != null && journey.tempSwing >= 8) {
    layers.push(`Temperature swings ${journey.tempMin}°C to ${journey.tempMax}°C along the way — layer up, removable outer`)
  } else if (journey.tempMax != null && journey.tempMax >= 33) {
    layers.push(`Hot at destination (${journey.tempMax}°C) — breathable, light colors`)
  } else if (journey.tempMin != null && journey.tempMin <= 3) {
    layers.push(`Cold along route (${journey.tempMin}°C) — insulated layer essential`)
  }

  if (journey.windMax != null && journey.windMax > 40) {
    accessories.push(`Strong wind up to ${journey.windMax} km/h — windproof outer layer`)
  }

  if (journey.narrative) notes.push(journey.narrative)

  return { layers, accessories, notes }
}

// ─── MAIN FUNCTION ─────────────────────────────────────────────────────

export const getClothingAdvice = (data, question = '') => {
  if (!data) {
    return {
      verdict: "I don't have weather data right now.",
      summary: 'Try again in a moment.',
      note: '',
      details: [],
      fullText: '',
    }
  }

  // ─── Unpack ────────────────────────────────────────────────────────
  let {
    temp, feelsLike, condition, humidity, wind, windGust,
    uvIndex, precipitation, visibility, pressure,
    tempMin, tempMax, snow = 0, dewPoint, aqi,
    precipitationProb,
  } = data

  // Time-shift awareness (hourly)
  if (data._hourIndex !== undefined && data.hourly) {
    const idx = data._hourIndex
    const h = data.hourly
    if (h.temperature_2m?.[idx] !== undefined) temp = Math.round(h.temperature_2m[idx])
    if (h.apparent_temperature?.[idx] !== undefined) feelsLike = Math.round(h.apparent_temperature[idx])
    if (h.relative_humidity_2m?.[idx] !== undefined) humidity = h.relative_humidity_2m[idx]
    if (h.wind_speed_10m?.[idx] !== undefined) wind = h.wind_speed_10m[idx]
    if (h.wind_gusts_10m?.[idx] !== undefined) windGust = h.wind_gusts_10m[idx]
    if (h.weather_code?.[idx] !== undefined) condition = mapWeatherCode(h.weather_code[idx])
    if (h.precipitation?.[idx] !== undefined) precipitation = h.precipitation[idx]
    if (h.precipitation_probability?.[idx] !== undefined) precipitationProb = h.precipitation_probability[idx]
    if (h.uv_index?.[idx] !== undefined) uvIndex = h.uv_index[idx]
    if (h.visibility?.[idx] !== undefined) visibility = h.visibility[idx] / 1000
    if (h.dew_point_2m?.[idx] !== undefined) dewPoint = h.dew_point_2m[idx]
  }

  // Time-shift awareness (daily)
  if (data._dayOffset !== undefined && data.daily) {
    const d = data._dayOffset > 0 ? data._dayOffset : 0
    const dd = data.daily
    if (dd.temperature_2m_max?.[d] !== undefined) tempMax = Math.round(dd.temperature_2m_max[d])
    if (dd.temperature_2m_min?.[d] !== undefined) tempMin = Math.round(dd.temperature_2m_min[d])
    if (dd.weather_code?.[d] !== undefined) condition = mapWeatherCode(dd.weather_code[d])
    if (dd.precipitation_sum?.[d] !== undefined) precipitation = dd.precipitation_sum[d]
    if (dd.precipitation_probability_max?.[d] !== undefined) precipitationProb = dd.precipitation_probability_max[d]
  }

  // ─── Derived ───────────────────────────────────────────────────────
  const prefs = getPrefs()
  const realFeel = feelsLike || temp
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  const isCloudy = ['clouds', 'partly-cloudy', 'overcast'].includes(condition)
  const isClear = condition === 'clear'
  const isSnowing = snow > 0
  const heatIndex = calcHeatIndex(temp, humidity)
  const windChill = calcWindChill(temp, wind)
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : realFeel
  const comfortIndex = calculateComfortIndex(temp, humidity, wind, uvIndex)
  const layeringNeed = calculateLayeringIndex(temp, wind, humidity)
  const uvLevel = getUVLevel(uvIndex)
  const isNight = getTimeOfDay() === 'night'

  // Runs-hot adjustment
  const effectiveTempAdjusted = prefs.runsHot ? effectiveTemp + 2 : effectiveTemp

  // ─── Question intent ───────────────────────────────────────────────
  const q = question.toLowerCase()
  const askingForFootwear = /\b(shoe|boot|sandal|footwear|sneaker)\b/.test(q)
  const askingForHeadwear = /\b(hat|cap|beanie)\b/.test(q)
  const askingForAccessories = /\b(accessor|umbrella|sunglass|glove|scarf)\b/.test(q)
  const askingForLayers = /\b(layer|sweater|jacket|coat|hoodie)\b/.test(q)
  const askingForFabric = /\b(fabric|material|cotton|wool|linen|polyester)\b/.test(q)
  const askingForColor = /\b(color|black|white|dark|light)\b/.test(q)
  const askingForBabies = /\b(baby|toddler|infant|child|kid)\b/.test(q)
  const askingForElderly = /\b(elder|senior|grand|old age)\b/.test(q)
  const askingForPregnancy = /\b(pregnan|maternity)\b/.test(q)
  const activity = detectActivity(q)

  // ─── Context: journey + weather data ───────────────────────────────
  const journeyAdvice = getJourneyAdvice(data._journey, prefs)
  const fabricPick = pickFabricsForConditions({ temp, humidity, isRaining, isSnowing, wind })
  const colorPick = pickColorsForConditions({ temp, uvIndex, isClear, visibility })
  const itemPick = pickItemsForTemp(temp, prefs.gender, prefs.formality)

  // ─── Build sections ────────────────────────────────────────────────
  const layers = []
  const accessories = []
  const warnings = []
  const footwear = []
  const headwear = []
  const fabrics = []
  const colors = []
  const activitySpecific = []
  const timeAdjustments = getTimeBasedAdjustments(data)
  let healthNotes = []

  // Extreme conditions
  if (effectiveTempAdjusted < -20 || windChill < -30) warnings.push(...handleExtremeCold(data))
  if (heatIndex > 41 || (temp > 38 && humidity > 60)) warnings.push(...handleExtremeHeat(data))
  if (precipitation > 25 || (isRaining && precipitation > 10)) warnings.push(...handleHeavyRain(data))
  if (wind > 40 || windGust > 60) warnings.push(...handleHighWind(data))
  if (condition === 'thunderstorm') warnings.push(...handleThunderstorm())
  if (snow > 0 || (temp < 2 && precipitation > 0)) warnings.push(...handleSnowConditions(data))

  // Core layers by temperature
  if (effectiveTempAdjusted <= -30) {
    layers.push("Expedition-weight thermal base layer (merino wool or synthetic)")
    layers.push("Heavy fleece or down mid-layer. Expedition parka outer")
    layers.push("Insulated snow pants. Vapor barrier if active")
    fabrics.push('merino wool', 'synthetic insulation', 'goretex')
  } else if (effectiveTempAdjusted <= -20) {
    layers.push("Heavyweight thermal base. Thick fleece or wool sweater")
    layers.push("Heavy parka or down jacket. Insulated pants or snow pants")
    layers.push("Multiple sock layers: liner plus heavy wool")
    fabrics.push('merino wool', 'fleece', 'down', 'goretex')
  } else if (effectiveTempAdjusted <= -10) {
    layers.push("Thermal base layer (top and bottom). Wool or fleece mid-layer")
    layers.push("Heavy winter coat. Insulated pants or thermal leggings under jeans")
    layers.push("Thick wool socks. Consider toe warmers")
    fabrics.push('wool', 'fleece', 'down', 'synthetic insulation')
  } else if (effectiveTempAdjusted <= -5) {
    layers.push("Base layer plus sweater or fleece. Winter coat or heavy jacket")
    layers.push("Long pants (jeans with thermal underneath or insulated pants)")
    layers.push("Wool socks plus insulated boots")
    fabrics.push('wool', 'fleece', 'thermal synthetics')
  } else if (effectiveTempAdjusted <= 0) {
    layers.push("Thermal top or long sleeve plus sweater. Winter jacket")
    layers.push("Jeans or pants with optional thermal layer. Warm socks")
    fabrics.push('wool', 'fleece', 'cotton (only as outer layer)')
  } else if (effectiveTempAdjusted <= 5) {
    layers.push("Long sleeve plus warm sweater or hoodie. Heavy jacket or coat")
    layers.push("Jeans or warm pants. Regular to warm socks")
    fabrics.push('wool', 'fleece', 'denim', 'corduroy')
  } else if (effectiveTempAdjusted <= 10) {
    layers.push("Long sleeve or light sweater. Medium jacket or heavy hoodie")
    layers.push("Jeans or chinos. Closed shoes with regular socks")
    fabrics.push('cotton', 'wool', 'denim', 'fleece')
    if (isCloudy || wind > 15) layers.push("Feels cooler than thermometer says. Extra layer recommended")
  } else if (effectiveTempAdjusted <= 15) {
    layers.push("Light long sleeve or t-shirt plus light jacket, cardigan, or hoodie")
    layers.push("Jeans, chinos, or light pants. Comfortable closed shoes")
    layers.push("Morning and evening will feel cool. Have a layer ready")
    fabrics.push('cotton', 'light wool', 'denim', 'cashmere for lightness')
  } else if (effectiveTempAdjusted <= 18) {
    layers.push("T-shirt or light long sleeve. Light jacket, blazer, or cardigan optional")
    layers.push("Jeans, chinos, or casual pants. Sneakers or loafers")
    layers.push("Perfect transitional weather. Layers key for adapting")
    fabrics.push('cotton', 'linen', 'light wool', 'denim', 'silk')
  } else if (effectiveTempAdjusted <= 20) {
    layers.push("T-shirt or polo. Light cardigan or jacket for shade or wind")
    layers.push("Shorts or pants — your preference. Almost anything works")
    fabrics.push('cotton', 'linen', 'bamboo', 'light denim')
  } else if (effectiveTempAdjusted <= 24) {
    layers.push("T-shirt, tank top, or light blouse. Shorts, skirts, or light pants")
    layers.push("No jacket needed unless windy or you run cold")
    fabrics.push('cotton', 'linen', 'bamboo', 'hemp')
  } else if (effectiveTempAdjusted <= 27) {
    layers.push("Light t-shirt or tank. Shorts, skirt, or light dress")
    layers.push("Breathable fabrics essential. Minimal layers")
    fabrics.push('linen', 'cotton', 'bamboo', 'hemp')
  } else if (effectiveTempAdjusted <= 30) {
    layers.push("Tank top, lightest t-shirts. Shorts, flowy skirt, or light dress")
    layers.push("Absolute minimum comfortable clothing. Loose fit crucial")
    fabrics.push('linen', 'light cotton', 'bamboo', 'moisture-wicking synthetics')
  } else if (effectiveTempAdjusted <= 35) {
    layers.push("Minimal clothing: tank or crop top, shortest shorts, flowy dress")
    layers.push("Loose, billowy cuts. Nothing fitted — traps heat")
    layers.push("Heat advisory: light colors only. Dark fabric can burn skin")
    fabrics.push('linen mandatory', 'lightest cotton')
  } else {
    layers.push("Absolute minimum clothing legal or socially acceptable")
    layers.push("Linen, linen, linen. Or specialized cooling fabrics")
    layers.push("Cover skin with light, loose fabric rather than exposing")
    fabrics.push('white linen only', 'specialized UV cooling fabric')
  }

  // Precip logic
  if (condition === 'thunderstorm') {
    accessories.push("Full waterproof everything. This is not optional")
    accessories.push("No umbrella in thunderstorm — lightning risk")
    footwear.push("waterproof boots (rain or hiking)")
  } else if (precipitation > 25 || (isRaining && precipitation > 10)) {
    accessories.push("Heavy duty raincoat with hood. Rain pants recommended")
    accessories.push("Waterproof backpack or bag for electronics and documents")
    footwear.push("waterproof boots", "rain boots", "waterproof hiking shoes")
  } else if (isRaining || condition === 'drizzle') {
    accessories.push("Raincoat or water-resistant jacket plus umbrella")
    accessories.push("Water-resistant shoes. Avoid suede, canvas, leather")
    if (wind > 20) accessories.push("Windy rain equals umbrella useless. Raincoat mandatory")
  }

  // Wind logic
  if (wind > 50 || windGust > 70) {
    warnings.push("Dangerous wind: avoid outdoor activities. Flying debris risk")
    accessories.push("Windproof outer layer. Face protection from blowing dust")
  } else if (wind > 35 || windGust > 50) {
    accessories.push("Very windy. Windproof jacket essential. Secure hat or skip it")
    accessories.push("Avoid skirts, dresses, loose scarves. Hair will be wild")
    if (temp < 15) {
      layers.push("Windproof outer layer mandatory. Wind cuts through fleece")
      accessories.push("Neck gaiter or scarf to protect face")
    }
  } else if (wind > 20) {
    accessories.push("Breezy. Light windbreaker or denim jacket helps")
    accessories.push("Secure hat if wearing one. Hair tie recommended")
    if (temp < 18) layers.push("Breeze makes it feel cooler. Have a wind-resistant layer")
  }

  // UV logic
  if (uvIndex >= 11) {
    warnings.push("Extreme UV: burn time under 10 minutes. Avoid sun 10am-4pm")
    accessories.push("UPF 50+ clothing if outside. Wide-brim hat with 10cm+ brim")
    accessories.push("SPF 50+ sunscreen reapplied every 2 hours. UV sunglasses essential")
  } else if (uvIndex >= 8) {
    warnings.push("Very high UV: burn time 15-25 minutes")
    accessories.push("Wide-brim hat or legionnaire cap. UV400 sunglasses")
    accessories.push("SPF 50+ on all exposed skin")
  } else if (uvIndex >= 6) {
    accessories.push("High UV. Hat recommended. Sunglasses important")
    accessories.push("SPF 30+ minimum. Reapply every 2 hours if outside")
    headwear.push("wide-brim hat", "bucket hat with neck coverage")
  } else if (uvIndex >= 3) {
    accessories.push("Moderate UV. Sunglasses helpful. SPF 15+ if outside over 1 hour")
  }

  // Humidity logic
  if (humidity > 90) {
    if (temp > 25) {
      warnings.push("Oppressive humidity: sweat won't evaporate. Feels much hotter")
      layers.push("Lightest, most breathable fabrics. Loose fit critical")
      fabrics.push('linen', 'bamboo', 'light cotton', 'no synthetics')
      accessories.push("Cooling towel. Change of shirt if outside long")
    } else if (temp > 15) {
      layers.push("Sticky and muggy. Breathable fabrics. Avoid anything tight")
    } else {
      layers.push("Damp cold penetrates clothing. Water-resistant outer layer")
      fabrics.push('wool (warm even when damp)', 'synthetic insulation')
    }
  } else if (humidity < 25 && temp > 20) {
    warnings.push("Very dry: static electricity, dry skin, chapped lips")
    accessories.push("Lip balm, moisturizer, hand cream. Anti-static spray")
    fabrics.push("natural fibers over synthetics (less static)")
  }

  // Visibility logic
  if (visibility != null && visibility < 0.5) {
    warnings.push("Dense fog: reflective or light clothing if near roads")
    accessories.push("Reflective vest or accessories if walking or cycling")
  } else if (visibility != null && visibility < 2) {
    warnings.push("Reduced visibility. Brighter colors improve safety near traffic")
  }

  // AQI logic
  if (aqi > 200) {
    warnings.push("Hazardous air quality: avoid outdoor exposure if possible")
    warnings.push("N95 mask recommended if outside")
  } else if (aqi > 150) {
    warnings.push("Unhealthy air. Sensitive groups should mask outdoors")
  }

  // Footwear
  if (snow > 2 || (temp < 0 && precipitation > 0)) {
    footwear.push("Insulated, waterproof snow boots with good tread")
    footwear.push("Ice cleats or crampons if icy. Bring spare dry socks")
  } else if (temp > 32) {
    footwear.push("Sandals, flip-flops, or barefoot-style shoes")
    footwear.push("Ultra-breathable sneakers if closed-toe needed")
  } else if (temp > 25) {
    footwear.push("Sandals, espadrilles, or breathable sneakers")
  } else if (temp > 15) {
    footwear.push("Sneakers, loafers, or light boots. Almost anything works")
  } else if (temp > 5) {
    footwear.push("Closed shoes: sneakers, boots, or leather shoes")
  } else if (temp > -5) {
    footwear.push("Insulated boots or thick-soled shoes plus wool socks")
  } else if (temp > -15) {
    footwear.push("Winter boots (rated to -20°C or lower). Thick wool socks")
  } else {
    footwear.push("Expedition-grade winter boots. Vapor barrier socks")
    footwear.push("Multiple sock layers: thin liner plus thick wool")
  }

  // Headwear
  if (effectiveTempAdjusted < -10) {
    headwear.push("Insulated beanie or trapper hat (covers ears)")
    headwear.push("Balaclava or face mask if windy. Goggles if blowing snow")
  } else if (effectiveTempAdjusted < 0) {
    headwear.push("Warm beanie or winter hat. Ears must be covered")
  } else if (effectiveTempAdjusted < 10) {
    headwear.push("Light beanie or headband for ears. Hat optional but recommended")
  } else if (effectiveTempAdjusted > 28 && uvIndex > 3) {
    headwear.push("Sun hat with 360° brim. Protects ears, neck, face")
  }

  // Gloves
  if (effectiveTempAdjusted < -15) {
    accessories.push("Expedition mittens (warmer than gloves). Hand warmers")
  } else if (effectiveTempAdjusted < -5) {
    accessories.push("Insulated gloves or mittens. Touchscreen compatible helpful")
  } else if (effectiveTempAdjusted < 5) {
    accessories.push("Light gloves. Fingers get cold first")
  }

  // Scarf/neck
  if (effectiveTempAdjusted < -5) {
    accessories.push("Thick scarf or neck gaiter. Pull over face in wind")
  } else if (effectiveTempAdjusted < 5) {
    accessories.push("Scarf or neck warmer. Protects vulnerable neck area")
  }

  // Sunglasses
  if (uvIndex > 3) {
    accessories.push("UV400 sunglasses (not just dark — need UV protection)")
    if (condition === 'clear' && snow === 0) {
      accessories.push("Polarized lenses reduce glare")
    }
  }

  // Umbrella
  if (isRaining && wind < 20) {
    if (precipitation > 10) accessories.push("Sturdy umbrella. Compact ones invert in wind")
    else accessories.push("Umbrella or rain jacket — your preference today")
  } else if (isRaining && wind >= 20) {
    accessories.push("Skip umbrella — wind will destroy it. Raincoat only")
  }

  // Fabric pick summary
  if (fabricPick.recommended.length > 0) {
    fabrics.push(...fabricPick.recommended.slice(0, 5))
  }

  // Color pick summary
  if (colorPick.good.length > 0) {
    colors.push(`Good colors: ${colorPick.good.slice(0, 5).join(', ')}`)
  }
  if (colorPick.bad.length > 0) {
    colors.push(`Avoid today: ${colorPick.bad.slice(0, 4).join(', ')}`)
  }
  if (colorPick.notes.length > 0) colors.push(...colorPick.notes)

  // Activity-specific
  if (activity && ACTIVITY_REQUIREMENTS[activity]) {
    const req = ACTIVITY_REQUIREMENTS[activity]
    activitySpecific.push(`${activity.charAt(0).toUpperCase() + activity.slice(1)} requirements: ${
      Object.entries(req)
        .filter(([, v]) => typeof v !== 'object' && v !== 'essential' && v !== 'critical' && v !== 'recommended')
        .map(([k, v]) => `${k} ${v}`)
        .slice(0, 3)
        .join(', ')
    }`)
    if (req.special) activitySpecific.push(...req.special)
  }

  // Person-specific
  if (askingForBabies) healthNotes = getBabyToddlerAdvice(data)
  else if (askingForElderly) healthNotes = getElderlyAdvice(data)
  else if (askingForPregnancy) healthNotes = getPregnancyAdvice(data)

  // ─── Assemble response ─────────────────────────────────────────────
  const intros = [
    "Outfit check",
    "Here's what I would wear",
    "Weather fit for today",
    "Dress code",
    "Zephye's fit recommendation",
    "Your weather wardrobe",
    "Today's clothing guide"
  ]

  const comfortLabel = comfortIndex > 80 ? 'Excellent'
    : comfortIndex > 60 ? 'Good'
    : comfortIndex > 40 ? 'Challenging'
    : comfortIndex > 20 ? 'Difficult'
    : 'Hazardous'

  const verdict = `${random(intros)} — feels like ${Math.round(effectiveTempAdjusted)}°C`

  const summaryParts = []
  summaryParts.push(`Comfort index ${comfortIndex}/100 (${comfortLabel})`)
  if (layers.length > 0) summaryParts.push(layers[0])
  if (accessories.length > 0) summaryParts.push(accessories[0])
  if (data._journey?.narrative) summaryParts.push(data._journey.narrative)

  const summary = summaryParts.join(' · ')

  const noteParts = []
  if (warnings.length > 0) noteParts.push(warnings[0])
  if (journeyAdvice.notes.length > 0) noteParts.push(journeyAdvice.notes[0])
  const note = noteParts.join(' · ')

  // Details — group into rows
  const details = []
  const push = (label, value) => { if (value) details.push({ label, value }) }

  push('Feels like', `${Math.round(effectiveTempAdjusted)}°C`)
  push('Comfort', `${comfortIndex}/100 (${comfortLabel})`)
  push('Layers needed', `${layeringNeed.layers} — ${layeringNeed.description}`)
  if (prefs.gender !== 'neutral') push('Preferred style', prefs.gender)
  if (prefs.formality !== 'casual') push('Formality', prefs.formality)
  if (prefs.runsHot) push('Runs hot', 'yes — adjusted +2°C')

  if (itemPick.tops.length > 0) push('Tops fit today', itemPick.tops.join(', '))
  if (itemPick.bottoms.length > 0) push('Bottoms fit today', itemPick.bottoms.join(', '))

  if (layers.length > 0) push('Primary layer', layers[0])
  if (accessories.length > 0) push('Top accessory', accessories[0])
  if (footwear.length > 0) push('Footwear', footwear[0])
  if (headwear.length > 0) push('Headwear', headwear[0])

  if (fabrics.length > 0) push('Fabrics', [...new Set(fabrics)].slice(0, 6).join(', '))
  if (colorPick.good.length > 0) push('Good colors', colorPick.good.slice(0, 5).join(', '))

  if (journeyAdvice.layers.length > 0) push('Journey layers', journeyAdvice.layers.join(' · '))
  if (journeyAdvice.accessories.length > 0) push('Journey extras', journeyAdvice.accessories.join(' · '))

  // ─── fullText — markdown-friendly ──────────────────────────────────
  const ft = []
  ft.push(`### ${verdict}`)
  ft.push('')
  ft.push(summary)
  if (note) { ft.push(''); ft.push(`**Note:** ${note}`) }

  if (layers.length > 0) {
    ft.push('')
    ft.push('**Layers**')
    layers.forEach(l => ft.push(`- ${l}`))
  }
  if (footwear.length > 0) {
    ft.push('')
    ft.push('**Footwear**')
    footwear.forEach(f => ft.push(`- ${f}`))
  }
  if (headwear.length > 0) {
    ft.push('')
    ft.push('**Headwear**')
    headwear.forEach(h => ft.push(`- ${h}`))
  }
  if (accessories.length > 0) {
    ft.push('')
    ft.push('**Accessories**')
    accessories.forEach(a => ft.push(`- ${a}`))
  }
  if (fabrics.length > 0) {
    ft.push('')
    ft.push(`**Fabrics:** ${[...new Set(fabrics)].join(', ')}`)
  }
  if (colors.length > 0) {
    ft.push('')
    ft.push('**Colors**')
    colors.forEach(c => ft.push(`- ${c}`))
  }
  if (activitySpecific.length > 0) {
    ft.push('')
    ft.push('**Activity-specific**')
    activitySpecific.forEach(a => ft.push(`- ${a}`))
  }
  if (timeAdjustments.length > 0) {
    ft.push('')
    ft.push('**Time-based notes**')
    timeAdjustments.forEach(t => ft.push(`- ${t}`))
  }
  if (journeyAdvice.layers.length > 0 || journeyAdvice.accessories.length > 0) {
    ft.push('')
    ft.push('**Journey context**')
    journeyAdvice.layers.forEach(l => ft.push(`- ${l}`))
    journeyAdvice.accessories.forEach(a => ft.push(`- ${a}`))
  }
  if (healthNotes.length > 0) {
    ft.push('')
    ft.push('**Special considerations**')
    healthNotes.forEach(h => ft.push(`- ${h}`))
  }
  if (warnings.length > 0) {
    ft.push('')
    ft.push('**Warnings**')
    warnings.forEach(w => ft.push(`- ${w}`))
  }

  return { verdict, summary, note, details, fullText: ft.join('\n') }
}

// ─── SPECIALIZED EXPORTS (kept for backward compat) ────────────────────

export const getClothingLayers = (data) => {
  if (!data) return "Loading..."
  const { temp, wind, humidity } = data
  const wc = calcWindChill(temp, wind)
  const eff = Math.min(temp, wc)
  const layering = calculateLayeringIndex(temp, wind, humidity)
  const lines = [`Ideal layering: ${layering.layers} layers (${layering.description})`]
  if (eff < -15) lines.push('Base: merino/synthetic thermal · Mid: heavy fleece/wool · Insulation: down · Shell: hardshell')
  else if (eff < -5) lines.push('Base: thermal long sleeve + leggings · Mid: fleece · Outer: insulated winter coat')
  else if (eff < 5) lines.push('Base: long sleeve · Mid: sweater · Outer: winter jacket')
  else if (eff < 12) lines.push('Base: t-shirt · Mid: sweater/cardigan · Optional: windbreaker')
  else if (eff < 20) lines.push('Single layer + optional light overshirt')
  else lines.push('Single layer sufficient. Lightest fabrics only.')
  return lines.join('\n')
}

export const getFootwearAdvice = (data) => {
  if (!data) return "Loading..."
  const { temp, condition, precipitation, snow } = data
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  const lines = ['Footwear recommendation:']
  if (snow > 5 || temp < -10) lines.push('Insulated waterproof snow boots. Wool socks. Ice cleats if needed.')
  else if (isRaining || precipitation > 5) lines.push('Waterproof boots or rain boots. Non-slip sole.')
  else if (temp > 30) lines.push('Sandals, flip-flops, or barefoot shoes.')
  else if (temp > 20) lines.push('Sneakers, loafers, or casual shoes. Breathable.')
  else if (temp > 5) lines.push('Closed shoes or light boots. Regular socks.')
  else lines.push('Insulated boots or thick-soled shoes plus wool socks.')
  return lines.join('\n')
}

export const getAccessoriesAdvice = (data) => {
  if (!data) return "Loading..."
  const { temp, wind, uvIndex, condition } = data
  const wc = calcWindChill(temp, wind)
  const eff = Math.min(temp, wc)
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  const lines = ['Essential accessories:']
  if (uvIndex > 6) lines.push('Eyewear: UV400 sunglasses, polarized if possible')
  if (eff < -10) lines.push('Headwear: insulated beanie/trapper hat')
  else if (eff > 28 && uvIndex > 3) lines.push('Headwear: wide-brim sun hat')
  if (eff < -15) lines.push('Hands: expedition mittens + hand warmers')
  else if (eff < -5) lines.push('Hands: insulated gloves')
  else if (eff < 5) lines.push('Hands: light gloves')
  if (eff < -5) lines.push('Neck: thick scarf or neck gaiter')
  if (isRaining && wind < 20) lines.push('Rain protection: umbrella useful today')
  else if (isRaining && wind >= 20) lines.push('Rain protection: skip umbrella — raincoat only')
  return lines.join('\n')
}

export default getClothingAdvice
