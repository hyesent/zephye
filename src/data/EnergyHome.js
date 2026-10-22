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
  // HVAC & COMFORT
  "Should I run AC today?",
  "Will my heating bill be high?",
  "Is it good weather to air out the house?",
  "Should I close windows?",
  "Do I need to run a dehumidifier?",
  "Should I use fans or AC?",
  "Is it cheap to heat the house today?",
  "Should I pre-cool my house before peak rates?",
  "Will my heat pump be efficient today?",
  "Should I use the whole-house fan tonight?",
  "Is it good attic fan weather?",
  "Should I close my crawl space vents?",
  "Will my basement dehumidifier run all day?",
  "Will my smart thermostat save money today?",
  "Should I override my thermostat schedule?",
  "Is it cheaper to heat or cool now or later?",
  "Will opening windows save energy?",
  "Should I use the fireplace tonight?",
  "Is it safe to use a space heater?",
  "Will my pipes freeze tonight?",
  "Should I drip my faucets?",
  "Is my water heater working harder?",
  "Should I turn down my water heater temperature?",
  "Will my fridge use more energy today?",
  "Should I clean my AC condenser?",
  "Is my AC working efficiently?",
  "Should I change my air filter?",
  "Will ceiling fans help today?",
  "Which direction should my ceiling fan spin?",
  
  // SOLAR & RENEWABLES
  "Will solar panels work well today?",
  "Is it a good day to charge my EV from solar?",
  "Will my wind turbine generate today?",
  "Should I switch to time-of-use plan?",
  "Is demand response event likely?",
  "Should I charge my battery from grid?",
  "Will my Powerwall last through peak?",
  "Should I go off-grid today?",
  "Is it a good net metering day?",
  "Will I export more than I use?",
  "Should I clean my solar panels today?",
  "Is it good solar panel cleaning weather?",
  "Will my solar production be high?",
  "Should I run major appliances now?",
  "What's the best time for laundry?",
  "When should I run the dishwasher?",
  "Is it cheaper to cook with gas or electric?",
  "Should I use the slow cooker outside?",
  "Can I solar cook today?",
  
  // APPLIANCES & LAUNDRY
  "Should I run the dryer or hang clothes outside?",
  "Should I run the pool pump now?",
  "Is it a good day to run the dishwasher?",
  "Should I delay laundry until tomorrow?",
  "Will my dryer work efficiently today?",
  "Should I line dry clothes today?",
  "What is the best time to run appliances?",
  "Should I use the oven today?",
  "Will cooking heat affect my AC?",
  
  // HOME MAINTENANCE
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
  "Should I get a blower door test today?"
];

// ============================================================================
// ENHANCED HOME SYSTEMS DATABASE
// ============================================================================

