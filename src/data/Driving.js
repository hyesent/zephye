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
  // GENERAL
  "Is it safe to drive today?",
  "Should I drive or take public transit?",
  "What's the best time to drive today?",
  "Should I postpone my trip?",
  "Is rush hour going to be worse than usual?",
  "Should I work from home?",
  "Will my commute take longer?",
  "Is it safe to drive at night?",
  
  // VEHICLE TYPE
  "Should I cycle to work?",
  "Is it too windy for cycling?",
  "Safe to ride my bike?",
  "Good weather for motorbike?",
  "Can I drive my RV in this wind?",
  "Is it safe to tow a trailer?",
  "Should I drive my classic car?",
  "Is it convertible weather?",
  "Will my truck handle the wind?",
  "Will my car battery die in this cold?",
  "Should I check my tire pressure?",
  "Is my car AC strong enough?",
  "Do I need winter tires today?",
  "Will my electric car range drop?",
  "Should I preheat my EV?",
  "Is regenerative braking affected?",
  "Will charging stations work in this cold?",
  "Should I charge my EV to 100 percent?",
  "Is it safe to charge an EV in rain?",
  
  // ROAD CONDITIONS
  "Are roads slippery?",
  "Will rain affect my commute?",
  "Is visibility bad for driving?",
  "Should I take the highway or back roads?",
  "Is it safe to drive through the mountains?",
  "Will there be black ice?",
  "Should I use snow chains?",
  "Is 4WD enough for today?",
  "Is the coastal highway safe today?",
  "Will fog be an issue on my commute?",
  "Will there be flooding on my route?",
  "Is that underpass safe from flooding?",
  "Should I take the high road instead?",
  "Is the bridge going to ice over?",
  "Will construction be affected by weather?",
  "Are school zones extra dangerous today?",
  "Is it safe for school buses?",
  "Will my usual shortcut be safe?",
  "Will GPS reroute me through danger?",
  "Should I download offline maps?",
  
  // WINTER
  "Will there be black ice on my route?",
  "Should I use snow chains today?",
  "Is 4WD enough for these conditions?",
  "Will roads be plowed?",
  "Are road crews out clearing snow?",
  "Should I use a different route?",
  "Is avalanche risk high today?",
  
  // EMERGENCY
  "Should I get gas before the storm?",
  "Is my windshield fluid good enough?",
  "Will my wipers freeze to the windshield?",
  "Should I cover my car tonight?",
  "Is it safe to park under trees?",
  "Will there be hail damage?",
  "Should I park in a garage?",
  "Is street parking safe?",
  "What should be in my car emergency kit?",
  "Should I tell someone my route?",
  "Should I bring blankets in the car?",
  "What if I get stranded?",
  "Is roadside assistance available?",
  "How long will help take?",
  "Should I stay with my car if stranded?",
  "Is it safe to walk for help?",
  "Can I drive through standing water?",
  "How deep is too deep to drive through?",
  
  // SAFETY SYSTEMS
  "Is it safe to use cruise control?",
  "Is engine braking safe downhill?",
  "Should I turn off traction control?",
  "Will my low-profile tires be okay?",
  "Is my spare tire good enough?",
  "Is it safe to use autopilot in these conditions?",
  "Will lane keeping work in rain?",
  "Are cameras and sensors blocked?",
  "Should I clean my sensors?",
  "Is adaptive cruise reliable in rain?",
  "Will emergency braking work?",
  "Should I disable auto high beams?",
  "Is my dash cam going to help?",
  
  // OTHER
  "Will deer be active on roads?",
  "Is it migration season?",
  "Should I worry about rockslides?",
  "Will there be dust storms?",
  "Is it haboob season?",
  "Should I pull over and wait it out?",
  "How long will the storm last?",
  "Is my phone charged enough?",
  "Do I have a car charger?",
  "Can I drive my car through water?",
  "Should I get gas now or later?",
  "Will schools be delayed or closed?",
  "Is it safe for elderly drivers?",
  "Should new drivers stay off the roads?",
  "Is it safe to drive with kids today?"
];

// ============================================================================
// ENHANCED VEHICLE TYPE DATABASE
// ============================================================================

