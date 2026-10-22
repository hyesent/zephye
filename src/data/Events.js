import {
  calcHeatIndex,
  calcWindChill,
  getBurnTime,
  getComfortScore,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getDayLength,
  calculateDewPoint,
  getUVLevel,
  getAQICategory
} from './calculations';

// ============================================================================
// COMPREHENSIVE EVENT WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  // WEDDINGS
  "Should I have my wedding outdoors today?",
  "Is it good weather for an outdoor wedding ceremony?",
  "Will it rain on my wedding day?",
  "Should I rent a tent for my wedding?",
  "Is it too hot for an outdoor wedding?",
  "Will my wedding photos be ruined by weather?",
  "Should I have an indoor backup for my wedding?",
  "What time should I schedule my wedding ceremony?",
  "Will it be windy for my wedding?",
  "Is it safe for elderly guests at my outdoor wedding?",
  
  // GENERAL EVENTS
  "Is it good weather for a picnic?",
  "Can I host a BBQ this weekend?",
  "Is it safe for an outdoor concert?",
  "Should I move my event indoors?",
  "Will rain cancel my party?",
  "Is it too windy for tents?",
  "Good weather for a beach day?",
  "Should I rent heaters for my event?",
  "Is it too hot for a garden party?",
  "Can I set up a bounce house?",
  "Is fog an issue for my morning event?",
  "Should I worry about thunderstorms?",
  "What time should I start my outdoor event?",
  "Do I need flooring for my tent?",
  "Will my cake melt outside?",
  "Can I have fireworks tonight?",
  "Is it safe for a bonfire?",
  "Should I cancel the pool party?",
  "Will my decorations survive the wind?",
  "Do I need to worry about mosquitoes?",
  "Can I set up outdoor lighting?",
  "Is it too cold for an evening reception?",
  "Should I provide blankets for guests?",
  "Will the grass be too wet for seating?",
  "Can I have an outdoor dance floor?",
  "Is it safe for elderly guests outside?",
  "Should I worry about heat stroke?",
  "Can I serve food outside safely?",
  "Will my tent withstand the weather?",
  "Is it good weather for photos?",
  "Should I rent air conditioning for my tent?",
  "Can I have a sunrise ceremony?",
  "Is sunset viewing good tonight?",
  "Will humidity ruin my hair and makeup?",
  "Can I use candles outside?",
  "Should I postpone my outdoor market?",
  "Is it safe for a children's outdoor party?",
  "Can I have live music outside?",
  "Will the sound system be affected?",
  "Do I need permits for bad weather contingency?",
  "Should I have a rain plan B?",
  "What is the comfort level for guests?",
  "Can I serve champagne outside?",
  "Will my flowers wilt?",
  "Is it good weather for a marquee?",
  "Should I have a temperature-controlled tent?",
  "Can I set up outdoor games?",
  "Will the porta-potties be an issue?",
  "Is parking accessible in this weather?",
  
  // CORPORATE
  "Is it good weather for a corporate retreat?",
  "Should I host my team-building event outdoors?",
  "Will weather affect my outdoor meeting?",
  "Is it safe for outdoor team activities?",
  
  // FESTIVALS
  "Will the festival be affected by weather?",
  "Should I postpone my food festival?",
  "Is it safe for outdoor vendors?",
  "Will my outdoor market be successful?",
  
  // PHOTOGRAPHY
  "Will my photos be good today?",
  "What is the best time for outdoor photography?",
  "Will the sunset be visible today?",
  "Is there good lighting for photos?",
  
  // SPECIAL
  "Can I have a kids' party outside today?",
  "Is it safe for a pet event outdoors?",
  "Should I have my charity gala outside?",
  "Is it good weather for a car show?",
  "Can I host a sports event outside today?"
];

// ============================================================================
// ENHANCED EVENT TYPE DATABASE
// ============================================================================

