import {
  calcHeatIndex,
  calcWindChill,
  getBurnTime,
  getComfortScore,
  random
} from './calculations';

export const sampleQuestions = [
  "Is it safe to walk my dog?",
  "Should I take my cat outside?",
  "Can my pet get heat stroke?",
  "Is the pavement too hot?",
  "Should I leave my dog in the car?",
  "Is it too cold for my pet?",
  "Can my dog play outside?",
  "Will my pet get sunburn?",
  "Is air quality bad for pets?"
];

export const getPetsAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { temp, humidity, wind, uvIndex, aqi, condition, visibility, city } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : temp;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  
  let verdict = [];
  let dogWalking = [];
  let heatSafety = [];
  let coldSafety = [];
  let pawCare = [];
  let general = [];
  let warnings = [];

  // MAIN VERDICT - ASPHALT TEMP IS KEY
  const asphaltTemp = temp + 25; // Asphalt 25°C hotter than air temp in sun
  
  if (asphaltTemp > 52) {
    verdict.push("DANGER: Pavement will burn paws in 60 seconds.");
    warnings.push(`Air ${temp}°C = asphalt ${asphaltTemp}°C. Eggs fry at 55°C.`);
    pawCare.push("5-second rule: Hold back of hand on pavement 5sec. If too hot for you, too hot for paws.");
    dogWalking.push("NO WALKS. Grass only. Early morning/late evening only.");
  } else if (asphaltTemp > 43) {
    verdict.push("CAUTION: Pavement hot. Burns possible in 5 minutes.");
    warnings.push(`Air ${temp}°C = asphalt ~${asphaltTemp}°C. Limit walks to 10min.`);
    pawCare.push("Walk on grass/shade. Check paws after. Booties recommended.");
    dogWalking.push("Early morning before 8am or after 8pm only.");
  } else if (effectiveTemp > 32) {
    verdict.push("Too hot for pets. Heat stroke risk high.");
    warnings.push(`Heat index ${heatIndex}°C. Dogs overheat 10x faster than humans.`);
    heatSafety.push("NO EXERCISE. Panting ≠ cooling. They can't sweat.");
    heatSafety.push("Limit to 5min potty breaks. Shade + water always.");
  } else if (effectiveTemp < -7) {
    verdict.push("Too cold. Frostbite risk for paws/ears in 15min.");
    coldSafety.push(`Wind chill ${windChill}°C. Small dogs, short hair = danger.`);
    coldSafety.push("Sweater + booties mandatory. Limit to 10min potty breaks.");
    warnings.push("Ice-melting salt burns paws. Wipe feet after walks.");
  } else if (effectiveTemp < 4) {
    verdict.push("Cold. Short walks only with protection.");
    coldSafety.push("Sweater for short-haired breeds. Watch for shivering.");
    dogWalking.push("Limit to 15-20min. No standing still.");
  } else {
    verdict.push("Safe temperature for pet activities.");
    dogWalking.push(`Comfortable ${temp}°C. Normal walks OK.`);
  }

  // HEAT STROKE WARNINGS
  if (heatIndex > 27) {
    heatSafety.push("Dogs can't sweat. They pant = inefficient cooling.");
    heatSafety.push("Signs: heavy panting, drooling, vomiting, collapse. EMERGENCY.");
    warnings.push("NEVER leave pet in car. 21°C outside = 43°C inside in 10min.");
    warnings.push("Cracking windows does NOTHING. Car becomes oven.");
    general.push("Provide shade, fresh water, kiddie pool. Wet towels on belly/paws.");
  }

  if (heatIndex > 32) {
    heatSafety.push("Brachycephalic breeds (pugs, bulldogs) = extreme danger.");
    heatSafety.push("Flat faces can't pant effectively. Heat stroke in 15min.");
    warnings.push("Elderly, overweight, thick-coated dogs at highest risk.");
  }

  // COLD WEATHER
  if (windChill <= -12) {
    coldSafety.push("Frostbite sets in 30min. Ears, tail, paws first.");
    coldSafety.push("Antifreeze = sweet + deadly. 1 tsp kills. Clean spills immediately.");
    warnings.push("Outdoor pets need insulated shelter + heated water bowl.");
  } else if (windChill < 0) {
    coldSafety.push("Hypothermia risk. Shivering = body losing heat.");
    coldSafety.push("Limit time out. Dry off immediately when inside.");
  }

  // RAIN/STORM
  if (isStorm) {
    warnings.push("Thunderstorms = panic. Many pets bolt + get lost.");
    general.push("Keep pets inside. Thunder shirts, safe room, white noise.");
    dogWalking.push("NO WALKS. Lightning + wet = electrocution risk.");
  } else if (isRaining) {
    dogWalking.push("Wet fur = cold faster. Dry thoroughly after.");
    warnings.push("Puddles = leptospirosis, giardia, chemicals. Don't let them drink.");
    pawCare.push("Muddy paws = infections. Clean + dry between toes.");
  }

  // UV/SUNBURN
  if (uvIndex >= 6) {
    general.push(`High UV ${uvIndex}. Pets sunburn too.`);
    general.push("Pink noses, ears, bellies burn. Dog sunscreen on exposed skin.");
    warnings.push("White/light colored pets highest risk. Skin cancer possible.");
  }

  // AIR QUALITY
  if (aqi > 150) {
    warnings.push(`AQI ${aqi} Unhealthy. Pets breathe faster = more toxins.`);
    general.push("Limit outdoor time. No exercise. Birds especially sensitive.");
    dogWalking.push("Short potty breaks only. Keep inside with air purifier.");
  } else if (aqi > 100) {
    general.push(`AQI ${aqi} moderate. Sensitive pets may cough/wheeze.`);
    dogWalking.push("Reduce intensity. Watch for breathing issues.");
  }

  // WIND
  if (wind > 40) {
    warnings.push(`Extreme wind ${wind}km/h. Debris danger + stress.`);
    general.push("Flying objects injure pets. Anxious pets panic.");
    dogWalking.push("NO WALKS. Wind blows scents = disorientation.");
  } else if (wind > 25) {
    dogWalking.push("Strong wind = scary for small dogs. May refuse to walk.");
    general.push("Secure yard. Fences blow down. Pets escape.");
  }

  // PAW CARE SPECIFIC
  if (isRaining || temp <= 0) {
    pawCare.push("Salt/ice melt chemicals burn paws. Rinse after walks.");
    pawCare.push("Cracked pads = infection risk. Use paw balm.");
  }

  if (asphaltTemp > 40) {
    pawCare.push("Hot pavement = blisters in minutes. Check for limping, licking paws.");
    pawCare.push("Grass, dirt trails, or booties only. Test with your hand first.");
  }

  // BREED SPECIFIC
  if (effectiveTemp > 24) {
    general.push("Huskies, Malamutes, thick coats = overheat fast even in mild temps.");
    general.push("Pugs, Bulldogs, Boxers = breathing compromised. Extra danger.");
  }
  if (effectiveTemp < 7) {
    general.push("Chihuahuas, Greyhounds, thin coats = need sweaters below 7°C.");
  }

  // LAGOS SPECIFIC
  if (city.toLowerCase().includes('lagos')) {
    if (isRaining) {
      warnings.push("Lagos floods = sewage + disease. Don't let pets drink/walk in floodwater.");
      general.push("Leptospirosis risk high. Vaccinate. Dry pets immediately.");
    }
    if (humidity > 85 && temp > 28) {
      heatSafety.push("Lagos heat + humidity = no evaporation. Pets can't cool at all.");
      warnings.push("Fungal infections common. Keep pets dry, check skin folds.");
    }
  }

  // GENERAL CARE
  if (effectiveTemp >= 20 && effectiveTemp <= 26) {
    general.push("Perfect pet weather. Great for walks, park, play.");
  }

  general.push("Always bring water on walks. Collapsible bowl essential.");
  general.push("Watch for: excessive panting, drooling, lethargy, vomiting = vet NOW.");

  const intros = [
    "Pet safety check:",
    "Dog walking forecast:",
    "Pet weather report:",
    "Outdoor safety for pets:",
    "Zephye's pet rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (dogWalking.length) response += ` Walking: ${dogWalking.join(' ')}`;
  if (heatSafety.length) response += ` Heat: ${heatSafety.join(' ')}`;
  if (coldSafety.length) response += ` Cold: ${coldSafety.join(' ')}`;
  if (pawCare.length) response += ` Paws: ${pawCare.join(' ')}`;
  if (general.length) response += ` General: ${general.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
