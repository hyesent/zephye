// ============================================================================
// ENHANCED INTENT MATCHING ENGINE
// ============================================================================

import { getClothingAdvice } from './data/ClothingAdvice.js'
import { getLifestyleAdvice } from './data/Lifestyle.js'
import { getSkinHairAdvice } from './data/SkinHair.js'
import { getDrivingAdvice } from './data/Driving.js'
import { getTravelingAdvice } from './data/Traveling.js'
import { getFarmingAdvice } from './data/Farming.js'
import { getStargazingAdvice } from './data/Stargazing.js'
import { getPhotographyAdvice } from './data/Photography.js'
import { getEventsAdvice } from './data/Events.js'
import { getSportsAdvice } from './data/Sports.js'
import { getHealthAdvice } from './data/Health.js'
import { getDIYConstructionAdvice } from './data/DIYconstruction.js'
import { getPetsAdvice } from './data/Pets.js'
import { getEnergyHomeAdvice } from './data/EnergyHome.js'
import { getWeatherAdvice } from './data/BasicWeatherAdvice.js'
import { getTrafficAdvice } from './data/TrafficAdvice.js'
import { getRouteAdvice } from './data/RouteAdvice.js'
import { getFlightDelayAdvice } from './data/FlightDelayAdvice.js'

// ─── CONFIG ─────────────────────────────────────────────────────────────

const CONFIG = {
  MAX_INTENTS: 5,
  MIN_SCORE_THRESHOLD: 30,
  SECONDARY_THRESHOLD: 0.75,
  SOFT_SECONDARY_THRESHOLD: 0.5,
  EXCLUDE_PENALTY: 30,
  CONTEXT_BOOST: 15,
  PRIORITY_BONUS: 2,
}

const CONJUNCTION_WORDS = /\b(and|also|plus|with|both|check|as well as|along|while|meanwhile|too)\b/i

const GENERIC_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'from', 'for', 'in', 'on', 'at',
  'is', 'it', 'be', 'was', 'will', 'can', 'how', 'what', 'when', 'where',
  'my', 'our', 'your', 'this', 'that', 'these', 'those',
  'home', 'work', 'school', 'office', 'place', 'today', 'tomorrow',
  'now', 'later', 'here', 'there', 'weather', 'rain', 'sun', 'cold', 'hot',
  'good', 'bad', 'best', 'time', 'day', 'night', 'morning', 'evening',
])

// ─── INTENT MAP ─────────────────────────────────────────────────────────

