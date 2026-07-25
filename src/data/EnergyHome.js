import {
  calcHeatIndex,
  calcWindChill,
  getComfortScore,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getDayLength,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  getPollenIndex,
  getPressureTrend,
  mapWeatherCode
} from './calculations';

// ============================================================================
// COMPREHENSIVE HOME ENERGY & EFFICIENCY ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  "Should I run AC today?",
  "Will my heating bill be high?",
  "Is it good weather to air out the house?",
  "Should I close windows?",
  "Do I need to run a dehumidifier?",
  "Will solar panels work well today?",
  "Should I use fans or AC?",
  "Is it cheap to heat the house today?",
  "Should I run the dryer or hang clothes outside?",
  "Should I pre-cool my house before peak rates?",
  "Is it a good day to charge my EV from solar?",
  "Should I run the pool pump now?",
  "Will my heat pump be efficient today?",
  "Should I use the whole-house fan tonight?",
  "Is it good attic fan weather?",
  "Should I close my crawl space vents?",
  "Will my basement dehumidifier run all day?",
  "Is it a good day to run the dishwasher?",
  "Should I delay laundry until tomorrow?",
  "Will my smart thermostat save money today?",
  "Should I override my thermostat schedule?",
  "Is it cheaper to heat/cool now or later?",
  "Will opening windows save energy?",
  "Should I use the fireplace tonight?",
  "Is it safe to use a space heater?",
  "Will my pipes freeze tonight?",
  "Should I drip my faucets?",
  "Is my water heater working harder?",
  "Should I turn down my water heater temp?",
  "Will my fridge use more energy?",
  "Should I clean my AC condenser?",
  "Is my AC working efficiently?",
  "Should I change my air filter?",
  "Will ceiling fans help today?",
  "Which direction should my ceiling fan spin?",
  "Should I use bathroom exhaust fans?",
  "Is it a good day to paint?",
  "Will paint dry properly outside?",
  "Should I stain the deck today?",
  "Is it good weather for exterior caulking?",
  "Can I apply driveway sealer?",
  "Should I wash windows today?",
  "Will my houseplants need more water?",
  "Should I water the lawn?",
  "Is it good sprinkler weather?",
  "Will rain water my garden enough?",
  "Should I fertilize today?",
  "Is it good weather for composting?",
  "Will my rain barrel fill up?",
  "Should I cover my outdoor furniture?",
  "Is it safe to use the hot tub?",
  "Will my pool heat faster today?",
  "Should I use the solar pool cover?",
  "Will my pool lose heat overnight?",
  "Should I run the pool heater?",
  "Is it a good day to clean the gutters?",
  "Will leaves clog my gutters today?",
  "Should I check my roof for damage?",
  "Is ice damming a risk?",
  "Should I clear snow off my roof?",
  "Will my sump pump run today?",
  "Is my basement flooding risk high?",
  "Should I check my French drain?",
  "Will my septic system be OK?",
  "Is it a good day for pest control?",
  "Should I set mouse traps?",
  "Will ants come inside today?",
  "Should I seal cracks before winter?",
  "Is it good weather for insulation work?",
  "Should I add attic insulation?",
  "Will my home energy audit be accurate?",
  "Should I get a blower door test today?",
  "Is it good solar panel cleaning weather?",
  "Will my wind turbine generate today?",
  "Should I switch to time-of-use plan?",
  "Is demand response event likely?",
  "Should I charge my battery from grid?",
  "Will my Powerwall last through peak?",
  "Should I go off-grid today?",
  "Is it a good net metering day?",
  "Will I export more than I use?",
  "Should I run major appliances now?",
  "What's the best time for laundry?",
  "When should I run the dishwasher?",
  "Is it cheaper to cook with gas or electric?",
  "Should I use the slow cooker outside?",
  "Can I solar cook today?"
];

// ============================================================================
// HOME SYSTEMS DATABASE
// ============================================================================

