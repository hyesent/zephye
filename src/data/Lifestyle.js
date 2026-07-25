import { 
  calcHeatIndex, 
  calcWindChill, 
  getComfortScore, 
  getPavementTemp, 
  getBurnTime,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  getDayLength,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  getMoonPhase,
  getPressureTrend,
  getPollenIndex,
  getVisibilityCategory,
  calculateWetBulbGlobeTemp
} from './calculations';

// ============================================================================
// COMPREHENSIVE LIFESTYLE & OUTDOOR ACTIVITY ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  "Can I go jogging today?",
  "Is it good weather for a walk?",
  "Should I work out outside?",
  "Can I go to the park?",
  "Is it safe to run right now?",
  "Best time to exercise today?",
  "Can I walk my dog?",
  "Should I do outdoor yoga?",
  "Is it good cycling weather?",
  "Can I have a picnic today?",
  "Should I eat lunch outside?",
  "Is it good for reading in the park?",
  "Can I work from the garden?",
  "Should I hang laundry outside?",
  "Is it good for a bonfire tonight?",
  "Can I have a campfire?",
  "Is it safe to use the grill?",
  "Should I open my windows?",
  "Is it good weather for gardening?",
  "Can I mow the lawn?",
  "Should I water my plants today?",
  "Is it good for a nature walk?",
  "Can I go fishing today?",
  "Should I take the boat out?",
  "Is it good for kayaking?",
  "Can I go paddleboarding?",
  "Is the weather good for golf?",
  "Should I play tennis outside?",
  "Can I shoot hoops?",
  "Is it good for skateboarding?",
  "Should I go rollerblading?",
  "Can I take my kids to the playground?",
  "Is the playground safe in this heat?",
  "Should I go to the outdoor pool?",
  "Is it good for sunbathing?",
  "Can I have a water balloon fight?",
  "Should I wash my car?",
  "Will my car dry without spots?",
  "Is it good for a motorcycle ride?",
  "Should I take the convertible out?",
  "Can I fly a kite today?",
  "Is it good for drone flying?",
  "Should I go bird watching?",
  "Is it good for photography walk?",
  "Can I go mushroom foraging?",
  "Should I pick berries today?",
  "Is it good for a farmers market?",
  "Should I go to the flea market?",
  "Can I shop outdoor mall?",
  "Is it good for outdoor dining?",
  "Should I make dinner on the grill?",
  "Can I eat on the patio?",
  "Is it good for morning coffee outside?",
  "Should I meditate in the garden?",
  "Can I do tai chi in the park?",
  "Is it good for a breathing walk?",
  "Should I take a mental health walk?",
  "Is it good weather for journaling outside?",
  "Can I paint en plein air?",
  "Should I practice music outside?",
  "Is it good for outdoor movie night?",
  "Can I stargaze from my backyard?",
  "Should I sleep with windows open?",
  "Is it good for a sunrise walk?",
  "Should I watch the sunset?",
  "Can I have a romantic evening walk?",
  "Is it good for a first date outdoors?",
  "Should I propose outside today?",
  "Can I have friends over for a cookout?",
  "Is it good for a block party?",
  "Should I go to the outdoor concert?",
  "Can I tailgate before the game?",
  "Is it good for a charity walk?",
  "Should I do my workout outside?",
  "Can I take a fitness class in the park?",
  "Is it good for boot camp?",
  "Should I run stairs outside?",
  "Can I do hill sprints?",
  "Is the track too hot?",
  "Should I swim laps outside?",
  "Is it good for aqua jogging?",
  "Can I do CrossFit outside?",
  "Should I use the outdoor gym equipment?",
  "Is the playground equipment too hot?",
  "Can I take baby for a stroller walk?",
  "Should I babywear outside?",
  "Is it safe for my toddler to play outside?",
  "Can elderly parent sit in the garden?",
  "Should I visit the outdoor market with mobility issues?",
  "Is it safe for my asthma to exercise outside?",
  "Should I wear a mask outdoors?",
  "Is it too polluted to eat outside?"
];

// ============================================================================
// ACTIVITY DATABASE
// ============================================================================

