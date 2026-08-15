import {
  getPaintDryingTime,
  getConcreteCuringTemp,
  getComfortScore,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getDayLength,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  getPavementTemp,
  getPressureTrend,
  calcHeatIndex,
  calcWindChill
} from './calculations';

// ============================================================================
// COMPREHENSIVE DIY & CONSTRUCTION WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  // PAINTING & FINISHING
  "Can I paint outside today?",
  "Is it good weather for exterior painting?",
  "Should I use oil-based or latex paint today?",
  "Will paint dry between coats?",
  "How long between paint coats?",
  "Can I paint the ceiling today?",
  "Should I paint the deck?",
  "Can I paint furniture outside?",
  "Is it good for spray painting?",
  "Should I brush or roll paint?",
  "Should I prime before painting?",
  "Can I apply deck sealer today?",
  "Is it good for polyurethane?",
  "Should I stain my deck?",
  "Can I apply wood stain?",
  "Should I use water-based or oil-based stain?",
  "Can I varnish today?",
  "Is it good for chalk painting?",
  "Can I apply epoxy floor coating?",
  "Is it good for asphalt driveway sealing?",
  
  // CONCRETE & MASONRY
  "Can I pour concrete today?",
  "Is it good weather for concrete work?",
  "Will concrete set in these conditions?",
  "Should I add accelerator to concrete?",
  "Do I need concrete retarder?",
  "Should I cover fresh concrete?",
  "How long until concrete can be walked on?",
  "When can I drive on new concrete?",
  "Should I wet-cure concrete?",
  "Is it good for stamped concrete?",
  "Can I pour concrete countertops?",
  "Should I stain concrete today?",
  "Can I seal concrete?",
  "Is it good for masonry work?",
  "Should I lay bricks today?",
  "Can I mortar stone veneer?",
  "Is it good for tuckpointing?",
  "Should I install ceramic tile?",
  "Can I grout today?",
  "Should I build a retaining wall?",
  "Is it good for paver installation?",
  
  // WOODWORKING & CARPENTRY
  "Is it too humid for woodworking?",
  "Should I acclimate wood flooring?",
  "Can I install hardwood flooring today?",
  "Can I install laminate today?",
  "Is it good for vinyl plank installation?",
  "Should I stretch carpet today?",
  "Can I install insulation?",
  "Is it good for spray foam?",
  "Can I install doors and windows?",
  "Should I build a deck?",
  "Can I build a fence?",
  "Should I build a shed?",
  "Is it good for pergola construction?",
  "Can I install cabinets?",
  "Should I hang drywall?",
  "Can I tape and mud drywall?",
  "Will drywall mud dry today?",
  "Should I sand drywall outside?",
  
  // ROOFING & EXTERIOR
  "Good day for roofing work?",
  "Should I install gutters?",
  "Can I do roof repair?",
  "Is it safe to be on the roof?",
  "Should I install solar panels?",
  "Can I clean solar panels?",
  "Is it good for chimney sweeping?",
  "Can I do siding repair?",
  "Is it good for stucco work?",
  "Should I caulk exterior?",
  "Can I apply weatherproofing?",
  "Should I power wash the house?",
  "Can I clean the gutters safely?",
  
  // EXCAVATION & LANDSCAPING
  "Can I dig a trench?",
  "Is it safe to dig near utilities?",
  "Should I compact soil?",
  "Is soil moisture good for compaction?",
  "Can I grade the yard?",
  "Should I lay sod?",
  "Can I plant trees today?",
  "Is it good for landscaping?",
  "Should I install sprinklers?",
  "Can I build a patio?",
  "Is it good for foundation work?",
  "Should I waterproof basement?",
  "Can I install French drain?",
  
  // PLUMBING & ELECTRICAL
  "Can I do plumbing work outside?",
  "Should I solder copper pipes?",
  "Can I glue PVC today?",
  "Is it good for ABS cement?",
  "Should I insulate pipes?",
  "Can I install HVAC outside?",
  "Should I clean AC condenser?",
  "Can I recharge AC?",
  "Is it good for heat pump installation?",
  "Can I run electrical outside?",
  "Should I use a generator?",
  "Is it safe to run extension cords?",
  
  // SAFETY
  "Is it safe to use a ladder?",
  "Can I use power tools outside?",
  "Is it safe to be on scaffolding?",
  "Can I use a chainsaw today?",
  "Should I wear a respirator?",
  "Is it safe to weld outside?",
  
  // GENERAL
  "What construction work can I do today?",
  "Should I rent heavy equipment?",
  "Can I work in my workshop today?",
  "Is it good for outdoor projects?",
  "What's the best time to work today?"
];

// ============================================================================
// ENHANCED MATERIAL DATABASE WITH MORE DETAILS
// ============================================================================

