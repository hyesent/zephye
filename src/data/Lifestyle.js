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
  // EXERCISE
  "Can I go jogging today?",
  "Is it good weather for a walk?",
  "Should I work out outside?",
  "Can I go to the park?",
  "Is it safe to run right now?",
  "Best time to exercise today?",
  "Should I do outdoor yoga?",
  "Is it good cycling weather?",
  "Should I go rollerblading?",
  "Can I shoot hoops?",
  "Is the weather good for golf?",
  "Should I play tennis outside?",
  "Can I do hill sprints?",
  "Is the track too hot?",
  "Should I swim laps outside?",
  "Is it good for aqua jogging?",
  "Can I do CrossFit outside?",
  "Should I use the outdoor gym equipment?",
  "Can I run stairs outside?",
  "Is it good for boot camp?",
  
  // PETS & FAMILY
  "Can I walk my dog?",
  "Can I take my kids to the playground?",
  "Is the playground safe in this heat?",
  "Can I take baby for a stroller walk?",
  "Should I babywear outside?",
  "Is it safe for my toddler to play outside?",
  "Can elderly parent sit in the garden?",
  "Should I visit the outdoor market with mobility issues?",
  
  // SOCIAL & LEISURE
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
  
  // WELLNESS
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
  
  // SOCIAL EVENTS
  "Is it good for a first date outdoors?",
  "Should I propose outside today?",
  "Can I have friends over for a cookout?",
  "Is it good for a block party?",
  "Should I go to the outdoor concert?",
  "Can I tailgate before the game?",
  "Is it good for a charity walk?",
  
  // OTHER
  "Can I go to the outdoor pool?",
  "Is it good for sunbathing?",
  "Can I have a water balloon fight?",
  "Should I wash my car?",
  "Will my car dry without spots?",
  "Is the playground equipment too hot?",
  "Should I go to the outdoor pool?",
  "Is it safe for my asthma to exercise outside?",
  "Should I wear a mask outdoors?",
  "Is it too polluted to eat outside?"
];

// ============================================================================
// ENHANCED ACTIVITY DATABASE
// ============================================================================