const HOME_SYSTEMS = {
  hvac: {
    airConditioner: {
      optimalTemp: [24, 26],
      efficiency: {
        temp: 'Efficiency drops above 35°C outdoor (can\'t reject heat effectively)',
        humidity: 'High humidity equals works harder for latent heat removal',
        maintenance: 'Clean condenser coils annually. Change filter monthly.',
        sizing: 'Oversized cools fast but doesn\'t dehumidify. Undersized runs constantly.'
      },
      tips: [
        'Each degree below 24°C equals 6-8 percent more energy consumption',
        'Programmable thermostat: set higher when away by no more than 5°C swing',
        'Do not turn off completely when away (humidity and recovery energy exceed savings)',
        'Ceiling fan plus AC allows raising thermostat 3°C with same comfort',
        'Close blinds on south and west facing windows during day',
        'Pre-cool house before peak electricity rates using super-cooling strategy',
        'SEER rating: 14 SEER uses 30% less energy than 10 SEER. 20 SEER uses 50% less.'
      ]
    },
    heatPump: {
      optimalTemp: [18, 21],
      efficiency: {
        cold: 'COP drops below -5°C. Auxiliary or emergency heat activates at 3x cost',
        defrost: 'Below 5°C, outdoor unit periodically defrosts causing temporary efficiency loss',
        sizing: 'Cold-climate heat pumps work to -25°C. Standard units work to -10°C.',
        cop: 'COP 3.5 at 8°C equals 350% efficiency. COP 2.0 at -10°C equals 200% efficiency.'
      },
      tips: [
        'Do not set back at night in cold weather (recovery uses expensive aux heat)',
        'Set it and forget it. Heat pumps prefer steady temperature settings.',
        'Clean outdoor unit. Snow, ice, and leaves block airflow.',
        'Below -15°C: consider supplemental heat source',
        'Check refrigerant charge annually - undercharge or overcharge reduces efficiency 20-30%'
      ]
    },
    furnace: {
      optimalTemp: [18, 21],
      efficiency: {
        afue: 'High-efficiency 95%+ AFUE versus standard 80% AFUE',
        maintenance: 'Change filter every 1-3 months. Annual professional inspection required.',
        ducts: 'Leaky ducts lose 20-30% of heated air. Seal and insulate.',
        fuelCost: 'Natural gas cheapest. Propane 2x gas. Oil 3x gas. Electric resistance 4x gas.'
      },
      tips: [
        'Each degree above 20°C equals 3-5 percent more fuel consumption',
        'Programmable: set back 5-8°C at night or away (saves 10% annually)',
        'Check exhaust vent: blocked by snow causes carbon monoxide backup into house',
        'Carbon monoxide detector mandatory within 3 meters of all bedrooms',
        'Annual tune-up saves 5-10% on fuel costs'
      ]
    }
  },
  waterHeater: {
    tank: {
      tempSetting: 49,
      efficiency: {
        standby: '10-20 percent of energy is standby heat loss. Insulate tank and pipes.',
        cold: 'Incoming water colder in winter requires more energy to heat.',
        usage: 'Showers account for 37% of hot water. Laundry 17%. Dishwasher 6%.',
        recovery: 'Gas recovers faster than electric. Tankless provides unlimited.',
        firstHour: 'Residential tanks provide 60-80 gallons first hour. Check your needs.'
      },
      tips: [
        'Insulate first 2 meters of hot and cold pipes',
        'Set to 49°C saves 4-8% compared to 60°C setting',
        'If dishwasher doesn\'t pre-heat, may need 60°C setting',
        'Vacation mode or turn off when away more than 3 days',
        'Drain 1 gallon annually to remove sediment (improves efficiency 10-15%)',
        'Tank lifespan: 10-15 years. Replace with heat pump water heater for 70% savings.'
      ]
    },
    tankless: {
      efficiency: {
        cold: 'Incoming water temperature affects ability to reach setpoint',
        flow: 'Too many simultaneous uses causes temperature drop',
        condensing: 'Condensing units 95%+ efficient versus standard 80-85%'
      },
      tips: [
        'Descale annually (hard water areas need more frequent)',
        'Incoming water filter protects heat exchanger',
        'Flow rate: 2-5 GPM typical. Older homes may have flow restrictions.',
        'Point-of-use tankless for remote bathrooms saves water waiting time.'
      ]
    }
  },
  solar: {
    panels: {
      optimal: {
        irradiance: 'Peak production occurs with clear sky, sun high from 10am to 3pm',
        temperature: 'Panels lose 0.3-0.5% efficiency per °C above 25°C',
        cloudCover: '10-25% output under heavy clouds. 50-70% output under light clouds.',
        snow: 'Snow covers panels resulting in zero production. Steep tilt helps snow slide off.',
        wind: 'Wind cools panels which is beneficial but dust and debris are negative factors',
        orientation: 'South facing is optimal in northern hemisphere. West for afternoon peak.'
      },
      tips: [
        'Cool, clear, breezy days provide highest production',
        'Hot, still days result in reduced output (panel temperature reaches 60°C+)',
        'Rain cleans panels causing temporary reduction but cleaner afterward',
        'Check inverter display or app for daily production tracking',
        'Shade: even partial shade on ONE panel reduces string output significantly',
        'Microinverters or optimizers reduce shading losses',
        'Production degrades 0.5% per year. Monocrystalline degrades slower.'
      ]
    },
    battery: {
      tips: [
        'Charge during off-peak or solar surplus. Discharge during peak rates.',
        'Storm warning: charge to 100% for backup capacity',
        'Cold: lithium batteries lose 10-20% capacity temporarily',
        'Hot: battery cooling system uses energy. Keep in conditioned space if possible.',
        'Depth of discharge: 80% recommended for daily cycling (10-90% SOC)',
        'Warranty: check cycles guarantee. Typically 10 years or 6000+ cycles.'
      ]
    }
  },
  insulation: {
    attic: {
      rValue: 'R-38 to R-60 recommended depending on climate zone',
      tips: [
        'Air seal BEFORE insulating because insulation does not stop air movement',
        'Recessed lights: must be IC-rated before covering with insulation',
        'Attic hatch: insulate and weatherstrip around perimeter',
        'Ventilation: soffit vents plus ridge vent equals proper airflow',
        'Blown-in fiberglass: R-3 per inch. Cellulose: R-3.5 per inch. Spray foam: R-6 per inch.'
      ]
    },
    walls: {
      tips: [
        'Outlet covers on exterior walls: foam gaskets block drafts effectively',
        'Thermal camera or incense stick: find air leaks quickly',
        'Caulk and weatherstrip: return on investment in months, not years',
        'Blown-in wall insulation: drill holes, fill cavities, patch',
        'Insulated siding: adds R-2 to R-5 to exterior walls'
      ]
    },
    windows: {
      tips: [
        'Storm windows: reduce heat loss 25-50% at fraction of replacement cost',
        'Window film: reduces solar heat gain in summer by 40-60%',
        'Thermal curtains: insulate at night, open for solar gain during day',
        'Draft stoppers: door sweeps and window seals block drafts',
        'Double pane vs single: reduces heat loss 50%. Triple pane 70%.',
        'Low-E coating: reduces UV fading and solar heat gain'
      ]
    }
  },
  appliances: {
    dryer: {
      power: 3000,
      cost: 'Approximately $0.30-0.50 per load',
      tips: [
        'Line drying saves 100% of dryer energy',
        'Dryer balls reduce drying time by 25%',
        'Clean lint trap EVERY load (fire hazard and efficiency improvement)',
        'Run at night: cooler house, lower electricity rates',
        'Moisture sensor stops when dry (save 15% vs timed dry)',
        'Clean exhaust duct annually: lint buildup causes fires and 30% efficiency loss'
      ]
    },
    dishwasher: {
      power: 1500,
      tips: [
        'Run full loads only to maximize efficiency',
        'Air dry vs heated dry: saves 50% of cycle energy',
        'Run at night: less grid demand and lower rates',
        'Skip pre-rinse: modern dishwashers handle food residue',
        'Energy Star: uses 12% less energy and 30% less water than standard'
      ]
    },
    refrigerator: {
      tips: [
        'Coils: clean every 6 months (dirty coils cause 30% more energy use)',
        'Temperature: fridge 3-4°C, freezer -18°C (colder wastes energy)',
        'Full freezer is more efficient. Full fridge is less efficient (airflow restriction).',
        'Check door seals: dollar bill test. If it slips out easily, replace gasket.',
        'Hot garage: fridge works 2-3x harder. Consider moving inside.',
        'Location: away from oven, direct sun, or heat sources',
        'Age: fridges over 10 years old use 2x more energy than new Energy Star models.'
      ]
    },
    oven: {
      tips: [
        'Summer: oven heats the house. AC works harder. Use microwave or grill outside.',
        'Winter: oven heat helps warm house (efficiency depends on fuel cost)',
        'Convection: cooks 25% faster and uses less energy',
        'Self-clean cycle uses massive energy. Run sparingly (once or twice per year).',
        'Use glass or ceramic dishes: cook at 25°F lower temperature',
        'Keep door closed: each opening drops temperature 25°F (takes energy to recover)'
      ]
    },
    washingMachine: {
      tips: [
        'Cold water wash: saves 90% of heating energy (heating water is 90% of load cost)',
        'High efficiency: uses 40% less water than standard',
        'Full loads only: maximize per-load efficiency',
        'Quick wash: uses 50% less energy and water (for lightly soiled clothes)',
        'Spin speed: higher spin removes more water = less dryer time'
      ]
    },
    poolPump: {
      tips: [
        'Variable speed pump: uses 50-80% less energy than single speed',
        'Run during solar peak (10am-3pm) if on solar to use free energy',
        'Run at night for off-peak rates (but evaporation cooling if pool heated)',
        'Clean skimmer and pump basket weekly (restricted flow = wasted energy)',
        'Size pump properly: oversized pump wastes energy, undersized doesn\'t circulate'
      ]
    }
  }
};

// ============================================================================
// ENHANCED ENERGY COST CALCULATOR
// ============================================================================