const HOME_SYSTEMS = {
  hvac: {
    airConditioner: {
      optimalTemp: [24, 26],    // °C thermostat setting
      efficiency: {
        temp: 'Efficiency drops above 35°C outdoor (can\'t reject heat)',
        humidity: 'High humidity = works harder (latent heat removal)',
        maintenance: 'Clean condenser coils annually. Change filter monthly.',
        sizing: 'Oversized = cools fast but doesn\'t dehumidify. Undersized = runs constantly.'
      },
      tips: [
        'Each degree below 24°C = 6-8% more energy',
        'Programmable thermostat: set higher when away (no more than 5°C swing)',
        'Don\'t turn off completely when away (humidity + recovery energy > savings)',
        'Ceiling fan + AC = raise thermostat 3°C, feel same comfort',
        'Close blinds on south/west windows during day',
        'Pre-cool house before peak electricity rates (super-cooling strategy)'
      ]
    },
    heatPump: {
      optimalTemp: [18, 21],
      efficiency: {
        cold: 'COP drops below -5°C. Auxiliary/emergency heat activates (3x more expensive)',
        defrost: 'Below 5°C, outdoor unit periodically defrosts (temporary efficiency loss)',
        sizing: 'Cold-climate heat pumps work to -25°C. Standard to -10°C.'
      },
      tips: [
        'Don\'t set back at night in cold (recovery uses expensive aux heat)',
        'Set it and forget it. Heat pumps prefer steady temperature.',
        'Clean outdoor unit. Snow/ice/leaves block airflow.',
        'Below -15°C: consider supplemental heat source'
      ]
    },
    furnace: {
      optimalTemp: [18, 21],
      efficiency: {
        afue: 'High-efficiency (95%+ AFUE) vs standard (80%)',
        maintenance: 'Change filter every 1-3 months. Annual professional inspection.',
        ducts: 'Leaky ducts lose 20-30% of heated air. Seal and insulate.'
      },
      tips: [
        'Each degree above 20°C = 3-5% more fuel',
        'Programmable: set back 5-8°C at night/away (saves 10% annually)',
        'Check exhaust vent: blocked by snow = CO backup into house',
        'CO detector: mandatory within 3m of all bedrooms'
      ]
    }
  },
  waterHeater: {
    tank: {
      tempSetting: 49,         // °C (120°F) - safe, efficient
      efficiency: {
        standby: '10-20% of energy is standby heat loss. Insulate tank + pipes.',
        cold: 'Incoming water colder in winter = more energy to heat.',
        usage: 'Showers: 37% of hot water. Laundry: 17%. Dishwasher: 6%.'
      },
      tips: [
        'Insulate first 2m of hot and cold pipes',
        'Set to 49°C (saves 4-8% vs 60°C)',
        'If dishwasher doesn\'t pre-heat, may need 60°C setting',
        'Vacation mode or turn off when away > 3 days'
      ]
    },
    tankless: {
      efficiency: {
        cold: 'Incoming water temp affects ability to reach setpoint',
        flow: 'Too many simultaneous uses = temperature drop'
      },
      tips: [
        'Descale annually (hard water areas more often)',
        'Incoming water filter protects heat exchanger'
      ]
    }
  },
  solar: {
    panels: {
      optimal: {
        irradiance: 'Peak production: clear sky, sun high (10am-3pm)',
        temperature: 'Panels lose 0.3-0.5% efficiency per °C above 25°C',
        cloudCover: '10-25% output under heavy clouds. 50-70% under light clouds.',
        snow: 'Snow covers panels = zero. Steep tilt helps snow slide off.',
        wind: 'Wind cools panels (good) but dust/debris (bad)'
      },
      tips: [
        'Cool, clear, breezy days = highest production',
        'Hot, still days = reduced output (panel temperature 60°C+)',
        'Rain: cleans panels = temporarily reduced but cleaner afterward',
        'Check inverter display/app for daily production tracking',
        'Shade: even partial shade on ONE panel reduces string output'
      ]
    },
    battery: {
      tips: [
        'Charge during off-peak/solar surplus. Discharge during peak rates.',
        'Storm warning: charge to 100% for backup.',
        'Cold: lithium batteries lose 10-20% capacity temporarily.',
        'Hot: battery cooling system uses energy. Keep in conditioned space if possible.'
      ]
    }
  },
  insulation: {
    attic: {
      rValue: 'R-38 to R-60 recommended (climate dependent)',
      tips: [
        'Air seal BEFORE insulating (insulation doesn\'t stop air movement)',
        'Can lights: must be IC-rated before covering with insulation',
        'Attic hatch: insulate and weatherstrip',
        'Ventilation: soffit vents + ridge vent = proper airflow'
      ]
    },
    walls: {
      tips: [
        'Outlet covers on exterior walls: foam gaskets block drafts',
        'Thermal camera or incense stick: find air leaks',
        'Caulk and weatherstrip: ROI in months, not years'
      ]
    },
    windows: {
      tips: [
        'Storm windows: reduce heat loss 25-50%',
        'Window film: reduces solar heat gain in summer',
        'Thermal curtains: insulate at night, open for solar gain during day',
        'Draft stoppers: door sweeps, window seals'
      ]
    }
  },
  appliances: {
    dryer: {
      power: 3000,            // Watts
      cost: '~$0.30-0.50 per load',
      tips: [
        'Line dry: saves 100% of dryer energy',
        'Dryer balls: reduce drying time 25%',
        'Clean lint trap EVERY load (fire hazard + efficiency)',
        'Run at night: cooler house, lower electricity rates'
      ]
    },
    dishwasher: {
      power: 1500,
      tips: [
        'Run full loads only',
        'Air dry vs heated dry: saves 50% of cycle energy',
        'Run at night: less grid demand, lower rates'
      ]
    },
    refrigerator: {
      tips: [
        'Coils: clean every 6 months (dirty = 30% more energy)',
        'Temp: fridge 3-4°C, freezer -18°C (colder wastes energy)',
        'Full freezer = more efficient. Full fridge = less efficient (airflow).',
        'Check door seals: dollar bill test. If slips out = replace gasket.',
        'Hot garage: fridge works 2-3x harder. Consider moving inside.'
      ]
    },
    oven: {
      tips: [
        'Summer: oven heats house. AC works harder. Use microwave/grill outside.',
        'Winter: oven heat helps warm house (efficiency depends on fuel cost)',
        'Convection: cooks 25% faster = uses less energy',
        'Self-clean cycle: uses massive energy. Run sparingly.'
      ]
    }
  }
};

