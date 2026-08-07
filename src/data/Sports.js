import {
  calcHeatIndex,
  calcWindChill,
  calcWetBulbGlobeTemp,
  getBurnTime,
  getComfortScore,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getUVLevel,
  getAQICategory,
  calculateDewPoint,
  getAltitudeDensity
} from './calculations';

// ============================================================================
// COMPREHENSIVE SPORTS & ATHLETIC WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
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
  "Should I do yoga outside?",
  "Is the track too icy?",
  "Can I ski today?",
  "Surfing conditions good?",
  "Is it safe for rock climbing?",
  "Can I play volleyball at the beach?",
  "Should I cancel practice tonight?",
  "Is the gym too hot for workout?",
  "Can I do CrossFit outside?",
  "Is it safe for a triathlon?",
  "Should I wear compression in this heat?",
  "Will humidity affect my breathing?",
  "Is the air quality safe for running?",
  "Can I do sprints in this weather?",
  "Should I move training indoors?",
  "Is it too windy for rowing?",
  "Can I do a long run today?",
  "Is the pool safe in this weather?",
  "Should I cancel the tournament?",
  "Can I play pickleball outside?",
  "Is it safe for night running?",
  "Will the heat affect my recovery?",
  "Should I adjust my workout intensity?",
  "Can elderly people exercise outside?",
  "Is it safe for pregnant athletes?",
  "Should I worry about heat stroke?",
  "Can I do altitude training?",
  "Is the UV too high for outdoor sports?",
  "Should I wear a mask during exercise?",
  "Can I play golf in this wind?",
  "Is it too cold for outdoor basketball?",
  "Should I cancel the soccer match?",
  "Can I trail run today?",
  "Is it safe for horseback riding?",
  "Should I cancel PE class?",
  "Can I do boot camp outside?",
  "Is the track safe after rain?",
  "Should I worry about lightning?",
  "Can I kayak in these conditions?",
  "Is it safe for mountain biking?",
  "Should I cancel the charity run?",
  "Can I play tennis on wet courts?",
  "Is it too windy for baseball?",
  "Should I move the game earlier/later?",
  "Can I do stadium stairs today?",
  "Is it safe for parkour?",
  "Should I cancel the sports camp?",
  "Can I rollerblade in this weather?",
  "Is it safe for ice skating outdoors?",
  "Should I cancel the fishing trip?",
  "Can I play ultimate frisbee?",
  "Is it too dusty for sports?",
  "Should I worry about hypothermia?",
  "Can I do a brick workout today?",
  "Is it safe for open water swimming?",
  "Should I cancel the regatta?",
  "Can I play rugby in this weather?",
  "Is it too humid for boxing?",
  "Should I adjust my hydration plan?",
  "Can I do hot yoga outside?",
  "Is it safe for a bike race?",
  "Should I worry about sunburn during game?",
  "Can I play cricket today?",
  "Is it safe for skateboarding?",
  "Should I cancel the 5K?",
  "Can I do a duathlon?",
  "Is it safe for adventure racing?",
  "Should I cancel the sports day?"
];

// ============================================================================
// SPORT-SPECIFIC DATABASE
// ============================================================================

