import {
  calcHeatIndex,
  calcWindChill,
  calcWetBulbGlobeTemp,
  getBurnTime,
  getComfortScore,
  random
} from '../utils/calculations';

export const sampleQuestions = [
  "Is it safe to go outside today?",
  "Will the weather affect my migraines?",
  "Is it bad for my arthritis?",
  "Should I worry about heat stroke?",
  "Will my allergies act up?",
  "Is it safe for elderly to go out?",
  "Can I exercise with my heart condition?",
  "Will humidity affect my breathing?",
  "Should I stay inside today?"
];

export const getHealthAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, feelsLike, humidity, wind, uvIndex, aqi, visibility, condition, conditionCode, city, pressure } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, 0);
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const comfort = getComfortScore({ temp, humidity, wind });

  let verdict = [];
  let respiratory = [];
  let cardiac = [];
  let joints = [];
  let skin = [];
  let warnings = [];
  let general = [];

  // OVERALL RISK
  if (wbgt >= 32.3) {
    verdict.push("EXTREME RISK: Stay indoors. Heat stroke likely.");
    warnings.push(`WBGT ${wbgt}°C = dangerous for everyone.`);
    cardiac.push("Heart attacks increase 3x in this heat. Avoid exertion.");
  } else if (wbgt >= 28.0) {
    verdict.push("HIGH RISK: Limit outdoor time. Heat illness likely.");
    warnings.push(`WBGT ${wbgt}°C = high risk for elderly, kids, chronic conditions.`);
    cardiac.push("Heart works harder. Chest pain = go inside + call doctor.");
  } else if (windChill <= -18) {
    verdict.push("EXTREME COLD: Frostbite in 30min. Stay inside.");
    warnings.push(`Wind chill ${windChill}°C = exposed skin freezes.`);
    cardiac.push("Cold constricts blood vessels. Heart attack risk spikes.");
  } else if (aqi > 200) {
    verdict.push("HAZARDOUS AIR: Stay indoors. AQI ${aqi}.");
    respiratory.push("Even healthy lungs suffer. Heart/lung patients: do NOT go out.");
  } else {
    verdict.push("Moderate to low health risk. Take normal precautions.");
  }

  // RESPIRATORY - ASTHMA, COPD, ALLERGIES
  if (aqi > 150) {
    respiratory.push(`AQI ${aqi} Unhealthy. Triggers asthma attacks.`);
    respiratory.push("Use inhaler before going out. Carry rescue inhaler. N95 mask helps.");
    warnings.push("Hospital visits spike at this AQI. Limit to 15min outside.");
  } else if (aqi > 100) {
    respiratory.push(`AQI ${aqi} moderate. Sensitive groups may feel symptoms.`);
    respiratory.push("Reduce outdoor exercise. Asthma: take preventer inhaler.");
  }

  if (humidity > 85 && temp > 25) {
    respiratory.push("High humidity = mold spores + dust mites thrive. Allergy trigger.");
    respiratory.push("Breathing feels heavy. Asthma worse. Use dehumidifier indoors.");
  } else if (humidity < 30) {
    respiratory.push("Dry air irritates airways. Asthma, sinus issues worsen.");
    respiratory.push("Use humidifier. Saline nasal spray. Drink extra water.");
  }

  if (condition === 'thunderstorm' && wind > 20) {
    respiratory.push("Thunderstorm asthma: Pollen bursts cause attacks even if no rain.");
    warnings.push("Stay inside during storm. Keep inhaler close 24hrs after.");
  }

  if (visibility < 3) {
    respiratory.push("Fog/haze traps pollutants. Breathing difficult.");
  }

  // CARDIAC - HEART CONDITIONS
  if (effectiveTemp > 32) {
    cardiac.push(`Heat ${heatIndex}°C strains heart. Blood pressure drops.`);
    cardiac.push("Dizziness, fatigue = warning signs. Sit in AC immediately.");
    cardiac.push("Heart meds + heat = dangerous combo. Ask doctor about dosage.");
  } else if (effectiveTemp < 5) {
    cardiac.push(`Cold ${windChill}°C constricts vessels. Heart works harder.`);
    cardiac.push("Angina risk increases. Chest pain in cold = emergency.");
    cardiac.push("Warm up slowly. No sudden exertion like shoveling snow.");
  }

  if (pressure < 1000) {
    cardiac.push("Low pressure can trigger migraines + joint pain.");
    joints.push("Barometric drop = joints ache. Common before storms.");
  }

  // JOINTS - ARTHRITIS
  if (humidity > 80 || (pressure < 1010 && conditionCode >= 51)) {
    joints.push("High humidity/low pressure = arthritis flare-ups likely.");
    joints.push("Joints swell. Pain increases 2-3 days before rain.");
    general.push("Gentle movement helps. Hot bath reduces stiffness.");
  } else if (windChill < 10) {
    joints.push("Cold stiffens joints. Pain worse in mornings.");
    general.push("Layer up. Keep joints warm. Movement reduces pain.");
  }

  // SKIN - UV, BURNS
  if (uvIndex >= 8) {
    skin.push(`Extreme UV ${uvIndex}. Burn in ~${burnMin}min.`);
    skin.push("Skin cancer risk. SPF 50+, hat, long sleeves 10am-4pm.");
    warnings.push("Reflection off water/concrete doubles UV. Be extra careful.");
  } else if (uvIndex >= 6) {
    skin.push(`High UV ${uvIndex}. SPF 30+ needed.`);
  } else if (uvIndex >= 3) {
    skin.push("Moderate UV. SPF if outside >1hr.");
  }

  if (wind > 25 && humidity < 40) {
    skin.push("Wind + dry air = chapped lips, cracked skin.");
    general.push("Heavy moisturizer. Lip balm with SPF. Hydrate more.");
  }

  // MIGRAINES
  if (pressure < 1005 || pressure > 1025) {
    warnings.push("Pressure swing triggers migraines. Common today.");
    general.push("Stay hydrated. Avoid triggers: caffeine, bright light.");
  }
  if (conditionCode >= 95) {
    warnings.push("Thunderstorms = migraine trigger from pressure + ozone.");
  }

  // ELDERLY SPECIFIC
  if (effectiveTemp > 30 || effectiveTemp < 5) {
    warnings.push("Elderly at risk. Body can't regulate temp well.");
    cardiac.push("Check on elderly neighbors. Heat/cold kills silently.");
    general.push("Elderly: stay in AC/heat. Drink even if not thirsty.");
  }

  // GENERAL COMFORT
  if (comfort === "Perfect") {
    general.push("Ideal weather for health. Good day for outdoor activity.");
  } else if (comfort === "Poor" || comfort === "Extreme") {
    general.push(`Uncomfortable: ${effectiveTemp}°C feels like. Limit time outside.`);
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (aqi > 100) {
      warnings.push("Lagos traffic pollution = AQI worse near roads. Avoid rush hour walks.");
    }
    if (humidity > 85) {
      respiratory.push("Lagos humidity = fungal infections common. Keep skin dry.");
    }
  }

  const intros = [
    "Health weather check:",
    "Medical conditions forecast:",
    "Health safety report:",
    "Wellness weather:",
    "Zephye's health rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (respiratory.length) response += ` Respiratory: ${respiratory.join(' ')}`;
  if (cardiac.length) response += ` Heart: ${cardiac.join(' ')}`;
  if (joints.length) response += ` Joints: ${joints.join(' ')}`;
  if (skin.length) response += ` Skin: ${skin.join(' ')}`;
  if (general.length) response += ` General: ${general.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