const ACTIVITIES = {
  running: {
    category: 'exercise',
    intensity: 'high',
    idealConditions: {
      temp: [8, 18],           // Optimal running temperature
      wind: [0, 15],           // Headwind penalty > 15 km/h
      humidity: [30, 70],
      uvIndex: [0, 5],
      aqi: [0, 50],
      precipitation: [0, 0],   // No rain
      pavementTemp: [0, 40]    // Safe for feet/shoes
    },
    tips: [
      'Dress for 10°C warmer than actual (you\'ll heat up)',
      'Moisture-wicking fabrics. NO cotton (chafes when wet)',
      'Headwind: run out against wind, return with wind at back',
      'Hydrate: 500ml 2 hours before, 200ml every 20 min during'
    ],
    warnings: [
      { condition: 'temp > 30', risk: 'Heat exhaustion possible. Run early morning only.' },
      { condition: 'temp < -5', risk: 'Cold air can trigger exercise-induced asthma. Scarf over mouth.' },
      { condition: 'aqi > 100', risk: 'Lung damage from pollution. Skip or run indoors.' },
      { condition: 'lightning', risk: 'IMMEDIATE DANGER. Seek shelter.' },
      { condition: 'ice', risk: 'Slip risk. Yaktrax or treadmill day.' }
    ]
  },
  walking: {
    category: 'exercise',
    intensity: 'low_moderate',
    idealConditions: {
      temp: [5, 25],
      wind: [0, 25],
      humidity: [20, 80],
      uvIndex: [0, 6],
      aqi: [0, 100],
      precipitation: [0, 2]    // Light rain OK
    },
    tips: [
      'Brisk walking: 30 minutes = 150 calories, improves mood 40%',
      'Nordic walking poles: 40% more calories, less joint impact',
      'Audio book or podcast: walk longer without realizing',
      'Post-meal walk: 15 minutes improves digestion and blood sugar'
    ],
    warnings: [
      { condition: 'temp > 32', risk: 'Shorten walk to 15 min. Bring water. Seek shade.' },
      { condition: 'temp < -10', risk: 'Frostbite risk on exposed skin. Short walk only.' },
      { condition: 'ice', risk: 'Walking on ice: penguin walk (small steps, flat feet). Yaktrax recommended.' }
    ]
  },
  cycling: {
    category: 'exercise',
    intensity: 'high',
    idealConditions: {
      temp: [10, 25],
      wind: [0, 20],
      humidity: [30, 70],
      uvIndex: [0, 6],
      aqi: [0, 50],
      precipitation: [0, 0]
    },
    tips: [
      'Wind chill at 30 km/h = feels 5-8°C colder. Dress accordingly.',
      'Headwind: equivalent to riding up 2-3% grade continuously',
      'Tailwind: PR day! Enjoy it.',
      'Crosswind > 25 km/h: dangerous, especially with deep rim wheels',
      'Hydrate: 1 bottle per hour in heat. Electrolytes if > 2 hours.'
    ],
    warnings: [
      { condition: 'wind > 35', risk: 'Dangerous crosswinds. Can blow you into traffic.' },
      { condition: 'rain', risk: 'Braking distance doubles. Metal surfaces = ice.' },
      { condition: 'temp > 32', risk: 'Heat exhaustion. Ride early. Double water.' },
      { condition: 'aqi > 100', risk: 'Breathing rate x3 normal = 3x pollution intake. N95 or skip.' }
    ]
  },
  dog_walking: {
    category: 'pet',
    intensity: 'low',
    idealConditions: {
      temp: [5, 25],
      wind: [0, 25],
      humidity: [20, 80],
      uvIndex: [0, 7],
      pavementTemp: [0, 40]    // CRITICAL for paws
    },
    tips: [
      '7-second rule: back of hand on pavement. Too hot for you = too hot for paws',
      'Hot pavement can burn paw pads in 60 seconds at 50°C',
      'Short-nosed breeds (bulldogs, pugs): overheat faster. Limit to 10 min > 25°C',
      'Cold: dog booties protect from ice, salt, chemical de-icers',
      'Dark-coated dogs: absorb more heat. Walk in shade.',
      'Always bring water and collapsible bowl'
    ],
    warnings: [
      { condition: 'pavementTemp > 45', risk: 'PAWS WILL BURN. Walk on grass only or wait for evening.' },
      { condition: 'temp > 30', risk: 'Dogs overheat faster than humans. 10 min max. Watch for excessive panting.' },
      { condition: 'temp < -10', risk: 'Frostbite on paws/nose. Booties + short walk.' },
      { condition: 'thunderstorm', risk: 'Dogs terrified. May bolt. Keep leashed, stay inside.' }
    ]
  },
  playground: {
    category: 'family',
    intensity: 'variable',
    idealConditions: {
      temp: [15, 28],
      wind: [0, 20],
      humidity: [20, 70],
      uvIndex: [0, 6],
      aqi: [0, 50]
    },
    tips: [
      'Check equipment temperature: dark plastic slides can reach 70°C+',
      'Metal equipment in sun: burn hazard. Touch test before kids play.',
      'Rubber playground surface: hottest surface. Can reach 80°C.',
      'Sand: cooler than rubber but check for sharp objects',
      'Water bottle for each child. Sunscreen reapplied every 2 hours.',
      'Shade breaks: kids lose track of time. Enforce shade rest every 30 min.'
    ],
    warnings: [
      { condition: 'temp > 32', risk: 'Equipment too hot. Playground unsafe. Splash pad instead.' },
      { condition: 'temp < 0', risk: 'Ice on equipment. Slip hazard. Frozen ground = hard falls.' },
      { condition: 'uvIndex > 7', risk: 'Children\'s skin burns faster. Shade + SPF 50+ mandatory.' },
      { condition: 'wind > 30', risk: 'Flying debris. Swings become dangerous. Leave.' }
    ]
  },
  gardening: {
    category: 'home',
    intensity: 'moderate',
    idealConditions: {
      temp: [15, 25],
      wind: [0, 15],
      humidity: [30, 70],
      uvIndex: [0, 5],
      precipitation: [0, 1]
    },
    tips: [
      'Morning: best for watering (less evaporation)',
      'Evening: best for planting/transplanting (less transplant shock)',
      'After rain: soil easy to work, weeds pull easier',
      'Mulch after rain: locks in moisture',
      'Wear: hat, sunscreen, knee pad, gardening gloves',
      'Listen to podcast/audiobook = 2 hours feels like 30 minutes'
    ],
    warnings: [
      { condition: 'temp > 30', risk: 'Garden early morning only. Heat stroke risk while bent over.' },
      { condition: 'thunderstorm', risk: 'Metal tools = lightning risk. Go inside.' },
      { condition: 'wind > 25', risk: 'Soil dries fast. Spray from herbicides drifts.' },
      { condition: 'uvIndex > 7', risk: 'Back of neck, ears, shoulders burn while gardening. Cover up.' }
    ]
  },
  outdoor_dining: {
    category: 'social',
    intensity: 'sedentary',
    idealConditions: {
      temp: [18, 28],
      wind: [0, 15],
      humidity: [20, 70],
      uvIndex: [0, 5],
      precipitation: [0, 0]
    },
    tips: [
      'No wind: citronella candles work. Windy: they don\'t.',
      'Sunny + 22°C with light breeze = perfect patio weather',
      'Shade: umbrella position matters as sun moves',
      'Evening: bring layer. Temperature drops 5-10°C after sunset.',
      'Wine: white/rosé in ice bucket. Red in shade (sun cooks it).'
    ],
    warnings: [
      { condition: 'temp > 32', risk: 'Food spoils fast. Cold food on ice. Hot food in chafing dishes.' },
      { condition: 'temp < 12', risk: 'Uncomfortable without heaters. Food cools instantly.' },
      { condition: 'wind > 20', risk: 'Napkins, menus, light plates = projectiles. Weight everything.' },
      { condition: 'rain', risk: 'Sudden scramble inside. Have a plan.' }
    ]
  },
  meditation_yoga_outdoor: {
    category: 'wellness',
    intensity: 'low',
    idealConditions: {
      temp: [18, 28],
      wind: [0, 10],
      humidity: [30, 60],
      uvIndex: [0, 4],
      precipitation: [0, 0],
      noise: 'low'
    },
    tips: [
      'Morning: air freshest, birds singing, less wind = perfect',
      'Shade: dappled light under tree = ideal (not full sun or full shade)',
      'Ground: dry grass or yoga mat. Check for dampness.',
      'Sound: wind chimes, water feature, or nature sounds app',
      'Shoes off: grounding/earthing. Direct skin contact with earth.',
      'Insect repellent: natural (citronella, eucalyptus) before practice'
    ],
    warnings: [
      { condition: 'temp > 30', risk: 'Hot yoga already hot enough. Practice inside with AC.' },
      { condition: 'temp < 10', risk: 'Muscles tighten in cold. Injury risk. Indoor practice.' },
      { condition: 'wind > 15', risk: 'Wind noise disrupts meditation. Tree pose becomes falling pose.' },
      { condition: 'aqi > 100', risk: 'Deep breathing + pollution = bad combo. Practice indoors.' }
    ]
  },
  photography_walk: {
    category: 'creative',
    intensity: 'low',
    idealConditions: {
      temp: [10, 25],
      wind: [0, 15],
      humidity: [30, 70],
      visibility: [5, 100],
      cloudCover: [20, 70]     // Some clouds for sky interest
    },
    tips: [
      'Golden hour: 1 hour after sunrise / 1 hour before sunset = best light',
      'Overcast: soft light, good for portraits, flowers, waterfalls',
      'Fog: atmospheric, layered, mysterious. Go to highest viewpoint.',
      'Rain: reflections in puddles, wet leaves, moody streets',
      'Blue hour: city lights balanced with sky = magical',
      'Always bring: lens cloth, spare battery, memory card'
    ],
    warnings: [
      { condition: 'harsh_midday', risk: 'Harsh shadows, squinting subjects. Seek open shade.' },
      { condition: 'wind > 25', risk: 'Tripod unstable. Dust on sensor. Protect lens.' },
      { condition: 'rain_heavy', risk: 'Camera + water = expensive. Weather-sealed gear only.' }
    ]
  },
  stargazing_backyard: {
    category: 'hobby',
    intensity: 'sedentary',
    idealConditions: {
      temp: [10, 25],
      wind: [0, 10],
      humidity: [20, 60],
      cloudCover: [0, 10],
      moonPhase: ['new_moon', 'waxing_crescent', 'waning_crescent'],
      visibility: [10, 100]
    },
    tips: [
      'Turn off all house lights. Red flashlight only (white ruins night vision).',
      'Lie flat: blanket or reclining chair. Neck will thank you.',
      'Apps: Stellarium, SkyView, Star Walk for identification',
      'Binoculars: surprisingly good for astronomy (Pleiades, Moon, Jupiter moons)',
      '30 minutes: time for eyes to fully dark-adapt',
      'Hot beverage: keeps you outside longer'
    ],
    warnings: [
      { condition: 'cloudCover > 30', risk: 'Frustrating. Stars peek-a-boo. Not worth telescope setup.' },
      { condition: 'full_moon', risk: 'Sky too bright. Only brightest objects visible. Moon itself spectacular.' },
      { condition: 'temp < 5', risk: 'Standing still in cold = hypothermia risk. Insulated everything.' }
    ]
  },
  bird_watching: {
    category: 'hobby',
    intensity: 'low',
    idealConditions: {
      temp: [10, 25],
      wind: [0, 15],
      humidity: [30, 70],
      precipitation: [0, 1]
    },
    tips: [
      'Dawn: birds most active. Arrive before sunrise for dawn chorus.',
      'After rain: worms come out = birds feeding frenzy',
      'Migration: spring/fall. Check BirdCast for migration forecasts.',
      'Wind direction: birds take off into wind. Face into wind to see fronts.',
      'Binoculars: 8x42 best all-around. Clean lenses before going.',
      'Clothing: muted colors (no bright white). Move slowly, quietly.'
    ],
    warnings: [
      { condition: 'wind > 25', risk: 'Birds shelter. Difficult to spot. Binoculars shake.' },
      { condition: 'rain_heavy', risk: 'Birds hide. Stay home. Scope/binoculars + water = bad.' },
      { condition: 'temp > 30', risk: 'Birds less active midday. Go at dawn or skip.' }
    ]
  },
  grilling: {
    category: 'home',
    intensity: 'low',
    idealConditions: {
      temp: [15, 30],
      wind: [0, 15],
      humidity: [20, 70],
      precipitation: [0, 0]
    },
    tips: [
      'Wind direction: position grill so smoke blows away from guests',
      'Gas grill: wind can blow out flame. Shield or reposition.',
      'Charcoal: wind makes coals burn hotter/faster. Adjust vents.',
      'Wind < 5 km/h: perfect. Smoke rises straight up.',
      'Wind 5-15 km/h: manageable. Use grill lid more.',
      'Sun: move food prep to shade. Raw meat + sun = dangerous.'
    ],
    warnings: [
      { condition: 'wind > 25', risk: 'Dangerous. Grill can tip. Embers fly. Fire risk.' },
      { condition: 'rain', risk: 'Electric igniters fail. Steam burns. Have cover ready.' },
      { condition: 'temp > 35', risk: 'Standing over hot grill in heat = heat exhaustion. Shade + water.' }
    ]
  },
  laundry_drying: {
    category: 'home',
    intensity: 'sedentary',
    idealConditions: {
      temp: [15, 30],
      wind: [5, 20],
      humidity: [20, 50],
      precipitation: [0, 0],
      uvIndex: [3, 8]         // Sun helps dry and sanitize
    },
    tips: [
      'Wind 5-15 km/h: perfect. Clothes dry fast, smell fresh.',
      'No wind: clothes dry slowly, may smell musty.',
      'High UV: sun bleaches stains naturally. Whites love sun.',
      'Delicates: dry in shade (sun fades colors, weakens elastic).',
      'Sheets: snap before hanging to reduce wrinkles.',
      'Pollen count: high = don\'t hang outside (pollen on clothes).'
    ],
    warnings: [
      { condition: 'rain', risk: 'Obviously. Bring laundry in.' },
      { condition: 'humidity > 70', risk: 'Won\'t dry. Will smell damp. Use dryer or indoor rack.' },
      { condition: 'wind > 30', risk: 'Clothes blow off line. Use extra pegs or skip.' },
      { condition: 'pollen > 7', risk: 'Pollen sticks to wet clothes = allergy attack when worn.' }
    ]
  },
  car_washing: {
    category: 'home',
    intensity: 'moderate',
    idealConditions: {
      temp: [15, 25],
      wind: [0, 10],
      humidity: [30, 60],
      uvIndex: [0, 5],
      precipitation: [0, 0]
    },
    tips: [
      'Cloudy, mild day = best. Sun dries soap too fast = water spots.',
      'Shade: wash in shade or early morning/late afternoon.',
      'No wind: dust doesn\'t blow onto wet car.',
      'After rain: car already wet. Wash now while dirt is loose.',
      'Two-bucket method: one soap, one rinse. Protects paint.',
      'Wax: apply in shade. Sun bakes wax into paint (hard to remove).'
    ],
    warnings: [
      { condition: 'direct_sun', risk: 'Soap dries before rinsing = spots. Wash in shade or wait.' },
      { condition: 'wind > 15', risk: 'Overspray everywhere. Dust on wet car. Frustrating.' },
      { condition: 'temp < 5', risk: 'Water freezes on car. Impossible to wash.' },
      { condition: 'pollen > 5', risk: 'Yellow dust settles on wet car. Wait for lower pollen.' }
    ]
  },
  swimming_outdoor: {
    category: 'recreation',
    intensity: 'high',
    idealConditions: {
      temp: [25, 35],
      wind: [0, 15],
      humidity: [30, 80],
      uvIndex: [0, 7],
      precipitation: [0, 0]
    },
    tips: [
      'Water reflects UV: double exposure (from above + reflected from water)',
      'Sunscreen: waterproof, SPF 50+, reapply every 80 min swimming',
      'Rash guard: UPF 50+ = no sunscreen needed on covered areas',
      'Polarized sunglasses: cut water glare, see bottom',
      'Water temp + air temp: both above 22°C for comfortable swimming',
      'Ear plugs: prevent swimmer\'s ear'
    ],
    warnings: [
      { condition: 'thunderstorm', risk: 'LIGHTNING + WATER = DEATH. Pool/ocean must clear immediately.' },
      { condition: 'uvIndex > 8', risk: 'Burn in 15 min on water. Waterproof SPF 50+ every hour.' },
      { condition: 'temp < 20', risk: 'Hypothermia risk even in pool. Shivering = get out.' }
    ]
  },
  reading_outside: {
    category: 'leisure',
    intensity: 'sedentary',
    idealConditions: {
      temp: [20, 28],
      wind: [0, 15],
      humidity: [20, 60],
      uvIndex: [0, 5],
      precipitation: [0, 0]
    },
    tips: [
      'Shade: dappled light under tree. Direct sun = glare on pages/screen.',
      'Slight breeze: keeps bugs away, pages don\'t blow.',
      'Kindle/e-reader: anti-glare screen best for outdoors.',
      'Physical book: book weight holds pages. Wind = paperweight needed.',
      'Position: sun behind you (lights page, not in eyes).',
      'Timer: 30 min reading, 5 min eye break (look at distance).'
    ],
    warnings: [
      { condition: 'wind > 20', risk: 'Pages blowing. Hair in face. Not relaxing.' },
      { condition: 'direct_sun', risk: 'Glare makes reading impossible. Screen/paper reflection.' },
      { condition: 'temp > 30', risk: 'Sweating, uncomfortable. Can\'t focus on book.' }
    ]
  },
  bonfire: {
    category: 'social',
    intensity: 'sedentary',
    idealConditions: {
      temp: [5, 20],
      wind: [0, 10],
      humidity: [30, 70],
      precipitation: [0, 0],
      fireDanger: 'low'
    },
    tips: [
      'Light wind: blows smoke away from seating. Shift seats as wind shifts.',
      'Cold night: fire feels best. Bring blankets.',
      'Safety ring: clear 3m radius around fire. No overhanging branches.',
      'Extinguish fully: water, stir, water again. Coals stay hot 24+ hours.',
      'Marshmallows: long sticks. Rotate slowly. Golden brown = perfect.',
      'Bug repellent: evening = mosquitoes. Apply before sitting down.'
    ],
    warnings: [
      { condition: 'wind > 20', risk: 'Embers spread = wildfire risk. Cancel bonfire.' },
      { condition: 'humidity < 20 && wind > 10', risk: 'EXTREME FIRE DANGER. No fire. Check burn bans.' },
      { condition: 'temp > 30', risk: 'Fire + already hot = uncomfortable. Skip.' },
      { condition: 'drought', risk: 'Check local fire restrictions. Wildfire risk may ban all fires.' }
    ]
  }
};