const EVENT_TYPES = {
  wedding: {
    sensitivity: 10,
    typicalDuration: 6,
    guestCount: 'large',
    setupTime: 8,
    criticalElements: ['ceremony', 'photos', 'food', 'dancing'],
    weatherTolerance: {
      rain: 2,
      wind: 4,
      heat: 5,
      cold: 4,
      humidity: 4
    },
    special: [
      'Wedding dress and attire considerations',
      'Photography lighting needs',
      'Hair and makeup humidity sensitivity',
      'Cake and food temperature requirements',
      'Flower preservation',
      'Sound system for vows',
      'Formal attire comfort in extreme conditions',
      'Elderly guests common'
    ]
  },
  corporate_event: {
    sensitivity: 7,
    typicalDuration: 4,
    guestCount: 'medium-large',
    setupTime: 4,
    criticalElements: ['presentations', 'networking', 'catering'],
    weatherTolerance: {
      rain: 6,
      wind: 5,
      heat: 6,
      cold: 5,
      humidity: 7
    },
    special: [
      'AV equipment sensitivity',
      'Professional attire comfort',
      'Networking space comfort',
      'Branding and signage durability',
      'Client impression important'
    ]
  },
  birthday_party: {
    sensitivity: 5,
    typicalDuration: 4,
    guestCount: 'small-medium',
    setupTime: 2,
    criticalElements: ['games', 'food', 'socializing'],
    weatherTolerance: {
      rain: 3,
      wind: 4,
      heat: 4,
      cold: 3,
      humidity: 5
    },
    special: [
      'Children\'s heat and cold sensitivity',
      'Party decoration durability',
      'Game and activity equipment',
      'Cake preservation',
      'Parents expect safe environment'
    ]
  },
  concert: {
    sensitivity: 8,
    typicalDuration: 4,
    guestCount: 'very large',
    setupTime: 12,
    criticalElements: ['sound', 'stage', 'crowd safety', 'equipment'],
    weatherTolerance: {
      rain: 2,
      wind: 3,
      heat: 5,
      cold: 6,
      humidity: 5
    },
    special: [
      'Stage structural integrity',
      'Electrical equipment safety',
      'Crowd comfort in extreme conditions',
      'Sound propagation in different conditions',
      'Artist and crew safety',
      'Emergency evacuation plan required'
    ]
  },
  festival: {
    sensitivity: 6,
    typicalDuration: 12,
    guestCount: 'very large',
    setupTime: 24,
    criticalElements: ['multiple stages', 'food vendors', 'crowd management'],
    weatherTolerance: {
      rain: 4,
      wind: 3,
      heat: 4,
      cold: 4,
      humidity: 5
    },
    special: [
      'Multi-day weather planning',
      'Ground conditions and mud prevention',
      'Vendor equipment protection',
      'Camping and outdoor accommodations',
      'Emergency services access',
      'Public safety paramount'
    ]
  },
  picnic: {
    sensitivity: 4,
    typicalDuration: 3,
    guestCount: 'small',
    setupTime: 1,
    criticalElements: ['seating', 'food', 'comfort'],
    weatherTolerance: {
      rain: 1,
      wind: 3,
      heat: 3,
      cold: 2,
      humidity: 4
    },
    special: [
      'Food safety temperatures',
      'Ground moisture',
      'Insect activity',
      'Shade availability',
      'Easy to reschedule'
    ]
  },
  bbq: {
    sensitivity: 5,
    typicalDuration: 5,
    guestCount: 'small-medium',
    setupTime: 2,
    criticalElements: ['grill', 'seating', 'food prep'],
    weatherTolerance: {
      rain: 2,
      wind: 3,
      heat: 5,
      cold: 3,
      humidity: 5
    },
    special: [
      'Grill safety in wind',
      'Smoke direction management',
      'Food temperature maintenance',
      'Fire safety considerations',
      'Propane and charcoal storage'
    ]
  },
  pool_party: {
    sensitivity: 6,
    typicalDuration: 5,
    guestCount: 'medium',
    setupTime: 2,
    criticalElements: ['pool', 'safety', 'refreshments'],
    weatherTolerance: {
      rain: 2,
      wind: 4,
      heat: 9,
      cold: 0,
      humidity: 8
    },
    special: [
      'Lightning safety (pool is dangerous)',
      'Sun exposure intensity',
      'Water temperature comfort',
      'Slip hazards when wet',
      'Children supervision requirements'
    ]
  },
  beach_event: {
    sensitivity: 7,
    typicalDuration: 4,
    guestCount: 'medium',
    setupTime: 3,
    criticalElements: ['tide', 'sand', 'sun', 'wind'],
    weatherTolerance: {
      rain: 2,
      wind: 3,
      heat: 8,
      cold: 1,
      humidity: 9
    },
    special: [
      'Tide schedule consideration',
      'Sand management in wind',
      'Salt spray on equipment',
      'Stronger sun reflection from sand and water',
      'Footwear needed for hot sand'
    ]
  },
  garden_party: {
    sensitivity: 6,
    typicalDuration: 4,
    guestCount: 'medium',
    setupTime: 3,
    criticalElements: ['garden aesthetics', 'seating', 'catering'],
    weatherTolerance: {
      rain: 2,
      wind: 3,
      heat: 4,
      cold: 3,
      humidity: 5
    },
    special: [
      'Plant and lawn damage prevention',
      'Ground softness',
      'Pollen levels',
      'Insect management',
      'Aesthetic quality of garden'
    ]
  },
  sports_event: {
    sensitivity: 7,
    typicalDuration: 4,
    guestCount: 'large',
    setupTime: 6,
    criticalElements: ['field or venue', 'spectators', 'equipment', 'safety'],
    weatherTolerance: {
      rain: 3,
      wind: 4,
      heat: 5,
      cold: 4,
      humidity: 5
    },
    special: [
      'Playing surface conditions',
      'Athlete safety in extreme conditions',
      'Spectator comfort',
      'Cancellation thresholds',
      'Insurance and liability'
    ]
  },
  market: {
    sensitivity: 5,
    typicalDuration: 8,
    guestCount: 'variable',
    setupTime: 4,
    criticalElements: ['stalls', 'crowd flow', 'vendor goods'],
    weatherTolerance: {
      rain: 3,
      wind: 4,
      heat: 5,
      cold: 4,
      humidity: 6
    },
    special: [
      'Vendor product protection',
      'Customer dwell time in bad weather',
      'Ground conditions',
      'Wind protection for displays',
      'Vendor revenue impact'
    ]
  },
  fundraiser: {
    sensitivity: 8,
    typicalDuration: 4,
    guestCount: 'medium-large',
    setupTime: 6,
    criticalElements: ['speakers', 'auction', 'dining'],
    weatherTolerance: {
      rain: 4,
      wind: 4,
      heat: 5,
      cold: 5,
      humidity: 5
    },
    special: [
      'High-value item protection',
      'Donor comfort (often older demographic)',
      'AV equipment for speeches',
      'Silent auction display protection',
      'Donor experience paramount'
    ]
  },
  religious_ceremony: {
    sensitivity: 9,
    typicalDuration: 3,
    guestCount: 'medium-large',
    setupTime: 4,
    criticalElements: ['ceremony', 'gathering', 'tradition'],
    weatherTolerance: {
      rain: 3,
      wind: 4,
      heat: 4,
      cold: 4,
      humidity: 5
    },
    special: [
      'Ritual and ceremonial requirements',
      'Elderly attendees common',
      'Formal attire considerations',
      'Sacred space protection',
      'Reverence and solemnity'
    ]
  }
};

// ============================================================================
// ENHANCED VENUE STRUCTURE DATABASE
// ============================================================================

const STRUCTURES = {
  open_air: {
    windResistance: 0,
    rainProtection: 0,
    sunProtection: 0,
    temperatureControl: 0,
    maxWindSpeed: 25,
    maxTemp: 35,
    minTemp: 10,
    costPerSqFt: 0,
    setupTimeHours: 0,
    notes: 'Completely exposed. All weather directly impacts guests.'
  },
  popup_canopy: {
    windResistance: 2,
    rainProtection: 5,
    sunProtection: 6,
    temperatureControl: 1,
    maxWindSpeed: 25,
    maxTemp: 38,
    minTemp: 5,
    costPerSqFt: 5,
    setupTimeHours: 1,
    notes: 'Light duty. Secure with weights. Not for wind over 25km/h.'
  },
  event_tent_small: {
    windResistance: 4,
    rainProtection: 8,
    sunProtection: 7,
    temperatureControl: 2,
    maxWindSpeed: 35,
    maxTemp: 40,
    minTemp: 0,
    costPerSqFt: 12,
    setupTimeHours: 3,
    notes: '10x10 to 20x20. Can add sides. Portable heaters and fans optional.'
  },
  event_tent_large: {
    windResistance: 5,
    rainProtection: 9,
    sunProtection: 8,
    temperatureControl: 4,
    maxWindSpeed: 40,
    maxTemp: 42,
    minTemp: -5,
    costPerSqFt: 18,
    setupTimeHours: 6,
    notes: '20x30 and larger. Professional setup. Can add flooring, HVAC, lighting.'
  },
  marquee: {
    windResistance: 6,
    rainProtection: 9,
    sunProtection: 8,
    temperatureControl: 5,
    maxWindSpeed: 45,
    maxTemp: 43,
    minTemp: -10,
    costPerSqFt: 25,
    setupTimeHours: 8,
    notes: 'Luxury tent. Hard walls option. Full climate control possible.'
  },
  clearspan: {
    windResistance: 8,
    rainProtection: 10,
    sunProtection: 9,
    temperatureControl: 7,
    maxWindSpeed: 60,
    maxTemp: 45,
    minTemp: -20,
    costPerSqFt: 35,
    setupTimeHours: 12,
    notes: 'Industrial grade. No center poles. Full HVAC capable.'
  },
  pavilion: {
    windResistance: 5,
    rainProtection: 7,
    sunProtection: 7,
    temperatureControl: 2,
    maxWindSpeed: 40,
    maxTemp: 38,
    minTemp: 5,
    costPerSqFt: 0,
    setupTimeHours: 0,
    notes: 'Permanent roof structure. Open sides. Limited weather protection.'
  },
  gazebo: {
    windResistance: 3,
    rainProtection: 5,
    sunProtection: 6,
    temperatureControl: 1,
    maxWindSpeed: 30,
    maxTemp: 36,
    minTemp: 8,
    costPerSqFt: 0,
    setupTimeHours: 0,
    notes: 'Small, decorative. Good for ceremonies, not full events.'
  },
  indoor_backup: {
    windResistance: 10,
    rainProtection: 10,
    sunProtection: 10,
    temperatureControl: 10,
    maxWindSpeed: 200,
    maxTemp: 50,
    minTemp: -50,
    costPerSqFt: 0,
    setupTimeHours: 0,
    notes: 'Complete weather protection. Always have as Plan B for critical events.'
  }
};