const VEHICLE_TYPES = {
  sedan: {
    windSensitivity: 4,
    floodClearance: 15,
    iceCapability: 2,
    snowCapability: 1,
    visibilityNeed: 100,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.8, snow: 5, ice: 10 },
    traction: 'front-wheel drive preferred',
    groundClearance: 'low (12-15cm)',
    special: [
      'Low ground clearance: avoid flooded roads with water over 15cm',
      'Front-wheel drive: better in snow than rear-wheel drive',
      'All-season tires lose grip below 7°C',
      'Winter tires improve stopping distance 30-40 percent on snow and ice',
      'Check tire tread depth: minimum 3mm for wet roads, 5mm for snow'
    ]
  },
  suv: {
    windSensitivity: 7,
    floodClearance: 25,
    iceCapability: 3,
    snowCapability: 4,
    visibilityNeed: 100,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.7, snow: 4.5, ice: 9 },
    traction: '4WD or AWD available',
    groundClearance: 'medium (20-25cm)',
    special: [
      '4WD helps you go but does NOT help you stop',
      'Higher center of gravity equals rollover risk in high wind',
      'Better ground clearance for snow and unpaved roads',
      'Heavier vehicle equals longer stopping distance',
      'AWD provides better acceleration but same braking as 2WD'
    ]
  },
  truck: {
    windSensitivity: 8,
    floodClearance: 30,
    iceCapability: 2,
    snowCapability: 5,
    visibilityNeed: 150,
    stoppingDistanceMultiplier: { dry: 1, wet: 2, snow: 5, ice: 10 },
    traction: 'rear-wheel drive with weight in bed',
    groundClearance: 'high (25-35cm)',
    special: [
      'Empty bed equals no traction on rear wheels. Add weight over axle.',
      'High profile: extreme wind sensitivity. Crosswinds can push you into next lane.',
      'Towing: trailer sways in wind. Reduce speed by 30 percent.',
      'Diesel fuel gels below -15°C. Use winter blend or add anti-gel.',
      'Check mirrors constantly when towing. Trailer may not follow your path.'
    ]
  },
  motorcycle: {
    windSensitivity: 10,
    floodClearance: 5,
    iceCapability: 0,
    snowCapability: 0,
    visibilityNeed: 500,
    stoppingDistanceMultiplier: { dry: 1, wet: 2.5, snow: null, ice: null },
    traction: 'two-wheel, minimal contact patch',
    groundClearance: 'low (10-12cm)',
    special: [
      'Rain: 90 percent less traction. White lines and painted surfaces are ice when wet.',
      'Wind: crosswinds push bike across lanes. Be prepared to lean into wind.',
      'Cold: wind chill at 100km/h causes frostbite in minutes.',
      'Wet leaves and gravel are as slippery as ice.',
      'No crash protection: every accident equals hospital visit.',
      'Traction control and ABS recommended but not a substitute for caution.'
    ]
  },
  bicycle: {
    windSensitivity: 9,
    floodClearance: 5,
    iceCapability: 0,
    snowCapability: 0,
    visibilityNeed: 500,
    stoppingDistanceMultiplier: { dry: 1, wet: 3, snow: null, ice: null },
    traction: 'two-wheel, very small contact patch',
    groundClearance: 'low (10-12cm)',
    special: [
      'Rain: braking distance triples. Rim brakes have zero stopping power in wet.',
      'Potholes invisible under puddles and can throw you from bike.',
      'Door zone: stay at least 1 meter from parked cars to avoid dooring risk.',
      'No protection: cars are your biggest danger. Assume they do not see you.',
      'Disc brakes perform better in wet than rim brakes.',
      'Use lights front and rear even during day in poor visibility.'
    ]
  },
  rv_camper: {
    windSensitivity: 10,
    floodClearance: 20,
    iceCapability: 1,
    snowCapability: 2,
    visibilityNeed: 200,
    stoppingDistanceMultiplier: { dry: 1, wet: 2.5, snow: 6, ice: 12 },
    traction: 'rear-wheel drive, heavy',
    groundClearance: 'medium (20-25cm)',
    special: [
      'Wind: can tip over at 80km/h crosswind. Pull over and wait it out.',
      'Weight: 5-20 tons. Stopping distance is enormous.',
      'Sway: passing trucks create air blast. Be ready to correct steering.',
      'Height: know your clearance. Bridges, overpasses, drive-throughs all have limits.',
      'Park facing into wind if possible to reduce wind loading.',
      'Check roof seals before and after storms.'
    ]
  },
  electric_vehicle: {
    windSensitivity: 4,
    floodClearance: 15,
    iceCapability: 3,
    snowCapability: 3,
    visibilityNeed: 100,
    stoppingDistanceMultiplier: { dry: 1, wet: 1.8, snow: 4, ice: 9 },
    traction: 'AWD or RWD available',
    groundClearance: 'low to medium (12-18cm)',
    special: [
      'Cold: range drops 20-40 percent below 0°C',
      'Heat: air conditioning reduces range 10-15 percent',
      'Precondition while plugged in to warm battery and cabin without using range',
      'Regenerative braking is reduced in cold because battery cannot accept charge',
      'Charging is slower in extreme cold. Battery must warm first.',
      'Supercharging: slower in cold. Plan longer charging stops.',
      'Use seat heaters instead of cabin heat when possible (more efficient).',
      'Eco mode extends range but reduces performance.'
    ]
  }
};

// ============================================================================
// ENHANCED ROAD TYPE DATABASE
// ============================================================================

const ROAD_TYPES = {
  highway: {
    speedLimit: 100,
    hazards: [
      'Hydroplaning risk above 80km/h in standing water',
      'Crosswinds strongest on open stretches with no windbreaks',
      'Fog banks form in low areas and near water bodies',
      'Black ice: bridges and overpasses freeze first and stay frozen longer',
      'Fatigue: monotony plus weather conditions equals microsleeps'
    ],
    tips: [
      'Increase following distance to 4 seconds minimum in rain',
      'If hydroplaning: ease off gas, steer straight, DO NOT BRAKE',
      'Scan 12 seconds ahead for hazards and changing conditions',
      'Watch for wind socks and flags to gauge wind direction and speed',
      'Check weather forecast for highway passes and mountain crossings'
    ]
  },
  mountain_road: {
    speedLimit: 60,
    hazards: [
      'Black ice: shaded corners stay icy all day even when sunny',
      'Fog: visibility can drop to zero in seconds on mountain passes',
      'Rockslides: common after heavy rain or freeze-thaw cycles',
      'Avalanche: check avalanche forecasts before mountain driving',
      'Steep grades: brake fade on long descents. Use engine braking.',
      'Wildlife: deer, elk, bears are most active on roads at dawn and dusk'
    ],
    tips: [
      'Chains may be required by law. Carry them and know how to install.',
      'Use low gear downhill to save brakes and maintain control',
      'Honk on blind corners to alert wildlife and oncoming traffic',
      'If stuck: stay with your vehicle. It is easier to find than a person.',
      'Check road conditions before departing. Many passes close in storms.',
      'Turn around if conditions worsen. No destination is worth the risk.'
    ]
  },
  coastal_road: {
    speedLimit: 80,
    hazards: [
      'Storm surge: waves can wash over road during high tide and storms',
      'Coastal fog: rolls in within minutes and can reduce visibility to near zero',
      'Salt spray: reduces visibility and corrodes vehicles',
      'Sand on road: reduces traction significantly',
      'Erosion: roads can wash out during winter storms'
    ],
    tips: [
      'Check tide times before driving. High tide plus storm equals road flooding.',
      'Wash car after coastal drive to remove salt and prevent corrosion',
      'If waves are hitting the road: TURN AROUND. Do not risk it.',
      'Wind is strongest near the coast. Secure loose items on and in the car.',
      'Watch for flooded sections after storm surges'
    ]
  },
  rural_road: {
    speedLimit: 80,
    hazards: [
      'No lighting: pitch black at night with no ambient light',
      'Wildlife: deer and other animals most active at dawn and dusk',
      'Slow vehicles: tractors, horse riders, and cyclists use these roads',
      'Gravel shoulders: soft edges can cause loss of control',
      'Flooding: ditches overflow and roads wash out during heavy rain',
      'Snow: rural roads are plowed last or not at all'
    ],
    tips: [
      'Maintain full fuel tank. Gas stations are far apart.',
      'Carry emergency kit: blankets, food, water, flashlight.',
      'Tell someone your route and estimated time of arrival.',
      'Cell service may be spotty. Download offline maps.',
      'If lost: stay on main roads. Do not follow GPS down farm tracks.',
      'Watch for livestock on roads, especially at dawn and dusk'
    ]
  },
  urban: {
    speedLimit: 50,
    hazards: [
      'Flooding: underpasses and low areas fill first during heavy rain',
      'Hydroplaning: oil rises to surface in first 30 minutes of rain',
      'Pedestrians: huddled under umbrellas cannot see traffic',
      'Cyclists: harder to see in rain and fog',
      'Fallen trees and branches: common after wind storms',
      'Downed power lines: do not drive over or near them'
    ],
    tips: [
      'Public transport may be safer in extreme weather',
      'Underground parking may flood. Avoid in heavy rain.',
      'Tree-lined streets have falling branches in wind. Park away from trees.',
      'Traffic lights may be out. Treat as 4-way stop.',
      'Manhole covers can pop off in flooding. Invisible hazard.',
      'Potholes fill with water and are invisible - dangerous for tires.'
    ]
  }
};

