// ============================================================================
// COMPREHENSIVE FARMING & AGRICULTURE WEATHER SYSTEM
// ============================================================================

import { 
  calcGrowingDegreeDays,
  calcEvapotranspiration,
  calcDewPoint,
  getComfortScore,
  random,
  getCloudCover,
  mapWeatherCode,
  getSeason,
  getMoonPhase,
  getMoonIllumination,
  getMoonRiseSet,
  getPollenIndex,
  getUVLevel
} from './calculations';

// ============================================================================
// SAMPLE QUESTIONS
// ============================================================================

export const sampleQuestions = [
  "Should I water my crops today?",
  "Is it good weather for planting?",
  "Will there be frost tonight?",
  "Do I need to irrigate?",
  "Is it safe to spray pesticides?",
  "Will rain damage my crops?",
  "Is it good harvesting weather?",
  "Should I cover my plants?",
  "Will humidity cause crop disease?",
  "When should I fertilize my crops?",
  "Is it safe to use a tractor in the field?",
  "Will my hay dry before rain?",
  "Is it time to harvest corn?",
  "Should I plant cover crops now?",
  "Will soil temperature affect germination?",
  "Is there a risk of hail damage?",
  "When is the best time to apply herbicides?",
  "Will my orchard be affected by frost?",
  "Should I irrigate my rice paddies?",
  "Is the soil too wet for planting?",
  "Will my tomatoes survive this heat?",
  "When should I start my greenhouse crops?",
  "Is the humidity too high for my grapes?",
  "Should I use a fungicide today?",
  "Will my lettuce bolt in this weather?",
  "Is it safe to transplant seedlings?",
  "When should I harvest my potatoes?",
  "Will my corn pollinate successfully?",
  "Should I adjust my irrigation schedule?",
  "Is there a risk of drought this week?"
];

// ============================================================================
// CROP DATABASE
// ============================================================================

