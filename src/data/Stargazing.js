// ============================================================================
// COMPREHENSIVE ASTRONOMY & STARGAZING WEATHER SYSTEM
// ============================================================================

import {
  getMoonPhase as getMoonPhaseAsync,
  getMoonIllumination,
  getMoonRiseSet,
  getPlanetVisibility,
  getCloudCover,
  mapWeatherCode,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  calculateDewPoint,
  getSeeingConditions,
  getTransparency,
  getDarkSkyRating,
  getLightPollutionMap,
  getMilkyWayVisibility,
  getConstellationVisibility,
  getMeteorShowerCalendar,
  getISSFlyoverTimes,
  getSatelliteVisibility,
  getAuroraForecast,
  getZodiacalLightVisibility,
  getAstronomicalTwilight
} from './calculations'

// ============================================================================
// SAMPLE QUESTIONS - EXPANDED
// ============================================================================

export const sampleQuestions = [
  // GENERAL
  "Can I see stars tonight?",
  "Is it good for stargazing?",
  "Will the moon ruin stargazing?",
  "Can I see the Milky Way?",
  "Is it clear enough for a telescope?",
  "Best time to stargaze tonight?",
  "Will clouds block the stars?",
  "Is it worth setting up my telescope?",
  "Will humidity fog my lens?",
  "Is it dark enough for deep sky?",
  "Will the moon be up during viewing?",
  "Is it good for a star party?",
  "Will dew be a problem?",
  "Is the transparency good?",
  "Will light pollution ruin viewing?",
  "Is the atmosphere stable?",
  "Can I photograph the Milky Way?",
  "Will moonlight wash out photos?",
  "Is it worth driving to dark sky site?",
  "Will twilight affect viewing?",
  "Is the sky transparency good tonight?",
  "Will wildfire smoke affect viewing?",
  "Is the jet stream affecting seeing?",
  "Should I use a dew heater?",
  "Is it good for binocular astronomy?",
  "Will clouds clear after midnight?",
  "Is it worth staying up late?",
  "Will fog roll in from the coast?",
  "Is it clear at higher elevation?",
  "Will Starlink trains be visible?",
  "Is it good for radio astronomy?",
  "Should I acclimate my telescope?",
  "Is the moon too bright for DSOs?",
  "Will there be iridium flares?",
  "Is it good for spectroscopy?",
  "Will temperature inversion affect seeing?",
  "Is tonight good for a star trail photo?",
  "Will the monsoon moisture clear?",
  "Is it transparent enough for faint fuzzies?",
  "Will Sahara dust affect viewing?",
  "Is it good for lunar photography?",
  "Will marine layer be an issue?",
  "Is tonight good for the Perseids?",
  "Can I see the Geminids?",
  "Will there be noctilucent clouds?",
  "Is it good for solar system observing?",
  "Will volcanic aerosols affect sunset and sunrise colors?",
  "Is tonight transparent enough for UHC filter?",
  "Should I bring my Ethos eyepiece?",
  "Will my SCT need extra cool-down time?",
  
  // PLANETS
  "Can I see planets tonight?",
  "Is Jupiter visible?",
  "Can I see Saturn's rings?",
  "Can I see Venus tonight?",
  "Is Mars visible?",
  "Can I see Mercury?",
  "Can I see Neptune or Uranus?",
  
  // DEEP SKY
  "Can I see the Orion Nebula?",
  "Can I see the Andromeda Galaxy?",
  "Can I see the Pleiades?",
  "Can I see any galaxies tonight?",
  "Can I see the summer triangle?",
  "Can I see the Beehive Cluster?",
  "Can I see Omega Centauri?",
  "Can I see the Lagoon Nebula?",
  "Can I see the Hercules Cluster?",
  "Can I see the Ring Nebula?",
  "Can I see the Dumbbell Nebula?",
  "Can I see the Whirlpool Galaxy?",
  "Can I see the Leo Triplet?",
  "Can I see the Veil Nebula?",
  "Can I see the Double Cluster?",
  "Can I see the Sculptor Galaxy?",
  "Can I see the Bode's Galaxy?",
  "Can I see the Crab Nebula?",
  
  // METEORS & AURORA
  "Is it good for meteor watching?",
  "Can I see shooting stars?",
  "Will there be aurora activity?",
  "Can I see the Northern Lights?",
  "Will the aurora be visible this far south?",
  
  // ISS & SATELLITES
  "Can I see the ISS tonight?",
  "Will there be satellite flares?",
  
  // ZODIACAL & SPECIAL
  "Can I see the zodiacal light?",
  "Can I see the gegenschein?",
  "Is tonight good for comet watching?",
  "Will there be any eclipses?",
  "Is it good for solar observing tomorrow?",
  "Is tonight good for a Messier marathon?",
  "Is tonight good for citizen science?"
]

// ============================================================================
// ENHANCED ASTRONOMICAL SEEING SCALE (Pickering Scale)
// ============================================================================

const PICKERING_SCALE = {
  1: {
    description: 'Perfect seeing',
    starAppearance: 'Star image motionless, diffraction rings complete and steady',
    magnification: '40x per inch of aperture or more',
    rating: 'Exceptional - rare conditions',
    suitability: 'Planetary detail, double stars, high-resolution imaging',
    planetaryDetail: 'Cloud bands and features sharp, color vivid'
  },
  2: {
    description: 'Slightly imperfect',
    starAppearance: 'Slight undulations, moments of calm lasting several seconds',
    magnification: '32-40x per inch',
    rating: 'Excellent',
    suitability: 'Lunar and planetary, deep sky, photography',
    planetaryDetail: 'Good detail on Jupiter and Saturn'
  },
  3: {
    description: 'Good seeing',
    starAppearance: 'Moderate undulations, diffraction rings visible but in motion',
    magnification: '24-32x per inch',
    rating: 'Good',
    suitability: 'Most observing, medium-high power acceptable',
    planetaryDetail: 'Moderate detail visible'
  },
  4: {
    description: 'Fair seeing',
    starAppearance: 'Diffraction rings often blurred, central disk visible',
    magnification: '16-24x per inch',
    rating: 'Average',
    suitability: 'Deep sky objects, low-medium power',
    planetaryDetail: 'Limited detail on planets'
  },
  5: {
    description: 'Poor seeing',
    starAppearance: 'Diffraction rings barely visible, star image boiling',
    magnification: '12-16x per inch',
    rating: 'Below average',
    suitability: 'Low power wide field, not for planets',
    planetaryDetail: 'Planets appear as blurry disks'
  },
  6: {
    description: 'Very poor seeing',
    starAppearance: 'Star image a blurry blob, no diffraction features',
    magnification: '8-12x per inch',
    rating: 'Poor',
    suitability: 'Very low power, casual observing only',
    planetaryDetail: 'No planetary detail visible'
  },
  7: {
    description: 'Extremely poor',
    starAppearance: 'Stars 2-3 times normal size, constant rapid motion',
    magnification: 'Under 8x per inch',
    rating: 'Very poor',
    suitability: 'Binoculars only, not worth telescope setup',
    planetaryDetail: 'Planets unobservable'
  },
  8: {
    description: 'Worthless for astronomy',
    starAppearance: 'Stars shimmering violently, no detail visible',
    magnification: 'Naked eye only',
    rating: 'Terrible',
    suitability: 'Stay inside, watch astronomy documentaries'
  },
  9: {
    description: 'Impossible',
    starAppearance: 'Stars twinkling so badly you feel dizzy',
    magnification: 'Do not bother',
    rating: 'Worst',
    suitability: 'Netflix and planetarium apps only'
  },
  10: {
    description: 'Completely unusable',
    starAppearance: 'Stars look like they are having a rave',
    magnification: 'Forget it',
    rating: 'Why are you outside?',
    suitability: 'Indoor activities only'
  }
}

