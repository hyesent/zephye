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
  "Is it good lighting for photos today?",
  "Should I do a photoshoot now?",
  "Is golden hour good today?",
  "Will clouds ruin my photos?",
  "Good weather for outdoor photography?",
  "Is it too harsh for portraits?",
  "Best time for landscape photos?",
  "Will rain affect my shoot?",
  "Should I bring lighting equipment?",
  "Is it good for astrophotography tonight?",
  "Can I shoot the Milky Way?",
  "Will fog create good atmosphere?",
  "Is the light good for macro?",
  "Should I use a polarizer today?",
  "What ND filter do I need?",
  "Is it too windy for long exposure?",
  "Will humidity fog my lens?",
  "Best camera settings for today?",
  "Is it good for street photography?",
  "Should I shoot in RAW today?",
  "Will the sunset be colorful?",
  "Is it good for drone photography?",
  "Can I shoot infrared today?",
  "Is the contrast too high?",
  "Should I bracket my exposures?",
  "Will there be fog at sunrise?",
  "Is it good for waterfall photos?",
  "Can I shoot sports today?",
  "Will the leaves be colorful for autumn photos?",
  "Is it good for bird photography?",
  "Should I bring flash today?",
  "Is the snow reflective enough?",
  "Can I shoot at the beach?",
  "Will there be heat haze?",
  "Is it good for architectural photography?",
  "Should I use a lens hood?",
  "Will there be lens flare?",
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
  "Should I use HDR today?",
  "Is it good for black and white?",
  "Will the air quality affect sharpness?",
  "Is it good for tilt-shift?",
  "Can I shoot the stars tonight?",
  "Is it good for light painting?",
  "Will there be interesting shadows?",
  "Should I use a reflector?",
  "Is it good for underwater photography?",
  "Will the snow be too bright?",
  "Should I use exposure compensation?",
  "Is it good for timelapse?",
  "Will there be fog in the valley?",
  "Is it good for aerial photography?",
  "Should I use a CPL filter?",
  "Is it good for concert photography outside?",
  "Will the moon be too bright for stars?",
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
  "Will there be steam/fog after rain?",
  "Is it good for smoke bomb photos?",
  "Should I protect my gear from salt spray?",
  "Is it good for double exposures?",
  "Will the ice formations be good?",
  "Should I use a rain cover?",
  "Is it good for documentary photography?",
  "Can I shoot fireworks tonight?",
  "Will the northern lights be visible?",
  "Is it good for eclipse photography?",
  "Should I use a star tracker?",
  "Is the seeing good for planetary imaging?",
  "Can I shoot the ISS transit?",
  "Will there be iridium flares?",
  "Is it good for meteor shower photos?",
  "Should I use a bahtinov mask?",
  "Will light pollution ruin astro shots?",
  "Is it good for deep sky objects?",
  "Can I shoot the zodiacal light?",
  "Will there be airglow?"
];

// ============================================================================
// PHOTOGRAPHY GENRE DATABASE
// ============================================================================

