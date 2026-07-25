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
  "Is it safe to walk my dog?",
  "Should I take my cat outside?",
  "Can my pet get heat stroke?",
  "Is the pavement too hot?",
  "Should I leave my dog in the car?",
  "Is it too cold for my pet?",
  "Can my dog play outside?",
  "Will my pet get sunburn?",
  "Is air quality bad for pets?",
  "Can I take my dog hiking today?",
  "Should I bring my dog to the beach?",
  "Is it safe for my puppy outside?",
  "Can my senior dog go for a walk?",
  "Should my cat stay indoors today?",
  "Is it too hot for my rabbit?",
  "Can my bird go outside in this weather?",
  "Is it safe for my horse to be ridden?",
  "Should I blanket my horse tonight?",
  "Can my guinea pig go in outdoor run?",
  "Is my chicken coop weather-safe?",
  "Should I bring my turtle inside?",
  "Can I take my ferret for a walk?",
  "Is it too humid for my chinchilla?",
  "Should I worry about my fish pond freezing?",
  "Is my livestock safe in this storm?",
  "Can I leave my dog in the yard today?",
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
  "Is it good weather for dog park?",
  "Should I take my reactive dog out?",
  "Is it too crowded at the park (weather-wise)?",
  "Can I jog with my dog?",
  "Should I bike with my dog?",
  "Is it safe for dog agility outside?",
  "Can I do nose work outdoors?",
  "Is it good weather for herding practice?",
  "Should I cancel my dog's grooming appointment?",
  "Will my dog's arthritis act up?",
  "Should I give my dog extra water today?",
  "Is my cat's asthma worse today?",
  "Will my pet's allergies flare?",
  "Should I use pet-safe ice melt?",
  "Is antifreeze a risk today?",
  "Will mushrooms be growing (toxic to pets)?",
  "Should I worry about toads/frogs?",
  "Is it good weather for pet photos?",
  "Can I have a dog birthday party outside?",
  "Should I take my dog to the outdoor market?",
  "Is it safe for pet-sitting outdoor?",
  "Can my dog sleep outside tonight?",
  "Should I leave the dog door open?",
  "Is my outdoor cat safe tonight?",
  "Should I bring barn cats inside?",
  "Is the barn safe in this weather?",
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
  "Can I move my beehive today?",
  "Will my bees be aggressive?",
  "Should I open the hive?",
  "Is my pond oxygen level OK?",
  "Should I run the pond aerator?",
  "Will my koi be OK in this heat?",
  "Should I cover my pond?",
  "Is my aviary weatherproof?",
  "Can I release my rehabbed wildlife?",
  "Will migrating birds stop through?",
  "Should I put out extra bird feed?",
  "Is my bird bath frozen?",
  "Should I bring hummingbird feeders in?"
];

// ============================================================================
// PET SPECIES DATABASE
// ============================================================================

