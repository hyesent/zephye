import {
  calcHeatIndex,
  calcWindChill,
  getComfortScore,
  random
} from '../utils/calculations';

export const sampleQuestions = [
  "Should I run AC today?",
  "Will my heating bill be high?",
  "Is it good weather to air out the house?",
  "Should I close windows?",
  "Do I need to run a dehumidifier?",
  "Will solar panels work well today?",
  "Should I use fans or AC?",
  "Is it cheap to heat the house today?",
  "Should I run the dryer or hang clothes outside?"
];

export const getEnergyHomeAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, feelsLike, humidity, wind, condition, conditionCode, uvIndex, aqi, visibility, city } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const cloudCover = mapWeatherCode(conditionCode);

  let verdict = [];
  let heating = [];
  let cooling = [];
  let ventilation = [];
  let appliances = [];
  let solar = [];
  let savings = [];
  let warnings = [];

  // MAIN TEMP VERDICT
  if (effectiveTemp > 29) {
    verdict.push("Hot day. AC needed for comfort.");
    cooling.push(`Heat index ${heatIndex}°C. AC will run constantly.`);
    cooling.push("Set AC to 24-26°C. Each degree lower = 6% more energy.");
    savings.push("Use ceiling fans + AC. Fan makes it feel 3°C cooler.");
    warnings.push("Peak electricity rates likely. Pre-cool house before 2pm.");
  } else if (effectiveTemp > 24) {
    verdict.push("Warm. Cooling recommended.");
    cooling.push("Fans may be enough. AC if humidity >60%.");
    savings.push("Open windows at night, close before 9am to trap cool air.");
  } else if (effectiveTemp >= 18 && effectiveTemp <= 24) {
    verdict.push("Perfect temp. No heating/cooling needed.");
    savings.push("Ideal free cooling. Open windows. Turn HVAC off.");
    ventilation.push("Best day to air out house. Low energy cost.");
  } else if (effectiveTemp >= 10) {
    verdict.push("Cool. Light heating may be needed.");
    heating.push(`Feels like ${effectiveTemp}°C. Sweater weather.`);
    savings.push("Space heater cheaper than whole house if only 1 room.");
  } else if (effectiveTemp >= 0) {
    verdict.push("Cold. Heating required.");
    heating.push(`Wind chill ${windChill}°C. Heat loss through walls/windows high.`);
    heating.push("Set thermostat to 20°C. Every degree higher = 8% more cost.");
    warnings.push("Close curtains at night. 25% heat lost through windows.");
  } else {
    verdict.push("Freezing. Max heating needed.");
    heating.push(`Extreme cold ${windChill}°C. Pipes may freeze below -6°C.`);
    warnings.push("Let faucets drip. Open cabinet doors. Prevent $5000 pipe burst.");
    heating.push("Heat 24/7. Turning off costs more to reheat than maintain.");
  }

  // HUMIDITY
  if (humidity > 70) {
    appliances.push("High humidity = AC works harder. Remove moisture first.");
    appliances.push("Run dehumidifier. AC wastes energy cooling water vapor.");
    ventilation.push("Don't open windows. You'll let humid air in = AC runs 30% more.");
    warnings.push("Mold grows >60% humidity. Keep indoor <50%.");
    savings.push("Dehumidifier 300W vs AC 3500W. Use dehumidifier + fan instead.");
  } else if (humidity < 30) {
    heating.push("Dry air feels colder. You overheat to compensate.");
    appliances.push("Humidifier makes 20°C feel like 22°C. Saves heating cost.");
    ventilation.push("Dry air = static, dry skin, cracked wood. Add moisture.");
  } else {
    ventilation.push(`Ideal humidity ${humidity}%. Comfortable + energy efficient.`);
  }

  // VENTILATION
  if (!isRaining && aqi <= 100 && wind < 25) {
    ventilation.push("Good day to air out house. Open windows 15min.");
    ventilation.push("Cross-ventilation: open windows on opposite sides.");
    savings.push("Fresh air = free. Beats running AC if temp 18-26°C.");
  } else if (isRaining) {
    ventilation.push("Rain = close windows. Humidity enters = mold + AC overwork.");
    warnings.push("Wet air infiltration increases cooling cost 40%.");
  } else if (aqi > 100) {
    ventilation.push(`AQI ${aqi} moderate/bad. Keep windows closed.`);
    warnings.push("Outdoor pollution enters. Run AC on recirculate + air purifier.");
    appliances.push("Air purifier 50W vs health cost. Use it.");
  } else if (wind > 25) {
    ventilation.push("Too windy. Open windows = dust, debris, papers flying.");
    warnings.push("Wind forces cold/hot air in. Increases HVAC load.");
  }

  // SOLAR
  if (cloudCover < 20 && uvIndex >= 6) {
    solar.push("Excellent solar generation today. Clear + high UV.");
    solar.push("Peak: 10am-3pm. Run dishwasher, laundry, EV charging then.");
    savings.push("Solar covers 100% of AC load today. Zero grid cost midday.");
  } else if (cloudCover < 50) {
    solar.push("Good solar. 70-90% output expected.");
    savings.push("Shift energy use to daylight hours to maximize solar.");
  } else if (cloudCover < 80) {
    solar.push("Moderate solar. 40-60% output. Clouds reduce generation.");
    appliances.push("Avoid heavy loads 11am-3pm. Grid power expensive.");
  } else {
    solar.push("Poor solar. Overcast = 10-20% output.");
    warnings.push("Battery/solar won't cover AC. Expect grid draw + higher bill.");
  }

  if (isRaining) {
    solar.push("Rain cleans panels = good. But no generation during storm.");
  }

  // APPLIANCES
  if (!isRaining && humidity < 70 && wind > 5) {
    appliances.push("Perfect line-drying weather. Skip dryer = save $0.50/load.");
    appliances.push("Dryer = 3000W + heats house. AC works harder to remove that heat.");
    savings.push("Hang clothes outside. Dry in 2-3hrs. Zero energy cost.");
  } else if (isRaining || humidity > 80) {
    appliances.push("Too humid for line-dry. Clothes won't dry, may mildew.");
    appliances.push("Use dryer but run at night when electricity cheaper.");
  }

  if (effectiveTemp > 30) {
    appliances.push("Avoid oven/stove 3pm-7pm. Adds 2-3°C to house.");
    appliances.push("Microwave, grill outside, or cold meals. AC already struggling.");
    savings.push("Cooking heat = AC runs 15% longer. Costs add up.");
  }

  // WINDOWS/CURTAINS
  if (temp > 27 && uvIndex >= 6) {
    savings.push("Close blinds/curtains south+west facing. Blocks 30% heat gain.");
    savings.push("Solar heat gain through windows = 40% of AC load.");
  } else if (temp < 15 && cloudCover < 50) {
    savings.push("Open curtains south-facing. Free solar heat = 5-10% heating saved.");
    savings.push("Close at sunset. Windows lose 25% of heat at night.");
  }

  // WIND
  if (wind > 20) {
    warnings.push("Wind increases air infiltration. House loses heat/cool 20% faster.");
    heating.push("Check for drafts. Weatherstrip doors = save 15% heating.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (humidity > 80 && temp > 28) {
      cooling.push("Lagos heat+humidity = AC mandatory. Dehumidify mode saves 20%.");
      warnings.push("Power cuts common. AC surge when power returns trips breakers.");
      savings.push("Inverter AC + solar essential. Grid unreliable + expensive.");
    }
    if (isRaining) {
      warnings.push("Lagos rain = flooding. Unplug appliances. Surge protector mandatory.");
    }
  }

  // ENERGY SAVINGS TIPS
  if (effectiveTemp >= 22 && effectiveTemp <= 26) {
    savings.push("Sweet spot temp. Turn off HVAC. Fan uses 98% less energy than AC.");
  }

  if (comfort === "Perfect" || comfort === "Good") {
    savings.push("Comfortable weather = lowest energy bill day. Take advantage.");
  }

  const intros = [
    "Home energy report:",
    "HVAC forecast:",
    "Energy cost check:",
    "Home efficiency tips:",
    "Zephye's energy rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (heating.length) response += ` Heating: ${heating.join(' ')}`;
  if (cooling.length) response += ` Cooling: ${cooling.join(' ')}`;
  if (ventilation.length) response += ` Ventilation: ${ventilation.join(' ')}`;
  if (appliances.length) response += ` Appliances: ${appliances.join(' ')}`;
  if (solar.length) response += ` Solar: ${solar.join(' ')}`;
  if (savings.length) response += ` Savings: ${savings.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