const ACTIVITIES = {
  running: {
    category: 'exercise',
    intensity: 'high',
    idealConditions: {
      temp: [8, 18],
      wind: [0, 15],
      humidity: [30, 70],
      uvIndex: [0, 5],
      aqi: [0, 50],
      precipitation: [0, 0],
      pavementTemp: [0, 40]
    },
    tips: [
      'Dress for 10°C warmer than actual temperature (you will heat up)',
      'Moisture-wicking fabrics only. No cotton (chafes when wet)',
      'Headwind strategy: run out against wind, return with wind at back',
      'Hydrate: 500ml water 2 hours before, 200ml every 20 minutes during',
      'Warm up: 5-10 minutes of light jogging before any speed work',
      'Cool down: 5-10 minutes of walking after to prevent blood pooling'
    ],
    warnings: [
      { condition: 'temp > 30', risk: 'Heat exhaustion possible. Run early morning or evening only.' },
      { condition: 'temp < -5', risk: 'Cold air can trigger exercise-induced asthma. Wear scarf over mouth.' },
      { condition: 'aqi > 100', risk: 'Lung damage from pollution. Skip or run indoors on treadmill.' },
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
      precipitation: [0, 2]
    },
    tips: [
      'Brisk walking: 30 minutes burns 150 calories and improves mood 40%',
      'Nordic walking poles: 40% more calories burned, less joint impact',
      'Listen to audio book or podcast to walk longer without noticing',
      'Post-meal walk: 15 minutes improves digestion and blood sugar control',
      'Walk with a friend: 3x more likely to stick with walking habit'
    ],
    warnings: [
      { condition: 'temp > 32', risk: 'Shorten walk to 15 minutes. Bring water. Seek shade.' },
      { condition: 'temp < -10', risk: 'Frostbite risk on exposed skin. Short walk only with full coverage.' },
      { condition: 'ice', risk: 'Walking on ice: penguin walk with small steps. Yaktrax recommended.' },
      { condition: 'thunderstorm', risk: 'Lightning risk. Postpone walk.' }
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
      'Wind chill at 30 km/h feels 5-8°C colder. Dress accordingly.',
      'Headwind is equivalent to riding up a 2-3 percent grade continuously',
      'Tailwind: personal record day. Enjoy it.',
      'Crosswind over 25 km/h is dangerous, especially with deep rim wheels',
      'Hydrate: 1 bottle per hour in heat. Electrolytes for rides over 2 hours',
      'Check tire pressure before every ride. Proper pressure = 15% less rolling resistance'
    ],
    warnings: [
      { condition: 'wind > 35', risk: 'Dangerous crosswinds. Can blow you into traffic.' },
      { condition: 'rain', risk: 'Braking distance doubles. Metal surfaces become ice.' },
      { condition: 'temp > 32', risk: 'Heat exhaustion. Ride early morning. Double water intake.' },
      { condition: 'aqi > 100', risk: 'Breathing rate is 3x normal = 3x pollution intake. N95 mask or skip.' },
      { condition: 'ice', risk: 'Falls at speed = serious injury. Indoor trainer day.' }
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
      pavementTemp: [0, 40]
    },
    tips: [
      '7-second rule: back of hand on pavement. Too hot for you = too hot for paws',
      'Hot pavement can burn paw pads in 60 seconds at 50°C',
      'Short-nosed breeds (bulldogs, pugs) overheat faster. Limit to 10 minutes above 25°C',
      'Cold weather: dog booties protect from ice, salt, and chemical de-icers',
      'Dark-coated dogs absorb more heat. Walk in shade.',
      'Always bring water and collapsible bowl',
      'Dogs need exercise even in poor weather - modify duration not frequency'
    ],
    warnings: [
      { condition: 'pavementTemp > 45', risk: 'PAWS WILL BURN. Walk on grass only or wait for evening.' },
      { condition: 'temp > 30', risk: 'Dogs overheat faster than humans. 10 minutes maximum. Watch for excessive panting.' },
      { condition: 'temp < -10', risk: 'Frostbite on paws and nose. Booties and short walk only.' },
      { condition: 'thunderstorm', risk: 'Dogs terrified and may bolt. Keep leashed, stay inside.' }
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
      'Check equipment temperature: dark plastic slides can reach 70°C+ in direct sun',
      'Metal equipment in sun is a burn hazard. Touch test before kids play.',
      'Rubber playground surface is the hottest surface. Can reach 80°C.',
      'Sand is cooler than rubber but check for sharp objects and animal waste',
      'Water bottle for each child. Sunscreen reapplied every 2 hours.',
      'Shade breaks: kids lose track of time. Enforce shade rest every 30 minutes.'
    ],
    warnings: [
      { condition: 'temp > 32', risk: 'Equipment too hot. Playground unsafe. Splash pad or indoor play instead.' },
      { condition: 'temp < 0', risk: 'Ice on equipment. Slip hazard. Frozen ground = hard falls.' },
      { condition: 'uvIndex > 7', risk: 'Children\'s skin burns faster. Shade and SPF 50+ mandatory.' },
      { condition: 'wind > 30', risk: 'Flying debris. Swings become dangerous. Leave playground.' }
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
      'Morning is best for watering (less evaporation)',
      'Evening is best for planting and transplanting (less transplant shock)',
      'After rain: soil is easy to work, weeds pull out easily',
      'Apply mulch after rain to lock in moisture',
      'Wear: hat, sunscreen, knee pad, gardening gloves',
      'Listen to podcast or audiobook to make 2 hours feel like 30 minutes',
      'Rotate tasks: 30 minutes weeding, 30 minutes planting, 10 minutes rest'
    ],
    warnings: [
      { condition: 'temp > 30', risk: 'Garden early morning only. Heat stroke risk while bent over.' },
      { condition: 'thunderstorm', risk: 'Metal tools attract lightning. Go inside immediately.' },
      { condition: 'wind > 25', risk: 'Soil dries fast. Spray from herbicides drifts to other plants.' },
      { condition: 'uvIndex > 7', risk: 'Back of neck, ears, and shoulders burn while gardening. Cover up.' }
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
      'No wind: citronella candles work. Windy: they do not.',
      'Sunny weather plus 22°C with light breeze equals perfect patio weather',
      'Shade: umbrella position matters as the sun moves throughout the meal',
      'Evening: bring a layer. Temperature drops 5-10°C after sunset.',
      'Wine: white and rosé in ice bucket. Red in shade (sun cooks it).',
      'Food safety: cold food stays on ice. Hot food in chafing dishes.'
    ],
    warnings: [
      { condition: 'temp > 32', risk: 'Food spoils fast. Cold food on ice. Hot food in chafing dishes.' },
      { condition: 'temp < 12', risk: 'Uncomfortable without heaters. Food cools instantly.' },
      { condition: 'wind > 20', risk: 'Napkins, menus, light plates become projectiles. Weight everything.' },
      { condition: 'rain', risk: 'Sudden scramble inside. Have a backup plan.' }
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
      precipitation: [0, 0]
    },
    tips: [
      'Morning: air is freshest, birds are singing, less wind equals perfect conditions',
      'Shade: dappled light under a tree is ideal (not full sun or full shade)',
      'Ground: dry grass or yoga mat. Check for dampness before sitting.',
      'Sound: wind chimes, water feature, or nature sounds app',
      'Shoes off: grounding or earthing. Direct skin contact with the earth.',
      'Insect repellent: natural options (citronella, eucalyptus) before practice'
    ],
    warnings: [
      { condition: 'temp > 30', risk: 'Hot yoga is already hot enough. Practice inside with AC.' },
      { condition: 'temp < 10', risk: 'Muscles tighten in cold. Injury risk. Indoor practice.' },
      { condition: 'wind > 15', risk: 'Wind noise disrupts meditation. Tree pose becomes falling pose.' },
      { condition: 'aqi > 100', risk: 'Deep breathing plus pollution equals bad combo. Practice indoors.' }
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
      cloudCover: [20, 70]
    },
    tips: [
      'Golden hour: 1 hour after sunrise or 1 hour before sunset provides best light',
      'Overcast conditions: soft light, good for portraits, flowers, and waterfalls',
      'Fog: atmospheric, layered, mysterious. Go to highest viewpoint.',
      'Rain: reflections in puddles, wet leaves, moody streets',
      'Blue hour: city lights balanced with the sky equals magical photos',
      'Always bring: lens cloth, spare battery, memory card, tripod'
    ],
    warnings: [
      { condition: 'harsh_midday', risk: 'Harsh shadows, squinting subjects. Seek open shade.' },
      { condition: 'wind > 25', risk: 'Tripod unstable. Dust on sensor. Protect lens.' },
      { condition: 'rain_heavy', risk: 'Camera plus water equals expensive. Weather-sealed gear only.' }
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
      'Turn off all house lights. Red flashlight only (white ruins night vision)',
      'Lie flat: blanket or reclining chair. Neck will thank you.',
      'Apps: Stellarium, SkyView, Star Walk for identification',
      'Binoculars: surprisingly good for astronomy (Pleiades, Moon, Jupiter moons)',
      '30 minutes: time for eyes to fully dark-adapt',
      'Hot beverage: keeps you outside longer'
    ],
    warnings: [
      { condition: 'cloudCover > 30', risk: 'Frustrating. Stars peek-a-boo. Not worth telescope setup.' },
      { condition: 'full_moon', risk: 'Sky too bright. Only brightest objects visible. Moon itself is spectacular.' },
      { condition: 'temp < 5', risk: 'Standing still in cold equals hypothermia risk. Insulated everything.' }
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
      'Dawn: birds most active. Arrive before sunrise for the dawn chorus.',
      'After rain: worms come out, birds feeding frenzy',
      'Migration: spring and fall. Check BirdCast for migration forecasts.',
      'Wind direction: birds take off into wind. Face into wind to see migration fronts.',
      'Binoculars: 8x42 is best all-around. Clean lenses before going.',
      'Clothing: muted colors (no bright white). Move slowly and quietly.'
    ],
    warnings: [
      { condition: 'wind > 25', risk: 'Birds shelter. Difficult to spot. Binoculars shake.' },
      { condition: 'rain_heavy', risk: 'Birds hide. Stay home. Scope and binoculars plus water equals bad.' },
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
      'Gas grill: wind can blow out the flame. Use shield or reposition.',
      'Charcoal: wind makes coals burn hotter and faster. Adjust vents.',
      'Wind under 5 km/h: perfect. Smoke rises straight up.',
      'Wind 5-15 km/h: manageable. Use grill lid more often.',
      'Sun: move food prep to shade. Raw meat plus sun equals dangerous.'
    ],
    warnings: [
      { condition: 'wind > 25', risk: 'Dangerous. Grill can tip. Embers fly. Fire risk.' },
      { condition: 'rain', risk: 'Electric igniters fail. Steam burns. Have cover ready.' },
      { condition: 'temp > 35', risk: 'Standing over hot grill in heat equals heat exhaustion. Shade and water.' }
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
      uvIndex: [3, 8]
    },
    tips: [
      'Wind 5-15 km/h: perfect. Clothes dry fast and smell fresh.',
      'No wind: clothes dry slowly and may smell musty.',
      'High UV: sun bleaches stains naturally. Whites love sun.',
      'Delicates: dry in shade to prevent color fading and elastic damage',
      'Sheets: snap before hanging to reduce wrinkles.',
      'Pollen count high: do not hang outside (pollen on clothes)'
    ],
    warnings: [
      { condition: 'rain', risk: 'Bring laundry in immediately.' },
      { condition: 'humidity > 70', risk: 'Won\'t dry. Will smell damp. Use dryer or indoor rack.' },
      { condition: 'wind > 30', risk: 'Clothes blow off line. Use extra pegs or skip.' },
      { condition: 'pollen > 7', risk: 'Pollen sticks to wet clothes causing allergy attack when worn.' }
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
      'Cloudy, mild day is best. Sun dries soap too fast causing water spots.',
      'Shade: wash in shade or early morning or late afternoon.',
      'No wind: dust doesn\'t blow onto wet car.',
      'After rain: car already wet. Wash now while dirt is loose.',
      'Two-bucket method: one for soap, one for rinse. Protects paint.',
      'Wax: apply in shade. Sun bakes wax into paint making it hard to remove.'
    ],
    warnings: [
      { condition: 'direct_sun', risk: 'Soap dries before rinsing causing spots. Wash in shade or wait.' },
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
      'Water reflects UV: double exposure (from above and reflected from water)',
      'Sunscreen: waterproof, SPF 50+, reapply every 80 minutes while swimming',
      'Rash guard: UPF 50+ covers areas without needing sunscreen',
      'Polarized sunglasses: cut water glare, see bottom',
      'Water temperature and air temperature both above 22°C for comfortable swimming',
      'Ear plugs: prevent swimmer\'s ear',
      'Never swim alone. Even in pools. Even if good swimmer.'
    ],
    warnings: [
      { condition: 'thunderstorm', risk: 'LIGHTNING PLUS WATER EQUALS DEATH. Pool and ocean must clear immediately.' },
      { condition: 'uvIndex > 8', risk: 'Burn in 15 minutes on water. Waterproof SPF 50+ every hour.' },
      { condition: 'temp < 20', risk: 'Hypothermia risk even in pool. Shivering means get out.' },
      { condition: 'wind > 25', risk: 'Dangerous for open water swimming. Stay close to shore or pool.' }
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
      'Shade: dappled light under a tree. Direct sun equals glare on pages and screens.',
      'Slight breeze: keeps bugs away without blowing pages.',
      'Kindle or e-reader: anti-glare screen is best for outdoors.',
      'Physical book: book weight holds pages. Wind equals paperweight needed.',
      'Position: sun behind you lights pages without being in your eyes.',
      'Timer: 30 minutes reading, 5 minute eye break (look at distance).'
    ],
    warnings: [
      { condition: 'wind > 20', risk: 'Pages blowing. Hair in face. Not relaxing.' },
      { condition: 'direct_sun', risk: 'Glare makes reading impossible. Screen and paper reflection.' },
      { condition: 'temp > 30', risk: 'Sweating and uncomfortable. Cannot focus on book.' }
    ]
  },
  bonfire: {
    category: 'social',
    intensity: 'sedentary',
    idealConditions: {
      temp: [5, 20],
      wind: [0, 10],
      humidity: [30, 70],
      precipitation: [0, 0]
    },
    tips: [
      'Light wind: blows smoke away from seating. Shift seats as wind shifts.',
      'Cold night: fire feels best. Bring blankets.',
      'Safety ring: clear 3 meter radius around fire. No overhanging branches.',
      'Extinguish fully: water, stir, water again. Coals stay hot 24+ hours.',
      'Marshmallows: long sticks. Rotate slowly. Golden brown equals perfect.',
      'Bug repellent: evening means mosquitoes. Apply before sitting down.'
    ],
    warnings: [
      { condition: 'wind > 20', risk: 'Embers spread causing wildfire risk. Cancel bonfire.' },
      { condition: 'humidity < 20 && wind > 10', risk: 'EXTREME FIRE DANGER. No fire. Check burn bans.' },
      { condition: 'temp > 30', risk: 'Fire plus already hot equals uncomfortable. Skip.' },
      { condition: 'drought', risk: 'Check local fire restrictions. Wildfire risk may ban all fires.' }
    ]
  },
  fishing: {
    category: 'hobby',
    intensity: 'low',
    idealConditions: {
      temp: [10, 28],
      wind: [0, 15],
      humidity: [30, 70],
      uvIndex: [0, 6],
      precipitation: [0, 2]
    },
    tips: [
      'Fish feed most actively at dawn and dusk',
      'Overcast days: fish spread out and feed longer',
      'Light rain: good fishing (fish become more active, insects fall in water)',
      'Barometric pressure dropping: fish feed more actively (pre-storm feeding)',
      'Wind: cast into wind (wind pushes baitfish toward shore)',
      'Safety: always wear life jacket in boat. Sunscreen and hat essential.'
    ],
    warnings: [
      { condition: 'thunderstorm', risk: 'Lightning on water = extreme danger. Get off water immediately.' },
      { condition: 'wind > 25', risk: 'Difficult to cast. Dangerous in boat. Stay ashore.' },
      { condition: 'uvIndex > 7', risk: 'Glare from water increases UV exposure. Polarized glasses and SPF 50.' }
    ]
  }
};

