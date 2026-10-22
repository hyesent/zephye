import {
  calcHeatIndex,
  calcWindChill,
  getBurnTime,
  getComfortScore,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  getMoonPhase,
  getDayLength,
  mapWeatherCode,
  calculateJetLag,
  getPressureTrend,
  getVisibilityCategory
} from './calculations';

// ============================================================================
// COMPREHENSIVE TRAVEL WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  // CITY-TO-CITY TRAVEL
  "Traveling from Paris to London, weather?",
  "Mumbai to Delhi, what to expect?",
  "New York to Tokyo, should I pack a jacket?",
  "Lagos to Abuja, is there storm?",
  "Toronto to Montreal, flight weather?",
  "Road trip from LA to Vegas, weather?",
  "Flying to Dubai tomorrow, what should I wear?",
  "Train from Rome to Florence, conditions?",
  "Bus from Nairobi to Mombasa, any issues?",
  "Cruise weather Caribbean to Bahamas?",
  "Driving cross-country, weather along route?",
  "Backpacking Europe, weather this week?",
  "Business trip Chicago to Houston, suit or casual?",
  "Honeymoon Maldives, perfect weather?",
  "Safari Kenya, what's the weather like?",
  "Ski trip Alps, snow conditions?",
  "Beach vacation Cancun, will it rain?",
  "Camper van trip New Zealand, forecast?",
  "Motorcycle trip Route 66, weather OK?",
  "RV trip national parks, any storms?",
  
  // SPECIAL TRAVEL
  "Flying with baby, turbulence expected?",
  "Elderly parent traveling, weather concerns?",
  "Medical tourism Bangkok, climate adjustment?",
  "Study abroad London, pack for semester?",
  "Destination wedding Mexico, outdoor ceremony OK?",
  "Conference Singapore, indoor or outdoor networking?",
  "Layover Dubai 8 hours, what to wear outside?",
  "Red-eye flight, weather at both ends?",
  "Connecting flight Frankfurt, winter gear needed?",
  "Private jet, VFR conditions?",
  "Helicopter tour Grand Canyon, visibility OK?",
  "Hot air balloon Cappadocia, wind conditions?",
  "Scuba diving Great Barrier Reef, water temp?",
  "Surfing trip Bali, wave weather?",
  "Hiking Machu Picchu, trail conditions?",
  "Pilgrimage Mecca, heat precautions?",
  "Antarctica cruise, how cold?",
  "Northern Lights Iceland, clear skies?",
  "Cherry blossom Japan, best viewing weather?",
  "Vineyard tour Tuscany, harvest weather?",
  "Golf trip Scotland, wind and rain?",
  "Photography trip Iceland, golden hour?",
  "Bird watching Costa Rica, rainforest conditions?",
  "Volunteer trip Haiti, hurricane season?",
  "Adventure race Morocco, desert conditions?",
  "Yoga retreat India, monsoon impact?",
  "Language immersion Spain, seasonal clothes?",
  "Work remotely Bali, reliable internet weather?",
  "Digital nomad Chiang Mai, burning season?",
  "Van life Australia, bushfire risk?",
  "Cycling tour Vietnam, monsoon timing?",
  "Food tour Japan, seasonal ingredients weather?",
  "Wellness retreat Thailand, humidity issues?",
  "Art fair Miami, outdoor installations safe?",
  "Marathon Berlin, race day weather?",
  "Ironman Hawaii, heat and wind?",
  "Olympics Paris, event weather?",
  "World Cup Qatar, stadium conditions?",
  "Formula 1 Monaco, rain or shine?",
  "Space tourism launch, weather window?",
  "Submarine tour, underwater visibility?",
  "Glacier hiking Alaska, safe conditions?",
  "Dog sledding Norway, snow adequate?",
  "Camel trek Sahara, sandstorm risk?",
  "Amazon rainforest tour, flooding?",
  "Galapagos cruise, sea conditions?",
  "Everest base camp, climbing window?",
  "Trans-Siberian railway, winter conditions?",
  "Orient Express, scenic weather?",
  "Cargo ship travel, rough seas?",
  "Houseboat Kashmir, lake conditions?",
  "Felucca Nile, wind for sailing?",
  "Gondola Venice, acqua alta risk?",
  "Cable car Table Mountain, wind shutdown?",
  "Float plane Alaska, visibility minimums?",
  "Bush plane Botswana, landing strip conditions?",
  "Air taxi Maldives, seaplane weather?"
];

// ============================================================================
// ENHANCED TRANSPORTATION MODE DATABASE
// ============================================================================