const MATERIALS = {
  paint_latex: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [15, 27],
    minHumidity: 30,
    maxHumidity: 70,
    idealHumidity: [40, 60],
    dryTime: '1-2 hours to touch, 4 hours to recoat, 30 days full cure',
    windLimit: 25,
    rainFree: 4,
    minSurfaceTemp: 10,
    maxSurfaceTemp: 40,
    surfaceTempDelta: 15, // surfaces are hotter than air in sun
    special: [
      'Surface temp matters more than air temp. Check with IR thermometer.',
      'Below 10°C: poor film formation, cracking, peeling',
      'Above 32°C: dries too fast, lap marks, poor adhesion',
      'High humidity: slow dry, surfactant leaching (brown streaks)',
      'Direct sun on dark surfaces: can be 20°C hotter than air',
      'Dew point: if surface temp drops to dew point, condensation ruins finish'
    ],
    bestTime: ['morning_after_dew', 'late_afternoon'],
    worstTime: ['midday_sun', 'just_before_rain']
  },
  paint_oil: {
    minTemp: 5,
    maxTemp: 32,
    idealTemp: [10, 27],
    minHumidity: 20,
    maxHumidity: 85,
    idealHumidity: [30, 60],
    dryTime: '6-8 hours to touch, 24 hours to recoat, 7 days full cure',
    windLimit: 20,
    rainFree: 8,
    minSurfaceTemp: 5,
    maxSurfaceTemp: 40,
    surfaceTempDelta: 12,
    special: [
      'More forgiving in cold than latex',
      'Strong fumes: ventilation essential. Respirator recommended.',
      'Longer dry time but better leveling',
      'Yellowing: accelerates in low light (behind furniture, in closets)',
      'Cleanup requires mineral spirits or paint thinner'
    ],
    bestTime: ['morning', 'evening'],
    worstTime: ['high_humidity', 'low_light']
  },
  stain_deck: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [15, 27],
    minHumidity: 30,
    maxHumidity: 70,
    idealHumidity: [40, 60],
    dryTime: '2-4 hours to touch, 24 hours before rain',
    rainFree: 24,
    minWoodMoisture: 8,
    maxWoodMoisture: 15,
    special: [
      'Wood moisture content must be <15% (check with meter)',
      'Don\'t apply in direct sun (dries too fast, won\'t penetrate)',
      'New pressure-treated wood: wait 3-6 months before staining',
      'Clean and brighten wood first for best adhesion',
      'Two thin coats > one thick coat',
      'Temperature of wood: should be 15-25°C for penetration'
    ],
    bestTime: ['overcast', 'morning_shade'],
    worstTime: ['direct_sun', 'rain_expected']
  },
  concrete: {
    minTemp: 5,
    maxTemp: 32,
    idealTemp: [10, 27],
    minHumidity: 20,
    maxHumidity: 90,
    idealHumidity: [40, 80],
    setTime: 'Initial: 4-8 hours. Walk on: 24 hours. Drive on: 7 days. Full strength: 28 days.',
    rainFree: 8,
    windLimit: 30,
    minGroundTemp: 5,
    special: [
      'Below 5°C: hydration stops. Concrete NEVER gains strength.',
      'Above 32°C: flash set, plastic shrinkage cracks, weak',
      'Ideal: 15-21°C for maximum long-term strength',
      'Wind >15 km/h: use evaporation retarder or windbreaks',
      'Cold weather: use heated mix water, accelerators, insulating blankets',
      'Hot weather: use ice water, retarders, shade, wet cure',
      'Test: slump test, air content, temperature for every truck',
      'NEVER pour on frozen ground (will settle and crack when thaws)',
      'Concrete temp should be 10-25°C at placement',
      'Add 1% calcium chloride accelerates set by 50% (but corrodes rebar)',
      'Use Type III cement for cold weather (high early strength)',
      'Use Type II cement for hot weather (lower heat of hydration)'
    ],
    additives: {
      accelerator: { minTemp: 5, maxTemp: 15, amount: '1-2% by weight of cement' },
      retarder: { minTemp: 25, maxTemp: 38, amount: '0.5-1.5% by weight of cement' },
      waterReducer: { minTemp: 15, maxTemp: 35, amount: '0.5-2% by weight of cement' }
    },
    bestTime: ['early_morning', 'evening'],
    worstTime: ['midday_heat', 'freezing_night']
  },
  mortar: {
    minTemp: 5,
    maxTemp: 38,
    idealTemp: [15, 27],
    minHumidity: 20,
    maxHumidity: 80,
    idealHumidity: [40, 70],
    setTime: 'Initial set: 1-2 hours. Full cure: 28 days.',
    rainFree: 24,
    special: [
      'Below 5°C: hydration stops. Protect with heated enclosures.',
      'Above 38°C: flash set. No time to work.',
      'Hot weather: keep bricks wet (they suck water from mortar)',
      'Cold weather: use heated water, cover with insulating blankets',
      'Efflorescence: more likely in wet conditions (white powder on bricks)',
      'Mortar should be workable for 2-3 hours maximum'
    ],
    bestTime: ['morning', 'overcast'],
    worstTime: ['midday_heat', 'freezing']
  },
  wood_glue: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [18, 27],
    minHumidity: 25,
    maxHumidity: 65,
    idealHumidity: [35, 55],
    clampTime: 'PVA: 30 min to 1 hour. Full cure: 24 hours.',
    special: [
      'Below 10°C: PVA glue chalks (white residue, weak bond)',
      'Above 32°C: open time too short. Can\'t assemble before skin forms.',
      'High humidity: wood swells, glue absorbs moisture, weak bond',
      'Cold glue joint: FAILS. Warm both wood and glue to 18°C+',
      'Polyurethane glue (Gorilla): needs moisture to cure (spray water)',
      'Hide glue: needs warm environment, not for outdoor'
    ],
    bestTime: ['heated_shop', 'moderate_temp'],
    worstTime: ['cold', 'very_dry']
  },
  pvc_cement: {
    minTemp: 5,
    maxTemp: 38,
    idealTemp: [15, 32],
    minHumidity: 0,
    maxHumidity: 90,
    idealHumidity: [10, 80],
    setTime: '15 min to handle, 2 hours for pressure test',
    special: [
      'Below 5°C: solvent won\'t evaporate. Joint fails.',
      'Above 38°C: solvent flashes off before you can assemble',
      'High humidity: can cause blushing (white residue, weakened joint)',
      'Primer required in most plumbing codes (purple primer)',
      'Use medium body cement for 2" pipes, heavy body for >4"',
      'Check manufacturer temp rating - some cement works to -18°C'
    ],
    bestTime: ['moderate_temp', 'low_wind'],
    worstTime: ['extreme_temp', 'high_humidity']
  },
  epoxy: {
    minTemp: 10,
    maxTemp: 30,
    idealTemp: [20, 27],
    minHumidity: 0,
    maxHumidity: 60,
    idealHumidity: [30, 50],
    cureTime: '24 hours to walk, 72 hours full cure',
    special: [
      'Below 10°C: won\'t cure. Stays sticky forever.',
      'Above 30°C: exotherms. Can smoke, bubble, or yellow.',
      'High humidity: amine blush (waxy surface, adhesion failure)',
      'Must mix EXACTLY. Ratio matters. No eyeballing.',
      'Temperature of epoxy AND surface both matter.',
      'Heat gun or torch can remove bubbles, but DONT overheat',
      'Different epoxies: coating, laminating, casting, structural'
    ],
    bestTime: ['moderate_temp', 'low_humidity'],
    worstTime: ['cold', 'humid']
  },
  drywall_compound: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [18, 27],
    minHumidity: 20,
    maxHumidity: 70,
    idealHumidity: [30, 55],
    dryTime: 'Light coat: 24 hours. Heavy fill: 48+ hours.',
    special: [
      'High humidity: drying time triples. Use setting-type compound (hot mud).',
      'Cold: drying time doubles. Use heater + fan.',
      'Hot mud (setting type): sets by chemical reaction, not drying',
      'Hot mud works in cold/humid conditions (5, 20, 45, 90, 210 minute)',
      'Lightweight compounds: dry faster but shrink more',
      'All-purpose: best for taping and topping',
      'Topping: best for final coats (smoother, easier to sand)'
    ],
    bestTime: ['heated_space', 'low_humidity'],
    worstTime: ['high_humidity', 'cold']
  },
  caulk_sealant: {
    minTemp: 5,
    maxTemp: 40,
    idealTemp: [15, 32],
    minHumidity: 0,
    maxHumidity: 80,
    idealHumidity: [20, 70],
    skinTime: '30 min to 2 hours depending on type',
    special: [
      'Silicone: works in wider temp range but needs dry surface',
      'Latex caulk: paintable but not for wet areas',
      'Cold: caulk stiff, hard to gun. Warm tube in pocket first.',
      'Wet surface: NO caulk sticks to wet surface',
      'Polyurethane: strong, flexible, paintable, best for exterior',
      'Butyl: messy, but stays flexible forever, best for windows',
      'Acrylic: cheap, paintable, not for exterior'
    ],
    bestTime: ['moderate_temp', 'dry_surface'],
    worstTime: ['wet', 'cold']
  },
  asphalt_sealer: {
    minTemp: 15,
    maxTemp: 35,
    idealTemp: [21, 30],
    minHumidity: 20,
    maxHumidity: 70,
    idealHumidity: [30, 60],
    dryTime: '4-8 hours to touch, 24 hours before rain, 48 hours before vehicles',
    rainFree: 24,
    special: [
      'Surface must be completely dry',
      'Below 15°C: won\'t cure properly. Stays tacky.',
      'Above 35°C: dries too fast, won\'t bond',
      'Apply in shade if possible (hot pavement = flash dry)',
      'New asphalt: wait 6-12 months before sealing',
      'Two coats: better than one thick coat',
      'Temperature of pavement: should be 15-30°C'
    ],
    bestTime: ['morning', 'overcast'],
    worstTime: ['midday_sun', 'cold']
  },
  tile_thinset: {
    minTemp: 10,
    maxTemp: 35,
    idealTemp: [15, 29],
    minHumidity: 20,
    maxHumidity: 75,
    idealHumidity: [30, 60],
    dryTime: '24 hours grout, 48 hours foot traffic, 72 hours heavy',
    special: [
      'Polymer modified: don\'t use above 35°C (flash cure)', 
      'Below 10°C: cure stops. Use unmodified with additive.',
      'Subfloor must be stable (no movement = no cracked tile)',
      'Porcelain: needs modified thinset (non-modified won\'t bond)',
      'Large tile (>12"): use medium bed mortar (thinset will sag)'
    ],
    bestTime: ['moderate_temp', 'low_wind'],
    worstTime: ['extreme_temp', 'high_humidity']
  },
  grout: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [15, 27],
    minHumidity: 20,
    maxHumidity: 80,
    idealHumidity: [30, 70],
    dryTime: '24 hours before walking, 7 days full cure',
    special: [
      'Epoxy grout: more expensive but stain proof, no sealing needed',
      'Cement grout: needs sealing, color consistent',
      'High humidity: slows cure, can cause color variation',
      'Cold: slows cure, use accelerators',
      'Sanded: for joints >1/8". Unsanded: for joints <1/8"'
    ],
    bestTime: ['moderate_temp', 'moderate_humidity'],
    worstTime: ['extreme_conditions']
  }
};

