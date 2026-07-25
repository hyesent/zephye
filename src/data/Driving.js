import {
  calcWindChill,
  calcHeatIndex,
  getWindDirection,
  getComfortScore,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  getVisibilityCategory,
  getPavementTemp,
  getPressureTrend,
  calculateStoppingDistance
} from './calculations';

// ============================================================================
// COMPREHENSIVE ROAD SAFETY & TRANSPORTATION WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  "Is it safe to drive today?",
  "Should I cycle to work?",
  "Good weather for motorbike?",
  "Are roads slippery?",
  "Is it too windy for cycling?",
  "Should I drive or take a cab?",
  "Will rain affect my commute?",
  "Is visibility bad for driving?",
  "Safe to ride my bike?",
  "Should I take the highway or back roads?",
  "Is it safe to drive through the mountains?",
  "Will there be black ice?",
  "Should I use snow chains?",
  "Is 4WD enough for today?",
  "Can I drive my RV in this wind?",
  "Is it safe to tow a trailer?",
  "Should I postpone my road trip?",
  "Is the coastal highway safe today?",
  "Will fog be an issue on my commute?",
  "Should I leave early for work?",
  "Is rush hour going to be worse?",
  "Will schools be delayed?",
  "Should I work from home?",
  "Is public transport running?",
  "Will my flight be affected?",
  "Should I drive instead of fly?",
  "Is it safe for elderly drivers?",
  "Should new drivers stay off roads?",
  "Is it safe to drive with kids?",
  "Will my car battery die?",
  "Should I check my tire pressure?",
  "Is my car AC strong enough?",
  "Do I need winter tires today?",
  "Should I get gas before the storm?",
  "Is my windshield fluid enough?",
  "Will my wipers freeze?",
  "Should I cover my car tonight?",
  "Is it safe to park under trees?",
  "Will there be hail damage?",
  "Should I park in a garage?",
  "Is street parking safe?",
  "Will there be flooding on my route?",
  "Is that underpass safe?",
  "Should I take the high road?",
  "Is the bridge going to ice?",
  "Will construction be affected?",
  "Are school zones extra dangerous?",
  "Is it safe for school buses?",
  "Should I drive my classic car?",
  "Is it convertible weather?",
  "Will my truck handle the wind?",
  "Should I use cruise control?",
  "Is engine braking safe downhill?",
  "Should I turn off traction control?",
  "Will my low-profile tires be OK?",
  "Is my spare tire good enough?",
  "Should I bring emergency supplies?",
  "What should be in my car emergency kit?",
  "Should I tell someone my route?",
  "Is it safe to drive at night?",
  "Will deer be active on roads?",
  "Is it migration season?",
  "Should I worry about rockslides?",
  "Is avalanche risk high?",
  "Will there be dust storms?",
  "Is it haboob season?",
  "Should I pull over and wait?",
  "How long will the storm last?",
  "Will roads be plowed?",
  "Are road crews out?",
  "Should I use a different route?",
  "Is my usual shortcut safe?",
  "Will GPS reroute me through danger?",
  "Should I download offline maps?",
  "Is my phone charged enough?",
  "Do I have a car charger?",
  "Should I bring blankets?",
  "What if I get stranded?",
  "Is roadside assistance available?",
  "How long will help take?",
  "Should I stay with my car?",
  "Is it safe to walk for help?",
  "Can I drive through water?",
  "How deep is too deep?",
  "Will my electric car range drop?",
  "Should I preheat my EV?",
  "Is regenerative braking affected?",
  "Will charging stations work?",
  "Should I charge to 100%?",
  "Is it safe to charge in rain?",
  "Will my hybrid battery be OK?",
  "Should I use eco mode?",
  "Is it safe to use autopilot?",
  "Will lane keeping work?",
  "Are cameras/sensors blocked?",
  "Should I clean my sensors?",
  "Is adaptive cruise reliable?",
  "Will emergency braking work?",
  "Should I disable auto high beams?",
  "Is my dash cam going to help?",
  "Should I check my tires before leaving?"
];

// ============================================================================
// VEHICLE TYPE DATABASE
// ============================================================================

