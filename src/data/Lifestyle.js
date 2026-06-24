import { 
  calcHeatIndex, 
  calcWindChill, 
  getComfortScore, 
  getPavementTemp, 
  getBurnTime,
  random 
} from './calculations';

export const sampleQuestions = [
  "Can I go jogging today?",
  "Is it good weather for a walk?",
  "Should I work out outside?",
  "Can I go to the park?",
  "Is it safe to run right now?",
  "Best time to exercise today?",
  "Can I walk my dog?",
  "Should I do outdoor yoga?",
  "Is it good cycling weather?"
];

export const getLifestyleAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, feelsLike, condition, humidity, wind, windGust, uvIndex, aqi, conditionCode, sunrise, sunset } = data;
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const pavementTemp = getPavementTemp(temp, condition);
  const burnMin = getBurnTime(uvIndex);

  let verdict = [];
  let tips = [];
  let warnings = [];
  let timing = [];

  // MAIN VERDICT LOGIC
  if (condition === 'thunderstorm') {
    verdict.push("Absolutely not. Thunderstorm = stay inside.");
    warnings.push("Lightning risk. Outdoor exercise dangerous.");
  } else if (isRaining && temp < 10) {
    verdict.push("Cold rain. Skip outdoor workout unless you have full waterproof gear.");
    warnings.push("Hypothermia risk if you get soaked.");
  } else if (isRaining && temp > 20) {
    verdict.push("Warm rain. Fine for a run if you don't mind getting wet.");
    tips.push("Wear moisture-wicking clothes. Avoid cotton.");
  } else if (effectiveTemp > 35) {
    verdict.push("Extreme heat. Outdoor exercise is risky.");
    warnings.push(`Heat index ${heatIndex}°C. Heatstroke risk after 20 min.`);
  } else if (effectiveTemp > 30) {
    verdict.push("Very hot. Only light exercise, early morning or after sunset.");
    tips.push("Hydrate every 15 min. Stick to shade.");
  } else if (effectiveTemp < 0) {
    verdict.push("Freezing. Frostbite risk on exposed skin.");
    warnings.push(`Wind chill ${windChill}°C. Cover all skin if you go out.`);
  } else if (effectiveTemp < 5) {
    verdict.push("Very cold. Short workouts only with layers.");
    tips.push("Warm up indoors first. Watch for icy patches.");
  } else if (windGust > 50) {
    verdict.push("Dangerous winds. Skip it.");
    warnings.push("Flying debris risk. Trees could fall.");
  } else if (comfort === "Perfect") {
    verdict.push("Perfect weather for any outdoor activity. Go enjoy it.");
  } else if (comfort === "Decent") {
    verdict.push("Good weather for jogging, walks, or park time.");
  } else {
    verdict.push("Uncomfortable but doable if you're motivated.");
  }

  // AIR QUALITY
  if (aqi > 150) {
    warnings.push(`AQI ${aqi} Unhealthy. Avoid cardio outside.`);
    verdict[0] = "Air quality too poor for exercise.";
  } else if (aqi > 100) {
    tips.push(`AQI ${aqi} Moderate. Reduce intensity. Walk instead of run.`);
  }

  // UV LOGIC
  if (uvIndex >= 8) {
    warnings.push(`Extreme UV. Burn time ~${burnMin} min.`);
    tips.push("SPF 50+, hat, sunglasses mandatory. Seek shade.");
  } else if (uvIndex >= 6) {
    tips.push("High UV. Sunscreen needed even for 30 min outside.");
  }

  // WIND LOGIC
  if (wind > 30 && wind < 50) {
    tips.push("Very windy. Cycling will be tough. Headwind on way back?");
  } else if (wind > 20) {
    tips.push("Breezy. Good for cooling but will mess with your pace.");
  }

  // PAVEMENT TEMP FOR DOGS/RUNNERS
  if (pavementTemp > 50) {
    warnings.push(`Pavement is ${pavementTemp}°C. Burns paws/feet in 60 sec.`);
    tips.push("Stick to grass. Or go before 8am / after 7pm.");
  }

  // TIMING ADVICE
  const now = new Date();
  const hour = now.getHours();
  if (temp > 28 && hour >= 11 && hour <= 16) {
    timing.push("Avoid 11am-4pm. Hottest part of day.");
  } else if (uvIndex > 6 && hour >= 10 && hour <= 15) {
    timing.push("UV peaks 10am-3pm. Go early or late.");
  } else if (temp < 10 && sunrise) {
    const sunriseHour = new Date(sunrise).getHours();
    timing.push(`Wait till after ${sunriseHour}:00am when it warms up.`);
  }
  if (sunset) {
    const sunsetHour = new Date(sunset).getHours();
    timing.push(`Sunset around ${sunsetHour}:00. Plan to finish before dark.`);
  }

  // ACTIVITY SPECIFIC
  if (wind < 10 && temp > 18 && temp < 28 && !isRaining) {
    tips.push("Perfect for yoga or stretching in the park.");
  }
  if (wind > 15 && wind < 25 && temp > 20) {
    tips.push("Good cycling weather — steady breeze helps.");
  }

  const intros = [
    "Outdoor activity check:",
    "Exercise forecast:",
    "Park weather report:",
    "Workout conditions:",
    "Zephye's activity rec:"
  ];

  let response = `${random(intros)} ${verdict.join(' ')}`;
  if (tips.length) response += ` ${tips.join(' ')}`;
  if (timing.length) response += ` Timing: ${timing.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response;
};
