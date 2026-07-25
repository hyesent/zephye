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
  "Can I paint outside today?",
  "Is it good weather for concrete work?",
  "Should I stain my deck?",
  "Can I use power tools outside?",
  "Is it too humid for woodworking?",
  "Good day for roofing work?",
  "Will rain ruin my construction project?",
  "Can I pour concrete today?",
  "Is it safe to use a ladder?",
  "Can I apply deck sealer today?",
  "Is it good weather for drywall mudding?",
  "Should I texture the ceiling today?",
  "Can I install insulation?",
  "Is it good for spray foam?",
  "Should I run the tile saw outside?",
  "Can I cut brick/stone today?",
  "Is it good weather for welding outside?",
  "Should I sand drywall today?",
  "Can I apply epoxy floor coating?",
  "Is it good for asphalt driveway sealing?",
  "Should I power wash the house?",
  "Can I clean the gutters safely?",
  "Is it good weather for tree trimming?",
  "Should I dig post holes today?",
  "Can I install fence posts?",
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
  "Is it good for hardwood floor installation?",
  "Should I acclimate wood flooring?",
  "Can I install laminate today?",
  "Is it good for vinyl plank installation?",
  "Should I stretch carpet today?",
  "Can I apply wood stain?",
  "Is it good for polyurethane?",
  "Should I use water-based or oil-based?",
  "Can I varnish today?",
  "Is it good for spray painting?",
  "Should I brush or roll paint?",
  "Can I paint the ceiling?",
  "Is it good for exterior painting?",
  "Should I paint the deck?",
  "Can I paint furniture outside?",
  "Is it good for chalk painting?",
  "Should I prime before painting?",
  "Will paint dry between coats?",
  "How long between coats?",
  "Can I apply wallpaper?",
  "Should I remove wallpaper today?",
  "Is it good for drywall installation?",
  "Can I tape and mud drywall?",
  "Will drywall mud dry today?",
  "Should I sand drywall outside?",
  "Can I install windows today?",
  "Is it good for door installation?",
  "Should I install skylights?",
  "Can I do roof repair?",
  "Is it safe to be on the roof?",
  "Should I install solar panels?",
  "Can I clean solar panels?",
  "Is it good for chimney sweeping?",
  "Should I install gutters?",
  "Can I do siding repair?",
  "Is it good for stucco work?",
  "Should I caulk exterior?",
  "Can I apply weatherproofing?",
  "Is it good for foundation work?",
  "Should I waterproof basement?",
  "Can I install French drain?",
  "Is it good for excavation?",
  "Should I rent heavy equipment?",
  "Can I dig a trench?",
  "Is it safe to dig (utilities)?",
  "Should I compact soil?",
  "Is soil moisture good for compaction?",
  "Can I grade the yard?",
  "Should I lay sod?",
  "Can I plant trees today?",
  "Is it good for landscaping?",
  "Should I install sprinklers?",
  "Can I build a retaining wall?",
  "Is it good for paver installation?",
  "Should I build a patio?",
  "Can I install a fence?",
  "Should I build a deck?",
  "Is it good for pergola construction?",
  "Should I build a shed?",
  "Can I install a hot tub?",
  "Is it good for pool installation?",
  "Should I run electrical outside?",
  "Can I install outdoor lighting?",
  "Is it safe to dig near power lines?",
  "Should I use a generator?",
  "Is it safe to run extension cords?",
  "Can I do plumbing work outside?",
  "Should I solder copper pipes?",
  "Can I glue PVC today?",
  "Is it good for ABS cement?",
  "Should I insulate pipes?",
  "Can I install HVAC outside?",
  "Should I clean AC condenser?",
  "Can I recharge AC?",
  "Is it good for heat pump installation?"
];

// ============================================================================
// CONSTRUCTION MATERIAL DATABASE
// ============================================================================