// ============================================================================
// ENHANCED PET SAFETY CALCULATOR
// ============================================================================

function getPetSafety(data) {
  const { temp, humidity, pavementTemp, condition, uvIndex } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'low';
  
  advice.push("PET SAFETY ASSESSMENT:");
  
  // Heat danger for pets
  if (temp > 32) {
    riskLevel = 'extreme';
    warnings.push("EXTREME HEAT DANGER: Heat stroke risk for pets");
    advice.push("  • Do NOT walk dogs when temperature exceeds 32°C");
    advice.push("  • Flat-faced breeds (bulldogs, pugs, boxers) are at highest risk");
    advice.push("  • Signs of heat stroke: excessive panting, drooling, lethargy, vomiting");
    advice.push("  • Emergency cooling: room temperature water (not ice). Vet immediately.");
    advice.push("  • Brachycephalic breeds can die from heat stroke in 15-20 minutes");
    
  } else if (temp > 28) {
    riskLevel = 'high';
    warnings.push("HIGH HEAT: Limit pet exercise");
    advice.push("  • Walk early morning (before 8am) or late evening (after 8pm)");
    advice.push("  • Bring water and collapsible bowl for every walk");
    advice.push("  • Watch for excessive panting - take breaks in shade");
    advice.push("  • Never leave pet in car - even with windows cracked");
    
  } else if (temp > 24) {
    riskLevel = 'moderate';
    advice.push("  • Warm conditions: moderate exercise OK with water available");
    advice.push("  • Avoid midday sun exposure");
    advice.push("  • Consider shorter walks (20-30 minutes instead of 45+)");
  }
  
  // Pavement temperature
  if (pavementTemp > 50) {
    warnings.push(`EXTREME PAVEMENT ${pavementTemp}°C: Paws burn in under 30 seconds`);
    advice.push("  • Walk on grass only or use dog booties");
    advice.push("  • Carry dog if pavement cannot be avoided");
    advice.push("  • Check paw pads after walk for redness, blisters, or damage");
    
  } else if (pavementTemp > 45) {
    warnings.push(`HOT PAVEMENT ${pavementTemp}°C: Paws burn in 60 seconds`);
    advice.push("  • Walk on grass or shaded areas");
    advice.push("  • Test with back of hand - 5 seconds too hot = too hot for paws");
    advice.push("  • Consider dog booties or Musher's Secret paw wax");
    
  } else if (pavementTemp > 40) {
    advice.push(`  Pavement ${pavementTemp}°C: Caution for extended walks`);
    advice.push("  • Stick to grass or shaded pavement");
    advice.push("  • Keep walks under 30 minutes");
  }
  
  // Cold danger
  if (temp < -5) {
    riskLevel = 'extreme';
    warnings.push("EXTREME COLD: Frostbite risk for pets");
    advice.push("  • Limit outdoor time to 5-10 minutes maximum");
    advice.push("  • Dog booties and coat for short-haired breeds");
    advice.push("  • Check paws for ice balls between toes after coming inside");
    advice.push("  • Antifreeze is lethal poison with sweet taste. Keep away from pets.");
    advice.push("  • Young, old, and small breed dogs are most vulnerable");
    
  } else if (temp < 0) {
    riskLevel = 'high';
    warnings.push("COLD: Extended exposure dangerous");
    advice.push("  • Short-haired dogs need coats or sweaters");
    advice.push("  • Booties recommended for walks over 15 minutes");
    advice.push("  • Watch for shivering or lifting paws = too cold");
    
  } else if (temp < 5) {
    advice.push("  • Cool: OK for walks but monitor for shivering");
    advice.push("  • Small and short-haired breeds may need extra layers");
  }
  
  // Thunderstorm
  if (condition === 'thunderstorm') {
    riskLevel = 'extreme';
    warnings.push("THUNDERSTORM: Keep pets inside");
    advice.push("  • Many pets are terrified. Create safe space (crate, interior room)");
    advice.push("  • Thunder shirt or wrap may help anxiety");
    advice.push("  • Microchip and collar on in case they bolt");
    advice.push("  • NEVER tie dog outside during storm");
    advice.push("  • Some pets need anti-anxiety medication - discuss with vet");
  }
  
  // UV protection for pets
  if (uvIndex > 7) {
    advice.push("  • UV protection: pets can get sunburn too");
    advice.push("  • White or light-colored, short-haired pets are most at risk");
    advice.push("  • Apply pet-safe sunscreen to nose and ear tips");
    advice.push("  • Provide shade and limit sun exposure between 10am-4pm");
  }
  
  // Hydration reminder
  if (temp > 20) {
    advice.push("  • HYDRATION: Always carry water for your pet");
    advice.push("  • Offer water every 15-20 minutes during exercise");
    advice.push("  • Dogs should drink 1 ounce per pound of body weight daily");
  }
  
  return { advice, warnings, riskLevel };
}

