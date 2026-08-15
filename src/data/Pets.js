import {
  calcHeatIndex,
  calcWindChill,
  getBurnTime,
  getComfortScore,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  getPavementTemp,
  getPollenIndex,
  getPressureTrend,
  getVisibilityCategory
} from './calculations';

// ============================================================================
// COMPREHENSIVE PET WEATHER SAFETY & WELLNESS ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  // DOGS
  "Is it safe to walk my dog?",
  "Can my dog play outside?",
  "Can I jog with my dog?",
  "Should I bike with my dog?",
  "Is it safe for dog agility outside?",
  "Can I do nose work outdoors?",
  "Is it good weather for herding practice?",
  "Should I cancel my dog's grooming appointment?",
  "Can I take my dog to the beach?",
  "Is it safe for my puppy outside?",
  "Can my senior dog go for a walk?",
  "Is it too hot for my dog?",
  "Is it too cold for my dog?",
  "Should I give my dog extra water today?",
  "Will my dog's arthritis act up?",
  "Is it good weather for dog park?",
  "Should I take my reactive dog out?",
  "Is it too crowded at the park weather-wise?",
  
  // CATS
  "Should I take my cat outside?",
  "Should my cat stay indoors today?",
  "Is my outdoor cat safe tonight?",
  "Should I bring barn cats inside?",
  "Is my cat's asthma worse today?",
  
  // SMALL PETS
  "Is it too hot for my rabbit?",
  "Can my guinea pig go in outdoor run?",
  "Should I bring my turtle inside?",
  "Can I take my ferret for a walk?",
  "Is it too humid for my chinchilla?",
  
  // BIRDS
  "Can my bird go outside in this weather?",
  "Is my aviary weatherproof?",
  "Can I release my rehabbed wildlife?",
  "Will migrating birds stop through?",
  "Should I put out extra bird feed?",
  "Is my bird bath frozen?",
  "Should I bring hummingbird feeders in?",
  
  // HORSES & LIVESTOCK
  "Is it safe for my horse to be ridden?",
  "Should I blanket my horse tonight?",
  "Is my chicken coop weather-safe?",
  "Is my livestock safe in this storm?",
  "Can I turn out my horses?",
  "Should I stall my horses?",
  "Is it good hay-making weather?",
  "Can I ride my horse today?",
  "Is the arena footing good?",
  "Should I worry about colic with weather change?",
  "Is it too hot for my dairy cow?",
  "Will my chickens stop laying?",
  "Should I heat the chicken water?",
  "Is the coop ventilated enough?",
  "Will predators be more active?",
  "Should I bring my goats in?",
  "Is it good shearing weather?",
  
  // PONDS & FISH
  "Should I worry about my fish pond freezing?",
  "Is my pond oxygen level OK?",
  "Should I run the pond aerator?",
  "Will my koi be OK in this heat?",
  "Should I cover my pond?",
  
  // HAZARDS
  "Should I worry about ticks today?",
  "Is it flea weather?",
  "Will my dog get hay fever?",
  "Should I use dog sunscreen?",
  "Is it too windy for a small dog?",
  "Can my dog swim today?",
  "Is the water too cold for my dog?",
  "Should I worry about blue-green algae?",
  "Is it snake weather?",
  "Should I worry about coyotes today?",
  "Will fireworks weather affect my pet?",
  "Is antifreeze a risk today?",
  "Will mushrooms be growing toxic to pets?",
  "Should I worry about toads and frogs?",
  
  // BEES
  "Can I move my beehive today?",
  "Will my bees be aggressive?",
  "Should I open the hive?"
];

// ============================================================================
// ENHANCED PET SPECIES DATABASE
// ============================================================================