const MATERIALS = {
  paint_latex: {
    minTemp: 10,              // °C (surface temp, not air)
    maxTemp: 32,
    idealTemp: [15, 27],
    minHumidity: 30,
    maxHumidity: 70,
    idealHumidity: [40, 60],
    dryTime: '1-2 hours to touch, 4 hours to recoat, 30 days full cure',
    windLimit: 25,            // km/h
    rainFree: 4,              // hours needed without rain after application
    special: [
      'Surface temp matters more than air temp. Check with IR thermometer.',
      'Below 10°C: poor film formation, cracking, peeling',
      'Above 32°C: dries too fast, lap marks, poor adhesion',
      'High humidity: slow dry, surfactant leaching (brown streaks)',
      'Direct sun on dark surfaces: can be 20°C hotter than air',
      'Dew point: if surface temp drops to dew point, condensation ruins finish'
    ]
  },
  paint_oil: {
    minTemp: 5,
    maxTemp: 32,
    idealTemp: [10, 27],
    minHumidity: 20,
    maxHumidity: 85,
    dryTime: '6-8 hours to touch, 24 hours to recoat, 7 days full cure',
    windLimit: 20,
    rainFree: 8,
    special: [
      'More forgiving in cold than latex',
      'Strong fumes: ventilation essential. Respirator recommended.',
      'Longer dry time but better leveling',
      'Yellowing: accelerates in low light (behind furniture, in closets)'
    ]
  },
  stain_deck: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [15, 27],
    minHumidity: 30,
    maxHumidity: 70,
    dryTime: '2-4 hours to touch, 24 hours before rain',
    rainFree: 24,
    special: [
      'Wood moisture content must be <15% (check with meter)',
      'Don\'t apply in direct sun (dries too fast, won\'t penetrate)',
      'New pressure-treated wood: wait 3-6 months before staining',
      'Clean and brighten wood first for best adhesion'
    ]
  },
  concrete: {
    minTemp: 5,               // Must be rising, not falling
    maxTemp: 32,
    idealTemp: [10, 27],
    minHumidity: 20,
    maxHumidity: 90,
    setTime: 'Initial: 4-8 hours. Walk on: 24 hours. Drive on: 7 days. Full strength: 28 days.',
    rainFree: 8,
    windLimit: 30,
    special: [
      'Below 5°C: hydration stops. Concrete NEVER gains strength.',
      'Above 32°C: flash set, plastic shrinkage cracks, weak',
      'Ideal: 15-21°C for maximum long-term strength',
      'Wind >15 km/h: use evaporation retarder or windbreaks',
      'Cold weather: use heated mix water, accelerators, insulating blankets',
      'Hot weather: use ice water, retarders, shade, wet cure',
      'Test: slump test, air content, temperature for every truck',
      'NEVER pour on frozen ground (will settle and crack when thaws)'
    ]
  },
  mortar: {
    minTemp: 5,
    maxTemp: 38,
    idealTemp: [15, 27],
    minHumidity: 20,
    maxHumidity: 80,
    setTime: 'Initial set: 1-2 hours. Full cure: 28 days.',
    rainFree: 24,
    special: [
      'Below 5°C: hydration stops. Protect with heated enclosures.',
      'Above 38°C: flash set. No time to work.',
      'Hot weather: keep bricks wet (they suck water from mortar)',
      'Cold weather: use heated water, cover with insulating blankets',
      'Efflorescence: more likely in wet conditions (white powder on bricks)'
    ]
  },
  wood_glue: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [18, 27],
    minHumidity: 25,
    maxHumidity: 65,
    clampTime: 'PVA: 30 min to 1 hour. Full cure: 24 hours.',
    special: [
      'Below 10°C: PVA glue chalks (white residue, weak bond)',
      'Above 32°C: open time too short. Can\'t assemble before skin forms.',
      'High humidity: wood swells, glue absorbs moisture, weak bond',
      'Cold glue joint: FAILS. Warm both wood and glue to 18°C+'
    ]
  },
  pvc_cement: {
    minTemp: 5,
    maxTemp: 38,
    idealTemp: [15, 32],
    minHumidity: 0,
    maxHumidity: 90,
    setTime: '15 min to handle, 2 hours for pressure test',
    special: [
      'Below 5°C: solvent won\'t evaporate. Joint fails.',
      'Above 38°C: solvent flashes off before you can assemble',
      'High humidity: can cause blushing (white residue, weakened joint)',
      'Primer required in most plumbing codes (purple primer)'
    ]
  },
  epoxy: {
    minTemp: 10,
    maxTemp: 30,
    idealTemp: [20, 27],
    minHumidity: 0,
    maxHumidity: 60,
    cureTime: '24 hours to walk, 72 hours full cure',
    special: [
      'Below 10°C: won\'t cure. Stays sticky forever.',
      'Above 30°C: exotherms. Can smoke, bubble, or yellow.',
      'High humidity: amine blush (waxy surface, adhesion failure)',
      'Must mix EXACTLY. Ratio matters. No eyeballing.',
      'Temperature of epoxy AND surface both matter.'
    ]
  },
  drywall_compound: {
    minTemp: 10,
    maxTemp: 32,
    idealTemp: [18, 27],
    minHumidity: 20,
    maxHumidity: 70,
    dryTime: 'Light coat: 24 hours. Heavy fill: 48+ hours.',
    special: [
      'High humidity: drying time triples. Use setting-type compound (hot mud).',
      'Cold: drying time doubles. Use heater + fan.',
      'Hot mud (setting type): sets by chemical reaction, not drying',
      'Hot mud works in cold/humid conditions (5, 20, 45, 90, 210 minute)'
    ]
  },
  caulk_sealant: {
    minTemp: 5,
    maxTemp: 40,
    idealTemp: [15, 32],
    minHumidity: 0,
    maxHumidity: 80,
    skinTime: '30 min to 2 hours depending on type',
    special: [
      'Silicone: works in wider temp range but needs dry surface',
      'Latex caulk: paintable but not for wet areas',
      'Cold: caulk stiff, hard to gun. Warm tube in pocket first.',
      'Wet surface: NO caulk sticks to wet surface'
    ]
  },
  asphalt_sealer: {
    minTemp: 15,
    maxTemp: 35,
    idealTemp: [21, 30],
    minHumidity: 20,
    maxHumidity: 70,
    dryTime: '4-8 hours to touch, 24 hours before rain, 48 hours before vehicles',
    rainFree: 24,
    special: [
      'Surface must be completely dry',
      'Below 15°C: won\'t cure properly. Stays tacky.',
      'Above 35°C: dries too fast, won\'t bond',
      'Apply in shade if possible (hot pavement = flash dry)'
    ]
  }
};