// ============================================================================
// ENHANCED MENTAL HEALTH & WELLNESS CORRELATIONS
// ============================================================================

function getMentalWellnessAdvice(data) {
  const { temp, condition, humidity, wind, uvIndex, visibility, season, cloudCover, precipitation } = data;
  const advice = [];
  const tips = [];
  
  advice.push("MENTAL WELLNESS AND WEATHER:");
  
  // Sunlight and mood
  if (condition === 'clear' && uvIndex > 2 && visibility > 8) {
    tips.push("  • Sunny day equals natural serotonin boost");
    tips.push("  • 15-30 minutes morning sunlight regulates circadian rhythm");
    tips.push("  • Outdoor time today improves mood and reduces anxiety");
    tips.push("  • Walk in nature: 20 minutes reduces cortisol (stress hormone)");
    tips.push("  • Spend at least 15 minutes outside even if just sitting");
    
  } else if (condition === 'partly-cloudy' && uvIndex > 2) {
    tips.push("  • Partly cloudy: good for outdoor time without harsh sun");
    tips.push("  • Still getting beneficial light exposure");
    tips.push("  • Good day for moderate outdoor activity");
    
  } else if (condition === 'overcast' || condition === 'cloudy' || precipitation > 0) {
    tips.push("  • Gray day may affect mood. This is normal and temporary.");
    tips.push("  • Light therapy lamp: 30 minutes in morning if feeling low");
    tips.push("  • Brief walk outside still provides natural light exposure");
    tips.push("  • Cozy activities: read, cook, call a friend. Embrace hygge.");
    tips.push("  • Bright indoor lighting can help compensate for lack of sunlight");
    tips.push("  • Watch a nature documentary or listen to nature sounds");
  }
  
  // Seasonal affective
  if (season === 'winter' && (condition === 'overcast' || visibility < 5 || cloudCover > 70)) {
    tips.push("  • Winter plus gray equals potential Seasonal Affective Disorder symptoms");
    tips.push("  • Vitamin D supplement: discuss dosage with doctor (typically 800-2000 IU daily)");
    tips.push("  • Light therapy: 10,000 lux lamp, 30 minutes before 9am");
    tips.push("  • Exercise: even 15 minutes indoor workout boosts mood");
    tips.push("  • Social connection is extra important in winter months");
  }
  
  // Temperature and mood
  if (temp > 32) {
    tips.push("  • Extreme heat: irritability and fatigue are common");
    tips.push("  • Stay cool: AC, cool shower, ice water");
    tips.push("  • Reduced cognitive function in heat - go easy on yourself");
    tips.push("  • Avoid making important decisions in extreme heat");
    
  } else if (temp < 0) {
    tips.push("  • Extreme cold can cause winter blues");
    tips.push("  • Keep warm: layers, warm drinks, movement");
    tips.push("  • Cabin fever risk - find indoor activities and social connection");
  }
  
  // Wind and anxiety
  if (wind > 30) {
    tips.push("  • Strong wind can increase anxiety and agitation in some people");
    tips.push("  • White noise machine can mask wind sound at night");
    tips.push("  • Weighted blanket provides calming effect");
    tips.push("  • Reduce exposure to wind if it causes anxiety");
    
  } else if (wind > 20) {
    tips.push("  • Breezy conditions: can be stimulating and refreshing");
    tips.push("  • Wind can make you feel more alert and energetic");
  }
  
  // Humidity and mood
  if (humidity > 80) {
    tips.push("  • High humidity: can make you feel sluggish and lethargic");
    tips.push("  • Dehumidifier helps maintain comfort");
    tips.push("  • Stay hydrated - humidity increases sweating");
    
  } else if (humidity < 25) {
    tips.push("  • Low humidity: can cause dry skin, eyes, and respiratory irritation");
    tips.push("  • Use humidifier indoors");
    tips.push("  • Drink extra water to prevent dehydration");
  }
  
  // Nature connection
  advice.push("  • Connection to nature reduces stress even in poor weather");
  advice.push("  • 5 minutes of nature exposure reduces stress hormones 15%");
  advice.push("  • Even looking at photos of nature reduces stress");
  advice.push("  • Houseplants improve indoor air quality and mood");
  
  return { advice, tips };
}

// ============================================================================
// ENHANCED SLEEP QUALITY PREDICTOR
// ============================================================================