const VEHICLE_TYPES = {
  sedan: {
    windSensitivity: 4,
    floodClearance: 15,    // cm of water before danger
    iceCapability: 2,
    snowCapability: 1,
    visibilityNeed: 100,   // meters minimum
    stoppingDistanceMultiplier: { dry: 1, wet: 1.8, snow: 5, ice: 10 },
    special: [
      'Low ground clearance: avoid flooded roads',
      'Front-wheel drive: better in snow than RWD',
      'All-season tires: lose grip below 7°C',
      'Winter tires: improve stopping distance 30-40% on snow/ice'
    ]
  },
  suv: {
    windSensitivity: 7,    // Higher profile = more wind effect
    floodClearance: 25,
    iceCapability: 3,
    snowCapability: 4,
    visibilityNeed: 100,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.7, snow: 4.5, ice: 9 },
    special: [
      '4WD helps you GO, doesn\'t help you STOP',
      'Higher center of gravity = rollover risk in high wind',
      'Better ground clearance for snow/unpaved roads',
      'Heavier vehicle = longer stopping distance'
    ]
  },
  truck: {
    windSensitivity: 8,
    floodClearance: 30,
    iceCapability: 2,
    snowCapability: 5,
    visibilityNeed: 150,
    stoppingDistanceMultiplier: { dry: 1, wet: 2, snow: 5, ice: 10 },
    special: [
      'Empty bed = no traction on rear wheels. Add weight over axle.',
      'High profile: extreme wind sensitivity',
      'Towing: trailer sways in wind. Reduce speed 30%.',
      'Diesel: fuel gels below -15°C. Use winter blend.'
    ]
  },
  motorcycle: {
    windSensitivity: 10,
    floodClearance: 5,
    iceCapability: 0,      // Impossible
    snowCapability: 0,      // Impossible
    visibilityNeed: 500,
    stoppingDistanceMultiplier: { dry: 1, wet: 2.5, snow: null, ice: null },
    special: [
      'Rain: 90% less traction. White lines = ice when wet.',
      'Wind: crosswinds push bike across lanes',
      'Cold: wind chill at 100km/h = frostbite in minutes',
      'Wet leaves: as slippery as ice',
      'No crash protection: every accident = hospital'
    ]
  },
  bicycle: {
    windSensitivity: 9,
    floodClearance: 5,
    iceCapability: 0,
    snowCapability: 0,
    visibilityNeed: 500,
    stoppingDistanceMultiplier: { dry: 1, wet: 3, snow: null, ice: null },
    special: [
      'Rain: braking distance triples. Rim brakes = 0 in wet.',
      'Potholes: invisible under puddles. Can throw you.',
      'Door zone: stay 1m from parked cars (dooring risk)',
      'No protection: cars are your biggest danger'
    ]
  },
  rv_camper: {
    windSensitivity: 10,
    floodClearance: 20,
    iceCapability: 1,
    snowCapability: 2,
    visibilityNeed: 200,
    stoppingDistanceMultiplier: { dry: 1, wet: 2.5, snow: 6, ice: 12 },
    special: [
      'Wind: can tip over at 80km/h crosswind. Pull over.',
      'Weight: 5-20 tons. Stopping distance enormous.',
      'Sway: passing trucks create air blast. Be ready.',
      'Height: know your clearance. Bridges, overpasses, drive-throughs.',
      'Park facing into wind if possible'
    ]
  },
  electric_vehicle: {
    windSensitivity: 4,
    floodClearance: 15,
    iceCapability: 3,
    snowCapability: 3,
    visibilityNeed: 100,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.8, snow: 4, ice: 9 },
    special: [
      'Cold: range drops 20-40% below 0°C',
      'Heat: AC reduces range 10-15%',
      'Precondition while plugged in (warms battery + cabin)',
      'Regenerative braking: reduced in cold (battery can\'t accept charge)',
      'Charging: slower in extreme cold. Battery must warm first.',
      'Supercharging: slower in cold. Plan longer charging stops.'
    ]
  }
};

// ============================================================================
// ROAD TYPE DATABASE
// ============================================================================

