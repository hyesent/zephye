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
  // WATER & IRRIGATION
  "Should I water my crops today?",
  "Do I need to irrigate?",
  "Is the soil too wet for planting?",
  "Will rain damage my crops?",
  "Should I adjust my irrigation schedule?",
  "Is there a risk of drought this week?",
  "Will my crops get enough water?",
  "Should I use drip or sprinkler irrigation today?",
  "Is it safe to irrigate in this wind?",
  "Will my rice paddies need more water?",
  
  // PLANTING & HARVESTING
  "Is it good weather for planting?",
  "Is it safe to transplant seedlings?",
  "When should I harvest my potatoes?",
  "Is it good harvesting weather?",
  "Should I plant cover crops now?",
  "Will soil temperature affect germination?",
  "When should I start my greenhouse crops?",
  "Is it time to harvest corn?",
  "Should I harvest before the rain?",
  "Can I plant in these soil conditions?",
  
  // TEMPERATURE & FROST
  "Will there be frost tonight?",
  "Should I cover my plants?",
  "Will my orchard be affected by frost?",
  "Will my tomatoes survive this heat?",
  "Will my lettuce bolt in this weather?",
  "Is the temperature good for my crops?",
  "Will my corn pollinate successfully?",
  "Is there a risk of heat stress?",
  "Should I use row covers tonight?",
  
  // PEST & DISEASE
  "Is it safe to spray pesticides?",
  "Will humidity cause crop disease?",
  "Is there a risk of fungal disease?",
  "Should I use a fungicide today?",
  "When should I apply herbicides?",
  "Is there a risk of armyworm?",
  "Will locusts be a problem?",
  "Should I monitor for pests today?",
  "Is it safe to use neem oil?",
  
  // FERTILIZER & SOIL
  "When should I fertilize my crops?",
  "Should I apply nitrogen today?",
  "Is it good weather for fertilizer?",
  "Will fertilizer wash away in rain?",
  "Should I apply manure today?",
  "Is the soil too dry for fertilizer?",
  
  // LIVESTOCK
  "Is it safe for livestock outside?",
  "Should I move animals to shelter?",
  "Will my poultry be okay in this heat?",
  "Do my animals need extra water today?",
  "Is it safe to graze cattle today?",
  
  // POST-HARVEST
  "Will my hay dry before rain?",
  "Is it good weather for drying crops?",
  "Should I store my harvest today?",
  "Will my grain be safe from moisture?",
  "Is it good weather for threshing?",
  
  // GENERAL
  "Is it safe to use a tractor in the field?",
  "What should I do on the farm today?",
  "Is it a good day for farm work?",
  "Will the weather affect my farm operations?",
  "Should I adjust my farming schedule?",
  "Is it safe to work in the field?",
  "What's the best time to work today?",
  "Should I postpone farm activities?"
];

// ============================================================================
// ENHANCED CROP DATABASE
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
    daysToMaturity: 90,
    plantingDepth: '3-5 cm',
    spacing: '25-30 cm apart',
    notes: 'Pollination fails above 32°C. Needs 50-80mm rain per month. Critical water need during tasseling and silking.'
  },
  tomatoes: {
    name: 'Tomatoes',
    tempMin: 15,
    tempMax: 32,
    idealTemp: 22,
    gddBase: 12,
    waterNeed: 'Medium-High',
    frostTolerance: 'None',
    daysToMaturity: 75,
    plantingDepth: '1-2 cm',
    spacing: '45-60 cm apart',
    notes: 'Blossom drop above 30°C. Needs consistent moisture. Staking required for best yields.'
  },
  rice: {
    name: 'Rice (Paddy)',
    tempMin: 15,
    tempMax: 38,
    idealTemp: 28,
    gddBase: 12,
    waterNeed: 'Very High',
    frostTolerance: 'None',
    daysToMaturity: 120,
    plantingDepth: '1-2 cm',
    spacing: '20-25 cm apart',
    notes: 'Requires 100-200mm of standing water. Heavy rain beneficial. Needs 5-6 months of warm weather.'
  },
  cassava: {
    name: 'Cassava',
    tempMin: 18,
    tempMax: 35,
    idealTemp: 27,
    gddBase: 12,
    waterNeed: 'Low-Medium',
    frostTolerance: 'None',
    daysToMaturity: 240,
    plantingDepth: '5-10 cm',
    spacing: '100 cm apart',
    notes: 'Drought tolerant. Needs 6-8 months of warm weather. Grows in poor soils.'
  },
  yam: {
    name: 'Yam',
    tempMin: 20,
    tempMax: 35,
    idealTemp: 28,
    gddBase: 15,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    daysToMaturity: 210,
    plantingDepth: '10-15 cm',
    spacing: '100 cm apart',
    notes: 'Requires 7-8 months of warm weather. Needs well-drained soil. Staking recommended.'
  },
  cowpea: {
    name: 'Cowpea / Black-eyed Pea',
    tempMin: 15,
    tempMax: 35,
    idealTemp: 27,
    gddBase: 10,
    waterNeed: 'Low',
    frostTolerance: 'None',
    daysToMaturity: 70,
    plantingDepth: '2-4 cm',
    spacing: '20-30 cm apart',
    notes: 'Drought tolerant. Good nitrogen fixer. Harvest when pods are dry.'
  },
  groundnut: {
    name: 'Groundnut / Peanut',
    tempMin: 15,
    tempMax: 35,
    idealTemp: 28,
    gddBase: 10,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    daysToMaturity: 120,
    plantingDepth: '3-5 cm',
    spacing: '15-20 cm apart',
    notes: 'Needs 4-5 months of warm weather. Sandy soil preferred. Harvest when leaves turn yellow.'
  },
  sorghum: {
    name: 'Sorghum / Guinea Corn',
    tempMin: 15,
    tempMax: 38,
    idealTemp: 28,
    gddBase: 10,
    waterNeed: 'Low-Medium',
    frostTolerance: 'None',
    daysToMaturity: 90,
    plantingDepth: '2-4 cm',
    spacing: '15-20 cm apart',
    notes: 'Very drought tolerant. Grows well in arid conditions. Good for dryland farming.'
  },
  millet: {
    name: 'Millet',
    tempMin: 15,
    tempMax: 40,
    idealTemp: 30,
    gddBase: 10,
    waterNeed: 'Low',
    frostTolerance: 'None',
    daysToMaturity: 75,
    plantingDepth: '1-2 cm',
    spacing: '10-15 cm apart',
    notes: 'Extremely drought tolerant. Grows in poor soils. Short season crop.'
  },
  sugarcane: {
    name: 'Sugarcane',
    tempMin: 20,
    tempMax: 38,
    idealTemp: 30,
    gddBase: 15,
    waterNeed: 'High',
    frostTolerance: 'None',
    daysToMaturity: 365,
    plantingDepth: '5-10 cm',
    spacing: '100-150 cm apart',
    notes: 'Requires 10-12 months of warm weather. Heavy water needs. Ratoon cropping possible.'
  },
  cocoa: {
    name: 'Cocoa',
    tempMin: 21,
    tempMax: 32,
    idealTemp: 27,
    gddBase: 15,
    waterNeed: 'Medium-High',
    frostTolerance: 'None',
    daysToMaturity: 1095,
    plantingDepth: '2-3 cm',
    spacing: '300-400 cm apart',
    notes: 'Requires consistent rainfall. Needs shade in early years. Takes 3-4 years to produce.'
  },
  oilpalm: {
    name: 'Oil Palm',
    tempMin: 22,
    tempMax: 35,
    idealTemp: 29,
    gddBase: 15,
    waterNeed: 'High',
    frostTolerance: 'None',
    daysToMaturity: 1095,
    plantingDepth: '5-8 cm',
    spacing: '800-900 cm apart',
    notes: 'Requires 1500-2000mm rainfall per year. Needs 3-4 years to mature. Peak production at 10-15 years.'
  },
  okra: {
    name: 'Okra',
    tempMin: 18,
    tempMax: 38,
    idealTemp: 28,
    gddBase: 12,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    daysToMaturity: 55,
    plantingDepth: '2-3 cm',
    spacing: '30-45 cm apart',
    notes: 'Needs warm weather. Harvest every 2-3 days. Pods best when 8-10cm long.'
  },
  spinach: {
    name: 'Spinach',
    tempMin: 5,
    tempMax: 25,
    idealTemp: 18,
    gddBase: 5,
    waterNeed: 'Medium',
    frostTolerance: 'Moderate',
    daysToMaturity: 45,
    plantingDepth: '1-2 cm',
    spacing: '15-20 cm apart',
    notes: 'Bolts in hot weather. Prefers cool conditions. Harvest leaves when young.'
  },
  lettuce: {
    name: 'Lettuce',
    tempMin: 5,
    tempMax: 25,
    idealTemp: 18,
    gddBase: 5,
    waterNeed: 'Medium',
    frostTolerance: 'Moderate',
    daysToMaturity: 60,
    plantingDepth: '0.5-1 cm',
    spacing: '25-30 cm apart',
    notes: 'Bolts in heat. Needs consistent moisture. Harvest head when firm.'
  },
  beans: {
    name: 'Beans (Common)',
    tempMin: 15,
    tempMax: 30,
    idealTemp: 22,
    gddBase: 10,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    daysToMaturity: 65,
    plantingDepth: '2-4 cm',
    spacing: '10-15 cm apart',
    notes: 'Needs 2-3 months of warm weather. Nitrogen fixer. Pods mature from bottom up.'
  },
  peppers: {
    name: 'Peppers (Bell / Chili)',
    tempMin: 18,
    tempMax: 32,
    idealTemp: 25,
    gddBase: 15,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    daysToMaturity: 80,
    plantingDepth: '0.5-1 cm',
    spacing: '30-45 cm apart',
    notes: 'Needs warm soil for germination. Fruit set drops above 30°C. Consistent moisture important.'
  },
  onions: {
    name: 'Onions',
    tempMin: 10,
    tempMax: 30,
    idealTemp: 20,
    gddBase: 10,
    waterNeed: 'Medium',
    frostTolerance: 'Moderate',
    daysToMaturity: 100,
    plantingDepth: '1-2 cm',
    spacing: '10-15 cm apart',
    notes: 'Bulb formation triggered by day length. Stop watering when tops fall over.'
  },
  garlic: {
    name: 'Garlic',
    tempMin: 5,
    tempMax: 28,
    idealTemp: 18,
    gddBase: 5,
    waterNeed: 'Low-Medium',
    frostTolerance: 'High',
    daysToMaturity: 240,
    plantingDepth: '3-5 cm',
    spacing: '10-15 cm apart',
    notes: 'Plant in fall for spring harvest. Needs cold period for bulb formation. Stop watering before harvest.'
  },
  watermelon: {
    name: 'Watermelon',
    tempMin: 20,
    tempMax: 38,
    idealTemp: 30,
    gddBase: 15,
    waterNeed: 'High',
    frostTolerance: 'None',
    daysToMaturity: 85,
    plantingDepth: '2-3 cm',
    spacing: '100-150 cm apart',
    notes: 'Needs warm soil for germination. Reduce water as fruit matures for better sweetness.'
  },
  sweet_potato: {
    name: 'Sweet Potato',
    tempMin: 18,
    tempMax: 35,
    idealTemp: 28,
    gddBase: 15,
    waterNeed: 'Medium',
    frostTolerance: 'None',
    daysToMaturity: 120,
    plantingDepth: '5-10 cm (slips)',
    spacing: '30-45 cm apart',
    notes: 'Plant slips not seeds. Needs warm weather. Harvest when leaves start to yellow.'
  }
};