// ============================================================================
// ENHANCED BORTLE DARK SKY SCALE
// ============================================================================

const BORTLE_SCALE = {
  1: {
    name: 'Excellent Dark Sky Site',
    description: 'Zodiacal light visible, gegenschein visible, Milky Way casts shadows',
    limiting: '7.6-8.0',
    color: '#000000',
    milkyWay: 'Casts obvious shadows on ground',
    zodiacalLight: 'Visible and colorful, extends 60+ degrees',
    airglow: 'Visible along entire horizon',
    clouds: 'Black holes in the sky, completely invisible',
    m33: 'Naked eye visible',
    gegenschein: 'Visible to naked eye'
  },
  2: {
    name: 'Typical Truly Dark Site',
    description: 'Milky Way highly structured, zodiacal light visible',
    limiting: '7.1-7.5',
    color: '#0a0a0a',
    milkyWay: 'Highly structured, summer Milky Way shows detailed star clouds',
    zodiacalLight: 'Still bright enough to cast shadows at dusk and dawn',
    airglow: 'Weakly visible near horizon',
    m33: 'Naked eye with averted vision'
  },
  3: {
    name: 'Rural Sky',
    description: 'Some light pollution at horizon, Milky Way still detailed',
    limiting: '6.6-7.0',
    color: '#1a1a2e',
    milkyWay: 'Still shows complex structure and dark nebulae',
    zodiacalLight: 'Visible in spring and autumn',
    lightPollution: 'Visible on horizon in 1-2 directions'
  },
  4: {
    name: 'Rural to Suburban Transition',
    description: 'Light pollution domes visible in several directions',
    limiting: '6.1-6.5',
    color: '#16213e',
    milkyWay: 'Visible but less detailed, washed out near horizon',
    zodiacalLight: 'Visible but extends less than 45 degrees',
    lightDomes: 'Visible over population centers in 3-4 directions'
  },
  5: {
    name: 'Suburban Sky',
    description: 'Light pollution visible in most directions',
    limiting: '5.6-6.0',
    color: '#1a1a3e',
    milkyWay: 'Visible only overhead, washed out',
    zodiacalLight: 'Rarely visible, only in best conditions',
    lightDomes: 'Obvious in several directions'
  },
  6: {
    name: 'Bright Suburban Sky',
    description: 'Milky Way barely visible, only at zenith',
    limiting: '5.1-5.5',
    color: '#2d2d44',
    milkyWay: 'Only visible near zenith',
    m33: 'Difficult with averted vision',
    clouds: 'Brightly lit from below'
  },
  7: {
    name: 'Suburban to Urban Transition',
    description: 'Milky Way invisible, M31 barely detectable',
    limiting: '4.6-5.0',
    color: '#4a4a5a',
    milkyWay: 'Invisible',
    m31: 'Barely visible with averted vision',
    clouds: 'Brightly lit, some stars visible through gaps'
  },
  8: {
    name: 'City Sky',
    description: 'Sky grayish-white, can read newspaper headlines outside',
    limiting: '4.1-4.5',
    color: '#6b6b7b',
    stars: 'Only brightest constellations recognizable',
    m31: 'Not visible',
    telescope: 'Good for moon and planets only'
  },
  9: {
    name: 'Inner City Sky',
    description: 'Sky bright white, only moon and planets visible',
    limiting: '3.6-4.0',
    color: '#8b8b9b',
    stars: 'Fewer than 100 visible',
    pleiades: 'Barely detectable',
    observing: 'Moon, planets, double stars only'
  }
}

// ============================================================================
// ENHANCED PLANET VISIBILITY CALCULATOR
// ============================================================================

function getDetailedPlanetVisibility(data) {
  const { cloudPercent, moonPhase, lat } = data
  const planets = []
  const currentMonth = new Date().getMonth()
  const currentDate = new Date()
  const currentHour = currentDate.getHours()
  
  // Mercury - visible near greatest elongation
  const mercuryElongation = [2, 3, 8, 9] // months of greatest elongation
  if (mercuryElongation.includes(currentMonth)) {
    planets.push({
      name: 'Mercury',
      visible: true,
      when: currentHour < 6 ? 'Before sunrise (morning elongation)' : 'After sunset (evening elongation)',
      where: 'Low on horizon, West (evening) or East (morning)',
      brightness: '-0.5 to +5.0',
      telescope: 'Phase visible like a tiny moon. Low power best. Need clear horizon.',
      difficulty: 'Challenging - never far from sun. Requires unobstructed horizon.',
      special: 'Only visible during greatest elongation. Check exact dates for best viewing.'
    })
  }
  
  // Venus - always visible when not near conjunction
  const venusConjunction = [5, 6] // months when Venus is near conjunction
  planets.push({
    name: 'Venus',
    visible: !venusConjunction.includes(currentMonth),
    when: currentMonth < 6 ? 'Evening star (after sunset)' : 'Morning star (before sunrise)',
    where: 'Brightest object after sun and moon. Cannot miss it.',
    brightness: '-4.9 to -3.8',
    telescope: 'Phase clearly visible. Cloud tops featureless but beautiful crescent.',
    difficulty: 'Impossible to miss - brightest planet',
    special: 'Can cast shadows in dark locations. Visible in daylight if you know where to look.'
  })
  
  // Mars - visible most of the year
  const marsOpposition = [5, 6, 7, 8] // months of best viewing
  planets.push({
    name: 'Mars',
    visible: true,
    when: 'Varies by opposition (every 26 months)',
    where: 'Red and orange color distinctive. Brightens dramatically near opposition.',
    brightness: '-2.9 to +1.8',
    telescope: 'Polar caps, dark markings visible near opposition. Detail requires good seeing.',
    difficulty: 'Easy to find when bright, harder when dim',
    special: `Opposition every 26 months = best viewing. ${marsOpposition.includes(currentMonth) ? 'Near opposition currently - excellent viewing!' : 'Not at opposition. Still visible but smaller.'}`
  })
  
  // Jupiter - always visible when not near conjunction
  planets.push({
    name: 'Jupiter',
    visible: true,
    when: 'Most of year except when near conjunction with sun',
    where: 'Bright, steady, cream-colored. Follows the ecliptic.',
    brightness: '-2.9 to -1.6',
    telescope: 'Cloud bands, Great Red Spot, 4 Galilean moons. Transit and shadow events visible.',
    difficulty: 'Easy - second brightest planet',
    special: 'Moons visible in binoculars. GRS visible with 6 inch+ scope in good seeing.'
  })
  
  // Saturn - visible most of the year
  planets.push({
    name: 'Saturn',
    visible: true,
    when: 'Evening or morning depending on season',
    where: 'Golden color. Follows ecliptic near Jupiter.',
    brightness: '-0.5 to +1.2',
    telescope: 'Rings visible in any telescope. Cassini Division visible in 6 inch+ scope. Titan visible.',
    difficulty: 'Easy to identify by golden color',
    special: 'Ring tilt varies. Edge-on every 15 years. Currently favorable tilt for viewing.'
  })
  
  // Uranus - visible with dark skies
  if (cloudPercent < 40) {
    planets.push({
      name: 'Uranus',
      visible: true,
      when: 'Best when at opposition',
      where: 'Requires finder chart. Blue-green disk with steady light.',
      brightness: '+5.7 to +5.9',
      telescope: 'Tiny blue-green disk. Moons visible with large aperture.',
      difficulty: 'Challenging - needs dark skies and knowing where to look',
      special: 'Barely naked eye in perfect conditions. Binoculars show it easily in dark skies.'
    })
  }
  
  // Neptune - requires telescope
  if (cloudPercent < 20 && lat) {
    planets.push({
      name: 'Neptune',
      visible: true,
      when: 'Requires telescope and finder chart',
      where: 'Finder chart essential. Tiny blue disk, steady light.',
      brightness: '+7.8 to +8.0',
      telescope: 'Tiny blue disk. Triton moon visible with 12 inch+ scope.',
      difficulty: 'Very challenging - requires dark sky and telescope',
      special: 'Only planet discovered mathematically before visually. Requires averted vision.'
    })
  }
  
  return planets
}