// ============================================================================
// ENHANCED EQUIPMENT & RENTAL DATABASE
// ============================================================================

const EQUIPMENT_NEEDS = {
  patio_heater: {
    coverage: '15ft radius',
    tempRise: '5-10°C',
    minTemp: -10,
    maxWind: 25,
    powerWatts: 1500,
    costPerUnit: 150,
    notes: 'Wind reduces effectiveness. 1 per 20 guests in cold.'
  },
  industrial_heater: {
    coverage: '30ft radius',
    tempRise: '10-20°C',
    minTemp: -30,
    maxWind: 35,
    powerWatts: 5000,
    costPerUnit: 300,
    notes: 'Enclosed tent needed. Professional installation required.'
  },
  misting_fan: {
    coverage: '10ft radius',
    tempDrop: '3-7°C',
    maxTemp: 45,
    maxHumidity: 60,
    powerWatts: 200,
    costPerUnit: 80,
    notes: 'Ineffective in high humidity. Increases moisture.'
  },
  portable_ac: {
    coverage: '400 sq ft',
    tempDrop: '10-15°C',
    maxTemp: 45,
    powerWatts: 3500,
    costPerUnit: 400,
    notes: 'Requires enclosed space. Generator may be needed.'
  },
  evaporative_cooler: {
    coverage: '500 sq ft',
    tempDrop: '8-12°C',
    maxTemp: 45,
    maxHumidity: 50,
    powerWatts: 500,
    costPerUnit: 250,
    notes: 'Only works in dry heat. Adds humidity.'
  },
  flooring: {
    types: ['plywood', 'composite', 'carpet', 'dance floor'],
    costPerSqFt: 8,
    notes: 'Essential for wet ground. Protects heels, wheelchairs, and equipment.'
  },
  lighting: {
    types: ['string', 'spot', 'flood', 'decorative'],
    weatherRating: 'Must be outdoor rated if exposed',
    costPerUnit: 50,
    notes: 'IP65 minimum for outdoor use. GFCI protection required.'
  },
  sound_system: {
    windImpact: 'Wind disperses sound, especially over 20km/h',
    rainProtection: 'Must be fully covered',
    costPerDay: 500,
    notes: 'Extra speakers needed in wind. Bass travels less in humid air.'
  },
  generator: {
    power: 'Variable',
    costPerDay: 200,
    notes: 'Always have backup. Fuel for 2x expected runtime.'
  }
};

// ============================================================================
// FOOD & BEVERAGE SAFETY CALCULATOR
// ============================================================================

function getFoodSafetyAdvice(data) {
  const { temp, humidity, uvIndex, condition, wind } = data;
  const advice = [];
  const warnings = [];
  const heatIndex = calcHeatIndex(temp, humidity);
  let riskLevel = 'low';
  
  advice.push("FOOD AND BEVERAGE SAFETY:");
  
  // Temperature safety
  if (heatIndex > 35) {
    riskLevel = 'extreme';
    warnings.push("EXTREME HEAT: Food safety critical");
    advice.push("  Bacteria doubles every 20 minutes above 32°C");
    advice.push("  Cold food: must stay below 4°C. Use ice baths, replace ice frequently.");
    advice.push("  Hot food: must stay above 60°C. Chafing dishes with sterno fuel.");
    advice.push("  Serve in shifts rather than leaving all food out at once");
    advice.push("  Discard any food left out after 1 hour (2 hours maximum)");
    advice.push("  Seafood, dairy, mayonnaise-based dishes: extreme risk. Consider eliminating.");
    
  } else if (temp > 28) {
    riskLevel = 'high';
    warnings.push("HIGH TEMPERATURE: Food safety risk");
    advice.push("  Monitor food temperatures constantly");
    advice.push("  2-hour rule: discard any food left out over 2 hours");
    advice.push("  Keep cold food on ice. Hot food in thermal containers.");
    advice.push("  Cream-based desserts are risky. Consider fruit-based alternatives.");
    
  } else if (temp > 25) {
    riskLevel = 'moderate';
    advice.push("  Warm conditions: Monitor food temps regularly");
    advice.push("  Cold food on ice. Hot food in chafing dishes.");
    
  } else if (temp < 5) {
    riskLevel = 'moderate';
    advice.push("  Cold conditions: Hot food cools rapidly");
    advice.push("  Use insulated containers. Warm food frequently.");
    advice.push("  Guests eat slower in cold - keep food warm longer.");
    
  } else {
    advice.push("  Temperature safe for food service");
  }
  
  // UV effects
  if (uvIndex > 6) {
    advice.push("  UV and direct sun: Food wilts and dries fast");
    advice.push("  Keep all food in shade. Refrigerate until serving.");
    advice.push("  Butter, chocolate, cheese will melt in sun");
    advice.push("  Ice cream impossible to serve outdoors in these conditions");
    advice.push("  Wine warms quickly. White and rosé in ice buckets. Red in shade.");
  }
  
  // Rain effects
  if (condition === 'rain' || condition === 'drizzle') {
    warnings.push("RAIN: Water contamination risk");
    advice.push("  Cover all food. Rainwater causes food poisoning risk.");
    advice.push("  Use lidded chafing dishes and covered cake stands.");
    advice.push("  No open bowls of chips, nuts, or other snacks");
    advice.push("  Umbrellas over buffet stations. Wet guests = wet food.");
  }
  
  // Wind effects
  if (wind > 20) {
    advice.push("  Wind: Dust and debris in food");
    advice.push("  All food must be covered when not serving");
    advice.push("  Napkins, plates, cups become projectiles. Weight everything.");
    advice.push("  Use heavy tablecloths. Secure with clips.");
  }
  
  // Specific items
  if (temp > 28) {
    advice.push("");
    advice.push("SPECIFIC ITEM WARNINGS:");
    advice.push("  CAKE: Buttercream melts above 28°C. Fondant sweats.");
    advice.push("  Consider faux display cake with sheet cake in fridge.");
    advice.push("  Chocolate fountain: impossible above 25°C");
    advice.push("  Champagne: Warm bottles foam excessively. Keep in ice 20 minutes before.");
    advice.push("  Red wine: Serve slightly chilled (16-18°C) in heat.");
    advice.push("  Cocktails: Ice melts instantly. Pre-batch and chill. Extra ice needed.");
  }
  
  return { advice, warnings, riskLevel };
}

