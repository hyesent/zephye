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
  "Should I have my wedding outdoors today?",
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
  "Will humidity ruin my hair/makeup?",
  "Can I use candles outside?",
  "Should I postpone my outdoor market?",
  "Is it safe for a children's outdoor party?",
  "Can I have live music outside?",
  "Will the sound system be affected?",
  "Do I need permits for bad weather contingency?",
  "Should I have a rain plan B?",
  "What's the comfort level for guests?",
  "Can I serve champagne outside?",
  "Will my flowers wilt?",
  "Is it good weather for a marquee?",
  "Should I have a temperature-controlled tent?",
  "Can I set up outdoor games?",
  "Will the porta-potties be an issue?",
  "Is parking accessible in this weather?"
];

// ============================================================================
// EVENT TYPE DATABASE
// ============================================================================

const EVENT_TYPES = {
  wedding: {
    sensitivity: 10,
    typicalDuration: 6,
    guestCount: 'large',
    setupTime: 8,
    criticalElements: ['ceremony', 'photos', 'food', 'dancing'],
    weatherTolerance: {
      rain: 2,        // 1-10 tolerance (10 = very tolerant)
      wind: 4,
      heat: 5,
      cold: 4,
      humidity: 4
    },
    special: [
      'Wedding dress/attire considerations',
      'Photography lighting needs',
      'Hair and makeup humidity sensitivity',
      'Cake and food temperature requirements',
      'Flower preservation',
      'Sound system for vows'
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
      'Branding/signage durability'
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
      'Children\'s heat/cold sensitivity',
      'Party decoration durability',
      'Game/activity equipment',
      'Cake preservation'
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
      'Artist/crew safety'
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
      'Ground conditions (mud prevention)',
      'Vendor equipment protection',
      'Camping/outdoor accommodations'
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
      'Shade availability'
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
      'Fire safety considerations'
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
      'Lightning safety (pool = dangerous)',
      'Sun exposure intensity',
      'Water temperature comfort',
      'Slip hazards when wet'
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
      'Stronger sun reflection from sand/water'
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
      'Plant/lawn damage prevention',
      'Ground softness',
      'Pollen levels',
      'Insect management'
    ]
  },
  sports_event: {
    sensitivity: 7,
    typicalDuration: 4,
    guestCount: 'large',
    setupTime: 6,
    criticalElements: ['field/venue', 'spectators', 'equipment', 'safety'],
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
      'Cancellation thresholds'
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
      'Wind protection for displays'
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
      'Silent auction display protection'
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
      'Ritual/ceremonial requirements',
      'Elderly attendees common',
      'Formal attire considerations',
      'Sacred space protection'
    ]
  }
};

// ============================================================================
// VENUE STRUCTURE DATABASE
// ============================================================================

const STRUCTURES = {
  open_air: {
    windResistance: 0,
    rainProtection: 0,
    sunProtection: 0,
    temperatureControl: 0,
    maxWindSpeed: 25,      // km/h before unsafe
    maxTemp: 35,
    minTemp: 10,
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
    notes: 'Light duty. Secure with weights. Not for wind >25km/h.'
  },
  event_tent_small: {
    windResistance: 4,
    rainProtection: 8,
    sunProtection: 7,
    temperatureControl: 2,
    maxWindSpeed: 35,
    maxTemp: 40,
    minTemp: 0,
    notes: '10x10 to 20x20. Can add sides. Portable heaters/fans optional.'
  },
  event_tent_large: {
    windResistance: 5,
    rainProtection: 9,
    sunProtection: 8,
    temperatureControl: 4,
    maxWindSpeed: 40,
    maxTemp: 42,
    minTemp: -5,
    notes: '20x30+. Professional setup. Can add flooring, HVAC, lighting.'
  },
  marquee: {
    windResistance: 6,
    rainProtection: 9,
    sunProtection: 8,
    temperatureControl: 5,
    maxWindSpeed: 45,
    maxTemp: 43,
    minTemp: -10,
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
    notes: 'Complete weather protection. Always have as Plan B for critical events.'
  }
};

// ============================================================================
// EQUIPMENT & RENTAL DATABASE
// ============================================================================

const EQUIPMENT_NEEDS = {
  patio_heater: {
    coverage: '15ft radius',
    tempRise: '5-10°C',
    minTemp: -10,
    maxWind: 25,
    notes: 'Wind reduces effectiveness. 1 per 20 guests in cold.',
    cost: 'medium'
  },
  industrial_heater: {
    coverage: '30ft radius',
    tempRise: '10-20°C',
    minTemp: -30,
    maxWind: 35,
    notes: 'Enclosed tent needed. Professional installation.',
    cost: 'high'
  },
  misting_fan: {
    coverage: '10ft radius',
    tempDrop: '3-7°C',
    maxTemp: 45,
    maxHumidity: 60,
    notes: 'Ineffective in high humidity. Increases moisture.',
    cost: 'low'
  },
  portable_ac: {
    coverage: '400 sq ft',
    tempDrop: '10-15°C',
    maxTemp: 45,
    notes: 'Requires enclosed space. Generator may be needed.',
    cost: 'high'
  },
  evaporative_cooler: {
    coverage: '500 sq ft',
    tempDrop: '8-12°C',
    maxTemp: 45,
    maxHumidity: 50,
    notes: 'Only works in dry heat. Adds humidity.',
    cost: 'medium'
  },
  flooring: {
    types: ['plywood', 'composite', 'carpet', 'dance floor'],
    notes: 'Essential for wet ground. Protects heels, wheelchairs, equipment.',
    cost: 'medium-high'
  },
  lighting: {
    types: ['string', 'spot', 'flood', 'decorative'],
    weatherRating: 'Must be outdoor rated if exposed',
    notes: 'IP65 minimum for outdoor use. GFCI protection required.',
    cost: 'variable'
  },
  sound_system: {
    windImpact: 'Wind disperses sound, especially >20km/h',
    rainProtection: 'Must be fully covered',
    notes: 'Extra speakers needed in wind. Bass travels less in humid air.',
    cost: 'high'
  },
  generator: {
    notes: 'Always have backup. Fuel for 2x expected runtime.',
    weatherProtection: 'Cover from rain, but ventilated (CO risk).',
    cost: 'medium-high'
  }
};