const PET_SPECIES = {
  dog: {
    heatRisk: {
      threshold: 24,
      highRisk: 30,
      emergency: 35,
      factors: [
        'Dogs cool primarily through panting, no sweating except paw pads',
        'Body temperature above 41°C means organ damage begins',
        'Heat stroke mortality rate is 50 percent even with treatment',
        'Recovery: dogs that survive may have permanent organ damage',
        'Flat-faced breeds cannot pant effectively and are at highest risk'
      ]
    },
    coldRisk: {
      threshold: 4,
      highRisk: -7,
      emergency: -15,
      factors: [
        'Frostbite affects ears, tail, and paws most',
        'Hypothermia: shivering leads to lethargy then collapse',
        'Small dogs lose heat faster due to higher surface area to volume ratio',
        'Wet fur means 5x faster heat loss',
        'Short-haired breeds need coats below 10°C'
      ]
    },
    breedSpecific: {
      brachycephalic: {
        breeds: ['Pug', 'Bulldog', 'Boxer', 'Boston Terrier', 'Shih Tzu', 'Pekingese', 'French Bulldog'],
        heatRisk: 'EXTREME - Cannot pant effectively. Heat stroke in 15 minutes above 30°C.',
        coldRisk: 'Moderate - Short coat, but respiratory issues in cold dry air.',
        special: 'Never exercise in heat. Air conditioning essential above 28°C.'
      },
      doubleCoated: {
        breeds: ['Husky', 'Malamute', 'Samoyed', 'Akita', 'Chow Chow', 'Pomeranian', 'Shepherd'],
        heatRisk: 'HIGH - Coat insulates both ways but designed for cold. Overheat above 24°C.',
        coldRisk: 'LOW - Built for cold. Can tolerate well below freezing.',
        special: 'Do not shave. Coat protects from heat AND cold. Damaged undercoat will not regrow properly.'
      },
      smallBreed: {
        breeds: ['Chihuahua', 'Toy Poodle', 'Yorkie', 'Maltese', 'Papillon', 'Shih Tzu'],
        heatRisk: 'Moderate - Small body, but can overheat if overexerted.',
        coldRisk: 'HIGH - Lose heat rapidly. Sweater needed below 10°C, coat below 4°C.',
        special: 'Wind chill affects small dogs disproportionately.'
      },
      largeBreed: {
        breeds: ['Great Dane', 'Mastiff', 'St. Bernard', 'Newfoundland', 'Rottweiler'],
        heatRisk: 'HIGH - Large body mass retains heat. Overheat quickly with exercise.',
        coldRisk: 'LOW to Moderate - Large body retains heat. Cold tolerant.',
        special: 'Bloat risk: no exercise 1 hour before or 2 hours after eating. Heat increases risk.'
      },
      sighthound: {
        breeds: ['Greyhound', 'Whippet', 'Italian Greyhound', 'Saluki', 'Borzoi'],
        heatRisk: 'Moderate - Lean body, but thin coat means sunburn risk.',
        coldRisk: 'HIGH - No body fat, thin coat. Sweater essential below 15°C.',
        special: 'Thin skin tears easily. Sunburn on nose, ears, and belly.'
      },
      senior: {
        age: '7+ years varies by breed',
        heatRisk: 'HIGH - Reduced thermoregulation. Arthritis worsens in cold and damp.',
        coldRisk: 'HIGH - Less muscle mass, slower metabolism. Orthopedic pain increases.',
        special: 'Shorter, slower walks. Multiple brief outings are better than one long walk.'
      },
      puppy: {
        age: 'Under 1 year',
        heatRisk: 'HIGH - Cannot regulate temperature well. Overheat and dehydrate faster.',
        coldRisk: 'HIGH - Little body fat. Short outdoor time only.',
        special: 'No forced exercise on hard surfaces due to growing joints. No long walks.'
      }
    },
    pavementSafety: {
      air25: { pavement: 52, risk: 'Burns in 60 seconds', action: 'No walk on pavement' },
      air30: { pavement: 57, risk: 'Burns in 30 seconds', action: 'Grass only, booties recommended' },
      air35: { pavement: 62, risk: 'Burns in 5 seconds', action: 'Do not go outside' }
    },
    walkSchedule: {
      hot: 'Before 8am or after 8pm. 5-10 minute potty breaks midday.',
      cold: 'Midday warmest hours 11am-2pm. Shorter walks, multiple outings.',
      normal: 'Normal schedule. Still bring water on walks over 30 minutes.'
    }
  },
  cat: {
    heatRisk: {
      threshold: 27,
      highRisk: 32,
      emergency: 38,
      factors: [
        'Cats sweat through paw pads only',
        'Cats hide illness - watch for panting which is NOT normal in cats',
        'Also watch for lethargy and vomiting',
        'Outdoor cats need shaded hiding spots and multiple water sources',
        'Indoor cats need AC, fans, cooling mats, and ice cubes in water'
      ]
    },
    coldRisk: {
      threshold: 0,
      highRisk: -7,
      emergency: -15,
      factors: [
        'Outdoor cats need insulated shelter with straw, not hay or blankets which hold moisture',
        'Frostbite affects ear tips and paw pads first',
        'Antifreeze has sweet taste, 1 teaspoon is fatal. Kidney failure in 24-72 hours.',
        'Car engines: cats crawl into warm engines. Honk or bang hood before starting car.'
      ]
    },
    outdoorSafety: [
      'Keep cats indoors during extreme weather',
      'Thunderstorms: cats hide and may get trapped. Bring inside before storm.',
      'Snow: cats can get lost as scent markers are covered. Keep indoors.',
      'Heat: outdoor cats need shade and water. Check hiding spots are not hot like sheds or cars.'
    ]
  },
  rabbit: {
    heatRisk: {
      threshold: 24,
      highRisk: 28,
      emergency: 32,
      factors: [
        'Rabbits cannot sweat or pant effectively',
        'Heat stroke is the number one cause of sudden rabbit death in summer',
        'Ears are radiators: check ear temperature',
        'Cooling methods: frozen water bottles in enclosure, ceramic tiles to lie on',
        'Never put rabbit in cold water as it causes shock'
      ]
    },
    coldRisk: {
      threshold: 0,
      highRisk: -5,
      emergency: -15,
      factors: [
        'Rabbits handle cold better than heat if dry and draft-free',
        'Wet plus cold is deadly. Hutch must be waterproof.',
        'Provide extra hay for burrowing. Cover hutch with blanket or tarp.',
        'Check water bottle has not frozen multiple times daily'
      ]
    }
  },
  bird: {
    heatRisk: {
      threshold: 27,
      highRisk: 32,
      emergency: 38,
      factors: [
        'Birds overheat very quickly due to high metabolism',
        'Signs: wings held away from body, panting, lethargy',
        'Mist with room temperature water not cold. Feet in cool water.',
        'Move cage away from windows to avoid greenhouse effect',
        'Outdoor aviaries need shade cloth, misters, and multiple water sources'
      ]
    },
    coldRisk: {
      threshold: 10,
      highRisk: 0,
      emergency: -10,
      factors: [
        'Tropical birds like parrots cannot tolerate cold. Bring indoors below 15°C.',
        'Drafts are deadly. Cover cage at night.',
        'Heated perch or panel heater recommended, not lamps which are fire risk',
        'Increased calorie needs in cold weather'
      ]
    },
    airQuality: [
      'Birds are EXTREMELY sensitive to air quality, like canaries in coal mines',
      'Teflon and PTFE: fumes from overheated non-stick pans are DEADLY',
      'Scented candles, air fresheners, and cleaning products cause respiratory distress',
      'AQI over 100: bring outdoor birds inside. Close windows.',
      'Wildfire smoke: birds show symptoms first. Bring inside with air purifier.'
    ]
  },
  horse: {
    heatRisk: {
      threshold: 25,
      highRisk: 30,
      emergency: 35,
      factors: [
        'Horses cool primarily through sweating, can lose 15L per hour',
        'Heat plus humidity over 150 (temp plus humidity) means cooling is impaired',
        'Signs: respiratory rate over 40 per minute, rectal temp over 39.5°C, lethargy',
        'Cooling: hose with cold water. Cold water does NOT cause tying up',
        'Anhidrosis: some horses stop sweating in heat. This is EMERGENCY.'
      ]
    },
    coldRisk: {
      threshold: 0,
      highRisk: -10,
      emergency: -20,
      factors: [
        'Horses tolerate cold well if dry and out of wind',
        'Blanketing: varies by coat, body condition, and shelter',
        'Clipped horses need blanket below 10°C',
        'Hairy or unclipped may not need blanket even in snow if shelter is available',
        'Check water: horses drink 30-50L per day. Frozen water means impaction colic.',
        'Snow is NOT a water source as body heat to melt uses too much energy'
      ]
    },
    colicRisk: [
      'Weather changes: rapid temperature drops increase colic risk',
      'Barometric pressure drops: impaction colic more common',
      'Ensure constant access to water using heated buckets in winter',
      'Do not feed on sand or dirt to avoid sand colic'
    ],
    riding: [
      'Heat: ride early morning only. Cool down thoroughly.',
      'Cold: warm up slowly. Cooler or walker to dry sweat before turnout.',
      'Wet: slippery footing. No galloping on wet grass.',
      'Wind: spooky behavior. Be prepared for reactivity.'
    ]
  },
  chicken: {
    heatRisk: {
      threshold: 27,
      highRisk: 32,
      emergency: 38,
      factors: [
        'Chickens cannot sweat. They pant and hold wings away from body.',
        'Above 38°C: hens stop laying and can die within hours',
        'Cooling methods: misters not soaking, frozen water bottles in coop, electrolytes in water',
        'Shade is ESSENTIAL. Coop ventilation is critical.',
        'Pale combs and wattles mean heat stress. Dark purple means emergency.'
      ]
    },
    coldRisk: {
      threshold: -5,
      highRisk: -15,
      emergency: -25,
      factors: [
        'Chickens handle cold better than heat',
        'Frostbite affects combs and wattles. Apply petroleum jelly for protection.',
        'Coop: draft-free but VENTILATED. Moisture buildup causes frostbite and respiratory disease.',
        'Heated water base is essential',
        'Deep litter method generates heat through composting'
      ]
    }
  },
  fish_pond: {
    heatRisk: {
      threshold: 28,
      highRisk: 32,
      emergency: 35,
      factors: [
        'Warm water holds less oxygen',
        'Fish gasping at surface means oxygen depletion',
        'Add aerator or fountain. Add shade plants or shade cloth.',
        'Partial water change with cooler water slowly',
        'Feed less as metabolism increases but oxygen is low'
      ]
    },
    coldRisk: {
      threshold: 4,
      highRisk: 0,
      emergency: -5,
      factors: [
        'Pond must be deep enough not to freeze solid, 90cm+ for koi',
        'Keep hole in ice for gas exchange using de-icer or floating heater',
        'Never smash ice as shock waves kill fish',
        'Stop feeding below 10°C as metabolism is too slow to digest'
      ]
    }
  }
};