function getSleepQualityAdvice(data) {
  const { temp, tempMin, humidity, condition, wind, pressure, pressureTrend, moonPhase, cloudCover } = data;
  const advice = [];
  const warnings = [];
  let score = 5; // out of 10
  let factors = [];
  
  advice.push("SLEEP QUALITY FORECAST TONIGHT:");
  
  // Optimal sleep temperature
  const nightTemp = tempMin || (temp - 8);
  
  if (nightTemp >= 16 && nightTemp <= 19) {
    advice.push(`  Temperature: ${Math.round(nightTemp)}°C - PERFECT for sleep`);
    advice.push("  • Optimal sleep temperature range is 16-19°C");
    advice.push("  • This is the ideal temperature for deep sleep");
    score += 2;
    factors.push('Ideal sleep temperature');
    
  } else if (nightTemp >= 14 && nightTemp <= 22) {
    advice.push(`  Temperature: ${Math.round(nightTemp)}°C - GOOD for sleep`);
    advice.push("  • Acceptable range for most people");
    advice.push("  • Adjust bedding accordingly");
    score += 1;
    factors.push('Good sleep temperature');
    
  } else if (nightTemp > 24) {
    advice.push(`  Temperature: ${Math.round(nightTemp)}°C - TOO WARM for optimal sleep`);
    advice.push("  • Sleep is difficult in heat (increased wakefulness)");
    advice.push("  • Use fan or AC to cool bedroom");
    advice.push("  • Cotton sheets (no synthetic fabrics). Light blanket or none.");
    advice.push("  • Cool shower before bed lowers core body temperature");
    advice.push("  • Keep feet cool (or warm) - heat dissipates through feet");
    score -= 2;
    factors.push('Too warm for sleep');
    
  } else if (nightTemp < 10) {
    advice.push(`  Temperature: ${Math.round(nightTemp)}°C - COOL but comfortable with proper bedding`);
    advice.push("  • Flannel sheets, heavier blanket recommended");
    advice.push("  • Warm feet equals faster sleep onset (socks or hot water bottle)");
    advice.push("  • Layer bedding so you can adjust during the night");
    score += 0;
    factors.push('Cool - need warm bedding');
    
  } else if (nightTemp < 0) {
    advice.push(`  Temperature: ${Math.round(nightTemp)}°C - VERY COLD`);
    advice.push("  • Seal drafts around windows and doors");
    advice.push("  • Electric blanket (with auto-off for safety)");
    advice.push("  • Humidifier: cold air plus heating equals very dry air");
    advice.push("  • Consider extra blanket layers for weight (calming effect)");
    score -= 1;
    factors.push('Very cold - sleep may be disturbed');
  }
  
  // Humidity
  if (humidity > 80) {
    advice.push("  • HIGH HUMIDITY: Stuffy feeling, difficulty breathing");
    advice.push("  • Dehumidifier or AC helps");
    advice.push("  • Sleep quality reduced in high humidity");
    score -= 1;
    factors.push('High humidity');
    
  } else if (humidity < 30) {
    advice.push("  • LOW HUMIDITY: Dry throat and nose, possible snoring");
    advice.push("  • Humidifier recommended to maintain 40-50%");
    advice.push("  • Keep water by bed to drink if you wake up");
    score -= 1;
    factors.push('Low humidity');
    
  } else {
    advice.push("  • Humidity: ${Math.round(humidity)}% - GOOD range for sleep");
    factors.push('Good humidity level');
  }
  
  // Pressure effects
  if (pressureTrend === 'falling_rapidly') {
    advice.push("  • RAPIDLY FALLING PRESSURE: May affect sleep quality");
    advice.push("  • Some people experience headaches or sinus pressure");
    advice.push("  • Can cause restless sleep and vivid dreams");
    score -= 1;
    factors.push('Pressure drop may disrupt sleep');
    
  } else if (pressureTrend === 'rising_rapidly') {
    advice.push("  • RAPIDLY RISING PRESSURE: Stable sleep pattern expected");
    factors.push('Stable pressure good for sleep');
  }
  
  // Rain sound
  if (condition === 'rain' && wind < 20) {
    advice.push("  • RAIN SOUNDS: Natural white noise. Excellent sleep aid.");
    advice.push("  • Rain sounds improve sleep quality and duration");
    score += 1;
    factors.push('Rain sounds promote sleep');
  }
  
  // Wind noise
  if (wind > 30) {
    advice.push("  • STRONG WIND: May disrupt sleep with noise and anxiety");
    advice.push("  • Earplugs or white noise machine recommended");
    advice.push("  • Weighted blanket can help with anxiety");
    score -= 1;
    factors.push('Wind may disturb sleep');
    
  } else if (wind > 20) {
    advice.push("  • MODERATE WIND: Some noise possible. White noise may help");
  }
  
  // Moon effect
  if (moonPhase === 'Full Moon') {
    advice.push("  • FULL MOON: Some people report reduced sleep quality");
    advice.push("  • If light is an issue, use blackout curtains or sleep mask");
    score -= 1;
    factors.push('Full moon may affect sleep');
  }
  
  // Cloud cover
  if (cloudCover < 20) {
    advice.push("  • CLEAR NIGHT: Good for natural melatonin production");
    advice.push("  • Close curtains for darkness");
    factors.push('Clear night good for sleep');
    
  } else if (cloudCover > 80) {
    advice.push("  • OVERCAST NIGHT: May affect melatonin production");
    advice.push("  • Ensure room is completely dark");
    factors.push('Overcast - ensure dark room');
  }
  
  // Overall score
  score = Math.max(1, Math.min(10, score));
  
  let rating = '';
  if (score >= 8) rating = 'EXCELLENT';
  else if (score >= 6) rating = 'GOOD';
  else if (score >= 4) rating = 'FAIR';
  else rating = 'POOR';
  
  advice.push("");
  advice.push(`  OVERALL SLEEP QUALITY: ${rating} (${score}/10)`);
  
  if (score >= 8) {
    advice.push("  • Expect deep, restorative sleep tonight");
    advice.push("  • Conditions are optimal for sleep");
    
  } else if (score >= 6) {
    advice.push("  • Good sleep expected with minor adjustments");
    advice.push("  • Follow recommendations above for best results");
    
  } else if (score >= 4) {
    advice.push("  • Sleep may be disturbed. Take extra steps for comfort.");
    advice.push("  • Create a relaxing bedtime routine");
    
  } else {
    warnings.push("Sleep conditions difficult. Prepare with extra comfort measures.");
    advice.push("  • Consider earplugs, eye mask, and extra blankets");
    advice.push("  • White noise may help mask disruptive sounds");
  }
  
  return { advice, warnings, score, rating, factors };
}

// ============================================================================
// ENHANCED PRODUCTIVITY & COGNITIVE PERFORMANCE
// ============================================================================

