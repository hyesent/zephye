import { 
  calcGrowingDegreeDays,
  calcEvapotranspiration,
  calcDewPoint,
  getComfortScore,
  random 
} from './calculations';

export const sampleQuestions = [
  "Should I water my crops today?",
  "Is it good weather for planting?",
  "Will there be frost tonight?",
  "Do I need to irrigate?",
  "Is it safe to spray pesticides?",
  "Will rain damage my crops?",
  "Is it good harvesting weather?",
  "Should I cover my plants?",
  "Will humidity cause crop disease?"
];

export const getFarmingAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, tempMax, tempMin, humidity, wind, condition, conditionCode, uvIndex, visibility, city } = data;
  const dewPoint = calcDewPoint(temp, humidity);
  const gdd = calcGrowingDegreeDays(tempMax, tempMin, 10); // base 10°C for most crops
  const et = calcEvapotranspiration(tempMax, humidity, wind); // mm/day water loss
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const comfort = getComfortScore({ temp, humidity, wind });

  let verdict = [];
  let irrigation = [];
  let planting = [];
  let warnings = [];
  let pestControl = [];

  // GROWING DEGREE DAYS
  if (gdd > 15) {
    planting.push(`GDD ${gdd} = fast growth. Great for corn, tomatoes, peppers.`);
  } else if (gdd > 10) {
    planting.push(`GDD ${gdd} = moderate growth. Good for most crops.`);
  } else if (gdd > 5) {
    planting.push(`GDD ${gdd} = slow growth. Cool season crops only: lettuce, spinach.`);
  } else {
    planting.push(`GDD ${gdd} = minimal growth. Too cold for most planting.`);
    warnings.push("Soil temp too low. Seeds may rot.");
  }

  // IRRIGATION NEEDS
  if (isRaining) {
    irrigation.push("Rain today. Skip irrigation. Check for waterlogging.");
    if (condition === 'thunderstorm') {
      warnings.push("Heavy rain = flooding risk. Check drainage.");
    }
  } else if (et > 6) {
    irrigation.push(`High evapotranspiration ${et}mm/day. Crops losing water fast.`);
    irrigation.push("Irrigate early morning. Soil will be dry by evening.");
    if (temp > 32) warnings.push("Extreme heat + high ET = crop stress. Water twice if possible.");
  } else if (et > 4) {
    irrigation.push(`Moderate ET ${et}mm/day. Check soil moisture. Irrigate if top 2cm dry.`);
  } else if (et > 2) {
    irrigation.push(`Low ET ${et}mm/day. Hold irrigation unless wilting.`);
  } else {
    irrigation.push("Minimal water loss. No irrigation needed.");
  }

  // FROST RISK
  if (tempMin <= 2) {
    warnings.push(`Frost risk tonight. Low ${tempMin}°C.`);
    warnings.push("Cover tender plants. Tomatoes, peppers, basil will die.");
    planting.push("Do NOT plant warm-season crops. Wait till lows >10°C.");
  } else if (tempMin <= 5) {
    warnings.push(`Cold night ${tempMin}°C. Frost possible in low areas.`);
    planting.push("Risky for seedlings. Use row covers.");
  }

  // HEAT STRESS
  if (tempMax > 35) {
    warnings.push(`Extreme heat ${tempMax}°C. Crop sunburn risk.`);
    warnings.push("Shade cloth for leafy greens. Lettuce will bolt.");
    irrigation.push("Increase irrigation 50%. Check for wilting at noon.");
  } else if (tempMax > 32) {
    warnings.push("Heat stress likely. Pollination fails above 32°C for tomatoes/beans.");
    irrigation.push("Water at dawn. Avoid midday irrigation — wastes water.");
  }

  // HUMIDITY & DISEASE
  if (humidity > 85 && temp > 20) {
    warnings.push("High humidity = fungal disease risk. Blight, mildew, rust.");
    pestControl.push("Avoid overhead watering. Water at soil level.");
    pestControl.push("Increase plant spacing for airflow. Spray fungicide if needed.");
  } else if (humidity < 30 && temp > 28) {
    warnings.push("Dry air = spider mites love this. Check underside of leaves.");
    irrigation.push("Mist leaves early morning to raise humidity.");
  }

  // DEW POINT
  if (dewPoint > 20) {
    warnings.push("Dew point ${dewPoint}°C = heavy morning dew. Fungal spores spread.");
    pestControl.push("Spray fungicide at dawn before dew dries.");
  }

  // WIND
  if (wind > 30) {
    warnings.push(`High wind ${wind}km/h. Will damage tall crops.`);
    warnings.push("Stake tomatoes, corn. Wind burn on leaves.");
    pestControl.push("DO NOT spray pesticides. Drift risk. Wait till wind <15km/h.");
  } else if (wind > 20) {
    pestControl.push("Windy. Pesticide spray will drift. Spray early morning when calm.");
  } else if (wind < 5 && humidity > 80) {
    warnings.push("Stagnant air = disease risk. No breeze to dry leaves.");
  }

  // RAIN TIMING
  if (conditionCode >= 51 && conditionCode <= 67) {
    planting.push("Light rain = perfect for transplanting. Soil workable.");
    pestControl.push("Don't spray — rain will wash it off. Wait 24hrs after rain.");
  } else if (condition === 'thunderstorm') {
    warnings.push("Thunderstorms = hail risk. Cover high-value crops if possible.");
  }

  // HARVESTING
  if (!isRaining && humidity < 70 && wind < 20) {
    planting.push("Good harvest weather. Crops will store well.");
  } else if (humidity > 80) {
    warnings.push("High humidity = harvested crops mold fast. Dry ASAP.");
  }

  // UV
  if (uvIndex >= 8) {
    warnings.push(`Extreme UV ${uvIndex}. Leaf scorch on tender plants.`);
    irrigation.push("UV increases water needs. Check soil 2x today.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos') && isRaining && temp > 25) {
    warnings.push("Lagos warm rain = rapid fungal growth. Spray preventative fungicide.");
  }

  const intros = [
    "Farm weather report:",
    "Crop conditions:",
    "Field forecast:",
    "Growing conditions:",
    "Zephye's farm rec:"
  ];

  let response = `${random(intros)} For ${city}: `;
  
  if (planting.length) response += `Planting: ${planting.join(' ')} `;
  if (irrigation.length) response += `Irrigation: ${irrigation.join(' ')} `;
  if (pestControl.length) response += `Pest/Disease: ${pestControl.join(' ')} `;
  if (warnings.length) response += `Warning: ${warnings.join(' ')}`;

  return response.trim();
};
