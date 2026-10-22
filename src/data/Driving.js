// ============================================================================
// ROAD SAFETY & TRANSPORTATION WEATHER ADVISORY
//
// Returns structured object: { verdict, summary, note, details, fullText }
// Reads preferences + _journey when present. No markdown ### headers.
// ============================================================================

import {
  calcWindChill,
  calcHeatIndex,
  getWindDirection,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getUVLevel,
  getAQICategory,
  getVisibilityCategory,
  getPavementTemp,
  getPressureTrend
} from './calculations'

function readPreference(key, fallback) {
  try {
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

export const sampleQuestions = [
  "Is it safe to drive today?",
  "Should I drive or take public transit?",
  "What's the best time to drive today?",
  "Should I postpone my trip?",
  "Will my commute take longer?",
  "Is it safe to drive at night?",
  "Should I cycle to work?",
  "Is it too windy for cycling?",
  "Good weather for motorbike?",
  "Can I drive my RV in this wind?",
  "Is it safe to tow a trailer?",
  "Will my car battery die in this cold?",
  "Should I check my tire pressure?",
  "Do I need winter tires today?",
  "Will my electric car range drop?",
  "Should I preheat my EV?",
  "Are roads slippery?",
  "Will rain affect my commute?",
  "Is visibility bad for driving?",
  "Will there be black ice?",
  "Should I use snow chains?",
  "Is 4WD enough for today?",
  "Will fog be an issue on my commute?",
  "Should I take the high road instead?",
  "Is the bridge going to ice over?",
  "Is it safe for school buses?",
  "Should I get gas before the storm?",
  "Will my wipers freeze to the windshield?",
  "Should I cover my car tonight?",
  "Is it safe to park under trees?",
  "What should be in my car emergency kit?",
  "Can I drive through standing water?",
  "Is it safe to use cruise control?",
  "Is adaptive cruise reliable in rain?",
  "Will deer be active on roads?",
  "Is it safe for elderly drivers?",
  "Should new drivers stay off the roads?",
  "Is it safe to drive with kids today?"
]

// ─── VEHICLE TYPES ─────────────────────────────────────────────────────

const VEHICLE_TYPES = {
  sedan: {
    label: 'Sedan',
    windSensitivity: 4, floodClearance: 15, iceCapability: 2, snowCapability: 1,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.8, snow: 5, ice: 10 },
    traction: 'front-wheel drive preferred',
    groundClearance: 'low (12-15cm)',
    special: [
      'Low ground clearance — avoid flooded roads with water over 15cm',
      'All-season tires lose grip below 7°C',
      'Winter tires improve stopping distance 30-40% on snow and ice'
    ]
  },
  suv: {
    label: 'SUV',
    windSensitivity: 7, floodClearance: 25, iceCapability: 3, snowCapability: 4,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.7, snow: 4.5, ice: 9 },
    traction: '4WD or AWD available',
    groundClearance: 'medium (20-25cm)',
    special: [
      '4WD helps you go but NOT stop',
      'Higher center of gravity means rollover risk in high wind',
      'AWD provides better acceleration but same braking as 2WD'
    ]
  },
  truck: {
    label: 'Truck',
    windSensitivity: 8, floodClearance: 30, iceCapability: 2, snowCapability: 5,
    stoppingDistanceMultiplier: { dry: 1, wet: 2, snow: 5, ice: 10 },
    traction: 'rear-wheel drive with weight in bed',
    groundClearance: 'high (25-35cm)',
    special: [
      'Empty bed means no traction on rear wheels — add weight',
      'High profile: extreme wind sensitivity',
      'Diesel gels below -15°C — use winter blend'
    ]
  },
  motorcycle: {
    label: 'Motorcycle',
    windSensitivity: 10, floodClearance: 5, iceCapability: 0, snowCapability: 0,
    stoppingDistanceMultiplier: { dry: 1, wet: 2.5 },
    traction: 'two-wheel, minimal contact patch',
    groundClearance: 'low (10-12cm)',
    special: [
      'Rain: 90% less traction. Painted surfaces are ice when wet',
      'Crosswinds push bike across lanes',
      'Wet leaves and gravel are as slippery as ice'
    ]
  },
  bicycle: {
    label: 'Bicycle',
    windSensitivity: 9, floodClearance: 5, iceCapability: 0, snowCapability: 0,
    stoppingDistanceMultiplier: { dry: 1, wet: 3 },
    traction: 'two-wheel, very small contact patch',
    groundClearance: 'low',
    special: [
      'Rain: braking distance triples. Rim brakes useless in wet',
      'Door zone: stay 1 meter from parked cars',
      'Use lights even during day in poor visibility'
    ]
  },
  rv_camper: {
    label: 'RV/Camper',
    windSensitivity: 10, floodClearance: 20, iceCapability: 1, snowCapability: 2,
    stoppingDistanceMultiplier: { dry: 1, wet: 2.5, snow: 6, ice: 12 },
    traction: 'rear-wheel drive, heavy',
    groundClearance: 'medium',
    special: [
      'Crosswinds can tip over at 80km/h',
      'Stopping distance is enormous (5-20 tons)',
      'Passing trucks create air blast — be ready to correct'
    ]
  },
  electric_vehicle: {
    label: 'Electric Vehicle',
    windSensitivity: 4, floodClearance: 15, iceCapability: 3, snowCapability: 3,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.8, snow: 4, ice: 9 },
    traction: 'AWD or RWD available',
    groundClearance: 'low to medium',
    special: [
      'Cold: range drops 20-40% below 0°C',
      'Precondition while plugged in',
      'Regenerative braking reduced in cold'
    ]
  }
}