function getEnergyCostEstimate(data) {
  const { temp, tempMin, tempMax, humidity, wind, condition, city } = data;
  const advice = [];
  let heatingCost = 0;
  let coolingCost = 0;
  
  const heatingDegreeDays = Math.max(0, 18 - temp);
  const coolingDegreeDays = Math.max(0, temp - 24);
  
  advice.push("ENERGY COST ESTIMATE:");
  
  // Heating cost estimation
  if (heatingDegreeDays > 20) {
    heatingCost = Math.round((heatingDegreeDays / 10) * 4.50);
    advice.push(`  Heating: HIGH (${heatingDegreeDays} heating degree days)`);
    advice.push(`  Estimated heating cost: $${heatingCost.toFixed(2)}-${(heatingCost * 1.5).toFixed(2)}/day`);
    advice.push("  Heating will run 16-20+ hours continuously");
    advice.push("  Heat pumps: aux/emergency heat may activate, tripling costs");
  } else if (heatingDegreeDays > 12) {
    heatingCost = Math.round((heatingDegreeDays / 10) * 3.00);
    advice.push(`  Heating: MODERATE (${heatingDegreeDays} heating degree days)`);
    advice.push(`  Estimated heating cost: $${heatingCost.toFixed(2)}-${(heatingCost * 1.3).toFixed(2)}/day`);
    advice.push("  Heating will run 12-16 hours");
  } else if (heatingDegreeDays > 5) {
    heatingCost = Math.round((heatingDegreeDays / 10) * 1.50);
    advice.push(`  Heating: LOW (${heatingDegreeDays} heating degree days)`);
    advice.push(`  Estimated heating cost: $${heatingCost.toFixed(2)}-${(heatingCost * 1.3).toFixed(2)}/day`);
    advice.push("  Heating cycles on/off periodically");
  }
  
  // Cooling cost estimation
  if (coolingDegreeDays > 10) {
    coolingCost = Math.round((coolingDegreeDays / 10) * 3.00);
    advice.push(`  Cooling: HIGH (${coolingDegreeDays} cooling degree days)`);
    advice.push(`  Estimated cooling cost: $${coolingCost.toFixed(2)}-${(coolingCost * 1.5).toFixed(2)}/day`);
    advice.push("  AC will run 8-12+ hours continuously");
    advice.push("  Peak demand: 2pm-7pm. Pre-cool before peak rates");
  } else if (coolingDegreeDays > 5) {
    coolingCost = Math.round((coolingDegreeDays / 10) * 1.80);
    advice.push(`  Cooling: MODERATE (${coolingDegreeDays} cooling degree days)`);
    advice.push(`  Estimated cooling cost: $${coolingCost.toFixed(2)}-${(coolingCost * 1.3).toFixed(2)}/day`);
    advice.push("  AC will cycle on/off throughout day");
  } else if (coolingDegreeDays > 2) {
    coolingCost = Math.round((coolingDegreeDays / 10) * 0.80);
    advice.push(`  Cooling: LOW (${coolingDegreeDays} cooling degree days)`);
    advice.push(`  Estimated cooling cost: $${coolingCost.toFixed(2)}-${(coolingCost * 1.3).toFixed(2)}/day`);
  }
  
  // Total and comparison
  const totalCost = heatingCost + coolingCost;
  if (totalCost > 5) {
    advice.push(`  TOTAL ESTIMATE: $${totalCost.toFixed(2)}-${(totalCost * 1.5).toFixed(2)}/day`);
    advice.push("  This is a HIGH energy cost day. Use efficiency strategies.");
  } else if (totalCost > 2) {
    advice.push(`  TOTAL ESTIMATE: $${totalCost.toFixed(2)}-${(totalCost * 1.3).toFixed(2)}/day`);
    advice.push("  MODERATE energy cost day. Smart choices help.");
  } else if (totalCost < 0.50) {
    advice.push("  TOTAL ESTIMATE: Less than $1/day");
    advice.push("  GREAT energy cost day. Minimal HVAC needed.");
  }
  
  // Fuel comparison for heating
  if (heatingDegreeDays > 5) {
    advice.push("");
    advice.push("HEATING FUEL COMPARISON (per million BTU):");
    advice.push("  • Electric resistance: $32-38");
    advice.push("  • Heat pump (COP 3.0): $11-13");
    advice.push("  • Natural gas: $10-14");
    advice.push("  • Propane: $24-30");
    advice.push("  • Oil: $28-34");
    advice.push("  • Wood pellets: $15-18");
  }
  
  return advice;
}

// ============================================================================
// ENHANCED PIPE FREEZE CALCULATOR
// ============================================================================

function getPipeFreezeRisk(data) {
  const { temp, tempMin, wind, windChill, condition } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'none';
  
  // Calculate effective temperature (including wind chill on exposed pipes)
  const effectiveTemp = temp <= 10 ? Math.min(temp, windChill) : temp;
  const overnightTemp = tempMin || temp - 3;
  
  if (overnightTemp < -10 || windChill < -15) {
    riskLevel = 'extreme';
    warnings.push("EXTREME PIPE FREEZE DANGER");
    advice.push("PIPE FREEZE WARNING:");
    advice.push(`  Overnight low: ${overnightTemp}°C. Wind chill: ${Math.round(windChill)}°C`);
    advice.push("  Pipes can freeze in 1-2 hours at these temperatures");
    advice.push("");
    advice.push("IMMEDIATE ACTION REQUIRED:");
    advice.push("  • Let ALL faucets DRIP (cold water) at a stream the width of a pencil");
    advice.push("  • Open ALL cabinet doors under sinks for warm air circulation");
    advice.push("  • Keep thermostat at 16°C minimum (even if away)");
    advice.push("  • Disconnect and drain ALL outdoor hoses");
    advice.push("  • Shut off and drain outdoor spigots (if possible)");
    advice.push("  • Insulate ALL exposed pipes (basement, crawlspace, attic)");
    advice.push("  • Know where your main water shutoff valve is located");
    advice.push("  • Check on elderly neighbors who may not have heat");
    
  } else if (overnightTemp < -6 || windChill < -10) {
    riskLevel = 'high';
    warnings.push("HIGH PIPE FREEZE RISK");
    advice.push("PIPE FREEZE RISK:");
    advice.push(`  Overnight low: ${overnightTemp}°C. Wind chill: ${Math.round(windChill)}°C`);
    advice.push("  Pipes can freeze in 3-6 hours at these temperatures");
    advice.push("");
    advice.push("PREVENTIVE ACTIONS:");
    advice.push("  • Drip faucets (cold water) when temperatures drop below -3°C");
    advice.push("  • Open cabinet doors under sinks for warm air flow");
    advice.push("  • Keep thermostat at 13°C minimum (even if away)");
    advice.push("  • Insulate exposed pipes in cold areas");
    advice.push("  • Seal drafts in crawlspace and attic areas");
    advice.push("  • Remove hoses from outdoor spigots");
    
  } else if (overnightTemp < 0) {
    riskLevel = 'moderate';
    advice.push("PIPE FREEZE RISK: Temperatures below freezing tonight.");
    advice.push(`  Overnight low: ${overnightTemp}°C`);
    advice.push("  Insulate exposed pipes. Seal crawlspace vents.");
    advice.push("  Drip faucets if temperature drops below -3°C.");
    
  } else if (overnightTemp < 3) {
    riskLevel = 'low';
    advice.push("  Near-freezing tonight. Watch for frost on exposed pipes.");
    advice.push("  No action needed unless pipes are exposed and uninsulated.");
  }
  
  if (riskLevel !== 'none') {
    advice.push("");
    advice.push("IF PIPES FREEZE:");
    advice.push("  1. Turn off main water valve IMMEDIATELY");
    advice.push("  2. Thaw with hair dryer, heat lamp, or space heater");
    advice.push("  3. NEVER use open flame (torch, propane, blowtorch) - fire risk");
    advice.push("  4. Start from faucet end, work toward frozen section");
    advice.push("  5. Call plumber if you cannot locate freeze point");
    advice.push("  6. Burst pipe = $5,000+ damage. Insurance may or may not cover.");
  }
  
  return { advice, warnings, riskLevel };
}

// ============================================================================
// ENHANCED VENTILATION & AIR QUALITY ADVISOR
// ============================================================================