// ============================================================================
// SAFETY THRESHOLDS
// ============================================================================

const SAFETY = {
  ladder: {
    maxWind: 25,              // km/h
    maxGust: 35,
    wetSurface: 'NEVER on wet rungs. Slip = life-changing fall.',
    icySurface: 'ABSOLUTELY NOT. Frost/ice + ladder = hospital.',
    heat: 'Above 32°C: reduce time on ladder. Heat exhaustion = fall.',
    cold: 'Below 0°C: cold hands lose grip. Metal ladder = frostbite risk.'
  },
  roof: {
    maxWind: 30,
    maxGust: 40,
    wetSurface: 'NEVER on wet roof. Fall = death or paralysis.',
    icySurface: 'DO NOT EVEN THINK ABOUT IT.',
    heat: 'Roof surface 20°C+ hotter than air. Burns through shoes.',
    special: 'Harness + anchor point. No exceptions above 3m height.'
  },
  powerTools: {
    rain: 'ELECTROCUTION RISK. GFCI mandatory even in damp conditions.',
    wetGround: 'Stand on dry board. GFCI. Inspect cords for damage.',
    wind: 'Dust/debris in eyes. Full seal goggles. Respirator if sanding.',
    cold: 'Power cords stiffen, crack. Batteries die 40% faster.',
    heat: 'Tools overheat. Duty cycle: 15 min on, 15 min off.'
  },
  excavation: {
    callBefore: 'CALL 811 (or local utility locating service) BEFORE DIGGING',
    wetSoil: 'Trench collapse risk. Shoring or sloping required.',
    frozenSoil: 'Impossible to dig. Wait for thaw or use ground thawing equipment.',
    rain: 'Trenches flood. Walls collapse. No one in trench during/following rain.'
  }
};

