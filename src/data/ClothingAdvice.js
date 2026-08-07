import { calcHeatIndex, calcWindChill, calcDewPoint, getUVLevel, getAQICategory, random, getSeason, getTimeOfDay, getSunPosition, getDayLength, mapWeatherCode } from './calculations';
// ============================================================================
// COMPREHENSIVE CLOTHING ADVICE SYSTEM
// ============================================================================

export const sampleQuestions = [
  "What should I wear today?",
  "Do I need an umbrella?",
  "Is it cold outside?",
  "Should I bring a jacket?",
  "Can I wear shorts?",
  "Do I need a raincoat?",
  "Is it hoodie weather?",
  "Should I wear sandals?",
  "Will I need sunglasses?",
  "What layers should I wear?",
  "Is it sweater weather?",
  "Do I need gloves?",
  "What shoes should I wear?",
  "Is it too hot for jeans?",
  "Should I wear a hat?",
  "Do I need sunscreen?",
  "What about wind chill?",
  "Is it breathable fabric day?",
  "Can I wear white today?",
  "Do I need thermal underwear?",
  "Is it parka weather?",
  "Should I bring a change of clothes?",
  "What's the comfort index?",
  "Can I wear my new suede shoes?",
  "Is it scarf weather?",
  "Do I need ear protection?",
  "What about my baby/toddler?",
  "Elderly person clothing advice?",
  "Running outfit today?",
  "Office attire weather advice?",
  "Date night outfit weather?",
  "Beach day clothing?",
  "Hiking gear needed?",
  "Cycling clothes today?",
  "Gym outfit weather impact?",
  "Travel outfit for today?",
  "Photography session clothes?",
  "Wedding guest outfit weather?",
  "Interview attire + weather?",
  "Casual Friday weather fit?"
];

// ============================================================================
// FABRIC & MATERIAL DATABASE
// ============================================================================

const FABRIC_DATABASE = {
  cotton: {
    breathability: 9,
    warmth: 3,
    waterResistance: 1,
    windResistance: 2,
    dryingTime: 'slow',
    bestFor: [20, 35],
    worstFor: ['rain', 'extreme cold'],
    static: false,
    weight: 'light-medium',
    care: 'easy'
  },
  linen: {
    breathability: 10,
    warmth: 2,
    waterResistance: 1,
    windResistance: 1,
    dryingTime: 'fast',
    bestFor: [25, 40],
    worstFor: ['cold', 'formal'],
    static: false,
    weight: 'light',
    care: 'wrinkles easily'
  },
  wool: {
    breathability: 7,
    warmth: 9,
    waterResistance: 6,
    windResistance: 8,
    dryingTime: 'slow',
    bestFor: [-10, 10],
    worstFor: ['hot', 'sensitive skin'],
    static: true,
    weight: 'medium-heavy',
    care: 'dry clean or hand wash'
  },
  merino: {
    breathability: 8,
    warmth: 8,
    waterResistance: 5,
    windResistance: 7,
    dryingTime: 'medium',
    bestFor: [-5, 15],
    worstFor: ['extreme heat'],
    static: false,
    weight: 'light-medium',
    care: 'machine washable'
  },
  polyester: {
    breathability: 4,
    warmth: 4,
    waterResistance: 8,
    windResistance: 9,
    dryingTime: 'very fast',
    bestFor: [5, 20],
    worstFor: ['sensitive skin', 'hot yoga'],
    static: true,
    weight: 'light',
    care: 'easy'
  },
  nylon: {
    breathability: 3,
    warmth: 3,
    waterResistance: 9,
    windResistance: 9,
    dryingTime: 'very fast',
    bestFor: [0, 15],
    worstFor: ['high heat', 'breathability needed'],
    static: true,
    weight: 'light',
    care: 'easy'
  },
  fleece: {
    breathability: 5,
    warmth: 8,
    waterResistance: 3,
    windResistance: 5,
    dryingTime: 'medium',
    bestFor: [-5, 10],
    worstFor: ['rain', 'formal'],
    static: true,
    weight: 'medium',
    care: 'machine washable'
  },
  down: {
    breathability: 6,
    warmth: 10,
    waterResistance: 1,
    windResistance: 7,
    dryingTime: 'very slow',
    bestFor: [-20, 0],
    worstFor: ['rain', 'wet conditions'],
    static: false,
    weight: 'light',
    care: 'special cleaning'
  },
  synthetic_insulation: {
    breathability: 5,
    warmth: 8,
    waterResistance: 7,
    windResistance: 8,
    dryingTime: 'medium',
    bestFor: [-10, 5],
    worstFor: ['extreme cold without layers'],
    static: true,
    weight: 'medium',
    care: 'machine washable'
  },
  silk: {
    breathability: 8,
    warmth: 6,
    waterResistance: 2,
    windResistance: 2,
    dryingTime: 'fast',
    bestFor: [10, 25],
    worstFor: ['rain', 'rough activities'],
    static: true,
    weight: 'very light',
    care: 'hand wash or dry clean'
  },
  denim: {
    breathability: 5,
    warmth: 5,
    waterResistance: 3,
    windResistance: 6,
    dryingTime: 'very slow',
    bestFor: [5, 25],
    worstFor: ['extreme heat', 'rain'],
    static: false,
    weight: 'heavy',
    care: 'machine washable'
  },
  leather: {
    breathability: 2,
    warmth: 7,
    waterResistance: 8,
    windResistance: 10,
    dryingTime: 'slow',
    bestFor: [-5, 15],
    worstFor: ['rain', 'heat'],
    static: false,
    weight: 'heavy',
    care: 'special cleaning'
  },
  bamboo: {
    breathability: 9,
    warmth: 4,
    waterResistance: 2,
    windResistance: 2,
    dryingTime: 'medium',
    bestFor: [18, 32],
    worstFor: ['extreme cold'],
    static: false,
    weight: 'light',
    care: 'machine washable'
  },
  hemp: {
    breathability: 9,
    warmth: 3,
    waterResistance: 3,
    windResistance: 3,
    dryingTime: 'medium',
    bestFor: [20, 35],
    worstFor: ['formal', 'cold'],
    static: false,
    weight: 'medium',
    care: 'machine washable'
  },
  cashmere: {
    breathability: 7,
    warmth: 9,
    waterResistance: 3,
    windResistance: 4,
    dryingTime: 'slow',
    bestFor: [-5, 10],
    worstFor: ['rain', 'rough use'],
    static: true,
    weight: 'light',
    care: 'dry clean or hand wash'
  },
  goretex: {
    breathability: 8,
    warmth: 5,
    waterResistance: 10,
    windResistance: 10,
    dryingTime: 'fast',
    bestFor: [-5, 15],
    worstFor: ['budget conscious'],
    static: false,
    weight: 'medium',
    care: 'special cleaning'
  },
  spandex: {
    breathability: 6,
    warmth: 3,
    waterResistance: 4,
    windResistance: 4,
    dryingTime: 'fast',
    bestFor: [15, 30],
    worstFor: ['cold', 'formal'],
    static: true,
    weight: 'light',
    care: 'machine washable'
  },
  corduroy: {
    breathability: 4,
    warmth: 7,
    waterResistance: 4,
    windResistance: 6,
    dryingTime: 'slow',
    bestFor: [0, 15],
    worstFor: ['rain', 'heat'],
    static: true,
    weight: 'heavy',
    care: 'machine washable'
  },
  velvet: {
    breathability: 3,
    warmth: 7,
    waterResistance: 2,
    windResistance: 4,
    dryingTime: 'slow',
    bestFor: [5, 18],
    worstFor: ['rain', 'casual'],
    static: true,
    weight: 'medium-heavy',
    care: 'dry clean'
  }
};

// ============================================================================
// COLOR & HEAT ABSORPTION DATABASE
// ============================================================================

const COLOR_HEAT_DATA = {
  white: { absorption: 0.1, reflection: 0.9, bestTemp: [25, 45], worstTemp: [-10, 10] },
  cream: { absorption: 0.15, reflection: 0.85, bestTemp: [23, 42], worstTemp: [-8, 12] },
  beige: { absorption: 0.2, reflection: 0.8, bestTemp: [22, 40], worstTemp: [-5, 12] },
  yellow: { absorption: 0.25, reflection: 0.75, bestTemp: [20, 38], worstTemp: [-5, 15] },
  light_blue: { absorption: 0.3, reflection: 0.7, bestTemp: [18, 35], worstTemp: [-3, 18] },
  light_green: { absorption: 0.3, reflection: 0.7, bestTemp: [18, 35], worstTemp: [-3, 18] },
  pink: { absorption: 0.35, reflection: 0.65, bestTemp: [15, 33], worstTemp: [0, 20] },
  orange: { absorption: 0.4, reflection: 0.6, bestTemp: [12, 30], worstTemp: [2, 22] },
  red: { absorption: 0.5, reflection: 0.5, bestTemp: [10, 28], worstTemp: [5, 25] },
  purple: { absorption: 0.55, reflection: 0.45, bestTemp: [8, 25], worstTemp: [5, 28] },
  brown: { absorption: 0.6, reflection: 0.4, bestTemp: [5, 22], worstTemp: [8, 30] },
  dark_green: { absorption: 0.7, reflection: 0.3, bestTemp: [0, 20], worstTemp: [12, 32] },
  navy: { absorption: 0.75, reflection: 0.25, bestTemp: [-5, 15], worstTemp: [15, 35] },
  dark_gray: { absorption: 0.8, reflection: 0.2, bestTemp: [-8, 12], worstTemp: [18, 38] },
  black: { absorption: 0.9, reflection: 0.1, bestTemp: [-10, 8], worstTemp: [20, 40] },
  charcoal: { absorption: 0.85, reflection: 0.15, bestTemp: [-8, 10], worstTemp: [18, 38] }
};

// ============================================================================
// CLOTHING ITEM DATABASE
// ============================================================================