// ============================================================================
// PET SAFETY CALCULATOR
// ============================================================================

function getPetSafety(data) {
  const { temp, humidity, pavementTemp, condition } = data;
  const advice = [];
  
  advice.push("🐾 PET SAFETY:");
  
  // Heat danger for pets
  if (temp > 30) {
    advice.push("DANGER: Heat stroke risk for pets.");
    advice.push("• Walk early morning (before 8am) or late evening (after 8pm)");
    advice.push("• Test pavement with back of hand: too hot for 5 sec = too hot for paws");
    advice.push("• Flat-faced breeds (bulldogs, pugs, persians): EXTREME risk - skip walk");
    advice.push("• Signs of heat stroke: excessive panting, drooling, lethargy, vomiting");
    advice.push("• Emergency: cool with room temp water (not ice). Vet immediately.");
  } else if (temp > 25) {
    advice.push("Warm: Limit exercise. Bring water. Watch for overheating signs.");
  }
  
  // Pavement temperature
  if (pavementTemp > 45) {
    advice.push(`PAVEMENT ${pavementTemp}°C: Paws burn in < 60 seconds!`);
    advice.push("• Walk on grass only or use dog booties");
    advice.push("• Check paw pads after walk for redness, blisters");
  }
  
  // Cold danger
  if (temp < -10) {
    advice.push("DANGER: Frostbite risk for pets.");
    advice.push("• Limit outdoor time to 5-10 minutes");
    advice.push("• Dog booties and coat for short-haired breeds");
    advice.push("• Check paws for ice balls between toes");
    advice.push("• Antifreeze: lethal poison. Sweet taste. Keep away from pets.");
  }
  
  // Thunderstorm
  if (condition === 'thunderstorm') {
    advice.push("THUNDERSTORM: Keep pets inside.");
    advice.push("• Many pets terrified. Create safe space (crate, interior room)");
    advice.push("• Thunder shirt/wrap may help anxiety");
    advice.push("• Microchip/collar on in case they bolt");
    advice.push("• NEVER tie dog outside during storm");
  }
  
  return advice;
}

