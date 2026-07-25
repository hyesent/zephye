import {
  calcHeatIndex,
  calcWindChill,
  calcWetBulbGlobeTemp,
  getBurnTime,
  getComfortScore,
  random,
  getSeason,
  getTimeOfDay,
  getSunPosition,
  calculateDewPoint,
  getUVLevel,
  getAQICategory,
  calculatePollenIndex,
  getPressureTrend,
  getAltitudeDensity
} from './calculations';

// ============================================================================
// COMPREHENSIVE HEALTH & WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  "Is it safe to go outside today?",
  "Will the weather affect my migraines?",
  "Is it bad for my arthritis?",
  "Should I worry about heat stroke?",
  "Will my allergies act up?",
  "Is it safe for elderly to go out?",
  "Can I exercise with my heart condition?",
  "Will humidity affect my breathing?",
  "Should I stay inside today?",
  "Is it a high pollution day?",
  "Will my sinuses be bad today?",
  "Should I worry about frostbite?",
  "Is it safe for my baby outside?",
  "Will my Raynaud's act up?",
  "Should I take my allergy meds?",
  "Is it safe after my surgery?",
  "Will the cold trigger my asthma?",
  "Is the UV dangerous for my skin condition?",
  "Should I worry about dehydration?",
  "Will the weather affect my blood pressure?",
  "Is it safe with my COPD?",
  "Will my eczema flare up?",
  "Should I avoid outdoor exercise?",
  "Is it safe during pregnancy?",
  "Will my fibromyalgia be worse?",
  "Should I worry about heat exhaustion?",
  "Is the air too dry for my throat?",
  "Will my lupus be affected?",
  "Should I wear a mask outside?",
  "Is it safe with my heart failure?",
  "Will my diabetes be harder to manage?",
  "Should I worry about hypothermia?",
  "Is it a high pollen count day?",
  "Will my psoriasis improve?",
  "Should I use my nebulizer before going out?",
  "Is it safe after my heart attack?",
  "Will my MS symptoms worsen?",
  "Should I worry about sun poisoning?",
  "Is it safe with my kidney condition?",
  "Will the humidity trigger my Meniere's?",
  "Should I avoid the outdoors with my immunity?",
  "Is it a red air quality day?",
  "Will my chronic fatigue be worse?",
  "Should I cancel my dialysis appointment?",
  "Is it safe with my sickle cell?",
  "Will my neuropathy be worse?",
  "Should I worry about altitude sickness?",
  "Is it safe for my chemotherapy session?",
  "Will my thyroid condition be affected?",
  "Should I avoid gardening with allergies?",
  "Is it safe with my pacemaker?",
  "Will my glaucoma be affected by pressure?",
  "Should I worry about heat rash?",
  "Is it safe with my epilepsy?",
  "Will my anemia make me more sensitive?",
  "Should I use my CPAP differently?",
  "Is it safe with my autoimmune condition?",
  "Will my scars be more sensitive?",
  "Should I worry about eye damage from UV?",
  "Is it safe for my premature baby?",
  "Will my sinus headache intensify?",
  "Should I worry about mold exposure?",
  "Is it a good day for my mental health walk?",
  "Will my vertigo be triggered?",
  "Should I use extra oxygen today?",
  "Is it safe with my burn scars?",
  "Will my shingles pain increase?",
  "Should I worry about West Nile virus?",
  "Is it safe with my lymphedema?",
  "Will my gout flare up?",
  "Should I avoid peak sun hours?",
  "Is the humidity good for my dry eyes?",
  "Will my sciatica be worse?",
  "Should I worry about tick-borne illness?",
  "Is it safe with my organ transplant?",
  "Will my sleep apnea be worse?",
  "Should I worry about valley fever?",
  "Is it safe with my sarcoidosis?",
  "Will my endometriosis pain increase?",
  "Should I worry about dehydration with my meds?",
  "Is it safe for my bone marrow transplant?",
  "Will my carpal tunnel be worse?",
  "Should I worry about mosquito-borne illness?",
  "Is it safe with my cystic fibrosis?",
  "Will my TMJ pain increase?",
  "Should I worry about heat-related seizures?",
  "Is it safe with my pulmonary hypertension?",
  "Will my IBS be triggered?",
  "Should I avoid dairy before going out?",
  "Is it safe with my myasthenia gravis?",
  "Will my plantar fasciitis be worse?",
  "Should I worry about wildfire smoke?",
  "Is it safe with my tracheostomy?",
  "Will my bursitis flare up?",
  "Should I worry about ozone levels?",
  "Is it safe with my ventricular assist device?",
  "Will my tendonitis be more painful?",
  "Should I worry about dust storms?",
  "Is it safe with my oxygen concentrator?",
  "Will my cluster headaches be triggered?"
];

// ============================================================================
// MEDICAL CONDITION DATABASE
// ============================================================================