const CROP_DATABASE = {
  corn: {
    name: 'Corn / Maize',
    tempMin: 10,
    tempMax: 35,
    idealTemp: 25,
    gddBase: 10,
    waterNeed: 'High',
    frostTolerance: 'None',
    notes: 'Pollination fails above 32°C. Needs 50-80mm rain/month.'
  },
  tomatoes: {
    name: 'Tomatoes',
    tempMin: 15,
    tempMax: 32,
    idealTemp: 22,
    gddBase: 12,
    waterNeed: 'Medium-High',
    frostTolerance: 'None',
    notes: 'Blossom drop above 30°C. Needs consistent moisture.'
  },
  rice: {
    name: 'Rice (Paddy)',
    tempMin: 15,
    tempMax: 38,
    idealTemp: 28,
    gddBase: 12,
    waterNeed: 'Very High',
    frostTolerance: 'None',
    notes: 'Requires 100-200mm of standing water. Heavy rain beneficial.'
  },
  cassava: {
    name: 'Cassava',
    tempMin: 18,
    tempMax: 35,
    idealTemp: 27,
    gddBase: 12,
    waterNeed: 'Low-Medium',
    frostTolerance: 'None',
    notes: 'Drought tolerant. Needs 6-8 months of warm weather.'
  },
  yam: {
    name: 'Yam',
    tempMin: 20,
    tempMax: 35,
    idealTemp: 28,
    gddBase: 15,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    notes: 'Requires 7-8 months of warm weather. Needs well-drained soil.'
  },
  cowpea: {
    name: 'Cowpea / Black-eyed Pea',
    tempMin: 15,
    tempMax: 35,
    idealTemp: 27,
    gddBase: 10,
    waterNeed: 'Low',
    frostTolerance: 'None',
    notes: 'Drought tolerant. Good nitrogen fixer.'
  },
  groundnut: {
    name: 'Groundnut / Peanut',
    tempMin: 15,
    tempMax: 35,
    idealTemp: 28,
    gddBase: 10,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    notes: 'Needs 4-5 months of warm weather. Sandy soil preferred.'
  },
  sorghum: {
    name: 'Sorghum / Guinea Corn',
    tempMin: 15,
    tempMax: 38,
    idealTemp: 28,
    gddBase: 10,
    waterNeed: 'Low-Medium',
    frostTolerance: 'None',
    notes: 'Very drought tolerant. Grows well in arid conditions.'
  },
  millet: {
    name: 'Millet',
    tempMin: 15,
    tempMax: 40,
    idealTemp: 30,
    gddBase: 10,
    waterNeed: 'Low',
    frostTolerance: 'None',
    notes: 'Extremely drought tolerant. Grows in poor soils.'
  },
  sugarcane: {
    name: 'Sugarcane',
    tempMin: 20,
    tempMax: 38,
    idealTemp: 30,
    gddBase: 15,
    waterNeed: 'High',
    frostTolerance: 'None',
    notes: 'Requires 10-12 months of warm weather. Heavy water needs.'
  },
  cocoa: {
    name: 'Cocoa',
    tempMin: 21,
    tempMax: 32,
    idealTemp: 27,
    gddBase: 15,
    waterNeed: 'Medium-High',
    frostTolerance: 'None',
    notes: 'Requires consistent rainfall. Needs shade in early years.'
  },
  oilpalm: {
    name: 'Oil Palm',
    tempMin: 22,
    tempMax: 35,
    idealTemp: 29,
    gddBase: 15,
    waterNeed: 'High',
    frostTolerance: 'None',
    notes: 'Requires 1500-2000mm rainfall/year. Needs 3-4 years to mature.'
  },
  maize: {
    name: 'Maize (Corn)',
    tempMin: 10,
    tempMax: 35,
    idealTemp: 25,
    gddBase: 10,
    waterNeed: 'High',
    frostTolerance: 'None',
    notes: 'Critical water need during pollination. Needs 50-80mm rain/month.'
  },
  cassava: {
    name: 'Cassava',
    tempMin: 18,
    tempMax: 35,
    idealTemp: 27,
    gddBase: 12,
    waterNeed: 'Low-Medium',
    frostTolerance: 'None',
    notes: 'Drought tolerant. Needs 6-8 months of warm weather.'
  },
  okra: {
    name: 'Okra',
    tempMin: 18,
    tempMax: 38,
    idealTemp: 28,
    gddBase: 12,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    notes: 'Needs warm weather. Harvest every 2-3 days.'
  },
  spinach: {
    name: 'Spinach',
    tempMin: 5,
    tempMax: 25,
    idealTemp: 18,
    gddBase: 5,
    waterNeed: 'Medium',
    frostTolerance: 'Moderate',
    notes: 'Bolts in hot weather. Prefers cool conditions.'
  },
  lettuce: {
    name: 'Lettuce',
    tempMin: 5,
    tempMax: 25,
    idealTemp: 18,
    gddBase: 5,
    waterNeed: 'Medium',
    frostTolerance: 'Moderate',
    notes: 'Bolts in heat. Needs consistent moisture.'
  },
  beans: {
    name: 'Beans (Common)',
    tempMin: 15,
    tempMax: 30,
    idealTemp: 22,
    gddBase: 10,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    notes: 'Needs 2-3 months of warm weather. Nitrogen fixer.'
  }
};

// ============================================================================
// PEST & DISEASE DATABASE
// ============================================================================