const SPORT_REQUIREMENTS = {
  football_soccer: {
    fieldType: 'grass_or_turf',
    typicalDuration: 90,
    intensity: 'high',
    playersOnField: 22,
    heatSensitivity: 8,
    coldSensitivity: 6,
    windSensitivity: 7,
    rainTolerance: 5,
    lightningRisk: 10,
    equipmentWeight: 'light',
    special: [
      'Slide tackles dangerous on wet/hard ground',
      'Goalkeeper specific: diving conditions affected by ground hardness',
      'Headers affected by wind trajectory',
      'Stud length matters: soft ground vs firm ground cleats'
    ],
    cancellationThresholds: {
      wbgt: 32.3,
      windChill: -15,
      wind: 50,
      lightning: true,
      visibility: 500,
      fieldSaturation: 80
    }
  },
  american_football: {
    fieldType: 'grass_or_turf',
    typicalDuration: 180,
    intensity: 'very_high',
    playersOnField: 22,
    heatSensitivity: 9,
    coldSensitivity: 4,
    windSensitivity: 6,
    rainTolerance: 7,
    lightningRisk: 10,
    equipmentWeight: 'heavy',
    special: [
      'Equipment adds 5-8°C to perceived temperature',
      'Helmets trap heat - 70% body heat lost through head',
      'Shoulder pads restrict cooling',
      'Hydration breaks mandatory above 28°C WBGT'
    ],
    cancellationThresholds: {
      wbgt: 30.1,
      windChill: -12,
      wind: 45,
      lightning: true,
      visibility: 300,
      fieldSaturation: 70
    }
  },
  basketball_outdoor: {
    fieldType: 'asphalt_or_concrete',
    typicalDuration: 48,
    intensity: 'high',
    playersOnField: 10,
    heatSensitivity: 8,
    coldSensitivity: 6,
    windSensitivity: 8,
    rainTolerance: 2,
    lightningRisk: 9,
    equipmentWeight: 'minimal',
    special: [
      'Court surface temp can be 15-25°C above air temp',
      'Ball grip impossible when wet',
      'Wind severely affects shooting accuracy',
      'Asphalt radiated heat increases WBGT by 2-4°C'
    ],
    cancellationThresholds: {
      wbgt: 31.0,
      windChill: -10,
      wind: 35,
      lightning: true,
      visibility: 200,
      courtWet: true
    }
  },
  tennis: {
    fieldType: 'hard_clay_or_grass',
    typicalDuration: 180,
    intensity: 'moderate_high',
    playersOnField: 2,
    heatSensitivity: 7,
    coldSensitivity: 5,
    windSensitivity: 9,
    rainTolerance: 1,
    lightningRisk: 9,
    equipmentWeight: 'minimal',
    special: [
      'Hard courts radiate extreme heat',
      'Clay courts become unplayable when wet',
      'Wind changes ball trajectory dramatically',
      'Serve toss impossible in gusty conditions'
    ],
    cancellationThresholds: {
      wbgt: 32.0,
      windChill: -8,
      wind: 30,
      lightning: true,
      visibility: 300,
      courtWet: true
    }
  },
  running_marathon: {
    fieldType: 'road_or_trail',
    typicalDuration: 240,
    intensity: 'endurance',
    playersOnField: 'mass_start',
    heatSensitivity: 9,
    coldSensitivity: 3,
    windSensitivity: 5,
    rainTolerance: 8,
    lightningRisk: 10,
    equipmentWeight: 'minimal',
    special: [
      'Core temp rises 1°C per 10 minutes at race pace',
      'Dehydration of 2% body weight = 6% performance drop',
      'Black flag conditions: cancel event entirely',
      'Medical tent capacity must match conditions'
    ],
    cancellationThresholds: {
      wbgt: 28.0,
      windChill: -5,
      wind: 40,
      lightning: true,
      visibility: 1000,
      roadFlooding: true
    }
  },
  swimming_outdoor: {
    fieldType: 'pool_or_open_water',
    typicalDuration: 60,
    intensity: 'high',
    playersOnField: 'variable',
    heatSensitivity: 3,
    coldSensitivity: 8,
    windSensitivity: 4,
    rainTolerance: 9,
    lightningRisk: 10,
    equipmentWeight: 'minimal',
    special: [
      'Lightning: pool MUST be evacuated (water conducts)',
      'Open water: currents, waves, temperature stratification',
      'Hypothermia risk below 21°C water temp',
      'Sun reflection off water doubles UV exposure'
    ],
    cancellationThresholds: {
      waterTemp: 16,
      windChill: 0,
      wind: 30,
      lightning: true,
      visibility: 200,
      waves: 1.5
    }
  },
  cycling: {
    fieldType: 'road_or_trail',
    typicalDuration: 240,
    intensity: 'endurance',
    playersOnField: 'variable',
    heatSensitivity: 6,
    coldSensitivity: 7,
    windSensitivity: 10,
    rainTolerance: 4,
    lightningRisk: 8,
    equipmentWeight: 'light',
    special: [
      'Wind chill at speed: 40km/h riding = 15km/h wind + 25km/h apparent wind',
      'Wet roads = 40% less braking power',
      'Crosswinds dangerous above 35km/h',
      'Descending in cold = extreme wind chill'
    ],
    cancellationThresholds: {
      wbgt: 30.0,
      windChill: -10,
      wind: 45,
      lightning: true,
      visibility: 500,
      roadIce: true
    }
  },
  golf: {
    fieldType: 'grass',
    typicalDuration: 240,
    intensity: 'low_moderate',
    playersOnField: 'variable',
    heatSensitivity: 5,
    coldSensitivity: 5,
    windSensitivity: 9,
    rainTolerance: 3,
    lightningRisk: 10,
    equipmentWeight: 'clubs_and_cart',
    special: [
      'Lightning: golf courses are open fields (worst place)',
      'Wind: every 10km/h = 1 club difference',
      'Greens: unplayable when waterlogged',
      'Metal clubs = lightning conductors'
    ],
    cancellationThresholds: {
      wbgt: 33.0,
      windChill: -8,
      wind: 40,
      lightning: true,
      visibility: 400,
      courseFlooding: true
    }
  },
  baseball_softball: {
    fieldType: 'grass_and_dirt',
    typicalDuration: 180,
    intensity: 'moderate',
    playersOnField: 18,
    heatSensitivity: 6,
    coldSensitivity: 6,
    windSensitivity: 7,
    rainTolerance: 3,
    lightningRisk: 10,
    equipmentWeight: 'moderate',
    special: [
      "Infield becomes mud pit when wet",
      "Wind: fly balls unpredictable",
      "Batter's box: extreme sun exposure",
      "Catcher's gear: heat trap, highest heat stroke risk"
    ],
    cancellationThresholds: {
      wbgt: 31.0,
      windChill: -12,
      wind: 35,
      lightning: true,
      visibility: 400,
      fieldWet: true
    }
  },
  volleyball_beach: {
    fieldType: 'sand',
    typicalDuration: 60,
    intensity: 'high',
    playersOnField: 4,
    heatSensitivity: 8,
    coldSensitivity: 3,
    windSensitivity: 8,
    rainTolerance: 2,
    lightningRisk: 9,
    equipmentWeight: 'minimal',
    special: [
      'Sand temp can exceed 60°C in direct sun',
      'Wind: serves and sets unpredictable',
      'Sand reflects UV, increasing exposure 25%',
      'Bare feet on hot sand = burns in seconds'
    ],
    cancellationThresholds: {
      wbgt: 31.0,
      windChill: 0,
      wind: 30,
      lightning: true,
      visibility: 300,
      sandTemp: 50
    }
  },
  hiking: {
    fieldType: 'trail',
    typicalDuration: 360,
    intensity: 'endurance',
    playersOnField: 'small_group',
    heatSensitivity: 7,
    coldSensitivity: 8,
    windSensitivity: 6,
    rainTolerance: 5,
    lightningRisk: 9,
    equipmentWeight: 'backpack',
    special: [
      'Temperature drops 6.5°C per 1000m elevation',
      'Exposure: above treeline = no shelter from elements',
      'Stream crossings dangerous after heavy rain',
      'Navigation impossible in fog/whiteout'
    ],
    cancellationThresholds: {
      wbgt: 30.0,
      windChill: -15,
      wind: 50,
      lightning: true,
      visibility: 200,
      avalanche: true
    }
  },
  skiing_snowboarding: {
    fieldType: 'snow',
    typicalDuration: 360,
    intensity: 'high',
    playersOnField: 'variable',
    heatSensitivity: 1,
    coldSensitivity: 9,
    windSensitivity: 8,
    rainTolerance: 2,
    lightningRisk: 7,
    equipmentWeight: 'heavy',
    special: [
      'Wind chill at speed: 60km/h skiing = significant',
      'Whiteout conditions: depth perception lost',
      'Avalanche risk after heavy snow/wind',
      'Frostbite on exposed skin in minutes'
    ],
    cancellationThresholds: {
      wbgt: 'N/A',
      windChill: -30,
      wind: 60,
      lightning: true,
      visibility: 100,
      avalanche: true
    }
  },
  rugby: {
    fieldType: 'grass',
    typicalDuration: 80,
    intensity: 'very_high',
    playersOnField: 30,
    heatSensitivity: 8,
    coldSensitivity: 4,
    windSensitivity: 5,
    rainTolerance: 9,
    lightningRisk: 10,
    equipmentWeight: 'light',
    special: [
      'Tackling on hard/frozen ground = severe injury risk',
      'Scrum collapses increase in wet conditions',
      'Mud adds 5-10kg to jersey weight',
      'Rain improves grip (controversial - scrum advantage)'
    ],
    cancellationThresholds: {
      wbgt: 30.0,
      windChill: -10,
      wind: 45,
      lightning: true,
      visibility: 300,
      fieldFrozen: true
    }
  },
  cricket: {
    fieldType: 'grass_pitch',
    typicalDuration: 480,
    intensity: 'moderate',
    playersOnField: 13,
    heatSensitivity: 7,
    coldSensitivity: 5,
    windSensitivity: 6,
    rainTolerance: 2,
    lightningRisk: 9,
    equipmentWeight: 'moderate_heavy',
    special: [
      'Pitch condition critically affected by moisture',
      'Swing bowling enhanced by humidity/cloud cover',
      'Batsmen in full protective gear = extreme heat risk',
      'Bad light stops play (visibility rules)'
    ],
    cancellationThresholds: {
      wbgt: 32.0,
      windChill: -5,
      wind: 35,
      lightning: true,
      visibility: 500,
      pitchWet: true
    }
  },
  crossfit_outdoor: {
    fieldType: 'various',
    typicalDuration: 60,
    intensity: 'extreme',
    playersOnField: 'class_size',
    heatSensitivity: 9,
    coldSensitivity: 5,
    windSensitivity: 5,
    rainTolerance: 4,
    lightningRisk: 9,
    equipmentWeight: 'various',
    special: [
      'Rhabdomyolysis risk increases with heat',
      'Kipping movements dangerous on wet bars',
      'Barbells become slippery when wet',
      'Breathing intensity = higher air pollution intake'
    ],
    cancellationThresholds: {
      wbgt: 28.0,
      windChill: -8,
      wind: 35,
      lightning: true,
      visibility: 300,
      equipmentWet: true
    }
  },
  horseback_riding: {
    fieldType: 'arena_or_trail',
    typicalDuration: 90,
    intensity: 'moderate',
    playersOnField: 'individual',
    heatSensitivity: 7,
    coldSensitivity: 6,
    windSensitivity: 6,
    rainTolerance: 5,
    lightningRisk: 9,
    equipmentWeight: 'helmet_and_boots',
    special: [
      'Horses overheat faster than humans',
      'Horse sweat = 3x human sweat rate',
      'Spooking risk in high wind (leaves, debris)',
      'Ground conditions critical for hoof safety'
    ],
    cancellationThresholds: {
      wbgt: 30.0,
      windChill: -12,
      wind: 40,
      lightning: true,
      visibility: 300,
      arenaFlooded: true
    }
  },
  water_sports: {
    fieldType: 'lake_river_ocean',
    typicalDuration: 120,
    intensity: 'variable',
    playersOnField: 'variable',
    heatSensitivity: 4,
    coldSensitivity: 9,
    windSensitivity: 9,
    rainTolerance: 8,
    lightningRisk: 10,
    equipmentWeight: 'life_jacket_paddle',
    special: [
      'Water temp + air temp must sum > 30°C for safety',
      'Hypothermia in water 4x faster than air',
      'Wind creates waves: whitecaps at 20km/h',
      'Currents change with wind direction/speed'
    ],
    cancellationThresholds: {
      waterTemp: 15,
      windChill: 0,
      wind: 30,
      lightning: true,
      visibility: 500,
      waves: 1
    }
  }
};