const PHOTOGRAPHY_GENRES = {
  portrait: {
    idealConditions: {
      cloudCover: [40, 90],     // Overcast to partly cloudy (soft light)
      timeOfDay: ['golden_hour', 'blue_hour', 'overcast_midday'],
      wind: [0, 15],            // Calm to light breeze
      temp: [15, 28],           // Comfortable for subjects
      humidity: [30, 70],       // No lens fogging, no sweating
      uvIndex: [0, 5]           // No squinting
    },
    lightingStyle: {
      overcast: 'Giant softbox. Even, flat light. Minimal shadows. Great for all skin types.',
      golden_hour: 'Warm, directional. Hair light. Backlight = magical glow. Best portrait light.',
      open_shade: 'Soft, cool-toned. No squinting. Even exposure. Good for midday.',
      window_light: 'Classic Rembrandt. Directional but soft. Use reflector for fill.',
      harsh_sun: 'AVOID. Raccoon eyes. Harsh shadows. Subjects squint. Unflattering.'
    },
    gearRecommendations: {
      overcast: 'Reflector (white/silver). No ND needed. Wide open for background separation.',
      golden_hour: 'Reflector (gold). Lens hood for flare control. Backlight = +1 stop exposure.',
      harsh_sun: 'Scrim/diffuser essential. Fill flash or reflector. ND filter if shooting wide open.'
    },
    special: [
      'Catchlights: overcast = no natural catchlights (use reflector or bring subject near light source)',
      'Skin tones: overcast = most accurate. Golden hour = warm cast (embrace or correct)',
      'Wardrobe: wind = avoid flowy unless intentional. Cold = goosebumps. Hot = sweat/shine',
      'Makeup: humidity = matte finishing powder essential. Cold = wind-burned cheeks',
      'Hair: wind > 15 km/h = messy. Humidity > 70% = frizz. Use anti-frizz products'
    ]
  },
  landscape: {
    idealConditions: {
      cloudCover: [20, 60],     // Partly cloudy (dramatic sky)
      timeOfDay: ['golden_hour', 'blue_hour', 'sunrise', 'sunset'],
      wind: [0, 20],            // Calm for reflections, light for cloud movement
      temp: [5, 25],            // Heat haze above 25°C
      humidity: [30, 60],       // Clear air for distant subjects
      visibility: [10, 100],    // Maximum clarity
      uvIndex: [0, 6]           // Lower = less haze
    },
    lightingStyle: {
      golden_hour: 'THE landscape light. Low angle = texture, depth, warm tones.',
      blue_hour: 'Cool, ethereal. City lights balance with sky. Best for cityscapes.',
      midday: 'Harsh and flat. Only for B&W or infrared. Skip color landscapes.',
      storm_light: 'Sunbeams through clouds. Dramatic. Best right after storm passes.',
      overcast: 'Flat, boring. Good for intimate landscapes, waterfalls, forests.',
      fog: 'Magical. Layers of depth. Minimalist compositions. Trees disappear into mist.'
    },
    gearRecommendations: {
      golden_hour: 'Polarizer (cuts glare, saturates). 3-stop ND grad for sky.',
      blue_hour: 'Tripod essential. Cable release. Long exposure for light trails.',
      midday: '10-stop ND for long exposure. Polarizer to cut haze.',
      storm: 'Rain cover. Lens hood. Microfiber cloths. Weather-sealed body.',
      waterfall: '3-6 stop ND. Polarizer (cuts reflections on water/rocks). Tripod.',
      fog: 'Telephoto for compression. Wide angle for depth. Manual focus (AF hunts in fog).'
    },
    special: [
      'Heat haze: > 25°C = shimmering air over distance. Telephoto unusable.',
      'Wildfire smoke: incredible sunsets but hazy distant shots. Check AQI.',
      'Fall colors: overcast = more saturated. Sunny = more contrast. Polarizer removes leaf glare.',
      'Snow: +1.5 to +2 stops exposure compensation (camera underexposes white)',
      'Sand/desert: protection from blowing sand. Sensor cleaning kit essential.',
      'Coastal: salt spray on lens = ruined shots. UV/protective filter. Clean after shooting.'
    ]
  },
  astrophotography: {
    idealConditions: {
      cloudCover: [0, 10],      // Perfectly clear or minimal clouds
      timeOfDay: ['astronomical_night'],
      wind: [0, 15],            // Calm for sharp stars
      temp: [0, 20],            // Cooler = less sensor noise
      humidity: [20, 60],       // Dry air = clear, no dew
      visibility: [15, 100],
      moonPhase: ['new_moon', 'waxing_crescent', 'waning_crescent'],
      moonIllumination: [0, 20]  // Percentage
    },
    lightingStyle: {
      new_moon: 'DARKEST skies. Milky Way core visible. Best for deep sky.',
      crescent_moon: 'Slight illumination. Foreground visible. Good for landscape astro.',
      quarter_moon: 'Half-lit sky. Brighter deep sky visible. Milky Way washed out.',
      full_moon: 'Sky like daylight. Only brightest stars. Good for moonlit landscapes.'
    },
    gearRecommendations: {
      wideField: '14-24mm f/2.8 or faster. 20-30 second exposures. ISO 3200-6400.',
      deepSky: 'Star tracker. 200mm+. Multiple long exposures for stacking.',
      planetary: 'Long focal length (2000mm+). High frame rate video. Lucky imaging.',
      filters: 'Light pollution filter (CLS, UHC). Narrowband (Ha, OIII) for nebulae.',
      essential: 'Sturdy tripod. Intervalometer. Dew heater. Extra batteries (cold = fast drain).'
    },
    special: [
      '500 Rule: 500 / focal length = max seconds before star trails (full frame)',
      '300 Rule for crop sensor: 300 / focal length = max seconds',
      'NPF Rule: more accurate - (35 x aperture + 30 x pixel pitch) / focal length',
      'Focus: use Bahtinov mask or live view 10x zoom on bright star',
      'Dark frames: shoot with lens cap on for noise reduction',
      'Light pollution: Bortle 4 or better for Milky Way. Filter for Bortle 5-7.',
      'Airglow: green/red bands in long exposures. Can be beautiful or annoying.',
      'Satellites: thousands of Starlink trails. Clone stamp in post.',
      'ISS transits: check transit-finder.com for flyover predictions'
    ]
  },
  macro: {
    idealConditions: {
      cloudCover: [40, 90],     // Diffused light, no harsh shadows
      timeOfDay: ['early_morning', 'late_afternoon', 'overcast_midday'],
      wind: [0, 5],             // Absolutely calm (subject movement at macro scale)
      temp: [15, 25],           // Insects active, comfortable working
      humidity: [40, 80],       // Dewdrops in morning, but not fogging lens
      uvIndex: [0, 4]           // Avoid harsh light
    },
    lightingStyle: {
      overcast: 'Perfect. Soft, even. No hotspots on shiny subjects.',
      morning_dew: 'Magic hour. Water droplets on everything. Backlight = sparkle.',
      golden_hour: 'Warm side light. Great for insects. Texture emphasized.',
      full_sun: 'Terrible. Harsh shadows. Overexposed highlights. Subjects hide.'
    },
    gearRecommendations: {
      lighting: 'Ring flash or twin flash. Diffuser essential. Reflector for fill.',
      stabilization: 'Tripod with center column horizontal. Focusing rail.',
      focus: 'Manual focus. Focus stacking (10-100+ shots). Remote shutter.',
      windProtection: 'Windscreen/plamp to hold stems steady. Shoot at 1/200s+ if handheld.'
    },
    special: [
      'Dewdrops: best 30-60 minutes after sunrise. Disappear as air warms.',
      'Insects: cold mornings = slow moving. Warm = fast. Shoot at dawn.',
      'Flowers: overcast = saturated colors. Backlit = translucent petals.',
      'Wind: ANY wind moves subjects at macro scale. Wait for lulls.',
      'Breathing: hold breath during exposure. Your movement matters at 1:1+',
      'Spider webs: backlight + dew = magical. Overcast best for detail.'
    ]
  },
  street: {
    idealConditions: {
      cloudCover: [20, 70],     // Interesting light, some shadows
      timeOfDay: ['morning', 'late_afternoon', 'golden_hour', 'blue_hour'],
      wind: [0, 25],            // Some wind adds movement to scenes
      temp: [10, 30],           // People out and about
      humidity: [30, 70],
      uvIndex: [0, 6]
    },
    lightingStyle: {
      golden_hour: 'Long shadows, warm tones. Classic street light.',
      blue_hour: 'City lights, neon signs. High contrast. Cinematic.',
      overcast: 'Even exposure. Good for B&W. Moody atmosphere.',
      rain: 'Reflections! Umbrellas! Puddles! Best street weather.',
      fog: 'Atmospheric. People emerge from mist. Light beams visible.',
      harsh_sun: 'Strong shadows, silhouettes. Good for graphic compositions.'
    },
    gearRecommendations: {
      general: 'Small, discreet camera. 35mm or 50mm. Fast lens (f/1.4-2).',
      rain: 'Weather-sealed body. Rain cover. Microfiber cloths. Plastic bag in pocket.',
      night: 'Fast prime. High ISO capability. Image stabilization.',
      stealth: 'Silent shutter. Flip screen for waist-level shooting. Dark clothes.'
    },
    special: [
      'Rain: puddles = reflections. Shoot from low angle. Protect gear.',
      'Snow: people react differently. High contrast scenes. +1 EV compensation.',
      'Fog: AF struggles. Use manual focus zone focusing.',
      'Heat: people move slower. Siesta times = empty streets.',
      'Cold: steam from manholes, breath visible. Gloves that allow shutter control.',
      'Legal: know local laws about photographing people/children/buildings.'
    ]
  },
  wildlife: {
    idealConditions: {
      cloudCover: [20, 60],     // Soft light, animals active
      timeOfDay: ['dawn', 'dusk'],  // Golden hours for wildlife
      wind: [0, 15],            // Calm = animals more active, scent travels less
      temp: [10, 25],           // Comfortable for animals and photographer
      humidity: [30, 70],
      visibility: [5, 100]
    },
    lightingStyle: {
      dawn: 'Animals most active. Golden light. Mist possible.',
      dusk: 'Return to water/roost. Golden light. Silhouettes possible.',
      overcast: 'Even light for detail. Good for birds in flight (no harsh shadows).',
      backlight: 'Rim light on fur/feathers. Expose for subject, let background blow out.'
    },
    gearRecommendations: {
      lens: '400mm minimum. 600mm ideal. Teleconverter (1.4x, 2x) for extra reach.',
      support: 'Gimbal head on tripod. Monopod for mobility. Beanbag for vehicle.',
      camera: 'High FPS. Silent shutter. Good high ISO. Animal eye AF.',
      camo: 'Camo clothing, lens cover, blind/hide. Scent control (wind direction).'
    },
    special: [
      'Golden hour: animals active, beautiful light. Be in position BEFORE sunrise.',
      'Overcast: birds in flight easier (no harsh shadows on underwings).',
      'Rain: many animals hunker down. Amphibians become active. Protect gear.',
      'Snow: tracks easy to find. High contrast. +1.5 EV compensation.',
      'Wind: birds take off/land into wind. Position yourself upwind.',
      'Heat haze: > 25°C = unusable telephoto shots. Shoot early.',
      'Migration: weather fronts trigger bird migration. Check BirdCast.info.'
    ]
  },
  wedding: {
    idealConditions: {
      cloudCover: [40, 80],     // Soft, romantic light
      timeOfDay: ['late_afternoon', 'golden_hour', 'blue_hour'],
      wind: [0, 15],            // Veil control, dress movement
      temp: [18, 28],           // Bride/groom comfortable
      humidity: [30, 60],       // No sweating, no hair frizz
      uvIndex: [0, 5],          // No squinting, no sunburn
      visibility: [10, 100]
    },
    lightingStyle: {
      overcast: 'Soft, romantic. No shadows on faces. Best for midday ceremonies.',
      golden_hour: 'THE wedding light. Warm glow. Backlit veil = angelic.',
      open_shade: 'Safe option. Even light. No squinting. Predictable.',
      harsh_sun: 'NIGHTMARE. Squinting, harsh shadows, overheating. Seek shade.',
      rain: 'Creative opportunity. Umbrellas. Reflections. Moody B&W.'
    },
    gearRecommendations: {
      camera: 'Dual card slots (ALWAYS). Backup body accessible.',
      lens: '24-70 f/2.8 + 70-200 f/2.8. Prime (85mm f/1.4 for portraits).',
      lighting: 'Speedlights. Off-camera flash. Video light for reception.',
      emergency: 'Rain covers for all gear. Umbrellas (clear for photos). Towels.',
      backup: 'Second shooter. Backup batteries, cards, body. Everything x2.'
    },
    special: [
      'Timeline: schedule portraits during golden hour. Work backwards from sunset.',
      'First look: before ceremony = more time, better light, less stress.',
      'Ceremony: position sun behind officiant (guests don\'t squint).',
      'Family photos: open shade. Everyone\'s face evenly lit. Done fast.',
      'Bride prep: window light. Clean backgrounds. Details shots.',
      'Dress: hang near window for detail shot. Veil: backlight for drama.',
      'Emergency kit: safety pins, fashion tape, blotting papers, hair spray.',
      'Rain plan: scout covered locations in advance. Clear umbrellas ready.'
    ]
  },
  real_estate: {
    idealConditions: {
      cloudCover: [20, 50],     // Some clouds for sky interest
      timeOfDay: ['morning', 'late_afternoon'],  // Even light, shadows add depth
      wind: [0, 10],            // Calm (no moving trees, flags)
      temp: [15, 30],
      humidity: [30, 60],
      visibility: [10, 100]
    },
    lightingStyle: {
      front_light: 'Building facade evenly lit. Best for front elevation.',
      twilight: 'Interior lights on, sky deep blue. THE money shot. Higher value perception.',
      overcast: 'Even light. No harsh shadows. Good for interiors (no window blowout).',
      golden_hour: 'Warm, inviting. Good for exterior lifestyle shots.'
    },
    gearRecommendations: {
      lens: 'Ultra-wide (14-24mm). Tilt-shift for perspective control.',
      support: 'Tripod essential. Leveling base. Cable release.',
      lighting: 'Multiple speedlights for room lighting. Video lights for walkthrough.',
      technique: 'HDR bracketing (5 shots, 2EV spacing). Flash-ambient blending.',
      drone: 'Check local regulations. Aerial shots add value.'
    },
    special: [
      'Twilight: shoot 15-30 minutes after sunset. Sky deep blue. Lights on inside.',
      'Snow: makes properties look magical. Clear driveway/paths first.',
      'Fall: colorful trees add curb appeal. Rake leaves for clean shots.',
      'Pool: polarizer to cut glare. Twilight with underwater lights on.',
      'Kitchen: turn on all lights. Style with fresh flowers/fruit.',
      'Windows: shoot away from windows or bracket exposures.',
      'Lines: keep verticals vertical. Use tilt-shift or correct in post.',
      'Declutter: move cars, trash bins, hoses. Hide personal items.'
    ]
  },
  sports: {
    idealConditions: {
      cloudCover: [30, 70],     // Soft light, no harsh shadows
      timeOfDay: ['morning', 'afternoon', 'golden_hour'],
      wind: [0, 20],            // Some wind OK
      temp: [10, 30],
      humidity: [30, 70],
      visibility: [5, 100]
    },
    lightingStyle: {
      overcast: 'Best for sports. Even light. No harsh shadows on faces.',
      golden_hour: 'Dramatic light. Long shadows. Beautiful but challenging exposure.',
      harsh_sun: 'Terrible. Deep eye socket shadows. Mixed exposure on uniforms.',
      stadium_lights: 'High ISO. White balance tricky (cycling lights). Fast shutter.',
      rain: 'Dramatic! Splash, mud, sliding. Protect gear. Embrace it.'
    },
    gearRecommendations: {
      lens: '70-200 f/2.8 minimum. 400mm f/2.8 ideal for field sports.',
      camera: 'High FPS (10+). Fast AF tracking. Dual card slots.',
      support: 'Monopod for heavy lenses. Remote cameras for unique angles.',
      protection: 'Rain covers. UV filters (protection from balls/flying debris).'
    },
    special: [
      'Shutter speed: 1/1000s+ for action. 1/2000s for ball sports.',
      'Position: shoot from low angle = athletes look heroic.',
      'Faces: get the ball AND the face. Expression = emotion = great shot.',
      'Background: clean backgrounds. Avoid cluttered stands/cars.',
      'Peak action: anticipation > reaction. Know the sport.',
      'Rain: fewer photographers, more dramatic images. You win.',
      'Heat: athletes suffer, you suffer. Hydrate. Camera may overheat in burst mode.'
    ]
  },
  drone_aerial: {
    idealConditions: {
      cloudCover: [0, 40],      // Clear or scattered clouds
      timeOfDay: ['golden_hour', 'blue_hour', 'morning'],
      wind: [0, 20],            // Calm - drones struggle in wind
      temp: [0, 35],            // Battery performance drops in cold
      humidity: [20, 70],       // No fogging, no condensation
      visibility: [3, 100],
      uvIndex: [0, 8]
    },
    lightingStyle: {
      nadir: 'Straight down. Patterns, textures, shadows. Abstract.',
      golden_hour: 'Long shadows reveal topography. Warm colors.',
      twilight: 'City lights, traffic trails. Long exposure possible on some drones.',
      overcast: 'Flat, even light. Good for mapping/surveying. Boring for creative.'
    },
    gearRecommendations: {
      filters: 'ND filters essential (ND4, ND8, ND16). Polarizer for water/glare.',
      batteries: 'Cold weather = 30-50% less flight time. Keep batteries warm.',
      storage: 'Multiple SD cards. Shoot in D-Log or RAW for grading.',
      safety: 'Strobe light for visibility. Landing pad. Propeller guards.'
    },
    special: [
      'Legal: know airspace restrictions. 400ft max. Line of sight. No airports.',
      'Wind: < 20 km/h ideal. > 30 km/h dangerous. Check gusts.',
      'Rain: DO NOT FLY. Electronics + water = crash. Fog = condensation.',
      'Snow: white landscape = +1 EV. Cold = short battery. Keep spares warm.',
      'Coastal: salt spray = corrosion. Wipe down after flight.',
      'Sunrise: calmest winds. Beautiful light. Worth early alarm.',
      'Birds: seagulls, raptors may attack drone. Climb quickly to escape.',
      'Privacy: respect people\'s privacy. Know local laws.'
    ]
  }
};