function getVentilationAdvice(data) {
  const { temp, humidity, aqi, pollenIndex, condition, wind, tempMin, tempMax, dewPoint } = data;
  const advice = [];
  const warnings = [];
  let strategy = 'none';
  
  advice.push("HOME VENTILATION STRATEGY:");
  
  // Check for ideal conditions
  const tempIdeal = temp >= 18 && temp <= 24;
  const humidityIdeal = humidity >= 30 && humidity <= 60;
  const aqiGood = !aqi || aqi <= 50;
  const pollenLow = !pollenIndex || pollenIndex <= 5;
  const noRain = condition !== 'rain' && condition !== 'thunderstorm' && condition !== 'drizzle';
  
  if (tempIdeal && humidityIdeal && aqiGood && pollenLow && noRain && wind < 15) {
    strategy = 'perfect';
    advice.push("  PERFECT CONDITIONS: Open windows 24 hours today!");
    advice.push("  • Free cooling, fresh air, zero energy cost");
    advice.push("  • Cross-ventilate: open windows on opposite sides of house");
    advice.push("  • Use whole-house fan for rapid air exchange (if installed)");
    advice.push("  • This is the ideal day for indoor air quality");
    
  } else if (temp >= 16 && temp <= 26 && humidity >= 25 && humidity <= 65 && aqiGood && pollenLow && noRain) {
    strategy = 'good';
    advice.push("  GOOD CONDITIONS: Open windows during warmest hours (10am-4pm)");
    advice.push("  • Close at night if temperatures drop below 16°C");
    advice.push("  • Use fans to increase air movement");
    
  } else if (tempMin < 20 && tempMax > 28 && humidity < 70 && aqiGood) {
    strategy = 'night_cooling';
    advice.push("  NIGHT COOLING STRATEGY:");
    advice.push(`  • Overnight low: ${tempMin}°C. Open windows at night.`);
    advice.push("  • Use whole-house fan or window fans blowing OUT upstairs");
    advice.push("  • Close windows and blinds by 8am to trap cool air");
    advice.push("  • This strategy reduces next day AC usage by 50-70 percent");
    
  } else if (humidity > 70 && temp > 25) {
    strategy = 'close_windows';
    warnings.push("HIGH HUMIDITY: Keep windows closed");
    advice.push("  • Opening windows lets humidity in, making AC work harder");
    advice.push("  • Dehumidifier is more efficient than AC for moisture removal");
    advice.push("  • Set dehumidifier to 50% relative humidity");
    advice.push("  • Check for condensation on windows - sign of high indoor humidity");
    
  } else if (aqi && aqi > 100) {
    strategy = 'close_windows';
    warnings.push(`POOR AIR QUALITY: AQI ${aqi} - keep windows closed`);
    advice.push("  • Outdoor air is unhealthy to breathe");
    advice.push("  • Run HVAC on recirculate with MERV 13 or higher filter");
    advice.push("  • Use standalone HEPA air purifier in bedrooms and living areas");
    advice.push("  • Consider wearing N95 mask if you must be outside");
    
  } else if (pollenIndex && pollenIndex > 7) {
    strategy = 'close_windows';
    warnings.push(`HIGH POLLEN: Index ${pollenIndex} - keep windows closed`);
    advice.push("  • Pollen will coat everything inside your home");
    advice.push("  • Use HVAC with good filter. Change clothes after being outside.");
    advice.push("  • Run air purifier. Consider HEPA vacuum for floors.");
    advice.push("  • Allergy sufferers: keep windows closed, shower after coming inside");
    
  } else if (condition === 'rain' || condition === 'thunderstorm') {
    strategy = 'close_windows';
    advice.push("  RAIN: Keep windows closed to prevent water damage");
    advice.push("  • Run bathroom fans if humidity rises inside");
    
  } else if (temp > 30 && humidity > 50) {
    strategy = 'close_windows';
    advice.push("  HOT AND HUMID: Keep windows closed");
    advice.push("  • AC is more efficient than opening windows in high humidity");
    advice.push("  • Use ceiling fans for cooling effect");
    
  } else if (temp < 5) {
    strategy = 'close_windows';
    advice.push("  COLD: Keep windows closed to retain heat");
    advice.push("  • If you need ventilation: open windows for 5 minutes only");
    advice.push("  • Quick air exchange is more efficient than leaving windows open");
    
  } else {
    strategy = 'mixed';
    advice.push("  MIXED CONDITIONS: Ventilate strategically");
    advice.push("  • Open windows on the side away from wind and pollution");
    advice.push("  • Use exhaust fans in kitchen and bathrooms");
    advice.push("  • Monitor indoor CO2 levels if you have sensors");
    advice.push("  • Indoor CO2 above 1000 ppm = need ventilation");
  }
  
  // Ceiling fan guidance
  advice.push("");
  advice.push("CEILING FAN RECOMMENDATIONS:");
  if (temp > 24) {
    advice.push("  • Direction: Counter-clockwise (summer mode)");
    advice.push("  • Creates downdraft causing wind chill effect on skin");
    advice.push("  • Makes room feel 3-4°C cooler");
    advice.push("  • Turn off when leaving room (fans cool people, not rooms)");
    advice.push("  • Use in occupied rooms only for maximum savings");
  } else if (temp < 18) {
    advice.push("  • Direction: Clockwise (winter mode) at low speed");
    advice.push("  • Pushes warm air down from ceiling, reducing stratification");
    advice.push("  • Reduces heating cost by 10-15 percent");
    advice.push("  • Run on lowest speed that creates gentle air movement");
  }
  
  return { advice, warnings, strategy };
}

// ============================================================================
// ENHANCED LAUNDRY & LINE DRYING CALCULATOR
// ============================================================================

function getLaundryAdvice(data) {
  const { temp, humidity, wind, uvIndex, condition, pollenIndex, precipitation } = data;
  const advice = [];
  const warnings = [];
  let lineDryTime = null;
  
  advice.push("LAUNDRY WEATHER ASSESSMENT:");
  
  const isRaining = condition === 'rain' || condition === 'thunderstorm' || condition === 'drizzle';
  const isHumid = humidity > 70;
  const isCold = temp < 10;
  const isHot = temp > 30;
  const isWindy = wind > 15;
  const isHighUV = uvIndex > 5;
  const isHighPollen = pollenIndex > 6;
  
  if (isRaining) {
    advice.push("  RAIN: Use dryer today. Clothes won't dry outside.");
    advice.push("  • Run dryer at off-peak hours (after 9pm) for lowest cost");
    advice.push("  • Use moisture sensor to prevent over-drying (saves 15% energy)");
    advice.push("  • Consider indoor drying rack with fan for partial drying");
    
  } else if (isHumid) {
    advice.push("  HIGH HUMIDITY: Outdoor drying is slow and may cause musty smell.");
    advice.push("  • If line drying: expect 4-6+ hours drying time");
    advice.push("  • Indoor drying with dehumidifier may be faster than outdoor");
    advice.push("  • Dryer more efficient in humid conditions than outdoor");
    
  } else if (isCold) {
    advice.push(`  COLD (${temp}°C): Outdoor drying will take 6-12+ hours.`);
    advice.push("  • Clothes may freeze before drying (freeze-drying works but very slow)");
    advice.push("  • Indoor rack near heat source is better option");
    advice.push("  • Use dryer for time-sensitive loads");
    
  } else if (temp >= 15 && temp <= 35 && humidity < 65 && !isRaining) {
    lineDryTime = humidity < 40 ? 90 : humidity < 55 ? 150 : 210;
    advice.push(`  EXCELLENT LINE-DRYING! Estimated dry time: ${Math.round(lineDryTime/60)}-${Math.round(lineDryTime/30)} hours`);
    advice.push(`  • Temperature ${temp}°C, humidity ${humidity}%, wind ${wind}km/h`);
    advice.push("  • Savings: $0.40-0.70 vs electric dryer per load");
    advice.push("  • Bonus: not adding heat to house (AC doesn't fight dryer)");
    advice.push("  • Clothes last longer (less lint, less wear)");
    
    if (isHighUV) {
      advice.push("  • HIGH UV: Whites will naturally bleach in sun");
      advice.push("  • Colored clothes: dry inside out or in partial shade to prevent fading");
      advice.push("  • Delicates: line dry in shade only");
    }
    
    if (isHighPollen) {
      warnings.push("HIGH POLLEN: Pollen sticks to wet clothes");
      advice.push("  • Allergy sufferers: line dry in enclosed porch or use dryer");
      advice.push("  • Shake clothes before bringing inside");
    }
    
    if (isWindy) {
      advice.push("  • WINDY: Use extra clothespins. Light items may blow away.");
      advice.push("  • Wind acts as natural dryer - reduces drying time significantly");
    }
    
    if (isHot) {
      advice.push("  • HOT: Clothes will dry fast. Check early to prevent over-drying");
      advice.push("  • Use sunscreen on yourself while hanging clothes");
    }
    
  } else {
    advice.push("  MIXED CONDITIONS: Consider indoor drying with assistance.");
    advice.push("  • Indoor rack + fan or dehumidifier");
    advice.push("  • Dryer for heavy items, line dry for light items");
  }
  
  advice.push("");
  advice.push("DRYER EFFICIENCY TIPS:");
  advice.push("  • Clean lint trap before EVERY load (fire prevention + efficiency)");
  advice.push("  • Use dryer balls to reduce drying time 25%");
  advice.push("  • Spin cycle: high speed removes more water = less drying time");
  advice.push("  • Don't overfill - airflow is critical for drying efficiency");
  advice.push("  • Clean exhaust duct annually (lint buildup causes 30% efficiency loss)");
  advice.push("  • Consider heat pump dryer: uses 50% less energy than standard dryer");
  
  return { advice, warnings, lineDryTime };
}