// ============================================================================
// ENHANCED PEST & DISEASE DATABASE
// ============================================================================

const PEST_DISEASE_DATABASE = {
  leaf_spot: {
    name: 'Leaf Spot',
    conditions: { humidity: 80, tempMin: 20, tempMax: 30 },
    crops: ['tomatoes', 'peppers', 'beans', 'cassava'],
    severity: 'Medium',
    treatment: 'Remove infected leaves. Apply copper-based fungicide.',
    prevention: 'Rotate crops. Avoid overhead irrigation. Space plants for airflow.',
    notes: 'Fungal disease. Spreads rapidly in wet conditions.'
  },
  downy_mildew: {
    name: 'Downy Mildew',
    conditions: { humidity: 85, tempMin: 15, tempMax: 25 },
    crops: ['grapes', 'lettuce', 'spinach', 'onions'],
    severity: 'High',
    treatment: 'Apply fungicide immediately. Remove severely infected plants.',
    prevention: 'Avoid overhead irrigation. Good drainage. Resistant varieties.',
    notes: 'Fungal disease. Thrives in cool, wet conditions. Can destroy entire crop.'
  },
  powdery_mildew: {
    name: 'Powdery Mildew',
    conditions: { humidity: 60, tempMin: 18, tempMax: 28 },
    crops: ['tomatoes', 'peppers', 'cucumbers', 'wheat', 'grapes'],
    severity: 'Medium',
    treatment: 'Sulfur or potassium bicarbonate spray. Neem oil.',
    prevention: 'Spacing for airflow. Avoid overhead watering. Resistant varieties.',
    notes: 'Fungal disease. Increases in dry, warm conditions with high humidity at night.'
  },
  rust: {
    name: 'Rust',
    conditions: { humidity: 70, tempMin: 18, tempMax: 28 },
    crops: ['wheat', 'barley', 'oats', 'corn'],
    severity: 'High',
    treatment: 'Fungicide application. Remove volunteer plants.',
    prevention: 'Resistant varieties. Crop rotation. Early planting.',
    notes: 'Fungal disease. Spreads rapidly in humid conditions. Can cause significant yield loss.'
  },
  blight: {
    name: 'Late Blight',
    conditions: { humidity: 90, tempMin: 15, tempMax: 22 },
    crops: ['tomatoes', 'potatoes', 'peppers'],
    severity: 'High',
    treatment: 'Destroy infected plants. Preventative fungicide for remaining plants.',
    prevention: 'Resistant varieties. Good air circulation. Avoid overhead watering.',
    notes: 'Devastating fungal disease. Caused Irish Potato Famine. Requires immediate action.'
  },
  stem_rot: {
    name: 'Stem Rot',
    conditions: { humidity: 85, tempMin: 22, tempMax: 30 },
    crops: ['peanuts', 'soybeans', 'sunflowers'],
    severity: 'High',
    treatment: 'Fungicide. Improve drainage. Remove infected plants.',
    prevention: 'Good drainage. Crop rotation. Avoid overwatering.',
    notes: 'Fungal disease. Overwatering increases risk. Soil-borne pathogen.'
  },
  aphids: {
    name: 'Aphids',
    conditions: { tempMin: 18, tempMax: 28 },
    crops: ['tomatoes', 'peppers', 'cucumbers', 'cabbage', 'okra'],
    severity: 'Medium',
    treatment: 'Neem oil or insecticidal soap. Beneficial insects (ladybugs).',
    prevention: 'Companion planting. Regular monitoring. Attract beneficial insects.',
    notes: 'Sap-sucking insects. Transmit viral diseases. Check undersides of leaves.'
  },
  spider_mites: {
    name: 'Spider Mites',
    conditions: { tempMin: 25, humidity: 30 },
    crops: ['tomatoes', 'cucumbers', 'beans', 'corn'],
    severity: 'High',
    treatment: 'Miticide or insecticidal soap. Water spray to knock off.',
    prevention: 'Keep plants well-watered. Avoid dusty conditions. Remove infested leaves.',
    notes: 'Thrives in hot, dry conditions. Damage appears as stippling on leaves.'
  },
  fall_armyworm: {
    name: 'Fall Armyworm',
    conditions: { tempMin: 20, tempMax: 30 },
    crops: ['corn', 'sorghum', 'millet', 'rice'],
    severity: 'Very High',
    treatment: 'Bio-pesticides (Bt, neem). Chemical pesticides for severe infestations.',
    prevention: 'Monitor fields daily. Early detection critical. Pheromone traps.',
    notes: 'Major pest in Africa. Feeds on leaves and ears. Can destroy entire field in days.'
  },
  locust: {
    name: 'Locust',
    conditions: { tempMin: 25, humidity: 50 },
    crops: ['ALL'],
    severity: 'Very High',
    treatment: 'Report to agricultural authorities immediately. Organophosphate sprays.',
    prevention: 'Regional monitoring. Early warning systems. Aerial spraying.',
    notes: 'Swarm risk. Report to agricultural authorities immediately. Can devastate entire regions.'
  },
  whitefly: {
    name: 'Whitefly',
    conditions: { tempMin: 20, tempMax: 35 },
    crops: ['tomatoes', 'peppers', 'cassava', 'okra'],
    severity: 'High',
    treatment: 'Insecticidal soap. Yellow sticky traps. Beneficial insects.',
    prevention: 'Remove infected plants. Use reflective mulches. Monitor closely.',
    notes: 'Transmits viral diseases. Thrives in warm conditions. Check under leaves.'
  },
  nematodes: {
    name: 'Root-knot Nematodes',
    conditions: { tempMin: 22, tempMax: 32 },
    crops: ['tomatoes', 'peppers', 'cucumbers', 'okra'],
    severity: 'High',
    treatment: 'Nematicides. Solarization. Crop rotation with resistant crops.',
    prevention: 'Resistant varieties. Crop rotation. Organic matter addition.',
    notes: 'Microscopic worms that damage roots. Causes wilting and reduced yields.'
  }
};