// ============================================================================
// ENERGY COST CALCULATOR
// ============================================================================

function getEnergyCostEstimate(data) {
  const { temp, tempMin, tempMax, humidity, wind, condition } = data;
  const advice = [];
  
  const heatingDegreeDays = Math.max(0, 18 - temp);
  const coolingDegreeDays = Math.max(0, temp - 24);
  
  advice.push("💰 TODAY'S ENERGY COST ESTIMATE:");
  
  if (coolingDegreeDays > 8) {
    advice.push(`🔴 HIGH COOLING COST: ${coolingDegreeDays} cooling degree days`);
    advice.push("• AC will run 8-12+ hours");
    advice.push("• Estimated cost: $3-8/day (varies by home size, efficiency, rates)");
    advice.push("• Peak: 2pm-7pm. Pre-cool before peak rates if on time-of-use.");
  } else if (coolingDegreeDays > 3) {
    advice.push(`🟡 MODERATE COOLING: ${coolingDegreeDays} cooling degree days`);
    advice.push("• AC will cycle on/off");
    advice.push("• Estimated cost: $1-3/day");
  }
  
  if (heatingDegreeDays > 15) {
    advice.push(`🔴 HIGH HEATING COST: ${heatingDegreeDays} heating degree days`);
    advice.push("• Heating will run 12-18+ hours");
    advice.push("• Estimated cost: $5-15/day (varies by fuel, home, efficiency)");
    advice.push("• Heat pump: aux heat may activate = 3x cost increase");
  } else if (heatingDegreeDays > 8) {
    advice.push(`🟡 MODERATE HEATING: ${heatingDegreeDays} heating degree days`);
    advice.push("• Estimated cost: $2-5/day");
  }
  
  if (heatingDegreeDays < 5 && coolingDegreeDays < 3) {
    advice.push("🟢 LOW ENERGY COST: Minimal heating/cooling needed");
    advice.push("• Open windows. Turn HVAC off. Free conditioning!");
    advice.push("• Estimated savings vs extreme day: $3-10");
  }
  
  return advice;
}

// ============================================================================
// PIPE FREEZE CALCULATOR
// ============================================================================