// ============================================================================
// ENHANCED DEEP SKY OBJECT VISIBILITY
// ============================================================================

function getDeepSkyObjectVisibility(data) {
  const { cloudPercent, moonPhase, bortleScale, season, lat } = data
  const objects = []
  const moonIllumination = getMoonIllumination(
    typeof moonPhase === 'string' ? 0 : moonPhase
  )
  
  if (cloudPercent > 40 || moonIllumination > 70) {
    return [{ category: 'Limited viewing', objects: 'Bright clusters and double stars only. Wait for darker conditions.' }]
  }
  
  // Winter objects (Northern Hemisphere)
  if (season === 'winter') {
    objects.push({
      name: 'Orion Nebula (M42)',
      type: 'Emission Nebula',
      magnitude: 4.0,
      visibility: 'Naked eye visible. Spectacular in any telescope. Brightest nebula in the sky.',
      bestWith: 'Any telescope or binoculars. UHC filter enhances detail significantly.',
      special: 'Trapezium cluster at center. Best viewed in winter. Star formation region.'
    })
    objects.push({
      name: 'Pleiades (M45)',
      type: 'Open Cluster',
      magnitude: 1.6,
      visibility: 'Naked eye obvious. Best in binoculars. 6-7 stars visible naked eye.',
      bestWith: 'Binoculars or wide-field refractor. Low power essential.',
      special: 'Subaru in Japanese. Contains reflection nebulosity. Over 1000 stars in cluster.'
    })
    objects.push({
      name: 'Andromeda Galaxy (M31)',
      type: 'Spiral Galaxy',
      magnitude: 3.4,
      visibility: 'Naked eye in dark skies. 6 times larger than full moon in apparent size.',
      bestWith: 'Binoculars or wide-field scope. Low power essential.',
      special: 'Closest major galaxy. Satellite galaxies M32 and M110 visible nearby. 2.5 million light years away.'
    })
    objects.push({
      name: 'Double Cluster (NGC 869 and NGC 884)',
      type: 'Open Clusters',
      magnitude: 4.3,
      visibility: 'Naked eye visible in dark skies. Stunning in binoculars or wide-field scope.',
      bestWith: 'Binoculars or low-power, wide-field eyepiece.',
      special: 'Two clusters side by side. Each contains hundreds of stars. 7,500 light years away.'
    })
  }
  
  // Spring objects
  if (season === 'spring') {
    objects.push({
      name: 'Whirlpool Galaxy (M51)',
      type: 'Spiral Galaxy',
      magnitude: 8.4,
      visibility: 'Requires telescope. Spiral arms visible with 8 inch+ scope in dark skies.',
      bestWith: '8 inch+ telescope, dark skies, good transparency.',
      special: 'First galaxy where spiral structure was observed. Interacting with companion galaxy.'
    })
    objects.push({
      name: 'Leo Triplet (M65, M66, NGC 3628)',
      type: 'Galaxy Group',
      magnitude: 9.3,
      visibility: 'Three galaxies in one field. 8 inch+ scope recommended.',
      bestWith: 'Medium-high power, dark skies.',
      special: 'All three visible in same low-power field. 30-40 million light years away.'
    })
    objects.push({
      name: 'Sombrero Galaxy (M104)',
      type: 'Spiral Galaxy',
      magnitude: 8.0,
      visibility: 'Famous dust lane. 6 inch+ scope shows the hat shape.',
      bestWith: '6 inch+ telescope. Dark skies help.',
      special: 'Dust lane visible in moderate apertures. 30 million light years away.'
    })
  }
  
  // Summer objects
  if (season === 'summer') {
    objects.push({
      name: 'Ring Nebula (M57)',
      type: 'Planetary Nebula',
      magnitude: 8.8,
      visibility: 'Smoke ring appearance. Visible in 4 inch+ scope. Looks like a smoke ring.',
      bestWith: 'Medium-high power. OIII filter enhances visibility.',
      special: 'Central star magnitude 15 - very challenging. 2,300 light years away.'
    })
    objects.push({
      name: 'Hercules Cluster (M13)',
      type: 'Globular Cluster',
      magnitude: 5.8,
      visibility: 'Naked eye in dark skies. Spectacular in any telescope.',
      bestWith: 'Medium power. Resolves into individual stars in 6 inch+ scope.',
      special: 'Over 300,000 stars. 25,000 light years away. One of the best globular clusters.'
    })
    objects.push({
      name: 'Lagoon Nebula (M8)',
      type: 'Emission Nebula',
      magnitude: 6.0,
      visibility: 'Naked eye in dark skies. Cluster plus nebulosity visible.',
      bestWith: 'Any telescope or binoculars. UHC filter brings out detail.',
      special: 'Contains open cluster NGC 6530. Star formation region. 4,100 light years away.'
    })
    objects.push({
      name: 'Dumbbell Nebula (M27)',
      type: 'Planetary Nebula',
      magnitude: 7.5,
      visibility: 'Apple-core shape. Visible in 4 inch+ scope.',
      bestWith: 'Medium power. OIII filter reveals detail.',
      special: 'First planetary nebula discovered. 1,200 light years away.'
    })
  }
  
  // Fall objects
  if (season === 'fall') {
    objects.push({
      name: 'Andromeda Galaxy (M31)',
      type: 'Spiral Galaxy',
      magnitude: 3.4,
      visibility: 'Best viewed in fall. Naked eye in dark skies.',
      bestWith: 'Binoculars or wide-field scope.',
      special: 'Best galaxy viewing season. Also look for M33 in Triangulum.'
    })
    objects.push({
      name: 'Pleiades (M45)',
      type: 'Open Cluster',
      magnitude: 1.6,
      visibility: 'Rising in late evening. Beautiful in binoculars.',
      bestWith: 'Binoculars or wide-field refractor.',
      special: 'Sign of approaching winter. Also known as the Seven Sisters.'
    })
  }
  
  // Southern hemisphere objects
  if (lat && lat < -20) {
    objects.push({
      name: 'Omega Centauri (NGC 5139)',
      type: 'Globular Cluster',
      magnitude: 3.9,
      visibility: 'Naked eye visible. Largest and brightest globular cluster.',
      bestWith: 'Any telescope. Resolves into thousands of stars.',
      special: 'Contains millions of stars. 16,000 light years away. Southern hemisphere gem.'
    })
    objects.push({
      name: 'Large Magellanic Cloud',
      type: 'Dwarf Galaxy',
      magnitude: 0.9,
      visibility: 'Naked eye obvious. Satellite galaxy of Milky Way.',
      bestWith: 'Binoculars or wide-field telescope.',
      special: 'Contains the Tarantula Nebula (largest known nebula). Southern hemisphere only.'
    })
  }
  
  return objects
}