// ============================================================================
// EXPOSURE CALCULATOR
// ============================================================================

function getExposureRecommendations(data, genre) {
  const { condition, cloudPercent, timeOfDay, uvIndex, temp } = data;
  const recommendations = {};
  
  // Sunny 16 Rule variations
  if (condition === 'clear' && cloudPercent < 10) {
    recommendations.baseISO = 100;
    recommendations.sunny16 = 'f/16, 1/100s at ISO 100';
    recommendations.notes = 'Bright sun, distinct shadows';
  } else if (cloudPercent < 30) {
    recommendations.baseISO = 200;
    recommendations.sunny16 = 'f/11, 1/250s at ISO 200 (slight overcast)';
  } else if (cloudPercent < 70) {
    recommendations.baseISO = 400;
    recommendations.sunny16 = 'f/8, 1/250s at ISO 400 (overcast)';
  } else {
    recommendations.baseISO = 800;
    recommendations.sunny16 = 'f/5.6, 1/250s at ISO 800 (heavy overcast)';
  }
  
  // Genre-specific
  if (genre === 'portrait') {
    recommendations.aperture = 'f/1.4 - f/2.8 (subject isolation)';
    recommendations.shutter = '1/125s minimum (subject movement)';
  } else if (genre === 'landscape') {
    recommendations.aperture = 'f/8 - f/11 (depth of field)';
    recommendations.shutter = 'Tripod recommended below 1/60s';
  } else if (genre === 'sports') {
    recommendations.shutter = '1/1000s minimum (action freeze)';
    recommendations.aperture = 'f/2.8 - f/4 (background separation)';
    recommendations.iso = 'Auto ISO (100-6400) to maintain shutter speed';
  } else if (genre === 'astrophotography') {
    recommendations.aperture = 'Wide open (f/1.4 - f/2.8)';
    recommendations.shutter = '500 rule (see genre notes)';
    recommendations.iso = '1600 - 6400';
  }
  
  return recommendations;
}