const CLOTHING_ITEMS = {
  // TOPS
  tank_top: {
    type: 'top',
    warmth: 1,
    coverage: 'minimal',
    fabric: ['cotton', 'linen', 'bamboo'],
    temperatureRange: [25, 40],
    formality: 'casual',
    layering: 'base',
    windResistance: 0,
    waterResistance: 0,
    sunProtection: 1
  },
  t_shirt: {
    type: 'top',
    warmth: 2,
    coverage: 'short sleeve',
    fabric: ['cotton', 'linen', 'bamboo', 'merino', 'polyester'],
    temperatureRange: [20, 35],
    formality: 'casual',
    layering: 'base',
    windResistance: 1,
    waterResistance: 1,
    sunProtection: 2
  },
  long_sleeve_tee: {
    type: 'top',
    warmth: 3,
    coverage: 'long sleeve',
    fabric: ['cotton', 'merino', 'bamboo', 'polyester'],
    temperatureRange: [15, 25],
    formality: 'casual',
    layering: 'base',
    windResistance: 2,
    waterResistance: 1,
    sunProtection: 3
  },
  polo_shirt: {
    type: 'top',
    warmth: 2.5,
    coverage: 'short sleeve',
    fabric: ['cotton', 'polyester', 'bamboo'],
    temperatureRange: [18, 30],
    formality: 'smart casual',
    layering: 'single',
    windResistance: 1,
    waterResistance: 1,
    sunProtection: 2
  },
  button_down: {
    type: 'top',
    warmth: 3,
    coverage: 'long sleeve',
    fabric: ['cotton', 'linen', 'silk', 'polyester'],
    temperatureRange: [12, 28],
    formality: 'business casual',
    layering: 'single or over',
    windResistance: 2,
    waterResistance: 1,
    sunProtection: 3
  },
  dress_shirt: {
    type: 'top',
    warmth: 3.5,
    coverage: 'long sleeve',
    fabric: ['cotton', 'silk', 'polyester'],
    temperatureRange: [10, 25],
    formality: 'formal',
    layering: 'single',
    windResistance: 2,
    waterResistance: 1,
    sunProtection: 3
  },
  sweater: {
    type: 'top',
    warmth: 6,
    coverage: 'long sleeve',
    fabric: ['wool', 'cashmere', 'cotton', 'fleece', 'acrylic'],
    temperatureRange: [-5, 15],
    formality: 'casual to smart casual',
    layering: 'mid',
    windResistance: 4,
    waterResistance: 2,
    sunProtection: 3
  },
  turtleneck: {
    type: 'top',
    warmth: 7,
    coverage: 'long sleeve + neck',
    fabric: ['wool', 'cashmere', 'cotton', 'fleece'],
    temperatureRange: [-10, 10],
    formality: 'smart casual to formal',
    layering: 'mid',
    windResistance: 5,
    waterResistance: 2,
    sunProtection: 3
  },
  hoodie: {
    type: 'top',
    warmth: 6,
    coverage: 'long sleeve + hood',
    fabric: ['cotton', 'fleece', 'polyester'],
    temperatureRange: [-5, 18],
    formality: 'casual',
    layering: 'mid or outer',
    windResistance: 5,
    waterResistance: 2,
    sunProtection: 3
  },
  cardigan: {
    type: 'top',
    warmth: 5,
    coverage: 'long sleeve',
    fabric: ['wool', 'cotton', 'cashmere', 'acrylic'],
    temperatureRange: [0, 18],
    formality: 'smart casual',
    layering: 'mid or outer',
    windResistance: 3,
    waterResistance: 2,
    sunProtection: 2
  },
  blazer: {
    type: 'top',
    warmth: 4,
    coverage: 'long sleeve',
    fabric: ['wool', 'cotton', 'linen', 'polyester'],
    temperatureRange: [5, 25],
    formality: 'business to formal',
    layering: 'outer',
    windResistance: 5,
    waterResistance: 3,
    sunProtection: 2
  },
  denim_jacket: {
    type: 'top',
    warmth: 4,
    coverage: 'long sleeve',
    fabric: ['denim'],
    temperatureRange: [5, 22],
    formality: 'casual',
    layering: 'outer',
    windResistance: 6,
    waterResistance: 3,
    sunProtection: 2
  },
  leather_jacket: {
    type: 'top',
    warmth: 6,
    coverage: 'long sleeve',
    fabric: ['leather'],
    temperatureRange: [-5, 18],
    formality: 'casual to smart casual',
    layering: 'outer',
    windResistance: 9,
    waterResistance: 7,
    sunProtection: 2
  },
  bomber_jacket: {
    type: 'top',
    warmth: 5,
    coverage: 'long sleeve',
    fabric: ['nylon', 'polyester', 'leather'],
    temperatureRange: [0, 18],
    formality: 'casual',
    layering: 'outer',
    windResistance: 8,
    waterResistance: 6,
    sunProtection: 2
  },
  light_jacket: {
    type: 'top',
    warmth: 3,
    coverage: 'long sleeve',
    fabric: ['cotton', 'nylon', 'polyester'],
    temperatureRange: [10, 22],
    formality: 'casual',
    layering: 'outer',
    windResistance: 4,
    waterResistance: 4,
    sunProtection: 2
  },
  raincoat: {
    type: 'top',
    warmth: 2,
    coverage: 'long sleeve + hood',
    fabric: ['nylon', 'polyester', 'goretex'],
    temperatureRange: [0, 25],
    formality: 'casual',
    layering: 'outer',
    windResistance: 9,
    waterResistance: 10,
    sunProtection: 2
  },
  trench_coat: {
    type: 'top',
    warmth: 5,
    coverage: 'long sleeve + long',
    fabric: ['cotton', 'wool', 'polyester'],
    temperatureRange: [0, 18],
    formality: 'smart casual to formal',
    layering: 'outer',
    windResistance: 7,
    waterResistance: 6,
    sunProtection: 2
  },
  parka: {
    type: 'top',
    warmth: 9,
    coverage: 'long sleeve + hood + long',
    fabric: ['nylon', 'polyester', 'down', 'synthetic_insulation'],
    temperatureRange: [-25, 0],
    formality: 'casual',
    layering: 'outer',
    windResistance: 9,
    waterResistance: 8,
    sunProtection: 2
  },
  puffer_jacket: {
    type: 'top',
    warmth: 10,
    coverage: 'long sleeve',
    fabric: ['nylon', 'polyester', 'down', 'synthetic_insulation'],
    temperatureRange: [-30, 5],
    formality: 'casual',
    layering: 'outer',
    windResistance: 8,
    waterResistance: 5,
    sunProtection: 2
  },
  windbreaker: {
    type: 'top',
    warmth: 2,
    coverage: 'long sleeve',
    fabric: ['nylon', 'polyester'],
    temperatureRange: [5, 22],
    formality: 'casual to sporty',
    layering: 'outer',
    windResistance: 10,
    waterResistance: 7,
    sunProtection: 2
  },
  softshell_jacket: {
    type: 'top',
    warmth: 5,
    coverage: 'long sleeve',
    fabric: ['polyester', 'fleece', 'nylon'],
    temperatureRange: [-5, 15],
    formality: 'sporty casual',
    layering: 'mid or outer',
    windResistance: 8,
    waterResistance: 7,
    sunProtection: 2
  },
  hardshell_jacket: {
    type: 'top',
    warmth: 3,
    coverage: 'long sleeve + hood',
    fabric: ['goretex', 'nylon'],
    temperatureRange: [-5, 15],
    formality: 'technical',
    layering: 'outer',
    windResistance: 10,
    waterResistance: 10,
    sunProtection: 2
  },
  
  // BOTTOMS
  shorts: {
    type: 'bottom',
    warmth: 1,
    coverage: 'above knee',
    fabric: ['cotton', 'linen', 'polyester', 'nylon'],
    temperatureRange: [22, 40],
    formality: 'casual',
    windResistance: 0,
    waterResistance: 1,
    sunProtection: 1
  },
  cargo_shorts: {
    type: 'bottom',
    warmth: 1.5,
    coverage: 'knee length',
    fabric: ['cotton', 'polyester', 'nylon'],
    temperatureRange: [20, 38],
    formality: 'casual',
    windResistance: 1,
    waterResistance: 2,
    sunProtection: 2
  },
  chino_shorts: {
    type: 'bottom',
    warmth: 1.5,
    coverage: 'above knee',
    fabric: ['cotton', 'linen'],
    temperatureRange: [20, 35],
    formality: 'smart casual',
    windResistance: 1,
    waterResistance: 2,
    sunProtection: 1
  },
  jeans: {
    type: 'bottom',
    warmth: 5,
    coverage: 'full leg',
    fabric: ['denim'],
    temperatureRange: [-5, 25],
    formality: 'casual',
    windResistance: 6,
    waterResistance: 3,
    sunProtection: 3
  },
  chinos: {
    type: 'bottom',
    warmth: 3,
    coverage: 'full leg',
    fabric: ['cotton', 'linen'],
    temperatureRange: [5, 30],
    formality: 'smart casual',
    windResistance: 3,
    waterResistance: 2,
    sunProtection: 3
  },
  dress_pants: {
    type: 'bottom',
    warmth: 4,
    coverage: 'full leg',
    fabric: ['wool', 'cotton', 'polyester', 'silk'],
    temperatureRange: [0, 25],
    formality: 'formal',
    windResistance: 4,
    waterResistance: 2,
    sunProtection: 3
  },
  sweatpants: {
    type: 'bottom',
    warmth: 6,
    coverage: 'full leg',
    fabric: ['cotton', 'fleece', 'polyester'],
    temperatureRange: [-5, 15],
    formality: 'casual/loungewear',
    windResistance: 3,
    waterResistance: 2,
    sunProtection: 3
  },
  cargo_pants: {
    type: 'bottom',
    warmth: 5,
    coverage: 'full leg',
    fabric: ['cotton', 'polyester', 'nylon'],
    temperatureRange: [0, 25],
    formality: 'casual',
    windResistance: 5,
    waterResistance: 4,
    sunProtection: 3
  },
  thermal_leggings: {
    type: 'bottom',
    warmth: 7,
    coverage: 'full leg',
    fabric: ['wool', 'synthetic_insulation', 'polyester'],
    temperatureRange: [-15, 5],
    formality: 'base layer',
    windResistance: 4,
    waterResistance: 3,
    sunProtection: 3
  },
  skirt: {
    type: 'bottom',
    warmth: 2,
    coverage: 'varies',
    fabric: ['cotton', 'wool', 'polyester', 'silk', 'denim'],
    temperatureRange: [5, 30],
    formality: 'varies',
    windResistance: 1,
    waterResistance: 1,
    sunProtection: 1
  },
  dress: {
    type: 'full body',
    warmth: 2.5,
    coverage: 'varies',
    fabric: ['cotton', 'silk', 'polyester', 'wool', 'linen'],
    temperatureRange: [5, 35],
    formality: 'varies',
    windResistance: 2,
    waterResistance: 2,
    sunProtection: 2
  },
  
  // FOOTWEAR
  sandals: {
    type: 'footwear',
    warmth: 0,
    waterResistance: 1,
    grip: 'low',
    coverage: 'minimal',
    temperatureRange: [22, 40],
    bestConditions: ['dry', 'hot'],
    worstConditions: ['rain', 'cold', 'snow', 'ice']
  },
  flip_flops: {
    type: 'footwear',
    warmth: 0,
    waterResistance: 5,
    grip: 'very low',
    coverage: 'minimal',
    temperatureRange: [25, 40],
    bestConditions: ['dry', 'beach'],
    worstConditions: ['cold', 'formal', 'long walks']
  },
  sneakers: {
    type: 'footwear',
    warmth: 3,
    waterResistance: 3,
    grip: 'medium',
    coverage: 'full foot',
    temperatureRange: [5, 35],
    bestConditions: ['dry', 'light rain'],
    worstConditions: ['heavy rain', 'snow', 'formal']
  },
  running_shoes: {
    type: 'footwear',
    warmth: 3,
    waterResistance: 2,
    grip: 'high',
    coverage: 'full foot',
    temperatureRange: [5, 35],
    bestConditions: ['dry', 'pavement'],
    worstConditions: ['heavy rain', 'snow', 'formal']
  },
  boots: {
    type: 'footwear',
    warmth: 6,
    waterResistance: 7,
    grip: 'high',
    coverage: 'ankle+',
    temperatureRange: [-15, 20],
    bestConditions: ['rain', 'snow', 'cold'],
    worstConditions: ['extreme heat']
  },
  hiking_boots: {
    type: 'footwear',
    warmth: 6,
    waterResistance: 8,
    grip: 'very high',
    coverage: 'ankle+',
    temperatureRange: [-10, 25],
    bestConditions: ['trails', 'rain', 'rough terrain'],
    worstConditions: ['formal', 'extreme heat']
  },
  winter_boots: {
    type: 'footwear',
    warmth: 9,
    waterResistance: 9,
    grip: 'high',
    coverage: 'ankle to knee',
    temperatureRange: [-30, 5],
    bestConditions: ['snow', 'ice', 'extreme cold'],
    worstConditions: ['warm', 'indoor']
  },
  rain_boots: {
    type: 'footwear',
    warmth: 3,
    waterResistance: 10,
    grip: 'medium',
    coverage: 'knee',
    temperatureRange: [0, 20],
    bestConditions: ['heavy rain', 'flooding'],
    worstConditions: ['formal', 'extreme cold', 'long walks']
  },
  dress_shoes: {
    type: 'footwear',
    warmth: 3,
    waterResistance: 2,
    grip: 'low',
    coverage: 'full foot',
    temperatureRange: [5, 30],
    bestConditions: ['dry', 'formal'],
    worstConditions: ['rain', 'snow', 'ice', 'long walks']
  },
  loafers: {
    type: 'footwear',
    warmth: 2,
    waterResistance: 2,
    grip: 'low',
    coverage: 'full foot',
    temperatureRange: [10, 32],
    bestConditions: ['dry', 'smart casual'],
    worstConditions: ['rain', 'snow', 'sports']
  },
  espadrilles: {
    type: 'footwear',
    warmth: 1,
    waterResistance: 1,
    grip: 'low',
    coverage: 'partial foot',
    temperatureRange: [20, 35],
    bestConditions: ['dry', 'beach', 'summer'],
    worstConditions: ['rain', 'cold', 'rough terrain']
  },
  
  // ACCESSORIES
  baseball_cap: {
    type: 'headwear',
    warmth: 1,
    sunProtection: 'face',
    waterResistance: 2,
    temperatureRange: [10, 38]
  },
  beanie: {
    type: 'headwear',
    warmth: 7,
    sunProtection: 'none',
    waterResistance: 3,
    temperatureRange: [-20, 10]
  },
  wide_brim_hat: {
    type: 'headwear',
    warmth: 2,
    sunProtection: 'full',
    waterResistance: 5,
    temperatureRange: [15, 40]
  },
  bucket_hat: {
    type: 'headwear',
    warmth: 2,
    sunProtection: 'good',
    waterResistance: 4,
    temperatureRange: [12, 35]
  },
  trapper_hat: {
    type: 'headwear',
    warmth: 9,
    sunProtection: 'none',
    waterResistance: 6,
    temperatureRange: [-30, 0]
  },
  sun_hat: {
    type: 'headwear',
    warmth: 1,
    sunProtection: 'excellent',
    waterResistance: 3,
    temperatureRange: [20, 40]
  },
  scarf: {
    type: 'neckwear',
    warmth: 5,
    windProtection: 'good',
    temperatureRange: [-15, 10]
  },
  neck_gaiter: {
    type: 'neckwear',
    warmth: 6,
    windProtection: 'excellent',
    temperatureRange: [-20, 5]
  },
  light_scarf: {
    type: 'neckwear',
    warmth: 2,
    windProtection: 'light',
    temperatureRange: [5, 20]
  },
  gloves: {
    type: 'handwear',
    warmth: 6,
    dexterity: 'medium',
    temperatureRange: [-10, 5]
  },
  mittens: {
    type: 'handwear',
    warmth: 9,
    dexterity: 'low',
    temperatureRange: [-20, -5]
  },
  touchscreen_gloves: {
    type: 'handwear',
    warmth: 4,
    dexterity: 'high',
    temperatureRange: [-5, 10]
  },
  sunglasses: {
    type: 'eyewear',
    uvProtection: 'essential',
    glareReduction: 'high',
    temperatureRange: [5, 40]
  },
  umbrella: {
    type: 'rain gear',
    coverage: 'full body',
    windResistance: 'low',
    portability: 'medium'
  },
  compact_umbrella: {
    type: 'rain gear',
    coverage: 'body',
    windResistance: 'very low',
    portability: 'high'
  },
  golf_umbrella: {
    type: 'rain gear',
    coverage: 'full body+',
    windResistance: 'medium',
    portability: 'low'
  }
};