// ============================================================================
// ENHANCED ASTRONOMICAL TWILIGHT CALCULATOR
// ============================================================================

function getTwilightPeriods(data) {
  const { sunset, sunrise } = data
  if (!sunset || !sunrise) return []
  
  const sunsetTime = new Date(sunset)
  const sunriseTime = new Date(sunrise)
  const periods = []
  const now = new Date()
  
  const civilEnd = new Date(sunsetTime.getTime() + 30 * 60000)
  const civilStart = new Date(sunriseTime.getTime() - 30 * 60000)
  const nauticalEnd = new Date(sunsetTime.getTime() + 60 * 60000)
  const nauticalStart = new Date(sunriseTime.getTime() - 60 * 60000)
  const astroEnd = new Date(sunsetTime.getTime() + 90 * 60000)
  const astroStart = new Date(sunriseTime.getTime() - 90 * 60000)
  
  const format = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  
  // Determine current phase
  let currentPhase = 'Daytime'
  const nowMs = now.getTime()
  if (nowMs > sunsetTime.getTime() && nowMs < civilEnd.getTime()) currentPhase = 'Civil Twilight'
  else if (nowMs > civilEnd.getTime() && nowMs < nauticalEnd.getTime()) currentPhase = 'Nautical Twilight'
  else if (nowMs > nauticalEnd.getTime() && nowMs < astroEnd.getTime()) currentPhase = 'Astronomical Twilight'
  else if (nowMs > astroEnd.getTime() && nowMs < astroStart.getTime()) currentPhase = 'True Night'
  
  periods.push({
    phase: 'Sunset',
    time: format(sunsetTime),
    description: 'Sun at horizon. Brightest planets and stars begin to appear.',
    darkness: 'Daylight to civil twilight'
  })
  
  periods.push({
    phase: 'Civil Twilight',
    time: `${format(sunsetTime)} - ${format(civilEnd)}`,
    description: 'Brightest stars visible. Planets clear. Landscape still visible.',
    darkness: 'Too bright for deep sky observing',
    photography: 'Landscape astrophotography possible'
  })
  
  periods.push({
    phase: 'Nautical Twilight',
    time: `${format(civilEnd)} - ${format(nauticalEnd)}`,
    description: 'Milky Way becoming visible. Most stars are out. Horizon visible.',
    darkness: 'Deep sky becoming possible',
    photography: 'Milky Way photography begins'
  })
  
  periods.push({
    phase: 'Astronomical Twilight',
    time: `${format(nauticalEnd)} - ${format(astroEnd)}`,
    description: 'Sky fully dark to naked eye. Faint objects visible. No more sky glow from sun.',
    darkness: 'Best deep sky observing',
    photography: 'Deep sky astrophotography optimal'
  })
  
  const trueNightStart = astroEnd
  const trueNightEnd = astroStart
  
  if (trueNightStart < trueNightEnd) {
    periods.push({
      phase: 'True Night',
      time: `${format(trueNightStart)} - ${format(trueNightEnd)}`,
      description: 'DARKEST PERIOD of the night. All astronomical objects visible.',
      darkness: 'Maximum darkness for your location',
      photography: 'Best for narrowband and faint object imaging'
    })
  } else {
    periods.push({
      phase: 'Astronomical Twilight',
      time: `${format(astroEnd)} - ${format(astroStart)}`,
      description: 'Night sky never reaches full darkness (summer months at high latitude)',
      darkness: 'Limited darkness',
      photography: 'Narrowband imaging still possible'
    })
  }
  
  // Add current phase indicator
  periods.forEach(p => {
    if (p.phase === currentPhase) {
      p.current = true
    }
  })
  
  return periods
}

// ============================================================================
// ENHANCED DEW & EQUIPMENT MANAGEMENT
// ============================================================================

function getDewAdvice(data) {
  const { temp, humidity, dewPoint, wind, cloudPercent } = data
  const advice = []
  const dewSpread = temp - (dewPoint || temp - 5)
  
  if (dewSpread <= 1) {
    advice.push("CRITICAL DEW RISK: Temperature within 1°C of dew point.")
    advice.push("Dew will form rapidly on all exposed optical surfaces.")
    advice.push("DEW HEATERS MANDATORY for all optical surfaces.")
    advice.push("  - Telrad and Rigel finder will fog first (large exposed surface)")
    advice.push("  - Eyepieces will fog from body heat and breath")
    advice.push("  - Corrector plate and lens will dew over in minutes")
    advice.push("Equipment needed:")
    advice.push("  - Dew heater strips plus controller for main scope")
    advice.push("  - Dew heater for eyepiece and finder")
    advice.push("  - Dew shield extends dew-free time by approximately 2x")
    advice.push("  - 12V hair dryer for emergency defogging")
    advice.push("Tactics:")
    advice.push("  - Keep eyepieces in pocket with body heat when not in use")
    advice.push("  - Point scope down when not observing")
    advice.push("  - Consider bringing backup eyepieces in case of fogging")
  } else if (dewSpread <= 3) {
    advice.push("MODERATE DEW RISK: Dew likely by midnight.")
    advice.push("Dew heaters recommended. Dew shield is minimum requirement.")
    advice.push("Expect to need defogging 2-3 times during observing session.")
  } else if (dewSpread <= 5) {
    advice.push("LOW DEW RISK: Dew shield should suffice.")
    advice.push("May see some dew after 2-3 hours of observing.")
  } else {
    advice.push("MINIMAL DEW RISK tonight. Optics should stay clear.")
  }
  
  if (humidity > 80) {
    advice.push("HIGH HUMIDITY: Paper star charts will become damp. Use laminated charts or tablet.")
    advice.push("Electronics: consider silica gel packets in accessory case.")
    advice.push("Refractor corrector plates and SCT correctors most vulnerable.")
  }
  
  if (wind > 15) {
    advice.push("WINDY: Wind increases evaporative cooling. May actually reduce dew.")
    advice.push("But: wind will shake telescope. Use windbreaks or lower magnification.")
  }
  
  if (cloudPercent < 10 && temp < 5) {
    advice.push("COLD AND CLEAR: Perfect for observing but dew/frost risk high.")
    advice.push("Frost may form on optics. Use dew heaters on higher setting.")
  }
  
  return advice
}

