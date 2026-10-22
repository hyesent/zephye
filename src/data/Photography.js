import {
  calcGoldenHour,
  calcBlueHour,
  getCloudCover,
  getComfortScore,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getSunAngle,
  getDayLength,
  calculateDewPoint,
  getUVLevel,
  getVisibilityCategory,
  getMoonPhase,
  getMoonIllumination,
  getMilkyWayVisibility,
  getAstronomicalTwilight,
  getPressureTrend,
  calculateAltitudeDensity
} from './calculations';

// ============================================================================
// COMPREHENSIVE PHOTOGRAPHY WEATHER & LIGHTING ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  // GENERAL
  "Is it good lighting for photos today?",
  "Should I do a photoshoot now?",
  "Is golden hour good today?",
  "Will clouds ruin my photos?",
  "Good weather for outdoor photography?",
  "Is it too harsh for portraits?",
  "Best time for landscape photos?",
  "Will rain affect my shoot?",
  "Should I bring lighting equipment?",
  "What ND filter do I need?",
  "Is it too windy for long exposure?",
  "Will humidity fog my lens?",
  "Best camera settings for today?",
  "Should I shoot in RAW today?",
  "Is the contrast too high?",
  "Should I bracket my exposures?",
  "Should I bring flash today?",
  "Should I use a lens hood?",
  "Will there be lens flare?",
  "Should I use HDR today?",
  "Is it good for black and white?",
  "Will the air quality affect sharpness?",
  "Should I use a reflector?",
  "Should I use exposure compensation?",
  
  // ASTROPHOTOGRAPHY
  "Is it good for astrophotography tonight?",
  "Can I shoot the Milky Way?",
  "Can I shoot the stars tonight?",
  "Will the moon be too bright for stars?",
  "Is it good for meteor shower photos?",
  "Will the northern lights be visible?",
  "Is it good for eclipse photography?",
  "Should I use a star tracker?",
  "Is the seeing good for planetary imaging?",
  "Can I shoot the ISS transit?",
  "Will there be iridium flares?",
  "Is it good for deep sky objects?",
  "Can I shoot the zodiacal light?",
  "Will there be airglow?",
  "Should I use a bahtinov mask?",
  "Will light pollution ruin astro shots?",
  
  // GENRE SPECIFIC
  "Is it good for street photography?",
  "Can I shoot sports today?",
  "Is it good for drone photography?",
  "Can I shoot infrared today?",
  "Is it good for waterfall photos?",
  "Is it good for bird photography?",
  "Will the leaves be colorful for autumn photos?",
  "Can I shoot at the beach?",
  "Will there be heat haze?",
  "Is it good for architectural photography?",
  "Is it good for silhouette photos?",
  "Can I shoot fashion outdoors?",
  "Will models be comfortable?",
  "Is it good for newborn photos outside?",
  "Should I reschedule the engagement shoot?",
  "Will the wedding photos look good?",
  "Is it good for product photography outdoors?",
  "Can I shoot food photography outside?",
  "Is it good for real estate photos?",
  "Will the sky be dramatic?",
  "Is it good for tilt-shift?",
  "Is it good for light painting?",
  "Will there be interesting shadows?",
  "Is it good for underwater photography?",
  "Will the snow be too bright?",
  "Is it good for timelapse?",
  "Will there be fog in the valley?",
  "Is it good for aerial photography?",
  "Should I use a CPL filter?",
  "Is it good for concert photography outside?",
  "Is it good for wildlife photography?",
  "Should I worry about sensor dust?",
  "Will there be good cloud formations?",
  "Is it good for panoramic shots?",
  "Can I do a 365 project today?",
  "Is it good for pet photography outside?",
  "Will the autumn colors pop?",
  "Should I use fill flash?",
  "Is it good for minimalist photography?",
  "Can I shoot reflections today?",
  "Will there be steam or fog after rain?",
  "Is it good for smoke bomb photos?",
  "Should I protect my gear from salt spray?",
  "Is it good for double exposures?",
  "Will the ice formations be good?",
  "Should I use a rain cover?",
  "Is it good for documentary photography?",
  "Can I shoot fireworks tonight?"
];

// ============================================================================
// ENHANCED PHOTOGRAPHY GENRE DATABASE
// ============================================================================