// ============================================================================
// ENHANCED SOIL CONDITION CALCULATOR
// ============================================================================

function getSoilCondition(data) {
  const { temp, humidity, wind, condition, precipitation, tempMax, tempMin } = data;
  const advice = [];
  const warnings = [];
  
  // Soil temperature estimation
  const isClear = condition === 'clear' || condition === 'partly-cloudy';
  const isRain = condition === 'rain' || condition === 'thunderstorm' || condition === 'drizzle';
  const soilTemp = temp + (isClear ? 5 : 0) - (isRain ? 3 : 0);
  
  advice.push("SOIL CONDITION ANALYSIS:");
  advice.push(`  Soil temperature: ${Math.round(soilTemp)}°C`);
  
  if (soilTemp < 2) {
    warnings.push("FROZEN SOIL: No field work possible");
    advice.push("  Soil is frozen. Wait for thaw.");
    advice.push("  Risk of root damage if planting.");
  } else if (soilTemp < 5) {
    warnings.push("VERY COLD SOIL: Limited activity");
    advice.push("  Only cold-hardy crops can survive.");
    advice.push("  Warm-season crops will not germinate.");
  } else if (soilTemp < 10) {
    advice.push("  Cool soil. Some cool-season crops can germinate.");
    advice.push("  Warm-season crops: wait for warmer soil.");
    advice.push("  Soil preparation: good time for tillage.");
  } else if (soilTemp < 15) {
    advice.push("  Moderately warm soil. Good for many cool-season crops.");
    advice.push("  Warm-season crops: germination will be slow.");
    advice.push("  Soil preparation: ideal for bed preparation.");
  } else if (soilTemp < 20) {
    advice.push("  Good soil temperature for most crops.");
    advice.push("  Warm-season crops will germinate well.");
    advice.push("  Soil preparation: ideal for planting.");
  } else if (soilTemp < 25) {
    advice.push("  Ideal soil temperature for optimal germination.");
    advice.push("  All crops will establish quickly.");
    advice.push("  Soil preparation: perfect conditions.");
  } else if (soilTemp < 30) {
    advice.push("  Warm soil. Good for heat-loving crops.");
    advice.push("  Corn, sorghum, millet will thrive.");
    advice.push("  Soil preparation: early morning or evening.");
  } else {
    warnings.push("HOT SOIL: Heat stress on roots");
    advice.push("  Soil above 30°C. Roots may be damaged.");
    advice.push("  Water early morning or late evening.");
    advice.push("  Use mulch to cool soil.");
  }
  
  // Soil moisture estimation
  const rainAmount = precipitation || 0;
  let moisture = 'Moderate';
  let moistureDescription = '';
  
  if (rainAmount > 30) {
    moisture = 'Waterlogged';
    moistureDescription = 'Excessive moisture. Root rot risk.';
    warnings.push("WATERLOGGED SOIL: Drainage required");
    advice.push("  Do not plant. Wait for soil to drain.");
    advice.push("  Check for standing water. Consider drainage channels.");
  } else if (rainAmount > 20) {
    moisture = 'Wet';
    moistureDescription = 'Saturated. Heavy equipment may cause compaction.';
    warnings.push("WET SOIL: Avoid heavy equipment");
    advice.push("  Risk of soil compaction.");
    advice.push("  Wait 2-3 days for soil to dry.");
  } else if (rainAmount > 10) {
    moisture = 'Moist';
    moistureDescription = 'Good moisture for planting.';
    advice.push("  Excellent moisture for seed germination.");
    advice.push("  Ideal for planting operations.");
  } else if (rainAmount > 5) {
    moisture = 'Slightly moist';
    moistureDescription = 'Some moisture but may need irrigation.';
    advice.push("  Light irrigation may be beneficial.");
    advice.push("  Check 5cm below surface for moisture.");
  } else if (rainAmount > 0) {
    moisture = 'Dry';
    moistureDescription = 'Irrigation needed for planting.';
    warnings.push("DRY SOIL: Irrigation required");
    advice.push("  Irrigate before planting if possible.");
    advice.push("  Consider dry planting if rain expected.");
  } else {
    // Estimate based on ET
    const et = calcEvapotranspiration(temp, humidity, wind);
    if (et > 6) {
      moisture = 'Very Dry';
      moistureDescription = 'High evaporation. Immediate irrigation needed.';
      warnings.push("EXTREMELY DRY SOIL: Urgent irrigation required");
      advice.push(`  Evapotranspiration: ${Math.round(et * 10) / 10}mm/day`);
      advice.push("  Irrigate immediately for crop survival.");
    } else if (et > 4) {
      moisture = 'Dry';
      moistureDescription = 'Irrigation recommended.';
      advice.push(`  Evapotranspiration: ${Math.round(et * 10) / 10}mm/day`);
      advice.push("  Consider irrigation within 2-3 days.");
    } else if (et > 2) {
      moisture = 'Slightly Dry';
      moistureDescription = 'Marginal moisture. Watch for plant stress.';
      advice.push("  Monitor soil moisture. Irrigation may be needed soon.");
    } else {
      moisture = 'Moist';
      moistureDescription = 'Good moisture levels.';
      advice.push("  Soil moisture adequate. Continue monitoring.");
    }
  }
  
  advice.push(`  Soil moisture: ${moisture} - ${moistureDescription}`);
  
  // Workability
  if (moisture === 'Waterlogged' || moisture === 'Wet') {
    warnings.push("POOR WORKABILITY: Soil too wet");
    advice.push("  Avoid heavy equipment. Risk of compaction.");
    advice.push("  Wait for soil to dry to field capacity.");
  } else if (moisture === 'Very Dry' || moisture === 'Dry') {
    advice.push("  Dusty conditions. Irrigate before tillage.");
    advice.push("  Tilling dry soil creates dust and reduces organic matter.");
  } else if (moisture === 'Moist' || moisture === 'Slightly moist') {
    advice.push("  WORKABILITY: Excellent for field operations.");
    advice.push("  Tilling, planting, and spraying are all suitable.");
  }
  
  // Soil type considerations (simplified)
  advice.push("");
  advice.push("SOIL MANAGEMENT TIPS:");
  if (moisture === 'Waterlogged' || moisture === 'Wet') {
    advice.push("  - Improve drainage with ditches or raised beds");
    advice.push("  - Avoid trafficking until soil dries");
    advice.push("  - Consider cover crops to improve structure");
  } else if (moisture === 'Very Dry' || moisture === 'Dry') {
    advice.push("  - Apply mulch to reduce evaporation");
    advice.push("  - Use drip irrigation for efficiency");
    advice.push("  - Consider minimum tillage to preserve moisture");
  } else {
    advice.push("  - Maintain soil cover to protect structure");
    advice.push("  - Incorporate organic matter regularly");
    advice.push("  - Use crop rotation to maintain soil health");
  }
  
  return { advice, warnings, moisture, soilTemp: Math.round(soilTemp) };
}