// ============================================================================
// ENHANCED SAFETY THRESHOLDS
// ============================================================================

const SAFETY = {
  ladder: {
    maxWind: 25,
    maxGust: 35,
    maxTemp: 38,
    minTemp: -5,
    wetSurface: 'NEVER on wet rungs. Slip = life-changing fall.',
    icySurface: 'ABSOLUTELY NOT. Frost/ice + ladder = hospital.',
    heat: 'Above 32°C: reduce time on ladder. Heat exhaustion = fall.',
    cold: 'Below 0°C: cold hands lose grip. Metal ladder = frostbite risk.',
    maxWeight: 225, // kg
    angleRule: '4:1 ratio (1 foot out for every 4 feet up)',
    extension: 'Must extend 3 feet above landing surface'
  },
  roof: {
    maxWind: 30,
    maxGust: 40,
    maxTemp: 35,
    minTemp: -5,
    wetSurface: 'NEVER on wet roof. Fall = death or paralysis.',
    icySurface: 'DO NOT EVEN THINK ABOUT IT.',
    heat: 'Roof surface 20°C+ hotter than air. Burns through shoes.',
    special: 'Harness + anchor point. No exceptions above 3m height.',
    pitch: 'Roof slope > 6/12: always use roof jacks and boards',
    warning: '1 in 5 construction deaths are from falls'
  },
  powerTools: {
    rain: 'ELECTROCUTION RISK. GFCI mandatory even in damp conditions.',
    wetGround: 'Stand on dry board. GFCI. Inspect cords for damage.',
    wind: 'Dust/debris in eyes. Full seal goggles. Respirator if sanding.',
    cold: 'Power cords stiffen, crack. Batteries die 40% faster.',
    heat: 'Tools overheat. Duty cycle: 15 min on, 15 min off.',
    maxTemp: 40,
    minTemp: -10,
    hearing: '85dB+ hearing protection mandatory',
    dust: 'OSHA silica rule: use dust extraction or respirator',
    cordInspection: 'Check for cracks, fraying, missing ground prong'
  },
  excavation: {
    callBefore: 'CALL 811 (or local utility locating service) BEFORE DIGGING',
    wetSoil: 'Trench collapse risk. Shoring or sloping required.',
    frozenSoil: 'Impossible to dig. Wait for thaw or use ground thawing equipment.',
    rain: 'Trenches flood. Walls collapse. No one in trench during/following rain.',
    maxDepth: 'Over 1.2m (4ft): shoring, sloping, or trench box required',
    soilTypes: 'A (stable), B (medium), C (sandy/soft) - each needs different shoring',
    gasLine: '5ft clearance from gas lines - hand dig only'
  },
  scaffolding: {
    maxWind: 30,
    maxGust: 40,
    maxTemp: 38,
    minTemp: -5,
    ice: 'NO scaffolding on ice',
    rain: 'Wet planks = slippery. Use anti-slip boards.',
    overload: 'Do not exceed manufacturer load rating (usually 50kg/sqf)',
    guardrail: 'Top rail 42", mid rail 21" minimum',
    inspection: 'Daily inspection required before use'
  },
  respiratory: {
    dust: 'N95 for dust. P100 for lead/wood dust. Cartridge for fumes.',
    paint: 'Organic vapor cartridge for paint/fumes (change frequently)',
    silica: 'HEPA-rated respirator for concrete/stone cutting',
    wood: 'N95 or P100 for wood dust (sawdust is carcinogenic)',
    mold: 'P100 or N100 respirator for mold remediation'
  }
};

// ============================================================================
// ENHANCED MATERIAL CONDITION CHECKERS
// ============================================================================

/**
 * Comprehensive painting condition analysis
 */