// ============================================================================
// FOOD & BEVERAGE SAFETY
// ============================================================================

function getFoodSafetyAdvice(data) {
  const { temp, humidity, uvIndex, condition } = data;
  const advice = [];
  const heatIndex = calcHeatIndex(temp, humidity);
  
  if (heatIndex > 32) {
    advice.push("FOOD SAFETY CRITICAL: Bacteria doubles every 20 minutes above 32°C.");
    advice.push("Cold food must stay below 4°C - use ice baths, replace ice frequently.");
    advice.push("Hot food must stay above 60°C - chafing dishes + sterno fuel.");
    advice.push("Serve in shifts rather than leaving all food out. Discard after 1 hour.");
    advice.push("Seafood, dairy, mayonnaise-based dishes: extreme risk. Consider eliminating.");
  } else if (temp > 25) {
    advice.push("Warm temps: Monitor food temps. 2-hour rule (discard after 2hrs out).");
    advice.push("Keep cold food on ice. Hot food in thermal containers.");
    advice.push("Cream-based desserts risky. Consider fruit-based alternatives.");
  } else if (temp < 5) {
    advice.push("Cold food safety: Hot food cools rapidly. Use insulated containers.");
    advice.push("Warm food frequently. Guests eat slower in cold.");
  }
  
  if (uvIndex > 6) {
    advice.push("Direct sun: Food wilts/dries fast. Keep all food in shade.");
    advice.push("Butter, chocolate, cheese will melt. Ice cream impossible outdoors.");
    advice.push("Wine warms quickly. White/rosé in ice buckets. Red in shade.");
  }
  
  if (condition === 'rain' || condition === 'drizzle') {
    advice.push("Cover all food. Rainwater contamination = food poisoning risk.");
    advice.push("Use lidded chafing dishes. Covered cake stands.");
    advice.push("No open bowls of chips/nuts/etc. - will get soggy.");
  }
  
  if (condition === 'windy' && temp > 20) {
    advice.push("Wind: Dust/debris in food. All food must be covered.");
    advice.push("Napkins, plates, cups become projectiles. Weight everything.");
  }
  
  // Specific items
  if (temp > 28) {
    advice.push("CAKE WARNING: Buttercream melts above 28°C. Fondant sweats.");
    advice.push("Consider faux display cake + sheet cake in fridge.");
    advice.push("Chocolate fountain: impossible above 25°C (seizes, burns).");
  }
  
  if (temp > 30) {
    advice.push("Champagne/sparkling: Warm bottles foam excessively. Keep in ice 20min before.");
    advice.push("Red wine: Serve slightly chilled (16-18°C) in heat.");
    advice.push("Cocktails: Ice melts instantly. Pre-batch and chill. Extra ice = 1lb per guest.");
  }
  
  return advice;
}

// ============================================================================
// GUEST COMFORT CALCULATOR
// ============================================================================

function getGuestComfortScore(data) {
  const { temp, humidity, wind, uvIndex, precipitation } = data;
  let score = 100;
  const deductions = [];
  
  // Temperature
  if (temp < 0) { score -= 40; deductions.push('Freezing temperatures'); }
  else if (temp < 10) { score -= 20; deductions.push('Cold conditions'); }
  else if (temp < 15) { score -= 10; deductions.push('Cool conditions'); }
  else if (temp > 35) { score -= 40; deductions.push('Extreme heat'); }
  else if (temp > 30) { score -= 20; deductions.push('Very hot'); }
  else if (temp > 28) { score -= 10; deductions.push('Hot conditions'); }
  
  // Precipitation
  if (precipitation > 10) { score -= 30; deductions.push('Heavy precipitation'); }
  else if (precipitation > 5) { score -= 20; deductions.push('Moderate precipitation'); }
  else if (precipitation > 0) { score -= 10; deductions.push('Light precipitation'); }
  
  // Wind
  if (wind > 40) { score -= 25; deductions.push('Dangerous wind'); }
  else if (wind > 25) { score -= 15; deductions.push('Strong wind'); }
  else if (wind > 15) { score -= 5; deductions.push('Breezy'); }
  
  // Humidity
  if (humidity > 90) { score -= 10; deductions.push('Oppressive humidity'); }
  else if (humidity > 80) { score -= 5; deductions.push('High humidity'); }
  else if (humidity < 20) { score -= 5; deductions.push('Very dry'); }
  
  // UV
  if (uvIndex > 8) { score -= 10; deductions.push('Extreme UV'); }
  else if (uvIndex > 5) { score -= 5; deductions.push('High UV'); }
  
  return {
    score: Math.max(0, score),
    deductions,
    rating: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Fair' : score > 20 ? 'Poor' : 'Unacceptable'
  };
}

// ============================================================================
// DECORATION & SETUP ADVISOR
// ============================================================================