const TRANSPORT_MODES = {
  commercial_flight: {
    weatherSensitivity: {
      thunderstorm: 10,
      fog: 9,
      snow: 8,
      wind: 7,
      ice: 9,
      heat: 4,
      rain: 3
    },
    cancellationThresholds: {
      wind: 65,
      crosswind: 35,
      visibility: 400,
      ceiling: 60,
      thunderstorm: true,
      freezingRain: true
    },
    turbulence: {
      light: { wind: 15, cloudType: 'cumulus', effect: 'Light chop, seatbelt sign possible' },
      moderate: { wind: 25, cloudType: 'cumulonimbus', effect: 'Difficulty walking, unsecured objects move' },
      severe: { wind: 40, cloudType: 'thunderstorm', effect: 'Momentary loss of control, injuries possible' },
      extreme: { wind: 50, cloudType: 'severe_storm', effect: 'Aircraft may be out of control, structural damage' }
    },
    special: [
      'Thunderstorms: lightning strikes on aircraft are safe but scary',
      'Clear air turbulence: undetectable, most dangerous type',
      'Mountain wave turbulence: downwind of mountains',
      'Jet stream: 160-320 km/h at altitude, affects flight time',
      'Volcanic ash: engines flame out, avoid at all costs',
      'De-icing: adds 15-45 minutes to departure',
      'High altitude airports: reduced engine performance in heat',
      'Wind shear: sudden changes in wind speed or direction'
    ]
  },
  private_plane: {
    weatherSensitivity: {
      thunderstorm: 10,
      fog: 9,
      wind: 8,
      ice: 10,
      heat: 6,
      rain: 5
    },
    cancellationThresholds: {
      wind: 45,
      crosswind: 25,
      visibility: 800,
      ceiling: 150,
      thunderstorm: true,
      icing: true
    },
    special: [
      'VFR (Visual Flight Rules): need clear skies',
      'IFR (Instrument Flight Rules): can fly in clouds',
      'No de-icing equipment on many small aircraft',
      'More affected by turbulence due to lighter weight',
      'Can use smaller airports with less weather infrastructure',
      'Pilot decision: can be more flexible than airlines'
    ]
  },
  helicopter: {
    weatherSensitivity: {
      thunderstorm: 10,
      fog: 10,
      wind: 8,
      snow: 9,
      rain: 6,
      heat: 5
    },
    cancellationThresholds: {
      wind: 40,
      gusts: 30,
      visibility: 1500,
      ceiling: 200,
      thunderstorm: true,
      icing: true
    },
    special: [
      'No instrument flight in most helicopters',
      'Wire strikes: major hazard in low visibility',
      'Settling with power: risk in hot and high conditions',
      'Whiteout: snow-covered ground equals no visual reference',
      'Offshore: platform shutdown in high winds',
      'Mountain flying: wind patterns are critical',
      'Emergency medical: fly in worse weather than regular operations'
    ]
  },
  road_trip: {
    weatherSensitivity: {
      rain: 4,
      snow: 7,
      ice: 9,
      fog: 8,
      wind: 5,
      heat: 3,
      thunderstorm: 5
    },
    hazards: {
      hydroplaning: { speed: 80, waterDepth: '2.5mm', effect: 'Total loss of control' },
      blackIce: { temp: 4, condition: 'clear_cold', effect: 'Invisible ice on road' },
      fog: { visibility: 200, speed: 'Reduce to 40 km/h', effect: 'Chain reaction crashes' },
      dustStorm: { wind: 40, visibility: 400, effect: 'Zero visibility, pull off road' },
      flashFlood: { rain: 50, effect: 'Never drive through water' },
      heat: { temp: 38, effect: 'Tire blowouts, engine overheating' }
    },
    special: [
      'Mountain passes: chain requirements in snow',
      'Desert driving: carry water, daytime only in extreme heat',
      'Coastal roads: fog banks roll in quickly',
      'Wildfire areas: check road closures',
      'Tire pressure changes 1 PSI per 5°C',
      'Battery failure: extreme cold reduces capacity 50 percent',
      'Wind: high-profile vehicles like RVs and trucks can blow over',
      'Sun glare: dangerous during sunrise and sunset on east-west roads'
    ]
  },
  train: {
    weatherSensitivity: {
      snow: 6,
      heat: 5,
      wind: 5,
      flood: 8,
      fog: 3,
      thunderstorm: 4
    },
    special: [
      'Rail buckling in heat over 35°C with speed restrictions',
      'Points heaters in cold climates',
      'Leaf fall: slippery rails in autumn',
      'Flooding: embankment washout risk',
      'Snow drifts: can block tracks for days',
      'Most reliable transport in bad weather',
      'Scenic routes: weather affects visibility of scenery'
    ]
  },
  bus: {
    weatherSensitivity: {
      snow: 7,
      ice: 9,
      fog: 8,
      wind: 6,
      heat: 3,
      rain: 4
    },
    special: [
      'Long-distance buses: drivers face fatigue plus weather',
      'Mountain roads: chain requirements',
      'Desert routes: air conditioning failure is dangerous',
      'Night buses: reduced visibility plus weather equals higher risk',
      'Check operator safety record in adverse weather'
    ]
  },
  cruise_ship: {
    weatherSensitivity: {
      hurricane: 10,
      storm: 8,
      wind: 6,
      fog: 5,
      rain: 2,
      heat: 2
    },
    special: [
      'Hurricane season: Atlantic Jun-Nov, Pacific May-Nov',
      'Seasickness: peak at 3-5m waves',
      'Stabilizers reduce roll but increase drag and fuel',
      'Port closures: ship cannot dock in high winds',
      'Tender operations: cancelled in rough seas',
      'Itinerary changes: captain can skip ports for weather',
      'Cruise ships avoid weather unlike planes and trains',
      'Inside passage: protected waters for Alaska cruises'
    ]
  },
  ferry: {
    weatherSensitivity: {
      wind: 8,
      storm: 9,
      fog: 7,
      ice: 6,
      rain: 2,
      heat: 1
    },
    cancellationThresholds: {
      wind: 45,
      wave: 3,
      visibility: 500,
      storm: true
    },
    special: [
      'Small ferries cancel in moderate conditions',
      'Car ferries are larger and more stable',
      'Open water crossings are rougher than coastal',
      'Winter: reduced schedules or cancellations',
      'Book flexible tickets in storm season'
    ]
  },
  motorcycle: {
    weatherSensitivity: {
      rain: 7,
      wind: 8,
      ice: 10,
      fog: 9,
      snow: 10,
      heat: 5
    },
    special: [
      'Rain: first 30 minutes most dangerous as oil rises',
      'Wind: gusts over 40 km/h can blow you across lanes',
      'Heat: dehydration plus helmet is dangerous combo',
      'Cold: wind chill at speed equals frostbite risk',
      'Leaves are as slippery as ice',
      'Tar snakes melt in heat and are extremely slippery',
      'Gravel: washout after rain on corners',
      'Absolutely no ice or snow riding'
    ]
  },
  bicycle: {
    weatherSensitivity: {
      rain: 6,
      wind: 8,
      ice: 10,
      snow: 9,
      fog: 8,
      heat: 6
    },
    special: [
      'Headwind: equivalent to riding uphill',
      'Tailwind: can be fun but dangerous with reduced braking',
      'Crosswind: most dangerous, can blow into traffic',
      'Rain: braking distance doubles',
      'Cold: hypothermia risk at 30 km/h wind chill',
      'Heat: hydration critical at 1L per hour in heat',
      'Lightning: get off bike, away from metal'
    ]
  },
  walking: {
    weatherSensitivity: {
      ice: 9,
      thunderstorm: 8,
      heat: 7,
      wind: 5,
      rain: 4,
      snow: 5
    },
    special: [
      'Slip risk: ice, wet leaves, moss',
      'Heat: walk early morning or evening',
      'Cold: layers essential, cover extremities',
      'Lightning: avoid open areas, trees, water',
      'Flash floods: do not walk through flowing water',
      'Urban walking: falling debris in wind',
      'Rural walking: livestock become dangerous in storms'
    ]
  }
};

// ============================================================================
// ENHANCED PACKING RECOMMENDATION SYSTEM
// ============================================================================