function getPaintingConditions(data) {
  const { temp, humidity, wind, uvIndex, condition, dewPoint, sunPosition, timeOfDay, precipitation } = data;
  const advice = [];
  const warnings = [];
  const tips = [];
  let rating = { overall: 'good', score: 0, maxScore: 100 };
  
  // Surface temperature calculation
  const isSunny = condition === 'clear' || condition === 'partly-cloudy';
  const isDirectSun = isSunny && sunPosition !== 'night' && timeOfDay !== 'evening' && timeOfDay !== 'morning';
  const surfaceTemp = isDirectSun ? temp + 20 : temp + 5;
  const tempDelta = surfaceTemp - temp;
  
  advice.push("PAINTING CONDITIONS ANALYSIS:");
  advice.push(`  Air temp: ${temp}°C | Surface temp: ~${surfaceTemp}°C (${tempDelta}°C warmer)`);
  advice.push(`  Humidity: ${humidity}% | Dew point: ${dewPoint?.toFixed(1) || 'N/A'}°C`);
  advice.push(`  Wind: ${wind} km/h | UV Index: ${uvIndex}`);
  advice.push("");
  
  // Temperature analysis
  let tempScore = 100;
  if (surfaceTemp < 0) {
    advice.push("  CRITICAL: Surface BELOW FREEZING. No paint will work.");
    warnings.push("Paint freezes before drying. Complete failure.");
    tempScore = 0;
  } else if (surfaceTemp < 5) {
    advice.push("  NOT RECOMMENDED: Surface below 5°C.");
    advice.push("  • Oil-based paints MIGHT work (minimum 5°C)");
    advice.push("  • Latex: minimum 10°C surface temperature");
    advice.push("  • Check if temperature will stay above minimum overnight");
    tempScore = 20;
  } else if (surfaceTemp < 10) {
    advice.push("  COLD: Only certain paints work.");
    advice.push("  • Oil-based: works down to 5°C");
    advice.push("  • Latex: use cold-weather formula if available");
    advice.push("  • Dry time: extended significantly");
    tempScore = 50;
  } else if (surfaceTemp > 50) {
    advice.push("  CRITICAL: Surface ABOVE 50°C. Paint dries instantly.");
    warnings.push("Paint forms skin immediately. No adhesion. Cracking guaranteed.");
    tempScore = 0;
  } else if (surfaceTemp > 45) {
    advice.push("  DANGEROUS: Surface above 45°C.");
    advice.push("  • Flash drying - brush marks, lap marks, no leveling");
    advice.push("  • Paint in shade or early morning only");
    advice.push("  • Consider using a primer with longer open time");
    tempScore = 20;
  } else if (surfaceTemp > 40) {
    advice.push("  HOT: Surface above 40°C.");
    advice.push("  • Work very fast. Maintain wet edge.");
    advice.push("  • Use a roller extension to reach without rushing");
    advice.push("  • Thin coats - multiple thin > one thick");
    tempScore = 50;
  } else if (surfaceTemp > 35) {
    advice.push("  WARM: Paint dries fast.");
    advice.push("  • Add Floetrol or similar to extend open time");
    advice.push("  • Work in manageable sections");
    advice.push("  • Keep tools in cool water when not in use");
    tempScore = 70;
  } else if (surfaceTemp >= 15 && surfaceTemp <= 27) {
    advice.push("  IDEAL temperature range. Optimal conditions.");
    tempScore = 100;
  } else {
    advice.push("  Good temperature. Should work fine.");
    tempScore = 85;
  }
  
  // Humidity analysis
  let humidityScore = 100;
  if (humidity > 85) {
    advice.push("  HIGH HUMIDITY: Drying time significantly extended.");
    advice.push("  • Latex paint may not cure for days");
    advice.push("  • Risk of surfactant leaching (brown sticky streaks)");
    advice.push("  • Dehumidifier for interior work");
    warnings.push("If humidity >85%, consider waiting for drier conditions");
    humidityScore = 30;
  } else if (humidity > 75) {
    advice.push("  ELEVATED HUMIDITY: Slow drying.");
    advice.push("  • Allow extra drying time between coats");
    advice.push("  • Use fans to circulate air");
    advice.push("  • Water-based paints more affected than oil");
    humidityScore = 60;
  } else if (humidity > 65) {
    advice.push("  MODERATE HUMIDITY: Acceptable but monitor drying.");
    advice.push("  • Allow full dry time before recoating");
    advice.push("  • Check for condensation on metal surfaces");
    humidityScore = 80;
  } else if (humidity > 40 && humidity <= 65) {
    advice.push("  IDEAL humidity range for painting.");
    humidityScore = 100;
  } else if (humidity > 25) {
    advice.push("  LOW HUMIDITY: Paint dries quickly.");
    advice.push("  • Maintain wet edge - work fast");
    advice.push("  • Good for spray applications");
    humidityScore = 80;
  } else {
    advice.push("  VERY DRY: Fast drying, risk of lap marks.");
    advice.push("  • Add extender for brushing");
    advice.push("  • Use a sprayer if available (better atomization)");
    humidityScore = 60;
  }
  
  // Dew point analysis
  if (dewPoint) {
    const dewPointDelta = temp - dewPoint;
    if (dewPointDelta < 3) {
      warnings.push("CRITICAL: Dew point within 3°C of air temperature.");
      warnings.push("  • Condensation will form on surfaces as temperature drops");
      warnings.push("  • Do NOT paint late in the day");
      warnings.push("  • Surface temp must stay above dew point");
    } else if (dewPointDelta < 5) {
      advice.push("  CAUTION: Dew point moderately close.");
      advice.push("  • Finish painting before 2PM");
      advice.push("  • Nighttime condensation likely");
    }
  }
  
  // Wind analysis
  let windScore = 100;
  if (wind > 40) {
    advice.push("  EXTREME WIND: Do NOT paint or stain outdoors.");
    warnings.push("Wind >40 km/h: overspray, debris, drying too fast");
    windScore = 0;
  } else if (wind > 30) {
    advice.push("  HIGH WIND: Spray painting impossible.");
    advice.push("  • Brush or roll only");
    advice.push("  • Use windbreaks (tarps, boards)");
    advice.push("  • Debris will stick to wet paint");
    windScore = 40;
  } else if (wind > 20) {
    advice.push("  MODERATE WIND: Brush/roll fine. Spray challenging.");
    advice.push("  • Overspray will go far - protect nearby surfaces");
    advice.push("  • Use a thicker nap roller to hold more paint");
    windScore = 70;
  } else if (wind > 10) {
    advice.push("  LIGHT WIND: Good for drying, helps paint level.");
    windScore = 90;
  } else {
    advice.push("  CALM: Ideal for painting. No wind issues.");
    windScore = 100;
  }
  
  // UV/sun analysis
  if (uvIndex > 8 && isDirectSun) {
    warnings.push("EXTREME UV: Paint degrades in direct sunlight.");
    warnings.push("  • UV breaks down paint binders");
    warnings.push("  • Dark colors absorb heat - surface much hotter");
    advice.push("  • Use UV-resistant primer and paint");
    advice.push("  • Paint shaded side first, follow sun");
  }
  
  // Rain analysis
  if (condition === 'rain' || condition === 'thunderstorm') {
    advice.push("  RAIN: Do NOT paint. Surfaces wet. Paint washes off.");
    warnings.push("Wet paint + rain = ruined finish. Wait until dry.");
  } else if (precipitation > 0) {
    warnings.push("PRECIPITATION: Rain in forecast. Check rain-free window.");
    tips.push("Need at least 4-8 hours of dry time before rain.");
  }
  
  // Calculate overall rating
  const overallScore = (tempScore + humidityScore + windScore) / 3;
  let overall = '';
  if (overallScore >= 90) {
    overall = 'EXCELLENT - Perfect painting conditions';
  } else if (overallScore >= 70) {
    overall = 'GOOD - Painting possible with minor considerations';
  } else if (overallScore >= 50) {
    overall = 'FAIR - Painting possible but compromised';
  } else if (overallScore >= 30) {
    overall = 'POOR - Significant risk of failure';
  } else {
    overall = 'AVOID - Paint will likely fail';
  }
  
  // Final verdict
  const isGoodTime = tempScore > 60 && humidityScore > 50 && windScore > 50 && !warnings.includes('rain');
  const bestTime = isGoodTime ? 'today' : (tempScore > 50 ? 'with precautions' : 'postpone');
  
  return {
    summary: `OVERALL: ${overall} (${Math.round(overallScore)}/100)`,
    details: advice,
    warnings: warnings,
    tips: tips,
    rating: { score: overallScore, label: overall },
    canPaint: overallScore >= 50,
    bestTime: bestTime,
    surfaceTemp: surfaceTemp,
    tempScore: tempScore,
    humidityScore: humidityScore,
    windScore: windScore
  };
}

/**
 * Comprehensive concrete condition analysis
 */