const ROAD_TYPES = {
  highway: {
    speedLimit: 100,
    hazards: [
      'Hydroplaning risk above 80km/h in standing water',
      'Crosswinds strongest on open stretches',
      'Fog banks form in low areas, near water',
      'Black ice: bridges and overpasses freeze first',
      'Fatigue: monotony + weather = microsleeps'
    ],
    tips: [
      'Increase following distance to 4+ seconds in rain',
      'If hydroplaning: ease off gas, steer straight, DON\'T BRAKE',
      'Scan 12 seconds ahead for hazards',
      'Watch for wind socks, flags for wind direction/speed'
    ]
  },
  mountain_road: {
    speedLimit: 60,
    hazards: [
      'Black ice: shaded corners stay icy all day',
      'Fog: visibility can drop to zero in seconds',
      'Rockslides: after heavy rain or freeze-thaw',
      'Avalanche: check forecasts before mountain driving',
      'Steep grades: brake fade. Use engine braking.',
      'Wildlife: deer, elk, bears on road at dawn/dusk'
    ],
    tips: [
      'Chains may be required. Carry them. Know how to install.',
      'Use low gear downhill (save brakes)',
      'Honk on blind corners (wildlife, rockslides)',
      'If stuck: stay with vehicle. Easier to find.',
      'Check road conditions before departing. Many passes close in storms.'
    ]
  },
  coastal_road: {
    speedLimit: 80,
    hazards: [
      'Storm surge: waves can wash over road',
      'Coastal fog: rolls in within minutes',
      'Salt spray: reduces visibility, corrodes car',
      'Sand on road: reduces traction',
      'Erosion: road can wash out during storms'
    ],
    tips: [
      'Check tide times. High tide + storm = road flooding.',
      'Wash car after coastal drive (salt corrosion)',
      'If waves are hitting road: TURN AROUND. Don\'t risk it.',
      'Wind: strongest near coast. Secure loose items on/in car.'
    ]
  },
  rural_road: {
    speedLimit: 80,
    hazards: [
      'No lighting: pitch black at night',
      'Wildlife: deer most active dawn/dusk',
      'Slow vehicles: tractors, horse riders, cyclists',
      'Gravel shoulders: drop-off risk',
      'Flooding: ditches overflow, roads wash out',
      'Snow: plowed last (or not at all)'
    ],
    tips: [
      'Full fuel tank. Gas stations far apart.',
      'Emergency kit: blankets, food, water, flashlight.',
      'Tell someone your route and ETA.',
      'Cell service: may be spotty. Download offline maps.',
      'If lost: stay on main roads. Don\'t follow GPS down farm tracks.'
    ]
  },
  urban: {
    speedLimit: 50,
    hazards: [
      'Flooding: underpasses, low areas fill first',
      'Hydroplaning: oil rises in first 30 minutes of rain',
      'Pedestrians: huddled under umbrellas, can\'t see traffic',
      'Cyclists: harder to see in rain/fog',
      'Fallen trees/branches: after storms',
      'Downed power lines: do NOT drive over'
    ],
    tips: [
      'Public transport: may be safer in extreme weather',
      'Underground parking: may flood. Avoid in heavy rain.',
      'Tree-lined streets: branches fall in wind. Park away.',
      'Traffic lights: may be out. Treat as 4-way stop.',
      'Manhole covers: can pop off in flooding. Invisible hazard.'
    ]
  }
};

// ============================================================================
// HYDROPLANING CALCULATOR
// ============================================================================

function getHydroplaningRisk(data, speed) {
  const { precipitation, condition } = data;
  const advice = [];
  
  if (condition === 'rain' || condition === 'drizzle') {
    advice.push("💧 HYDROPLANING RISK:");
    advice.push("• Hydroplaning occurs when water builds up between tires and road");
    advice.push("• Formula: Hydroplaning speed (km/h) = 10.35 × √(tire pressure in PSI)");
    advice.push("• Typical tire (32 PSI): hydroplane at ~92 km/h");
    advice.push("• Worn tires (3mm tread): hydroplane at ~75 km/h");
    advice.push("• Bald tires (1.5mm): hydroplane at ~50 km/h");
    advice.push("");
    
    if (precipitation > 10) {
      advice.push("🚨 HEAVY RAIN: Hydroplaning risk EXTREME.");
      advice.push("• Standing water likely. Reduce speed to 60 km/h or less.");
      advice.push("• Avoid outer lanes (water pools at edges)");
      advice.push("• Follow tire tracks of vehicle ahead (they\'ve displaced water)");
    } else if (precipitation > 5) {
      advice.push("⚠️ MODERATE RAIN: Hydroplaning risk HIGH.");
      advice.push("• Reduce speed 25%. No cruise control.");
      advice.push("• If you feel steering get light: ease off gas, grip wheel firmly");
    }
    
    advice.push("");
    advice.push("IF YOU HYDROPLANE:");
    advice.push("1. DO NOT BRAKE (causes spin)");
    advice.push("2. DO NOT TURN sharply");
    advice.push("3. Ease off accelerator slowly");
    advice.push("4. Steer straight until tires regain contact");
    advice.push("5. When you feel grip return, gently brake to reduce speed");
  }
  
  return advice;
}

// ============================================================================
// BLACK ICE PREDICTOR
// ============================================================================

function getBlackIceRisk(data) {
  const { temp, tempMin, condition, humidity, dewPoint, timeOfDay } = data;
  const advice = [];
  
  const iceRisk = temp <= 3 && (condition === 'rain' || condition === 'drizzle' || condition === 'snow' || humidity > 70);
  const blackIceRisk = temp <= 1 && tempMin <= -2 && (condition === 'clear' || humidity > 80);
  
  if (iceRisk || blackIceRisk) {
    advice.push("🧊 BLACK ICE DANGER:");
    advice.push("• Black ice: thin, transparent ice that looks like wet road");
    advice.push("• INVISIBLE. You won\'t see it until you\'re spinning.");
    advice.push("• Most common: bridges, overpasses, shaded areas, 0-3am");
    advice.push("");
    
    if (blackIceRisk) {
      advice.push("🚨 HIGH BLACK ICE RISK TODAY:");
      advice.push(`• Temperature ${temp}°C dropping to ${tempMin}°C`);
      advice.push("• Clear sky + cold = rapid cooling = black ice formation");
      advice.push("• Especially dangerous: early morning before sun hits road");
    }
    
    advice.push("");
    advice.push("BLACK ICE LOCATIONS (MOST DANGEROUS):");
    advice.push("• Bridges and overpasses (cold air above AND below)");
    advice.push("• Shaded areas (sun hasn\'t melted ice)");
    advice.push("• Tunnel entrances/exits (temperature change)");
    advice.push("• Hill crests and valley bottoms (cold air sinks)");
    advice.push("• Intersections (exhaust condensation freezes)");
    advice.push("");
    advice.push("IF YOU HIT BLACK ICE:");
    advice.push("1. DO NOT BRAKE");
    advice.push("2. DO NOT ACCELERATE");
    advice.push("3. Steer STRAIGHT (or gently in direction you want to go)");
    advice.push("4. Wait for tires to find grip");
    advice.push("5. If skidding: steer INTO the skid (look where you want to go)");
  } else if (temp <= 3) {
    advice.push("⚠️ Temperature near freezing. Watch for icy patches on bridges/shade.");
  }
  
  return advice;
}

