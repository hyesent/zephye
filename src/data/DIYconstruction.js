// ============================================================================
// COMPREHENSIVE DIY & CONSTRUCTION WEATHER ADVISORY SYSTEM
//
// Returns structured object: { verdict, summary, note, details, fullText }
//
// Reads:
//   - Full weather signals (temp, humidity, wind, dew point, pressure, etc.)
//   - data._journey (route context — if travelling to a work site)
//   - preferences (DIY skill, property type, region)
//
// Uses:
//   - MATERIALS database — for material-specific guidance
//   - SAFETY thresholds — for ladder, roof, power tools, excavation
//   - Condition analyzers — painting, concrete, woodworking
// ============================================================================

import {
  getUVLevel,
  random,
  getSeason,
  getTimeOfDay,
  calcHeatIndex,
  calcWindChill
} from './calculations'

// ─── PREFERENCES (safe read) ────────────────────────────────────────────

function readPreference(key, fallback) {
  try {
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
  diySkill: 'intermediate',
  propertyType: 'house',
  region: 'temperate',
}

function getPrefs() {
  return {
    skill: readPreference('DIYSkill', DEFAULT_PREFS.diySkill),
    propertyType: readPreference('DIYPropertyType', DEFAULT_PREFS.propertyType),
    region: readPreference('DIYRegion', DEFAULT_PREFS.region),
  }
}

// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────

export const sampleQuestions = [
  "Can I paint outside today?",
  "Is it good weather for exterior painting?",
  "Can I pour concrete today?",
  "Is it good weather for concrete work?",
  "Is it too humid for woodworking?",
  "Good day for roofing work?",
  "Should I stain my deck?",
  "Is it safe to use a ladder?",
  "Can I use power tools outside?",
  "Should I power wash the house?",
  "Can I dig a trench?",
  "What construction work can I do today?",
  "Should I rent heavy equipment?",
  "What's the best time to work today?"
]

// ─── MATERIALS DATABASE ────────────────────────────────────────────────

const MATERIALS = {
  paint_latex: {
    label: 'Latex paint',
    minTemp: 10, maxTemp: 32, idealTemp: [15, 27],
    minHumidity: 30, maxHumidity: 70, idealHumidity: [40, 60],
    dryTime: '1-2 hours touch, 4 hours recoat, 30 days full cure',
    windLimit: 25, rainFree: 4,
    special: [
      'Surface temp matters more than air temp — check with IR thermometer',
      'Below 10°C: poor film formation, cracking, peeling',
      'Above 32°C: dries too fast, lap marks, poor adhesion',
      'High humidity: slow dry, surfactant leaching (brown streaks)'
    ]
  },
  paint_oil: {
    label: 'Oil-based paint',
    minTemp: 5, maxTemp: 32, idealTemp: [10, 27],
    minHumidity: 20, maxHumidity: 85, idealHumidity: [30, 60],
    dryTime: '6-8 hours touch, 24 hours recoat, 7 days full cure',
    windLimit: 20, rainFree: 8,
    special: [
      'More forgiving in cold than latex',
      'Strong fumes — ventilation essential. Respirator recommended',
      'Longer dry time but better leveling'
    ]
  },
  stain_deck: {
    label: 'Deck stain',
    minTemp: 10, maxTemp: 32, idealTemp: [15, 27],
    minHumidity: 30, maxHumidity: 70, idealHumidity: [40, 60],
    dryTime: '2-4 hours touch, 24 hours before rain',
    rainFree: 24,
    special: [
      'Wood moisture content must be under 15% (check with meter)',
      'Do not apply in direct sun — dries too fast, will not penetrate',
      'New pressure-treated wood: wait 3-6 months before staining'
    ]
  },
  concrete: {
    label: 'Concrete',
    minTemp: 5, maxTemp: 32, idealTemp: [10, 27],
    minHumidity: 20, maxHumidity: 90, idealHumidity: [40, 80],
    setTime: 'Initial 4-8h · walk on 24h · drive on 7 days · full strength 28 days',
    rainFree: 8, windLimit: 30,
    special: [
      'Below 5°C: hydration stops. Concrete never gains strength',
      'Above 32°C: flash set, plastic shrinkage cracks, weak',
      'Ideal: 15-21°C for maximum long-term strength',
      'Never pour on frozen ground — will settle and crack when it thaws',
      'Add 1% calcium chloride accelerates set by 50% but corrodes rebar'
    ]
  },
  mortar: {
    label: 'Mortar',
    minTemp: 5, maxTemp: 38, idealTemp: [15, 27],
    minHumidity: 20, maxHumidity: 80, idealHumidity: [40, 70],
    setTime: 'Initial set 1-2 hours · full cure 28 days',
    rainFree: 24,
    special: [
      'Below 5°C: hydration stops. Protect with heated enclosures',
      'Above 38°C: flash set. No time to work',
      'Hot weather: keep bricks wet (they suck water from mortar)',
      'Mortar should be workable for 2-3 hours maximum'
    ]
  },
  wood_glue: {
    label: 'Wood glue',
    minTemp: 10, maxTemp: 32, idealTemp: [18, 27],
    minHumidity: 25, maxHumidity: 65, idealHumidity: [35, 55],
    clampTime: 'PVA 30 min to 1 hour · full cure 24 hours',
    special: [
      'Below 10°C: PVA glue chalks (white residue, weak bond)',
      'Above 32°C: open time too short. Cannot assemble before skin forms',
      'Cold glue joint FAILS — warm both wood and glue to 18°C+'
    ]
  },
  pvc_cement: {
    label: 'PVC cement',
    minTemp: 5, maxTemp: 38, idealTemp: [15, 32],
    minHumidity: 0, maxHumidity: 90, idealHumidity: [10, 80],
    setTime: '15 min to handle · 2 hours for pressure test',
    special: [
      'Below 5°C: solvent will not evaporate. Joint fails',
      'Above 38°C: solvent flashes off before you can assemble',
      'Primer required in most plumbing codes (purple primer)'
    ]
  },
  epoxy: {
    label: 'Epoxy',
    minTemp: 10, maxTemp: 30, idealTemp: [20, 27],
    minHumidity: 0, maxHumidity: 60, idealHumidity: [30, 50],
    cureTime: '24 hours to walk · 72 hours full cure',
    special: [
      'Below 10°C: will not cure. Stays sticky forever',
      'Above 30°C: exotherms. Can smoke, bubble, or yellow',
      'High humidity: amine blush (waxy surface, adhesion failure)',
      'Must mix exactly. Ratio matters. No eyeballing'
    ]
  },
  drywall_compound: {
    label: 'Drywall compound',
    minTemp: 10, maxTemp: 32, idealTemp: [18, 27],
    minHumidity: 20, maxHumidity: 70, idealHumidity: [30, 55],
    dryTime: 'Light coat 24 hours · heavy fill 48+ hours',
    special: [
      'High humidity: drying time triples. Use setting-type compound (hot mud)',
      'Cold: drying time doubles. Use heater and fan',
      'Hot mud sets by chemical reaction, not drying — works in cold/humid'
    ]
  },
  caulk_sealant: {
    label: 'Caulk / sealant',
    minTemp: 5, maxTemp: 40, idealTemp: [15, 32],
    minHumidity: 0, maxHumidity: 80, idealHumidity: [20, 70],
    skinTime: '30 min to 2 hours depending on type',
    special: [
      'Silicone: works in wider temp range but needs dry surface',
      'Cold: caulk stiff, hard to gun. Warm tube in pocket first',
      'Wet surface — no caulk sticks to wet surface',
      'Butyl: messy, but stays flexible forever, best for windows'
    ]
  },
  asphalt_sealer: {
    label: 'Asphalt sealer',
    minTemp: 15, maxTemp: 35, idealTemp: [21, 30],
    minHumidity: 20, maxHumidity: 70, idealHumidity: [30, 60],
    dryTime: '4-8 hours touch · 24h before rain · 48h before vehicles',
    rainFree: 24,
    special: [
      'Surface must be completely dry',
      'Below 15°C: will not cure properly. Stays tacky',
      'Apply in shade if possible (hot pavement equals flash dry)'
    ]
  },
  tile_thinset: {
    label: 'Tile thinset',
    minTemp: 10, maxTemp: 35, idealTemp: [15, 29],
    minHumidity: 20, maxHumidity: 75, idealHumidity: [30, 60],
    dryTime: '24h grout · 48h foot traffic · 72h heavy',
    special: [
      'Polymer modified: do not use above 35°C (flash cure)',
      'Below 10°C: cure stops. Use unmodified with additive',
      'Porcelain needs modified thinset (non-modified will not bond)'
    ]
  },
  grout: {
    label: 'Grout',
    minTemp: 10, maxTemp: 32, idealTemp: [15, 27],
    minHumidity: 20, maxHumidity: 80, idealHumidity: [30, 70],
    dryTime: '24 hours before walking · 7 days full cure',
    special: [
      'Epoxy grout: more expensive but stain proof, no sealing needed',
      'High humidity slows cure, can cause color variation',
      'Sanded for joints over 1/8 inch · unsanded for under 1/8 inch'
    ]
  }
}

// ─── SAFETY THRESHOLDS ─────────────────────────────────────────────────

const SAFETY = {
  ladder: {
    maxWind: 25, maxGust: 35,
    maxTemp: 38, minTemp: -5,
    wetSurface: 'NEVER on wet rungs. Slip equals life-changing fall',
    icySurface: 'ABSOLUTELY NOT. Frost or ice plus ladder equals hospital',
    heat: 'Above 32°C: reduce time on ladder. Heat exhaustion equals fall',
    cold: 'Below 0°C: cold hands lose grip. Metal ladder is frostbite risk',
    maxWeight: 225,
    angleRule: '4:1 ratio (1 foot out for every 4 feet up)',
    extension: 'Must extend 3 feet above landing surface'
  },
  roof: {
    maxWind: 30, maxGust: 40,
    maxTemp: 35, minTemp: -5,
    wetSurface: 'NEVER on wet roof. Fall equals death or paralysis',
    icySurface: 'DO NOT EVEN THINK ABOUT IT',
    heat: 'Roof surface 20°C+ hotter than air. Burns through shoes',
    special: 'Harness and anchor point. No exceptions above 3m height',
    warning: '1 in 5 construction deaths are from falls'
  },
  powerTools: {
    rain: 'ELECTROCUTION RISK. GFCI mandatory even in damp conditions',
    wetGround: 'Stand on dry board. GFCI. Inspect cords for damage',
    cold: 'Power cords stiffen, crack. Batteries die 40% faster',
    heat: 'Tools overheat. Duty cycle: 15 min on, 15 min off',
    maxTemp: 40, minTemp: -10,
    hearing: '85dB+ hearing protection mandatory',
    dust: 'OSHA silica rule: use dust extraction or respirator'
  },
  excavation: {
    callBefore: 'CALL 811 (or local utility locating service) BEFORE DIGGING',
    wetSoil: 'Trench collapse risk. Shoring or sloping required',
    frozenSoil: 'Impossible to dig. Wait for thaw or use ground thawing equipment',
    rain: 'Trenches flood. Walls collapse. No one in trench during or following rain',
    maxDepth: 'Over 1.2m (4ft): shoring, sloping, or trench box required'
  },
  scaffolding: {
    maxWind: 30, maxGust: 40,
    maxTemp: 38, minTemp: -5,
    ice: 'NO scaffolding on ice',
    rain: 'Wet planks equals slippery. Use anti-slip boards',
    overload: 'Do not exceed manufacturer load rating (usually 50kg/sqf)',
    guardrail: 'Top rail 42in, mid rail 21in minimum',
    inspection: 'Daily inspection required before use'
  },
  respiratory: {
    dust: 'N95 for dust. P100 for lead or wood dust. Cartridge for fumes',
    paint: 'Organic vapor cartridge for paint or fumes (change frequently)',
    silica: 'HEPA-rated respirator for concrete or stone cutting',
    wood: 'N95 or P100 for wood dust (sawdust is carcinogenic)',
    mold: 'P100 or N100 respirator for mold remediation'
  }
}

// ─── CONDITION ANALYZERS ───────────────────────────────────────────────

function analyzePainting(data) {
  const { temp, humidity, wind, uvIndex, condition, dewPoint, precipitation, timeOfDay } = data
  const isClear = condition === 'clear' || condition === 'partly-cloudy'
  const isMidday = timeOfDay === 'midday' || (new Date().getHours() >= 11 && new Date().getHours() <= 15)
  const isDirectSun = isClear && isMidday
  const surfaceTemp = isDirectSun ? temp + 20 : temp + 5

  const factors = []
  const warnings = []
  let score = 100

  // Temperature
  if (surfaceTemp < 0) { score -= 100; warnings.push('Surface below freezing — no paint will work') }
  else if (surfaceTemp < 5) { score -= 80; warnings.push('Surface below 5°C — oil only, may still fail') }
  else if (surfaceTemp < 10) { score -= 50; warnings.push('Cold surface — use cold-weather formula') }
  else if (surfaceTemp > 50) { score -= 100; warnings.push('Surface above 50°C — paint dries instantly') }
  else if (surfaceTemp > 40) { score -= 70; warnings.push('Hot surface — work fast, maintain wet edge') }
  else if (surfaceTemp > 35) { score -= 30; factors.push('Warm surface — extend open time with Floetrol') }

  // Humidity
  if (humidity > 85) { score -= 60; warnings.push('High humidity — slow dry, surfactant leaching risk') }
  else if (humidity > 75) { score -= 30; factors.push('Elevated humidity — allow extra drying time') }
  else if (humidity < 25) { score -= 30; factors.push('Very dry — add extender for brushing') }

  // Dew point
  if (dewPoint != null) {
    const delta = temp - dewPoint
    if (delta < 3) { score -= 80; warnings.push('Dew point within 3°C — condensation will ruin finish') }
    else if (delta < 5) { score -= 30; factors.push('Dew point close — finish before 2PM') }
  }

  // Wind
  if (wind > 40) { score -= 90; warnings.push('Extreme wind — do not paint outdoors') }
  else if (wind > 30) { score -= 60; warnings.push('High wind — spray impossible, use brush or roll') }
  else if (wind > 20) { score -= 20; factors.push('Moderate wind — protect nearby surfaces from overspray') }

  // Rain
  if (condition === 'rain' || condition === 'thunderstorm') { score -= 100; warnings.push('Rain — do not paint. Surfaces wet') }
  else if (precipitation > 0) { score -= 30; factors.push('Precipitation forecast — check rain-free window (4-8 hours)') }

  const overall = Math.max(0, Math.min(100, score))
  return {
    score: overall,
    surfaceTemp,
    canPaint: overall >= 50,
    rating: overall >= 90 ? 'Excellent'
      : overall >= 70 ? 'Good'
      : overall >= 50 ? 'Fair'
      : overall >= 30 ? 'Poor'
      : 'Avoid',
    factors,
    warnings
  }
}

function analyzeConcrete(data) {
  const { temp, humidity, wind, condition, tempMin, tempMax, precipitation } = data
  const factors = []
  const warnings = []
  let score = 100

  // Temperature — most important
  if (temp < 0) { score -= 100; warnings.push('Freezing — DO NOT POUR. 50%+ permanent strength loss') }
  else if (temp < 2) { score -= 70; warnings.push('Below 2°C — need heated enclosures and blankets') }
  else if (temp < 5) { score -= 40; factors.push('Cold weather concreting — use accelerators and insulation') }
  else if (temp < 10) { score -= 15; factors.push('Cool concreting — use 1-2% accelerator') }
  else if (temp > 38) { score -= 80; warnings.push('Extreme heat — flash set likely, strength reduced 20%+') }
  else if (temp > 32) { score -= 40; factors.push('Hot weather concreting — use retarders, ice water, shade') }
  else if (temp > 28) { score -= 15; factors.push('Warm — retarders recommended') }

  // Humidity + wind + evaporation
  if (humidity < 30 && temp > 20) {
    score -= 30
    warnings.push('Low humidity and warm — plastic shrinkage cracks within 1-2 hours')
  }
  if (wind > 25) {
    score -= 20
    warnings.push('High wind — rapid surface drying. Use windbreaks or fog misters')
  }

  // Rain
  if (condition === 'rain' || condition === 'thunderstorm') {
    score -= 90
    warnings.push('Rain — postpone pour. Rain ruins fresh surface')
  } else if (precipitation > 0 && precipitation < 5) {
    score -= 20
    factors.push('Light rain possible — have plastic sheeting ready')
  }

  const overall = Math.max(0, Math.min(100, score))
  return {
    score: overall,
    canPour: temp >= 5 && temp <= 32 && condition !== 'rain' && condition !== 'thunderstorm',
    rating: overall >= 90 ? 'Excellent'
      : overall >= 70 ? 'Good'
      : overall >= 50 ? 'Fair'
      : 'Avoid',
    needsAccelerator: temp < 10,
    needsRetarder: temp > 28,
    needsEvapRetarder: humidity < 30 && wind > 15,
    requiresInsulation: temp < 5 || (tempMin != null && tempMin < 2),
    factors,
    warnings
  }
}

function getEquilibriumMoistureContent(temp, humidity) {
  const H = humidity / 100
  const K1 = 0.132
  const K2 = 0.038
  const emc = (1800 / (temp + 273)) * (K1 * H / (1 - K1 * H) + K1 * K2 * H / (1 + K1 * K2 * H))
  return Math.round(emc * 10) / 10
}

function analyzeWoodworking(data) {
  const { temp, humidity, condition, precipitation } = data
  const emc = getEquilibriumMoistureContent(temp, humidity)
  const factors = []
  const warnings = []
  let score = 100

  if (humidity > 80) {
    score -= 40
    warnings.push('High humidity — wood swollen, do not cut to final dimensions')
  } else if (humidity > 70) {
    score -= 20
    factors.push('Elevated humidity — allow extra glue drying time')
  } else if (humidity < 30) {
    score -= 30
    warnings.push('Very dry — wood shrunk, splintering, glue sets very fast')
  }

  if (temp < 5) {
    score -= 70
    warnings.push('Cold shop — glue will not cure. Heat to 15°C minimum')
  } else if (temp < 10) {
    score -= 30
    factors.push('Cold shop — PVA glue needs 10°C minimum')
  } else if (temp > 35) {
    score -= 40
    warnings.push('Hot shop — glue sets too fast. Work in small batches')
  }

  if (condition === 'rain' || precipitation > 0) {
    score -= 30
    warnings.push('Rain — wood absorbs moisture. Do not apply finish')
  }

  const overall = Math.max(0, Math.min(100, score))
  return {
    emc,
    score: overall,
    isIdeal: emc >= 8 && emc <= 12,
    tempOk: temp >= 10 && temp <= 32,
    glueOk: temp >= 10 && temp <= 32 && humidity < 65,
    rating: overall >= 90 ? 'Excellent'
      : overall >= 70 ? 'Good'
      : overall >= 50 ? 'Fair'
      : 'Challenging',
    factors,
    warnings
  }
}

// ─── ROOFING ANALYZER ──────────────────────────────────────────────────

function analyzeRoofing(data) {
  const { temp, wind, windGust, condition, precipitation } = data
  const warnings = []
  const factors = []
  let score = 100

  if (wind > 40 || windGust > 60) {
    score -= 100
    warnings.push('Dangerous wind — NO roof work. Flying debris risk')
  } else if (wind > 30) {
    score -= 70
    warnings.push('High wind — roof work is hazardous. Secure all materials')
  } else if (wind > 20) {
    score -= 30
    factors.push('Windy — harness mandatory, secure materials')
  }

  const roofSurfaceTemp = condition === 'clear' ? temp + 25 : temp + 5
  if (roofSurfaceTemp > 50) {
    score -= 70
    warnings.push(`Extreme roof heat (${roofSurfaceTemp}°C) — work early morning only`)
  } else if (roofSurfaceTemp > 40) {
    score -= 40
    factors.push(`Hot roof surface (${roofSurfaceTemp}°C) — shade breaks every 20 minutes`)
  }

  if (temp < 5) {
    score -= 50
    warnings.push('Cold — shingles brittle. Wait for temp above 10°C')
  }

  if (condition === 'rain' || precipitation > 0) {
    score -= 100
    warnings.push('Wet roof — extremely slippery. Wait for dry conditions')
  }

  const overall = Math.max(0, Math.min(100, score))
  return {
    score: overall,
    roofSurfaceTemp,
    canWork: overall >= 50,
    rating: overall >= 90 ? 'Excellent'
      : overall >= 70 ? 'Good'
      : overall >= 50 ? 'Fair'
      : 'Avoid',
    factors,
    warnings
  }
}

// ─── EXCAVATION ANALYZER ───────────────────────────────────────────────

function analyzeExcavation(data) {
  const { temp, humidity, condition, precipitation } = data
  const warnings = []
  const factors = []
  let score = 100

  warnings.push('CALL 811 BEFORE DIGGING — wait 2-3 business days for utility marking')

  if (condition === 'rain' || precipitation > 5) {
    score -= 60
    warnings.push('Wet soil — trench collapse risk HIGH. Shoring required')
  }

  if (temp < 0) {
    score -= 50
    warnings.push('Frozen ground — difficult to impossible. Wait for thaw')
  }

  if (temp > 30 && humidity < 40) {
    score -= 20
    factors.push('Dry soil — dust control needed. Water down before digging')
  }

  const overall = Math.max(0, Math.min(100, score))
  return {
    score: overall,
    rating: overall >= 70 ? 'Workable'
      : overall >= 50 ? 'Caution'
      : 'Postpone if possible',
    factors,
    warnings
  }
}

// ─── MATERIAL PICKER BY QUESTION ───────────────────────────────────────

function pickMaterialFromQuestion(q) {
  if (q.includes('latex paint')) return 'paint_latex'
  if (q.includes('oil paint') || q.includes('oil-based')) return 'paint_oil'
  if (q.includes('stain') || q.includes('deck stain')) return 'stain_deck'
  if (q.includes('concrete') || q.includes('cement')) return 'concrete'
  if (q.includes('mortar') || q.includes('brick') || q.includes('masonry')) return 'mortar'
  if (q.includes('wood glue') || q.includes('glue')) return 'wood_glue'
  if (q.includes('pvc') || q.includes('pipe cement')) return 'pvc_cement'
  if (q.includes('epoxy')) return 'epoxy'
  if (q.includes('drywall') || q.includes('mud') || q.includes('joint compound')) return 'drywall_compound'
  if (q.includes('caulk') || q.includes('sealant')) return 'caulk_sealant'
  if (q.includes('asphalt') || q.includes('driveway sealer')) return 'asphalt_sealer'
  if (q.includes('thinset') || q.includes('tile adhesive')) return 'tile_thinset'
  if (q.includes('grout')) return 'grout'
  return null
}

// ─── JOURNEY-AWARE ADVICE ──────────────────────────────────────────────

function getJourneyAdvice(journey) {
  if (!journey) return { notes: [] }
  const notes = []
  if (journey.hasThunderstorm) notes.push('Thunderstorm on your route — postpone outdoor work')
  if (journey.hasHeavyRain) notes.push('Heavy rain along the way — outdoor work impossible')
  if (journey.hasRain) notes.push('Rain on the route — outdoor tasks compromised')
  if (journey.hasSnow) notes.push('Snow on the route — travel time to site will increase')
  if (journey.windMax != null && journey.windMax > 40) {
    notes.push(`Strong wind up to ${journey.windMax} km/h — scaffolding and ladders unsafe`)
  }
  return { notes }
}

// ─── MAIN FUNCTION ─────────────────────────────────────────────────────

export const getDIYConstructionAdvice = (data, question = '') => {
  if (!data) {
    return {
      verdict: "I don't have weather data right now.",
      summary: 'Try again in a moment.',
      note: '',
      details: [],
      fullText: ''
    }
  }

  // Unpack with time-shift awareness
  let {
    temp, humidity, wind, windGust = 0, uvIndex = 0,
    condition, precipitation = 0, city,
    dewPoint, tempMin, tempMax, feelsLike, visibility,
    pressure, aqi
  } = data

  if (data._hourIndex !== undefined && data.hourly) {
    const idx = data._hourIndex
    const h = data.hourly
    if (h.temperature_2m?.[idx] !== undefined) temp = Math.round(h.temperature_2m[idx])
    if (h.apparent_temperature?.[idx] !== undefined) feelsLike = Math.round(h.apparent_temperature[idx])
    if (h.relative_humidity_2m?.[idx] !== undefined) humidity = h.relative_humidity_2m[idx]
    if (h.wind_speed_10m?.[idx] !== undefined) wind = h.wind_speed_10m[idx]
    if (h.wind_gusts_10m?.[idx] !== undefined) windGust = h.wind_gusts_10m[idx]
    if (h.precipitation?.[idx] !== undefined) precipitation = h.precipitation[idx]
    if (h.uv_index?.[idx] !== undefined) uvIndex = h.uv_index[idx]
    if (h.dew_point_2m?.[idx] !== undefined) dewPoint = h.dew_point_2m[idx]
    if (h.visibility?.[idx] !== undefined) visibility = h.visibility[idx] / 1000
  }

  if (data._dayOffset !== undefined && data.daily) {
    const d = data._dayOffset > 0 ? data._dayOffset : 0
    const dd = data.daily
    if (dd.temperature_2m_max?.[d] !== undefined) tempMax = Math.round(dd.temperature_2m_max[d])
    if (dd.temperature_2m_min?.[d] !== undefined) tempMin = Math.round(dd.temperature_2m_min[d])
  }

  const prefs = getPrefs()
  const q = question.toLowerCase()

  // Analyze the three main work types
  const painting = analyzePainting(data)
  const concrete = analyzeConcrete(data)
  const woodwork = analyzeWoodworking(data)
  const roofing = analyzeRoofing(data)
  const excavation = analyzeExcavation(data)
  const journey = getJourneyAdvice(data._journey)

  // Intent detection
  const isPainting = /\b(paint|stain|varnish|seal|coating|prime|epoxy|polyurethane|finish)\b/.test(q)
  const isConcrete = /\b(concrete|cement|pour|mix|slab|foundation|grout|mortar|masonry|brick|tile|paver)\b/.test(q)
  const isWoodwork = /\b(wood|carpentry|furniture|cabinet|floor|deck|fence|shed|glue|laminate|veneer)\b/.test(q)
  const isRoofing = /\b(roof|shingle|gutter|chimney|skylight)\b/.test(q)
  const isExcavation = /\b(dig|trench|excavat|grade|backfill)\b/.test(q)
  const isSafety = /\b(safe|ladder|scaffold|respirator|fall|danger)\b/.test(q)
  const isGeneral = !isPainting && !isConcrete && !isWoodwork && !isRoofing && !isExcavation && !isSafety

  const askedMaterial = pickMaterialFromQuestion(q)

  // ─── Build the response ──────────────────────────────────────────
  const details = []
  const push = (label, value) => { if (value) details.push({ label, value }) }

  push('Temperature', `${temp}°C${feelsLike ? ` (feels like ${feelsLike}°C)` : ''}`)
  if (tempMin != null && tempMax != null) push('Range today', `${tempMin}°C – ${tempMax}°C`)
  push('Humidity', `${humidity}%`)
  push('Wind', `${Math.round(wind)} km/h${windGust > wind + 5 ? ` (gusts ${Math.round(windGust)})` : ''}`)
  if (dewPoint != null) push('Dew point', `${Math.round(dewPoint)}°C`)
  if (visibility != null) push('Visibility', `${visibility.toFixed(1)} km`)
  push('UV index', `${uvIndex} (${getUVLevel(uvIndex)})`)

  // Material-specific detail if user asked about one
  if (askedMaterial && MATERIALS[askedMaterial]) {
    const m = MATERIALS[askedMaterial]
    push(`${m.label} temp range`, `${m.minTemp}°C – ${m.maxTemp}°C`)
    push(`${m.label} ideal`, `${m.idealTemp[0]}°C – ${m.idealTemp[1]}°C`)
    if (m.dryTime) push('Dry/cure time', m.dryTime)
    if (m.setTime) push('Set time', m.setTime)
  }

  if (isPainting || isGeneral) {
    push('Painting', `${painting.rating} (${painting.score}/100)${painting.surfaceTemp ? ` · surface ~${painting.surfaceTemp}°C` : ''}`)
  }
  if (isConcrete || isGeneral) {
    push('Concrete', `${concrete.rating} (${concrete.score}/100)${concrete.canPour ? ' · OK to pour' : ' · do not pour'}`)
  }
  if (isWoodwork || isGeneral) {
    push('Woodworking', `${woodwork.rating} (${woodwork.score}/100) · EMC ${woodwork.emc}%`)
  }
  if (isRoofing || isGeneral) {
    push('Roofing', `${roofing.rating} (${roofing.score}/100)${roofing.roofSurfaceTemp ? ` · surface ~${roofing.roofSurfaceTemp}°C` : ''}`)
  }
  if (isExcavation) {
    push('Excavation', `${excavation.rating} (${excavation.score}/100)`)
  }

  if (prefs.skill !== 'intermediate') push('Skill level', prefs.skill)
  if (prefs.region !== 'temperate') push('Region', prefs.region)

  // ─── Verdict ─────────────────────────────────────────────────────
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  const isStorm = condition === 'thunderstorm'

  let verdict = ''
  if (isStorm) verdict = '⛔ STOP — Thunderstorm. No outdoor work'
  else if (wind > 50) verdict = '⛔ DANGEROUS WIND — No outdoor work'
  else if (isRaining && precipitation > 10) verdict = '🌧️ Heavy rain — indoor tasks only'
  else if (temp < 5) verdict = '🥶 Too cold — work indoors or wait'
  else if (temp > 38) verdict = '🔥 Too hot — work inside or wait'
  else if (isGeneral) verdict = `Weather rating: ${Math.round((painting.score + concrete.score + woodwork.score) / 3)}/100`
  else if (isPainting) verdict = painting.canPaint ? `Can paint — ${painting.rating}` : `Skip painting — ${painting.rating}`
  else if (isConcrete) verdict = concrete.canPour ? `Can pour — ${concrete.rating}` : `Do not pour — ${concrete.rating}`
  else if (isWoodwork) verdict = `Woodworking: ${woodwork.rating} (EMC ${woodwork.emc}%)`
  else if (isRoofing) verdict = roofing.canWork ? `Roof workable — ${roofing.rating}` : `Avoid roof — ${roofing.rating}`
  else if (isExcavation) verdict = `Excavation: ${excavation.rating}`
  else if (isSafety) verdict = 'Safety assessment below'
  else verdict = `Conditions: ${condition || 'mixed'}`

  // ─── Summary ─────────────────────────────────────────────────────
  const summaryParts = []
  if (city) summaryParts.push(city)
  summaryParts.push(`${temp}°C · ${humidity}% humidity · wind ${Math.round(wind)} km/h`)

  if (isGeneral) {
    const best = painting.score > concrete.score && painting.score > woodwork.score ? 'painting'
      : concrete.score > woodwork.score ? 'concrete' : 'woodworking'
    summaryParts.push(`Best work today: ${best}`)
  }

  if (isStorm || isRaining && precipitation > 10) {
    summaryParts.push('Focus on indoor tasks')
  }

  if (journey.notes.length > 0) summaryParts.push(journey.notes[0])

  const summary = summaryParts.join(' · ')

  // ─── Note ────────────────────────────────────────────────────────
  const noteParts = []
  if (painting.warnings.length > 0 && (isPainting || isGeneral)) noteParts.push(painting.warnings[0])
  if (concrete.warnings.length > 0 && (isConcrete || isGeneral)) noteParts.push(concrete.warnings[0])
  if (roofing.warnings.length > 0 && (isRoofing || isGeneral)) noteParts.push(roofing.warnings[0])
  if (isSafety) noteParts.push(SAFETY.ladder.wetSurface)
  const note = noteParts.join(' · ')

  // ─── fullText ────────────────────────────────────────────────────
  const ft = []
  ft.push(`### ${verdict}`)
  ft.push('')
  ft.push(summary)
  if (note) { ft.push(''); ft.push(`**Note:** ${note}`) }

  // Material specifics
  if (askedMaterial && MATERIALS[askedMaterial]) {
    const m = MATERIALS[askedMaterial]
    ft.push('')
    ft.push(`**${m.label} — conditions**`)
    ft.push(`- Temp range: ${m.minTemp}°C – ${m.maxTemp}°C`)
    ft.push(`- Ideal temp: ${m.idealTemp[0]}°C – ${m.idealTemp[1]}°C`)
    ft.push(`- Humidity range: ${m.minHumidity}% – ${m.maxHumidity}%`)
    if (m.dryTime) ft.push(`- Dry time: ${m.dryTime}`)
    if (m.setTime) ft.push(`- Set time: ${m.setTime}`)
    if (m.cureTime) ft.push(`- Cure time: ${m.cureTime}`)
    if (m.rainFree) ft.push(`- Rain-free window needed: ${m.rainFree}h`)
    m.special.forEach(s => ft.push(`- ${s}`))
  }

  // Painting section
  if (isPainting || isGeneral) {
    ft.push('')
    ft.push('**Painting**')
    ft.push(`- Rating: ${painting.rating} (${painting.score}/100)`)
    if (painting.surfaceTemp != null) ft.push(`- Surface temp ~${painting.surfaceTemp}°C`)
    painting.factors.forEach(f => ft.push(`- ${f}`))
    painting.warnings.forEach(w => ft.push(`- ⚠️ ${w}`))
  }

  // Concrete section
  if (isConcrete || isGeneral) {
    ft.push('')
    ft.push('**Concrete**')
    ft.push(`- Rating: ${concrete.rating} (${concrete.score}/100)`)
    if (concrete.canPour) {
      ft.push('- Safe to pour with precautions')
      if (concrete.needsAccelerator) ft.push('- Use accelerator (1-2% calcium chloride)')
      if (concrete.needsRetarder) ft.push('- Use retarder to prevent flash set')
      if (concrete.needsEvapRetarder) ft.push('- Use evaporation retarder immediately')
      if (concrete.requiresInsulation) ft.push('- Cover with insulating blankets 7 days')
    } else {
      ft.push('- ⚠️ Do not pour in these conditions')
    }
    concrete.factors.forEach(f => ft.push(`- ${f}`))
    concrete.warnings.forEach(w => ft.push(`- ⚠️ ${w}`))
  }

  // Woodworking section
  if (isWoodwork || isGeneral) {
    ft.push('')
    ft.push('**Woodworking**')
    ft.push(`- Rating: ${woodwork.rating} (${woodwork.score}/100)`)
    ft.push(`- Wood EMC: ${woodwork.emc}%`)
    if (woodwork.isIdeal) ft.push('- Ideal wood stability for precision work')
    if (!woodwork.glueOk) ft.push('- ⚠️ Glue conditions not ideal')
    woodwork.factors.forEach(f => ft.push(`- ${f}`))
    woodwork.warnings.forEach(w => ft.push(`- ⚠️ ${w}`))
  }

  // Roofing section
  if (isRoofing || isGeneral) {
    ft.push('')
    ft.push('**Roofing**')
    ft.push(`- Rating: ${roofing.rating} (${roofing.score}/100)`)
    if (roofing.roofSurfaceTemp != null) ft.push(`- Surface temp ~${roofing.roofSurfaceTemp}°C`)
    ft.push(`- ${SAFETY.roof.special}`)
    roofing.factors.forEach(f => ft.push(`- ${f}`))
    roofing.warnings.forEach(w => ft.push(`- ⚠️ ${w}`))
  }

  // Excavation section
  if (isExcavation) {
    ft.push('')
    ft.push('**Excavation**')
    ft.push(`- Rating: ${excavation.rating} (${excavation.score}/100)`)
    excavation.warnings.forEach(w => ft.push(`- ⚠️ ${w}`))
  }

  // Safety section
  if (isSafety) {
    ft.push('')
    ft.push('**Safety**')
    ft.push(`- Ladder: ${SAFETY.ladder.angleRule}`)
    ft.push(`- ${SAFETY.ladder.wetSurface}`)
    ft.push(`- Power tools: ${SAFETY.powerTools.rain}`)
    if (humidity > 80) ft.push(`- ${SAFETY.powerTools.wetGround}`)
    if (temp < 5) ft.push(`- ${SAFETY.powerTools.cold}`)
    if (temp > 35) ft.push(`- ${SAFETY.powerTools.heat}`)
    ft.push(`- Hearing: ${SAFETY.powerTools.hearing}`)
    ft.push(`- Dust: ${SAFETY.respiratory.dust}`)
  }

  // Journey notes
  if (journey.notes.length > 0) {
    ft.push('')
    ft.push('**Journey context**')
    journey.notes.forEach(n => ft.push(`- ${n}`))
  }

  // Bottom line
  ft.push('')
  ft.push('**Bottom line**')
  if (isStorm) ft.push('- STOP ALL OUTDOOR WORK. Life safety first')
  else if (wind > 50) ft.push('- DANGEROUS WIND. Secure job site and wait')
  else if (isRaining && precipitation > 10) ft.push('- HEAVY RAIN. Focus on indoor tasks')
  else if (temp < 5 || temp > 38) ft.push('- EXTREME TEMPERATURE. Work inside or wait')
  else if (isGeneral && painting.score >= 70 && concrete.score >= 70) {
    ft.push('- EXCELLENT CONDITIONS. Proceed with outdoor projects')
  } else if (isGeneral) {
    ft.push('- GOOD CONDITIONS. Most work can proceed with precautions')
  } else {
    ft.push('- CHALLENGING CONDITIONS. Review warnings above')
  }

  const wisdom = [
    "Measure twice, cut once. Check weather twice, pour once.",
    "Good materials + wrong weather = bad results.",
    "The most expensive job is the one you have to do twice.",
    "Weather doesn't care about your schedule. Work with it, not against it.",
    "Concrete waits for no one. Be ready before the truck arrives.",
    "A safe job site is a productive job site.",
    "Proper planning prevents poor performance."
  ]
  ft.push('')
  ft.push(`*${random(wisdom)}*`)

  return {
    verdict,
    summary,
    note,
    details,
    fullText: ft.join('\n')
  }
}

// ─── SPECIALIZED EXPORTS ───────────────────────────────────────────────

export {
  analyzePainting as getPaintingConditions,
  analyzeConcrete as getConcreteConditions,
  analyzeWoodworking as getWoodworkingConditions,
  getEquilibriumMoistureContent
}

export default getDIYConstructionAdvice