function getPackingList(startData, destData, travelMode, duration, season) {
  const packing = {
    clothing: [],
    accessories: [],
    documents: [],
    health: [],
    electronics: [],
    special: []
  };
  
  // Temperature differential analysis
  const tempDiff = Math.abs((startData?.temp || 20) - (destData?.temp || 20));
  const hasExtremeChange = tempDiff > 20;
  
  if (hasExtremeChange) {
    packing.clothing.push('MAJOR TEMPERATURE CHANGE: Pack for both climates');
    packing.clothing.push('  - Layer strategy: base plus mid plus outer that combine and separate');
    packing.clothing.push('  - Compression bags: reduce bulk for bulky items');
    packing.clothing.push('  - Wear bulkiest items on travel day');
  }
  
  // Destination-based clothing
  if (destData) {
    const destTemp = destData.temp;
    const destHumidity = destData.humidity || 50;
    const destCondition = destData.condition;
    const heatIndex = calcHeatIndex(destTemp, destHumidity);
    
    if (destTemp < -10) {
      packing.clothing.push('EXTREME COLD DESTINATION:');
      packing.clothing.push('  - Thermal base layers for top and bottom');
      packing.clothing.push('  - Insulated mid-layer like fleece or down');
      packing.clothing.push('  - Waterproof and windproof outer layer');
      packing.clothing.push('  - Insulated waterproof boots');
      packing.clothing.push('  - Wool socks, multiple pairs');
      packing.clothing.push('  - Insulated gloves, warm hat, scarf');
      packing.clothing.push('  - Hand and toe warmers');
      packing.clothing.push('  - Lip balm and heavy moisturizer');
      packing.clothing.push('  - Face mask or balaclava');
      
    } else if (destTemp < 0) {
      packing.clothing.push('FREEZING COLD DESTINATION:');
      packing.clothing.push('  - Thermal base layers for top and bottom');
      packing.clothing.push('  - Heavy sweater or fleece mid-layer');
      packing.clothing.push('  - Winter coat or parka');
      packing.clothing.push('  - Insulated waterproof boots');
      packing.clothing.push('  - Warm socks, hat, gloves, scarf');
      
    } else if (destTemp < 10) {
      packing.clothing.push('COLD DESTINATION:');
      packing.clothing.push('  - Warm coat or heavy jacket');
      packing.clothing.push('  - Sweaters and long-sleeve shirts');
      packing.clothing.push('  - Warm pants such as jeans or wool trousers');
      packing.clothing.push('  - Closed shoes and warm socks');
      packing.clothing.push('  - Gloves, scarf, hat');
      
    } else if (destTemp < 18) {
      packing.clothing.push('COOL DESTINATION:');
      packing.clothing.push('  - Light jacket or cardigan');
      packing.clothing.push('  - Long pants and short sleeves');
      packing.clothing.push('  - Comfortable walking shoes');
      packing.clothing.push('  - Light scarf for evening');
      
    } else if (destTemp < 25) {
      packing.clothing.push('WARM DESTINATION:');
      packing.clothing.push('  - T-shirts, shorts, skirts');
      packing.clothing.push('  - Light pants for evening');
      packing.clothing.push('  - Sandals and comfortable shoes');
      packing.clothing.push('  - Light sweater for air-conditioned spaces');
      
    } else if (destTemp < 32) {
      packing.clothing.push('HOT DESTINATION:');
      packing.clothing.push('  - Lightest clothing: linen and cotton');
      packing.clothing.push('  - Tank tops, shorts, flowy dresses');
      packing.clothing.push('  - Sandals and breathable shoes');
      packing.clothing.push('  - Sun hat and sunglasses ESSENTIAL');
      packing.clothing.push('  - Swimwear if applicable');
      
    } else {
      packing.clothing.push('EXTREME HEAT DESTINATION:');
      packing.clothing.push('  - White or light-colored loose clothing');
      packing.clothing.push('  - UV-protective clothing with UPF 50+');
      packing.clothing.push('  - Wide-brim hat and UV sunglasses');
      packing.clothing.push('  - Cooling towel and portable fan');
      packing.clothing.push('  - Minimal clothing with maximum sun protection');
      packing.clothing.push('  - Rash guard for water activities');
    }
    
    // Rain-specific
    if (destCondition === 'rain' || destCondition === 'drizzle' || destCondition === 'thunderstorm') {
      packing.accessories.push('RAIN GEAR:');
      packing.accessories.push('  - Waterproof jacket with hood');
      packing.accessories.push('  - Waterproof shoes or boots');
      packing.accessories.push('  - Compact umbrella');
      packing.accessories.push('  - Quick-dry clothing');
      packing.accessories.push('  - Waterproof bag for electronics');
    }
    
    // UV-specific
    if (destData.uvIndex > 6) {
      packing.health.push('SUN PROTECTION:');
      packing.health.push('  - SPF 50+ sunscreen');
      packing.health.push('  - After-sun lotion or aloe vera');
      packing.health.push('  - Lip balm with SPF');
      packing.health.push('  - UV-blocking sunglasses');
      packing.health.push('  - Rash guard for swimming');
    }
    
    // Humidity-specific
    if (destHumidity > 75) {
      packing.health.push('HIGH HUMIDITY:');
      packing.health.push('  - Moisture-wicking clothing');
      packing.health.push('  - Anti-chafing products');
      packing.health.push('  - Extra deodorant');
      packing.health.push('  - Lightweight breathable fabrics');
    }
  }
  
  // Travel mode specific
  if (travelMode === 'commercial_flight') {
    packing.clothing.push('FLIGHT COMFORT:');
    packing.clothing.push('  - Compression socks for DVT prevention');
    packing.clothing.push('  - Loose and comfortable layers');
    packing.clothing.push('  - Slip-on shoes for security and comfort');
    packing.clothing.push('  - Eye mask, earplugs, neck pillow');
    packing.electronics.push('  - Noise-canceling headphones');
    packing.electronics.push('  - Portable charger (power bank)');
    packing.health.push('  - Hand sanitizer and disinfecting wipes');
    packing.health.push('  - Motion sickness medication if needed');
    packing.health.push('  - Hydration: empty water bottle for after security');
  }
  
  if (travelMode === 'road_trip') {
    packing.clothing.push('ROAD TRIP ESSENTIALS:');
    packing.clothing.push('  - Comfortable driving clothes');
    packing.clothing.push('  - Change of clothes for stops');
    packing.clothing.push('  - Layers for temperature changes');
    packing.special.push('  - Emergency kit: jumper cables, flashlight, first aid');
    packing.special.push('  - Physical maps as backup');
    packing.special.push('  - Car charger for devices');
    packing.special.push('  - Snacks and water');
  }
  
  if (travelMode === 'cruise_ship') {
    packing.clothing.push('CRUISE ESSENTIALS:');
    packing.clothing.push('  - Formal wear for dinner (check ship policy)');
    packing.clothing.push('  - Swimwear and cover-ups');
    packing.clothing.push('  - Comfortable walking shoes for shore excursions');
    packing.clothing.push('  - Sea bands or motion sickness medication');
    packing.clothing.push('  - Power strip (limited outlets in cabins)');
    packing.clothing.push('  - Highlighter for daily activity schedule');
  }
  
  // Duration-based
  if (duration > 7) {
    packing.clothing.push('LONG TRIP:');
    packing.clothing.push('  - Plan for laundry with quick-dry fabrics');
    packing.clothing.push('  - 7 days of clothes, wash and repeat');
    packing.clothing.push('  - Multi-purpose items like sarong for towel, scarf, or blanket');
  }
  
  // Seasonal
  if (season === 'winter') {
    packing.clothing.push('WINTER TRAVEL:');
    packing.clothing.push('  - Layering system essential');
    packing.clothing.push('  - Moisture-wicking base layers');
    packing.clothing.push('  - Insulating mid-layers');
    packing.clothing.push('  - Windproof and waterproof outer layer');
  }
  
  if (season === 'summer') {
    packing.clothing.push('SUMMER TRAVEL:');
    packing.clothing.push('  - Light breathable fabrics');
    packing.clothing.push('  - Sun protection essentials');
    packing.clothing.push('  - Insect repellent');
  }
  
  // Documents
  packing.documents.push('ESSENTIAL DOCUMENTS:');
  packing.documents.push('  - Passport (valid 6+ months beyond return)');
  packing.documents.push('  - Visa if required');
  packing.documents.push('  - Travel insurance with weather cancellation coverage');
  packing.documents.push('  - Copies of passport and insurance separate from originals');
  packing.documents.push('  - Emergency contacts written down');
  packing.documents.push('  - Vaccination certificates if required');
  packing.documents.push('  - Flight and accommodation confirmations');
  packing.documents.push('  - International driver\'s permit if needed');
  
  // Electronics
  packing.electronics.push('ELECTRONICS:');
  packing.electronics.push('  - Universal power adapter');
  packing.electronics.push('  - Power bank of 20,000+ mAh');
  packing.electronics.push('  - Charging cables with spares');
  packing.electronics.push('  - Phone with offline maps downloaded');
  packing.electronics.push('  - Weather apps installed including Zephye');
  packing.electronics.push('  - E-reader for entertainment');
  
  // Health
  packing.health.push('HEALTH KIT:');
  packing.health.push('  - Prescription medications in carry-on, original containers');
  packing.health.push('  - Basic first aid: bandages, antiseptic, pain reliever');
  packing.health.push('  - Anti-diarrheal, antacid, antihistamine');
  packing.health.push('  - Motion sickness medication');
  packing.health.push('  - Insect repellent with DEET or picaridin');
  packing.health.push('  - Prescription copies and doctor\'s note');
  packing.health.push('  - Any special medical devices or supplies');
  
  return packing;
}