// ============================================================================
// ENHANCED GUEST COMFORT CALCULATOR
// ============================================================================

function getGuestComfortScore(data, eventType = 'birthday_party') {
  const { temp, humidity, wind, uvIndex, precipitation, condition } = data;
  let score = 100;
  const deductions = [];
  const eventConfig = EVENT_TYPES[eventType] || EVENT_TYPES.birthday_party;
  const tolerance = eventConfig.weatherTolerance || { rain: 5, wind: 5, heat: 5, cold: 5, humidity: 5 };
  
  // Temperature penalties
  if (temp < -5) {
    score -= 40 * (10 - tolerance.cold) / 10;
    deductions.push('Extreme cold (below -5°C)');
  } else if (temp < 0) {
    score -= 25 * (10 - tolerance.cold) / 10;
    deductions.push('Freezing temperatures');
  } else if (temp < 5) {
    score -= 15 * (10 - tolerance.cold) / 10;
    deductions.push('Very cold');
  } else if (temp < 10) {
    score -= 8 * (10 - tolerance.cold) / 10;
    deductions.push('Cold conditions');
  } else if (temp < 15) {
    score -= 3 * (10 - tolerance.cold) / 10;
    deductions.push('Cool conditions');
  } else if (temp > 40) {
    score -= 40 * (10 - tolerance.heat) / 10;
    deductions.push('Extreme heat (above 40°C)');
  } else if (temp > 35) {
    score -= 25 * (10 - tolerance.heat) / 10;
    deductions.push('Dangerous heat');
  } else if (temp > 30) {
    score -= 15 * (10 - tolerance.heat) / 10;
    deductions.push('Very hot');
  } else if (temp > 28) {
    score -= 8 * (10 - tolerance.heat) / 10;
    deductions.push('Hot conditions');
  }
  
  // Precipitation penalties
  if (condition === 'thunderstorm') {
    score -= 50 * (10 - tolerance.rain) / 10;
    deductions.push('Thunderstorm (dangerous)');
  } else if (precipitation > 15) {
    score -= 30 * (10 - tolerance.rain) / 10;
    deductions.push('Heavy rain');
  } else if (precipitation > 10) {
    score -= 20 * (10 - tolerance.rain) / 10;
    deductions.push('Moderate rain');
  } else if (precipitation > 5) {
    score -= 15 * (10 - tolerance.rain) / 10;
    deductions.push('Light rain');
  } else if (precipitation > 0) {
    score -= 8 * (10 - tolerance.rain) / 10;
    deductions.push('Drizzle');
  }
  
  // Wind penalties
  if (wind > 60) {
    score -= 35 * (10 - tolerance.wind) / 10;
    deductions.push('Hurricane-force wind');
  } else if (wind > 45) {
    score -= 25 * (10 - tolerance.wind) / 10;
    deductions.push('Dangerous wind');
  } else if (wind > 35) {
    score -= 18 * (10 - tolerance.wind) / 10;
    deductions.push('Very strong wind');
  } else if (wind > 25) {
    score -= 10 * (10 - tolerance.wind) / 10;
    deductions.push('Strong wind');
  } else if (wind > 15) {
    score -= 5 * (10 - tolerance.wind) / 10;
    deductions.push('Breezy');
  }
  
  // Humidity penalties
  if (humidity > 90) {
    score -= 15 * (10 - tolerance.humidity) / 10;
    deductions.push('Oppressive humidity');
  } else if (humidity > 80) {
    score -= 10 * (10 - tolerance.humidity) / 10;
    deductions.push('High humidity');
  } else if (humidity > 70) {
    score -= 5 * (10 - tolerance.humidity) / 10;
    deductions.push('Moderate humidity');
  } else if (humidity < 20) {
    score -= 5 * (10 - tolerance.humidity) / 10;
    deductions.push('Very dry');
  }
  
  // UV penalties
  if (uvIndex > 11) {
    score -= 15;
    deductions.push('Extreme UV (burn in under 10 minutes)');
  } else if (uvIndex > 8) {
    score -= 10;
    deductions.push('Very high UV');
  } else if (uvIndex > 6) {
    score -= 5;
    deductions.push('High UV');
  }
  
  // Event type sensitivity adjustment
  if (eventConfig.sensitivity > 8) {
    // High-sensitivity events get larger penalties
    score = score * 0.9;
  }
  
  return {
    score: Math.max(0, Math.round(score)),
    deductions,
    rating: score > 80 ? 'Excellent' : score > 65 ? 'Good' : score > 50 ? 'Fair' : score > 35 ? 'Poor' : 'Unacceptable',
    isSafe: score > 40
  };
}

// ============================================================================
// ENHANCED DECORATION & SETUP ADVISOR
// ============================================================================