// ============================================================================
// WBGT FLAG SYSTEM (International Standard)
// ============================================================================

function getWBGTCategory(wbgt) {
  if (wbgt >= 32.3) return {
    flag: 'BLACK',
    color: '#1a1a1a',
    action: 'CANCEL ALL OUTDOOR ACTIVITY',
    risk: 'Extreme - Heat stroke imminent',
    breaks: 'N/A - Cancel',
    hydration: 'N/A - Cancel',
    equipment: 'Remove all equipment',
    acclimatization: 'No activity safe',
    youth: 'Cancel all youth sports',
    special: 'Medical personnel must be on standby if any activity attempted'
  };
  if (wbgt >= 30.1) return {
    flag: 'RED',
    color: '#ef4444',
    action: 'Extreme caution - Modify significantly',
    risk: 'Very High - Heat exhaustion likely',
    breaks: '15 min rest per 45 min activity',
    hydration: '500ml per 20 min',
    equipment: 'Remove helmets/pads when possible',
    acclimatization: 'Limit to 1 hour for non-acclimated',
    youth: 'Cancel youth contact sports',
    special: 'Cold water immersion tub must be available'
  };
  if (wbgt >= 28.0) return {
    flag: 'ORANGE',
    color: '#f97316',
    action: 'High risk - Reduce intensity',
    risk: 'High - Heat cramps, exhaustion possible',
    breaks: '10 min per 30 min activity',
    hydration: '400ml per 20 min',
    equipment: 'Remove equipment during breaks',
    acclimatization: 'Reduce intensity by 25% for non-acclimated',
    youth: 'Monitor youth athletes every 15 min',
    special: 'Shade mandatory for rest breaks'
  };
  if (wbgt >= 25.7) return {
    flag: 'YELLOW',
    color: '#eab308',
    action: 'Moderate risk - Use caution',
    risk: 'Moderate - Monitor for heat illness',
    breaks: '5 min per 30 min activity',
    hydration: '300ml per 20 min',
    equipment: 'Optional equipment removal',
    acclimatization: 'Watch newcomers carefully',
    youth: 'Regular hydration breaks',
    special: 'Watch for early heat illness signs'
  };
  if (wbgt >= 21.0) return {
    flag: 'GREEN',
    color: '#22c55e',
    action: 'Low risk - Normal activity',
    risk: 'Low - Standard precautions',
    breaks: 'As needed',
    hydration: '200ml per 20 min',
    equipment: 'Normal use',
    acclimatization: 'Normal activity',
    youth: 'Normal activity',
    special: 'Maintain regular hydration'
  };
  return {
    flag: 'WHITE',
    color: '#ffffff',
    action: 'Cold risk - Monitor for hypothermia',
    risk: 'Low heat risk, possible cold risk',
    breaks: 'As needed',
    hydration: 'Normal',
    equipment: 'Add layers as needed',
    acclimatization: 'Normal',
    youth: 'Watch for cold stress',
    special: 'Focus on cold weather safety'
  };
}