function getConcreteConditions(data) {
  const { temp, humidity, wind, condition, tempMin, tempMax, precipitation, dewPoint } = data;
  const advice = [];
  const warnings = [];
  const tips = [];
  const special = [];
  
  advice.push("CONCRETE PLACEMENT ANALYSIS:");
  advice.push(`  Temp: ${temp}°C (Range: ${tempMin}-${tempMax}°C)`);
  advice.push(`  Humidity: ${humidity}% | Wind: ${wind} km/h`);
  advice.push(`  Precipitation: ${precipitation}mm`);
  advice.push("");
  
  // Temperature analysis
  if (temp < 0) {
    advice.push("  CRITICAL: FREEZING. DO NOT POUR.");
    warnings.push("Concrete freezes = 50%+ permanent strength loss.");
    warnings.push("Ground frozen = settlement when thaws.");
    warnings.push("Wait for temps >5°C (rising, not falling).");
  } else if (temp < 2) {
    advice.push("  DANGEROUS: Below 2°C. Concrete won't cure.");
    advice.push("  • Need heated enclosures and blankets");
    advice.push("  • Use Type III cement, accelerators, heated water");
    advice.push("  • Monitor concrete temperature constantly");
    warnings.push("Risk of freeze damage within 24 hours.");
  } else if (temp < 5) {
    advice.push("  COLD WEATHER CONCRETING:");
    advice.push("  • Use 2-3% calcium chloride accelerator by weight");
    advice.push("  • Heat mix water (but not above 70°C)");
    advice.push("  • Cover with insulating blankets for 7 days");
    advice.push("  • Air entrainment: 6-8% for freeze-thaw protection");
    tips.push("Pour at warmest part of day (2-4 PM)");
  } else if (temp < 10) {
    advice.push("  COOL CONCRETING:");
    advice.push("  • Accelerator recommended (1-2%)");
    advice.push("  • Use 20-25°C mix water");
    advice.push("  • Protect from wind/evaporation");
    tips.push("Expect slower set: 8-12 hours initial set");
  } else if (temp >= 15 && temp <= 25) {
    advice.push("  IDEAL CONCRETE TEMPERATURE.");
    advice.push("  • Maximum long-term strength");
    advice.push("  • Standard mix, no additives needed");
    advice.push("  • Best workability and finish");
  } else if (temp > 32) {
    advice.push("  HOT WEATHER CONCRETING:");
    advice.push("  • Use retarders (0.5-1.5% by weight)");
    advice.push("  • Use ice or chilled water in mix");
    advice.push("  • Shade forms and aggregates");
    advice.push("  • Start wet curing within 2 hours");
    warnings.push("Plastic shrinkage cracks likely. Use evaporation retarder.");
  } else if (temp > 38) {
    advice.push("  DANGEROUS HEAT:");
    advice.push("  • Flash set possible. Have help ready.");
    advice.push("  • Use maximum retarder dosage");
    advice.push("  • Pour at night or early morning only");
    warnings.push("Temperature above 38°C: concrete strength reduced 20%+");
  }
  
  // Humidity analysis
  if (humidity < 30 && temp > 20) {
    advice.push("  LOW HUMIDITY + WARM: HIGH EVAPORATION RISK.");
    advice.push("  • Apply evaporation retarder IMMEDIATELY");
    advice.push("  • Use windbreaks if wind > 15 km/h");
    advice.push("  • Start curing as soon as surface can be walked on");
    warnings.push("Plastic shrinkage cracks can form in 1-2 hours.");
  } else if (humidity > 80) {
    advice.push("  HIGH HUMIDITY: Good for curing.");
    advice.push("  • But watch for rain forecast");
    advice.push("  • Check that slab slopes properly for drainage");
    tips.push("Rain on fresh concrete = ruined surface. Have plastic ready.");
  }
  
  // Wind analysis
  if (wind > 25) {
    advice.push("  HIGH WIND: Rapid surface drying.");
    advice.push("  • Use windbreaks or fog misters");
    advice.push("  • Apply curing compound immediately");
    advice.push("  • Check for surface crusting");
    warnings.push("Wind + low humidity = cracks within 1 hour.");
  }
  
  // Rain analysis
  if (condition === 'rain' || condition === 'thunderstorm') {
    warnings.push("RAIN: Postpone pour if possible.");
    warnings.push("Rain ruins fresh concrete surface.");
    warnings.push("If must pour: tent the area, have plastic sheeting ready.");
  } else if (precipitation > 0 && precipitation < 5) {
    tips.push("Light rain possible. Have plastic sheeting ready.");
  }
  
  // Curing recommendations
  advice.push("");
  advice.push("CURING RECOMMENDATIONS:");
  if (temp < 10) {
    advice.push("  • Insulated blankets: 7 days minimum");
    advice.push("  • Maintain concrete temp >5°C");
    advice.push("  • No wet curing in cold weather");
  } else if (temp > 25) {
    advice.push("  • Wet curing or curing compound required");
    advice.push("  • Start within 4 hours of finishing");
    advice.push("  • Keep moist for 7 days minimum");
    advice.push("  • Cover with plastic and wet burlap");
  } else {
    advice.push("  • Standard curing: keep moist for 7 days");
    advice.push("  • Curing compound or wet burlap with plastic");
    advice.push("  • Protect from traffic for 7-14 days");
  }
  
  // Timeline
  advice.push("");
  advice.push("TIMELINE:");
  advice.push("  • Initial set: 4-8 hours (temperature dependent)");
  advice.push("  • Walk on: 24-48 hours");
  advice.push("  • Light traffic (no cars): 3 days");
  advice.push("  • Vehicles: 7 days minimum (14 days recommended)");
  advice.push("  • Full strength: 28 days");
  
  // Overall
  const canPour = temp >= 5 && temp <= 32 && condition !== 'rain' && condition !== 'thunderstorm';
  return {
    summary: canPour ? "CAN POUR - With recommended precautions" : "AVOID POURING - Conditions unsuitable",
    details: advice,
    warnings: warnings,
    tips: tips,
    canPour: canPour,
    needsAccelerator: temp < 10,
    needsRetarder: temp > 28,
    needsEvapRetarder: humidity < 30 && wind > 15,
    requiresInsulation: temp < 5 || tempMin < 2,
    walkOnTime: temp > 25 ? '12-16 hours' : temp > 15 ? '24 hours' : '36-48 hours'
  };
}

/**
 * Comprehensive woodworking condition analysis
 */
