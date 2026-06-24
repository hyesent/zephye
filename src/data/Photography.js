import {
  calcGoldenHour,
  getCloudCover,
  getComfortScore,
  mapWeatherCode,
  random
} from './calculations';

export const sampleQuestions = [
  "Is it good lighting for photos today?",
  "Should I do a photoshoot now?",
  "Is golden hour good today?",
  "Will clouds ruin my photos?",
  "Good weather for outdoor photography?",
  "Is it too harsh for portraits?",
  "Best time for landscape photos?",
  "Will rain affect my shoot?",
  "Should I bring lighting equipment?"
];

export const getPhotographyAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { conditionCode, cloudCover, condition, humidity, wind, uvIndex, visibility, sunrise, sunset, temp, city } = data;
  const cloudPercent = getCloudCover(conditionCode);
  const goldenHour = calcGoldenHour(sunrise, sunset);
  const comfort = getComfortScore({ temp, humidity, wind });

  let verdict = [];
  let lighting = [];
  let timing = [];
  let warnings = [];
  let gear = [];

  // CLOUD COVER = LIGHTING QUALITY
  if (cloudPercent >= 90) {
    verdict.push("Overcast sky. Flat, diffused light.");
    lighting.push("Perfect for portraits. No harsh shadows. Soft on skin.");
    lighting.push("Bad for landscapes — sky is boring white. No drama.");
    gear.push("No reflector needed. Bring LED panel if too dark.");
  } else if (cloudPercent >= 60) {
    verdict.push("Mostly cloudy. Soft light with some breaks.");
    lighting.push("Great for portraits. Clouds act as giant softbox.");
    lighting.push("Decent for landscapes if sun peeks through for rays.");
  } else if (cloudPercent >= 30) {
    verdict.push("Partly cloudy. Dynamic lighting.");
    lighting.push("Best of both: sun for drama, clouds for diffusion.");
    lighting.push("Perfect for landscapes. Clouds add texture to sky.");
    warnings.push("Light changes fast. Shoot quick or wait for cloud cover.");
  } else if (cloudPercent >= 10) {
    verdict.push("Mostly clear. Harsh direct sun.");
    lighting.push("Terrible for midday portraits. Harsh shadows, squinting.");
    lighting.push("Good for landscapes if you want deep blue sky + contrast.");
    gear.push("Bring scrim/diffuser for portraits. Or shoot in open shade.");
    warnings.push("Shoot at golden hour only. 11am-3pm = unflattering light.");
  } else {
    verdict.push("Clear sky. Extreme contrast.");
    lighting.push("Bad for portraits unless golden hour. Midday = raccoon eyes.");
    lighting.push("Good for architectural shots. Sharp shadows = drama.");
    gear.push("ND filter needed for long exposure. Polarizer for sky.");
    warnings.push("UV ${uvIndex} is high. Models will squint + sweat.");
  }

  // GOLDEN HOUR
  if (goldenHour && sunrise && sunset) {
    timing.push(`Golden hour: ${goldenHour.start} - ${goldenHour.end}.`);
    timing.push("Warm, soft, directional light. Best for portraits + landscapes.");
    if (cloudPercent < 30) {
      timing.push("Clear golden hour = magic. Sun will be orange glow.");
    } else if (cloudPercent > 60) {
      timing.push("Cloudy golden hour = soft pink light. Still good but less dramatic.");
    }
  }

  // BLUE HOUR
  if (sunrise && sunset) {
    const sunriseTime = new Date(sunrise);
    const blueHourStart = new Date(sunriseTime.getTime() - 30 * 60000);
    const format = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    timing.push(`Blue hour: ~${format(blueHourStart)} before sunrise. Cool tones, city lights balanced.`);
  }

  // RAIN
  if (condition === 'rain' || condition === 'drizzle') {
    warnings.push("Rain = reflections, moody shots. But protect gear.");
    lighting.push("Wet streets = amazing reflections. Colors pop.");
    gear.push("Rain cover for camera. Microfiber cloths. Umbrella for model.");
    verdict[0] = "Bad for client shoots. Good for artistic street photography.";
  } else if (condition === 'thunderstorm') {
    warnings.push("Thunderstorm = unsafe. Lightning + electronics = bad.");
    verdict[0] = "Do NOT shoot outdoors. Wait it out.";
  }

  // WIND
  if (wind > 30) {
    warnings.push(`High wind ${wind}km/h. Hair will be messy. Tripod shakes.`);
    gear.push("Sandbags for light stands. Weight down tripod.");
    lighting.push("Avoid flowy dresses. Or embrace wind for drama.");
  } else if (wind > 15) {
    warnings.push("Breezy. Secure reflectors. Hair movement in portraits.");
  } else if (wind < 5) {
    lighting.push("Calm air = still water reflections. Perfect for lake landscapes.");
  }

  // HUMIDITY
  if (humidity > 85) {
    warnings.push("High humidity = hazy photos. Distant objects look soft.");
    gear.push("Lens hood to prevent condensation. Silica gel packs.");
    lighting.push("Bad for telephoto landscapes. Good for misty forest mood.");
  } else if (humidity < 30) {
    lighting.push("Dry air = crystal clear. Distant mountains sharp.");
    warnings.push("Static electricity. Dust sticks to sensor.");
  }

  // UV
  if (uvIndex >= 8) {
    warnings.push(`Extreme UV ${uvIndex}. Models burn fast.`);
    gear.push("Sunscreen for everyone. Shoot in shade 11am-3pm.");
  } else if (uvIndex <= 2) {
    lighting.push("Low UV = soft light all day. Good for portraits even at noon.");
  }

  // VISIBILITY
  if (visibility < 5) {
    warnings.push(`Fog/haze. Visibility ${visibility}km.`);
    lighting.push("Perfect for moody, ethereal shots. Depth disappears.");
    verdict[0] = "Bad for landscapes. Amazing for forest/fog portraits.";
  } else if (visibility > 15) {
    lighting.push("Clear air = maximum detail. Distant landscapes pop.");
  }

  // TEMPERATURE COMFORT
  if (comfort === "Extreme") {
    warnings.push(`Temp ${temp}°C = models suffer. Keep shoot under 30min.`);
    gear.push("Water, shade, battery fans. Check camera overheat.");
  } else if (comfort === "Poor") {
    warnings.push("Uncomfortable weather. Models won't look happy.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (condition === 'rain' && temp > 25) {
      lighting.push("Lagos rain = steam after. Ground fog for cinematic shots.");
    }
    warnings.push("Lagos humidity = lens fogging. Acclimate gear 20min before shooting.");
  }

  const intros = [
    "Photo conditions:",
    "Shooting forecast:",
    "Lighting report:",
    "Photography check:",
    "Zephye's photo rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (lighting.length) response += ` Lighting: ${lighting.join(' ')}`;
  if (timing.length) response += ` Timing: ${timing.join(' ')}`;
  if (gear.length) response += ` Gear: ${gear.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