function getDecorationAdvice(data) {
  const { wind, precipitation, condition, temp, humidity, uvIndex } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'low';
  
  advice.push("DECORATIONS AND SETUP:");
  
  // Wind effects
  if (wind > 40) {
    riskLevel = 'extreme';
    warnings.push("EXTREME WIND: Decorations are dangerous");
    advice.push("  All lightweight decorations WILL become projectiles");
    advice.push("  No balloons of any kind (even weighted)");
    advice.push("  No paper decorations, tablecloths, or freestanding signs");
    advice.push("  Floral arrangements: heavy bases only. No tall centerpieces.");
    advice.push("  Backdrops and arches: professional rigging required");
    advice.push("  Sandbags on all bases (100lbs minimum per base)");
    
  } else if (wind > 30) {
    riskLevel = 'high';
    warnings.push("HIGH WIND: Decorations at risk");
    advice.push("  Secure all decorations. Tablecloth weights every 2 feet.");
    advice.push("  Balloons ok if heavily weighted (3x normal weight)");
    advice.push("  No hanging decorations without wind damping");
    advice.push("  Candles: impossible to keep lit. Use LED alternatives.");
    advice.push("  No paper lanterns or streamers");
    
  } else if (wind > 20) {
    riskLevel = 'moderate';
    advice.push("  Moderate wind: Secure tablecloths with clips");
    advice.push("  Balloons need extra weight (2x normal)");
    advice.push("  Candles in hurricanes or glass vases only");
    advice.push("  Napkins and place cards need holders");
    
  } else if (wind > 10) {
    advice.push("  Light breeze: Tablecloth weights recommended");
    advice.push("  Place cards and menus need holders");
    advice.push("  Candles in hurricanes recommended");
  }
  
  // Rain effects
  if (precipitation > 0) {
    advice.push("");
    advice.push("RAIN PROTECTION FOR DECORATIONS:");
    advice.push("  Paper items: menus, place cards, signage = ruined in rain");
    advice.push("  Laminate or waterproof all printed materials");
    advice.push("  Flowers: certain varieties wilt instantly (peonies, garden roses)");
    advice.push("  Fabric decorations: water stains. Use synthetic fabrics.");
    advice.push("  String lights: must be waterproof rated (IP65+)");
    advice.push("  Candles: protect from water (use glass enclosures)");
  }
  
  // Heat effects
  if (temp > 32) {
    advice.push("");
    advice.push("HEAT PROTECTION FOR DECORATIONS:");
    advice.push("  Flowers: wilt fast in heat. Keep in water until last moment.");
    advice.push("  Hydrangeas, tulips, ranunculus droop in heat");
    advice.push("  Candles: soften and bend. Use LED or keep refrigerated.");
    advice.push("  Balloons: expand in heat, may pop. Under-inflate by 10%.");
    advice.push("  Floral foam: keep saturated. Mist flowers frequently.");
  }
  
  if (temp < 5) {
    advice.push("");
    advice.push("COLD PROTECTION FOR DECORATIONS:");
    advice.push("  Flowers: freeze damage to tropical varieties");
    advice.push("  Roses, carnations, chrysanthemums handle cold best");
    advice.push("  Balloons: shrink in cold. Over-inflate by 10%.");
    advice.push("  Vinyl signage: becomes brittle. Handle carefully.");
  }
  
  // UV effects
  if (uvIndex > 6) {
    advice.push("");
    advice.push("UV PROTECTION:");
    advice.push("  Colored items: will fade in direct sun");
    advice.push("  Paper items: will yellow and become brittle");
    advice.push("  Use UV-resistant materials where possible");
    advice.push("  Provide shade for all decorative items");
  }
  
  return { advice, warnings, riskLevel };
}

// ============================================================================
// ENHANCED PHOTOGRAPHY CONDITIONS
// ============================================================================

function getPhotographyConditions(data) {
  const { temp, condition, uvIndex, wind, sunPosition, humidity, timeOfDay } = data;
  const advice = [];
  const warnings = [];
  let quality = 8; // scale 1-10
  
  advice.push("PHOTOGRAPHY CONDITIONS:");
  
  // Light quality
  if (sunPosition === 'golden_hour' || sunPosition === 'sunset') {
    quality = 10;
    advice.push("  PERFECT LIGHT: Golden hour conditions");
    advice.push("  Soft, warm, flattering light for all subjects");
    advice.push("  Schedule key photos during this window");
    advice.push("  Duration: approximately 30-45 minutes");
    
  } else if (sunPosition === 'sunrise') {
    quality = 9;
    advice.push("  BEAUTIFUL MORNING LIGHT");
    advice.push("  Soft directional light. Good for landscapes and portraits.");
    advice.push("  Best for outdoor ceremonies and early photos.");
    
  } else if (sunPosition === 'harsh_midday' || sunPosition === 'midday') {
    quality = 4;
    warnings.push("HARSH LIGHT: Midday sun causes unflattering shadows");
    advice.push("  Seek open shade (edge of building, large tree)");
    advice.push("  Consider canopy or scrim to diffuse light");
    advice.push("  Use fill flash to reduce raccoon eyes");
    advice.push("  Overcast conditions actually better at this time");
    
  } else if (condition === 'cloudy' || condition === 'overcast') {
    quality = 8;
    advice.push("  SOFT LIGHT: Clouds act as giant softbox");
    advice.push("  Even, flattering light for portraits");
    advice.push("  Colors appear more saturated");
    advice.push("  No harsh shadows, ideal for group photos");
    
  } else {
    quality = 7;
    advice.push("  Good conditions for most photography");
  }
  
  // Wind effects
  if (wind > 25) {
    quality = Math.max(1, quality - 3);
    warnings.push("HIGH WIND: Photography challenging");
    advice.push("  Hair will fly. Veil chaos. Have stylist on standby.");
    advice.push("  Light clothing and dresses will billow");
    advice.push("  Tripods may vibrate - use heavy weights");
    advice.push("  Lenses exposed to dust - bring cleaning supplies");
    
  } else if (wind > 15) {
    quality = Math.max(1, quality - 1);
    advice.push("  Wind: Hair will move. Work quickly for posed shots.");
    advice.push("  Use faster shutter speed to freeze motion");
  }
  
  // UV effects
  if (uvIndex > 8) {
    warnings.push("EXTREME UV: Squinting subjects");
    advice.push("  Guests will squint in direct sun");
    advice.push("  Schedule photos in shade");
    advice.push("  Backlit photos beautiful but need fill flash or reflector");
    advice.push("  Use polarizing filter to reduce glare");
    
  } else if (uvIndex > 6) {
    advice.push("  Bright sun: Some squinting. Use shade where possible.");
    advice.push("  Polarizing filter recommended");
  }
  
  // Temperature effects
  if (temp > 35) {
    advice.push("  HEAT: Equipment overheating risk");
    advice.push("  Keep cameras in shade when not in use");
    advice.push("  Extra batteries (heat drains batteries)");
    advice.push("  Lens fogging: acclimate equipment slowly");
    
  } else if (temp < 0) {
    warnings.push("FREEZING: Equipment issues");
    advice.push("  Batteries lose 40-50% capacity in cold");
    advice.push("  Keep batteries in pocket to preserve charge");
    advice.push("  Lens fogging: acclimate before use");
    advice.push("  Condensation: let equipment warm slowly");
  }
  
  // Humidity effects
  if (humidity > 80) {
    advice.push("  HIGH HUMIDITY: Lens fogging risk");
    advice.push("  Acclimate equipment before use");
    advice.push("  Use silica gel packs in camera bag");
    advice.push("  Moisture can damage electronics");
  }
  
  return { advice, warnings, quality };
}