// ============================================================================
// FOG DRIVING PROTOCOL
// ============================================================================

function getFogProtocol(data) {
  const { visibility } = data;
  const advice = [];
  
  if (visibility < 0.5) {
    advice.push("🌫️ DENSE FOG: EXTREME DANGER.");
    advice.push(`• Visibility: ${visibility}km (less than 500m)`);
    advice.push("• PILE-UP RISK: Multi-car crashes common in these conditions");
    advice.push("");
    advice.push("IF YOU MUST DRIVE:");
    advice.push("• Speed: 25-40 km/h MAXIMUM");
    advice.push("• Lights: LOW BEAM + FOG LIGHTS (if equipped)");
    advice.push("• NO HIGH BEAMS (reflects off fog, blinds you)");
    advice.push("• NO CRUISE CONTROL (need full control)");
    advice.push("• Open windows slightly (hear traffic you can\'t see)");
    advice.push("• Follow road edge line (not center line)");
    advice.push("• NO passing. NO lane changes unless absolutely necessary.");
    advice.push("• If you can\'t see: pull WELL off road, lights OFF (so others don\'t follow your lights and hit you)");
    advice.push("");
    advice.push("CONSIDER: Delay trip until fog lifts. It\'s not worth your life.");
  } else if (visibility < 1) {
    advice.push("🌫️ FOG: Limited visibility.");
    advice.push("• Reduce speed to 50 km/h or less");
    advice.push("• Low beams + fog lights. No high beams.");
    advice.push("• Increase following distance to 6+ seconds");
  } else if (visibility < 2) {
    advice.push("🌁 Light fog. Reduce speed. Use low beams.");
  }
  
  return advice;
}

// ============================================================================
// WINTER DRIVING CALCULATOR
// ============================================================================

function getWinterDrivingAdvice(data) {
  const { temp, precipitation, condition, wind } = data;
  const advice = [];
  
  if (condition === 'snow' || (temp <= 0 && precipitation > 0)) {
    advice.push("❄️ WINTER DRIVING CONDITIONS:");
    advice.push("");
    
    // Snow accumulation
    if (precipitation > 20) {
      advice.push("HEAVY SNOW: Roads may become impassable.");
      advice.push("• Only drive if absolutely necessary");
      advice.push("• Carry: chains, shovel, kitty litter (traction), blankets");
      advice.push("• If stranded: stay with vehicle. Run engine 10 min/hour for heat.");
      advice.push("• Clear exhaust pipe of snow before running engine (CO poisoning)");
    } else if (precipitation > 5) {
      advice.push("SNOW ACCUMULATING: Drive with extreme caution.");
      advice.push("• Speed: 50% of posted limit or less");
      advice.push("• Following distance: 8-10 seconds");
      advice.push("• Brake gently, early. Test brakes occasionally to check grip.");
    }
    
    advice.push("");
    advice.push("WINTER DRIVING TECHNIQUE:");
    advice.push("• Accelerate and decelerate SLOWLY (no sudden inputs)");
    advice.push("• Uphill: get momentum BEFORE the hill. Steady speed up.");
    advice.push("• Downhill: LOW GEAR. Let engine brake. Don\'t ride brakes.");
    advice.push("• If stuck: straighten wheels, gentle gas. Rock back/forth if needed.");
    advice.push("• Kitty litter, sand, or floor mats under drive wheels for traction");
    advice.push("");
    advice.push("VEHICLE PREP:");
    advice.push("• Full tank of gas (weight + prevents fuel line freeze)");
    advice.push("• Winter tires: compound stays soft below 7°C");
    advice.push("• All-seasons: harden below 7°C. 30% less grip.");
    advice.push("• Tire pressure drops 1 PSI per 5°C drop. Check pressure.");
    advice.push("• Windshield fluid: winter formula (-30°C or lower)");
    advice.push("• Battery: cold reduces capacity 50%. Test battery before winter.");
  }
  
  // Wind chill on roads
  if (wind > 25 && temp < 5) {
    advice.push("");
    advice.push("💨 WIND + COLD: Blowing snow reduces visibility to zero.");
    advice.push("• Whiteout conditions possible. Pull over if you can\'t see.");
    advice.push("• Drifting snow: fills road cuts, underpasses. May be impassable.");
  }
  
  return advice;
}

