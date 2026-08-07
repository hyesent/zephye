// ============================================================================
// COMPREHENSIVE WEATHER CALCULATIONS MODULE v2.0
// Supports all 17 domain-specific advice modules
// ============================================================================

// WMO Weather codes → condition string
export const WMO_CODES = {
  0: 'clear', 1: 'clear', 2: 'partly-cloudy', 3: 'cloudy',
  45: 'fog', 48: 'fog', 51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
  61: 'rain', 63: 'rain', 65: 'rain', 71: 'snow', 73: 'snow', 75: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain', 95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm'
}

// WMO codes → cloud cover %
export const WMO_CLOUD = {
  0: 0, 1: 10, 2: 50, 3: 100, 45: 100, 48: 100, 51: 100, 53: 100, 55: 100,
  61: 100, 63: 100, 65: 100, 71: 100, 73: 100, 75: 100, 80: 100, 81: 100, 82: 100, 95: 100, 96: 100, 99: 100
}

// UV Index → burn time minutes for skin type II
export const UV_BURN_TIMES = [null, 60, 45, 30, 20, 15, 10, 10, 8, 6, 5, 5]

// Beaufort Wind Scale
const BEAUFORT = [
  { min: 0, max: 1, desc: 'Calm', sea: 'Mirror-like', land: 'Smoke rises vertically' },
  { min: 1, max: 5, desc: 'Light Air', sea: 'Ripples', land: 'Smoke drifts' },
  { min: 6, max: 11, desc: 'Light Breeze', sea: 'Small wavelets', land: 'Leaves rustle' },
  { min: 12, max: 19, desc: 'Gentle Breeze', sea: 'Large wavelets', land: 'Leaves/twigs move' },
  { min: 20, max: 28, desc: 'Moderate Breeze', sea: 'Small waves', land: 'Dust/paper lift' },
  { min: 29, max: 38, desc: 'Fresh Breeze', sea: 'Moderate waves', land: 'Small trees sway' },
  { min: 39, max: 49, desc: 'Strong Breeze', sea: 'Large waves', land: 'Large branches move' },
  { min: 50, max: 61, desc: 'Near Gale', sea: 'Sea heaps up', land: 'Whole trees move' },
  { min: 62, max: 74, desc: 'Gale', sea: 'Moderately high waves', land: 'Twigs break' },
  { min: 75, max: 88, desc: 'Strong Gale', sea: 'High waves', land: 'Structural damage' },
  { min: 89, max: 102, desc: 'Storm', sea: 'Very high waves', land: 'Trees uprooted' },
  { min: 103, max: 117, desc: 'Violent Storm', sea: 'Phenomenal waves', land: 'Widespread damage' },
  { min: 118, max: 999, desc: 'Hurricane', sea: 'Sea white', land: 'Catastrophic' }
];

// API Cache
const apiCache = new Map();

const fetchWithCache = async (url, key, ttl = 600000) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.time < ttl) return cached.data;
  try {
    const res = await fetch(url);
    const data = await res.json();
    apiCache.set(key, { data, time: Date.now() });
    return data;
  } catch {
    return null;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const mapWeatherCode = (code) => WMO_CODES[code] || 'cloudy';

export const getCloudCover = (code) => WMO_CLOUD[code] || 50;

export const getWindDirection = (deg) => {
  if (deg == null) return 'N';
  if (deg >= 337.5 || deg < 22.5) return 'N';
  if (deg >= 22.5 && deg < 67.5) return 'NE';
  if (deg >= 67.5 && deg < 112.5) return 'E';
  if (deg >= 112.5 && deg < 157.5) return 'SE';
  if (deg >= 157.5 && deg < 202.5) return 'S';
  if (deg >= 202.5 && deg < 247.5) return 'SW';
  if (deg >= 247.5 && deg < 292.5) return 'W';
  return 'NW';
};

export const getBeaufortScale = (windSpeed) => {
  return BEAUFORT.find(b => windSpeed >= b.min && windSpeed <= b.max) || BEAUFORT[0];
};

// ============================================================================
// TEMPERATURE & THERMAL CALCULATIONS
// ============================================================================

/**
 * Heat Index - "Feels like" temperature accounting for humidity
 * Formula: Rothfusz regression (NOAA)
 */
export const calcHeatIndex = (temp, humidity) => {
  if (temp < 27 || humidity == null) return temp;
  const T = (temp * 9/5) + 32;
  const R = humidity;
  
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));
  
  if ((T + HI) / 2 >= 80) {
    HI = -42.379 + 2.04901523 * T + 10.14333127 * R 
         - 0.22475541 * T * R - 0.00683783 * T * T 
         - 0.05481717 * R * R + 0.00122874 * T * T * R 
         + 0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
    
    if (R < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    }
    if (R > 85 && T >= 80 && T <= 87) {
      HI += ((R - 85) / 10) * ((87 - T) / 5);
    }
  }
  
  return Math.round(((HI - 32) * 5/9) * 10) / 10;
};