// ============================================================================
// EVENT TIMING OPTIMIZER
// ============================================================================

function getEventTimingOptimizer(data) {
  const { temp, tempMax, tempMin, uvIndex, precipitationProbability, wind, condition, sunrise, sunset } = data;
  const advice = [];
  const windows = [];
  
  advice.push("EVENT TIMING OPTIMIZATION:");
  
  // Temperature windows
  if (tempMax > 35) {
    advice.push(`  AVOID 11am-5pm (above ${tempMax}°C)`);
    windows.push({ time: '6am-10am', tempRange: `${tempMin}-${Math.round(tempMin + 8)}°C`, quality: 'Excellent' });
    windows.push({ time: '6pm-10pm', tempRange: `${Math.round(tempMax - 5)}-${Math.round(tempMin)}°C`, quality: 'Good' });
    
  } else if (tempMax > 30) {
    advice.push(`  Caution 12pm-4pm (above 30°C)`);
    windows.push({ time: '8am-11am', tempRange: `${Math.round(tempMin + 5)}-${Math.round(tempMax - 3)}°C`, quality: 'Excellent' });
    windows.push({ time: '5pm-9pm', tempRange: `${Math.round(tempMax - 5)}-${Math.round(tempMin + 3)}°C`, quality: 'Good' });
    
  } else if (tempMin < 5) {
    advice.push(`  Best: 11am-3pm (warmest hours)`);
    windows.push({ time: '11am-3pm', tempRange: `${Math.round(tempMin + 5)}-${Math.round(tempMax)}°C`, quality: 'Excellent' });
    advice.push(`  Avoid: before 9am and after 6pm (below ${Math.round(tempMin)}°C)`);
    
  } else {
    windows.push({ time: 'All day', tempRange: `${Math.round(tempMin)}-${Math.round(tempMax)}°C`, quality: 'Excellent' });
    windows.push({ time: 'Morning or evening', tempRange: 'Comfortable all day', quality: 'Good' });
  }
  
  // UV timing
  if (uvIndex > 8) {
    advice.push(`  Peak UV 10am-3pm (UV ${uvIndex}) - avoid exposure`);
    advice.push(`  Low UV before 8am and after 5pm - safer for outdoor`);
  } else if (uvIndex > 6) {
    advice.push(`  Moderate UV until 4pm. Shade essential midday.`);
  }
  
  // Rain probability
  if (precipitationProbability > 30) {
    advice.push(`  ${precipitationProbability}% chance of rain`);
    advice.push(`  Consider flexible timing or indoor backup`);
    advice.push(`  Monitor radar for clearing windows`);
  }
  
  // Wind timing
  if (wind > 15) {
    advice.push(`  Calmer conditions usually in morning (6am-10am)`);
    advice.push(`  Wind peaks 2pm-6pm. Evening winds often decrease after sunset.`);
  }
  
  // Light conditions
  advice.push("");
  advice.push("OPTICAL CONDITIONS:");
  advice.push(`  Sunrise: ${sunrise} - Beautiful for morning events`);
  advice.push(`  Sunset: ${sunset} - Golden hour for photography`);
  advice.push(`  Total daylight: ${getDayLength(data)} hours`);
  
  // Recommended window
  if (windows.length > 0) {
    advice.push("");
    advice.push("RECOMMENDED TIME WINDOWS:");
    windows.forEach(w => {
      advice.push(`  ${w.time}: ${w.tempRange} (${w.quality})`);
    });
  }
  
  return advice;
}

