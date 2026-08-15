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
  // TEAM SPORTS
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
  "Should I move the game earlier or later?",
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
  "Should I cancel the sports day?",
  "Can I play flag football today?",
  "Is it safe for a charity walk?",
  "Should I cancel the swim meet?"
];

// ============================================================================
// ENHANCED SPORT-SPECIFIC DATABASE
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
    hydrationNeed: 'high',
    special: [
      'Slide tackles dangerous on wet or hard ground',
      'Goalkeeper specific: diving conditions affected by ground hardness',
      'Headers affected by wind trajectory significantly',
      'Stud length matters: soft ground versus firm ground cleats',
      'Rain: ball becomes faster and more unpredictable',
      'Heat: players cover 10-13km per match, extreme hydration need'
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
    hydrationNeed: 'extreme',
    special: [
      'Equipment adds 5-8°C to perceived temperature',
      'Helmets trap heat - 70 percent body heat lost through head',
      'Shoulder pads restrict cooling significantly',
      'Hydration breaks mandatory above 28°C WBGT',
      'Linemen at highest heat stroke risk (most equipment, constant exertion)',
      'Cold: equipment becomes stiff, impacts harder'
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
    hydrationNeed: 'moderate_high',
    special: [
      'Court surface temperature can be 15-25°C above air temperature',
      'Ball grip becomes impossible when wet',
      'Wind severely affects shooting accuracy (especially 3-pointers)',
      'Asphalt radiated heat increases WBGT by 2-4°C',
      'Concrete courts cause more joint impact than wood courts',
      'Sweat on court creates slip hazard'
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
    hydrationNeed: 'moderate',
    special: [
      'Hard courts radiate extreme heat (surface temp 55-65°C possible)',
      'Clay courts become unplayable when wet',
      'Wind changes ball trajectory dramatically (most affected sport)',
      'Serve toss becomes impossible in gusty conditions',
      'Grass courts become slippery when wet (injury risk)',
      'Sweat affects grip on racket handle'
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
    hydrationNeed: 'extreme',
    special: [
      'Core temperature rises 1°C per 10 minutes at race pace',
      'Dehydration of 2 percent body weight equals 6 percent performance drop',
      'Black flag conditions: cancel event entirely',
      'Medical tent capacity must match conditions',
      'Elite runners: 2-3 percent body weight fluid loss normal (high risk)',
      'Heat stroke in marathons: 1 in 100,000 runners (more in heat)',
      'Rain: chafing risk increases dramatically'
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
    hydrationNeed: 'moderate',
    special: [
      'Lightning: pool MUST be evacuated immediately (water conducts electricity)',
      'Open water: currents, waves, temperature stratification',
      'Hypothermia risk below 21°C water temperature',
      'Sun reflection off water doubles UV exposure',
      'Chlorine + sun = eye irritation risk',
      'Open water swimmers: start slow to adjust to cold'
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
    hydrationNeed: 'extreme',
    special: [
      'Wind chill at speed: 40km/h riding equals 15km/h wind plus 25km/h apparent wind',
      'Wet roads reduce braking power by 40 percent',
      'Crosswinds are dangerous above 35km/h',
      'Descending in cold creates extreme wind chill',
      'Corners: speed must be reduced 25% on wet roads',
      'Drafting reduces energy cost by 30 percent'
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
    hydrationNeed: 'moderate',
    special: [
      'Lightning: golf courses are open fields (worst possible place)',
      'Wind: every 10km/h equals 1 club difference',
      'Greens become unplayable when waterlogged',
      'Metal clubs are lightning conductors (do not hold them in storm)',
      'Hot: golf carts can become ovens (black seats burn)',
      'Putting: wind affects ball on greens significantly'
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
    hydrationNeed: 'moderate',
    special: [
      'Infield becomes a mud pit when wet',
      'Wind makes fly balls unpredictable',
      'Batter\'s box has extreme sun exposure (no shade)',
      'Catcher\'s gear is a heat trap, highest heat stroke risk position',
      'Dirt infield: sliding injuries increase on hard ground',
      'Pitcher\'s mound: traction issues when wet'
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
    hydrationNeed: 'high',
    special: [
      'Sand temperature can exceed 60°C in direct sun',
      'Wind: serves and sets become highly unpredictable',
      'Sand reflects UV, increasing exposure by 25 percent',
      'Bare feet on hot sand = burns in seconds',
      'Footwork requires 30% more energy on sand',
      'Rain: sand becomes heavy and unplayable'
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
    hydrationNeed: 'high',
    special: [
      'Temperature drops 6.5°C per 1000m elevation gain',
      'Exposure: above treeline equals no shelter from elements',
      'Stream crossings become dangerous after heavy rain',
      'Navigation becomes impossible in fog or whiteout',
      'Sun exposure: 10% more UV per 1000m elevation',
      'Backpack weight increases perceived exertion by 15-20%'
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
    hydrationNeed: 'moderate',
    special: [
      'Wind chill at speed: 60km/h skiing creates significant cold stress',
      'Whiteout conditions cause depth perception loss',
      'Avalanche risk increases after heavy snow or wind',
      'Frostbite on exposed skin in minutes in extreme cold',
      'Sunburn at altitude: UV increases 10% per 1000m elevation',
      'Snow blindness: wear goggles even on cloudy days'
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
    hydrationNeed: 'high',
    special: [
      'Tackling on hard or frozen ground equals severe injury risk',
      'Scrum collapses increase in wet conditions',
      'Mud adds 5-10kg to jersey weight',
      'Rain improves grip controversially - scrum advantage',
      'Cold: muscles tighten, injury risk increases 30%',
      'Ball becomes slippery in rain: handling errors increase'
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
    hydrationNeed: 'moderate',
    special: [
      'Pitch condition is critically affected by moisture',
      'Swing bowling is enhanced by humidity and cloud cover',
      'Batsmen in full protective gear face extreme heat risk',
      'Bad light stops play based on visibility rules',
      'Outfield becomes slow when wet (affects scoring)',
      'Spin bowling: dust on pitch helps turn'
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
    hydrationNeed: 'extreme',
    special: [
      'Rhabdomyolysis risk increases significantly with heat',
      'Kipping movements become dangerous on wet bars',
      'Barbells become slippery when wet (grip failure)',
      'Breathing intensity equals higher air pollution intake',
      'Metabolic conditioning in heat doubles cardiovascular strain',
      'Cool-down essential: 10-15 minutes of walking after WOD'
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
    hydrationNeed: 'moderate',
    special: [
      'Horses overheat faster than humans',
      'Horse sweat rate is 3x human sweat rate',
      'Spooking risk increases in high wind (leaves, debris)',
      'Ground conditions are critical for hoof safety',
      'Hot horses: cool down with water (not ice)',
      'Cold: horses need warm water to drink'
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
    hydrationNeed: 'moderate',
    special: [
      'Water temperature plus air temperature must sum over 30°C for safety',
      'Hypothermia in water is 4x faster than in air',
      'Wind creates waves: whitecaps appear at 20km/h',
      'Currents change direction and speed with wind',
      'Cold shock: involuntary gasp reflex at water under 15°C',
      'PFDs: essential, not optional'
    ],
    cancellationThresholds: {
      waterTemp: 15,
      windChill: 0,
      wind: 30,
      lightning: true,
      visibility: 500,
      waves: 1
    }
  },
  marathon_ultra: {
    fieldType: 'road_or_trail',
    typicalDuration: 600,
    intensity: 'endurance',
    playersOnField: 'small_field',
    heatSensitivity: 10,
    coldSensitivity: 3,
    windSensitivity: 6,
    rainTolerance: 6,
    lightningRisk: 10,
    equipmentWeight: 'minimal',
    hydrationNeed: 'extreme',
    special: [
      'Ultra-runners: 50-100km events with extreme weather exposure',
      'Aid stations every 5-10km critical for survival',
      'Pacing: 30-60 seconds slower per km per 5°C above 15°C',
      'Night running: headlamps, reflective gear, temperature drop',
      'Cutoff times: adjust for extreme conditions',
      'Medical team: must include hypothermia AND heat stroke capability'
    ],
    cancellationThresholds: {
      wbgt: 27.0,
      windChill: -10,
      wind: 40,
      lightning: true,
      visibility: 500,
      roadFlooding: true
    }
  },
  triathlon: {
    fieldType: 'mixed',
    typicalDuration: 300,
    intensity: 'endurance',
    playersOnField: 'variable',
    heatSensitivity: 9,
    coldSensitivity: 6,
    windSensitivity: 7,
    rainTolerance: 5,
    lightningRisk: 10,
    equipmentWeight: 'bike_and_gear',
    hydrationNeed: 'extreme',
    special: [
      'Swim: water temperature critical (wetsuit rules)',
      'Bike: drafting, wind, heat management',
      'Run: most heat stroke events occur in the run leg',
      'Transition area: must have shade and cooling stations',
      'Cumulative stress: heat + cold + wind across all legs',
      'Nutrition plan must account for sweat losses'
    ],
    cancellationThresholds: {
      wbgt: 28.0,
      windChill: -5,
      wind: 40,
      lightning: true,
      visibility: 500,
      roadFlooding: true
    }
  }
};

// ============================================================================
// ENHANCED WBGT FLAG SYSTEM
// ============================================================================

function getWBGTCategory(wbgt) {
  if (wbgt >= 32.3) {
    return {
      flag: 'BLACK',
      color: '#1a1a1a',
      action: 'CANCEL ALL OUTDOOR ACTIVITY',
      risk: 'Extreme - Heat stroke is imminent within 15 minutes',
      breaks: 'N/A - Cancel immediately',
      hydration: 'N/A - Cancel',
      equipment: 'Remove all equipment',
      acclimatization: 'No activity is safe',
      youth: 'Cancel all youth sports',
      special: 'Medical personnel must be on standby if any activity is attempted'
    };
  }
  if (wbgt >= 30.1) {
    return {
      flag: 'RED',
      color: '#ef4444',
      action: 'Extreme caution - Modify significantly',
      risk: 'Very High - Heat exhaustion is likely within 30 minutes',
      breaks: '15 minutes rest per 45 minutes activity',
      hydration: '500ml per 20 minutes',
      equipment: 'Remove helmets and pads when possible',
      acclimatization: 'Limit to 1 hour for non-acclimated athletes',
      youth: 'Cancel youth contact sports',
      special: 'Cold water immersion tub must be available on-site'
    };
  }
  if (wbgt >= 28.0) {
    return {
      flag: 'ORANGE',
      color: '#f97316',
      action: 'High risk - Reduce intensity significantly',
      risk: 'High - Heat cramps and exhaustion possible',
      breaks: '10 minutes per 30 minutes activity',
      hydration: '400ml per 20 minutes',
      equipment: 'Remove equipment during breaks',
      acclimatization: 'Reduce intensity by 25% for non-acclimated',
      youth: 'Monitor youth athletes every 15 minutes',
      special: 'Shade is mandatory for rest breaks'
    };
  }
  if (wbgt >= 25.7) {
    return {
      flag: 'YELLOW',
      color: '#eab308',
      action: 'Moderate risk - Use caution',
      risk: 'Moderate - Monitor for signs of heat illness',
      breaks: '5 minutes per 30 minutes activity',
      hydration: '300ml per 20 minutes',
      equipment: 'Optional equipment removal',
      acclimatization: 'Watch newcomers carefully',
      youth: 'Regular hydration breaks required',
      special: 'Watch for early signs of heat illness'
    };
  }
  if (wbgt >= 21.0) {
    return {
      flag: 'GREEN',
      color: '#22c55e',
      action: 'Low risk - Normal activity',
      risk: 'Low - Standard precautions sufficient',
      breaks: 'As needed',
      hydration: '200ml per 20 minutes',
      equipment: 'Normal use',
      acclimatization: 'Normal activity',
      youth: 'Normal activity',
      special: 'Maintain regular hydration'
    };
  }
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
// ENHANCED COLD WEATHER RISK ASSESSMENT
// ============================================================================

function getColdRiskCategory(windChill) {
  if (windChill <= -35) {
    return {
      level: 'EXTREME COLD - LIFE THREATENING',
      frostbiteTime: '2-5 minutes',
      action: 'CANCEL all outdoor activity immediately',
      clothing: 'Expedition gear only. No exposed skin.',
      warning: 'Exposed skin freezes almost instantly. Frostbite before you feel it.',
      special: 'No outdoor sports possible. Indoor only. Life-threatening.'
    };
  }
  if (windChill <= -25) {
    return {
      level: 'SEVERE COLD',
      frostbiteTime: '5-10 minutes',
      action: 'Limit to 15 minutes maximum',
      clothing: 'Thermal base + fleece + windproof + face protection',
      warning: 'Check extremities every 5 minutes for numbness',
      special: 'No metal equipment (sticks to skin). Frostbite risk extreme.'
    };
  }
  if (windChill <= -15) {
    return {
      level: 'VERY COLD',
      frostbiteTime: '15-30 minutes',
      action: 'Shortened sessions, indoor warmup required',
      clothing: 'Multiple layers, face protection, hand and toe warmers',
      warning: 'Muscle tears are more likely - extended warmup required',
      special: 'Asthma: cold air triggers attacks. Wear scarf over mouth.'
    };
  }
  if (windChill <= -5) {
    return {
      level: 'COLD',
      frostbiteTime: 'Over 30 minutes',
      action: 'Normal with precautions',
      clothing: 'Base layer + insulating layer + wind layer',
      warning: 'Keep moving - standing around causes rapid cooling',
      special: 'Warm up for 2x normal duration'
    };
  }
  if (windChill <= 0) {
    return {
      level: 'CHILLY',
      frostbiteTime: 'Over 2 hours',
      action: 'Normal activity with layers',
      clothing: 'Appropriate cold weather gear',
      warning: 'Watch for early signs of cold stress',
      special: 'Hydration still important in cold'
    };
  }
  return null;
}

// ============================================================================
// ENHANCED PERFORMANCE IMPACT CALCULATOR
// ============================================================================

function calculatePerformanceImpact(data, sportType) {
  const { temp, humidity, wind, uvIndex, aqi, condition } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp;
  
  let impact = 0;
  let factors = [];
  
  // Temperature impact
  if (effectiveTemp > 38) {
    impact -= 35;
    factors.push('Extreme heat: -35% performance, heat stroke risk');
  } else if (effectiveTemp > 35) {
    impact -= 25;
    factors.push('Extreme heat: -25% performance');
  } else if (effectiveTemp > 32) {
    impact -= 18;
    factors.push('Severe heat: -18% performance');
  } else if (effectiveTemp > 30) {
    impact -= 12;
    factors.push('High heat: -12% performance');
  } else if (effectiveTemp > 27) {
    impact -= 7;
    factors.push('Moderate heat: -7% performance');
  } else if (effectiveTemp < -10) {
    impact -= 25;
    factors.push('Extreme cold: -25% performance');
  } else if (effectiveTemp < -5) {
    impact -= 18;
    factors.push('Severe cold: -18% performance');
  } else if (effectiveTemp < 0) {
    impact -= 10;
    factors.push('Cold: -10% performance');
  } else if (effectiveTemp < 5) {
    impact -= 5;
    factors.push('Cool: -5% performance');
  }
  
  // Humidity impact
  if (humidity > 90 && temp > 25) {
    impact -= 12;
    factors.push('Oppressive humidity: -12% performance');
  } else if (humidity > 80 && temp > 28) {
    impact -= 8;
    factors.push('High humidity: -8% performance');
  } else if (humidity > 80) {
    impact -= 5;
    factors.push('High humidity: -5% performance');
  }
  
  // Wind impact by sport type
  if (sportType === 'cycling' && wind > 30) {
    impact -= 20;
    factors.push('Strong headwind: -20% cycling performance');
  } else if (sportType === 'cycling' && wind > 20) {
    impact -= 10;
    factors.push('Moderate headwind: -10% cycling performance');
  } else if (sportType === 'golf' && wind > 25) {
    impact -= 15;
    factors.push('Wind affecting accuracy: -15% scoring');
  } else if (sportType === 'tennis' && wind > 25) {
    impact -= 15;
    factors.push('Wind affecting ball control: -15% accuracy');
  } else if (sportType === 'running_marathon' && wind > 30) {
    impact -= 10;
    factors.push('Headwind resistance: -10% pace');
  } else if (sportType === 'running_marathon' && wind > 20) {
    impact -= 5;
    factors.push('Headwind: -5% pace');
  } else if (wind > 20 && sportType.includes('ball')) {
    impact -= 5;
    factors.push('Wind affecting ball trajectory: -5% accuracy');
  }
  
  // Air quality impact
  if (aqi > 200) {
    impact -= 25;
    factors.push('Hazardous air quality: -25% performance, health risk');
  } else if (aqi > 150) {
    impact -= 15;
    factors.push('Very poor air quality: -15% performance');
  } else if (aqi > 100) {
    impact -= 8;
    factors.push('Poor air quality: -8% performance');
  }
  
  // UV impact
  if (uvIndex > 10) {
    impact -= 8;
    factors.push('Extreme UV: -8% performance, fatigue risk');
  } else if (uvIndex > 8) {
    impact -= 5;
    factors.push('Very high UV: -5% performance');
  } else if (uvIndex > 6) {
    impact -= 3;
    factors.push('High UV: -3% performance');
  }
  
  // Rain impact
  if (condition === 'rain' || condition === 'drizzle') {
    if (sportType.includes('ball')) {
      impact -= 10;
      factors.push('Rain affecting ball control: -10% performance');
    }
    if (sportType === 'cycling') {
      impact -= 15;
      factors.push('Wet roads: -15% performance, braking reduced');
    }
    if (sportType === 'running_marathon') {
      impact -= 5;
      factors.push('Rain: -5% performance, chafing risk');
    }
  }
  
  // Performance level
  let performanceLevel = '';
  if (impact < -25) performanceLevel = 'EXTREME - Reschedule or cancel';
  else if (impact < -15) performanceLevel = 'SEVERELY DEGRADED - Significant modifications needed';
  else if (impact < -8) performanceLevel = 'SIGNIFICANTLY REDUCED - Adjust expectations';
  else if (impact < -3) performanceLevel = 'SLIGHTLY REDUCED - Minor adjustments';
  else performanceLevel = 'OPTIMAL - Full performance possible';
  
  return {
    impact: Math.max(-50, impact),
    factors,
    performanceLevel,
    maxPerformance: Math.max(50, 100 + impact)
  };
}

// ============================================================================
// ENHANCED HYDRATION CALCULATOR
// ============================================================================

function getHydrationPlan(data, sportIntensity, durationMinutes) {
  const { temp, humidity } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const sweatRate = calculateSweatRate(temp, humidity, sportIntensity);
  const totalSweat = sweatRate * (durationMinutes / 60);
  
  let plan = [];
  
  plan.push('HYDRATION PLAN:');
  plan.push('');
  
  plan.push('BEFORE ACTIVITY (2-3 hours prior):');
  plan.push('  • Drink 500-600ml water');
  plan.push('  • Urine should be light yellow to clear');
  plan.push('  • Avoid alcohol and caffeine (diuretics)');
  plan.push('  • If urine is dark, drink 500ml immediately');
  
  plan.push('');
  plan.push('DURING ACTIVITY:');
  
  if (heatIndex > 35) {
    plan.push('  EXTREME HEAT - Aggressive hydration required:');
    plan.push(`  • Drink 250-300ml every 15 minutes`);
    plan.push(`  • Sports drink recommended (electrolyte loss is extreme)`);
    plan.push(`  • Estimated sweat loss: ${totalSweat.toFixed(1)}L for this session`);
    plan.push('  • Use sports drink with sodium (300-600mg per 500ml)');
    plan.push('  • Set phone timer for hydration reminders');
  } else if (heatIndex > 30) {
    plan.push('  HIGH HEAT - Increased hydration needed:');
    plan.push('  • Drink 200-250ml every 20 minutes');
    plan.push('  • Alternate water and sports drink');
    plan.push(`  • Estimated sweat loss: ${totalSweat.toFixed(1)}L for this session`);
  } else if (heatIndex > 27) {
    plan.push('  WARM CONDITIONS - Standard hydration:');
    plan.push('  • Drink 150-200ml every 20 minutes');
    plan.push('  • Water is sufficient for under 1 hour');
  } else if (temp < 10) {
    plan.push('  COLD CONDITIONS - Still need hydration:');
    plan.push('  • Drink 150ml every 20-30 minutes');
    plan.push('  • Warm fluids preferred');
  } else {
    plan.push('  MODERATE CONDITIONS - Normal hydration:');
    plan.push('  • Drink 150-200ml every 20-30 minutes');
  }
  
  plan.push('');
  plan.push('POST-ACTIVITY (within 30 minutes):');
  plan.push('  • Weigh yourself before and after: drink 1.5L per kg lost');
  plan.push('  • Sodium replacement: salty snack or electrolyte drink');
  plan.push('  • Continue hydrating for 4-6 hours post-exercise');
  plan.push('  • Recovery drink: 3:1 carb to protein ratio');
  
  plan.push('');
  plan.push('DEHYDRATION WARNING SIGNS:');
  plan.push('  • Thirst - already 1-2 percent dehydrated');
  plan.push('  • Dark urine - dehydrated');
  plan.push('  • Dizziness, headache, nausea - STOP ACTIVITY');
  plan.push('  • Muscle cramps - electrolyte deficiency');
  plan.push('  • Decreased performance - listen to your body');
  
  return plan;
}

function calculateSweatRate(temp, humidity, intensity) {
  const intensityMultiplier = {
    'low': 0.5,
    'low_moderate': 0.7,
    'moderate': 0.85,
    'moderate_high': 1.0,
    'high': 1.2,
    'very_high': 1.4,
    'endurance': 1.6,
    'extreme': 2.0
  };
  
  const baseRate = 0.5; // L per hour
  const tempEffect = Math.max(0, (temp - 20) * 0.04);
  const humidityEffect = Math.max(0, (humidity - 50) * 0.015);
  const multiplier = intensityMultiplier[intensity] || 1.0;
  
  return (baseRate + tempEffect + humidityEffect) * multiplier;
}

// ============================================================================
// ENHANCED LIGHTNING SAFETY PROTOCOL
// ============================================================================

function getLightningProtocol() {
  return [
    'LIGHTNING SAFETY PROTOCOL - 30-30 RULE:',
    '',
    '30 SECOND RULE:',
    '  • If thunder follows lightning in under 30 seconds, seek shelter IMMEDIATELY',
    '  • Lightning can strike 10+ miles from the storm',
    '  • If you hear thunder, you are in danger',
    '  • Do not wait for rain to start before taking shelter',
    '',
    '30 MINUTE RULE:',
    '  • Wait 30 minutes after the LAST thunder before returning outdoors',
    '  • Lightning can strike after the storm appears to pass',
    '  • Each new lightning strike resets the clock',
    '  • The deadliest strikes often occur after the storm passes',
    '',
    'SAFE SHELTER LOCATIONS:',
    '  • Fully enclosed building with plumbing and wiring',
    '  • Hard-topped vehicle (NOT convertible, NOT golf cart)',
    '  • Stay in center of vehicle, do not touch metal',
    '  • Underground parking or basement',
    '',
    'UNSAFE LOCATIONS:',
    '  • Open fields (you become the tallest object)',
    '  • Under trees (side flash risk)',
    '  • Near metal objects (conductors)',
    '  • Water (pool, lake, ocean - excellent conductor)',
    '  • Tents, canopies, umbrellas (no protection)',
    '  • Golf carts (metal frame, open sides)',
    '',
    'IF NO SHELTER AVAILABLE (LAST RESORT):',
    '  • Crouch low on balls of feet (minimize ground contact)',
    '  • Feet together, hands over ears',
    '  • NO lying flat (increases ground current risk)',
    '  • Spread group out (minimize multiple casualties)',
    '',
    'VENUE RESPONSIBILITIES:',
    '  • Designated weather monitor with authority to suspend play',
    '  • Lightning detection system or reliable weather app',
    '  • Evacuation plan communicated in advance',
    '  • Safe shelter identified and accessible',
    '  • Post-incident protocol: check for injuries, report to authorities'
  ];
}

// ============================================================================
// ENHANCED YOUTH & SPECIAL POPULATIONS
// ============================================================================

function getYouthSportsAdvice(data) {
  const { temp, humidity, wbgt } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  advice.push('YOUTH SPORTS CONSIDERATIONS:');
  advice.push('');
  advice.push('Children differ from adults in critical ways:');
  advice.push('  • Sweat rate is 50 percent lower = overheat 3-5x faster');
  advice.push('  • Core temperature rises faster during exercise');
  advice.push('  • Less blood volume relative to body size');
  advice.push('  • Do not recognize thirst (must be told to drink)');
  advice.push('  • Heat tolerance not fully developed until puberty');
  advice.push('  • Surface area to mass ratio is higher (lose heat faster in cold)');
  advice.push('');
  
  if (wbgt > 30.0) {
    advice.push('CRITICAL: CANCEL all youth outdoor sports.');
    advice.push('Children cannot safely regulate body temperature in these conditions.');
    advice.push('Heat stroke in children can be fatal within 30 minutes.');
    advice.push('Fatalities have occurred at WBGT 28-30°C.');
  } else if (wbgt > 28.0) {
    advice.push('HIGH RISK: Limit youth sports to 30 minutes maximum.');
    advice.push('Mandatory water breaks every 10-15 minutes.');
    advice.push('No full equipment. No conditioning drills.');
    advice.push('Shade mandatory for all rest periods.');
    advice.push('Heat illness signs: flushed face, lethargy, nausea, headache.');
  } else if (wbgt > 25.7) {
    advice.push('MODERATE RISK: Monitor all youth athletes closely.');
    advice.push('Water breaks every 20 minutes.');
    advice.push('Watch for: disorientation, confusion, or excessive fatigue.');
    advice.push('Younger children (under 12) at higher risk.');
  } else {
    advice.push('CONDITIONS ACCEPTABLE for youth sports with normal precautions.');
    advice.push('Ensure hydration is available at all times.');
  }
  
  if (heatIndex > 30) {
    advice.push('');
    advice.push('SPECIAL PRECAUTIONS:');
    advice.push('  • Light-colored, loose-fitting clothing recommended');
    advice.push('  • Hats and sunglasses for outdoor sports');
    advice.push('  • Sunscreen SPF 30+');
    advice.push('  • Ice towels available for cooling');
  }
  
  return advice;
}

function getElderlyExerciseAdvice(data) {
  const { temp, windChill, humidity, uvIndex } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  advice.push('ELDERLY EXERCISE CONSIDERATIONS:');
  advice.push('');
  advice.push('Key physiological differences:');
  advice.push('  • Reduced thirst sensation = dehydration risk');
  advice.push('  • Medications may affect temperature regulation');
  advice.push('  • Cardiovascular system less adaptable to heat stress');
  advice.push('  • Reduced sweating capacity');
  advice.push('  • Reduced proprioception = fall risk');
  advice.push('  • Vision changes affect balance');
  advice.push('');
  
  if (heatIndex > 34) {
    advice.push('DO NOT EXERCISE OUTDOORS. Heat stroke risk is significantly');
    advice.push('elevated for elderly individuals. Move to air-conditioned space.');
    advice.push('Even indoor exercise should be light and monitored.');
  } else if (heatIndex > 30) {
    advice.push('Exercise with EXTREME CAUTION. Limit to 20 minutes maximum.');
    advice.push('Stay in shade. Hydrate before feeling thirsty.');
    advice.push('Best time: early morning (before 8am) or evening (after 7pm).');
  } else if (heatIndex > 27) {
    advice.push('Exercise with caution. Limit to 30-40 minutes.');
    advice.push('Shade recommended. Hydrate before, during, and after.');
  }
  
  if (windChill < -5) {
    advice.push('');
    advice.push('COLD WEATHER:');
    advice.push('  • Cold increases blood pressure and heart strain');
    advice.push('  • Indoor exercise preferred in extreme cold');
    advice.push('  • If outside: layer clothing, cover extremities');
    advice.push('  • Watch for shivering, confusion (hypothermia signs)');
  }
  
  advice.push('');
  advice.push('GENERAL RECOMMENDATIONS:');
  advice.push('  • Walk with a partner or in populated areas');
  advice.push('  • Wear supportive, non-slip footwear');
  advice.push('  • Take breaks every 15-20 minutes');
  advice.push('  • Listen to your body - stop if any discomfort');
  advice.push('  • Carry a phone for emergencies');
  
  return advice;
}

function getPregnancyExerciseAdvice(data) {
  const { temp, humidity, uvIndex } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  advice.push('PREGNANCY EXERCISE CONSIDERATIONS:');
  advice.push('');
  advice.push('Physiological changes:');
  advice.push('  • Body temperature is already elevated');
  advice.push('  • Blood volume is doubled = heart works harder');
  advice.push('  • Joints are looser (relaxin hormone) = injury risk');
  advice.push('  • Balance changes with pregnancy progression');
  advice.push('  • Overheating risks fetal development (first trimester especially)');
  advice.push('  • Core temperature should not exceed 38°C');
  advice.push('');
  
  if (heatIndex > 32) {
    advice.push('AVOID OUTDOOR EXERCISE. Overheating risk to mother and fetus.');
    advice.push('Pool exercise or air-conditioned indoor activity only.');
    advice.push('Swimming is an excellent, safe option.');
  } else if (heatIndex > 29) {
    advice.push('CAUTION: Limit outdoor exercise to 15-20 minutes.');
    advice.push('Stay in shade. Hydrate constantly.');
    advice.push('Stop immediately if feeling hot, dizzy, or nauseous.');
    advice.push('Monitor fetal movement after exercise.');
  } else if (heatIndex > 26) {
    advice.push('Acceptable with precautions. Stay hydrated.');
    advice.push('Take breaks every 15 minutes.');
    advice.push('Shade recommended, especially in second and third trimesters.');
  } else {
    advice.push('Conditions favorable for pregnancy exercise.');
    advice.push('Walking, swimming, and prenatal yoga are excellent choices.');
  }
  
  advice.push('');
  advice.push('RECOMMENDED ACTIVITIES:');
  advice.push('  • Walking (flat surfaces, good footwear)');
  advice.push('  • Swimming and water aerobics (best option)');
  advice.push('  • Stationary cycling');
  advice.push('  • Prenatal yoga (avoid heated yoga)');
  advice.push('');
  advice.push('AVOID:');
  advice.push('  • Activities with fall risk (skiing, skating, gymnastics)');
  advice.push('  • Contact sports (basketball, soccer, rugby)');
  advice.push('  • Activities requiring lying flat on back (after 20 weeks)');
  advice.push('  • Hot yoga or saunas');
  
  return advice;
}

// ============================================================================
// MAIN SPORTS ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getSportsAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  let { 
    temp, feelsLike, humidity, wind, windGust, uvIndex, aqi, 
    visibility, condition, conditionCode, precipitation, city,
    tempMin, tempMax, dewPoint, pressure
  } = data;

  // Time-shift awareness for hourly data
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
  
  const q = question.toLowerCase();
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
  
  // Detect sport type from question
  let sportType = 'running_marathon';
  for (const [key] of Object.entries(SPORT_REQUIREMENTS)) {
    const sportKey = key.replace(/_/g, ' ');
    if (q.includes(sportKey) || q.includes(key)) {
      sportType = key;
      break;
    }
  }
  
  // Override based on specific keywords
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
  if (q.includes('triathlon')) sportType = 'triathlon';
  if (q.includes('ultra')) sportType = 'marathon_ultra';
  
  const sportConfig = SPORT_REQUIREMENTS[sportType] || SPORT_REQUIREMENTS.running_marathon;
  const wbgtCategory = getWBGTCategory(wbgt);
  const coldRisk = getColdRiskCategory(windChill);
  const performance = calculatePerformanceImpact(data, sportType);
  
  // Build response sections
  let verdict = [];
  let safety = [];
  let performanceAdvice = [];
  let hydration = [];
  let warnings = [];
  let equipmentAdvice = [];
  let timingAdvice = [];
  let specialPopulationAdvice = [];
  let cancellationReason = null;

  // Check for cancellation conditions
  if (isStorm && sportConfig.lightningRisk >= 8) {
    cancellationReason = 'LIGHTNING DANGER';
    verdict.push('CANCEL IMMEDIATELY: Lightning risk.');
    safety.push(...getLightningProtocol());
    warnings.push('LIGHTNING DOES NOT CARE ABOUT YOUR GAME SCORE.');
    warnings.push('More people die from lightning during sports than any other activity.');
  }
  
  if (aqi > 200) {
    cancellationReason = 'HAZARDOUS AIR QUALITY';
    verdict.push('CANCEL: Air quality hazardous to all athletes.');
    warnings.push(`AQI ${aqi}: Lung damage risk even for elite athletes.`);
    safety.push('Indoor activity with HEPA filtration only.');
  }
  
  if (wbgt >= sportConfig.cancellationThresholds.wbgt) {
    cancellationReason = 'EXTREME HEAT BLACK FLAG';
    verdict.push(`BLACK FLAG: WBGT ${wbgt.toFixed(1)}°C exceeds safety threshold.`);
    warnings.push('Heat stroke can kill. No outdoor activity is safe.');
  }
  
  if (windChill <= sportConfig.cancellationThresholds.windChill && coldRisk) {
    cancellationReason = 'EXTREME COLD';
    verdict.push(`CANCEL: Wind chill ${Math.round(windChill)}°C. Frostbite risk.`);
    warnings.push(`Exposed skin freezes in ${coldRisk.frostbiteTime}.`);
  }
  
  if (wind > sportConfig.cancellationThresholds.wind) {
    cancellationReason = 'DANGEROUS WIND';
    verdict.push(`CANCEL: Wind ${Math.round(wind)}km/h exceeds safe limits.`);
    warnings.push('Equipment failure, flying debris, uncontrollable conditions.');
  }
  
  if (visibility < sportConfig.cancellationThresholds.visibility) {
    cancellationReason = 'LOW VISIBILITY';
    verdict.push(`CANCEL: Visibility under ${visibility}km. Collision risk.`);
    warnings.push('Cannot see field, players, or hazards.');
  }

  // If not cancelled, provide detailed advice
  if (!cancellationReason) {
    if (wbgtCategory.flag === 'RED') {
      verdict.push(`RED FLAG: ${wbgtCategory.action}`);
      warnings.push(`WBGT ${wbgt.toFixed(1)}°C: ${wbgtCategory.risk}`);
      safety.push(`Breaks: ${wbgtCategory.breaks}`);
      safety.push(`Hydration: ${wbgtCategory.hydration}`);
      safety.push(`Equipment: ${wbgtCategory.equipment}`);
      if (sportConfig.equipmentWeight === 'heavy') {
        safety.push('CRITICAL: Heavy equipment significantly increases heat risk.');
        safety.push('Remove helmets and pads whenever possible.');
      }
    } else if (wbgtCategory.flag === 'ORANGE') {
      verdict.push(`ORANGE FLAG: ${wbgtCategory.action}`);
      safety.push(`WBGT ${wbgt.toFixed(1)}°C: ${wbgtCategory.risk}`);
      safety.push(wbgtCategory.breaks);
      safety.push(wbgtCategory.hydration);
    } else if (wbgtCategory.flag === 'YELLOW') {
      verdict.push(`YELLOW FLAG: ${wbgtCategory.action}`);
      safety.push(`WBGT ${wbgt.toFixed(1)}°C: Monitor athletes.`);
    } else if (wbgtCategory.flag === 'GREEN') {
      verdict.push(`GREEN FLAG: ${wbgtCategory.action}`);
    }
    
    if (coldRisk) {
      verdict.push(`${coldRisk.level}: Frostbite in ${coldRisk.frostbiteTime}`);
      safety.push(coldRisk.warning);
      equipmentAdvice.push(`Clothing: ${coldRisk.clothing}`);
      if (coldRisk.level === 'SEVERE COLD' || coldRisk.level === 'EXTREME COLD') {
        safety.push('Indoor warmup mandatory. Check extremities frequently.');
      }
    }
    
    if (isRaining && precipitation > 5) {
      safety.push('Heavy rain: field conditions dangerous, visibility reduced.');
      warnings.push('Slip and fall injuries increase 3x on wet surfaces.');
      if (sportConfig.fieldType.includes('grass')) {
        warnings.push('Grass fields will be destroyed by play in heavy rain.');
        warnings.push('Footing unstable: ACL and MCL tear risk significantly elevated.');
      }
      performanceAdvice.push('Ball handling severely compromised. Expect 30-40% performance drop.');
    } else if (isRaining) {
      performanceAdvice.push('Wet conditions: ball will skid. Adjust play accordingly.');
      equipmentAdvice.push('Towel for grip. Change of clothes for after.');
      if (temp < 15) {
        warnings.push(`Cold rain at ${Math.round(temp)}°C: hypothermia risk. Get dry immediately after.`);
      }
    }
    
    if (wind > 30) {
      performanceAdvice.push(`Wind ${Math.round(wind)}km/h severely affects ball trajectory.`);
      if (sportType === 'golf') {
        performanceAdvice.push('Add 2-3 clubs into wind. Putting severely affected.');
      }
      if (sportType === 'tennis') {
        performanceAdvice.push('Serve toss becomes unpredictable. Use lower ball toss.');
      }
      if (sportType === 'cycling') {
        warnings.push(`Crosswinds dangerous. Wind chill at speed = ${Math.round(calcWindChill(temp, wind + 30))}°C`);
      }
    } else if (wind > 20) {
      performanceAdvice.push(`Moderate wind ${Math.round(wind)}km/h: adjust for wind drift.`);
    }
    
    if (uvIndex >= 10) {
      warnings.push(`EXTREME UV ${uvIndex}: Burn in ${burnMin} minutes.`);
      safety.push('SPF 50+ mandatory. Reapply every 2 hours. UV-protective clothing.');
      equipmentAdvice.push('Sunglasses or eye protection essential.');
      performanceAdvice.push('Glare affects depth perception and ball tracking.');
    } else if (uvIndex >= 6) {
      safety.push(`High UV ${uvIndex}: SPF 30+ required. Reapply frequently.`);
    }
    
    if (aqi > 150) {
      warnings.push(`Unhealthy air ${aqi}: Reduce intensity 50 percent.`);
      safety.push('Asthmatic athletes: DO NOT participate.');
      performanceAdvice.push('Endurance performance drops 15-20 percent.');
    } else if (aqi > 100) {
      safety.push(`Moderate air ${aqi}: Sensitive individuals reduce activity.`);
    }
    
    if (precipitation > 10 && sportConfig.fieldType.includes('grass')) {
      warnings.push('FIELD CONDITIONS: Waterlogged. Playing will destroy field.');
      warnings.push('Footing unstable: ankle and knee injury risk 5x higher.');
      equipmentAdvice.push('Long studs or cleats if playing but recommended to cancel.');
    }
  }

  hydration = getHydrationPlan(data, sportConfig.intensity, sportConfig.typicalDuration);

  // Equipment advice
  if (wbgt > 25.7) {
    equipmentAdvice.push('Light-colored, breathable clothing essential.');
    equipmentAdvice.push('Cooling towel around neck during breaks.');
    equipmentAdvice.push('Extra water bottles (will drink 2-3x normal).');
    if (sportConfig.equipmentWeight === 'heavy') {
      equipmentAdvice.push('Remove equipment during ALL breaks.');
    }
  }
  
  if (windChill < 0) {
    equipmentAdvice.push('Moisture-wicking base layer - NO cotton.');
    equipmentAdvice.push('Windproof outer layer. Hand and toe warmers recommended.');
    equipmentAdvice.push('Extra layers available on sideline.');
  }
  
  if (condition === 'rain') {
    equipmentAdvice.push('Waterproof bag for dry clothes and electronics.');
    equipmentAdvice.push('Extra socks (wet feet equals blisters).');
    equipmentAdvice.push('Grip-enhancing products for wet equipment.');
  }

  // Timing advice
  if (wbgt > 28.0) {
    timingAdvice.push('Schedule for early morning (6-9am) or late evening (after 7pm).');
    timingAdvice.push('AVOID 11am-4pm when WBGT peaks.');
  }
  if (timeOfDay === 'midday' && uvIndex > 6) {
    timingAdvice.push('Peak sun hours: shade essential if activity continues.');
  }
  if (wind > 20 && timeOfDay === 'afternoon') {
    timingAdvice.push('Winds typically decrease after sunset.');
  }

  // Special populations
  if (q.includes('kid') || q.includes('child') || q.includes('youth') || q.includes('pee wee')) {
    specialPopulationAdvice = getYouthSportsAdvice({ ...data, wbgt });
  }
  if (q.includes('elder') || q.includes('senior') || q.includes('old')) {
    specialPopulationAdvice = getElderlyExerciseAdvice(data);
  }
  if (q.includes('pregnan')) {
    specialPopulationAdvice = getPregnancyExerciseAdvice(data);
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "SPORTS WEATHER ASSESSMENT",
    "ATHLETIC SAFETY REPORT",
    "GAME DAY CONDITIONS ANALYSIS",
    "TRAINING WEATHER ADVISORY",
    "SPORTS CONDITIONS EVALUATION"
  ];

  let response = `${random(intros)}\n`;
  if (city) response += `Location: ${city}\n`;
  if (data._timeLabel) response += `Time: ${data._timeLabel}\n`;
  response += `\n`;
  
  // Sport info
  response += `=== SPORT ===\n`;
  response += `  ${sportType.replace(/_/g, ' ').toUpperCase()}\n`;
  response += `  Duration: ${sportConfig.typicalDuration} minutes\n`;
  response += `  Intensity: ${sportConfig.intensity}\n`;
  response += `  Equipment weight: ${sportConfig.equipmentWeight}\n`;
  response += `  Hydration need: ${sportConfig.hydrationNeed || 'moderate'}\n`;
  response += `\n`;
  
  // Verdict
  response += `=== VERDICT ===\n`;
  verdict.forEach(v => response += `  ${v}\n`);
  response += `\n`;
  
  // Conditions
  response += `=== CURRENT CONDITIONS ===\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  if (heatIndex > temp + 3) response += `  Heat Index: ${Math.round(heatIndex)}°C\n`;
  if (windChill < temp - 3) response += `  Wind Chill: ${Math.round(windChill)}°C\n`;
  response += `  WBGT: ${wbgt.toFixed(1)}°C (${wbgtCategory.flag} FLAG)\n`;
  response += `  Humidity: ${Math.round(humidity)}%\n`;
  response += `  Wind: ${Math.round(wind)} km/h (gusts to ${Math.round(windGust || wind + 5)} km/h)\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel}) - burn time ~${burnMin} minutes\n`;
  response += `  Air Quality: AQI ${aqi} (${aqiLevel})\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm\n`;
  response += `\n`;
  
  // WBGT Flag details
  response += `=== HEAT STRESS FLAG ===\n`;
  response += `  Flag: ${wbgtCategory.flag}\n`;
  response += `  Risk: ${wbgtCategory.risk}\n`;
  response += `  Action: ${wbgtCategory.action}\n`;
  response += `  Breaks: ${wbgtCategory.breaks}\n`;
  response += `  Hydration: ${wbgtCategory.hydration}\n`;
  response += `  Equipment: ${wbgtCategory.equipment}\n`;
  if (wbgtCategory.youth) response += `  Youth: ${wbgtCategory.youth}\n`;
  if (wbgtCategory.special) response += `  Special: ${wbgtCategory.special}\n`;
  response += `\n`;
  
  // Performance impact
  response += `=== PERFORMANCE IMPACT ===\n`;
  response += `  Level: ${performance.performanceLevel}\n`;
  response += `  Max performance: ${performance.maxPerformance}%\n`;
  performance.factors.forEach(f => response += `  • ${f}\n`);
  response += `\n`;
  
  // Safety protocols
  if (safety.length > 0 && !cancellationReason) {
    response += `=== SAFETY PROTOCOLS ===\n`;
    safety.slice(0, 10).forEach(s => response += `  ${s}\n`);
    if (safety.length > 10) response += `  ... and ${safety.length - 10} more items\n`;
    response += `\n`;
  }
  
  // Lightning protocol (if applicable)
  if (isStorm || condition === 'thunderstorm') {
    response += `=== LIGHTNING PROTOCOL ===\n`;
    getLightningProtocol().forEach(line => response += `${line}\n`);
    response += `\n`;
  }
  
  // Hydration plan
  if (hydration.length > 0 && !cancellationReason) {
    response += `=== HYDRATION PLAN ===\n`;
    hydration.forEach(h => response += `${h}\n`);
    response += `\n`;
  }
  
  // Equipment advice
  if (equipmentAdvice.length > 0) {
    response += `=== EQUIPMENT ===\n`;
    equipmentAdvice.forEach(e => response += `  • ${e}\n`);
    response += `\n`;
  }
  
  // Performance advice
  if (performanceAdvice.length > 0) {
    response += `=== PERFORMANCE ADVICE ===\n`;
    performanceAdvice.forEach(p => response += `  • ${p}\n`);
    response += `\n`;
  }
  
  // Timing advice
  if (timingAdvice.length > 0) {
    response += `=== TIMING ===\n`;
    timingAdvice.forEach(t => response += `  • ${t}\n`);
    response += `\n`;
  }
  
  // Sport-specific advice
  response += `=== ${sportType.replace(/_/g, ' ').toUpperCase()} SPECIFIC ===\n`;
  sportConfig.special.slice(0, 6).forEach(s => response += `  • ${s}\n`);
  if (sportConfig.special.length > 6) {
    response += `  ... and ${sportConfig.special.length - 6} more notes\n`;
  }
  response += `\n`;
  
  // Special populations
  if (specialPopulationAdvice.length > 0) {
    response += `=== SPECIAL POPULATIONS ===\n`;
    specialPopulationAdvice.forEach(s => response += `${s}\n`);
    response += `\n`;
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `=== WARNINGS ===\n`;
    warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (cancellationReason) {
    response += `  ${cancellationReason}. Cancel or move indoors. No exceptions.\n`;
    response += `  Athlete safety is more important than any game or training.\n`;
    response += `  Make the right call. You are responsible for their safety.\n`;
  } else if (wbgtCategory.flag === 'RED' || wbgtCategory.flag === 'BLACK') {
    response += `  Extremely dangerous conditions. Strongly recommend cancellation.\n`;
    response += `  If proceeding: full medical staff, cold immersion tub, reduced activity.\n`;
  } else if (wbgtCategory.flag === 'ORANGE') {
    response += `  High risk conditions. Modify activity significantly.\n`;
    response += `  Increase breaks, reduce equipment, monitor all athletes.\n`;
  } else if (wbgtCategory.flag === 'YELLOW') {
    response += `  Moderate risk. Proceed with caution and increased monitoring.\n`;
  } else {
    response += `  Favorable conditions. Normal activity with standard precautions.\n`;
  }
  
  const coachTips = [
    "When in doubt, sit them out. No game is worth a life.",
    "Hydration starts 24 hours before, not on game day.",
    "Athletes will push through pain. It is YOUR job to protect them.",
    "If you would not want YOUR child playing in this, cancel it.",
    "Weather does not care about championships. Respect it.",
    "The best coaches know when NOT to play.",
    "Safety is not a suggestion. It is a requirement."
  ];
  response += `\n--- COACH TIP ---\n${random(coachTips)}`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getHydrationPlan, 
  getLightningProtocol, 
  getWBGTCategory, 
  getColdRiskCategory,
  calculatePerformanceImpact,
  getYouthSportsAdvice,
  getElderlyExerciseAdvice,
  getPregnancyExerciseAdvice
};

export default getSportsAdvice;