// ============================================================================
// ACTIVITY CONTEXT SYSTEM
// ============================================================================

const ACTIVITY_REQUIREMENTS = {
  running: {
    breathability: 9,
    moistureWicking: 9,
    flexibility: 9,
    warmth: 'adaptive',
    waterResistance: 'optional',
    visibility: 'recommended',
    special: ['reflective elements', 'compression gear consideration', 'moisture-wicking socks']
  },
  cycling: {
    breathability: 8,
    moistureWicking: 8,
    flexibility: 8,
    windResistance: 8,
    visibility: 'critical',
    special: ['padded shorts', 'windproof front', 'breathable back', 'helmet compatible']
  },
  hiking: {
    breathability: 7,
    moistureWicking: 7,
    durability: 9,
    waterResistance: 7,
    layering: 'essential',
    special: ['merino wool socks', 'broken-in boots', 'trekking poles consideration']
  },
  yoga: {
    breathability: 9,
    flexibility: 10,
    moistureWicking: 8,
    warmth: 'minimal',
    special: ['non-slip', 'form-fitting', '4-way stretch']
  },
  swimming: {
    waterResistance: 'n/a',
    quickDrying: 10,
    uvProtection: 'critical',
    special: ['rash guard consideration', 'water shoes for rocks']
  },
  office: {
    formality: 7,
    breathability: 5,
    layering: 'recommended',
    special: ['indoor temperature consideration', 'commute adjustment']
  },
  date_night: {
    formality: 6,
    style: 9,
    comfort: 7,
    special: ['venue consideration', 'evening temperature drop']
  },
  travel: {
    comfort: 9,
    breathability: 7,
    layering: 'essential',
    wrinkleResistance: 8,
    special: ['compression socks for flights', 'easy-remove shoes for security']
  },
  photography: {
    mobility: 8,
    pockets: 'useful',
    color: 'neutral recommended',
    special: ['lens-friendly fabrics', 'weather protection for gear']
  },
  gardening: {
    durability: 9,
    dirtResistance: 8,
    sunProtection: 8,
    special: ['knee pads consideration', 'gloves essential']
  },
  fishing: {
    waterResistance: 8,
    sunProtection: 8,
    pockets: 'essential',
    special: ['polarized sunglasses', 'hat with neck flap', 'waterproof boots']
  },
  skiing: {
    waterResistance: 10,
    warmth: 9,
    breathability: 7,
    special: ['helmet', 'goggles', 'base layers', 'hand/toe warmers']
  },
  beach: {
    uvProtection: 10,
    quickDrying: 9,
    sandResistance: 'helpful',
    special: ['cover-up', 'water shoes', 'multiple swimsuit recommendation']
  },
  gym: {
    moistureWicking: 9,
    breathability: 8,
    flexibility: 8,
    special: ['compression options', 'headband', 'lifting gloves consideration']
  },
  construction: {
    durability: 10,
    safety: 'critical',
    visibility: 'essential',
    special: ['steel-toe boots', 'hard hat', 'safety vest', 'work gloves']
  }
};

// ============================================================================
// HEALTH & COMFORT CALCULATORS
// ============================================================================

function calculateComfortIndex(temp, humidity, wind, uvIndex) {
  let comfort = 100;
  
  // Temperature penalties
  if (temp < -10) comfort -= 30;
  else if (temp < 0) comfort -= 20;
  else if (temp < 10) comfort -= 10;
  else if (temp > 35) comfort -= 30;
  else if (temp > 30) comfort -= 20;
  else if (temp > 28) comfort -= 10;
  
  // Humidity penalties
  if (humidity > 90) comfort -= 15;
  else if (humidity > 80) comfort -= 10;
  else if (humidity > 70) comfort -= 5;
  else if (humidity < 20) comfort -= 10;
  else if (humidity < 30) comfort -= 5;
  
  // Wind penalties
  if (wind > 50) comfort -= 20;
  else if (wind > 40) comfort -= 15;
  else if (wind > 30) comfort -= 10;
  else if (wind > 20) comfort -= 5;
  
  // UV penalties
  if (uvIndex > 11) comfort -= 15;
  else if (uvIndex > 8) comfort -= 10;
  else if (uvIndex > 6) comfort -= 5;
  
  return Math.max(0, Math.min(100, comfort));
}

function calculateLayeringIndex(temp, wind, humidity) {
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = windChill < temp ? windChill : temp;
  
  if (effectiveTemp < -20) return { layers: 5, description: 'Expedition level' };
  if (effectiveTemp < -10) return { layers: 4, description: 'Heavy winter layering' };
  if (effectiveTemp < 0) return { layers: 3, description: 'Winter layering' };
  if (effectiveTemp < 10) return { layers: 2, description: 'Light layering' };
  if (effectiveTemp < 20) return { layers: 1, description: 'Single layer' };
  return { layers: 0, description: 'Minimal clothing' };
}

function calculateSweatRate(temp, humidity, activityLevel = 'moderate') {
  const activityMultiplier = {
    sedentary: 0.5,
    light: 1,
    moderate: 2,
    vigorous: 3,
    extreme: 4
  };
  
  const baseRate = (temp - 20) * 0.1 + (humidity - 50) * 0.05;
  return Math.max(0.5, baseRate * (activityMultiplier[activityLevel] || 2));
}

// ============================================================================
// SPECIAL CONDITION HANDLERS
// ============================================================================

function handleExtremeCold(data) {
  const { temp, wind, windGust, humidity } = data;
  const windChill = calcWindChill(temp, wind);
  const advice = [];
  
  if (windChill < -50) {
    advice.push("LIFE-THREATENING COLD: Exposed skin freezes in under 2 minutes.");
    advice.push("Full expedition gear required: thermal base, 2-3 insulating layers, windproof outer.");
    advice.push("Face mask, goggles, mittens (not gloves), hand warmers.");
    advice.push("Do not go outside unless absolutely necessary.");
  } else if (windChill < -40) {
    advice.push("EXTREME COLD WARNING: Frostbite possible in 5-10 minutes.");
    advice.push("Heavy parka, snow pants, balaclava, ski goggles recommended.");
    advice.push("Multiple wool/synthetic layers. No cotton anywhere.");
    advice.push("Limit outdoor exposure to 15 minutes maximum.");
  } else if (windChill < -30) {
    advice.push("SEVERE COLD: Frostbite risk in 10-30 minutes.");
    advice.push("Insulated winter coat, snow pants, face protection needed.");
    advice.push("Mittens warmer than gloves. Wool socks + insulated boots.");
    advice.push("Check on elderly neighbors. Bring pets inside.");
  } else if (windChill < -20) {
    advice.push("VERY COLD: Cover all exposed skin.");
    advice.push("Heavy winter coat, hat, gloves, scarf essential.");
    advice.push("Layer up: thermal + fleece + windproof outer.");
  }
  
  return advice;
}