export const INTENT_MAP = [
  {
    id: 'route',
    name: 'Route',
    priority: 1,
    section: 'Route',
    fn: getRouteAdvice,
    keys: [
      'how do i get to', 'how to get to', 'directions to',
      'route to', 'route from', 'drive to', 'navigate to',
      'directions from', 'from to', 'going from to',
      'best route', 'fastest route', 'shortest route',
      'scenic route', 'alternate route',
      'show me the route', 'show me directions',
      'give me directions', 'get me to',
      'how long to get to', 'how far to',
      'distance between', 'how far is',
      'travel distance', 'driving distance',
      'how long does it take', 'how long will it take',
      'travel time', 'driving time', 'commute time',
      'turn by turn', 'road trip', 'route planner',
      'driving route', 'walking route', 'biking route',
      'cycling route',
      'from home to work', 'from home to school',
      'from work to home', 'from school to home',
      'my route',
    ],
    contextBoost: ['route', 'directions', 'get to', 'how far', 'distance', 'drive to', 'navigate'],
    exclude: [],
  },
  {
    id: 'best_time',
    name: 'BestTime',
    priority: 1,
    section: 'Best Time',
    fn: getRouteAdvice,
    keys: [
      'when should i leave', 'when should i go',
      'best time to leave', 'best time to go',
      'what time should i leave', 'what time should i go',
      'when to leave', 'when to go',
      'when should i head out', 'when should i head',
      'best time to head', 'what time to leave',
      'what time to go', 'when is best to leave',
      'when is best to go', 'when is the best time',
      'what time is best', 'good time to leave',
      'good time to go', 'optimal time',
      'when should i depart', 'when to depart',
      'what time should i depart',
    ],
    contextBoost: ['leave', 'go', 'depart', 'head out', 'best time', 'what time'],
    exclude: [],
  },
  {
    id: 'traffic',
    name: 'Traffic',
    priority: 1,
    section: 'Traffic',
    fn: getTrafficAdvice,
    keys: [
      'traffic', 'traffic conditions', 'traffic report',
      'is there traffic', 'any traffic', 'traffic jam',
      'traffic congestion', 'traffic delay', 'traffic update',
      'traffic today', 'traffic now', 'current traffic',
      'traffic on my route', 'traffic on the way',
      'check for traffic', 'check traffic',
      'accident', 'car accident', 'crash', 'collision',
      'road accident', 'accident on', 'crash on',
      'roadworks', 'road construction', 'construction zone',
      'road work', 'lane closure', 'road closure',
      'highway closure', 'expect delays',
      'heavy traffic', 'slow traffic', 'bumper to bumper',
      'gridlock', 'traffic stopped',
      'rush hour', 'peak hour', 'morning traffic',
      'evening traffic', 'commute traffic',
      'traffic incidents', 'traffic incident',
      'any incidents', 'incidents on',
    ],
    contextBoost: ['traffic', 'accident', 'jam', 'congestion', 'delay', 'incident'],
    exclude: [],
  },
  {
    id: 'weather',
    name: 'Weather',
    priority: 1,
    section: 'Weather',
    fn: getWeatherAdvice,
    keys: [
      'will it rain', 'is it going to rain', 'will it storm',
      'is there going to be rain', 'will it snow', 'is it going to snow',
      'what is the temperature', 'temperature today', 'how hot is it',
      'how cold is it', 'is it hot', 'is it cold', 'is it warm',
      'what is the weather', 'weather forecast', 'forecast today',
      'whats the weather', 'check weather', 'weather update',
      'will it be sunny', 'is it sunny', 'sunny today',
      'will it be cloudy', 'cloudy today', 'overcast',
      'is it windy', 'wind speed', 'windy today',
      'humidity level', 'humidity today', 'is it humid',
      'rain chance', 'precipitation', 'chance of rain',
      'today weather', 'tomorrow weather', 'this week weather',
      'weekend weather', 'morning weather', 'afternoon weather',
      'evening weather', 'tonight weather',
      'weather report', 'weather conditions', 'current weather',
      'temperature forecast',
      'weather today', 'weather tomorrow', 'weather this weekend',
      'what is the temperature going to be', 'how hot will it be',
      'will it be nice weather', 'is it nice outside',
      'weather for today', 'weather for tomorrow',
      'forecast for today', 'forecast for tomorrow',
      'is the weather good', 'good weather', 'bad weather',
      'this morning', 'this afternoon', 'this evening',
      'at noon', 'at midnight', 'at sunrise', 'at sunset',
      'in the morning', 'in the afternoon', 'in the evening',
      'during the day', 'at night', 'overnight',
    ],
    contextBoost: ['weather', 'forecast', 'temperature', 'rain', 'snow', 'sunny', 'cloudy', 'windy', 'humid', 'storm'],
    exclude: ['crop', 'plant', 'farm', 'sport', 'dog', 'pet', 'skin', 'hair', 'wedding', 'party'],
  },
  {
    id: 'flight_delay',
    name: 'FlightDelay',
    priority: 2,
    section: 'Flight',
    fn: getFlightDelayAdvice,
    keys: [
      'flight delay', 'flight delayed', 'delay my flight',
      'will my flight be delayed', 'is my flight delayed',
      'flight cancellation', 'will my flight be cancelled',
      'flight cancelled', 'flight status',
      'flight weather', 'flying weather', 'flight conditions',
      'flight risk', 'flight disruption',
      'delay risk', 'delayed flight',
      'plane delay', 'plane weather',
      'airport weather', 'airport delay',
      'my flight', 'my flight tomorrow',
      'flight from', 'flight to',
      'will my flight',
      'can i fly', 'safe to fly', 'good to fly',
    ],
    contextBoost: ['flight', 'plane', 'airport', 'fly', 'flying', 'delay', 'cancellation'],
    exclude: [],
  },
  {
    id: 'sports',
    name: 'Sports',
    priority: 2,
    section: 'Sports',
    fn: getSportsAdvice,
    keys: [
      'is it safe to play', 'should i cancel practice',
      'is it good for sports', 'outdoor sports weather',
      'sports today', 'sports tomorrow', 'practice today',
      'game today', 'match today', 'tournament today',
      'is it good to run', 'can i run today', 'should i run',
      'running today', 'run tomorrow', 'go for a run',
      'jog today', 'go jogging', 'is it safe to run',
      'running in heat', 'running in cold', 'running in rain',
      'marathon training', 'run training',
      'is it good to cycle', 'can i cycle today', 'should i cycle',
      'cycling today', 'cycle tomorrow',
      'cycling in wind', 'cycling in rain', 'bike ride',
      'football game', 'soccer game', 'football practice',
      'soccer practice', 'play football', 'play soccer',
      'tennis game', 'tennis practice', 'play tennis',
      'golf game', 'golf practice', 'play golf',
      'swim today', 'go swimming', 'swim outdoors',
      'go hiking', 'hiking today', 'hike tomorrow',
      'basketball game', 'basketball practice',
      'workout today', 'exercise today', 'gym today',
      'outdoor workout', 'outdoor exercise',
      'is it good to workout', 'can i workout outside',
      'marathon', 'triathlon', 'athlete safety',
    ],
    contextBoost: ['sport', 'training', 'workout', 'exercise', 'game', 'practice'],
    exclude: ['dog', 'pet', 'crop', 'plant', 'farm', 'hair', 'skin'],
  },
  {
    id: 'clothing',
    name: 'Clothing',
    priority: 2,
    section: 'Clothing',
    fn: getClothingAdvice,
    keys: [
      'what should i wear', 'what to wear', 'what do i wear',
      'what should I wear today', 'what should I wear tomorrow',
      'what outfit', 'what clothes', 'dress for weather',
      'weather appropriate clothing',
      'what should I pack', 'packing for weather',
      'what to pack', 'what to bring',
      'is it sweater weather', 'is it hoodie weather',
      'is it jacket weather', 'is it coat weather',
      'is it too hot for jeans', 'is it too cold for shorts',
      'can i wear shorts', 'can i wear sandals',
      'do i need a jacket', 'do i need an umbrella',
      'do i need gloves', 'do i need a hat',
      'wear layers', 'layering clothes', 'layer up',
      'dress warm', 'dress cool', 'dress light',
      'dress in layers',
      'what to wear to work', 'office attire', 'business casual',
      'dinner outfit', 'date night outfit', 'party outfit',
      'wedding attire', 'wedding guest outfit',
      'gym clothes',
    ],
    contextBoost: ['wear', 'clothes', 'outfit', 'dress', 'jacket', 'shirt', 'pants', 'shoes', 'layers'],
    exclude: ['sport', 'run', 'gym', 'workout', 'crop', 'plant', 'farm', 'dog', 'pet'],
  },
  {
    id: 'pets',
    name: 'Pets',
    priority: 2,
    section: 'Pets',
    fn: getPetsAdvice,
    keys: [
      'pet safety', 'is it safe for pets', 'pets weather',
      'animal safety', 'pet weather', 'pet care',
      'is it safe to walk my pet', 'take pet outside',
      'dog walking', 'walk my dog', 'dog walk',
      'take dog out', 'dog outside', 'dog park',
      'dog exercise', 'dog play', 'puppy safety',
      'senior dog', 'old dog', 'dog heat stroke',
      'dog cold', 'dog frostbite', 'dog paws',
      'dog pavement', 'pavement burn', 'dog booties',
      'dog coat', 'dog sweater', 'dog raincoat',
      'dog swimming', 'dog water safety',
      'dog anxiety', 'dog thunderstorm', 'dog fear',
      'dog car safety', 'dog in car', 'hot car dog',
      'cat outside', 'take cat out', 'outdoor cat',
      'cat safety', 'cat weather',
      'kitten safety', 'senior cat', 'old cat',
      'rabbit outside', 'rabbit heat', 'rabbit cold',
      'horse riding', 'ride horse', 'horse weather',
      'chicken weather', 'chicken coop',
      'walk my dog and',
    ],
    contextBoost: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'walk my dog'],
    exclude: ['sport', 'run', 'jog', 'workout', 'crop', 'plant', 'farm'],
  },
  {
    id: 'farming',
    name: 'Farming',
    priority: 2,
    section: 'Farming',
    fn: getFarmingAdvice,
    keys: [
      'crop disease', 'plant disease', 'disease on crops',
      'fungal disease', 'powdery mildew', 'downy mildew',
      'crop blight', 'plant blight', 'stem rot', 'root rot',
      'crop rot', 'plant rot',
      'will humidity cause', 'will humidity affect',
      'crop health', 'plant health',
      'when to plant', 'best time to plant', 'is it good to plant',
      'can i plant', 'should i plant',
      'plant seeds', 'plant seedlings', 'transplant seedlings',
      'germination', 'will seeds germinate',
      'soil temperature', 'soil condition',
      'when to harvest', 'best time to harvest',
      'can i harvest', 'should i harvest',
      'harvest crops', 'harvest vegetables',
      'when to water', 'should i water', 'do i need to water',
      'water crops', 'water plants',
      'when to fertilize', 'should i fertilize',
      'apply fertilizer', 'compost', 'manure',
      'corn crop', 'wheat crop', 'rice crop',
      'tomato plant', 'potato plant', 'pepper plant',
      'fruit tree', 'apple tree', 'vegetable garden',
      'cow', 'cattle', 'dairy cow',
      'chicken', 'hen', 'poultry',
      'goat', 'sheep', 'pig',
      'livestock health', 'animal health',
      'tractor', 'plow', 'cultivate',
      'harvest season', 'planting season',
      'farm work', 'field work',
      'agriculture', 'farming today',
      'soil health', 'soil quality', 'soil moisture',
    ],
    contextBoost: ['crop', 'plant', 'farm', 'soil', 'harvest', 'garden', 'seed', 'livestock'],
    exclude: ['weather', 'sport', 'run', 'dog', 'cat'],
  },
  {
    id: 'health',
    name: 'Health',
    priority: 2,
    section: 'Health',
    fn: getHealthAdvice,
    keys: [
      'is it safe to go outside', 'should i stay inside',
      'health weather', 'health risk',
      'is it safe for', 'should i avoid going out',
      'asthma', 'asthma attack', 'asthma trigger',
      'difficulty breathing', 'shortness of breath',
      'copd', 'lung condition', 'respiratory',
      'cold air breathing', 'breathing in cold',
      'air quality breathing', 'pollution breathing',
      'allergy', 'allergies', 'pollen allergy',
      'heart condition', 'heart disease',
      'blood pressure', 'high blood pressure', 'hypertension',
      'heat stroke', 'heat exhaustion',
      'diabetes', 'blood sugar',
      'arthritis', 'joint pain',
      'migraine', 'headache', 'sinus headache',
      'elderly health', 'senior health',
      'pregnancy health', 'pregnant women',
      'baby health', 'infant health', 'child health',
      'immunocompromised',
      'heat illness', 'overheating',
      'hypothermia', 'frostbite',
      'air quality', 'pollution', 'smog', 'smoke',
      'wildfire smoke', 'particulate matter',
      'aqi', 'poor air quality',
    ],
    contextBoost: ['health', 'allergy', 'asthma', 'breathing', 'heart', 'air quality'],
    exclude: ['sport', 'run', 'workout'],
  },
  {
    id: 'driving',
    name: 'Driving',
    priority: 2,
    section: 'Driving',
    fn: getDrivingAdvice,
    keys: [
      'is it safe to drive', 'should i drive',
      'driving today', 'driving tomorrow',
      'driving conditions', 'road conditions',
      'is the road safe', 'are roads safe',
      'safe driving', 'drive safely',
      'icy roads', 'black ice', 'ice on road',
      'snow on road', 'snow covered roads',
      'wet roads', 'slippery roads', 'slick roads',
      'foggy driving', 'driving in fog',
      'driving in rain', 'driving in snow',
      'hydroplaning', 'flooded roads',
      'winter tires', 'snow chains',
      'windshield visibility',
      'driving tips', 'road safety',
      'slow down', 'reduce speed',
      'motorcycle driving', 'motorbike riding',
      'highway driving', 'mountain driving',
      'night driving',
    ],
    contextBoost: ['drive', 'driving', 'road', 'car', 'vehicle'],
    exclude: ['traffic', 'accident'],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    priority: 3,
    section: 'Lifestyle',
    fn: getLifestyleAdvice,
    keys: [
      'go for a walk', 'take a walk', 'brisk walk', 'nature walk',
      'go jogging', 'go running', 'go hiking',
      'go to the park', 'park visit',
      'have a picnic', 'picnic weather',
      'barbecue', 'cookout',
      'bonfire', 'campfire', 'fire pit',
      'gardening', 'garden work',
      'mow lawn', 'lawn work',
      'do laundry', 'hang clothes', 'line dry',
      'car wash', 'wash car',
      'clean windows', 'wash windows',
      'exterior painting',
      'meditation', 'meditate', 'mindfulness',
      'outdoor yoga', 'yoga in park',
      'stress relief',
      'outdoor dining', 'eat outside', 'patio dining',
      'coffee outside', 'morning coffee',
      'outdoor party', 'backyard party',
      'read outside', 'read in park',
      'bird watching', 'birding',
      'nature photography',
      'outdoor painting',
      'outdoor music',
      'have a picnic', 'picnic weather',
      'picnic', 'a picnic',
    ],
    contextBoost: ['walk', 'park', 'picnic', 'bbq', 'garden', 'yoga', 'relax'],
    exclude: ['dog', 'pet', 'sports', 'marathon', 'crop', 'plant', 'farm'],
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    priority: 3,
    section: 'Stargazing',
    fn: getStargazingAdvice,
    keys: [
      'stargazing', 'star gazing', 'see stars',
      'can i see stars', 'will i see stars',
      'night sky', 'sky tonight', 'clear sky tonight',
      'is it good for stargazing', 'stargazing tonight',
      'star party', 'astronomy night',
      'milky way', 'milkyway', 'galaxy',
      'andromeda', 'orion nebula', 'pleiades',
      'constellation', 'constellations',
      'jupiter', 'saturn',
      'shooting star', 'meteor', 'meteor shower',
      'perseids', 'geminids', 'leonids',
      'comet', 'asteroid', 'eclipse',
      'aurora', 'northern lights', 'southern lights',
      'iss', 'international space station',
      'telescope', 'binoculars', 'star tracker',
      'astrophotography', 'astro photo',
      'moon phase', 'full moon', 'new moon',
      'light pollution', 'dark sky', 'bortle scale',
      'best time to stargaze', 'stargaze tonight',
    ],
    contextBoost: ['star', 'moon', 'planet', 'astronomy', 'telescope', 'galaxy'],
    exclude: ['photo', 'camera', 'photography'],
  },
  {
    id: 'photography',
    name: 'Photography',
    priority: 3,
    section: 'Photography',
    fn: getPhotographyAdvice,
    keys: [
      'photography', 'photo shoot', 'photoshoot',
      'take photos', 'taking pictures', 'shoot photos',
      'photography weather', 'lighting for photos',
      'is it good for photos',
      'golden hour', 'blue hour',
      'natural light', 'soft light',
      'harsh light', 'harsh sun',
      'sunset light', 'sunrise light',
      'light quality', 'lighting conditions',
      'portrait photography', 'portraits', 'headshot',
      'landscape photography', 'landscapes',
      'street photography',
      'wildlife photography',
      'bird photography',
      'macro photography',
      'astrophotography', 'astro photos',
      'wedding photography', 'wedding photos',
      'real estate photography',
      'product photography',
      'food photography',
      'drone photography', 'aerial photos',
      'camera settings',
      'shutter speed', 'aperture',
      'rain photography', 'fog photography',
      'snow photography', 'cloud photography',
      'puddle reflections',
    ],
    contextBoost: ['photo', 'camera', 'shoot', 'lens', 'photography', 'golden hour'],
    exclude: ['stargazing', 'astronomy', 'telescope'],
  },
  {
    id: 'events',
    name: 'Events',
    priority: 3,
    section: 'Events',
    fn: getEventsAdvice,
    keys: [
      'outdoor event', 'event weather',
      'is it good for an event', 'event planning',
      'host an event', 'hosting event',
      'outdoor gathering', 'social gathering',
      'outdoor wedding', 'wedding reception',
      'bridal shoot', 'engagement shoot',
      'wedding weather', 'wedding day forecast',
      'will it rain on my wedding',
      'birthday party', 'birthday celebration',
      'anniversary party',
      'graduation party',
      'house party', 'backyard party', 'garden party',
      'pool party', 'beach party',
      'kids party', 'family party',
      'party planning', 'party weather',
      'music festival', 'outdoor festival',
      'food festival', 'wine festival',
      'festival weather',
      'outdoor concert', 'music concert',
      'live music', 'outdoor music',
      'corporate event', 'company event', 'team building',
      'networking event', 'business event',
      'office party',
      'block party', 'street fair', 'community event',
      'charity event', 'fundraiser',
      'school event', 'sports day', 'field day',
      'halloween party', 'christmas market',
      'holiday party', 'new years eve', 'fireworks',
      'event tent', 'outdoor seating',
      'sound system', 'event lighting',
      'catering', 'food service',
      'rain plan', 'bad weather plan',
      'indoor backup', 'alternative venue',
    ],
    contextBoost: ['event', 'wedding', 'party', 'festival', 'concert', 'celebration'],
    exclude: ['sport', 'game', 'match', 'training', 'practice'],
  },
  {
    id: 'diy',
    name: 'DIY',
    priority: 3,
    section: 'DIY',
    fn: getDIYConstructionAdvice,
    keys: [
      'diy', 'do it yourself', 'home improvement',
      'home project', 'handyman',
      'paint outside', 'exterior paint', 'house painting',
      'painting weather', 'paint drying', 'paint curing',
      'spray paint', 'brush paint', 'roller paint',
      'paint job', 'paint project', 'stain deck',
      'deck staining', 'fence painting',
      'pour concrete', 'concrete work', 'concrete weather',
      'concrete curing', 'concrete setting', 'cement work',
      'concrete pour', 'concrete slab', 'concrete footing',
      'woodworking', 'carpentry', 'wood project',
      'woodworking weather', 'wood glue', 'wood stain',
      'building deck', 'deck building', 'fence building',
      'furniture making', 'cabinet building',
      'masonry', 'bricklaying', 'laying bricks',
      'mortar work', 'stone work',
      'retaining wall',
      'patio pavers', 'driveway pavers',
      'roofing', 'roof repair', 'roof work',
      'shingle roof', 'metal roof',
      'roof weather', 'roofing conditions',
      'gutter cleaning', 'siding repair',
      'stucco work', 'caulking',
      'weatherproofing', 'waterproofing',
      'power washing', 'pressure washing',
      'window installation', 'door installation',
      'landscaping', 'yard work', 'grading',
      'excavation', 'digging', 'trenching',
      'sod laying', 'planting trees',
      'sprinkler installation', 'drainage',
      'ladder safety', 'scaffolding',
      'construction safety', 'diy safety',
    ],
    contextBoost: ['diy', 'paint', 'concrete', 'build', 'renovate', 'repair', 'construction', 'roof', 'deck'],
    exclude: ['weather', 'forecast', 'rain', 'snow'],
  },
  {
    id: 'energy',
    name: 'EnergyHome',
    priority: 3,
    section: 'Energy',
    fn: getEnergyHomeAdvice,
    keys: [
      'energy bill', 'electricity bill', 'utility bill',
      'energy cost', 'save energy', 'energy savings',
      'home energy', 'energy efficiency',
      'hvac', 'heating cooling', 'climate control',
      'thermostat', 'smart thermostat',
      'energy consumption', 'power usage',
      'peak hours', 'off peak',
      'solar panels', 'solar power', 'solar energy',
      'solar production', 'solar generation',
      'solar weather',
      'net metering',
      'solar battery', 'powerwall',
      'run ac', 'air conditioning', 'ac weather',
      'heating', 'furnace', 'heat pump',
      'hvac efficiency',
      'ac maintenance', 'heating cost', 'cooling cost',
      'heat vs ac', 'fans vs ac', 'ceiling fan',
      'dehumidifier', 'humidifier', 'ventilation',
      'insulation', 'attic insulation', 'wall insulation',
      'weather stripping', 'draft proofing',
      'home sealing', 'air leakage', 'energy audit',
      'dryer efficiency', 'dishwasher energy',
      'refrigerator energy',
      'laundry efficiency',
      'pool pump', 'pool heating', 'pool energy',
      'electric car', 'ev charging',
      'water heater', 'tankless water heater',
      'pipe freeze', 'frozen pipes', 'pipe insulation',
      'water heating',
      'smart home', 'home automation',
      'smart plug', 'smart lighting',
      'energy monitoring',
    ],
    contextBoost: ['energy', 'solar', 'electricity', 'bill', 'hvac', 'thermostat', 'insulation'],
    exclude: ['weather', 'forecast'],
  },
  {
    id: 'traveling',
    name: 'Traveling',
    priority: 3,
    section: 'Travel',
    fn: getTravelingAdvice,
    keys: [
      'travel weather', 'trip weather', 'vacation weather',
      'travel planning', 'trip planning',
      'connecting flight', 'layover', 'red eye',
      'charter flight', 'business flight',
      'international flight', 'domestic flight',
      'flight packing', 'carry on', 'luggage',
      'road trip weather', 'drive trip',
      'cross country', 'road travel',
      'rv trip', 'camper van', 'motorhome',
      'motorcycle trip', 'bike trip', 'cycling tour',
      'highway conditions',
      'train travel', 'rail trip',
      'train conditions', 'train delay', 'train weather',
      'scenic train',
      'cruise', 'cruise ship', 'ocean travel',
      'cruise weather', 'sea conditions', 'rough seas',
      'port closure', 'docking',
      'ferry', 'boat trip', 'water taxi',
      'ferry weather', 'ferry cancellation', 'rough sea',
      'island ferry', 'coastal ferry',
      'bus trip', 'coach bus',
      'bus weather', 'bus delay',
      'tour bus', 'shuttle bus',
      'pack for trip',
      'packing list', 'packing advice', 'luggage packing',
      'clothing packing', 'travel gear',
      'destination packing', 'seasonal packing',
      'beach vacation', 'ski trip', 'city trip',
      'mountain vacation', 'desert trip', 'tropical vacation',
      'europe trip', 'asia trip', 'africa trip',
      'honeymoon destination',
      'adventure trip', 'luxury trip', 'backpacking',
      'itinerary',
      'timezone change', 'jet lag',
      'visa requirements', 'passport', 'travel insurance',
      'travel documents',
      'travel safety', 'safe to travel',
      'travel advisory',
      'traveling from',
    ],
    contextBoost: ['travel', 'trip', 'flight', 'vacation', 'airport'],
    exclude: [],
  },
  {
    id: 'skin_hair',
    name: 'SkinHair',
    priority: 3,
    section: 'Beauty',
    fn: getSkinHairAdvice,
    keys: [
      'skincare', 'haircare', 'beauty routine',
      'beauty weather', 'skin weather', 'hair weather',
      'skin health', 'hair health',
      'dry skin', 'oily skin',
      'sensitive skin',
      'acne', 'breakout', 'pimples',
      'eczema', 'psoriasis', 'rosacea',
      'hyperpigmentation', 'dark spots',
      'wrinkles', 'fine lines',
      'skin barrier', 'moisturizer',
      'sunscreen', 'sun protection',
      'uv damage', 'sunburn',
      'skin protection',
      'face oil', 'serum', 'vitamin c', 'retinol',
      'hyaluronic acid', 'niacinamide',
      'exfoliate', 'chemical peel',
      'face mask', 'sheet mask', 'clay mask',
      'skin glow', 'healthy skin',
      'frizzy hair', 'frizz control', 'anti frizz',
      'curly hair', 'wavy hair', 'straight hair',
      'natural hair',
      'dry hair', 'damaged hair',
      'hair fall', 'hair loss', 'alopecia',
      'dandruff', 'scalp health',
      'hair dye', 'bleached hair',
      'hair static', 'dry shampoo', 'hair oil',
      'hair mask', 'deep condition',
      'hair styling',
      'humidity hair', 'frizz humidity', 'hair moisture',
      'good hair day', 'bad hair day',
      'makeup melt', 'makeup weather',
      'setting spray',
      'waterproof makeup',
      'chapped lips',
    ],
    contextBoost: ['skin', 'hair', 'face', 'scalp', 'makeup', 'frizz', 'beauty'],
    exclude: ['weather', 'sport', 'run', 'gym', 'workout'],
  },
]