// ============================================================================
// MENTAL HEALTH & WELLNESS CORRELATIONS
// ============================================================================

function getMentalWellnessAdvice(data) {
  const { temp, condition, humidity, wind, uvIndex, visibility, season } = data;
  const advice = [];
  
  advice.push("🧠 MENTAL WELLNESS:");
  
  // Sunlight and mood
  if (condition === 'clear' && uvIndex > 2) {
    advice.push("Sunny day = natural serotonin boost.");
    advice.push("• 15-30 min morning sunlight regulates circadian rhythm");
    advice.push("• Outdoor time today: improves mood, reduces anxiety");
    advice.push("• Walk in nature: 20 min reduces cortisol (stress hormone)");
  } else if (condition === 'overcast' || condition === 'rain') {
    advice.push("Gray day: may affect mood. Normal and temporary.");
    advice.push("• Light therapy lamp if feeling low (30 min morning)");
    advice.push("• Still beneficial: brief walk outside for natural light");
    advice.push("• Cozy activities: read, cook, call friend. Embrace hygge.");
  }
  
  // Seasonal affective
  if (season === 'winter' && (condition === 'overcast' || visibility < 5)) {
    advice.push("Winter + gray = potential SAD symptoms.");
    advice.push("• Vitamin D supplement (discuss with doctor)");
    advice.push("• Light therapy: 10,000 lux lamp, 30 min before 9am");
    advice.push("• Exercise: even 15 min indoor workout boosts mood");
  }
  
  // Temperature and mood
  if (temp > 32) {
    advice.push("Extreme heat: irritability, fatigue common.");
    advice.push("• Stay cool: AC, cold shower, ice water");
    advice.push("• Reduced cognitive function in heat - go easy on yourself");
  }
  
  // Wind and anxiety
  if (wind > 30) {
    advice.push("Strong wind: can increase anxiety/agitation in some people.");
    advice.push("• White noise machine to mask wind sound");
    advice.push("• Weighted blanket for calming effect");
  }
  
  return advice;
}

