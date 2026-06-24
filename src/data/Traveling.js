import {
  calcHeatIndex,
  calcWindChill,
  getBurnTime,
  getComfortScore,
  random
} from './calculations';

export const sampleQuestions = [
  "Traveling from Paris to London, weather?",
  "Mumbai to Delhi, what to expect?",
  "New York to Tokyo, should I pack a jacket?",
  "Lagos to Abuja, is there storm?",
  "Toronto to Montreal, flight weather?"
];

export const getTravelingAdvice = (data, userQuery = '') => {
  if (!data) return "Loading weather data...";

  const { start, destination } = extractLocations(userQuery);

  // If we don't have both locations, ask for them
  if (!start ||!destination) {
    return `Tell me your start and destination like: "Paris to London" or "Mumbai to Delhi". I'll tell you the weather you should expect at both places.`;
  }

  const { temp, feelsLike, condition, humidity, wind, uvIndex, aqi, visibility, city } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10? windChill : temp >= 27? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);

  let verdict = [];
  let packing = [];
  let warnings = [];

  // WEATHER AT START LOCATION - we only have data for selected city
  const currentCity = city;
  verdict.push(`Weather check: ${start} → ${destination}.`);

  verdict.push(`Right now in ${currentCity}: ${temp}°C, feels ${Math.round(effectiveTemp)}°C, ${condition}.`);

  // STORM/HAZARD WARNINGS FOR TAKEOFF
  if (condition === 'thunderstorm') {
    warnings.push(`Storm in ${currentCity}. Expect takeoff delays or turbulence leaving ${start}.`);
  } else if (visibility < 1) {
    warnings.push(`Dense fog in ${currentCity}. Flights from ${start} may be delayed.`);
  } else if (wind > 50) {
    warnings.push(`High winds ${wind}km/h in ${currentCity}. Bumpy takeoff from ${start}.`);
  } else if (condition === 'snow') {
    warnings.push(`Snow in ${currentCity}. De-icing delays leaving ${start}.`);
  } else if (effectiveTemp > 35) {
    warnings.push(`Extreme heat ${heatIndex}°C in ${currentCity}. Hydrate before leaving ${start}.`);
  } else if (effectiveTemp < 0) {
    warnings.push(`Freezing ${windChill}°C in ${currentCity}. Bundle up leaving ${start}.`);
  }

  // PACKING BASED ON CURRENT CITY WEATHER
  if (effectiveTemp <= 5) {
    packing.push("Heavy coat for departure");
  } else if (effectiveTemp <= 15) {
    packing.push("Jacket for departure");
  } else if (effectiveTemp >= 30) {
    packing.push("Light clothes for departure");
  }

  if (condition === 'rain' || condition === 'drizzle') {
    packing.push("Umbrella/waterproof for ${start}");
  }

  if (uvIndex >= 6) {
    packing.push(`SPF for ${start} — UV ${uvIndex}, burn time ~${burnMin}min`);
  }

  if (aqi > 100) {
    packing.push(`Mask for ${start} — AQI ${aqi}`);
  }

  // DESTINATION NOTE
  warnings.push(`Check ${destination} weather separately before landing. Pack layers if climates differ.`);
  packing.push("Layers work for both cities if weather differs");

  const intros = [
    "Travel weather:",
    "Departure check:",
    "Trip weather:",
    "Flight weather:",
    "Zephye's travel check:"
  ];

  let response = `${random(intros)} ${verdict.join(' ')}`;
  if (packing.length) response += ` Pack: ${packing.join(', ')}.`;
  if (warnings.length) response += ` Note: ${warnings.join(' ')}`;

  return response.trim();
};

function extractLocations(query) {
  if (!query) return { start: null, destination: null };
  const q = query.toLowerCase();

  // "from X to Y"
  const fromToMatch = q.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|,|\?)/i);
  if (fromToMatch) {
    return {
      start: capitalizeCity(fromToMatch[1].trim()),
      destination: capitalizeCity(fromToMatch[2].trim())
    };
  }

  // "X to Y" or "X → Y"
  const xToYMatch = q.match(/^([a-z\s]+?)\s+(?:to|→)\s+([a-z\s]+?)(?:\s|$|,|\?)/i);
  if (xToYMatch) {
    return {
      start: capitalizeCity(xToYMatch[1].trim()),
      destination: capitalizeCity(xToYMatch[2].trim())
    };
  }

  return { start: null, destination: null };
}

function capitalizeCity(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
         }