function handleExtremeHeat(data) {
  const { temp, humidity, uvIndex } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = [];
  
  if (heatIndex > 54) {
    advice.push("EXTREME HEAT DANGER: Heat stroke imminent.");
    advice.push("Stay in air conditioning. Do not go outside.");
    advice.push("If you must go out: white/light clothing, wide brim hat, SPF 100.");
    advice.push("Drink 1 liter of water per hour if active.");
  } else if (heatIndex > 41) {
    advice.push("DANGEROUS HEAT: Heat exhaustion likely with prolonged exposure.");
    advice.push("Loose, light-colored, breathable fabrics only (linen, cotton).");
    advice.push("No dark colors - they absorb 90% more heat.");
    advice.push("Cooling towel around neck. Electrolyte drinks needed.");
  } else if (heatIndex > 32) {
    advice.push("EXTREME CAUTION: Heat cramps and exhaustion possible.");
    advice.push("Lightweight, light-colored clothing. Sun protection essential.");
    advice.push("Take frequent shade breaks. Know heat illness symptoms.");
  }
  
  return advice;
}

function handleHeavyRain(data) {
  const { temp, wind, precipitation } = data;
  const advice = [];
  
  if (precipitation > 50) {
    advice.push("TORRENTIAL RAIN: Flooding possible. Stay off roads if possible.");
    advice.push("Full waterproof gear: raincoat, rain pants, waterproof boots.");
    advice.push("Avoid canvas and leather - they'll be ruined.");
    advice.push("Bring complete change of clothes in waterproof bag.");
  } else if (precipitation > 25) {
    advice.push("HEAVY RAIN: You WILL get wet without proper gear.");
    advice.push("Waterproof jacket + pants + boots. Umbrella won't help in wind.");
    advice.push("Quick-dry fabrics underneath. Avoid cotton (stays wet, causes chills).");
  } else if (precipitation > 10) {
    advice.push("STEADY RAIN: Waterproof jacket or sturdy umbrella needed.");
    advice.push("Water-resistant shoes at minimum. Watch for puddles.");
    advice.push("Layer underneath - rain gear traps heat.");
  }
  
  if (temp < 10) {
    advice.push("COLD RAIN ALERT: Hypothermia risk if wet. Stay dry at all costs.");
    advice.push("Waterproof EVERYTHING. Bring emergency blanket in car.");
  }
  
  return advice;
}

function handleHighWind(data) {
  const { wind, windGust, temp } = data;
  const advice = [];
  
  if (wind > 60 || windGust > 80) {
    advice.push("DANGEROUS WIND: Seek shelter. Avoid travel.");
    advice.push("Flying debris risk. If outside, eye protection essential.");
    advice.push("No loose clothing, scarves, or umbrellas - they become hazards.");
  } else if (wind > 40 || windGust > 60) {
    advice.push("STRONG WIND: Difficult to walk. Driving dangerous for high vehicles.");
    advice.push("Windproof outer layer critical. Secure all loose items.");
    advice.push("Form-fitting clothes prevent wind from catching. No skirts/dresses.");
  } else if (wind > 25) {
    advice.push("WINDY: Wind chill will make it feel significantly colder.");
    advice.push("Windbreaker or tightly woven outer layer recommended.");
    advice.push("Secure hats. Hair will tangle - braid or tie back.");
  }
  
  return advice;
}

function handleThunderstorm(data) {
  const advice = [];
  
  advice.push("THUNDERSTORM: Lightning risk. Avoid open areas, tall objects, water.");
  advice.push("If outside: no umbrellas (lightning risk). Seek proper shelter.");
  advice.push("Waterproof gear essential. Avoid metal accessories (jewelry, belts).");
  advice.push("Rubber-soled shoes provide NO lightning protection (myth).");
  
  if (data.temp < 15) {
    advice.push("Cold thunderstorm: waterproof + insulating layers. No metal zippers if possible.");
  }
  
  return advice;
}

function handleSnowConditions(data) {
  const { temp, snow, wind } = data;
  const advice = [];
  
  if (snow > 20) {
    advice.push("HEAVY SNOW: Travel only if necessary. Full snow gear required.");
    advice.push("Waterproof snow boots, snow pants, heavy parka.");
    advice.push("Goggles better than sunglasses. Face protection essential.");
  } else if (snow > 5) {
    advice.push("SNOW: Waterproof boots with good tread essential.");
    advice.push("Insulated, waterproof gloves. Extra socks in bag.");
    advice.push("Layer up - you can always remove layers if too warm.");
  } else {
    advice.push("LIGHT SNOW: Boots with grip recommended. Watch for ice.");
    advice.push("Waterproof outer layer. Snow sticks and melts = wet clothes.");
  }
  
  if (temp > 0 && temp < 4) {
    advice.push("WET SNOW: Most dangerous - heavy, slushy, soaks through clothes.");
    advice.push("Completely waterproof gear needed. Change of clothes essential.");
  }
  
  return advice;
}

// ============================================================================
// TIME-BASED ADJUSTMENTS
// ============================================================================

function getTimeBasedAdjustments(data) {
  const hour = new Date().getHours();
  const adjustments = [];
  const temp = data.temp;
  const tempMin = data.tempMin || temp - 5;
  const tempMax = data.tempMax || temp + 5;
  
  // Morning (5am-9am)
  if (hour >= 5 && hour < 9) {
    adjustments.push("Morning: Temperature will rise. Dress for current temp but bring removable layer.");
    if (tempMin < 10 && tempMax > 20) {
      adjustments.push("Big temperature swing today. Layer strategy: warm morning layer that fits in bag later.");
    }
  }
  
  // Midday (10am-3pm)
  if (hour >= 10 && hour <= 15) {
    adjustments.push("Peak sun hours. UV protection critical even if cool.");
    if (temp > 28) {
      adjustments.push("Hottest part of day. Light colors, breathable fabrics only.");
    }
  }
  
  // Evening (4pm-8pm)
  if (hour >= 16 && hour <= 20) {
    adjustments.push("Evening: Temperature dropping. Bring a layer for later.");
    if (temp > 25 && tempMin < 15) {
      adjustments.push("Significant evening cool-down expected. Jacket or sweater recommended.");
    }
  }
  
  // Night (9pm-4am)
  if (hour >= 21 || hour < 5) {
    adjustments.push("Nighttime: Dark colors fine. Visibility/reflective gear if walking near roads.");
    if (temp < 10) {
      adjustments.push("Cold night: Insulated layers. Body temperature drops while sleeping.");
    }
  }
  
  // Dawn/Dusk specific
  const sunPosition = getSunPosition(data.lat, data.lon);
  if (sunPosition === 'twilight' || sunPosition === 'dawn') {
    adjustments.push("Low light conditions: Reflective/light clothing if near traffic.");
    adjustments.push("Temperature changing rapidly. Versatile layers key.");
  }
  
  return adjustments;
}

// ============================================================================
// PERSON-SPECIFIC ADVICE
// ============================================================================

function getBabyToddlerAdvice(data) {
  const { temp, wind, uvIndex, humidity } = data;
  const advice = [];
  
  advice.push("BABY/TODDLER RULE: One more layer than you'd wear yourself.");
  
  if (temp < 0) {
    advice.push("No outdoor exposure for infants. Frostbite risk on cheeks/fingers.");
    advice.push("If must go out: full snowsuit, mittens (no thumbs), balaclava.");
    advice.push("Check diaper area frequently - wetness + cold = dangerous.");
  } else if (temp < 10) {
    advice.push("Snowsuit or bunting bag. Hat that ties (won't fall off).");
    advice.push("Mittens, warm booties. Blanket over stroller cuts wind.");
    advice.push("Check baby's neck (not hands) to gauge temperature.");
  } else if (temp < 20) {
    advice.push("Layers: onesie + sweater + light jacket. Hat recommended.");
    advice.push("Easy to remove layers for car seat safety.");
    advice.push("Blanket in stroller. Socks essential - babies lose heat through feet.");
  } else if (temp > 28) {
    advice.push("Infants overheat quickly. Minimal clothing - diaper + light onesie.");
    advice.push("Sun protection: UV clothing, wide-brim hat, SPF 50+ (6mo+).");
    advice.push("Stroller fan. Never cover stroller with blanket (creates oven effect).");
    advice.push("Check for overheating: flushed face, rapid breathing, irritability.");
  }
  
  if (uvIndex > 3) {
    advice.push("Baby sunglasses exist and are worth it! Protect developing eyes.");
  }
  
  return advice;
}

function getElderlyAdvice(data) {
  const { temp, wind, humidity } = data;
  const advice = [];
  
  advice.push("ELDERLY CONSIDERATIONS: Reduced temperature sensation and circulation.");
  
  if (temp < 15) {
    advice.push("Dress warmer than you think. Aging reduces cold perception.");
    advice.push("Compression socks improve circulation. Insulated slippers indoors.");
    advice.push("Layer strategy: thermal + wool + windproof. Scarf over mouth in cold.");
  }
  
  if (temp > 30) {
    advice.push("HIGH RISK: Elderly heat stroke common. AC essential if possible.");
    advice.push("Cool, loose, light clothing. Cooling towel on neck/forehead.");
    advice.push("Check medications - some increase heat sensitivity.");
    advice.push("Don't rely on thirst - drink water on schedule every hour.");
  }
  
  if (humidity > 80) {
    advice.push("High humidity makes temperature regulation harder. Dehumidifier indoors.");
  }
  
  return advice;
}

function getPregnancyAdvice(data) {
  const { temp, humidity } = data;
  const advice = [];
  
  advice.push("PREGNANCY NOTE: Body temperature already elevated. Easier to overheat.");
  
  if (temp > 25) {
    advice.push("Extra heat sensitive. Flowy dresses, loose tops essential.");
    advice.push("Compression socks for swelling. Supportive, slip-on shoes.");
    advice.push("Cooling accessories: neck fan, cold water bottle, shade umbrella.");
  }
  
  if (temp < 5) {
    advice.push("Maternity coat or coat extender. Belly needs coverage too.");
    advice.push("Layer easily - pregnancy hot flashes are real.");
  }
  
  return advice;
}

// ============================================================================
// MAIN CLOTHING ADVICE FUNCTION
// ============================================================================