// ============================================================================
// COLD WEATHER RISK ASSESSMENT
// ============================================================================

function getColdRiskCategory(windChill) {
  if (windChill <= -30) return {
    level: 'EXTREME COLD',
    frostbiteTime: '5-10 minutes',
    action: 'CANCEL all outdoor activity',
    clothing: 'Expedition gear only',
    warning: 'Exposed skin freezes almost instantly',
    special: 'No outdoor sports possible. Indoor only.'
  };
  if (windChill <= -20) return {
    level: 'SEVERE COLD',
    frostbiteTime: '10-30 minutes',
    action: 'Limit to 30 minutes maximum',
    clothing: 'Full winter gear: thermal base + fleece + windproof',
    warning: 'Check extremities every 10 minutes for numbness',
    special: 'No metal equipment (sticks to skin)'
  };
  if (windChill <= -10) return {
    level: 'VERY COLD',
    frostbiteTime: '30-60 minutes',
    action: 'Shortened sessions, indoor warmup',
    clothing: 'Multiple layers, face protection, hand/toe warmers',
    warning: 'Muscle tears more likely - extended warmup required',
    special: 'Asthma: cold air triggers attacks'
  };
  if (windChill <= 0) return {
    level: 'COLD',
    frostbiteTime: '>2 hours',
    action: 'Normal with precautions',
    clothing: 'Base layer + insulating layer + wind layer',
    warning: 'Keep moving - standing around = rapid cooling',
    special: 'Warm up 2x normal duration'
  };
  return null;
}

// ============================================================================
// PERFORMANCE IMPACT CALCULATOR
// ============================================================================

function calculatePerformanceImpact(data, sportType) {
  const { temp, humidity, wind, uvIndex, aqi, condition } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp;
  
  let impact = 0;
  let factors = [];
  
  if (effectiveTemp > 35) { impact -= 25; factors.push(`Extreme heat: -25% performance`); }
  else if (effectiveTemp > 30) { impact -= 15; factors.push(`High heat: -15% performance`); }
  else if (effectiveTemp > 27) { impact -= 8; factors.push(`Moderate heat: -8% performance`); }
  else if (effectiveTemp < -5) { impact -= 20; factors.push(`Extreme cold: -20% performance`); }
  else if (effectiveTemp < 5) { impact -= 10; factors.push(`Cold: -10% performance`); }
  else if (effectiveTemp < 10) { impact -= 5; factors.push(`Cool: -5% performance`); }
  
  if (humidity > 90 && temp > 25) { impact -= 10; factors.push(`Oppressive humidity: -10%`); }
  else if (humidity > 80 && temp > 28) { impact -= 5; factors.push(`High humidity: -5%`); }
  
  if (sportType === 'cycling' && wind > 30) { impact -= 20; factors.push(`Strong headwind: -20% cycling`); }
  else if (sportType === 'golf' && wind > 25) { impact -= 15; factors.push(`Wind affecting accuracy: -15%`); }
  else if (sportType === 'running' && wind > 30) { impact -= 10; factors.push(`Headwind resistance: -10%`); }
  
  if (aqi > 150) { impact -= 15; factors.push(`Poor air quality: -15%`); }
  else if (aqi > 100) { impact -= 8; factors.push(`Moderate air quality: -8%`); }
  
  if (uvIndex > 8 && sportType !== 'swimming_outdoor') { 
    impact -= 5; 
    factors.push(`High UV fatigue: -5%`); 
  }
  
  return { impact, factors, performanceLevel: impact < -20 ? 'Severely Degraded' : 
    impact < -10 ? 'Significantly Reduced' : 
    impact < -5 ? 'Slightly Reduced' : 
    impact < 0 ? 'Minimally Affected' : 'Optimal' };
}

// ============================================================================
// HYDRATION CALCULATOR
// ============================================================================

function getHydrationPlan(data, sportIntensity, durationMinutes) {
  const { temp, humidity } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const sweatRate = calculateSweatRate(temp, humidity, sportIntensity);
  
  let plan = [];
  
  plan.push("PRE-ACTIVITY (2-3 hours before):");
  plan.push(`• Drink 500-600ml water`);
  plan.push(`• Urine should be light yellow`);
  
  plan.push(`\nDURING ACTIVITY (every 15-20 minutes):`);
  if (heatIndex > 32) {
    plan.push(`• Drink 250-300ml water/sports drink`);
    plan.push(`• Sports drink preferred (electrolyte loss extreme)`);
    plan.push(`• Total: ${Math.round(sweatRate * durationMinutes / 60)}L estimated sweat loss`);
  } else if (heatIndex > 27) {
    plan.push(`• Drink 200-250ml water`);
    plan.push(`• Alternate water and sports drink`);
  } else {
    plan.push(`• Drink 150-200ml water`);
    plan.push(`• Water sufficient for <1 hour activity`);
  }
  
  plan.push(`\nPOST-ACTIVITY:`);
  plan.push(`• Weigh yourself: drink 1.5L per kg lost`);
  plan.push(`• Sodium replacement: salty snack or electrolyte drink`);
  plan.push(`• Continue hydrating for 4-6 hours post-exercise`);
  
  plan.push(`\n⚠️ DEHYDRATION WARNING SIGNS:`);
  plan.push(`• Thirst (already 1-2% dehydrated)`);
  plan.push(`• Dark urine (dehydrated)`);
  plan.push(`• Dizziness, headache, nausea (STOP ACTIVITY)`);
  plan.push(`• Muscle cramps (electrolyte deficiency)`);
  
  return plan;
}