// ============================================================================
// ENHANCED GARDEN & LAWN WATERING
// ============================================================================

function getWateringAdvice(data) {
  const { temp, humidity, precipitation, wind, uvIndex, condition, tempMax, tempMin } = data;
  const advice = [];
  const warnings = [];
  const recommendations = [];
  
  advice.push("GARDEN AND LAWN WATERING GUIDE:");
  
  const isRaining = condition === 'rain' || condition === 'thunderstorm' || condition === 'drizzle';
  const isHot = temp > 30;
  const isVeryHot = temp > 35;
  const isDry = humidity < 40;
  const isWindy = wind > 20;
  
  // Rain consideration
  if (precipitation > 15) {
    advice.push(`  RAIN: ${precipitation}mm - NO watering needed today`);
    advice.push("  • Nature is providing more than enough water");
    advice.push("  • Turn off automatic irrigation systems");
    advice.push("  • Check rain gauge. Deep watering is better than frequent shallow.");
    advice.push("  • This rain may be enough for 3-7 days depending on temperature.");
    
  } else if (precipitation > 8) {
    advice.push(`  LIGHT RAIN: ${precipitation}mm - supplemental watering for containers only`);
    advice.push("  • Lawns and gardens likely received enough water");
    advice.push("  • Check soil moisture before watering (2-3 cm down)");
    advice.push("  • Hanging baskets and containers may need additional water");
    
  } else if (precipitation > 3) {
    advice.push(`  SPRINKLE: ${precipitation}mm - minimal watering needed`);
    advice.push("  • Watch for dry spots, especially under eaves and trees");
    advice.push("  • Water only if soil is dry at 2-3 cm depth");
    
  } else {
    // No significant rain
    if (isVeryHot && isDry) {
      warnings.push("EXTREME CONDITIONS: Hot, dry, and no rain");
      advice.push("  • WATER URGENTLY: Plants are under severe stress");
      advice.push("  • Water deeply in early morning (before 7am) or late evening (after 7pm)");
      advice.push("  • Containers may need water 2x per day");
      advice.push("  • Mulch: 5-8cm layer reduces evaporation 70%");
      advice.push("  • Consider shade cloth for sensitive plants");
      advice.push("  • New plantings need water every 1-2 days");
      
    } else if (isHot && isDry) {
      advice.push("  HOT AND DRY: Water deeply, but efficiently");
      advice.push("  • Best time: early morning (5-9am)");
      advice.push("  • Avoid midday watering (50% evaporates before soaking in)");
      advice.push("  • Soaker hoses are 90% efficient vs sprinklers at 50%");
      advice.push("  • Watering frequency: 2-3 times per week deeply");
      
    } else if (isHot) {
      advice.push(`  HOT: ${temp}°C - plants transpire more water`);
      advice.push("  • Water in early morning for best absorption");
      advice.push("  • Check soil moisture at noon - containers may need water");
      advice.push("  • Established plants: water when top 2-3cm is dry");
      
    } else if (isWindy) {
      advice.push("  WINDY: Water loss from evaporation and drift");
      advice.push("  • Sprinklers are inefficient in wind - water drifts");
      advice.push("  • Use soaker hoses or drip irrigation for best results");
      advice.push("  • Water at base of plants, not leaves");
      
    } else {
      advice.push("  NORMAL CONDITIONS: Water when soil is dry to 2-3cm depth");
      advice.push("  • Deep watering: 2-3cm per week is sufficient for lawns");
      advice.push("  • Watering frequency: 1-2 times per week, deeply");
    }
  }
  
  // Lawn specific
  advice.push("");
  advice.push("LAWN CARE:");
  if (isVeryHot && isDry) {
    advice.push("  • Let grass go dormant in extreme heat");
    advice.push("  • Dormant grass will recover when temperatures cool");
    advice.push("  • Water if grass turns brown and doesn't spring back when walked on");
    advice.push("  • Raise mower height to 7-10cm in summer (shades roots)");
    
  } else if (isHot) {
    advice.push("  • Water deeply 1x per week (2.5cm)");
    advice.push("  • Frequent shallow watering = weak roots");
    advice.push("  • Mow high: 6-8cm for cool-season grass, 3-5cm for warm-season");
    
  } else if (precipitation < 5 && temp < 30) {
    advice.push("  • Normal watering: 2.5cm per week");
    advice.push("  • Water in early morning to reduce evaporation");
    
  } else if (precipitation > 5) {
    advice.push("  • Rain is providing water. Delay irrigation.");
  }
  
  // Plant types
  recommendations.push("");
  recommendations.push("WATERING BY PLANT TYPE:");
  recommendations.push("  • Vegetables: 2-4cm per week (more in heat)");
  recommendations.push("  • Trees: deep soak 3-5cm every 1-2 weeks (established trees)");
  recommendations.push("  • Flowers: 2-3cm per week (perennials), 3-4cm (annuals)");
  recommendations.push("  • Succulents: water when soil completely dry");
  recommendations.push("  • New plantings: water daily for first week, every 2-3 days for first month");
  
  return { advice, warnings, recommendations };
}

// ============================================================================
// ENHANCED SMART HOME OPTIMIZATION
// ============================================================================