const PEST_DISEASE_DATABASE = {
  'leaf_spot': {
    name: 'Leaf Spot',
    conditions: { humidity: 80, tempMin: 20, tempMax: 30 },
    crops: ['tomatoes', 'peppers', 'beans', 'cassava'],
    severity: 'Medium',
    notes: 'Fungal disease. Remove infected leaves. Use fungicide.'
  },
  'downy_mildew': {
    name: 'Downy Mildew',
    conditions: { humidity: 85, tempMin: 15, tempMax: 25 },
    crops: ['grapes', 'lettuce', 'spinach', 'onions'],
    severity: 'High',
    notes: 'Fungal disease. Avoid overhead irrigation. Use fungicide.'
  },
  'powdery_mildew': {
    name: 'Powdery Mildew',
    conditions: { humidity: 60, tempMin: 18, tempMax: 28 },
    crops: ['tomatoes', 'peppers', 'cucumbers', 'wheat', 'grapes'],
    severity: 'Medium',
    notes: 'Fungal disease. Increases in dry, warm conditions. Sulfur spray.'
  },
  'rust': {
    name: 'Rust',
    conditions: { humidity: 70, tempMin: 18, tempMax: 28 },
    crops: ['wheat', 'barley', 'oats', 'corn'],
    severity: 'High',
    notes: 'Fungal disease. Spreads rapidly in humid conditions. Fungicide needed.'
  },
  'blight': {
    name: 'Late Blight',
    conditions: { humidity: 90, tempMin: 15, tempMax: 22 },
    crops: ['tomatoes', 'potatoes', 'peppers'],
    severity: 'High',
    notes: 'Devastating fungal disease. Destroy infected plants. Preventative fungicide.'
  },
  'stem_rot': {
    name: 'Stem Rot',
    conditions: { humidity: 85, tempMin: 22, tempMax: 30 },
    crops: ['peanuts', 'soybeans', 'sunflowers'],
    severity: 'High',
    notes: 'Fungal disease. Overwatering increases risk. Good drainage needed.'
  },
  'aphids': {
    name: 'Aphids',
    conditions: { tempMin: 18, tempMax: 28 },
    crops: ['tomatoes', 'peppers', 'cucumbers', 'cabbage', 'okra'],
    severity: 'Medium',
    notes: 'Sap-sucking insects. Use neem oil or insecticidal soap.'
  },
  'spider_mites': {
    name: 'Spider Mites',
    conditions: { tempMin: 25, humidity: 30 },
    crops: ['tomatoes', 'cucumbers', 'beans', 'corn'],
    severity: 'High',
    notes: 'Thrives in hot, dry conditions. Spray with water or miticide.'
  },
  'fall_armyworm': {
    name: 'Fall Armyworm',
    conditions: { tempMin: 20, tempMax: 30 },
    crops: ['corn', 'sorghum', 'millet', 'rice'],
    severity: 'Very High',
    notes: 'Major pest in Africa. Monitor fields daily. Use bio-pesticides.'
  },
  'locust': {
    name: 'Locust',
    conditions: { tempMin: 25, humidity: 50 },
    crops: ['ALL'],
    severity: 'Very High',
    notes: 'Swarm risk. Report to agricultural authorities immediately.'
  }
};

// ============================================================================
// SOIL CONDITION CALCULATOR
// ============================================================================

function getSoilCondition(data) {
  const { temp, humidity, wind, condition, precipitation } = data;
  
  let soil = []
  
  // Soil temperature
  const soilTemp = temp + (condition === 'clear' ? 5 : 0) - (condition === 'rain' ? 2 : 0)
  soil.push(`Soil temperature: ${Math.round(soilTemp)}°C`)
  
  if (soilTemp < 5) {
    soil.push('❄️ Soil frozen. No activity. Wait for thaw.')
  } else if (soilTemp < 10) {
    soil.push('🌱 Cold soil. Cool season crops only. Warm crops dormant.')
  } else if (soilTemp < 15) {
    soil.push('🌱 Cool soil. Germination of warm crops slow.')
  } else if (soilTemp < 20) {
    soil.push('🌱 Good soil temperature. Most crops germinate.')
  } else if (soilTemp < 25) {
    soil.push('🌱 Ideal soil temperature. Optimal germination.')
  } else if (soilTemp < 30) {
    soil.push('🌱 Warm soil. Good for heat-loving crops.')
  } else {
    soil.push('🔥 Hot soil. Stress on roots. Need irrigation.')
  }
  
  // Soil moisture estimation
  const rainAmount = precipitation || 0
  let moisture = 'Moderate'
  if (rainAmount > 20) moisture = 'Wet - waterlogged risk'
  else if (rainAmount > 10) moisture = 'Moist - good for planting'
  else if (rainAmount > 5) moisture = 'Slightly moist'
  else if (rainAmount > 0) moisture = 'Dry - irrigation needed'
  else {
    // Estimate based on ET and wind
    const et = calcEvapotranspiration(temp, humidity, wind)
    if (et > 6) moisture = 'Dry - high evaporation'
    else if (et > 4) moisture = 'Moderately dry'
    else if (et > 2) moisture = 'Slightly dry'
    else moisture = 'Moist - good conditions'
  }
  
  soil.push(`Soil moisture: ${moisture}`)
  
  // Workability
  if (condition === 'rain' || condition === 'thunderstorm' || moisture.includes('Wet')) {
    soil.push('🚜 Soil too wet for heavy equipment. Risk of compaction.')
  } else if (moisture === 'Moderately dry' || moisture === 'Slightly dry') {
    soil.push('🚜 Ideal for fieldwork. Tilling, planting, spraying.')
  } else if (moisture === 'Dry') {
    soil.push('🚜 Dusty conditions. Irrigate before planting if possible.')
  }
  
  return soil
}