// ============================================================================
// SUNSET/SUNRISE QUALITY PREDICTOR
// ============================================================================

function predictSunsetQuality(data) {
  const { cloudPercent, humidity, aqi, condition, temp, dewPoint } = data;
  let quality = 0; // 0-10 scale
  let factors = [];
  
  // Clouds needed for color
  if (cloudPercent >= 30 && cloudPercent <= 70) {
    quality += 4;
    factors.push('Good cloud coverage for color reflection');
  } else if (cloudPercent < 10) {
    quality += 1;
    factors.push('Clear sky = boring sunset (no clouds to catch color)');
  } else if (cloudPercent > 90) {
    quality += 0;
    factors.push('Overcast = no sunset visible');
  }
  
  // High clouds catch color, low clouds block
  // Approximated by humidity + pressure
  if (humidity < 60 && cloudPercent > 20) {
    quality += 2;
    factors.push('Drier air = cleaner colors, less haze');
  }
  
  // AQI: some pollution creates colorful sunsets (unfortunately)
  if (aqi > 50 && aqi < 150) {
    quality += 2;
    factors.push('Moderate particulates scatter red/orange light');
  } else if (aqi > 150) {
    quality -= 2;
    factors.push('Heavy pollution mutes colors, adds brown cast');
  }
  
  // Temperature and dew point spread
  if (dewPoint && (temp - dewPoint) < 3) {
    quality += 1;
    factors.push('Small temp-dew spread = potential for mist/atmosphere');
  }
  
  // Post-rain = clean air
  if (condition === 'rain' || condition === 'thunderstorm') {
    quality += 1;
    factors.push('Rain clears particulates = cleaner sunset after storm');
  }
  
  const rating = quality >= 8 ? 'SPECTACULAR - Must shoot!' :
                 quality >= 6 ? 'VERY GOOD - Worth planning for' :
                 quality >= 4 ? 'GOOD - Decent potential' :
                 quality >= 2 ? 'FAIR - Maybe, maybe not' :
                 'POOR - Don\'t bother';
  
  return { quality: Math.min(10, quality), rating, factors };
}