function getSmartHomeAdvice(data, homeSystems = {}) {
  const { temp, tempMin, tempMax, sunPosition, humidity, condition, timeOfDay } = data;
  const advice = [];
  const schedules = [];
  
  advice.push("SMART HOME OPTIMIZATION RECOMMENDATIONS:");
  
  // Smart thermostat
  if (homeSystems.thermostat) {
    advice.push("");
    advice.push("THERMOSTAT SCHEDULE:");
    
    if (tempMax > 30) {
      schedules.push("  • Pre-cool: 10am-2pm (super-cooling before peak)");
      schedules.push("  • Peak hours (2-7pm): Raise to 26-27°C");
      schedules.push("  • Evening (7-11pm): Lower to 24-25°C for comfort");
      schedules.push("  • Overnight (11pm-6am): Set to 23-24°C (sleep comfort)");
      advice.push("  • Use eco+ or demand response if enrolled in utility program");
      advice.push("  • Each degree lower during peak can cost 2-3x more");
      
    } else if (tempMax > 25) {
      schedules.push("  • Daytime (8am-6pm): Set to 25-26°C");
      schedules.push("  • Evening: 24-25°C for comfort");
      schedules.push("  • Overnight: 23-24°C");
      
    } else if (tempMax < 20 && tempMin < 10) {
      schedules.push("  • Daytime (6am-10pm): Set to 19-20°C");
      schedules.push("  • Night (10pm-6am): Set to 17-18°C for sleep");
      schedules.push("  • Away: Set to 16°C to save energy");
      advice.push("  • Heat pumps: avoid large setbacks (use adaptive recovery)");
      
    } else {
      schedules.push("  • Mild day: Reduce HVAC usage");
      advice.push("  • Consider turning off HVAC and opening windows");
    }
  }
  
  // Smart blinds
  if (homeSystems.blinds) {
    advice.push("");
    advice.push("AUTOMATED BLIND SCHEDULE:");
    if (tempMax > 25 && sunPosition !== 'night') {
      advice.push("  • Close south and west blinds during day (blocks solar gain)");
      advice.push("  • Open east blinds in morning for solar heating in winter");
      advice.push("  • Open all blinds at night for radiant cooling");
      advice.push("  • Smart blinds reduce cooling load by 20-30%");
    } else if (tempMax < 15 && sunPosition !== 'night') {
      advice.push("  • Open south facing blinds during day (free solar heating)");
      advice.push("  • Close at night to prevent heat loss through windows");
      advice.push("  • Solar gain can raise indoor temperature 3-5°C");
    }
  }
  
  // Smart plugs and loads
  advice.push("");
  advice.push("LOAD SCHEDULING:");
  if (homeSystems.solar) {
    advice.push("  • Solar production peak: 10am-3pm - run heavy loads");
    advice.push("  • EV charging: use solar power during peak production");
    advice.push("  • Pool pump: run during solar peak (free energy)");
    
  } else {
    advice.push("  • Off-peak hours (after 9pm): run dishwasher, laundry, charge EV");
    advice.push("  • Avoid 2pm-7pm peak rates for heavy loads");
    advice.push("  • Delay charging until after 11pm for lowest rates");
  }
  
  advice.push("  • Vampire loads (standby power) cost 5-10% of electric bill");
  advice.push("  • Use smart plugs to kill power to electronics not in use");
  advice.push("  • Schedule: charge devices overnight, not during peak");
  
  // EV charging
  if (homeSystems.ev) {
    advice.push("");
    advice.push("EV CHARGING RECOMMENDATION:");
    if (homeSystems.solar) {
      advice.push("  • Charge during solar peak (10am-3pm) for free energy");
      advice.push("  • If not enough solar: charge after 9pm for off-peak rates");
      advice.push("  • Precondition battery while plugged in before departure (saves range)");
      
    } else {
      advice.push("  • Off-peak charging: after 11pm for lowest rates");
      advice.push("  • Avoid charging during 2pm-7pm peak demand");
      advice.push("  • Level 2 charging is 5-10% more efficient than Level 1");
    }
  }
  
  // Demand response
  if (homeSystems.demandResponse) {
    advice.push("");
    advice.push("DEMAND RESPONSE:");
    advice.push("  • Check if utility has event today (high load likely)");
    advice.push("  • If enrolled: pre-cool before event, reduce during event");
    advice.push("  • Peak hours today: likely 2pm-7pm due to high temperatures");
  }
  
  return { advice, schedules };
}

// ============================================================================
// POOL & HOT TUB ADVISOR
// ============================================================================

function getPoolAdvice(data) {
  const { temp, tempMin, tempMax, wind, humidity, uvIndex, condition, precipitation } = data;
  const advice = [];
  
  advice.push("POOL AND HOT TUB WEATHER ASSESSMENT:");
  
  // Pool heating
  const isSunny = condition === 'clear' || condition === 'partly-cloudy';
  const isHot = temp > 28;
  const isCold = temp < 15;
  const isWindy = wind > 15;
  
  if (isHot && isSunny) {
    advice.push("  POOL: Water will warm 2-4°C today with sun exposure");
    advice.push("  • Use solar cover to capture and retain heat");
    advice.push("  • Pool heater: efficient today (warm air + sun)");
    advice.push("  • Expect water temperature to rise 1-2°C per sunny hour");
    
  } else if (isHot) {
    advice.push("  POOL: Warm day, but cloudy. Limited solar heating.");
    advice.push("  • Water temperature will hold steady but not rise much");
    advice.push("  • Solar cover still helpful to prevent overnight loss");
    
  } else if (isCold && isWindy) {
    advice.push("  POOL: Cold and windy - pool will lose heat rapidly");
    advice.push(`  • Wind chill: water loses heat ${isWindy ? '3-5x' : '1-2x'} faster`);
    advice.push("  • Keep solar cover on when not in use");
    advice.push("  • Pool heater: inefficient today. Consider delaying heating.");
    
  } else if (isCold) {
    advice.push("  POOL: Cool conditions. Pool heater needed for comfortable swimming.");
    advice.push("  • Solar cover: essential for heat retention");
    advice.push("  • Heat pump: less efficient below 15°C air temperature");
    
  } else {
    advice.push("  POOL: Moderate conditions. Comfort depends on water temperature.");
    advice.push("  • Check current water temperature vs desired temperature");
    advice.push("  • Solar cover can add 3-5°C over 2-3 sunny days");
  }
  
  // Hot tub
  advice.push("");
  advice.push("HOT TUB:");
  if (temp < 10 && !isWindy) {
    advice.push("  • PERFECT hot tub weather! Cool air + warm water");
    advice.push("  • Wind chill: protect with windbreak if possible");
    advice.push("  • Cover: keep on when not in use");
    
  } else if (temp < 15) {
    advice.push("  • Good hot tub weather. Enjoy!");
    
  } else if (temp > 25) {
    advice.push("  • Hot tub may be too warm in these conditions");
    advice.push("  • Lower temperature setting or use cooler hours");
    advice.push("  • Evening/night is best for hot tub in warm weather");
    
  } else {
    advice.push("  • Acceptable conditions for hot tub");
  }
  
  // Evaporation
  if (humidity < 40 && isWindy && temp > 20) {
    advice.push("");
    advice.push("EVAPORATION: High today. Water loss significant.");
    advice.push("  • Cover pool when not in use");
    advice.push("  • Check water level and top up if needed");
    advice.push("  • Wind increases evaporation 3-5x");
  }
  
  // Rain
  if (condition === 'rain' || condition === 'thunderstorm') {
    advice.push("");
    advice.push("RAIN: Pool chemistry will be affected.");
    advice.push("  • Rain dilutes chemicals - check pH and chlorine after rain");
    advice.push("  • If thunderstorm: stay out of pool (lightning risk)");
    advice.push("  • Clean skimmer after heavy rain (debris)");
  }
  
  return advice;
}