export const getClothingAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  let { 
    temp, feelsLike, condition, humidity, wind, windGust, 
    uvIndex, precipitation, visibility, pressure,
    tempMin, tempMax, snow, dewPoint, aqi
  } = data;

  // ═══ TIME-SHIFT AWARENESS ═══
  if (data._hourIndex !== undefined && data.hourly) {
    const idx = data._hourIndex
    if (data.hourly.temperature_2m?.[idx] !== undefined) temp = Math.round(data.hourly.temperature_2m[idx])
    if (data.hourly.apparent_temperature?.[idx] !== undefined) feelsLike = Math.round(data.hourly.apparent_temperature[idx])
    if (data.hourly.relative_humidity_2m?.[idx] !== undefined) humidity = data.hourly.relative_humidity_2m[idx]
    if (data.hourly.wind_speed_10m?.[idx] !== undefined) wind = data.hourly.wind_speed_10m[idx]
    if (data.hourly.wind_gusts_10m?.[idx] !== undefined) windGust = data.hourly.wind_gusts_10m[idx]
    if (data.hourly.weather_code?.[idx] !== undefined) condition = mapWeatherCode(data.hourly.weather_code[idx])
    if (data.hourly.precipitation?.[idx] !== undefined) precipitation = data.hourly.precipitation[idx]
    if (data.hourly.uv_index?.[idx] !== undefined) uvIndex = data.hourly.uv_index[idx]
    if (data.hourly.visibility?.[idx] !== undefined) visibility = data.hourly.visibility[idx] / 1000
  }
  if (data._dayOffset !== undefined && data.daily) {
    const d = data._dayOffset > 0 ? data._dayOffset : 0
    if (data.daily.temperature_2m_max?.[d] !== undefined) tempMax = Math.round(data.daily.temperature_2m_max[d])
    if (data.daily.temperature_2m_min?.[d] !== undefined) tempMin = Math.round(data.daily.temperature_2m_min[d])
    if (data.daily.weather_code?.[d] !== undefined) condition = mapWeatherCode(data.daily.weather_code[d])
    if (data.daily.precipitation_sum?.[d] !== undefined) precipitation = data.daily.precipitation_sum[d]
  }
  // ═══ END TIME-SHIFT ═══
  
  const realFeel = feelsLike || temp;
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const isCloudy = ['clouds', 'partly-cloudy', 'overcast'].includes(condition);
  const isClear = condition === 'clear';
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : realFeel;
  const comfortIndex = calculateComfortIndex(temp, humidity, wind, uvIndex);
  const layeringNeed = calculateLayeringIndex(temp, wind, humidity);
  const timeOfDay = getTimeOfDay();
  const season = getSeason();
  const uvLevel = getUVLevel(uvIndex);

  // Detect specific question intent
  const questionLower = question.toLowerCase();
  const askingForFootwear = questionLower.includes('shoe') || questionLower.includes('boot') || questionLower.includes('sandal') || questionLower.includes('footwear');
  const askingForHeadwear = questionLower.includes('hat') || questionLower.includes('cap') || questionLower.includes('beanie');
  const askingForAccessories = questionLower.includes('accessor') || questionLower.includes('umbrella') || questionLower.includes('sunglass') || questionLower.includes('glove');
  const askingForLayers = questionLower.includes('layer') || questionLower.includes('sweater') || questionLower.includes('jacket') || questionLower.includes('coat');
  const askingForFabric = questionLower.includes('fabric') || questionLower.includes('material') || questionLower.includes('cotton') || questionLower.includes('wool');
  const askingForColor = questionLower.includes('color') || questionLower.includes('black') || questionLower.includes('white') || questionLower.includes('dark');
  const askingForActivity = questionLower.includes('running') || questionLower.includes('hiking') || questionLower.includes('cycling') || questionLower.includes('gym') || questionLower.includes('office') || questionLower.includes('date') || questionLower.includes('beach') || questionLower.includes('travel');
  const askingForBabies = questionLower.includes('baby') || questionLower.includes('toddler') || questionLower.includes('infant') || questionLower.includes('child');
  const askingForElderly = questionLower.includes('elder') || questionLower.includes('senior') || questionLower.includes('old') || questionLower.includes('grand');
  const askingForPregnancy = questionLower.includes('pregnan') || questionLower.includes('maternity');

  let layers = [];
  let accessories = [];
  let warnings = [];
  let footwear = [];
  let headwear = [];
  let fabrics = [];
  let colors = [];
  let activitySpecific = [];
  let timeAdjustments = [];
  let healthNotes = [];

  // ========================================================================
  // EXTREME CONDITIONS HANDLING (override everything)
  // ========================================================================
  
  if (effectiveTemp < -20 || (windChill < -30)) {
    const extremeCold = handleExtremeCold(data);
    warnings.push(...extremeCold);
  }
  
  if (heatIndex > 41 || (temp > 38 && humidity > 60)) {
    const extremeHeat = handleExtremeHeat(data);
    warnings.push(...extremeHeat);
  }
  
  if (precipitation > 25 || (isRaining && precipitation > 10)) {
    const heavyRain = handleHeavyRain(data);
    warnings.push(...heavyRain);
  }
  
  if (wind > 40 || windGust > 60) {
    const highWind = handleHighWind(data);
    warnings.push(...highWind);
  }
  
  if (condition === 'thunderstorm') {
    const thunderstorm = handleThunderstorm(data);
    warnings.push(...thunderstorm);
  }
  
  if (snow > 0 || (temp < 2 && precipitation > 0)) {
    const snowAdvice = handleSnowConditions(data);
    warnings.push(...snowAdvice);
  }

  // ========================================================================
  // TEMPERATURE-BASED CORE LAYERS
  // ========================================================================
  
  if (effectiveTemp <= -30) {
    layers.push("Expedition-weight thermal base layer (merino wool or synthetic).");
    layers.push("Heavy fleece or down mid-layer. Expedition parka outer.");
    layers.push("Insulated snow pants. Vapor barrier if active.");
    fabrics.push("merino wool", "synthetic insulation", "goretex");
    colors.push("dark colors absorb what little sun there is");
  } else if (effectiveTemp <= -20) {
    layers.push("Heavyweight thermal base. Thick fleece or wool sweater.");
    layers.push("Heavy parka or down jacket. Insulated pants or snow pants.");
    layers.push("Multiple sock layers: liner + heavy wool.");
    fabrics.push("merino wool", "fleece", "down", "goretex");
    colors.push("any color - warmth priority over sun absorption");
  } else if (effectiveTemp <= -10) {
    layers.push("Thermal base layer (top and bottom). Wool or fleece mid-layer.");
    layers.push("Heavy winter coat. Insulated pants or thermal leggings under jeans.");
    layers.push("Thick wool socks. Consider toe warmers.");
    fabrics.push("wool", "fleece", "down", "synthetic insulation");
    colors.push("dark colors retain heat slightly better");
  } else if (effectiveTemp <= -5) {
    layers.push("Base layer + sweater or fleece. Winter coat or heavy jacket.");
    layers.push("Long pants (jeans with thermal underneath or insulated pants).");
    layers.push("Wool socks + insulated boots.");
    fabrics.push("wool", "fleece", "thermal synthetics");
    colors.push("dark to medium colors");
  } else if (effectiveTemp <= 0) {
    layers.push("Thermal top or long sleeve + sweater. Winter jacket.");
    layers.push("Jeans or pants with optional thermal layer. Warm socks.");
    fabrics.push("wool", "fleece", "cotton (only as outer layer)");
    colors.push("dark to medium colors");
  } else if (effectiveTemp <= 5) {
    layers.push("Long sleeve + warm sweater or hoodie. Heavy jacket or coat.");
    layers.push("Jeans or warm pants. Regular to warm socks.");
    fabrics.push("wool", "fleece", "denim", "corduroy");
    colors.push("medium to dark colors for warmth");
  } else if (effectiveTemp <= 10) {
    layers.push("Long sleeve or light sweater. Medium jacket or heavy hoodie.");
    layers.push("Jeans or chinos. Closed shoes with regular socks.");
    fabrics.push("cotton", "wool", "denim", "fleece");
    colors.push("any color - personal preference");
    if (isCloudy || wind > 15) {
      layers.push("Feels cooler than thermometer says. Extra layer recommended.");
    }
  } else if (effectiveTemp <= 15) {
    layers.push("Light long sleeve or t-shirt + light jacket/cardigan/hoodie.");
    layers.push("Jeans, chinos, or light pants. Comfortable closed shoes.");
    layers.push("Morning/evening will feel cool. Have a layer ready.");
    fabrics.push("cotton", "light wool", "denim", "cashmere for lightness");
    colors.push("any color - style priority");
  } else if (effectiveTemp <= 18) {
    layers.push("T-shirt or light long sleeve. Light jacket, blazer, or cardigan optional.");
    layers.push("Jeans, chinos, or casual pants. Sneakers or loafers.");
    layers.push("Perfect transitional weather. Layers key for adapting.");
    fabrics.push("cotton", "linen", "light wool", "denim", "silk");
    colors.push("lighter colors okay now");
  } else if (effectiveTemp <= 20) {
    layers.push("T-shirt or polo. Light cardigan or jacket for shade/wind.");
    layers.push("Shorts or pants - your preference. Almost anything works.");
    layers.push("Ideal comfort zone. Dress for style, just have a backup layer.");
    fabrics.push("cotton", "linen", "bamboo", "light denim");
    colors.push("any - peak comfort temperature");
  } else if (effectiveTemp <= 24) {
    layers.push("T-shirt, tank top, or light blouse. Shorts, skirts, or light pants.");
    layers.push("No jacket needed unless windy or you run cold.");
    layers.push("Pleasant warmth. Still comfortable for most activities.");
    fabrics.push("cotton", "linen", "bamboo", "hemp");
    colors.push("light to medium colors");
  } else if (effectiveTemp <= 27) {
    layers.push("Light t-shirt or tank. Shorts, skirt, or light dress.");
    layers.push("Breathable fabrics essential. Minimal layers.");
    layers.push("Warm but manageable. Stay in shade during peak hours.");
    fabrics.push("linen", "cotton", "bamboo", "hemp");
    colors.push("light colors - start reflecting heat");
  } else if (effectiveTemp <= 30) {
    layers.push("Tank top, lightest t-shirts. Shorts, flowy skirt, or light dress.");
    layers.push("Absolute minimum comfortable clothing. Loose fit crucial.");
    layers.push("Hot. Limit outdoor time 11am-3pm if possible.");
    fabrics.push("linen", "light cotton", "bamboo", "moisture-wicking synthetics");
    colors.push("white, cream, light blue, light green - reflect heat");
  } else if (effectiveTemp <= 35) {
    layers.push("Minimal clothing: tank/crop top, shortest shorts, flowy dress.");
    layers.push("Loose, billowy cuts. Nothing fitted - traps heat.");
    layers.push("HEAT ADVISORY: Light colors only. Dark fabric can burn skin.");
    fabrics.push("linen mandatory", "lightest cotton", "no polyester unless athletic");
    colors.push("white only if in direct sun", "pastels at darkest");
  } else if (effectiveTemp <= 40) {
    layers.push("Absolute minimum clothing legal/socially acceptable.");
    layers.push("Linen, linen, linen. Or specialized cooling fabrics.");
    layers.push("DANGEROUS HEAT: Cover skin with light, loose fabric rather than exposing.");
    layers.push("Desert dweller tip: long loose sleeves in white better than bare skin.");
    fabrics.push("white linen only", "specialized UV cooling fabric");
    colors.push("pure white", "no exceptions - safety over style");
  } else {
    layers.push("LIFE-THREATENING HEAT. Do not go outside.");
    layers.push("If unavoidable: full coverage in white, specialized heat gear.");
    layers.push("Emergency cooling supplies needed. This is survival, not fashion.");
    fabrics.push("emergency heat blanket (reflective side out)");
    colors.push("white", "silver reflective if available");
  }

  // ========================================================================
  // PRECIPITATION / RAIN LOGIC
  // ========================================================================
  
  if (condition === 'thunderstorm') {
    accessories.push("FULL WATERPROOF EVERYTHING. This is not optional.");
    if (temp < 15) {
      accessories.push("Waterproof insulated jacket + rain pants + waterproof boots.");
    } else {
      accessories.push("Light raincoat or poncho. Quick-dry clothes underneath.");
    }
    accessories.push("NO umbrella in thunderstorm - lightning risk.");
    footwear.push("waterproof boots (rain or hiking)");
  } else if (precipitation > 25 || (isRaining && precipitation > 10)) {
    accessories.push("Heavy duty raincoat with hood. Rain pants recommended.");
    accessories.push("Waterproof backpack/bag for electronics and documents.");
    if (temp < 10) {
      accessories.push("Cold + heavy rain = dangerous. Full waterproof gear mandatory.");
      accessories.push("Insulated waterproof boots. Extra socks in waterproof bag.");
    } else if (temp < 20) {
      accessories.push("Waterproof jacket + water-resistant pants. Boots or waterproof shoes.");
      accessories.push("Umbrella useful if wind < 20 km/h.");
    } else {
      accessories.push("Light rain jacket or poncho. Quick-dry clothes.");
      accessories.push("Waterproof sandals or quick-dry sneakers. Umbrella if low wind.");
    }
    footwear.push("waterproof boots", "rain boots", "waterproof hiking shoes");
  } else if (isRaining || condition === 'drizzle') {
    if (temp > 25) {
      accessories.push("Warm rain: light waterproof shell or small umbrella.");
      accessories.push("Quick-dry fabrics. You'll dry fast once rain stops.");
      accessories.push("Waterproof sandals fine. Avoid leather shoes.");
    } else if (temp > 15) {
      accessories.push("Raincoat or water-resistant jacket + umbrella.");
      accessories.push("Water-resistant shoes. Avoid suede, canvas, leather.");
      accessories.push("Layer underneath - rain gear traps body heat.");
    } else {
      accessories.push("Waterproof coat essential. Cold rain chills fast.");
      accessories.push("Waterproof boots. Wool socks (warm even when damp).");
      accessories.push("Full rain gear: jacket + pants if outside long.");
    }
    if (wind > 20) {
      accessories.push("Windy rain = umbrella useless. Raincoat mandatory.");
    }
  } else if (condition === 'fog' || condition === 'mist') {
    if (humidity > 90) {
      accessories.push("Damp air. Water-resistant outer layer helpful.");
      accessories.push("Hair will get frizzy/curly - plan accordingly.");
      if (temp < 10) {
        accessories.push("Cold fog penetrates clothing. Windproof layer recommended.");
      }
    }
  } else if (isCloudy && humidity > 80) {
    accessories.push("High humidity, might drizzle. Compact umbrella just in case.");
    if (temp < 15) {
      accessories.push("Damp cold feels colder. Water-resistant layer adds warmth.");
    }
  }

  // ========================================================================
  // WIND LOGIC
  // ========================================================================
  
  if (wind > 50 || windGust > 70) {
    warnings.push("DANGEROUS WIND: Avoid outdoor activities. Flying debris risk.");
    accessories.push("If outside: form-fitting clothes, no loose items, eye protection.");
    accessories.push("Windproof outer layer. Face protection from blowing dust/debris.");
    layers.push("Wind chill significantly below air temperature - dress warmer.");
  } else if (wind > 35 || windGust > 50) {
    accessories.push("Very windy. Windproof jacket essential. Secure hat or skip it.");
    accessories.push("Avoid skirts, dresses, loose scarves. Hair will be wild.");
    warnings.push(`Wind chill: feels like ${windChill}°C. Dress for that temperature.`);
    if (temp < 15) {
      layers.push("Windproof outer layer mandatory. Wind cuts through fleece.");
      accessories.push("Neck gaiter or scarf to protect face.");
    }
  } else if (wind > 20) {
    accessories.push("Breezy. Light windbreaker or denim jacket helps.");
    accessories.push("Secure hat if wearing one. Hair tie recommended for long hair.");
    if (temp < 18) {
      layers.push("Breeze makes it feel cooler. Have a wind-resistant layer.");
    }
  } else if (wind > 10) {
    if (temp < 15) {
      layers.push("Light breeze adds chill. Thin windbreaker or cardigan.");
    }
  } else if (wind < 5 && temp > 28) {
    warnings.push("No wind + heat = stagnant, oppressive feeling. Hydrate well.");
    layers.push("No natural cooling. Seek shade and airflow.");
  }

  // ========================================================================
  // UV / SUN PROTECTION LOGIC
  // ========================================================================
  
  if (uvIndex >= 11) {
    warnings.push("EXTREME UV: Burn time under 10 minutes. Avoid sun 10am-4pm.");
    accessories.push("UPF 50+ clothing if outside. Wide-brim hat (10cm+ brim).");
    accessories.push("SPF 50+ sunscreen reapplied every 2 hours. UV sunglasses essential.");
    accessories.push("UV-protective arm sleeves if wearing short sleeves.");
    colors.push("dark or bright colors block more UV than white (surprisingly)");
  } else if (uvIndex >= 8) {
    warnings.push("VERY HIGH UV: Burn time 15-25 minutes.");
    accessories.push("Wide-brim hat or legionnaire cap. UV400 sunglasses.");
    accessories.push("SPF 50+ on all exposed skin. Reapply after sweating/swimming.");
    accessories.push("UPF-rated clothing ideal. Dense weave fabrics block more UV.");
    headwear.push("wide-brim hat", "bucket hat with neck coverage");
  } else if (uvIndex >= 6) {
    accessories.push("High UV. Hat recommended. Sunglasses important.");
    accessories.push("SPF 30+ minimum. Reapply every 2 hours if outside.");
    accessories.push("Seek shade 11am-3pm when possible.");
    headwear.push("baseball cap (minimal)", "wide-brim hat (better)");
  } else if (uvIndex >= 3) {
    accessories.push("Moderate UV. Sunglasses helpful. SPF 15+ if outside > 1 hour.");
    if (isClear) {
      accessories.push("Clear sky = more UV. Hat adds comfort.");
    }
  } else {
    if (isClear && season === 'winter') {
      accessories.push("Low UV but snow reflection doubles exposure. Ski goggles/sunglasses.");
    }
  }

  // ========================================================================
  // HUMIDITY LOGIC
  // ========================================================================
  
  if (humidity > 90) {
    if (temp > 25) {
      warnings.push("OPPRESSIVE HUMIDITY: Sweat won't evaporate. Feels MUCH hotter.");
      layers.push("Lightest, most breathable fabrics. Loose fit critical.");
      fabrics.push("linen", "bamboo", "light cotton", "no synthetics");
      accessories.push("Cooling towel. Change of shirt if outside long.");
      warnings.push(`Feels like ${heatIndex}°C with humidity. Heat exhaustion risk.`);
    } else if (temp > 15) {
      layers.push("Sticky and muggy. Breathable fabrics. Avoid anything tight.");
      fabrics.push("cotton", "linen", "bamboo");
    } else {
      layers.push("Damp cold penetrates clothing. Water-resistant outer layer.");
      warnings.push("High humidity + cold = feels colder. Raw, bone-chilling feeling.");
      fabrics.push("wool (warm even when damp)", "synthetic insulation");
    }
  } else if (humidity > 70) {
    if (temp > 28) {
      layers.push("Humid heat. Cotton better than synthetics. Loose weave helpful.");
      accessories.push("Consider bringing a spare shirt.");
    }
  } else if (humidity < 25) {
    if (temp > 20) {
      warnings.push("VERY DRY: Static electricity, dry skin, chapped lips.");
      accessories.push("Lip balm, moisturizer, hand cream. Anti-static spray for clothes.");
      fabrics.push("natural fibers over synthetics (less static)");
      layers.push("Cotton, wool, silk preferred. Polyester will crackle.");
    } else {
      warnings.push("Dry cold feels less cold than damp cold. Easier to dress for.");
    }
  }

  // ========================================================================
  // VISIBILITY LOGIC
  // ========================================================================
  
  if (visibility < 0.5) {
    warnings.push("DENSE FOG: Visibility under 500m. Reflective/light clothing if near roads.");
    accessories.push("Reflective vest or accessories if walking/cycling.");
    layers.push("Moisture in fog penetrates clothes. Water-resistant outer layer.");
  } else if (visibility < 2) {
    warnings.push("Reduced visibility. Brighter colors improve safety near traffic.");
    colors.push("bright, visible colors if walking/cycling");
  }

  // ========================================================================
  // AIR QUALITY LOGIC
  // ========================================================================
  
  if (aqi > 200) {
    warnings.push("HAZARDOUS AIR QUALITY: Avoid outdoor exposure if possible.");
    warnings.push("N95 mask recommended if outside. Eyes may irritate - glasses/goggles.");
  } else if (aqi > 150) {
    warnings.push("Unhealthy air. Sensitive groups should mask outdoors.");
    warnings.push("Avoid strenuous outdoor activity.");
  } else if (aqi > 100) {
    warnings.push("Moderate air pollution. Sensitive individuals may want a mask.");
  }

  // ========================================================================
  // FOOTWEAR SELECTION
  // ========================================================================
  
  if (askingForFootwear || true) { // Always include footwear advice
    if (snow > 2 || (temp < 0 && precipitation > 0)) {
      footwear.push("Insulated, waterproof snow boots with good tread.");
      footwear.push("Ice cleats/crampons if icy conditions expected.");
      footwear.push("Wool socks. Bring spare dry socks.");
    } else if (isRaining && precipitation > 10) {
      if (temp > 20) {
        footwear.push("Waterproof sandals or quick-dry sneakers.");
        footwear.push("Avoid leather - will water stain. Avoid canvas - will soak.");
      } else {
        footwear.push("Waterproof boots or rain boots. Warm, water-resistant socks.");
        footwear.push("No suede, leather without treatment, or canvas.");
      }
    } else if (temp > 32) {
      footwear.push("Sandals, flip-flops, or barefoot-style shoes.");
      footwear.push("Ultra-breathable sneakers if closed-toe needed.");
      footwear.push("No socks or ultra-thin no-show socks.");
    } else if (temp > 25) {
      footwear.push("Sandals, espadrilles, or breathable sneakers.");
      footwear.push("Canvas sneakers fine. Leather may be too hot.");
    } else if (temp > 15) {
      footwear.push("Sneakers, loafers, or light boots. Almost anything works.");
      footwear.push("Comfortable walking shoes if outside a lot.");
    } else if (temp > 5) {
      footwear.push("Closed shoes: sneakers, boots, or leather shoes.");
      footwear.push("Regular to light wool socks. Keep feet dry.");
    } else if (temp > -5) {
      footwear.push("Insulated boots or thick-soled shoes + wool socks.");
      footwear.push("Waterproof if snow/slush possible. Warm lining ideal.");
    } else if (temp > -15) {
      footwear.push("Winter boots (rated to -20°C or lower). Thick wool socks.");
      footwear.push("Consider sock liners for extra warmth. Toe warmers helpful.");
    } else {
      footwear.push("Expedition-grade winter boots. Vapor barrier socks.");
      footwear.push("Multiple sock layers: thin liner + thick wool.");
      footwear.push("Battery-heated insoles if available. Frostbite risk high.");
    }
    
    // Footwear + activity
    if (askingForActivity) {
      if (questionLower.includes('hiking')) {
        footwear.unshift("Hiking boots (waterproof if wet conditions). Broken in!");
        footwear.push("Wool or synthetic socks (NOT cotton - causes blisters).");
      } else if (questionLower.includes('running')) {
        footwear.unshift("Running shoes appropriate for your gait/pronation.");
        footwear.push("Moisture-wicking socks. Reflective elements if dark out.");
      } else if (questionLower.includes('beach')) {
        footwear.unshift("Sandals or water shoes (hot sand + sharp shells).");
      } else if (questionLower.includes('office') || questionLower.includes('work')) {
        footwear.unshift("Dress shoes or smart boots. Commute shoes to change into.");
        if (isRaining) footwear.push("Bring office shoes separately, wear waterproof shoes to commute.");
      }
    }
  }

  // ========================================================================
  // HEADWEAR SELECTION
  // ========================================================================
  
  if (effectiveTemp < -10) {
    headwear.push("Insulated beanie or trapper hat (covers ears).");
    headwear.push("Balaclava or face mask if windy. Goggles if blowing snow.");
    headwear.push("30-40% body heat lost through head - cover it!");
  } else if (effectiveTemp < 0) {
    headwear.push("Warm beanie or winter hat. Ears must be covered.");
    headwear.push("Headband if active (running, skiing) - less sweat accumulation.");
  } else if (effectiveTemp < 10) {
    headwear.push("Light beanie or headband for ears. Hat optional but recommended.");
  } else if (effectiveTemp > 28 && uvIndex > 3) {
    headwear.push("Sun hat with 360° brim. Protects ears, neck, face.");
    headwear.push("No baseball caps - leave ears/neck exposed.");
  } else if (uvIndex > 6) {
    headwear.push("Wide-brim hat or bucket hat. Neck protection important.");
  } else if (uvIndex > 3 && isClear) {
    headwear.push("Hat or cap recommended. Shades face and reduces squinting.");
  }

  // ========================================================================
  // ACCESSORIES
  // ========================================================================
  
  // Gloves
  if (effectiveTemp < -15) {
    accessories.push("Expedition mittens (warmer than gloves). Hand warmers.");
  } else if (effectiveTemp < -5) {
    accessories.push("Insulated gloves or mittens. Touchscreen compatible helpful.");
  } else if (effectiveTemp < 5) {
    accessories.push("Light gloves. Fingers get cold first.");
  }
  
  // Scarf/Neck
  if (effectiveTemp < -5) {
    accessories.push("Thick scarf or neck gaiter. Pull over face in wind.");
  } else if (effectiveTemp < 5) {
    accessories.push("Scarf or neck warmer. Protects vulnerable neck area.");
  } else if (effectiveTemp < 12 && wind > 15) {
    accessories.push("Light scarf adds surprising warmth.");
  }
  
  // Sunglasses
  if (uvIndex > 3) {
    accessories.push("UV400 sunglasses (not just dark - need UV protection).");
    if (condition === 'clear' && snow === 0) {
      accessories.push("Polarized lenses reduce glare (driving, water, snow).");
    }
  }
  if (snow > 0 || (temp < 0 && isClear)) {
    accessories.push("Snow blindness risk: dark, UV-blocking goggles or glasses.");
  }
  
  // Umbrella
  if (isRaining && wind < 20) {
    if (precipitation > 10) {
      accessories.push("Sturdy umbrella. Compact ones invert in wind.");
    } else {
      accessories.push("Umbrella or rain jacket - your preference today.");
    }
  } else if (condition === 'drizzle' && wind < 15) {
    accessories.push("Small umbrella sufficient for light rain.");
  } else if (isRaining && wind >= 20) {
    accessories.push("Skip umbrella - wind will destroy it. Raincoat only.");
  }

  // ========================================================================
  // COLOR RECOMMENDATIONS
  // ========================================================================
  
  if (temp > 30) {
    colors.push("White, cream, light beige - reflect up to 90% of heat.");
    colors.push("Avoid black, navy, dark gray - absorb 80-90% of solar radiation.");
    colors.push("Dark shirt in direct sun can be 10°C+ hotter than white.");
  } else if (temp > 25 && isClear) {
    colors.push("Light colors preferred. Pastels and whites keep you cooler.");
    colors.push("Medium colors acceptable if shade available.");
  } else if (temp < 5) {
    colors.push("Dark colors help absorb what little warmth is available.");
    colors.push("But difference is minimal compared to proper layering.");
  } else {
    colors.push("Personal preference - temperature neutral color conditions.");
  }
  
  // Visibility colors
  if (visibility < 2 || (timeOfDay === 'night' && (questionLower.includes('run') || questionLower.includes('walk') || questionLower.includes('cycl')))) {
    colors.push("Bright, reflective, or fluorescent colors for safety.");
    colors.push("Reflective strips, LED armbands if dark/low visibility.");
  }

  // ========================================================================
  // ACTIVITY-SPECIFIC ADVICE
  // ========================================================================
  
  if (askingForActivity) {
    if (questionLower.includes('run') || questionLower.includes('jog')) {
      activitySpecific.push("RUNNING: Dress for 10°C warmer than actual temp - you'll heat up.");
      if (temp < 5) {
        activitySpecific.push("Cold run: thermal tights, long sleeve base + windproof jacket.");
        activitySpecific.push("Gloves and headband essential. Reflective gear if dark.");
      } else if (temp < 15) {
        activitySpecific.push("Cool run: tights or shorts, long sleeve or t-shirt + light jacket.");
      } else if (temp > 25) {
        activitySpecific.push("Hot run: lightest technical fabrics, light colors, hydrate well.");
        activitySpecific.push("Consider early morning or evening run to avoid heat.");
      }
      activitySpecific.push("Moisture-wicking everything. No cotton (chafes when wet).");
    }
    
    if (questionLower.includes('hik')) {
      activitySpecific.push("HIKING: Layer system critical - conditions change with elevation.");
      activitySpecific.push("Base: moisture-wicking. Mid: insulating fleece/wool. Outer: waterproof/windproof.");
      activitySpecific.push("No cotton anywhere (deadly if wet and cold - 'cotton kills').");
      activitySpecific.push("Wool or synthetic socks. Liner socks prevent blisters.");
      if (precipitation > 0) {
        activitySpecific.push("Pack rain gear even if not currently raining. Mountain weather changes fast.");
      }
    }
    
    if (questionLower.includes('cycl')) {
      activitySpecific.push("CYCLING: Wind chill significant at speed. Windproof front, breathable back.");
      activitySpecific.push("Padded shorts/bibs. Gloves for grip and vibration damping.");
      activitySpecific.push("Bright/reflective clothing. Lights essential if low visibility.");
      if (temp < 10) {
        activitySpecific.push("Cold cycling: thermal bib tights, shoe covers, lobster gloves.");
        activitySpecific.push("Face protection - wind at 30km/h makes 5°C feel like -5°C.");
      }
    }
    
    if (questionLower.includes('beach')) {
      activitySpecific.push("BEACH: UV protection critical. UPF rash guard or cover-up.");
      activitySpecific.push("Multiple swimsuits - putting on wet swimsuit = chills and chafing.");
      activitySpecific.push("Water shoes for rocky/reef areas. Sand gets HOT - sandals needed.");
      if (uvIndex > 6) {
        activitySpecific.push("Beach umbrella or tent. Reapply sunscreen after swimming every time.");
      }
    }
    
    if (questionLower.includes('office') || questionLower.includes('work')) {
      activitySpecific.push("OFFICE: Buildings often over-air-conditioned. Keep jacket/cardigan at desk.");
      activitySpecific.push("Dress for commute (outdoor) + office (indoor AC). Layers key.");
      if (isRaining) {
        activitySpecific.push("Wear waterproof gear for commute, change into office shoes at desk.");
      }
    }
    
    if (questionLower.includes('date') || questionLower.includes('night out')) {
      activitySpecific.push("DATE NIGHT: Style + comfort. Evening temperatures will drop.");
      activitySpecific.push("Bring a jacket that complements outfit for later hours.");
      if (temp < 15 && timeOfDay === 'evening') {
        activitySpecific.push("Cold evening: stylish coat/jacket essential. Heels impractical if wet/icy.");
      }
    }
    
    if (questionLower.includes('travel')) {
      activitySpecific.push("TRAVEL: Layers for variable conditions (planes, airports, destination).");
      activitySpecific.push("Compression socks for flights. Slip-on shoes for security.");
      activitySpecific.push("Pack outfit changes in carry-on (lost luggage contingency).");
    }
    
    if (questionLower.includes('gym') || questionLower.includes('workout')) {
      activitySpecific.push("GYM: Moisture-wicking fabrics. Compression optional for recovery.");
      activitySpecific.push("Indoor gym: A/C may be cold. Light warm-up layer to start.");
      activitySpecific.push("Outdoor workout: apply all outdoor advice + dress for 10° warmer feel.");
    }
  }

  // ========================================================================
  // TIME-BASED ADJUSTMENTS
  // ========================================================================
  
  timeAdjustments = getTimeBasedAdjustments(data);

  // ========================================================================
  // PERSON-SPECIFIC ADVICE
  // ========================================================================
  
  if (askingForBabies) {
    healthNotes = getBabyToddlerAdvice(data);
  }
  
  if (askingForElderly) {
    healthNotes = getElderlyAdvice(data);
  }
  
  if (askingForPregnancy) {
    healthNotes = getPregnancyAdvice(data);
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🎽 Outfit check:",
    "👔 Here's what I'd wear:",
    "🧥 Weather fit for today:",
    "👗 Dress code:",
    "🧣 Zephye's fit rec:",
    "👚 Your weather wardrobe:",
    "🫶 Today's clothing guide:"
  ];

    let response = `${random(intros)}\n\n`;
  
  if (data._timeLabel) {
    response += `📅 **Time:** ${data._timeLabel}\n\n`;
  }
  
  // Core layers section
  
  // Core layers section
  if (layers.length > 0) {
    response += `📦 LAYERS (feels like ${effectiveTemp}°C):\n`;
    layers.forEach(layer => {
      response += `• ${layer}\n`;
    });
    response += '\n';
  }
  
  // Footwear section
  if (footwear.length > 0) {
    response += `👟 FOOTWEAR:\n`;
    footwear.forEach(shoe => {
      response += `• ${shoe}\n`;
    });
    response += '\n';
  }
  
  // Headwear section
  if (headwear.length > 0) {
    response += `🧢 HEADWEAR:\n`;
    headwear.forEach(hat => {
      response += `• ${hat}\n`;
    });
    response += '\n';
  }
  
  // Accessories section
  if (accessories.length > 0) {
    response += `🎒 ACCESSORIES:\n`;
    accessories.forEach(acc => {
      response += `• ${acc}\n`;
    });
    response += '\n';
  }
  
  // Fabrics section
  if (fabrics.length > 0) {
    response += `🧵 RECOMMENDED FABRICS:\n`;
    response += `• ${fabrics.join(', ')}\n\n`;
  }
  
  // Colors section
  if (colors.length > 0) {
    response += `🎨 COLOR GUIDANCE:\n`;
    colors.forEach(color => {
      response += `• ${color}\n`;
    });
    response += '\n';
  }
  
  // Activity specific
  if (activitySpecific.length > 0) {
    response += `🎯 ACTIVITY SPECIFIC:\n`;
    activitySpecific.forEach(advice => {
      response += `• ${advice}\n`;
    });
    response += '\n';
  }
  
  // Time adjustments
  if (timeAdjustments.length > 0) {
    response += `⏰ TIME-BASED NOTES:\n`;
    timeAdjustments.forEach(adjustment => {
      response += `• ${adjustment}\n`;
    });
    response += '\n';
  }
  
  // Health/person-specific
  if (healthNotes.length > 0) {
    response += `❤️ SPECIAL CONSIDERATIONS:\n`;
    healthNotes.forEach(note => {
      response += `• ${note}\n`;
    });
    response += '\n';
  }
  
  // Warnings section (always at end for emphasis)
  if (warnings.length > 0) {
    response += `⚠️ IMPORTANT WARNINGS:\n`;
    warnings.forEach(warning => {
      response += `• ${warning}\n`;
    });
    response += '\n';
  }
  
  // Comfort index
  response += `📊 Comfort Index: ${comfortIndex}/100`;
  if (comfortIndex > 80) response += ' (Excellent!)';
  else if (comfortIndex > 60) response += ' (Good)';
  else if (comfortIndex > 40) response += ' (Challenging)';
  else if (comfortIndex > 20) response += ' (Difficult)';
  else response += ' (Hazardous)';
  
  // Final tip
  const finalTips = [
    "When in doubt, layers win. You can always remove one.",
    "Check yourself before you wreck yourself... with weather-inappropriate clothing.",
    "Better to have it and not need it than need it and not have it.",
    "Weather changes. Be the person who's prepared, not the person who's shivering.",
    "There's no bad weather, only unsuitable clothing. (Scandinavian proverb)"
  ];
  response += `\n\n💡 ${random(finalTips)}`;

  return response;
};

