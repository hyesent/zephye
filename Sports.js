import {
  calcHeatIndex,
  calcWindChill,
  calcWetBulbGlobeTemp,
  getBurnTime,
  getComfortScore,
  mapWeatherCode,
  random
} from './calculations';

export const sampleQuestions = [
  "Is it safe to play football today?",
  "Should I cancel my marathon?",
  "Good weather for tennis?",
  "Is it too hot for soccer practice?",
  "Can kids play outside?",
  "Should I run in this weather?",
  "Is the field too wet for sports?",
  "Will wind affect my golf game?",
  "Is it safe for outdoor workouts?"
];

export const getSportsAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, feelsLike, humidity, wind, uvIndex, aqi, visibility, condition, conditionCode, precipitation, city } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, 0); // 0 solar for shade baseline
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';

  let verdict = [];
  let safety = [];
  let performance = [];
  let hydration = [];
  let warnings = [];

  // WBGT HEAT STRESS FLAGS - official sports guidelines
  if (wbgt >= 32.3) {
    verdict.push("BLACK FLAG: Cancel all outdoor sports. Extreme heat danger.");
    warnings.push(`WBGT ${wbgt}°C = heat stroke likely in 20min.`);
    safety.push("NO PRACTICE. NO GAMES. Risk of death from heat stroke.");
    hydration.push("Not applicable — cancel activity.");
  } else if (wbgt >= 30.1) {
    verdict.push("RED FLAG: High risk. Cancel competition, limit practice.");
    warnings.push(`WBGT ${wbgt}°C = heat exhaustion likely.`);
    safety.push("Limit practice to 1hr. Mandatory 10min breaks every 20min.");
    safety.push("No equipment/helmets. Light clothing only. Medical staff required.");
    hydration.push("Drink 250ml every 15min. Weigh athletes before/after — >2% loss = stop.");
  } else if (wbgt >= 28.0) {
    verdict.push("ORANGE FLAG: High risk. Modify activity.");
    warnings.push(`WBGT ${wbgt}°C = heat cramps likely.`);
    safety.push("Practice max 2hrs. 10min breaks every 30min in shade.");
    safety.push("Remove helmets/pads during breaks. No conditioning drills.");
    hydration.push("Drink 200ml every 20min. Monitor for dizziness, nausea.");
  } else if (wbgt >= 25.7) {
    verdict.push("YELLOW FLAG: Moderate risk. Use caution.");
    safety.push(`WBGT ${wbgt}°C = monitor athletes closely.`);
    safety.push("5min breaks every 30min. Remove extra equipment when possible.");
    hydration.push("Drink 150ml every 20min. Watch for heat illness signs.");
  } else {
    verdict.push("GREEN FLAG: Low risk. Normal activity.");
    performance.push(`WBGT ${wbgt}°C = safe for full activity.`);
  }

  // COLD WEATHER
  if (windChill <= -18) {
    verdict.push("BLACK FLAG COLD: Cancel outdoor sports. Frostbite in 30min.");
    warnings.push(`Wind chill ${windChill}°C = exposed skin freezes fast.`);
    safety.push("NO OUTDOOR ACTIVITY. Indoor only.");
  } else if (windChill <= -9) {
    verdict.push("RED FLAG COLD: High frostbite risk.");
    warnings.push(`Wind chill ${windChill}°C = cover all skin.`);
    safety.push("Limit to 30min. No exposed skin. Warm-up indoors 15min.");
    safety.push("Watch for numbness, white skin. That's frostbite starting.");
  } else if (windChill <= 0) {
    verdict.push("YELLOW FLAG COLD: Caution needed.");
    safety.push(`Wind chill ${windChill}°C = layers mandatory.`);
    safety.push("Warm-up 20min. Keep moving. No standing around.");
    performance.push("Muscles tighten faster. Injury risk higher. Extra stretching.");
  }

  // LIGHTNING
  if (isStorm) {
    warnings.push("THUNDERSTORM: Lightning kills. Clear fields immediately.");
    safety.push("30-30 rule: If thunder <30sec after lightning, wait 30min after last thunder.");
    safety.push("No metal bleachers, trees, or open fields. Cars are safe.");
    verdict[0] = "Cancel ALL outdoor sports. Lightning doesn't care about your game.";
  }

  // RAIN
  if (isRaining && precipitation > 5) {
    warnings.push("Heavy rain = slippery fields. ACL tear risk + poor visibility.");
    performance.push("Ball control impossible. Cancel for safety + field damage.");
    safety.push("Lightning risk even without visible storm. Check radar.");
  } else if (isRaining) {
    performance.push("Wet field = slower play. Higher injury risk from slipping.");
    safety.push("No metal cleats on turf. Grass fields get destroyed.");
    warnings.push("Hypothermia risk if temp <15°C + rain. Get dry ASAP after.");
  }

  // WIND
  if (wind > 40) {
    warnings.push(`Extreme wind ${wind}km/h. Unsafe for sports.`);
    safety.push("Debris flying. Goals/equipment blow over. Eye injury risk.");
    performance.push("Ball sports impossible. Running form destroyed.");
  } else if (wind > 25) {
    performance.push(`Strong wind ${wind}km/h affects ball trajectory.`);
    performance.push("Golf: add 2 clubs into wind. Tennis: serves go wild.");
    safety.push("Dust/debris in eyes. Goggles recommended.");
  } else if (wind > 15) {
    performance.push("Breezy. Affects passing/shooting accuracy.");
  }

  // UV
  if (uvIndex >= 8) {
    safety.push(`Extreme UV ${uvIndex}. Burn in ~${burnMin}min.`);
    hydration.push("UV increases dehydration. Add 20% more water intake.");
    performance.push("Sunglasses needed. Glare affects ball tracking.");
    warnings.push("Skin cancer risk. SPF 50+ reapply every 2hrs. Cover skin.");
  } else if (uvIndex >= 6) {
    safety.push(`High UV ${uvIndex}. SPF 30+ required.`);
  }

  // AIR QUALITY
  if (aqi > 200) {
    verdict.push("VERY UNHEALTHY AIR. Cancel outdoor sports.");
    warnings.push(`AQI ${aqi} = lung damage. Even healthy athletes at risk.`);
    safety.push("Indoor only with air filtration. Heart attacks increase at this AQI.");
  } else if (aqi > 150) {
    warnings.push(`AQI ${aqi} Unhealthy. Limit intense activity.`);
    safety.push("Asthmatics should not participate. Others: reduce intensity 50%.");
    performance.push("Endurance drops 15-20%. Breathing difficult.");
  } else if (aqi > 100) {
    safety.push(`AQI ${aqi} moderate. Sensitive groups reduce activity.`);
    performance.push("Slight performance drop. May feel winded faster.");
  }

  // VISIBILITY
  if (visibility < 1) {
    warnings.push("Dense fog. Can't see field/ball. Collision risk.");
    verdict[0] = "Cancel. Visibility under 1km unsafe for sports.";
  } else if (visibility < 5) {
    safety.push("Poor visibility. Extra caution. No long passes/shots.");
  }

  // HYDRATION BY HEAT
  if (heatIndex > 32 && wbgt < 28) {
    hydration.push("Heat index ${heatIndex}°C but WBGT ok. Still hydrate aggressively.");
    hydration.push("Drink before thirsty. Urine should be light yellow, not dark.");
  } else if (heatIndex > 27) {
    hydration.push("Drink 200ml every 15-20min. Don't wait for thirst.");
  }

  // KIDS SPECIFIC
  if (effectiveTemp > 32 || wbgt > 28) {
    safety.push("Kids overheat 3x faster than adults. Cancel youth sports.");
    warnings.push("Children can't regulate temp. Heat stroke happens fast.");
  }
  if (windChill < 5) {
    safety.push("Kids lose heat faster. Limit to 45min max. Constant movement.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (humidity > 85 && temp > 28) {
      warnings.push("Lagos heat + humidity = sweat doesn't evaporate. Body can't cool.");
      performance.push("Expect 20% performance drop. This is worse than dry heat.");
    }
  }

  const intros = [
    "Sports weather check:",
    "Athlete safety report:",
    "Game day conditions:",
    "Training weather:",
    "Zephye's sports rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (safety.length) response += ` Safety: ${safety.join(' ')}`;
  if (performance.length) response += ` Performance: ${performance.join(' ')}`;
  if (hydration.length) response += ` Hydration: ${hydration.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