// ============================================================================
// MAIN EVENTS ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getEventsAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, tempMax, tempMin, condition, conditionCode, 
    humidity, wind, windGust, uvIndex, aqi, visibility, 
    precipitation, precipitationProbability, city, pressure,
    dewPoint, sunrise, sunset, moonPhase
  } = data;
  
  const q = question.toLowerCase();
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const timeOfDay = getTimeOfDay();
  const season = getSeason();
  const sunPos = getSunPosition(data);
  const dayLength = getDayLength(data);
  const aqiLevel = getAQICategory(aqi);
  const uvLevel = getUVLevel(uvIndex);
  
  // Detect event type
  const eventType = 
    q.includes('wedding') || q.includes('marriage') ? 'wedding' :
    q.includes('corporate') || q.includes('conference') || q.includes('meeting') ? 'corporate_event' :
    q.includes('birthday') || q.includes('anniversary') ? 'birthday_party' :
    q.includes('concert') || q.includes('music') ? 'concert' :
    q.includes('festival') ? 'festival' :
    q.includes('picnic') ? 'picnic' :
    q.includes('bbq') || q.includes('barbecue') || q.includes('grill') ? 'bbq' :
    q.includes('pool') || q.includes('swim') ? 'pool_party' :
    q.includes('beach') ? 'beach_event' :
    q.includes('garden') ? 'garden_party' :
    q.includes('sport') || q.includes('game') || q.includes('tournament') ? 'sports_event' :
    q.includes('market') || q.includes('fair') || q.includes('bazaar') ? 'market' :
    q.includes('fundraiser') || q.includes('gala') || q.includes('charity') ? 'fundraiser' :
    q.includes('religious') || q.includes('ceremony') || q.includes('service') ? 'religious_ceremony' :
    'birthday_party';

  const eventConfig = EVENT_TYPES[eventType];
  const guestScore = getGuestComfortScore(data, eventType);
  const foodSafety = getFoodSafetyAdvice(data);
  const decor = getDecorationAdvice(data);
  const photo = getPhotographyConditions(data);
  const timing = getEventTimingOptimizer(data);
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "EVENT WEATHER ASSESSMENT",
    "OUTDOOR EVENT FORECAST",
    "EVENT PLANNING WEATHER ANALYSIS",
    "CELEBRATION WEATHER ADVISORY",
    "VENUE CONDITIONS REPORT"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${tempMin}°C to ${tempMax}°C\n`;
  response += `  Humidity: ${humidity}% (${humidity > 70 ? 'HIGH' : humidity < 30 ? 'DRY' : 'MODERATE'})\n`;
  response += `  Wind: ${wind} km/h (gusts to ${windGust || wind + 5} km/h)\n`;
  response += `  Precipitation: ${precipitation || 0}mm (${precipitationProbability || 0}% chance)\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel})\n`;
  if (aqi) response += `  Air Quality: ${aqi} (${aqiLevel})\n`;
  if (visibility < 5) response += `  Visibility: ${visibility} km\n`;
  response += `  Season: ${season} | Time of day: ${timeOfDay}\n`;
  response += `  Sunrise: ${sunrise || 'N/A'} | Sunset: ${sunset || 'N/A'}\n`;
  response += `\n`;
  
  // Event info
  response += `=== EVENT DETAILS ===\n`;
  response += `  Event type: ${eventType.replace(/_/g, ' ').toUpperCase()}\n`;
  response += `  Sensitivity: ${eventConfig.sensitivity}/10\n`;
  response += `  Typical duration: ${eventConfig.typicalDuration} hours\n`;
  response += `  Setup time needed: ${eventConfig.setupTime} hours\n`;
  response += `  Guest size: ${eventConfig.guestCount}\n`;
  response += `\n`;
  
  // Guest comfort score
  response += `=== GUEST COMFORT SCORE ===\n`;
  response += `  Score: ${guestScore.score}/100 (${guestScore.rating})\n`;
  if (guestScore.deductions.length > 0) {
    response += `  Factors affecting comfort:\n`;
    guestScore.deductions.forEach(d => response += `    - ${d}\n`);
  }
  response += `\n`;
  
  // Overall verdict
  response += `=== OVERALL VERDICT ===\n`;
  if (!guestScore.isSafe) {
    response += `  CANCELLATION ADVISED: Conditions unsafe for this event.\n`;
    response += `  ${eventType.replace(/_/g, ' ').toUpperCase()} in these conditions = significant risk.\n`;
    response += `  Guest safety and event success cannot be guaranteed.\n`;
    
  } else if (guestScore.score > 80) {
    response += `  PROCEED WITH CONFIDENCE. Weather is ideal for your event.\n`;
    response += `  Excellent guest comfort. Minimal weather mitigation needed.\n`;
    response += `  Focus on creating memorable moments.\n`;
    
  } else if (guestScore.score > 65) {
    response += `  PROCEED WITH PREPARATION. Good conditions with minor adjustments.\n`;
    response += `  Implement setup recommendations below. Have indoor backup ready.\n`;
    
  } else if (guestScore.score > 50) {
    response += `  PROCEED WITH CAUTION. Challenging conditions require significant preparation.\n`;
    response += `  Strongly recommend indoor backup plan. Guest comfort will be impacted.\n`;
    
  } else {
    response += `  STRONGLY CONSIDER RESCHEDULING. Poor conditions will impact event quality.\n`;
    response += `  If proceeding, implement ALL recommendations immediately.\n`;
  }
  response += `\n`;
  
  // Weather warnings
  if (condition === 'thunderstorm') {
    response += `=== THUNDERSTORM WARNING ===\n`;
    response += `  CRITICAL: Lightning is imminent or occurring.\n`;
    response += `  All outdoor activities must stop immediately.\n`;
    response += `  Tents provide NO lightning protection.\n`;
    response += `  30-30 rule: If thunder is heard, lightning is close enough to strike.\n`;
    response += `  Wait 30 minutes after last thunder before resuming outdoor.\n`;
    response += `\n`;
  }
  
  // Temperature-specific advice
  if (temp > 35) {
    response += `=== EXTREME HEAT PLAN ===\n`;
    response += `  HEAT EXHAUSTION RISK: Feels like ${Math.round(effectiveTemp)}°C\n`;
    response += `  Required: Shade structures, misting fans, cold water stations\n`;
    response += `  Schedule: Avoid 11am-4pm. Morning or evening only.\n`;
    response += `  Clothing: Light, breathable fabrics advised for all guests\n`;
    response += `  Hydration: Water stations every 50 feet\n`;
    response += `  Medical: Heat stroke symptoms - headache, nausea, confusion\n`;
    response += `  Elderly and children: Most vulnerable. Provide dedicated cooling area.\n`;
    response += `\n`;
    
  } else if (temp < 0) {
    response += `=== EXTREME COLD PLAN ===\n`;
    response += `  HYPOTHERMIA RISK: Feels like ${Math.round(effectiveTemp)}°C\n`;
    response += `  Required: Enclosed heated tent, patio heaters, warm drinks\n`;
    response += `  Duration: Limit outdoor exposure to 15-20 minutes\n`;
    response += `  Clothing: Warm layers, hats, gloves, insulated footwear\n`;
    response += `  Facilities: Heated restroom trailers (not standard porta-potties)\n`;
    response += `  Backup: Indoor shelter immediately available\n`;
    response += `\n`;
  }
  
  // Food safety
  if (foodSafety.advice.length > 0) {
    response += `=== FOOD SAFETY ===\n`;
    response += `  Risk level: ${foodSafety.riskLevel.toUpperCase()}\n`;
    foodSafety.advice.forEach(a => response += `${a}\n`);
    response += `\n`;
  }
  
  // Decorations
  if (decor.advice.length > 0) {
    response += `=== DECORATIONS ===\n`;
    response += `  Risk level: ${decor.riskLevel.toUpperCase()}\n`;
    decor.advice.forEach(a => response += `${a}\n`);
    response += `\n`;
  }
  
  // Photography
  if (photo.advice.length > 0) {
    response += `=== PHOTOGRAPHY ===\n`;
    response += `  Quality: ${photo.quality}/10\n`;
    photo.advice.forEach(a => response += `${a}\n`);
    photo.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Timing
  if (timing.length > 0) {
    response += `=== TIMING RECOMMENDATIONS ===\n`;
    timing.forEach(t => response += `${t}\n`);
    response += `\n`;
  }
  
  // Structure recommendations
  if (wind > 15 || precipitation > 0 || temp > 30 || temp < 5) {
    response += `=== STRUCTURE RECOMMENDATIONS ===\n`;
    if (temp > 30) {
      response += `  • Air-conditioned tent or indoor venue recommended\n`;
      response += `  • Shade structures: 1 per 20 guests minimum\n`;
      response += `  • Light-colored tent fabric (reflects heat)\n`;
    }
    if (temp < 5) {
      response += `  • Enclosed tent with heating (1 heater per 200 sq ft)\n`;
      response += `  • Thermal flooring recommended\n`;
      response += `  • Heat retention: close all tent sides\n`;
    }
    if (wind > 25) {
      response += `  • Professional tent installation required (stakes + ballasts)\n`;
      response += `  • No tent sides (reduce wind load)\n`;
      response += `  • All furniture: heavy bases only\n`;
    }
    if (precipitation > 0) {
      response += `  • Raised flooring essential for wet ground\n`;
      response += `  • Covered walkways between structures\n`;
      response += `  • Waterproof everything: electrical, AV, decor\n`;
    }
    response += `\n`;
  }
  
  // Emergency kit
  if (guestScore.score < 60 || temp > 32 || temp < 0 || isRaining) {
    response += `=== EMERGENCY PREPAREDNESS ===\n`;
    response += `  • Designated weather watcher with radar access\n`;
    response += `  • Emergency shelter plan (indoor location within 30 seconds)\n`;
    response += `  • First aid kit (heat/cold specific supplies)\n`;
    response += `  • Emergency contact numbers posted\n`;
    response += `  • Extra water: 2 liters per guest minimum\n`;
    response += `  • Towels and blankets available\n`;
    response += `  • Communication plan for guests (SMS alert)\n`;
    response += `\n`;
  }
  
  // Event-specific notes
  if (eventConfig.special.length > 0) {
    response += `=== EVENT-SPECIFIC NOTES ===\n`;
    eventConfig.special.forEach(s => response += `  • ${s}\n`);
    response += `\n`;
  }
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (!guestScore.isSafe) {
    response += `  CANCEL or RELOCATE. Conditions unacceptable for this event type.\n`;
    response += `  Safety risk: ${guestScore.rating}. Liability is high.\n`;
    response += `  Activate indoor backup plan immediately.\n`;
    
  } else if (guestScore.score > 80) {
    response += `  GREAT WEATHER FOR YOUR EVENT. Enjoy the perfect conditions.\n`;
    response += `  Minimal planning needed. Focus on details and enjoyment.\n`;
    
  } else if (guestScore.score > 60) {
    response += `  GOOD WEATHER WITH MINOR PREPARATIONS. \n`;
    response += `  Follow recommendations above. Have backup ready just in case.\n`;
    response += `  Guests will be comfortable with proper amenities.\n`;
    
  } else {
    response += `  CHALLENGING WEATHER. Significant preparation required.\n`;
    response += `  Strongly consider moving to indoor venue if possible.\n`;
    response += `  If outdoor: implement ALL recommendations and safety measures.\n`;
  }
  
  // Wisdom
  const proTips = [
    "Always have 20 percent more tent space than you think. Guests cluster in bad weather.",
    "Weather contingency plans should be decided 24 hours before, not day-of.",
    "Communicate weather expectations to guests 48 hours in advance.",
    "Rent heaters or AC units early - they sell out on extreme weather days.",
    "Professional event planners always have Plan B, C, and D for weather.",
    "Tent flooring rental is the single best investment for rainy day events.",
    "Guest comfort equals guest happiness equals successful event.",
    "The best event photos often come from dramatic weather conditions.",
    "A well-fed guest is a happy guest. Food safety is non-negotiable.",
    "If you fail to plan, you plan to fail. Especially with weather."
  ];
  response += `\n--- PRO TIP ---\n${random(proTips)}`;
  
  return response;
};

// ============================================================================
// SPECIALIZED FUNCTIONS
// ============================================================================

export const getEventTimingAdvice = (data) => {
  if (!data) return "Loading weather data...";
  
  const { temp, tempMax, tempMin, uvIndex, precipitationProbability, wind, condition, sunrise, sunset } = data;
  const advice = getEventTimingOptimizer(data);
  
  let response = "EVENT TIMING ANALYSIS:\n\n";
  advice.forEach(a => response += `${a}\n`);
  
  return response;
};

export const getEventEquipmentAdvice = (data) => {
  if (!data) return "Loading weather data...";
  
  const { temp, wind, humidity, precipitation, condition } = data;
  const advice = [];
  
  advice.push("EQUIPMENT RENTAL RECOMMENDATIONS:");
  advice.push("");
  
  // Temperature-based equipment
  if (temp < 10) {
    const heaters = temp < 0 ? 'industrial' : 'patio';
    const count = Math.ceil(100 / (temp < 0 ? 15 : 20));
    advice.push("HEATING REQUIRED:");
    advice.push(`  • ${heaters === 'industrial' ? 'Industrial heaters' : 'Patio heaters'}: ${count} units needed`);
    advice.push(`  • Expected temp rise: ${temp < 0 ? '15-20' : '5-10'}°C`);
    advice.push(`  • Estimated cost: $${count * (temp < 0 ? 300 : 150)}`);
    advice.push(`  • Power: ${temp < 0 ? 'May need generator' : 'Standard outlets'}`);
    
  } else if (temp > 30) {
    const coolers = humidity < 60 ? 'evaporative' : 'misting';
    const count = Math.ceil(100 / (humidity < 60 ? 15 : 10));
    advice.push("COOLING REQUIRED:");
    advice.push(`  • ${coolers === 'evaporative' ? 'Evaporative coolers' : 'Misting fans'}: ${count} units needed`);
    advice.push(`  • Expected temp drop: ${humidity < 60 ? '8-12' : '3-7'}°C`);
    advice.push(`  • Estimated cost: $${count * (humidity < 60 ? 250 : 80)}`);
    if (temp > 38) {
      advice.push(`  • PORTABLE AC: 1 unit per 400 sq ft recommended`);
    }
  }
  
  // Rain equipment
  if (precipitation > 0) {
    advice.push("");
    advice.push("RAIN PROTECTION:");
    advice.push(`  • Tent with sides: ${Math.ceil(100/4)}x${Math.ceil(100/4)} ft minimum`);
    advice.push(`  • Raised flooring: $${Math.ceil(100*100/10)} estimated`);
    advice.push(`  • Umbrellas: ${Math.ceil(100/5)} needed for 100 guests`);
    advice.push(`  • Walkway covers between structures`);
  }
  
  // Wind equipment
  if (wind > 20) {
    advice.push("");
    advice.push("WIND PROTECTION:");
    advice.push(`  • Heavy tent stakes or ballast blocks (500lbs+ per leg)`);
    advice.push(`  • Sandbags: ${Math.ceil(100/4)} recommended`);
    advice.push(`  • Tablecloth clips: ${Math.ceil(100/2)} for 100 guests`);
    advice.push(`  • Wind screens for buffet and food stations`);
  }
  
  // Lighting
  if (condition === 'fog' || visibility < 5) {
    advice.push("");
    advice.push("LIGHTING:");
    advice.push("  • Extra pathway lighting (1 per 10ft)");
    advice.push("  • Spotlights for key areas (stage, cake, bar)");
    advice.push("  • All lighting must be IP65 rated for outdoor use");
  }
  
  // Power
  advice.push("");
  advice.push("POWER:");
  advice.push("  • Generator: 20% above calculated load");
  advice.push("  • GFCI protection for all outdoor circuits");
  advice.push("  • Weather-protected power distribution boxes");
  advice.push("  • Backup generator for critical equipment");
  
  return advice.join('\n');
};

export default getEventsAdvice;