function getPipeFreezeRisk(data) {
  const { temp, tempMin, wind, windChill } = data;
  const advice = [];
  
  if (tempMin < -6 || windChill < -12) {
    advice.push("🚨 PIPE FREEZE DANGER:");
    advice.push(`• Low tonight: ${tempMin}°C. Wind chill: ${windChill.toFixed(0)}°C`);
    advice.push("• Pipes freeze in 2-4 hours at these temperatures");
    advice.push("");
    advice.push("PREVENT BURST PIPES:");
    advice.push("• Let faucets DRIP (cold water) - moving water freezes slower");
    advice.push("• Open cabinet doors under sinks (let warm air circulate)");
    advice.push("• Keep thermostat at 13°C minimum (even if away)");
    advice.push("• Disconnect and drain outdoor hoses");
    advice.push("• Shut off and drain outdoor spigots");
    advice.push("• Insulate exposed pipes (basement, crawlspace, attic)");
    advice.push("• Know where your main water shutoff is!");
    advice.push("");
    advice.push("IF PIPES FREEZE:");
    advice.push("• Turn off main water valve IMMEDIATELY");
    advice.push("• Thaw with hair dryer, heat lamp, space heater (NEVER open flame)");
    advice.push("• Start from faucet end, work toward frozen section");
    advice.push("• Call plumber. Burst pipe = $5000+ damage.");
  } else if (tempMin < 0) {
    advice.push("⚠️ PIPE FREEZE RISK: Low temp near freezing tonight.");
    advice.push("• Insulate exposed pipes. Seal crawlspace vents.");
    advice.push("• Drip faucets if temperature drops below -3°C.");
  }
  
  return advice;
}

// ============================================================================
// VENTILATION & AIR QUALITY ADVISOR
// ============================================================================

function getVentilationAdvice(data) {
  const { temp, humidity, aqi, pollenIndex, condition, wind, tempMin, tempMax } = data;
  const advice = [];
  
  advice.push("🏠 VENTILATION STRATEGY:");
  
  // When to open windows
  if (tempMin >= 15 && tempMax <= 26 && humidity >= 30 && humidity <= 60 && 
      aqi <= 50 && pollenIndex <= 5 && !condition.includes('rain')) {
    advice.push("✅ PERFECT: Open windows 24/7 today!");
    advice.push("• Free cooling, fresh air, zero energy cost");
    advice.push("• Cross-ventilate: open windows on opposite sides of house");
  } else if (temp >= 18 && temp <= 24 && humidity < 65 && aqi < 100) {
    advice.push("🌤️ GOOD ventilation weather. Open windows during warmest hours.");
  }
  
  // Night cooling strategy
  if (tempMin < 20 && tempMax > 28 && humidity < 70) {
    advice.push("🌙 NIGHT COOLING STRATEGY:");
    advice.push(`• Tonight: ${tempMin}°C. Open windows at night.`);
    advice.push("• Use whole-house fan or window fans (blowing OUT upstairs, IN downstairs)");
    advice.push("• Close windows and blinds by 8am to trap cool air");
    advice.push("• Can reduce next day AC usage 50-70%");
  }
  
  // When to keep windows closed
  if (humidity > 70 && temp > 25) {
    advice.push("🚫 KEEP WINDOWS CLOSED: High humidity");
    advice.push("• Opening windows = letting humidity in = AC works harder");
    advice.push("• Dehumidifier more efficient than AC for moisture removal");
  }
  
  if (aqi > 100) {
    advice.push("🚫 KEEP WINDOWS CLOSED: Poor air quality");
    advice.push(`• AQI ${aqi}: outdoor air is unhealthy`);
    advice.push("• Run HVAC on recirculate + MERV 13+ filter");
    advice.push("• Standalone HEPA air purifier for high-risk rooms");
  }
  
  if (pollenIndex > 7) {
    advice.push("🚫 KEEP WINDOWS CLOSED: High pollen");
    advice.push("• Pollen will coat everything inside");
    advice.push("• Use HVAC with good filter. Change clothes after being outside.");
  }
  
  if (condition === 'rain' || condition === 'thunderstorm') {
    advice.push("🌧️ Keep windows closed during rain to prevent water damage.");
  }
  
  // Ceiling fan direction
  if (temp > 24) {
    advice.push("💨 CEILING FANS: Counter-clockwise (summer mode)");
    advice.push("• Creates downdraft = wind chill effect on skin");
    advice.push("• Makes room feel 3-4°C cooler");
    advice.push("• Turn off when leaving room (fans cool people, not rooms)");
  } else if (temp < 18) {
    advice.push("💨 CEILING FANS: Clockwise (winter mode) at low speed");
    advice.push("• Pushes warm air down from ceiling");
    advice.push("• Reduces heating cost 10-15%");
  }
  
  return advice;
}