const PHOTOGRAPHY_GENRES = {
  portrait: {
    idealConditions: {
      cloudCover: [40, 90],
      timeOfDay: ['golden_hour', 'blue_hour', 'overcast_midday'],
      wind: [0, 15],
      temp: [15, 28],
      humidity: [30, 70],
      uvIndex: [0, 5]
    },
    lightingStyle: {
      overcast: 'Giant softbox. Even, flat light. Minimal shadows. Great for all skin types. This is the safest portrait light.',
      golden_hour: 'Warm, directional light. Hair light effect. Backlight creates magical glow. Best portrait light quality.',
      open_shade: 'Soft, cool-toned. No squinting. Even exposure. Good for midday shoots when open shade is available.',
      window_light: 'Classic Rembrandt lighting. Directional but soft. Use reflector for fill on shadow side.',
      harsh_sun: 'AVOID. Raccoon eyes from overhead light. Harsh shadows. Subjects squint. Very unflattering.'
    },
    gearRecommendations: {
      overcast: 'Reflector (white or silver) for fill. No ND needed. Wide open for background separation.',
      golden_hour: 'Reflector (gold) for warmth. Lens hood for flare control. Backlight requires +1 stop exposure.',
      harsh_sun: 'Scrim or diffuser essential. Fill flash or reflector. ND filter if shooting wide open in bright conditions.'
    },
    special: [
      'Catchlights: overcast equals no natural catchlights. Use reflector or position subject near a light source.',
      'Skin tones: overcast gives most accurate skin tones. Golden hour gives warm cast (embrace or correct in post).',
      'Wardrobe: wind over 15 km/h means avoid flowy fabrics unless intentional.',
      'Makeup: humidity over 70% requires matte finishing powder. Cold weather causes wind-burned cheeks.',
      'Hair: wind over 15 km/h creates messy hair. Humidity over 70% causes frizz. Use anti-frizz products.'
    ]
  },
  landscape: {
    idealConditions: {
      cloudCover: [20, 60],
      timeOfDay: ['golden_hour', 'blue_hour', 'sunrise', 'sunset'],
      wind: [0, 20],
      temp: [5, 25],
      humidity: [30, 60],
      visibility: [10, 100],
      uvIndex: [0, 6]
    },
    lightingStyle: {
      golden_hour: 'THE landscape light. Low angle creates texture, depth, and warm tones. Dramatic shadows.',
      blue_hour: 'Cool, ethereal. City lights balance with the sky. Best for cityscapes and urban landscapes.',
      midday: 'Harsh and flat light. Only works for black and white or infrared. Skip color landscapes.',
      storm_light: 'Sunbeams through clouds create dramatic light. Best right after a storm passes.',
      overcast: 'Flat and boring for grand landscapes. Good for intimate landscapes, waterfalls, and forests.',
      fog: 'Magical conditions. Layers of depth. Minimalist compositions. Trees disappear into mist.'
    },
    gearRecommendations: {
      golden_hour: 'Polarizer cuts glare and saturates colors. 3-stop ND grad for balanced sky and ground.',
      blue_hour: 'Tripod essential. Cable release. Long exposure for light trails and smooth water.',
      midday: '10-stop ND for long exposure. Polarizer to cut atmospheric haze.',
      storm: 'Rain cover. Lens hood. Microfiber cloths. Weather-sealed body recommended.',
      waterfall: '3-6 stop ND filter. Polarizer cuts reflections on water and rocks. Sturdy tripod.',
      fog: 'Telephoto for compression. Wide angle for depth. Manual focus (autofocus hunts in fog).'
    },
    special: [
      'Heat haze: temperatures above 25°C create shimmering air over distance. Telephoto lenses become unusable.',
      'Wildfire smoke: creates incredible sunsets but hazy distant shots. Check AQI before heading out.',
      'Fall colors: overcast light gives more saturated colors. Sunny gives more contrast. Polarizer removes leaf glare.',
      'Snow: +1.5 to +2 stops exposure compensation needed. Camera underexposes white snow.',
      'Sand and desert: protection from blowing sand essential. Sensor cleaning kit required.',
      'Coastal: salt spray on lens ruins shots. Use UV or protective filter. Clean gear thoroughly after shooting.'
    ]
  },
  astrophotography: {
    idealConditions: {
      cloudCover: [0, 10],
      timeOfDay: ['astronomical_night'],
      wind: [0, 15],
      temp: [0, 20],
      humidity: [20, 60],
      visibility: [15, 100],
      moonPhase: ['new_moon', 'waxing_crescent', 'waning_crescent'],
      moonIllumination: [0, 20]
    },
    lightingStyle: {
      new_moon: 'DARKEST skies. Milky Way core visible. Best for deep sky objects and faint nebulae.',
      crescent_moon: 'Slight illumination. Foreground visible. Good for landscape astrophotography.',
      quarter_moon: 'Half-lit sky. Brighter deep sky objects visible. Milky Way washed out.',
      full_moon: 'Sky like daylight. Only brightest stars visible. Good for moonlit landscapes.'
    },
    gearRecommendations: {
      wideField: '14-24mm f/2.8 or faster. 20-30 second exposures. ISO 3200-6400. Wide open aperture.',
      deepSky: 'Star tracker essential. 200mm or longer. Multiple long exposures for stacking.',
      planetary: 'Long focal length (2000mm or more). High frame rate video. Lucky imaging technique.',
      filters: 'Light pollution filter (CLS or UHC). Narrowband (Ha, OIII) for emission nebulae.',
      essential: 'Sturdy tripod. Intervalometer. Dew heater. Extra batteries (cold drains them fast).'
    },
    special: [
      '500 Rule: 500 divided by focal length = maximum seconds before star trails (full frame)',
      '300 Rule for crop sensor: 300 divided by focal length = maximum seconds',
      'NPF Rule: more accurate - (35 x aperture + 30 x pixel pitch) divided by focal length',
      'Focus: use Bahtinov mask or live view 10x zoom on a bright star for precise focus',
      'Dark frames: shoot with lens cap on for noise reduction in post-processing',
      'Light pollution: Bortle 4 or better for Milky Way. Filters help for Bortle 5-7.',
      'Airglow: green and red bands visible in long exposures. Can be beautiful or annoying.',
      'Satellites: thousands of Starlink satellites may cross frames. Clone stamp in post.',
      'ISS transits: check transit-finder.com for flyover predictions in your area.'
    ]
  },
  macro: {
    idealConditions: {
      cloudCover: [40, 90],
      timeOfDay: ['early_morning', 'late_afternoon', 'overcast_midday'],
      wind: [0, 5],
      temp: [15, 25],
      humidity: [40, 80],
      uvIndex: [0, 4]
    },
    lightingStyle: {
      overcast: 'Perfect. Soft and even. No hotspots on shiny subjects like insects and flowers.',
      morning_dew: 'Magic hour. Water droplets on everything. Backlight creates sparkle.',
      golden_hour: 'Warm side light. Great for insects. Texture is emphasized.',
      full_sun: 'Terrible. Harsh shadows. Overexposed highlights. Subjects hide in shade.'
    },
    gearRecommendations: {
      lighting: 'Ring flash or twin flash. Diffuser essential. Reflector for fill light.',
      stabilization: 'Tripod with center column horizontal. Focusing rail for precise adjustments.',
      focus: 'Manual focus. Focus stacking (10-100+ shots). Remote shutter to prevent vibration.',
      windProtection: 'Windscreen or plamp to hold stems steady. Shoot at 1/200s or faster if handheld.'
    },
    special: [
      'Dewdrops: best 30-60 minutes after sunrise. Disappear as the air warms.',
      'Insects: cold mornings mean slow moving. Warm means fast. Shoot at dawn.',
      'Flowers: overcast gives saturated colors. Backlit gives translucent petals.',
      'Wind: ANY wind moves subjects at macro scale. Wait for lulls between gusts.',
      'Breathing: hold breath during exposure. Your movement matters at 1:1 magnification or higher.',
      'Spider webs: backlight plus dew equals magical. Overcast gives best detail.'
    ]
  },
  street: {
    idealConditions: {
      cloudCover: [20, 70],
      timeOfDay: ['morning', 'late_afternoon', 'golden_hour', 'blue_hour'],
      wind: [0, 25],
      temp: [10, 30],
      humidity: [30, 70],
      uvIndex: [0, 6]
    },
    lightingStyle: {
      golden_hour: 'Long shadows, warm tones. Classic street photography light.',
      blue_hour: 'City lights, neon signs. High contrast. Cinematic feel.',
      overcast: 'Even exposure. Good for black and white. Moody atmosphere.',
      rain: 'Reflections everywhere. Umbrellas. Puddles. Best street weather.',
      fog: 'Atmospheric. People emerge from mist. Light beams visible.',
      harsh_sun: 'Strong shadows, silhouettes. Good for graphic compositions.'
    },
    gearRecommendations: {
      general: 'Small, discreet camera. 35mm or 50mm. Fast lens (f/1.4-2) for low light.',
      rain: 'Weather-sealed body. Rain cover. Microfiber cloths. Plastic bag in pocket.',
      night: 'Fast prime lens. High ISO capability. Image stabilization helpful.',
      stealth: 'Silent shutter. Flip screen for waist-level shooting. Dark clothing.'
    },
    special: [
      'Rain: puddles create reflections. Shoot from low angle. Protect gear with rain cover.',
      'Snow: people react differently. High contrast scenes. +1 EV compensation.',
      'Fog: autofocus struggles. Use manual focus or zone focusing.',
      'Heat: people move slower. Siesta times mean empty streets.',
      'Cold: steam from manholes, visible breath. Gloves that allow shutter control.',
      'Legal: know local laws about photographing people, children, and buildings.'
    ]
  },
  wildlife: {
    idealConditions: {
      cloudCover: [20, 60],
      timeOfDay: ['dawn', 'dusk'],
      wind: [0, 15],
      temp: [10, 25],
      humidity: [30, 70],
      visibility: [5, 100]
    },
    lightingStyle: {
      dawn: 'Animals most active. Golden light. Mist possible. Best wildlife light.',
      dusk: 'Return to water or roost. Golden light. Silhouettes possible.',
      overcast: 'Even light for detail. Good for birds in flight with no harsh shadows.',
      backlight: 'Rim light on fur and feathers. Expose for subject, let background blow out.'
    },
    gearRecommendations: {
      lens: '400mm minimum. 600mm ideal. Teleconverter (1.4x or 2x) for extra reach.',
      support: 'Gimbal head on tripod. Monopod for mobility. Beanbag for vehicle shooting.',
      camera: 'High frames per second. Silent shutter. Good high ISO. Animal eye autofocus.',
      camo: 'Camo clothing, lens cover, blind or hide. Scent control (wind direction).'
    },
    special: [
      'Golden hour: animals active, beautiful light. Be in position BEFORE sunrise.',
      'Overcast: birds in flight easier to expose with no harsh shadows on underwings.',
      'Rain: many animals hunker down. Amphibians become active. Protect gear.',
      'Snow: tracks easy to find. High contrast scenes. +1.5 EV compensation.',
      'Wind: birds take off and land into wind. Position yourself upwind.',
      'Heat haze: over 25°C makes telephoto shots unusable. Shoot early morning.',
      'Migration: weather fronts trigger bird migration. Check BirdCast.info for forecasts.'
    ]
  },
  wedding: {
    idealConditions: {
      cloudCover: [40, 80],
      timeOfDay: ['late_afternoon', 'golden_hour', 'blue_hour'],
      wind: [0, 15],
      temp: [18, 28],
      humidity: [30, 60],
      uvIndex: [0, 5],
      visibility: [10, 100]
    },
    lightingStyle: {
      overcast: 'Soft, romantic light. No shadows on faces. Best for midday ceremonies.',
      golden_hour: 'THE wedding light. Warm glow. Backlit veil creates angelic effect.',
      open_shade: 'Safe option. Even light. No squinting. Predictable results.',
      harsh_sun: 'NIGHTMARE conditions. Squinting, harsh shadows, overheating. Seek shade immediately.',
      rain: 'Creative opportunity. Umbrellas. Reflections. Moody black and white.'
    },
    gearRecommendations: {
      camera: 'Dual card slots in both cameras. Backup body accessible at all times.',
      lens: '24-70 f/2.8 plus 70-200 f/2.8. Prime lens (85mm f/1.4) for portraits.',
      lighting: 'Speedlights. Off-camera flash. Video light for reception dancing.',
      emergency: 'Rain covers for all gear. Clear umbrellas for photos. Towels.',
      backup: 'Second shooter. Backup batteries, cards, body. Everything times two.'
    },
    special: [
      'Timeline: schedule portraits during golden hour. Work backwards from sunset time.',
      'First look: before ceremony gives more time, better light, and less stress.',
      'Ceremony: position sun behind officiant so guests do not squint.',
      'Family photos: open shade. Everyone\'s face evenly lit. Complete quickly.',
      'Bride prep: window light. Clean backgrounds. Detail shots.',
      'Dress: hang near window for detail shot. Veil: backlight for drama.',
      'Emergency kit: safety pins, fashion tape, blotting papers, hair spray.',
      'Rain plan: scout covered locations in advance. Clear umbrellas ready.'
    ]
  },
  real_estate: {
    idealConditions: {
      cloudCover: [20, 50],
      timeOfDay: ['morning', 'late_afternoon'],
      wind: [0, 10],
      temp: [15, 30],
      humidity: [30, 60],
      visibility: [10, 100]
    },
    lightingStyle: {
      front_light: 'Building facade evenly lit. Best for front elevation shots.',
      twilight: 'Interior lights on, sky deep blue. THE money shot. Higher value perception.',
      overcast: 'Even light. No harsh shadows. Good for interiors with no window blowout.',
      golden_hour: 'Warm, inviting. Good for exterior lifestyle shots.'
    },
    gearRecommendations: {
      lens: 'Ultra-wide lens (14-24mm). Tilt-shift for perspective control.',
      support: 'Tripod essential. Leveling base. Cable release.',
      lighting: 'Multiple speedlights for room lighting. Video lights for walkthrough.',
      technique: 'HDR bracketing (5 shots, 2EV spacing). Flash-ambient blending.',
      drone: 'Check local regulations. Aerial shots add significant value.'
    },
    special: [
      'Twilight: shoot 15-30 minutes after sunset. Sky deep blue. Lights on inside.',
      'Snow: makes properties look magical. Clear driveway and paths first.',
      'Fall: colorful trees add curb appeal. Rake leaves for clean shots.',
      'Pool: polarizer to cut glare. Twilight with underwater lights on.',
      'Kitchen: turn on all lights. Style with fresh flowers and fruit.',
      'Windows: shoot away from windows or bracket exposures.',
      'Lines: keep verticals vertical. Use tilt-shift or correct in post-processing.',
      'Declutter: move cars, trash bins, hoses. Hide personal items.'
    ]
  },
  sports: {
    idealConditions: {
      cloudCover: [30, 70],
      timeOfDay: ['morning', 'afternoon', 'golden_hour'],
      wind: [0, 20],
      temp: [10, 30],
      humidity: [30, 70],
      visibility: [5, 100]
    },
    lightingStyle: {
      overcast: 'Best for sports. Even light. No harsh shadows on faces.',
      golden_hour: 'Dramatic light. Long shadows. Beautiful but challenging exposure.',
      harsh_sun: 'Terrible. Deep eye socket shadows. Mixed exposure on uniforms.',
      stadium_lights: 'High ISO required. White balance tricky with cycling lights. Fast shutter.',
      rain: 'Dramatic conditions. Splash, mud, sliding. Protect gear. Embrace it.'
    },
    gearRecommendations: {
      lens: '70-200 f/2.8 minimum. 400mm f/2.8 ideal for field sports.',
      camera: 'High frames per second (10+). Fast autofocus tracking. Dual card slots.',
      support: 'Monopod for heavy lenses. Remote cameras for unique angles.',
      protection: 'Rain covers. UV filters for protection from balls and flying debris.'
    },
    special: [
      'Shutter speed: 1/1000s or faster for action. 1/2000s for ball sports.',
      'Position: shoot from low angle to make athletes look heroic.',
      'Faces: capture the ball AND the face. Expression equals emotion equals great shot.',
      'Background: clean backgrounds. Avoid cluttered stands or cars.',
      'Peak action: anticipation beats reaction. Know the sport you are shooting.',
      'Rain: fewer photographers, more dramatic images. You win.',
      'Heat: athletes suffer, you suffer. Hydrate. Camera may overheat in burst mode.'
    ]
  },
  drone_aerial: {
    idealConditions: {
      cloudCover: [0, 40],
      timeOfDay: ['golden_hour', 'blue_hour', 'morning'],
      wind: [0, 20],
      temp: [0, 35],
      humidity: [20, 70],
      visibility: [3, 100],
      uvIndex: [0, 8]
    },
    lightingStyle: {
      nadir: 'Straight down. Patterns, textures, shadows. Abstract compositions.',
      golden_hour: 'Long shadows reveal topography. Warm colors.',
      twilight: 'City lights, traffic trails. Long exposure possible on some drones.',
      overcast: 'Flat, even light. Good for mapping and surveying. Boring for creative.'
    },
    gearRecommendations: {
      filters: 'ND filters essential (ND4, ND8, ND16). Polarizer for water and glare.',
      batteries: 'Cold weather equals 30-50 percent less flight time. Keep batteries warm.',
      storage: 'Multiple SD cards. Shoot in D-Log or RAW for color grading.',
      safety: 'Strobe light for visibility. Landing pad. Propeller guards.'
    },
    special: [
      'Legal: know airspace restrictions. 400ft maximum altitude. Line of sight. No airports.',
      'Wind: under 20 km/h ideal. Over 30 km/h dangerous. Check gusts before flying.',
      'Rain: DO NOT FLY. Electronics plus water equals crash. Fog equals condensation.',
      'Snow: white landscape requires +1 EV. Cold equals short battery. Keep spares warm.',
      'Coastal: salt spray causes corrosion. Wipe down after every flight.',
      'Sunrise: calmest winds. Beautiful light. Worth the early alarm.',
      'Birds: seagulls and raptors may attack drone. Climb quickly to escape.',
      'Privacy: respect people\'s privacy. Know local laws and regulations.'
    ]
  }
};