// ============================================================================
// PAINT CALCULATOR
// ============================================================================

function getPaintingConditions(data) {
  const { temp, humidity, wind, uvIndex, condition, dewPoint, sunPosition, timeOfDay } = data;
  const advice = [];
  const surfaceTemp = condition === 'clear' && sunPosition !== 'night' ? temp + 15 : temp + 5;
  
  advice.push("🎨 PAINTING CONDITIONS:");
  advice.push(`• Air temp: ${temp}°C | Surface temp: ~${surfaceTemp}°C`);
  advice.push(`• Humidity: ${humidity}% | Dew point: ${dewPoint?.toFixed(1) || 'N/A'}°C`);
  advice.push("");
  
  // Temperature check
  if (surfaceTemp < 5) {
    advice.push("🚫 TOO COLD for ANY paint. Surface below 5°C.");
    advice.push("• Paint will NOT form proper film. Guaranteed failure.");
    advice.push("• Wait for warmer weather or heat the surface.");
  } else if (surfaceTemp < 10) {
    advice.push("⚠️ COLD: Only specialty cold-weather paints.");
    advice.push("• Standard latex: minimum 10°C surface temp");
    advice.push("• Oil-based: can work at 5°C but slow dry");
    advice.push("• Paint mid-day when temps peak");
    advice.push("• Ensure temp won't drop below minimum during drying (check overnight low!)");
  } else if (surfaceTemp > 40) {
    advice.push("🚫 TOO HOT: Surface above 40°C.");
    advice.push("• Paint dries on contact. Brush marks, lap marks, poor adhesion.");
    advice.push("• Paint in shade or wait for cooler weather.");
  } else if (surfaceTemp > 32) {
    advice.push("⚠️ HOT: Work fast. Paint dries quickly.");
    advice.push("• Paint early morning or late afternoon");
    advice.push("• Work in shade if possible");
    advice.push("• Don't paint surfaces in direct sun");
  } else {
    advice.push("✅ Temperature ideal for painting.");
  }
  
  // Humidity
  if (humidity > 80) {
    advice.push("⚠️ HIGH HUMIDITY: Slow dry, surfactant leaching possible.");
    advice.push("• Latex: may not cure for days. Risk of brown streaks.");
    advice.push("• Dehumidifier indoors. Wait for <70% outdoors.");
  } else if (humidity < 25) {
    advice.push("⚠️ VERY DRY: Paint dries fast. Lap marks possible.");
    advice.push("• Maintain wet edge. Work quickly.");
    advice.push("• Good for spray application (fast dry = less runs)");
  }
  
  // Dew point (condensation risk)
  if (dewPoint && (temp - dewPoint) < 3) {
    advice.push("⚠️ CONDENSATION RISK: Dew point close to temperature.");
    advice.push("• If surface temp drops to dew point = condensation = ruined paint");
    advice.push("• Don't paint late afternoon if dew point close to overnight low");
  }
  
  // Wind
  if (wind > 25) {
    advice.push("💨 WINDY: Overspray, debris in wet paint.");
    advice.push("• Brush/roll instead of spray");
    advice.push("• Windbreaks if spraying");
  }
  
  // Sun/UV
  if (uvIndex > 6 && condition === 'clear') {
    advice.push("☀️ HIGH UV: Direct sun on dark surfaces = extreme heat.");
    advice.push("• Paint in shade. Dark surfaces can blister.");
  }
  
  // Rain forecast
  if (condition === 'rain' || condition === 'drizzle') {
    advice.push("🌧️ RAIN: Do not paint. Surfaces wet.");
  }
  
  return advice;
}