function getProductivityAdvice(data) {
  const { temp, humidity, condition, aqi, wind, timeOfDay, season } = data;
  const advice = [];
  const tips = [];
  let productivityScore = 5;
  
  advice.push("PRODUCTIVITY AND COGNITIVE PERFORMANCE:");
  
  // Temperature effects on cognition
  if (temp >= 20 && temp <= 22) {
    productivityScore = 9;
    advice.push(`  Optimal cognitive temperature: ${Math.round(temp)}°C`);
    advice.push("  • Best focus, accuracy, and decision-making at this temperature");
    advice.push("  • Maximum productivity conditions today");
    
  } else if (temp >= 18 && temp <= 24) {
    productivityScore = 8;
    advice.push(`  Temperature: ${Math.round(temp)}°C - good for cognitive work`);
    advice.push("  • Good focus and productivity conditions");
    
  } else if (temp > 28) {
    productivityScore = 4;
    advice.push(`  HEAT: ${Math.round(temp)}°C reduces cognitive performance 10-15%`);
    tips.push("  • Tackle complex tasks in the morning when cooler");
    tips.push("  • Work in air conditioning if possible");
    tips.push("  • Take frequent breaks (5 min every 25 min)");
    tips.push("  • Stay hydrated - dehydration worsens cognitive decline");
    tips.push("  • Decision fatigue increases in heat");
    
  } else if (temp > 25) {
    productivityScore = 6;
    advice.push(`  WARM: ${Math.round(temp)}°C - slight cognitive impact`);
    tips.push("  • Work in well-ventilated area");
    tips.push("  • Take more breaks than usual");
    
  } else if (temp < 15) {
    productivityScore = 6;
    advice.push(`  COOL: ${Math.round(temp)}°C - reduced manual dexterity`);
    tips.push("  • Warm hands = better typing and fine motor skills");
    tips.push("  • Fingerless gloves can help if typing in cold");
    
  } else if (temp < 10) {
    productivityScore = 5;
    advice.push(`  COLD: ${Math.round(temp)}°C - cognitive performance reduced`);
    tips.push("  • Focus on indoor work with proper heating");
    tips.push("  • Warm drinks help maintain core temperature");
    tips.push("  • Layer clothing to stay comfortable");
  }
  
  // Humidity effects
  if (humidity > 80) {
    productivityScore -= 1;
    tips.push("  • HIGH HUMIDITY: Feelings of lethargy and reduced concentration");
    tips.push("  • Dehumidifier improves comfort and focus");
    
  } else if (humidity < 25) {
    productivityScore -= 1;
    tips.push("  • LOW HUMIDITY: Dry eyes, irritated throat, reduced comfort");
    tips.push("  • Use humidifier or keep water nearby");
  }
  
  // Air quality effects
  if (aqi > 100) {
    productivityScore -= 2;
    tips.push("  • POOR AIR QUALITY: Reduced cognitive function");
    tips.push("  • HEPA air purifier recommended indoors");
    tips.push("  • Avoid outdoor work if possible");
    
  } else if (aqi > 50) {
    productivityScore -= 1;
    tips.push("  • MODERATE AIR QUALITY: Slight cognitive impact");
    tips.push("  • Consider air purifier for office or home workspace");
  }
  
  // Weather and focus
  if (condition === 'rain' && wind < 15) {
    tips.push("  • RAIN SOUNDS: Many find this focusing (pink noise effect)");
    tips.push("  • Good day for deep work and concentration");
    productivityScore += 1;
    
  } else if (condition === 'clear' && temp < 25) {
    tips.push("  • CLEAR WEATHER: Natural mood boost, good for creative work");
    tips.push("  • Take a brief walk break to maintain focus");
  }
  
  // Time of day effects
  if (timeOfDay === 'morning') {
    advice.push("  • MORNING: Peak cognitive performance hours (9am-12pm)");
    advice.push("  • Tackle most difficult tasks now");
    
  } else if (timeOfDay === 'afternoon') {
    advice.push("  • AFTERNOON: Post-lunch dip (2pm-4pm)");
    advice.push("  • Use this time for routine tasks, save complex work for morning");
    advice.push("  • Brief walk after lunch improves afternoon focus");
    
  } else if (timeOfDay === 'evening') {
    advice.push("  • EVENING: Creative tasks often better in evening");
    advice.push("  • Cognitive stamina lower - focus on routine or creative work");
  }
  
  // Overall productivity score
  productivityScore = Math.max(1, Math.min(10, Math.round(productivityScore)));
  
  let rating = '';
  if (productivityScore >= 8) rating = 'EXCELLENT';
  else if (productivityScore >= 6) rating = 'GOOD';
  else if (productivityScore >= 4) rating = 'FAIR';
  else rating = 'POOR';
  
  advice.push(`  • OVERALL PRODUCTIVITY: ${rating} (${productivityScore}/10)`);
  
  return { advice, tips, productivityScore, rating };
}

// ============================================================================
// ENHANCED MAIN LIFESTYLE ADVICE FUNCTION
// ============================================================================