const PET_SPECIES = {
  dog: {
    heatRisk: {
      threshold: 24,           // °C where heat stress begins
      highRisk: 30,           // Dangerous without precautions
      emergency: 35,           // Life-threatening
      factors: [
        'Dogs cool primarily through panting (no sweating except paw pads)',
        'Body temperature > 41°C = organ damage begins',
        'Heat stroke mortality rate: 50% even with treatment',
        'Recovery: dogs that survive may have permanent organ damage'
      ]
    },
    coldRisk: {
      threshold: 4,            // Start needing coat for short-haired
      highRisk: -7,           // Dangerous for small/short-haired
      emergency: -15,          // Life-threatening for most
      factors: [
        'Frostbite: ears, tail, paws most vulnerable',
        'Hypothermia: shivering → lethargy → collapse',
        'Small dogs lose heat faster (higher surface area to volume ratio)',
        'Wet fur = 5x faster heat loss'
      ]
    },
    breedSpecific: {
      brachycephalic: {
        breeds: ['Pug', 'Bulldog', 'Boxer', 'Boston Terrier', 'Shih Tzu', 'Pekingese'],
        heatRisk: 'EXTREME - Cannot pant effectively. Heat stroke in 15 min above 30°C.',
        coldRisk: 'Moderate - Short coat, but respiratory issues in cold dry air.',
        special: 'NEVER exercise in heat. Air conditioning essential above 28°C.'
      },
      doubleCoated: {
        breeds: ['Husky', 'Malamute', 'Samoyed', 'Akita', 'Chow Chow', 'Pomeranian'],
        heatRisk: 'HIGH - Coat insulates both ways but designed for cold. Overheat above 24°C.',
        coldRisk: 'LOW - Built for cold. Can tolerate well below freezing.',
        special: 'DO NOT SHAVE. Coat protects from heat AND cold. Damaged undercoat won\'t regrow properly.'
      },
      smallBreed: {
        breeds: ['Chihuahua', 'Toy Poodle', 'Yorkie', 'Maltese', 'Papillon'],
        heatRisk: 'Moderate - Small body, but can overheat if overexerted.',
        coldRisk: 'HIGH - Lose heat rapidly. Sweater needed below 10°C, coat below 4°C.',
        special: 'Wind chill affects small dogs disproportionately.'
      },
      largeBreed: {
        breeds: ['Great Dane', 'Mastiff', 'St. Bernard', 'Newfoundland'],
        heatRisk: 'HIGH - Large body mass retains heat. Overheat quickly with exercise.',
        coldRisk: 'LOW to Moderate - Large body retains heat. Cold tolerant.',
        special: 'Bloat risk: no exercise 1 hour before/2 hours after eating. Heat increases risk.'
      },
      sighthound: {
        breeds: ['Greyhound', 'Whippet', 'Italian Greyhound', 'Saluki'],
        heatRisk: 'Moderate - Lean body, but thin coat = sunburn risk.',
        coldRisk: 'HIGH - No body fat, thin coat. Sweater essential below 15°C.',
        special: 'Thin skin tears easily. Sunburn on nose, ears, belly.'
      },
      senior: {
        age: '7+ years (varies by breed)',
        heatRisk: 'HIGH - Reduced thermoregulation. Arthritis worsens in cold/damp.',
        coldRisk: 'HIGH - Less muscle mass, slower metabolism. Orthopedic pain increases.',
        special: 'Shorter, slower walks. Multiple brief outings > one long walk.'
      },
      puppy: {
        age: 'Under 1 year',
        heatRisk: 'HIGH - Can\'t regulate temperature well. Overheat and dehydrate faster.',
        coldRisk: 'HIGH - Little body fat. Short outdoor time only.',
        special: 'No forced exercise on hard surfaces (growing joints). No long walks.'
      }
    },
    pavementSafety: {
      air25: { pavement: 52, risk: 'Burns in 60 seconds', action: 'NO WALK on pavement' },
      air30: { pavement: 57, risk: 'Burns in 30 seconds', action: 'GRASS ONLY, booties recommended' },
      air35: { pavement: 62, risk: 'Burns in 5 seconds', action: 'DO NOT GO OUTSIDE' }
    },
    walkSchedule: {
      hot: 'Before 8am or after 8pm. 5-10 minute potty breaks midday.',
      cold: 'Midday warmest hours (11am-2pm). Shorter walks, multiple outings.',
      normal: 'Normal schedule. Still bring water on walks > 30 min.'
    }
  },
  cat: {
    heatRisk: {
      threshold: 27,
      highRisk: 32,
      emergency: 38,
      factors: [
        'Cats sweat through paw pads only',
        'Cats hide illness - watch for: panting (NOT normal in cats!), lethargy, vomiting',
        'Outdoor cats: provide shaded hiding spots, multiple water sources',
        'Indoor cats: AC, fans, cooling mats, ice cubes in water'
      ]
    },
    coldRisk: {
      threshold: 0,
      highRisk: -7,
      emergency: -15,
      factors: [
        'Outdoor cats: need insulated shelter (straw, not hay/blankets which hold moisture)',
        'Frostbite: ear tips and paw pads first',
        'Antifreeze: sweet taste, 1 teaspoon fatal. Kidney failure in 24-72 hours.',
        'Car engines: cats crawl into warm engines. Honk/bang hood before starting car.'
      ]
    },
    outdoorSafety: [
      'Keep cats indoors during extreme weather',
      'Thunderstorms: cats hide, may get trapped. Bring inside before storm.',
      'Snow: cats can get lost (scent markers covered). Keep indoors.',
      'Heat: outdoor cats need shade + water. Check hiding spots aren\'t hot (sheds, cars).'
    ]
  },
  rabbit: {
    heatRisk: {
      threshold: 24,
      highRisk: 28,
      emergency: 32,
      factors: [
        'Rabbits CANNOT sweat or pant effectively',
        'Heat stroke is #1 cause of sudden rabbit death in summer',
        'Ears are radiators: check ear temperature',
        'Cool: frozen water bottles in enclosure, ceramic tiles to lie on',
        'NEVER put rabbit in cold water (shock)'
      ]
    },
    coldRisk: {
      threshold: 0,
      highRisk: -5,
      emergency: -15,
      factors: [
        'Rabbits handle cold better than heat IF dry and draft-free',
        'Wet + cold = deadly. Hutch must be waterproof.',
        'Provide extra hay for burrowing. Cover hutch with blanket/tarp.',
        'Check water bottle hasn\'t frozen multiple times daily'
      ]
    }
  },
  bird: {
    heatRisk: {
      threshold: 27,
      highRisk: 32,
      emergency: 38,
      factors: [
        'Birds overheat VERY quickly (high metabolism)',
        'Signs: wings held away from body, panting, lethargy',
        'Mist with room temp water (not cold). Feet in cool water.',
        'Move cage away from windows (greenhouse effect)',
        'Outdoor aviaries: shade cloth, misters, multiple water sources'
      ]
    },
    coldRisk: {
      threshold: 10,
      highRisk: 0,
      emergency: -10,
      factors: [
        'Tropical birds (parrots): cannot tolerate cold. Bring indoors below 15°C.',
        'Drafts deadly. Cover cage at night.',
        'Heated perch or panel heater (not lamps - fire risk)',
        'Increased calorie needs in cold'
      ]
    },
    airQuality: [
      'Birds EXTREMELY sensitive to air quality (canaries in coal mines)',
      'Teflon/PTFE: fumes from overheated non-stick pans = DEADLY',
      'Scented candles, air fresheners, cleaning products = respiratory distress',
      'AQI > 100: bring outdoor birds inside. Close windows.',
      'Wildfire smoke: birds show symptoms first. Bring inside with air purifier.'
    ]
  },
  horse: {
    heatRisk: {
      threshold: 25,
      highRisk: 30,
      emergency: 35,
      factors: [
        'Horses cool primarily through sweating (can lose 15L/hour)',
        'Heat + humidity > 150 (temp + humidity) = cooling impaired',
        'Signs: respiratory rate > 40/min, rectal temp > 39.5°C, lethargy',
        'Cool: hose with cold water (myth: cold water does NOT cause tying up)',
        'Anhidrosis: some horses stop sweating in heat = EMERGENCY'
      ]
    },
    coldRisk: {
      threshold: 0,
      highRisk: -10,
      emergency: -20,
      factors: [
        'Horses tolerate cold well IF dry and out of wind',
        'Blanketing: varies by coat, body condition, shelter',
        'Clipped horses: blanket below 10°C',
        'Hairy/unclipped: may not need blanket even in snow if shelter available',
        'Check water: horses drink 30-50L/day. Frozen water = impaction colic.',
        'Snow is NOT a water source (body heat to melt = too much energy)'
      ]
    },
    colicRisk: [
      'Weather changes: rapid temp drops increase colic risk',
      'Barometric pressure drops: impaction colic more common',
      'Ensure constant access to water (heated buckets in winter)',
      'Don\'t feed on sand/dirt (sand colic)'
    ],
    riding: [
      'Heat: ride early morning only. Cool down thoroughly.',
      'Cold: warm up slowly. Cooler/walker to dry sweat before turnout.',
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
        'Chickens can\'t sweat. Pant and hold wings away from body.',
        'Above 38°C: hens stop laying, can die within hours',
        'Cool: misters (not soaking), frozen water bottles in coop, electrolytes in water',
        'Shade ESSENTIAL. Coop ventilation critical.',
        'Pale combs/wattles = heat stress. Dark purple = emergency.'
      ]
    },
    coldRisk: {
      threshold: -5,
      highRisk: -15,
      emergency: -25,
      factors: [
        'Chickens handle cold better than heat',
        'Frostbite: combs and wattles. Apply petroleum jelly for protection.',
        'Coop: draft-free but VENTILATED (moisture buildup = frostbite + respiratory disease)',
        'Heated water base essential',
        'Deep litter method: generates heat through composting'
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
        'Fish gasping at surface = oxygen depletion',
        'Add aerator/fountain. Add shade plants or shade cloth.',
        'Partial water change with cooler water (slowly!)',
        'Feed less (metabolism increases but oxygen is low)'
      ]
    },
    coldRisk: {
      threshold: 4,
      highRisk: 0,
      emergency: -5,
      factors: [
        'Pond must be deep enough not to freeze solid (90cm+ for koi)',
        'Keep hole in ice for gas exchange (de-icer or floating heater)',
        'NEVER smash ice (shock waves kill fish)',
        'Stop feeding below 10°C (metabolism too slow to digest)'
      ]
    }
  }
};