// ============================================================================
// CONCRETE CALCULATOR
// ============================================================================

function getConcreteConditions(data) {
  const { temp, humidity, wind, condition, tempMin, tempMax } = data;
  const advice = [];
  
  advice.push("🧱 CONCRETE CONDITIONS:");
  advice.push(`• Air temp: ${temp}°C | Range: ${tempMin}°C - ${tempMax}°C`);
  advice.push(`• Humidity: ${humidity}% | Wind: ${wind}km/h`);
  advice.push("");
  
  // Temperature
  if (temp < 2) {
    advice.push("🚫 FREEZING: DO NOT POUR CONCRETE.");
    advice.push("• Concrete must stay above 5°C for 3-7 days");
    advice.push("• Frozen concrete loses 50%+ strength permanently");
    advice.push("• If pouring: heated enclosures, insulated blankets, heated mix water");
    advice.push("• Ground must NOT be frozen (will settle when thaws)");
  } else if (temp < 5) {
    advice.push("⚠️ COLD WEATHER CONCRETING:");
    advice.push("• Use Type III cement (high early strength) or accelerators");
    advice.push("• Heat mix water (not above 70°C or flash set)");
    advice.push("• Protect with insulated blankets for 3+ days");
    advice.push("• Monitor concrete temp. Must stay above 5°C during cure.");
    advice.push("• Calcium chloride accelerator: 2% max (corrodes rebar)");
  } else if (temp > 32) {
    advice.push("⚠️ HOT WEATHER CONCRETING:");
    advice.push("• Risk: flash set, plastic shrinkage cracks, reduced strength");
    advice.push("• Use ice water in mix, retarders, shade");
    advice.push("• Pour early morning or evening");
    advice.push("• Start wet curing within 2 hours");
    advice.push("• Keep forms moist before pour (dry wood sucks water from concrete)");
    advice.push("• Windbreaks if wind > 15 km/h");
  } else if (temp >= 10 && temp <= 27) {
    advice.push("✅ IDEAL concrete temperature.");
    advice.push("• Maximum long-term strength achieved");
    advice.push("• Standard mix design, no special additives needed");
  }
  
  // Humidity
  if (humidity < 30 && temp > 20) {
    advice.push("💨 DRY + WARM: Evaporation rate HIGH.");
    advice.push("• Apply evaporation retarder immediately after screeding");
    advice.push("• Start wet curing as soon as surface won't be damaged");
    advice.push("• Plastic shrinkage cracks form in first 2-4 hours");
  } else if (humidity > 85) {
    advice.push("💧 HIGH HUMIDITY: Slow evaporation = good for curing.");
    advice.push("• But check: no rain forecast. Rain ruins fresh concrete.");
  }
  
  // Wind
  if (wind > 20) {
    advice.push("💨 WINDY: Rapid surface drying.");
    advice.push("• Use windbreaks or fog misters");
    advice.push("• Apply curing compound immediately after finishing");
    advice.push("• Wind + hot + dry = CRACKS within 1 hour");
  }
  
  // Rain
  if (condition === 'rain' || condition === 'thunderstorm') {
    advice.push("🌧️ RAIN: Postpone pour if possible.");
    advice.push("• Fresh concrete + rain = ruined surface, weakened mix");
    advice.push("• If must pour: have plastic sheeting ready. Tent the area.");
    advice.push("• Rain within 4-8 hours of pour = permanent surface damage");
  }
  
  return advice;
}

// ============================================================================
// WOODWORKING CONDITIONS
// ============================================================================