const MEDICAL_CONDITIONS = {
  asthma: {
    category: 'respiratory',
    triggers: {
      aqi: { threshold: 100, risk: 'Attack risk increases 2x per 50 AQI points' },
      humidity: { high: 80, low: 30, risk: 'Extremes trigger bronchospasm' },
      temperature: { cold: 5, hot: 32, risk: 'Cold air + exercise = EIB trigger' },
      pollen: { threshold: 7, risk: 'Allergic asthma trigger' },
      thunderstorms: { risk: 'Thunderstorm asthma epidemic risk' }
    },
    precautions: [
      'Use preventer inhaler before going out',
      'Carry rescue inhaler at all times',
      'Wear scarf over mouth in cold air',
      'Consider N95 mask if AQI > 100',
      'Pre-medicate before exercise in cold'
    ],
    dangerSigns: [
      'Using rescue inhaler > 2x/week = poor control',
      'Difficulty speaking full sentences',
      'Lips/fingernails turning blue (EMERGENCY)',
      'Peak flow < 50% of personal best'
    ]
  },
  copd: {
    category: 'respiratory',
    triggers: {
      aqi: { threshold: 100, risk: 'Exacerbation risk 3x above threshold' },
      humidity: { high: 80, low: 25, risk: 'Breathing difficulty increases' },
      temperature: { cold: 0, hot: 30, risk: 'Extremes cause dyspnea' },
      altitude: { threshold: 1500, risk: 'Reduced oxygen saturation' }
    },
    precautions: [
      'Check oxygen saturation before going out',
      'Use oxygen if prescribed (don\'t skip!)',
      'Limit outdoor time to 15-20 minutes in extremes',
      'Pursed-lip breathing technique helps',
      'Keep rescue medications accessible'
    ],
    dangerSigns: [
      'SpO2 < 88% (or personal baseline)',
      'Increased sputum production or color change',
      'Confusion or excessive drowsiness',
      'Unable to walk across room without stopping'
    ]
  },
  cardiovascular_disease: {
    category: 'cardiac',
    triggers: {
      temperature: { cold: 0, hot: 30, risk: 'Cardiac workload increases 30-50%' },
      humidity: { high: 80, risk: 'Dehydration increases blood viscosity' },
      aqi: { threshold: 100, risk: 'PM2.5 enters bloodstream, triggers inflammation' },
      pressure: { rapid: 5, risk: 'Rapid pressure changes affect blood pressure' }
    },
    precautions: [
      'Avoid strenuous activity in temperature extremes',
      'Take medications as prescribed',
      'Monitor for chest pain/discomfort',
      'Stay hydrated (but follow fluid restrictions if any)',
      'Rest frequently during outdoor activity'
    ],
    dangerSigns: [
      'Chest pain, pressure, or discomfort',
      'Shortness of breath at rest',
      'Pain radiating to arm, jaw, neck, or back',
      'Cold sweat, nausea, lightheadedness',
      'CALL EMERGENCY IMMEDIATELY for any of above'
    ]
  },
  hypertension: {
    category: 'cardiac',
    triggers: {
      temperature: { cold: 5, risk: 'Vasoconstriction raises BP 5-15 mmHg' },
      humidity: { high: 80, risk: 'Dehydration concentrates medications' },
      pressure: { rapid: 8, risk: 'Barometric changes affect vascular tone' }
    },
    precautions: [
      'Monitor BP more frequently in extreme weather',
      'Avoid sudden exertion in cold (shoveling snow = dangerous)',
      'Stay hydrated (water, not alcohol/caffeine)',
      'Limit sodium intake especially on hot days',
      'Take medications at consistent times'
    ]
  },
  diabetes: {
    category: 'metabolic',
    triggers: {
      temperature: { hot: 30, risk: 'Insulin absorption changes, dehydration affects glucose' },
      cold: { threshold: 0, risk: 'Reduced circulation to extremities' },
      humidity: { high: 80, risk: 'Sweat affects CGM/pump adhesion' }
    },
    precautions: [
      'Check blood glucose more frequently (every 2 hours in heat)',
      'Insulin: store in cooler (not freezer, don\'t let it freeze)',
      'Heat can increase insulin absorption rate',
      'Cold can decrease insulin absorption',
      'Protect feet: neuropathy + extreme temps = injury risk',
      'CGM/pump: extra adhesive in humidity, protect from direct sun',
      'Carry fast-acting glucose at all times'
    ],
    dangerSigns: [
      'Hypoglycemia symptoms can mimic heat exhaustion',
      'Confusion, sweating, dizziness = check glucose first',
      'Ketones: check if BG > 240 in extreme conditions',
      'Foot checks mandatory after outdoor activity'
    ]
  },
  arthritis: {
    category: 'musculoskeletal',
    triggers: {
      pressure: { drop: 5, risk: 'Joint pressure changes cause pain 1-2 days before weather change' },
      humidity: { high: 75, risk: 'Increased joint swelling and stiffness' },
      temperature: { cold: 10, risk: 'Synovial fluid thickens in cold' },
      dewPoint: { threshold: 13, risk: 'Dew point > 13°C correlates with increased pain' }
    },
    precautions: [
      'Warm joints before going out in cold',
      'Compression garments provide support',
      'Gentle movement/stretching reduces stiffness',
      'Heat therapy (warm bath, heating pad) for stiffness',
      'Cold therapy for acute inflammation',
      'Maintain vitamin D levels (often low in arthritis patients)'
    ],
    painManagement: [
      'Pain typically increases 1-3 days before weather change',
      'Morning stiffness worse in cold/damp conditions',
      'Activity modification: swimming, indoor exercise on bad days',
      'Keep joints covered and warm in cold weather'
    ]
  },
  migraine: {
    category: 'neurological',
    triggers: {
      pressure: { change: 5, risk: 'Barometric pressure changes trigger migraines in 50%+ of sufferers' },
      temperature: { extreme: true, risk: 'Both heat and cold can trigger' },
      humidity: { high: 80, risk: 'High humidity correlates with migraine onset' },
      wind: { strong: 30, risk: 'Wind can trigger in susceptible individuals' },
      lightning: { risk: 'Lightning within 25 miles increases migraine risk 28%' },
      sunGlare: { risk: 'Bright sunlight/glare is a common trigger' }
    },
    precautions: [
      'Monitor barometric pressure trends',
      'Take preventative medication if pressure changing rapidly',
      'Wear polarized sunglasses (even on cloudy-bright days)',
      'Stay hydrated - dehydration is a trigger multiplier',
      'Avoid known food triggers especially on high-risk days',
      'Consistent sleep schedule (weather affects sleep quality)',
      'Caffeine: maintain consistent intake (changes trigger)'
    ],
    earlyWarning: [
      'Pressure drops > 5 hPa in 24 hours = high risk day',
      'Keep rescue medication accessible',
      'Dark room, cold compress at first aura/prodrome sign',
      'Hydrate with electrolytes (not just water)'
    ]
  },
  fibromyalgia: {
    category: 'chronic_pain',
    triggers: {
      temperature: { cold: 10, risk: 'Cold increases muscle tension and pain' },
      humidity: { high: 75, risk: 'Damp conditions worsen widespread pain' },
      pressure: { change: 4, risk: 'Rapid pressure changes trigger flares' },
      wind: { threshold: 20, risk: 'Wind can increase pain sensitivity' }
    },
    precautions: [
      'Layer clothing - temperature regulation is difficult',
      'Gentle stretching indoors before going out',
      'Heat therapy for muscle pain',
      'Weighted blanket for sleep (weather affects sleep quality)',
      'Pacing: 20 min activity, 10 min rest',
      'Avoid overexertion - post-exertional malaise is real'
    ]
  },
  multiple_sclerosis: {
    category: 'neurological',
    triggers: {
      temperature: { hot: 27, risk: 'Uhthoff\'s phenomenon: symptoms worsen with heat' },
      humidity: { high: 70, risk: 'Heat + humidity = faster symptom onset' },
      cold: { threshold: 0, risk: 'Spasticity may increase in cold' }
    },
    precautions: [
      'Cooling vest/towel in heat (> 25°C)',
      'Limit outdoor activity to 15-20 min in heat',
      'Pre-cool before going out on hot days',
      'Cold drinks help lower core temperature',
      'Air-conditioned environment for rest breaks',
      'Plan activities for morning/evening in summer'
    ],
    dangerSigns: [
      'Vision changes in heat (Uhthoff\'s)',
      'Increased weakness or fatigue',
      'Cognitive fog worsening',
      'Symptoms should improve with cooling'
    ]
  },
  raynauds: {
    category: 'vascular',
    triggers: {
      temperature: { cold: 15, risk: 'Attacks begin below 15°C for many' },
      wind: { threshold: 15, risk: 'Wind chill accelerates attacks' },
      temperatureChange: { rapid: true, risk: 'Moving from warm to cold triggers episodes' }
    },
    precautions: [
      'Gloves/mittens before going outside (pre-warm)',
      'Hand warmers (chemical or rechargeable)',
      'Layered gloves (thin liner + insulated outer)',
      'Warm socks, insulated boots for feet',
      'Avoid caffeine and nicotine (vasoconstrictors)',
      'Warm car before getting in',
      'Run hands under warm (not hot) water if attack occurs'
    ],
    attackDuration: 'Typical attack: 15-20 minutes. Severe: up to several hours.',
    dangerSigns: [
      'White/blue fingers or toes = no blood flow',
      'Numbness, tingling, pain during attack',
      'Red and throbbing during rewarming',
      'Seek medical attention if: skin ulcers develop',
      'Severe pain, signs of infection, or tissue damage'
    ]
  },
  eczema: {
    category: 'dermatological',
    triggers: {
      humidity: { low: 30, risk: 'Dry air strips skin moisture' },
      temperature: { extreme: true, risk: 'Both extremes trigger flares' },
      pollen: { threshold: 5, risk: 'Contact allergies can trigger' },
      uvIndex: { high: 8, risk: 'Sun can help or hurt depending on type' },
      wind: { threshold: 20, risk: 'Wind burns and dries skin' }
    },
    precautions: [
      'Heavy moisturizer before going out (ceramides, petrolatum)',
      'Humidifier indoors (maintain 40-50% humidity)',
      'Lukewarm (not hot) showers',
      'Pat dry, don\'t rub. Moisturize within 3 minutes of bathing',
      'Cotton clothing against skin (no wool, synthetics may irritate)',
      'UV protection: some eczema types worsen with sun',
      'Avoid known allergens on high pollen days'
    ]
  },
  psoriasis: {
    category: 'dermatological',
    triggers: {
      temperature: { cold: 5, risk: 'Cold, dry air triggers flares' },
      humidity: { low: 35, risk: 'Lack of moisture = scaling and itching' },
      uvIndex: { moderate: 3, risk: 'Controlled UV helps many, but sunburn worsens' },
      stress: { risk: 'Weather-related stress is a known trigger' }
    },
    precautions: [
      'Controlled sun exposure (10-15 min) may help (check with doctor)',
      'Heavy moisturizing in dry/cold conditions',
      'Coal tar or salicylic acid preparations as prescribed',
      'Avoid skin injury (Koebner phenomenon)',
      'Vitamin D supplementation (discuss with doctor)',
      'Stress management techniques'
    ]
  },
  sickle_cell: {
    category: 'hematological',
    triggers: {
      temperature: { cold: 15, risk: 'Cold triggers vaso-occlusive crisis' },
      temperatureChange: { rapid: true, risk: 'Rapid temperature changes are dangerous' },
      wind: { threshold: 20, risk: 'Wind chill exacerbates cold risk' },
      dehydration: { risk: 'Crucial trigger - maintain hydration' },
      altitude: { threshold: 1500, risk: 'Reduced oxygen = crisis risk' }
    },
    precautions: [
      'Avoid cold exposure completely if possible',
      'Layer clothing, keep extremities warm',
      'Stay extremely well hydrated (2-3L minimum)',
      'Avoid sudden temperature changes',
      'Know nearest emergency department with sickle cell protocol',
      'Pain management plan accessible'
    ],
    dangerSigns: [
      'Pain crisis beginning = seek medical attention promptly',
      'Fever (emergency in sickle cell)',
      'Chest pain, difficulty breathing (acute chest syndrome)',
      'Priapism (emergency)',
      'Splenic sequestration signs (children)'
    ]
  },
  pregnancy: {
    category: 'special_population',
    triggers: {
      temperature: { hot: 30, risk: 'Increased risk of heat exhaustion/stroke' },
      humidity: { high: 70, risk: 'Reduced sweating efficiency' },
      uvIndex: { high: 6, risk: 'Melasma risk increased' },
      aqi: { threshold: 100, risk: 'Air pollution affects fetal development' }
    },
    precautions: [
      'Stay hydrated (2.5-3L water daily)',
      'Avoid peak heat hours (11am-4pm)',
      'Loose, breathable clothing',
      'SPF 50+ (melasma/chloasma prevention)',
      'Avoid hot tubs/saunas (dangerous for fetus)',
      'Rest frequently, feet elevated',
      'Air quality: wear N95 on poor AQI days',
      'Swimming: excellent exercise, but avoid overheated pools'
    ],
    dangerSigns: [
      'Dizziness, nausea, feeling faint',
      'Rapid heartbeat, excessive thirst',
      'Decreased fetal movement',
      'Contractions or abdominal pain',
      'Vaginal bleeding or fluid leakage'
    ]
  },
  elderly: {
    category: 'special_population',
    triggers: {
      temperature: { hot: 28, cold: 5, risk: 'Thermoregulation impaired' },
      humidity: { extreme: true, risk: 'Reduced ability to sense temperature/humidity' },
      aqi: { threshold: 100, risk: 'Reduced respiratory reserve' },
      uvIndex: { high: 6, risk: 'Thinner skin, reduced repair ability' },
      dehydration: { risk: 'Reduced thirst sensation' }
    },
    precautions: [
      'Check on elderly neighbors/family twice daily in extremes',
      'Drink water on schedule (every 2 hours), not just when thirsty',
      'Air conditioning or cooling center in heat > 32°C',
      'Heating: maintain indoor temp > 18°C in winter',
      'Medication review: some meds affect temperature regulation',
      'Diuretics = increased dehydration risk in heat',
      'Beta-blockers = reduced heat tolerance',
      'Non-slip footwear in wet/icy conditions',
      'MedicAlert bracelet recommended'
    ],
    dangerSigns: [
      'Confusion or disorientation (heat stroke/hypothermia)',
      'Dry, hot skin (not sweating in heat = emergency)',
      'Shivering, slurred speech, drowsiness (hypothermia)',
      'Falls risk increases in extreme weather'
    ]
  },
  infants: {
    category: 'special_population',
    triggers: {
      temperature: { hot: 26, cold: 0, risk: 'Cannot regulate body temperature well' },
      uvIndex: { any: 3, risk: 'Infant skin burns in < 10 minutes at UV 6+' },
      aqi: { threshold: 50, risk: 'Developing lungs are more sensitive' },
      humidity: { high: 80, risk: 'Overheating risk increases' }
    },
    precautions: [
      'Dress baby in ONE more layer than you wear',
      'Check baby\'s neck/chest (not hands/feet) for temperature',
      'Never cover stroller with blanket (creates oven effect)',
      'Sunscreen only after 6 months (before: shade, clothing, hat)',
      'Stroller fan in heat, stroller bunting in cold',
      'Feed more frequently (small stomachs = hydration issues)',
      'Car seat: no bulky coats (unsafe in crash, overheating risk)',
      'Never leave baby in car (even "just a minute")'
    ],
    dangerSigns: [
      'Lethargy, floppiness',
      'Dry mouth, no tears when crying',
      'Fewer wet diapers (< 4 in 24 hours)',
      'Sunken soft spot on head (fontanelle)',
      'Fever in infant < 3 months = EMERGENCY'
    ]
  },
  chronic_kidney_disease: {
    category: 'renal',
    triggers: {
      temperature: { hot: 30, risk: 'Dehydration concentrates toxins' },
      humidity: { extreme: true, risk: 'Fluid balance harder to maintain' },
      dehydration: { risk: 'CRITICAL - can cause acute kidney injury on CKD' }
    },
    precautions: [
      'Follow fluid restrictions CAREFULLY (too much AND too little dangerous)',
      'Weigh daily - sudden weight gain = fluid retention',
      'Avoid NSAIDs (ibuprofen, naproxen) - nephrotoxic',
      'Electrolyte drinks: only if approved by nephrologist',
      'Protect dialysis access site from sun/heat/sweat',
      'Missed dialysis due to weather = call clinic immediately'
    ]
  },
  epilepsy: {
    category: 'neurological',
    triggers: {
      temperature: { hot: 32, risk: 'Heat can lower seizure threshold' },
      dehydration: { risk: 'Electrolyte imbalances trigger seizures' },
      humidity: { high: 80, risk: 'Combined with heat = increased risk' },
      flickering: { risk: 'Sunlight through trees while driving can trigger photosensitive epilepsy' }
    },
    precautions: [
      'Stay hydrated with electrolytes',
      'Avoid overheating',
      'Take medications on schedule (don\'t skip)',
      'Polarized sunglasses reduce flicker effect',
      'Buddy system for swimming (never swim alone)',
      'MedicAlert bracelet recommended'
    ],
    dangerSigns: [
      'Aura preceding seizure',
      'Missed medication dose',
      'Prolonged seizure > 5 minutes = EMERGENCY (status epilepticus)',
      'Seizure in water = EMERGENCY'
    ]
  }
};