// ============================================================================
// TOXIC PLANTS & ENVIRONMENTAL HAZARDS
// ============================================================================

const SEASONAL_HAZARDS = {
  spring: [
    'Lilies: FATAL to cats. All parts, even pollen, even vase water.',
    'Tulips/daffodils: bulbs toxic to dogs that dig.',
    'Fertilizers/herbicides: keep pets off treated lawns 24-48 hours.',
    'Cocoa mulch: smells like chocolate, toxic to dogs.',
    'Baby rabbits/wildlife: dogs may find nests. Supervise.',
    'Snakes: emerging from hibernation. Snake avoidance training.'
  ],
  summer: [
    'Blue-green algae: DEADLY. Don\'t let dogs swim in scummy water.',
    'Toads/frogs: some species toxic. Foaming at mouth = rinse immediately.',
    'Snake bites: rattlesnakes, copperheads active. Know nearest emergency vet.',
    'Foxtails/grass awns: burrow into skin, ears, nose. Check after walks.',
    'BBQ hazards: corn cobs (intestinal blockage), bones (splinter), onions/garlic (toxic).',
    'Hot asphalt: severe paw burns. Test with back of hand.',
    'Fireworks: July/August. Many pets panic. Create safe space indoors.'
  ],
  fall: [
    'Mushrooms: many toxic varieties emerge. Remove from yard.',
    'Acorns/oak leaves: toxic to dogs in quantity (kidney damage).',
    'Rodenticides: people put out rat poison in fall. DEADLY. Know signs.',
    'Antifreeze: people winterize cars. Sweet taste. 1 tsp fatal to cats.',
    'Leaf piles: can hide wildlife (snakes), sharp objects, mold.',
    'Compost: keep covered. Moldy food = tremorgenic mycotoxins (seizures).'
  ],
  winter: [
    'Ice melt/salt: chemical burns on paws. Wipe feet after walks.',
    'Antifreeze: peak danger. Clean all spills. Store securely.',
    'Frozen water: dogs can fall through ice. Keep leashed near ponds.',
    'Hypothermia: wet fur in cold = dangerous. Dry thoroughly after walks.',
    'Space heaters: fire risk. Pets knock them over.',
    'Holiday plants: poinsettia (irritant), mistletoe (toxic), holly (toxic).'
  ]
};