// ============================================================================
// SUN GLARE WARNING
// ============================================================================

function getSunGlareWarning(data) {
  const { sunPosition, timeOfDay, condition } = data;
  const advice = [];
  
  if (condition === 'clear' || condition === 'partly-cloudy') {
    if (sunPosition === 'sunrise' || sunPosition === 'sunset') {
      advice.push("☀️ SUN GLARE DANGER:");
      advice.push(`• ${sunPosition === 'sunrise' ? 'Sunrise' : 'Sunset'} glare: sun directly in eyes`);
      advice.push("• East-west roads most dangerous at these times");
      advice.push("• Visibility can drop to ZERO for seconds");
      advice.push("");
      advice.push("PROTECTION:");
      advice.push("• Polarized sunglasses");
      advice.push("• Clean windshield (inside AND out) - haze magnifies glare");
      advice.push("• Use sun visor. Adjust seat height if needed.");
      advice.push("• Increase following distance (you can\'t see brake lights in glare)");
      advice.push("• If blinded: slow down gradually. Don\'t slam brakes.");
      advice.push("• Consider alternate route (north-south roads have less glare)");
    }
  }
  
  return advice;
}

// ============================================================================
// EMERGENCY CAR KIT
// ============================================================================

function getEmergencyKit(data) {
  const { temp, condition, season } = data;
  const kit = [];
  
  kit.push("🚨 EMERGENCY CAR KIT:");
  kit.push("");
  kit.push("BASIC (always in car):");
  kit.push("• First aid kit");
  kit.push("• Flashlight + extra batteries");
  kit.push("• Phone charger (cigarette lighter + power bank)");
  kit.push("• Basic tools: screwdriver, pliers, adjustable wrench");
  kit.push("• Jumper cables or portable jump starter");
  kit.push("• Spare tire (check pressure monthly!)");
  kit.push("• Jack and lug wrench");
  kit.push("• Tire pressure gauge");
  kit.push("• Reflective triangles or flares");
  kit.push("• Duct tape and zip ties");
  kit.push("• Multi-tool or knife");
  kit.push("• Paper maps (phone may die/no service)");
  
  if (season === 'winter' || temp < 5) {
    kit.push("");
    kit.push("WINTER ADDITIONS:");
    kit.push("• Warm blankets or sleeping bag");
    kit.push("• Extra warm clothes: hat, gloves, socks");
    kit.push("• Hand warmers (chemical)");
    kit.push("• Ice scraper and snow brush");
    kit.push("• Small shovel");
    kit.push("• Bag of sand/kitty litter (traction)");
    kit.push("• Food: high-energy, non-perishable (nuts, granola bars)");
    kit.push("• Water (insulated container to prevent freezing)");
    kit.push("• Matches or lighter (in waterproof container)");
    kit.push("• Candles (can heat car interior if stranded)");
    kit.push("• Bright cloth (tie to antenna for visibility)");
  }
  
  if (season === 'summer' || temp > 30) {
    kit.push("");
    kit.push("SUMMER ADDITIONS:");
    kit.push("• Extra water: 4L per person minimum");
    kit.push("• Sunscreen and hat");
    kit.push("• Electrolyte packets");
    kit.push("• Cooling towels");
    kit.push("• Umbrella (for shade if stranded)");
  }
  
  return kit;
}

// ============================================================================
// MAIN DRIVING ADVICE FUNCTION
// ============================================================================

