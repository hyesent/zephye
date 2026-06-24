import {
  getMoonPhase,
  getPlanetVisibility,
  getCloudCover,
  mapWeatherCode,
  random
} from './calculations';

export const sampleQuestions = [
  "Can I see stars tonight?",
  "Is it good for stargazing?",
  "Will the moon ruin stargazing?",
  "Can I see the Milky Way?",
  "Is it clear enough for a telescope?",
  "Best time to stargaze tonight?",
  "Will clouds block the stars?",
  "Can I see planets tonight?",
  "Is it good for meteor watching?"
];

export const getStargazingAdvice = (data) => {
  if (!data) return "Loading weather data...";

  const { conditionCode, cloudCover, condition, humidity, visibility, sunset, sunrise, city } = data;
  const moonPhase = getMoonPhase();
  const cloudPercent = getCloudCover(conditionCode);
  const planetVis = getPlanetVisibility(cloudPercent, moonPhase);

  let verdict = [];
  let viewing = [];
  let timing = [];
  let warnings = [];

  // CLOUD COVER IS KING
  if (cloudPercent >= 90) {
    verdict.push("Overcast. No stars visible tonight.");
    warnings.push("100% cloud cover. Telescope stays inside.");
  } else if (cloudPercent >= 70) {
    verdict.push("Mostly cloudy. Brief gaps possible but frustrating.");
    viewing.push("Maybe catch brightest planets between clouds. Not worth setting up telescope.");
  } else if (cloudPercent >= 40) {
    verdict.push("Partly cloudy. Stargazing possible with patience.");
    viewing.push("Stars will play peek-a-boo. Good for casual viewing, bad for photography.");
  } else if (cloudPercent >= 20) {
    verdict.push("Mostly clear. Good stargazing conditions.");
    viewing.push("Minor clouds won't ruin it. Milky Way visible in dark areas.");
  } else {
    verdict.push("Clear skies. Perfect stargazing tonight.");
    viewing.push("Excellent for telescopes, astrophotography, meteor showers.");
  }

  // MOON PHASE RUINS STUFF
  if (moonPhase === "Full Moon") {
    warnings.push("Full moon = sky is bright. Only see brightest stars + planets.");
    warnings.push("Milky Way invisible. Deep sky objects washed out.");
    viewing.push("Good night for moon gazing though. Craters look amazing.");
  } else if (moonPhase === "Waxing Gibbous" || moonPhase === "Waning Gibbous") {
    warnings.push(`${moonPhase}. Bright moon washes out faint stars.`);
    viewing.push("Stick to planets, moon, bright star clusters.");
  } else if (moonPhase === "First Quarter" || moonPhase === "Last Quarter") {
    viewing.push(`${moonPhase}. Moon sets around midnight. Best viewing after moonset.`);
    timing.push("Wait 2hrs after sunset for moon to set, then sky gets dark.");
  } else if (moonPhase === "Waxing Crescent" || moonPhase === "Waning Crescent") {
    viewing.push(`${moonPhase}. Thin moon = dark skies. Great for deep sky.`);
  } else if (moonPhase === "New Moon") {
    viewing.push("New moon = darkest skies possible. Perfect for Milky Way + galaxies.");
    warnings.push("Best night of the month for stargazing. Don't waste it.");
  }

  // HUMIDITY = HAZE
  if (humidity > 85) {
    warnings.push("High humidity = hazy sky. Stars look dim even if clear.");
    viewing.push("Planets still visible. Deep sky will be poor.");
  } else if (humidity < 40) {
    viewing.push("Dry air = crisp, clear stars. Excellent transparency.");
  }

  // VISIBILITY
  if (visibility < 5) {
    warnings.push(`Poor visibility ${visibility}km. Fog/haze blocking stars.`);
    verdict[0] = "Bad stargazing. Atmosphere too thick.";
  } else if (visibility > 15) {
    viewing.push("Excellent visibility. See stars down to horizon.");
  }

  // PLANET VISIBILITY
  viewing.push(`Planet viewing: ${planetVis}.`);

  if (planetVis === "Excellent — clear skies" && moonPhase === "New Moon") {
    viewing.push("Jupiter, Saturn, Mars should be easy. Even Uranus/Neptune possible with telescope.");
  }

  // TIMING
  if (sunset) {
    const sunsetTime = new Date(sunset);
    const astroDark = new Date(sunsetTime.getTime() + 90 * 60000); // 90min after sunset
    const format = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    timing.push(`Astronomical dark starts ~${format(astroDark)}. That's when faint stuff appears.`);
  }

  if (sunrise) {
    const sunriseTime = new Date(sunrise);
    const endTime = new Date(sunriseTime.getTime() - 90 * 60000);
    const format = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    timing.push(`Stargazing ends ~${format(endTime)} before dawn.`);
  }

  // WEATHER SPECIFIC
  if (condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') {
    warnings.push("Rain = no stargazing. Plus telescope gets wet.");
    verdict[0] = "Weather terrible for astronomy. Stay inside.";
  } else if (condition === 'snow') {
    warnings.push("Snowing. No stars. But cold air = steady seeing if it clears later.");
  }

  // CITY LIGHT POLLUTION NOTE
  if (city.toLowerCase().includes('lagos') || city.toLowerCase().includes('new york') || city.toLowerCase().includes('london')) {
    viewing.push(`Light pollution in ${city} is bad. Drive 30min outside city for Milky Way.`);
  }

  // METEOR SHOWERS
  if (cloudPercent < 30 && moonPhase === "New Moon") {
    viewing.push("Perfect for meteor showers. Lie on blanket, no telescope needed.");
  }

  const intros = [
    "Sky report:",
    "Stargazing forecast:",
    "Night sky conditions:",
    "Astronomy check:",
    "Zephye's sky rec:"
  ];

  let response = `${random(intros)} For ${city}: ${verdict.join(' ')}`;
  if (viewing.length) response += ` Viewing: ${viewing.join(' ')}`;
  if (timing.length) response += ` Timing: ${timing.join(' ')}`;
  if (warnings.length) response += ` Warning: ${warnings.join(' ')}`;

  return response.trim();
};