// ============================================================================
// LAUNDRY & LINE DRYING CALCULATOR
// ============================================================================

function getLaundryAdvice(data) {
  const { temp, humidity, wind, uvIndex, condition, pollenIndex } = data;
  const advice = [];
  
  advice.push("👕 LAUNDRY & LINE DRYING:");
  
  if (!condition.includes('rain') && humidity < 70 && temp > 15 && wind > 3) {
    const dryTime = humidity < 40 ? '1-2 hours' : humidity < 60 ? '2-3 hours' : '3-4 hours';
    advice.push(`✅ GREAT line-drying weather! Dry in ~${dryTime}.`);
    advice.push("• Wind: natural dryer. UV: natural sanitizer/bleach.");
    advice.push("• Saving: ~$0.40-0.60 vs electric dryer per load");
    advice.push("• Bonus: not adding heat to house (AC doesn't fight dryer)");
    
    if (uvIndex > 5) {
      advice.push("• ☀️ High UV: whites will bleach naturally. Delicates in shade.");
    }
    if (pollenIndex > 6) {
      advice.push("• ⚠️ High pollen: pollen sticks to wet clothes. Allergy alert.");
    }
    if (wind > 20) {
      advice.push("• 💨 Windy: use extra clothespins. Light items may blow away.");
    }
  } else if (condition.includes('rain')) {
    advice.push("🌧️ Rain: use dryer. Run at night for lower rates + less house heat.");
  } else if (humidity > 70) {
    advice.push("💧 Too humid: clothes won't dry properly. May smell musty.");
    advice.push("• Use dryer or indoor rack with dehumidifier running.");
  } else if (temp < 10) {
    advice.push("❄️ Too cold: clothes will freeze (freeze-drying works but slow).");
    advice.push("• Use indoor rack near heat source. Dryer as backup.");
  }
  
  return advice;
}

// ============================================================================
// GARDEN & LAWN WATERING
// ============================================================================

function getWateringAdvice(data) {
  const { temp, humidity, precipitation, wind, uvIndex, condition, tempMax } = data;
  const advice = [];
  
  advice.push("🌱 GARDEN WATERING:");
  
  if (precipitation > 10) {
    advice.push("🌧️ SKIP WATERING: Nature is doing it for you.");
    advice.push(`• ${precipitation}mm rain = more than enough for most gardens`);
    advice.push("• Check rain gauge. Deep watering better than frequent shallow.");
  } else if (precipitation > 3) {
    advice.push("💧 Light rain: supplement watering for containers/hanging baskets only.");
  } else {
    if (tempMax > 30) {
      advice.push("🔥 HOT DAY: Water deeply in early morning (before 7am)");
      advice.push("• Morning: less evaporation. Evening: fungal disease risk.");
      advice.push("• Containers may need water 2x today (morning + late afternoon)");
      advice.push("• Mulch: 5-8cm layer reduces evaporation 70%");
    } else {
      advice.push("• Best time: early morning (5-9am)");
      advice.push("• Avoid midday watering (50% evaporates before soaking in)");
    }
    
    if (wind > 20) {
      advice.push("• Wind: sprinkler water drifts. Water with soaker hose or hand-water.");
    }
    if (humidity < 30 && temp > 25) {
      advice.push("• Dry + hot: plants lose water fast. Check soil moisture by 2pm.");
    }
  }
  
  // Lawn specific
  advice.push("");
  advice.push("🌿 LAWN:");
  if (precipitation < 5 && tempMax > 28) {
    advice.push("• Water deeply 1x/week (2.5cm). Frequent shallow = weak roots.");
    advice.push("• Let grass go dormant in extreme heat (it'll recover when cool)");
  }
  
  return advice;
}