function getDecorationAdvice(data) {
  const { wind, precipitation, condition, temp, humidity } = data;
  const advice = [];
  
  // Wind effects on decorations
  if (wind > 30) {
    advice.push("CRITICAL: All lightweight decorations WILL become projectiles.");
    advice.push("No balloons (even weighted - they whip and pop).");
    advice.push("No paper decorations, tablecloths without heavy clips, or freestanding signs.");
    advice.push("Floral arrangements: heavy bases only. No tall centerpieces (topple).");
    advice.push("Backdrop/arch: Professional rigging required. Sandbags on all bases.");
  } else if (wind > 20) {
    advice.push("Secure all decorations. Tablecloth weights every 2ft.");
    advice.push("Balloons ok if heavily weighted (3x normal weight).");
    advice.push("No hanging decorations without wind damping.");
    advice.push("Candles: impossible to keep lit. Use LED alternatives.");
  } else if (wind > 10) {
    advice.push("Light breeze: Tablecloth weights recommended.");
    advice.push("Napkins, place cards, menus need holders.");
    advice.push("Candles in hurricanes/vases only.");
  }
  
  // Rain effects
  if (precipitation > 0) {
    advice.push("Paper everything: menus, place cards, signage = ruined.");
    advice.push("Consider waterproof/laminate all printed materials.");
    advice.push("Flowers: some varieties wilt instantly in rain (peonies, garden roses).");
    advice.push("Fabric decorations: will water stain. Synthetic fabrics better.");
  }
  
  // Temperature effects
  if (temp > 32) {
    advice.push("Flowers: wilt fast in heat. Keep in water until last moment.");
    advice.push("Certain flowers droop in heat: hydrangeas, tulips, ranunculus.");
    advice.push("Candles: soften and bend. Use LED or keep refrigerated until use.");
    advice.push("Balloons: expand in heat, may pop. Under-inflate by 10%.");
  }
  
  if (temp < 5) {
    advice.push("Flowers: freeze damage to tropical varieties (orchids, anthuriums).");
    advice.push("Certain flowers handle cold: roses, carnations, chrysanthemums.");
    advice.push("Balloons: shrink in cold. Over-inflate by 10%.");
  }
  
  return advice;
}

// ============================================================================
// PHOTOGRAPHY CONDITIONS
// ============================================================================

function getPhotographyConditions(data) {
  const { temp, condition, uvIndex, wind, sunPosition } = data;
  const advice = [];
  
  if (sunPosition === 'golden_hour') {
    advice.push("PERFECT LIGHT: Golden hour today. Soft, warm, flattering light.");
    advice.push("Schedule key photos during this window.");
  } else if (sunPosition === 'harsh_midday') {
    advice.push("HARSH LIGHT: Midday sun causes unflattering shadows (raccoon eyes).");
    advice.push("Seek open shade (edge of building, large tree).");
    advice.push("Consider canopy or scrim to diffuse light.");
  } else if (condition === 'cloudy' || condition === 'overcast') {
    advice.push("SOFT LIGHT: Clouds act as giant softbox. Even, flattering light.");
    advice.push("Great for portraits. Colors appear more saturated.");
  }
  
  if (wind > 20) {
    advice.push("Wind: Hair will fly. Veil chaos. Have stylist on standby.");
    advice.push("Light clothing/dresses will billow (can be beautiful or problematic).");
  }
  
  if (uvIndex > 6) {
    advice.push("Bright sun: Squinting guests. Schedule photos in shade.");
    advice.push("Backlit photos beautiful but need fill flash/reflector.");
  }
  
  return advice;
}

// ============================================================================
// MAIN EVENTS ADVICE FUNCTION
// ============================================================================