// ============================================================================
// POLLEN & ALLERGY DATABASE
// ============================================================================

const POLLEN_TYPES = {
  tree: {
    season: 'spring',
    types: ['Oak', 'Birch', 'Cedar', 'Pine', 'Maple', 'Elm', 'Ash', 'Poplar'],
    peakHours: '5am-10am',
    triggers: [
      'Dry, warm, windy days = highest counts',
      'Rain temporarily washes pollen from air',
      'Thunderstorms can rupture pollen grains (more allergenic)'
    ]
  },
  grass: {
    season: 'late_spring_summer',
    types: ['Bermuda', 'Timothy', 'Rye', 'Kentucky Blue', 'Johnson', 'Bahia'],
    peakHours: '7am-11am and 4pm-7pm',
    triggers: [
      'Warm days, cool nights promote grass pollen',
      'Freshly mowed lawns release massive amounts',
      'Morning dew delays release until grass dries'
    ]
  },
  weed: {
    season: 'late_summer_fall',
    types: ['Ragweed', 'Sagebrush', 'Pigweed', 'Lamb\'s Quarters', 'Russian Thistle'],
    peakHours: '10am-3pm',
    triggers: [
      'Ragweed: most common fall allergen',
      'One ragweed plant = 1 billion pollen grains',
      'Wind can carry ragweed pollen 400+ miles',
      'Harvest season = increased agricultural dust + mold'
    ]
  },
  mold: {
    season: 'year_round_peaks_warm_wet',
    types: ['Alternaria', 'Aspergillus', 'Cladosporium', 'Penicillium'],
    peakHours: 'Anytime humidity > 70%',
    triggers: [
      'Thrives in humidity > 70%',
      'Spikes after rain (especially in leaf litter)',
      'Indoor: bathrooms, basements, AC systems',
      'Outdoor: compost piles, rotting vegetation, soil',
      'First warm days after rain = mold explosion'
    ]
  }
};