// ============================================================================
// ENHANCED TOXIC PLANTS & ENVIRONMENTAL HAZARDS
// ============================================================================

const SEASONAL_HAZARDS = {
  spring: [
    'Lilies: FATAL to cats. All parts, even pollen, even vase water.',
    'Tulips and daffodils: bulbs toxic to dogs that dig.',
    'Fertilizers and herbicides: keep pets off treated lawns for 24-48 hours.',
    'Cocoa mulch: smells like chocolate, toxic to dogs.',
    'Baby rabbits and wildlife: dogs may find nests. Supervise.',
    'Snakes: emerging from hibernation. Snake avoidance training recommended.'
  ],
  summer: [
    'Blue-green algae: DEADLY. Do not let dogs swim in scummy water.',
    'Toads and frogs: some species are toxic. Foaming at mouth means rinse immediately.',
    'Snake bites: rattlesnakes and copperheads active. Know nearest emergency vet.',
    'Foxtails and grass awns: burrow into skin, ears, and nose. Check after walks.',
    'BBQ hazards: corn cobs cause intestinal blockage, bones splinter, onions and garlic are toxic.',
    'Hot asphalt: severe paw burns. Test with back of hand.',
    'Fireworks: July and August. Many pets panic. Create safe space indoors.'
  ],
  fall: [
    'Mushrooms: many toxic varieties emerge. Remove from yard.',
    'Acorns and oak leaves: toxic to dogs in quantity causing kidney damage.',
    'Rodenticides: people put out rat poison in fall. DEADLY. Know signs.',
    'Antifreeze: people winterize cars. Sweet taste. 1 teaspoon fatal to cats.',
    'Leaf piles: can hide wildlife like snakes, sharp objects, and mold.',
    'Compost: keep covered. Moldy food causes tremorgenic mycotoxins and seizures.'
  ],
  winter: [
    'Ice melt and salt: chemical burns on paws. Wipe feet after walks.',
    'Antifreeze: peak danger. Clean all spills. Store securely.',
    'Frozen water: dogs can fall through ice. Keep leashed near ponds.',
    'Hypothermia: wet fur in cold is dangerous. Dry thoroughly after walks.',
    'Space heaters: fire risk. Pets can knock them over.',
    'Holiday plants: poinsettia is irritant, mistletoe is toxic, holly is toxic.'
  ]
};