// ============================================================================
// ENHANCED JET LAG CALCULATOR
// ============================================================================

function getJetLagAdvice(timezoneDiff, direction, flightDuration) {
  const advice = [];
  
  advice.push(`TIME ZONE CHANGE: ${Math.abs(timezoneDiff)} hours ${direction}`);
  advice.push('');
  
  if (Math.abs(timezoneDiff) > 10) {
    advice.push('SEVERE JET LAG EXPECTED: Allow 1 day per time zone for full adjustment.');
    advice.push(`With ${Math.abs(timezoneDiff)} time zones, expect ${Math.abs(timezoneDiff)}-${Math.abs(timezoneDiff) * 2} days to fully adjust.`);
  } else if (Math.abs(timezoneDiff) > 6) {
    advice.push('SIGNIFICANT JET LAG: 3-5 days to fully adjust.');
    advice.push(`Expect sleep disruption for the first ${Math.round(Math.abs(timezoneDiff) * 0.7)} days.`);
  } else if (Math.abs(timezoneDiff) > 3) {
    advice.push('MODERATE JET LAG: 2-3 days adjustment.');
  } else {
    advice.push('MILD JET LAG: 1 day adjustment or less.');
  }
  
  advice.push('');
  advice.push('EASTWARD TRAVEL - harder to adjust:');
  advice.push('  - Try to sleep earlier for 3 days before departure');
  advice.push('  - Morning light exposure at destination helps reset circadian rhythm');
  advice.push('  - Avoid naps longer than 30 minutes upon arrival');
  advice.push('  - Melatonin: take at desired bedtime at destination');
  advice.push('  - Caffeine: use in morning only, avoid after 2pm');
  
  advice.push('');
  advice.push('WESTWARD TRAVEL - easier to adjust:');
  advice.push('  - Stay awake until local bedtime upon arrival');
  advice.push('  - Evening light exposure at destination helps delay circadian rhythm');
  advice.push('  - Physical activity upon arrival helps stay awake');
  advice.push('  - Morning light: avoid in first few days to prevent early waking');
  
  advice.push('');
  advice.push('GENERAL JET LAG TIPS:');
  advice.push('  - Hydrate: drink water, avoid alcohol and caffeine on flight');
  advice.push('  - Move: walk every 2 hours on long flights');
  advice.push('  - Eat: light meals, avoid heavy food before sleeping');
  advice.push('  - Set watch to destination time upon boarding');
  advice.push('  - First day: light schedule, outdoor activity');
  advice.push('  - Sleep aids: consult doctor before using');
  advice.push('  - Eye mask and earplugs for daytime sleep');
  
  if (flightDuration && flightDuration > 8) {
    advice.push('');
    advice.push('LONG HAUL FLIGHT (over 8 hours):');
    advice.push('  - Wear compression socks');
    advice.push('  - Walk aisle every 2 hours');
    advice.push('  - Stretch in seat: ankle circles, shoulder rolls');
    advice.push('  - Consider sleeping mask and noise-canceling headphones');
    advice.push('  - Pre-order special meals if needed');
  }
  
  return advice;
}

// ============================================================================
// ENHANCED ROUTE WEATHER CHECK
// ============================================================================

function getRouteWeather(transportMode, startData, destData, waypoints) {
  const route = [];
  const mode = TRANSPORT_MODES[transportMode] || TRANSPORT_MODES.commercial_flight;
  
  // Origin weather
  if (startData) {
    route.push(`DEPARTURE (${startData.city || 'Origin'}):`);
    route.push(`  Temp: ${Math.round(startData.temp)}°C | Condition: ${startData.condition || 'Unknown'}`);
    route.push(`  Wind: ${Math.round(startData.wind)}km/h | Visibility: ${Math.round(startData.visibility)}km`);
    
    if (startData.condition === 'thunderstorm') {
      route.push(`  WARNING: Thunderstorm - delays likely`);
    }
    if (startData.visibility < 400) {
      route.push(`  WARNING: Low visibility below minimums`);
    }
    if (startData.wind > 40) {
      route.push(`  WARNING: High wind may affect operations`);
    }
  }
  
  // Waypoints
  if (waypoints && waypoints.length > 0) {
    route.push('');
    route.push('ROUTE WAYPOINTS:');
    waypoints.forEach((wp, i) => {
      route.push(`  Stop ${i + 1}: ${wp.city || 'Waypoint'} - ${Math.round(wp.temp)}°C, ${wp.condition || 'Unknown'}`);
    });
  }
  
  // En route hazards
  route.push('');
  route.push('EN ROUTE HAZARDS:');
  if (transportMode === 'commercial_flight' || transportMode === 'private_plane') {
    route.push('  - Jet stream location affects flight time and turbulence');
    route.push('  - Tropical storm zones: check NOTAMs');
    route.push('  - Volcanic activity: check VAAC advisories');
    route.push('  - Mountain wave areas: potential turbulence');
    route.push('  - Check SIGMETs for significant weather');
  } else if (transportMode === 'road_trip') {
    route.push('  - Check state and province road condition websites');
    route.push('  - Mountain passes: chain and snow tire requirements');
    route.push('  - Construction zones: weather increases delays');
    route.push('  - Rest areas: plan stops every 2 hours');
    route.push('  - Check fuel availability on long stretches');
  } else if (transportMode === 'train') {
    route.push('  - Check for track maintenance schedules');
    route.push('  - Weather delays: snow, flooding, heat restrictions');
    route.push('  - Scenic views: weather affects visibility');
  }
  
  // Destination weather
  if (destData) {
    route.push('');
    route.push(`DESTINATION (${destData.city || 'Destination'}):`);
    route.push(`  Temp: ${Math.round(destData.temp)}°C | Condition: ${destData.condition || 'Unknown'}`);
    route.push(`  Wind: ${Math.round(destData.wind)}km/h | Visibility: ${Math.round(destData.visibility)}km`);
    route.push(`  Humidity: ${Math.round(destData.humidity)}% | UV: ${Math.round(destData.uvIndex)}`);
    
    if (destData.condition === 'thunderstorm') {
      route.push(`  WARNING: Thunderstorm at destination - arrival delays possible`);
    }
    if (destData.temp > 35) {
      route.push(`  WARNING: Extreme heat - stay hydrated, seek shade`);
    }
    if (destData.temp < 0) {
      route.push(`  WARNING: Freezing temperatures - pack warm layers`);
    }
  }
  
  return route;
}

