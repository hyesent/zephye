import {
  calcHeatIndex,
  calcWindChill,
  getBurnTime,
  getComfortScore,
  mapWeatherCode,
  random
} from './calculations';

export const sampleQuestions = [
  "Should I have my wedding outdoors today?",
  "Is it good weather for a picnic?",
  "Can I host a BBQ this weekend?",
  "Is it safe for an outdoor concert?",
  "Should I move my event indoors?",
  "Will rain cancel my party?",
  "Is it too windy for tents?",
  "Good weather for a beach day?",
  "Should I rent heaters for my event?"
];

export const getEventsAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, feelsLike, tempMax, tempMin, conditionCode, humidity, wind, uvIndex, aqi, visibility, precipitation, city } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);

  let verdict = [];
  let setup = [];
  let guestComfort = [];
  let warnings = [];
  let contingency = [];

  // MAIN VERDICT
  if (condition === 'thunderstorm') {
    verdict.push("Thunderstorms. Outdoor events unsafe.");
    warnings.push("Lightning risk. Cancel or move indoors immediately.");
    contingency.push("Have indoor backup venue ready. Tents are NOT lightning safe.");
  } else if (isRaining && precipitation > 5) {
    verdict.push("Heavy rain expected. Outdoor events will be miserable.");
    warnings.push("Guests get soaked. Equipment damage risk. Mud everywhere.");
    contingency.push("Waterproof tents + raised flooring needed. Or postpone.");
  } else if (isRaining) {
    verdict.push("Light rain/drizzle. Outdoor events possible with cover.");
    setup.push("Waterproof tents required. Umbrellas for guests.");
    warnings.push("Slippery surfaces. Electrical equipment risk.");
  } else if (wind > 40) {
    verdict.push("Extreme winds ${wind}km/h. Dangerous for outdoor setups.");
    warnings.push("Tents will collapse. Decorations fly away. Sound equipment falls.");
    contingency.push("Cancel outdoor. Wind >40km/h unsafe for any temporary structure.");
  } else if (wind > 25) {
    verdict.push("Very windy. Risky for tents and decor.");
    setup.push("Sandbags on everything. No loose tablecloths, balloons, or signage.");
    warnings.push("Wind chill makes it feel ${windChill}°C. Guests will be cold.");
  } else if (effectiveTemp > 38) {
    verdict.push("Extreme heat ${heatIndex}°C. Dangerous for outdoor events.");
    warnings.push("Heat stroke risk. Elderly/kids especially vulnerable.");
    guestComfort.push("Provide shade, misting fans, cold water stations. Limit to 2hrs max.");
    contingency.push("Have air-conditioned indoor backup. Medical staff on standby.");
  } else if (effectiveTemp < 0) {
    verdict.push("Freezing ${windChill}°C. Outdoor events unsafe without heating.");
    warnings.push("Hypothermia risk. Frostbite in 30min exposed skin.");
    setup.push("Industrial heaters, enclosed tents, hot drinks mandatory.");
    guestComfort.push("Warn guests: heavy coats, gloves, boots required.");
  } else if (comfort === "Poor" || comfort === "Extreme") {
    verdict.push("Weather uncomfortable. Guests won't enjoy outdoor event.");
    guestComfort.push(`${comfort} conditions. ${effectiveTemp}°C feels like.`);
    contingency.push("Have indoor option. Or provide heaters/fans + shade.");
  } else if (comfort === "Good" || comfort === "Perfect") {
    verdict.push("Perfect weather for outdoor events.");
    guestComfort.push(`${comfort} conditions. ${temp}°C with ${humidity}% humidity.`);
    setup.push("Minimal weather prep needed. Guests will be comfortable.");
  } else {
    verdict.push("Weather acceptable for outdoor events with precautions.");
  }

  // HEAT SPECIFIC
  if (effectiveTemp >= 30 && effectiveTemp <= 37) {
    guestComfort.push("Hot day. Provide shade structures + cold water every 15min.");
    setup.push("Misting fans reduce temp 5-8°C. Rent them.");
    warnings.push(`UV ${uvIndex} = burn time ~${burnMin}min. Provide sunscreen stations.`);
  }

  // COLD SPECIFIC
  if (effectiveTemp <= 10 && effectiveTemp > 0) {
    guestComfort.push("Chilly. Guests need jackets.");
    setup.push("Patio heaters every 10ft. Enclosed tents hold heat better.");
    warnings.push("Food gets cold fast. Use chafing dishes.");
  }

  // WIND FOR SETUP
  if (wind > 15 && wind <= 25) {
    setup.push("Breezy. Secure all lightweight decor. Weight tablecloths.");
    warnings.push("Sound carries badly. Need extra speakers facing wind.");
  }

  // RAIN PROBABILITY
  if (conditionCode >= 51 && conditionCode <= 67 && precipitation < 2) {
    contingency.push("Light rain possible. Have 20% extra tent space for crowd crush.");
    setup.push("Plastic covers for electronics. Non-slip mats at entrances.");
  }

  // AIR QUALITY
  if (aqi > 150) {
    warnings.push(`AQI ${aqi} Unhealthy. Outdoor events risky for asthma/heart conditions.`);
    guestComfort.push("Provide N95 masks. Have medical tent. Limit physical activity.");
    contingency.push("Move indoors with air filtration if possible.");
  } else if (aqi > 100) {
    guestComfort.push(`AQI ${aqi} moderate. Sensitive guests should know.`);
    setup.push("Avoid grills/BBQs — adds to air pollution.");
  }

  // VISIBILITY
  if (visibility < 2) {
    warnings.push("Dense fog. Guests may get lost driving. Decorations invisible.");
    setup.push("Extra lighting for pathways. Reflective markers.");
  }

  // UV
  if (uvIndex >= 6 && !isRaining) {
    guestComfort.push(`High UV ${uvIndex}. Shade structures mandatory.`);
    setup.push("Sunscreen stations. Wide-brim hat dress code suggestion.");
  }

  // NIGHT EVENTS
  if (tempMin < 15) {
    warnings.push(`Night temps drop to ${tempMin}°C. Evening guests will get cold.`);
    setup.push("Heaters + blankets for after sunset. Guests underdress for daytime temp.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (isRaining && temp > 26) {
      warnings.push("Lagos rain = instant flooding. Check venue drainage.");
      setup.push("Raised platforms. No ground-level electronics.");
    }
    if (humidity > 80) {
      guestComfort.push("Lagos humidity = everyone sweats. Extra fans + cold towels.");
    }
  }

  // TIMING ADVICE
  if (tempMax > 32) {
    timing.push("Avoid 12pm-4pm. Schedule event for morning or after 5pm.");
  }
  if (condition === 'rain' && precipitation > 3) {
    timing.push("Delay start 2hrs. Check radar — storms often pass fast.");
  }

  const intros = [
    "Event weather check:",
    "Outdoor event forecast:",
    "Venue conditions:",
    "Event planning weather:",
    "Zephye's event rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (setup.length) response += ` Setup: ${setup.join(' ')}`;
  if (guestComfort.length) response += ` Guest comfort: ${guestComfort.join(' ')}`;
  if (contingency.length) response += ` Contingency: ${contingency.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