// ============================================================================
// SPECIALIZED ADVICE FUNCTIONS
// ============================================================================

export const getClothingLayers = (data) => {
  if (!data) return "Loading...";
  
  const { temp, wind } = data;
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = Math.min(temp, windChill);
  const layering = calculateLayeringIndex(temp, wind, data.humidity);
  
  let response = `📦 IDEAL LAYERING: ${layering.layers} layers (${layering.description})\n\n`;
  
  if (effectiveTemp < -15) {
    response += "Layer 1 (Base): Merino wool or synthetic thermal underwear (top & bottom)\n";
    response += "Layer 2 (Mid): Heavy fleece or thick wool sweater\n";
    response += "Layer 3 (Insulation): Down or synthetic insulated jacket\n";
    response += "Layer 4 (Shell): Waterproof, windproof hardshell jacket & pants\n";
    response += "Layer 5 (Extreme): Insulated over-parka for static periods\n";
  } else if (effectiveTemp < -5) {
    response += "Layer 1 (Base): Thermal long sleeve & leggings (merino best)\n";
    response += "Layer 2 (Mid): Fleece pullover or wool sweater\n";
    response += "Layer 3 (Outer): Insulated winter coat or parka\n";
    response += "Optional: Shell layer if windy/wet\n";
  } else if (effectiveTemp < 5) {
    response += "Layer 1 (Base): Long sleeve shirt (thermal if you run cold)\n";
    response += "Layer 2 (Mid): Sweater, fleece, or hoodie\n";
    response += "Layer 3 (Outer): Winter jacket or heavy coat\n";
  } else if (effectiveTemp < 12) {
    response += "Layer 1: T-shirt or light long sleeve\n";
    response += "Layer 2: Sweater, cardigan, or light jacket\n";
    response += "Optional Layer 3: Light windbreaker or rain shell\n";
  } else if (effectiveTemp < 20) {
    response += "Layer 1: T-shirt or tank\n";
    response += "Optional Layer 2: Light cardigan, denim jacket, or overshirt\n";
    response += "Perfect one-layer weather for many activities\n";
  } else {
    response += "Single layer sufficient. Lightest fabrics only.\n";
    response += "Any second layer would cause overheating.\n";
  }
  
  response += "\n🧥 LAYERING TIPS:\n";
  response += "• Base layer: wicks moisture (never cotton in cold)\n";
  response += "• Mid layer: insulates (fleece, wool, down)\n";
  response += "• Outer layer: protects from wind/rain (shell)\n";
  response += "• Avoid cotton in cold weather - stays wet, causes hypothermia\n";
  response += "• Adjust layers during activity: remove before sweating, add before cooling\n";
  
  return response;
};