// ============================================================================
// AIR QUALITY HEALTH EFFECTS CALCULATOR
// ============================================================================

function getAQIHealthEffects(aqi, condition) {
  const effects = [];
  
  if (aqi <= 50) {
    effects.push({ level: 'Good', risk: 'Minimal', advice: 'Air quality satisfactory. Normal activities OK.' });
  } else if (aqi <= 100) {
    effects.push({ 
      level: 'Moderate', 
      risk: 'Acceptable',
      advice: 'Unusually sensitive people: consider reducing prolonged outdoor exertion.',
      sensitive: 'Those with asthma, COPD, heart disease may notice slight effects.'
    });
  } else if (aqi <= 150) {
    effects.push({
      level: 'Unhealthy for Sensitive Groups',
      risk: 'Moderate-High',
      advice: 'Sensitive groups: reduce prolonged outdoor exertion. Take breaks indoors.',
      sensitive: 'Asthma attacks more likely. COPD exacerbation risk. Heart patients: chest pain possible.',
      general: 'General public unlikely to be affected at this level.'
    });
  } else if (aqi <= 200) {
    effects.push({
      level: 'Unhealthy',
      risk: 'High',
      advice: 'Sensitive groups: avoid outdoor exertion. Everyone: limit prolonged outdoor activity.',
      sensitive: 'Asthma: use preventer. Consider N95 mask outdoors. Heart: increased risk.',
      general: 'Even healthy people may experience: coughing, throat irritation, shortness of breath.'
    });
  } else if (aqi <= 300) {
    effects.push({
      level: 'Very Unhealthy',
      risk: 'Very High',
      advice: 'Everyone: avoid outdoor exertion. Sensitive groups: stay indoors.',
      emergency: 'Hospital admissions for respiratory/cardiac increase significantly.',
      masks: 'N95 recommended for any outdoor activity. Not a bad idea indoors if no filtration.'
    });
  } else {
    effects.push({
      level: 'Hazardous',
      risk: 'Extreme',
      advice: 'EVERYONE: stay indoors. This is a health emergency.',
      emergency: 'ER visits spike. Even healthy people at risk of serious health effects.',
      masks: 'N95 minimum. HEPA air purifiers indoors. Seal windows.',
      special: 'This level of pollution can cause permanent lung damage with prolonged exposure.'
    });
  }
  
  return effects;
}

// ============================================================================
// THERMAL STRESS CALCULATOR
// ============================================================================

function getThermalStress(data) {
  const { temp, humidity, wind } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, 0);
  
  let thermal = {
    risk: 'Normal',
    effects: [],
    hydration: 'Normal intake',
    clothing: 'Weather-appropriate'
  };
  
  // Extreme Heat
  if (wbgt >= 32.3) {
    thermal.risk = 'EXTREME HEAT - LIFE THREATENING';
    thermal.effects = [
      'Heat stroke imminent within 15-20 minutes of exposure',
      'Body loses ability to regulate temperature',
      'Core temperature rises rapidly',
      'Organ damage, brain damage, death possible',
      'Sweating may STOP (dangerous sign - skin hot and dry)'
    ];
    thermal.hydration = '500ml water every 15-20 minutes if must be outside. Electrolyte replacement CRITICAL.';
    thermal.clothing = 'Absolute minimum. Light colors. Loose fit. No outdoor activity safe.';
    thermal.special = 'COLD WATER IMMERSION if heat stroke suspected. CALL EMERGENCY.';
  } else if (wbgt >= 30.1) {
    thermal.risk = 'VERY HIGH - Heat exhaustion likely';
    thermal.effects = [
      'Heat exhaustion: heavy sweating, weakness, dizziness, nausea',
      'Heat cramps: painful muscle spasms',
      'Core temperature rising',
      'Cognitive function impaired (poor decision-making)'
    ];
    thermal.hydration = '400ml water every 20 minutes. Sports drink (electrolytes).';
    thermal.clothing = 'Lightweight, light-colored, loose-fitting. Wide-brim hat.';
  } else if (wbgt >= 28.0) {
    thermal.risk = 'HIGH - Heat stress';
    thermal.effects = [
      'Heat cramps and heat exhaustion possible with prolonged exposure',
      'Sweating profusely',
      'Fatigue sets in faster',
      'Irritability and decreased concentration'
    ];
    thermal.hydration = '300ml water every 20-30 minutes.';
    thermal.clothing = 'Breathable fabrics. Shade breaks recommended.';
  }
  
  // Extreme Cold
  if (windChill <= -30) {
    thermal.risk = 'EXTREME COLD - LIFE THREATENING';
    thermal.effects = [
      'Frostbite on exposed skin in 5-10 minutes',
      'Hypothermia risk: confusion, shivering, loss of coordination',
      'Cardiac stress severe (vasoconstriction)',
      'Frostbite: skin turns white/gray, numb, hard'
    ];
    thermal.hydration = 'Warm beverages. Dehydration still occurs in cold.';
    thermal.clothing = 'Multiple layers. No exposed skin. Face mask. Mittens (not gloves).';
    thermal.special = 'Rapid rewarming if frostbite suspected. Do NOT rub affected areas.';
  } else if (windChill <= -18) {
    thermal.risk = 'SEVERE COLD - Frostbite risk high';
    thermal.effects = [
      'Frostbite in 15-30 minutes on exposed skin',
      'Hypothermia possible if improperly dressed',
      'Fingers, toes, ears, nose most vulnerable'
    ];
    thermal.hydration = 'Warm drinks. Avoid alcohol (increases heat loss).';
    thermal.clothing = 'Thermal base + insulating mid + windproof outer. Hand/toe warmers.';
  }
  
  return thermal;
}