function getWoodworkingConditions(data) {
  const { temp, humidity, condition, precipitation } = data;
  const advice = [];
  const warnings = [];
  const tips = [];
  
  // Equilibrium moisture content
  const emc = getEquilibriumMoistureContent(temp, humidity);
  
  advice.push("WOODWORKING CONDITIONS:");
  advice.push(`  Temperature: ${temp}°C`);
  advice.push(`  Humidity: ${humidity}%`);
  advice.push(`  Estimated EMC: ${emc}%`);
  advice.push("");
  
  // Humidity effects
  if (humidity > 80) {
    advice.push("  HIGH HUMIDITY: Wood is swollen (expansion).");
    advice.push("  • Don't cut to final dimensions (will shrink when dry)");
    advice.push("  • Doors/windows may stick now, will fit later");
    advice.push("  • Glue joints: weak if wood moisture >12%");
    advice.push("  • Use moisture meter before gluing");
    warnings.push("Furniture built in high humidity will crack when indoor humidity drops.");
  } else if (humidity > 70) {
    advice.push("  ELEVATED HUMIDITY: Wood moving.");
    advice.push("  • Joints may be tight now, loose later");
    advice.push("  • Allow extra glue drying time");
    advice.push("  • Panel glue-up: use cauls to keep flat");
    tips.push("Run dehumidifier in shop for 24 hours before precision work.");
  } else if (humidity > 45 && humidity <= 65) {
    advice.push("  IDEAL HUMIDITY: Wood stable.");
    advice.push("  • EMC around 8-10% - perfect for most projects");
    advice.push("  • Glue joints strong");
    advice.push("  • Wood won't move significantly");
  } else if (humidity > 30) {
    advice.push("  DRY: Wood is shrinking.");
    advice.push("  • Gaps in joinery likely");
    advice.push("  • Wood is harder (more splintering when cutting)");
    advice.push("  • Will expand when humidity rises");
    tips.push("Run humidifier in shop for 24 hours before precision work.");
  } else {
    advice.push("  VERY DRY: Wood shrunk to minimum.");
    advice.push("  • More splintering, need sharp tools");
    advice.push("  • Glue sets very fast (reduced open time)");
    advice.push("  • Static electricity high - dust collection essential");
    warnings.push("Very dry wood = more cracking, checking, and splitting.");
  }
  
  // Temperature effects
  if (temp < 5) {
    warnings.push("COLD SHOP: Glue won't cure. Wood brittle.");
    advice.push("  • Heat shop to 15°C minimum before gluing");
    advice.push("  • Warm glue in hot water before use");
    advice.push("  • Machines need warm-up (cold lubricants)");
    advice.push("  • Wood may be frozen internally");
  } else if (temp < 10) {
    advice.push("  COLD SHOP: PVA glue needs 10°C minimum.");
    advice.push("  • Polyurethane glue works better in cold");
    advice.push("  • Warm glue and wood to room temp");
    tips.push("Use setting-type adhesive or polyurethane glue for cold conditions.");
  } else if (temp > 35) {
    warnings.push("HOT SHOP: Glue sets too fast.");
    advice.push("  • PVA: open time reduced to 5-10 minutes");
    advice.push("  • Work in smaller batches");
    advice.push("  • Keep glue cool (fridge if extremely hot)");
    advice.push("  • Sweat drips = water stains on raw wood");
  }
  
  // Special conditions
  if (condition === 'rain' || precipitation > 0) {
    warnings.push("RAIN: Wood will absorb moisture from air.");
    warnings.push("Do NOT apply finish in rain or immediately after.");
  }
  
  // EMC recommendations by project type
  advice.push("");
  advice.push("PROJECT RECOMMENDATIONS:");
  if (emc > 14) {
    advice.push("  • Furniture: wait for drier conditions");
    advice.push("  • Flooring: let wood acclimate for 3-7 days");
    advice.push("  • Avoid precision joinery (will fail when dry)");
  } else if (emc > 12) {
    advice.push("  • Acceptable for rustic or outdoor projects");
    advice.push("  • Flooring: let acclimate 48-72 hours");
    advice.push("  • Use construction adhesive for panel glue-ups");
  } else if (emc >= 8 && emc <= 12) {
    advice.push("  • Ideal for furniture, cabinets, fine woodworking");
    advice.push("  • Flooring: 48 hours acclimation is enough");
    advice.push("  • All joinery types are safe");
  } else {
    advice.push("  • Very dry: use for precise work (tolerances can be tight)");
    advice.push("  • Expect movement when wood returns to normal humidity");
    advice.push("  • Store finished pieces in climate-controlled space");
  }
  
  return {
    emc: emc,
    summary: emc >= 8 && emc <= 12 ? "IDEAL woodworking conditions" : "CHALLENGING - Wood moving significantly",
    details: advice,
    warnings: warnings,
    tips: tips,
    isIdeal: emc >= 8 && emc <= 12,
    tempOk: temp >= 10 && temp <= 32,
    glueOk: temp >= 10 && temp <= 32 && humidity < 65
  };
}

// ============================================================================
// EQUILIBRIUM MOISTURE CONTENT CALCULATOR
// ============================================================================

function getEquilibriumMoistureContent(temp, humidity) {
  // Simplified EMC calculation based on Hailwood-Horrobin
  // More accurate than simple lookup
  const T = temp;
  const H = humidity / 100;
  
  // Parameters (approximate for wood)
  const W = 1800 / T + 0.9; // Not exactly, but simplified
  const K1 = 0.132;
  const K2 = 0.038;
  
  const EMC = 1800 / T * (K1 * H / (1 - K1 * H) + K1 * K2 * H / (1 + K1 * K2 * H));
  
  return Math.round(EMC * 10) / 10;
}

// ============================================================================
// WEATHER-BASED WORK RECOMMENDATIONS
// ============================================================================

function getWorkRecommendations(data) {
  const { temp, humidity, wind, condition, precipitation } = data;
  const recommendations = [];
  
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  
  // Indoor work options
  recommendations.push("INDOOR WORK (when weather is unsuitable outside):");
  if (isRaining || isStorm || temp < 5 || temp > 35) {
    recommendations.push("  • Drywall installation and taping");
    recommendations.push("  • Interior painting and priming");
    recommendations.push("  • Trim work, crown molding, baseboards");
    recommendations.push("  • Cabinet installation and assembly");
    recommendations.push("  • Electrical wiring and rough-in");
    recommendations.push("  • Plumbing rough-in (not during freezing)");
    recommendations.push("  • Flooring: tile, laminate, vinyl plank");
    recommendations.push("  • Insulation installation");
  }
  
  if (temp >= 10 && temp <= 30 && !isRaining) {
    recommendations.push("OUTDOOR WORK (good conditions):");
    if (wind < 25) {
      recommendations.push("  • Exterior painting and staining");
      recommendations.push("  • Deck building and repair");
      recommendations.push("  • Fence installation");
    }
    if (temp >= 15 && temp <= 27 && humidity < 70) {
      recommendations.push("  • Concrete pouring and finishing");
      recommendations.push("  • Masonry and bricklaying");
    }
    if (temp >= 10 && temp <= 25 && humidity < 60) {
      recommendations.push("  • Roofing");
      recommendations.push("  • Siding installation");
    }
    recommendations.push("  • Landscaping and grading");
    recommendations.push("  • Window and door installation");
  }
  
  if (temp > 25 && humidity < 60 && wind < 20) {
    recommendations.push("  • Spray painting (fast dry, no runs)");
    recommendations.push("  • Outdoor furniture finishing");
  }
  
  if (temp < 10 && !isRaining) {
    recommendations.push("COLD WEATHER OUTDOOR WORK (acceptable):");
    recommendations.push("  • Excavation (ground not frozen)");
    recommendations.push("  • Demolition and debris removal");
    recommendations.push("  • Scaffolding setup/teardown");
    recommendations.push("  • Site cleanup and material staging");
  }
  
  return recommendations;
}