// ============================================================================
// ENHANCED EXPOSURE CALCULATOR
// ============================================================================

function getExposureRecommendations(data, genre, lensFocalLength = 50) {
  const { condition, cloudCover, timeOfDay, uvIndex, temp, aqi } = data;
  const recommendations = {};
  const cloudPercent = cloudCover || 0;
  
  // Sunny 16 Rule variations
  if (condition === 'clear' && cloudPercent < 10) {
    recommendations.baseISO = 100;
    recommendations.sunny16 = 'f/16, 1/100s at ISO 100';
    recommendations.ev = 15;
    recommendations.notes = 'Bright sun with distinct shadows. Highest contrast.'
  } else if (cloudPercent < 30) {
    recommendations.baseISO = 200;
    recommendations.sunny16 = 'f/11, 1/250s at ISO 200 (slight overcast)';
    recommendations.ev = 14;
    recommendations.notes = 'Light overcast. Soft shadows.'
  } else if (cloudPercent < 70) {
    recommendations.baseISO = 400;
    recommendations.sunny16 = 'f/8, 1/250s at ISO 400 (overcast)';
    recommendations.ev = 13;
    recommendations.notes = 'Overcast. Shadows barely visible.'
  } else {
    recommendations.baseISO = 800;
    recommendations.sunny16 = 'f/5.6, 1/250s at ISO 800 (heavy overcast)';
    recommendations.ev = 12;
    recommendations.notes = 'Heavy overcast. Flat light.'
  }
  
  // Genre-specific exposure
  if (genre === 'portrait') {
    recommendations.aperture = 'f/1.4 to f/2.8 for subject isolation';
    recommendations.shutter = '1/125s minimum to prevent subject movement';
    recommendations.iso = recommendations.baseISO;
    recommendations.notes += ' For portraits: prioritize shutter speed, then aperture, then ISO.'
    
  } else if (genre === 'landscape') {
    recommendations.aperture = 'f/8 to f/11 for depth of field';
    recommendations.shutter = 'Tripod recommended below 1/60s';
    recommendations.iso = 100;
    recommendations.notes += ' For landscapes: maximize depth of field, use lowest ISO.'
    
  } else if (genre === 'sports') {
    recommendations.shutter = '1/1000s minimum for action freeze';
    recommendations.aperture = 'f/2.8 to f/4 for background separation';
    recommendations.iso = 'Auto ISO (100-6400) to maintain shutter speed';
    recommendations.notes += ' For sports: prioritize shutter speed above all else.'
    
  } else if (genre === 'astrophotography') {
    const maxExposure = Math.min(500 / (lensFocalLength || 50), 30);
    recommendations.aperture = 'Wide open (f/1.4 to f/2.8)';
    recommendations.shutter = `${Math.floor(maxExposure)} seconds (500 rule for ${lensFocalLength}mm)`;
    recommendations.iso = '1600 - 6400 depending on light pollution';
    recommendations.notes += ' For astro: prioritize aperture (wide open), then ISO, then shutter.'
    
  } else if (genre === 'macro') {
    recommendations.aperture = 'f/8 to f/16 for depth of field';
    recommendations.shutter = 'Tripod required. Flash recommended.';
    recommendations.iso = recommendations.baseISO;
    recommendations.notes += ' For macro: depth of field is critical. Focus stacking may be needed.'
    
  } else if (genre === 'street') {
    recommendations.aperture = 'f/5.6 to f/8 for zone focusing';
    recommendations.shutter = '1/250s minimum to freeze motion';
    recommendations.iso = 'Auto ISO to maintain shutter speed';
    recommendations.notes += ' For street: use zone focusing and anticipate the moment.'
    
  } else if (genre === 'wedding') {
    recommendations.aperture = 'f/2.8 to f/4 for group shots, f/1.4 to f/2 for portraits';
    recommendations.shutter = '1/125s minimum, 1/250s for action';
    recommendations.iso = 'Auto ISO up to 6400';
    recommendations.notes += ' For weddings: always have backup settings and equipment.'
  }
  
  // ND filter recommendations
  if (cloudPercent < 30 && genre === 'landscape') {
    recommendations.ndFilter = '3-stop ND for standard, 10-stop for long exposure (water smoothing)';
  } else if (genre === 'waterfall' || genre === 'water') {
    recommendations.ndFilter = '6-10 stop ND for water smoothing';
  } else if (genre === 'sports' && condition === 'clear') {
    recommendations.ndFilter = 'None needed (shutter speed already fast)';
  } else {
    recommendations.ndFilter = 'None needed for current conditions';
  }
  
  // Polarizer recommendation
  if (condition === 'clear' || cloudPercent < 40) {
    recommendations.polarizer = 'Recommended for sky and water. Cuts glare and haze.';
  } else if (cloudPercent > 70) {
    recommendations.polarizer = 'Not effective. No glare to cut.';
  } else {
    recommendations.polarizer = 'Optional. Some benefit for water/foliage.';
  }
  
  return recommendations;
}