// ============================================================================
// PRESSURE CHANGE HEALTH EFFECTS
// ============================================================================

function getPressureHealthEffects(pressure, pressureTrend) {
  const effects = [];
  
  if (pressureTrend === 'falling_rapidly' || (pressure < 1000 && pressureTrend === 'falling')) {
    effects.push('Rapidly falling pressure affects:');
    effects.push('• Migraine/headache: 50-60% of migraineurs are pressure-sensitive');
    effects.push('• Arthritis/joint pain: synovial fluid expands, joints ache');
    effects.push('• Sinus pressure: sinuses struggle to equalize');
    effects.push('• Old injuries: scar tissue, healed fractures may ache');
    effects.push('• Blood pressure: may decrease (vasodilation)');
    effects.push('• Mood: some people feel lethargic, "heavy"');
    effects.push('• Vertigo/Meniere\'s: inner ear pressure changes');
  } else if (pressureTrend === 'rising_rapidly' || (pressure > 1025 && pressureTrend === 'rising')) {
    effects.push('Rapidly rising pressure:');
    effects.push('• Blood pressure may increase slightly');
    effects.push('• Some migraineurs triggered by rising pressure');
    effects.push('• Generally fewer symptoms than falling pressure');
    effects.push('• Can trigger headaches in pressure-sensitive individuals');
  }
  
  return effects;
}

// ============================================================================
// MAIN HEALTH ADVICE FUNCTION
// ============================================================================