export const getEventsAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, tempMax, tempMin, condition, conditionCode, 
    humidity, wind, windGust, uvIndex, aqi, visibility, 
    precipitation, precipitationProbability, city, pressure,
    dewPoint, sunrise, sunset, moonPhase
  } = data;
  
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
  
  // Detect event type from question
  const q = question.toLowerCase();
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
    'birthday_party'; // default

  // Detect structure type from question
  const structureType = 
    q.includes('marquee') || q.includes('luxury tent') ? 'marquee' :
    q.includes('clearspan') || q.includes('industrial tent') ? 'clearspan' :
    q.includes('large tent') || q.includes('big tent') ? 'event_tent_large' :
    q.includes('tent') || q.includes('canopy') ? 'event_tent_small' :
    q.includes('pavilion') ? 'pavilion' :
    q.includes('gazebo') ? 'gazebo' :
    q.includes('indoor') || q.includes('inside') ? 'indoor_backup' :
    'open_air'; // default

  const eventConfig = EVENT_TYPES[eventType];
  const structure = STRUCTURES[structureType];
  
  let verdict = [];
  let setup = [];
  let guestComfort = [];
  let warnings = [];
  let contingency = [];
  let timing = [];
  let foodSafety = [];
  let decorAdvice = [];
  let photoAdvice = [];
  let equipmentNeeded = [];
  let cancellationThreshold = false;

  // ========================================================================
  // CATASTROPHIC CONDITIONS (immediate cancellation)
  // ========================================================================
  
  if (condition === 'thunderstorm' && eventConfig.sensitivity > 5) {
    cancellationThreshold = true;
    verdict.push("🚫 EVENT CANCELLATION ADVISED: Thunderstorm conditions.");
    warnings.push("LIGHTNING: Tents, canopies, umbrellas provide NO protection. Seek permanent structures.");
    warnings.push("If thunder is heard, lightning is close enough to strike. 30/30 rule applies.");
    contingency.push("MANDATORY INDOOR BACKUP: Activate immediately. Do not wait for storm to start.");
    contingency.push("If no indoor option: delay 30 minutes from last thunder for outdoor resumption.");
  }
  
  if (wind > 50 || windGust > 70) {
    cancellationThreshold = true;
    verdict.push("🚫 DANGEROUS WINDS: Event structures will fail catastrophically.");
    warnings.push(`Sustained winds ${wind}km/h with gusts to ${windGust}km/h.`);
    warnings.push("All temporary structures unsafe. Flying debris risk. Cannot be mitigated.");
    contingency.push("Postpone or move to permanent building. No tent is rated for these winds.");
  }
  
  if (heatIndex > 50 && eventConfig.sensitivity > 6) {
    cancellationThreshold = true;
    verdict.push("🚫 EXTREME HEAT EMERGENCY: Outdoor events dangerous to human life.");
    warnings.push(`Heat index ${heatIndex}°C. Heat stroke can occur in 15 minutes.`);
    warnings.push("Elderly, children, and those with medical conditions at extreme risk.");
    contingency.push("Cancel or move to climate-controlled indoor venue. Medical standby not sufficient.");
  }
  
  if (windChill < -25 && eventConfig.sensitivity > 6) {
    cancellationThreshold = true;
    verdict.push("🚫 EXTREME COLD: Outdoor exposure dangerous.");
    warnings.push(`Wind chill ${windChill}°C. Frostbite in under 10 minutes exposed skin.`);
    contingency.push("Cancel outdoor component entirely. Indoor heating mandatory if event proceeds.");
  }

  // ========================================================================
  // MAIN EVENT VERDICT
  // ========================================================================
  
  if (!cancellationThreshold) {
    if (comfort === "Perfect" || comfort === "Good") {
      verdict.push(`✅ IDEAL EVENT WEATHER: ${comfort} conditions in ${city}.`);
      verdict.push(`${temp}°C with ${humidity}% humidity, ${wind}km/h wind.`);
      verdict.push("Minimal weather preparations needed. Guests will be comfortable.");
    } else if (comfort === "Moderate" || comfort === "Fair") {
      verdict.push(`⚠️ ACCEPTABLE WITH PREPARATION: ${comfort} conditions.`);
      verdict.push(`Event possible but weather mitigation required.`);
    } else if (comfort === "Poor") {
      verdict.push(`⚠️ CHALLENGING: ${comfort} conditions. Extensive preparation needed.`);
      verdict.push("Guest comfort significantly impacted. Indoor backup strongly advised.");
    } else if (comfort === "Extreme") {
      verdict.push(`❌ DANGEROUS: ${comfort} conditions. Strongly consider cancellation.`);
      if (eventConfig.sensitivity > 7) {
        verdict.push("High-stakes event in extreme conditions = unacceptable risk.");
      }
    }
  }

  // ========================================================================
  // RAIN & PRECIPITATION
  // ========================================================================
  
  if (condition === 'thunderstorm' && !cancellationThreshold) {
    warnings.push("⛈️ THUNDERSTORM: Immediate lightning risk. 30/30 rule in effect.");
    setup.push("NO outdoor activities during thunder. No umbrellas (lightning rods).");
    setup.push("All electrical equipment on surge protectors. Unplug if possible.");
    contingency.push("Indoor shelter accessible within 30 seconds for all guests.");
  } else if (precipitation > 15 && isRaining) {
    verdict.push("Heavy rain will significantly impact outdoor experience.");
    setup.push("Professional tent with raised flooring mandatory.");
    setup.push("Waterproof walkways between structures. Drainage plan essential.");
    warnings.push("Standing water = slip hazard + mosquito breeding + electrical danger.");
    guestComfort.push("Guests will get wet moving between areas. Umbrella stations needed.");
    contingency.push("Indoor backup plan B must be ready. Don't wait to activate.");
  } else if (precipitation > 5 && isRaining) {
    setup.push("Rain plan in effect. Waterproof tents for all guest areas.");
    setup.push("Non-slip flooring at all entrances. Towel service for wet guests.");
    setup.push("Plastic covers for electronics. Waterproof bags for guest belongings.");
    guestComfort.push("Provide umbrellas or covered walkways between tent areas.");
    warnings.push("Grass becomes muddy with foot traffic. Flooring essential for high-traffic areas.");
  } else if (condition === 'drizzle' || (precipitation > 0 && precipitation <= 5)) {
    setup.push("Light rain/drizzle. Tent coverage recommended but not mandatory.");
    setup.push("Have umbrellas available. Quick-dry seating materials.");
    warnings.push("Even light rain makes grass damp. Guests in nice clothes will complain.");
  } else if (precipitationProbability > 50 && !isRaining) {
    warnings.push(`⚠️ ${precipitationProbability}% chance of rain. Have backup plan ready.`);
    setup.push("Set up tents proactively - easier in dry conditions.");
    contingency.push("Monitor radar. Don't wait for rain to start before activating rain plan.");
  }

  // ========================================================================
  // WIND & STRUCTURES
  // ========================================================================
  
  if (wind > 35) {
    warnings.push(`STRONG WIND ${wind}km/h: Exceeds safe limits for most temporary structures.`);
    warnings.push("Tent collapse risk. Professional rigging inspection mandatory.");
    setup.push("Industrial-grade stakes (3ft+) or ballast blocks (500lbs+ per leg).");
    setup.push("Remove tent sides to reduce wind load. No solid walls.");
    decorAdvice.push("ALL decorations must be removed or industrial-secured.");
    equipmentNeeded.push("Professional tent installer on standby. Wind meters for monitoring.");
    if (eventConfig.sensitivity > 7) {
      contingency.push("Wedding/critical event: Strongly consider indoor move. Tent failure = disaster.");
    }
  } else if (wind > 25) {
    warnings.push(`WINDY ${wind}km/h: Temporary structures at risk without proper anchoring.`);
    setup.push("All tents: stakes (not just weights). Sandbags on every leg (40lbs+).");
    setup.push("Tent walls upwind side only. Ventilation on downwind side.");
    setup.push("No freestanding umbrellas, signage, or arches without heavy bases.");
    guestComfort.push(`Wind chill makes ${temp}°C feel like ${windChill}°C. Guests need layers.`);
    decorAdvice.push("Secure all centerpieces. No taper candles. Tablecloth clips every 2ft.");
    equipmentNeeded.push("Extra sound speakers facing wind direction. Wind screens for buffet.");
  } else if (wind > 15) {
    setup.push("Moderate breeze. Weight tablecloths, menus, place cards.");
    setup.push("Balloons ok if weighted. Hair considerations for photos.");
    guestComfort.push("Light breeze pleasant if warm. Chilly if temp < 18°C.");
  }

  // ========================================================================
  // TEMPERATURE MANAGEMENT
  // ========================================================================
  
  // Extreme Heat
  if (heatIndex > 40) {
    warnings.push(`EXTREME HEAT ${heatIndex}°C: Heat exhaustion/heat stroke risk.`);
    guestComfort.push("Provide: shade structures, misting fans, cold water stations, cooling towels.");
    guestComfort.push("Schedule event in shorter segments with cooling breaks.");
    guestComfort.push("Elderly guests: personal fans, shaded seating, medical supervision.");
    guestComfort.push("Alert guests in advance: dress in light, breathable fabrics, hydrate beforehand.");
    setup.push("Industrial misting system. Portable A/C in tents. Light-colored tent (reflects heat).");
    setup.push("Insulated water coolers every 50ft. Electrolyte drinks available.");
    foodSafety.push(...getFoodSafetyAdvice(data));
    timing.push("Avoid 12pm-4pm peak heat. Morning (7-11am) or evening (5-9pm) best.");
    if (eventConfig.sensitivity > 8) {
      contingency.push("Wedding/critical: Air-conditioned tent or indoor venue. Heat stroke = liability.");
    }
  } else if (heatIndex > 35) {
    guestComfort.push(`Hot ${heatIndex}°C: Provide shade, fans, cold drinks.`);
    setup.push("Misting fans or portable A/C in guest areas. Shade sails if no tent.");
    foodSafety.push(...getFoodSafetyAdvice(data));
    timing.push("Avoid peak sun hours. Evening events more comfortable.");
  } else if (temp > 30) {
    guestComfort.push(`Warm ${temp}°C: Shade and hydration needed.`);
    setup.push("Shade structures for all guest areas. Cold drink stations.");
    timing.push("Midday sun intense. Shaded areas essential.");
  }
  
  // Extreme Cold
  if (windChill < -15) {
    warnings.push(`EXTREME COLD ${windChill}°C: Hypothermia/frostbite risk.`);
    guestComfort.push("Guests need: heavy coats, hats, gloves, insulated boots - communicated in advance.");
    guestComfort.push("Provide: heated tent, hot drink stations, blankets, hand warmers.");
    guestComfort.push("Limit outdoor exposure to 15-minute segments. Heated rest areas.");
    setup.push("Industrial heaters (1 per 200 sq ft). Enclosed tent with insulated walls.");
    setup.push("Heated restroom trailers (standard porta-potties = miserable).");
    setup.push("Hot water stations for tea/coffee/cocoa. Warm food (soups, stews).");
    equipmentNeeded.push("Backup generators (heaters draw significant power). CO monitors in tents.");
    if (eventConfig.sensitivity > 7) {
      contingency.push("Wedding/critical: Consider rescheduling. Guests remember freezing events negatively.");
    }
  } else if (windChill < 0) {
    guestComfort.push(`Cold ${windChill}°C: Guests need warm clothing, communicated in advance.`);
    setup.push("Patio heaters every 15ft. Enclosed tent sides. Heated flooring if possible.");
    guestComfort.push("Blanket station. Hot beverages upon arrival. Hand warmers as favors.");
    setup.push("Coat check mandatory. Wet coats need drying area.");
  } else if (temp < 10) {
    guestComfort.push(`Cool ${temp}°C: Guests will need jackets, especially when sun sets.`);
    setup.push("Heaters if event extends into evening. Blanket baskets as thoughtful touch.");
    timing.push("Afternoon events (12-4pm) capture warmest hours.");
  } else if (tempMin < 10 && timeOfDay === 'evening') {
    warnings.push(`Evening temperature drops to ${tempMin}°C. Guests dressed for daytime will be cold.`);
    setup.push("Heaters for evening portion. Communicate temperature drop to guests.");
    guestComfort.push("Pashmina/blanket favors appreciated for evening events.");
  }

  // ========================================================================
  // HUMIDITY EFFECTS
  // ========================================================================
  
  if (humidity > 85) {
    if (temp > 25) {
      guestComfort.push(`Oppressive humidity ${humidity}%. Feels like ${heatIndex}°C.`);
      guestComfort.push("Guests will sweat through formal clothes. Hair frizz inevitable.");
      setup.push("Extra fans for air circulation. Dehumidifiers in enclosed tents.");
      setup.push("Cold towel service. Paper programs (not fabric - will wilt).");
      warnings.push("High humidity + heat = heat exhaustion risk increases 3x.");
      decorAdvice.push("Flowers: tropical varieties only. Some flowers (peonies, hydrangeas) will wilt instantly.");
    } else {
      guestComfort.push(`Damp conditions. Chill penetrates clothing.`);
      setup.push("Moisture-resistant seating. Extra blankets (damp cold feels worse).");
    }
  } else if (humidity < 25 && temp > 25) {
    guestComfort.push("Very dry heat. Stay hydrated. Lip balm/moisturizer appreciated.");
    warnings.push("Fire danger elevated. Check burn bans for open flames/BBQ/fire pits.");
  }

  // ========================================================================
  // SUN & UV
  // ========================================================================
  
  if (uvIndex >= 10) {
    warnings.push(`EXTREME UV ${uvIndex}: Burn time ${burnMin} minutes. Severe sun damage possible.`);
    setup.push("Sunscreen stations mandatory. SPF 50+ provided. Umbrellas at all outdoor seating.");
    setup.push("All tents must have UV-resistant fabric (not all do). Shade sails for uncovered areas.");
    guestComfort.push("Warn guests: hat, sunglasses, sunscreen essential. Sun poisoning risk real.");
    timing.push("Strongly avoid 10am-4pm. Schedule for morning or late afternoon.");
    if (eventConfig.sensitivity > 7) {
      warnings.push("Elderly guests and children especially vulnerable. Medical shade breaks required.");
    }
  } else if (uvIndex >= 6) {
    setup.push("High UV. Shade structures essential. Sunscreen provided.");
    guestComfort.push("Guests should wear hats and sunglasses. Sunburn will impact event enjoyment.");
    timing.push("Peak UV 10am-2pm. Shade critical during these hours.");
  } else if (uvIndex >= 3 && condition === 'clear') {
    setup.push("Moderate UV. Sunscreen stations thoughtful touch.");
    guestComfort.push("Sunglasses recommended for comfort.");
  }

  // ========================================================================
  // AIR QUALITY
  // ========================================================================
  
  if (aqi > 200) {
    warnings.push(`HAZARDOUS AIR ${aqi}: Health emergency. Outdoor events dangerous for all.`);
    warnings.push("Everyone may experience serious health effects. Cancel outdoor event.");
    contingency.push("Must move indoors with HEPA air filtration. Provide N95 masks if outdoor unavoidable.");
  } else if (aqi > 150) {
    warnings.push(`UNHEALTHY AIR ${aqi}: Sensitive groups at risk. Everyone may feel effects.`);
    guestComfort.push("Provide N95 masks. Limit physical activity. Medical tent advised.");
    guestComfort.push("Alert guests with asthma, heart conditions, elderly - high risk.");
    contingency.push("Indoor backup with air purification strongly recommended.");
  } else if (aqi > 100) {
    guestComfort.push(`Moderate air quality ${aqi}. Sensitive individuals may be affected.`);
    guestComfort.push("Limit strenuous activities. Have masks available.");
    warnings.push("Avoid BBQs, fire pits, anything that adds particulates.");
  }

  // ========================================================================
  // VISIBILITY
  // ========================================================================
  
  if (visibility < 0.5) {
    warnings.push("DENSE FOG: Visibility under 500m. Guest travel dangerous.");
    warnings.push("Guests may get lost, late, or not attend. Event elements invisible.");
    setup.push("Extra signage with reflective markers. Lighting at all pathways.");
    setup.push("Designated parking attendants with high-visibility gear.");
    guestComfort.push("Consider delaying start time for guest safety.");
    decorAdvice.push("Decorations, signage, photo ops will be hidden. Lighting key.");
  } else if (visibility < 2) {
    warnings.push("Reduced visibility. Early morning/evening events affected.");
    setup.push("Extra lighting for pathways and parking. Clear signage.");
  }

  // ========================================================================
  // EVENT-SPECIFIC CONSIDERATIONS
  // ========================================================================
  
  if (eventType === 'wedding') {
    if (temp > 30) {
      warnings.push("BRIDAL ALERT: Wedding dress + heat = dangerous. Consider lightweight fabrics.");
      warnings.push("Groomsmen in suits/wool = heat exhaustion candidates. Allow jacket removal.");
      guestComfort.push("Ceremony under 20 minutes. Water provided during ceremony.");
      setup.push("Battery-operated fans in wedding party area. Ice packs available.");
    }
    if (temp < 5) {
      warnings.push("Bridal gowns not designed for cold. Bride needs thermal underlayers.");
      warnings.push("Bridesmaids in matching dresses = shivering. Provide wraps/shawls.");
      guestComfort.push("Ceremony under 15 minutes. Blankets on chairs.");
    }
    if (sunPos === 'harsh_midday') {
      photoAdvice.push("Harsh light creates unflattering shadows. Seek open shade for photos.");
      photoAdvice.push("Squinting in ceremony photos. Position sun behind officiant (guests face away from sun).");
    }
    if (sunPos === 'golden_hour') {
      photoAdvice.push("PERFECT: Golden hour during event. Schedule couple photos at this time.");
      photoAdvice.push("Communicate timing to photographer in advance.");
    }
  }
  
  if (eventType === 'pool_party') {
    if (condition === 'thunderstorm') {
      warnings.push("LIGHTNING + POOL = DEATH. Clear pool immediately. No exceptions.");
      warnings.push("Wait 30 minutes after last thunder before re-entering water.");
    }
    if (uvIndex > 8) {
      warnings.push("Water reflects UV, increasing exposure 25%. Reapply sunscreen every hour.");
      warnings.push("Swim shirts/rash guards strongly recommended for all guests.");
    }
  }
  
  if (eventType === 'beach_event') {
    warnings.push("Check tide schedule. High tide can eliminate beach space.");
    setup.push("Windbreaks essential. Sand gets everywhere - protect food and electronics.");
    setup.push("Footwear needed - sand can reach 50°C+ in sun.");
    guestComfort.push("Salt spray + wind = everything gets sticky. Wet wipes station recommended.");
  }
  
  if (eventType === 'concert') {
    if (wind > 25) {
      warnings.push("Sound dispersion: wind >25km/h significantly degrades audio quality.");
      setup.push("Extra delay speakers. Wind screens on all microphones.");
      setup.push("Stage backdrop must be industrial-secured. Become sails in wind.");
    }
    if (condition === 'thunderstorm') {
      warnings.push("MANDATORY EVACUATION: Stage/equipment = lightning targets.");
      contingency.push("Have evacuation announcement ready. Crowd management plan for sudden weather.");
    }
  }

  // ========================================================================
  // TIMING RECOMMENDATIONS
  // ========================================================================
  
  if (tempMax > 35) {
    timing.push("Schedule event before 11am or after 5pm to avoid peak heat.");
  }
  if (tempMin < 5 && eventConfig.typicalDuration > 4) {
    timing.push("Start by 2pm to capture warmth. End by 7pm before significant cooling.");
  }
  if (precipitationProbability > 60) {
    timing.push("Monitor radar. Consider 1-2 hour delay if storm passing through.");
  }
  if (wind > 20 && timeOfDay === 'afternoon') {
    timing.push("Afternoon winds typically strongest. Morning events often calmer.");
  }
  if (sunPos === 'sunset' && eventConfig.sensitivity > 7) {
    timing.push("Schedule ceremony/photos during sunset for optimal lighting.");
  }
  
  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🎪 Event weather check:",
    "🎉 Outdoor event forecast:",
    "📋 Venue conditions:",
    "🎯 Event planning weather:",
    "🌟 Zephye's event advisory:",
    "🎊 Party weather analysis:",
    "🎈 Celebration forecast:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Verdict section
  if (verdict.length > 0) {
    response += `📌 OVERALL VERDICT:\n`;
    verdict.forEach(v => response += `${v}\n`);
    response += '\n';
  }
  
  // Comfort Score
  const guestScore = getGuestComfortScore(data);
  response += `👥 GUEST COMFORT: ${guestScore.rating} (${guestScore.score}/100)\n`;
  if (guestScore.deductions.length > 0) {
    response += `Factors: ${guestScore.deductions.join(', ')}\n`;
  }
  response += '\n';
  
  // Structure Safety
  if (wind > 15 || precipitation > 0) {
    response += `🏗️ STRUCTURE (${structureType.replace(/_/g, ' ')}):\n`;
    response += `• Wind rating: ${structure.maxWindSpeed}km/h (current: ${wind}km/h)\n`;
    response += `• Rain protection: ${structure.rainProtection}/10\n`;
    response += `• Temperature control: ${structure.temperatureControl}/10\n`;
    if (wind > structure.maxWindSpeed * 0.7) {
      response += `• ⚠️ APPROACHING WIND LIMITS - monitor closely\n`;
    }
    if (wind > structure.maxWindSpeed) {
      response += `• 🚫 WIND EXCEEDS STRUCTURE RATING - unsafe\n`;
    }
    response += '\n';
  }
  
  // Setup Requirements
  if (setup.length > 0) {
    response += `🔧 SETUP REQUIREMENTS:\n`;
    setup.forEach(s => response += `• ${s}\n`);
    response += '\n';
  }
  
  // Equipment Needed
  if (equipmentNeeded.length > 0) {
    response += `⚡ EQUIPMENT TO RENT:\n`;
    equipmentNeeded.forEach(e => response += `• ${e}\n`);
    response += '\n';
  }
  
  // Guest Comfort
  if (guestComfort.length > 0) {
    response += `💆 GUEST EXPERIENCE:\n`;
    guestComfort.forEach(g => response += `• ${g}\n`);
    response += '\n';
  }
  
  // Food Safety
  if (foodSafety.length > 0) {
    response += `🍽️ FOOD & BEVERAGE:\n`;
    foodSafety.forEach(f => response += `• ${f}\n`);
    response += '\n';
  }
  
  // Decorations
  if (decorAdvice.length > 0) {
    response += `🎀 DECORATIONS & STYLING:\n`;
    decorAdvice.forEach(d => response += `• ${d}\n`);
    response += '\n';
  }
  
  // Photography
  if (photoAdvice.length > 0) {
    response += `📸 PHOTOGRAPHY CONDITIONS:\n`;
    photoAdvice.forEach(p => response += `• ${p}\n`);
    response += '\n';
  }
  
  // Timing
  if (timing.length > 0) {
    response += `⏰ TIMING RECOMMENDATIONS:\n`;
    timing.forEach(t => response += `• ${t}\n`);
    response += '\n';
  }
  
  // Contingency Plans
  if (contingency.length > 0) {
    response += `🔄 CONTINGENCY PLANS:\n`;
    contingency.forEach(c => response += `• ${c}\n`);
    response += '\n';
  }
  
  // Critical Warnings
  if (warnings.length > 0) {
    response += `🚨 CRITICAL WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Temperature Summary
  response += `🌡️ TEMPERATURE DETAILS:\n`;
  response += `• Current: ${temp}°C (feels like ${effectiveTemp}°C)\n`;
  response += `• Today's range: ${tempMin}°C to ${tempMax}°C\n`;
  if (wind > 5) response += `• Wind chill: ${windChill}°C\n`;
  if (temp > 25 && humidity > 50) response += `• Heat index: ${heatIndex}°C\n`;
  response += '\n';
  
  // Final Recommendation
  response += `💡 FINAL RECOMMENDATION:\n`;
  if (cancellationThreshold) {
    response += `CANCEL or MOVE INDOORS. Conditions exceed safe thresholds for outdoor events.\n`;
    response += `Guest safety and event success cannot be guaranteed in these conditions.\n`;
  } else if (guestScore.score > 80) {
    response += `PROCEED WITH CONFIDENCE. Weather is ideal for your event.\n`;
    response += `Minimal weather mitigation needed. Focus on creating memorable moments!\n`;
  } else if (guestScore.score > 60) {
    response += `PROCEED WITH PREPARATION. Good conditions with minor adjustments.\n`;
    response += `Implement the setup recommendations above. Have indoor backup ready.\n`;
  } else if (guestScore.score > 40) {
    response += `PROCEED WITH CAUTION. Challenging conditions require significant preparation.\n`;
    response += `Strongly recommend indoor backup plan. Guest comfort will be impacted.\n`;
  } else {
    response += `STRONGLY CONSIDER RESCHEDULING. Poor conditions will significantly impact your event.\n`;
    response += `If proceeding, implement ALL recommendations and have immediate indoor backup.\n`;
  }

  // Pro tip
  const proTips = [
    "Always have 20% more tent space than you think. Guests cluster in bad weather.",
    "Weather contingency plans should be decided 24 hours before, not day-of.",
    "Communicate weather expectations to guests 48 hours in advance.",
    "Rent heaters/AC units early - they sell out on extreme weather days.",
    "Professional event planners always have Plan B, C, and D for weather.",
    "Tent flooring rental = single best investment for rainy day events.",
    "Guest comfort = guest happiness = successful event. Don't skimp on weather prep."
  ];
  response += `\n🎓 ${random(proTips)}`;

  return response;
};