export const getFootwearAdvice = (data) => {
  if (!data) return "Loading...";
  
  const { temp, condition, precipitation, wind, snow, uvIndex } = data;
  
  let response = "👟 FOOTWEAR RECOMMENDATION:\n\n";
  
  if (snow > 5 || temp < -10) {
    response += "PRIMARY: Insulated, waterproof snow boots\n";
    response += "• Rated to at least -20°C\n";
    response += "• Deep tread for snow/ice grip\n";
    response += "• Removable liner helps drying\n";
    response += "• Ice cleats recommended for icy conditions\n\n";
    response += "SOCKS: Heavy wool or thermal socks\n";
    response += "• Consider liner socks to prevent blisters\n";
    response += "• Bring spare dry socks if out all day\n";
  } else if (isRaining || precipitation > 5) {
    response += "PRIMARY: Waterproof boots or rain boots\n";
    response += "• Sealed seams essential\n";
    response += "• Non-slip sole for wet surfaces\n";
    response += "• Height depends on puddle depth\n\n";
    if (temp < 10) {
      response += "COLD RAIN: Insulated waterproof boots needed\n";
      response += "• Cold + wet feet = miserable and dangerous\n";
    } else {
      response += "WARM RAIN: Quick-dry sneakers or waterproof sandals acceptable\n";
    }
  } else if (temp > 30) {
    response += "PRIMARY: Sandals, flip-flops, or barefoot shoes\n";
    response += "• Maximum breathability\n";
    response += "• Avoid black soles in sun (burn feet!)\n";
    response += "• Water shoes if heading to beach/lake\n\n";
    response += "Socks optional - no-show or ultra-thin if needed\n";
  } else if (temp > 20) {
    response += "PRIMARY: Sneakers, loafers, or casual shoes\n";
    response += "• Comfort priority\n";
    response += "• Breathable materials preferred\n";
    response += "• Sandals acceptable for casual settings\n";
  } else if (temp > 5) {
    response += "PRIMARY: Closed shoes or light boots\n";
    response += "• Sneakers, chukka boots, chelsea boots\n";
    response += "• Regular socks sufficient\n";
  } else {
    response += "PRIMARY: Insulated boots or thick-soled shoes\n";
    response += "• Warm lining (fleece, shearling, or thinsulate)\n";
    response += "• Waterproof if any precipitation expected\n";
    response += "• Wool socks essential\n";
  }
  
  response += "\n⚠️ FOOTWEAR WARNINGS:\n";
  response += "• New shoes? Break them in before long walks\n";
  response += "• Wet feet in cold = frostbite risk\n";
  response += "• Cotton socks in rain = guaranteed blisters\n";
  response += "• Flip flops: zero support, zero protection (beach only!)\n";
  
  return response;
};