export const getLifestyleAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, condition, humidity, wind, windGust, 
    uvIndex, aqi, conditionCode, sunrise, sunset, city,
    visibility, dewPoint, tempMin, tempMax, pressure,
    precipitation, moonPhase, pollenIndex, cloudCover
  } = data;
  
  const q = question.toLowerCase();
  
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
  const uvLevel = getUVLevel(uvIndex);
  
  // Detect activities from question
  let detectedActivities = [];
  
  const activityKeywords = {
    'running': ['run', 'jog', 'sprint', 'marathon'],
    'walking': ['walk', 'stroll', 'hike', 'amble'],
    'cycling': ['cycl', 'bike', 'ride', 'mountain bike'],
    'dog_walking': ['dog', 'pet', 'puppy', 'canine'],
    'playground': ['playground', 'kids', 'child', 'swing', 'slide'],
    'gardening': ['garden', 'plant', 'lawn', 'mow', 'weed', 'shovel'],
    'outdoor_dining': ['dinner', 'lunch', 'eat', 'patio', 'picnic', 'brunch'],
    'meditation_yoga_outdoor': ['yoga', 'meditat', 'tai chi', 'breath', 'relax'],
    'photography_walk': ['photo', 'camera', 'shoot', 'lens'],
    'stargazing_backyard': ['star', 'night sky', 'constellation', 'astronomy'],
    'bird_watching': ['bird', 'wildlife', 'feather', 'migration'],
    'grilling': ['grill', 'bbq', 'barbecue', 'cookout', 'smoker'],
    'laundry_drying': ['laundry', 'dry clothes', 'hang clothes', 'clothesline'],
    'car_washing': ['car wash', 'wash car', 'detail car'],
    'swimming_outdoor': ['swim', 'pool', 'ocean', 'lake', 'paddle'],
    'reading_outside': ['read', 'book', 'kindle'],
    'bonfire': ['bonfire', 'campfire', 'fire pit', 's\'more'],
    'fishing': ['fish', 'catch', 'angler']
  };
  
  for (const [activity, keywords] of Object.entries(activityKeywords)) {
    for (const keyword of keywords) {
      if (q.includes(keyword)) {
        detectedActivities.push(activity);
        break;
      }
    }
  }
  
  if (detectedActivities.length === 0) {
    detectedActivities = ['walking', 'outdoor_dining', 'gardening'];
  }
  
  // Remove duplicates
  detectedActivities = [...new Set(detectedActivities)];
  
  // Get all advice modules
  const petSafety = q.includes('dog') || q.includes('pet') ? getPetSafety(data) : null;
  const wellness = getMentalWellnessAdvice(data);
  const sleep = getSleepQualityAdvice(data);
  const productivity = getProductivityAdvice(data);
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "OUTDOOR ACTIVITY WEATHER ASSESSMENT",
    "RECREATION AND LIFESTYLE FORECAST",
    "ACTIVITY WEATHER ADVISORY",
    "LEISURE WEATHER REPORT",
    "LIFESTYLE CONDITIONS ANALYSIS"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  response += `  Condition: ${condition || 'Unknown'}\n`;
  response += `  Wind: ${Math.round(wind)} km/h (gusts to ${Math.round(windGust || wind + 5)} km/h)\n`;
  response += `  Humidity: ${Math.round(humidity)}% (${humidity > 70 ? 'HIGH' : humidity < 30 ? 'LOW' : 'MODERATE'})\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel}) - burn time ~${burnMin} minutes\n`;
  if (pavementTemp > 35) response += `  Pavement temp: ${Math.round(pavementTemp)}°C\n`;
  response += `  Air Quality: AQI ${aqi} (${getAQICategory(aqi)})\n`;
  if (pollenLevel > 3) response += `  Pollen: ${pollenLevel}/10 (${pollenLevel > 7 ? 'HIGH' : pollenLevel > 4 ? 'MODERATE' : 'LOW'})\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm\n`;
  response += `  Season: ${season.charAt(0).toUpperCase() + season.slice(1)}\n`;
  response += `  Time: ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}\n`;
  response += `  Daylight: ${dayLength || 'N/A'} hours\n`;
  response += `\n`;
  
  // Overall verdict
  response += `=== OVERALL VERDICT ===\n`;
  
  if (condition === 'thunderstorm') {
    response += `  THUNDERSTORM: All outdoor activities cancelled.\n`;
    response += `  Lightning risk is severe. Stay indoors.\n`;
  } else if (wind > 50) {
    response += `  DANGEROUS WIND: Outdoor activities unsafe.\n`;
    response += `  Flying debris and falling trees. Stay inside.\n`;
  } else if (aqi > 200) {
    response += `  HAZARDOUS AIR: Stay indoors.\n`;
    response += `  Even healthy individuals at risk from air pollution.\n`;
  } else if (comfort === "Perfect" && aqi < 50) {
    response += `  PERFECT CONDITIONS for outdoor activities.\n`;
    response += `  Whatever you are planning - today is the day.\n`;
  } else if (comfort === "Good") {
    response += `  GOOD CONDITIONS for most outdoor activities.\n`;
    response += `  Minor adjustments may be needed.\n`;
  } else if (effectiveTemp > 35) {
    response += `  EXTREME HEAT: Limit outdoor time. Hydrate constantly.\n`;
    response += `  Heat exhaustion risk is high. Be careful.\n`;
  } else if (effectiveTemp < -10) {
    response += `  EXTREME COLD: Limit outdoor exposure. Bundle up.\n`;
    response += `  Frostbite risk. Keep skin covered.\n`;
  } else if (comfort === "Poor") {
    response += `  CHALLENGING CONDITIONS: Activities possible but uncomfortable.\n`;
    response += `  Consider indoor alternatives or shorter duration.\n`;
  } else {
    response += `  MODERATE CONDITIONS: Outdoor activities possible with preparation.\n`;
    response += `  Follow specific recommendations below.\n`;
  }
  response += `\n`;
  
  // Comfort details
  response += `=== COMFORT ANALYSIS ===\n`;
  response += `  Comfort score: ${comfort}\n`;
  if (effectiveTemp > 27) {
    response += `  Heat index: ${Math.round(heatIndex)}°C\n`;
  } else if (effectiveTemp < 10) {
    response += `  Wind chill: ${Math.round(windChill)}°C\n`;
  }
  
  if (pavementTemp > 40) {
    response += `  PAVEMENT WARNING: ${Math.round(pavementTemp)}°C - burns skin in seconds!\n`;
    response += `  Walk on grass only. Wear shoes. Dog booties required.\n`;
  }
  response += `\n`;
  
  // Timing advice
  response += `=== TIMING RECOMMENDATIONS ===\n`;
  if (temp > 28 && (timeOfDay === 'midday' || timeOfDay === 'afternoon')) {
    response += `  Best time: before 10am or after 5pm to avoid peak heat.\n`;
  }
  if (uvIndex > 6) {
    response += `  UV peaks 10am-3pm. Plan outdoor time for morning or late afternoon.\n`;
  }
  if (sunPosition === 'golden_hour') {
    response += `  GOLDEN HOUR: The most beautiful light of the day is now!\n`;
    response += `  Perfect for walks, photos, outdoor dining.\n`;
  }
  if (sunrise) {
    response += `  Sunrise: ${sunrise} | Sunset: ${sunset}\n`;
    response += `  Daylight available: ${dayLength} hours\n`;
  }
  response += `\n`;
  
  // Activity-specific advice
  response += `=== ACTIVITY RECOMMENDATIONS ===\n`;
  for (const activity of detectedActivities) {
    const config = ACTIVITIES[activity];
    if (!config) continue;
    
    const activityName = activity.replace(/_/g, ' ').toUpperCase();
    response += `  ${activityName}:\n`;
    
    // Check suitability
    const isSuitable = checkActivitySuitability(activity, data);
    if (isSuitable === 'perfect') {
      response += `    PERFECT conditions for ${activityName}\n`;
    } else if (isSuitable === 'good') {
      response += `    GOOD conditions for ${activityName}\n`;
    } else if (isSuitable === 'marginal') {
      response += `    MARGINAL conditions - proceed with caution\n`;
    } else {
      response += `    NOT RECOMMENDED - conditions unsafe\n`;
    }
    
    // Tips
    if (config.tips) {
      const shuffledTips = config.tips.slice().sort(() => Math.random() - 0.5);
      shuffledTips.slice(0, 3).forEach(tip => {
        response += `      - ${tip}\n`;
      });
    }
    
    // Warnings
    if (config.warnings) {
      for (const warning of config.warnings) {
        if (evalWarning(warning.condition, data)) {
          response += `      WARNING: ${warning.risk}\n`;
        }
      }
    }
    response += `\n`;
  }
  
  // Pet safety
  if (petSafety) {
    response += `=== PET SAFETY ===\n`;
    response += `  Risk level: ${petSafety.riskLevel.toUpperCase()}\n`;
    petSafety.advice.forEach(a => response += `${a}\n`);
    petSafety.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Wellness
  response += `=== MENTAL WELLNESS ===\n`;
  wellness.advice.forEach(a => response += `${a}\n`);
  wellness.tips.slice(0, 4).forEach(t => response += `${t}\n`);
  response += `\n`;
  
  // Sleep
  response += `=== SLEEP QUALITY ===\n`;
  sleep.advice.forEach(a => response += `${a}\n`);
  sleep.warnings.forEach(w => response += `  ${w}\n`);
  response += `\n`;
  
  // Productivity
  if (q.includes('work') || q.includes('productivity') || q.includes('focus') || q.includes('study')) {
    response += `=== PRODUCTIVITY ===\n`;
    response += `  Score: ${productivity.productivityScore}/10 (${productivity.rating})\n`;
    productivity.advice.forEach(a => response += `${a}\n`);
    productivity.tips.slice(0, 4).forEach(t => response += `${t}\n`);
    response += `\n`;
  }
  
  // General tips
  response += `=== GENERAL TIPS ===\n`;
  if (effectiveTemp > 30) {
    response += `  HYDRATION: Drink 500ml water per hour when active outdoors.\n`;
    response += `  Use cooling towels. Seek shade every 30 minutes.\n`;
    response += `  Know heat exhaustion signs: nausea, dizziness, headache, cool clammy skin.\n`;
  } else if (effectiveTemp < 5) {
    response += `  COLD WEATHER: Layer up with moisture-wicking base, insulating mid, windproof outer.\n`;
    response += `  Protect extremities: fingers, toes, ears, nose.\n`;
    response += `  Know hypothermia signs: shivering, confusion, slurred speech.\n`;
  }
  
  if (wind > 20) {
    response += `  WIND: Wind chill makes it feel colder. Dress for feels-like temperature.\n`;
  }
  
  if (uvIndex > 6) {
    response += `  UV PROTECTION: SPF 50+, hat, sunglasses. Reapply every 2 hours.\n`;
  }
  
  if (aqi > 100) {
    response += `  AIR QUALITY: Consider N95 mask for outdoor exposure.\n`;
  }
  response += `\n`;
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (condition === 'thunderstorm' || wind > 50 || aqi > 200) {
    response += `  STAY INDOORS. Conditions unsafe for outdoor activities.\n`;
    response += `  Reschedule plans for better weather.\n`;
  } else if (comfort === "Perfect" && aqi < 50) {
    response += `  PERFECT WEATHER. Get outside and enjoy!\n`;
    response += `  Today is the best day for outdoor plans.\n`;
  } else if (comfort === "Good") {
    response += `  GREAT WEATHER for outdoor activities with minor adjustments.\n`;
    response += `  Follow recommendations above for best experience.\n`;
  } else if (effectiveTemp > 32 || effectiveTemp < -5) {
    response += `  EXTREME TEMPERATURES. Shorten outdoor time and take precautions.\n`;
    response += `  Safety first - know when to go inside.\n`;
  } else {
    response += `  ACCEPTABLE CONDITIONS with preparation.\n`;
    response += `  Follow tips above for a comfortable outdoor experience.\n`;
  }
  
  const wisdom = [
    "Time spent in nature is never wasted.",
    "In every walk with nature, one receives far more than he seeks.",
    "The outdoors is the best therapy.",
    "Fresh air and sunshine: the original medicine.",
    "Nature does not hurry, yet everything is accomplished.",
    "Walk as if you are kissing the Earth with your feet."
  ];
  response += `\n--- WISDOM ---\n${random(wisdom)}`;
  
  return response;
};