// ============================================================================
// ENHANCED IRRIGATION SCHEDULING
// ============================================================================

function getIrrigationSchedule(data, cropType = 'general') {
  const { temp, humidity, wind, condition, precipitation, tempMax } = data;
  const advice = [];
  const schedule = [];
  const et = calcEvapotranspiration(temp, humidity, wind);
  const rainAmount = precipitation || 0;
  const isRaining = condition === 'rain' || condition === 'thunderstorm' || condition === 'drizzle';
  
  // Calculate water deficit
  const cropFactor = cropType === 'rice' ? 1.2 : 
                    cropType === 'corn' ? 1.0 :
                    cropType === 'tomatoes' ? 0.9 :
                    cropType === 'cassava' ? 0.6 : 0.8;
  
  const waterNeeded = Math.max(0, (et * cropFactor) - rainAmount);
  
  advice.push("IRRIGATION SCHEDULE:");
  advice.push(`  Evapotranspiration: ${Math.round(et * 10) / 10}mm/day`);
  advice.push(`  Crop factor: ${cropFactor}`);
  advice.push(`  Water deficit: ${Math.round(waterNeeded * 10) / 10}mm`);
  
  if (isRaining) {
    advice.push("  RAINING: No irrigation needed today.");
    advice.push("  Turn off irrigation systems.");
    schedule.push("  Irrigation delayed until rain stops.");
    
  } else if (waterNeeded <= 0.5) {
    advice.push("  NO IRRIGATION NEEDED. Rainfall sufficient.");
    schedule.push("  Next irrigation: when soil dries (2-4 days)");
    
  } else if (waterNeeded <= 2) {
    advice.push("  MINIMAL IRRIGATION NEEDED.");
    advice.push(`  Apply ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push(`  Irrigation amount: ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push("  Duration: 30-45 minutes (drip)");
    schedule.push("  Best time: 5-7 AM");
    
  } else if (waterNeeded <= 4) {
    advice.push("  MODERATE IRRIGATION NEEDED.");
    advice.push(`  Apply ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push(`  Irrigation amount: ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push("  Duration: 1-2 hours (drip)");
    schedule.push("  Best time: 5-7 AM or 6-8 PM");
    
  } else if (waterNeeded <= 6) {
    advice.push("  SIGNIFICANT IRRIGATION NEEDED.");
    advice.push(`  Apply ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push(`  Irrigation amount: ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push("  Duration: 2-3 hours (drip)");
    schedule.push("  Split into 2 applications: morning and evening");
    schedule.push("  Monitor for plant stress in afternoon");
    
  } else {
    advice.push("  HIGH IRRIGATION NEEDED. Water stress risk.");
    advice.push(`  Apply ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push(`  Irrigation amount: ${Math.round(waterNeeded * 10) / 10}mm`);
    schedule.push("  Duration: 3-4 hours (drip)");
    schedule.push("  Apply in 3 applications: early morning, midday, evening");
    warnings.push("HIGH WATER STRESS: Irrigate immediately");
  }
  
  // Special conditions
  if (wind > 20) {
    advice.push("  WINDY: Sprinkler irrigation inefficient.");
    advice.push("  Use drip irrigation to prevent water loss.");
    advice.push("  Wind drift can waste 30-50% of water.");
  }
  
  if (temp > 32) {
    advice.push("  HOT: Increase irrigation by 20-30%.");
    advice.push("  Plants lose more water in high temperatures.");
    schedule.push("  Add 1 extra irrigation session in afternoon.");
  }
  
  if (condition === 'clear' && temp > 25) {
    advice.push("  SUNNY AND WARM: Increased water demand.");
    advice.push("  Plants need 20-30% more water.");
  }
  
  if (humidity < 30) {
    advice.push("  LOW HUMIDITY: Water evaporates quickly.");
    advice.push("  Apply in early morning for best absorption.");
  }
  
  schedule.push("");
  schedule.push("IRRIGATION EFFICIENCY TIPS:");
  schedule.push("  - Water deeply and infrequently for deep root growth");
  schedule.push("  - Water at soil level, not leaves (prevents disease)");
  schedule.push("  - Use mulch to reduce evaporation 25-50%");
  schedule.push("  - Adjust schedule based on plant growth stage");
  schedule.push("  - Monitor soil moisture with tensiometer or hand-feel");
  
  return { advice, schedule, waterNeeded: Math.round(waterNeeded * 10) / 10 };
}

// ============================================================================
// ENHANCED FERTILIZER TIMING CALCULATOR
// ============================================================================

function getFertilizerAdvice(data, fertilizerType = 'general') {
  const { temp, humidity, wind, condition, precipitation, precipitationProbability } = data;
  const advice = [];
  const warnings = [];
  let recommendation = '';
  
  advice.push("FERTILIZER APPLICATION ADVICE:");
  
  // Wind condition
  if (wind > 25) {
    warnings.push("WIND TOO HIGH: Fertilizer drift risk");
    advice.push("  Wind over 25km/h: DO NOT apply liquid fertilizer.");
    advice.push("  Granular: possible but drift is still a concern.");
    recommendation = 'Delay until wind < 20km/h';
    
  } else if (wind > 15) {
    advice.push("  WINDY: Reduce spray height and use nozzles for low drift.");
    advice.push("  Apply close to ground (30-50cm above crop).");
    advice.push("  Use drift-reducing nozzles.");
    
  } else if (wind < 5) {
    advice.push("  CALM: Excellent conditions for spraying.");
    advice.push("  No drift risk. Maximum coverage.");
  }
  
  // Rain condition
  if (condition === 'rain' || condition === 'thunderstorm') {
    warnings.push("RAINING: Nitrogen fertilizer will leach");
    advice.push("  Rain currently: DO NOT APPLY fertilizer.");
    advice.push("  Urea requires incorporation within 24 hours.");
    advice.push("  Liquid fertilizer will wash off leaves.");
    recommendation = 'Wait for rain to stop + 24 hours';
    
  } else if (precipitationProbability > 60) {
    warnings.push("RAIN FORECAST: High risk of loss");
    advice.push(`  ${Math.round(precipitationProbability)}% chance of rain.`);
    advice.push("  If applying urea: incorporate into soil immediately.");
    advice.push("  Consider applying after rain when soil is moist.");
    
  } else if (precipitationProbability > 30) {
    advice.push(`  ${Math.round(precipitationProbability)}% chance of rain.`);
    advice.push("  Apply early morning to allow absorption before potential rain.");
    advice.push("  Consider split application to reduce risk.");
  }
  
  // Temperature conditions
  if (temp > 35) {
    warnings.push("HIGH TEMPERATURE: Nitrogen volatilization risk");
    advice.push("  Urea and ammonium fertilizers volatilize in high heat.");
    advice.push("  Apply early morning (5-7 AM) or late evening.");
    advice.push("  Incorporate into soil or use inhibitors.");
    
  } else if (temp > 30) {
    advice.push("  WARM: Apply in early morning to reduce losses.");
    advice.push("  Nitrate fertilizers preferred in high temperatures.");
    
  } else if (temp < 5) {
    warnings.push("COLD: Fertilizer uptake reduced");
    advice.push("  Plants not actively growing below 5°C.");
    advice.push("  Nutrients may not be absorbed effectively.");
    advice.push("  Consider foliar application for quick response.");
  }
  
  // Humidity considerations
  if (humidity > 80 && wind < 10) {
    advice.push("  HIGH HUMIDITY: Good for foliar uptake.");
    advice.push("  Leaves stay wet longer = better absorption.");
    advice.push("  BUT increased risk of disease. Apply early morning.");
    
  } else if (humidity < 30 && temp > 25) {
    advice.push("  LOW HUMIDITY: Spray droplet evaporation.");
    advice.push("  Apply early morning or use drop nozzles.");
    advice.push("  Consider adding surfactant to improve wetting.");
  }
  
  // Fertilizer type specific
  if (fertilizerType === 'urea') {
    advice.push("");
    advice.push("UREA SPECIFIC ADVICE:");
    if (humidity > 60 && !condition.includes('rain')) {
      advice.push("  Ideal for urea. Moisture helps incorporation.");
    }
    advice.push("  Incorporate within 24-48 hours of application.");
    advice.push("  Use urease inhibitor if incorporation is delayed.");
    
  } else if (fertilizerType === 'nitrogen') {
    advice.push("");
    advice.push("NITROGEN SPECIFIC ADVICE:");
    advice.push("  Split applications reduce leaching losses.");
    advice.push("  Apply 30-50% at planting, rest during growing season.");
    advice.push("  Use slow-release formulations for sandy soils.");
    
  } else if (fertilizerType === 'manure') {
    advice.push("");
    advice.push("MANURE APPLICATION ADVICE:");
    if (condition === 'rain' || condition === 'thunderstorm') {
      warnings.push("DO NOT APPLY MANURE IN RAIN");
      advice.push("  Nutrient runoff risk. Contamination of water bodies.");
    }
    advice.push("  Incorporate into soil within 24 hours.");
    advice.push("  Avoid application on frozen or snow-covered ground.");
    advice.push("  Maintain buffer zones near water sources.");
  }
  
  // Recommendations
  if (recommendation) {
    advice.push("");
    advice.push(`  RECOMMENDATION: ${recommendation}`);
  } else {
    advice.push("");
    advice.push("  RECOMMENDATION: Apply fertilizer today.");
    advice.push("  Best time: 6-8 AM for best results.");
    advice.push("  Follow crop-specific rates and timing.");
  }
  
  return { advice, warnings, recommendation };
}

// ============================================================================
// ENHANCED POST-HARVEST WEATHER ADVICE
// ============================================================================

function getPostHarvestAdvice(data, cropType = 'general') {
  const { temp, humidity, wind, condition, precipitation } = data;
  const advice = [];
  const warnings = [];
  
  advice.push("POST-HARVEST WEATHER ADVICE:");
  
  const isRaining = condition === 'rain' || condition === 'thunderstorm' || condition === 'drizzle';
  const isHumid = humidity > 70;
  const isDry = humidity < 40;
  const isHot = temp > 30;
  const isCold = temp < 10;
  const isWindy = wind > 20;
  
  // Drying conditions
  if (isRaining) {
    warnings.push("RAIN: Drying impossible. Protect stored crops.");
    advice.push("  Do NOT leave harvested crops in field.");
    advice.push("  Store immediately in covered area.");
    advice.push("  Use fans to circulate air in storage.");
    
  } else if (isHumid) {
    warnings.push("HIGH HUMIDITY: Slow drying. Mold risk.");
    advice.push(`  ${Math.round(humidity)}% humidity - drying will be slow.`);
    advice.push("  Spread crops thinly for better airflow.");
    advice.push("  Use fans to speed drying.");
    advice.push("  Monitor for mold development.");
    
  } else if (isDry && isHot) {
    advice.push("  EXCELLENT DRYING CONDITIONS.");
    advice.push("  Hot and dry - ideal for grain and hay drying.");
    advice.push("  Harvest at 18-20% moisture for optimal drying.");
    advice.push("  Spread thinly and turn regularly.");
    
  } else if (isDry) {
    advice.push("  GOOD DRYING CONDITIONS.");
    advice.push(`  ${Math.round(humidity)}% humidity - good drying weather.`);
    advice.push("  Continue drying process. Monitor moisture levels.");
    
  } else {
    advice.push("  MODERATE DRYING CONDITIONS.");
    advice.push("  Drying possible but will take longer.");
    advice.push("  Use fans to assist airflow.");
    advice.push("  Monitor for spoilage.");
  }
  
  // Wind effects
  if (isWindy) {
    advice.push("  WINDY: Good for natural drying of hay.");
    advice.push("  Turn windrows frequently for even drying.");
    advice.push("  Secure loose materials. Avoid drying light seeds in wind.");
  }
  
  // Storage advice
  advice.push("");
  advice.push("STORAGE RECOMMENDATIONS:");
  
  if (cropType === 'grain' || cropType === 'corn' || cropType === 'sorghum') {
    advice.push("  Grain Crops:");
    advice.push(`  - Target moisture: 12-14% for safe storage`);
    if (isHumid) {
      advice.push("  - HIGH HUMIDITY: Use artificial drying if moisture >14%");
    }
    advice.push("  - Store in clean, dry bins with proper aeration");
    advice.push("  - Monitor temperature and moisture weekly");
    
  } else if (cropType === 'root_crops' || cropType === 'cassava' || cropType === 'yam' || cropType === 'potato') {
    advice.push("  Root Crops:");
    advice.push("  - Cure at 85-90% humidity, 27-30°C for 5-10 days");
    advice.push("  - Store in cool (12-15°C), dark, well-ventilated area");
    advice.push("  - Do not wash before storage (increases rot)");
    if (isHot) {
      advice.push("  - WARM: Provide additional ventilation to prevent heat build-up");
    }
    
  } else if (cropType === 'vegetables' || cropType === 'tomatoes' || cropType === 'peppers' || cropType === 'okra') {
    advice.push("  Vegetables:");
    advice.push("  - Harvest early morning for best quality");
    advice.push("  - Cool quickly after harvest (remove field heat)");
    advice.push("  - Store at 5-10°C for most vegetables");
    advice.push("  - High humidity storage (90-95%) prevents wilting");
    
  } else {
    advice.push("  General Storage:");
    advice.push("  - Dry to safe moisture level before storage");
    advice.push("  - Clean storage area to prevent pest infestation");
    advice.push("  - Use proper containers to prevent damage");
    advice.push("  - Monitor regularly for spoilage or pests");
  }
  
  // Food safety
  advice.push("");
  advice.push("FOOD SAFETY:");
  if (isHot && isHumid) {
    warnings.push("HOT + HUMID: High risk of mycotoxin development");
    advice.push("  Aflatoxin risk increases in hot, humid conditions.");
    advice.push("  Dry to <13% moisture immediately.");
    advice.push("  Test grain for aflatoxin before consumption.");
  }
  
  return { advice, warnings };
}

// ============================================================================
// ENHANCED LIVESTOCK & POULTRY ADVICE
// ============================================================================

function getLivestockAdvice(data, animalType = 'general') {
  const { temp, humidity, wind, condition, tempMax, tempMin, heatIndex } = data;
  const advice = [];
  const warnings = [];
  
  advice.push("LIVESTOCK AND POULTRY ASSESSMENT:");
  
  const effectiveTemp = temp > 27 ? calcHeatIndex(temp, humidity) : temp;
  const isExtremeHeat = effectiveTemp > 38 || temp > 38;
  const isHighHeat = effectiveTemp > 35 || temp > 35;
  const isModerateHeat = effectiveTemp > 30 || temp > 30;
  const isExtremeCold = temp < -5 || windChill < -10;
  const isHighCold = temp < 0 || windChill < -5;
  const isModerateCold = temp < 5 || windChill < 0;
  
  // Heat stress
  if (isExtremeHeat) {
    warnings.push("EXTREME HEAT STRESS: Animal emergency");
    advice.push(`  Effective temp ${Math.round(effectiveTemp)}°C - LIFE THREATENING`);
    advice.push("  ACTION REQUIRED:");
    advice.push("  - Provide unlimited shade and ventilation");
    advice.push("  - Mist animals with water repeatedly");
    advice.push("  - Provide electrolytes in drinking water");
    advice.push("  - Reduce stocking density by 30-40%");
    advice.push("  - Monitor for signs: panting, drooling, lethargy");
    advice.push("  - Emergency: call veterinarian if symptoms appear");
    
  } else if (isHighHeat) {
    warnings.push("HIGH HEAT STRESS: Livestock at risk");
    advice.push(`  Effective temp ${Math.round(effectiveTemp)}°C`);
    advice.push("  Provide extra shade, ventilation, and water.");
    advice.push("  Water consumption doubles in high heat.");
    advice.push("  Feed in early morning and late evening.");
    advice.push("  Avoid handling or transportation during peak heat.");
    
  } else if (isModerateHeat) {
    advice.push(`  ${Math.round(temp)}°C - Moderate heat. Monitor animals.`);
    advice.push("  Ensure water is available at all times.");
    advice.push("  Provide shade during midday.");
    advice.push("  Poultry: reduce stocking density if possible.");
  }
  
  // Cold stress
  if (isExtremeCold) {
    warnings.push("EXTREME COLD STRESS: Animal emergency");
    advice.push(`  Temp ${Math.round(temp)}°C - LIFE THREATENING`);
    advice.push("  ACTION REQUIRED:");
    advice.push("  - Provide enclosed shelter with bedding");
    advice.push("  - Increase feed by 20-30% (animals burn energy to stay warm)");
    advice.push("  - Provide warm water (ice-free)");
    advice.push("  - Check for frostbite on ears, tail, udder");
    advice.push("  - Newborn animals: immediate warming required");
    
  } else if (isHighCold) {
    warnings.push("COLD STRESS: Livestock need shelter");
    advice.push(`  Temp ${Math.round(temp)}°C`);
    advice.push("  Provide windbreaks and dry bedding.");
    advice.push("  Increase feed to maintain body condition.");
    advice.push("  Check water sources - prevent freezing.");
    
  } else if (isModerateCold) {
    advice.push(`  ${Math.round(temp)}°C - Cool. Provide shelter from wind.`);
    advice.push("  Ensure bedding is dry.");
    advice.push("  Monitor young and elderly animals.");
  }
  
  // Animal type specific
  if (animalType === 'poultry' || animalType === 'chicken') {
    advice.push("");
    advice.push("POULTRY SPECIFIC ADVICE:");
    if (isHighHeat || isExtremeHeat) {
      advice.push("  Poultry are very sensitive to heat stress.");
      advice.push("  Provide misters in chicken houses.");
      advice.push("  Reduce feeding during heat (use nighttime feeding).");
      advice.push("  Ensure at least 2.5cm drinking space per bird.");
      advice.push("  Egg production may decrease in heat - this is normal.");
    }
    if (isHighCold || isExtremeCold) {
      advice.push("  Prevent frostbite on combs and wattles.");
      advice.push("  Use petroleum jelly on combs in severe cold.");
      advice.push("  Ventilation is still needed - don't seal completely.");
    }
    
  } else if (animalType === 'cattle' || animalType === 'cow') {
    advice.push("");
    advice.push("CATTLE SPECIFIC ADVICE:");
    if (isHighHeat || isExtremeHeat) {
      advice.push("  Dairy cows reduce milk production in heat.");
      advice.push("  Provide misters in holding areas.");
      advice.push("  Feed in cooler evening hours.");
      advice.push("  Shade reduces heat stress 30-50%.");
    }
    if (isHighCold || isExtremeCold) {
      advice.push("  Cattle need windbreaks and dry bedding.");
      advice.push("  Increase feed - energy needs double in severe cold.");
      advice.push("  Calves most vulnerable - provide heated water if possible.");
    }
    
  } else if (animalType === 'goat' || animalType === 'sheep') {
    advice.push("");
    advice.push("GOAT AND SHEEP SPECIFIC ADVICE:");
    if (isHighHeat || isExtremeHeat) {
      advice.push("  Provide shade - goats seek shade in heat.");
      advice.push("  Water consumption triples in hot weather.");
      advice.push("  Parasite risk increases in warm, humid conditions.");
    }
    if (isHighCold || isExtremeCold) {
      advice.push("  Provide dry, draft-free shelter.");
      advice.push("  Shearing should be done in warmer months only.");
      advice.push("  Kids and lambs most vulnerable to cold.");
    }
  }
  
  // General water advice
  advice.push("");
  advice.push("WATER REQUIREMENTS:");
  if (isHighHeat || isExtremeHeat) {
    advice.push("  Water consumption doubles in heat.");
    advice.push("  Provide 1.5-2x normal water.");
    advice.push("  Check water sources multiple times daily.");
  } else if (isHighCold || isExtremeCold) {
    advice.push("  Prevent water from freezing.");
    advice.push("  Provide warm water if possible.");
    advice.push("  Animals drink less in cold - monitor for dehydration.");
  } else {
    advice.push("  Normal water consumption expected.");
    advice.push("  Clean water available at all times.");
  }
  
  return { advice, warnings };
}

// ============================================================================
// MAIN FARMING ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getFarmingAdvice = async (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, tempMax, tempMin, humidity, wind, condition, 
    conditionCode, uvIndex, visibility, city, lat, lon,
    precipitation, precipitationProbability, sunrise, sunset,
    windGust
  } = data;
  
  const q = question?.toLowerCase() || '';
  
  // Get derived data
  const season = getSeason();
  const moonPhase = await getMoonPhase(lat, lon);
  const moonIllumination = getMoonIllumination(moonPhase);
  const moonPhaseName = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                         'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
                         [Math.round(moonPhase * 7) % 8] || 'New Moon';
  
  const dewPoint = calcDewPoint(temp, humidity);
  const gdd = calcGrowingDegreeDays(tempMax, tempMin, 10);
  const et = calcEvapotranspiration(temp, humidity, wind);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  const comfort = getComfortScore({ temp, humidity, wind });
  const cloudCover = getCloudCover(conditionCode);
  const uvLevel = getUVLevel(uvIndex);
  const pollenIndex = getPollenIndex(season, temp, humidity, wind);
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp;
  
  // Detect crop type from question
  let detectedCrop = null;
  Object.keys(CROP_DATABASE).forEach(cropKey => {
    if (q.includes(cropKey) || q.includes(CROP_DATABASE[cropKey].name.toLowerCase())) {
      detectedCrop = cropKey;
    }
  });
  
  // Get all advice modules
  const soil = getSoilCondition(data);
  const irrigation = getIrrigationSchedule(data, detectedCrop);
  const fertilizer = getFertilizerAdvice(data, 
    q.includes('urea') ? 'urea' : 
    q.includes('manure') ? 'manure' : 
    q.includes('nitrogen') ? 'nitrogen' : 'general'
  );
  const postHarvest = getPostHarvestAdvice(data, 
    q.includes('grain') || q.includes('corn') || q.includes('sorghum') ? 'grain' :
    q.includes('cassava') || q.includes('yam') || q.includes('potato') ? 'root_crops' :
    q.includes('tomato') || q.includes('pepper') || q.includes('okra') ? 'vegetables' : 'general'
  );
  const livestock = getLivestockAdvice(data,
    q.includes('chicken') || q.includes('poultry') ? 'poultry' :
    q.includes('cow') || q.includes('cattle') ? 'cattle' :
    q.includes('goat') || q.includes('sheep') ? 'goat' : 'general'
  );
  
  // Determine field workability
  const isGoodFieldDay = !isRaining && wind < 25 && temp > 10 && temp < 35 && humidity < 85;
  const isIdealFieldDay = !isRaining && wind < 15 && temp > 15 && temp < 30 && humidity > 40 && humidity < 75;
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "FARMING WEATHER REPORT",
    "AGRICULTURAL WEATHER ADVISORY",
    "CROP WEATHER ASSESSMENT",
    "FARM OPERATIONS FORECAST",
    "FIELD CONDITIONS REPORT"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  response += `  Humidity: ${Math.round(humidity)}% (${humidity > 80 ? 'HIGH' : humidity > 60 ? 'MODERATE' : 'LOW'})\n`;
  response += `  Wind: ${Math.round(wind)} km/h (gusts to ${Math.round(windGust || wind + 5)} km/h)\n`;
  response += `  Cloud cover: ${Math.round(cloudCover)}%\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel})\n`;
  response += `  Dew Point: ${Math.round(dewPoint)}°C\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm today\n`;
  if (precipitationProbability > 0) response += `  Rain chance: ${Math.round(precipitationProbability)}%\n`;
  response += `  Growing Degree Days: ${gdd} (base 10°C)\n`;
  response += `  Evapotranspiration: ${Math.round(et * 10) / 10}mm/day\n`;
  response += `  Season: ${season.charAt(0).toUpperCase() + season.slice(1)}\n`;
  response += `  Moon Phase: ${moonPhaseName} (${Math.round(moonIllumination)}% illuminated)\n`;
  response += `\n`;
  
  // Soil conditions
  response += `=== SOIL CONDITIONS ===\n`;
  soil.advice.forEach(line => response += `${line}\n`);
  soil.warnings.forEach(w => response += `  ${w}\n`);
  response += `\n`;
  
  // Irrigation
  response += `=== IRRIGATION SCHEDULE ===\n`;
  irrigation.advice.forEach(line => response += `${line}\n`);
  irrigation.schedule.forEach(line => response += `${line}\n`);
  response += `\n`;
  
  // Field workability
  response += `=== FIELD WORKABILITY ===\n`;
  if (isStorm) {
    response += `  STOP FIELD WORK: Thunderstorm conditions.\n`;
    response += `  Lightning risk. Seek shelter immediately.\n`;
  } else if (isRaining) {
    response += `  RAIN: Field work not possible today.\n`;
    response += `  Focus on indoor tasks and equipment maintenance.\n`;
  } else if (isIdealFieldDay) {
    response += `  EXCELLENT CONDITIONS: Ideal for all field operations.\n`;
    response += `  Planting, spraying, harvesting, and tillage all recommended.\n`;
    response += `  Make the most of this weather window.\n`;
  } else if (isGoodFieldDay) {
    response += `  GOOD CONDITIONS: Field work possible with precautions.\n`;
    if (wind > 15) response += `  Wind moderate - avoid spraying in high wind areas.\n`;
    if (temp > 30) response += `  Heat - work early morning and late evening.\n`;
    if (humidity > 80) response += `  High humidity - disease risk, consider fungicide.\n`;
  } else if (wind > 25) {
    response += `  TOO WINDY: Avoid field work.\n`;
    response += `  Spraying impossible. Tilling creates dust.\n`;
  } else if (temp > 35) {
    response += `  TOO HOT: Limit field work to early morning and evening.\n`;
    response += `  Heat stress on crops and workers.\n`;
  } else if (temp < 5) {
    response += `  TOO COLD: Minimal field work.\n`;
    response += `  Soil too cold for most operations.\n`;
  } else {
    response += `  MARGINAL CONDITIONS: Work with caution.\n`;
    response += `  Check specific tasks for suitability.\n`;
  }
  response += `\n`;
  
  // Crop-specific advice
  if (detectedCrop) {
    const crop = CROP_DATABASE[detectedCrop];
    if (crop) {
      response += `=== ${crop.name.toUpperCase()} SPECIFIC ADVICE ===\n`;
      const isInRange = temp >= crop.tempMin && temp <= crop.tempMax;
      const isOptimal = temp >= crop.idealTemp - 3 && temp <= crop.idealTemp + 3;
      
      if (isOptimal) {
        response += `  PERFECT TEMPERATURE: ${Math.round(temp)}°C (ideal ${crop.idealTemp}°C)\n`;
      } else if (isInRange) {
        response += `  ACCEPTABLE TEMPERATURE: ${Math.round(temp)}°C (range ${crop.tempMin}-${crop.tempMax}°C)\n`;
      } else if (temp < crop.tempMin) {
        response += `  TOO COLD: ${Math.round(temp)}°C (minimum ${crop.tempMin}°C)\n`;
        response += `  ${crop.frostTolerance === 'None' ? 'NO frost tolerance - PROTECT IMMEDIATELY!' : 'Moderate frost tolerance - monitor closely.'}\n`;
      } else if (temp > crop.tempMax) {
        response += `  TOO HOT: ${Math.round(temp)}°C (maximum ${crop.tempMax}°C)\n`;
        response += `  Heat stress risk. Provide shade and irrigation.\n`;
      }
      
      response += `\n  CROP DETAILS:\n`;
      response += `    Water need: ${crop.waterNeed}\n`;
      response += `    Days to maturity: ${crop.daysToMaturity} days\n`;
      response += `    Planting depth: ${crop.plantingDepth}\n`;
      response += `    Spacing: ${crop.spacing}\n`;
      response += `  Notes: ${crop.notes}\n`;
      response += `\n`;
    }
  } else {
    // Show recommended crops for current conditions
    response += `=== RECOMMENDED CROPS FOR CURRENT CONDITIONS ===\n`;
    const suitableCrops = [];
    Object.keys(CROP_DATABASE).forEach(cropKey => {
      const crop = CROP_DATABASE[cropKey];
      if (temp >= crop.tempMin && temp <= crop.tempMax) {
        suitableCrops.push(cropKey);
      }
    });
    
    if (suitableCrops.length > 0) {
      response += `  Crops suitable for ${Math.round(temp)}°C:\n`;
      suitableCrops.slice(0, 8).forEach(cropKey => {
        const crop = CROP_DATABASE[cropKey];
        const isOptimal = temp >= crop.idealTemp - 3 && temp <= crop.idealTemp + 3;
        response += `    ${isOptimal ? 'OPTIMAL' : 'SUITABLE'}: ${crop.name} (${crop.idealTemp}°C ideal)\n`;
      });
      if (suitableCrops.length > 8) {
        response += `    ... and ${suitableCrops.length - 8} more crops\n`;
      }
    } else {
      response += `  No common crops suitable for current temperature.\n`;
      response += `  Consider greenhouse or protected cultivation.\n`;
    }
    response += `\n`;
  }
  
  // Pest and disease
  response += `=== PEST AND DISEASE RISK ===\n`;
  let hasPestRisk = false;
  
  Object.keys(PEST_DISEASE_DATABASE).forEach(pestKey => {
    const pest = PEST_DISEASE_DATABASE[pestKey];
    const conditions = pest.conditions;
    
    let riskScore = 0;
    if (conditions.tempMin && temp >= conditions.tempMin) riskScore += 1;
    if (conditions.tempMax && temp <= conditions.tempMax) riskScore += 1;
    if (conditions.humidity && humidity >= conditions.humidity) riskScore += 1;
    
    if (riskScore >= 2) {
      hasPestRisk = true;
      const severityLabel = pest.severity === 'Very High' ? 'CRITICAL' : 
                           pest.severity === 'High' ? 'HIGH' : 'MODERATE';
      response += `  ${severityLabel} RISK: ${pest.name}\n`;
      response += `    ${pest.notes}\n`;
      response += `    Affects: ${pest.crops.join(', ')}\n`;
      response += `    Treatment: ${pest.treatment}\n`;
    }
  });
  
  if (!hasPestRisk) {
    response += `  LOW pest and disease pressure currently.\n`;
    response += `  Continue regular monitoring. Early detection is key.\n`;
  }
  response += `\n`;
  
  // Fertilizer
  response += `=== FERTILIZER APPLICATION ===\n`;
  fertilizer.advice.forEach(line => response += `${line}\n`);
  fertilizer.warnings.forEach(w => response += `  ${w}\n`);
  if (fertilizer.recommendation) {
    response += `  Recommendation: ${fertilizer.recommendation}\n`;
  }
  response += `\n`;
  
  // Post-harvest (if relevant)
  if (q.includes('harvest') || q.includes('drying') || q.includes('store') || q.includes('grain')) {
    response += `=== POST-HARVEST ===\n`;
    postHarvest.advice.forEach(line => response += `${line}\n`);
    postHarvest.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Livestock (if relevant)
  if (q.includes('livestock') || q.includes('animal') || q.includes('poultry') || 
      q.includes('cow') || q.includes('chicken') || q.includes('goat') || 
      q.includes('sheep') || q.includes('cattle')) {
    response += `=== LIVESTOCK AND POULTRY ===\n`;
    livestock.advice.forEach(line => response += `${line}\n`);
    livestock.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Daily work plan
  response += `=== RECOMMENDED DAILY WORK PLAN ===\n`;
  
  if (isStorm) {
    response += `  EMERGENCY: Stop all outdoor work. Seek shelter.\n`;
    response += `  Secure loose equipment. Check livestock shelters.\n`;
  } else if (isRaining) {
    response += `  RAIN DAY: Focus on indoor work.\n`;
    response += `  - Equipment maintenance and repairs\n`;
    response += `  - Record keeping and planning\n`;
    response += `  - Inspect drainage systems\n`;
    response += `  - Check stored crops for moisture\n`;
    response += `  - Plan for when rain stops\n`;
  } else if (isIdealFieldDay) {
    response += `  EXCELLENT FIELD DAY:\n`;
    response += `  - MORNING: Planting, transplanting (5-9 AM)\n`;
    response += `  - MIDDAY: Soil preparation, weed control (9 AM - 12 PM)\n`;
    response += `  - AFTERNOON: Harvesting, spraying (2-5 PM)\n`;
    response += `  - EVENING: Irrigation, equipment prep (5-7 PM)\n`;
  } else if (isGoodFieldDay) {
    response += `  GOOD FIELD DAY WITH PRECAUTIONS:\n`;
    if (temp > 30) {
      response += `  - Work 5-9 AM and 4-7 PM only\n`;
      response += `  - Take shade breaks every hour\n`;
      response += `  - Hydrate frequently\n`;
    } else if (wind > 15) {
      response += `  - Avoid spraying until wind calms\n`;
      response += `  - Secure loose objects\n`;
    } else {
      response += `  - All operations possible with normal precautions\n`;
    }
  } else {
    response += `  LIMITED FIELD DAY:\n`;
    response += `  - Do only essential outdoor work\n`;
    response += `  - Focus on maintenance and planning\n`;
    response += `  - Monitor conditions for improvement\n`;
  }
  response += `\n`;
  
  // Alerts and warnings
  response += `=== ALERTS AND WARNINGS ===\n`;
  let hasWarnings = false;
  
  // Frost warning
  if (tempMin <= 2) {
    response += `  FROST RISK: Low ${Math.round(tempMin)}°C tonight\n`;
    response += `  - Cover tender crops immediately\n`;
    response += `  - Protect young seedlings\n`;
    response += `  - Harvest mature crops before frost\n`;
    response += `  - Use row covers or frost cloth\n`;
    hasWarnings = true;
  }
  
  // Heat warning
  if (tempMax > 35) {
    response += `  EXTREME HEAT: High ${Math.round(tempMax)}°C\n`;
    response += `  - Heat stress for crops and livestock\n`;
    response += `  - Increase irrigation by 30%\n`;
    response += `  - Provide shade where possible\n`;
    response += `  - Work early morning and evening only\n`;
    hasWarnings = true;
  }
  
  // Heavy rain warning
  if (precipitation && precipitation > 30) {
    response += `  HEAVY RAIN: ${Math.round(precipitation)}mm expected\n`;
    response += `  - Risk of waterlogging\n`;
    response += `  - Check drainage systems\n`;
    response += `  - Delay fertilizer application\n`;
    response += `  - Protect stored crops from moisture\n`;
    hasWarnings = true;
  }
  
  // Wind warning
  if (wind > 30) {
    response += `  STRONG WINDS: ${Math.round(wind)} km/h\n`;
    response += `  - Secure loose objects\n`;
    response += `  - Support tall crops\n`;
    response += `  - Avoid spraying\n`;
    response += `  - Check for wind damage after\n`;
    hasWarnings = true;
  }
  
  // Disease warning
  if (humidity > 85 && temp > 18) {
    response += `  HIGH DISEASE RISK: ${Math.round(humidity)}% humidity\n`;
    response += `  - Fungal diseases likely\n`;
    response += `  - Apply preventative fungicide\n`;
    response += `  - Improve airflow in crops\n`;
    response += `  - Avoid overhead irrigation\n`;
    hasWarnings = true;
  }
  
  if (!hasWarnings) {
    response += `  No significant warnings.\n`;
    response += `  Continue normal farm operations.\n`;
  }
  response += `\n`;
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (isStorm) {
    response += `  STOP ALL WORK. Thunderstorm conditions.\n`;
    response += `  Safety first. Resume when storm passes.\n`;
  } else if (isIdealFieldDay && !hasWarnings) {
    response += `  EXCELLENT FARMING CONDITIONS.\n`;
    response += `  Perfect weather for all field operations.\n`;
    response += `  Make the most of this weather window.\n`;
  } else if (isGoodFieldDay) {
    response += `  GOOD CONDITIONS with some precautions.\n`;
    response += `  Most operations can proceed safely.\n`;
    response += `  Follow specific warnings above.\n`;
  } else {
    response += `  POOR CONDITIONS for field work.\n`;
    response += `  Focus on indoor and protective activities.\n`;
    response += `  Monitor for improving conditions.\n`;
  }
  
  const wisdom = [
    "Farming is patience. Weather is the teacher.",
    "A good farmer plants seeds. A great farmer plants knowledge.",
    "The best fertilizer is the farmer's shadow.",
    "Farming looks easy when the weather cooperates.",
    "Water is the lifeblood of agriculture.",
    "The farmer's work feeds the world.",
    "Nature is the master farmer. We are just assistants.",
    "Good farming is about working with nature, not against it."
  ];
  response += `\n--- WISDOM ---\n${random(wisdom)}`;
  
  return response;
};

// ============================================================================
// EXPORTS
// ============================================================================

export const getCropDatabase = () => CROP_DATABASE;
export const getPestDiseaseDatabase = () => PEST_DISEASE_DATABASE;
export const getSoilConditionData = getSoilCondition;
export const getIrrigationScheduleData = getIrrigationSchedule;
export const getFertilizerAdviceData = getFertilizerAdvice;
export const getPostHarvestAdviceData = getPostHarvestAdvice;
export const getLivestockAdviceData = getLivestockAdvice;

export default getFarmingAdvice;