// ============================================================================
// PARASITE ACTIVITY PREDICTOR
// ============================================================================

function getParasiteRisk(data) {
  const { temp, humidity, season, precipitation } = data;
  const risks = [];
  
  // Fleas
  if (temp > 13 && humidity > 50) {
    risks.push("FLEAS: ACTIVE. Ideal breeding conditions.");
    risks.push("• Fleas thrive 21-30°C with 70%+ humidity");
    risks.push("• One flea can lay 50 eggs/day. Infestation in 3 weeks.");
    risks.push("• Year-round prevention recommended even in winter (indoor heating)");
  } else if (temp < 5) {
    risks.push("Fleas: Outdoor activity LOW. But indoor fleas persist year-round.");
  }
  
  // Ticks
  if (temp > 4 && humidity > 40) {
    risks.push("TICKS: ACTIVE. Ticks quest whenever above 4°C.");
    risks.push("• Peak activity: spring and fall");
    risks.push("• Check dogs thoroughly after walks (ears, between toes, groin)");
    risks.push("• Tick-borne diseases: Lyme, Ehrlichia, Anaplasma. Preventative essential.");
    risks.push("• Save removed ticks for vet identification if illness develops.");
  } else if (temp < 0) {
    risks.push("Ticks: Low activity. But can activate on warm winter days.");
  }
  
  // Mosquitoes / Heartworm
  if (temp > 15 && humidity > 50 && precipitation > 0) {
    risks.push("MOSQUITOES: ACTIVE. Heartworm transmission risk.");
    risks.push("• Standing water = breeding. Dump any containers in yard.");
    risks.push("• Heartworm: transmitted by single mosquito bite. Fatal if untreated.");
    risks.push("• Monthly preventative year-round recommended (even indoor pets).");
  }
  
  // Intestinal parasites
  if (temp > 10 && precipitation > 0) {
    risks.push("INTESTINAL PARASITES: Ideal transmission conditions.");
    risks.push("• Giardia, coccidia: spread in wet conditions");
    risks.push("• Don't let pets drink from puddles, ponds, streams");
    risks.push("• Pick up feces promptly. Eggs become infective in 24-48 hours.");
  }
  
  return risks;
}

// ============================================================================
// PAVEMENT SAFETY CALCULATOR
// ============================================================================

