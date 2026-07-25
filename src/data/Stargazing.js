import {
  getMoonPhase,
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
} from './calculations';

// ============================================================================
// COMPREHENSIVE ASTRONOMY & STARGAZING WEATHER SYSTEM
// ============================================================================

export const sampleQuestions = [
  "Can I see stars tonight?",
  "Is it good for stargazing?",
  "Will the moon ruin stargazing?",
  "Can I see the Milky Way?",
  "Is it clear enough for a telescope?",
  "Best time to stargaze tonight?",
  "Will clouds block the stars?",
  "Can I see planets tonight?",
  "Is it good for meteor watching?",
  "Can I see the ISS tonight?",
  "Is Jupiter visible?",
  "Can I see Saturn's rings?",
  "Will fog be an issue?",
  "Is the seeing good for astrophotography?",
  "Can I see the Northern Lights?",
  "Is it worth setting up my telescope?",
  "Will humidity fog my lens?",
  "Can I see Venus tonight?",
  "Is Mars visible?",
  "Can I see the Orion Nebula?",
  "Is it dark enough for deep sky?",
  "Will the moon be up during viewing?",
  "Can I see the Andromeda Galaxy?",
  "Is it good for a star party?",
  "Will dew be a problem?",
  "Can I see the Pleiades?",
  "Is the transparency good?",
  "Can I see the zodiacal light?",
  "Will there be aurora activity?",
  "Is tonight good for comet watching?",
  "Can I see shooting stars?",
  "Will light pollution ruin viewing?",
  "Is the atmosphere stable?",
  "Can I photograph the Milky Way?",
  "Will moonlight wash out photos?",
  "Is it worth driving to dark sky site?",
  "Can I see any galaxies tonight?",
  "Will the seeing support high magnification?",
  "Is it good for planetary imaging?",
  "Can I see Mercury?",
  "Will twilight affect viewing?",
  "Is the sky transparency good tonight?",
  "Can I see Neptune or Uranus?",
  "Will there be any eclipses?",
  "Is it good for solar observing tomorrow?",
  "Can I see the summer triangle?",
  "Will wildfire smoke affect viewing?",
  "Is the jet stream affecting seeing?",
  "Can I see the gegenschein?",
  "Should I use a dew heater?",
  "Is it good for binocular astronomy?",
  "Can I see the Beehive Cluster?",
  "Will there be satellite flares?",
  "Is tonight good for a Messier marathon?",
  "Can I see Omega Centauri?",
  "Will clouds clear after midnight?",
  "Is it worth staying up late?",
  "Can I see the Lagoon Nebula?",
  "Will fog roll in from the coast?",
  "Is it clear at higher elevation?",
  "Can I see the Hercules Cluster?",
  "Will Starlink trains be visible?",
  "Is it good for radio astronomy?",
  "Can I see the Ring Nebula?",
  "Will the aurora be visible this far south?",
  "Is tonight good for citizen science?",
  "Can I see the Dumbbell Nebula?",
  "Should I acclimate my telescope?",
  "Is the moon too bright for DSOs?",
  "Can I see the Whirlpool Galaxy?",
  "Will there be iridium flares?",
  "Is it good for spectroscopy?",
  "Can I see the Leo Triplet?",
  "Will temperature inversion affect seeing?",
  "Is tonight good for a star trail photo?",
  "Can I see the Veil Nebula?",
  "Will the monsoon moisture clear?",
  "Is it transparent enough for faint fuzzies?",
  "Can I see the Double Cluster?",
  "Will Sahara dust affect viewing?",
  "Is it good for lunar photography?",
  "Can I see the Sculptor Galaxy?",
  "Will marine layer be an issue?",
  "Is tonight good for the Perseids?",
  "Can I see the Geminids?",
  "Will there be noctilucent clouds?",
  "Is it good for solar system observing?",
  "Can I see the Bode's Galaxy?",
  "Will volcanic aerosols affect sunset/sunrise colors?",
  "Is tonight transparent enough for UHC filter?",
  "Can I see the Crab Nebula?",
  "Should I bring my Ethos eyepiece?",
  "Will my SCT need extra cool-down time?"
];

// ============================================================================
// ASTRONOMICAL SEEING SCALE (Pickering Scale)
// ============================================================================

const PICKERING_SCALE = {
  1: {
    description: 'Perfect seeing',
    starAppearance: 'Star image motionless, diffraction rings complete',
    magnification: '40x per inch of aperture or more',
    rating: 'Exceptional - rare',
    suitability: 'Planetary detail, double stars, high-resolution imaging'
  },
  2: {
    description: 'Slightly imperfect',
    starAppearance: 'Slight undulations, moments of calm lasting several seconds',
    magnification: '32-40x per inch',
    rating: 'Excellent',
    suitability: 'Lunar/planetary, deep sky, photography'
  },
  3: {
    description: 'Good seeing',
    starAppearance: 'Moderate undulations, diffraction rings visible but in motion',
    magnification: '24-32x per inch',
    rating: 'Good',
    suitability: 'Most observing, medium-high power acceptable'
  },
  4: {
    description: 'Fair seeing',
    starAppearance: 'Diffraction rings often blurred, central disk visible',
    magnification: '16-24x per inch',
    rating: 'Average',
    suitability: 'Deep sky objects, low-medium power'
  },
  5: {
    description: 'Poor seeing',
    starAppearance: 'Diffraction rings barely visible, star image boiling',
    magnification: '12-16x per inch',
    rating: 'Below average',
    suitability: 'Low power wide field, not for planets'
  },
  6: {
    description: 'Very poor seeing',
    starAppearance: 'Star image a blurry blob, no diffraction features',
    magnification: '8-12x per inch',
    rating: 'Poor',
    suitability: 'Very low power, casual observing only'
  },
  7: {
    description: 'Extremely poor',
    starAppearance: 'Stars 2-3x normal size, constant rapid motion',
    magnification: 'Under 8x per inch',
    rating: 'Very poor',
    suitability: 'Binoculars only, not worth telescope setup'
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
    magnification: 'Don\'t bother',
    rating: 'Worst',
    suitability: 'Netflix and planetarium apps'
  },
  10: {
    description: 'Completely unusable',
    starAppearance: 'Stars look like they\'re having a rave',
    magnification: 'Forget it',
    rating: 'Why are you outside?',
    suitability: 'Indoor activities only'
  }
};