// ─── ROAD TYPES ────────────────────────────────────────────────────────

const ROAD_TYPES = {
  highway: {
    label: 'Highway',
    hazards: ['Hydroplaning risk above 80km/h in standing water', 'Crosswinds strongest on open stretches', 'Fog banks form near water bodies'],
    tips: ['Increase following distance to 4 seconds minimum in rain', 'Scan 12 seconds ahead', 'Watch wind socks to gauge wind']
  },
  mountain_road: {
    label: 'Mountain Road',
    hazards: ['Black ice in shaded corners', 'Fog on passes', 'Rockslides after rain or freeze-thaw', 'Wildlife at dawn and dusk'],
    tips: ['Use low gear downhill', 'Honk on blind corners', 'Check road conditions before departing']
  },
  coastal_road: {
    label: 'Coastal Road',
    hazards: ['Storm surge', 'Coastal fog', 'Sand on road', 'Erosion'],
    tips: ['Check tide times', 'Wash car after (salt)', 'If waves hit road, turn around']
  },
  rural_road: {
    label: 'Rural Road',
    hazards: ['No lighting at night', 'Wildlife', 'Slow vehicles', 'Flooding in ditches'],
    tips: ['Full fuel tank', 'Carry emergency kit', 'Tell someone your route']
  },
  urban: {
    label: 'Urban',
    hazards: ['Flooding in underpasses', 'Hydroplaning in first 30 min of rain', 'Pedestrians hidden by umbrellas', 'Fallen branches'],
    tips: ['Public transport safer in extreme weather', 'Avoid underground parking in heavy rain', 'Treat out lights as 4-way stop']
  }
}

// ─── CONDITION ANALYZERS ───────────────────────────────────────────────

function getHydroplaningRisk(data, speed = 80, tireTread = 4) {
  const { precipitation = 0, condition } = data
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  if (!isRaining && precipitation < 1) return { riskLevel: 'none', notes: [], warnings: [] }

  const hydroSpeed = Math.round(10.35 * Math.sqrt(32) * (tireTread / 4))
  const notes = [`Estimated hydroplaning speed: ${hydroSpeed} km/h with current tire tread`]
  const warnings = []
  let riskLevel = 'low'

  if (precipitation > 20) { riskLevel = 'extreme'; warnings.push('Standing water on roads — reduce speed to 40-50 km/h maximum') }
  else if (precipitation > 10) { riskLevel = 'high'; warnings.push('Reduce speed 25-30% below posted limit') }
  else if (precipitation > 5) { riskLevel = 'moderate'; notes.push('Watch for water pooling in depressions and wheel ruts') }

  if (tireTread < 3) warnings.push('Worn tires — hydroplaning can begin around 50-60 km/h')

  return { riskLevel, notes, warnings, hydroSpeed }
}