function calculateSweatRate(temp, humidity, intensity) {
  const intensityMultiplier = {
    'low': 0.5,
    'low_moderate': 0.75,
    'moderate': 1.0,
    'moderate_high': 1.25,
    'high': 1.5,
    'very_high': 1.75,
    'endurance': 2.0,
    'extreme': 2.5
  };
  
  const baseRate = 0.5;
  const tempEffect = Math.max(0, (temp - 20) * 0.05);
  const humidityEffect = Math.max(0, (humidity - 50) * 0.02);
  
  return baseRate + tempEffect + humidityEffect * (intensityMultiplier[intensity] || 1.0);
}

// ============================================================================
// LIGHTNING SAFETY PROTOCOL
// ============================================================================

function getLightningProtocol() {
  return [
    "⛈️ LIGHTNING SAFETY PROTOCOL (30-30 RULE):",
    "",
    "30 SECOND RULE:",
    "• If thunder follows lightning in < 30 seconds, seek shelter IMMEDIATELY",
    "• Lightning can strike 10+ miles from storm",
    "• If you hear thunder, you're in danger",
    "",
    "30 MINUTE RULE:",
    "• Wait 30 minutes after LAST thunder before returning outdoors",
    "• Lightning can strike after storm appears to pass",
    "• Each new lightning strike resets the clock",
    "",
    "SAFE SHELTER:",
    "• Fully enclosed building with plumbing/wiring",
    "• Hard-topped vehicle (NOT convertible/golf cart)",
    "• Avoid: trees, open fields, metal bleachers, water",
    "",
    "UNSAFE LOCATIONS:",
    "• Open fields (you become the tallest object)",
    "• Under trees (side flash risk)",
    "• Near metal objects (conductors)",
    "• Water (pool, lake, ocean - excellent conductor)",
    "• Tents/canopies (no protection)",
    "",
    "IF NO SHELTER (LAST RESORT):",
    "• Crouch low on balls of feet (minimize ground contact)",
    "• Feet together, hands over ears",
    "• NO lying flat (increases ground current risk)",
    "• Spread group out (minimize multiple casualties)",
    "",
    "VENUE RESPONSIBILITY:",
    "• Designated weather monitor with authority to suspend",
    "• Lightning detection system or weather app",
    "• Evacuation plan communicated in advance",
    "• Safe shelter identified and accessible"
  ];
}

// ============================================================================
// YOUTH & SPECIAL POPULATIONS
// ============================================================================

function getYouthSportsAdvice(data) {
  const { temp, humidity, wbgt } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  advice.push("🧒 YOUTH SPORTS CONSIDERATIONS:");
  advice.push("");
  advice.push("Children differ from adults:");
  advice.push("• Sweat rate 50% lower = overheat 3-5x faster");
  advice.push("• Core temperature rises faster");
  advice.push("• Less blood volume relative to body size");
  advice.push("• Don't recognize thirst (must be told to drink)");
  advice.push("• Heat tolerance not fully developed until puberty");
  advice.push("");
  
  if (wbgt > 28.0) {
    advice.push("CANCEL all youth outdoor sports. Children cannot safely");
    advice.push("regulate body temperature in these conditions.");
    advice.push("Heat stroke in children can be fatal within 30 minutes.");
  } else if (wbgt > 25.7) {
    advice.push("LIMIT youth sports to 45 minutes maximum.");
    advice.push("Mandatory water breaks every 15 minutes.");
    advice.push("No full equipment. No conditioning drills.");
    advice.push("Shade mandatory for all rest periods.");
  }
  
  if (temp > 30 && humidity > 60) {
    advice.push("HIGH RISK for youth athletes. Strongly consider cancellation.");
  }
  
  return advice;
}

function getElderlyExerciseAdvice(data) {
  const { temp, windChill, humidity } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  advice.push("👴 ELDERLY EXERCISE CONSIDERATIONS:");
  advice.push("");
  advice.push("• Reduced thirst sensation = dehydration risk");
  advice.push("• Medications may affect temperature regulation");
  advice.push("• Cardiovascular system less adaptable to heat stress");
  advice.push("• Reduced sweating capacity");
  advice.push("");
  
  if (heatIndex > 32) {
    advice.push("DO NOT exercise outdoors. Heat stroke risk significantly");
    advice.push("elevated for elderly individuals. Move to air-conditioned space.");
  } else if (heatIndex > 28) {
    advice.push("Exercise with extreme caution. Limit to 20 minutes.");
    advice.push("Shade only. Hydrate before feeling thirsty.");
  }
  
  if (windChill < 0) {
    advice.push("Cold increases blood pressure and heart strain.");
    advice.push("Indoor exercise preferred. If outside: layer, cover extremities.");
  }
  
  return advice;
}

function getPregnancyExerciseAdvice(data) {
  const { temp, humidity } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  advice.push("🤰 PREGNANCY EXERCISE CONSIDERATIONS:");
  advice.push("");
  advice.push("• Body temperature already elevated");
  advice.push("• Blood volume doubled = heart works harder");
  advice.push("• Joints looser (relaxin hormone) = injury risk");
  advice.push("• Balance changes with pregnancy progression");
  advice.push("• Overheating risks fetal development (first trimester especially)");
  advice.push("");
  
  if (heatIndex > 30) {
    advice.push("AVOID outdoor exercise. Overheating risk to mother and fetus.");
    advice.push("Pool exercise or air-conditioned indoor activity only.");
  } else if (heatIndex > 27) {
    advice.push("Limit to 15-20 minutes. Stay in shade. Hydrate constantly.");
    advice.push("Stop immediately if feeling hot, dizzy, or nauseous.");
  }
  
  return advice;
}

// ============================================================================
// MAIN SPORTS ADVICE FUNCTION
// ============================================================================

