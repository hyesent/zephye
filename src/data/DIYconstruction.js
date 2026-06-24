import {
  getPaintDryingTime,
  getConcreteCuringTemp,
  getComfortScore,
  mapWeatherCode,
  random
} from '../utils/calculations';

export const sampleQuestions = [
  "Can I paint outside today?",
  "Is it good weather for concrete work?",
  "Should I stain my deck?",
  "Can I use power tools outside?",
  "Is it too humid for woodworking?",
  "Good day for roofing work?",
  "Will rain ruin my construction project?",
  "Can I pour concrete today?",
  "Is it safe to use a ladder?"
];

export const getDIYConstructionAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, humidity, wind, uvIndex, condition, conditionCode, visibility, precipitation, city } = data;
  const paintDry = getPaintDryingTime(temp, humidity);
  const concreteCure = getConcreteCuringTemp(temp);
  const comfort = getComfortScore({ temp, humidity, wind });
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';

  let verdict = [];
  let painting = [];
  let concrete = [];
  let woodwork = [];
  let roofing = [];
  let safety = [];
  let warnings = [];

  // MAIN VERDICT
  if (isStorm) {
    verdict.push("Thunderstorms. NO outdoor construction.");
    warnings.push("Lightning + metal tools/ladders = death. Power tools + rain = electrocution.");
    safety.push("Stop all work. Unplug everything. Stay inside 30min after last thunder.");
  } else if (isRaining && precipitation > 5) {
    verdict.push("Heavy rain. Most outdoor work impossible.");
    warnings.push("Materials get ruined. Surfaces too wet for adhesion. Slip hazard extreme.");
    painting.push("NO PAINTING. Water ruins paint. Traps moisture = peel in 2 weeks.");
    concrete.push("NO CONCRETE POUR. Rain washes away cement. Weakens mix.");
    woodwork.push("Wood swells. Cutting wet wood = dangerous kickback.");
  } else if (isRaining) {
    verdict.push("Light rain. Limited outdoor work.");
    warnings.push("Surfaces wet. Most adhesives/paints fail. Electrical hazard.");
    painting.push("Cover work area or wait. Humidity >85% = paint won't cure.");
  } else if (wind > 40) {
    verdict.push(`Extreme winds ${wind}km/h. Unsafe for construction.`);
    warnings.push("Ladders blow over. Materials fly. Dust in eyes. No roof work.");
    safety.push("Wind >40km/h = OSHA violation for heights. Cancel.");
    roofing.push("ABSOLUTELY NOT. Shingles/plywood become missiles.");
  } else if (wind > 25) {
    verdict.push("Very windy. Risky for heights and large materials.");
    safety.push("No ladder work above 6ft. Plywood/sheetrock catches wind = injury.");
    warnings.push("Dust/debris. Wear goggles + mask. Secure all materials.");
  } else {
    verdict.push("Weather acceptable for outdoor construction with precautions.");
  }

  // PAINTING CONDITIONS
  if (!isRaining && wind <= 25) {
    if (temp < 10) {
      painting.push(`Too cold ${temp}°C. Paint thickens, won't level. Cure time: ${paintDry}.`);
      painting.push("Oil paint: min 10°C. Latex: min 5°C. Below that = failure.");
      warnings.push("Cold paint = poor adhesion. Will peel within months.");
    } else if (temp > 35) {
      painting.push(`Too hot ${temp}°C. Paint dries too fast. Cure: ${paintDry}.`);
      painting.push("Brush marks won't level. Blistering likely. Paint in shade only.");
      warnings.push("Surface temp 10°C hotter than air. Touch test: if hot, don't paint.");
    } else if (humidity > 85) {
      painting.push(`High humidity ${humidity}%. Paint won't cure. Cure: ${paintDry}.`);
      painting.push("Moisture trapped under paint = blisters + mildew in 3 months.");
      warnings.push("Wait for humidity <70%. Use dehumidifier if urgent.");
    } else if (humidity < 30) {
      painting.push(`Low humidity ${humidity}%. Paint dries fast. Cure: ${paintDry}.`);
      painting.push("Good for spraying. Bad for brushing — lap marks form.");
    } else {
      painting.push(`Perfect painting weather. ${temp}°C, ${humidity}% humidity. Cure: ${paintDry}.`);
      painting.push("Ideal: 18-26°C, 40-70% humidity, low wind.");
    }

    if (wind > 15 && wind <= 25) {
      painting.push("Windy. Debris sticks to wet paint. Overspray travels.");
      warnings.push("Use windscreen. Spray only downwind. Brush/roll better today.");
    }

    if (uvIndex >= 6 && temp > 25) {
      painting.push("High UV + heat = paint skins over before leveling.");
      painting.push("Paint early morning or late afternoon. Avoid 11am-3pm.");
    }
  }

  // CONCRETE CONDITIONS
  if (!isRaining && wind <= 30) {
    if (temp < 5) {
      concrete.push(`Too cold ${temp}°C. Concrete freezes = zero strength.`);
      concrete.push("Concrete curing: ${concreteCure}. Below 5°C needs heaters + blankets.");
      warnings.push("NEVER pour on frozen ground. Concrete will crumble in spring.");
      safety.push("Add calcium chloride or hot water mix. Cure 7 days heated.");
    } else if (temp > 32) {
      concrete.push(`Too hot ${temp}°C. Water evaporates fast. Curing: ${concreteCure}.`);
      concrete.push("Rapid drying = weak concrete + cracks. Plastic shrinkage likely.");
      warnings.push("Mist surface every hour. Use shade cloth. Pour at dawn/dusk.");
      safety.push("Add retarder. Wet cure 7 days minimum. Cover with burlap.");
    } else if (temp >= 10 && temp <= 27) {
      concrete.push(`Ideal concrete temp. Curing: ${concreteCure}.`);
      concrete.push("Perfect range 15-25°C. Full strength in 28 days.");
    } else {
      concrete.push(`Concrete curing: ${concreteCure}.`);
    }

    if (wind > 15) {
      concrete.push("Windy = rapid surface drying. Cracks form in 1hr.");
      warnings.push("Wind breaks >15km/h need curing compound immediately.");
      safety.push("Spray water or cover with plastic within 30min of pour.");
    }

    if (humidity < 40) {
      concrete.push("Low humidity = fast evaporation. Cure carefully.");
      warnings.push("Wet cure essential. Mist 3x daily for 7 days.");
    }
  }

  // WOODWORK
  if (!isRaining && wind <= 30) {
    if (humidity > 80) {
      woodwork.push(`High humidity ${humidity}%. Wood swells 5-10%.`);
      woodwork.push("Don't cut to final size. Wood shrinks when dry = gaps.");
      warnings.push("Glue joints fail. Moisture prevents adhesion. Wait for <60%.");
    } else if (humidity < 30) {
      woodwork.push(`Low humidity ${humidity}%. Wood shrinks + cracks.`);
      woodwork.push("Cut now, assemble in normal humidity or joints open later.");
      warnings.push("Static electricity. Sawdust sticks everywhere + fire risk.");
    } else {
      woodwork.push("Good humidity for woodworking. Wood stable.");
    }

    if (temp < 5) {
      woodwork.push("Cold wood = brittle. Splits easier. Glue doesn't cure.");
      warnings.push("Warm shop to 15°C minimum. Cold glue = weak joints.");
    } else if (temp > 35) {
      woodwork.push("Hot = sweat drips on wood = water stains.");
      woodwork.push("Glue dries too fast. Open time cut in half.");
    }
  }

  // ROOFING
  if (!isRaining && wind <= 25 && temp > 5) {
    if (temp > 30) {
      roofing.push(`Hot roof ${temp}°C. Shingles get soft, tear easily.`);
      roofing.push("Surface temp 20°C hotter. Burns on contact. Work early morning.");
      warnings.push("Heat exhaustion risk. Asphalt releases fumes. Roofing = dangerous in heat.");
    } else if (temp >= 10 && temp <= 25) {
      roofing.push("Good roofing temp. Shingles seal properly.");
    } else if (temp < 10) {
      roofing.push(`Cold ${temp}°C. Shingles brittle, crack when nailed.`);
      roofing.push("Seal strips won't activate. Leaks likely. Wait for >10°C.");
    }

    if (wind > 15) {
      roofing.push(`Wind ${wind}km/h. Shingles lift, plywood slides.`);
      warnings.push("Fall risk extreme. Wind catches materials = knocked off roof.");
      safety.push("No roofing above 25km/h wind. OSHA rule.");
    }

    if (humidity > 85) {
      roofing.push("High humidity = plywood swells. Gaps when dry.");
      warnings.push("Mold grows under shingles if deck is wet. Check with meter.");
    }
  }

  // POWER TOOL SAFETY
  if (isRaining || humidity > 90) {
    safety.push("NO ELECTRIC TOOLS IN WET CONDITIONS. Electrocution risk.");
    safety.push("GFCI outlet mandatory. Keep cords off ground. Dry hands only.");
  }

  if (wind > 20) {
    safety.push("Dust/debris flies. Safety glasses + respirator mandatory.");
    safety.push("Secure workpiece. Wind moves it = kickback injury.");
  }

  if (temp < 0) {
    safety.push("Cold metal = sticks to skin. Tools brittle, snap easier.");
    safety.push("Batteries die 50% faster. Keep spares warm in pocket.");
  } else if (temp > 35) {
    safety.push("Tools overheat. Motor burns out. Batteries explode risk.");
    safety.push("Let tools cool 15min every hour. Shade only.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (humidity > 80) {
      warnings.push("Lagos humidity = everything rusts. Tools, nails, metal parts.");
      woodwork.push("Wood never fully dries. Use pressure-treated or it rots.");
    }
    if (isRaining && temp > 26) {
      warnings.push("Lagos rain = instant mud. Job site becomes swamp.");
      safety.push("Mud + power tools = slip + electrocution. Wait 24hrs after rain.");
    }
  }

  const intros = [
    "Construction weather check:",
    "DIY conditions:",
    "Building weather report:",
    "Work site forecast:",
    "Zephye's construction rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (painting.length) response += ` Painting: ${painting.join(' ')}`;
  if (concrete.length) response += ` Concrete: ${concrete.join(' ')}`;
  if (woodwork.length) response += ` Woodwork: ${woodwork.join(' ')}`;
  if (roofing.length) response += ` Roofing: ${roofing.join(' ')}`;
  if (safety.length) response += ` Safety: ${safety.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