// ============================================================================
// ENHANCED SUNSET/SUNRISE QUALITY PREDICTOR
// ============================================================================

function predictSunsetQuality(data) {
  const { cloudCover, humidity, aqi, condition, temp, dewPoint, wind, pressure } = data;
  let quality = 0;
  const factors = [];
  const cloudPercent = cloudCover || 0;
  
  // Clouds needed for color reflection
  if (cloudPercent >= 30 && cloudPercent <= 70) {
    quality += 4;
    factors.push('Good cloud coverage for color reflection');
  } else if (cloudPercent >= 15 && cloudPercent < 30) {
    quality += 2;
    factors.push('Some clouds, some color expected');
  } else if (cloudPercent < 10) {
    quality += 0;
    factors.push('Clear sky equals boring sunset (no clouds to catch color)');
  } else if (cloudPercent > 90) {
    quality -= 2;
    factors.push('Overcast equals no sunset visible');
  } else if (cloudPercent > 75) {
    quality += 0;
    factors.push('Too cloudy for visible sunset');
  }
  
  // High clouds catch color, low clouds block. Use pressure as proxy for cloud type.
  if (pressure > 1020) {
    quality += 1;
    factors.push('High pressure suggests high clouds (better for color)');
  } else if (pressure < 1005) {
    quality -= 1;
    factors.push('Low pressure suggests low clouds (block color)');
  }
  
  // Humidity and haze
  if (humidity < 60 && cloudPercent > 20) {
    quality += 2;
    factors.push('Drier air equals cleaner colors, less haze');
  } else if (humidity > 80) {
    quality -= 1;
    factors.push('High humidity mutes colors');
  }
  
  // AQI: some pollution creates colorful sunsets
  if (aqi > 50 && aqi < 150) {
    quality += 2;
    factors.push('Moderate particulates scatter red and orange light');
  } else if (aqi > 150) {
    quality -= 2;
    factors.push('Heavy pollution mutes colors, adds brown cast');
  } else if (aqi < 30) {
    quality += 1;
    factors.push('Clean air = crisp, clear sunset');
  }
  
  // Temperature and dew point spread
  if (dewPoint && (temp - dewPoint) < 3) {
    quality += 1;
    factors.push('Small temp-dew spread = potential for mist and atmosphere');
  } else if (dewPoint && (temp - dewPoint) > 10) {
    quality -= 1;
    factors.push('Large temp-dew spread = dry air, less atmospheric effect');
  }
  
  // Post-rain = clean air
  if (condition === 'rain' || condition === 'thunderstorm') {
    quality += 2;
    factors.push('Rain clears particulates = cleaner sunset after storm');
  }
  
  // Wind effects
  if (wind > 20) {
    quality -= 1;
    factors.push('Wind disperses clouds, less dramatic color');
  }
  
  // Time of year
  const season = getSeason();
  if (season === 'fall' || season === 'autumn') {
    quality += 1;
    factors.push('Fall often produces best sunsets');
  }
  
  const rating = quality >= 8 ? 'SPECTACULAR - Must shoot' :
                 quality >= 6 ? 'VERY GOOD - Worth planning for' :
                 quality >= 4 ? 'GOOD - Decent potential' :
                 quality >= 2 ? 'FAIR - Maybe, maybe not' :
                 'POOR - Do not bother';
  
  return { quality: Math.min(10, Math.max(0, quality)), rating, factors };
}

