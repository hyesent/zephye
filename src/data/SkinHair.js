import { 
  calcDewPoint, 
  getBurnTime, 
  calcHeatIndex,
  random 
} from './calculations';

export const sampleQuestions = [
  "Will my hair get frizzy today?",
  "Do I need sunscreen?",
  "Is it bad for my skin today?",
  "Will my makeup melt?",
  "Should I moisturize more?",
  "Is the air drying my skin?",
  "Do I need a hat?",
  "Will I get sunburned?",
  "Is it humid enough for curly hair?"
];

export const getSkinHairAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, humidity, uvIndex, wind, condition, feelsLike } = data;
  const dewPoint = calcDewPoint(temp, humidity);
  const heatIndex = calcHeatIndex(temp, humidity);
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  
  let verdict = [];
  let hairTips = [];
  let skinTips = [];
  let warnings = [];

  // DEW POINT = FRIZZ BIBLE
  if (dewPoint > 21) {
    hairTips.push("Dew point over 21°C = frizz apocalypse. Humidity is brutal.");
    hairTips.push("Silicone serum, anti-humidity spray, or protective style mandatory.");
    hairTips.push("Avoid heat styling. It won't hold.");
  } else if (dewPoint > 16) {
    hairTips.push("Dew point 16-21°C = moderate frizz risk. Lightweight serum helps.");
    hairTips.push("Diffuser + gel if you're curly. Avoid touching hair.");
  } else if (dewPoint > 10) {
    hairTips.push("Dew point 10-16°C = perfect hair day. Low frizz, good hold.");
  } else if (dewPoint > 0) {
    hairTips.push("Dew point below 10°C = dry air. Static risk.");
    hairTips.push("Leave-in conditioner + oil. Hydrating mask tonight.");
  } else {
    hairTips.push("Dew point below 0°C = desert dry. Hair will be brittle.");
    hairTips.push("Deep condition. Avoid heat. Humidifier at night.");
  }

  // UV & SUN PROTECTION
  if (uvIndex >= 11) {
    skinTips.push("Extreme UV. You'll burn in under 5 min.");
    warnings.push(`Burn time ~${burnMin} min for average skin. SPF 50+ reapply every 80 min.`);
    skinTips.push("Wide-brim hat, UV shirt, sunglasses. Shade 10am-4pm.");
  } else if (uvIndex >= 8) {
    skinTips.push("Very high UV. Burn time ~10 min.");
    warnings.push(`Burn time ~${burnMin} min. SPF 50 mandatory.`);
    skinTips.push("Hat + sunglasses. Reapply sunscreen every 2hrs.");
  } else if (uvIndex >= 6) {
    skinTips.push("High UV. SPF 30+ needed even for 30 min outside.");
    skinTips.push("Lip balm with SPF. Scalp burns too.");
  } else if (uvIndex >= 3) {
    skinTips.push("Moderate UV. SPF 15+ if you're outside over 1hr.");
  } else if (condition === 'clear' && uvIndex >= 1) {
    skinTips.push("Low but present UV. SPF if you're fair-skinned.");
  }

  // TEMPERATURE & HEAT
  if (heatIndex > 35) {
    skinTips.push("Extreme heat = sweat will melt makeup. Setting spray + primer.");
    warnings.push(`Heat index ${heatIndex}°C. Skin dehydration risk. Drink water.`);
    skinTips.push("Blotting papers. Avoid heavy foundation.");
  } else if (heatIndex > 30) {
    skinTips.push("Hot + humid = oily skin. Mattifying products. Lightweight moisturizer.");
    hairTips.push("Hair will get greasy fast. Dry shampoo at noon.");
  } else if (temp < 5) {
    skinTips.push("Freezing = chapped lips, windburn, flaky skin.");
    skinTips.push("Thick cream, occlusive balm, hand cream. No exfoliating today.");
    hairTips.push("Cold makes hair brittle. Avoid tight ponytails.");
  } else if (temp < 10) {
    skinTips.push("Cold = dry skin. Switch to heavier moisturizer.");
    skinTips.push("Lip balm + hand cream in your bag.");
  }

  // WIND EFFECTS
  if (wind > 30) {
    hairTips.push("High winds = tangles + breakage. Braid or bun it.");
    skinTips.push("Windburn risk. Occlusive layer + lip balm.");
    warnings.push("Dust in air. Wash face when you get home.");
  } else if (wind > 20) {
    hairTips.push("Windy. Hair tie + leave-in conditioner to prevent knots.");
    skinTips.push("Lips will chap. Balm up.");
  }

  // HUMIDITY DIRECT EFFECTS
  if (humidity > 85 && temp > 25) {
    skinTips.push("Muggy = pores clogged. Double cleanse tonight.");
    skinTips.push("Oil-free moisturizer. Blotting papers midday.");
    hairTips.push("Curls will be undefined. Gel + humidity shield.");
  } else if (humidity < 30) {
    skinTips.push("Dry air = tight skin. Hyaluronic acid + seal with cream.");
    skinTips.push("Cuticles will crack. Cuticle oil now.");
    hairTips.push("Static city. Anti-static spray or dryer sheet trick.");
  }

  // RAIN EFFECTS
  if (isRaining) {
    hairTips.push("Rain = instant frizz if you step out. Hood or umbrella.");
    skinTips.push("Waterproof mascara or skip eye makeup.");
    if (temp < 15) warnings.push("Cold rain = hypothermia if you get soaked. Affects skin barrier.");
  }

  // SPECIAL COMBOS
  if (uvIndex > 6 && wind > 20) {
    warnings.push("Sun + wind = double burn risk. Wind cools you so you don't feel burning.");
  }
  if (dewPoint > 18 && temp > 28) {
    verdict.push("Sweat + humidity = makeup meltdown day.");
    skinTips.push("Powder, setting spray, waterproof everything.");
  }
  if (dewPoint < 5 && wind > 15) {
    warnings.push("Dry + windy = worst combo for skin barrier. Slug with Vaseline tonight.");
  }

  const intros = [
    "Beauty weather report:",
    "Skin + hair forecast:",
    "For your glow-up:",
    "Beauty conditions:",
    "Zephye's beauty rec:"
  ];

  let response = `${random(intros)} `;
  
  if (hairTips.length) response += `Hair: ${hairTips.join(' ')} `;
  if (skinTips.length) response += `Skin: ${skinTips.join(' ')} `;
  if (warnings.length) response += `Warning: ${warnings.join(' ')}`;
  
  if (!hairTips.length && !skinTips.length) response += "No major weather risks for skin/hair today. Normal routine is fine.";

  return response.trim();
};