// ============================================================================
// ENHANCED TRAVEL DISRUPTION PREDICTOR
// ============================================================================

function predictDisruptions(startData, destData, transportMode, routeData) {
  const disruptions = [];
  
  if (!startData && !destData) return disruptions;
  
  // Flight disruptions
  if (transportMode === 'commercial_flight' || transportMode === 'private_plane') {
    if (startData?.condition === 'thunderstorm') {
      disruptions.push({ type: 'Ground Stop', probability: 'High', impact: '1-4 hour delay', severity: 'High' });
    }
    if (startData?.visibility && startData.visibility < 1000) {
      disruptions.push({ type: 'Flow Control', probability: 'High', impact: '30-90 minute delay', severity: 'Moderate' });
    }
    if (startData?.condition === 'snow' || (startData?.temp < 2 && startData?.precipitation > 0)) {
      disruptions.push({ type: 'De-icing', probability: 'Certain', impact: '15-45 minute delay', severity: 'Moderate' });
    }
    if (destData?.condition === 'thunderstorm') {
      disruptions.push({ type: 'Holding Pattern', probability: 'Moderate', impact: '20-40 minute delay', severity: 'Moderate' });
    }
    if (startData?.wind > 40) {
      disruptions.push({ type: 'Wind Delays', probability: 'Moderate', impact: 'Variable', severity: 'Moderate' });
    }
    if (startData?.visibility < 400) {
      disruptions.push({ type: 'Diversion Risk', probability: 'High', impact: 'Significant', severity: 'High' });
    }
  }
  
  // Road disruptions
  if (transportMode === 'road_trip') {
    if (startData?.condition === 'snow' || startData?.precipitation > 10) {
      disruptions.push({ type: 'Road Closures', probability: 'Check local', impact: 'Reroute or delay', severity: 'High' });
    }
    if (startData?.visibility < 500) {
      disruptions.push({ type: 'Speed Restrictions', probability: 'Certain', impact: 'Extended travel time', severity: 'Moderate' });
    }
    if (startData?.temp < 0 && startData?.humidity > 80) {
      disruptions.push({ type: 'Black Ice', probability: 'High', impact: 'Extremely dangerous', severity: 'Critical' });
    }
    if (startData?.wind > 50 && routeData?.includes('highway')) {
      disruptions.push({ type: 'High Wind Warning', probability: 'High', impact: 'Risk for high-profile vehicles', severity: 'Moderate' });
    }
  }
  
  // Train disruptions
  if (transportMode === 'train') {
    if (startData?.temp > 35) {
      disruptions.push({ type: 'Heat Speed Restrictions', probability: 'Moderate', impact: '30-60 minute delay', severity: 'Low' });
    }
    if (startData?.condition === 'snow' && startData?.precipitation > 10) {
      disruptions.push({ type: 'Signal Issues', probability: 'Moderate', impact: 'Variable delay', severity: 'Moderate' });
    }
  }
  
  // Cruise disruptions
  if (transportMode === 'cruise_ship') {
    if (startData?.condition === 'thunderstorm' || startData?.wind > 50) {
      disruptions.push({ type: 'Port Closure', probability: 'Moderate', impact: 'Itinerary change', severity: 'Moderate' });
    }
  }
  
  return disruptions;
}

// ============================================================================
// ENHANCED DESTINATION ACTIVITIES ADVISOR
// ============================================================================

function getDestinationActivities(destData, activityTypes, travelMode) {
  const activities = [];
  
  if (!destData) return activities;
  
  const { temp, condition, wind, uvIndex, humidity, precipitation } = destData;
  const season = getSeason();
  
  // General outdoor activities
  if (activityTypes?.includes('outdoor') || !activityTypes) {
    if (temp >= 20 && temp <= 28 && condition === 'clear' && wind < 20) {
      activities.push('PERFECT outdoor conditions: hiking, sightseeing, dining al fresco');
    } else if (temp > 28 && temp < 35) {
      activities.push('Hot for outdoor activities: morning and evening best, seek shade midday');
    } else if (temp > 35) {
      activities.push('Too hot for outdoor activities: indoor attractions only, pool and beach with caution');
    } else if (temp < 5) {
      activities.push('Cold: outdoor activities possible with proper gear, limited daylight');
    } else if (temp >= 15 && temp <= 20) {
      activities.push('Good outdoor weather: comfortable for most activities');
    }
    
    if (condition === 'rain' || condition === 'drizzle') {
      activities.push('Rain: museums, galleries, indoor markets, cooking classes');
    }
  }
  
  // Beach activities
  if (activityTypes?.includes('beach') || !activityTypes) {
    if (temp > 25 && condition === 'clear' && uvIndex < 8 && wind < 25) {
      activities.push('BEACH DAY: Perfect conditions for swimming and sunbathing');
    } else if (uvIndex > 8) {
      activities.push('Beach: possible but HIGH UV - umbrella and SPF 50+ essential');
    } else if (condition === 'rain') {
      activities.push('Beach: not recommended today');
    } else if (wind > 25) {
      activities.push('Beach: windy conditions, swimming may be dangerous');
    }
  }
  
  // Photography
  if (activityTypes?.includes('photography') || !activityTypes) {
    if (condition === 'partly-cloudy') {
      activities.push('PHOTOGRAPHY: Dramatic skies, great light for landscape photography');
    } else if (condition === 'clear') {
      activities.push('Photography: harsh midday light, golden hour best for quality');
    } else if (condition === 'overcast') {
      activities.push('Photography: soft, even light - good for portraits and macro');
    } else if (condition === 'sunset' || condition === 'golden_hour') {
      activities.push('PHOTOGRAPHY: Golden hour light - perfect for stunning photos');
    }
  }
  
  // Ski/winter activities
  if (activityTypes?.includes('ski') || temp < 5) {
    if (precipitation > 0 && temp < 0) {
      activities.push('SKIING: Good snow conditions expected');
    } else if (precipitation < 5 && temp < 0) {
      activities.push('Skiing: Cold but dry, slopes may be icy');
    } else if (temp > 5) {
      activities.push('Skiing: Too warm, conditions may be slushy');
    }
  }
  
  // Cultural activities
  if (activityTypes?.includes('cultural') || !activityTypes) {
    if (condition === 'rain' || temp > 32 || temp < 5) {
      activities.push('CULTURAL: Good day for museums, galleries, indoor sightseeing');
    } else {
      activities.push('CULTURAL: Great day for outdoor markets, walking tours, architecture viewing');
    }
  }
  
  // Water activities
  if (activityTypes?.includes('water') || temp > 25) {
    if (condition === 'clear' && uvIndex < 8 && wind < 20) {
      activities.push('WATER ACTIVITIES: Excellent conditions for swimming, snorkeling, kayaking');
    } else if (wind > 25) {
      activities.push('Water activities: Windy, only sheltered waters recommended');
    } else if (condition === 'thunderstorm') {
      activities.push('Water activities: NOT SAFE, lightning risk');
    }
  }
  
  // Seasonal activities
  if (season === 'spring' && activityTypes?.includes('nature')) {
    activities.push('SPRING: Wildflowers, blossoms, and mild weather for nature walks');
  }
  if (season === 'fall' && activityTypes?.includes('nature')) {
    activities.push('FALL: Autumn colors at peak, perfect for scenic drives and hikes');
  }
  
  return activities;
}