// ============================================================================
// SPECIALIZED FUNCTIONS
// ============================================================================

export const getEventTimingAdvice = (data) => {
  if (!data) return "Loading...";
  
  const { temp, tempMax, tempMin, uvIndex, precipitationProbability, wind, condition, sunrise, sunset } = data;
  
  let response = "⏰ OPTIMAL EVENT TIMING:\n\n";
  
  // Temperature analysis
  response += "🌡️ Temperature Window Analysis:\n";
  if (tempMax > 35) {
    response += `• AVOID 11am-5pm (above 35°C)\n`;
    response += `• Best: 6am-10am (${tempMin}-${tempMin+8}°C) or 6pm-10pm (${tempMax-5}-${tempMin}°C)\n`;
  } else if (tempMax > 30) {
    response += `• Caution 12pm-4pm (above 30°C)\n`;
    response += `• Best: morning (before 11am) or evening (after 5pm)\n`;
  } else if (tempMin < 5) {
    response += `• Best: 11am-3pm (warmest hours, ${tempMin+5}°C-${tempMax}°C)\n`;
    response += `• Avoid: before 9am and after 6pm (below ${tempMin}°C)\n`;
  } else {
    response += `• All-day comfort. Any time slot works.\n`;
  }
  
  // UV timing
  response += "\n☀️ UV Intensity Schedule:\n";
  if (uvIndex > 8) {
    response += `• Peak UV 10am-3pm (UV ${uvIndex}) - avoid outdoor exposure\n`;
    response += `• Low UV before 8am and after 5pm - safer for outdoor activities\n`;
  }
  
  // Rain probability timing
  if (precipitationProbability > 30) {
    response += "\n🌧️ Precipitation Risk:\n";
    response += `• ${precipitationProbability}% chance of rain\n`;
    response += `• Consider flexible timing - start 1-2 hours earlier or later\n`;
    response += `• Monitor radar for clearing windows\n`;
  }
  
  // Wind patterns
  if (wind > 15) {
    response += "\n💨 Wind Patterns:\n";
    response += `• Typically strongest 2pm-6pm\n`;
    response += `• Calmer conditions usually in morning (6am-10am)\n`;
    response += `• Evening winds often decrease after sunset\n`;
  }
  
  // Light conditions
  response += "\n💡 Lighting Conditions:\n";
  response += `• Sunrise: ${sunrise} - Beautiful for morning ceremonies\n`;
  response += `• Sunset: ${sunset} - Golden hour for photography\n`;
  response += `• Total daylight: ${getDayLength(data)} hours\n`;
  
  return response;
};

