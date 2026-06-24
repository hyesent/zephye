import {
  calcWindChill,
  calcHeatIndex,
  getWindDirection,
  getComfortScore,
  mapWeatherCode,
  random
} from './calculations';

export const sampleQuestions = [
  "Is it safe to drive today?",
  "Should I cycle to work?",
  "Good weather for motorbike?",
  "Are roads slippery?",
  "Is it too windy for cycling?",
  "Should I drive or take a cab?",
  "Will rain affect my commute?",
  "Is visibility bad for driving?",
  "Safe to ride my bike?"
];

export const getDrivingAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, humidity, wind, windDir, condition, conditionCode, visibility, uvIndex, aqi, city } = data;
  const windChill = calcWindChill(temp, wind);
  const heatIndex = calcHeatIndex(temp, humidity);
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : temp;
  const windDirection = getWindDirection(windDir);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isSnow = condition === 'snow';
  const isFog = condition === 'fog' || visibility < 1;

  let verdict = [];
  let roadConditions = [];
  let cycling = [];
  let motorbike = [];
  let driving = [];
  let warnings = [];
  let tips = [];

  // MAIN ROAD VERDICT
  if (condition === 'thunderstorm') {
    verdict.push("Thunderstorms. Dangerous driving conditions.");
    warnings.push("Lightning + heavy rain + poor visibility. Avoid travel.");
    roadConditions.push("Flash flooding likely. Hydroplaning risk extreme.");
    cycling.push("NO CYCLING. Lightning strike risk. Zero visibility.");
    motorbike.push("EXTREMELY DANGEROUS. Pull over under bridge, not trees.");
  } else if (isSnow && temp <= 0) {
    verdict.push("Snow/ice conditions. Hazardous roads.");
    warnings.push("Black ice invisible. Stopping distance 10x longer.");
    roadConditions.push("Roads untreated = death trap. 4WD or chains only.");
    driving.push("Drive 50% speed limit. No sudden braking/turning.");
    cycling.push("NO CYCLING. Ice = instant crash. Frostbite on hands.");
    motorbike.push("SUICIDE. Bikes have zero traction on ice.");
  } else if (isFog || visibility < 1) {
    verdict.push("Dense fog. Visibility under 1km.");
    warnings.push("Can't see 10m ahead. Pile-ups common.");
    driving.push("Fog lights only. No high beams — reflects back.");
    driving.push("Speed <40km/h. Follow road lines. No overtaking.");
    cycling.push("EXTREMELY DANGEROUS. Cars won't see you. Stay off roads.");
    motorbike.push("NO RIDING. You are invisible to cars.");
  } else if (wind > 50) {
    verdict.push(`Extreme winds ${wind}km/h. Dangerous for all vehicles.`);
    warnings.push("High-profile vehicles tip over. Debris flying.");
    driving.push("SUVs/trucks at risk. Hold steering wheel tight. Avoid bridges.");
    cycling.push("IMPOSSIBLE. Crosswinds blow you into traffic.");
    motorbike.push("DEADLY. Crosswinds push bike across lanes. Do not ride.");
  } else if (isRaining && wind > 30) {
    verdict.push("Rain + high wind. Poor driving conditions.");
    warnings.push("Hydroplaning + crosswinds = loss of control.");
    roadConditions.push("Puddles hide potholes. Splash causes instant blindness.");
  } else if (isRaining) {
    verdict.push("Wet roads. Drive with caution.");
    roadConditions.push("Stopping distance doubles. Oil on road = extra slippery first 10min.");
    driving.push("Headlights on. Increase following distance to 4sec.");
  } else {
    verdict.push("Good driving conditions overall.");
  }

  // CYCLING SPECIFIC
  if (!isStorm && !isSnow && visibility > 2 && wind <= 40) {
    if (effectiveTemp < 0) {
      cycling.push("Freezing. Frostbite risk on fingers/face in 30min.");
      cycling.push("Thermal gloves, balaclava, windproof jacket mandatory.");
      warnings.push("Ice patches in shade. Crash risk high even if roads look clear.");
    } else if (effectiveTemp < 10) {
      cycling.push("Cold. Layer up: thermal base, windbreaker, gloves.");
      cycling.push("Muscles tighten. Warm up 10min before riding hard.");
    } else if (effectiveTemp > 32) {
      cycling.push("Hot. Heat exhaustion risk on long rides.");
      cycling.push("Hydrate 750ml/hr. Avoid 12pm-4pm. Light colors only.");
      warnings.push(`Heat index ${heatIndex}°C. Asphalt radiates extra 10°C.`);
    } else {
      cycling.push("Good cycling temp. Enjoy the ride.");
    }

    if (wind > 25 && wind <= 40) {
      cycling.push(`Strong wind ${wind}km/h from ${windDirection}.`);
      cycling.push("Headwind = 50% more effort. Tailwind = easy but braking hard.");
      warnings.push("Crosswinds blow you into traffic. Grip handlebars tight.");
    } else if (wind > 15) {
      cycling.push(`Breezy ${wind}km/h. Noticeable but manageable.`);
    }

    if (isRaining) {
      cycling.push("Wet roads = 70% less grip. Brake earlier, turn slower.");
      cycling.push("Visibility poor. Bright clothes + front/rear lights mandatory.");
      warnings.push("Potholes fill with water. Can't see depth. Avoid puddles.");
    }

    if (uvIndex >= 6) {
      cycling.push(`High UV ${uvIndex}. Sunscreen on arms/face/neck.`);
      cycling.push("Helmet vents let sun in. Scalp burns are real.");
    }

    if (aqi > 100) {
      warnings.push(`AQI ${aqi}. Cycling = deep breathing polluted air.`);
      cycling.push("Reduce intensity. Consider mask or indoor trainer.");
    }
  }

  // MOTORBIKE SPECIFIC
  if (!isStorm && !isSnow && visibility > 2 && wind <= 50) {
    if (isRaining) {
      motorbike.push("Rain = death trap for bikes. 90% less traction.");
      motorbike.push("No leaning in corners. Brake 3x earlier. Aquaplaning kills.");
      warnings.push("White lines, manhole covers = ice when wet. Avoid them.");
    }

    if (wind > 30) {
      motorbike.push(`Crosswinds ${wind}km/h push bike sideways.`);
      motorbike.push("Lean into wind. Avoid bridges/open areas. High risk.");
      warnings.push("Trucks create wind blast. Pass with extra space.");
    }

    if (effectiveTemp < 5) {
      motorbike.push("Cold = slow reaction time + stiff hands.");
      motorbike.push("Heated grips or die. Hypothermia on highway in 20min.");
    } else if (effectiveTemp > 35) {
      motorbike.push("Extreme heat + helmet = heat stroke.");
      motorbike.push("Hydrate before ride. Stop every 45min. Mesh gear only.");
      warnings.push("Asphalt ${heatIndex + 15}°C. Radiates up. Burns on contact.");
    }

    if (visibility < 5) {
      warnings.push("Poor visibility = cars don't see bikes. Suicide to ride.");
    }
  }

  // DRIVING SPECIFIC
  if (!isStorm && !isFog && wind <= 50) {
    if (isRaining) {
      driving.push("Turn on headlights. Defog windows. AC clears windscreen faster.");
      tips.push("If hydroplaning: ease off gas, don't brake, steer straight.");
    }

    if (isSnow || temp <= 0) {
      driving.push("Winter tires below 7°C. All-seasons = plastic at freezing.");
      tips.push("Black ice common on bridges, shaded areas, 0-3am.");
      warnings.push("4WD doesn't help you stop. Only helps you go.");
    }

    if (wind > 30) {
      driving.push("High-profile vehicles sway. Grip wheel at 9+3.");
      warnings.push("Sudden gusts near trucks/buildings. Be ready.");
    }

    if (effectiveTemp > 35) {
      driving.push("AC on recirculate. Car interior hits 60°C in 10min.");
      warnings.push("Check tire pressure. Heat increases 1PSI per 5°C. Blowout risk.");
      tips.push("Never leave kids/pets in car. Death in minutes.");
    }

    if (visibility < 5) {
      driving.push("Fog lights + low beam. High beam reflects back.");
      tips.push("Follow road edge lines. No cruise control. Windows down to hear.");
    }
  }

  // ROAD CONDITIONS GENERAL
  if (precipitation > 10) {
    roadConditions.push(`Heavy rain ${precipitation}mm. Flooding likely in low areas.`);
    warnings.push("6 inches water = lose control. 12 inches = car floats. Turn around.");
  } else if (precipitation > 2) {
    roadConditions.push("Moderate rain. Watch for puddles + reduced traction.");
  }

  if (temp <= 3 && isRaining) {
    roadConditions.push("Freezing rain = instant black ice. Worst condition possible.");
    warnings.push("Roads look wet but are ice. Untreated = undrivable.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (isRaining) {
      warnings.push("Lagos flooding = instant. Avoid Lekki-Epe, Third Mainland low spots.");
      roadConditions.push("Open manholes. Pot holes invisible under water.");
    }
    if (wind > 20) {
      warnings.push("Lagos wind = loose signage, debris. Power lines down.");
    }
  }

  const intros = [
    "Road conditions:",
    "Driving report:",
    "Commute weather:",
    "Travel safety check:",
    "Zephye's road rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (roadConditions.length) response += ` Roads: ${roadConditions.join(' ')}`;
  if (driving.length) response += ` Driving: ${driving.join(' ')}`;
  if (cycling.length) response += ` Cycling: ${cycling.join(' ')}`;
  if (motorbike.length) response += ` Motorbike: ${motorbike.join(' ')}`;
  if (tips.length) response += ` Tips: ${tips.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