export const getHealthAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, humidity, wind, uvIndex, aqi, visibility, 
    condition, conditionCode, city, pressure, dewPoint,
    tempMin, tempMax, precipitation, pollenIndex
  } = data;
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, 0);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const comfort = getComfortScore({ temp, humidity, wind });
  const pressureTrend = getPressureTrend(data);
  const aqiEffects = getAQIHealthEffects(aqi);
  const thermal = getThermalStress(data);
  const pressureEffects = getPressureHealthEffects(pressure, pressureTrend);
  const season = getSeason();
  const timeOfDay = getTimeOfDay();
  
  // Detect specific conditions from question
  const q = question.toLowerCase();
  const relevantConditions = [];
  for (const [key, config] of Object.entries(MEDICAL_CONDITIONS)) {
    if (q.includes(key.replace(/_/g, ' ')) || q.includes(key)) {
      relevantConditions.push({ key, config });
    }
  }
  
  let verdict = [];
  let respiratory = [];
  let cardiac = [];
  let joints = [];
  let skin = [];
  let neurological = [];
  let warnings = [];
  let general = [];
  let specialPopulations = [];
  let conditionSpecific = {};

  // ========================================================================
  // LIFE-THREATENING CONDITIONS
  // ========================================================================
  
  if (wbgt >= 32.3) {
    verdict.push("🚨 EXTREME HEAT EMERGENCY: Life-threatening conditions.");
    warnings.push(`WBGT ${wbgt.toFixed(1)}°C: Heat stroke can kill within 30 minutes.`);
    warnings.push("Heat stroke victims: may STOP sweating, skin hot & dry, confusion, unconsciousness.");
    warnings.push("CALL EMERGENCY. Cool immediately: cold water immersion, ice packs to neck/armpits/groin.");
    cardiac.push("Cardiac arrest risk 3x normal. Heart attacks peak in extreme heat.");
    respiratory.push("Ozone and pollution trapped near ground. Lung damage risk.");
  } else if (wbgt >= 30.1) {
    verdict.push("⚠️ DANGEROUS HEAT: High risk for vulnerable populations.");
    cardiac.push("Heart works 2-3x harder. Avoid exertion between 11am-5pm.");
    specialPopulations.push("ELDERLY: Heat stroke risk. Check on them every 2 hours.");
    specialPopulations.push("CHILDREN: Overheat 3-5x faster than adults. No outdoor play.");
  } else if (windChill <= -25) {
    verdict.push("🚨 EXTREME COLD EMERGENCY: Life-threatening conditions.");
    warnings.push(`Wind chill ${windChill}°C: Frostbite in < 10 minutes.`);
    cardiac.push("Cold-induced vasoconstriction = heart attack risk spikes 2x.");
    respiratory.push("Cold air can trigger severe bronchospasm in asthmatics.");
    specialPopulations.push("HOMELESS POPULATION: Extreme danger. Call shelters, check on vulnerable.");
  }
  
  if (aqi > 200) {
    verdict.push("🚨 HAZARDOUS AIR: Health emergency for ALL populations.");
    respiratory.push("Even healthy individuals: permanent lung damage possible with prolonged exposure.");
    respiratory.push("N95 masks provide SOME protection. HEPA air purifiers indoors.");
    warnings.push("Hospital admissions for respiratory/cardiac conditions surge at this AQI.");
  }

  // ========================================================================
  // RESPIRATORY HEALTH
  // ========================================================================
  
  if (aqi > 150) {
    respiratory.push(`VERY UNHEALTHY AIR (AQI ${aqi}): All respiratory conditions exacerbated.`);
    respiratory.push("Asthma: Use preventer inhaler before going out. Carry rescue inhaler.");
    respiratory.push("COPD: Limit outdoor time to essential trips only. Use oxygen as prescribed.");
    respiratory.push("N95/KN95 masks reduce particulate exposure by 90%+.");
    respiratory.push("Avoid exercise outdoors. Indoor exercise: use air purifier.");
  } else if (aqi > 100) {
    respiratory.push(`UNHEALTHY for sensitive groups (AQI ${aqi}).`);
    respiratory.push("Reduce outdoor exertion. Take breaks indoors with filtered air.");
    respiratory.push("Consider N95 mask for prolonged outdoor exposure.");
  }
  
  if (humidity > 85 && temp > 20) {
    respiratory.push(`High humidity ${humidity}%: Mold spores and dust mites thrive.`);
    respiratory.push("Allergic asthma: increased triggers. Use HEPA filter at home.");
    respiratory.push("Breathing may feel heavy/effortful even in healthy individuals.");
  } else if (humidity < 25) {
    respiratory.push(`Very dry air ${humidity}%: Airways irritated. Mucus membranes dry.`);
    respiratory.push("Asthma: airways more reactive. Use humidifier. Saline nasal spray.");
    respiratory.push("Increased susceptibility to respiratory infections (dry airways = less protection).");
  }
  
  if (condition === 'thunderstorm') {
    respiratory.push("⛈️ THUNDERSTORM ASTHMA WARNING:");
    respiratory.push("Pollen grains absorb moisture, rupture into tiny allergenic particles.");
    respiratory.push("These particles penetrate deep into lungs - severe asthma attacks possible.");
    respiratory.push("Even people without asthma history can be affected!");
    respiratory.push("Stay indoors during storm and for 1-2 hours after. Windows closed.");
    respiratory.push("Have rescue inhaler ready. Seek help if breathing difficult.");
  }
  
  if (visibility < 3 && humidity > 70) {
    respiratory.push(`Fog/haze traps pollutants near ground level.`);
    respiratory.push("Pollution concentration can be 3-5x normal on foggy days.");
    respiratory.push("Sensitive individuals: limit outdoor exposure.");
  }

  // ========================================================================
  // CARDIOVASCULAR HEALTH
  // ========================================================================
  
  if (effectiveTemp > 32) {
    cardiac.push(`HEAT STRAIN: Heart rate increases 10-20 bpm per 1°C rise in core temp.`);
    cardiac.push("Blood diverted to skin for cooling = less blood for heart/brain.");
    cardiac.push("Dehydration thickens blood = increased clotting risk.");
    cardiac.push("Heart failure patients: weigh daily. Fluid retention increases in heat.");
    cardiac.push("Take medications as prescribed. Don't skip diuretics.");
    cardiac.push("Warning signs: chest pain/pressure, palpitations, unusual shortness of breath.");
  } else if (effectiveTemp < 0) {
    cardiac.push(`COLD STRAIN: Blood vessels constrict, raising blood pressure 5-20 mmHg.`);
    cardiac.push("Heart works harder to pump against increased resistance.");
    cardiac.push("Blood thickens slightly (plasma volume decreases).");
    cardiac.push("Angina threshold lowered: chest pain at lower activity levels.");
    cardiac.push("Warning: sudden exertion in cold (shoveling, pushing car) = heart attack trigger.");
    cardiac.push("Warm up gradually. Dress warmly. Cover mouth to warm inhaled air.");
  }
  
  if (aqi > 100) {
    cardiac.push("Air pollution (PM2.5) enters bloodstream through lungs.");
    cardiac.push("Increases inflammation, blood clotting, plaque rupture risk.");
    cardiac.push("Heart attack risk increases 2-3x within 24 hours of high pollution exposure.");
    cardiac.push("Limit outdoor time. N95 mask if must go out.");
  }
  
  if (pressureTrend === 'falling_rapidly') {
    cardiac.push("Rapidly falling pressure: blood pressure may decrease.");
    cardiac.push("Some people feel lightheaded, fatigued. Change positions slowly.");
  }

  // ========================================================================
  // JOINT & MUSCULOSKELETAL
  // ========================================================================
  
  if (humidity > 75 || (pressure < 1010 && pressureTrend === 'falling')) {
    joints.push("ARTHRITIS ALERT: High humidity + low pressure = increased joint pain.");
    joints.push("Synovial fluid responds to pressure changes: expansion = pain in enclosed joint space.");
    joints.push("Pain often starts 1-3 days BEFORE weather change (barometric pressure drops first).");
    joints.push("Warm joints: heating pad, warm bath, compression garments.");
    joints.push("Gentle movement: stiffness increases with inactivity despite pain.");
    joints.push("Old injuries, healed fractures, surgical sites: may ache or throb.");
    joints.push("Scar tissue is more sensitive to pressure changes than normal tissue.");
  }
  
  if (windChill < 10) {
    joints.push("Cold stiffens joints: synovial fluid thickens like cold honey.");
    joints.push("Morning stiffness worse. Take longer to warm up.");
    joints.push("Dress warmly. Layer joints: knee warmers, wrist warmers, thermal gloves.");
    joints.push("Move gently before getting out of bed: ankle circles, knee bends, wrist rotations.");
  }
  
  if (condition === 'rain' && precipitation > 5) {
    joints.push("Rainy day: joint pain peak for many arthritis sufferers.");
    joints.push("Combination of low pressure + high humidity = maximum joint stress.");
  }

  // ========================================================================
  // NEUROLOGICAL
  // ========================================================================
  
  if (Math.abs(pressure - 1013) > 8 || pressureTrend === 'falling_rapidly') {
    neurological.push("BAROMETRIC PRESSURE CHANGE: Migraine trigger for 53% of migraineurs.");
    neurological.push(`Pressure ${pressure} hPa (${pressureTrend.replace(/_/g, ' ')}).`);
    neurological.push("Take preventative medication EARLY if you know you're pressure-sensitive.");
    neurological.push("Stay hydrated, maintain consistent caffeine intake, regular meals.");
    neurological.push("Polarized sunglasses: bright/glarey days trigger photophobia.");
  }
  
  if (condition === 'thunderstorm') {
    neurological.push("Thunderstorm = migraine trigger. Lightning produces ozone + pressure changes.");
    neurological.push("Studies show 28% increased migraine risk with lightning within 25 miles.");
    neurological.push("Cluster headache sufferers: may be triggered by pressure changes.");
  }
  
  if (effectiveTemp > 28 && humidity > 70) {
    neurological.push("Heat + humidity: fatigue, brain fog, reduced cognitive performance.");
    neurological.push("Multiple Sclerosis: Uhthoff's phenomenon - symptoms worsen with heat.");
    neurological.push("Cool environment: 15-20°C optimal for cognitive function.");
  }

  // ========================================================================
  // SKIN HEALTH
  // ========================================================================
  
  if (uvIndex >= 8) {
    skin.push(`EXTREME UV ${uvIndex}: Burn time ~${burnMin} minutes.`);
    skin.push("SPF 50+ BROAD SPECTRUM. Reapply every 2 hours (more if sweating/swimming).");
    skin.push("UPF clothing: rated 50+ blocks 98% of UV. Regular white t-shirt: UPF 5-8.");
    skin.push("Medications that increase sun sensitivity: antibiotics, NSAIDs, retinoids, diuretics, some antidepressants.");
    skin.push("If you take ANY medications, check for photosensitivity warning.");
    skin.push("Lupus patients: UV can trigger systemic flares. FULL protection essential.");
    skin.push("History of skin cancer: avoid direct sun 10am-4pm. See dermatologist regularly.");
    skin.push("Check skin monthly: ABCDE rule (Asymmetry, Border, Color, Diameter, Evolving).");
  } else if (uvIndex >= 6) {
    skin.push(`HIGH UV ${uvIndex}: Sun protection essential. SPF 30+ minimum.`);
    skin.push("Reapply sunscreen: most people apply only 25-50% of recommended amount.");
    skin.push("Recommended: 1 oz (shot glass) for full body coverage.");
  } else if (uvIndex >= 3) {
    skin.push("Moderate UV: SPF 15+ if outside > 30 minutes.");
    skin.push("Clouds filter only 20% of UV. You can burn on cloudy days.");
  }
  
  if (wind > 20 && humidity < 40) {
    skin.push("Wind + dry air = moisture stripped from skin.");
    skin.push("Eczema/psoriasis: increased risk of flare. Heavy moisturizer before going out.");
    skin.push("Lip balm with SPF. Windburn looks and feels like sunburn.");
    skin.push("Protect face with scarf or balaclava in cold wind.");
  }
  
  if (temp > 30 && humidity > 70) {
    skin.push("Heat + humidity: sweat trapped against skin = heat rash (prickly heat).");
    skin.push("Fungal infections thrive: keep skin folds dry (under breasts, groin, between toes).");
    skin.push("Shower after sweating. Change into dry clothes promptly.");
    skin.push("Use antifungal powder if prone to jock itch/athlete's foot.");
  }

  // ========================================================================
  // ALLERGIES & POLLEN
  // ========================================================================
  
  if (pollenIndex) {
    if (pollenIndex > 9) {
      respiratory.push(`VERY HIGH POLLEN: Severe allergic reactions likely.`);
      respiratory.push("Stay indoors with windows closed. HEPA air purifier running.");
      respiratory.push("Shower and change clothes after being outside (pollen sticks to fabric/hair).");
      respiratory.push("Pets: wipe down after being outside (pollen on fur = indoor exposure).");
      respiratory.push("Take antihistamines BEFORE going out (prevention > treatment).");
      respiratory.push("Nasal steroid sprays: start 2 weeks before allergy season (not immediate relief).");
      respiratory.push("Eye drops: antihistamine drops for itchy/watery eyes.");
    } else if (pollenIndex > 6) {
      respiratory.push(`HIGH POLLEN: Allergy symptoms likely for sensitive individuals.`);
      respiratory.push("Take allergy medication before outdoor exposure.");
      respiratory.push("Avoid outdoor activity during peak pollen hours.");
    } else if (pollenIndex > 3) {
      respiratory.push("MODERATE POLLEN: Some allergy symptoms possible.");
    }
  }
  
  if (season === 'spring') {
    respiratory.push("TREE POLLEN SEASON: Peak typically 5am-10am.");
    respiratory.push("Dry, warm, windy days = worst. Rain temporarily clears pollen.");
  } else if (season === 'summer') {
    respiratory.push("GRASS POLLEN SEASON: Peak morning and late afternoon.");
    respiratory.push("Lawn mowing releases massive pollen. Wear N95 if mowing lawn.");
  } else if (season === 'fall') {
    respiratory.push("RAGWEED SEASON: Peak mid-September. One plant = 1 billion pollen grains.");
    respiratory.push("Ragweed pollen travels 400+ miles on wind.");
  }
  
  if (humidity > 70 && temp > 15) {
    respiratory.push("MOLD SPORES: Elevated in humid conditions.");
    respiratory.push("Outdoor mold: leaf litter, compost, soil, rotting wood.");
    respiratory.push("Indoor mold: bathrooms, basements, AC drip pans, window sills.");
  }

  // ========================================================================
  // SPECIAL POPULATIONS
  // ========================================================================
  
  if (effectiveTemp > 30 || effectiveTemp < 5) {
    specialPopulations.push("👴 ELDERLY: Extreme temperature risk.");
    specialPopulations.push("• Thermoregulation impaired with age");
    specialPopulations.push("• Reduced thirst sensation = dehydration risk");
    specialPopulations.push("• Medications may affect temperature regulation");
    specialPopulations.push("• Check on elderly neighbors/family twice daily");
    specialPopulations.push("• Community cooling/warming centers: know locations");
    specialPopulations.push("👶 INFANTS/YOUNG CHILDREN:");
    specialPopulations.push("• Cannot regulate body temperature well");
    specialPopulations.push("• Overheat 3-5x faster than adults");
    specialPopulations.push("• Never leave in car, even briefly");
    specialPopulations.push("• Dress in one more layer than adult, check neck/chest for temp");
    specialPopulations.push("• Watch for: lethargy, dry mouth, fewer wet diapers (dehydration)");
  }
  
  if (aqi > 100) {
    specialPopulations.push("👶 CHILDREN & AIR QUALITY:");
    specialPopulations.push("• Children breathe more air per pound of body weight");
    specialPopulations.push("• Lungs still developing - more vulnerable to pollution damage");
    specialPopulations.push("• Limit outdoor play. Indoor activities on high AQI days");
    specialPopulations.push("• Schools: consider indoor recess on orange/red AQI days");
  }

  // ========================================================================
  // MENTAL HEALTH
  // ========================================================================
  
  if (condition === 'rain' || condition === 'overcast') {
    general.push("🧠 MENTAL HEALTH NOTE: Overcast/rainy weather can affect mood.");
    general.push("• Reduced sunlight = reduced serotonin production");
    general.push("• Some people experience SAD symptoms even in non-winter months");
    general.push("• Bright light therapy: 30 minutes in morning can help");
    general.push("• Vitamin D: consider supplementation (discuss with doctor)");
    general.push("• Still beneficial to go outside briefly (even in rain) for natural light exposure");
    general.push("• Exercise indoors if weather prevents outdoor activity");
  }
  
  if (condition === 'clear' && uvIndex > 3) {
    general.push("🧠 MENTAL HEALTH BOOST: Sunny weather increases serotonin.");
    general.push("• 15-30 minutes morning sunlight helps regulate circadian rhythm");
    general.push("• Outdoor exercise in nature reduces anxiety and depression symptoms");
    general.push("• Vitamin D synthesis (still use sunscreen after 15 minutes)");
  }

  // ========================================================================
  // CONDITION-SPECIFIC ADVICE
  // ========================================================================
  
  for (const { key, config } of relevantConditions) {
    conditionSpecific[key] = [];
    
    // Check each trigger type
    if (config.triggers) {
      if (config.triggers.temperature) {
        if (config.triggers.temperature.cold && windChill < config.triggers.temperature.cold) {
          conditionSpecific[key].push(`❄️ COLD TRIGGER: ${config.triggers.temperature.risk}`);
        }
        if (config.triggers.temperature.hot && heatIndex > config.triggers.temperature.hot) {
          conditionSpecific[key].push(`🔥 HEAT TRIGGER: ${config.triggers.temperature.risk}`);
        }
      }
      
      if (config.triggers.aqi && aqi > config.triggers.aqi.threshold) {
        conditionSpecific[key].push(`😷 AIR QUALITY TRIGGER: ${config.triggers.aqi.risk}`);
      }
      
      if (config.triggers.humidity) {
        if (config.triggers.humidity.high && humidity > config.triggers.humidity.high) {
          conditionSpecific[key].push(`💧 HIGH HUMIDITY: ${config.triggers.humidity.risk}`);
        }
        if (config.triggers.humidity.low && humidity < config.triggers.humidity.low) {
          conditionSpecific[key].push(`🏜️ LOW HUMIDITY: ${config.triggers.humidity.risk}`);
        }
      }
      
      if (config.triggers.pressure && pressureTrend === 'falling_rapidly') {
        conditionSpecific[key].push(`📉 PRESSURE DROP: ${config.triggers.pressure.risk || 'Pressure changes may trigger symptoms'}`);
      }
      
      if (config.triggers.thunderstorms && condition === 'thunderstorm') {
        conditionSpecific[key].push(`⛈️ THUNDERSTORM: ${config.triggers.thunderstorms.risk}`);
      }
    }
    
    // Add precautions
    if (config.precautions) {
      conditionSpecific[key].push('🛡️ PRECAUTIONS:');
      config.precautions.forEach(p => conditionSpecific[key].push(`  • ${p}`));
    }
    
    // Add danger signs
    if (config.dangerSigns) {
      conditionSpecific[key].push('🚨 DANGER SIGNS (Seek medical attention):');
      config.dangerSigns.forEach(d => conditionSpecific[key].push(`  • ${d}`));
    }
  }

  // ========================================================================
  // GENERAL HEALTH ADVICE
  // ========================================================================
  
  if (effectiveTemp > 28) {
    general.push(`💧 HYDRATION: Drink before you're thirsty. Urine should be light straw-colored.`);
    general.push("• Avoid alcohol and excessive caffeine (diuretics)");
    general.push("• Eat water-rich foods: watermelon, cucumber, oranges");
    general.push("• Sports drinks: alternate with water (too much sugar without exercise)");
    general.push("• Signs of dehydration: dark urine, headache, fatigue, dizziness");
  }
  
  if (comfort === "Perfect" || comfort === "Good") {
    general.push("✅ Favorable health conditions today.");
    general.push("• Good day for outdoor exercise");
    general.push("• Walk, garden, or simply sit outside for mental health benefits");
    general.push("• Still: listen to your body. If you have chronic conditions, know your limits.");
  } else if (comfort === "Poor" || comfort === "Extreme") {
    general.push("⚠️ Challenging conditions. Listen to your body.");
    general.push("• Know your personal triggers and limitations");
    general.push("• Keep medications accessible");
    general.push("• Have a plan: where to go if conditions worsen (cooling/warming center)");
  }

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "🏥 Health weather check:",
    "💊 Medical conditions forecast:",
    "🩺 Health safety report:",
    "❤️ Wellness weather advisory:",
    "🏨 Zephye's health outlook:",
    "🫁 Health conditions analysis:",
    "💉 Medical weather alert:"
  ];

  let response = `${random(intros)} ${city}\n\n`;
  
  // Overall Risk Level
  response += `📊 OVERALL HEALTH RISK: `;
  if (wbgt >= 32.3 || windChill <= -25 || aqi > 200) {
    response += `EXTREME - Limit outdoor exposure\n`;
  } else if (wbgt >= 30.1 || windChill <= -18 || aqi > 150) {
    response += `VERY HIGH - Sensitive groups should limit outdoor time\n`;
  } else if (wbgt >= 28.0 || windChill <= -5 || aqi > 100) {
    response += `ELEVATED - Precautions recommended for chronic conditions\n`;
  } else {
    response += `MODERATE - Normal precautions sufficient\n`;
  }
  response += '\n';
  
  // Verdict
  if (verdict.length > 0) {
    verdict.forEach(v => response += `${v}\n`);
    response += '\n';
  }
  
  // Current Conditions Summary
  response += `🌡️ CURRENT CONDITIONS:\n`;
  response += `• Temperature: ${temp}°C (feels like ${effectiveTemp.toFixed(0)}°C)\n`;
  if (heatIndex > temp + 3) response += `• Heat Index: ${heatIndex.toFixed(0)}°C\n`;
  if (windChill < temp - 3) response += `• Wind Chill: ${windChill.toFixed(0)}°C\n`;
  response += `• WBGT (Heat Stress): ${wbgt.toFixed(1)}°C\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• UV Index: ${uvIndex} (Burn time: ~${burnMin} min)\n`;
  response += `• Air Quality: AQI ${aqi} (${getAQICategory(aqi)})\n`;
  response += `• Pressure: ${pressure} hPa (${pressureTrend.replace(/_/g, ' ')})\n`;
  if (pollenIndex) response += `• Pollen Count: ${pollenIndex}/10\n`;
  response += '\n';
  
  // Thermal Stress
  if (thermal.risk !== 'Normal') {
    response += `🌡️ THERMAL STRESS: ${thermal.risk}\n`;
    thermal.effects.forEach(e => response += `  • ${e}\n`);
    response += `  Hydration: ${thermal.hydration}\n`;
    response += `  Clothing: ${thermal.clothing}\n`;
    if (thermal.special) response += `  ⚠️ ${thermal.special}\n`;
    response += '\n';
  }
  
  // Air Quality
  if (aqi > 50) {
    response += `😷 AIR QUALITY: ${aqiEffects[0].level}\n`;
    response += `  ${aqiEffects[0].advice}\n`;
    if (aqiEffects[0].sensitive) response += `  ${aqiEffects[0].sensitive}\n`;
    if (aqiEffects[0].general) response += `  ${aqiEffects[0].general}\n`;
    if (aqiEffects[0].masks) response += `  Masks: ${aqiEffects[0].masks}\n`;
    response += '\n';
  }
  
  // Respiratory
  if (respiratory.length > 0) {
    response += `🫁 RESPIRATORY HEALTH:\n`;
    respiratory.forEach(r => response += `• ${r}\n`);
    response += '\n';
  }
  
  // Cardiac
  if (cardiac.length > 0) {
    response += `❤️ CARDIOVASCULAR HEALTH:\n`;
    cardiac.forEach(c => response += `• ${c}\n`);
    response += '\n';
  }
  
  // Joints
  if (joints.length > 0) {
    response += `🦴 JOINT & MUSCULOSKELETAL:\n`;
    joints.forEach(j => response += `• ${j}\n`);
    response += '\n';
  }
  
  // Neurological
  if (neurological.length > 0) {
    response += `🧠 NEUROLOGICAL:\n`;
    neurological.forEach(n => response += `• ${n}\n`);
    response += '\n';
  }
  
  // Skin
  if (skin.length > 0) {
    response += `🧴 SKIN HEALTH:\n`;
    skin.forEach(s => response += `• ${s}\n`);
    response += '\n';
  }
  
  // Pressure Effects
  if (pressureEffects.length > 0) {
    response += `📊 BAROMETRIC PRESSURE EFFECTS:\n`;
    pressureEffects.forEach(p => response += `${p}\n`);
    response += '\n';
  }
  
  // Special Populations
  if (specialPopulations.length > 0) {
    response += `👥 VULNERABLE POPULATIONS:\n`;
    specialPopulations.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Condition-Specific
  for (const [key, advice] of Object.entries(conditionSpecific)) {
    response += `🎯 ${key.replace(/_/g, ' ').toUpperCase()}:\n`;
    advice.forEach(a => response += `${a}\n`);
    response += '\n';
  }
  
  // General
  if (general.length > 0) {
    general.forEach(g => response += `${g}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `🚨 CRITICAL WARNINGS:\n`;
    warnings.forEach(w => response += `⚠️ ${w}\n`);
    response += '\n';
  }
  
  // Emergency Preparedness
  response += `🏥 EMERGENCY PREPAREDNESS:\n`;
  response += `• Keep medications in original containers (for emergency identification)\n`;
  response += `• Know your nearest emergency department\n`;
  response += `• MedicAlert or medical ID recommended\n`;
  response += `• Emergency contacts: keep updated and accessible\n`;
  if (condition === 'thunderstorm' || condition === 'snow' || wbgt > 32) {
    response += `• Power outage risk: have backup for medical devices\n`;
    response += `• Oxygen-dependent: ensure backup tanks (at least 3-day supply)\n`;
  }
  response += '\n';
  
  // Bottom Line
  response += `💡 BOTTOM LINE:\n`;
  if (wbgt >= 32.3 || windChill <= -25 || aqi > 200) {
    response += `Conditions are dangerous. Stay indoors if possible.\n`;
    response += `If you have chronic conditions: this is a high-risk day.\n`;
    response += `Keep emergency contacts and medications accessible.\n`;
  } else if (wbgt >= 30.1 || aqi > 150) {
    response += `High-risk conditions. Limit outdoor exposure.\n`;
    response += `Pay attention to your body. Early warning signs matter.\n`;
  } else {
    response += `Manageable conditions for most people.\n`;
    response += `Know your personal triggers and take precautions.\n`;
  }
  
  // Medical wisdom
  const wisdom = [
    "The best doctor gives the least medicines. - Benjamin Franklin",
    "Let food be thy medicine and medicine be thy food. - Hippocrates",
    "An ounce of prevention is worth a pound of cure. - Benjamin Franklin",
    "The greatest wealth is health. - Virgil",
    "Take care of your body. It's the only place you have to live. - Jim Rohn",
    "Health is not valued till sickness comes. - Thomas Fuller",
    "A healthy outside starts from the inside. - Robert Urich"
  ];
  response += `\n💊 ${random(wisdom)}`;

  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getAQIHealthEffects, 
  getThermalStress, 
  getPressureHealthEffects 
};

export default getHealthAdvice;
