// ============================================================================
// ENHANCED INTENT MATCHING ENGINE
// ============================================================================

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── IMPORTS ──────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONFIG ──────────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const CONFIG = {
  MAX_INTENTS: 3,
  MIN_SCORE_THRESHOLD: 20,
  SECONDARY_THRESHOLD: 0.4, // 40% of primary score
  EXCLUDE_PENALTY: 30,
  CONTEXT_BOOST: 15,
  PRIORITY_BONUS: 2
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── INTENT MAP ──────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const INTENT_MAP = [
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
      'temperature forecast', 'degree', 'degrees', 'celsius', 'fahrenheit',
      'weather today', 'weather tomorrow', 'weather this weekend',
      'what is the temperature going to be', 'how hot will it be',
      'will it be nice weather', 'is it nice outside',
      'weather for today', 'weather for tomorrow',
      'forecast for today', 'forecast for tomorrow',
      'is the weather good', 'good weather', 'bad weather',
      'weather at', 'temperature at', 'weather in',
      'this morning', 'this afternoon', 'this evening',
      'at noon', 'at midnight', 'at sunrise', 'at sunset',
      'in the morning', 'in the afternoon', 'in the evening',
      'during the day', 'at night', 'overnight',
      'early morning', 'late morning', 'mid morning',
      'early afternoon', 'late afternoon', 'mid afternoon',
      'early evening', 'late evening'
    ],
    contextBoost: ['weather', 'forecast', 'temperature', 'rain', 'snow', 'sunny', 'cloudy', 'windy', 'humid', 'storm'],
    exclude: ['crop', 'plant', 'farm', 'sport', 'run', 'walk', 'dog', 'pet', 'skin', 'hair', 'travel', 'flight', 'photo', 'camera', 'wedding', 'party', 'event']
  },
  {
    id: 'farming',
    name: 'Farming',
    priority: 1,
    section: 'Farming',
    fn: getFarmingAdvice,
    keys: [
      // Crop Diseases
      'crop disease', 'plant disease', 'disease on crops',
      'fungal disease', 'fungus on plants', 'powdery mildew',
      'downy mildew', 'leaf spot', 'crop blight', 'plant blight',
      'rust on plants', 'crop rust', 'stem rot', 'root rot',
      'crop rot', 'plant rot', 'blight disease',
      'humidity disease', 'humidity causes disease',
      'will humidity cause', 'will humidity affect',
      'is humidity bad for crops', 'humidity and disease',
      'crop health', 'plant health', 'disease risk',
      'crop disease risk', 'plant disease risk',
      'fungal infection crops', 'fungal infection plants',
      'mildew on plants', 'mildew on crops',
      'crop protection', 'plant protection',
      'disease prevention crops', 'disease prevention plants',
      'how to prevent crop disease', 'how to prevent plant disease',
      // Planting
      'when to plant', 'best time to plant', 'is it good to plant',
      'can i plant', 'should i plant', 'planting today',
      'planting tomorrow', 'planting this week',
      'plant seeds', 'plant seedlings', 'transplant seedlings',
      'germination', 'will seeds germinate', 'seed germination',
      'soil temperature', 'soil condition', 'is the soil ready',
      'cover crops', 'plant cover crops', 'planting cover crops',
      'planting season', 'growing season', 'when to grow',
      // Harvesting
      'when to harvest', 'best time to harvest', 'is it good to harvest',
      'can i harvest', 'should i harvest', 'harvesting today',
      'harvest tomorrow', 'harvest this week',
      'harvest crops', 'harvest vegetables', 'harvest fruits',
      'harvest corn', 'harvest wheat', 'harvest rice',
      'harvest potatoes', 'harvest tomatoes',
      'harvesting season', 'ready to harvest',
      // Irrigation
      'when to water', 'best time to water', 'should i water',
      'do i need to water', 'is watering needed',
      'irrigation today', 'irrigation tomorrow',
      'water crops', 'water plants', 'watering crops',
      'watering plants', 'irrigation schedule',
      'how often to water', 'how much to water',
      'soil moisture', 'is soil dry', 'is soil wet',
      'drip irrigation', 'sprinkler irrigation',
      // Fertilizer
      'when to fertilize', 'best time to fertilize', 'should i fertilize',
      'do i need to fertilize', 'apply fertilizer',
      'fertilizer today', 'fertilizer tomorrow',
      'nitrogen fertilizer', 'phosphorus fertilizer',
      'potassium fertilizer', 'organic fertilizer',
      'compost', 'manure', 'soil amendment',
      // Crops
      'corn crop', 'wheat crop', 'rice crop', 'soybean crop',
      'tomato plant', 'potato plant', 'pepper plant',
      'lettuce plant', 'spinach plant', 'cabbage plant',
      'carrot plant', 'onion plant', 'garlic plant',
      'fruit tree', 'apple tree', 'orange tree', 'mango tree',
      'vegetable garden', 'fruit garden', 'herb garden',
      'garden crops', 'garden plants', 'backyard garden',
      'greenhouse crops', 'greenhouse plants',
      // Livestock
      'cow', 'cattle', 'dairy cow', 'beef cattle',
      'chicken', 'hen', 'rooster', 'poultry', 'egg production',
      'goat', 'sheep', 'pig', 'horse', 'barn',
      'livestock health', 'animal health',
      'livestock weather', 'animal weather',
      // Farming Activities
      'tractor', 'plow', 'till', 'cultivate',
      'mowing', 'weeding', 'pruning',
      'harvest season', 'planting season',
      'farm work', 'field work', 'outdoor farm',
      'agriculture', 'farming today', 'farm tomorrow',
      'is it a good day to farm', 'farming weather',
      'farmers market', 'crop yield', 'farm production',
      // Soil
      'soil health', 'soil quality', 'soil condition',
      'soil moisture', 'soil temperature', 'soil pH',
      'soil preparation', 'soil testing', 'soil drainage',
      'soil erosion', 'soil conservation'
    ],
    contextBoost: ['crop', 'plant', 'farm', 'pesticide', 'soil', 'harvest', 'garden', 'seed', 'livestock', 'cattle', 'poultry'],
    exclude: ['weather', 'temperature', 'rain', 'snow', 'hot', 'cold', 'sport', 'run', 'walk', 'dog', 'cat', 'pest']
  },
  {
    id: 'sports',
    name: 'Sports',
    priority: 1,
    section: 'Sports',
    fn: getSportsAdvice,
    keys: [
      'is it safe to play', 'should i cancel practice',
      'is it good for sports', 'outdoor sports weather',
      'sports today', 'sports tomorrow', 'practice today',
      'game today', 'match today', 'tournament today',
      'athlete weather', 'sports conditions',
      'is it good to run', 'can i run today', 'should i run',
      'running today', 'run tomorrow', 'go for a run',
      'jog today', 'go jogging', 'is it safe to run',
      'running in heat', 'running in cold', 'running in rain',
      'run in this weather', 'jog in this weather',
      'outdoor running', 'trail running', 'road running',
      'marathon training', 'run training',
      'is it good to cycle', 'can i cycle today', 'should i cycle',
      'cycling today', 'cycle tomorrow', 'go for a ride',
      'bike today', 'biking today', 'bicycle today',
      'cycling in wind', 'cycling in rain', 'bike ride',
      'mountain bike', 'road bike', 'cycling weather',
      'indoor cycling', 'outdoor cycling', 'spin class',
      'tour de', 'bike race', 'cycling race',
      'football game', 'soccer game', 'football practice',
      'soccer practice', 'play football', 'play soccer',
      'football weather', 'soccer weather', 'football field',
      'soccer field', 'football match', 'soccer match',
      'is it good for football', 'is it good for soccer',
      'tennis game', 'tennis practice', 'play tennis',
      'tennis weather', 'tennis court', 'tennis match',
      'is it good for tennis', 'outdoor tennis',
      'golf game', 'golf practice', 'play golf',
      'golf weather', 'golf course', 'golf round',
      'is it good for golf', 'outdoor golf',
      'swim today', 'go swimming', 'swim outdoors',
      'pool weather', 'open water swim', 'swimming practice',
      'is it good to swim', 'can i swim today',
      'go hiking', 'hiking today', 'hike tomorrow',
      'trail hiking', 'mountain hiking', 'hiking weather',
      'is it good for hiking', 'can i hike today',
      'basketball game', 'basketball practice', 'play basketball',
      'basketball court', 'outdoor basketball', 'basketball weather',
      'baseball game', 'baseball practice', 'play baseball',
      'baseball field', 'outdoor baseball', 'baseball weather',
      'workout today', 'exercise today', 'gym today',
      'outdoor workout', 'outdoor exercise',
      'boot camp', 'crossfit', 'fit camp',
      'workout weather', 'exercise weather',
      'is it good to workout', 'can i workout outside',
      'rugby game', 'cricket match', 'volleyball game',
      'pickleball', 'badminton', 'table tennis',
      'skateboarding', 'rollerblading', 'surfing',
      'skiing', 'snowboarding', 'ice skating',
      'rock climbing', 'bouldering', 'parkour',
      'field too wet', 'court too hot', 'track too icy',
      'sports safety', 'athlete safety', 'player safety',
      'heat stroke sports', 'cold sports', 'rain sports',
      'wind sports', 'sports cancellation'
    ],
    contextBoost: ['sport', 'run', 'cycling', 'football', 'soccer', 'tennis', 'golf', 'swim', 'hike', 'basketball', 'game', 'practice', 'training', 'workout', 'exercise'],
    exclude: ['dog', 'pet', 'walk my dog', 'crop', 'plant', 'farm', 'skin', 'hair', 'photo', 'camera']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    priority: 1,
    section: 'Clothing',
    fn: getClothingAdvice,
    keys: [
      'what should i wear', 'what to wear', 'what do i wear',
      'what should I wear today', 'what should I wear tomorrow',
      'what outfit', 'what clothes', 'dress for weather',
      'weather appropriate clothing', 'dress code',
      'what should I pack', 'packing for weather',
      'what to pack', 'what to bring',
      'jacket', 'coat', 'parka', 'windbreaker', 'raincoat',
      'sweater', 'hoodie', 'cardigan', 'pullover',
      'shirt', 't-shirt', 'long sleeve', 'short sleeve',
      'pants', 'trousers', 'jeans', 'shorts', 'skirt',
      'dress', 'formal dress', 'casual dress',
      'shoes', 'sneakers', 'boots', 'sandals', 'flip flops',
      'hat', 'cap', 'beanie', 'sun hat', 'warm hat',
      'gloves', 'mittens', 'scarf', 'sunglasses',
      'umbrella', 'rain umbrella', 'sun umbrella',
      'swimsuit', 'bathing suit', 'trunks', 'bikini',
      'underwear', 'socks', 'stockings', 'tights',
      'belt', 'ties', 'accessories',
      'is it sweater weather', 'is it hoodie weather',
      'is it jacket weather', 'is it coat weather',
      'is it too hot for jeans', 'is it too cold for shorts',
      'can i wear shorts', 'can i wear sandals',
      'do i need a jacket', 'do i need an umbrella',
      'do i need gloves', 'do i need a hat',
      'wear layers', 'layering clothes', 'layer up',
      'dress warm', 'dress cool', 'dress light',
      'dress in layers', 'layering advice',
      'what to wear to work', 'office attire', 'business casual',
      'formal wear', 'casual wear', 'smart casual',
      'dinner outfit', 'date night outfit', 'party outfit',
      'wedding attire', 'wedding guest outfit',
      'outdoor event outfit', 'concert outfit',
      'sports outfit', 'athletic wear', 'gym clothes',
      'beach outfit', 'vacation outfit', 'travel outfit',
      'interview outfit', 'interview attire',
      'cotton', 'linen', 'wool', 'silk', 'polyester',
      'breathable fabric', 'moisture wicking',
      'warm fabric', 'cool fabric', 'light fabric',
      'heavy fabric', 'waterproof fabric', 'windproof'
    ],
    contextBoost: ['wear', 'clothes', 'outfit', 'dress', 'jacket', 'shirt', 'pants', 'shoes', 'hat', 'gloves', 'scarf', 'layers'],
    exclude: ['sport', 'run', 'gym', 'workout', 'exercise', 'crop', 'plant', 'farm', 'dog', 'pet']
  },
  {
    id: 'route',
    name: 'Route',
    priority: 1,
    section: 'Route',
    fn: getRouteAdvice,
    keys: [
      'how do i get to', 'how to get to', 'directions to',
      'route to', 'way to', 'path to', 'drive to',
      'navigate to', 'navigation to',
      'directions from', 'route from',
      'from to', 'going from to',
      'best route', 'fastest route', 'shortest route',
      'scenic route', 'alternate route',
      'show me the route', 'show me directions',
      'give me directions', 'get me to',
      'how long to get to', 'how far to',
      'distance between', 'how far is', 'how many kilometers',
      'how many miles', 'what is the distance',
      'travel distance', 'driving distance',
      'distance from to',
      'how long does it take', 'how long will it take',
      'travel time', 'driving time', 'commute time',
      'eta', 'estimated time', 'time to get there',
      'how many hours', 'how many minutes',
      'arrival time', 'estimated arrival',
      'map', 'maps', 'gps', 'navigation app',
      'google maps', 'waze', 'turn by turn',
      'road trip', 'trip planner', 'route planner',
      'which way', 'where is', 'location of',
      'driving route', 'walking route', 'biking route',
      'cycling route', 'bus route', 'train route',
      'transit route', 'public transport route',
      'subway route', 'metro route',
      'from home', 'from work', 'from school',
      'from my saved location', 'to home', 'to work',
      'to school', 'to my saved location',
      'saved location route', 'saved locations'
    ],
    contextBoost: ['route', 'directions', 'get to', 'how far', 'distance', 'drive to', 'travel to', 'navigate', 'map'],
    exclude: ['weather', 'forecast', 'temperature', 'rain', 'snow']
  },
  {
    id: 'traffic',
    name: 'Traffic',
    priority: 2,
    section: 'Traffic',
    fn: getTrafficAdvice,
    keys: [
      'traffic', 'traffic conditions', 'traffic report',
      'is there traffic', 'any traffic', 'traffic jam',
      'traffic congestion', 'traffic delay', 'traffic update',
      'traffic today', 'traffic now', 'current traffic',
      'traffic on my route', 'traffic on the way',
      'accident', 'car accident', 'crash', 'collision',
      'fender bender', 'vehicle accident', 'road accident',
      'accident on', 'crash on', 'collision on',
      'construction', 'roadworks', 'road construction',
      'construction zone', 'road work', 'lane closure',
      'road closure', 'street closure', 'highway closure',
      'construction on', 'roadworks on',
      'traffic delay', 'traffic delays', 'delay',
      'delays', 'expect delays', 'heavy traffic',
      'slow traffic', 'stop and go', 'bumper to bumper',
      'gridlock', 'standstill', 'traffic stopped',
      'how long is the delay', 'delay time',
      'highway', 'freeway', 'expressway', 'interstate',
      'bridge', 'tunnel', 'ramp', 'exit',
      'main road', 'side road', 'back road',
      'rush hour', 'peak hour', 'morning traffic',
      'evening traffic', 'commute traffic', 'work traffic',
      'school traffic', 'holiday traffic', 'weekend traffic',
      'road hazard', 'hazard on road', 'debris on road',
      'pothole', 'flooded road', 'icy road',
      'slippery road', 'road condition'
    ],
    contextBoost: ['traffic', 'accident', 'jam', 'congestion', 'delay', 'construction', 'road closure'],
    exclude: ['weather', 'forecast', 'temperature', 'rain', 'snow', 'route', 'directions']
  },
  {
    id: 'driving',
    name: 'Driving',
    priority: 2,
    section: 'Driving',
    fn: getDrivingAdvice,
    keys: [
      'is it safe to drive', 'should i drive',
      'driving today', 'driving tomorrow', 'drive today',
      'driving conditions', 'road conditions',
      'is the road safe', 'are roads safe',
      'safe driving', 'drive safely',
      'icy roads', 'black ice', 'ice on road',
      'snow on road', 'snow covered roads',
      'wet roads', 'slippery roads', 'slick roads',
      'foggy driving', 'driving in fog', 'fog on road',
      'driving in rain', 'driving in snow',
      'driving in wind', 'crosswinds driving',
      'hydroplaning', 'hydroplane risk',
      'flooded roads', 'standing water',
      'tire pressure', 'winter tires', 'snow chains',
      'car battery', 'engine overheating',
      'brake failure', 'steering issues',
      'windshield visibility', 'wipers',
      'driving tips', 'road safety', 'drive caution',
      'speed limit', 'slow down', 'reduce speed',
      'following distance', 'stopping distance',
      'safe speed', 'safe driving tips',
      'motorcycle driving', 'motorbike riding',
      'truck driving', 'suv driving', 'car driving',
      'rv driving', 'camper van driving',
      'bicycle riding', 'cycling on road',
      'highway driving', 'mountain driving',
      'coastal driving', 'rural driving', 'city driving',
      'night driving', 'morning driving', 'evening driving'
    ],
    contextBoost: ['drive', 'driving', 'road', 'safe drive', 'car', 'vehicle', 'highway'],
    exclude: ['traffic', 'accident', 'jam', 'congestion', 'route', 'directions']
  },
  {
    id: 'health',
    name: 'Health',
    priority: 2,
    section: 'Health',
    fn: getHealthAdvice,
    keys: [
      'is it safe to go outside', 'should i stay inside',
      'health weather', 'weather health', 'health risk',
      'safe for health', 'health conditions',
      'is it safe for', 'can i go outside with',
      'should i avoid going out',
      'asthma', 'asthma attack', 'asthma trigger',
      'breathing', 'difficulty breathing', 'shortness of breath',
      'copd', 'lung condition', 'respiratory',
      'cough', 'wheezing', 'chest tightness',
      'cold air breathing', 'breathing in cold',
      'air quality breathing', 'pollution breathing',
      'allergy', 'allergies', 'pollen allergy',
      'heart condition', 'heart disease', 'heart attack',
      'blood pressure', 'high blood pressure', 'hypertension',
      'chest pain', 'heart palpitations', 'cardiac',
      'heart failure', 'cardiovascular',
      'stroke risk', 'heat stroke', 'heat exhaustion',
      'diabetes', 'blood sugar', 'insulin',
      'arthritis', 'joint pain', 'joint stiffness',
      'fibromyalgia', 'chronic pain', 'chronic fatigue',
      'migraine', 'headache', 'sinus headache',
      'sinus pressure', 'sinus congestion',
      'multiple sclerosis', 'ms symptoms',
      'parkinson', 'alzheimer', 'dementia',
      'eczema', 'skin rash', 'dry skin',
      'psoriasis', 'skin irritation', 'skin flare',
      'sunburn', 'sun poisoning', 'uv damage',
      'skin cancer', 'melanoma', 'sunscreen',
      'rosacea', 'acne', 'skin breakout',
      'elderly health', 'senior health', 'old age health',
      'pregnancy health', 'pregnant women', 'expecting mother',
      'baby health', 'infant health', 'child health',
      'immunocompromised', 'weak immune system',
      'cancer patient', 'chemotherapy', 'radiation',
      'heat stroke', 'heat exhaustion', 'heat cramps',
      'heat illness', 'overheating', 'hot weather illness',
      'hypothermia', 'frostbite', 'cold illness',
      'freezing risk', 'cold exposure',
      'air quality', 'pollution', 'smog', 'smoke',
      'wildfire smoke', 'dust', 'particulate matter',
      'aqi', 'poor air quality', 'unhealthy air',
      'air pollution', 'clean air', 'fresh air',
      'medication', 'medicine', 'prescription',
      'inhaler', 'nebulizer', 'oxygen',
      'insulin', 'blood pressure medication',
      'allergy medication', 'asthma medication'
    ],
    contextBoost: ['health', 'allergy', 'asthma', 'breathing', 'heart', 'blood pressure', 'pain', 'migraine', 'air quality', 'pollution'],
    exclude: ['sport', 'run', 'workout', 'exercise', 'photo', 'camera', 'travel', 'flight']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    priority: 2,
    section: 'Lifestyle',
    fn: getLifestyleAdvice,
    keys: [
      'walk', 'walking', 'go for a walk', 'take a walk',
      'stroll', 'brisk walk', 'nature walk',
      'jog', 'jogging', 'go jogging',
      'run', 'running', 'go running',
      'hike', 'hiking', 'go hiking',
      'bike', 'biking', 'cycle', 'cycling',
      'park', 'go to the park', 'park visit',
      'picnic', 'have a picnic', 'picnic weather',
      'bbq', 'barbecue', 'grill', 'cookout',
      'bonfire', 'campfire', 'fire pit',
      'garden', 'gardening', 'garden work',
      'lawn', 'mow lawn', 'lawn work',
      'outdoor activity', 'leisure activity',
      'laundry', 'do laundry', 'hang clothes',
      'dry clothes', 'line dry', 'washing',
      'car wash', 'wash car', 'clean car',
      'windows', 'clean windows', 'wash windows',
      'paint house', 'exterior painting',
      'home maintenance', 'house work',
      'meditation', 'meditate', 'mindfulness',
      'yoga', 'outdoor yoga', 'yoga in park',
      'relax', 'relaxation', 'stress relief',
      'mental health', 'mood', 'anxiety',
      'depression', 'wellness', 'wellbeing',
      'breathe', 'breathing', 'fresh air',
      'peaceful', 'calm', 'nature therapy',
      'outdoor dining', 'eat outside', 'patio dining',
      'coffee outside', 'morning coffee',
      'friends over', 'gathering', 'get together',
      'party', 'outdoor party', 'backyard party',
      'entertaining', 'hosting', 'guests',
      'read outside', 'read in park', 'outdoor reading',
      'book', 'reading weather', 'reading light',
      'bird watching', 'birding', 'bird photography',
      'photography', 'nature photography',
      'painting', 'plein air', 'outdoor painting',
      'music', 'outdoor music', 'play music outside'
    ],
    contextBoost: ['walk', 'park', 'picnic', 'bbq', 'garden', 'yoga', 'meditation', 'relax', 'read', 'coffee', 'friends'],
    exclude: ['dog', 'pet', 'puppy', 'sports', 'race', 'training', 'marathon', 'crop', 'plant', 'farm']
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
      'planet', 'planets', 'jupiter', 'saturn',
      'mars', 'venus', 'mercury', 'uranus', 'neptune',
      'rings of saturn', 'saturn rings',
      'moons of jupiter', 'jupiter moons',
      'shooting star', 'meteor', 'meteor shower',
      'perseids', 'geminids', 'leonids',
      'comet', 'asteroid', 'eclipse',
      'aurora', 'northern lights', 'southern lights',
      'iss', 'international space station',
      'satellites', 'starlink', 'space station',
      'zodiacal light', 'gegenschein',
      'deep sky', 'deep space', 'dso',
      'nebula', 'galaxy cluster', 'globular cluster',
      'open cluster', 'double star',
      'telescope', 'binoculars', 'star tracker',
      'mount', 'eyepiece', 'filter',
      'astrophotography', 'astro photo', 'night photo',
      'camera settings for stars', 'star photography',
      'moon', 'moon phase', 'full moon', 'new moon',
      'moonlight', 'moon brightness',
      'light pollution', 'dark sky', 'bortle scale',
      'seeing', 'transparency', 'atmospheric stability',
      'cloud cover', 'clear skies', 'fog',
      'dew', 'lens fogging', 'humidity',
      'city lights', 'dark location',
      'best time to stargaze', 'stargaze tonight',
      'astronomical twilight', 'night sky timing',
      'golden hour', 'blue hour',
      'sunset tonight', 'sunrise tomorrow',
      'when is the best time', 'what time to go out'
    ],
    contextBoost: ['star', 'moon', 'planet', 'saturn', 'venus', 'astronomy', 'telescope', 'galaxy', 'nebula', 'meteor', 'aurora', 'night sky'],
    exclude: ['photo', 'camera', 'photography', 'golden hour photo', 'sunset photo', 'photoshoot']
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
      'is it good for photos', 'good photography conditions',
      'photo conditions', 'camera weather',
      'golden hour', 'golden hour today', 'golden hour time',
      'blue hour', 'blue hour today', 'blue hour time',
      'sunlight', 'natural light', 'soft light',
      'harsh light', 'harsh sun', 'midday sun',
      'sunset light', 'sunrise light', 'twilight',
      'golden light', 'warm light', 'cool light',
      'light quality', 'lighting conditions',
      'diffused light', 'overcast light', 'cloudy light',
      'backlighting', 'backlit', 'silhouette',
      'shadows', 'contrast', 'dynamic range',
      'portrait photography', 'portraits', 'headshot',
      'landscape photography', 'landscapes',
      'street photography', 'street photos',
      'wildlife photography', 'wildlife photos',
      'bird photography', 'bird photos',
      'macro photography', 'macro photos', 'close up',
      'astrophotography', 'astro photos', 'night sky photos',
      'sports photography', 'sports photos', 'action shots',
      'wedding photography', 'wedding photos',
      'real estate photography', 'house photos',
      'product photography', 'product photos',
      'food photography', 'food photos', 'culinary photos',
      'fashion photography', 'fashion photos',
      'drone photography', 'aerial photos',
      'underwater photography', 'underwater photos',
      'black and white', 'b&w photography',
      'infrared photography', 'ir photography',
      'camera', 'lens', 'tripod', 'flash',
      'polarizer', 'nd filter', 'filter',
      'lens hood', 'reflector', 'diffuser',
      'light meter', 'exposure meter',
      'drones', 'gimbal', 'stabilizer',
      'camera gear', 'photography gear',
      'exposure', 'shutter speed', 'aperture', 'iso',
      'white balance', 'focus', 'depth of field',
      'composition', 'framing', 'rule of thirds',
      'raw', 'jpeg', 'hdr', 'bracketing',
      'manual mode', 'auto mode', 'aperture priority',
      'shutter priority', 'exposure compensation',
      'rain photography', 'rainy photos', 'wet photos',
      'fog photography', 'foggy photos',
      'snow photography', 'snow photos',
      'wind photography', 'windy photos',
      'cloud photography', 'sky photography',
      'storm photography', 'dramatic sky',
      'puddle reflections', 'water reflections',
      'heat haze', 'atmospheric haze'
    ],
    contextBoost: ['photo', 'camera', 'shoot', 'lens', 'photography', 'golden hour', 'lighting', 'portrait', 'landscape', 'exposure'],
    exclude: ['stargazing', 'astronomy', 'telescope', 'star', 'planet', 'meteor', 'aurora']
  },
  {
    id: 'events',
    name: 'Events',
    priority: 2,
    section: 'Events',
    fn: getEventsAdvice,
    keys: [
      'event', 'outdoor event', 'event weather',
      'is it good for an event', 'event planning',
      'host an event', 'hosting event',
      'outdoor gathering', 'social gathering',
      'wedding', 'wedding ceremony', 'outdoor wedding',
      'wedding reception', 'wedding photos',
      'bridal shoot', 'engagement shoot',
      'wedding weather', 'wedding day forecast',
      'will it rain on my wedding', 'wedding outdoor',
      'bride', 'groom', 'wedding party',
      'wedding planning', 'wedding venue',
      'birthday party', 'birthday celebration',
      'anniversary party', 'anniversary celebration',
      'graduation party', 'graduation celebration',
      'house party', 'backyard party', 'garden party',
      'pool party', 'beach party', 'barbecue party',
      'childrens party', 'kids party', 'family party',
      'party planning', 'party weather',
      'festival', 'music festival', 'outdoor festival',
      'food festival', 'wine festival', 'beer festival',
      'art festival', 'cultural festival',
      'festival weather', 'festival planning',
      'concert', 'outdoor concert', 'music concert',
      'live music', 'outdoor music',
      'corporate event', 'company event', 'team building',
      'conference', 'seminar', 'workshop',
      'networking event', 'business event',
      'corporate gathering', 'office party',
      'corporate retreat', 'outdoor meeting',
      'block party', 'street fair', 'community event',
      'farmer market', 'flea market', 'craft fair',
      'car show', 'art show', 'gallery opening',
      'charity event', 'fundraiser', 'gala',
      'school event', 'sports day', 'field day',
      'halloween party', 'christmas market',
      'holiday party', 'new years eve', 'fireworks',
      'summer party', 'winter party', 'spring festival',
      'fall festival', 'harvest festival',
      'tent', 'marquee', 'canopy', 'event tent',
      'outdoor seating', 'event seating',
      'sound system', 'stage', 'event lighting',
      'catering', 'food service', 'bar',
      'event equipment', 'event rental',
      'rain plan', 'bad weather plan', 'contingency',
      'indoor backup', 'plan b', 'alternative venue'
    ],
    contextBoost: ['event', 'wedding', 'party', 'festival', 'concert', 'celebration', 'gathering', 'planning'],
    exclude: ['sport', 'game', 'match', 'training', 'practice', 'workout', 'exercise']
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
      'dog breed', 'brachycephalic', 'flat faced dog',
      'short haired dog', 'long haired dog',
      'dog anxiety', 'dog thunderstorm', 'dog fear',
      'dog car safety', 'dog in car', 'hot car dog',
      'cat outside', 'take cat out', 'outdoor cat',
      'indoor cat', 'cat safety', 'cat weather',
      'cat heat', 'cat cold', 'cat frostbite',
      'cat hiding', 'cat thunderstorm',
      'cat car safety', 'cat in car',
      'kitten safety', 'senior cat', 'old cat',
      'rabbit outside', 'bunny outside', 'rabbit heat',
      'rabbit cold', 'guinea pig outside', 'hamster',
      'ferret outside', 'chinchilla', 'turtle',
      'horse riding', 'ride horse', 'horse outside',
      'horse blanket', 'horse weather', 'horse heat',
      'horse cold', 'horse colic', 'horse shelter',
      'horse turnout', 'stall horse', 'horse safety',
      'equestrian', 'riding weather', 'arena footing',
      'chicken weather', 'chicken coop', 'hen safety',
      'chicken heat', 'chicken cold', 'egg production',
      'livestock safety', 'cattle weather', 'cow comfort',
      'goat weather', 'sheep weather', 'barn safety',
      'poultry weather', 'chicken water', 'heated water',
      'coop ventilation', 'chicken frostbite',
      'bird outside', 'parrot outside', 'bird aviary',
      'bird weather', 'bird heat', 'bird cold',
      'bird air quality', 'bird safety',
      'pet bird', 'bird cage', 'bird shelter',
      'hummingbird feeder', 'bird bath', 'bird feeding',
      'fish pond', 'koi', 'pond safety',
      'pond ice', 'pond freeze', 'pond heater',
      'pond oxygen', 'pond aerator', 'fish weather',
      'fish heat', 'fish cold', 'pond cover',
      'ticks', 'fleas', 'parasites', 'heartworm',
      'mosquitoes', 'lime disease', 'tick prevention',
      'flea prevention', 'snake bite', 'toad poison',
      'blue green algae', 'toxic plants', 'poison',
      'antifreeze danger', 'pet poison', 'mushrooms',
      'seasonal hazards', 'spring hazards',
      'summer hazards', 'fall hazards', 'winter hazards'
    ],
    contextBoost: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'walk my dog', 'take dog', 'dog park', 'horse', 'chicken', 'rabbit'],
    exclude: ['sport', 'run', 'jog', 'exercise', 'workout', 'crop', 'plant', 'farm', 'photo', 'camera']
  },
  {
    id: 'diy',
    name: 'DIY',
    priority: 3,
    section: 'DIY',
    fn: getDIYConstructionAdvice,
    keys: [
      'diy', 'do it yourself', 'home improvement',
      'home project', 'handyman', 'repair',
      'building', 'construction', 'renovation',
      'remodel', 'home repair', 'fixing',
      'paint outside', 'exterior paint', 'house painting',
      'painting weather', 'paint drying', 'paint curing',
      'spray paint', 'brush paint', 'roller paint',
      'paint job', 'paint project', 'stain deck',
      'deck staining', 'fence painting', 'wall painting',
      'ceiling painting', 'paint dry time',
      'oil paint', 'latex paint', 'acrylic paint',
      'pour concrete', 'concrete work', 'concrete weather',
      'concrete curing', 'concrete setting', 'cement work',
      'concrete pour', 'concrete slab', 'concrete footing',
      'concrete curing time', 'concrete temperature',
      'stamped concrete', 'concrete countertop',
      'concrete sealer', 'concrete stain',
      'woodworking', 'carpentry', 'wood project',
      'woodworking weather', 'wood glue', 'wood stain',
      'wood sealer', 'wood finishing', 'sanding',
      'building deck', 'deck building', 'fence building',
      'furniture making', 'cabinet building',
      'wood moisture', 'wood movement',
      'masonry', 'bricklaying', 'laying bricks',
      'mortar work', 'stone work', 'tuckpointing',
      'concrete block', 'retaining wall',
      'brick wall', 'stone wall', 'pavers',
      'patio pavers', 'driveway pavers',
      'roofing', 'roof repair', 'roof work',
      'shingle roof', 'metal roof', 'flat roof',
      'roof safety', 'roof weather', 'roofing conditions',
      'gutter cleaning', 'gutter repair', 'downspout',
      'siding repair', 'siding installation',
      'stucco work', 'stucco repair', 'caulking',
      'weatherproofing', 'waterproofing',
      'power washing', 'pressure washing',
      'window installation', 'door installation',
      'landscaping', 'yard work', 'grading',
      'excavation', 'digging', 'trenching',
      'soil compaction', 'sod laying', 'planting trees',
      'sprinkler installation', 'drainage',
      'french drain', 'retaining wall',
      'power tools', 'ladder safety', 'scaffolding',
      'generator', 'compressor', 'saw',
      'drill', 'hammer', 'wrench',
      'tool safety', 'equipment safety',
      'construction safety', 'diy safety',
      'fall protection', 'hearing protection',
      'respirator', 'safety glasses',
      'work gloves', 'safety harness',
      'safe to use ladder', 'scaffolding safety'
    ],
    contextBoost: ['diy', 'paint', 'concrete', 'build', 'renovate', 'repair', 'construction', 'wood', 'roof', 'deck', 'tool'],
    exclude: ['weather', 'forecast', 'temperature', 'rain', 'snow']
  },
  {
    id: 'energy',
    name: 'EnergyHome',
    priority: 2,
    section: 'Energy',
    fn: getEnergyHomeAdvice,
    keys: [
      'energy bill', 'electricity bill', 'utility bill',
      'energy cost', 'save energy', 'energy savings',
      'home energy', 'energy efficiency',
      'hvac', 'heating cooling', 'climate control',
      'thermostat', 'smart thermostat', 'programmable thermostat',
      'energy consumption', 'power usage', 'electricity usage',
      'peak hours', 'off peak', 'time of use',
      'solar panels', 'solar power', 'solar energy',
      'solar production', 'solar generation',
      'solar panel efficiency', 'solar weather',
      'net metering', 'solar credits', 'solar output',
      'solar battery', 'powerwall', 'solar storage',
      'solar charging', 'solar inverters',
      'run ac', 'air conditioning', 'ac weather',
      'heating', 'furnace', 'heat pump',
      'hvac efficiency', 'filter change', 'air filter',
      'ac maintenance', 'heating cost', 'cooling cost',
      'heat vs ac', 'fans vs ac', 'ceiling fan',
      'dehumidifier', 'humidifier', 'ventilation',
      'energy efficient hvac', 'hvac weather',
      'insulation', 'attic insulation', 'wall insulation',
      'weather stripping', 'draft proofing',
      'home sealing', 'air leakage', 'energy audit',
      'blower door test', 'r value', 'insulation upgrade',
      'dryer efficiency', 'dishwasher energy',
      'refrigerator energy', 'oven energy',
      'appliance timing', 'best time to run',
      'laundry efficiency', 'energy star',
      'pool pump', 'pool heating', 'pool energy',
      'electric car', 'ev charging', 'charger',
      'water heater', 'tankless water heater',
      'pipe freeze', 'frozen pipes', 'pipe insulation',
      'water heating', 'water conservation',
      'hot water', 'cold water', 'plumbing',
      'smart home', 'home automation', 'smart device',
      'smart plug', 'smart lighting', 'smart blinds',
      'home monitoring', 'energy monitoring',
      'demand response', 'smart meter'
    ],
    contextBoost: ['energy', 'solar', 'electricity', 'bill', 'hvac', 'ac', 'heating', 'thermostat', 'insulation', 'pipe freeze'],
    exclude: ['weather', 'forecast', 'temperature', 'rain', 'snow']
  },
  {
    id: 'traveling',
    name: 'Traveling',
    priority: 2,
    section: 'Travel',
    fn: getTravelingAdvice,
    keys: [
      'travel', 'travelling', 'trip', 'journey',
      'vacation', 'holiday', 'getaway', 'excursion',
      'travel weather', 'trip weather', 'vacation weather',
      'travel planning', 'trip planning',
      'flight', 'flying', 'airport', 'aeroplane',
      'flight weather', 'flight delay', 'flight cancellation',
      'takeoff', 'landing', 'turbulence',
      'connecting flight', 'layover', 'red eye',
      'private jet', 'charter flight', 'business flight',
      'international flight', 'domestic flight',
      'flight packing', 'carry on', 'luggage',
      'road trip', 'drive trip', 'car trip',
      'cross country', 'road travel', 'driving vacation',
      'rv trip', 'camper van', 'motorhome',
      'motorcycle trip', 'bike trip', 'cycling tour',
      'road conditions', 'highway conditions',
      'rest stops', 'gas stations', 'roadside',
      'train travel', 'rail trip', 'railway',
      'train conditions', 'train delay', 'train weather',
      'scenic train', 'luxury train', 'subway',
      'transit', 'metro', 'underground',
      'cruise', 'cruise ship', 'ocean travel',
      'cruise weather', 'sea conditions', 'rough seas',
      'port closure', 'docking', 'tender operation',
      'hurricane cruise', 'storm cruise',
      'ferry', 'boat trip', 'water taxi',
      'ferry weather', 'ferry cancellation', 'rough sea',
      'island ferry', 'coastal ferry', 'river ferry',
      'bus trip', 'coach bus', 'greyhound',
      'bus weather', 'bus delay', 'bus conditions',
      'tour bus', 'shuttle bus', 'airport bus',
      'packing', 'pack for trip', 'what to pack',
      'packing list', 'packing advice', 'luggage packing',
      'clothing packing', 'travel gear',
      'destination packing', 'seasonal packing',
      'beach vacation', 'ski trip', 'city trip',
      'mountain vacation', 'desert trip', 'tropical vacation',
      'europe trip', 'asia trip', 'africa trip',
      'south america trip', 'north america trip',
      'honeymoon destination', 'family vacation',
      'adventure trip', 'luxury trip', 'backpacking',
      'itinerary', 'travel schedule', 'trip duration',
      'timezone change', 'jet lag', 'time difference',
      'visa requirements', 'passport', 'travel insurance',
      'travel documents', 'vaccination travel',
      'currency exchange', 'travel money',
      'travel safety', 'safe to travel', 'travel risk',
      'health travel', 'travel advisory',
      'weather warning travel', 'storm travel',
      'travel emergency', 'help travel'
    ],
    contextBoost: ['travel', 'trip', 'flight', 'vacation', 'journey', 'airport', 'hotel', 'packing'],
    exclude: ['weather', 'forecast', 'temperature', 'rain', 'snow']
  },
  {
    id: 'skin_hair',
    name: 'SkinHair',
    priority: 3,
    section: 'Beauty',
    fn: getSkinHairAdvice,
    keys: [
      'skin', 'hair', 'beauty', 'skincare', 'haircare',
      'beauty routine', 'skincare routine',
      'beauty weather', 'skin weather', 'hair weather',
      'skin health', 'hair health',
      'dry skin', 'oily skin', 'combination skin',
      'sensitive skin', 'normal skin', 'mature skin',
      'acne', 'breakout', 'pimples', 'blackheads',
      'eczema', 'psoriasis', 'rosacea', 'dermatitis',
      'hyperpigmentation', 'melasma', 'dark spots',
      'wrinkles', 'fine lines', 'aging skin',
      'skin barrier', 'moisturize', 'moisturizer',
      'sunscreen', 'spf', 'sun protection',
      'uv damage', 'sunburn', 'sun damage',
      'skin cancer prevention', 'skin protection',
      'face oil', 'serum', 'vitamin c', 'retinol',
      'hyaluronic acid', 'niacinamide', 'peptides',
      'exfoliate', 'scrub', 'chemical peel',
      'face mask', 'sheet mask', 'clay mask',
      'skin glow', 'radiant skin', 'healthy skin',
      'skin irritation', 'skin inflammation',
      'frizzy hair', 'frizz control', 'anti frizz',
      'curly hair', 'wavy hair', 'straight hair',
      'coily hair', 'kinky hair', 'natural hair',
      'dry hair', 'damaged hair', 'brittle hair',
      'hair fall', 'hair loss', 'alopecia',
      'dandruff', 'scalp health', 'scalp irritation',
      'hair dye', 'color treated', 'bleached hair',
      'keratin treatment', 'relaxer', 'perm',
      'gray hair', 'silver hair', 'white hair',
      'hair static', 'dry shampoo', 'hair oil',
      'hair mask', 'deep condition', 'conditioner',
      'hair styling', 'blowout', 'hair dryer',
      'heat protectant', 'straightener', 'curling iron',
      'hair products', 'shampoo', 'conditioner',
      'hair type', 'curly hair care', 'wavy hair care',
      'straight hair care', 'coily hair care',
      'natural hair care', 'protective style',
      'box braids', 'twists', 'locs', 'weave',
      'wig', 'hair extensions', 'edges',
      'wash and go', 'twist out', 'braid out',
      'humidity hair', 'frizz humidity', 'hair moisture',
      'dewy point hair', 'hair drying weather',
      'hair weather forecast', 'good hair day',
      'bad hair day', 'curl definition',
      'makeup melt', 'makeup weather', 'makeup wear',
      'foundation', 'concealer', 'powder', 'primer',
      'setting spray', 'blotting paper',
      'waterproof makeup', 'long lasting makeup',
      'makeup setting', 'makeup fixing',
      'body skin', 'body care', 'body moisturizer',
      'body oil', 'body scrub', 'dry body skin',
      'hand cream', 'cuticle oil', 'nail care',
      'lip balm', 'chapped lips', 'lip care',
      'foot care', 'cracked feet', 'foot scrub'
    ],
    contextBoost: ['skin', 'hair', 'face', 'scalp', 'moisturizer', 'sunscreen', 'makeup', 'frizz', 'curls', 'beauty'],
    exclude: ['weather', 'forecast', 'temperature', 'rain', 'snow', 'sport', 'run', 'gym', 'workout']
  }
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SCORING ENGINE ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const scoreQuestion = (question, intent) => {
  const q = question.toLowerCase().trim()
  let score = 0
  const matched = []
  const excluded = []

  // 1. Check exclusions first
  if (intent.exclude) {
    for (const ex of intent.exclude) {
      if (q.includes(ex.toLowerCase())) {
        excluded.push(ex)
        score -= CONFIG.EXCLUDE_PENALTY
      }
    }
  }

  // 2. Score all keys with phrase weighting
  for (const key of intent.keys) {
    const k = key.toLowerCase()
    
    // Full phrase match (highest weight)
    if (q === k) {
      score += 100
      matched.push(`[exact] ${key}`)
      continue
    }

    // Phrase contains key
    if (q.includes(k)) {
      const wordCount = k.split(/\s+/).length
      
      // Weight based on phrase length
      if (wordCount >= 5) {
        score += 80
        matched.push(`[long] ${key}`)
      } else if (wordCount >= 4) {
        score += 65
        matched.push(`[phrase] ${key}`)
      } else if (wordCount >= 3) {
        score += 45
        matched.push(`[3-word] ${key}`)
      } else if (wordCount === 2) {
        score += 25
        matched.push(`[2-word] ${key}`)
      } else {
        // Single word - lower weight
        score += 8
        matched.push(`[single] ${key}`)
      }
    }
  }

  // 3. Context boost
  if (intent.contextBoost) {
    for (const boost of intent.contextBoost) {
      if (q.includes(boost.toLowerCase())) {
        score += CONFIG.CONTEXT_BOOST
        matched.push(`[context] ${boost}`)
      }
    }
  }

  // 4. Priority bonus (tie-breaker)
  score += (10 - intent.priority) * CONFIG.PRIORITY_BONUS

  // 5. Check for exact word matches (bonus)
  const words = q.split(/\s+/)
  for (const word of words) {
    if (word.length < 3) continue
    for (const key of intent.keys) {
      if (key.toLowerCase().includes(word) && word.length > 2) {
        const alreadyMatched = matched.some(m => m.includes(word))
        if (!alreadyMatched) {
          score += 3
        }
      }
    }
  }

  return { score, matched, excluded }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── INTENT DETECTION ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const detectIntents = (question) => {
  const results = []

  for (const intent of INTENT_MAP) {
    const { score, matched, excluded } = scoreQuestion(question, intent)
    
    // Minimum threshold to consider
    if (score > CONFIG.MIN_SCORE_THRESHOLD) {
      results.push({ 
        intent, 
        score, 
        matched, 
        excluded,
        isPrimary: false 
      })
    }
  }

  // Sort by score descending
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.intent.priority - b.intent.priority
  })

  // Mark the highest score as primary
  if (results.length > 0) {
    results[0].isPrimary = true
  }

  // Only return intents that are within 40% of the top score
  const primaryScore = results[0]?.score || 0
  const threshold = primaryScore * CONFIG.SECONDARY_THRESHOLD
  
  const filtered = results.filter(r => r.score >= threshold)
  
  return filtered.slice(0, CONFIG.MAX_INTENTS)
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── GET INTENT FUNCTION ──────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const getIntentFunction = (intentId) => {
  const intent = INTENT_MAP.find(i => i.id === intentId)
  return intent?.fn || null
}

export const getIntentById = (intentId) => {
  return INTENT_MAP.find(i => i.id === intentId) || null
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── DEBUG FUNCTION ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

export default { detectIntents, getIntentFunction, getIntentById, debugIntentMatch }