// ─── SCORING ENGINE ─────────────────────────────────────────────────────

const scoreQuestion = (question, intent) => {
  const q = question.toLowerCase().trim()
  let score = 0
  const matched = []
  const excluded = []

  if (intent.exclude) {
    for (const ex of intent.exclude) {
      if (q.includes(ex.toLowerCase())) {
        excluded.push(ex)
        score -= CONFIG.EXCLUDE_PENALTY
      }
    }
  }

  for (const key of intent.keys) {
    const k = key.toLowerCase()
    if (q === k) { score += 100; matched.push(`[exact] ${key}`); continue }
    if (q.includes(k)) {
      const wordCount = k.split(/\s+/).length
      if (wordCount >= 5) { score += 80; matched.push(`[long] ${key}`) }
      else if (wordCount >= 4) { score += 65; matched.push(`[phrase] ${key}`) }
      else if (wordCount >= 3) { score += 45; matched.push(`[3-word] ${key}`) }
      else if (wordCount === 2) {
        const parts = k.split(/\s+/)
        const hasSpecific = parts.some(p => !GENERIC_WORDS.has(p))
        if (hasSpecific) { score += 25; matched.push(`[2-word] ${key}`) }
      } else {
        if (GENERIC_WORDS.has(k)) continue
        if (k.length < 4) continue
        score += 8
        matched.push(`[single] ${key}`)
      }
    }
  }

  if (intent.contextBoost) {
    for (const boost of intent.contextBoost) {
      const b = boost.toLowerCase()
      if (GENERIC_WORDS.has(b)) continue
      if (q.includes(b)) { score += CONFIG.CONTEXT_BOOST; matched.push(`[context] ${boost}`) }
    }
  }

  score += (10 - intent.priority) * CONFIG.PRIORITY_BONUS

  return { score, matched, excluded }
}