// ============================================================================
// ENHANCED EQUIPMENT RECOMMENDATIONS
// ============================================================================

function getEquipmentRecommendations(data) {
  const { cloudPercent, moonPhase, seeing, transparency, bortleScale, temp, wind } = data
  const recommendations = []
  const moonIllumination = getMoonIllumination(
    typeof moonPhase === 'string' ? 0 : moonPhase
  )
  
  if (cloudPercent < 20 && seeing < 3 && bortleScale < 4 && transparency > 6) {
    recommendations.push("PRIME CONDITIONS: Any telescope will perform well tonight.")
    recommendations.push("  - Large Dobsonian (12 inch+): Galaxies, nebulae, globulars")
    recommendations.push("  - APO Refractor (4-6 inch): Wide field, planetary, astrophotography")
    recommendations.push("  - SCT or Maksutov (8-14 inch): Planetary detail, double stars")
  } else if (cloudPercent < 30 && seeing < 4 && bortleScale < 5) {
    recommendations.push("GOOD CONDITIONS: Most telescopes will perform well.")
    recommendations.push("Expect good results with any quality telescope.")
  }
  
  if (moonIllumination > 60) {
    recommendations.push("BRIGHT MOON: Focus on lunar, planetary, and double stars.")
    recommendations.push("  - Moon filter is essential (reduces glare, increases contrast)")
    recommendations.push("  - High magnification for lunar detail (200-300x)")
    recommendations.push("  - Color filters for planetary detail enhancement")
    recommendations.push("  - Skip deep sky - moonlight will wash out faint objects")
  } else if (moonIllumination < 20 && bortleScale < 5) {
    recommendations.push("DARK SKY WINDOW: Deep sky objects will be at their best.")
    recommendations.push("  - UHC and OIII filters for emission nebulae")
    recommendations.push("  - Lowest power, widest field eyepiece for Milky Way sweeping")
    recommendations.push("  - Consider dark adaptation (no white light for 30+ minutes)")
  }
  
  if (seeing <= 2) {
    recommendations.push("EXCELLENT SEEING: Crank up the magnification!")
    recommendations.push("  - Planetary eyepieces (200-300x depending on aperture)")
    recommendations.push("  - Try for difficult double star splits")
    recommendations.push("  - Lucky imaging technique for planetary photography")
  } else if (seeing >= 5) {
    recommendations.push("POOR SEEING: Lower your expectations on magnification.")
    recommendations.push("  - Limit magnification to 150x or less")
    recommendations.push("  - Focus on wide-field, low-power observing")
    recommendations.push("  - Binocular observing may be more rewarding than telescope")
  }
  
  if (Math.abs(temp - 20) > 15) {
    recommendations.push(`TEMPERATURE ${Math.round(temp)}°C: Allow telescope to acclimate.`)
    if (temp < 5) {
      recommendations.push("  - COLD: Allow 60-90 minutes for optics to reach thermal equilibrium")
      recommendations.push("  - COLD: Battery life reduced significantly - bring spares")
      recommendations.push("  - COLD: Lubricants stiffen - mounts may be sluggish")
      recommendations.push("  - COLD: Consider a heated eyepiece case")
    } else if (temp > 30) {
      recommendations.push("  - HOT: Tube currents will degrade images until scope cools")
      recommendations.push("  - HOT: Allow 45-60 minutes cooldown (fans help)")
      recommendations.push("  - HOT: Thermal expansion can affect focus")
    }
  }
  
  if (bortleScale >= 7) {
    recommendations.push("LIGHT POLLUTED SKIES: Work with what you can see.")
    recommendations.push("  - Moon, planets, and double stars are your best targets")
    recommendations.push("  - Light pollution reduction (LPR) filter helps slightly")
    recommendations.push("  - Consider Electronically Assisted Astronomy (EAA)")
    recommendations.push("  - Live stacking with camera reveals objects invisible visually")
  }
  
  if (wind > 15) {
    recommendations.push(`WIND ${Math.round(wind)}km/h: Telescope stability affected.`)
    recommendations.push("  - Lower magnification to reduce wind impact")
    recommendations.push("  - Use windbreak or observe from sheltered location")
    recommendations.push("  - Heavier mounts are more stable in wind")
  }
  
  return recommendations
}

// ============================================================================
// ENHANCED ASTROPHOTOGRAPHY CONDITIONS
// ============================================================================

function getAstrophotographyAdvice(data) {
  const { cloudPercent, seeing, transparency, moonPhase, wind, humidity, temp, aqi } = data
  const advice = []
  const moonIllumination = getMoonIllumination(
    typeof moonPhase === 'string' ? 0 : moonPhase
  )
  
  if (cloudPercent > 20) {
    advice.push("CLOUDS: Astrophotography requires clear skies. Wait for better conditions.")
    advice.push(`  ${Math.round(cloudPercent)}% cloud cover will ruin long exposures.`)
  } else if (cloudPercent > 5) {
    advice.push("MINOR CLOUDS: Some thin clouds may pass. Consider narrowband imaging.")
  } else {
    advice.push("CLEAR SKIES: Excellent conditions for astrophotography.")
  }
  
  if (seeing > 3) {
    advice.push("POOR SEEING: Not suitable for high-resolution planetary or lunar imaging.")
    advice.push("  Consider wide-field shots instead of high-magnification work.")
    advice.push("  Lucky imaging technique may help planetary images.")
  }
  
  if (transparency < 5) {
    advice.push("POOR TRANSPARENCY: Faint objects will be significantly dimmed.")
    advice.push(`  Expect to need 30-50% longer exposures for same signal.`)
    advice.push("  Focus on brighter targets tonight.")
  } else if (transparency > 8) {
    advice.push("EXCELLENT TRANSPARENCY: Faint objects will be at their best.")
    advice.push("  Great night for deep sky imaging.")
  }
  
  if (wind > 15) {
    advice.push(`WIND ${Math.round(wind)}km/h: Telescope shake will blur images.`)
    advice.push("  - Wind protection and shelter needed for long exposures")
    advice.push("  - Autoguiding may struggle to correct")
    advice.push("  - Consider shorter exposures and stack more frames")
  }
  
  if (moonIllumination > 50) {
    advice.push("MOONLIGHT: Broadband imaging will be compromised.")
    advice.push("  - Narrowband imaging (Ha, OIII, SII) still possible")
    advice.push("  - Lunar and planetary imaging are ideal tonight")
    advice.push("  - Wait for moon to set before imaging faint targets")
  } else if (moonIllumination < 10) {
    advice.push("PERFECT: Dark skies for broadband deep sky imaging.")
    advice.push("  - RGB, LRGB, or OSC imaging will work well")
    advice.push("  - Shoot your faintest targets tonight")
  }
  
  if (humidity > 80) {
    advice.push("HIGH HUMIDITY: Dew will form on lens and corrector plate.")
    advice.push("  - Dew heaters are absolutely essential")
    advice.push("  - Camera sensor may fog if not sealed")
    advice.push("  - Flat frames may show changing dust patterns")
  }
  
  if (aqi > 100) {
    advice.push("POOR AIR QUALITY: Particles in air scatter light.")
    advice.push("  - Transparency reduced by particulate matter")
    advice.push("  - Calibration frames may be affected")
  }
  
  if (temp < 0) {
    advice.push("FREEZING: Equipment considerations.")
    advice.push("  - Batteries drain faster in cold")
    advice.push("  - USB cables stiffen, may disconnect")
    advice.push("  - Keep spare batteries warm")
    advice.push("  - Consider dew heater on guide scope")
  }
  
  return advice
}