// ============================================================================
// ENHANCED PARASITE ACTIVITY PREDICTOR
// ============================================================================

function getParasiteRisk(data) {
  const { temp, humidity, season, precipitation } = data;
  const risks = [];
  const warnings = [];
  
  // Fleas
  if (temp > 13 && humidity > 50) {
    risks.push(`FLEAS: ACTIVE. Ideal breeding conditions at ${Math.round(temp)}°C.`);
    risks.push('  - Fleas thrive at 21-30°C with 70%+ humidity');
    risks.push('  - One flea can lay 50 eggs per day. Infestation in 3 weeks.');
    risks.push('  - Year-round prevention recommended even in winter due to indoor heating');
    warnings.push('Flea prevention is essential. Check pets regularly.');
  } else if (temp < 5) {
    risks.push('Fleas: Outdoor activity LOW. But indoor fleas persist year-round.');
  }
  
  // Ticks
  if (temp > 4 && humidity > 40) {
    risks.push(`TICKS: ACTIVE. Ticks quest whenever above 4°C.`);
    risks.push('  - Peak activity: spring and fall');
    risks.push('  - Check dogs thoroughly after walks, especially ears, between toes, and groin');
    risks.push('  - Tick-borne diseases: Lyme, Ehrlichia, Anaplasma. Preventative essential.');
    risks.push('  - Save removed ticks for vet identification if illness develops.');
    warnings.push('Daily tick checks are essential. Use tick prevention year-round.');
  } else if (temp < 0) {
    risks.push('Ticks: Low activity. But can activate on warm winter days.');
  }
  
  // Mosquitoes / Heartworm
  if (temp > 15 && humidity > 50 && (precipitation || 0) > 0) {
    risks.push(`MOSQUITOES: ACTIVE. Heartworm transmission risk.`);
    risks.push('  - Standing water means breeding. Dump any containers in yard.');
    risks.push('  - Heartworm: transmitted by single mosquito bite. Fatal if untreated.');
    risks.push('  - Monthly preventative year-round recommended even for indoor pets.');
    warnings.push('Heartworm prevention is critical. One bite can transmit the disease.');
  }
  
  // Intestinal parasites
  if (temp > 10 && (precipitation || 0) > 0) {
    risks.push('INTESTINAL PARASITES: Ideal transmission conditions.');
    risks.push('  - Giardia and coccidia spread in wet conditions');
    risks.push('  - Do not let pets drink from puddles, ponds, or streams');
    risks.push('  - Pick up feces promptly. Eggs become infective in 24-48 hours.');
  }
  
  return { risks, warnings };
}