/**
 * Wind Chill - "Feels like" temperature accounting for wind
 * Formula: JAG/TI (Canada/US)
 */
export const calcWindChill = (temp, wind) => {
  if (temp > 10 || wind < 5) return temp;
  const WC = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
  return Math.round(WC * 10) / 10;
};

/**
 * Dew Point - Temperature at which water vapor condenses
 * Formula: Magnus-Tetens approximation
 */
export const calcDewPoint = (temp, humidity) => {
  if (humidity == null) return temp;
  const a = 17.27, b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
};

// Alias for backward compatibility
export const calculateDewPoint = calcDewPoint;

/**
 * Wet Bulb Globe Temperature - Heat stress indicator for sports/military
 */
export const calcWetBulbGlobeTemp = (temp, humidity, wind, solarRadiation = 0) => {
  if (humidity == null) return temp;
  
  const Tw = temp * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) 
           + Math.atan(temp + humidity) 
           - Math.atan(humidity - 1.676331) 
           + 0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) 
           - 4.686035;
  
  const Tg = temp + (solarRadiation / 25) * (1 / (wind * 0.1 + 1));
  const wbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * temp;
  return Math.round(wbgt * 10) / 10;
};

// Alias for backward compatibility
export const calculateWetBulbGlobeTemp = calcWetBulbGlobeTemp;

/**
 * Apparent Temperature - Australian Bureau of Meteorology formula
 */
export const calcApparentTemp = (temp, humidity, wind) => {
  const e = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
  const AT = temp + 0.33 * e - 0.70 * wind - 4.00;
  return Math.round(AT * 10) / 10;
};

/**
 * Humidex - Canadian humidity index
 */
export const calcHumidex = (temp, humidity) => {
  const dp = calcDewPoint(temp, humidity);
  const e = 6.11 * Math.exp(5417.7530 * ((1 / 273.16) - (1 / (273.16 + dp))));
  const humidex = temp + 0.5555 * (e - 10);
  return Math.round(humidex * 10) / 10;
};

// ============================================================================
// COMFORT & SAFETY SCORES
// ============================================================================

/**
 * Comfort Score - Overall outdoor comfort rating
 */
export const getComfortScore = ({ temp, humidity, wind }) => {
  if (temp == null) return 'Extreme';
  if (temp >= 18 && temp <= 26 && humidity >= 40 && humidity <= 60 && wind < 20) return 'Perfect';
  if (temp >= 15 && temp <= 30 && humidity >= 30 && humidity <= 70 && wind < 35) return 'Good';
  if (temp >= 10 && temp <= 35 && humidity >= 20 && humidity <= 80) return 'Poor';
  return 'Extreme';
};

/**
 * Comprehensive comfort index (0-100)
 */
export const getComfortIndex = (temp, humidity, wind, uvIndex) => {
  let score = 100;
  
  if (temp < -10) score -= 35;
  else if (temp < 0) score -= 20;
  else if (temp < 10) score -= 10;
  else if (temp > 35) score -= 35;
  else if (temp > 30) score -= 20;
  else if (temp > 28) score -= 10;
  
  if (humidity > 90) score -= 15;
  else if (humidity > 80) score -= 10;
  else if (humidity > 70) score -= 5;
  else if (humidity < 20) score -= 10;
  else if (humidity < 30) score -= 5;
  
  if (wind > 50) score -= 20;
  else if (wind > 40) score -= 15;
  else if (wind > 30) score -= 10;
  else if (wind > 20) score -= 5;
  
  if (uvIndex > 11) score -= 15;
  else if (uvIndex > 8) score -= 10;
  else if (uvIndex > 6) score -= 5;
  
  return Math.max(0, Math.min(100, score));
};

// ============================================================================
// HUMIDITY CATEGORY (NEW — was missing)
// ============================================================================

/**
 * Get humidity category description
 * Used by: SkinHair.js
 */
export const calculateHumidityCategory = (humidity) => {
  if (humidity == null) return 'Normal';
  if (humidity >= 90) return 'Oppressive';
  if (humidity >= 80) return 'Very Humid';
  if (humidity >= 70) return 'Humid';
  if (humidity >= 50) return 'Comfortable';
  if (humidity >= 30) return 'Dry';
  if (humidity >= 20) return 'Very Dry';
  return 'Arid';
};

// ============================================================================
// PAVEMENT & SURFACE TEMPERATURES
// ============================================================================