// ============================================================================
// FERTILIZER TIMING CALCULATOR
// ============================================================================

function getFertilizerAdvice(data) {
  const { temp, humidity, wind, condition } = data;
  const advice = [];
  
  // Check for ideal conditions for fertilizer application
  if (wind > 20) {
    advice.push('❌ Wind too high for fertilizer application. Drift risk.')
    advice.push('   Wait for wind <15km/h for liquid fertilizer.')
  }
  
  if (condition === 'rain' || condition === 'thunderstorm') {
    advice.push('❌ Rain forecast. Nitrogen fertilizer will leach.')
    advice.push('   Apply after rain stops. Urea needs soil incorporation.')
  }
  
  if (temp > 32) {
    advice.push('⚠️ High temperature. Nitrate fertilizer can volatilize.')
    advice.push('   Apply early morning or evening. Incorporate into soil.')
  }
  
  if (humidity > 80 && wind < 10) {
    advice.push('✅ Good conditions for foliar fertilizer.')
    advice.push('   High humidity = slow drying = better absorption.')
  }
  
  if (wind < 10 && humidity > 50 && !condition.includes('rain')) {
    advice.push('✅ Ideal conditions for fertilizer application.')
    advice.push('   Apply early morning for best results.')
  }
  
  if (!advice.length) {
    advice.push('🌿 Moderate conditions for fertilizer.')
    advice.push('   Apply according to crop needs. Split applications recommended.')
  }
  
  return advice
}

// ============================================================================
// POST-HARVEST WEATHER ADVICE
// ============================================================================

function getPostHarvestAdvice(data) {
  const { temp, humidity, wind, condition } = data;
  const advice = [];
  
  if (condition === 'rain' || condition === 'thunderstorm') {
    advice.push('❌ Rain forecast. DO NOT leave harvested crops in field.')
    advice.push('   Store immediately to prevent rot.')
  }
  
  if (humidity > 80) {
    advice.push('⚠️ High humidity. Harvested grain needs drying.')
    advice.push('   Dry to 12% moisture to prevent mold.')
  }
  
  if (wind > 20) {
    advice.push('💨 Windy. Good for natural drying of hay.')
    advice.push('   Spread thinly and turn regularly.')
  }
  
  if (temp > 30 && humidity < 50) {
    advice.push('☀️ Hot and dry. Ideal for drying grains and hay.')
    advice.push('   Harvest at 18-20% moisture for optimal drying.')
  }
  
  if (temp < 10) {
    advice.push('❄️ Cold. Store harvested crops in insulated facility.')
    advice.push('   Avoid frost damage to stored produce.')
  }
  
  if (!advice.length) {
    advice.push('✅ Good conditions for post-harvest handling.')
    advice.push('   Process and store crops appropriately.')
  }
  
  return advice
}

// ============================================================================
// LIVESTOCK & POULTRY ADVICE
// ============================================================================

function getLivestockAdvice(data) {
  const { temp, humidity, wind, condition } = data;
  const advice = [];
  
  if (temp > 35) {
    advice.push('🔥 Extreme heat! Livestock at risk of heat stress.')
    advice.push('   Provide shade, ventilation, and plenty of water.')
    advice.push('   Spray livestock with water to cool them down.')
  }
  
  if (temp > 30) {
    advice.push('☀️ Hot day. Ensure livestock have shade and water.')
    advice.push('   Move animals to cooler areas if possible.')
  }
  
  if (temp < 5) {
    advice.push('❄️ Cold. Livestock need shelter and extra feed.')
    advice.push('   Provide bedding and windbreaks.')
  }
  
  if (humidity > 80 && temp > 25) {
    advice.push('🌡️ High heat + humidity = dangerous for poultry.')
    advice.push('   Increase ventilation, reduce stocking density.')
  }
  
  if (condition === 'thunderstorm') {
    advice.push('⛈️ Thunderstorm risk. Move animals to shelter.')
    advice.push('   Check fences for damage after storm.')
  }
  
  if (wind > 30) {
    advice.push('💨 Strong winds. Provide windbreaks for livestock.')
    advice.push('   Secure loose objects that could cause injury.')
  }
  
  if (!advice.length) {
    advice.push('✅ Livestock conditions are acceptable.')
    advice.push('   Continue regular feeding and health checks.')
  }
  
  return advice
}