// ============================================================================
// LENS FOGGING PREDICTOR
// ============================================================================

function getFoggingRisk(data) {
  const { temp, humidity, dewPoint } = data;
  
  if (!dewPoint) return { risk: 'Unknown', advice: 'Check dew point forecast' };
  
  const spread = temp - dewPoint;
  
  if (spread <= 1) {
    return {
      risk: 'CRITICAL',
      advice: [
        'Lens WILL fog immediately upon going outside',
        'Acclimate gear: leave camera bag outside for 30+ minutes before shooting',
        'Use dew heater strips on lens',
        'Keep camera/lens warmer than ambient (chemical hand warmers)',
        'Move from cold to warm: put camera in sealed plastic bag until it warms',
        'Silica gel packs in camera bag',
        'Microfiber cloths - LOTS of them',
        'Consider: this might be unfixable. Reschedule if critical shoot.'
      ]
    };
  } else if (spread <= 3) {
    return {
      risk: 'HIGH',
      advice: [
        'Lens likely to fog during shoot',
        'Acclimate gear 20-30 minutes',
        'Dew heater or anti-fog wipes',
        'Keep lens cap on when not shooting',
        'Point lens down when not shooting (less surface for dew)'
      ]
    };
  } else if (spread <= 5) {
    return {
      risk: 'MODERATE',
      advice: [
        'Some fogging possible after extended shooting',
        'Acclimate gear 15-20 minutes',
        'Keep microfiber cloths handy'
      ]
    };
  }
  
  return {
    risk: 'LOW',
    advice: ['Minimal fogging risk', 'Standard precautions sufficient']
  };
}

// ============================================================================
// MAIN PHOTOGRAPHY ADVICE FUNCTION
// ============================================================================