// ============================================================================
// MAIN DIY/CONSTRUCTION ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getDIYConstructionAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, wind, uvIndex, condition, conditionCode, 
    visibility, precipitation, city, dewPoint, tempMin, tempMax,
    sunPosition, timeOfDay, feelsLike
  } = data;
  
  const q = question.toLowerCase();
  
  // Get detailed analyses
  const painting = getPaintingConditions(data);
  const concrete = getConcreteConditions(data);
  const woodwork = getWoodworkingConditions(data);
  
  // Determine what the user is asking about
  const isPainting = q.includes('paint') || q.includes('stain') || q.includes('varnish') || 
                     q.includes('seal') || q.includes('coating') || q.includes('prime') ||
                     q.includes('epoxy') || q.includes('polyurethane') || q.includes('finish');
  
  const isConcrete = q.includes('concrete') || q.includes('cement') || q.includes('pour') || 
                     q.includes('mix') || q.includes('slab') || q.includes('foundation') ||
                     q.includes('grout') || q.includes('mortar') || q.includes('masonry') ||
                     q.includes('brick') || q.includes('tile') || q.includes('paver');
  
  const isWoodwork = q.includes('wood') || q.includes('carpentry') || q.includes('furniture') || 
                     q.includes('cabinet') || q.includes('floor') || q.includes('deck') ||
                     q.includes('fence') || q.includes('shed') || q.includes('glue') ||
                     q.includes('laminate') || q.includes('veneer');
  
  const isRoofing = q.includes('roof') || q.includes('shingle') || q.includes('gutter') || 
                    q.includes('chimney') || q.includes('skylight');
  
  const isExterior = q.includes('siding') || q.includes('stucco') || q.includes('caulk') || 
                     q.includes('weatherproof') || q.includes('power wash');
  
  const isExcavation = q.includes('dig') || q.includes('trench') || q.includes('excavate') || 
                       q.includes('grade') || q.includes('backfill');
  
  const isSafety = q.includes('safe') || q.includes('ladder') || q.includes('scaffold') || 
                   q.includes('respirator') || q.includes('fall') || q.includes('danger');
  
  const isPlumbing = q.includes('plumb') || q.includes('pipe') || q.includes('solder') || 
                     q.includes('pvc') || q.includes('drain');
  
  const isElectrical = q.includes('electrical') || q.includes('wire') || q.includes('outlet') || 
                       q.includes('generator') || q.includes('cable');
  
  // ========================================================================
  // BUILD THE RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "CONSTRUCTION WEATHER ANALYSIS",
    "DIY WEATHER ASSESSMENT",
    "BUILDING CONDITIONS REPORT",
    "WORK SITE WEATHER EVALUATION",
    "PROJECT WEATHER ADVISORY"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${temp}°C (feels like ${Math.round(feelsLike || temp)}°C)\n`;
  response += `  Overnight: ${tempMin}°C | Daytime high: ${tempMax}°C\n`;
  response += `  Humidity: ${humidity}% | Wind: ${wind} km/h\n`;
  response += `  Conditions: ${condition || 'Unknown'}\n`;
  if (dewPoint) response += `  Dew Point: ${dewPoint.toFixed(1)}°C\n`;
  if (precipitation > 0) response += `  Precipitation: ${precipitation}mm\n`;
  response += `  UV Index: ${uvIndex} (${getUVLevel(uvIndex)})\n`;
  response += `  Time: ${timeOfDay || 'Unknown'} | Season: ${getSeason()}\n`;
  response += `\n`;
  
  // ========================================================================
  // SECTION: PAINTING & FINISHING
  // ========================================================================
  
  if (isPainting || !isConcrete && !isWoodwork && !isRoofing && !isSafety) {
    response += `--- PAINTING & FINISHING ---\n`;
    response += painting.summary + '\n';
    painting.details.forEach(d => response += d + '\n');
    if (painting.warnings.length > 0) {
      response += `\nWARNINGS:\n`;
      painting.warnings.forEach(w => response += `  ${w}\n`);
    }
    if (painting.tips.length > 0) {
      response += `\nTIPS:\n`;
      painting.tips.forEach(t => response += `  ${t}\n`);
    }
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: CONCRETE & MASONRY
  // ========================================================================
  
  if (isConcrete) {
    response += `--- CONCRETE & MASONRY ---\n`;
    response += concrete.summary + '\n';
    concrete.details.forEach(d => response += d + '\n');
    if (concrete.warnings.length > 0) {
      response += `\nWARNINGS:\n`;
      concrete.warnings.forEach(w => response += `  ${w}\n`);
    }
    if (concrete.tips.length > 0) {
      response += `\nTIPS:\n`;
      concrete.tips.forEach(t => response += `  ${t}\n`);
    }
    if (concrete.canPour) {
      response += `\nBEST PRACTICES:\n`;
      if (concrete.needsAccelerator) response += `  • Use accelerator (1-2% calcium chloride)\n`;
      if (concrete.needsRetarder) response += `  • Use retarder to prevent flash set\n`;
      if (concrete.needsEvapRetarder) response += `  • Use evaporation retarder immediately\n`;
      if (concrete.requiresInsulation) response += `  • Cover with insulating blankets for 7 days\n`;
      response += `  • Walk on: ${concrete.walkOnTime || '24-48 hours'}\n`;
    }
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: WOODWORKING
  // ========================================================================
  
  if (isWoodwork) {
    response += `--- WOODWORKING ---\n`;
    response += `Wood moisture content: ~${woodwork.emc}%\n`;
    response += woodwork.summary + '\n';
    woodwork.details.forEach(d => response += d + '\n');
    if (woodwork.warnings.length > 0) {
      response += `\nWARNINGS:\n`;
      woodwork.warnings.forEach(w => response += `  ${w}\n`);
    }
    if (woodwork.tips.length > 0) {
      response += `\nTIPS:\n`;
      woodwork.tips.forEach(t => response += `  ${t}\n`);
    }
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: ROOFING
  // ========================================================================
  
  if (isRoofing) {
    response += `--- ROOFING ---\n`;
    if (wind > 30) {
      response += `  DANGEROUS: Wind >30 km/h. NO ROOF WORK.\n`;
      response += `  OSHA: Falls are #1 cause of construction deaths.\n`;
    } else if (wind > 20) {
      response += `  WINDY: Roof work is hazardous. Use extreme caution.\n`;
      response += `  • Secure all materials. One gust = flying plywood.\n`;
      response += `  • Harness + anchor point REQUIRED.\n`;
    } else {
      response += `  WIND CONDITIONS ACCEPTABLE.\n`;
    }
    
    const roofSurfaceTemp = condition === 'clear' ? temp + 25 : temp + 5;
    if (roofSurfaceTemp > 45) {
      response += `  EXTREME HEAT: Roof surface ${roofSurfaceTemp}°C.\n`;
      response += `  • Work early morning (5-9 AM) only.\n`;
      response += `  • Shade breaks every 20 minutes.\n`;
      response += `  • Hydrate constantly. Heat stroke risk is real.\n`;
    } else if (roofSurfaceTemp > 35) {
      response += `  HOT ROOF: Surface ${roofSurfaceTemp}°C.\n`;
      response += `  • Take frequent breaks. Use cooling towels.\n`;
      response += `  • Wear light-colored, breathable clothing.\n`;
    }
    
    if (temp < 5) {
      response += `  COLD: Shingles are brittle.\n`;
      response += `  • Wait for temp above 10°C.\n`;
      response += `  • Cold shingles crack when nailed or walked on.\n`;
    }
    
    if (condition === 'rain' || condition === 'drizzle') {
      response += `  WET ROOF: EXTREMELY SLIPPERY.\n`;
      response += `  • Do not walk on roof. Wait for dry conditions.\n`;
    }
    
    response += `\nROOFING SAFETY:\n`;
    response += `  • Harness + anchor point: ALWAYS above 3m (10ft)\n`;
    response += `  • Roof jacks and boards for slopes >6/12\n`;
    response += `  • No power tools on wet roofs\n`;
    response += `  • Watch for power lines and low-hanging branches\n`;
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: SAFETY
  // ========================================================================
  
  if (isSafety) {
    response += `--- SAFETY ASSESSMENT ---\n`;
    
    // Ladder safety
    response += `LADDER SAFETY:\n`;
    if (wind > 25) {
      response += `  DANGEROUS: Wind >25 km/h. NO LADDER USE.\n`;
    } else if (wind > 15) {
      response += `  WINDY: Secure ladder. Have someone foot it.\n`;
    }
    if (condition === 'rain' || condition === 'drizzle') {
      response += `  WET LADDERS: EXTREMELY SLIPPERY. Do NOT use.\n`;
    }
    response += `  • 4:1 rule: 1 foot out for every 4 feet up\n`;
    response += `  • Extend 3 feet above landing surface\n`;
    response += `  • Max weight: check rating (usually 225kg)\n`;
    response += `\n`;
    
    // Power tools
    response += `POWER TOOL SAFETY:\n`;
    if (condition === 'rain' || condition === 'drizzle') {
      response += `  ELECTROCUTION RISK: Do NOT use tools in rain.\n`;
      response += `  • GFCI protection MANDATORY for all outdoor tools\n`;
    }
    if (humidity > 80) {
      response += `  HIGH HUMIDITY: Tool moisture risk.\n`;
      response += `  • Inspect cords for cracks or damage\n`;
      response += `  • Keep tools in dry area when not in use\n`;
    }
    if (temp < 5) {
      response += `  COLD: Batteries lose 40-50% capacity.\n`;
      response += `  • Keep spare batteries warm (inside coat).\n`;
      response += `  • Cords become stiff - handle gently.\n`;
    }
    if (temp > 35) {
      response += `  HEAT: Tools overheat.\n`;
      response += `  • Duty cycle: 15 min on, 15 min off.\n`;
      response += `  • Keep tools in shade when not in use.\n`;
    }
    response += `  • Safety glasses ALWAYS.\n`;
    response += `  • Hearing protection for any tool over 85dB.\n`;
    response += `\n`;
    
    // Respiratory
    response += `RESPIRATORY PROTECTION:\n`;
    if (q.includes('saw') || q.includes('cut') || q.includes('sand')) {
      response += `  • N95 mask for dust (minimum)\n`;
      response += `  • P100 for fine dust, lead, or silica\n`;
    }
    if (q.includes('paint') || q.includes('varnish') || q.includes('stain')) {
      response += `  • Organic vapor cartridge for fumes\n`;
      response += `  • Replace cartridge if you smell anything\n`;
    }
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: EXCAVATION
  // ========================================================================
  
  if (isExcavation) {
    response += `--- EXCAVATION ---\n`;
    response += `  CRITICAL: CALL 811 BEFORE DIGGING\n`;
    response += `  • Wait 2-3 business days for utility marking\n`;
    response += `  • Hand dig within 2 feet of marked utilities\n`;
    
    if (condition === 'rain' || precipitation > 5) {
      response += `  WET SOIL: Trench collapse risk is HIGH.\n`;
      response += `  • Shoring or trench box REQUIRED for any depth >1.2m\n`;
      response += `  • No one in trench during or after rain\n`;
    }
    
    if (temp < 0) {
      response += `  FROZEN GROUND: Difficult to impossible.\n`;
      response += `  • Wait for thaw or use ground thawing equipment\n`;
      response += `  • Ripping with excavator possible but hard on equipment\n`;
    }
    
    if (temp > 30 && humidity < 40) {
      response += `  DRY SOIL: Dust and difficult digging.\n`;
      response += `  • Water soil first (but not too much)\n`;
      response += `  • Dust control required (wet down, wear mask)\n`;
    }
    
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: WORK RECOMMENDATIONS
  // ========================================================================
  
  if (!isPainting && !isConcrete && !isWoodwork && !isRoofing && !isSafety && !isExcavation) {
    // General query - show all recommendations
    const recommendations = getWorkRecommendations(data);
    response += `--- WORK RECOMMENDATIONS ---\n`;
    recommendations.forEach(r => response += r + '\n');
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: MATERIAL DATABASE REFERENCE
  // ========================================================================
  
  // Check if user asked about a specific material
  const materialKeys = Object.keys(MATERIALS);
  const askedMaterial = materialKeys.find(m => q.includes(m.replace('_', ' ')) || q.includes(m));
  
  if (askedMaterial) {
    const material = MATERIALS[askedMaterial];
    response += `--- ${askedMaterial.toUpperCase()} INFORMATION ---\n`;
    response += `  Temperature range: ${material.minTemp}°C - ${material.maxTemp}°C\n`;
    response += `  Ideal: ${material.idealTemp[0]}°C - ${material.idealTemp[1]}°C\n`;
    response += `  Humidity: ${material.minHumidity}% - ${material.maxHumidity}%\n`;
    if (material.dryTime) response += `  Dry time: ${material.dryTime}\n`;
    if (material.rainFree) response += `  Rain-free needed: ${material.rainFree} hours\n`;
    response += `\n  Special notes:\n`;
    material.special.forEach(s => response += `  • ${s}\n`);
    response += `\n`;
  }
  
  // ========================================================================
  // SECTION: BOTTOM LINE
  // ========================================================================
  
  response += `=== BOTTOM LINE ===\n`;
  
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  
  if (isStorm) {
    response += `STOP ALL OUTDOOR WORK. Life safety first. Seek shelter.\n`;
    response += `Wait 30 minutes after last thunder before resuming.\n`;
  } else if (wind > 50) {
    response += `DANGEROUS WIND CONDITIONS. No outdoor work.\n`;
    response += `Secure job site: materials, tools, scaffolding.\n`;
  } else if (isRaining && precipitation > 10) {
    response += `HEAVY RAIN. Outdoor work impossible. Focus on indoor tasks.\n`;
  } else if (temp < 5 || temp > 38) {
    response += `EXTREME TEMPERATURE. Work inside or wait for better conditions.\n`;
  } else if (temp >= 15 && temp <= 27 && humidity >= 30 && humidity <= 65 && wind < 20 && !isRaining) {
    response += `EXCELLENT CONDITIONS. Proceed with all outdoor projects.\n`;
    response += `Optimal for painting, concrete, woodworking, and roofing.\n`;
  } else if (temp >= 10 && temp <= 30 && humidity < 70 && wind < 25 && !isRaining) {
    response += `GOOD CONDITIONS. Most work can proceed with precautions.\n`;
    response += `Check material-specific requirements above.\n`;
  } else {
    response += `CHALLENGING CONDITIONS. Work possible but with significant precautions.\n`;
    response += `Review specific recommendations and warnings above.\n`;
  }
  
  // ========================================================================
  // FINAL WISDOM
  // ========================================================================
  
  const wisdom = [
    "Measure twice, cut once. Check weather twice, pour once.",
    "Good materials + wrong weather = bad results.",
    "The most expensive job is the one you have to do twice.",
    "Weather doesn't care about your schedule. Work with it, not against it.",
    "Concrete waits for no one. Be ready before the truck arrives.",
    "A safe job site is a productive job site.",
    "Quality is remembered long after the price is forgotten.",
    "The best time to prepare is before the weather turns bad.",
    "Proper planning prevents poor performance."
  ];
  
  response += `\n--- ADVICE ---\n${random(wisdom)}\n`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getPaintingConditions, 
  getConcreteConditions, 
  getWoodworkingConditions,
  getEquilibriumMoistureContent,
  getWorkRecommendations
};

export default getDIYConstructionAdvice;