// ============================================================================
// BORTLE DARK SKY SCALE
// ============================================================================

const BORTLE_SCALE = {
  1: {
    name: 'Excellent Dark Sky Site',
    description: 'Zodiacal light visible, gegenschein visible, Milky Way casts shadows',
    limiting: '7.6-8.0',
    color: '#000000',
    milkyWay: 'Casts obvious shadows',
    zodiacalLight: 'Visible, colorful',
    airglow: 'Visible along horizon',
    clouds: 'Black holes in the sky'
  },
  2: {
    name: 'Typical Truly Dark Site',
    description: 'Milky Way highly structured, zodiacal light visible',
    limiting: '7.1-7.5',
    color: '#0a0a0a',
    milkyWay: 'Highly structured, summer Milky Way shows detail',
    zodiacalLight: 'Still bright enough to cast shadows at dusk/dawn',
    airglow: 'Weakly visible near horizon'
  },
  3: {
    name: 'Rural Sky',
    description: 'Some light pollution at horizon, Milky Way still detailed',
    limiting: '6.6-7.0',
    color: '#1a1a2e',
    milkyWay: 'Still shows complex structure',
    zodiacalLight: 'Visible in spring/autumn',
    lightPollution: 'Visible on horizon'
  },
  4: {
    name: 'Rural/Suburban Transition',
    description: 'Light pollution domes visible in several directions',
    limiting: '6.1-6.5',
    color: '#16213e',
    milkyWay: 'Visible but less detailed, washed out near horizon',
    zodiacalLight: 'Visible but extends less than 45°',
    lightDomes: 'Visible over population centers'
  },
  5: {
    name: 'Suburban Sky',
    description: 'Light pollution visible in most directions',
    limiting: '5.6-6.0',
    color: '#1a1a3e',
    milkyWay: 'Visible only overhead, washed out',
    zodiacalLight: 'Rarely visible',
    lightDomes: 'Obvious in several directions'
  },
  6: {
    name: 'Bright Suburban Sky',
    description: 'Milky Way barely visible, only at zenith',
    limiting: '5.1-5.5',
    color: '#2d2d44',
    milkyWay: 'Only visible near zenith',
    m33: 'Difficult with averted vision',
    clouds: 'Brightly lit'
  },
  7: {
    name: 'Suburban/Urban Transition',
    description: 'Milky Way invisible, M31 barely detectable',
    limiting: '4.6-5.0',
    color: '#4a4a5a',
    milkyWay: 'Invisible',
    m31: 'Barely visible with averted vision',
    clouds: 'Brightly lit, some stars visible'
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
};

// ============================================================================
// METEOR SHOWER CALENDAR
// ============================================================================

const METEOR_SHOWERS = {
  quadrantids: {
    name: 'Quadrantids',
    peak: 'Jan 3-4',
    rate: 120,
    parent: '2003 EH1 (asteroid)',
    constellation: 'Boötes',
    moonPhase2024: 'Last Quarter (favorable)',
    notes: 'Sharp peak, only 6 hours. Best before dawn.'
  },
  lyrids: {
    name: 'Lyrids',
    peak: 'Apr 22-23',
    rate: 18,
    parent: 'C/1861 G1 Thatcher',
    constellation: 'Lyra',
    moonPhase2024: 'Waxing Gibbous (unfavorable)',
    notes: 'Occasional fireballs. Best after midnight.'
  },
  eta_aquariids: {
    name: 'Eta Aquariids',
    peak: 'May 6-7',
    rate: 50,
    parent: '1P/Halley',
    constellation: 'Aquarius',
    moonPhase2024: 'New Moon (excellent)',
    notes: 'Better in Southern Hemisphere. Pre-dawn best.'
  },
  perseids: {
    name: 'Perseids',
    peak: 'Aug 12-13',
    rate: 100,
    parent: '109P/Swift-Tuttle',
    constellation: 'Perseus',
    notes: 'Most popular. Often produces fireballs. Best after midnight.'
  },
  draconids: {
    name: 'Draconids',
    peak: 'Oct 8-9',
    rate: 10,
    parent: '21P/Giacobini-Zinner',
    constellation: 'Draco',
    notes: 'Best in early evening. Occasional outbursts (thousands/hr).'
  },
  orionids: {
    name: 'Orionids',
    peak: 'Oct 21-22',
    rate: 20,
    parent: '1P/Halley',
    constellation: 'Orion',
    notes: 'Fast meteors with persistent trains. Best after midnight.'
  },
  leonids: {
    name: 'Leonids',
    peak: 'Nov 17-18',
    rate: 15,
    parent: '55P/Tempel-Tuttle',
    constellation: 'Leo',
    notes: 'Famous for 33-year storms (next ~2033). Best pre-dawn.'
  },
  geminids: {
    name: 'Geminids',
    peak: 'Dec 13-14',
    rate: 120,
    parent: '3200 Phaethon (asteroid)',
    constellation: 'Gemini',
    notes: 'Best of year. Bright, colorful, medium speed. All night.'
  },
  ursids: {
    name: 'Ursids',
    peak: 'Dec 22-23',
    rate: 10,
    parent: '8P/Tuttle',
    constellation: 'Ursa Minor',
    notes: 'Circumpolar - visible all night. Occasional outbursts.'
  }
};

// ============================================================================
// PLANET VISIBILITY CALCULATOR
// ============================================================================

function getDetailedPlanetVisibility(data) {
  const { moonPhase, cloudPercent } = data;
  const planets = [];
  
  // In a real implementation, this would use ephemeris calculations
  // For now, comprehensive guidance based on typical visibility patterns
  
  const currentMonth = new Date().getMonth();
  
  // Mercury
  if (currentMonth === 2 || currentMonth === 3 || currentMonth === 8 || currentMonth === 9) {
    planets.push({
      name: 'Mercury',
      visible: true,
      when: 'Just after sunset or before sunrise (elongation period)',
      where: 'Low on horizon, West (evening) or East (morning)',
      brightness: '-0.5 to +5.0',
      telescope: 'Phase visible (like tiny moon). Low power best.',
      difficulty: 'Challenging - never far from sun',
      special: 'Only visible during greatest elongation (check exact dates)'
    });
  }
  
  // Venus
  planets.push({
    name: 'Venus',
    visible: currentMonth !== 5 && currentMonth !== 6, // approximate
    when: currentMonth < 6 ? 'Evening star (after sunset)' : 'Morning star (before sunrise)',
    where: 'Brightest object after sun/moon. Can\'t miss it.',
    brightness: '-4.9 to -3.8',
    telescope: 'Phase clearly visible. Cloud tops featureless but beautiful crescent.',
    difficulty: 'Impossible to miss',
    special: 'Can cast shadows in dark locations. Visible in daylight if you know where to look.'
  });
  
  // Mars
  planets.push({
    name: 'Mars',
    visible: true,
    when: 'Varies by opposition (every 26 months)',
    where: 'Red/orange color distinctive. Brightens dramatically near opposition.',
    brightness: '-2.9 to +1.8',
    telescope: 'Polar caps, dark markings visible near opposition. Detail requires good seeing.',
    difficulty: 'Easy to find when bright',
    special: 'Opposition every 26 months = best viewing. Dust storms can obscure surface.'
  });
  
  // Jupiter
  planets.push({
    name: 'Jupiter',
    visible: true,
    when: 'Most of year except when near conjunction with sun',
    where: 'Bright, steady, cream-colored. Follows ecliptic.',
    brightness: '-2.9 to -1.6',
    telescope: 'Cloud bands, Great Red Spot, 4 Galilean moons. Transit/shadow events.',
    difficulty: 'Easy - second brightest planet',
    special: 'Moons visible in binoculars. GRS visible with 6"+ scope in good seeing.'
  });
  
  // Saturn
  planets.push({
    name: 'Saturn',
    visible: true,
    when: 'Evening or morning depending on season',
    where: 'Golden color. Follows ecliptic near Jupiter.',
    brightness: '-0.5 to +1.2',
    telescope: 'Rings! Cassini Division, Titan moon. Multiple moons visible.',
    difficulty: 'Easy to identify',
    special: 'Ring tilt varies. Edge-on every 15 years. Currently good tilt for viewing.'
  });
  
  // Uranus
  if (cloudPercent < 40 && moonPhase !== 'Full Moon') {
    planets.push({
      name: 'Uranus',
      visible: true,
      when: 'Best when at opposition',
      where: 'Requires finder chart. Blue-green disk.',
      brightness: '+5.7 to +5.9',
      telescope: 'Tiny blue-green disk. Moons with large scope.',
      difficulty: 'Challenging - needs dark skies and knowing where to look',
      special: 'Barely naked eye in perfect conditions. Binoculars show it easily.'
    });
  }
  
  // Neptune
  if (cloudPercent < 20 && moonPhase === 'New Moon') {
    planets.push({
      name: 'Neptune',
      visible: true,
      when: 'Requires telescope and finder chart',
      where: 'Finder chart essential. Tiny blue disk.',
      brightness: '+7.8 to +8.0',
      telescope: 'Tiny blue disk. Triton moon with 12"+ scope.',
      difficulty: 'Very challenging - requires dark sky and telescope',
      special: 'Only planet discovered mathematically before visually.'
    });
  }
  
  return planets;
}

// ============================================================================
// DEEP SKY OBJECT VISIBILITY
// ============================================================================

function getDeepSkyObjectVisibility(data) {
  const { cloudPercent, moonPhase, bortleScale, season } = data;
  const objects = [];
  const moonIllumination = getMoonIllumination(moonPhase);
  
  if (cloudPercent > 40 || moonIllumination > 70) {
    return [{ category: 'Limited', objects: 'Bright clusters and double stars only. Wait for darker conditions.' }];
  }
  
  // Winter Objects (Dec-Feb)
  if (season === 'winter') {
    objects.push({
      name: 'Orion Nebula (M42)',
      type: 'Emission Nebula',
      magnitude: 4.0,
      visibility: 'Naked eye visible. Spectacular in any scope.',
      bestWith: 'Any telescope or binoculars. UHC filter enhances.',
      special: 'Trapezium cluster at center. Best in winter.'
    });
    objects.push({
      name: 'Pleiades (M45)',
      type: 'Open Cluster',
      magnitude: 1.6,
      visibility: 'Naked eye obvious. Best in binoculars (too large for most scopes).',
      bestWith: 'Binoculars or wide-field refractor.',
      special: 'Subaru in Japanese. Contains reflection nebulosity.'
    });
    objects.push({
      name: 'Andromeda Galaxy (M31)',
      type: 'Spiral Galaxy',
      magnitude: 3.4,
      visibility: 'Naked eye in dark skies. 6x larger than full moon!',
      bestWith: 'Binoculars or wide-field scope. Low power essential.',
      special: 'Closest major galaxy. Satellite galaxies M32, M110 visible nearby.'
    });
  }
  
  // Spring Objects (Mar-May)
  if (season === 'spring') {
    objects.push({
      name: 'Whirlpool Galaxy (M51)',
      type: 'Spiral Galaxy',
      magnitude: 8.4,
      visibility: 'Requires telescope. Spiral arms visible with 8"+ scope.',
      bestWith: '8"+ telescope, dark skies.',
      special: 'First galaxy where spiral structure was observed (Lord Rosse, 1845).'
    });
    objects.push({
      name: 'Leo Triplet (M65, M66, NGC 3628)',
      type: 'Galaxy Group',
      magnitude: 9.3,
      visibility: 'Three galaxies in one field. 8"+ scope recommended.',
      bestWith: 'Medium-high power, dark skies.',
      special: 'All three visible in same low-power field.'
    });
  }
  
  // Summer Objects (Jun-Aug)
  if (season === 'summer') {
    objects.push({
      name: 'Ring Nebula (M57)',
      type: 'Planetary Nebula',
      magnitude: 8.8,
      visibility: 'Smoke ring appearance. Visible in 4"+ scope.',
      bestWith: 'Medium-high power. OIII filter enhances.',
      special: 'Central star magnitude 15 - very challenging.'
    });
    objects.push({
      name: 'Hercules Cluster (M13)',
      type: 'Globular Cluster',
      magnitude: 5.8,
      visibility: 'Naked eye in dark skies. Spectacular in any scope.',
      bestWith: 'Medium power. Resolves into individual stars in 6"+ scope.',
      special: 'Over 300,000 stars. 25,000 light years away.'
    });
    objects.push({
      name: 'Lagoon Nebula (M8)',
      type: 'Emission Nebula',
      magnitude: 6.0,
      visibility: 'Naked eye in dark skies. Cluster + nebulosity.',
      bestWith: 'Any telescope or binoculars. UHC filter.',
      special: 'Contains open cluster NGC 6530.'
    });
  }
  
  // Fall Objects (Sep-Nov)
  if (season === 'fall') {
    objects.push({
      name: 'Double Cluster (NGC 869/884)',
      type: 'Open Clusters',
      magnitude: 4.3,
      visibility: 'Naked eye visible. Stunning in binoculars or wide-field scope.',
      bestWith: 'Binoculars or low-power, wide-field eyepiece.',
      special: 'Two clusters side by side. Each contains hundreds of stars.'
    });
    objects.push({
      name: 'Dumbbell Nebula (M27)',
      type: 'Planetary Nebula',
      magnitude: 7.5,
      visibility: 'Apple-core shape. Visible in 4"+ scope.',
      bestWith: 'Medium power. OIII filter reveals detail.',
      special: 'First planetary nebula discovered (Messier, 1764).'
    });
  }
  
  return objects;
}

// ============================================================================
// ASTRONOMICAL TWILIGHT CALCULATOR
// ============================================================================

function getTwilightPeriods(data) {
  const { sunset, sunrise } = data;
  if (!sunset || !sunrise) return [];
  
  const sunsetTime = new Date(sunset);
  const sunriseTime = new Date(sunrise);
  
  const periods = [];
  
  // Civil twilight (sun 0-6° below horizon)
  const civilEnd = new Date(sunsetTime.getTime() + 30 * 60000);
  const civilStart = new Date(sunriseTime.getTime() - 30 * 60000);
  
  // Nautical twilight (sun 6-12° below horizon)
  const nauticalEnd = new Date(sunsetTime.getTime() + 60 * 60000);
  const nauticalStart = new Date(sunriseTime.getTime() - 60 * 60000);
  
  // Astronomical twilight (sun 12-18° below horizon)
  const astroEnd = new Date(sunsetTime.getTime() + 90 * 60000);
  const astroStart = new Date(sunriseTime.getTime() - 90 * 60000);
  
  const format = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  
  periods.push({
    phase: 'Sunset',
    time: format(sunsetTime),
    description: 'Sun at horizon. Brightest planets/stars appear. Good for solar system.',
    darkness: 'Daylight to civil twilight'
  });
  
  periods.push({
    phase: 'Civil Twilight',
    time: `${format(sunsetTime)} - ${format(civilEnd)}`,
    description: 'Brightest stars visible. Planets clear. Terrestrial features visible.',
    darkness: 'Too bright for deep sky',
    photography: 'Landscape astrophotography possible'
  });
  
  periods.push({
    phase: 'Nautical Twilight',
    time: `${format(civilEnd)} - ${format(nauticalEnd)}`,
    description: 'Milky Way becoming visible. Most stars out. Horizon visible.',
    darkness: 'Deep sky becoming possible',
    photography: 'Milky Way photography begins'
  });
  
  periods.push({
    phase: 'Astronomical Twilight',
    time: `${format(nauticalEnd)} - ${format(astroEnd)}`,
    description: 'Sky fully dark to naked eye. Faint objects visible.',
    darkness: 'Best deep sky observing',
    photography: 'Deep sky astrophotography optimal'
  });
  
  periods.push({
    phase: 'True Night',
    time: `${format(astroEnd)} - ${format(astroStart)}`,
    description: 'DARKEST PERIOD. All astronomical objects visible. No twilight effects.',
    darkness: 'Maximum darkness for location',
    photography: 'Best for narrowband and faint object imaging'
  });
  
  return periods;
}

// ============================================================================
// DEW & EQUIPMENT MANAGEMENT
// ============================================================================

function getDewAdvice(data) {
  const { temp, humidity, dewPoint } = data;
  const advice = [];
  
  const dewSpread = temp - dewPoint;
  
  if (dewSpread <= 1) {
    advice.push("⚠️ CRITICAL DEW RISK: Temperature within 1°C of dew point.");
    advice.push("Dew will form rapidly on all exposed optics.");
    advice.push("DEW HEATERS MANDATORY for all optical surfaces.");
    advice.push("• Telrad/Rigel finder will fog first (large exposed surface)");
    advice.push("• Eyepieces will fog from body heat/breath");
    advice.push("• Corrector plate/lens will dew over in minutes");
    advice.push("Equipment: Dew heater strips + controller for main scope");
    advice.push("Equipment: Dew heater for eyepiece/finder");
    advice.push("Equipment: Dew shield extends dew-free time ~2x");
    advice.push("Portable: 12V hair dryer for emergency defogging");
    advice.push("Tactic: Keep eyepieces in pocket (body heat) when not in use");
    advice.push("Tactic: Point scope down when not observing");
  } else if (dewSpread <= 3) {
    advice.push("⚠️ MODERATE DEW RISK: Dew likely by midnight.");
    advice.push("Dew heaters recommended. Dew shield minimum.");
    advice.push("Expect to need defogging 2-3 times during session.");
  } else if (dewSpread <= 5) {
    advice.push("Low dew risk. Dew shield should suffice.");
    advice.push("May see some dew after 2-3 hours observing.");
  } else {
    advice.push("Minimal dew risk tonight. Optics should stay clear.");
  }
  
  if (humidity > 80) {
    advice.push("High humidity: paper star charts will become damp. Use laminated charts or tablet.");
    advice.push("Electronics: consider silica gel packets in accessory case.");
  }
  
  return advice;
}

// ============================================================================
// EQUIPMENT RECOMMENDATIONS
// ============================================================================

function getEquipmentRecommendations(data) {
  const { cloudPercent, moonPhase, seeing, transparency, bortleScale, temp } = data;
  const recommendations = [];
  const moonIllumination = getMoonIllumination(moonPhase);
  
  // Telescope type recommendations
  if (cloudPercent < 20 && seeing < 3 && bortleScale < 4) {
    recommendations.push("PRIME CONDITIONS: Any telescope will perform well tonight.");
    recommendations.push("• Large Dobsonian (12"+): Galaxies, nebulae, globulars");
    recommendations.push("• APO Refractor (4-6"): Wide field, planetary, astrophotography");
    recommendations.push("• SCT/Maksutov (8-14"): Planetary detail, double stars");
  }
  
  // Moon-specific
  if (moonIllumination > 60) {
    recommendations.push("Bright moon: Focus on lunar, planetary, double stars.");
    recommendations.push("• Moon filter essential (reduces glare, increases contrast)");
    recommendations.push("• High magnification for lunar detail (craters, rilles, mountains)");
    recommendations.push("• Color filters for planetary detail enhancement");
    recommendations.push("• Skip deep sky - moonlight will wash out faint objects");
  } else if (moonIllumination < 20) {
    recommendations.push("Dark sky window: Deep sky objects will be at their best.");
    recommendations.push("• UHC/OIII filters for emission nebulae");
    recommendations.push("• Lowest power widest field eyepiece for Milky Way sweeping");
    recommendations.push("• Consider dark adaptation (no white light for 30+ minutes)");
  }
  
  // Seeing-specific
  if (seeing <= 2) {
    recommendations.push("Excellent seeing: Crank up the magnification!");
    recommendations.push("• Planetary eyepieces (200-300x depending on aperture)");
    recommendations.push("• Try for difficult double star splits");
    recommendations.push("• Lucky imaging technique for planetary photography");
  } else if (seeing >= 5) {
    recommendations.push("Poor seeing: Lower your expectations on magnification.");
    recommendations.push("• Limit magnification to 150x or less");
    recommendations.push("• Focus on wide-field, low-power observing");
    recommendations.push("• Binocular observing may be more rewarding than telescope");
  }
  
  // Temperature acclimation
  if (Math.abs(temp - 20) > 15) {
    recommendations.push(`Temperature ${temp}°C: Allow telescope to acclimate.`);
    if (temp < 5) {
      recommendations.push("• Cold: Allow 60-90 minutes for optics to reach thermal equilibrium");
      recommendations.push("• Cold: Battery life reduced - bring spares for dew heaters/mount");
      recommendations.push("• Cold: Lubricants stiffen - mounts may be sluggish");
    } else if (temp > 30) {
      recommendations.push("• Hot: Tube currents will degrade images until scope cools to ambient");
      recommendations.push("• Hot: Allow 45-60 minutes cooldown (fans help)");
    }
  }
  
  // Bortle scale
  if (bortleScale >= 7) {
    recommendations.push("Light polluted skies: Work with what you can see.");
    recommendations.push("• Moon, planets, double stars are your best targets");
    recommendations.push("• Light pollution reduction (LPR) filter helps slightly");
    recommendations.push("• Consider Electronically Assisted Astronomy (EAA)");
    recommendations.push("• Live stacking with camera can reveal objects invisible visually");
  }
  
  return recommendations;
}

// ============================================================================
// ASTROPHOTOGRAPHY CONDITIONS
// ============================================================================

function getAstrophotographyAdvice(data) {
  const { cloudPercent, seeing, transparency, moonPhase, wind, humidity } = data;
  const advice = [];
  const moonIllumination = getMoonIllumination(moonPhase);
  
  if (cloudPercent > 20) {
    advice.push("Clouds: Astrophotography requires clear skies. Wait for better conditions.");
    advice.push(`${cloudPercent}% cloud cover will ruin long exposures.`);
  }
  
  if (seeing > 3) {
    advice.push("Poor seeing: Not suitable for high-resolution planetary/lunar imaging.");
    advice.push("Consider wide-field shots instead of high-magnification work.");
  }
  
  if (transparency < 5) {
    advice.push("Poor transparency: Faint objects will be significantly dimmed.");
    advice.push("Expect to need 30-50% longer exposures for same signal.");
  }
  
  if (wind > 15) {
    advice.push(`Wind ${wind}km/h: Telescope shake will blur images.`);
    advice.push("• Wind protection/shelter needed for long exposures");
    advice.push("• Autoguiding may struggle to correct");
    advice.push("• Consider shorter exposures and stack more frames");
  }
  
  if (moonIllumination > 50) {
    advice.push("Moonlight: Broadband imaging will be compromised.");
    advice.push("• Narrowband imaging (Ha, OIII, SII) still possible");
    advice.push("• Lunar/planetary imaging ideal");
    advice.push("• Wait for moon to set before imaging faint targets");
  } else if (moonIllumination < 10) {
    advice.push("PERFECT: Dark skies for broadband deep sky imaging.");
    advice.push("• RGB, LRGB, or OSC imaging will work well");
    advice.push("• Shoot your faintest targets tonight");
  }
  
  if (humidity > 80) {
    advice.push("High humidity: Dew will form on lens/corrector plate.");
    advice.push("• Dew heaters absolutely essential");
    advice.push("• Camera sensor may fog if not sealed");
    advice.push("• Flat frames may show changing dust patterns");
  }
  
  return advice;
}

// ============================================================================
// MAIN STARGAZING ADVICE FUNCTION
// ============================================================================

export const getStargazingAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    conditionCode, cloudCover, condition, humidity, visibility, 
    sunset, sunrise, city, temp, wind, dewPoint, pressure,
    tempMin, tempMax, lat, lon
  } = data;
  
  const moonPhase = getMoonPhase();
  const moonIllumination = getMoonIllumination(moonPhase);
  const moonRiseSet = getMoonRiseSet(data);
  const cloudPercent = getCloudCover(conditionCode);
  const seeing = getSeeingConditions(data);
  const transparency = getTransparency(data);
  const bortleScale = getDarkSkyRating(city);
  const bortle = BORTLE_SCALE[bortleScale] || BORTLE_SCALE[5];
  const planetVis = getDetailedPlanetVisibility(data);
  const milkyWayVis = getMilkyWayVisibility(data);
  const isssPasses = getISSFlyoverTimes(data);
  const auroraForecast = getAuroraForecast(data);
  const twilightPeriods = getTwilightPeriods(data);
  const meteorShowers = getMeteorShowerCalendar(new Date());
  const deepSkyObjects = getDeepSkyObjectVisibility({...data, moonPhase, bortleScale});
  const dewAdvice = getDewAdvice(data);
  const equipmentRecs = getEquipmentRecommendations(data);
  const photoAdvice = getAstrophotographyAdvice(data);
  const nightDuration = sunrise && sunset ? 
    ((new Date(sunrise) - new Date(sunset)) / 3600000).toFixed(1) + ' hours' : 
    'N/A';
  
  const pickeringRating = PICKERING_SCALE[seeing] || PICKERING_SCALE[5];
  
  let verdict = [];
  let viewing = [];
  let timing = [];
  let warnings = [];
  let objects = [];
  let equipment = [];
  let comfort = [];

  // ========================================================================
  // CATASTROPHIC CONDITIONS
  // ========================================================================
  
  if (condition === 'rain' || condition === 'thunderstorm' || condition === 'snow') {
    verdict.push("❌ ASTRONOMY CANCELLED: Active precipitation. No observing possible.");
    warnings.push("Telescopes and electronics + water = expensive disaster.");
    warnings.push("Check forecast for tomorrow night.");
    // Still provide educational content
    viewing.push("Tonight's astronomy: Read about the objects you'll observe tomorrow.");
    viewing.push("Great night for: collimation practice, equipment maintenance, astrophotography processing.");
  }
  
  if (cloudPercent >= 95) {
    verdict.push("❌ COMPLETELY OVERCAST: 95%+ cloud cover. Nothing visible.");
    warnings.push("Don't waste time setting up. Check satellite imagery for breaks.");
  }

  // ========================================================================
  // MAIN VIEWING CONDITIONS
  // ========================================================================
  
  if (!verdict.length) {
    if (cloudPercent >= 80) {
      verdict.push("🔴 MOSTLY CLOUDY: Only brief sucker holes possible.");
      viewing.push("Bright planets and moon might peek through occasionally.");
      viewing.push("Not worth setting up telescope. Binoculars ready for quick looks.");
    } else if (cloudPercent >= 60) {
      verdict.push("🟠 PARTLY CLOUDY: Frustrating but possible with patience.");
      viewing.push("Gaps in clouds will come and go. Have targets ready.");
      viewing.push("Best strategy: observe bright objects that can be found quickly.");
    } else if (cloudPercent >= 30) {
      verdict.push("🟡 MOSTLY CLEAR: Good conditions with some cloud interference.");
      viewing.push("Stars visible in most directions. Some clouds passing.");
      viewing.push("Worth setting up. Plan targets away from cloud paths.");
    } else if (cloudPercent >= 10) {
      verdict.push("🟢 CLEAR SKIES: Excellent conditions for astronomy.");
      viewing.push("Minimal cloud interference. Most of sky accessible.");
      viewing.push("Telescope time! Deep sky objects will be visible.");
    } else {
      verdict.push("⭐ PERFECTLY CLEAR: Crystal clear skies. Rare conditions.");
      viewing.push("Transparency likely excellent. Every astronomical target available.");
      viewing.push("CANCEL YOUR PLANS. These nights are precious.");
    }
  }

  // ========================================================================
  // MOON ANALYSIS
  // ========================================================================
  
  if (moonIllumination > 90) {
    warnings.push(`🌕 ${moonPhase}: ${moonIllumination}% illuminated. Sky brightly lit.`);
    warnings.push("Deep sky observing severely compromised. Only brightest DSOs visible.");
    viewing.push("EXCELLENT for: Lunar observation (craters along terminator are spectacular).");
    viewing.push("EXCELLENT for: Planetary observation (moonlight doesn't affect planets much).");
    viewing.push("POOR for: Galaxies, nebulae, faint star clusters, Milky Way.");
    viewing.push("POOR for: Meteor watching (moonlight washes out all but fireballs).");
    objects.push("Lunar features: Crater rays, rilles, domes, Alpine Valley all visible.");
    objects.push("Planetary: All visible planets unaffected by moonlight.");
    if (moonRiseSet && moonRiseSet.rise) {
      timing.push(`Moon visible all night. No dark sky window.`);
    }
  } else if (moonIllumination > 60) {
    warnings.push(`🌔 ${moonPhase}: ${moonIllumination}% illuminated. Significant sky brightness.`);
    viewing.push("Good for: Moon, planets, bright star clusters, double stars.");
    viewing.push("Fair for: Brighter nebulae with filters, globular clusters.");
    viewing.push("Poor for: Faint galaxies, dim nebulae, Milky Way photography.");
    if (moonRiseSet && moonRiseSet.set) {
      timing.push(`Moon sets at ${moonRiseSet.set}. Dark window after moonset.`);
      timing.push(`Best deep sky: after ${moonRiseSet.set} when moon is gone.`);
    }
  } else if (moonIllumination > 30) {
    viewing.push(`🌓 ${moonPhase}: Moderate moonlight. Good compromise conditions.`);
    viewing.push("Observe moon first, then deep sky after moonset.");
    objects.push("Lunar terminator: Best detail at first/last quarter. Shadows reveal topography.");
    if (moonRiseSet && moonRiseSet.set) {
      timing.push(`Moon sets at ${moonRiseSet.set}. Deep sky window opens after.`);
    }
  } else if (moonIllumination > 5) {
    viewing.push(`🌒 ${moonPhase}: Thin crescent. Dark sky dominant.`);
    viewing.push("EXCELLENT for: Deep sky objects, Milky Way, faint galaxies.");
    viewing.push("Crescent moon is beautiful in binoculars - earthshine visible.");
    objects.push("Earthshine on dark limb of moon: sunlight reflected from Earth illuminates moon.");
    if (moonRiseSet && moonRiseSet.rise) {
      timing.push(`Thin crescent visible briefly after sunset. Sets early.`);
    }
  } else {
    viewing.push(`🌑 ${moonPhase}: DARKEST SKIES POSSIBLE. This is what astronomers wait for.`);
    viewing.push("PERFECT for: Everything. Galaxies, nebulae, Milky Way, faint objects.");
    viewing.push("PERFECT for: Astrophotography, meteor watching, comet hunting.");
    viewing.push("If you skip tonight, you'll regret it until next new moon.");
    warnings.push("No moonlight means you NEED red flashlight. White light destroys night vision.");
  }

  // ========================================================================
  // SEEING CONDITIONS
  // ========================================================================
  
  viewing.push(`🔭 SEEING: ${pickeringRating.description} (Pickering ${seeing}/10)`);
  viewing.push(`Magnification limit: ${pickeringRating.magnification}`);
  
  if (seeing <= 2) {
    viewing.push("EXCELLENT seeing: Stars will be pinpoints. Planetary detail at its best.");
    viewing.push("Crank up the power! Tonight is for high magnification.");
    viewing.push("Perfect for: planetary imaging, double star resolution, lunar detail.");
  } else if (seeing <= 3) {
    viewing.push("Good seeing: High power usable. Detail visible on planets.");
    viewing.push("Worth setting up for planetary/lunar observation.");
  } else if (seeing <= 5) {
    viewing.push("Average seeing: Medium power best. Some detail visible.");
    viewing.push("Deep sky objects will be fine. Planetary detail limited.");
  } else {
    viewing.push("Poor seeing: Stars will twinkle violently. Low power only.");
    viewing.push("Not worth high magnification. Stick to wide-field observing.");
    warnings.push("Poor seeing will make planets look like boiling blobs. Don't blame your scope.");
  }

  // ========================================================================
  // TRANSPARENCY
  // ========================================================================
  
  if (transparency >= 8) {
    viewing.push("✨ EXCELLENT transparency: Faint objects at their best.");
    viewing.push("Milky Way will be striking. Galaxies show detail.");
  } else if (transparency >= 6) {
    viewing.push("Good transparency: Most objects visible. Faint ones accessible.");
  } else if (transparency >= 4) {
    viewing.push("Average transparency: Brighter objects fine. Faint objects dimmed.");
    warnings.push("Haze/humidity dimming faint objects. Expect 0.5-1 magnitude loss.");
  } else {
    viewing.push("Poor transparency: Only brightest objects visible.");
    warnings.push("Significant dimming of all objects. Deep sky work impossible.");
  }

  // ========================================================================
  // LIGHT POLLUTION
  // ========================================================================
  
  viewing.push(`🏙️ SKY DARKNESS: Bortle ${bortleScale} - ${bortle.name}`);
  viewing.push(`${bortle.description}`);
  viewing.push(`Naked eye limiting magnitude: ~${bortle.limiting}`);
  
  if (bortleScale >= 7) {
    warnings.push("SEVERE light pollution. Only moon, planets, and brightest stars visible.");
    viewing.push("Focus on: Moon, planets, double stars, bright open clusters.");
    viewing.push("Filters (UHC, OIII) help somewhat with nebulae.");
    viewing.push("Drive to darker skies for Milky Way/galaxies. It's worth the trip.");
  } else if (bortleScale >= 5) {
    viewing.push("Moderate light pollution. Milky Way visible but washed out.");
    viewing.push("Brighter deep sky objects accessible. Faint galaxies challenging.");
  } else if (bortleScale <= 3) {
    viewing.push("DARK SKIES: Consider yourself lucky. Most amateur astronomers dream of this.");
    viewing.push("Milky Way casts shadows. Countless stars visible to naked eye.");
    viewing.push("Galaxies, nebulae, clusters - all accessible. Take advantage!");
  }

  // ========================================================================
  // PLANET VISIBILITY
  // ========================================================================
  
  if (planetVis.length > 0) {
    objects.push("🪐 PLANETS VISIBLE TONIGHT:");
    planetVis.forEach(planet => {
      if (planet.visible) {
        objects.push(`${planet.name}: ${planet.where}`);
        objects.push(`  Brightness: ${planet.brightness} | Best: ${planet.telescope}`);
        if (planet.special) objects.push(`  💡 ${planet.special}`);
      }
    });
  }

  // ========================================================================
  // DEEP SKY OBJECTS
  // ========================================================================
  
  if (deepSkyObjects.length > 0 && cloudPercent < 50 && moonIllumination < 60) {
    objects.push("🌌 DEEP SKY OBJECTS VISIBLE:");
    deepSkyObjects.forEach(obj => {
      if (obj.name) {
        objects.push(`${obj.name} (${obj.type})`);
        objects.push(`  Magnitude ${obj.magnitude} | ${obj.visibility}`);
        objects.push(`  Best with: ${obj.bestWith}`);
        if (obj.special) objects.push(`  💡 ${obj.special}`);
      } else {
        objects.push(obj.objects || obj.category);
      }
    });
  }

  // ========================================================================
  // SPECIAL EVENTS
  // ========================================================================
  
  if (meteorShowers && meteorShowers.active) {
    objects.push("💫 ACTIVE METEOR SHOWER:");
    objects.push(`${meteorShowers.name}: Peak ${meteorShowers.peak}, Rate ${meteorShowers.rate}/hr`);
    objects.push(`Radiant: ${meteorShowers.constellation} | ${meteorShowers.notes}`);
    if (moonIllumination > 50) {
      warnings.push("Moonlight will reduce visible meteors by 50-70%.");
    }
  }
  
  if (isssPasses && isssPasses.length > 0) {
    objects.push("🛰️ ISS FLYOVERS TONIGHT:");
    isssPasses.forEach(pass => {
      objects.push(`${pass.time} - ${pass.direction} - Magnitude ${pass.magnitude}`);
    });
  }
  
  if (auroraForecast && auroraForecast.kp >= 5) {
    objects.push(`🌌 AURORA FORECAST: Kp ${auroraForecast.kp} - Possible aurora activity!`);
    if (auroraForecast.kp >= 7) {
      viewing.push("STRONG AURORA POSSIBLE: Even at mid-latitudes. Look north!");
    }
  }

  // ========================================================================
  // TWILIGHT & TIMING
  // ========================================================================
  
  if (twilightPeriods.length > 0) {
    timing.push("🌅 TWILIGHT SCHEDULE:");
    twilightPeriods.forEach(period => {
      timing.push(`${period.phase}: ${period.time}`);
      timing.push(`  ${period.description}`);
      if (period.photography) timing.push(`  📸 ${period.photography}`);
    });
  }
  
  if (moonRiseSet) {
    if (moonRiseSet.rise) timing.push(`🌙 Moon rises: ${moonRiseSet.rise}`);
    if (moonRiseSet.set) timing.push(`🌙 Moon sets: ${moonRiseSet.set}`);
  }
  
  timing.push(`⏱️ Total darkness window: ${nightDuration}`);

  // ========================================================================
  // EQUIPMENT & COMFORT
  // ========================================================================
  
  equipment = equipmentRecs;
  
  if (dewAdvice.length > 0) {
    equipment.push("💧 DEW MANAGEMENT:");
    dewAdvice.forEach(d => equipment.push(d));
  }
  
  // Comfort advice
  if (temp < 5) {
    comfort.push(`Cold ${temp}°C: Dress in layers. Standing still gets cold fast.`);
    comfort.push("Insulated boots, hand warmers, warm hat essential.");
    comfort.push("Hot beverage in thermos. Blanket for chair.");
    comfort.push("Battery life reduced: bring spares for everything.");
  } else if (temp < 15) {
    comfort.push(`Cool ${temp}°C: Jacket and warm shoes recommended.`);
    comfort.push("You'll be stationary - dress warmer than daytime.");
  } else if (temp > 25) {
    comfort.push(`Warm ${temp}°C: Insect repellent if near water/woods.`);
    comfort.push("Mosquitoes most active at dusk. Prepare accordingly.");
  }
  
  // ========================================================================
  // ASTROPHOTOGRAPHY
  // ========================================================================
  
  if (photoAdvice.length > 0 && !verdict[0].includes('CANCELLED')) {
    equipment.push("📸 ASTROPHOTOGRAPHY CONDITIONS:");
    photoAdvice.forEach(p => equipment.push(p));
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🔭 Sky report:",
    "⭐ Stargazing forecast:",
    "🌠 Night sky conditions:",
    "🌟 Astronomy check:",
    "🌌 Zephye's sky advisory:",
    "🔭 Observatory report:",
    "🌙 Celestial conditions:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Overall Verdict
  response += `📋 OVERALL: ${verdict.join(' ')}\n\n`;
  
  // Sky Quality Summary
  response += `🌌 SKY QUALITY:\n`;
  response += `• Cloud Cover: ${cloudPercent}%\n`;
  response += `• Seeing (Pickering): ${seeing}/10 - ${pickeringRating.description}\n`;
  response += `• Transparency: ${transparency}/10\n`;
  response += `• Bortle Class: ${bortleScale} - ${bortle.name}\n`;
  response += `• Limiting Magnitude: ~${bortle.limiting}\n\n`;
  
  // Moon
  response += `🌙 MOON:\n`;
  response += `• Phase: ${moonPhase} (${moonIllumination}% illuminated)\n`;
  if (moonRiseSet) {
    if (moonRiseSet.rise) response += `• Rises: ${moonRiseSet.rise}\n`;
    if (moonRiseSet.set) response += `• Sets: ${moonRiseSet.set}\n`;
  }
  response += '\n';
  
  // Viewing Conditions
  if (viewing.length > 0) {
    viewing.forEach(v => response += `${v}\n`);
    response += '\n';
  }
  
  // Objects to Observe
  if (objects.length > 0) {
    response += `🎯 OBSERVING TARGETS:\n`;
    objects.forEach(o => response += `${o}\n`);
    response += '\n';
  }
  
  // Timing
  if (timing.length > 0) {
    response += `⏰ TIMING:\n`;
    timing.forEach(t => response += `${t}\n`);
    response += '\n';
  }
  
  // Equipment
  if (equipment.length > 0 && !verdict[0].includes('CANCELLED')) {
    response += `🔧 EQUIPMENT:\n`;
    equipment.forEach(e => response += `${e}\n`);
    response += '\n';
  }
  
  // Comfort
  if (comfort.length > 0) {
    response += `🧥 OBSERVER COMFORT:\n`;
    comfort.forEach(c => response += `${c}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Weather Summary
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temperature: ${temp}°C (${tempMin}°C to ${tempMax}°C)\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• Visibility: ${visibility}km\n`;
  if (dewPoint) response += `• Dew Point: ${dewPoint}°C (Spread: ${(temp - dewPoint).toFixed(1)}°C)\n`;
  response += '\n';
  
  // Final Verdict
  response += `💡 BOTTOM LINE:\n`;
  if (cloudPercent > 80) {
    response += `Keep telescope inside tonight. Use time for astronomy reading/planning.\n`;
  } else if (cloudPercent > 40) {
    response += `Risky conditions. Quick setup for bright objects only.\n`;
    response += `Have a target list ready and be prepared to pack up quickly.\n`;
  } else if (seeing <= 3 && transparency >= 6 && moonIllumination < 30) {
    response += `EXCEPTIONAL CONDITIONS. Drop everything and get outside.\n`;
    response += `These nights are rare. Every astronomer will be out tonight.\n`;
  } else if (moonIllumination > 80) {
    response += `Good night for lunar and planetary. Skip the faint stuff.\n`;
    response += `Moon is a fascinating target. Explore craters, rilles, and mountains.\n`;
  } else {
    response += `Worth setting up. Good astronomy conditions await.\n`;
  }
  
  // Astronomer wisdom
  const wisdom = [
    "The universe is under no obligation to make sense to you. - Neil deGrasse Tyson",
    "Somewhere, something incredible is waiting to be known. - Carl Sagan",
    "The nitrogen in our DNA, the calcium in our teeth, the iron in our blood... was made in the interiors of collapsing stars. We are made of starstuff. - Carl Sagan",
    "Astronomy compels the soul to look upwards and leads us from this world to another. - Plato",
    "Keep looking up... that's the secret of life. - Snoopy",
    "The clearest way into the Universe is through a forest wilderness. - John Muir",
    "Do not look at stars as bright spots only. Try to take in the vastness of the universe. - Maria Mitchell",
    "Every star may be a sun to someone. - Carl Sagan"
  ];
  response += `\n🌟 ${random(wisdom)}`;

  return response;
};

// ============================================================================
// EXPORT ADDITIONAL FUNCTIONS
// ============================================================================

export const getMeteorShowerInfo = getMeteorShowerCalendar;
export const getPlanetVisibilityDetailed = getDetailedPlanetVisibility;
export const getDeepSkyObjects = getDeepSkyObjectVisibility;
export const getAstrophotographyConditions = getAstrophotographyAdvice;
export const getDewManagement = getDewAdvice;

export default getStargazingAdvice;