export const getAccessoriesAdvice = (data) => {
  if (!data) return "Loading...";
  
  const { temp, wind, uvIndex, condition, precipitation, humidity } = data;
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = Math.min(temp, windChill);
  
  let response = "🎒 ESSENTIAL ACCESSORIES:\n\n";
  
  // Sunglasses
  response += "🕶️ EYEWEAR:\n";
  if (uvIndex > 6) {
    response += "• UV400 sunglasses ESSENTIAL\n";
    response += "• Polarized reduces glare (driving, water)\n";
    response += "• Wrap-around style blocks peripheral UV\n";
  } else if (uvIndex > 3) {
    response += "• Sunglasses recommended\n";
    response += "• UV protection matters more than darkness\n";
  } else {
    response += "• Not needed for UV protection today\n";
  }
  
  // Hat
  response += "\n🧢 HEADWEAR:\n";
  if (effectiveTemp < -10) {
    response += "• Insulated beanie or trapper hat (cover ears!)\n";
    response += "• Balaclava if windy\n";
  } else if (effectiveTemp < 0) {
    response += "• Warm beanie or winter hat\n";
    response += "• Headband if doing active sports\n";
  } else if (effectiveTemp > 28 && uvIndex > 3) {
    response += "• Wide-brim sun hat (not baseball cap)\n";
    response += "• Neck coverage important\n";
  } else {
    response += "• Optional today\n";
  }
  
  // Gloves
  response += "\n🧤 HANDS:\n";
  if (effectiveTemp < -15) {
    response += "• Expedition mittens (warmer than gloves)\n";
    response += "• Hand warmers recommended\n";
  } else if (effectiveTemp < -5) {
    response += "• Insulated gloves\n";
    response += "• Touchscreen compatible useful\n";
  } else if (effectiveTemp < 5) {
    response += "• Light gloves or mittens\n";
    response += "• Pockets work in a pinch\n";
  } else {
    response += "• Not needed\n";
  }
  
  // Scarf
  response += "\n🧣 NECK:\n";
  if (effectiveTemp < -5) {
    response += "• Thick scarf or neck gaiter\n";
    response += "• Cover face in wind\n";
  } else if (effectiveTemp < 5) {
    response += "• Scarf adds noticeable warmth\n";
  } else if (effectiveTemp < 12 && wind > 10) {
    response += "• Light scarf or bandana\n";
  } else {
    response += "• Not needed\n";
  }
  
  // Umbrella
  response += "\n☂️ RAIN PROTECTION:\n";
  if (condition === 'thunderstorm') {
    response += "• NO umbrella (lightning risk!)\n";
    response += "• Raincoat with hood only\n";
  } else if (isRaining && wind < 20) {
    response += "• Umbrella useful today\n";
    response += "• Compact for light rain, golf for heavy\n";
  } else if (condition === 'drizzle' && wind < 15) {
    response += "• Small umbrella sufficient\n";
  } else if (precipitation > 0 && wind >= 20) {
    response += "• Skip umbrella (wind will break it)\n";
    response += "• Raincoat with hood instead\n";
  } else {
    response += "• Not needed today\n";
  }
  
  // Extras
  response += "\n💡 DON'T FORGET:\n";
  if (temp > 25) response += "• Water bottle (stay hydrated!)\n";
  if (uvIndex > 3) response += "• Sunscreen (SPF based on UV level)\n";
  if (humidity < 30) response += "• Lip balm and moisturizer (dry air)\n";
  if (temp > 30 || temp < 5) response += "• Emergency layer in car/bag\n";
  if (wind > 20) response += "• Hair tie if long hair\n";
  response += "• Phone (check weather updates!)\n";
  
  return response;
};

// Export all functions for modular use
export default getClothingAdvice;