// ============================================================================
// HELPER: CHECK ACTIVITY SUITABILITY
// ============================================================================

function checkActivitySuitability(activityKey, data) {
  const config = ACTIVITIES[activityKey];
  if (!config) return 'unknown';
  
  const { temp, wind, humidity, uvIndex, aqi, precipitation, pavementTemp } = data;
  const ideal = config.idealConditions;
  
  let perfectCount = 0;
  let goodCount = 0;
  let totalCount = 0;
  
  if (ideal.temp) {
    totalCount++;
    if (temp >= ideal.temp[0] && temp <= ideal.temp[1]) perfectCount++;
    else if (temp >= ideal.temp[0] - 3 && temp <= ideal.temp[1] + 3) goodCount++;
  }
  
  if (ideal.wind) {
    totalCount++;
    if (wind >= ideal.wind[0] && wind <= ideal.wind[1]) perfectCount++;
    else if (wind >= ideal.wind[0] - 5 && wind <= ideal.wind[1] + 5) goodCount++;
  }
  
  if (ideal.humidity) {
    totalCount++;
    if (humidity >= ideal.humidity[0] && humidity <= ideal.humidity[1]) perfectCount++;
    else if (humidity >= ideal.humidity[0] - 10 && humidity <= ideal.humidity[1] + 10) goodCount++;
  }
  
  if (ideal.uvIndex) {
    totalCount++;
    if (uvIndex >= ideal.uvIndex[0] && uvIndex <= ideal.uvIndex[1]) perfectCount++;
    else if (uvIndex >= ideal.uvIndex[0] - 2 && uvIndex <= ideal.uvIndex[1] + 2) goodCount++;
  }
  
  if (ideal.aqi) {
    totalCount++;
    if (aqi >= ideal.aqi[0] && aqi <= ideal.aqi[1]) perfectCount++;
    else if (aqi >= ideal.aqi[0] - 20 && aqi <= ideal.aqi[1] + 20) goodCount++;
  }
  
  if (ideal.pavementTemp && pavementTemp !== undefined) {
    totalCount++;
    if (pavementTemp >= ideal.pavementTemp[0] && pavementTemp <= ideal.pavementTemp[1]) perfectCount++;
    else if (pavementTemp >= ideal.pavementTemp[0] - 5 && pavementTemp <= ideal.pavementTemp[1] + 5) goodCount++;
  }
  
  if (ideal.precipitation && precipitation !== undefined) {
    totalCount++;
    if (precipitation >= ideal.precipitation[0] && precipitation <= ideal.precipitation[1]) perfectCount++;
    else if (precipitation >= ideal.precipitation[0] - 1 && precipitation <= ideal.precipitation[1] + 1) goodCount++;
  }
  
  const ratio = perfectCount / totalCount;
  
  if (ratio >= 0.8) return 'perfect';
  if (ratio >= 0.5) return 'good';
  if (ratio >= 0.3) return 'marginal';
  return 'poor';
}

// ============================================================================
// HELPER: EVALUATE WARNING CONDITIONS
// ============================================================================

function evalWarning(condition, data) {
  const { temp, wind, aqi, uvIndex, pavementTemp, condition: weatherCondition, humidity, visibility, cloudCover, moonPhase, precipitation } = data;
  
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
    'rain_heavy': weatherCondition === 'rain' && (precipitation || 0) > 10,
    'ice': temp < 2 && (weatherCondition === 'rain' || weatherCondition === 'snow' || weatherCondition === 'drizzle'),
    'harsh_midday': data.timeOfDay === 'midday' && uvIndex > 5,
    'direct_sun': weatherCondition === 'clear' && uvIndex > 3,
    'full_moon': moonPhase === 'Full Moon',
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

export { 
  getPetSafety, 
  getMentalWellnessAdvice, 
  getSleepQualityAdvice, 
  getProductivityAdvice,
  ACTIVITIES
};

export default getLifestyleAdvice;