function getWoodworkingConditions(data) {
  const { temp, humidity, condition } = data;
  const advice = [];
  
  advice.push("🪵 WOODWORKING CONDITIONS:");
  advice.push(`• Temp: ${temp}°C | Humidity: ${humidity}%`);
  advice.push("");
  
  // Wood movement
  const emc = getEquilibriumMoistureContent(temp, humidity);
  advice.push(`• Wood equilibrium moisture content: ~${emc}%`);
  
  if (humidity > 80) {
    advice.push("⚠️ HIGH HUMIDITY: Wood has swollen.");
    advice.push("• Don't cut to final dimensions (wood will shrink when dry)");
    advice.push("• Glue joints: weak if wood moisture >12%");
    advice.push("• Expect: drawers stick, doors bind, floors buckle");
    advice.push("• Indoor woodworking: run AC/dehumidifier to stabilize");
  } else if (humidity < 25) {
    advice.push("⚠️ VERY DRY: Wood has shrunk.");
    advice.push("• Don't cut to final dimensions (wood will expand when humid)");
    advice.push("• Expect: gaps in joinery, loose joints later");
    advice.push("• Indoor: run humidifier to 35-45%");
    advice.push("• Static: sawdust sticks everywhere. Dust collection essential.");
  } else {
    advice.push("✅ Good humidity for woodworking. Wood stable.");
  }
  
  if (temp < 5) {
    advice.push("❄️ COLD: Glue won't cure. Wood brittle.");
    advice.push("• Heat shop to 15°C+ before gluing");
    advice.push("• Cold lubricants stiffen: machines need warmup");
  } else if (temp > 32) {
    advice.push("🔥 HOT: Glue dries too fast. Open time reduced.");
    advice.push("• Work in smaller batches. Assemble quickly.");
    advice.push("• Sweat drips on wood = water stains on raw wood");
  }
  
  return advice;
}

function getEquilibriumMoistureContent(temp, humidity) {
  // Simplified EMC calculation
  if (humidity > 90) return 22;
  if (humidity > 80) return 16;
  if (humidity > 70) return 13;
  if (humidity > 60) return 11;
  if (humidity > 50) return 9;
  if (humidity > 40) return 8;
  if (humidity > 30) return 6;
  return 5;
}

// ============================================================================
// MAIN DIY/CONSTRUCTION ADVICE FUNCTION
// ============================================================================