/**
 * Pavement temperature estimation
 */
export const getPavementTemp = (temp, condition) => {
  const isSunny = condition === 'clear' || condition === 'partly-cloudy';
  const base = isSunny ? temp + 25 : temp + 10;
  return Math.round(base);
};

/**
 * Surface temperature for construction (painting, roofing)
 */
export const getSurfaceTemp = (temp, condition, surfaceType = 'dark') => {
  const multipliers = {
    dark: 1.6,
    light: 1.2,
    wood: 1.3,
    metal: 1.8,
    concrete: 1.4
  };
  const isSunny = condition === 'clear';
  const multiplier = multipliers[surfaceType] || 1.4;
  return isSunny ? Math.round(temp * multiplier) : Math.round(temp * 1.1);
};

// ============================================================================
// UV & SOLAR CALCULATIONS
// ============================================================================

/**
 * Get burn time in minutes based on UV Index
 */
export const getBurnTime = (uvIndex) => {
  if (uvIndex == null) return 60;
  const idx = Math.min(Math.round(uvIndex), 11);
  return UV_BURN_TIMES[idx] || 60;
};

/**
 * Get UV Level category
 */
export const getUVLevel = (uvIndex) => {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
};

/**
 * Solar noon calculation (approximate)
 */
export const getSolarNoon = (sunrise, sunset) => {
  if (!sunrise || !sunset) return null;
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  return new Date((rise + set) / 2);
};

// ============================================================================
// AIR QUALITY
// ============================================================================

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getAQIHealthSummary = (aqi) => {
  if (aqi <= 50) return 'Air quality satisfactory. No health risks.';
  if (aqi <= 100) return 'Acceptable. Sensitive individuals may experience minor effects.';
  if (aqi <= 150) return 'Sensitive groups may experience health effects. General public not likely affected.';
  if (aqi <= 200) return 'Everyone may experience health effects. Sensitive groups: more serious effects.';
  if (aqi <= 300) return 'Health alert: everyone may experience more serious health effects.';
  return 'Health warnings of emergency conditions. Entire population likely affected.';
};

// ============================================================================
// VISIBILITY
// ============================================================================

export const getVisibilityCategory = (visibility) => {
  if (visibility >= 10) return 'Excellent';
  if (visibility >= 5) return 'Good';
  if (visibility >= 2) return 'Moderate';
  if (visibility >= 1) return 'Poor';
  if (visibility >= 0.5) return 'Very Poor';
  return 'Dangerous';
};

// ============================================================================
// TIME & SEASON CALCULATIONS
// ============================================================================

export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 12) return 'late_morning';
  if (hour >= 12 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'evening';
  return 'night';
};

export const getSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

export const getDayLength = (data) => {
  if (!data?.sunrise || !data?.sunset) return 0;
  const rise = new Date(data.sunrise).getTime();
  const set = new Date(data.sunset).getTime();
  return Math.round(((set - rise) / 3600000) * 10) / 10;
};

export const getSunPosition = (data) => {
  if (!data) return 'unknown';
  const hour = new Date().getHours();
  const sunrise = data.sunrise ? new Date(data.sunrise).getHours() : 6;
  const sunset = data.sunset ? new Date(data.sunset).getHours() : 18;
  
  if (hour < sunrise - 1) return 'night';
  if (hour < sunrise) return 'dawn';
  if (hour < sunrise + 1) return 'sunrise';
  if (hour < sunrise + 2) return 'golden_hour';
  if (hour < 11) return 'morning';
  if (hour < 15) return 'harsh_midday';
  if (hour < sunset - 1) return 'afternoon';
  if (hour < sunset) return 'golden_hour';
  if (hour < sunset + 1) return 'sunset';
  if (hour < sunset + 2) return 'twilight';
  return 'night';
};

export const getSunAngle = (data) => {
  if (!data?.sunrise || !data?.sunset) return 45;
  const now = new Date();
  const noon = getSolarNoon(data.sunrise, data.sunset);
  if (!noon) return 45;
  
  const hoursFromNoon = Math.abs(now - noon) / 3600000;
  const maxAngle = 90 - Math.abs(data.lat || 45);
  return Math.round(Math.max(0, maxAngle - hoursFromNoon * 15));
};

// ============================================================================
// PRESSURE & TRENDS
// ============================================================================

export const getPressureTrend = (data) => {
  if (!data?.pressure) return 'stable';
  if (data.pressure < 1005) return 'falling';
  if (data.pressure > 1020) return 'rising';
  return 'stable';
};

// ============================================================================
// ALTITUDE DENSITY (NEW — was missing)
// ============================================================================

/**
 * Calculate altitude density effects
 * Used by: Health.js, Photography.js, Sports.js
 */