function getPavementSafety(data) {
  const { temp, sunPosition, condition } = data;
  const advice = [];
  
  // Multiple studies show pavement can be 20-30°C hotter than air
  const pavementTemp = getPavementTemp(temp, condition);
  const inSun = condition === 'clear' && (sunPosition === 'midday' || sunPosition === 'afternoon');
  
  advice.push(`🛣️ PAVEMENT TEMPERATURE: ~${pavementTemp}°C`);
  
  if (pavementTemp > 52) {
    advice.push("🚨 EXTREME DANGER: Pavement burns paws in SECONDS.");
    advice.push("• DO NOT walk on asphalt, concrete, brick, or sand");
    advice.push("• GRASS ONLY. Even then, check grass temperature (can be hot too)");
    advice.push("• Booties may not help (heat transfers through, paws sweat)");
    advice.push("• Walk before sunrise or after sunset when pavement has cooled");
    advice.push("• 7-second rule: back of hand on pavement. If too hot for 7 sec = too hot for paws");
  } else if (pavementTemp > 42) {
    advice.push("⚠️ DANGER: Pavement can burn paws in 1-5 minutes.");
    advice.push("• Walk on grass or use high-quality booties");
    advice.push("• Check paws every 5 minutes: redness, blisters, limping = go home immediately");
    advice.push("• Walk early morning (before 8am) or evening (after 7pm)");
    advice.push("• Asphalt hottest, concrete slightly cooler, grass coolest");
  } else if (pavementTemp > 35) {
    advice.push("CAUTION: Pavement is warm. Comfortable for calloused paws but check sensitive dogs.");
    advice.push("• Puppies, senior dogs, dogs with paw injuries: use booties or stay on grass");
    advice.push("• Dark asphalt significantly hotter than light concrete");
  } else {
    advice.push("✅ Pavement temperature SAFE for paws.");
  }
  
  if (temp > 25 && inSun) {
    advice.push("☀️ Pavement in direct sun is 10-15°C hotter than shaded pavement.");
  }
  
  return advice;
}

// ============================================================================
// CAR SAFETY CALCULATOR
// ============================================================================

function getCarSafety(data) {
  const { temp, sunPosition } = data;
  const advice = [];
  
  if (temp > 15) {
    advice.push("🚗 CAR SAFETY: NEVER leave pets in parked car.");
    advice.push(`• Outside ${temp}°C → inside car reaches:`);
    advice.push(`  • 10 minutes: ${temp + 10}°C`);
    advice.push(`  • 30 minutes: ${temp + 20}°C`);
    advice.push(`  • 60 minutes: ${temp + 25}°C`);
    advice.push("• Cracking windows has MINIMAL effect (reduces temp by 1-2°C)");
    advice.push("• Dogs die in cars every year. It takes MINUTES.");
    advice.push("• If you see a dog in a hot car: note make/model/plate, alert store, call police.");
    advice.push("• Legal: many jurisdictions allow breaking window to rescue animal in distress.");
  }
  
  if (temp < 0) {
    advice.push("🚗 COLD CAR: Cars become refrigerators in winter.");
    advice.push("• Hypothermia risk. Don't leave pets in cold cars.");
  }
  
  return advice;
}

// ============================================================================
// MAIN PETS ADVICE FUNCTION
// ============================================================================