// ============================================================================
// ENHANCED LENS FOGGING PREDICTOR
// ============================================================================

function getFoggingRisk(data) {
  const { temp, humidity, dewPoint, condition, wind } = data;
  
  if (!dewPoint) {
    return { 
      risk: 'Unknown', 
      advice: ['Check dew point forecast before shooting in humid conditions'] 
    };
  }
  
  const spread = temp - dewPoint;
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  
  if (spread <= 1 || isRaining) {
    return {
      risk: 'CRITICAL',
      advice: [
        'Lens WILL fog immediately upon going outside',
        'Acclimate gear: leave camera bag outside for 30+ minutes before shooting',
        'Use dew heater strips on lens',
        'Keep camera and lens warmer than ambient (chemical hand warmers in camera bag)',
        'Moving from cold to warm: put camera in sealed plastic bag until it warms',
        'Silica gel packs in camera bag',
        'Microfiber cloths - bring LOTS of them',
        'Consider rescheduling if this is a critical shoot'
      ]
    };
  } else if (spread <= 3) {
    return {
      risk: 'HIGH',
      advice: [
        'Lens likely to fog during shoot',
        'Acclimate gear for 20-30 minutes before shooting',
        'Use dew heater or anti-fog wipes',
        'Keep lens cap on when not shooting',
        'Point lens down when not shooting (less surface area for dew)'
      ]
    };
  } else if (spread <= 5) {
    return {
      risk: 'MODERATE',
      advice: [
        'Some fogging possible after extended shooting',
        'Acclimate gear for 15-20 minutes',
        'Keep microfiber cloths handy'
      ]
    };
  } else if (spread <= 8) {
    return {
      risk: 'LOW',
      advice: ['Minimal fogging risk. Standard precautions sufficient.']
    };
  }
  
  return {
    risk: 'VERY LOW',
    advice: ['No significant fogging risk. Shoot normally.']
  };
}