function getBlackIceRisk(data) {
  const { temp, tempMin = temp - 3, condition, humidity, timeOfDay } = data
  const isRaining = ['rain', 'drizzle'].includes(condition)
  const isSnow = condition === 'snow'
  const isClear = condition === 'clear' || condition === 'partly-cloudy'
  const isHumid = humidity > 70

  const notes = []
  const warnings = []
  let riskLevel = 'none'

  if (temp <= 0 && (isRaining || isSnow || isHumid || isClear)) {
    riskLevel = 'high'
    warnings.push('High black ice risk — ice is invisible until you are sliding')
    notes.push(`Most dangerous locations: bridges, overpasses, shaded areas, tunnel entrances`)
    if (isClear) notes.push('Clear sky overnight means rapid cooling and ice formation')
    if (timeOfDay === 'morning') notes.push('Morning hours are most dangerous before ice melts')
  } else if (temp <= 3 && (isRaining || isHumid) && tempMin <= 0) {
    riskLevel = 'moderate'
    warnings.push('Near-freezing — watch for icy patches')
    notes.push('Watch bridges and overpasses especially')
  } else if (temp <= 0 && !isRaining) {
    riskLevel = 'low'
    notes.push('Cold but dry — low black ice risk. Still watch for wet patches.')
  }

  return { riskLevel, notes, warnings }
}

function getFogProtocol(data) {
  const { visibility = 10, temp, condition } = data
  const notes = []
  const warnings = []
  let riskLevel = 'none'

  if (condition === 'fog' || visibility < 2) {
    if (visibility < 0.2) {
      riskLevel = 'extreme'
      warnings.push('Visibility under 200m — do not drive. Pile-up risk.')
    } else if (visibility < 0.5) {
      riskLevel = 'high'
      warnings.push('Visibility under 500m — extreme caution')
      notes.push('Speed 25-40 km/h max. Low beams only, no high beams')
      notes.push('No cruise control. Open windows slightly to hear traffic')
    } else if (visibility < 1) {
      riskLevel = 'moderate'
      notes.push('Reduce speed to 50 km/h or less')
    } else {
      riskLevel = 'low'
      notes.push('Light fog — reduce speed and use low beams')
    }
    if (temp < 0 && visibility < 1) warnings.push('Freezing fog — ice fog creates black ice')
  }

  return { riskLevel, notes, warnings }
}

function getWinterDrivingAdvice(data) {
  const { temp, precipitation = 0, condition, wind = 0 } = data
  const isSnow = condition === 'snow' || condition === 'sleet'
  const isFreezingRain = condition === 'freezing_rain'
  const notes = []
  const warnings = []
  let riskLevel = 'none'

  if (!isSnow && !isFreezingRain && temp > 0) return { riskLevel: 'none', notes: [], warnings: [] }

  if (isFreezingRain) {
    riskLevel = 'extreme'
    warnings.push('Freezing rain — roads are coated in ice. Stopping is impossible. Stay home.')
    return { riskLevel, notes, warnings }
  }

  if (isSnow && precipitation > 20) {
    riskLevel = 'extreme'
    warnings.push('Heavy snow — impassable roads likely. Do not drive.')
    notes.push('Carry chains, shovel, kitty litter, blankets')
  } else if (isSnow && precipitation > 10) {
    riskLevel = 'high'
    warnings.push('Moderate snow — hazardous conditions')
    notes.push('Speed: 50% of posted limit or less')
    notes.push('Following distance: 8-10 seconds minimum')
    notes.push('Brake gently and early. Test brakes occasionally.')
  } else if (isSnow && precipitation > 2) {
    riskLevel = 'moderate'
    notes.push('Light snow — roads may become slippery')
    notes.push('First snow of season is most dangerous')
  }

  notes.push('Accelerate and decelerate slowly')
  notes.push('Uphill: momentum BEFORE the hill')
  notes.push('Downhill: low gear, engine braking')

  if (wind > 25 && temp < 5) {
    notes.push(`Wind chill makes it feel like ${Math.round(calcWindChill(temp, wind))}°C — blowing snow reduces visibility`)
  }

  return { riskLevel, notes, warnings }
}