// ============================================================================
// WEATHER CONDITION CALCULATORS
// ============================================================================

/**
 * Enhanced hydroplaning risk calculator with speed and tire data
 */
function getHydroplaningRisk(data, speed = 80, tireTread = 4) {
  const { precipitation, condition, temp } = data;
  const advice = [];
  const warnings = [];
  
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  
  if (!isRaining && precipitation < 1) {
    return { advice: ['No hydroplaning risk - dry conditions'], warnings: [], riskLevel: 'none' };
  }
  
  // Calculate hydroplaning speed based on tire tread and pressure
  const tirePressure = 32; // PSI (typical)
  const hydroplaningSpeed = 10.35 * Math.sqrt(tirePressure) * (tireTread / 4);
  const actualHydroplaningSpeed = Math.round(hydroplaningSpeed);
  
  advice.push("HYDROPLANING RISK ANALYSIS:");
  advice.push(`  Precipitation: ${precipitation}mm`);
  advice.push(`  Estimated hydroplaning speed: ${actualHydroplaningSpeed}km/h with current tire tread`);
  advice.push(`  Current speed: ${speed}km/h`);
  advice.push("");
  
  let riskLevel = 'low';
  
  if (precipitation > 20) {
    riskLevel = 'extreme';
    warnings.push("EXTREME HYDROPLANING RISK: Standing water on roads");
    advice.push("  • Reduce speed to 40-50 km/h maximum");
    advice.push("  • Avoid outer lanes where water pools");
    advice.push("  • Follow tire tracks of vehicle ahead");
    advice.push("  • Consider delaying travel until rain subsides");
  } else if (precipitation > 10) {
    riskLevel = 'high';
    warnings.push("HIGH HYDROPLANING RISK: Widespread water on roads");
    advice.push("  • Reduce speed 25-30 percent below posted limit");
    advice.push("  • No cruise control - need full control");
    advice.push("  • If steering feels light: ease off gas, grip wheel firmly");
    advice.push("  • Avoid sudden steering inputs or braking");
  } else if (precipitation > 5) {
    riskLevel = 'moderate';
    advice.push("  • Moderate risk: reduce speed in areas with standing water");
    advice.push("  • Watch for water pooling in depressions and wheel ruts");
    advice.push("  • Worn tires greatly increase risk even in light rain");
  } else if (precipitation > 1) {
    riskLevel = 'low';
    advice.push("  • Light rain: slight risk, mostly on worn tires");
    advice.push("  • First 30 minutes of rain is most dangerous (oil rises)");
  }
  
  // Tire wear warning
  if (tireTread < 3) {
    warnings.push("WORN TIRES: Tread depth less than 3mm significantly increases hydroplaning risk");
    advice.push("  • Hydroplaning speed with worn tires: ~50-60km/h");
    advice.push("  • Consider replacing tires before wet season");
  }
  
  if (temp < 5 && precipitation > 0) {
    warnings.push("COLD + WET: Risk of black ice in addition to hydroplaning");
    advice.push("  • Bridges and overpasses freeze before road surface");
  }
  
  advice.push("");
  advice.push("IF YOU HYDROPLANE:");
  advice.push("  1. DO NOT BRAKE - causes spin");
  advice.push("  2. DO NOT TURN sharply");
  advice.push("  3. Ease off accelerator slowly");
  advice.push("  4. Steer straight until tires regain contact");
  advice.push("  5. When you feel grip return, gently brake to reduce speed");
  
  return { advice, warnings, riskLevel, hydroplaningSpeed: actualHydroplaningSpeed };
}

/**
 * Enhanced black ice predictor with location-specific warnings
 */
function getBlackIceRisk(data, route = 'urban') {
  const { temp, tempMin, condition, humidity, dewPoint, timeOfDay, precipitation } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'none';
  
  const isRaining = ['rain', 'drizzle'].includes(condition);
  const isSnow = condition === 'snow';
  const isFreezing = temp <= 2;
  const isBelowFreezing = temp <= 0;
  const isClearSky = condition === 'clear' || condition === 'partly-cloudy';
  const isHumid = humidity > 70;
  const isMorning = timeOfDay === 'morning' || timeOfDay === 'dawn';
  
  // Black ice forms when:
  // 1. Road surface below freezing
  // 2. Moisture present (rain, snow melt, high humidity)
  // 3. Rapid cooling (clear sky at night)
  
  const blackIceRisk = isBelowFreezing && (isRaining || isSnow || isHumid || isClearSky);
  const potentialBlackIce = temp <= 3 && (isRaining || isHumid) && tempMin <= 0;
  
  if (blackIceRisk) {
    riskLevel = 'high';
    warnings.push("HIGH BLACK ICE RISK");
    advice.push("BLACK ICE DANGER:");
    advice.push("  Black ice is thin, transparent ice that looks like wet road");
    advice.push("  It is INVISIBLE. You cannot see it until you are spinning.");
    advice.push("");
    advice.push(`  Current conditions: ${temp}°C dropping to ${tempMin}°C tonight`);
    
    if (isClearSky) {
      advice.push("  Clear sky = rapid cooling = black ice formation");
    }
    if (isMorning) {
      advice.push("  Morning hours: most dangerous as ice hasn't melted yet");
    }
    if (isRaining) {
      advice.push("  Rain on cold roads: freezing rain, extremely dangerous");
    }
    
    advice.push("");
    advice.push("MOST DANGEROUS LOCATIONS FOR BLACK ICE:");
    advice.push("  • Bridges and overpasses (cold air above AND below)");
    advice.push("  • Shaded areas where sun hasn't reached");
    advice.push("  • Tunnel entrances and exits (temperature change)");
    advice.push("  • Hill crests and valley bottoms (cold air sinks)");
    advice.push("  • Intersections (exhaust condensation freezes)");
    advice.push("  • Tree-lined roads (shade keeps ice from melting)");
    
  } else if (potentialBlackIce) {
    riskLevel = 'moderate';
    warnings.push("MODERATE BLACK ICE RISK");
    advice.push("  Temperature near freezing. Watch for icy patches.");
    advice.push("  Most dangerous: bridges, overpasses, shaded areas.");
    advice.push("  Morning hours: highest risk as roads cool overnight.");
  } else if (isFreezing && !isRaining) {
    riskLevel = 'low';
    advice.push("  Cold but dry. Low black ice risk.");
    advice.push("  Still watch for: wet patches from melting snow or sprinkler runoff.");
  }
  
  if (riskLevel !== 'none') {
    advice.push("");
    advice.push("IF YOU HIT BLACK ICE:");
    advice.push("  1. DO NOT BRAKE");
    advice.push("  2. DO NOT ACCELERATE");
    advice.push("  3. Steer STRAIGHT or gently in the direction you want to go");
    advice.push("  4. Wait for tires to find grip");
    advice.push("  5. If skidding: steer INTO the skid (look where you want to go)");
  }
  
  return { advice, warnings, riskLevel };
}