// ============================================================================
// ENHANCED PAVEMENT SAFETY CALCULATOR
// ============================================================================

function getPavementSafety(data) {
  const { temp, sunPosition, condition } = data;
  const advice = [];
  const warnings = [];
  let riskLevel = 'low';
  
  const pavementTemp = getPavementTemp(temp, condition);
  const inSun = condition === 'clear' && (sunPosition === 'midday' || sunPosition === 'afternoon');
  
  advice.push(`PAVEMENT TEMPERATURE: approximately ${pavementTemp}°C`);
  
  if (pavementTemp > 55) {
    riskLevel = 'extreme';
    warnings.push('EXTREME DANGER: Pavement burns paws in SECONDS');
    advice.push('  - Do NOT walk on asphalt, concrete, brick, or sand');
    advice.push('  - GRASS ONLY. Even then, check grass temperature as it can be hot too');
    advice.push('  - Booties may not help as heat transfers through and paws sweat');
    advice.push('  - Walk before sunrise or after sunset when pavement has cooled');
    advice.push('  - 7-second rule: back of hand on pavement. If too hot for 7 seconds, too hot for paws');
    
  } else if (pavementTemp > 48) {
    riskLevel = 'high';
    warnings.push('DANGER: Pavement can burn paws in 1-5 minutes');
    advice.push('  - Walk on grass or use high-quality booties');
    advice.push('  - Check paws every 5 minutes for redness, blisters, or limping');
    advice.push('  - Walk early morning before 8am or evening after 7pm');
    advice.push('  - Asphalt is hottest, concrete is slightly cooler, grass is coolest');
    
  } else if (pavementTemp > 40) {
    riskLevel = 'moderate';
    advice.push('CAUTION: Pavement is warm. Comfortable for calloused paws but check sensitive dogs.');
    advice.push('  - Puppies, senior dogs, and dogs with paw injuries need booties or grass');
    advice.push('  - Dark asphalt is significantly hotter than light concrete');
    
  } else {
    riskLevel = 'low';
    advice.push('Pavement temperature is SAFE for paws.');
  }
  
  if (temp > 25 && inSun) {
    advice.push('  - Pavement in direct sun is 10-15°C hotter than shaded pavement.');
  }
  
  return { advice, warnings, riskLevel, pavementTemp };
}

// ============================================================================
// ENHANCED CAR SAFETY CALCULATOR
// ============================================================================

function getCarSafety(data) {
  const { temp, sunPosition, condition } = data;
  const advice = [];
  const warnings = [];
  
  if (temp > 15) {
    const temp10 = Math.round(temp + 10);
    const temp30 = Math.round(temp + 20);
    const temp60 = Math.round(temp + 25);
    
    warnings.push('NEVER leave pets in parked car');
    advice.push(`  Outside ${Math.round(temp)}°C → inside car reaches:`);
    advice.push(`    - 10 minutes: ${temp10}°C`);
    advice.push(`    - 30 minutes: ${temp30}°C`);
    advice.push(`    - 60 minutes: ${temp60}°C`);
    advice.push('  - Cracking windows has MINIMAL effect, reduces temp by 1-2°C only');
    advice.push('  - Dogs die in cars every year. It takes MINUTES.');
    advice.push('  - If you see a dog in a hot car: note make, model, and plate, alert store, call police');
    advice.push('  - Many jurisdictions allow breaking window to rescue animal in distress');
  }
  
  if (temp < 0) {
    warnings.push('COLD CAR: Cars become refrigerators in winter');
    advice.push('  - Hypothermia risk. Do not leave pets in cold cars.');
  }
  
  return { advice, warnings };
}

// ============================================================================
// ENHANCED BREED DETECTION
// ============================================================================

function detectBreedCategory(question) {
  const q = question.toLowerCase();
  
  for (const [category, data] of Object.entries(PET_SPECIES.dog.breedSpecific)) {
    if (data.breeds) {
      for (const breed of data.breeds) {
        if (q.includes(breed.toLowerCase())) {
          return category;
        }
      }
    }
  }
  return null;
}