function getSunGlareWarning(data) {
  const { sunPosition, timeOfDay, condition } = data
  const isClear = condition === 'clear' || condition === 'partly-cloudy'
  if (!isClear) return { riskLevel: 'none', notes: [], warnings: [] }

  const isGlare = sunPosition === 'sunrise' || sunPosition === 'sunset' ||
    (timeOfDay === 'morning' && sunPosition === 'rising') ||
    (timeOfDay === 'evening' && sunPosition === 'setting')

  if (isGlare) {
    const time = sunPosition === 'sunrise' || sunPosition === 'rising' ? 'sunrise' : 'sunset'
    return {
      riskLevel: 'moderate',
      notes: [
        `${time === 'sunrise' ? 'Sunrise' : 'Sunset'} glare — sun directly at eye level`,
        'Polarized sunglasses significantly reduce glare',
        'Increase following distance — you cannot see brake lights in glare'
      ],
      warnings: [`Sun glare can drop visibility to zero for seconds at a time`]
    }
  }

  return { riskLevel: 'none', notes: [], warnings: [] }
}

function getEmergencyKit(data, vehicleType = 'sedan', temp = 20) {
  const kit = [
    'First aid kit',
    'Flashlight with extra batteries',
    'Phone charger and power bank',
    'Jumper cables or portable jump starter',
    'Spare tire in good condition',
    'Jack and lug wrench',
    'Tire pressure gauge',
    'Reflective triangles or flares',
    'Duct tape and zip ties',
    'Paper maps (phone may die)',
    'Fire extinguisher (ABC rated)'
  ]

  if (temp < 5) {
    kit.push('Warm blankets or sleeping bag')
    kit.push('Extra warm clothes: hat, gloves, socks, coat')
    kit.push('Ice scraper and snow brush')
    kit.push('Small shovel')
    kit.push('Bag of sand, kitty litter, or traction mats')
    kit.push('Non-perishable food and water')
    kit.push('Bright cloth or flag for visibility')
  }

  if (temp > 30) {
    kit.push('Extra water: 4 litres per person minimum')
    kit.push('Sunscreen SPF 30+')
    kit.push('Wide-brim hat')
    kit.push('Electrolyte packets')
  }

  if (vehicleType === 'electric_vehicle') {
    kit.push('Level 2 charging cable')
    kit.push('List of charging stations along route')
    kit.push('12V jump starter')
  }

  return kit
}

function getEVAdvice(data) {
  const { temp, condition, wind = 0 } = data
  const notes = []
  const warnings = []
  let rangeLoss = 0

  if (temp < 0) {
    rangeLoss = temp < -10 ? 40 : temp < -5 ? 35 : 30
    warnings.push(`Cold weather — estimated range loss ${rangeLoss}%`)
    notes.push('Use seat heaters instead of cabin heat when possible')
    notes.push('Precondition battery while plugged in')
    notes.push('Charging is slower in cold — plan longer stops')
  }

  if (temp > 35) {
    rangeLoss = 15
    warnings.push(`Hot weather — estimated range loss ${rangeLoss}% (AC load)`)
    notes.push('Use recirculation mode. Park in shade.')
  }

  if (wind > 30) {
    notes.push(`Headwind reduces range significantly. Tailwind helps.`)
  }

  return { rangeLoss, notes, warnings }
}