// ============================================================================
// SLEEP QUALITY PREDICTOR
// ============================================================================

function getSleepQualityAdvice(data) {
  const { temp, tempMin, humidity, condition, wind } = data;
  const advice = [];
  
  advice.push("😴 SLEEP TONIGHT:");
  
  // Optimal sleep temperature
  const nightTemp = tempMin || (temp - 8);
  
  if (nightTemp >= 16 && nightTemp <= 19) {
    advice.push(`Night temp ${nightTemp}°C: PERFECT for sleep.`);
    advice.push("• Optimal sleep temperature: 16-19°C");
    advice.push("• Open window for fresh air");
  } else if (nightTemp > 24) {
    advice.push(`Night temp ${nightTemp}°C: TOO WARM for optimal sleep.`);
    advice.push("• Fan or AC to cool bedroom");
    advice.push("• Cotton sheets (no synthetic). Light blanket or none.");
    advice.push("• Cool shower before bed lowers core temperature");
  } else if (nightTemp < 10) {
    advice.push(`Night temp ${nightTemp}°C: Cool but fine with warm bedding.`);
    advice.push("• Flannel sheets, heavier blanket");
    advice.push("• Warm feet = faster sleep (socks or hot water bottle)");
  } else if (nightTemp < 0) {
    advice.push(`Night temp ${nightTemp}°C: Very cold. Seal drafts.`);
    advice.push("• Electric blanket (auto-off for safety)");
    advice.push("• Humidifier: cold air + heating = very dry (dry throat/nose)");
  }
  
  // Humidity
  if (humidity > 80) {
    advice.push("High humidity: may feel stuffy. Dehumidifier or AC helps.");
  } else if (humidity < 30) {
    advice.push("Dry air: throat/nose dry. Humidifier recommended.");
  }
  
  // Rain sound
  if (condition === 'rain' && wind < 20) {
    advice.push("Rain sounds = natural white noise. Great sleep aid.");
  }
  
  // Wind noise
  if (wind > 30) {
    advice.push("Wind noise may disrupt sleep. Earplugs or white noise.");
  }
  
  return advice;
}