// ============================================================================
// MAIN ENERGY HOME ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getEnergyHomeAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, humidity, wind, condition, conditionCode, 
    uvIndex, aqi, visibility, city, dewPoint, tempMin, tempMax,
    precipitation, pressure, pollenIndex, sunrise, sunset
  } = data;
  
  const q = question.toLowerCase();
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const cloudCover = mapWeatherCode(conditionCode);
  const season = getSeason();
  const timeOfDay = getTimeOfDay();
  const sunPosition = getSunPosition(data);
  
  // Get all advice modules
  const energyCost = getEnergyCostEstimate(data);
  const pipeFreeze = getPipeFreezeRisk(data);
  const ventilation = getVentilationAdvice(data);
  const laundry = getLaundryAdvice(data);
  const watering = getWateringAdvice(data);
  const pool = getPoolAdvice(data);
  
  // Detect question intent
  const isHVAC = q.includes('ac') || q.includes('heat') || q.includes('cool') || q.includes('thermostat') || q.includes('furnace');
  const isSolar = q.includes('solar') || q.includes('panel') || q.includes('pv') || q.includes('photovoltaic') || q.includes('sun');
  const isBattery = q.includes('battery') || q.includes('powerwall') || q.includes('storage');
  const isLaundry = q.includes('laundry') || q.includes('dry') || q.includes('wash') || q.includes('clothes');
  const isGarden = q.includes('water') || q.includes('garden') || q.includes('lawn') || q.includes('plant') || q.includes('sprinkler');
  const isPool = q.includes('pool') || q.includes('hot tub') || q.includes('spa') || q.includes('swim');
  const isMaintenance = q.includes('paint') || q.includes('stain') || q.includes('caulk') || q.includes('seal') || q.includes('clean');
  const isPipes = q.includes('pipe') || q.includes('freeze') || q.includes('plumb');
  const isAppliances = q.includes('fridge') || q.includes('oven') || q.includes('dishwasher') || q.includes('appliance');
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "HOME ENERGY WEATHER REPORT",
    "RESIDENTIAL EFFICIENCY ANALYSIS",
    "HOME SYSTEMS WEATHER ADVISORY",
    "ENERGY COST ASSESSMENT",
    "SMART HOME WEATHER EVALUATION"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${tempMin}°C - ${tempMax}°C\n`;
  response += `  Humidity: ${humidity}% (${humidity > 60 ? 'HIGH' : humidity < 30 ? 'DRY' : 'IDEAL'})\n`;
  response += `  Wind: ${wind} km/h\n`;
  response += `  Cloud cover: ${cloudCover}% (${cloudCover < 20 ? 'CLEAR' : cloudCover < 50 ? 'PARTLY CLOUDY' : 'CLOUDY'})\n`;
  response += `  UV Index: ${uvIndex} (${getUVLevel(uvIndex)})\n`;
  if (aqi) response += `  Air Quality: ${aqi} (${getAQICategory(aqi)})\n`;
  if (pollenIndex) response += `  Pollen Index: ${pollenIndex} (${pollenIndex > 7 ? 'HIGH' : pollenIndex > 4 ? 'MODERATE' : 'LOW'})\n`;
  response += `  Season: ${season} | Time: ${timeOfDay}\n`;
  if (precipitation > 0) response += `  Precipitation: ${precipitation}mm\n`;
  response += `\n`;
  
  // Overall verdict
  response += `=== OVERALL ENERGY VERDICT ===\n`;
  if (effectiveTemp >= 18 && effectiveTemp <= 24 && humidity >= 30 && humidity <= 55) {
    response += `  PERFECT DAY: Turn off HVAC. Open windows. Zero energy cost for comfort.\n`;
    response += `  Estimated savings vs average day: $5-15.\n`;
  } else if (effectiveTemp > 32) {
    response += `  HIGH COOLING DEMAND: AC essential. Use efficiency strategies.\n`;
    response += `  Peak hours 2pm-7pm: pre-cool before, reduce during.\n`;
  } else if (effectiveTemp < 0) {
    response += `  HIGH HEATING DEMAND: Maximum heating required.\n`;
    response += `  Watch for pipe freeze risk. Heat pumps may need aux heat.\n`;
  } else if (effectiveTemp > 28) {
    response += `  MODERATE-HIGH COOLING: AC needed during peak hours.\n`;
    response += `  Use fans and strategic cooling to reduce costs.\n`;
  } else if (effectiveTemp < 10) {
    response += `  MODERATE-HIGH HEATING: Heating needed. Use setbacks for savings.\n`;
  } else {
    response += `  MODERATE CONDITIONS: Minimum HVAC needed. Smart choices save.\n`;
  }
  response += `\n`;
  
  // Energy cost
  response += `=== ENERGY COST ESTIMATE ===\n`;
  energyCost.forEach(line => response += `${line}\n`);
  response += `\n`;
  
  // HVAC specific
  if (isHVAC || (!isSolar && !isLaundry && !isGarden && !isPool)) {
    response += `=== HVAC & COMFORT ===\n`;
    
    if (effectiveTemp > 28) {
      response += `  COOLING RECOMMENDATIONS:\n`;
      response += `    • Set thermostat to 24-26°C\n`;
      response += `    • Each degree below 24°C = 6-8% more energy\n`;
      response += `    • Use ceiling fans to allow 3°C higher setting\n`;
      response += `    • Close blinds on south/west windows during day\n`;
      response += `    • Pre-cool before 2pm peak rates\n`;
      response += `    • Avoid heat-generating appliances 2pm-7pm\n`;
    }
    
    if (effectiveTemp < 15) {
      response += `  HEATING RECOMMENDATIONS:\n`;
      response += `    • Set thermostat to 19-20°C during occupied hours\n`;
      response += `    • Set back 5-8°C at night or when away\n`;
      response += `    • Each degree above 20°C = 3-5% more energy\n`;
      response += `    • Open curtains on sunny side for solar gain\n`;
      response += `    • Close curtains at night to reduce heat loss\n`;
    }
    
    if (effectiveTemp >= 18 && effectiveTemp <= 24) {
      response += `  HVAC OFF: Open windows for free heating and cooling\n`;
    }
    
    // Heat pump specific
    if (effectiveTemp < 5) {
      response += `\n  HEAT PUMP NOTES:\n`;
      response += `    • COP drops below -5°C\n`;
      response += `    • Aux heat may activate below 0°C (3x cost)\n`;
      response += `    • Set it and forget it - no large setbacks\n`;
    }
    
    response += `\n`;
  }
  
  // Solar
  if (isSolar || cloudCover < 50) {
    response += `=== SOLAR GENERATION ===\n`;
    
    if (cloudCover < 20) {
      response += `  CLEAR SKY: 95-100% of rated output expected\n`;
      response += `  • Peak generation: 10am-3pm\n`;
      response += `  • Run major appliances during this window\n`;
      response += `  • Charge EV, battery, run dishwasher, laundry\n`;
      response += `  • Net metering: export excess, build credits\n`;
    } else if (cloudCover < 50) {
      response += `  PARTLY CLOUDY: 70-90% output expected\n`;
      response += `  • Still worth shifting loads to daylight hours\n`;
      response += `  • Monitor production through inverter app\n`;
    } else if (cloudCover < 80) {
      response += `  CLOUDY: 40-60% output. Reduced production.\n`;
      response += `  • Battery may not fully charge from solar\n`;
      response += `  • Grid charging may be needed for full battery\n`;
    } else {
      response += `  HEAVY CLOUDS: 10-25% output. Very low production.\n`;
      response += `  • Minimal solar benefit today\n`;
      response += `  • Charge battery from grid during off-peak if needed\n`;
    }
    
    if (isRaining) {
      response += `  • RAIN: Immediate drop in production\n`;
      response += `  • But rain cleans panels = 3-5% efficiency gain after\n`;
    }
    
    if (temp > 30) {
      const efficiencyLoss = Math.round((temp - 25) * 0.4);
      response += `  • HEAT: Panel efficiency reduced ~${efficiencyLoss}%\n`;
      response += `  • Panel temperature ~${Math.round(temp + 25)}°C\n`;
    }
    
    response += `\n`;
  }
  
  // Battery
  if (isBattery) {
    response += `=== BATTERY STORAGE ===\n`;
    response += `  • Charge during solar peak or off-peak rates\n`;
    response += `  • Discharge during peak rates (2pm-7pm)\n`;
    response += `  • Storm risk: charge to 100% for backup\n`;
    if (temp < 0) {
      response += `  • COLD: Battery capacity reduced 10-20%\n`;
      response += `  • Keep battery in conditioned space if possible\n`;
    }
    if (temp > 35) {
      response += `  • HOT: Battery cooling uses energy\n`;
      response += `  • Efficiency reduced in extreme heat\n`;
    }
    response += `\n`;
  }
  
  // Ventilation
  if (!isHVAC && !isSolar) {
    response += `=== VENTILATION ===\n`;
    ventilation.advice.forEach(line => response += `${line}\n`);
    ventilation.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Laundry
  if (isLaundry || !isGarden && !isPool) {
    response += `=== LAUNDRY ===\n`;
    laundry.advice.forEach(line => response += `${line}\n`);
    laundry.warnings.forEach(w => response += `  ${w}\n`);
    if (laundry.lineDryTime) {
      response += `  Line dry time: ~${Math.round(laundry.lineDryTime/60)} hours\n`;
    }
    response += `\n`;
  }
  
  // Garden/Watering
  if (isGarden) {
    response += `=== GARDEN & LAWN ===\n`;
    watering.advice.forEach(line => response += `${line}\n`);
    watering.warnings.forEach(w => response += `  ${w}\n`);
    watering.recommendations.forEach(r => response += `${r}\n`);
    response += `\n`;
  }
  
  // Pool
  if (isPool) {
    response += `=== POOL & HOT TUB ===\n`;
    pool.forEach(line => response += `${line}\n`);
    response += `\n`;
  }
  
  // Pipe freeze
  if (isPipes || pipeFreeze.riskLevel !== 'none') {
    response += `=== PIPE FREEZE ===\n`;
    pipeFreeze.advice.forEach(line => response += `${line}\n`);
    pipeFreeze.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Maintenance
  if (isMaintenance) {
    response += `=== HOME MAINTENANCE ===\n`;
    if (isRaining) {
      response += `  RAIN: Avoid exterior painting, staining, sealing\n`;
      response += `  • Wait for 2-3 dry days for paint to cure\n`;
    } else if (temp >= 15 && temp <= 30 && humidity >= 30 && humidity <= 65 && !isRaining) {
      response += `  EXCELLENT: Good weather for exterior work\n`;
      response += `  • Paint, stain, seal, caulk all perform well\n`;
      response += `  • Ideal temperature: 15-27°C\n`;
      response += `  • Avoid direct sun on surfaces (warmer than air)\n`;
    } else if (temp < 10) {
      response += `  TOO COLD: Exterior work not recommended\n`;
      response += `  • Paint won't cure below 10°C surface temperature\n`;
    } else if (temp > 32) {
      response += `  TOO HOT: Paint dries too fast, poor adhesion\n`;
      response += `  • Work early morning or late evening\n`;
    } else if (humidity > 70) {
      response += `  HIGH HUMIDITY: Slows drying, risk of mildew\n`;
      response += `  • Allow extra drying time\n`;
    }
    response += `\n`;
  }
  
  // Appliances
  if (isAppliances) {
    response += `=== APPLIANCE EFFICIENCY ===\n`;
    response += `  REFRIGERATOR:\n`;
    response += `    • Check door seals: dollar bill test\n`;
    response += `    • Clean coils every 6 months\n`;
    response += `    • Set to 3-4°C (fridge), -18°C (freezer)\n`;
    response += `\n`;
    response += `  OVEN/STOVE:\n`;
    if (effectiveTemp > 28) {
      response += `    • AVOID oven today (adds heat to house)\n`;
      response += `    • Use microwave, slow cooker, or grill outside\n`;
    } else {
      response += `    • Convection: cooks 25% faster, uses less energy\n`;
      response += `    • Glass/ceramic dishes allow lower temperature\n`;
    }
    response += `\n`;
    response += `  DISHWASHER:\n`;
    response += `    • Run full loads only\n`;
    response += `    • Air dry instead of heated dry (saves 50%)\n`;
    response += `    • Best time: off-peak hours or solar peak\n`;
    response += `\n`;
  }
  
  // Smart home
  if (question.includes('smart') || question.includes('optimize') || question.includes('schedule')) {
    const smartAdvice = getSmartHomeAdvice(data);
    response += `=== SMART HOME OPTIMIZATION ===\n`;
    smartAdvice.advice.forEach(line => response += `${line}\n`);
    if (smartAdvice.schedules && smartAdvice.schedules.length > 0) {
      response += `\n  RECOMMENDED SCHEDULE:\n`;
      smartAdvice.schedules.forEach(s => response += `${s}\n`);
    }
    response += `\n`;
  }
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (effectiveTemp >= 18 && effectiveTemp <= 24 && humidity >= 30 && humidity <= 55) {
    response += `  This is a ZERO COST day for heating and cooling.\n`;
    response += `  Open windows and enjoy free comfort.\n`;
    response += `  Estimated savings: $5-15 compared to average day.\n`;
  } else if (effectiveTemp > 32) {
    response += `  Expensive cooling day. Use every efficiency trick.\n`;
    response += `  Pre-cool before 2pm. Reduce usage 2pm-7pm.\n`;
    response += `  Estimated cost: $8-15 for average home.\n`;
  } else if (effectiveTemp < 0) {
    response += `  Expensive heating day. Maximum energy use expected.\n`;
    response += `  Watch for pipe freeze. Consider space heaters for zones.\n`;
    response += `  Estimated cost: $10-20 for average home.\n`;
  } else if (effectiveTemp > 28) {
    response += `  Moderate-high cooling cost. Smart choices save 20-30%.\n`;
  } else if (effectiveTemp < 10) {
    response += `  Moderate-high heating cost. Setback strategies save 10-15%.\n`;
  } else {
    response += `  Low-moderate energy day. Small choices make a difference.\n`;
  }
  
  const energyWisdom = [
    "The cheapest energy is the energy you do not use.",
    "Energy efficiency is the world's first fuel.",
    "A well-insulated house is a happy wallet.",
    "Solar panels: turning sunshine into savings since 1954.",
    "Every degree on your thermostat matters. Every single one.",
    "The greenest kilowatt-hour is the one never generated.",
    "Small changes add up to big savings over time.",
    "Your home is a system. Everything affects everything else."
  ];
  response += `\n--- WISDOM ---\n${random(energyWisdom)}`;
  
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
  getSmartHomeAdvice,
  getPoolAdvice
};

export default getEnergyHomeAdvice;