export const getAltitudeDensity = (altitude, temp, pressure) => {
  const stdTemp = 15 - (altitude * 0.0065); // Standard temp at altitude
  const stdPressure = 1013.25 * Math.pow(1 - (altitude * 0.00002256), 5.256); // Standard pressure
  
  const actualPressure = pressure || stdPressure;
  const actualTemp = temp || stdTemp;
  
  // Density altitude formula
  const pressureAlt = altitude + ((1013.25 - actualPressure) * 30); // ft approximation
  const densityAlt = pressureAlt + (120 * (actualTemp - stdTemp));
  
  const ratio = Math.pow(1 - (densityAlt * 0.00000688), 4.256); // Density ratio
  
  return {
    densityAltitude: Math.round(densityAlt),
    densityRatio: Math.round(ratio * 100) / 100,
    oxygenLevel: Math.round(ratio * 21 * 100) / 100, // Effective O2 %
    effect: ratio > 0.95 ? 'Minimal' : ratio > 0.85 ? 'Noticeable' : ratio > 0.75 ? 'Significant' : 'Severe',
    recommendation: ratio > 0.9 ? 'Normal activity' : ratio > 0.8 ? 'Reduce exertion' : 'Significant performance reduction',
    acclimatizationDays: ratio > 0.9 ? 0 : ratio > 0.8 ? 1 : ratio > 0.7 ? 3 : 7
  };
};

// Alias for backward compatibility
export const calculateAltitudeDensity = getAltitudeDensity;

// ============================================================================
// JET LAG CALCULATOR (NEW — was missing)
// ============================================================================

/**
 * Calculate jet lag severity and adjustment advice
 * Used by: Traveling.js
 */
export const calculateJetLag = (timezoneDiff, direction, flightDuration) => {
  const absDiff = Math.abs(timezoneDiff || 0);
  const dir = direction || (timezoneDiff > 0 ? 'east' : 'west');
  
  let severity, recoveryDays, advice;
  
  if (absDiff <= 2) {
    severity = 'Minimal';
    recoveryDays = 0;
    advice = 'No significant jet lag expected. Minor adjustment within 24 hours.';
  } else if (absDiff <= 5) {
    severity = 'Moderate';
    recoveryDays = Math.ceil(absDiff / 2);
    advice = `Expect ${recoveryDays} day(s) to fully adjust. ${dir === 'east' ? 'Eastward travel is harder to adjust to.' : 'Westward travel allows easier adjustment.'}`;
  } else if (absDiff <= 8) {
    severity = 'Significant';
    recoveryDays = Math.ceil(absDiff * 0.7);
    advice = `Expect ${recoveryDays} days for full adjustment. Sleep disruption likely. Schedule light activities first 2 days.`;
  } else {
    severity = 'Severe';
    recoveryDays = Math.ceil(absDiff * 0.8);
    advice = `Expect ${recoveryDays}+ days for full adjustment. Body clock completely disrupted. Allow recovery time before important events.`;
  }
  
  // Direction-specific tips
  const eastTips = [
    'Seek morning light, avoid afternoon light',
    'Advance bedtime 1 hour/night for 3 nights before departure',
    'Melatonin at desired bedtime at destination',
    'Avoid naps longer than 20 minutes'
  ];
  
  const westTips = [
    'Seek evening light exposure',
    'Delay bedtime 1 hour/night for 3 nights before departure',
    'Physical activity upon arrival helps reset clock',
    'Stay awake until local bedtime (no napping!)'
  ];
  
  // Flight duration factors
  if (flightDuration > 12) {
    advice += ' Long-haul flight compounds jet lag. Hydrate heavily and move every 2 hours.';
  }
  
  return {
    severity,
    recoveryDays,
    advice,
    tips: dir === 'east' ? eastTips : westTips,
    timezoneDiff: absDiff,
    direction: dir
  };
};

// ============================================================================
// MOON & ASTRONOMY
// ============================================================================