export const getSportsAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  let { 
    temp, feelsLike, humidity, wind, windGust, uvIndex, aqi, 
    visibility, condition, conditionCode, precipitation, city,
    tempMin, tempMax, dewPoint, pressure
  } = data;

  // ═══ TIME-SHIFT AWARENESS ═══
  if (data._hourIndex !== undefined && data.hourly) {
    const idx = data._hourIndex
    if (data.hourly.temperature_2m?.[idx] !== undefined) temp = Math.round(data.hourly.temperature_2m[idx])
    if (data.hourly.apparent_temperature?.[idx] !== undefined) feelsLike = Math.round(data.hourly.apparent_temperature[idx])
    if (data.hourly.relative_humidity_2m?.[idx] !== undefined) humidity = data.hourly.relative_humidity_2m[idx]
    if (data.hourly.wind_speed_10m?.[idx] !== undefined) wind = data.hourly.wind_speed_10m[idx]
    if (data.hourly.wind_gusts_10m?.[idx] !== undefined) windGust = data.hourly.wind_gusts_10m[idx]
    if (data.hourly.weather_code?.[idx] !== undefined) {
      conditionCode = data.hourly.weather_code[idx]
      condition = mapWeatherCode(conditionCode)
    }
    if (data.hourly.precipitation?.[idx] !== undefined) precipitation = data.hourly.precipitation[idx]
    if (data.hourly.uv_index?.[idx] !== undefined) uvIndex = data.hourly.uv_index[idx]
    if (data.hourly.visibility?.[idx] !== undefined) visibility = data.hourly.visibility[idx] / 1000
  }
  if (data._dayOffset !== undefined && data.daily) {
    const d = data._dayOffset > 0 ? data._dayOffset : 0
    if (data.daily.temperature_2m_max?.[d] !== undefined) tempMax = Math.round(data.daily.temperature_2m_max[d])
    if (data.daily.temperature_2m_min?.[d] !== undefined) tempMin = Math.round(data.daily.temperature_2m_min[d])
    if (data.daily.weather_code?.[d] !== undefined) {
      conditionCode = data.daily.weather_code[d]
      condition = mapWeatherCode(conditionCode)
    }
    if (data.daily.precipitation_sum?.[d] !== undefined) precipitation = data.daily.precipitation_sum[d]
    if (data.daily.uv_index_max?.[d] !== undefined) uvIndex = data.daily.uv_index_max[d]
  }
  // ═══ END TIME-SHIFT ═══
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, condition === 'clear' ? 1 : 0);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  const timeOfDay = getTimeOfDay();
  const uvLevel = getUVLevel(uvIndex);
  const aqiLevel = getAQICategory(aqi);
  
  const q = question.toLowerCase();
  let sportType = 'running_marathon';
  for (const [key, config] of Object.entries(SPORT_REQUIREMENTS)) {
    const sportKey = key.replace(/_/g, ' ');
    if (q.includes(sportKey) || q.includes(key)) {
      sportType = key;
      break;
    }
  }
  if (q.includes('football') || q.includes('soccer')) sportType = 'football_soccer';
  if (q.includes('tennis')) sportType = 'tennis';
  if (q.includes('basketball')) sportType = 'basketball_outdoor';
  if (q.includes('run') || q.includes('marathon') || q.includes('jog')) sportType = 'running_marathon';
  if (q.includes('swim') || q.includes('pool')) sportType = 'swimming_outdoor';
  if (q.includes('bike') || q.includes('cycl') || q.includes('ride')) sportType = 'cycling';
  if (q.includes('golf')) sportType = 'golf';
  if (q.includes('baseball') || q.includes('softball')) sportType = 'baseball_softball';
  if (q.includes('volleyball') || q.includes('beach')) sportType = 'volleyball_beach';
  if (q.includes('hik') || q.includes('trail')) sportType = 'hiking';
  if (q.includes('ski') || q.includes('snowboard')) sportType = 'skiing_snowboarding';
  if (q.includes('rugby')) sportType = 'rugby';
  if (q.includes('cricket')) sportType = 'cricket';
  if (q.includes('crossfit') || q.includes('workout') || q.includes('boot camp')) sportType = 'crossfit_outdoor';
  if (q.includes('horse') || q.includes('riding')) sportType = 'horseback_riding';
  if (q.includes('kayak') || q.includes('rowing') || q.includes('paddle')) sportType = 'water_sports';
  
  const sportConfig = SPORT_REQUIREMENTS[sportType];
  const wbgtCategory = getWBGTCategory(wbgt);
  const coldRisk = getColdRiskCategory(windChill);
  const performance = calculatePerformanceImpact(data, sportType);
  
  let verdict = [];
  let safety = [];
  let performanceAdvice = [];
  let hydration = [];
  let warnings = [];
  let equipmentAdvice = [];
  let timingAdvice = [];
  let specialPopulationAdvice = [];
  let cancellationReason = null;

  if (isStorm && sportConfig.lightningRisk >= 8) {
    cancellationReason = 'LIGHTNING DANGER';
    verdict.push("🚫 CANCEL IMMEDIATELY: Lightning risk.");
    safety.push(...getLightningProtocol());
    warnings.push("LIGHTNING DOES NOT CARE ABOUT YOUR GAME SCORE.");
    warnings.push("More people die from lightning during sports than any other activity.");
  }
  
  if (aqi > 200) {
    cancellationReason = 'HAZARDOUS AIR QUALITY';
    verdict.push("🚫 CANCEL: Air quality hazardous to all athletes.");
    warnings.push(`AQI ${aqi}: Lung damage risk even for elite athletes.`);
    safety.push("Indoor activity with HEPA filtration only.");
  }
  
  if (wbgt >= sportConfig.cancellationThresholds.wbgt) {
    cancellationReason = 'EXTREME HEAT (BLACK FLAG)';
    verdict.push(`🚫 BLACK FLAG: WBGT ${wbgt.toFixed(1)}°C exceeds safety threshold.`);
    warnings.push("Heat stroke can kill. No outdoor activity is safe.");
  }
  
  if (windChill <= sportConfig.cancellationThresholds.windChill && coldRisk) {
    cancellationReason = 'EXTREME COLD';
    verdict.push(`🚫 CANCEL: Wind chill ${windChill}°C. Frostbite risk.`);
    warnings.push(`Exposed skin freezes in ${coldRisk.frostbiteTime}.`);
  }
  
  if (wind > sportConfig.cancellationThresholds.wind) {
    cancellationReason = 'DANGEROUS WIND';
    verdict.push(`🚫 CANCEL: Wind ${wind}km/h exceeds safe limits.`);
    warnings.push("Equipment failure, flying debris, uncontrollable conditions.");
  }
  
  if (visibility < sportConfig.cancellationThresholds.visibility) {
    cancellationReason = 'LOW VISIBILITY';
    verdict.push(`🚫 CANCEL: Visibility under ${visibility}km. Collision risk.`);
    warnings.push("Cannot see field, players, or hazards.");
  }

  if (!cancellationReason) {
    if (wbgtCategory.flag === 'RED') {
      verdict.push(`🔴 RED FLAG: ${wbgtCategory.action}`);
      warnings.push(`WBGT ${wbgt.toFixed(1)}°C: ${wbgtCategory.risk}`);
      safety.push(`Breaks: ${wbgtCategory.breaks}`);
      safety.push(`Hydration: ${wbgtCategory.hydration}`);
      safety.push(`Equipment: ${wbgtCategory.equipment}`);
      if (sportConfig.special.includes('Equipment adds 5-8°C')) {
        safety.push("CRITICAL: Heavy equipment significantly increases heat risk.");
        safety.push("Remove helmets/pads whenever possible.");
      }
    } else if (wbgtCategory.flag === 'ORANGE') {
      verdict.push(`🟠 ORANGE FLAG: ${wbgtCategory.action}`);
      safety.push(`WBGT ${wbgt.toFixed(1)}°C: ${wbgtCategory.risk}`);
      safety.push(wbgtCategory.breaks);
      safety.push(wbgtCategory.hydration);
    } else if (wbgtCategory.flag === 'YELLOW') {
      verdict.push(`🟡 YELLOW FLAG: ${wbgtCategory.action}`);
      safety.push(`WBGT ${wbgt.toFixed(1)}°C: Monitor athletes.`);
    } else if (wbgtCategory.flag === 'GREEN') {
      verdict.push(`🟢 GREEN FLAG: ${wbgtCategory.action}`);
    }
    
    if (coldRisk) {
      verdict.push(`❄️ ${coldRisk.level}: Frostbite in ${coldRisk.frostbiteTime}`);
      safety.push(coldRisk.warning);
      equipmentAdvice.push(`Clothing: ${coldRisk.clothing}`);
      if (coldRisk.level === 'SEVERE COLD' || coldRisk.level === 'EXTREME COLD') {
        safety.push("Indoor warmup mandatory. Check extremities frequently.");
      }
    }
    
    if (isRaining && precipitation > 5) {
      safety.push("Heavy rain: field conditions dangerous, visibility reduced.");
      warnings.push("Slip/fall injuries increase 3x on wet surfaces.");
      if (sportConfig.fieldType.includes('grass')) {
        warnings.push("Grass fields will be destroyed by play in heavy rain.");
        warnings.push("Footing unstable: ACL/MCL tear risk significantly elevated.");
      }
      performanceAdvice.push("Ball handling severely compromised. Expect 30-40% performance drop.");
    } else if (isRaining) {
      performanceAdvice.push("Wet conditions: ball will skid. Adjust play accordingly.");
      equipmentAdvice.push("Towel for grip. Change of clothes for after.");
      if (temp < 15) {
        warnings.push(`Cold rain at ${temp}°C: hypothermia risk. Get dry immediately after.`);
      }
    }
    
    if (wind > 30) {
      performanceAdvice.push(`Wind ${wind}km/h severely affects ball trajectory.`);
      if (sportType === 'golf') {
        performanceAdvice.push(`Add 2-3 clubs into wind. Putting severely affected.`);
      }
      if (sportType === 'tennis') {
        performanceAdvice.push("Serve toss becomes unpredictable. Use lower ball toss.");
      }
      if (sportType === 'cycling') {
        warnings.push(`Crosswinds dangerous. Wind chill at speed = ${calcWindChill(temp, wind+30).toFixed(0)}°C`);
      }
    } else if (wind > 20) {
      performanceAdvice.push(`Moderate wind ${wind}km/h: adjust for wind drift.`);
    }
    
    if (uvIndex >= 10) {
      warnings.push(`EXTREME UV ${uvIndex}: Burn in ${burnMin} minutes.`);
      safety.push("SPF 50+ mandatory. Reapply every 2 hours. UV-protective clothing.");
      equipmentAdvice.push("Sunglasses/eye protection essential.");
      performanceAdvice.push("Glare affects depth perception and ball tracking.");
    } else if (uvIndex >= 6) {
      safety.push(`High UV ${uvIndex}: SPF 30+ required. Reapply frequently.`);
    }
    
    if (aqi > 150) {
      warnings.push(`Unhealthy air ${aqi}: Reduce intensity 50%.`);
      safety.push("Asthmatic athletes: DO NOT participate.");
      performanceAdvice.push("Endurance performance drops 15-20%.");
    } else if (aqi > 100) {
      safety.push(`Moderate air ${aqi}: Sensitive individuals reduce activity.`);
    }
    
    if (precipitation > 10 && sportConfig.fieldType.includes('grass')) {
      warnings.push("FIELD CONDITIONS: Waterlogged. Playing will destroy field.");
      warnings.push("Footing unstable: ankle/knee injury risk 5x higher.");
      equipmentAdvice.push("Long studs/cleats if playing (but recommended to cancel).");
    }
  }

  hydration = getHydrationPlan(data, sportConfig.intensity, sportConfig.typicalDuration);

  if (wbgt > 25.7) {
    equipmentAdvice.push("Light-colored, breathable clothing essential.");
    equipmentAdvice.push("Cooling towel around neck during breaks.");
    equipmentAdvice.push("Extra water bottles (will drink 2-3x normal).");
    if (sportConfig.equipmentWeight === 'heavy') {
      equipmentAdvice.push("Remove equipment during ALL breaks.");
    }
  }
  
  if (windChill < 0) {
    equipmentAdvice.push("Moisture-wicking base layer (NO cotton).");
    equipmentAdvice.push("Windproof outer layer. Hand/toe warmers recommended.");
    equipmentAdvice.push("Extra layers available on sideline.");
  }
  
  if (condition === 'rain') {
    equipmentAdvice.push("Waterproof bag for dry clothes/electronics.");
    equipmentAdvice.push("Extra socks (wet feet = blisters).");
    equipmentAdvice.push("Grip-enhancing products for wet equipment.");
  }

  if (wbgt > 28.0) {
    timingAdvice.push("Schedule for early morning (6-9am) or late evening (after 7pm).");
    timingAdvice.push("AVOID 11am-4pm when WBGT peaks.");
  }
  if (timeOfDay === 'midday' && uvIndex > 6) {
    timingAdvice.push("Peak sun hours: shade essential if activity continues.");
  }
  if (wind > 20 && timeOfDay === 'afternoon') {
    timingAdvice.push("Winds typically decrease after sunset.");
  }

  if (q.includes('kid') || q.includes('child') || q.includes('youth') || q.includes('pee wee')) {
    specialPopulationAdvice = getYouthSportsAdvice({...data, wbgt});
  }
  if (q.includes('elder') || q.includes('senior') || q.includes('old')) {
    specialPopulationAdvice = getElderlyExerciseAdvice(data);
  }
  if (q.includes('pregnan')) {
    specialPopulationAdvice = getPregnancyExerciseAdvice(data);
  }

  const intros = [
    "🏃 Sports weather check:",
    "⚽ Athlete safety report:",
    "🎾 Game day conditions:",
    "🏈 Training weather:",
    "⚾ Zephye's sports advisory:",
    "🏊 Athletic conditions report:",
    "🚴 Exercise weather analysis:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  if (data._timeLabel) {
    response += `📅 **Time:** ${data._timeLabel}\n\n`;
  }
  
  response += `🎯 SPORT: ${sportType.replace(/_/g, ' ').toUpperCase()}\n`;
  response += `⏱️ Typical Duration: ${sportConfig.typicalDuration} min | Intensity: ${sportConfig.intensity}\n\n`;
  
  if (verdict.length > 0) {
    response += `📋 VERDICT:\n`;
    verdict.forEach(v => response += `${v}\n`);
    response += '\n';
  }
  
  response += `🚩 HEAT STRESS FLAG: ${wbgtCategory.flag} (WBGT ${wbgt.toFixed(1)}°C)\n`;
  response += `Risk: ${wbgtCategory.risk}\n`;
  response += `Action: ${wbgtCategory.action}\n\n`;
  
  response += `📊 PERFORMANCE IMPACT: ${performance.performanceLevel}\n`;
  if (performance.factors.length > 0) {
    performance.factors.forEach(f => response += `  ${f}\n`);
  }
  response += '\n';
  
  if (safety.length > 0 && !cancellationReason) {
    response += `🦺 SAFETY PROTOCOLS:\n`;
    safety.filter(s => !s.startsWith('⛈️')).forEach(s => response += `• ${s}\n`);
    response += '\n';
  }
  
  if (isStorm || condition === 'thunderstorm') {
    getLightningProtocol().forEach(line => response += `${line}\n`);
    response += '\n';
  }
  
  if (equipmentAdvice.length > 0) {
    response += `🎽 EQUIPMENT:\n`;
    equipmentAdvice.forEach(e => response += `• ${e}\n`);
    response += '\n';
  }
  
  if (performanceAdvice.length > 0) {
    response += `💪 PERFORMANCE NOTES:\n`;
    performanceAdvice.forEach(p => response += `• ${p}\n`);
    response += '\n';
  }
  
  if (timingAdvice.length > 0) {
    response += `⏰ TIMING:\n`;
    timingAdvice.forEach(t => response += `• ${t}\n`);
    response += '\n';
  }
  
  if (hydration.length > 0 && !cancellationReason) {
    response += `💧 HYDRATION PLAN:\n`;
    hydration.forEach(h => response += `${h}\n`);
    response += '\n';
  }
  
  if (specialPopulationAdvice.length > 0) {
    specialPopulationAdvice.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  response += `🎯 ${sportType.replace(/_/g, ' ').toUpperCase()} SPECIFIC:\n`;
  sportConfig.special.forEach(s => response += `• ${s}\n`);
  response += '\n';
  
  if (warnings.length > 0) {
    response += `⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temp: ${temp}°C (feels like ${effectiveTemp.toFixed(0)}°C)\n`;
  if (heatIndex > temp + 3) response += `• Heat Index: ${heatIndex.toFixed(0)}°C\n`;
  if (windChill < temp - 3) response += `• Wind Chill: ${windChill.toFixed(0)}°C\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• UV Index: ${uvIndex} (Burn time: ~${burnMin} min)\n`;
  response += `• AQI: ${aqi} (${aqiLevel})\n`;
  if (precipitation > 0) response += `• Precipitation: ${precipitation}mm\n`;
  response += '\n';
  
  response += `💡 BOTTOM LINE:\n`;
  if (cancellationReason) {
    response += `${cancellationReason}. Cancel or move indoors. No exceptions.\n`;
    response += `Athlete safety > game/training. Make the right call.\n`;
  } else if (wbgtCategory.flag === 'RED' || wbgtCategory.flag === 'BLACK') {
    response += `Extremely dangerous conditions. Strongly recommend cancellation.\n`;
    response += `If proceeding: full medical staff, cold immersion tub, reduced activity.\n`;
  } else if (wbgtCategory.flag === 'ORANGE') {
    response += `High risk conditions. Modify activity significantly.\n`;
    response += `Increase breaks, reduce equipment, monitor all athletes.\n`;
  } else if (wbgtCategory.flag === 'YELLOW') {
    response += `Moderate risk. Proceed with caution and increased monitoring.\n`;
  } else {
    response += `Favorable conditions. Normal activity with standard precautions.\n`;
  }
  
  const coachTips = [
    "When in doubt, sit them out. No game is worth a life.",
    "Hydration starts 24 hours before, not on game day.",
    "Athletes will push through pain. It's YOUR job to protect them.",
    "If you wouldn't want YOUR child playing in this, cancel it.",
    "Weather doesn't care about championships. Respect it.",
    "The best coaches know when NOT to play."
  ];
  response += `\n📢 ${random(coachTips)}`;

  return response;
};

export { 
  getHydrationPlan, 
  getLightningProtocol, 
  getWBGTCategory, 
  getColdRiskCategory 
};

export default getSportsAdvice;