/**
 * Enhanced fog driving protocol with visibility calculations
 */
function getFogProtocol(data) {
  const { visibility, temp, condition } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'none';
  
  if (condition === 'fog' || visibility < 2) {
    if (visibility < 0.2) {
      riskLevel = 'extreme';
      warnings.push("EXTREME FOG: Visibility under 200 meters. Do not drive.");
      advice.push("  • This is life-threatening. Pile-up risk is extreme.");
      advice.push("  • If you cannot pull over safely: extreme caution, 10-20 km/h");
    } else if (visibility < 0.5) {
      riskLevel = 'high';
      warnings.push("HIGH FOG: Visibility under 500 meters. Extreme danger.");
      advice.push("FOG DRIVING PROTOCOL:");
      advice.push("  • Speed: 25-40 km/h maximum");
      advice.push("  • Lights: LOW BEAM plus FOG LIGHTS if equipped");
      advice.push("  • NO HIGH BEAMS (reflects off fog, blinds you)");
      advice.push("  • NO CRUISE CONTROL (need full control)");
      advice.push("  • Open windows slightly to hear traffic you cannot see");
      advice.push("  • Follow road edge line, not center line");
      advice.push("  • NO passing. NO lane changes unless absolutely necessary.");
      advice.push("  • If you cannot see: pull WELL off road, turn lights OFF");
    } else if (visibility < 1) {
      riskLevel = 'moderate';
      warnings.push("MODERATE FOG: Visibility 500-1000 meters. Caution required.");
      advice.push("  • Reduce speed to 50 km/h or less");
      advice.push("  • Low beams plus fog lights. No high beams.");
      advice.push("  • Increase following distance to 6 seconds minimum");
      advice.push("  • Watch for vehicles without lights (many won't turn them on)");
    } else if (visibility < 2) {
      riskLevel = 'low';
      advice.push("  Light fog. Reduce speed and use low beams.");
      advice.push("  • Fog can thicken quickly. Be ready to adjust.");
    }
    
    if (temp < 0 && visibility < 1) {
      warnings.push("FREEZING FOG: Ice fog creates black ice on roads.");
      advice.push("  • Extremely dangerous combination. Consider delaying travel.");
    }
  }
  
  return { advice, warnings, riskLevel };
}

/**
 * Enhanced winter driving advice with snow accumulation and technique
 */
function getWinterDrivingAdvice(data) {
  const { temp, precipitation, condition, wind, windGust, tempMin } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'none';
  
  const isSnow = condition === 'snow' || condition === 'sleet';
  const isFreezingRain = condition === 'freezing_rain';
  const isSnowing = isSnow || isFreezingRain;
  const isCold = temp <= 0;
  const snowAccumulation = precipitation > 0 ? precipitation * 0.1 : 0; // rough estimate cm
  
  if (!isSnowing && !isCold) {
    return { advice: ['No winter driving concerns'], warnings: [], riskLevel: 'none' };
  }
  
  if (isFreezingRain) {
    riskLevel = 'extreme';
    warnings.push("EXTREME DANGER: Freezing rain. Do not drive.");
    advice.push("  • Roads are coated in ice. Stopping is impossible.");
    advice.push("  • Power lines and trees may fall. Stay home.");
    return { advice, warnings, riskLevel };
  }
  
  if (isSnowing) {
    if (precipitation > 20) {
      riskLevel = 'extreme';
      warnings.push("HEAVY SNOW: Impassable roads likely. Do not drive.");
      advice.push(`  • Snow accumulation: ${Math.round(snowAccumulation)}cm expected`);
      advice.push("  • Only drive if absolutely necessary");
      advice.push("  • Carry: chains, shovel, kitty litter or sand for traction, blankets");
      advice.push("  • If stranded: stay with vehicle. Run engine 10 min/hour for heat.");
      advice.push("  • Clear exhaust pipe of snow before running engine (carbon monoxide risk)");
    } else if (precipitation > 10) {
      riskLevel = 'high';
      warnings.push("MODERATE SNOW: Hazardous conditions.");
      advice.push(`  • Snow accumulation: ${Math.round(snowAccumulation)}cm expected`);
      advice.push("  • Speed: 50 percent of posted limit or less");
      advice.push("  • Following distance: 8-10 seconds minimum");
      advice.push("  • Brake gently and early. Test brakes occasionally to check grip.");
      advice.push("  • Clear snow from entire vehicle: roof, hood, trunk, lights");
    } else if (precipitation > 2) {
      riskLevel = 'moderate';
      advice.push("  • Light snow falling. Roads may become slippery.");
      advice.push("  • Watch for first snow of season: roads are most dangerous");
      advice.push("  • Bridges and overpasses freeze first");
    }
    
    advice.push("");
    advice.push("WINTER DRIVING TECHNIQUE:");
    advice.push("  • Accelerate and decelerate SLOWLY - no sudden inputs");
    advice.push("  • Uphill: get momentum BEFORE the hill. Maintain steady speed up.");
    advice.push("  • Downhill: use LOW GEAR. Let engine brake. Do not ride brakes.");
    advice.push("  • If stuck: straighten wheels, gentle gas. Rock back and forth if needed.");
    advice.push("  • Kitty litter, sand, or floor mats under drive wheels for traction");
    
    advice.push("");
    advice.push("VEHICLE PREPARATION:");
    advice.push("  • Full tank of gas for weight and to prevent fuel line freeze");
    advice.push("  • Winter tires: compound stays soft below 7°C");
    advice.push("  • All-season tires harden below 7°C: 30 percent less grip");
    advice.push("  • Tire pressure drops 1 PSI per 5°C drop. Check pressure.");
    advice.push("  • Windshield fluid: winter formula rated to -30°C or lower");
    advice.push("  • Battery: cold reduces capacity 50 percent. Test before winter.");
    advice.push("  • Wiper blades: replace if streaking. Winter blades have rubber covers.");
  }
  
  // Wind chill
  if (wind > 25 && temp < 5) {
    const windChill = calcWindChill(temp, wind);
    advice.push("");
    advice.push(`WIND + COLD: Wind chill ${Math.round(windChill)}°C.`);
    advice.push("  • Blowing snow reduces visibility to near zero");
    advice.push("  • Whiteout conditions possible. Pull over if you cannot see.");
    advice.push("  • Drifting snow fills road cuts and underpasses - may be impassable.");
  }
  
  // Cold start advice
  if (isCold) {
    advice.push("");
    advice.push("COLD START ADVICE:");
    advice.push("  • Let engine idle 1-2 minutes before driving (modern cars need less)");
    advice.push("  • Gently drive first few minutes to warm transmission and brakes");
    advice.push("  • Avoid full throttle until engine reaches operating temperature");
    advice.push("  • Check that all windows are fully defrosted before driving");
    advice.push("  • Carry a portable jump starter - cold kills batteries");
  }
  
  return { advice, warnings, riskLevel };
}