export const getDIYConstructionAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, wind, uvIndex, condition, conditionCode, 
    visibility, precipitation, city, dewPoint, tempMin, tempMax,
    sunPosition, timeOfDay, feelsLike
  } = data;
  
  const paintDry = getPaintDryingTime(temp, humidity);
  const concreteCure = getConcreteCuringTemp(temp);
  const comfort = getComfortScore({ temp, humidity, wind });
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  
  // Detect work type from question
  const q = question.toLowerCase();
  const paintingAdvice = getPaintingConditions(data);
  const concreteAdvice = getConcreteConditions(data);
  const woodworkAdvice = getWoodworkingConditions(data);
  
  let verdict = [];
  let painting = [];
  let concrete = [];
  let woodwork = [];
  let roofing = [];
  let masonry = [];
  let safety = [];
  let warnings = [];
  let specific = [];

  // ========================================================================
  // CATASTROPHIC CONDITIONS
  // ========================================================================
  
  if (isStorm) {
    verdict.push("⛈️ THUNDERSTORM: STOP ALL OUTDOOR WORK IMMEDIATELY.");
    warnings.push("Lightning: metal tools, ladders, scaffolding = death.");
    warnings.push("Unplug all power tools. Seek shelter in building or hard-topped vehicle.");
    safety.push("30-minute rule: wait 30 min after last thunder before resuming work.");
  }
  
  if (wind > 50) {
    verdict.push("🚫 DANGEROUS WIND: All outdoor work unsafe.");
    warnings.push("Scaffolding collapses. Ladders blow over. Materials become airborne.");
    warnings.push("Roof work: FATAL risk. Stay off roofs.");
    safety.push("Secure job site: materials, tools, portable toilets, dumpsters.");
  }
  
  if (precipitation > 15 && isRaining) {
    verdict.push("🌧️ HEAVY RAIN: Outdoor construction impossible.");
    warnings.push("Excavations flood. Materials ruined. Slip hazards everywhere.");
    warnings.push("Power tools + standing water = electrocution.");
  }

  // ========================================================================
  // MAIN VERDICT
  // ========================================================================
  
  if (!verdict.length) {
    if (comfort === "Perfect" || comfort === "Good") {
      verdict.push("✅ Good working conditions. Most projects can proceed.");
    } else if (isRaining) {
      verdict.push("🌧️ Wet conditions. Limited outdoor work. Focus on indoor tasks.");
    } else if (wind > 30) {
      verdict.push("💨 Windy. Avoid heights and large materials. Ground-level work OK.");
    } else if (temp > 35) {
      verdict.push("🔥 Extreme heat. Work early morning. Hydrate constantly. Rest often.");
    } else if (temp < 0) {
      verdict.push("❄️ Freezing. Most materials won't cure. Work indoors or wait.");
    } else {
      verdict.push("⚠️ Challenging but workable with precautions.");
    }
  }

  // ========================================================================
  // ROOFING SPECIFIC
  // ========================================================================
  
  if (q.includes('roof') || q.includes('shingle') || q.includes('gutter')) {
    if (wind > 30) {
      roofing.push("🚫 NO ROOF WORK. Wind >30 km/h.");
      warnings.push("OSHA: no work on roofs in high wind. Fall = death.");
    } else if (temp > 35) {
      roofing.push("🔥 Roof surface extremely hot. Work early morning only.");
      roofing.push(`• Surface temp: ~${temp + 25}°C. Burns through shoes.`);
      warnings.push("Heat stroke on roof = common and deadly. Hydrate. Shade breaks.");
    } else if (temp < 5) {
      roofing.push("❄️ Asphalt shingles brittle in cold. Crack when nailed.");
      roofing.push("• Seal strips won't activate. Leaks likely.");
      roofing.push("• Wait for temps above 10°C.");
    } else if (condition === 'rain') {
      roofing.push("🌧️ Wet roof = slip hazard. Do not walk on wet roof.");
    } else {
      roofing.push("✅ Conditions acceptable for roofing.");
      roofing.push("• Safety harness + anchor point REQUIRED.");
      roofing.push("• Check roof sheathing for moisture before covering.");
    }
  }

  // ========================================================================
  // MASONRY/BRICK
  // ========================================================================
  
  if (q.includes('brick') || q.includes('masonry') || q.includes('mortar') || q.includes('stone')) {
    if (temp < 2) {
      masonry.push("🚫 Too cold for masonry. Mortar freezes = no strength.");
      masonry.push("• Protect with heated enclosures if must work.");
    } else if (temp > 38) {
      masonry.push("🔥 Too hot. Mortar dries before it cures.");
      masonry.push("• Wet bricks before laying (dry bricks suck water from mortar).");
    } else if (temp >= 10 && temp <= 27) {
      masonry.push("✅ Good masonry weather.");
      masonry.push("• Keep mortar moist for 3 days for maximum strength.");
    }
    if (condition === 'rain' && precipitation > 3) {
      masonry.push("🌧️ Rain: protect fresh mortar. Cover with plastic.");
      masonry.push("• Rain within 24 hours of laying = efflorescence, weakened joints.");
    }
  }

  // ========================================================================
  // SAFETY REMINDERS
  // ========================================================================
  
  if (wind > 20) {
    safety.push("💨 WIND SAFETY:");
    safety.push("• Secure all lightweight materials (insulation, sheeting, foam board)");
    safety.push("• Plywood sheets become sails. Weight down or lay flat.");
    safety.push("• Dust: full seal goggles + N95 respirator");
  }
  
  if (temp > 32) {
    safety.push("🔥 HEAT SAFETY:");
    safety.push("• Water: 500ml every 15-20 minutes. Electrolytes if sweating heavily.");
    safety.push("• Shade breaks every 30 minutes. Rest in AC if possible.");
    safety.push("• Heat stroke signs: confusion, hot dry skin, no sweating = 911.");
    safety.push("• Tool motors overheat. Let cool periodically.");
  }
  
  if (temp < 5) {
    safety.push("❄️ COLD SAFETY:");
    safety.push("• Layer up: moisture-wicking base, insulating mid, windproof outer");
    safety.push("• Chemical hand warmers. Warm gloves that allow dexterity.");
    safety.push("• Metal tools: skin sticks to cold metal. Gloves mandatory.");
    safety.push("• Batteries die 40-50% faster. Keep spares warm (inside coat).");
  }
  
  safety.push("🦺 GENERAL SAFETY:");
  safety.push("• Safety glasses ALWAYS. Dust, chips, sparks = eye damage.");
  safety.push("• Hearing protection with power tools (85dB+ = hearing damage).");
  safety.push("• First aid kit accessible. Know location of nearest ER.");
  if (temp > 25 || humidity > 60) {
    safety.push("• GFCI outlets: test monthly. Required for all outdoor power tools.");
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🔨 Construction weather check:",
    "🪚 DIY conditions:",
    "🏗️ Building weather report:",
    "🛠️ Work site forecast:",
    "📐 Zephye's construction advisory:",
    "🔧 Home improvement weather:",
    "📏 Contractor conditions:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Verdict
  response += `📊 OVERALL: ${verdict.join(' ')}\n\n`;
  
  // Conditions
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temperature: ${temp}°C (feels like ${Math.round(feelsLike || temp)}°C)\n`;
  response += `• Surface temp (sun): ~${condition === 'clear' ? temp + 15 : temp + 5}°C\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• Precipitation: ${precipitation || 0}mm\n`;
  if (dewPoint) response += `• Dew Point: ${dewPoint.toFixed(1)}°C (condensation risk: ${(temp - dewPoint) < 3 ? 'HIGH' : 'LOW'})\n`;
  response += '\n';
  
  // Painting
  if (q.includes('paint') || q.includes('stain') || q.includes('varnish') || q.includes('seal')) {
    paintingAdvice.forEach(p => response += `${p}\n`);
    response += '\n';
  }
  
  // Concrete
  if (q.includes('concrete') || q.includes('cement') || q.includes('pour')) {
    concreteAdvice.forEach(c => response += `${c}\n`);
    response += '\n';
  }
  
  // Woodwork
  if (q.includes('wood') || q.includes('carpentry') || q.includes('furniture') || q.includes('cabinet')) {
    woodworkAdvice.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Roofing
  if (roofing.length > 0) {
    response += `🏠 ROOFING:\n`;
    roofing.forEach(r => response += `${r}\n`);
    response += '\n';
  }
  
  // Masonry
  if (masonry.length > 0) {
    response += `🧱 MASONRY:\n`;
    masonry.forEach(m => response += `${m}\n`);
    response += '\n';
  }
  
  // Safety
  if (safety.length > 0) {
    response += `🦺 SAFETY:\n`;
    safety.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ CRITICAL WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Final
  response += `💡 BOTTOM LINE:\n`;
  if (isStorm || wind > 50) {
    response += `DANGEROUS conditions. No outdoor work. Reschedule.\n`;
  } else if (isRaining && precipitation > 5) {
    response += `Wet conditions. Indoor tasks only today.\n`;
  } else if (temp >= 15 && temp <= 27 && humidity >= 30 && humidity <= 60 && wind < 15 && !isRaining) {
    response += `PERFECT construction weather. Everything works today.\n`;
  } else {
    response += `Work possible with precautions. Check material-specific requirements.\n`;
  }
  
  const contractorWisdom = [
    "Measure twice, cut once. Check weather twice, pour once.",
    "Good materials + wrong weather = bad results.",
    "The most expensive job is the one you have to do twice.",
    "Weather doesn't care about your schedule. Work with it, not against it.",
    "Concrete waits for no one. Be ready before the truck arrives.",
    "A safe job site is a productive job site."
  ];
  response += `\n🔨 ${random(contractorWisdom)}`;

  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export const getPaintingConditions = getPaintingConditions;
export const getConcreteConditions = getConcreteConditions;
export const getWoodworkingConditions = getWoodworkingConditions;

export default getDIYConstructionAdvice;