// ============================================================================
// ENHANCED MAIN PETS ADVICE FUNCTION
// ============================================================================

export const getPetsAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, wind, uvIndex, aqi, condition, visibility, city,
    dewPoint, tempMin, tempMax, precipitation, season, sunPosition,
    feelsLike, windGust
  } = data;
  
  const q = question.toLowerCase();
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  const pavementTemp = getPavementTemp(temp, condition);
  const timeOfDay = getTimeOfDay();
  const seasonName = getSeason();
  const uvLevel = getUVLevel(uvIndex);
  const aqiLevel = getAQICategory(aqi);
  
  // Detect pet type
  let petType = 'dog';
  if (q.includes('cat') || q.includes('kitten')) petType = 'cat';
  if (q.includes('rabbit') || q.includes('bunny')) petType = 'rabbit';
  if (q.includes('bird') || q.includes('parrot') || q.includes('aviary')) petType = 'bird';
  if (q.includes('horse') || q.includes('pony') || q.includes('equine')) petType = 'horse';
  if (q.includes('fish') || q.includes('pond') || q.includes('koi')) petType = 'fish_pond';
  if (q.includes('chicken') || q.includes('hen') || q.includes('rooster')) petType = 'chicken';
  
  // Detect breed category for dogs
  let breedCategory = null;
  if (petType === 'dog') {
    breedCategory = detectBreedCategory(q);
  }
  
  const speciesConfig = PET_SPECIES[petType] || PET_SPECIES.dog;
  const parasiteData = getParasiteRisk(data);
  const pavementData = getPavementSafety(data);
  const carSafety = getCarSafety(data);
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "PET WEATHER SAFETY ASSESSMENT",
    "ANIMAL WELLNESS ADVISORY",
    "PET OUTDOOR SAFETY REPORT",
    "COMPANION ANIMAL WEATHER ANALYSIS",
    "PET HEALTH WEATHER EVALUATION"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `Pet type: ${petType.charAt(0).toUpperCase() + petType.slice(1)}\n`;
  if (breedCategory) {
    response += `Breed category: ${breedCategory.replace(/_/g, ' ').toUpperCase()}\n`;
  }
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  if (petType === 'dog') response += `  Pavement temp: ~${Math.round(pavementData.pavementTemp)}°C\n`;
  response += `  Humidity: ${Math.round(humidity)}%\n`;
  response += `  Wind: ${Math.round(wind)} km/h (gusts to ${Math.round(windGust || wind + 5)} km/h)\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel}) - burn time ~${burnMin} minutes\n`;
  response += `  Air Quality: AQI ${aqi} (${aqiLevel})\n`;
  response += `  Season: ${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)}\n`;
  response += `  Time: ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm\n`;
  response += `\n`;
  
  // Overall verdict
  response += `=== OVERALL VERDICT ===\n`;
  
  if (isStorm) {
    response += `  THUNDERSTORM: Keep ALL pets indoors immediately.\n`;
    response += `  Lightning risk is severe. Metal chains and fences conduct.\n`;
  } else if (aqi > 200) {
    response += `  HAZARDOUS AIR: Keep all pets indoors.\n`;
    response += `  Pets breathe faster than humans, taking in more pollutants per body weight.\n`;
  } else if (heatIndex > 38 || effectiveTemp > 38) {
    response += `  EXTREME HEAT: Life-threatening for all pets.\n`;
    response += `  Potty breaks only. No outdoor exercise.\n`;
  } else if (windChill < -18) {
    response += `  EXTREME COLD: Life-threatening for pets.\n`;
    response += `  Potty breaks only. Full winter gear required.\n`;
  } else if (pavementData.riskLevel === 'extreme') {
    response += `  PAVEMENT DANGER: Paws will burn. Grass only.\n`;
  } else if (effectiveTemp >= 10 && effectiveTemp <= 24 && aqi < 50 && !isRaining) {
    response += `  PERFECT PET WEATHER! Enjoy outdoor time together.\n`;
  } else {
    response += `  ACCEPTABLE with precautions. Follow recommendations below.\n`;
  }
  response += `\n`;
  
  // Heat safety
  if (speciesConfig.heatRisk) {
    response += `=== HEAT SAFETY ===\n`;
    response += `  Heat risk threshold: ${speciesConfig.heatRisk.threshold}°C\n`;
    
    if (effectiveTemp > speciesConfig.heatRisk.emergency) {
      response += `  EMERGENCY: ${Math.round(effectiveTemp)}°C exceeds emergency threshold!\n`;
      response += `  Heat stroke can kill in 20-30 minutes.\n`;
    } else if (effectiveTemp > speciesConfig.heatRisk.highRisk) {
      response += `  HIGH RISK: ${Math.round(effectiveTemp)}°C above high risk threshold.\n`;
      response += `  Limit outdoor time to 5-10 minutes. No exercise.\n`;
    } else if (effectiveTemp > speciesConfig.heatRisk.threshold) {
      response += `  CAUTION: ${Math.round(effectiveTemp)}°C above heat threshold.\n`;
      response += `  Provide shade, water, and limit activity.\n`;
    }
    
    response += `  Heat safety factors:\n`;
    speciesConfig.heatRisk.factors.forEach(f => response += `    - ${f}\n`);
    response += `\n`;
  }
  
  // Cold safety
  if (speciesConfig.coldRisk) {
    response += `=== COLD SAFETY ===\n`;
    response += `  Cold risk threshold: ${speciesConfig.coldRisk.threshold}°C\n`;
    
    if (windChill < speciesConfig.coldRisk.emergency) {
      response += `  EMERGENCY: ${Math.round(windChill)}°C exceeds emergency threshold!\n`;
      response += `  Frostbite in 10-15 minutes. Hypothermia risk.\n`;
    } else if (windChill < speciesConfig.coldRisk.highRisk) {
      response += `  HIGH RISK: ${Math.round(windChill)}°C below high risk threshold.\n`;
      response += `  Limit outdoor time to 10-15 minutes. Use coat and booties.\n`;
    } else if (windChill < speciesConfig.coldRisk.threshold) {
      response += `  CAUTION: ${Math.round(windChill)}°C below cold threshold.\n`;
      response += `  Sensitive pets need protection. Shorten walks.\n`;
    }
    
    response += `  Cold safety factors:\n`;
    speciesConfig.coldRisk.factors.forEach(f => response += `    - ${f}\n`);
    response += `\n`;
  }
  
  // Pavement safety
  response += `=== PAVEMENT SAFETY ===\n`;
  pavementData.advice.forEach(a => response += `${a}\n`);
  pavementData.warnings.forEach(w => response += `  ${w}\n`);
  response += `\n`;
  
  // Breed-specific advice
  if (petType === 'dog' && breedCategory) {
    const breedData = speciesConfig.breedSpecific[breedCategory];
    if (breedData) {
      response += `=== BREED-SPECIFIC ADVICE ===\n`;
      response += `  Breeds: ${breedData.breeds.join(', ')}\n`;
      response += `  Heat risk: ${breedData.heatRisk}\n`;
      response += `  Cold risk: ${breedData.coldRisk}\n`;
      response += `  Special: ${breedData.special}\n`;
      response += `\n`;
    }
  }
  
  // Car safety
  if (temp > 15 || temp < 0) {
    response += `=== CAR SAFETY ===\n`;
    carSafety.warnings.forEach(w => response += `  ${w}\n`);
    carSafety.advice.forEach(a => response += `${a}\n`);
    response += `\n`;
  }
  
  // Parasite risks
  if (parasiteData.risks.length > 0) {
    response += `=== PARASITE RISKS ===\n`;
    parasiteData.risks.forEach(r => response += `${r}\n`);
    parasiteData.warnings.forEach(w => response += `  ${w}\n`);
    response += `\n`;
  }
  
  // Seasonal hazards
  if (SEASONAL_HAZARDS[seasonName] && SEASONAL_HAZARDS[seasonName].length > 0) {
    response += `=== ${seasonName.toUpperCase()} HAZARDS ===\n`;
    SEASONAL_HAZARDS[seasonName].forEach(h => response += `  - ${h}\n`);
    response += `\n`;
  }
  
  // UV / Sun protection
  if (uvIndex > 5) {
    response += `=== UV PROTECTION ===\n`;
    response += `  UV Index ${uvIndex}: Pets can get sunburn and skin cancer.\n`;
    response += `  - White or pink skin: nose, ears, belly are at highest risk\n`;
    response += `  - Pet-safe sunscreen required (NO zinc oxide, toxic to dogs)\n`;
    response += `  - Apply to: nose, ear tips, belly, and any thin-furred areas\n`;
    response += `  - Limit direct sun from 10am to 4pm\n`;
    if (uvIndex > 7) {
      response += `  - White cats: ear tip cancer is common. Keep indoors during peak UV.\n`;
    }
    response += `\n`;
  }
  
  // Air quality
  if (aqi > 100) {
    response += `=== AIR QUALITY ===\n`;
    response += `  AQI ${aqi}: Poor air quality affects pets.\n`;
    if (aqi > 150) {
      response += `  - No outdoor exercise. Quick potty breaks only.\n`;
      response += `  - Birds, rabbits, and brachycephalic breeds are at HIGHEST risk.\n`;
    } else {
      response += `  - Reduce prolonged outdoor activity.\n`;
      response += `  - Sensitive pets: limit outdoor time.\n`;
    }
    response += `  - Keep windows closed. Use HEPA air purifier.\n`;
    response += `\n`;
  }
  
  // Hydration
  if (effectiveTemp > 24) {
    response += `=== HYDRATION ===\n`;
    response += `  Dogs need 50-60ml water per kg body weight daily, double in heat.\n`;
    response += `  - Multiple water bowls. Add ice cubes. Consider pet fountain.\n`;
    response += `  - Signs of dehydration: dry gums, sunken eyes, skin tenting, lethargy.\n`;
    response += `\n`;
  }
  
  // Species-specific advice
  if (speciesConfig.outdoorSafety) {
    response += `=== ${petType.toUpperCase()} OUTDOOR SAFETY ===\n`;
    speciesConfig.outdoorSafety.forEach(s => response += `  - ${s}\n`);
    response += `\n`;
  }
  
  // Walking advice
  if (petType === 'dog') {
    response += `=== WALKING ADVICE ===\n`;
    if (effectiveTemp >= 10 && effectiveTemp <= 24 && !isRaining) {
      response += `  PERFECT walking weather: ${Math.round(temp)}°C.\n`;
      response += `  Normal walks, dog park, and outdoor play are all good.\n`;
      response += `  Still bring water. Dogs dehydrate even in mild weather.\n`;
    } else if (isRaining && temp > 15) {
      response += `  Warm rain: walk is OK if dog does not mind.\n`;
      response += `  Towel dry thoroughly after. Check between toes for moisture.\n`;
      response += `  Avoid puddles which may contain leptospirosis, giardia, or chemicals.\n`;
    } else if (isRaining && temp < 15) {
      response += `  Cold rain: shorten walk. Wet fur means rapid heat loss.\n`;
      response += `  Use raincoat for dog. Towel dry immediately upon return.\n`;
    }
    
    if (wind > 30) {
      response += `  Very windy: small dogs may refuse to walk. Debris danger.\n`;
      response += `  Keep dogs leashed. Fences can blow down, scents are scattered.\n`;
    }
    response += `\n`;
  }
  
  // General care reminders
  response += `=== GENERAL CARE REMINDERS ===\n`;
  response += `  - Always bring water and collapsible bowl on walks\n`;
  response += `  - Microchip and collar with ID tags, weather events cause lost pets\n`;
  response += `  - Know nearest 24-hour emergency vet\n`;
  response += `  - Pet first aid kit: vet wrap, antiseptic, tweezers, thermometer\n`;
  response += `\n`;
  
  // Critical warnings
  if (isStorm || aqi > 200 || heatIndex > 38 || windChill < -18 || pavementData.riskLevel === 'extreme') {
    response += `=== CRITICAL WARNINGS ===\n`;
    if (isStorm) response += `  - THUNDERSTORM: Keep all pets indoors. Lightning risk.\n`;
    if (aqi > 200) response += `  - HAZARDOUS AIR: Keep all pets indoors.\n`;
    if (heatIndex > 38) response += `  - EXTREME HEAT: Life-threatening. Potty breaks only.\n`;
    if (windChill < -18) response += `  - EXTREME COLD: Life-threatening. Full winter gear.\n`;
    if (pavementData.riskLevel === 'extreme') response += `  - PAVEMENT DANGER: Paws will burn. Grass only.\n`;
    response += `\n`;
  }
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (isStorm || aqi > 200) {
    response += `  STAY INDOORS. Conditions unsafe for all pets.\n`;
  } else if (heatIndex > 38 || windChill < -18) {
    response += `  EXTREME WEATHER. Quick potty breaks only. Keep pets inside.\n`;
  } else if (pavementData.riskLevel === 'extreme') {
    response += `  PAVEMENT DANGEROUS. Grass only. Walk before sunrise.\n`;
  } else if (effectiveTemp >= 10 && effectiveTemp <= 24 && !isRaining && aqi < 50) {
    response += `  PERFECT PET WEATHER! Enjoy your outdoor time together.\n`;
  } else {
    response += `  Take standard precautions. Adjust activity to conditions.\n`;
  }
  
  const petWisdom = [
    "Dogs do speak, but only to those who know how to listen.",
    "Until one has loved an animal, a part of one's soul remains unawakened.",
    "The better I get to know men, the more I find myself loving dogs.",
    "Animals are such agreeable friends—they ask no questions; they pass no criticisms.",
    "A dog is the only thing on earth that loves you more than he loves himself."
  ];
  response += `\n--- WISDOM ---\n${random(petWisdom)}`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getPavementSafety, 
  getCarSafety, 
  getParasiteRisk 
};

export default getPetsAdvice;