/**
 * Enhanced sun glare warning with direction and time calculation
 */
function getSunGlareWarning(data, drivingDirection = 'east') {
  const { sunPosition, timeOfDay, condition, temp } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'none';
  
  const isClear = condition === 'clear' || condition === 'partly-cloudy';
  
  if (!isClear) return { advice: ['No sun glare concern - cloudy or overcast'], warnings: [], riskLevel: 'none' };
  
  const isSunGlare = sunPosition === 'sunrise' || sunPosition === 'sunset' || 
                     (timeOfDay === 'morning' && sunPosition === 'rising') ||
                     (timeOfDay === 'evening' && sunPosition === 'setting');
  
  if (isSunGlare) {
    riskLevel = 'moderate';
    const time = sunPosition === 'sunrise' || sunPosition === 'rising' ? 'sunrise' : 'sunset';
    const direction = time === 'sunrise' ? 'east' : 'west';
    
    warnings.push(`SUN GLARE: ${time} sun directly in eyes for ${direction}-bound traffic`);
    advice.push(`  • ${time === 'sunrise' ? 'Sunrise' : 'Sunset'} glare: sun directly at eye level`);
    advice.push(`  • ${drivingDirection === direction ? 'YOU ARE DRIVING INTO THE SUN' : 'Sun is behind you - less issue'}`);
    advice.push("  • Visibility can drop to ZERO for seconds at a time");
    advice.push("");
    advice.push("PROTECTION:");
    advice.push("  • Polarized sunglasses (cut glare significantly)");
    advice.push("  • Clean windshield inside AND out - haze magnifies glare");
    advice.push("  • Use sun visor. Adjust seat height if needed.");
    advice.push("  • Increase following distance (you cannot see brake lights in glare)");
    advice.push("  • If blinded: slow down gradually. Do not slam brakes.");
    advice.push("  • Consider alternate route (north-south roads have less glare)");
    advice.push("  • Pull over and wait if glare is unbearable");
  }
  
  // Snow reflection (winter)
  if (isClear && temp < 0 && condition !== 'cloudy') {
    const hasSnow = true; // rough estimate
    if (hasSnow) {
      advice.push("");
      advice.push("SNOW REFLECTION: Snow doubles UV exposure and glare");
      advice.push("  • Wear sunglasses even on cloudy days");
      advice.push("  • Sunburn risk: snow reflects 80-90 percent of UV");
      advice.push("  • Snow blindness: dark, UV-blocking goggles or glasses recommended");
    }
  }
  
  return { advice, warnings, riskLevel };
}

/**
 * Comprehensive emergency kit with condition-specific additions
 */
function getEmergencyKit(data, vehicleType = 'sedan') {
  const { temp, condition, season, precipitation, wind } = data;
  const kit = [];
  
  kit.push("EMERGENCY CAR KIT:");
  kit.push("");
  kit.push("BASIC ESSENTIALS (always in vehicle):");
  kit.push("  • First aid kit with bandages, antiseptic, pain relievers");
  kit.push("  • Flashlight with extra batteries (or hand-crank)");  
  kit.push("  • Phone charger: cigarette lighter plus portable power bank");
  kit.push("  • Basic tools: screwdriver, pliers, adjustable wrench");
  kit.push("  • Jumper cables or portable jump starter");
  kit.push("  • Spare tire in good condition (check pressure monthly)");
  kit.push("  • Jack and lug wrench (know how to use them)");
  kit.push("  • Tire pressure gauge");
  kit.push("  • Reflective triangles or flares (3 minimum)");
  kit.push("  • Duct tape and zip ties (temporary repairs)");
  kit.push("  • Multi-tool or knife");
  kit.push("  • Paper maps (phone may die or have no service)");
  kit.push("  • Fire extinguisher (ABC rated)");
  
  // Winter additions
  const isWinter = season === 'winter' || temp < 5;
  const isSnow = condition === 'snow' || precipitation > 0 && temp < 0;
  
  if (isWinter || isSnow) {
    kit.push("");
    kit.push("WINTER ADDITIONS (required when below 5°C):");
    kit.push("  • Warm blankets or sleeping bag (one per occupant)");
    kit.push("  • Extra warm clothes: hat, gloves, thick socks, winter coat");
    kit.push("  • Chemical hand warmers (last 8-10 hours)");
    kit.push("  • Ice scraper and snow brush");
    kit.push("  • Small shovel (folding or compact)");
    kit.push("  • Bag of sand, kitty litter, or traction mats");
    kit.push("  • High-energy, non-perishable food (nuts, granola bars, chocolate)");
    kit.push("  • Water in insulated container to prevent freezing");
    kit.push("  • Matches or lighter in waterproof container");
    kit.push("  • Candles (can heat car interior if stranded)");
    kit.push("  • Bright cloth or flag (tie to antenna or mirror for visibility)");
    kit.push("  • Reflectorized vest");
    if (isSnow) {
      kit.push("  • Tire chains or cables (know how to install)");
    }
  }
  
  // Summer additions
  const isSummer = season === 'summer' || temp > 30;
  if (isSummer) {
    kit.push("");
    kit.push("SUMMER ADDITIONS (when above 30°C):");
    kit.push("  • Extra water: 4 litres per person minimum");
    kit.push("  • Sunscreen SPF 30+");
    kit.push("  • Wide-brim hat");
    kit.push("  • Electrolyte packets or sports drinks");
    kit.push("  • Cooling towels (wet and snap to activate)");
    kit.push("  • Umbrella for shade if stranded");
    kit.push("  • Emergency reflective blanket (also shades)");
  }
  
  // Vehicle-specific
  if (vehicleType === 'electric_vehicle') {
    kit.push("");
    kit.push("EV-SPECIFIC ITEMS:");
    kit.push("  • Charging cable for Level 2 (public chargers may be down)");
    kit.push("  • Adapter for different charging standards");
    kit.push("  • List of charging stations along route (offline)");
    kit.push("  • 12V battery jump starter (main battery may be fine, but 12V can die)");
  }
  
  if (vehicleType === 'motorcycle' || vehicleType === 'bicycle') {
    kit.push("");
    kit.push("TWO-WHEELER SPECIFIC ITEMS:");
    kit.push("  • Tire repair kit (plugs and CO2 inflator)");
    kit.push("  • Small pump or mini compressor");
    kit.push("  • Rain gear (waterproof pants and jacket)");
    kit.push("  • Extra layers (wind chill is real)");
    kit.push("  • Waterproof phone case");
  }
  
  // Storm-specific
  if (wind > 40 || condition === 'thunderstorm') {
    kit.push("");
    kit.push("STORM ADDITIONS:");
    kit.push("  • Battery-powered radio for weather updates");
    kit.push("  • Extra water and food (72 hours minimum)");
    kit.push("  • Cash (ATMs may be down)");
    kit.push("  • Important documents in waterproof bag");
  }
  
  kit.push("");
  kit.push("PRE-TRIP CHECKLIST:");
  kit.push("  • Charge phone to 100 percent");
  kit.push("  • Tell someone your route and ETA");
  kit.push("  • Check weather forecast along entire route");
  kit.push("  • Check road conditions and closures");
  kit.push("  • Full tank of fuel or EV battery charged");
  kit.push("  • Tire pressure and tread depth");
  kit.push("  • All lights working");
  kit.push("  • Windshield washer fluid full (winter formula)");
  
  return kit;
}

