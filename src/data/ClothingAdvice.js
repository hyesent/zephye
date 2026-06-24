import { calcHeatIndex, calcWindChill, random } from './calculations';

export const sampleQuestions = [
  "What should I wear today?",
  "Do I need an umbrella?",
  "Is it cold outside?",
  "Should I bring a jacket?",
  "Can I wear shorts?",
  "Do I need a raincoat?",
  "Is it hoodie weather?",
  "Should I wear sandals?",
  "Will I need sunglasses?"
];

export const getClothingAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, feelsLike, condition, humidity, wind, windGust, uvIndex } = data;
  const realFeel = feelsLike || temp;
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isCloudy = ['clouds', 'partly-cloudy'].includes(condition);
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : realFeel;

  let layers = [];
  let accessories = [];
  let warnings = [];

  // BASE LAYER - Temperature logic
  if (effectiveTemp <= 0) {
    layers.push("Thermal base layer, heavy winter coat, insulated gloves, beanie, scarf. Frostbite risk.");
  } else if (effectiveTemp <= 5) {
    layers.push("Heavy coat, sweater, gloves, beanie needed. It's freezing.");
  } else if (effectiveTemp <= 10) {
    layers.push("Winter jacket or thick hoodie. Long pants and closed shoes.");
  } else if (effectiveTemp <= 15) {
    layers.push("Light jacket, hoodie, or sweater. Jeans are fine.");
  } else if (effectiveTemp <= 20) {
    layers.push("Long sleeves or light jacket for morning/evening. T-shirt ok midday.");
  } else if (effectiveTemp <= 25) {
    layers.push("T-shirt and shorts or light pants. Perfect weather.");
  } else if (effectiveTemp <= 30) {
    layers.push("Light clothes — cotton t-shirt, shorts. It's warm.");
  } else if (effectiveTemp <= 35) {
    layers.push("Heatwave gear: linen, tank top, shorts. Avoid dark colors.");
  } else {
    layers.push("Extreme heat. Minimal loose clothing, light colors only. Heatstroke risk.");
    warnings.push("Limit time outside 11am-4pm.");
  }

  // RAIN LOGIC
  if (isRaining) {
    if (temp > 25) accessories.push("Light waterproof jacket or poncho. Umbrella — it's warm rain.");
    else if (temp > 15) accessories.push("Raincoat + hoodie. Waterproof shoes. Umbrella.");
    else accessories.push("Heavy waterproof coat. Waterproof boots. Umbrella won't be enough.");
  } else if (condition === 'drizzle') {
    accessories.push("Light rain possible. Foldable umbrella or water-resistant jacket.");
  } else if (isCloudy && humidity > 75) {
    accessories.push("Might drizzle later. Pack a foldable umbrella just in case.");
  }

  // WIND LOGIC
  if (wind > 40 || windGust > 50) {
    accessories.push("Very gusty. Windbreaker mandatory. Avoid loose hats.");
    warnings.push("High wind warning — secure loose items.");
  } else if (wind > 25) {
    accessories.push("Windbreaker or denim jacket. Hair will get messy.");
  } else if (wind > 15 && temp < 20) {
    accessories.push("Light wind. Extra layer helps cut the chill.");
  }

  // UV/SUN LOGIC
  if (uvIndex >= 11) {
    accessories.push("Extreme UV. Wide-brim hat, UV shirt, SPF 50+ mandatory.");
    warnings.push("Burn time under 5 min. Seek shade 10am-4pm.");
  } else if (uvIndex >= 8) {
    accessories.push("Very high UV. Hat, sunglasses, SPF 50. Reapply every 2hrs.");
  } else if (uvIndex >= 6) {
    accessories.push("High UV. Sunglasses + hat. SPF 30+ if outside >30min.");
  } else if (uvIndex >= 3 && condition === 'clear') {
    accessories.push("Moderate UV. Sunglasses recommended.");
  }

  // HUMIDITY LOGIC
  if (humidity > 85 && temp > 28) {
    accessories.push("Muggy. Breathable fabrics only — cotton, linen. You'll sweat.");
    warnings.push("High humidity = feels hotter. Hydrate constantly.");
  } else if (humidity < 30 && temp > 25) {
    accessories.push("Desert dry. Lip balm + moisturizer. Static risk.");
  }

  // SPECIAL COMBOS
  if (isRaining && temp < 10) warnings.push("Cold rain = hypothermia risk if you get soaked. Waterproof everything.");
  if (condition === 'clear' && temp > 30 && wind < 5) warnings.push("No breeze + blazing sun. Heat exhaustion risk.");
  if (windChill < 0 && windChill !== temp) warnings.push(`Wind chill: ${windChill}°C. Dress for that, not ${temp}°C.`);

  // FOOTWEAR
  if (isRaining || condition === 'thunderstorm') accessories.push("Waterproof shoes or boots. Avoid canvas.");
  else if (temp > 30) accessories.push("Sandals or breathable sneakers are fine.");
  else if (temp < 10) accessories.push("Insulated boots or thick socks + closed shoes.");

  const intros = [
    "Outfit check:",
    "Here's what I'd wear:",
    "Weather fit for today:",
    "Dress code:",
    "Zephye's fit rec:"
  ];

  let response = `${random(intros)} ${layers.join(' ')}`;
  if (accessories.length) response += ` ${accessories.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response;
};calculations'