function getFollowingDistance(data, speed = 80) {
  const { condition, temp, precipitation = 0 } = data
  const isRaining = ['rain', 'drizzle'].includes(condition)
  const isSnow = condition === 'snow'
  const isIcy = temp <= 0 && (isRaining || isSnow || precipitation > 0)

  let multiplier = 1
  let reason = 'Dry conditions — normal following distance'

  if (isIcy) { multiplier = 10; reason = 'Icy roads — stopping distance × 10' }
  else if (isSnow) { multiplier = 5; reason = 'Snow — stopping distance × 5' }
  else if (isRaining && precipitation > 10) { multiplier = 3; reason = 'Heavy rain — stopping distance × 3' }
  else if (isRaining) { multiplier = 2; reason = 'Wet roads — stopping distance doubled' }

  const normalDistance = speed * 0.28
  const safeDistance = Math.round(normalDistance * multiplier)
  const seconds = Math.round(safeDistance / (speed * 0.28))

  return { multiplier, reason, seconds, safeDistance }
}

// ─── MAIN FUNCTION ─────────────────────────────────────────────────────

export const getDrivingAdvice = (data, question = '') => {
  if (!data) {
    return { verdict: "I don't have weather data right now.", summary: 'Try again in a moment.', note: '', details: [], fullText: '' }
  }

  let {
    temp, humidity = 50, wind = 0, windDir = 0, windGust = 0,
    condition, visibility = 10, uvIndex = 0, aqi = 0, city,
    tempMin = temp - 3, tempMax = temp + 3, precipitation = 0,
    pressure, sunrise, sunset
  } = data

  if (data._hourIndex !== undefined && data.hourly) {
    const i = data._hourIndex, h = data.hourly
    if (h.temperature_2m?.[i] != null) temp = Math.round(h.temperature_2m[i])
    if (h.relative_humidity_2m?.[i] != null) humidity = h.relative_humidity_2m[i]
    if (h.wind_speed_10m?.[i] != null) wind = h.wind_speed_10m[i]
    if (h.wind_gusts_10m?.[i] != null) windGust = h.wind_gusts_10m[i]
    if (h.precipitation?.[i] != null) precipitation = h.precipitation[i]
    if (h.visibility?.[i] != null) visibility = h.visibility[i] / 1000
    if (h.uv_index?.[i] != null) uvIndex = h.uv_index[i]
  }

  const q = question.toLowerCase()
  const windChill = calcWindChill(temp, wind)
  const heatIndex = calcHeatIndex(temp, humidity)
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp
  const windDirection = getWindDirection(windDir)
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  const isSnow = condition === 'snow'
  const isFog = condition === 'fog' || visibility < 1
  const timeOfDay = getTimeOfDay()
  const sunPosition = getSunPosition(data)
  const season = getSeason()
  const pavementTemp = getPavementTemp(temp, condition)
  const pressureTrend = pressure ? getPressureTrend(pressure) : 'steady'

  // Vehicle detection
  let vehicleType = 'sedan'
  if (/\b(suv|4wd|jeep|4x4)\b/.test(q)) vehicleType = 'suv'
  else if (/\b(truck|pickup|pick-up)\b/.test(q)) vehicleType = 'truck'
  else if (/\b(motorcycle|motorbike|scooter)\b/.test(q)) vehicleType = 'motorcycle'
  else if (/\b(bicycle|cycl|bike)\b/.test(q) && !/motorbike/.test(q)) vehicleType = 'bicycle'
  else if (/\b(rv|camper|motorhome|caravan)\b/.test(q)) vehicleType = 'rv_camper'
  else if (/\b(electric|ev|tesla|hybrid)\b/.test(q)) vehicleType = 'electric_vehicle'

  // Road detection
  let roadType = 'urban'
  if (/\b(highway|freeway|motorway|interstate)\b/.test(q)) roadType = 'highway'
  else if (/\b(mountain|pass|switchback)\b/.test(q)) roadType = 'mountain_road'
  else if (/\b(coast|beach|ocean|bay)\b/.test(q)) roadType = 'coastal_road'
  else if (/\b(rural|country|back road|farm)\b/.test(q)) roadType = 'rural_road'

  const vehicleConfig = VEHICLE_TYPES[vehicleType]
  const roadConfig = ROAD_TYPES[roadType]
  const hydroplaning = getHydroplaningRisk(data, 80, 4)
  const blackIce = getBlackIceRisk(data)
  const fog = getFogProtocol(data)
  const winter = getWinterDrivingAdvice(data)
  const glare = getSunGlareWarning(data)
  const ev = vehicleType === 'electric_vehicle' ? getEVAdvice(data) : null
  const followingDist = getFollowingDistance(data, 80)
  const journey = data._journey || null

  // ─── Verdict ─────────────────────────────────────────────────────
  const isExtreme = condition === 'thunderstorm' || wind > 60 || visibility < 0.2 ||
    (isSnow && precipitation > 15) || condition === 'freezing_rain'
  const isHazardous = isSnow || visibility < 1 || wind > 40 || (isRaining && precipitation > 15)

  let verdict
  if (isExtreme) verdict = 'Do not drive — conditions are life-threatening'
  else if (isHazardous) verdict = 'Only essential travel — hazardous conditions'
  else if (isRaining || isFog || wind > 25) verdict = 'Caution required — adjust driving for conditions'
  else verdict = 'Safe driving conditions — normal precautions apply'

  // ─── Summary ─────────────────────────────────────────────────────
  const summaryParts = []
  summaryParts.push(`${temp}°C · ${condition || 'mixed'}`)
  if (wind > 20) summaryParts.push(`wind ${Math.round(wind)} km/h`)
  if (visibility < 5) summaryParts.push(`visibility ${visibility.toFixed(1)} km`)
  if (isRaining) summaryParts.push(`rain ${precipitation.toFixed(1)}mm`)

  // ─── Note ────────────────────────────────────────────────────────
  const noteParts = []
  if (blackIce.warnings[0]) noteParts.push(blackIce.warnings[0])
  if (fog.warnings[0]) noteParts.push(fog.warnings[0])
  if (winter.warnings[0]) noteParts.push(winter.warnings[0])
  if (hydroplaning.warnings[0]) noteParts.push(hydroplaning.warnings[0])
  const note = noteParts.join(' · ')

  // ─── Details ─────────────────────────────────────────────────────
  const details = []
  const push = (label, value) => { if (value) details.push({ label, value }) }

  push('Vehicle', vehicleConfig.label)
  push('Road type', roadConfig.label)
  push('Feels like', `${Math.round(effectiveTemp)}°C`)
  push('Pavement', `${pavementTemp}°C`)
  push('Wind', `${Math.round(wind)} km/h ${windDirection}${windGust > wind + 5 ? ` (gusts ${Math.round(windGust)})` : ''}`)
  push('Visibility', `${visibility.toFixed(1)} km`)
  push('Pressure', pressure ? `${Math.round(pressure)} hPa (${pressureTrend})` : null)
  push('Following distance', `${followingDist.seconds}s (${followingDist.safeDistance}m at 80km/h)`)
  if (blackIce.riskLevel !== 'none') push('Black ice', blackIce.riskLevel)
  if (hydroplaning.riskLevel !== 'none') push('Hydroplaning', hydroplaning.riskLevel)
  if (fog.riskLevel !== 'none') push('Fog', fog.riskLevel)
  if (winter.riskLevel !== 'none') push('Winter', winter.riskLevel)
  if (ev) push('EV range loss', `${ev.rangeLoss}%`)
  if (journey?.narrative) push('Route', journey.narrative)

  // ─── Full text (plain, demarcated) ───────────────────────────────
  const ft = []
  ft.push(`DRIVING ADVISORY — ${vehicleConfig.label} on ${roadConfig.label}`)
  ft.push('')
  ft.push(`Verdict: ${verdict}`)
  ft.push(summaryParts.join(' · '))
  if (note) { ft.push(''); ft.push(`Note: ${note}`) }

  ft.push('')
  ft.push('CONDITIONS')
  ft.push(`  Temp: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)`)
  ft.push(`  Pavement: ${pavementTemp}°C`)
  ft.push(`  Wind: ${Math.round(wind)} km/h ${windDirection}`)
  ft.push(`  Visibility: ${visibility.toFixed(1)} km (${getVisibilityCategory(visibility)})`)
  if (precipitation > 0) ft.push(`  Precipitation: ${precipitation.toFixed(1)} mm`)
  ft.push(`  Humidity: ${humidity}%`)
  if (pressure) ft.push(`  Pressure: ${Math.round(pressure)} hPa (${pressureTrend})`)
  if (aqi > 50) ft.push(`  Air Quality: ${aqi} (${getAQICategory(aqi)})`)

  if (vehicleConfig.special?.length) {
    ft.push('')
    ft.push(`${vehicleConfig.label.toUpperCase()} NOTES`)
    vehicleConfig.special.forEach(s => ft.push(`  • ${s}`))
  }

  if (roadConfig.hazards?.length) {
    ft.push('')
    ft.push(`${roadConfig.label.toUpperCase()} HAZARDS`)
    roadConfig.hazards.forEach(h => ft.push(`  • ${h}`))
  }

  const appendRisk = (title, block) => {
    if (block.riskLevel === 'none') return
    ft.push('')
    ft.push(`${title} (${block.riskLevel.toUpperCase()})`)
    block.notes.forEach(n => ft.push(`  • ${n}`))
    block.warnings.forEach(w => ft.push(`  ⚠ ${w}`))
  }

  appendRisk('Black Ice', blackIce)
  appendRisk('Hydroplaning', hydroplaning)
  appendRisk('Fog', fog)
  appendRisk('Winter Driving', winter)
  appendRisk('Sun Glare', glare)

  if (ev) {
    ft.push('')
    ft.push(`ELECTRIC VEHICLE`)
    ft.push(`  Estimated range loss: ${ev.rangeLoss}%`)
    ev.notes.forEach(n => ft.push(`  • ${n}`))
    ev.warnings.forEach(w => ft.push(`  ⚠ ${w}`))
  }

  ft.push('')
  ft.push('FOLLOWING DISTANCE')
  ft.push(`  ${followingDist.reason}`)
  ft.push(`  Follow at ${followingDist.seconds} seconds minimum (${followingDist.safeDistance}m at 80km/h)`)

  if (journey?.narrative) {
    ft.push('')
    ft.push('ROUTE CONTEXT')
    ft.push(`  ${journey.narrative}`)
  }

  if (q.includes('kit') || q.includes('emergency') || q.includes('prepare') || isSnow || isExtreme) {
    ft.push('')
    ft.push('EMERGENCY KIT')
    getEmergencyKit(data, vehicleType, temp).forEach(item => ft.push(`  • ${item}`))
  }

  ft.push('')
  ft.push('BOTTOM LINE')
  if (isExtreme) {
    ft.push('  Stay home. Conditions are dangerous for all vehicles.')
    ft.push('  No destination is worth your life or the lives of others.')
  } else if (isHazardous) {
    ft.push('  Only drive if absolutely necessary.')
    ft.push('  Allow 2-3 times normal travel time. Check road closures first.')
  } else if (isRaining || isFog) {
    ft.push('  Drive with caution. Allow extra time.')
    ft.push('  Check for delays and alternative routes before departing.')
  } else {
    ft.push('  Safe conditions. Normal driving rules apply.')
    ft.push('  Always drive according to conditions, not just posted limits.')
  }

  const wisdom = [
    'Better late than never. Speed kills.',
    'The road is not a racetrack. Arrive alive.',
    'Good drivers adjust to conditions. Great drivers anticipate them.',
    'Leave earlier, drive slower, live longer.',
    'Your car can be replaced. You cannot.',
    'Every 10 km/h over the limit doubles your stopping distance.'
  ]
  ft.push('')
  ft.push(`Tip: ${random(wisdom)}`)

  return {
    verdict,
    summary: summaryParts.join(' · '),
    note,
    details,
    fullText: ft.join('\n')
  }
}

export {
  getHydroplaningRisk,
  getBlackIceRisk,
  getFogProtocol,
  getWinterDrivingAdvice,
  getSunGlareWarning,
  getEmergencyKit,
  getEVAdvice,
  getFollowingDistance
}

export default getDrivingAdvice