/**
 * Electric vehicle specific advice with range calculations
 */
function getEVAdvice(data, vehicleModel = 'standard') {
  const { temp, condition, wind, precipitation } = data;
  const advice = [];
  const warnings = [];
  const isCold = temp < 0;
  const isHot = temp > 35;
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  
  advice.push("ELECTRIC VEHICLE WEATHER ASSESSMENT:");
  
  // Range impact
  let rangeLoss = 0;
  if (isCold) {
    rangeLoss = temp < -10 ? 40 : temp < -5 ? 35 : temp < 0 ? 30 : 25;
    warnings.push(`COLD WEATHER: Estimated range loss ${rangeLoss} percent`);
    advice.push(`  • Battery chemistry slows in cold - reduced efficiency`);
    advice.push("  • Use seat heaters instead of cabin heat when possible");
    advice.push("  • Precondition battery while plugged in before departure");
    advice.push("  • Park in garage if available to keep battery warmer");
  }
  
  if (isHot) {
    rangeLoss = 15;
    warnings.push(`HOT WEATHER: Estimated range loss ${rangeLoss} percent`);
    advice.push("  • Air conditioning is the main range drain in hot weather");
    advice.push("  • Use recirculation mode to reduce AC load");
    advice.push("  • Park in shade to keep cabin and battery cooler");
    advice.push("  • Battery cooling system works harder in heat");
  }
  
  if (isRaining) {
    rangeLoss += 5;
    advice.push("  • Rain increases rolling resistance - slight range impact");
    advice.push("  • Wet roads increase energy consumption");
  }
  
  if (wind > 30) {
    const headwindRange = wind > 50 ? 'significant' : 'moderate';
    advice.push(`  • Headwind: ${headwindRange} range reduction. Tailwind helps range.`);
    advice.push("  • Crosswinds: minor range impact but affects stability");
  }
  
  // Charging advice
  if (isCold) {
    advice.push("");
    advice.push("CHARGING IN COLD WEATHER:");
    advice.push("  • Charging speed is reduced when battery is cold");
    advice.push("  • Supercharging may start slow while battery warms");
    advice.push("  • Plan for longer charging stops (add 20-30 percent time)");
    advice.push("  • Navigate to charger so battery preconditions");
    advice.push("  • Don't let battery drop below 20 percent in severe cold");
  }
  
  if (isHot) {
    advice.push("");
    advice.push("CHARGING IN HOT WEATHER:");
    advice.push("  • Battery cooling system works during charging");
    advice.push("  • Charging in direct sun = slower charging (battery cooling limits)");
    advice.push("  • Find shaded charging stations when possible");
  }
  
  // Efficiency tips
  advice.push("");
  advice.push("EFFICIENCY TIPS:");
  advice.push("  • Eco mode extends range but reduces performance");
  advice.push("  • Regenerative braking recovers energy - use one-pedal driving");
  advice.push("  • Smooth acceleration and deceleration maximizes range");
  advice.push("  • Keep speed moderate: efficiency drops above 100 km/h");
  advice.push("  • Ensure tires are properly inflated (cold reduces pressure)");
  advice.push("  • Remove roof racks and cargo boxes when not needed");
  
  // Recommended charge level
  const recommendCharge = isCold ? '90-100 percent' : isHot ? '80-90 percent' : '80 percent';
  advice.push("");
  advice.push(`RECOMMENDED CHARGE LEVEL: ${recommendCharge}`);
  if (isCold) {
    advice.push("  • Higher charge provides buffer for reduced range");
  }
  if (isHot) {
    advice.push("  • Avoid 100 percent charge in extreme heat (battery degradation)");
  }
  
  return { advice, warnings, rangeLoss };
}

/**
 * Calculate safe following distance based on conditions
 */