// ============================================================================
// IRRIGATION SCHEDULING
// ============================================================================

function getIrrigationSchedule(data) {
  const { temp, humidity, wind, condition, precipitation } = data;
  const schedule = [];
  const et = calcEvapotranspiration(temp, humidity, wind)
  const rainAmount = precipitation || 0
  
  // Calculate water deficit
  const waterNeeded = Math.max(0, et - rainAmount)
  
  if (waterNeeded <= 1) {
    schedule.push('💧 No irrigation needed. Natural rainfall sufficient.')
  } else if (waterNeeded <= 3) {
    schedule.push('💧 Light irrigation needed. Apply 10-15mm.')
    schedule.push('   Best time: early morning (5-7 AM)')
  } else if (waterNeeded <= 6) {
    schedule.push('💧 Moderate irrigation needed. Apply 20-30mm.')
    schedule.push('   Best time: early morning (5-7 AM) or evening (6-8 PM)')
  } else {
    schedule.push('💧 Heavy irrigation needed. Apply 30-40mm.')
    schedule.push('   Split into 2 applications: morning and evening')
  }
  
  // Special irrigation tips
  if (wind > 20) {
    schedule.push('⚠️ Windy conditions. Avoid sprinkler irrigation.')
    schedule.push('   Use drip irrigation to prevent water loss.')
  }
  
  if (temp > 32) {
    schedule.push('☀️ High temperature. Increase irrigation by 20%.')
    schedule.push('   Plants lose more water in hot conditions.')
  }
  
  if (condition === 'clear' && temp > 25) {
    schedule.push('☀️ Sunny and warm. Plants need 20-30% more water.')
  }
  
  return schedule
}

// ============================================================================
// MAIN FARMING ADVICE FUNCTION
// ============================================================================