// ============================================================================
// SMART HOME OPTIMIZATION
// ============================================================================

function getSmartHomeAdvice(data) {
  const { temp, tempMin, tempMax, sunPosition, humidity, condition } = data;
  const advice = [];
  
  advice.push("🤖 SMART HOME OPTIMIZATION:");
  
  // Smart thermostat
  if (tempMax > 28 && tempMin < 20) {
    advice.push("• Pre-cool house before 2pm peak rates");
    advice.push("• Set thermostat higher during 2-7pm peak");
    advice.push("• Use eco+ or similar demand response if enrolled");
  }
  
  // Smart blinds
  if (tempMax > 25 && sunPosition !== 'night') {
    advice.push("• Close south/west smart blinds during day (blocks solar gain)");
    advice.push("• Open at night for radiant cooling");
  }
  
  // Smart plugs
  advice.push("• Schedule major loads for off-peak hours");
  advice.push("• Kill standby power (vampire loads = 5-10% of bill)");
  
  // EV charging
  advice.push("• EV: charge during solar peak (10am-3pm) or off-peak night rates");
  
  return advice;
}

// ============================================================================
// MAIN ENERGY HOME ADVICE FUNCTION
// ============================================================================

export const getEnergyHomeAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, humidity, wind, condition, conditionCode, 
    uvIndex, aqi, visibility, city, dewPoint, tempMin, tempMax,
    precipitation, pressure, pollenIndex, sunrise, sunset
  } = data;
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const cloudCover = mapWeatherCode(conditionCode);
  const season = getSeason();
  const timeOfDay = getTimeOfDay();
  const sunPosition = getSunPosition(data);
  
  const energyCost = getEnergyCostEstimate(data);
  const pipeFreeze = getPipeFreezeRisk(data);
  const ventilationAdvice = getVentilationAdvice(data);
  const laundryAdvice = getLaundryAdvice(data);
  const wateringAdvice = getWateringAdvice(data);
  const smartHome = getSmartHomeAdvice(data);

  let verdict = [];
  let heating = [];
  let cooling = [];
  let ventilation = [];
  let appliances = [];
  let solar = [];
  let savings = [];
  let warnings = [];
  let maintenance = [];

  // ========================================================================
  // TEMPERATURE-BASED HVAC VERDICT
  // ========================================================================
  
  if (effectiveTemp > 32) {
    verdict.push("🔥 EXTREME HEAT: AC essential. High energy cost today.");
    cooling.push(`Heat index ${heatIndex.toFixed(0)}°C. AC will run continuously.`);
    cooling.push("• Set AC to 25-26°C. Each degree lower = 6% more energy.");
    cooling.push("• AC may struggle to maintain setpoint. That's normal in extreme heat.");
    cooling.push("• Don't turn off AC when away. Recovery energy > savings.");
    warnings.push("Peak electricity rates 2pm-7pm. Pre-cool before noon.");
    savings.push("Close all blinds/curtains. Solar heat gain = 40% of AC load.");
    savings.push("Avoid oven, dryer, dishwasher 2pm-7pm (adds heat + peak rates).");
    appliances.push("Ceiling fans ON. Makes 26°C feel like 23°C. 98% less energy than AC.");
  } else if (effectiveTemp > 28) {
    verdict.push("☀️ HOT: AC needed. Moderate-high energy cost.");
    cooling.push("• AC will cycle normally. Set to 24-26°C.");
    cooling.push("• Use fans + AC. Raise thermostat 2-3°C, feel same comfort.");
  } else if (effectiveTemp > 24) {
    verdict.push("🌤️ WARM: AC optional. Fans may suffice.");
    cooling.push("• Try fans first. Switch to AC if humidity >60%.");
    savings.push("• Open windows at night. Close before 9am. Free cooling.");
  } else if (effectiveTemp >= 18 && effectiveTemp <= 24) {
    verdict.push("✅ PERFECT: No heating or cooling needed today!");
    savings.push("• Turn HVAC OFF. Open windows. Energy cost near zero.");
    savings.push("• Best day of the month for your energy bill.");
  } else if (effectiveTemp >= 10) {
    verdict.push("🍂 COOL: Light heating may be needed.");
    heating.push(`• Feels like ${Math.round(effectiveTemp)}°C. Sweater first, heat second.`);
    heating.push("• Set thermostat to 19-20°C. Lower at night (use warm bedding).");
    savings.push("• Open curtains on sunny side. Free solar heat.");
  } else if (effectiveTemp >= 0) {
    verdict.push("❄️ COLD: Heating required. Moderate energy cost.");
    heating.push(`• Wind chill ${windChill.toFixed(0)}°C. Heat loss increases.`);
    heating.push("• Set thermostat 20-21°C. Each degree higher = 3-5% more fuel.");
    savings.push("• Close curtains at night. 25% heat loss through windows.");
  } else {
    verdict.push("🥶 FREEZING: Maximum heating. High energy cost.");
    heating.push(`• Extreme cold ${windChill.toFixed(0)}°C. Heating runs 18+ hours.`);
    heating.push("• Set thermostat 20°C. Maintain steady temp (recovery too expensive).");
    warnings.push("Pipes may freeze. See pipe freeze warning below.");
  }

  // ========================================================================
  // HUMIDITY MANAGEMENT
  // ========================================================================
  
  if (humidity > 75) {
    ventilation.push("💧 HIGH HUMIDITY: Moisture management critical.");
    ventilation.push("• Keep windows CLOSED (outdoor air is humid)");
    appliances.push("• Dehumidifier: uses 300W vs AC 3500W. Much cheaper for moisture removal.");
    appliances.push("• Run bathroom exhaust fans 20 min after showering");
    appliances.push("• Run range hood when cooking (moisture + particulates)");
    warnings.push("Mold risk increases above 60% indoor humidity. Keep <50%.");
    savings.push("• AC + dehumidifier = AC runs less. Net energy savings in humid climates.");
  } else if (humidity < 25) {
    ventilation.push("🏜️ DRY AIR: Add moisture for comfort + savings.");
    ventilation.push("• Humidifier: makes 20°C feel like 22°C. Saves heating cost.");
    appliances.push("• Whole-house humidifier or room units. Target 35-45%.");
    warnings.push("Wood floors, furniture, musical instruments: may crack. Monitor.");
  }

  // ========================================================================
  // SOLAR GENERATION
  // ========================================================================
  
  if (cloudCover < 20) {
    solar.push("☀️ EXCELLENT SOLAR: Clear sky. 95-100% output.");
    solar.push("• Peak generation: 10am-3pm");
    solar.push("• Run major appliances during solar peak");
    solar.push("• Charge EV, Powerwall, run dishwasher, laundry, pool pump");
    if (effectiveTemp > 28) {
      solar.push("• Solar covers 100% of AC load midday. Zero grid cost for cooling.");
    }
  } else if (cloudCover < 50) {
    solar.push("🌤️ GOOD SOLAR: 70-90% output expected.");
    solar.push("• Still worth shifting loads to daylight hours");
  } else if (cloudCover < 80) {
    solar.push("⛅ MODERATE SOLAR: 40-60% output. Some clouds.");
    solar.push("• Heavy loads may draw from grid. Prioritize essential appliances.");
  } else {
    solar.push("☁️ POOR SOLAR: 10-25% output. Heavy cloud cover.");
    solar.push("• Battery won't fully charge from solar today");
    solar.push("• If on time-of-use: charge battery from grid during off-peak");
  }
  
  if (isRaining) {
    solar.push("🌧️ Rain: immediate drop in generation. But rain cleans panels!");
    solar.push("• After rain: panels cleaner = 3-5% efficiency gain for days.");
  }
  
  if (temp > 30) {
    solar.push("🔥 Hot panels lose efficiency (-0.4% per °C above 25°C)");
    solar.push(`• Panel temp ~${temp + 25}°C. Output reduced ~${Math.round((temp - 25) * 0.4)}%.`);
  }

  // ========================================================================
  // APPLIANCE TIMING
  // ========================================================================
  
  appliances.push("⚡ APPLIANCE TIMING (for lowest cost):");
  if (solar && cloudCover < 50) {
    appliances.push("• BEST: 10am-3pm (solar peak - free electricity)");
  }
  appliances.push("• GOOD: after 9pm (off-peak rates)");
  appliances.push("• AVOID: 2pm-7pm (peak rates + grid demand highest)");
  
  if (effectiveTemp > 28) {
    appliances.push("• Oven/stove: use microwave, slow cooker, or grill outside");
    appliances.push("• Cooking heat inside = AC runs 15-20% longer");
  }
  
  if (isRaining) {
    appliances.push("• Surge protector: unplug sensitive electronics if lightning");
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🏠 Home energy report:",
    "⚡ HVAC forecast:",
    "💰 Energy cost check:",
    "🌡️ Home efficiency tips:",
    "☀️ Zephye's energy advisory:",
    "🔌 Home systems weather:",
    "🌿 Eco-home conditions:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Verdict
  response += `📊 OVERALL: ${verdict.join(' ')}\n\n`;
  
  // Conditions
  response += `🌡️ CURRENT CONDITIONS:\n`;
  response += `• Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `• Today's range: ${tempMin}°C - ${tempMax}°C\n`;
  response += `• Humidity: ${humidity}% (${humidity > 60 ? 'HIGH' : humidity < 30 ? 'DRY' : 'IDEAL'})\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• Cloud cover: ${cloudCover}%\n`;
  if (aqi > 50) response += `• AQI: ${aqi}\n`;
  response += '\n';
  
  // Energy Cost
  energyCost.forEach(e => response += `${e}\n`);
  response += '\n';
  
  // Heating
  if (heating.length > 0) {
    response += `🔥 HEATING:\n`;
    heating.forEach(h => response += `${h}\n`);
    response += '\n';
  }
  
  // Cooling
  if (cooling.length > 0) {
    response += `❄️ COOLING:\n`;
    cooling.forEach(c => response += `${c}\n`);
    response += '\n';
  }
  
  // Ventilation
  if (ventilation.length > 0) {
    ventilation.forEach(v => response += `${v}\n`);
    response += '\n';
  }
  
  // Solar
  if (solar.length > 0) {
    response += `☀️ SOLAR:\n`;
    solar.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Appliances
  if (appliances.length > 0) {
    appliances.forEach(a => response += `${a}\n`);
    response += '\n';
  }
  
  // Savings Tips
  if (savings.length > 0) {
    response += `💰 SAVINGS:\n`;
    savings.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Pipe Freeze
  if (pipeFreeze.length > 0) {
    pipeFreeze.forEach(p => response += `${p}\n`);
    response += '\n';
  }
  
  // Laundry
  if (laundryAdvice.length > 0) {
    laundryAdvice.forEach(l => response += `${l}\n`);
    response += '\n';
  }
  
  // Watering
  if (wateringAdvice.length > 0) {
    wateringAdvice.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Smart Home
  if (smartHome.length > 0) {
    smartHome.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Final
  response += `💡 BOTTOM LINE:\n`;
  if (effectiveTemp >= 18 && effectiveTemp <= 24 && humidity >= 30 && humidity <= 55) {
    response += `FREE COMFORT DAY! Turn off HVAC. Open windows. Zero energy cost.\n`;
    response += `Estimated savings vs extreme day: $5-15.\n`;
  } else if (effectiveTemp > 32) {
    response += `Expensive cooling day. Use every efficiency trick. Avoid peak hours.\n`;
  } else {
    response += `Moderate energy day. Smart choices save 10-30% on today's bill.\n`;
  }
  
  const energyWisdom = [
    "The cheapest energy is the energy you don't use.",
    "Energy efficiency is the world's 'first fuel'.",
    "A well-insulated house is a happy wallet.",
    "Solar panels: turning sunshine into savings since 1954.",
    "Every degree on your thermostat matters. Every. Single. One.",
    "The greenest kilowatt-hour is the one never generated."
  ];
  response += `\n💡 ${random(energyWisdom)}`;

  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getEnergyCostEstimate, 
  getPipeFreezeRisk, 
  getVentilationAdvice, 
  getLaundryAdvice, 
  getWateringAdvice, 
  getSmartHomeAdvice 
};

export default getEnergyHomeAdvice;
export default getEnergyHomeAdvice;