// ============================================================================
// PRODUCTIVITY & COGNITIVE PERFORMANCE
// ============================================================================

function getProductivityAdvice(data) {
  const { temp, humidity, condition } = data;
  const advice = [];
  
  advice.push("💼 PRODUCTIVITY:");
  
  if (temp >= 20 && temp <= 22) {
    advice.push(`Optimal cognitive temperature (${temp}°C): best focus and accuracy.`);
  } else if (temp > 28) {
    advice.push(`Heat reduces cognitive performance 10-15%.`);
    advice.push("• Tackle complex tasks in morning (cooler)");
    advice.push("• Work in AC if possible. Take frequent breaks.");
  } else if (temp < 15) {
    advice.push("Cool temps: manual dexterity reduced. Typing slower.");
    advice.push("• Warm hands = better fine motor skills");
  }
  
  if (condition === 'rain') {
    advice.push("Rain sounds: many find it focusing (pink noise effect).");
    advice.push("• Cozy work-from-home day. Deep work possible.");
  }
  
  return advice;
}

// ============================================================================
// MAIN LIFESTYLE ADVICE FUNCTION
// ============================================================================

export const getLifestyleAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, condition, humidity, wind, windGust, 
    uvIndex, aqi, conditionCode, sunrise, sunset, city,
    visibility, dewPoint, tempMin, tempMax, pressure,
    precipitation, moonPhase, pollenIndex
  } = data;
  
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const comfort = getComfortScore({ temp, humidity, wind });
  const pavementTemp = getPavementTemp(temp, condition);
  const burnMin = getBurnTime(uvIndex);
  const timeOfDay = getTimeOfDay();
  const season = getSeason();
  const sunPosition = getSunPosition(data);
  const dayLength = getDayLength(data);
  const pollenLevel = pollenIndex || 3;
  
  // Detect activities from question
  const q = question.toLowerCase();
  let detectedActivities = [];
  
  if (q.includes('run') || q.includes('jog')) detectedActivities.push('running');
  if (q.includes('walk') || q.includes('stroll')) detectedActivities.push('walking');
  if (q.includes('cycl') || q.includes('bike') || q.includes('ride')) detectedActivities.push('cycling');
  if (q.includes('dog') || q.includes('pet') || q.includes('puppy')) detectedActivities.push('dog_walking');
  if (q.includes('playground') || q.includes('kids') || q.includes('child')) detectedActivities.push('playground');
  if (q.includes('garden') || q.includes('plant') || q.includes('lawn') || q.includes('mow')) detectedActivities.push('gardening');
  if (q.includes('dinner') || q.includes('lunch') || q.includes('eat') || q.includes('patio') || q.includes('picnic')) detectedActivities.push('outdoor_dining');
  if (q.includes('yoga') || q.includes('meditat') || q.includes('tai chi') || q.includes('breathe')) detectedActivities.push('meditation_yoga_outdoor');
  if (q.includes('photo') || q.includes('camera') || q.includes('shoot')) detectedActivities.push('photography_walk');
  if (q.includes('star') || q.includes('night sky') || q.includes('constellation')) detectedActivities.push('stargazing_backyard');
  if (q.includes('bird') || q.includes('wildlife watch')) detectedActivities.push('bird_watching');
  if (q.includes('grill') || q.includes('bbq') || q.includes('barbecue') || q.includes('cookout')) detectedActivities.push('grilling');
  if (q.includes('laundry') || q.includes('dry clothes') || q.includes('hang')) detectedActivities.push('laundry_drying');
  if (q.includes('car wash') || q.includes('wash car')) detectedActivities.push('car_washing');
  if (q.includes('swim') || q.includes('pool') || q.includes('ocean')) detectedActivities.push('swimming_outdoor');
  if (q.includes('read') || q.includes('book')) detectedActivities.push('reading_outside');
  if (q.includes('bonfire') || q.includes('campfire') || q.includes('fire pit')) detectedActivities.push('bonfire');
  
  if (detectedActivities.length === 0) {
    detectedActivities = ['walking', 'outdoor_dining', 'gardening']; // default general activities
  }
  
  let verdict = [];
  let tips = [];
  let warnings = [];
  let timing = [];
  let activitySpecific = [];
  let petAdvice = [];
  let wellnessAdvice = [];
  let sleepAdvice = [];
  let productivityAdvice = [];

  // ========================================================================
  // CATASTROPHIC CONDITIONS
  // ========================================================================
  
  if (condition === 'thunderstorm') {
    verdict.push("⛈️ THUNDERSTORM: Stay indoors. All outdoor activities cancelled.");
    warnings.push("Lightning risk: avoid open areas, trees, water, metal objects.");
    warnings.push("Wait 30 minutes after last thunder before going outside.");
  }
  
  if (wind > 50) {
    verdict.push("💨 DANGEROUS WIND: Outdoor activities unsafe.");
    warnings.push("Flying debris, falling trees/branches. Stay inside.");
  }
  
  if (aqi > 200) {
    verdict.push("😷 HAZARDOUS AIR: Stay indoors. No outdoor activities.");
    warnings.push("Even healthy individuals at risk. HEPA air purifier indoors.");
  }

  // ========================================================================
  // GENERAL VERDICT
  // ========================================================================
  
  if (!verdict.length) {
    if (comfort === "Perfect") {
      verdict.push("✨ PERFECT conditions for outdoor activities!");
      verdict.push("Whatever you're planning - today is the day.");
    } else if (comfort === "Good") {
      verdict.push("👍 Great weather for most outdoor activities.");
    } else if (effectiveTemp > 35) {
      verdict.push("🔥 EXTREME HEAT: Limit outdoor time. Hydrate constantly.");
    } else if (effectiveTemp > 30) {
      verdict.push("☀️ HOT: Outdoor activities OK with precautions.");
    } else if (effectiveTemp < -5) {
      verdict.push("❄️ VERY COLD: Limit outdoor exposure. Bundle up.");
    } else if (effectiveTemp < 5) {
      verdict.push("🥶 COLD: Short outdoor activities fine with proper clothing.");
    } else if (comfort === "Poor") {
      verdict.push("⚠️ Challenging conditions. Activities possible but uncomfortable.");
    } else {
      verdict.push("Outdoor activities possible with preparation.");
    }
  }

  // ========================================================================
  // AIR QUALITY
  // ========================================================================
  
  if (aqi > 150) {
    warnings.push(`UNHEALTHY AIR (AQI ${aqi}): Avoid outdoor exercise.`);
    warnings.push("Lungs absorb 3-5x more pollution during exercise.");
    tips.push("If you must exercise outdoors: N95 mask, reduce intensity 50%.");
  } else if (aqi > 100) {
    tips.push(`Moderate AQI ${aqi}: Sensitive groups should reduce prolonged exertion.`);
    tips.push("Consider indoor workout if you have asthma, allergies, heart condition.");
  }

  // ========================================================================
  // UV ALERT
  // ========================================================================
  
  if (uvIndex >= 8) {
    warnings.push(`EXTREME UV ${uvIndex}: Burn time ~${burnMin} minutes.`);
    tips.push("SPF 50+ everywhere. Hat, sunglasses, UPF clothing.");
    tips.push("Limit direct sun 10am-4pm. Seek shade.");
  } else if (uvIndex >= 6) {
    tips.push(`HIGH UV ${uvIndex}: Sunscreen essential (SPF 30+).`);
    tips.push("Reapply every 2 hours, more if swimming/sweating.");
  }

  // ========================================================================
  // PAVEMENT WARNING
  // ========================================================================
  
  if (pavementTemp > 45) {
    warnings.push(`PAVEMENT ${pavementTemp}°C: Burns skin/paws in seconds!`);
    tips.push("Walk on grass. Wear shoes. Dog booties or carry pet.");
    tips.push("Asphalt 20-30°C hotter than air temperature.");
  }

  // ========================================================================
  // TIMING ADVICE
  // ========================================================================
  
  if (temp > 28 && timeOfDay === 'midday') {
    timing.push("☀️ Best time: before 10am or after 5pm (avoid peak heat)");
  }
  
  if (uvIndex > 6 && timeOfDay === 'midday') {
    timing.push("UV peaks 10am-3pm. Plan outdoor time for morning or late afternoon.");
  }
  
  if (sunrise && temp < 10) {
    timing.push(`🌅 Sun rises ${sunrise}. Wait until after sunrise when temps warm up.`);
  }
  
  if (sunset) {
    timing.push(`🌇 Sunset at ${sunset}. Plan to finish outdoor activities before dark.`);
    timing.push(`Daylight: ${dayLength} hours of usable light.`);
  }
  
  if (sunPosition === 'golden_hour') {
    timing.push("🌟 GOLDEN HOUR NOW: The most beautiful light of the day!");
    timing.push("Perfect for walks, photos, outdoor dining, anything outside.");
  }

  // ========================================================================
  // POLLEN ALERT
  // ========================================================================
  
  if (pollenLevel > 7) {
    warnings.push(`🤧 HIGH POLLEN: Allergy sufferers - limit outdoor time.`);
    tips.push("Take antihistamines BEFORE going out. Shower after being outside.");
    tips.push("Keep windows closed. HEPA air purifier indoors.");
  }

  // ========================================================================
  // ACTIVITY-SPECIFIC ADVICE
  // ========================================================================
  
  for (const activity of detectedActivities) {
    const config = ACTIVITIES[activity];
    if (config) {
      activitySpecific.push(`\n🎯 ${activity.replace(/_/g, ' ').toUpperCase()}:`);
      
      // Check conditions against ideals
      if (config.tips) {
        config.tips.forEach(t => activitySpecific.push(`  💡 ${t}`));
      }
      
      // Check warnings
      if (config.warnings) {
        for (const warning of config.warnings) {
          const conditionMet = evalWarning(warning.condition, data);
          if (conditionMet) {
            activitySpecific.push(`  ⚠️ ${warning.risk}`);
          }
        }
      }
    }
  }

  // ========================================================================
  // PET SAFETY
  // ========================================================================
  
  if (q.includes('dog') || q.includes('pet') || q.includes('walk')) {
    petAdvice = getPetSafety(data);
  }

  // ========================================================================
  // WELLNESS & MENTAL HEALTH
  // ========================================================================
  
  if (q.includes('mental') || q.includes('mood') || q.includes('wellness') || q.includes('anxiety') || 
      q.includes('meditat') || q.includes('yoga') || q.includes('stress') || !q) {
    wellnessAdvice = getMentalWellnessAdvice(data);
  }

  // ========================================================================
  // SLEEP QUALITY
  // ========================================================================
  
  if (q.includes('sleep') || q.includes('bed') || q.includes('window open') || !q) {
    sleepAdvice = getSleepQualityAdvice(data);
  }

  // ========================================================================
  // PRODUCTIVITY
  // ========================================================================
  
  if (q.includes('work') || q.includes('productivity') || q.includes('focus') || q.includes('study')) {
    productivityAdvice = getProductivityAdvice(data);
  }

  // ========================================================================
  // GENERAL COMFORT TIPS
  // ========================================================================
  
  if (effectiveTemp > 32) {
    tips.push("💧 Hydrate: 500ml water per hour when active outdoors.");
    tips.push("Cooling towel around neck. Seek shade every 30 minutes.");
    tips.push("Know heat exhaustion signs: nausea, dizziness, headache, cool clammy skin.");
  } else if (effectiveTemp < 0) {
    tips.push("🧊 Layer up: moisture-wicking base + insulating mid + windproof outer.");
    tips.push("Extremities first: fingers, toes, ears, nose. Keep them covered.");
    tips.push("Know hypothermia signs: shivering, confusion, slurred speech, drowsiness.");
  }
  
  if (wind > 20) {
    tips.push("💨 Wind chill makes it feel colder. Dress for feels-like temperature.");
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🌳 Outdoor activity check:",
    "🏃 Exercise forecast:",
    "🌿 Park weather report:",
    "🚴 Activity conditions:",
    "🌞 Zephye's outdoor advisory:",
    "🎯 Lifestyle weather:",
    "🌤️ Recreation forecast:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Verdict
  response += `📊 OVERALL: ${verdict.join(' ')}\n\n`;
  
  // Current Conditions
  response += `🌡️ RIGHT NOW:\n`;
  response += `• Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  if (pavementTemp > 35) response += `• Pavement temp: ${pavementTemp}°C ⚠️\n`;
  response += `• Condition: ${condition}\n`;
  response += `• Wind: ${wind}km/h (gusts ${windGust || wind}km/h)\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• UV Index: ${uvIndex} (burn time ~${burnMin} min)\n`;
  if (aqi > 50) response += `• Air Quality: AQI ${aqi} (${getAQICategory(aqi)})\n`;
  if (pollenLevel > 3) response += `• Pollen: ${pollenLevel}/10\n`;
  response += '\n';
  
  // Timing
  if (timing.length > 0) {
    response += `⏰ TIMING:\n`;
    timing.forEach(t => response += `• ${t}\n`);
    response += '\n';
  }
  
  // Activity-Specific
  if (activitySpecific.length > 0) {
    activitySpecific.forEach(a => response += `${a}\n`);
    response += '\n';
  }
  
  // General Tips
  if (tips.length > 0) {
    response += `💡 TIPS:\n`;
    tips.forEach(t => response += `• ${t}\n`);
    response += '\n';
  }
  
  // Pet Safety
  if (petAdvice.length > 0) {
    petAdvice.forEach(p => response += `${p}\n`);
    response += '\n';
  }
  
  // Wellness
  if (wellnessAdvice.length > 0) {
    wellnessAdvice.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Sleep
  if (sleepAdvice.length > 0) {
    sleepAdvice.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Productivity
  if (productivityAdvice.length > 0) {
    productivityAdvice.forEach(p => response += `${p}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Final Recommendation
  response += `💡 BOTTOM LINE:\n`;
  if (comfort === "Perfect" && aqi < 50) {
    response += `Today is THE day. Cancel indoor plans. Get outside!\n`;
  } else if (comfort === "Good") {
    response += `Great day for outdoor activities. Minor adjustments only.\n`;
  } else if (condition === 'thunderstorm' || wind > 50 || aqi > 200) {
    response += `Stay inside. Not safe for outdoor activities today.\n`;
  } else {
    response += `Outdoor activities possible with proper preparation.\n`;
  }
  
  // Wellness wisdom
  const wisdom = [
    "Time spent in nature is never wasted.",
    "Walk as if you are kissing the Earth with your feet. - Thich Nhat Hanh",
    "In every walk with nature, one receives far more than he seeks. - John Muir",
    "The outdoors is my therapy.",
    "Fresh air and sunshine: the original medicine.",
    "Nature does not hurry, yet everything is accomplished. - Lao Tzu"
  ];
  response += `\n🌿 ${random(wisdom)}`;

  return response;
};