// ============================================================================
// MILKY WAY VISIBILITY CALCULATOR
// ============================================================================

function calculateGetMilkyWayVisibility(data) {
  const { cloudCover, moonPhase, moonIllumination, aqi, visibility, lat, lon } = data;
  const factors = [];
  let score = 0;
  
  // Moon phase
  if (moonIllumination < 10) {
    score += 30;
    factors.push('New moon or crescent - dark skies');
  } else if (moonIllumination < 30) {
    score += 20;
    factors.push('Crescent moon - somewhat visible');
  } else if (moonIllumination < 60) {
    score += 5;
    factors.push('Quarter moon - Milky Way washed out');
  } else {
    score -= 20;
    factors.push('Bright moon - Milky Way not visible');
  }
  
  // Clouds
  if (cloudCover < 10) {
    score += 30;
    factors.push('Clear skies');
  } else if (cloudCover < 30) {
    score += 15;
    factors.push('Mostly clear');
  } else if (cloudCover < 60) {
    score += 0;
    factors.push('Partly cloudy - may see patches');
  } else {
    score -= 20;
    factors.push('Too cloudy');
  }
  
  // Light pollution (approximated by AQI and visibility)
  if (aqi < 50) {
    score += 15;
    factors.push('Good air quality - minimal light scatter');
  } else if (aqi < 100) {
    score += 5;
    factors.push('Moderate air quality');
  } else {
    score -= 10;
    factors.push('Poor air quality - significant light scatter');
  }
  
  if (visibility > 20) {
    score += 10;
    factors.push('Excellent visibility');
  } else if (visibility > 10) {
    score += 5;
    factors.push('Good visibility');
  } else {
    score -= 10;
    factors.push('Poor visibility');
  }
  
  // Season (Milky Way core visible May-September in Northern Hemisphere)
  const season = getSeason();
  if (season === 'summer' || season === 'spring') {
    score += 10;
    factors.push('Summer - Milky Way core visible');
  } else if (season === 'fall') {
    score += 5;
    factors.push('Fall - Milky Way visible but core setting');
  } else {
    score -= 5;
    factors.push('Winter - Milky Way faint');
  }
  
  // Rating
  let rating = '';
  if (score > 80) rating = 'EXCELLENT - Milky Way will be spectacular';
  else if (score > 60) rating = 'GOOD - Milky Way visible with detail';
  else if (score > 40) rating = 'FAIR - Milky Way visible but washed out';
  else if (score > 20) rating = 'POOR - Milky Way barely visible';
  else rating = 'NOT VISIBLE - Conditions too poor';
  
  return {
    score: Math.min(100, Math.max(0, score)),
    rating,
    factors,
    visible: score > 40
  };
}

// ============================================================================
// MAIN PHOTOGRAPHY ADVICE FUNCTION (EXPANDED)
// ============================================================================