export const getDrivingAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, wind, windDir, condition, conditionCode, 
    visibility, uvIndex, aqi, city, dewPoint, tempMin, tempMax,
    precipitation, pressure, sunrise, sunset
  } = data;
  
  const windChill = calcWindChill(temp, wind);
  const heatIndex = calcHeatIndex(temp, humidity);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp;
  const windDirection = getWindDirection(windDir);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isSnow = condition === 'snow';
  const isFog = condition === 'fog' || visibility < 1;
  const timeOfDay = getTimeOfDay();
  const sunPosition = getSunPosition(data);
  const season = getSeason();
  const visibilityCat = getVisibilityCategory(visibility);
  const pavementTemp = getPavementTemp(temp, condition);
  
  // Detect vehicle type
  const q = question.toLowerCase();
  let vehicleType = 'sedan';
  if (q.includes('suv') || q.includes('4wd') || q.includes('jeep')) vehicleType = 'suv';
  if (q.includes('truck') || q.includes('pickup') || q.includes('ute')) vehicleType = 'truck';
  if (q.includes('motorcycle') || q.includes('motorbike') || q.includes('bike')) vehicleType = 'motorcycle';
  if (q.includes('bicycle') || q.includes('cycl') || q.includes('bike')) vehicleType = 'bicycle';
  if (q.includes('rv') || q.includes('camper') || q.includes('motorhome')) vehicleType = 'rv_camper';
  if (q.includes('electric') || q.includes('ev') || q.includes('tesla')) vehicleType = 'electric_vehicle';
  
  // Detect road type
  let roadType = 'urban';
  if (q.includes('highway') || q.includes('freeway') || q.includes('motorway') || q.includes('interstate')) roadType = 'highway';
  if (q.includes('mountain') || q.includes('pass') || q.includes('hill')) roadType = 'mountain_road';
  if (q.includes('coast') || q.includes('beach') || q.includes('ocean')) roadType = 'coastal_road';
  if (q.includes('rural') || q.includes('country') || q.includes('back road')) roadType = 'rural_road';
  
  const vehicleConfig = VEHICLE_TYPES[vehicleType];
  const roadConfig = ROAD_TYPES[roadType];
  const hydroplaning = getHydroplaningRisk(data, 80);
  const blackIce = getBlackIceRisk(data);
  const fogProtocol = getFogProtocol(data);
  const winterDriving = getWinterDrivingAdvice(data);
  const sunGlare = getSunGlareWarning(data);
  const emergencyKit = getEmergencyKit(data);

  let verdict = [];
  let roadConditions = [];
  let cycling = [];
  let motorbike = [];
  let driving = [];
  let warnings = [];
  let tips = [];
  let vehicleSpecific = [];

  // ========================================================================
  // CATASTROPHIC CONDITIONS
  // ========================================================================
  
  if (condition === 'thunderstorm') {
    verdict.push("⛈️ THUNDERSTORM: DANGEROUS driving conditions.");
    warnings.push("Lightning + heavy rain + potential hail + flash flooding.");
    warnings.push("If possible: delay travel until storm passes.");
    roadConditions.push("Flash flooding: NEVER drive through moving water.");
    roadConditions.push("6 inches of water = lose control. 12 inches = car floats. 18 inches = SUV floats.");
  }
  
  if (isSnow && temp <= -5 && precipitation > 15) {
    verdict.push("🚨 BLIZZARD CONDITIONS: Do NOT drive unless emergency.");
    warnings.push("Whiteout conditions. Roads may close. Stranding risk high.");
    warnings.push("If you must drive: full winter kit, chains, blankets, full tank.");
  }
  
  if (visibility < 0.2) {
    verdict.push("🚨 ZERO VISIBILITY: Do not drive.");
    warnings.push("Cannot see road. Pile-up risk extreme. Pull over safely.");
  }
  
  if (wind > 60) {
    verdict.push("🚨 HURRICANE-FORCE WINDS: All vehicles at risk.");
    warnings.push("High-profile vehicles WILL tip. Trees/debris on roads.");
    warnings.push("DO NOT DRIVE unless evacuating. Even then, extreme caution.");
  }

  // ========================================================================
  // GENERAL ROAD CONDITIONS
  // ========================================================================
  
  if (!verdict.length) {
    if (isRaining && precipitation > 10) {
      verdict.push("🌧️ HEAVY RAIN: Hazardous driving. Delay if possible.");
      roadConditions.push("Standing water. Hydroplaning risk. Reduced visibility.");
      roadConditions.push("First 30 min of rain: oil rises = SLIPPERIEST time.");
    } else if (isRaining) {
      verdict.push("🌧️ WET ROADS: Drive with caution.");
      roadConditions.push("Roads slick. Stopping distance nearly doubled.");
      roadConditions.push("Oil patches, especially at intersections.");
    } else if (isSnow) {
      verdict.push("❄️ SNOW: Hazardous. Only essential travel.");
    } else if (isFog) {
      verdict.push("🌫️ FOG: Reduced visibility. Drive slowly.");
    } else if (wind > 40) {
      verdict.push("💨 HIGH WINDS: Dangerous for high-profile vehicles.");
    } else {
      verdict.push("✅ Good driving conditions overall.");
    }
  }

  // ========================================================================
  // STOPPING DISTANCE
  // ========================================================================
  
  const multiplier = isSnow ? vehicleConfig.stoppingDistanceMultiplier.snow :
                     isRaining ? vehicleConfig.stoppingDistanceMultiplier.wet :
                     vehicleConfig.stoppingDistanceMultiplier.dry;
  
  if (multiplier > 1.5) {
    driving.push(`⚠️ STOPPING DISTANCE: ${multiplier}x normal`);
    driving.push(`• At 100 km/h: normal ~40m, today ~${Math.round(40 * multiplier)}m`);
    driving.push(`• Increase following distance to ${Math.round(multiplier * 2)} seconds minimum`);
    driving.push("• Brake earlier, gentler. No sudden inputs.");
  }

  // ========================================================================
  // VEHICLE-SPECIFIC ADVICE
  // ========================================================================
  
  if (vehicleConfig.special) {
    vehicleSpecific.push(`🚗 ${vehicleType.replace(/_/g, ' ').toUpperCase()} SPECIFIC:`);
    vehicleConfig.special.forEach(s => vehicleSpecific.push(`• ${s}`));
  }
  
  // Wind + vehicle
  if (wind > 30) {
    if (vehicleConfig.windSensitivity > 7) {
      warnings.push(`HIGH PROFILE VEHICLE: Wind sensitivity ${vehicleConfig.windSensitivity}/10.`);
      warnings.push(`${vehicleType.replace(/_/g, ' ')} can tip in crosswinds above 60-80 km/h.`);
      warnings.push("Reduce speed. Both hands on wheel. Avoid bridges/open stretches.");
    }
  }
  
  // EV specific
  if (vehicleType === 'electric_vehicle') {
    if (temp < 0) {
      vehicleSpecific.push("🔋 COLD WEATHER EV:");
      vehicleSpecific.push(`• Expected range loss: 25-35% at ${temp}°C`);
      vehicleSpecific.push("• Precondition battery while plugged in before departure");
      vehicleSpecific.push("• Use seat heaters > cabin heat (more efficient)");
      vehicleSpecific.push("• Eco mode extends range. Slower charging in cold.");
    }
    if (temp > 35) {
      vehicleSpecific.push("🔋 HOT WEATHER EV:");
      vehicleSpecific.push("• AC reduces range 10-15%");
      vehicleSpecific.push("• Battery cooling system works harder");
      vehicleSpecific.push("• Park in shade. Battery degrades above 35°C long-term.");
    }
  }

  // ========================================================================
  // DRIVING TECHNIQUE
  // ========================================================================
  
  if (isRaining) {
    driving.push("🌧️ RAIN DRIVING:");
    driving.push("• Headlights ON (legal requirement in most places)");
    driving.push("• No cruise control (hydroplaning + cruise = spin)");
    driving.push("• Avoid puddles (hidden potholes, splash blindness)");
    driving.push("• After driving through water: test brakes (tap lightly)");
  }
  
  if (wind > 25) {
    driving.push("💨 WIND DRIVING:");
    driving.push("• Both hands on wheel (9 and 3 position)");
    driving.push("• Be ready for gusts near: bridges, tunnels, trucks, buildings");
    driving.push("• Passing trucks: expect air blast. Grip wheel firmly.");
  }
  
  if (effectiveTemp > 35) {
    driving.push("🔥 HOT WEATHER DRIVING:");
    driving.push("• Check tire pressure (heat increases pressure)");
    driving.push("• Engine overheating: turn off AC, turn ON heater (pulls heat from engine)");
    driving.push("• Never leave kids/pets in parked car. Death in 10-20 minutes.");
    driving.push("• Asphalt can soften in extreme heat. Truck weight restrictions possible.");
  }

  // ========================================================================
  // CYCLING SPECIFIC
  // ========================================================================
  
  if (q.includes('cycl') || q.includes('bike') || q.includes('bicycle')) {
    if (condition === 'thunderstorm' || isSnow || visibility < 0.5 || wind > 45) {
      cycling.push("🚫 DO NOT CYCLE TODAY. Conditions too dangerous.");
    } else {
      if (effectiveTemp < 0) {
        cycling.push("❄️ Freezing: dress for -10°C wind chill. Face, hands, feet protection critical.");
        cycling.push("Battery lights: cold reduces life 50%. Charge before every ride.");
      } else if (effectiveTemp > 32) {
        cycling.push("🔥 Hot: hydrate 750ml/hour. Light colors. Avoid 11am-3pm.");
      }
      
      if (wind > 25) {
        cycling.push(`💨 Wind ${wind}km/h: dangerous crosswinds. Headwind +50% effort.`);
      }
      
      if (isRaining) {
        cycling.push("🌧️ Wet: braking 3x longer. Avoid painted lines/metal covers (ice when wet).");
        cycling.push("Bright clothing + lights ESSENTIAL. Cars see you even less in rain.");
      }
      
      if (visibility < 2) {
        cycling.push("⚠️ Low visibility: cars WILL NOT see you. Multiple lights front/rear.");
      }
    }
  }

  // ========================================================================
  // MOTORCYCLE SPECIFIC
  // ========================================================================
  
  if (q.includes('motorcycle') || q.includes('motorbike')) {
    if (condition === 'thunderstorm' || isSnow || visibility < 0.5 || wind > 45) {
      motorbike.push("🚫 DO NOT RIDE TODAY. Fatal risk.");
    } else {
      if (isRaining) {
        motorbike.push("🌧️ RAIN: 70% less grip. No leaning. 3x braking distance.");
        motorbike.push("AVOID: painted lines, manhole covers, tar snakes = zero traction.");
      }
      if (wind > 25) {
        motorbike.push(`💨 WIND: Crosswinds push you across lanes. Lean into wind.`);
        motorbike.push("Passing trucks: wind blast. Be ready. Grip tank with knees.");
      }
      if (effectiveTemp < 5) {
        motorbike.push("❄️ COLD: Wind chill at 100km/h = -15°C. Heated gear or hypothermia.");
      }
    }
  }

  // ========================================================================
  // ROAD TYPE WARNINGS
  // ========================================================================
  
  if (roadConfig) {
    driving.push(`\n🛣️ ${roadType.replace(/_/g, ' ').toUpperCase()} HAZARDS:`);
    roadConfig.hazards.forEach(h => driving.push(`• ${h}`));
    roadConfig.tips.forEach(t => driving.push(`  💡 ${t}`));
  }

  // ========================================================================
  // FLOOD SAFETY
  // ========================================================================
  
  if (precipitation > 10) {
    warnings.push("🌊 FLOOD SAFETY:");
    warnings.push("• 15cm (6\") water = loss of control");
    warnings.push("• 30cm (12\") water = most cars float");
    warnings.push("• 60cm (24\") water = SUVs and trucks float");
    warnings.push("• MOVING water: 15cm can sweep car away");
    warnings.push("• TURN AROUND, DON'T DROWN. Find alternate route.");
    warnings.push("• Underpasses: death traps in floods. Avoid at all costs.");
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🚗 Road conditions:",
    "🛣️ Driving report:",
    "🚦 Commute weather:",
    "🚘 Travel safety check:",
    "🛵 Zephye's road advisory:",
    "🚲 Transportation weather:",
    "🏍️ Route conditions:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Overall Verdict
  response += `📊 VERDICT: ${verdict.join(' ')}\n\n`;
  
  // Current Conditions
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `• Pavement: ~${pavementTemp}°C\n`;
  response += `• Wind: ${wind}km/h from ${windDirection}\n`;
  response += `• Visibility: ${visibility}km (${visibilityCat})\n`;
  response += `• Precipitation: ${precipitation || 0}mm\n`;
  response += `• Humidity: ${humidity}%\n`;
  if (aqi > 50) response += `• AQI: ${aqi}\n`;
  response += '\n';
  
  // Black Ice
  if (blackIce.length > 0) {
    blackIce.forEach(b => response += `${b}\n`);
    response += '\n';
  }
  
  // Hydroplaning
  if (hydroplaning.length > 0) {
    hydroplaning.forEach(h => response += `${h}\n`);
    response += '\n';
  }
  
  // Fog
  if (fogProtocol.length > 0) {
    fogProtocol.forEach(f => response += `${f}\n`);
    response += '\n';
  }
  
  // Winter
  if (winterDriving.length > 0) {
    winterDriving.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Sun Glare
  if (sunGlare.length > 0) {
    sunGlare.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Driving Tips
  if (driving.length > 0) {
    response += `🚗 DRIVING:\n`;
    driving.forEach(d => response += `${d}\n`);
    response += '\n';
  }
  
  // Vehicle Specific
  if (vehicleSpecific.length > 0) {
    vehicleSpecific.forEach(v => response += `${v}\n`);
    response += '\n';
  }
  
  // Cycling
  if (cycling.length > 0) {
    response += `🚲 CYCLING:\n`;
    cycling.forEach(c => response += `${c}\n`);
    response += '\n';
  }
  
  // Motorcycle
  if (motorbike.length > 0) {
    response += `🏍️ MOTORCYCLE:\n`;
    motorbike.forEach(m => response += `${m}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Emergency Kit
  if (q.includes('kit') || q.includes('emergency') || q.includes('prepare') || 
      condition === 'snow' || wind > 50) {
    emergencyKit.forEach(e => response += `${e}\n`);
    response += '\n';
  }
  
  // Final
  response += `💡 BOTTOM LINE:\n`;
  if (condition === 'thunderstorm' || visibility < 0.2 || wind > 60) {
    response += `DO NOT DRIVE unless absolutely necessary. Conditions are life-threatening.\n`;
  } else if (isSnow || visibility < 1 || wind > 40) {
    response += `Only essential travel. If you must go: extreme caution, full preparation.\n`;
  } else if (isRaining || isFog) {
    response += `Drive with increased caution. Allow extra time.\n`;
  } else {
    response += `Safe driving conditions. Normal precautions apply.\n`;
  }
  
  const drivingWisdom = [
    "Better late than never. Speed kills.",
    "The road is not a racetrack. Arrive alive.",
    "Good drivers adjust to conditions. Great drivers anticipate them.",
    "It's not about the destination, it's about getting there safely.",
    "Leave earlier, drive slower, live longer.",
    "Your car can be replaced. You cannot."
  ];
  response += `\n🚗 ${random(drivingWisdom)}`;

  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { getHydroplaningRisk, getBlackIceRisk, getFogProtocol, getWinterDrivingAdvice, getSunGlareWarning, getEmergencyKit };