export const getPetsAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, wind, uvIndex, aqi, condition, visibility, city,
    dewPoint, tempMin, tempMax, precipitation, season, sunPosition
  } = data;
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isStorm = condition === 'thunderstorm';
  const pavementTemp = getPavementTemp(temp, condition);
  const timeOfDay = getTimeOfDay();
  
  // Detect pet type
  const q = question.toLowerCase();
  let petType = 'dog'; // default
  if (q.includes('cat') || q.includes('kitten')) petType = 'cat';
  if (q.includes('rabbit') || q.includes('bunny')) petType = 'rabbit';
  if (q.includes('bird') || q.includes('parrot') || q.includes('chicken') || q.includes('aviary')) {
    petType = q.includes('chicken') ? 'chicken' : 'bird';
  }
  if (q.includes('horse') || q.includes('pony') || q.includes('equine')) petType = 'horse';
  if (q.includes('fish') || q.includes('pond') || q.includes('koi')) petType = 'fish_pond';
  if (q.includes('chicken') || q.includes('hen') || q.includes('rooster')) petType = 'chicken';
  
  const speciesConfig = PET_SPECIES[petType] || PET_SPECIES['dog'];
  const parasiteRisks = getParasiteRisk(data);
  const pavementAdvice = getPavementSafety(data);
  const carSafety = getCarSafety(data);
  
  let verdict = [];
  let dogWalking = [];
  let heatSafety = [];
  let coldSafety = [];
  let pawCare = [];
  let general = [];
  let warnings = [];
  let seasonalHazards = [];
  let breedSpecific = [];

  // ========================================================================
  // CATASTROPHIC CONDITIONS
  // ========================================================================
  
  if (isStorm) {
    verdict.push("⛈️ THUNDERSTORM: Keep ALL pets indoors immediately.");
    warnings.push("Lightning: outdoor pets at risk. Metal chains/fences conduct.");
    warnings.push("Panic: many pets bolt during storms. Microchip/collar on.");
    general.push("Create safe space: interior room, crate covered with blanket, white noise.");
    general.push("Thundershirt/wrap: gentle pressure reduces anxiety in many dogs.");
    warnings.push("NEVER tie dog outside during storm. They cannot escape lightning.");
  }
  
  if (aqi > 200) {
    verdict.push("😷 HAZARDOUS AIR: Keep all pets indoors.");
    warnings.push("Pets breathe faster than humans = more pollutant intake per body weight.");
    warnings.push("Birds ESPECIALLY sensitive. Can die within hours of poor air quality.");
    general.push("HEPA air purifier indoors. Limit potty breaks to 2-3 minutes.");
  }

  // ========================================================================
  // HEAT DANGER
  // ========================================================================
  
  if (heatIndex > 35 || effectiveTemp > 35) {
    verdict.push("🚨 EXTREME HEAT: Life-threatening for all pets.");
    warnings.push(`Heat index ${heatIndex.toFixed(0)}°C. Heat stroke can kill within 20 minutes.`);
    heatSafety.push("NO outdoor exercise. Potty breaks only. 2-3 minutes max.");
    heatSafety.push("Signs of heat stroke:");
    heatSafety.push("  • Excessive panting, drooling, bright red gums");
    heatSafety.push("  • Vomiting, diarrhea, lethargy, collapse");
    heatSafety.push("  • EMERGENCY: Cool with room temp water (NOT ice). Vet IMMEDIATELY.");
    heatSafety.push("  • Do NOT force water. Do NOT cover with wet towel (traps heat).");
    general.push("Keep pets in air conditioning. Cooling mats, frozen water bottles, fans.");
    general.push("Check on outdoor pets hourly. Ensure shade ALL DAY (shade moves).");
    warnings.push("Elderly, overweight, flat-faced breeds = EXTREME DANGER.");
  } else if (heatIndex > 30 || effectiveTemp > 30) {
    verdict.push("⚠️ DANGEROUS HEAT: High risk for pets.");
    heatSafety.push("Limit outdoor time to 5-10 minutes. No exercise.");
    heatSafety.push("Walk early morning (before 7am) or late evening (after 9pm).");
    heatSafety.push("Provide: shade, cool water (add ice cubes), kiddie pool, cooling mat.");
    general.push("Flat-faced breeds: stay in AC. They cannot pant effectively.");
  } else if (effectiveTemp > 27) {
    verdict.push("☀️ HOT: Use caution with pets.");
    heatSafety.push("Exercise: early morning or evening only. 15-20 minutes max.");
    heatSafety.push("Always bring water. Take shade breaks every 10 minutes.");
    general.push("Watch for excessive panting. That's the first warning sign.");
  }

  // ========================================================================
  // COLD DANGER
  // ========================================================================
  
  if (windChill < -18) {
    verdict.push("🚨 EXTREME COLD: Life-threatening for pets.");
    warnings.push(`Wind chill ${windChill.toFixed(0)}°C. Frostbite in < 30 minutes.`);
    coldSafety.push("POTTY BREAKS ONLY. 2-3 minutes maximum.");
    coldSafety.push("Full winter gear: coat, booties, possibly snood/ear protection.");
    coldSafety.push("Signs of hypothermia: shivering → lethargy → stiff muscles → collapse.");
    coldSafety.push("Antifreeze warning: 1 teaspoon kills cats, 1 tablespoon kills dogs.");
    warnings.push("Outdoor pets NEED heated shelter + heated water bowl. Check hourly.");
  } else if (windChill < -7) {
    verdict.push("❄️ VERY COLD: Limit outdoor time.");
    coldSafety.push("Limit walks to 10-15 minutes. Multiple short outings > one long walk.");
    coldSafety.push("Sweater/coat for short-haired breeds. Booties for small dogs.");
    coldSafety.push("Wipe paws after walks (ice melt chemicals = toxic if licked).");
    general.push("Check outdoor pets' water hasn't frozen. Heated bowls essential.");
  } else if (effectiveTemp < 4) {
    verdict.push("🥶 COLD: Precautions needed for sensitive pets.");
    coldSafety.push("Small, short-haired, elderly dogs: sweater/coat recommended.");
    coldSafety.push("Limit time outside to 20-30 minutes. Keep moving.");
    general.push("Pets burn more calories keeping warm. Slightly increase food.");
  }

  // ========================================================================
  // PAVEMENT SAFETY
  // ========================================================================
  
  pawCare = pavementAdvice;

  // ========================================================================
  // CAR SAFETY
  // ========================================================================
  
  if (temp > 18 || temp < 0) {
    warnings.push(...carSafety);
  }

  // ========================================================================
  // DOG WALKING ADVICE
  // ========================================================================
  
  if (effectiveTemp >= 10 && effectiveTemp <= 24 && !isRaining) {
    dogWalking.push(`✅ PERFECT walking weather: ${temp}°C.`);
    dogWalking.push("Normal walks, dog park, outdoor play all good.");
    dogWalking.push("Still bring water. Dogs dehydrate even in mild weather.");
  } else if (isRaining && temp > 15) {
    dogWalking.push("🌧️ Warm rain: walk OK if dog doesn't mind.");
    dogWalking.push("Towel dry thoroughly after. Check between toes for moisture.");
    dogWalking.push("Avoid puddles (leptospirosis, giardia, chemicals).");
  } else if (isRaining && temp < 15) {
    dogWalking.push("🌧️ Cold rain: shorten walk. Wet fur = rapid heat loss.");
    dogWalking.push("Raincoat for dog. Towel dry immediately upon return.");
    warnings.push("Hypothermia risk if dog is wet and cold.");
  }
  
  if (wind > 30) {
    dogWalking.push("💨 Very windy: small dogs may refuse to walk. Debris danger.");
    dogWalking.push("Keep dogs leashed. Fences blow down, scents scattered = dogs get lost.");
  }

  // ========================================================================
  // UV / SUN PROTECTION
  // ========================================================================
  
  if (uvIndex >= 6) {
    general.push(`☀️ HIGH UV ${uvIndex}: Pets get sunburn and skin cancer.`);
    general.push("• White/pink skin: nose, ears, belly at highest risk");
    general.push("• Pet-safe sunscreen (NO zinc oxide - toxic to dogs)");
    general.push("• Apply to: nose, ear tips, belly (for dogs that sunbathe), any thin-furred areas");
    general.push("• Limit direct sun 10am-4pm");
    warnings.push("White cats: ear tip cancer common. Keep indoors during peak UV.");
  }

  // ========================================================================
  // BREED-SPECIFIC ADVICE
  // ========================================================================
  
  if (petType === 'dog') {
    if (effectiveTemp > 24) {
      breedSpecific.push("🐶 BREED ALERTS:");
      breedSpecific.push("• Flat-faced breeds (Pugs, Bulldogs, Boxers): EXTREME heat risk. Stay in AC.");
      breedSpecific.push("• Thick-coated breeds (Huskies, Malamutes): overheat above 24°C. No exercise.");
      breedSpecific.push("• Large breeds (Mastiffs, Danes): retain heat. Overheat quickly with activity.");
      breedSpecific.push("• Senior dogs, overweight dogs: reduced heat tolerance. Extra caution.");
    }
    if (effectiveTemp < 4) {
      breedSpecific.push("• Small breeds, short hair: sweater/coat needed. Booties below 0°C.");
      breedSpecific.push("• Sighthounds (Greyhounds, Whippets): no body fat. Sweater below 15°C!");
      breedSpecific.push("• Senior dogs: arthritis worse in cold. Shorter walks. Orthopedic bed.");
    }
  }

  // ========================================================================
  // AIR QUALITY
  // ========================================================================
  
  if (aqi > 150) {
    warnings.push(`UNHEALTHY AIR (AQI ${aqi}): Pets breathe more per body weight.`);
    general.push("• No outdoor exercise. Quick potty breaks only.");
    general.push("• Birds, rabbits, brachycephalic breeds: HIGHEST risk.");
    general.push("• Keep windows closed. HEPA air purifier running.");
  } else if (aqi > 100) {
    general.push(`Moderate AQI ${aqi}: Reduce prolonged outdoor activity.`);
    general.push("• Sensitive pets (asthma, heart conditions): limit outdoor time.");
  }

  // ========================================================================
  // PARASITE SEASON
  // ========================================================================
  
  if (parasiteRisks.length > 0) {
    general.push("🦟 PARASITE ALERT:");
    parasiteRisks.forEach(r => general.push(`• ${r}`));
  }

  // ========================================================================
  // SEASONAL HAZARDS
  // ========================================================================
  
  if (SEASONAL_HAZARDS[season]) {
    seasonalHazards.push(`🍂 ${season.toUpperCase()} HAZARDS:`);
    SEASONAL_HAZARDS[season].forEach(h => seasonalHazards.push(`• ${h}`));
  }

  // ========================================================================
  // HYDRATION
  // ========================================================================
  
  if (effectiveTemp > 24) {
    general.push("💧 HYDRATION:");
    general.push("• Dogs need 50-60ml water per kg body weight daily (double in heat)");
    general.push("• Multiple water bowls. Add ice cubes. Consider pet fountain.");
    general.push("• Signs of dehydration: dry gums, sunken eyes, skin tenting, lethargy.");
  }

  // ========================================================================
  // GENERAL CARE REMINDERS
  // ========================================================================
  
  general.push("🐾 GENERAL:");
  general.push("• Always bring water + collapsible bowl on walks");
  general.push("• Microchip + collar with ID tags (weather events = lost pets)");
  general.push("• Know nearest 24-hour emergency vet");
  general.push("• Pet first aid kit: vet wrap, antiseptic, tweezers, thermometer");

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🐾 Pet safety check:",
    "🐕 Dog walking forecast:",
    "🐈 Pet weather report:",
    "🐶 Outdoor safety for pets:",
    "🐱 Zephye's pet advisory:",
    "🐰 Animal weather conditions:",
    "🦮 Pet parent weather:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Verdict
  response += `📊 OVERALL: ${verdict.join(' ')}\n\n`;
  
  // Current Conditions
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temperature: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  if (petType === 'dog') response += `• Pavement temp: ~${pavementTemp}°C\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• UV Index: ${uvIndex}\n`;
  if (aqi > 50) response += `• AQI: ${aqi}\n`;
  response += '\n';
  
  // Pavement
  if (pawCare.length > 0) {
    pawCare.forEach(p => response += `${p}\n`);
    response += '\n';
  }
  
  // Heat Safety
  if (heatSafety.length > 0) {
    response += `🔥 HEAT SAFETY:\n`;
    heatSafety.forEach(h => response += `${h}\n`);
    response += '\n';
  }
  
  // Cold Safety
  if (coldSafety.length > 0) {
    response += `❄️ COLD SAFETY:\n`;
    coldSafety.forEach(c => response += `${c}\n`);
    response += '\n';
  }
  
  // Dog Walking
  if (dogWalking.length > 0) {
    response += `🦮 WALKING:\n`;
    dogWalking.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Breed Specific
  if (breedSpecific.length > 0) {
    breedSpecific.forEach(b => response += `${b}\n`);
    response += '\n';
  }
  
  // Seasonal Hazards
  if (seasonalHazards.length > 0) {
    seasonalHazards.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // General
  if (general.length > 0) {
    general.forEach(g => response += `${g}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ CRITICAL WARNINGS:\n`;
    warnings.forEach(w => response += `• ${w}\n`);
    response += '\n';
  }
  
  // Final
  response += `💡 BOTTOM LINE:\n`;
  if (heatIndex > 35 || windChill < -18) {
    response += `EXTREME weather. Quick potty breaks only. Keep pets inside.\n`;
  } else if (pavementTemp > 52) {
    response += `Pavement dangerously hot. Grass only. Walk before sunrise.\n`;
  } else if (effectiveTemp >= 10 && effectiveTemp <= 24 && !isRaining) {
    response += `PERFECT pet weather! Enjoy your outdoor time together.\n`;
  } else {
    response += `Take standard precautions. Adjust activity to conditions.\n`;
  }
  
  const petWisdom = [
    "Dogs do speak, but only to those who know how to listen. - Orhan Pamuk",
    "Until one has loved an animal, a part of one's soul remains unawakened. - Anatole France",
    "The better I get to know men, the more I find myself loving dogs. - Charles de Gaulle",
    "Animals are such agreeable friends—they ask no questions; they pass no criticisms. - George Eliot",
    "A dog is the only thing on earth that loves you more than he loves himself. - Josh Billings"
  ];
  response += `\n🐾 ${random(petWisdom)}`;

  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export const getPavementSafety = getPavementSafety;
export const getCarSafety = getCarSafety;
export const getParasiteRisk = getParasiteRisk;

export default getPetsAdvice;