// ============================================================================
// HELPER: EVALUATE WARNING CONDITIONS
// ============================================================================

function evalWarning(condition, data) {
  const { temp, wind, aqi, uvIndex, pavementTemp, condition: weatherCondition, humidity, visibility, cloudCover } = data;
  
  const conditions = {
    'temp > 30': temp > 30,
    'temp > 32': temp > 32,
    'temp > 35': temp > 35,
    'temp < -5': temp < -5,
    'temp < -10': temp < -10,
    'temp < 0': temp < 0,
    'temp < 20': temp < 20,
    'temp < 5': temp < 5,
    'temp < 12': temp < 12,
    'temp < 15': temp < 15,
    'wind > 15': wind > 15,
    'wind > 20': wind > 20,
    'wind > 25': wind > 25,
    'wind > 30': wind > 30,
    'wind > 35': wind > 35,
    'aqi > 50': aqi > 50,
    'aqi > 100': aqi > 100,
    'uvIndex > 7': uvIndex > 7,
    'uvIndex > 8': uvIndex > 8,
    'pavementTemp > 45': pavementTemp > 45,
    'lightning': weatherCondition === 'thunderstorm',
    'thunderstorm': weatherCondition === 'thunderstorm',
    'rain': ['rain', 'drizzle', 'thunderstorm'].includes(weatherCondition),
    'rain_heavy': weatherCondition === 'rain' && (data.precipitation || 0) > 10,
    'ice': temp < 2 && (weatherCondition === 'rain' || weatherCondition === 'snow' || weatherCondition === 'drizzle'),
    'harsh_midday': data.timeOfDay === 'midday' && uvIndex > 5,
    'direct_sun': weatherCondition === 'clear' && uvIndex > 3,
    'full_moon': data.moonPhase === 'Full Moon',
    'cloudCover > 30': cloudCover > 30,
    'humidity > 70': humidity > 70,
    'humidity < 20': humidity < 20,
    'humidity < 20 && wind > 10': humidity < 20 && wind > 10,
    'pollen > 7': data.pollenIndex > 7,
    'pollen > 5': data.pollenIndex > 5,
    'drought': humidity < 25 && temp > 25
  };
  
  return conditions[condition] || false;
}

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { getPetSafety, getMentalWellnessAdvice, getSleepQualityAdvice, getProductivityAdvice };

export default getLifestyleAdvice;