function getFollowingDistance(data, speed = 80) {
  const { condition, temp, precipitation } = data;
  const isRaining = ['rain', 'drizzle'].includes(condition);
  const isSnow = condition === 'snow';
  const isIcy = temp <= 0 && (isRaining || isSnow || precipitation > 0);
  
  let multiplier = 1;
  let reason = 'Dry conditions - normal following distance';
  
  if (isIcy) {
    multiplier = 10;
    reason = 'Icy roads - stopping distance multiplied by 10';
  } else if (isSnow) {
    multiplier = 5;
    reason = 'Snow conditions - stopping distance multiplied by 5';
  } else if (isRaining && precipitation > 10) {
    multiplier = 3;
    reason = 'Heavy rain - stopping distance multiplied by 3';
  } else if (isRaining) {
    multiplier = 2;
    reason = 'Wet roads - stopping distance doubled';
  }
  
  const normalDistance = speed * 0.28; // meters (2 second rule)
  const safeDistance = Math.round(normalDistance * multiplier);
  const seconds = Math.round(safeDistance / (speed * 0.28));
  
  return {
    multiplier,
    reason,
    normalDistance: Math.round(normalDistance),
    safeDistance,
    seconds,
    advice: `Follow at ${seconds} seconds minimum (${safeDistance}m at ${speed}km/h)`
  };
}