// ============================================================================
// ENHANCED MAIN STARGAZING ADVICE FUNCTION
// ============================================================================

export const getStargazingAdvice = async (data, question = '') => {
  if (!data) return "Loading weather data..."

  // Use time-shifted data
  let cloudPercent = data.cloudCover !== undefined ? data.cloudCover : 0
  let temp = data.temp || 0
  let humidity = data.humidity || 0
  let wind = data.wind || 0
  let condition = data.condition || 'clear'
  let conditionCode = data.conditionCode || 0
  let precipitationProb = data.precipitationProb || 0
  
  // If hourly data is available
  if (data._hourIndex !== undefined && data.hourly) {
    const idx = data._hourIndex
    if (data.hourly.cloud_cover?.[idx] !== undefined) {
      cloudPercent = data.hourly.cloud_cover[idx]
    }
    if (data.hourly.temperature_2m?.[idx] !== undefined) {
      temp = Math.round(data.hourly.temperature_2m[idx])
    }
    if (data.hourly.relative_humidity_2m?.[idx] !== undefined) {
      humidity = data.hourly.relative_humidity_2m[idx]
    }
    if (data.hourly.wind_speed_10m?.[idx] !== undefined) {
      wind = data.hourly.wind_speed_10m[idx]
    }
    if (data.hourly.weather_code?.[idx] !== undefined) {
      conditionCode = data.hourly.weather_code[idx]
      condition = mapWeatherCode(conditionCode)
    }
    if (data.hourly.precipitation_probability?.[idx] !== undefined) {
      precipitationProb = data.hourly.precipitation_probability[idx]
    }
  }
  
  // If daily data is available
  if (data._dayOffset !== undefined && data.daily) {
    const dayIdx = data._dayOffset > 0 ? data._dayOffset : 0
    if (data.daily.weather_code?.[dayIdx] !== undefined) {
      conditionCode = data.daily.weather_code[dayIdx]
      condition = mapWeatherCode(conditionCode)
    }
    if (data.daily.cloud_cover?.[dayIdx] !== undefined) {
      cloudPercent = data.daily.cloud_cover[dayIdx]
    }
    if (data.daily.temperature_2m_max?.[dayIdx] !== undefined) {
      temp = Math.round(data.daily.temperature_2m_max[dayIdx])
    }
    if (data.daily.precipitation_probability_max?.[dayIdx] !== undefined) {
      precipitationProb = data.daily.precipitation_probability_max[dayIdx]
    }
  }

  const { 
    sunset, sunrise, city, lat, lon, moonPhase: passedMoonPhase,
    visibility, dewPoint, pressure, tempMin, tempMax, aqi
  } = data
  
  // Get moon phase
  let moonPhase = passedMoonPhase !== undefined ? passedMoonPhase : 0
  let moonPhaseName = 'Unknown'
  
  try {
    if (passedMoonPhase === undefined && lat && lon) {
      moonPhase = await getMoonPhaseAsync(lat, lon)
    }
    moonPhaseName = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                     'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
                     [Math.round(moonPhase * 7) % 8] || 'New Moon'
  } catch {
    moonPhase = 0
    moonPhaseName = 'New Moon'
  }
  
  const moonIllumination = getMoonIllumination(moonPhase)
  const moonRiseSet = getMoonRiseSet(data)
  const seeing = getSeeingConditions({ ...data, temp, humidity, wind })
  const transparency = getTransparency({ ...data, humidity, wind, cloudPercent, aqi })
  const bortleScale = getDarkSkyRating({ ...data, cloudPercent, moonPhase })
  const bortle = BORTLE_SCALE[bortleScale] || BORTLE_SCALE[5]
  const planetVis = getDetailedPlanetVisibility({ ...data, cloudPercent, moonPhase, lat })
  const milkyWayVis = getMilkyWayVisibility({ ...data, cloudPercent, moonPhase, bortleScale })
  const isssPasses = getISSFlyoverTimes(data)
  const auroraForecast = getAuroraForecast({ ...data, cloudPercent })
  const twilightPeriods = getTwilightPeriods(data)
  const meteorShowers = getMeteorShowerCalendar(new Date())
  const deepSkyObjects = getDeepSkyObjectVisibility({...data, cloudPercent, moonPhase, bortleScale, lat})
  const dewAdvice = getDewAdvice({ ...data, temp, humidity, dewPoint, wind, cloudPercent })
  const equipmentRecs = getEquipmentRecommendations({...data, cloudPercent, moonPhase, seeing, transparency, bortleScale, temp, wind})
  const photoAdvice = getAstrophotographyAdvice({...data, cloudPercent, moonPhase, seeing, transparency, temp, humidity, wind, aqi})
  
  // Calculate night duration
  let nightDuration = 'N/A'
  if (sunrise && sunset) {
    const rise = new Date(sunrise)
    const set = new Date(sunset)
    if (set > rise) {
      const duration = (set - rise) / 3600000
      nightDuration = duration.toFixed(1) + ' hours'
    } else {
      const duration = (new Date(rise.getTime() + 86400000) - set) / 3600000
      nightDuration = duration.toFixed(1) + ' hours'
    }
  }
  
  const pickeringRating = PICKERING_SCALE[seeing] || PICKERING_SCALE[5]
  
  // Build response sections
  let verdict = []
  let viewing = []
  let timing = []
  let warnings = []
  let objects = []
  let equipment = []
  let comfort = []

  // Check for rain and snow
  const isRainy = condition === 'rain' || condition === 'thunderstorm' || condition === 'drizzle' || condition === 'snow'
  
  if (isRainy) {
    verdict.push("ASTRONOMY CANCELLED: Active precipitation. No observing possible.")
    warnings.push("Telescopes and electronics plus water equals expensive disaster.")
    warnings.push("Check forecast for tomorrow night.")
    viewing.push("Tonight: Read about the objects you will observe tomorrow.")
    viewing.push("Great night for: collimation practice, equipment maintenance.")
  }
  
  if (cloudPercent >= 95) {
    verdict.push("COMPLETELY OVERCAST: 95%+ cloud cover. Nothing visible.")
    warnings.push("Do not waste time setting up. Check satellite imagery for breaks.")
  }

  if (!verdict.length) {
    if (cloudPercent >= 80) {
      verdict.push("MOSTLY CLOUDY: Only brief sucker holes possible.")
      viewing.push("Bright planets and moon might peek through occasionally.")
      viewing.push("Not worth setting up telescope. Binoculars ready for quick looks.")
    } else if (cloudPercent >= 60) {
      verdict.push("PARTLY CLOUDY: Frustrating but possible with patience.")
      viewing.push("Gaps in clouds will come and go. Have targets ready.")
      viewing.push("Best strategy: observe bright objects that can be found quickly.")
    } else if (cloudPercent >= 30) {
      verdict.push("MOSTLY CLEAR: Good conditions with some cloud interference.")
      viewing.push("Stars visible in most directions. Some clouds passing.")
      viewing.push("Worth setting up. Plan targets away from cloud paths.")
    } else if (cloudPercent >= 10) {
      verdict.push("CLEAR SKIES: Excellent conditions for astronomy.")
      viewing.push("Minimal cloud interference. Most of sky accessible.")
      viewing.push("Telescope time! Deep sky objects will be visible.")
    } else {
      verdict.push("PERFECTLY CLEAR: Crystal clear skies. Rare conditions.")
      viewing.push("Transparency likely excellent. Every astronomical target available.")
      viewing.push("CANCEL YOUR PLANS. These nights are precious.")
    }
  }

  // Moon impact
  if (moonIllumination > 90) {
    warnings.push(`${moonPhaseName}: ${Math.round(moonIllumination)}% illuminated. Sky brightly lit.`)
    warnings.push("Deep sky observing severely compromised. Only brightest DSOs visible.")
    viewing.push("EXCELLENT for: Lunar observation (craters along terminator are spectacular).")
    viewing.push("EXCELLENT for: Planetary observation.")
    viewing.push("POOR for: Galaxies, nebulae, faint star clusters, Milky Way.")
    if (moonRiseSet && moonRiseSet.rise) {
      timing.push("Moon visible all night. No dark sky window.")
    }
  } else if (moonIllumination > 60) {
    warnings.push(`${moonPhaseName}: ${Math.round(moonIllumination)}% illuminated. Significant sky brightness.`)
    viewing.push("Good for: Moon, planets, bright star clusters, double stars.")
    if (moonRiseSet && moonRiseSet.set) {
      timing.push(`Moon sets at ${moonRiseSet.set}. Dark window after moonset.`)
    }
  } else if (moonIllumination > 30) {
    viewing.push(`${moonPhaseName}: Moderate moonlight. Good compromise conditions.`)
    objects.push("Lunar terminator: Best detail at first and last quarter.")
    if (moonRiseSet && moonRiseSet.set) {
      timing.push(`Moon sets at ${moonRiseSet.set}. Deep sky window opens after.`)
    }
  } else if (moonIllumination > 5) {
    viewing.push(`${moonPhaseName}: Thin crescent. Dark sky dominant.`)
    viewing.push("EXCELLENT for: Deep sky objects, Milky Way, faint galaxies.")
    objects.push("Earthshine on dark limb of moon visible.")
  } else {
    viewing.push(`${moonPhaseName}: DARKEST SKIES POSSIBLE.`)
    viewing.push("PERFECT for: Everything. Galaxies, nebulae, Milky Way, faint objects.")
    warnings.push("No moonlight means you NEED red flashlight. White light destroys night vision.")
  }

  // Seeing conditions
  viewing.push(`SEEING: ${pickeringRating.description} (Pickering ${seeing}/10)`)
  viewing.push(`Magnification limit: ${pickeringRating.magnification}`)
  
  if (seeing <= 2) {
    viewing.push("EXCELLENT seeing: Stars will be pinpoints. Planetary detail at its best.")
  } else if (seeing <= 3) {
    viewing.push("Good seeing: High power usable. Detail visible on planets.")
  } else if (seeing >= 5) {
    viewing.push("Poor seeing: Stars will twinkle violently. Low power only.")
    warnings.push("Poor seeing will make planets look like boiling blobs.")
  }

  // Transparency
  if (transparency >= 8) {
    viewing.push("EXCELLENT transparency: Faint objects at their best.")
  } else if (transparency < 5) {
    viewing.push("Poor transparency: Only brightest objects visible.")
    warnings.push("Significant dimming of all objects. Deep sky work impossible.")
  }

  // Bortle scale
  viewing.push(`SKY DARKNESS: Bortle ${bortleScale} - ${bortle.name}`)
  viewing.push(`Naked eye limiting magnitude: ~${bortle.limiting}`)
  
  if (bortleScale >= 7) {
    warnings.push("SEVERE light pollution. Only moon, planets, and brightest stars visible.")
    viewing.push("Drive to darker skies for Milky Way and galaxies.")
  } else if (bortleScale <= 3) {
    viewing.push("DARK SKIES: Milky Way casts shadows. Galaxies accessible.")
  }

  // Planets
  if (planetVis.length > 0) {
    objects.push("PLANETS VISIBLE TONIGHT:")
    planetVis.forEach(planet => {
      if (planet.visible) {
        objects.push(`  ${planet.name}: ${planet.where}`)
        objects.push(`    Brightness: ${planet.brightness} | Best: ${planet.telescope}`)
        if (planet.special) objects.push(`    ${planet.special}`)
        objects.push(`    Difficulty: ${planet.difficulty}`)
      }
    })
  }

  // Deep sky objects
  if (deepSkyObjects.length > 0 && cloudPercent < 50 && moonIllumination < 60) {
    objects.push("DEEP SKY OBJECTS VISIBLE:")
    deepSkyObjects.forEach(obj => {
      if (obj.name) {
        objects.push(`  ${obj.name} (${obj.type})`)
        objects.push(`    Magnitude ${obj.magnitude} | ${obj.visibility}`)
        if (obj.special) objects.push(`    ${obj.special}`)
      } else {
        objects.push(`  ${obj.objects || obj.category}`)
      }
    })
  }

  // Meteor showers
  if (meteorShowers && meteorShowers.active) {
    objects.push("ACTIVE METEOR SHOWER:")
    objects.push(`  ${meteorShowers.name}: Peak ${meteorShowers.peak}, Rate ${meteorShowers.rate}/hour`)
    objects.push(`  Radiant: ${meteorShowers.constellation} | ${meteorShowers.notes}`)
    if (moonIllumination > 50) {
      warnings.push("Moonlight will reduce visible meteors by 50-70 percent.")
    }
  }
  
  // ISS flyovers
  if (isssPasses && isssPasses.length > 0) {
    objects.push("ISS FLYOVERS TONIGHT:")
    isssPasses.forEach(pass => {
      objects.push(`  ${pass.time} - ${pass.direction || 'NW to SE'} - Magnitude ${pass.magnitude || -3.5}`)
    })
  }
  
  // Aurora forecast
  if (auroraForecast && auroraForecast.kp >= 5) {
    objects.push(`AURORA FORECAST: Kp ${auroraForecast.kp} - Possible aurora activity!`)
    if (auroraForecast.kp >= 7) {
      viewing.push("STRONG AURORA POSSIBLE: Even at mid-latitudes. Look north!")
    }
  }

  // Twilight schedule
  if (twilightPeriods.length > 0) {
    timing.push("TWILIGHT SCHEDULE:")
    twilightPeriods.forEach(period => {
      const current = period.current ? ' (CURRENTLY)' : ''
      timing.push(`  ${period.phase}${current}: ${period.time}`)
      timing.push(`    ${period.description}`)
      if (period.photography) timing.push(`    ${period.photography}`)
    })
  }
  
  // Moon rise and set
  if (moonRiseSet) {
    if (moonRiseSet.rise) timing.push(`Moon rises: ${moonRiseSet.rise}`)
    if (moonRiseSet.set) timing.push(`Moon sets: ${moonRiseSet.set}`)
  }
  
  timing.push(`Total darkness window: ${nightDuration}`)

  // Equipment recommendations
  equipment = equipmentRecs
  
  // Dew advice
  if (dewAdvice.length > 0) {
    equipment.push("DEW MANAGEMENT:")
    dewAdvice.forEach(d => equipment.push(`  ${d}`))
  }

  // Observer comfort
  if (temp < 5) {
    comfort.push(`COLD ${Math.round(temp)}°C: Dress in layers. Insulated boots, hand warmers essential.`)
    comfort.push("Battery life reduced: bring spares for everything.")
    comfort.push("Keep telescope warm-up time in mind.")
  } else if (temp < 15) {
    comfort.push(`COOL ${Math.round(temp)}°C: Jacket and warm shoes recommended.`)
    comfort.push("Temperature will drop after midnight - bring extra layer.")
  } else if (temp > 25) {
    comfort.push(`WARM ${Math.round(temp)}°C: Insect repellent if near water or woods.`)
    comfort.push("Stay hydrated. Bring water, not just coffee.")
  }
  
  if (wind > 15) {
    comfort.push(`WINDY ${Math.round(wind)}km/h: Wind chill will make it feel colder. Dress accordingly.`)
  }

  // Astrophotography
  if (photoAdvice.length > 0 && !verdict[0]?.includes('CANCELLED')) {
    equipment.push("ASTROPHOTOGRAPHY CONDITIONS:")
    photoAdvice.forEach(p => equipment.push(`  ${p}`))
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "ASTRONOMY SKY CONDITIONS REPORT",
    "STARGAZING WEATHER ASSESSMENT",
    "NIGHT SKY OBSERVING ADVISORY",
    "ASTRONOMY CONDITIONS ANALYSIS",
    "OBSERVATORY WEATHER EVALUATION"
  ]

  let response = `${random(intros)}\n`
  if (city) response += `Location: ${city}\n`
  if (data._timeLabel) response += `Time: ${data._timeLabel}\n`
  response += `\n`
  
  // Overall verdict
  response += `=== OVERALL VERDICT ===\n`
  verdict.forEach(v => response += `  ${v}\n`)
  response += `\n`
  
  // Sky quality
  response += `=== SKY QUALITY ===\n`
  response += `  Cloud Cover: ${Math.round(cloudPercent)}%\n`
  response += `  Seeing (Pickering): ${seeing}/10 - ${pickeringRating.description}\n`
  response += `  Transparency: ${transparency}/10\n`
  response += `  Bortle Class: ${bortleScale} - ${bortle.name}\n`
  response += `  Limiting Magnitude: ~${bortle.limiting}\n`
  response += `\n`
  
  // Moon
  response += `=== MOON ===\n`
  response += `  Phase: ${moonPhaseName}\n`
  response += `  Illumination: ${Math.round(moonIllumination)}%\n`
  if (moonRiseSet) {
    if (moonRiseSet.rise) response += `  Rises: ${moonRiseSet.rise}\n`
    if (moonRiseSet.set) response += `  Sets: ${moonRiseSet.set}\n`
  }
  response += `\n`
  
  // Viewing conditions
  if (viewing.length > 0) {
    response += `=== VIEWING CONDITIONS ===\n`
    viewing.forEach(v => response += `  ${v}\n`)
    response += `\n`
  }
  
  // Observing targets
  if (objects.length > 0) {
    response += `=== OBSERVING TARGETS ===\n`
    objects.forEach(o => response += `${o}\n`)
    response += `\n`
  }
  
  // Timing
  if (timing.length > 0) {
    response += `=== TIMING ===\n`
    timing.forEach(t => response += `  ${t}\n`)
    response += `\n`
  }
  
  // Equipment
  if (equipment.length > 0 && !verdict[0]?.includes('CANCELLED')) {
    response += `=== EQUIPMENT ===\n`
    equipment.forEach(e => response += `${e}\n`)
    response += `\n`
  }
  
  // Observer comfort
  if (comfort.length > 0) {
    response += `=== OBSERVER COMFORT ===\n`
    comfort.forEach(c => response += `  ${c}\n`)
    response += `\n`
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `=== WARNINGS ===\n`
    warnings.forEach(w => response += `  ${w}\n`)
    response += `\n`
  }
  
  // Conditions summary
  response += `=== CONDITIONS ===\n`
  response += `  Temperature: ${Math.round(temp)}°C (${Math.round(tempMin || temp - 2)}°C to ${Math.round(tempMax || temp + 2)}°C)\n`
  response += `  Humidity: ${Math.round(humidity)}%\n`
  response += `  Wind: ${Math.round(wind)} km/h\n`
  response += `  Visibility: ${visibility || 10} km\n`
  if (dewPoint) response += `  Dew Point: ${Math.round(dewPoint)}°C (Spread: ${(temp - dewPoint).toFixed(1)}°C)\n`
  if (aqi) response += `  AQI: ${aqi}\n`
  if (precipitationProb > 0) response += `  Rain chance: ${Math.round(precipitationProb)}%\n`
  response += `\n`
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`
  if (cloudPercent > 80 || isRainy) {
    response += `  Keep telescope inside tonight. Use time for astronomy reading and planning.\n`
  } else if (cloudPercent > 40) {
    response += `  Risky conditions. Quick setup for bright objects only.\n`
  } else if (seeing <= 3 && transparency >= 6 && moonIllumination < 30) {
    response += `  EXCEPTIONAL CONDITIONS. Drop everything and get outside.\n`
  } else if (moonIllumination > 80) {
    response += `  Good night for lunar and planetary. Skip the faint stuff.\n`
  } else {
    response += `  Worth setting up. Good astronomy conditions await.\n`
  }
  
  const wisdom = [
    "The universe is under no obligation to make sense to you. - Neil deGrasse Tyson",
    "Somewhere, something incredible is waiting to be known. - Carl Sagan",
    "Keep looking up... that is the secret of life. - Snoopy",
    "Every star may be a sun to someone. - Carl Sagan",
    "We are a way for the cosmos to know itself. - Carl Sagan",
    "The night sky is the only place where the past, present, and future all exist at once."
  ]
  response += `\n--- WISDOM ---\n${random(wisdom)}`
  
  return response
}

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export const getMeteorShowerInfo = getMeteorShowerCalendar
export const getPlanetVisibilityDetailed = getDetailedPlanetVisibility
export const getDeepSkyObjects = getDeepSkyObjectVisibility
export const getAstrophotographyConditions = getAstrophotographyAdvice
export const getDewManagement = getDewAdvice
export const getEquipmentRecommendationsExport = getEquipmentRecommendations
export const getTwilightPeriodsExport = getTwilightPeriods

export default getStargazingAdvice