export const getPhotographyAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    conditionCode, cloudCover, condition, humidity, wind, windGust,
    uvIndex, visibility, sunrise, sunset, temp, city, dewPoint,
    aqi, pressure, tempMin, tempMax, moonPhase, precipitation
  } = data;
  
  const cloudPercent = getCloudCover(conditionCode);
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
  
  // Detect photography genre
  const q = question.toLowerCase();
  let genre = 'portrait'; // default
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
  
  let verdict = [];
  let lighting = [];
  let timing = [];
  let warnings = [];
  let gear = [];
  let settings = [];
  let conditions = [];

  // ========================================================================
  // CATASTROPHIC CONDITIONS
  // ========================================================================
  
  if (condition === 'thunderstorm') {
    verdict.push("⛈️ DO NOT SHOOT OUTDOORS: Lightning risk to photographer and subject.");
    warnings.push("Metal tripods, light stands, umbrellas = lightning rods.");
    warnings.push("Wait 30 minutes after last thunder before resuming.");
    if (genre === 'astrophotography') {
      verdict.push("Thunderstorm = no stars. Try tomorrow night.");
    }
  }
  
  if (wind > 40) {
    warnings.push(`💨 DANGEROUS WIND ${wind}km/h: Tripods will blow over.`);
    warnings.push("Sand/debris will damage lenses. Stay indoors.");
    if (genre === 'drone_aerial') {
      verdict.push("DRONE GROUNDED: Wind exceeds safe flight limits.");
    }
  }

  // ========================================================================
  // LIGHTING QUALITY ASSESSMENT
  // ========================================================================
  
  if (cloudPercent >= 90) {
    verdict.push("☁️ FULL OVERCAST: Sky is a giant softbox.");
    lighting.push(genreConfig.lightingStyle.overcast || "Soft, diffused light. No harsh shadows.");
    lighting.push("Directionless light. Good for color accuracy. Bad for drama.");
    if (genre === 'landscape') {
      lighting.push("Landscape: Flat, uninteresting sky. Compose without sky or shoot intimate scenes.");
      lighting.push("Waterfalls, forests, close-ups work well. Skip grand vistas.");
    }
    if (genre === 'portrait') {
      lighting.push("Portrait: Beautiful skin tones. No squinting. Shoot anywhere.");
      lighting.push("No natural catchlights. Use reflector or position near light source.");
    }
    gear.push("No ND filters needed. Polarizer won't help (no glare to cut).");
    settings.push("WB: Cloudy (6000-6500K). Exposure: meter normally, no extreme contrast.");
  } else if (cloudPercent >= 60) {
    verdict.push("⛅ MOSTLY CLOUDY: Soft, dynamic light.");
    lighting.push("Clouds diffuse sun, creating soft main light with subtle shadows.");
    lighting.push("Excellent for most genres. The 'safe' lighting condition.");
    if (cloudPercent < 80) {
      lighting.push("Sun breaks through occasionally. Be ready for lighting changes.");
    }
  } else if (cloudPercent >= 30) {
    verdict.push("🌤️ PARTLY CLOUDY: Dramatic, dynamic lighting.");
    lighting.push("BEST lighting for most genres. Clouds add texture, sun adds punch.");
    lighting.push("Sunbeams possible. Shadows have character. Sky has interest.");
    if (genre === 'landscape') {
      lighting.push("Landscape: THIS is what you want. Wait for sun to hit key features.");
    }
    warnings.push("Light changes fast. Be ready to adjust exposure as clouds move.");
    gear.push("Polarizer: cuts haze, saturates colors, darkens blue sky.");
    gear.push("ND grad: balance bright sky with darker ground.");
  } else if (cloudPercent >= 10) {
    verdict.push("☀️ MOSTLY CLEAR: Bright, contrasty light.");
    lighting.push("Harsh shadows. Deep contrast. Challenging for people photography.");
    lighting.push("Excellent for: architecture (sharp shadows), B&W, infrared.");
    if (sunPosition === 'harsh_midday') {
      lighting.push("MIDDAY SUN: Worst light. Subjects squint. Raccoon eye shadows.");
      lighting.push("Portrait: find open shade or use scrim/diffuser.");
      lighting.push("Landscape: wait for golden hour unless shooting B&W.");
    }
    gear.push("ND filter if shooting wide open. Polarizer for sky/water.");
    gear.push("Lens hood essential (flare). Fill flash for backlit subjects.");
    settings.push("Watch histogram: sky will blow out. Bracket exposures for HDR.");
  } else {
    verdict.push("☀️ CRYSTAL CLEAR: Maximum contrast and UV.");
    lighting.push("Harsh, unforgiving light. Deep black shadows, bright highlights.");
    lighting.push("Midday: unshootable for most genres. Golden hour: spectacular.");
    lighting.push("Good for: silhouette shots, graphic compositions, B&W street.");
    gear.push("Polarizer essential. 2-3 stop ND for wide aperture in bright light.");
    warnings.push(`UV ${uvIndex}: subjects squint, skin burns fast. Use sunscreen.`);
  }

  // ========================================================================
  // TIME OF DAY & SUN POSITION
  // ========================================================================
  
  if (sunPosition === 'golden_hour') {
    timing.push("🌟 GOLDEN HOUR NOW: The best light of the day!");
    timing.push(`Sun angle: ${sunAngle}° - warm, directional, flattering.`);
    timing.push("Everything looks better. Shoot now. Edit later.");
    if (goldenHour) {
      timing.push(`Golden hour ends: ${goldenHour.end}. Time remaining: calculate.`);
    }
  } else if (sunPosition === 'blue_hour') {
    timing.push("💙 BLUE HOUR: Cool, ethereal, city lights balanced with sky.");
    timing.push("Perfect for cityscapes, bridges, architecture with lights.");
    timing.push("Tripod essential. Long exposures for light trails.");
  } else if (sunPosition === 'sunrise') {
    timing.push("🌅 SUNRISE: Worth waking up for. Calm, misty, magical.");
    timing.push("Fewer people. Calmer winds. Best time for wildlife, landscape.");
  } else if (sunPosition === 'sunset') {
    timing.push("🌇 SUNSET APPROACHING: Prepare for golden hour.");
    timing.push(`Sunset quality prediction: ${sunsetQuality.rating}`);
    sunsetQuality.factors.forEach(f => timing.push(`  • ${f}`));
  } else if (sunPosition === 'harsh_midday') {
    timing.push("☀️ HARSH MIDDAY SUN: Sun directly overhead.");
    timing.push("Worst light. Flat from above, deep shadows under eyes/chin.");
    timing.push("Solutions: open shade, scrim, fill flash, or shoot interiors.");
    timing.push("B&W: high contrast can work. Infrared: great in harsh sun.");
  }
  
  // Golden hour timing
  if (goldenHour && sunPosition !== 'golden_hour') {
    timing.push(`🌅 Golden hour today: ${goldenHour.start} - ${goldenHour.end}`);
  }
  
  // Blue hour timing
  if (blueHour) {
    timing.push(`💙 Blue hour: ${blueHour.start} - ${blueHour.end}`);
  }

  // ========================================================================
  // MOON CONDITIONS (for night/astro)
  // ========================================================================
  
  if (genre === 'astrophotography') {
    if (moonIllumination < 10) {
      timing.push("🌑 NEW MOON: Darkest skies possible. Milky Way at its best.");
      timing.push("Deep sky objects, meteor showers, airglow visible.");
    } else if (moonIllumination < 30) {
      timing.push("🌒 CRESCENT MOON: Good astro conditions. Slight foreground illumination.");
      timing.push("Milky Way still visible but slightly dimmed.");
    } else if (moonIllumination < 60) {
      timing.push("🌓 QUARTER MOON: Bright sky. Milky Way washed out.");
      timing.push("Better for moonlit landscapes than deep sky.");
    } else {
      timing.push(`🌕 BRIGHT MOON (${moonIllumination}%): Sky too bright for astro.`);
      timing.push("Good for: moonlit landscapes, lunar photography.");
    }
  }

  // ========================================================================
  // WEATHER EFFECTS ON LIGHTING
  // ========================================================================
  
  if (condition === 'rain' || condition === 'drizzle') {
    verdict.push("🌧️ RAIN: Creative opportunity!");
    lighting.push("Wet surfaces = reflections everywhere. Colors saturate.");
    lighting.push("Puddles = mirror images. Streets become photogenic.");
    lighting.push("Light diffuses through rain = soft, moody atmosphere.");
    gear.push("Rain cover for camera/lens. Lens hood (keeps drops off front element).");
    gear.push("Microfiber cloths x3. Plastic bags for non-sealed gear.");
    gear.push("Umbrella (clear if possible - lets light through).");
    if (genre === 'portrait') {
      lighting.push("Portrait: Umbrella as prop + light diffuser. Moody, romantic.");
      lighting.push("Backlight through rain = each drop sparkles.");
    }
    if (genre === 'street') {
      lighting.push("Street: THE best weather. Neon reflections, umbrellas, puddle mirrors.");
    }
    warnings.push("Protect gear. Rain + electronics = expensive mistake.");
    if (condition === 'rain' && temp < 5) {
      warnings.push("COLD RAIN: Hypothermia risk. Keep shoots short. Hand warmers.");
    }
  }
  
  if (condition === 'snow') {
    verdict.push("❄️ SNOW: High key wonderland!");
    lighting.push("Snow reflects light = natural fill from below. Soft shadows.");
    lighting.push("High contrast: white snow vs dark subjects.");
    settings.push("EXPOSURE: +1 to +2 EV compensation (camera underexposes white snow).");
    settings.push("WB: 5500-6500K. Snow in shade = blue (add warmth in post if desired).");
    gear.push("Weather-sealed body. Plastic bag over camera when moving indoors/outdoors.");
    gear.push("Extra batteries (cold kills them fast). Keep spares in inner pocket.");
    gear.push("Lens hood: keeps snowflakes off front element.");
    warnings.push("Protect gear from condensation when moving between cold/warm.");
  }
  
  if (condition === 'fog' || condition === 'mist' || visibility < 2) {
    verdict.push("🌫️ FOG/MIST: Atmospheric masterpiece conditions.");
    lighting.push("Natural diffusion. Depth and layers. Mystery and mood.");
    lighting.push("Objects fade into distance. Minimalist compositions shine.");
    lighting.push("Backlight through fog = visible light beams (god rays).");
    if (genre === 'landscape') {
      lighting.push("Landscape: Trees emerge from mist. Layers of hills. Magical.");
    }
    if (genre === 'portrait') {
      lighting.push("Portrait: Ethereal, dreamy. Subject sharp, background fades.");
    }
    gear.push("Manual focus (AF hunts in fog). Lens hood (moisture).");
    settings.push("Expose for fog brightness (+0.5 to +1 EV). Protect highlights.");
    warnings.push("Fog = moisture. Protect gear. Lens will fog. See fogging advice.");
  }

  // ========================================================================
  // WIND EFFECTS
  // ========================================================================
  
  if (wind > 25) {
    warnings.push(`🌬️ WINDY ${wind}km/h: Challenges and opportunities.`);
    gear.push("Tripod: weight it down (sandbag or camera bag). Center column down.");
    gear.push("Light stands: sandbags essential. Softboxes become sails.");
    if (genre === 'portrait') {
      warnings.push("Hair will be chaotic. Either embrace wind-swept look or reschedule.");
      warnings.push("Dresses/skirts: wardrobe malfunctions. Communicate with client.");
    }
    if (genre === 'landscape') {
      lighting.push("Landscape: moving clouds = dramatic long exposures with ND.");
      lighting.push("Grass/leaves moving = 1/250s+ to freeze, or embrace motion blur.");
    }
    if (genre === 'macro') {
      warnings.push("Wind = impossible macro. Subjects moving constantly. Reschedule.");
    }
    if (genre === 'drone_aerial') {
      warnings.push(`Drone warning: ${wind}km/h wind. Most consumer drones max 30-40km/h.`);
    }
  } else if (wind > 15) {
    warnings.push(`Breezy ${wind}km/h: Secure lightweight gear. Hair movement in portraits.`);
  } else if (wind < 5) {
    lighting.push("Calm air: perfect for long exposures, macro, water reflections.");
    lighting.push("Still water = mirror reflections. Any lake/pond will be glassy.");
  }

  // ========================================================================
  // HUMIDITY & VISIBILITY
  // ========================================================================
  
  if (humidity > 80) {
    warnings.push(`💧 HIGH HUMIDITY ${humidity}%: Lens fogging risk.`);
    lighting.push("Hazy atmosphere. Distant subjects soft. Good for mood, bad for detail.");
    if (genre === 'landscape') {
      warnings.push("Landscape: telephoto useless for distant subjects. Wide angle better.");
    }
  } else if (humidity < 30) {
    lighting.push("🏜️ DRY AIR: Crystal clear. Distant mountains sharp.");
    lighting.push("Good for: telephoto landscapes, wildlife, astro.");
    warnings.push("Static electricity: dust sticks to sensor. Use sensor cleaning mode.");
    warnings.push("Dry skin shows in portraits. Models: moisturize well.");
  }
  
  if (visibility < 5) {
    lighting.push("🌫️ REDUCED VISIBILITY: Atmosphere and depth.");
    lighting.push("Distant objects fade. Good for layered compositions.");
  } else if (visibility > 15) {
    lighting.push("👁️ EXCELLENT VISIBILITY: Maximum clarity to horizon.");
  }

  // ========================================================================
  // TEMPERATURE & COMFORT
  // ========================================================================
  
  if (comfort === "Extreme") {
    warnings.push(`🌡️ EXTREME ${temp}°C: Short shoots only. Safety first.`);
    if (temp > 35) {
      warnings.push("Heat: camera may overheat in burst mode/video. Bring water for everyone.");
      warnings.push("Models: sweat, makeup melting, discomfort. Shoot in shade, early morning only.");
      gear.push("Cooling towels. Battery-operated fans. Shade tent/umbrella.");
    } else if (temp < -10) {
      warnings.push("Extreme cold: batteries die fast. LCD may lag. Lubricants stiffen.");
      warnings.push("Models: frostbite risk. Limit skin exposure. Hand/toe warmers.");
      gear.push("3x normal battery count. Keep spares warm. Chemical hand warmers.");
    }
  } else if (comfort === "Poor") {
    warnings.push(`${temp}°C: Uncomfortable conditions. Limit shoot duration.`);
  }

  // ========================================================================
  // FOGGING RISK
  // ========================================================================
  
  if (foggingRisk.risk !== 'LOW') {
    warnings.push(`🔴 LENS FOGGING RISK: ${foggingRisk.risk}`);
    gear.push(...foggingRisk.advice);
  }

  // ========================================================================
  // GENRE-SPECIFIC ADVICE
  // ========================================================================
  
  if (genreConfig.special) {
    conditions.push(`🎯 ${genre.replace(/_/g, ' ').toUpperCase()} SPECIFIC:`);
    genreConfig.special.forEach(s => conditions.push(`• ${s}`));
  }
  
  // Gear from genre
  if (genreConfig.gearRecommendations) {
    const gearRec = genreConfig.gearRecommendations;
    for (const [condition, rec] of Object.entries(gearRec)) {
      if (condition === 'general' || 
          (condition === 'overcast' && cloudPercent > 60) ||
          (condition === 'golden_hour' && sunPosition === 'golden_hour') ||
          (condition === 'rain' && condition === 'rain')) {
        gear.push(`${rec}`);
      }
    }
  }

  // ========================================================================
  // EXPOSURE SETTINGS
  // ========================================================================
  
  if (exposure) {
    settings.push("📷 EXPOSURE RECOMMENDATIONS:");
    if (exposure.sunny16) settings.push(`• Sunny 16: ${exposure.sunny16}`);
    if (exposure.aperture) settings.push(`• Aperture: ${exposure.aperture}`);
    if (exposure.shutter) settings.push(`• Shutter: ${exposure.shutter}`);
    if (exposure.iso) settings.push(`• ISO: ${exposure.iso}`);
    if (exposure.notes) settings.push(`• Note: ${exposure.notes}`);
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "📸 Photography conditions:",
    "🎬 Shooting forecast:",
    "📷 Lighting report:",
    "🎥 Photo weather check:",
    "📹 Zephye's photo advisory:",
    "🎞️ Camera conditions:",
    "📽️ Visual forecast:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Overall Verdict
  response += `📋 VERDICT: ${verdict.join(' ')}\n\n`;
  
  // Current Conditions
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temp: ${temp}°C (feels like comfort rating: ${comfort})\n`;
  response += `• Sky: ${condition} (${cloudPercent}% clouds)\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• UV Index: ${uvIndex} (${uvLevel})\n`;
  response += `• Visibility: ${visibility}km (${visibilityCategory})\n`;
  if (aqi > 50) response += `• AQI: ${aqi} (affects clarity/sunset colors)\n`;
  response += '\n';
  
  // Lighting
  if (lighting.length > 0) {
    response += `💡 LIGHTING:\n`;
    lighting.forEach(l => response += `• ${l}\n`);
    response += '\n';
  }
  
  // Sunset/Sunrise Quality
  if (sunPosition === 'sunset' || sunPosition === 'sunrise') {
    response += `🌅 ${sunPosition.toUpperCase()} QUALITY: ${sunsetQuality.rating}\n`;
    sunsetQuality.factors.forEach(f => response += `  • ${f}\n`);
    response += '\n';
  }
  
  // Timing
  if (timing.length > 0) {
    response += `⏰ TIMING:\n`;
    timing.forEach(t => response += `• ${t}\n`);
    response += '\n';
  }
  
  // Settings
  if (settings.length > 0) {
    settings.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Gear
  if (gear.length > 0) {
    response += `🎒 GEAR:\n`;
    gear.forEach(g => response += `• ${g}\n`);
    response += '\n';
  }
  
  // Genre-Specific
  if (conditions.length > 0) {
    conditions.forEach(c => response += `${c}\n`);
    response += '\n';
  }
  
  // Fogging Risk
  if (foggingRisk.risk !== 'LOW') {
    response += `🌫️ LENS FOGGING: ${foggingRisk.risk} RISK\n`;
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `\n⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Final Verdict
  response += `💡 BOTTOM LINE:\n`;
  if (condition === 'thunderstorm' || wind > 40) {
    response += `Dangerous conditions. Stay inside. Edit photos instead.\n`;
  } else if (sunPosition === 'golden_hour' && cloudPercent >= 20 && cloudPercent <= 70) {
    response += `PERFECT CONDITIONS. Golden hour + clouds = magic. Go shoot NOW.\n`;
  } else if (cloudPercent >= 40 && cloudPercent <= 80 && genre === 'portrait') {
    response += `Excellent portrait conditions. Soft, even light. Book that shoot.\n`;
  } else if (sunPosition === 'harsh_midday' && cloudPercent < 30) {
    response += `Harsh light. Wait for golden hour or find open shade.\n`;
  } else {
    response += `Workable conditions. Adjust approach for best results.\n`;
  }
  
  // Photography wisdom
  const wisdom = [
    "The best camera is the one you have with you. - Chase Jarvis",
    "Your first 10,000 photographs are your worst. - Henri Cartier-Bresson",
    "Which of my photographs is my favorite? The one I'm going to take tomorrow. - Imogen Cunningham",
    "Photography is the story I fail to put into words. - Destin Sparks",
    "Light makes photography. Embrace light. Admire it. Love it. But above all, know light. - George Eastman",
    "There are no rules for good photographs, there are only good photographs. - Ansel Adams",
    "The picture that you took with your camera is the imagination you want to create with reality. - Scott Lorenzo"
  ];
  response += `\n📸 ${random(wisdom)}`;

  return response;
};

/// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { predictSunsetQuality, getFoggingRisk, getExposureRecommendations };

export default getPhotographyAdvice;