// ============================================================================
// MAIN DRIVING ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getDrivingAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, wind, windDir, condition, conditionCode, 
    visibility, uvIndex, aqi, city, dewPoint, tempMin, tempMax,
    precipitation, pressure, sunrise, sunset
  } = data;
  
  const q = question.toLowerCase();
  
  // Calculate derived values
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
  const pressureTrend = getPressureTrend(pressure);
  
  // Detect vehicle type
  let vehicleType = 'sedan';
  if (q.includes('suv') || q.includes('4wd') || q.includes('jeep') || q.includes('4x4')) vehicleType = 'suv';
  if (q.includes('truck') || q.includes('pickup') || q.includes('ute') || q.includes('pick-up')) vehicleType = 'truck';
  if (q.includes('motorcycle') || q.includes('motorbike') || q.includes('bike') && !q.includes('bicy')) vehicleType = 'motorcycle';
  if (q.includes('bicycle') || q.includes('cycl') || q.includes('push bike')) vehicleType = 'bicycle';
  if (q.includes('rv') || q.includes('camper') || q.includes('motorhome') || q.includes('caravan')) vehicleType = 'rv_camper';
  if (q.includes('electric') || q.includes('ev') || q.includes('tesla') || q.includes('hybrid')) vehicleType = 'electric_vehicle';
  
  // Detect road type
  let roadType = 'urban';
  if (q.includes('highway') || q.includes('freeway') || q.includes('motorway') || q.includes('interstate')) roadType = 'highway';
  if (q.includes('mountain') || q.includes('pass') || q.includes('hill') || q.includes('switchback')) roadType = 'mountain_road';
  if (q.includes('coast') || q.includes('beach') || q.includes('ocean') || q.includes('bay')) roadType = 'coastal_road';
  if (q.includes('rural') || q.includes('country') || q.includes('back road') || q.includes('farm')) roadType = 'rural_road';
  
  const vehicleConfig = VEHICLE_TYPES[vehicleType];
  const roadConfig = ROAD_TYPES[roadType];
  
  // Get all condition analyses
  const hydroplaning = getHydroplaningRisk(data, 80, 4);
  const blackIce = getBlackIceRisk(data, roadType);
  const fogProtocol = getFogProtocol(data);
  const winterDriving = getWinterDrivingAdvice(data);
  const sunGlare = getSunGlareWarning(data, 'east');
  const emergencyKit = getEmergencyKit(data, vehicleType);
  const evAdvice = vehicleType === 'electric_vehicle' ? getEVAdvice(data) : null;
  const followingDistance = getFollowingDistance(data, 80);

  // ========================================================================
  // BUILD RESPONSE SECTIONS
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "ROAD CONDITIONS REPORT",
    "DRIVING WEATHER ASSESSMENT", 
    "TRANSPORTATION SAFETY ANALYSIS",
    "VEHICLE WEATHER ADVISORY",
    "COMMUTE CONDITIONS EVALUATION"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Overnight low: ${tempMin}°C | Daytime high: ${tempMax}°C\n`;
  response += `  Pavement: ${pavementTemp}°C\n`;
  response += `  Wind: ${wind} km/h from ${windDirection} (gusts to ${windGust || wind + 10} km/h)\n`;
  response += `  Visibility: ${visibility} km (${visibilityCat})\n`;
  response += `  Precipitation: ${precipitation || 0} mm\n`;
  response += `  Humidity: ${humidity}% | Dew Point: ${dewPoint?.toFixed(1) || 'N/A'}°C\n`;
  response += `  Pressure: ${pressure} hPa (${pressureTrend})\n`;
  if (aqi > 50) response += `  Air Quality Index: ${aqi} (${getAQICategory(aqi)})\n`;
  response += `  UV Index: ${uvIndex} (${getUVLevel(uvIndex)})\n`;
  response += `  Season: ${season} | Time: ${timeOfDay || 'Unknown'}\n`;
  response += `  Sunrise: ${sunrise || 'N/A'} | Sunset: ${sunset || 'N/A'}\n`;
  response += `\n`;
  
  // Overall verdict
  const isExtreme = condition === 'thunderstorm' || wind > 60 || visibility < 0.2 || 
                    (isSnow && precipitation > 15) || condition === 'blizzard';
  const isHazardous = isSnow || visibility < 1 || wind > 40 || (isRaining && precipitation > 15);
  
  response += `=== OVERALL VERDICT ===\n`;
  if (isExtreme) {
    response += `DO NOT DRIVE. Conditions are life-threatening.\n`;
    response += `Seek shelter. Wait for conditions to improve.\n`;
  } else if (isHazardous) {
    response += `ONLY ESSENTIAL TRAVEL. Conditions are hazardous.\n`;
    response += `If you must drive: extreme caution, full preparation, allow extra time.\n`;
  } else if (isRaining || isFog || wind > 25) {
    response += `CAUTION REQUIRED. Drive with increased awareness.\n`;
    response += `Allow extra time for your journey. Conditions require adjustment.\n`;
  } else {
    response += `SAFE DRIVING CONDITIONS. Normal precautions apply.\n`;
  }
  response += `\n`;
  
  // Vehicle type specific
  response += `=== VEHICLE ASSESSMENT ===\n`;
  response += `  Vehicle: ${vehicleType.replace(/_/g, ' ').toUpperCase()}\n`;
  response += `  Wind sensitivity: ${vehicleConfig.windSensitivity}/10\n`;
  response += `  Flood clearance: ${vehicleConfig.floodClearance}cm\n`;
  response += `  Ground clearance: ${vehicleConfig.groundClearance}\n`;
  response += `  Traction: ${vehicleConfig.traction}\n`;
  response += `  Stopping distance multiplier: ${vehicleConfig.stoppingDistanceMultiplier.dry} (dry) / ${vehicleConfig.stoppingDistanceMultiplier.wet} (wet)\n`;
  response += `\n`;
  
  if (vehicleConfig.special) {
    response += `VEHICLE SPECIFIC NOTES:\n`;
    vehicleConfig.special.forEach(s => response += `  • ${s}\n`);
    response += `\n`;
  }
  
  // Road type
  response += `=== ROAD TYPE: ${roadType.replace(/_/g, ' ').toUpperCase()} ===\n`;
  response += `  Speed limit: ${roadConfig.speedLimit} km/h\n`;
  response += `  Hazards:\n`;
  roadConfig.hazards.forEach(h => response += `    - ${h}\n`);
  response += `  Tips:\n`;
  roadConfig.tips.forEach(t => response += `    - ${t}\n`);
  response += `\n`;
  
  // Black ice
  if (blackIce.advice.length > 0) {
    response += `=== BLACK ICE RISK ===\n`;
    response += `  Risk level: ${blackIce.riskLevel.toUpperCase()}\n`;
    blackIce.advice.forEach(a => response += `${a}\n`);
    blackIce.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Hydroplaning
  if (hydroplaning.advice.length > 0) {
    response += `=== HYDROPLANING RISK ===\n`;
    response += `  Risk level: ${hydroplaning.riskLevel.toUpperCase()}\n`;
    hydroplaning.advice.forEach(a => response += `${a}\n`);
    hydroplaning.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Fog
  if (fogProtocol.advice.length > 0) {
    response += `=== FOG CONDITIONS ===\n`;
    response += `  Risk level: ${fogProtocol.riskLevel.toUpperCase()}\n`;
    fogProtocol.advice.forEach(a => response += `${a}\n`);
    fogProtocol.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Winter driving
  if (winterDriving.advice.length > 0) {
    response += `=== WINTER DRIVING ===\n`;
    response += `  Risk level: ${winterDriving.riskLevel.toUpperCase()}\n`;
    winterDriving.advice.forEach(a => response += `${a}\n`);
    winterDriving.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Sun glare
  if (sunGlare.advice.length > 0) {
    response += `=== SUN GLARE ===\n`;
    response += `  Risk level: ${sunGlare.riskLevel.toUpperCase()}\n`;
    sunGlare.advice.forEach(a => response += `${a}\n`);
    sunGlare.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // EV specific
  if (evAdvice) {
    response += `=== ELECTRIC VEHICLE ===\n`;
    evAdvice.advice.forEach(a => response += `${a}\n`);
    evAdvice.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Following distance
  response += `=== FOLLOWING DISTANCE ===\n`;
  response += `  ${followingDistance.advice}\n`;
  response += `  Reason: ${followingDistance.reason}\n`;
  response += `\n`;
  
  // Emergency kit (if asked or conditions warrant)
  if (q.includes('kit') || q.includes('emergency') || q.includes('prepare') || 
      isSnow || wind > 40 || isExtreme) {
    response += `=== EMERGENCY KIT ===\n`;
    emergencyKit.forEach(item => response += `${item}\n`);
    response += `\n`;
  }
  
  // Driving tips
  response += `=== DRIVING TIPS ===\n`;
  
  if (isRaining) {
    response += `  RAIN DRIVING:\n`;
    response += `    • Headlights ON (legal requirement in most jurisdictions)\n`;
    response += `    • No cruise control in wet conditions\n`;
    response += `    • Avoid puddles (hidden potholes and splash blindness)\n`;
    response += `    • After driving through water: test brakes by tapping lightly\n`;
    response += `    • First 30 minutes of rain is most dangerous (oil rises)\n`;
  }
  
  if (wind > 25) {
    response += `  WIND DRIVING:\n`;
    response += `    • Both hands on wheel (9 and 3 position)\n`;
    response += `    • Be ready for gusts near bridges, tunnels, and passing trucks\n`;
    response += `    • Passing trucks: expect air blast. Grip wheel firmly.\n`;
    response += `    • High-profile vehicles: reduce speed significantly\n`;
  }
  
  if (effectiveTemp > 35) {
    response += `  HOT WEATHER DRIVING:\n`;
    response += `    • Check tire pressure (heat increases pressure)\n`;
    response += `    • Engine overheating: turn off AC, turn ON heater to pull heat\n`;
    response += `    • Never leave kids or pets in parked car. Death in 10-20 minutes.\n`;
    response += `    • Asphalt softens in extreme heat - truck weight restrictions possible\n`;
    response += `    • Coolant level: check before long trips\n`;
  }
  
  if (isSnow || isFog || visibility < 1) {
    response += `  LOW VISIBILITY DRIVING:\n`;
    response += `    • Reduce speed to what you can see. If you can see 50m, drive 50km/h max.\n`;
    response += `    • Use fog lights, not high beams\n`;
    response += `    • If visibility drops to zero: pull WELL off road, turn lights OFF\n`;
  }
  
  response += `\n`;
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (isExtreme) {
    response += `  STAY HOME. Conditions are dangerous for all vehicles.\n`;
    response += `  No destination is worth your life or the lives of others.\n`;
  } else if (isHazardous) {
    response += `  ONLY DRIVE IF ABSOLUTELY NECESSARY.\n`;
    response += `  Full preparation required: emergency kit, winter tires, chains.\n`;
    response += `  Allow 2-3 times normal travel time. Check road closures first.\n`;
  } else if (isRaining || isFog) {
    response += `  Drive with caution. Allow extra time for your commute.\n`;
    response += `  Check for delays and alternative routes before departing.\n`;
  } else {
    response += `  Safe conditions for all vehicle types. Normal driving rules apply.\n`;
    response += `  Always drive according to conditions, not just posted limits.\n`;
  }
  
  // Final wisdom
  const wisdom = [
    "Better late than never. Speed kills.",
    "The road is not a racetrack. Arrive alive.",
    "Good drivers adjust to conditions. Great drivers anticipate them.",
    "It is not about the destination, it is about getting there safely.",
    "Leave earlier, drive slower, live longer.",
    "Your car can be replaced. You cannot.",
    "The most dangerous part of your journey is the first and last 5 minutes.",
    "Every 10 km/h over the limit doubles your stopping distance.",
    "When in doubt, slow down. You can always speed up if conditions allow."
  ];
  response += `\n--- WISDOM ---\n${random(wisdom)}`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getHydroplaningRisk, 
  getBlackIceRisk, 
  getFogProtocol, 
  getWinterDrivingAdvice, 
  getSunGlareWarning, 
  getEmergencyKit,
  getEVAdvice,
  getFollowingDistance
};

export default getDrivingAdvice;