export const getPhotographyAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    conditionCode, cloudCover, condition, humidity, wind, windGust,
    uvIndex, visibility, sunrise, sunset, temp, city, dewPoint,
    aqi, pressure, tempMin, tempMax, moonPhase, precipitation,
    lat, lon
  } = data;
  
  const q = question.toLowerCase();
  
  const cloudPercent = cloudCover || 0;
  const goldenHour = calcGoldenHour(sunrise, sunset);
  const blueHour = calcBlueHour(sunrise, sunset);
  const comfort = getComfortScore({ temp, humidity, wind });
  const sunPosition = getSunPosition(data);
  const sunAngle = getSunAngle(data);
  const uvLevel = getUVLevel(uvIndex);
  const visibilityCategory = getVisibilityCategory(visibility);
  const moonIllumination = getMoonIllumination(moonPhase);
  const foggingRisk = getFoggingRisk(data);
  const sunsetQuality = predictSunsetQuality(data);
  const milkyWay = getMilkyWayVisibility(data);
  
  // Detect photography genre
  let genre = 'portrait';
  if (q.includes('astro') || q.includes('star') || q.includes('milky way') || q.includes('night sky')) {
    genre = 'astrophotography';
  } else if (q.includes('landscape') || q.includes('scenery') || q.includes('nature')) {
    genre = 'landscape';
  } else if (q.includes('macro') || q.includes('close up') || q.includes('insect') || q.includes('flower')) {
    genre = 'macro';
  } else if (q.includes('street') || q.includes('urban') || q.includes('city')) {
    genre = 'street';
  } else if (q.includes('wildlife') || q.includes('bird') || q.includes('animal')) {
    genre = 'wildlife';
  } else if (q.includes('wedding') || q.includes('bride') || q.includes('groom')) {
    genre = 'wedding';
  } else if (q.includes('real estate') || q.includes('property') || q.includes('house')) {
    genre = 'real_estate';
  } else if (q.includes('sport') || q.includes('action') || q.includes('game')) {
    genre = 'sports';
  } else if (q.includes('drone') || q.includes('aerial') || q.includes('fly')) {
    genre = 'drone_aerial';
  }
  
  const genreConfig = PHOTOGRAPHY_GENRES[genre];
  const exposure = getExposureRecommendations(data, genre);
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "PHOTOGRAPHY WEATHER AND LIGHTING ADVISORY",
    "SHOOTING CONDITIONS REPORT",
    "PHOTOGRAPHY LIGHTING ASSESSMENT",
    "PHOTO WEATHER ANALYSIS",
    "CAMERA CONDITIONS FORECAST"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `Genre: ${genre.replace(/_/g, ' ').toUpperCase()}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${Math.round(temp)}°C (${comfort})\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  response += `  Sky: ${condition || 'Unknown'} (${Math.round(cloudPercent)}% cloud cover)\n`;
  response += `  Wind: ${Math.round(wind)} km/h (gusts to ${Math.round(windGust || wind + 5)} km/h)\n`;
  response += `  Humidity: ${Math.round(humidity)}% (${humidity > 80 ? 'HIGH - fogging risk' : humidity < 30 ? 'LOW - dry air' : 'MODERATE'})\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel})\n`;
  response += `  Visibility: ${visibility} km (${visibilityCategory})\n`;
  if (aqi > 50) response += `  Air Quality: AQI ${aqi} ${aqi > 100 ? '- affects clarity' : ''}\n`;
  if (dewPoint) response += `  Dew Point: ${Math.round(dewPoint)}°C (spread: ${Math.round(temp - dewPoint)}°C)\n`;
  response += `  Sun angle: ${Math.round(sunAngle)}°\n`;
  response += `\n`;
  
  // Light quality assessment
  response += `=== LIGHTING QUALITY ===\n`;
  
  // Determine light quality based on conditions
  let lightQuality = 'Standard';
  let lightAdvice = '';
  
  if (sunPosition === 'golden_hour') {
    lightQuality = 'EXCELLENT - Golden Hour';
    lightAdvice = 'The best light of the day. Warm, directional, flattering. Shoot now.';
  } else if (sunPosition === 'blue_hour') {
    lightQuality = 'EXCELLENT - Blue Hour';
    lightAdvice = 'Cool, ethereal light. City lights balanced with the sky. Perfect for cityscapes.';
  } else if (sunPosition === 'sunrise' || sunPosition === 'sunset') {
    lightQuality = 'VERY GOOD - Sunrise or Sunset';
    lightAdvice = 'Beautiful light approaching. Prepare for golden hour.';
  } else if (cloudPercent > 80) {
    lightQuality = 'GOOD - Overcast (Softbox)';
    lightAdvice = 'Soft, even light. Perfect for portraits and macro. No harsh shadows.';
  } else if (cloudPercent > 50) {
    lightQuality = 'GOOD - Partly Cloudy';
    lightAdvice = 'Dynamic light with clouds and sun. Dramatic skies. Excellent for landscapes.';
  } else if (cloudPercent > 20) {
    lightQuality = 'FAIR - Mostly Clear';
    lightAdvice = 'Bight light with some haze. Good for B&W and architecture. Harsh for portraits.';
  } else if (sunPosition === 'harsh_midday') {
    lightQuality = 'POOR - Harsh Midday Sun';
    lightAdvice = 'Sun directly overhead. Unflattering. Seek shade or use diffusers.';
  } else {
    lightQuality = 'MODERATE';
    lightAdvice = 'Acceptable conditions. Adjust approach for best results.';
  }
  
  response += `  Quality: ${lightQuality}\n`;
  response += `  Advice: ${lightAdvice}\n`;
  
  // Specific lighting characteristics
  if (sunPosition === 'golden_hour' || sunPosition === 'sunset' || sunPosition === 'sunrise') {
    response += `  Sun angle: ${Math.round(sunAngle)}° - low angle creates long shadows and depth\n`;
  }
  if (cloudPercent > 30 && cloudPercent < 70) {
    response += `  Clouds: ${Math.round(cloudPercent)}% - good for texture and drama\n`;
  }
  if (uvIndex > 6) {
    response += `  UV: HIGH - subjects may squint. Use shade or diffusers.\n`;
  }
  if (humidity > 70) {
    response += `  Humidity: HIGH - potential for lens fogging and hazy distance\n`;
  }
  response += `\n`;
  
  // Sunset/sunrise quality
  if (sunPosition === 'sunset' || sunPosition === 'sunrise') {
    response += `=== ${sunPosition.toUpperCase()} QUALITY ===\n`;
    response += `  Quality score: ${sunsetQuality.quality}/10 (${sunsetQuality.rating})\n`;
    sunsetQuality.factors.forEach(f => response += `  • ${f}\n`);
    response += `\n`;
  }
  
  // Milky Way visibility (for astro)
  if (genre === 'astrophotography' || q.includes('milky') || q.includes('star')) {
    response += `=== MILKY WAY VISIBILITY ===\n`;
    response += `  Score: ${milkyWay.score}/100 (${milkyWay.rating})\n`;
    response += `  Visible: ${milkyWay.visible ? 'YES' : 'NO'}\n`;
    milkyWay.factors.forEach(f => response += `  • ${f}\n`);
    response += `\n`;
  }
  
  // Timing
  response += `=== TIMING RECOMMENDATIONS ===\n`;
  if (goldenHour) {
    response += `  Golden hour: ${goldenHour.start} - ${goldenHour.end}\n`;
  }
  if (blueHour) {
    response += `  Blue hour: ${blueHour.start} - ${blueHour.end}\n`;
  }
  if (sunrise) {
    response += `  Sunrise: ${sunrise} | Sunset: ${sunset}\n`;
  }
  
  if (sunPosition === 'harsh_midday') {
    response += `  • Midday sun - seek open shade or use diffusers\n`;
    response += `  • Good for: B&W, infrared, architecture interiors\n`;
    response += `  • Bad for: portraits, landscapes with color\n`;
  } else if (sunPosition === 'golden_hour') {
    response += `  • GOLDEN HOUR NOW - shoot everything\n`;
    response += `  • Time remaining: approximately 30-45 minutes\n`;
  }
  
  if (moonPhase && genre === 'astrophotography') {
    response += `  Moon phase: ${moonPhase} (${Math.round(moonIllumination)}% illuminated)\n`;
    if (moonIllumination > 50) {
      response += `  • Bright moon - deep sky objects not visible\n`;
    }
  }
  response += `\n`;
  
  // Exposure settings
  response += `=== EXPOSURE SETTINGS ===\n`;
  if (exposure.sunny16) response += `  Sunny 16: ${exposure.sunny16}\n`;
  if (exposure.aperture) response += `  Aperture: ${exposure.aperture}\n`;
  if (exposure.shutter) response += `  Shutter: ${exposure.shutter}\n`;
  if (exposure.iso) response += `  ISO: ${exposure.iso}\n`;
  if (exposure.ndFilter) response += `  ND Filter: ${exposure.ndFilter}\n`;
  if (exposure.polarizer) response += `  Polarizer: ${exposure.polarizer}\n`;
  if (exposure.notes) response += `  Note: ${exposure.notes}\n`;
  response += `\n`;
  
  // Gear recommendations
  response += `=== GEAR RECOMMENDATIONS ===\n`;
  if (genreConfig && genreConfig.gearRecommendations) {
    const gearRec = genreConfig.gearRecommendations;
    let hasGear = false;
    for (const [conditionKey, rec] of Object.entries(gearRec)) {
      if (conditionKey === 'general') {
        response += `  • ${rec}\n`;
        hasGear = true;
      } else if (conditionKey === 'overcast' && cloudPercent > 60) {
        response += `  • ${rec}\n`;
        hasGear = true;
      } else if (conditionKey === 'golden_hour' && sunPosition === 'golden_hour') {
        response += `  • ${rec}\n`;
        hasGear = true;
      } else if (conditionKey === 'rain' && condition === 'rain') {
        response += `  • ${rec}\n`;
        hasGear = true;
      } else if (conditionKey === 'harsh_sun' && sunPosition === 'harsh_midday') {
        response += `  • ${rec}\n`;
        hasGear = true;
      }
    }
    if (!hasGear && genreConfig.tips) {
      genreConfig.tips.slice(0, 3).forEach(tip => response += `  • ${tip}\n`);
    }
  }
  
  // Lens fogging
  if (foggingRisk.risk !== 'LOW') {
    response += `\n  LENS FOGGING: ${foggingRisk.risk} RISK\n`;
    foggingRisk.advice.slice(0, 3).forEach(a => response += `    • ${a}\n`);
  }
  response += `\n`;
  
  // Genre-specific advice
  if (genreConfig && genreConfig.special) {
    response += `=== ${genre.replace(/_/g, ' ').toUpperCase()} ADVICE ===\n`;
    genreConfig.special.slice(0, 6).forEach(s => response += `  • ${s}\n`);
    response += `\n`;
  }
  
  // Weather warnings
  response += `=== WEATHER WARNINGS ===\n`;
  let hasWarnings = false;
  
  if (condition === 'thunderstorm') {
    response += `  • THUNDERSTORM: Do not shoot outside. Lightning risk.\n`;
    hasWarnings = true;
  }
  if (wind > 35) {
    response += `  • DANGEROUS WIND: ${Math.round(wind)}km/h - tripods will blow over.\n`;
    response += `  • Sand and debris damage to lenses possible.\n`;
    hasWarnings = true;
  }
  if (aqi > 150) {
    response += `  • POOR AIR QUALITY: AQI ${aqi} - images will be hazy.\n`;
    response += `  • Consider rescheduling or shooting indoors.\n`;
    hasWarnings = true;
  }
  if (temp > 35) {
    response += `  • EXTREME HEAT: ${Math.round(temp)}°C - equipment may overheat.\n`;
    response += `  • Subjects uncomfortable. Short shoots only.\n`;
    hasWarnings = true;
  }
  if (temp < -5) {
    response += `  • EXTREME COLD: ${Math.round(temp)}°C - batteries drain fast.\n`;
    response += `  • Bring 3x normal batteries. Keep spares warm.\n`;
    hasWarnings = true;
  }
  if (humidity > 85) {
    response += `  • HIGH HUMIDITY: ${Math.round(humidity)}% - lens fogging risk.\n`;
    response += `  • Acclimate gear. Keep microfiber cloths handy.\n`;
    hasWarnings = true;
  }
  
  if (!hasWarnings) {
    response += `  No significant weather warnings for photography.\n`;
  }
  response += `\n`;
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (condition === 'thunderstorm' || wind > 40) {
    response += `  DANGEROUS CONDITIONS. Stay inside. Edit photos instead.\n`;
  } else if (sunPosition === 'golden_hour' && cloudPercent >= 20 && cloudPercent <= 70) {
    response += `  PERFECT CONDITIONS. Golden hour plus clouds equals magic. Go shoot NOW.\n`;
  } else if (genre === 'portrait' && cloudPercent >= 40 && cloudPercent <= 80) {
    response += `  EXCELLENT PORTRAIT CONDITIONS. Soft, even light. Book that shoot.\n`;
  } else if (genre === 'landscape' && (sunPosition === 'golden_hour' || sunPosition === 'sunset')) {
    response += `  GREAT LANDSCAPE CONDITIONS. Get out and shoot.\n`;
  } else if (genre === 'astrophotography' && milkyWay.visible && cloudPercent < 20 && moonIllumination < 20) {
    response += `  EXCELLENT ASTRO CONDITIONS. Perfect night for Milky Way.\n`;
  } else if (sunPosition === 'harsh_midday' && cloudPercent < 30) {
    response += `  HARSH LIGHT CONDITIONS. Wait for golden hour or find open shade.\n`;
  } else {
    response += `  WORKABLE CONDITIONS. Adjust approach for best results.\n`;
  }
  
  const wisdom = [
    "The best camera is the one you have with you. - Chase Jarvis",
    "Your first 10,000 photographs are your worst. - Henri Cartier-Bresson",
    "Light makes photography. Embrace light. Admire it. Love it. But above all, know light. - George Eastman",
    "There are no rules for good photographs, there are only good photographs. - Ansel Adams",
    "The picture that you took with your camera is the imagination you want to create with reality. - Scott Lorenzo",
    "What I like about photographs is that they capture a moment that is gone forever, impossible to reproduce. - Karl Lagerfeld"
  ];
  response += `\n--- PHOTOGRAPHY WISDOM ---\n${random(wisdom)}`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  predictSunsetQuality, 
  getFoggingRisk, 
  getExposureRecommendations,
  getMilkyWayVisibility
};

export default getPhotographyAdvice;