export const getFarmingAdvice = async (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, tempMax, tempMin, humidity, wind, condition, 
    conditionCode, uvIndex, visibility, city, lat, lon,
    precipitation, precipitationProbability, sunrise, sunset
  } = data;
  
  // Get seasonal and moon data
  const season = getSeason()
  const moonPhase = await getMoonPhase(lat, lon)
  const moonIllumination = getMoonIllumination(moonPhase)
  const moonPhaseName = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                         'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
                         [Math.round(moonPhase * 7) % 8] || 'New Moon'
  
  const dewPoint = calcDewPoint(temp, humidity);
  const gdd = calcGrowingDegreeDays(tempMax, tempMin, 10);
  const et = calcEvapotranspiration(temp, humidity, wind);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const comfort = getComfortScore({ temp, humidity, wind });
  const cloudCover = getCloudCover(conditionCode);
  const uvLevel = getUVLevel(uvIndex);
  const pollenIndex = getPollenIndex(season, temp, humidity, wind);
  
  // Determine if it's a good day for farming activities
  const isGoodFieldDay = !isRaining && wind < 25 && temp > 10 && temp < 35 && humidity < 85
  
  // ========================================================================
  // RESPONSE BUILDING
  // ========================================================================

  let response = `🌾 **Farming & Agriculture Weather Report**\n`
  response += `📍 **Location:** ${city || 'Your Farm'}\n`
  response += `📅 **Season:** ${season.charAt(0).toUpperCase() + season.slice(1)}\n`
  response += `🌙 **Moon Phase:** ${moonPhaseName} (${Math.round(moonIllumination)}% illuminated)\n\n`
  
  // ========================================================================
  // CURRENT CONDITIONS
  // ========================================================================

  response += `---\n\n`
  response += `🌡️ **Current Conditions:**\n`
  response += `- Temperature: ${Math.round(temp)}°C (High: ${Math.round(tempMax)}°C / Low: ${Math.round(tempMin)}°C)\n`
  response += `- Humidity: ${Math.round(humidity)}%\n`
  response += `- Wind: ${Math.round(wind)} km/h\n`
  response += `- Cloud Cover: ${cloudCover}%\n`
  response += `- UV Index: ${uvIndex} (${uvLevel})\n`
  response += `- Dew Point: ${Math.round(dewPoint)}°C\n`
  if (precipitation) response += `- Rain: ${precipitation}mm today\n`
  if (precipitationProbability) response += `- Rain Chance: ${Math.round(precipitationProbability)}%\n`
  response += `- Growing Degree Days: ${gdd} (base 10°C)\n`
  response += `- Evapotranspiration: ${Math.round(et * 10) / 10} mm/day\n\n`

  // ========================================================================
  // SOIL CONDITIONS
  // ========================================================================

  const soil = getSoilCondition(data)
  response += `🌱 **Soil Conditions:**\n`
  soil.forEach(s => response += `  ${s}\n`)
  response += '\n'

  // ========================================================================
  // IRRIGATION SCHEDULE
  // ========================================================================

  const irrigation = getIrrigationSchedule(data)
  response += `💧 **Irrigation Schedule:**\n`
  irrigation.forEach(i => response += `  ${i}\n`)
  response += '\n'

  // ========================================================================
  // CROP HEALTH & PLANTING ADVICE
  // ========================================================================

  response += `🌾 **Crop Health & Planting Advice:**\n`
  
  // Check if it's a good planting day
  if (isGoodFieldDay) {
    if (temp > 15 && temp < 28 && humidity > 40 && humidity < 80) {
      response += `  ✅ **Perfect planting conditions!**\n`
      response += `     Temperature and humidity are ideal for transplanting and seeding.\n`
    } else if (temp > 10 && temp < 32) {
      response += `  🌱 **Good planting conditions.**\n`
      response += `     Acceptable for most crops. Check specific crop requirements.\n`
    } else {
      response += `  ⚠️ **Marginal planting conditions.**\n`
      response += `     Consider waiting for better weather.\n`
    }
  } else {
    if (isRaining) {
      response += `  🌧️ **Too wet for planting.**\n`
      response += `     Wait for soil to drain. Risk of seed rot.\n`
    } else if (wind > 25) {
      response += `  💨 **Too windy for planting.**\n`
      response += `     Seeds may blow away or be buried too deep.\n`
    } else if (temp > 35) {
      response += `  🔥 **Too hot for planting.**\n`
      response += `     Heat stress will kill seedlings. Wait for cooler weather.\n`
    } else if (temp < 5) {
      response += `  ❄️ **Too cold for planting.**\n`
      response += `     Soil temperature too low for germination.\n`
    }
  }

  // ========================================================================
  // CROP-SPECIFIC ADVICE
  // ========================================================================

  // Parse question for crop mentions
  const q = question?.toLowerCase() || ''
  let mentionedCrops = []
  
  // Check if user mentioned a specific crop
  Object.keys(CROP_DATABASE).forEach(cropKey => {
    if (q.includes(cropKey) || q.includes(CROP_DATABASE[cropKey].name.toLowerCase())) {
      mentionedCrops.push(cropKey)
    }
  })
  
  // If no crop mentioned, show top 5 crops based on conditions
  if (mentionedCrops.length === 0) {
    const recommendedCrops = []
    Object.keys(CROP_DATABASE).forEach(cropKey => {
      const crop = CROP_DATABASE[cropKey]
      if (temp >= crop.tempMin && temp <= crop.tempMax) {
        recommendedCrops.push(cropKey)
      }
    })
    mentionedCrops = recommendedCrops.slice(0, 5)
  }
  
  if (mentionedCrops.length > 0) {
    response += `\n🌿 **Crop-Specific Advice:**\n`
    mentionedCrops.forEach(cropKey => {
      const crop = CROP_DATABASE[cropKey]
      if (!crop) return
      
      const isInIdealRange = temp >= crop.tempMin && temp <= crop.tempMax
      const isInOptimalRange = temp >= crop.idealTemp - 3 && temp <= crop.idealTemp + 3
      
      response += `  **${crop.name}:**\n`
      if (isInOptimalRange) {
        response += `    ✅ Perfect temperature range (${Math.round(temp)}°C)\n`
      } else if (isInIdealRange) {
        response += `    ✅ Acceptable temperature (${Math.round(temp)}°C). Ideal is ${crop.idealTemp}°C\n`
      } else if (temp < crop.tempMin) {
        response += `    ❌ TOO COLD! Below ${crop.tempMin}°C. Risk of damage.\n`
        if (crop.frostTolerance === 'None') {
          response += `       NO frost tolerance. PROTECT immediately!\n`
        } else if (crop.frostTolerance === 'Moderate') {
          response += `       Moderate frost tolerance. Still protect if possible.\n`
        }
      } else if (temp > crop.tempMax) {
        response += `    ❌ TOO HOT! Above ${crop.tempMax}°C. Heat stress risk.\n`
      }
      
      response += `    💧 Water need: ${crop.waterNeed}\n`
      if (crop.notes) response += `    📝 ${crop.notes}\n`
    })
  }

  // ========================================================================
  // PEST & DISEASE RISK
  // ========================================================================

  response += `\n🐛 **Pest & Disease Risk:**\n`
  let hasPestRisk = false
  
  Object.keys(PEST_DISEASE_DATABASE).forEach(pestKey => {
    const pest = PEST_DISEASE_DATABASE[pestKey]
    const conditions = pest.conditions
    
    let riskLevel = 0
    if (conditions.tempMin && temp >= conditions.tempMin) riskLevel += 1
    if (conditions.tempMax && temp <= conditions.tempMax) riskLevel += 1
    if (conditions.humidity && humidity >= conditions.humidity) riskLevel += 1
    
    if (riskLevel >= 2) {
      hasPestRisk = true
      const severityEmoji = pest.severity === 'Very High' ? '🔴' : 
                           pest.severity === 'High' ? '🟠' : '🟡'
      response += `  ${severityEmoji} **${pest.name}** (${pest.severity} risk)\n`
      response += `    ${pest.notes}\n`
      if (pest.crops) {
        response += `    Affects: ${pest.crops.join(', ')}\n`
      }
    }
  })
  
  if (!hasPestRisk) {
    response += `  ✅ Low pest and disease pressure currently.\n`
    response += `     Continue monitoring fields regularly.\n`
  }

  // ========================================================================
  // FERTILIZER ADVICE
  // ========================================================================

  const fertilizerAdvice = getFertilizerAdvice(data)
  response += `\n🧪 **Fertilizer Application:**\n`
  fertilizerAdvice.forEach(f => response += `  ${f}\n`)

  // ========================================================================
  // POST-HARVEST ADVICE
  // ========================================================================

  if (q.includes('harvest') || q.includes('drying') || q.includes('store')) {
    const harvestAdvice = getPostHarvestAdvice(data)
    response += `\n📦 **Post-Harvest Advice:**\n`
    harvestAdvice.forEach(h => response += `  ${h}\n`)
  }

  // ========================================================================
  // LIVESTOCK & POULTRY
  // ========================================================================

  if (q.includes('livestock') || q.includes('animal') || q.includes('poultry') || 
      q.includes('cow') || q.includes('chicken') || q.includes('goat')) {
    const livestockAdvice = getLivestockAdvice(data)
    response += `\n🐄 **Livestock & Poultry:**\n`
    livestockAdvice.forEach(l => response += `  ${l}\n`)
  }

  // ========================================================================
  // DAILY WORK PLAN
  // ========================================================================

  response += `\n📋 **Recommended Daily Farm Work:**\n`
  
  let workPlan = []
  
  if (isRaining) {
    workPlan.push('🌧️ Rain day: Indoor work only')
    workPlan.push('   - Equipment maintenance')
    workPlan.push('   - Record keeping and planning')
    workPlan.push('   - Repair fences and structures (if safe)')
    workPlan.push('   - DO NOT apply pesticides/fertilizers')
  } else if (wind > 25) {
    workPlan.push('💨 Windy day: Limit outdoor work')
    workPlan.push('   - Avoid spraying')
    workPlan.push('   - Check for wind damage to crops')
    workPlan.push('   - Secure greenhouse covers')
  } else if (temp > 35) {
    workPlan.push('🔥 Heat wave: Work early morning and evening only')
    workPlan.push('   - Start at 5 AM, stop by 10 AM')
    workPlan.push('   - Resume at 4 PM')
    workPlan.push('   - Increase irrigation')
  } else if (isGoodFieldDay) {
    workPlan.push('✅ Excellent field day!')
    workPlan.push('   - Plant new crops (morning)')
    workPlan.push('   - Apply fertilizers (if needed)')
    workPlan.push('   - Harvest mature crops (early morning)')
    workPlan.push('   - Spray pesticides (if needed, before 9 AM)')
    workPlan.push('   - Check irrigation systems')
  } else {
    workPlan.push('📌 Moderate conditions: Pick tasks carefully')
    workPlan.push('   - Do soil preparation')
    workPlan.push('   - Weed control')
    workPlan.push('   - Inspect for pests/diseases')
  }
  
  workPlan.forEach(w => response += `  ${w}\n`)

  // ========================================================================
  // WARNINGS & ALERTS
  // ========================================================================

  response += `\n⚠️ **Alerts & Warnings:**\n`
  let hasWarnings = false
  
  // Frost warning
  if (tempMin <= 2) {
    response += `  ❄️ **FROST RISK!** Low ${Math.round(tempMin)}°C\n`
    response += `     - Cover tender crops immediately\n`
    response += `     - Protect young seedlings\n`
    response += `     - Harvest mature crops before frost\n`
    hasWarnings = true
  }
  
  // Heat stress warning
  if (tempMax > 35) {
    response += `  🔥 **EXTREME HEAT!** High ${Math.round(tempMax)}°C\n`
    response += `     - Heat stress for crops and livestock\n`
    response += `     - Increase irrigation by 30%\n`
    response += `     - Provide shade where possible\n`
    hasWarnings = true
  }
  
  // Heavy rain warning
  if (precipitation && precipitation > 30) {
    response += `  🌧️ **HEAVY RAIN!** ${Math.round(precipitation)}mm expected\n`
    response += `     - Risk of waterlogging\n`
    response += `     - Check drainage systems\n`
    response += `     - Delay fertilizer application\n`
    hasWarnings = true
  }
  
  // Wind warning
  if (wind > 30) {
    response += `  💨 **STRONG WINDS!** ${Math.round(wind)} km/h\n`
    response += `     - Secure loose objects\n`
    response += `     - Support tall crops\n`
    response += `     - Avoid spraying\n`
    hasWarnings = true
  }
  
  // Disease risk
  if (humidity > 85 && temp > 20) {
    response += `  🦠 **HIGH DISEASE RISK!** (${Math.round(humidity)}% humidity)\n`
    response += `     - Fungal diseases likely\n`
    response += `     - Apply preventative fungicide\n`
    response += `     - Improve airflow in crops\n`
    hasWarnings = true
  }
  
  if (!hasWarnings) {
    response += `  ✅ No significant warnings.\n`
    response += `     Continue normal farm operations.\n`
  }

  // ========================================================================
  // BOTTOM LINE
  // ========================================================================

  response += `\n---\n\n`
  response += `🎯 **Bottom Line:**\n`
  
  if (isGoodFieldDay && !hasWarnings) {
    response += `✅ **EXCELLENT FARMING CONDITIONS!**\n`
    response += `   Perfect weather for all farming activities.\n`
    response += `   Make the most of this weather window.\n`
  } else if (isGoodFieldDay && hasWarnings) {
    response += `⚠️ **FAIR CONDITIONS with warnings.**\n`
    response += `   Address warnings before proceeding.\n`
    response += `   Prioritize protective measures.\n`
  } else if (isRaining || temp > 35 || tempMin < 5) {
    response += `❌ **POOR CONDITIONS.**\n`
    response += `   Focus on indoor work and maintenance.\n`
    response += `   Protect crops and livestock.\n`
  } else {
    response += `📊 **MODERATE CONDITIONS.**\n`
    response += `   Work with caution. Monitor conditions.\n`
  }

  // ========================================================================
  // FARMING WISDOM
  // ========================================================================

  const wisdom = [
    "\n\n🌾 Farming is patience. Weather is the teacher.",
    "\n\n🌱 A good farmer plants seeds. A great farmer plants knowledge.",
    "\n\n🚜 The best fertilizer is the farmer's shadow.",
    "\n\n🌾 Farming looks easy when the weather cooperates.",
    "\n\n💧 Water is the lifeblood of agriculture.",
    "\n\n🌍 The farmer's work feeds the world."
  ]
  
  response += random(wisdom)

  return response;
};

// ========================================================================
// EXPORTS
// ========================================================================

export const getCropDatabase = () => CROP_DATABASE
export const getPestDiseaseDatabase = () => PEST_DISEASE_DATABASE
export const getSoilConditionData = getSoilCondition
export const getIrrigationScheduleData = getIrrigationSchedule
export const getFertilizerAdviceData = getFertilizerAdvice
export const getPostHarvestAdviceData = getPostHarvestAdvice
export const getLivestockAdviceData = getLivestockAdvice

export default getFarmingAdvice