// ─── INTENT DETECTION ───────────────────────────────────────────────────

export const detectIntents = (question) => {
  const results = []

  for (const intent of INTENT_MAP) {
    const { score, matched, excluded } = scoreQuestion(question, intent)
    if (score >= CONFIG.MIN_SCORE_THRESHOLD) {
      results.push({ intent, score, matched, excluded, isPrimary: false })
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.intent.priority - b.intent.priority
  })

  if (results.length === 0) return []
  results[0].isPrimary = true

  const primaryScore = results[0].score

  const hasConjunction = CONJUNCTION_WORDS.test(question)
  const thresholdRatio = hasConjunction
    ? CONFIG.SOFT_SECONDARY_THRESHOLD
    : CONFIG.SECONDARY_THRESHOLD

  const threshold = primaryScore * thresholdRatio
  const filtered = results.filter(r => r.score >= threshold)

  return filtered.slice(0, CONFIG.MAX_INTENTS)
}

export const getIntentFunction = (intentId) => {
  const intent = INTENT_MAP.find(i => i.id === intentId)
  return intent?.fn || null
}

export const getIntentById = (intentId) => {
  return INTENT_MAP.find(i => i.id === intentId) || null
}

export const debugIntentMatch = (question) => {
  const results = detectIntents(question)
  console.log('=== INTENT DEBUG ===')
  console.log('Question:', question)
  console.log('Results:')
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.intent.name} (${r.score} pts) ${r.isPrimary ? '← PRIMARY' : ''}`)
    console.log(`     Matched: ${r.matched.slice(0, 5).join(', ')}`)
    if (r.excluded.length) console.log(`     Excluded: ${r.excluded.join(', ')}`)
  })
  return results
}

export default { INTENT_MAP, detectIntents, getIntentFunction, getIntentById, debugIntentMatch }