// ============================================================================
// ENHANCED MAIN TRAVELING ADVICE FUNCTION
// ============================================================================

export const getTravelingAdvice = (data, userQuery = '') => {
  if (!data) return "Loading weather data...";

  const { start, destination, transportMode, duration, activityTypes, flightDuration } = extractTravelInfo(userQuery);

  // If we don't have both locations
  if (!start || !destination) {
    return `Tell me your travel plans like:
  - Paris to London
  - Road trip from LA to Vegas
  - Flying Mumbai to Delhi tomorrow
  - Train from Rome to Florence

I will analyze weather for your entire journey!`;
  }

  const { 
    temp, feelsLike, condition, humidity, wind, windGust, uvIndex, 
    aqi, visibility, city, pressure, dewPoint, precipitation,
    tempMin, tempMax, sunrise, sunset
  } = data;
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const comfort = getComfortScore({ temp, humidity, wind });
  const pressureTrend = getPressureTrend(data);
  const visibilityCategory = getVisibilityCategory(visibility);
  const timeOfDay = getTimeOfDay();
  const season = getSeason();
  
  // We have current city weather - use as start or destination
  const currentCity = city;
  const isStart = currentCity && (currentCity.toLowerCase().includes(start.toLowerCase()) || 
                  start.toLowerCase().includes(currentCity.toLowerCase()));
  
  let startData = isStart ? data : { temp: 20, condition: 'unknown', city: start, humidity: 50, wind: 10, visibility: 10 };
  let destData = !isStart ? data : { temp: 20, condition: 'unknown', city: destination, humidity: 50, wind: 10, visibility: 10 };
  
  // Detect transport mode
  let mode = transportMode || 'commercial_flight';
  if (!transportMode) {
    const q = userQuery.toLowerCase();
    if (q.includes('road') || q.includes('driv') || q.includes('car') || q.includes('rv')) mode = 'road_trip';
    if (q.includes('train') || q.includes('rail')) mode = 'train';
    if (q.includes('bus')) mode = 'bus';
    if (q.includes('cruise') || q.includes('ship')) mode = 'cruise_ship';
    if (q.includes('ferry') || q.includes('boat')) mode = 'ferry';
    if (q.includes('motorcycle') || q.includes('bike trip')) mode = 'motorcycle';
    if (q.includes('cycl') || q.includes('bike tour')) mode = 'bicycle';
    if (q.includes('walk') || q.includes('hike')) mode = 'walking';
    if (q.includes('helicopter') || q.includes('chopper')) mode = 'helicopter';
    if (q.includes('private') || q.includes('charter')) mode = 'private_plane';
  }
  
  const transportConfig = TRANSPORT_MODES[mode];
  
  // Build response sections
  let verdict = [];
  let packing = [];
  let warnings = [];
  let disruptions = [];
  let route = [];
  let activities = [];
  let jetLag = [];
  let comfortAdvice = [];

  // ========================================================================
  // WEATHER CHECK
  // ========================================================================
  
  verdict.push(`TRAVEL ROUTE: ${start} to ${destination}`);
  verdict.push(`Mode: ${mode.replace(/_/g, ' ').toUpperCase()}`);
  verdict.push('');
  verdict.push(`Current Weather (${currentCity || 'Current Location'}):`);
  verdict.push(`  ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C) | ${condition}`);
  verdict.push(`  Wind: ${Math.round(wind)}km/h | Humidity: ${Math.round(humidity)}% | UV: ${uvIndex}`);
  verdict.push(`  Visibility: ${visibility}km | AQI: ${aqi}`);

  // ========================================================================
  // WEATHER HAZARDS
  // ========================================================================
  
  if (condition === 'thunderstorm') {
    warnings.push(`THUNDERSTORM in ${currentCity || 'current location'}!`);
    if (mode === 'commercial_flight' || mode === 'private_plane') {
      warnings.push('  - Flights: expect ground stops, delays, or diversions');
      warnings.push('  - Airport: lightning within 5 miles equals ramp closure');
      warnings.push('  - After storm passes: backlog of 1-3 hours');
    }
    if (mode === 'road_trip') {
      warnings.push('  - Driving: pull over if visibility reduced, avoid flooded roads');
      warnings.push('  - Lightning: safest place is inside hard-topped vehicle');
    }
    if (mode === 'cruise_ship' || mode === 'ferry') {
      warnings.push('  - Ships can operate in thunderstorms but tenders may be cancelled');
    }
  }
  
  if (visibility < 1) {
    warnings.push(`DENSE FOG (${visibility}km visibility):`);
    if (mode === 'commercial_flight' || mode === 'private_plane' || mode === 'helicopter') {
      warnings.push(`  - ${mode.replace(/_/g, ' ')}: delays or cancellations likely`);
      warnings.push(`  - Below Cat I ILS minimums`);
    }
    if (mode === 'road_trip') {
      warnings.push('  - EXTREMELY DANGEROUS: reduce speed to 40 km/h or less');
      warnings.push('  - Use fog lights, not high beams');
      warnings.push('  - Consider delaying departure until fog lifts');
    }
  }
  
  if (wind > 50) {
    warnings.push(`HIGH WIND ${Math.round(wind)}km/h:`);
    if (mode === 'commercial_flight') {
      warnings.push('  - Possibly within limits but expect bumpy ride');
      warnings.push('  - Crosswinds may exceed landing limits at smaller airports');
    }
    if (mode === 'road_trip') {
      warnings.push('  - High-profile vehicles: risk of being blown over');
      warnings.push('  - Keep both hands on wheel, watch for debris');
    }
  }
  
  if (precipitation > 10 && condition === 'snow') {
    warnings.push(`HEAVY SNOW ${Math.round(precipitation)}mm:`);
    warnings.push('  - Airport: de-icing mandatory, delays 30-90 minutes');
    warnings.push('  - Roads: may require chains, check state requirements');
    warnings.push('  - Pack: extra food, water, blankets in car');
  }
  
  if (effectiveTemp > 35) {
    warnings.push(`EXTREME HEAT ${Math.round(heatIndex)}°C:`);
    if (mode === 'commercial_flight') {
      warnings.push('  - High altitude airports: performance penalties');
      warnings.push('  - Aircraft may need weight restrictions');
    }
    if (mode === 'road_trip') {
      warnings.push('  - Check tire pressure, coolant, AC before departure');
      warnings.push('  - Carry extra water of 4L per person minimum');
      warnings.push('  - Never leave children or pets in parked car');
    }
  }
  
  if (effectiveTemp < -15) {
    warnings.push(`EXTREME COLD ${Math.round(windChill)}°C:`);
    warnings.push('  - Frostbite risk on exposed skin in under 30 minutes');
    warnings.push('  - Vehicle: battery failure, frozen fuel lines possible');
    warnings.push('  - Pack emergency kit: blankets, hand warmers, flares');
  }

  // ========================================================================
  // TURBULENCE FORECAST
  // ========================================================================
  
  if (mode === 'commercial_flight' || mode === 'private_plane') {
    if (wind > 30 || condition === 'thunderstorm') {
      verdict.push('');
      verdict.push(`TURBULENCE FORECAST:`);
      if (condition === 'thunderstorm') {
        verdict.push(`  Severe near thunderstorms. Pilots avoid by 20+ miles.`);
      } else if (wind > 40) {
        verdict.push(`  Moderate to severe. Seatbelt sign expected for extended periods.`);
      } else if (wind > 25) {
        verdict.push(`  Light to moderate chop. Keep seatbelt fastened.`);
      } else {
        verdict.push(`  Light or none expected. Smooth flight likely.`);
      }
    }
  }

  // ========================================================================
  // ROUTE ANALYSIS
  // ========================================================================
  
  route = getRouteWeather(mode, startData, destData);

  // ========================================================================
  // DISRUPTION PREDICTIONS
  // ========================================================================
  
  disruptions = predictDisruptions(startData, destData, mode);

  // ========================================================================
  // PACKING RECOMMENDATIONS
  // ========================================================================
  
  packing = getPackingList(startData, destData, mode, duration || 7, season);

  // ========================================================================
  // JET LAG
  // ========================================================================
  
  if (mode === 'commercial_flight' || mode === 'private_plane') {
    const timezoneDiff = estimateTimezoneDiff(start, destination);
    if (Math.abs(timezoneDiff) > 2) {
      jetLag = getJetLagAdvice(timezoneDiff, timezoneDiff > 0 ? 'east' : 'west', flightDuration);
    }
  }

  // ========================================================================
  // DESTINATION ACTIVITIES
  // ========================================================================
  
  activities = getDestinationActivities(destData, activityTypes, mode);

  // ========================================================================
  // COMFORT ADVICE
  // ========================================================================
  
  if (temp > 25) {
    comfortAdvice.push('Travel day tip: dress in layers as AC on transport can be cold');
    comfortAdvice.push('Hydrate: 250ml water per hour of travel');
  }
  if (temp < 10) {
    comfortAdvice.push('Travel day tip: warm layers you can remove in heated terminals and cabins');
    comfortAdvice.push('Pack: portable charger as batteries die faster in cold');
  }
  if (pressureTrend === 'falling_rapidly') {
    comfortAdvice.push('Pressure dropping: ears may need help equalizing by chewing gum or yawning');
  }
  if (mode === 'commercial_flight' && flightDuration > 4) {
    comfortAdvice.push('Long flight: walk every 2 hours, stretch legs, stay hydrated');
    comfortAdvice.push('Sleep strategy: adjust to destination time zone immediately');
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "TRAVEL WEATHER ADVISORY",
    "JOURNEY WEATHER ASSESSMENT",
    "TRIP WEATHER ANALYSIS",
    "DEPARTURE CONDITIONS REPORT",
    "ROUTE WEATHER EVALUATION"
  ];

  let response = `${random(intros)}\n`;
  response += `\n`;
  
  // Verdict
  verdict.forEach(v => response += `${v}\n`);
  
  // Disruptions
  if (disruptions.length > 0) {
    response += `\nPOTENTIAL DISRUPTIONS:\n`;
    disruptions.forEach(d => {
      const sevIcon = d.severity === 'Critical' ? '🔴' : d.severity === 'High' ? '🟠' : d.severity === 'Moderate' ? '🟡' : '🟢';
      response += `  ${sevIcon} ${d.type}: ${d.probability} probability (${d.impact})\n`;
    });
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `\nWEATHER WARNINGS:\n`;
    warnings.forEach(w => response += `${w}\n`);
  }
  
  // Route
  if (route.length > 0) {
    response += `\nROUTE CONDITIONS:\n`;
    route.forEach(r => response += `${r}\n`);
  }
  
  // Packing
  response += `\nPACKING RECOMMENDATIONS:\n`;
  if (packing.clothing && packing.clothing.length > 0) {
    response += `\nCLOTHING:\n`;
    packing.clothing.forEach(c => response += `${c}\n`);
  }
  if (packing.accessories && packing.accessories.length > 0) {
    response += `\nACCESSORIES:\n`;
    packing.accessories.forEach(a => response += `${a}\n`);
  }
  if (packing.health && packing.health.length > 0) {
    response += `\nHEALTH:\n`;
    packing.health.forEach(h => response += `${h}\n`);
  }
  if (packing.electronics && packing.electronics.length > 0) {
    response += `\nELECTRONICS:\n`;
    packing.electronics.forEach(e => response += `${e}\n`);
  }
  if (packing.documents && packing.documents.length > 0) {
    response += `\nDOCUMENTS:\n`;
    packing.documents.forEach(d => response += `${d}\n`);
  }
  if (packing.special && packing.special.length > 0) {
    response += `\nSPECIAL:\n`;
    packing.special.forEach(s => response += `${s}\n`);
  }
  
  // Jet Lag
  if (jetLag.length > 0) {
    response += `\nJET LAG ADVISORY:\n`;
    jetLag.forEach(j => response += `${j}\n`);
  }
  
  // Destination Activities
  if (activities.length > 0) {
    response += `\nDESTINATION ACTIVITIES:\n`;
    activities.forEach(a => response += `${a}\n`);
  }
  
  // Comfort
  if (comfortAdvice.length > 0) {
    response += `\nCOMFORT TIPS:\n`;
    comfortAdvice.forEach(c => response += `${c}\n`);
  }
  
  // Transport-specific tips
  if (transportConfig && transportConfig.special) {
    response += `\n${mode.replace(/_/g, ' ').toUpperCase()} TIPS:\n`;
    transportConfig.special.slice(0, 8).forEach(s => response += `  - ${s}\n`);
  }
  
  // Weather summary
  response += `\nWEATHER DETAILS (${currentCity || 'Current Location'}):\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  High and Low: ${Math.round(tempMax)}°C / ${Math.round(tempMin)}°C\n`;
  if (windChill < temp - 2) response += `  Wind Chill: ${Math.round(windChill)}°C\n`;
  if (heatIndex > temp + 2) response += `  Heat Index: ${Math.round(heatIndex)}°C\n`;
  response += `  Humidity: ${Math.round(humidity)}%\n`;
  response += `  Wind: ${Math.round(wind)}km/h (gusts ${Math.round(windGust || wind)}km/h)\n`;
  response += `  Visibility: ${visibility}km (${visibilityCategory})\n`;
  response += `  UV Index: ${uvIndex} (burn time ~${burnMin} minutes)\n`;
  response += `  AQI: ${aqi} (${getAQICategory(aqi)})\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm\n`;
  
  // Sunrise/Sunset
  if (sunrise && sunset) {
    response += `  Sunrise: ${sunrise} | Sunset: ${sunset}\n`;
    response += `  Daylight: ${getDayLength(data)} hours\n`;
  }
  
  // Final advice
  response += `\nTRAVEL WISDOM:\n`;
  if (mode === 'commercial_flight' && warnings.length > 0) {
    response += `  Book flexible tickets if severe weather expected. Check airline waiver policies.\n`;
  }
  if (mode === 'road_trip') {
    response += `  Share your route with someone. Check in at waypoints. Weather changes fast.\n`;
  }
  response += `  Download offline maps and weather apps before departing. Cell service is not everywhere.\n`;
  
  const travelQuotes = [
    "The world is a book and those who do not travel read only one page. - St. Augustine",
    "Travel is fatal to prejudice, bigotry, and narrow-mindedness. - Mark Twain",
    "Not all those who wander are lost. - J.R.R. Tolkien",
    "Adventure is worthwhile. - Aesop",
    "Travel makes one modest. You see what a tiny place you occupy in the world. - Gustave Flaubert",
    "A journey of a thousand miles begins with a single step. - Lao Tzu"
  ];
  response += `\n--- TRAVEL WISDOM ---\n${random(travelQuotes)}`;

  return response;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractTravelInfo(query) {
  if (!query) return { start: null, destination: null };
  const q = query.toLowerCase();
  
  let start = null;
  let destination = null;
  let transportMode = null;
  let duration = null;
  let flightDuration = null;
  let activityTypes = [];
  
  // Extract "from X to Y"
  const fromToMatch = q.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|,|\?)/i);
  if (fromToMatch) {
    start = capitalizeCity(fromToMatch[1].trim());
    destination = capitalizeCity(fromToMatch[2].trim());
  }
  
  // Extract "X to Y" or "X → Y"
  if (!start) {
    const xToYMatch = q.match(/([a-z\s]+?)\s+(?:to|→|->)\s+([a-z\s]+?)(?:\s|$|,|\?)/i);
    if (xToYMatch) {
      start = capitalizeCity(xToYMatch[1].trim());
      destination = capitalizeCity(xToYMatch[2].trim());
    }
  }
  
  // Extract flight duration
  const hourMatch = q.match(/(\d+)\s*hour/i);
  if (hourMatch) {
    flightDuration = parseInt(hourMatch[1]);
  }
  
  // Detect transport mode
  if (q.includes('fly') || q.includes('flight') || q.includes('plane') || q.includes('airport')) {
    transportMode = 'commercial_flight';
  } else if (q.includes('drive') || q.includes('car') || q.includes('road trip') || q.includes('rv')) {
    transportMode = 'road_trip';
  } else if (q.includes('train') || q.includes('rail')) {
    transportMode = 'train';
  } else if (q.includes('bus') || q.includes('coach')) {
    transportMode = 'bus';
  } else if (q.includes('cruise') || q.includes('ship')) {
    transportMode = 'cruise_ship';
  } else if (q.includes('ferry') || q.includes('boat')) {
    transportMode = 'ferry';
  } else if (q.includes('motorcycle') || q.includes('motorbike')) {
    transportMode = 'motorcycle';
  } else if (q.includes('bicycle') || q.includes('bike tour') || q.includes('cycling')) {
    transportMode = 'bicycle';
  } else if (q.includes('helicopter') || q.includes('chopper')) {
    transportMode = 'helicopter';
  } else if (q.includes('private jet') || q.includes('charter')) {
    transportMode = 'private_plane';
  } else if (q.includes('walk') || q.includes('hike') || q.includes('trek')) {
    transportMode = 'walking';
  }
  
  // Detect duration
  const dayMatch = q.match(/(\d+)\s*day/i);
  const weekMatch = q.match(/(\d+)\s*week/i);
  if (weekMatch) duration = parseInt(weekMatch[1]) * 7;
  else if (dayMatch) duration = parseInt(dayMatch[1]);
  
  // Detect activities
  if (q.includes('beach') || q.includes('swim') || q.includes('snorkel')) activityTypes.push('beach');
  if (q.includes('hike') || q.includes('trek') || q.includes('climb')) activityTypes.push('outdoor');
  if (q.includes('photo') || q.includes('camera')) activityTypes.push('photography');
  if (q.includes('ski') || q.includes('snowboard')) activityTypes.push('ski');
  if (q.includes('museum') || q.includes('sightsee')) activityTypes.push('cultural');
  if (q.includes('kayak') || q.includes('paddle') || q.includes('sail')) activityTypes.push('water');
  if (q.includes('garden') || q.includes('forest') || q.includes('wildlife')) activityTypes.push('nature');
  
  return { start, destination, transportMode, duration, flightDuration, activityTypes };
}

function capitalizeCity(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function estimateTimezoneDiff(city1, city2) {
  // Simplified estimation - in production, use timezone database
  const knownTimezones = {
    'london': 0, 'paris': 1, 'berlin': 1, 'rome': 1, 'madrid': 1,
    'new york': -5, 'chicago': -6, 'denver': -7, 'los angeles': -8,
    'tokyo': 9, 'shanghai': 8, 'singapore': 8, 'hong kong': 8,
    'dubai': 4, 'mumbai': 5.5, 'delhi': 5.5,
    'sydney': 11, 'auckland': 13,
    'lagos': 1, 'nairobi': 3, 'cairo': 2, 'cape town': 2,
    'moscow': 3, 'istanbul': 3,
    'rio': -3, 'buenos aires': -3, 'santiago': -4,
    'mexico city': -6, 'toronto': -5, 'vancouver': -8
  };
  
  const tz1 = knownTimezones[city1?.toLowerCase()] || 0;
  const tz2 = knownTimezones[city2?.toLowerCase()] || 0;
  
  return tz2 - tz1;
}

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { getPackingList, getJetLagAdvice, getRouteWeather, getDestinationActivities };

export default getTravelingAdvice;