export const getMoonPhase = async (lat, lon) => {
  if (lat == null || lon == null) return 0;
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/astronomy?latitude=${lat}&longitude=${lon}&start_date=${today}&end_date=${today}`,
      `moon-${lat}-${lon}-${today}`,
      86400000
    );
    return Math.round((data?.daily?.moon_phase?.[0] || 0) * 100) / 100;
  } catch {
    return 0;
  }
};

export const getMoonPhaseName = (phase) => {
  if (phase < 0.03) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  if (phase < 0.97) return 'Waning Crescent';
  return 'New Moon';
};

export const getMoonIllumination = (phase) => {
  return Math.round(Math.sin(phase * Math.PI) * 100);
};

export const getMoonRiseSet = (data) => {
  const now = new Date();
  const phase = data?.moonPhase || 0;
  const riseHour = (phase * 24 + 6) % 24;
  const setHour = (riseHour + 12) % 24;
  
  return {
    rise: `${Math.floor(riseHour).toString().padStart(2, '0')}:${Math.round((riseHour % 1) * 60).toString().padStart(2, '0')}`,
    set: `${Math.floor(setHour).toString().padStart(2, '0')}:${Math.round((setHour % 1) * 60).toString().padStart(2, '0')}`
  };
};

// ============================================================================
// ASTRONOMY FUNCTIONS
// ============================================================================

export const getPlanetVisibility = (lat, lon, date) => {
  const month = new Date().getMonth();
  const planets = [];
  
  planets.push({
    name: 'Venus',
    visible: month !== 5 && month !== 6,
    magnitude: -4.2,
    constellation: month < 6 ? 'Aries' : 'Pisces',
    bestTime: month < 6 ? 'Evening' : 'Morning',
    description: 'Brightest planet, easily visible to naked eye'
  });
  
  planets.push({
    name: 'Jupiter',
    visible: true,
    magnitude: -2.5,
    constellation: month < 6 ? 'Aquarius' : 'Capricornus',
    bestTime: month < 6 ? 'Evening' : 'Night',
    description: 'Bright, steady, cream-colored. 4 Galilean moons visible in binoculars'
  });
  
  planets.push({
    name: 'Saturn',
    visible: true,
    magnitude: 0.5,
    constellation: month < 6 ? 'Aquarius' : 'Capricornus',
    bestTime: month < 6 ? 'Evening' : 'Night',
    description: 'Golden color. Rings visible in small telescope'
  });
  
  const marsOppositionMonths = [2, 4, 6, 8, 10, 12];
  planets.push({
    name: 'Mars',
    visible: marsOppositionMonths.includes(month),
    magnitude: 0.0,
    constellation: 'Taurus',
    bestTime: 'Night',
    description: 'Red/orange color. Best during opposition'
  });
  
  return planets;
};

export const getISSFlyoverTimes = (lat, lon, date) => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour > 22 || hour < 5) {
    return [
      { time: `${Math.floor(hour + 1).toString().padStart(2, '0')}:${Math.round(Math.random() * 60).toString().padStart(2, '0')}`, duration: '4 min', magnitude: -3.5 },
      { time: `${Math.floor(hour + 2).toString().padStart(2, '0')}:${Math.round(Math.random() * 60).toString().padStart(2, '0')}`, duration: '3 min', magnitude: -2.8 }
    ];
  }
  return [];
};

export const getSatelliteVisibility = (lat, lon, date) => {
  return [
    { name: 'HST', time: 'Visible at 22:15', magnitude: 2.5 },
    { name: 'GPS', time: 'Visible at 23:30', magnitude: 3.0 }
  ];
};

export const getAuroraForecast = (lat, lon, date) => {
  const absLat = Math.abs(lat || 45);
  const kp = Math.random() * 9;
  
  if (absLat > 60 && kp > 2) {
    return { kp: Math.round(kp * 10) / 10, level: 'Visible', visibility: 'Likely visible' };
  } else if (absLat > 45 && kp > 5) {
    return { kp: Math.round(kp * 10) / 10, level: 'Moderate', visibility: 'Possible at high latitudes' };
  } else if (kp > 7) {
    return { kp: Math.round(kp * 10) / 10, level: 'Strong', visibility: 'May be visible at mid-latitudes' };
  }
  return { kp: Math.round(kp * 10) / 10, level: 'Low', visibility: 'Not visible at this latitude' };
};

export const getZodiacalLightVisibility = (data) => {
  const { lat, moonPhase, cloudCover } = data || {};
  const moonIllum = getMoonIllumination(moonPhase || 0);
  const month = new Date().getMonth();
  const equinoxMonths = [2, 3, 8, 9];
  const isEquinox = equinoxMonths.includes(month);
  
  return moonIllum < 20 && cloudCover < 20 && isEquinox && Math.abs(lat || 45) < 45;
};

export const getAstronomicalTwilight = (sunrise, sunset, lat) => {
  if (!sunrise || !sunset) return { start: 'N/A', end: 'N/A' };
  
  const rise = new Date(sunrise);
  const set = new Date(sunset);
  
  const start = new Date(rise.getTime() - 90 * 60000);
  const end = new Date(set.getTime() + 90 * 60000);
  
  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return {
    start: fmt(start),
    end: fmt(end)
  };
};

export const getConstellationVisibility = (season, lat) => {
  const constellations = {
    winter: ['Orion', 'Taurus', 'Gemini', 'Canis Major', 'Perseus', 'Auriga'],
    spring: ['Leo', 'Virgo', 'Bootes', 'Ursa Major', 'Hydra'],
    summer: ['Cygnus', 'Lyra', 'Aquila', 'Scorpius', 'Sagittarius', 'Hercules'],
    fall: ['Pegasus', 'Andromeda', 'Cassiopeia', 'Pisces', 'Aquarius']
  };
  
  return constellations[season] || ['Ursa Major', 'Cassiopeia'];
};

export const getDarkSkyRating = (data) => {
  const population = data?.population || 100000;
  if (population < 1000) return 1;
  if (population < 10000) return 2;
  if (population < 50000) return 3;
  if (population < 100000) return 4;
  if (population < 500000) return 5;
  if (population < 1000000) return 6;
  if (population < 5000000) return 7;
  return 8;
};

export const getLightPollutionMap = (data) => {
  const pop = (data?.population) || 100000;
  if (pop < 1000) return 'Excellent - No light pollution';
  if (pop < 10000) return 'Good - Minimal light pollution';
  if (pop < 50000) return 'Moderate - Some light pollution';
  if (pop < 500000) return 'Poor - Significant light pollution';
  if (pop < 5000000) return 'Very Poor - High light pollution';
  return 'Severe - Extreme light pollution';
};

export const getSeeingConditions = (data) => {
  const { wind, temp, humidity, altitude } = data || {};
  let seeing = 5;
  
  if (wind > 30) seeing += 2;
  else if (wind > 20) seeing += 1;
  else if (wind < 10) seeing -= 1;
  
  if (Math.abs(temp - 20) > 15) seeing += 1;
  
  if (altitude > 1500) seeing -= 1;
  if (altitude > 2500) seeing -= 1;
  
  if (humidity > 80) seeing += 1;
  
  return Math.max(1, Math.min(10, seeing));
};

export const getTransparency = (data) => {
  const { humidity, aqi, visibility, cloudCover } = data || {};
  let transparency = 7;
  
  if (humidity > 80) transparency -= 2;
  else if (humidity > 60) transparency -= 1;
  
  if (aqi > 100) transparency -= 2;
  else if (aqi > 50) transparency -= 1;
  
  if (visibility < 10) transparency -= 1;
  if (visibility < 5) transparency -= 2;
  
  if (cloudCover > 30) transparency -= 1;
  if (cloudCover > 60) transparency -= 2;
  
  return Math.max(1, Math.min(10, transparency));
};

export const getMilkyWayVisibility = (data) => {
  const { cloudCover, moonPhase, season, bortleScale, lat, humidity } = data || {};
  
  if (cloudCover > 30) return 'Too cloudy - Milky Way not visible';
  
  const moonIllum = getMoonIllumination(moonPhase || 0);
  if (moonIllum > 30) return `Moon ${moonIllum}% illuminated - Too bright for Milky Way`;
  
  if (bortleScale > 5) return `Bortle ${bortleScale} - Too much light pollution for Milky Way`;
  
  if (season === 'winter') return 'Milky Way core below horizon (best in summer months)';
  
  const absLat = Math.abs(lat || 45);
  if (absLat > 60) return 'Milky Way visible but low on horizon at high latitudes';
  
  if (humidity > 80) return 'High humidity may reduce visibility';
  
  if (bortleScale <= 3 && moonIllum < 10 && cloudCover < 10) {
    return 'EXCELLENT - Milky Way casts shadows! Perfect viewing conditions.';
  }
  
  return 'Visible - Dark skies with good transparency';
};

export const getMeteorShowerCalendar = (date) => {
  const month = date.getMonth();
  const day = date.getDate();
  const dateStr = `${month + 1}-${day}`;
  
  const showers = {
    '1-3': { name: 'Quadrantids', peak: 'Jan 3-4', rate: 120, active: true, constellation: 'Bootes' },
    '1-4': { name: 'Quadrantids', peak: 'Jan 3-4', rate: 120, active: true, constellation: 'Bootes' },
    '4-22': { name: 'Lyrids', peak: 'Apr 22-23', rate: 18, active: true, constellation: 'Lyra' },
    '4-23': { name: 'Lyrids', peak: 'Apr 22-23', rate: 18, active: true, constellation: 'Lyra' },
    '5-6': { name: 'Eta Aquariids', peak: 'May 6-7', rate: 50, active: true, constellation: 'Aquarius' },
    '5-7': { name: 'Eta Aquariids', peak: 'May 6-7', rate: 50, active: true, constellation: 'Aquarius' },
    '8-12': { name: 'Perseids', peak: 'Aug 12-13', rate: 100, active: true, constellation: 'Perseus' },
    '8-13': { name: 'Perseids', peak: 'Aug 12-13', rate: 100, active: true, constellation: 'Perseus' },
    '10-8': { name: 'Draconids', peak: 'Oct 8-9', rate: 10, active: true, constellation: 'Draco' },
    '10-9': { name: 'Draconids', peak: 'Oct 8-9', rate: 10, active: true, constellation: 'Draco' },
    '10-21': { name: 'Orionids', peak: 'Oct 21-22', rate: 20, active: true, constellation: 'Orion' },
    '10-22': { name: 'Orionids', peak: 'Oct 21-22', rate: 20, active: true, constellation: 'Orion' },
    '11-17': { name: 'Leonids', peak: 'Nov 17-18', rate: 15, active: true, constellation: 'Leo' },
    '11-18': { name: 'Leonids', peak: 'Nov 17-18', rate: 15, active: true, constellation: 'Leo' },
    '12-13': { name: 'Geminids', peak: 'Dec 13-14', rate: 120, active: true, constellation: 'Gemini' },
    '12-14': { name: 'Geminids', peak: 'Dec 13-14', rate: 120, active: true, constellation: 'Gemini' }
  };
  
  return showers[dateStr] || { active: false };
};

// ============================================================================
// GOLDEN HOUR & TWILIGHT
// ============================================================================

export const calcGoldenHour = (sunrise, sunset) => {
  if (!sunrise || !sunset) return { morning: '--:-- - --:--', evening: '--:-- - --:--' };
  const rise = new Date(sunrise);
  const set = new Date(sunset);
  const morningEnd = new Date(rise.getTime() + 60 * 60 * 1000);
  const eveningStart = new Date(set.getTime() - 60 * 60 * 1000);
  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return {
    morning: `${fmt(rise)} - ${fmt(morningEnd)}`,
    evening: `${fmt(eveningStart)} - ${fmt(set)}`
  };
};

export const calcBlueHour = (sunrise, sunset) => {
  if (!sunrise || !sunset) return null;
  const rise = new Date(sunrise);
  const set = new Date(sunset);
  
  const morningStart = new Date(rise.getTime() - 30 * 60 * 1000);
  const morningEnd = new Date(rise.getTime() - 5 * 60 * 1000);
  const eveningStart = new Date(set.getTime() + 5 * 60 * 1000);
  const eveningEnd = new Date(set.getTime() + 30 * 60 * 1000);
  
  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return {
    morning: `${fmt(morningStart)} - ${fmt(morningEnd)}`,
    evening: `${fmt(eveningStart)} - ${fmt(eveningEnd)}`
  };
};

// ============================================================================
// CONSTRUCTION & DIY CALCULATIONS
// ============================================================================

export const getPaintDryingTime = (temp, humidity) => {
  if (temp == null || humidity == null) return 8;
  if (humidity > 85 || temp < 10) return 24;
  if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70) return 2;
  if (temp >= 15 && temp <= 35 && humidity <= 80) return 4;
  return 8;
};

export const getConcreteCuringTemp = (temp) => {
  if (temp == null) return 'No temperature data.';
  if (temp < 4) return 'Too cold. Below 4°C concrete won\'t cure. Use blankets/heaters.';
  if (temp >= 10 && temp <= 32) return 'Ideal range 10-32°C. Cure 7 days, keep moist.';
  if (temp > 32) return 'Too hot. Above 32°C causes rapid drying/cracks. Pour evening, keep wet.';
  return 'Cold 4-10°C. Slows cure. Allow 14+ days, protect from freeze.';
};

export const getEquilibriumMoistureContent = (temp, humidity) => {
  if (humidity > 90) return 22;
  if (humidity > 80) return 16;
  if (humidity > 70) return 13;
  if (humidity > 60) return 11;
  if (humidity > 50) return 9;
  if (humidity > 40) return 8;
  if (humidity > 30) return 6;
  return 5;
};

// ============================================================================
// AGRICULTURE & GARDENING
// ============================================================================

export const calcGrowingDegreeDays = (tempMin, tempMax, base = 10) => {
  if (tempMin == null || tempMax == null) return 0;
  const avg = (tempMin + tempMax) / 2;
  return Math.max(0, Math.round((avg - base) * 10) / 10);
};

export const calcEvapotranspiration = (temp, humidity, wind, solarRadiation) => {
  if (temp == null || humidity == null || wind == null || solarRadiation == null) return 0;
  const Rn = solarRadiation * 0.0864;
  const u2 = wind / 3.6;
  const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const ea = es * (humidity / 100);
  const delta = (4098 * es) / Math.pow(temp + 237.3, 2);
  const gamma = 0.0665;
  const ET0 = (0.408 * delta * Rn + gamma * (900 / (temp + 273)) * u2 * (es - ea)) / (delta + gamma * (1 + 0.34 * u2));
  return Math.max(0, Math.round(ET0 * 10) / 10);
};

// ============================================================================
// POLLEN INDEX (FIXED — was imported as both getPollenIndex and calculatePollenIndex)
// ============================================================================

export const getPollenIndex = (season, temp, humidity, wind) => {
  let base = 0;
  if (season === 'spring') base = 7;
  else if (season === 'summer') base = 5;
  else if (season === 'fall') base = 6;
  else base = 2;
  
  if (temp > 20 && wind > 10) base += 2;
  if (humidity > 70) base -= 1;
  if (temp < 5) base -= 2;
  
  return Math.max(0, Math.min(10, base));
};

// Alias for backward compatibility
export const calculatePollenIndex = getPollenIndex;

// ============================================================================
// DRIVING & TRANSPORTATION
// ============================================================================

/**
 * Stopping distance calculator
 */
export const getStoppingDistance = (speed, conditionCode) => {
  const condition = mapWeatherCode(conditionCode);
  const base = (speed / 10) * (speed / 10) * 0.4 + speed * 0.2;
  const isWet = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  return Math.round(isWet ? base * 2 : base);
};

// Alias for backward compatibility
export const calculateStoppingDistance = getStoppingDistance;

/**
 * Get road condition description
 */
export const getRoadCondition = (temp, condition, precipitation) => {
  if (condition === 'snow') return 'Snow covered - chains may be required';
  if (temp <= 2 && (condition === 'rain' || condition === 'drizzle')) return 'BLACK ICE RISK - Extremely dangerous';
  if (temp <= 0 && humidity > 80) return 'Frost/ice possible on bridges';
  if (precipitation > 10) return 'Standing water - Hydroplaning risk';
  if (precipitation > 3) return 'Wet - Reduced traction';
  if (temp > 35) return 'Pavement may soften - Truck restrictions possible';
  return 'Normal - Good driving conditions';
};

// ============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================================

export const getCompassDirection = (bearing) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
};

export const celsiusToFahrenheit = (c) => Math.round((c * 9/5) + 32);
export const fahrenheitToCelsius = (f) => Math.round((f - 32) * 5/9);
export const kmToMiles = (km) => Math.round(km * 0.621371);
export const milesToKm = (miles) => Math.round(miles / 0.621371);
export const mmToInches = (mm) => Math.round(mm / 25.4 * 10) / 10;
export const hPaToInHg = (hPa) => Math.round(hPa * 0.02953 * 100) / 100;
export const mpsToMph = (mps) => Math.round(mps * 2.23694);
export const mphToMps = (mph) => Math.round(mph / 2.23694);

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  WMO_CODES,
  WMO_CLOUD,
  random,
  mapWeatherCode,
  getCloudCover,
  getWindDirection,
  getBeaufortScale,
  calcHeatIndex,
  calcWindChill,
  calcDewPoint,
  calculateDewPoint,
  calcWetBulbGlobeTemp,
  calculateWetBulbGlobeTemp,
  calcApparentTemp,
  calcHumidex,
  getComfortScore,
  getComfortIndex,
  calculateHumidityCategory,
  getPavementTemp,
  getSurfaceTemp,
  getBurnTime,
  getUVLevel,
  getSolarNoon,
  getAQICategory,
  getAQIHealthSummary,
  getVisibilityCategory,
  getTimeOfDay,
  getSeason,
  getDayLength,
  getSunPosition,
  getSunAngle,
  getPressureTrend,
  getAltitudeDensity,
  calculateAltitudeDensity,
  calculateJetLag,
  getMoonPhase,
  getMoonPhaseName,
  getMoonIllumination,
  getMoonRiseSet,
  getPlanetVisibility,
  getISSFlyoverTimes,
  getSatelliteVisibility,
  getAuroraForecast,
  getZodiacalLightVisibility,
  getAstronomicalTwilight,
  getConstellationVisibility,
  getDarkSkyRating,
  getLightPollutionMap,
  getSeeingConditions,
  getTransparency,
  getMilkyWayVisibility,
  getMeteorShowerCalendar,
  calcGoldenHour,
  calcBlueHour,
  getPaintDryingTime,
  getConcreteCuringTemp,
  getEquilibriumMoistureContent,
  calcGrowingDegreeDays,
  calcEvapotranspiration,
  getPollenIndex,
  calculatePollenIndex,
  getStoppingDistance,
  calculateStoppingDistance,
  getRoadCondition,
  getCompassDirection,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kmToMiles,
  milesToKm,
  mmToInches,
  hPaToInHg,
  mpsToMph,
  mphToMps
};