export const getEventEquipmentAdvice = (data) => {
  if (!data) return "Loading...";
  
  const { temp, wind, humidity, precipitation, condition } = data;
  
  let response = "⚡ RENTAL EQUIPMENT CHECKLIST:\n\n";
  
  // Heating needs
  if (temp < 10) {
    response += "🔥 HEATING:\n";
    if (temp < 0) {
      response += `• Industrial heaters (1 per 200 sq ft) - ${Math.ceil(1000/200)} for 1000 sq ft tent\n`;
      response += `• Estimated temp rise: +15-20°C in enclosed tent\n`;
    } else if (temp < 10) {
      response += `• Patio heaters (1 per 20 guests) - ${Math.ceil(100/20)} for 100 guests\n`;
      response += `• Estimated temp rise: +5-10°C in immediate area\n`;
    }
    response += `• Cost estimate: $150-300 per heater\n`;
    response += `• Power: May need generator (each heater 1500-5000W)\n\n`;
  }
  
  // Cooling needs
  if (temp > 28) {
    response += "❄️ COOLING:\n";
    if (humidity < 60) {
      response += `• Evaporative coolers - effective in dry heat\n`;
      response += `• 1 unit per 500 sq ft - ${Math.ceil(1000/500)} for 1000 sq ft\n`;
    } else {
      response += `• Misting fans - less effective in humidity but still helpful\n`;
      response += `• Portable AC units for enclosed tents (1 per 400 sq ft)\n`;
    }
    response += `• Cost estimate: $200-500 per cooling unit\n`;
    response += `• Power: AC units need dedicated 20A circuits\n\n`;
  }
  
  // Rain equipment
  if (precipitation > 0) {
    response += "☔ RAIN PROTECTION:\n";
    response += `• Tent with sides (not just canopy top)\n`;
    response += `• Raised flooring (essential for wet ground)\n`;
    response += `• Walkway covers between structures\n`;
    response += `• Umbrella stands (1 per 50 guests)\n`;
    response += `• Towel service for wet guests\n`;
    response += `• Plastic covers for AV equipment\n\n`;
  }
  
  // Wind equipment
  if (wind > 20) {
    response += "💨 WIND SECURITY:\n";
    response += `• Tent stakes (3ft for soft ground) or ballast blocks\n`;
    response += `• Sandbags (40lbs each, 4 per tent leg)\n`;
    response += `• Tablecloth clips (4 per table)\n`;
    response += `• Heavy bases for all signs, arches, decor\n`;
    response += `• Wind screens for buffet/food stations\n\n`;
  }
  
  // Lighting
  response += "💡 LIGHTING:\n";
  response += `• String lights: 1 strand per 10 linear feet\n`;
  response += `• Spotlights for key areas (stage, cake, bar)\n`;
  response += `• Pathway lighting (1 per 10ft) for evening events\n`;
  if (visibility < 5) {
    response += `• EXTRA lighting needed - low visibility conditions\n`;
  }
  response += `• All outdoor lighting must be IP65 rated\n\n`;
  
  // Power
  response += "⚡ POWER:\n";
  response += `• Calculate total wattage: heaters/AC + lights + sound + catering\n`;
  response += `• Generator: 20% above calculated need\n`;
  response += `• Backup generator for critical equipment\n`;
  response += `• GFCI protection for all outdoor circuits\n`;
  response += `• Weather-protected power distribution boxes\n`;
  
  return response;
};

export default getEventsAdvice;
