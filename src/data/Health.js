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
  // GENERAL SAFETY
  "Is it safe to go outside today?",
  "Should I stay inside today?",
  "Is it safe for elderly to go out?",
  "Can I exercise with my heart condition?",
  "Is it safe for my baby outside?",
  "Should I avoid outdoor exercise?",
  "Is it safe during pregnancy?",
  "Should I wear a mask outside?",
  "Is it safe after my surgery?",
  "Should I cancel my outdoor plans?",
  
  // RESPIRATORY
  "Will the cold trigger my asthma?",
  "Is it safe with my COPD?",
  "Will humidity affect my breathing?",
  "Should I use my nebulizer before going out?",
  "Is it safe with my cystic fibrosis?",
  "Will my sleep apnea be worse?",
  "Should I use extra oxygen today?",
  "Is it safe with my pulmonary hypertension?",
  "Will my tracheostomy be affected?",
  
  // CARDIOVASCULAR
  "Will the weather affect my blood pressure?",
  "Should I worry about heat stroke?",
  "Is it safe with my heart failure?",
  "Will my diabetes be harder to manage?",
  "Is it safe after my heart attack?",
  "Should I worry about dehydration?",
  "Is it safe with my pacemaker?",
  "Will my anemia make me more sensitive?",
  
  // NEUROLOGICAL
  "Will the weather affect my migraines?",
  "Is it bad for my arthritis?",
  "Will my fibromyalgia be worse?",
  "Will my MS symptoms worsen?",
  "Should I worry about heat exhaustion?",
  "Will my sciatica be worse?",
  "Will my carpal tunnel be worse?",
  "Will my neuropathy be worse?",
  "Should I worry about altitude sickness?",
  
  // ALLERGIES & SKIN
  "Will my allergies act up?",
  "Is it a high pollution day?",
  "Will my sinuses be bad today?",
  "Is the UV dangerous for my skin condition?",
  "Will my eczema flare up?",
  "Will my psoriasis improve?",
  "Should I worry about sun poisoning?",
  "Is it a high pollen count day?",
  "Will my lupus be affected?",
  
  // SPECIAL CONDITIONS
  "Will my Raynaud's act up?",
  "Is it safe with my sickle cell?",
  "Will my shingles pain increase?",
  "Should I worry about frostbite?",
  "Is it safe with my organ transplant?",
  "Will my gout flare up?",
  "Should I worry about heat rash?",
  "Is it safe with my epilepsy?",
  "Should I worry about West Nile virus?",
  "Will my endometriosis pain increase?"
];

// ============================================================================
// ENHANCED MEDICAL CONDITION DATABASE
// ============================================================================

const MEDICAL_CONDITIONS = {
  asthma: {
    category: 'respiratory',
    severity: 'high',
    triggers: {
      aqi: { threshold: 100, risk: 'Attack risk increases 2x per 50 AQI points' },
      humidity: { high: 80, low: 30, risk: 'Extremes trigger bronchospasm' },
      temperature: { cold: 5, hot: 32, risk: 'Cold air plus exercise triggers EIB' },
      pollen: { threshold: 7, risk: 'Allergic asthma trigger' },
      thunderstorms: { risk: 'Thunderstorm asthma epidemic risk' },
      mold: { threshold: 70, risk: 'Mold spores trigger allergic asthma' }
    },
    precautions: [
      'Use preventer inhaler 15-30 minutes before going out',
      'Carry rescue inhaler (blue) at all times',
      'Wear scarf or mask over mouth in cold air',
      'Consider N95 mask if AQI over 100',
      'Pre-medicate before exercise in cold or high pollen',
      'Check peak flow before and after outdoor activity',
      'Avoid known triggers: cold air, pollen, pollution, mold'
    ],
    dangerSigns: [
      'Using rescue inhaler more than 2 times per week = poor control, see doctor',
      'Difficulty speaking full sentences without pausing for breath',
      'Lips or fingernails turning blue - EMERGENCY',
      'Peak flow below 50 percent of personal best - EMERGENCY',
      'No improvement after using rescue inhaler - EMERGENCY',
      'Feeling like you cannot get enough air - EMERGENCY'
    ],
    medicationTips: [
      'Preventer inhalers take 2-4 weeks to reach full effect - use daily as prescribed',
      'Rinse mouth after steroid inhalers to prevent thrush',
      'Check inhaler technique regularly - most people use incorrectly',
      'Carry spacer if prescribed - improves medication delivery',
      'Check expiration dates on all inhalers'
    ]
  },
  copd: {
    category: 'respiratory',
    severity: 'high',
    triggers: {
      aqi: { threshold: 100, risk: 'Exacerbation risk 3x above threshold' },
      humidity: { high: 80, low: 25, risk: 'Breathing difficulty increases' },
      temperature: { cold: 0, hot: 30, risk: 'Extremes cause dyspnea' },
      altitude: { threshold: 1500, risk: 'Reduced oxygen saturation' },
      ozone: { threshold: 70, risk: 'Ozone causes airway inflammation' }
    },
    precautions: [
      'Check oxygen saturation before going out (SpO2 monitor)',
      'Use supplemental oxygen if prescribed - do not skip',
      'Limit outdoor time to 15-20 minutes in extreme conditions',
      'Pursed-lip breathing technique helps control dyspnea',
      'Keep rescue medications accessible at all times',
      'Avoid pollution and smoke exposure',
      'Stay well hydrated - mucus is thinner when hydrated',
      'Get annual flu shot and pneumococcal vaccine'
    ],
    dangerSigns: [
      'SpO2 below 88 percent or below personal baseline',
      'Increased sputum production or change in sputum color',
      'Confusion, excessive drowsiness, or altered mental status - EMERGENCY',
      'Unable to walk across room without stopping to breathe',
      'Blue-tinged lips or fingernails - EMERGENCY',
      'Chest pain or pressure - EMERGENCY'
    ]
  },
  cardiovascular_disease: {
    category: 'cardiac',
    severity: 'high',
    triggers: {
      temperature: { cold: 0, hot: 30, risk: 'Cardiac workload increases 30-50 percent' },
      humidity: { high: 80, risk: 'Dehydration increases blood viscosity' },
      aqi: { threshold: 100, risk: 'PM2.5 enters bloodstream, triggers inflammation' },
      pressure: { rapid: 5, risk: 'Rapid pressure changes affect blood pressure' },
      exertion: { risk: 'Sudden exertion in cold is a heart attack trigger' }
    },
    precautions: [
      'Avoid strenuous activity in temperature extremes',
      'Take medications exactly as prescribed - do not skip doses',
      'Monitor for chest pain, pressure, or discomfort',
      'Stay hydrated but follow fluid restrictions if prescribed',
      'Rest frequently during outdoor activity',
      'Warm up gradually before exercise - especially in cold',
      'Shovel snow? Very dangerous. Get help or use a snow blower.',
      'Know your blood pressure and cholesterol numbers'
    ],
    dangerSigns: [
      'Chest pain, pressure, tightness, or discomfort - EMERGENCY',
      'Shortness of breath at rest or with minimal activity - EMERGENCY',
      'Pain radiating to arm, jaw, neck, or back - EMERGENCY',
      'Cold sweat, nausea, lightheadedness, or fainting - EMERGENCY',
      'CALL EMERGENCY IMMEDIATELY for any of above',
      'Do not drive yourself to hospital - call ambulance'
    ],
    medicationTips: [
      'Nitroglycerin: take as prescribed for chest pain, seek help if no relief after 5 minutes',
      'Aspirin: keep accessible, 81mg chewable if having heart attack symptoms',
      'Beta-blockers: do not stop suddenly - rebound effect dangerous',
      'Keep medication list updated and accessible'
    ]
  },
  hypertension: {
    category: 'cardiac',
    severity: 'moderate',
    triggers: {
      temperature: { cold: 5, risk: 'Vasoconstriction raises BP 5-15 mmHg' },
      humidity: { high: 80, risk: 'Dehydration concentrates medications' },
      pressure: { rapid: 8, risk: 'Barometric changes affect vascular tone' },
      stress: { risk: 'Weather-related stress increases BP' }
    },
    precautions: [
      'Monitor blood pressure more frequently in extreme weather',
      'Avoid sudden exertion in cold weather',
      'Stay hydrated with water (not alcohol or caffeine)',
      'Limit sodium intake, especially on hot days',
      'Take medications at consistent times each day',
      'Avoid over-the-counter decongestants (raise blood pressure)',
      'Wear warm clothing in cold weather to prevent vasoconstriction'
    ],
    dangerSigns: [
      'Systolic BP over 180 or diastolic over 120 - seek immediate care',
      'Severe headache, confusion, or visual changes',
      'Chest pain or shortness of breath',
      'Nosebleed that won\'t stop'
    ]
  },
  diabetes: {
    category: 'metabolic',
    severity: 'moderate',
    triggers: {
      temperature: { hot: 30, risk: 'Insulin absorption changes, dehydration affects glucose' },
      cold: { threshold: 0, risk: 'Reduced circulation to extremities' },
      humidity: { high: 80, risk: 'Sweat affects CGM or pump adhesion' },
      heatIndex: { threshold: 35, risk: 'Heat exhaustion mimics hypoglycemia' }
    },
    precautions: [
      'Check blood glucose more frequently (every 2 hours in heat)',
      'Insulin: store in cooler when outside, do not freeze',
      'Heat can increase insulin absorption rate - risk of hypoglycemia',
      'Cold can decrease insulin absorption - risk of hyperglycemia',
      'Protect feet: neuropathy plus temperature extremes equals injury risk',
      'CGM or pump: use extra adhesive in humidity, protect from direct sun',
      'Carry fast-acting glucose (liquid, gel, or tablets) at all times',
      'Consider glucose sensor that works with smartphone app'
    ],
    dangerSigns: [
      'Hypoglycemia symptoms can mimic heat exhaustion - check glucose first',
      'Confusion, sweating, dizziness = check glucose immediately',
      'Ketones: check if BG above 240 in extreme conditions',
      'Foot checks mandatory after outdoor activity - inspect for blisters or injuries',
      'Inability to keep fluids down - EMERGENCY',
      'Breath with fruity smell (DKA) - EMERGENCY'
    ],
    medicationTips: [
      'Protect insulin from extreme temperatures - never leave in car',
      'Insulin pumps: check for air bubbles in heat',
      'Pre-mixed insulin: shake gently before use in cold',
      'Consider insulin cooling cases for hot weather travel'
    ]
  },
  arthritis: {
    category: 'musculoskeletal',
    severity: 'moderate',
    triggers: {
      pressure: { drop: 5, risk: 'Joint pressure changes cause pain 1-2 days before weather change' },
      humidity: { high: 75, risk: 'Increased joint swelling and stiffness' },
      temperature: { cold: 10, risk: 'Synovial fluid thickens in cold' },
      dewPoint: { threshold: 13, risk: 'Dew point above 13°C correlates with increased pain' },
      rain: { risk: 'Rainy days associated with peak joint pain' }
    },
    precautions: [
      'Warm joints before going out in cold weather',
      'Compression garments provide support and warmth',
      'Gentle movement and stretching reduces morning stiffness',
      'Heat therapy (warm bath, heating pad) for stiffness',
      'Cold therapy for acute inflammation (ice packs)',
      'Maintain vitamin D levels - often low in arthritis patients',
      'Swimming or water exercise in warm pool is excellent',
      'Use assistive devices if pain affects mobility'
    ],
    painManagement: [
      'Pain typically increases 1-3 days before weather change',
      'Morning stiffness is worse in cold and damp conditions',
      'Activity modification: swimming, indoor exercise on bad days',
      'Keep joints covered and warm in cold weather',
      'Consider weather-based pain diary to identify personal triggers',
      'Anti-inflammatory diet: omega-3s, turmeric, ginger may help'
    ],
    medicationTips: [
      'NSAIDs: take with food, not on empty stomach',
      'Topical anti-inflammatories (diclofenac gel) available over-the-counter',
      'DMARDs: take consistently, do not skip doses',
      'Biologics: ensure proper storage temperature'
    ]
  },
  migraine: {
    category: 'neurological',
    severity: 'high',
    triggers: {
      pressure: { change: 5, risk: 'Barometric pressure changes trigger migraines in 50 percent plus of sufferers' },
      temperature: { extreme: true, risk: 'Both heat and cold can trigger' },
      humidity: { high: 80, risk: 'High humidity correlates with migraine onset' },
      wind: { strong: 30, risk: 'Wind can trigger in susceptible individuals' },
      lightning: { risk: 'Lightning within 25 miles increases migraine risk 28 percent' },
      sunGlare: { risk: 'Bright sunlight and glare is a common trigger' },
      pressureChange: { risk: 'Pressure changes affect cerebral blood flow' }
    },
    precautions: [
      'Monitor barometric pressure trends and forecasts',
      'Take preventative medication early if pressure changing rapidly',
      'Wear polarized sunglasses (even on cloudy-bright days)',
      'Stay well hydrated - dehydration is a trigger multiplier',
      'Avoid known food triggers especially on high-risk days',
      'Maintain consistent sleep schedule - weather affects sleep quality',
      'Caffeine: maintain consistent intake (changes trigger)',
      'Consider magnesium and vitamin B2 supplements (discuss with doctor)',
      'Use migraine tracking app to identify patterns'
    ],
    earlyWarning: [
      'Pressure drops more than 5 hPa in 24 hours = high risk day',
      'Keep rescue medication accessible at all times',
      'Dark room, cold compress at first aura or prodrome sign',
      'Hydrate with electrolytes (not just water)',
      'Apply cold pack to head or neck at first sign',
      'Avoid strong odors, bright lights, and loud noise during attack'
    ],
    medicationTips: [
      'Triptans: take at first sign of attack, not during aura if possible',
      'NSAIDs: take with food, may be combined with caffeine',
      'Anti-nausea medications: take if nausea is a symptom',
      'Preventive medications: take daily as prescribed, may take weeks to work',
      'CGRP inhibitors: newer class, injectable or oral'
    ]
  },
  fibromyalgia: {
    category: 'chronic_pain',
    severity: 'moderate',
    triggers: {
      temperature: { cold: 10, risk: 'Cold increases muscle tension and pain' },
      humidity: { high: 75, risk: 'Damp conditions worsen widespread pain' },
      pressure: { change: 4, risk: 'Rapid pressure changes trigger flares' },
      wind: { threshold: 20, risk: 'Wind can increase pain sensitivity' },
      rain: { risk: 'Rainy days associated with increased pain' }
    },
    precautions: [
      'Layer clothing - temperature regulation is difficult',
      'Gentle stretching indoors before going outside',
      'Heat therapy for muscle pain (warm bath, heating pad)',
      'Weighted blanket for sleep - weather affects sleep quality',
      'Pacing: 20 minutes activity, 10 minutes rest',
      'Avoid overexertion - post-exertional malaise is real',
      'Use heat packs for specific painful areas',
      'Consider cognitive behavioral therapy for pain management'
    ],
    painManagement: [
      'Warm baths or showers before outdoor activity',
      'Gentle yoga or tai chi indoors on bad days',
      'Swimming or water exercise in warm pool is excellent',
      'Meditation and deep breathing for pain management',
      'Pacing: do not push through pain - stop before flare begins'
    ]
  },
  multiple_sclerosis: {
    category: 'neurological',
    severity: 'high',
    triggers: {
      temperature: { hot: 27, risk: 'Uhthoff phenomenon: symptoms worsen with heat' },
      humidity: { high: 70, risk: 'Heat plus humidity equals faster symptom onset' },
      cold: { threshold: 0, risk: 'Spasticity may increase in cold' },
      uvIndex: { high: 6, risk: 'Some MS medications increase sun sensitivity' }
    },
    precautions: [
      'Cooling vest or cooling towel in temperatures above 25°C',
      'Limit outdoor activity to 15-20 minutes in heat',
      'Pre-cool before going out on hot days',
      'Cold drinks help lower core temperature',
      'Air-conditioned environment for rest breaks',
      'Plan activities for morning or evening in summer',
      'Avoid hot baths, saunas, and hot tubs',
      'Monitor for symptom changes in different weather'
    ],
    dangerSigns: [
      'Vision changes in heat (Uhthoff phenomenon)',
      'Increased weakness or fatigue',
      'Cognitive fog worsening',
      'Symptoms should improve with cooling',
      'If symptoms do not improve with cooling - contact MS nurse or doctor',
      'Any new symptoms lasting more than 24 hours - contact neurologist'
    ],
    medicationTips: [
      'Disease-modifying therapies: consistent use is critical',
      'Some medications require special storage - keep cool',
      'Discuss cooling strategies with MS team'
    ]
  },
  raynauds: {
    category: 'vascular',
    severity: 'moderate',
    triggers: {
      temperature: { cold: 15, risk: 'Attacks begin below 15°C for many' },
      wind: { threshold: 15, risk: 'Wind chill accelerates attacks' },
      temperatureChange: { rapid: true, risk: 'Moving from warm to cold triggers episodes' },
      stress: { risk: 'Stress and cold combined = worst attacks' }
    },
    precautions: [
      'Gloves or mittens before going outside (pre-warm them)',
      'Hand warmers (chemical or rechargeable)',
      'Layered gloves: thin liner plus insulated outer',
      'Warm socks and insulated boots for feet',
      'Avoid caffeine and nicotine (vasoconstrictors)',
      'Warm the car before getting in',
      'Run hands under warm (not hot) water if attack occurs',
      'Keep whole body warm - core temperature affects extremities'
    ],
    attackDuration: 'Typical attack: 15-20 minutes. Severe: up to several hours.',
    dangerSigns: [
      'White or blue fingers or toes = no blood flow',
      'Numbness, tingling, or pain during attack',
      'Red and throbbing during rewarming phase',
      'Seek medical attention if: skin ulcers develop',
      'Severe pain, signs of infection, or tissue damage',
      'Prolonged attacks lasting over an hour'
    ],
    medicationTips: [
      'Calcium channel blockers (nifedipine) may reduce frequency',
      'Prostaglandin analogs for severe cases',
      'Discuss with rheumatologist or vascular specialist'
    ]
  },
  eczema: {
    category: 'dermatological',
    severity: 'moderate',
    triggers: {
      humidity: { low: 30, risk: 'Dry air strips skin moisture' },
      temperature: { extreme: true, risk: 'Both extremes trigger flares' },
      pollen: { threshold: 5, risk: 'Contact allergies can trigger' },
      uvIndex: { high: 8, risk: 'Sun can help or hurt depending on type' },
      wind: { threshold: 20, risk: 'Wind burns and dries skin' },
      sweat: { risk: 'Sweat contains nickel and can trigger flares' }
    },
    precautions: [
      'Heavy moisturizer before going out (ceramides, petrolatum)',
      'Humidifier indoors (maintain 40-50 percent humidity)',
      'Lukewarm (not hot) showers - hot water strips natural oils',
      'Pat dry, do not rub. Moisturize within 3 minutes of bathing',
      'Cotton clothing against skin (no wool, synthetics may irritate)',
      'UV protection: some eczema types worsen with sun exposure',
      'Avoid known allergens on high pollen days',
      'Wear gloves for wet work and cold weather'
    ],
    treatmentTips: [
      'Topical steroids: use as prescribed, taper off, do not stop abruptly',
      'Topical calcineurin inhibitors: for sensitive areas (face, genitals)',
      'Wet wrap therapy: moisturizer plus damp gauze for severe flares',
      'Bleach baths: dilute bleach in bathwater for infected eczema',
      'Antihistamines for itch (especially at night)',
      'Consider patch testing for contact allergens'
    ]
  },
  psoriasis: {
    category: 'dermatological',
    severity: 'moderate',
    triggers: {
      temperature: { cold: 5, risk: 'Cold, dry air triggers flares' },
      humidity: { low: 35, risk: 'Lack of moisture equals scaling and itching' },
      uvIndex: { moderate: 3, risk: 'Controlled UV helps many, but sunburn worsens' },
      stress: { risk: 'Weather-related stress is a known trigger' },
      injury: { risk: 'Koebner phenomenon: skin injury triggers psoriasis' }
    },
    precautions: [
      'Controlled sun exposure (10-15 minutes) may help - check with doctor',
      'Heavy moisturizing in dry and cold conditions',
      'Coal tar or salicylic acid preparations as prescribed',
      'Avoid skin injury (Koebner phenomenon)',
      'Vitamin D supplementation (discuss with doctor)',
      'Stress management techniques',
      'Avoid triggers: alcohol, smoking, stress, certain medications'
    ],
    treatmentTips: [
      'Topical treatments: apply to affected areas as directed',
      'Phototherapy: UVB or PUVA for moderate to severe cases',
      'Biologics: for severe cases that do not respond to topical therapy',
      'Systemic medications: methotrexate, cyclosporine for severe cases',
      'Discuss treatment escalation with dermatologist'
    ]
  },
  sickle_cell: {
    category: 'hematological',
    severity: 'high',
    triggers: {
      temperature: { cold: 15, risk: 'Cold triggers vaso-occlusive crisis' },
      temperatureChange: { rapid: true, risk: 'Rapid temperature changes are dangerous' },
      wind: { threshold: 20, risk: 'Wind chill exacerbates cold risk' },
      dehydration: { risk: 'Crucial trigger - maintain hydration' },
      altitude: { threshold: 1500, risk: 'Reduced oxygen equals crisis risk' },
      heat: { risk: 'Heat can cause dehydration, triggering crisis' }
    },
    precautions: [
      'Avoid cold exposure completely if possible',
      'Layer clothing, keep extremities warm',
      'Stay extremely well hydrated (2-3 litres minimum)',
      'Avoid sudden temperature changes',
      'Know nearest emergency department with sickle cell protocol',
      'Pain management plan accessible',
      'Avoid high altitudes if possible',
      'Take medications as prescribed (hydroxyurea, etc.)'
    ],
    dangerSigns: [
      'Pain crisis beginning - seek medical attention promptly',
      'Fever - EMERGENCY in sickle cell',
      'Chest pain, difficulty breathing (acute chest syndrome) - EMERGENCY',
      'Priapism - EMERGENCY',
      'Splenic sequestration signs in children - EMERGENCY',
      'Severe headache, confusion, or vision changes - EMERGENCY',
      'Inability to keep fluids down - EMERGENCY'
    ],
    medicationTips: [
      'Hydroxyurea: take consistently, monitor blood counts',
      'Folic acid supplement: helps with red blood cell production',
      'Penicillin prophylaxis for children under 5',
      'Pain medications: use as prescribed, do not wait for crisis to take'
    ]
  },
  pregnancy: {
    category: 'special_population',
    severity: 'high',
    triggers: {
      temperature: { hot: 30, risk: 'Increased risk of heat exhaustion and heat stroke' },
      humidity: { high: 70, risk: 'Reduced sweating efficiency' },
      uvIndex: { high: 6, risk: 'Melasma risk increased' },
      aqi: { threshold: 100, risk: 'Air pollution affects fetal development' },
      dehydration: { risk: 'Dehydration can cause premature contractions' }
    },
    precautions: [
      'Stay hydrated (2.5-3 litres water daily)',
      'Avoid peak heat hours (11am-4pm)',
      'Loose, breathable clothing in light colors',
      'SPF 50 plus (melasma and chloasma prevention)',
      'Avoid hot tubs and saunas (dangerous for fetus)',
      'Rest frequently, keep feet elevated',
      'Air quality: wear N95 on poor AQI days',
      'Swimming: excellent exercise, but avoid overheated pools',
      'Eat small, frequent meals to maintain energy',
      'Sleep on left side after 20 weeks'
    ],
    dangerSigns: [
      'Dizziness, nausea, feeling faint - EMERGENCY',
      'Rapid heartbeat, excessive thirst - EMERGENCY',
      'Decreased fetal movement - EMERGENCY',
      'Contractions or abdominal pain - EMERGENCY',
      'Vaginal bleeding or fluid leakage - EMERGENCY',
      'Severe headache, visual changes, or vomiting - EMERGENCY',
      'Persistent vomiting (hyperemesis) - EMERGENCY'
    ],
    trimesterSpecific: {
      first: 'Higher sensitivity to heat - thermoregulation changes',
      second: 'Increased blood volume - heart works harder in heat',
      third: 'Reduced lung capacity - breathing more effortful in humidity'
    }
  },
  elderly: {
    category: 'special_population',
    severity: 'high',
    triggers: {
      temperature: { hot: 28, cold: 5, risk: 'Thermoregulation impaired with age' },
      humidity: { extreme: true, risk: 'Reduced ability to sense temperature and humidity' },
      aqi: { threshold: 100, risk: 'Reduced respiratory reserve' },
      uvIndex: { high: 6, risk: 'Thinner skin, reduced repair ability' },
      dehydration: { risk: 'Reduced thirst sensation - dangerous' },
      medication: { risk: 'Many medications affect temperature regulation' }
    },
    precautions: [
      'Check on elderly neighbors and family twice daily in extremes',
      'Drink water on schedule (every 2 hours), not just when thirsty',
      'Air conditioning or cooling center in heat above 32°C',
      'Heating: maintain indoor temperature above 18°C in winter',
      'Medication review: some meds affect temperature regulation',
      'Diuretics increase dehydration risk in heat',
      'Beta-blockers reduce heat tolerance',
      'Non-slip footwear in wet or icy conditions',
      'MedicAlert bracelet recommended',
      'Fall prevention: clear pathways, good lighting, grab bars'
    ],
    dangerSigns: [
      'Confusion or disorientation (heat stroke or hypothermia) - EMERGENCY',
      'Dry, hot skin and not sweating in heat - EMERGENCY',
      'Shivering, slurred speech, drowsiness (hypothermia) - EMERGENCY',
      'Falls risk increases in extreme weather - call for help if fall occurs',
      'Chest pain or shortness of breath - EMERGENCY',
      'Severe headache or weakness on one side - EMERGENCY'
    ],
    homeSafety: [
      'Check home temperature regularly - thermometers accessible',
      'Electric blankets: check for frayed cords',
      'Space heaters: 3-foot rule, never leave unattended',
      'Fans: point at wall for air circulation, not directly at person',
      'Ensure easy access to water and medications'
    ]
  },
  infants: {
    category: 'special_population',
    severity: 'high',
    triggers: {
      temperature: { hot: 26, cold: 0, risk: 'Cannot regulate body temperature well' },
      uvIndex: { any: 3, risk: 'Infant skin burns in under 10 minutes at UV 6+' },
      aqi: { threshold: 50, risk: 'Developing lungs are more sensitive' },
      humidity: { high: 80, risk: 'Overheating risk increases' },
      dehydration: { risk: 'Small body size = rapid dehydration' }
    },
    precautions: [
      'Dress baby in ONE more layer than you wear',
      'Check baby\'s neck and chest (not hands and feet) for temperature',
      'Never cover stroller with blanket - creates oven effect',
      'Sunscreen only after 6 months (before: shade, clothing, hat)',
      'Stroller fan in heat, stroller bunting in cold',
      'Feed more frequently (small stomachs = hydration issues)',
      'Car seat: no bulky coats (unsafe in crash, overheating risk)',
      'Never leave baby in car - even "just a minute"',
      'Room temperature: keep 20-22°C for sleep',
      'Swaddling: stop when baby shows signs of rolling'
    ],
    dangerSigns: [
      'Lethargy, floppiness - EMERGENCY',
      'Dry mouth, no tears when crying - EMERGENCY',
      'Fewer wet diapers (under 4 in 24 hours) - EMERGENCY',
      'Sunken soft spot on head (fontanelle) - EMERGENCY',
      'Fever in infant under 3 months - EMERGENCY',
      'Irritability that cannot be soothed - EMERGENCY',
      'Rapid breathing or grunting - EMERGENCY'
    ],
    feedingTips: [
      'Breastfeeding: feed more frequently in hot weather',
      'Formula: prepare fresh, use within 2 hours, do not leave out',
      'Water: only for babies over 6 months',
      'Electrolyte solutions: only if recommended by doctor',
      'Monitor for signs of dehydration: fewer wet diapers, dark urine'
    ]
  },
  chronic_kidney_disease: {
    category: 'renal',
    severity: 'high',
    triggers: {
      temperature: { hot: 30, risk: 'Dehydration concentrates toxins' },
      humidity: { extreme: true, risk: 'Fluid balance harder to maintain' },
      dehydration: { risk: 'CRITICAL - can cause acute kidney injury on CKD' },
      exertion: { risk: 'Heat and exercise increase creatinine levels' }
    },
    precautions: [
      'Follow fluid restrictions CAREFULLY (too much AND too little dangerous)',
      'Weigh daily - sudden weight gain equals fluid retention',
      'Avoid NSAIDs (ibuprofen, naproxen) - nephrotoxic',
      'Electrolyte drinks: only if approved by nephrologist',
      'Protect dialysis access site from sun, heat, and sweat',
      'Missed dialysis due to weather = call clinic immediately',
      'Monitor blood pressure regularly',
      'Know your potassium and phosphorus levels'
    ],
    dangerSigns: [
      'Decreased urine output - EMERGENCY',
      'Swelling in feet, ankles, or face - EMERGENCY',
      'Shortness of breath (fluid in lungs) - EMERGENCY',
      'Confusion or altered mental status - EMERGENCY',
      'Nausea, vomiting, or inability to keep food down - EMERGENCY',
      'Chest pain or palpitations - EMERGENCY'
    ]
  },
  epilepsy: {
    category: 'neurological',
    severity: 'high',
    triggers: {
      temperature: { hot: 32, risk: 'Heat can lower seizure threshold' },
      dehydration: { risk: 'Electrolyte imbalances trigger seizures' },
      humidity: { high: 80, risk: 'Combined with heat equals increased risk' },
      flickering: { risk: 'Sunlight through trees while driving can trigger photosensitive epilepsy' },
      sleep: { risk: 'Heat often disrupts sleep, lowering seizure threshold' }
    },
    precautions: [
      'Stay hydrated with electrolytes',
      'Avoid overheating - stay in cool environments',
      'Take medications on schedule - do not skip doses',
      'Polarized sunglasses reduce flicker effect',
      'Buddy system for swimming - never swim alone',
      'MedicAlert bracelet recommended',
      'Know your seizure triggers and avoidance strategies',
      'Seizure action plan: what to do when seizure occurs'
    ],
    dangerSigns: [
      'Aura preceding seizure - prepare, get to safe location',
      'Missed medication dose - take as soon as remembered unless next dose is soon',
      'Prolonged seizure over 5 minutes - EMERGENCY (status epilepticus)',
      'Seizure in water - EMERGENCY',
      'Seizure with injury - EMERGENCY',
      'First-time seizure - EMERGENCY',
      'Seizure while driving - pull over if possible, call for help'
    ],
    medicationTips: [
      'AEDs: consistent timing is critical - use pill organizer',
      'Heat can affect medication stability - store properly',
      'Travel with extra medication in carry-on',
      'Discuss seizure rescue medications with neurologist'
    ]
  }
};

// ============================================================================
// ENHANCED POLLEN & ALLERGY DATABASE
// ============================================================================

const POLLEN_TYPES = {
  tree: {
    season: 'spring',
    types: ['Oak', 'Birch', 'Cedar', 'Pine', 'Maple', 'Elm', 'Ash', 'Poplar'],
    peakHours: '5am-10am',
    allergens: 'Most common: birch and oak pollen',
    triggers: [
      'Dry, warm, windy days = highest counts',
      'Rain temporarily washes pollen from air',
      'Thunderstorms can rupture pollen grains (more allergenic)',
      'Counts highest on warm, dry mornings'
    ]
  },
  grass: {
    season: 'late_spring_summer',
    types: ['Bermuda', 'Timothy', 'Rye', 'Kentucky Blue', 'Johnson', 'Bahia'],
    peakHours: '7am-11am and 4pm-7pm',
    allergens: 'Most common: Timothy and Rye grass',
    triggers: [
      'Warm days, cool nights promote grass pollen',
      'Freshly mowed lawns release massive amounts',
      'Morning dew delays release until grass dries',
      'Peaks after 2-3 warm, dry days'
    ]
  },
  weed: {
    season: 'late_summer_fall',
    types: ['Ragweed', 'Sagebrush', 'Pigweed', 'Lamb\'s Quarters', 'Russian Thistle'],
    peakHours: '10am-3pm',
    allergens: 'Ragweed is the most common fall allergen',
    triggers: [
      'One ragweed plant = 1 billion pollen grains',
      'Wind can carry ragweed pollen 400+ miles',
      'Harvest season = increased agricultural dust plus mold',
      'Peaks in mid-September'
    ]
  },
  mold: {
    season: 'year_round_peaks_warm_wet',
    types: ['Alternaria', 'Aspergillus', 'Cladosporium', 'Penicillium'],
    peakHours: 'Anytime humidity over 70 percent',
    allergens: 'Alternaria is the most common outdoor mold allergen',
    triggers: [
      'Thrives in humidity over 70 percent',
      'Spikes after rain (especially in leaf litter)',
      'Indoor: bathrooms, basements, AC systems, window sills',
      'Outdoor: compost piles, rotting vegetation, soil, leaf litter',
      'First warm days after rain = mold explosion'
    ]
  }
};

// ============================================================================
// ENHANCED AIR QUALITY HEALTH EFFECTS CALCULATOR
// ============================================================================

function getAQIHealthEffects(aqi, condition, preexistingConditions = []) {
  const effects = [];
  const recommendations = [];
  const warnings = [];
  
  let level, risk, advice, sensitive, general, masks, emergency, special;
  
  if (aqi <= 50) {
    level = 'Good';
    risk = 'Minimal';
    advice = 'Air quality satisfactory. Normal activities are safe.';
    sensitive = 'No special precautions needed.';
  } else if (aqi <= 100) {
    level = 'Moderate';
    risk = 'Acceptable';
    advice = 'Unusually sensitive people: consider reducing prolonged outdoor exertion.';
    sensitive = 'Those with asthma, COPD, or heart disease may notice slight effects.';
    general = 'Most healthy people will have no symptoms.';
  } else if (aqi <= 150) {
    level = 'Unhealthy for Sensitive Groups';
    risk = 'Moderate-High';
    advice = 'Sensitive groups: reduce prolonged outdoor exertion. Take breaks indoors.';
    sensitive = 'Asthma attacks more likely. COPD exacerbation risk. Heart patients: chest pain possible.';
    general = 'General public unlikely to be affected at this level.';
    masks = 'Consider N95 mask for sensitive individuals outdoors.';
  } else if (aqi <= 200) {
    level = 'Unhealthy';
    risk = 'High';
    advice = 'Sensitive groups: avoid outdoor exertion. Everyone: limit prolonged outdoor activity.';
    sensitive = 'Asthma: use preventer. Consider N95 mask outdoors. Heart: increased risk.';
    general = 'Even healthy people may experience: coughing, throat irritation, shortness of breath.';
    masks = 'N95 recommended for any outdoor activity.';
  } else if (aqi <= 300) {
    level = 'Very Unhealthy';
    risk = 'Very High';
    advice = 'Everyone: avoid outdoor exertion. Sensitive groups: stay indoors.';
    emergency = 'Hospital admissions for respiratory and cardiac conditions increase significantly.';
    masks = 'N95 recommended for any outdoor activity. Indoor air purifier recommended.';
    special = 'This is a health alert. Limit all outdoor activity.';
  } else {
    level = 'Hazardous';
    risk = 'Extreme';
    advice = 'EVERYONE: stay indoors. This is a health emergency.';
    emergency = 'ER visits spike. Even healthy people at risk of serious health effects.';
    masks = 'N95 minimum. HEPA air purifiers indoors. Seal windows and doors.';
    special = 'This level of pollution can cause permanent lung damage with prolonged exposure.';
    warnings.push('Hazardous air quality - health emergency for ALL populations');
  }
  
  effects.push({ level, risk, advice, sensitive, general, masks, emergency, special });
  
  // Condition-specific recommendations
  if (preexistingConditions.includes('asthma') && aqi > 100) {
    recommendations.push('Asthma: Use preventer inhaler before going out. Carry rescue inhaler.');
    recommendations.push('Consider N95 mask for any outdoor exposure.');
    recommendations.push('Stay indoors with windows closed. Use HEPA air purifier.');
  }
  
  if (preexistingConditions.includes('copd') && aqi > 100) {
    recommendations.push('COPD: Limit outdoor time to essential trips only.');
    recommendations.push('Use oxygen as prescribed - do not skip.');
    recommendations.push('Check SpO2 before and after any outdoor activity.');
  }
  
  if (preexistingConditions.includes('cardiovascular') && aqi > 100) {
    recommendations.push('Heart disease: Avoid outdoor exertion.');
    recommendations.push('Monitor for chest pain or shortness of breath.');
    recommendations.push('Take all medications as prescribed.');
  }
  
  return { effects, recommendations, warnings };
}

// ============================================================================
// ENHANCED THERMAL STRESS CALCULATOR
// ============================================================================

function getThermalStress(data, activityLevel = 'sedentary') {
  const { temp, humidity, wind, uvIndex, condition } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, 
    activityLevel === 'sedentary' ? 0 : 
    activityLevel === 'light' ? 2 : 
    activityLevel === 'moderate' ? 4 : 
    activityLevel === 'heavy' ? 6 : 0
  );
  
  const thermal = {
    risk: 'Normal',
    category: 'safe',
    effects: [],
    hydration: 'Normal intake (2-3 litres per day)',
    clothing: 'Weather-appropriate',
    coolingActions: [],
    warmingActions: [],
    exerciseAdvice: '',
    special: ''
  };
  
  // Extreme Heat
  if (wbgt >= 32.3) {
    thermal.risk = 'EXTREME HEAT - LIFE THREATENING';
    thermal.category = 'dangerous';
    thermal.effects = [
      'Heat stroke imminent within 15-20 minutes of exposure',
      'Body loses ability to regulate temperature - cooling mechanism fails',
      'Core temperature rises rapidly above 40°C',
      'Organ damage, brain damage, and death possible',
      'Sweating may STOP - skin becomes hot and dry (dangerous sign)'
    ];
    thermal.hydration = '500ml water every 15-20 minutes if must be outside. Electrolyte replacement CRITICAL.';
    thermal.clothing = 'Absolute minimum. Light colors. Loose fit. NO outdoor activity safe.';
    thermal.coolingActions = [
      'COLD WATER IMMERSION if heat stroke suspected',
      'CALL EMERGENCY immediately',
      'Ice packs to neck, armpits, and groin',
      'Move to air-conditioned environment immediately'
    ];
    thermal.exerciseAdvice = 'NO outdoor exercise. Life-threatening conditions.';
    thermal.special = 'Immediate medical attention required for any heat stroke symptoms.';
    
  } else if (wbgt >= 30.1) {
    thermal.risk = 'VERY HIGH - Heat exhaustion likely';
    thermal.category = 'high_risk';
    thermal.effects = [
      'Heat exhaustion: heavy sweating, weakness, dizziness, nausea',
      'Heat cramps: painful muscle spasms in legs, arms, or abdomen',
      'Core temperature rising above 38°C',
      'Cognitive function impaired - poor decision-making'
    ];
    thermal.hydration = '400ml water every 20 minutes. Sports drink for electrolyte replacement.';
    thermal.clothing = 'Lightweight, light-colored, loose-fitting. Wide-brim hat.';
    thermal.coolingActions = [
      'Take shade breaks every 15-20 minutes',
      'Use cooling towels or misting fans',
      'Move to air conditioning if symptoms develop'
    ];
    thermal.exerciseAdvice = 'Light activity only (10-15 minutes), morning or evening. NO midday exercise.';
    
  } else if (wbgt >= 28.0) {
    thermal.risk = 'HIGH - Heat stress';
    thermal.category = 'elevated';
    thermal.effects = [
      'Heat cramps and heat exhaustion possible with prolonged exposure',
      'Sweating profusely - electrolyte loss',
      'Fatigue sets in faster than normal',
      'Irritability and decreased concentration'
    ];
    thermal.hydration = '300ml water every 20-30 minutes.';
    thermal.clothing = 'Breathable fabrics. Shade breaks recommended.';
    thermal.coolingActions = [
      'Shade breaks every 30-40 minutes',
      'Light colored, loose clothing'
    ];
    thermal.exerciseAdvice = 'Exercise possible but reduce intensity. Take frequent breaks.';
    
  } else if (wbgt >= 25.0) {
    thermal.risk = 'MODERATE - Warm conditions';
    thermal.category = 'caution';
    thermal.effects = [
      'Heat discomfort possible with prolonged activity',
      'Sweating normal - stay hydrated'
    ];
    thermal.hydration = '200ml water every 30 minutes during activity.';
    thermal.exerciseAdvice = 'Exercise OK. Stay hydrated. Watch for early signs of heat stress.';
  }
  
  // Extreme Cold
  if (windChill <= -35) {
    thermal.risk = 'EXTREME COLD - LIFE THREATENING';
    thermal.category = 'dangerous';
    thermal.effects = [
      'Frostbite on exposed skin in 5-10 minutes',
      'Hypothermia risk: confusion, shivering, loss of coordination',
      'Cardiac stress severe - vasoconstriction',
      'Frostbite: skin turns white or gray, numb, hard'
    ];
    thermal.hydration = 'Warm beverages every 15 minutes. Dehydration still occurs in cold.';
    thermal.clothing = 'Multiple layers. NO exposed skin. Face mask. Mittens (warmer than gloves).';
    thermal.warmingActions = [
      'Rapid rewarming if frostbite suspected - warm water (not hot)',
      'Do NOT rub affected areas',
      'Seek medical attention immediately'
    ];
    thermal.exerciseAdvice = 'NO outdoor exercise. Life-threatening conditions.';
    thermal.special = 'Limit time outside to under 5 minutes. Emergency risk for homeless population.';
    
  } else if (windChill <= -25) {
    thermal.risk = 'SEVERE COLD - Frostbite risk high';
    thermal.category = 'high_risk';
    thermal.effects = [
      'Frostbite in 10-15 minutes on exposed skin',
      'Hypothermia possible if improperly dressed',
      'Fingers, toes, ears, nose most vulnerable to frostbite'
    ];
    thermal.hydration = 'Warm drinks. Avoid alcohol (increases heat loss).';
    thermal.clothing = 'Thermal base + insulating mid + windproof outer. Hand and toe warmers.';
    thermal.warmingActions = [
      'Warm hands and feet gradually',
      'Layer clothing - remove layers if sweating'
    ];
    thermal.exerciseAdvice = 'NO outdoor exercise. Risk of frostbite.';
    
  } else if (windChill <= -15) {
    thermal.risk = 'VERY COLD - Frostbite risk';
    thermal.category = 'elevated';
    thermal.effects = [
      'Frostbite in 20-30 minutes on exposed skin',
      'Cold-induced vasoconstriction',
      'Respiratory irritation from cold air'
    ];
    thermal.hydration = 'Warm beverages. Stay hydrated.';
    thermal.clothing = 'Warm layers. Cover all exposed skin. Scarf over mouth for breathing.';
    thermal.exerciseAdvice = 'Limited exercise. Warm up indoors first. Cover breathing.';
    
  } else if (windChill <= -5) {
    thermal.risk = 'COLD - Caution needed';
    thermal.category = 'caution';
    thermal.effects = [
      'Cold discomfort possible',
      'Exposed skin at risk with prolonged exposure'
    ];
    thermal.clothing = 'Warm layers. Hat and gloves recommended.';
    thermal.exerciseAdvice = 'Exercise OK. Warm up indoors. Protect extremities.';
  }
  
  return thermal;
}

// ============================================================================
// ENHANCED PRESSURE CHANGE HEALTH EFFECTS
// ============================================================================

function getPressureHealthEffects(pressure, pressureTrend, temp) {
  const effects = [];
  const recommendations = [];
  const warnings = [];
  
  // Falling pressure
  if (pressureTrend === 'falling_rapidly' || (pressure < 1000 && pressureTrend === 'falling')) {
    effects.push('RAPIDLY FALLING PRESSURE: Significant health effects likely');
    effects.push('  • Migraine and headache: 50-60 percent of migraineurs are pressure-sensitive');
    effects.push('  • Arthritis and joint pain: synovial fluid expands, joints ache');
    effects.push('  • Sinus pressure: sinuses struggle to equalize, causing pain');
    effects.push('  • Old injuries: scar tissue and healed fractures may ache');
    effects.push('  • Blood pressure: may decrease (vasodilation from pressure drop)');
    effects.push('  • Mood: some people feel lethargic, heavy, or fatigued');
    effects.push('  • Vertigo and Meniere disease: inner ear pressure changes');
    effects.push('  • Headache: both tension and migraine types can be triggered');
    
    recommendations.push('  • Take migraine medication early if pressure-sensitive');
    recommendations.push('  • Stay hydrated - dehydration worsens pressure effects');
    recommendations.push('  • Use saline nasal spray for sinus pressure');
    recommendations.push('  • Avoid sudden changes in altitude if possible');
    recommendations.push('  • Rest and avoid overexertion');
    
    if (temp < 10) {
      warnings.push('  • Cold plus falling pressure = increased arthritis pain');
    }
    
  } else if (pressureTrend === 'rising_rapidly' || (pressure > 1025 && pressureTrend === 'rising')) {
    effects.push('RAPIDLY RISING PRESSURE: Some health effects possible');
    effects.push('  • Blood pressure may increase slightly (vasoconstriction)');
    effects.push('  • Some migraineurs triggered by rising pressure');
    effects.push('  • Generally fewer symptoms than falling pressure');
    effects.push('  • Can trigger headaches in pressure-sensitive individuals');
    effects.push('  • May affect people with high blood pressure');
    
    recommendations.push('  • Monitor blood pressure more frequently');
    recommendations.push('  • Stay hydrated to maintain blood volume');
    recommendations.push('  • Avoid excessive salt intake');
    
  } else if (pressureTrend === 'stable') {
    effects.push('Stable pressure: no significant pressure-related effects expected.');
  }
  
  return { effects, recommendations, warnings };
}

// ============================================================================
// ENHANCED MAIN HEALTH ADVICE FUNCTION
// ============================================================================

export const getHealthAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, feelsLike, humidity, wind, uvIndex, aqi, visibility, 
    condition, conditionCode, city, pressure, dewPoint,
    tempMin, tempMax, precipitation, pollenIndex
  } = data;
  
  const q = question.toLowerCase();
  
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const wbgt = calcWetBulbGlobeTemp(temp, humidity, wind, 0);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const comfort = getComfortScore({ temp, humidity, wind });
  const pressureTrend = getPressureTrend(data);
  const season = getSeason();
  const timeOfDay = getTimeOfDay();
  const uvLevel = getUVLevel(uvIndex);
  
  // Detect relevant conditions from question
  const relevantConditions = [];
  for (const [key, config] of Object.entries(MEDICAL_CONDITIONS)) {
    const searchKey = key.replace(/_/g, ' ');
    if (q.includes(searchKey) || q.includes(key)) {
      relevantConditions.push({ key, config });
    }
  }
  
  // Get all advice modules
  const aqiEffects = getAQIHealthEffects(aqi, condition, relevantConditions.map(c => c.key));
  const thermal = getThermalStress(data, 
    q.includes('exercise') || q.includes('run') || q.includes('walk') ? 'moderate' : 'sedentary'
  );
  const pressureEffects = getPressureHealthEffects(pressure, pressureTrend, temp);
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "HEALTH WEATHER ASSESSMENT",
    "MEDICAL CONDITIONS WEATHER ADVISORY",
    "HEALTH SAFETY REPORT",
    "WELLNESS WEATHER EVALUATION",
    "HEALTH CONDITIONS ANALYSIS"
  ];
  response += `=== ${random(intros)} ===\n`;
  if (city) response += `Location: ${city}\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  response += `  WBGT (heat stress): ${Math.round(wbgt * 10) / 10}°C\n`;
  response += `  Humidity: ${Math.round(humidity)}% (${humidity > 70 ? 'HIGH' : humidity < 30 ? 'LOW' : 'MODERATE'})\n`;
  response += `  Wind: ${Math.round(wind)} km/h\n`;
  response += `  UV Index: ${uvIndex} (${uvLevel}) - burn time: ~${burnMin} minutes\n`;
  response += `  Air Quality: AQI ${aqi} (${getAQICategory(aqi)})\n`;
  response += `  Pressure: ${Math.round(pressure)} hPa (${pressureTrend.replace(/_/g, ' ')})\n`;
  if (pollenIndex) response += `  Pollen Count: ${pollenIndex}/10\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm\n`;
  response += `  Season: ${season.charAt(0).toUpperCase() + season.slice(1)}\n`;
  response += `\n`;
  
  // Overall health risk
  response += `=== OVERALL HEALTH RISK ===\n`;
  let riskLevel = 'MODERATE';
  let riskAdvice = 'Normal precautions sufficient.';
  
  if (wbgt >= 32.3 || windChill <= -35 || aqi > 200) {
    riskLevel = 'EXTREME - LIFE THREATENING';
    riskAdvice = 'Limit outdoor exposure to absolute minimum. Emergency conditions.';
  } else if (wbgt >= 30.1 || windChill <= -25 || aqi > 150) {
    riskLevel = 'VERY HIGH';
    riskAdvice = 'Sensitive groups should avoid outdoor exposure. Limit outdoor activity.';
  } else if (wbgt >= 28.0 || windChill <= -15 || aqi > 100) {
    riskLevel = 'ELEVATED';
    riskAdvice = 'Precautions recommended for chronic conditions. Monitor symptoms.';
  } else if (wbgt >= 25.0 || windChill <= -5 || aqi > 50) {
    riskLevel = 'MODERATE';
    riskAdvice = 'Normal precautions for sensitive individuals.';
  } else {
    riskLevel = 'LOW';
    riskAdvice = 'Good conditions for most people. Normal activities safe.';
  }
  
  response += `  Risk level: ${riskLevel}\n`;
  response += `  Advice: ${riskAdvice}\n`;
  response += `\n`;
  
  // Thermal stress
  if (thermal.risk !== 'Normal') {
    response += `=== THERMAL STRESS ===\n`;
    response += `  ${thermal.risk}\n`;
    thermal.effects.forEach(e => response += `  • ${e}\n`);
    response += `  Hydration: ${thermal.hydration}\n`;
    response += `  Clothing: ${thermal.clothing}\n`;
    if (thermal.coolingActions.length > 0) {
      response += `  Cooling actions:\n`;
      thermal.coolingActions.forEach(a => response += `    • ${a}\n`);
    }
    if (thermal.warmingActions.length > 0) {
      response += `  Warming actions:\n`;
      thermal.warmingActions.forEach(a => response += `    • ${a}\n`);
    }
    if (thermal.exerciseAdvice) response += `  Exercise: ${thermal.exerciseAdvice}\n`;
    if (thermal.special) response += `  Special: ${thermal.special}\n`;
    response += `\n`;
  }
  
  // Air quality
  if (aqi > 50) {
    response += `=== AIR QUALITY HEALTH EFFECTS ===\n`;
    response += `  Level: ${aqiEffects.effects[0].level}\n`;
    response += `  ${aqiEffects.effects[0].advice}\n`;
    if (aqiEffects.effects[0].sensitive) {
      response += `  Sensitive groups: ${aqiEffects.effects[0].sensitive}\n`;
    }
    if (aqiEffects.effects[0].general) {
      response += `  General public: ${aqiEffects.effects[0].general}\n`;
    }
    if (aqiEffects.effects[0].masks) {
      response += `  Masks: ${aqiEffects.effects[0].masks}\n`;
    }
    if (aqiEffects.effects[0].emergency) {
      response += `  Emergency: ${aqiEffects.effects[0].emergency}\n`;
    }
    if (aqiEffects.recommendations.length > 0) {
      response += `  Recommendations:\n`;
      aqiEffects.recommendations.forEach(r => response += `    • ${r}\n`);
    }
    response += `\n`;
  }
  
  // Pressure effects
  if (pressureEffects.effects.length > 0 && !pressureEffects.effects[0].includes('stable')) {
    response += `=== BAROMETRIC PRESSURE EFFECTS ===\n`;
    pressureEffects.effects.forEach(e => response += `${e}\n`);
    if (pressureEffects.recommendations.length > 0) {
      pressureEffects.recommendations.forEach(r => response += `${r}\n`);
    }
    response += `\n`;
  }
  
  // Condition-specific advice
  for (const { key, config } of relevantConditions) {
    response += `=== ${key.replace(/_/g, ' ').toUpperCase()} ===\n`;
    response += `  Category: ${config.category.replace(/_/g, ' ')}\n`;
    response += `  Severity: ${config.severity.toUpperCase()}\n`;
    
    // Triggers
    if (config.triggers) {
      response += `  Current triggers:\n`;
      let hasTrigger = false;
      
      if (config.triggers.temperature) {
        const trigger = config.triggers.temperature;
        if (trigger.cold && windChill < trigger.cold) {
          response += `    • COLD: ${trigger.risk}\n`;
          hasTrigger = true;
        }
        if (trigger.hot && heatIndex > trigger.hot) {
          response += `    • HEAT: ${trigger.risk}\n`;
          hasTrigger = true;
        }
      }
      
      if (config.triggers.aqi && aqi > config.triggers.aqi.threshold) {
        response += `    • AIR QUALITY: ${config.triggers.aqi.risk}\n`;
        hasTrigger = true;
      }
      
      if (config.triggers.humidity) {
        const trigger = config.triggers.humidity;
        if (trigger.high && humidity > trigger.high) {
          response += `    • HIGH HUMIDITY: ${trigger.risk}\n`;
          hasTrigger = true;
        }
        if (trigger.low && humidity < trigger.low) {
          response += `    • LOW HUMIDITY: ${trigger.risk}\n`;
          hasTrigger = true;
        }
      }
      
      if (config.triggers.pressure && pressureTrend === 'falling_rapidly') {
        response += `    • PRESSURE DROP: ${config.triggers.pressure.risk || 'Pressure changes may trigger symptoms'}\n`;
        hasTrigger = true;
      }
      
      if (config.triggers.pollen && pollenIndex > config.triggers.pollen.threshold) {
        response += `    • POLLEN: ${config.triggers.pollen.risk}\n`;
        hasTrigger = true;
      }
      
      if (config.triggers.thunderstorms && condition === 'thunderstorm') {
        response += `    • THUNDERSTORM: ${config.triggers.thunderstorms.risk}\n`;
        hasTrigger = true;
      }
      
      if (config.triggers.uvIndex && uvIndex > config.triggers.uvIndex.high) {
        response += `    • UV: ${config.triggers.uvIndex.risk || 'High UV exposure'}\n`;
        hasTrigger = true;
      }
      
      if (!hasTrigger) {
        response += `    • No current triggers detected.\n`;
      }
    }
    
    // Precautions
    if (config.precautions) {
      response += `  Precautions:\n`;
      config.precautions.forEach(p => response += `    • ${p}\n`);
    }
    
    // Danger signs
    if (config.dangerSigns) {
      response += `  Danger signs (seek medical attention):\n`;
      config.dangerSigns.forEach(d => response += `    • ${d}\n`);
    }
    
    // Medication tips
    if (config.medicationTips) {
      response += `  Medication tips:\n`;
      config.medicationTips.forEach(m => response += `    • ${m}\n`);
    }
    
    response += `\n`;
  }
  
  // General health advice
  response += `=== GENERAL HEALTH ADVICE ===\n`;
  
  if (effectiveTemp > 30) {
    response += `  HEAT SAFETY:\n`;
    response += `    • Drink water before you feel thirsty - thirst is a late sign\n`;
    response += `    • Urine should be light straw-colored - check regularly\n`;
    response += `    • Avoid alcohol and excessive caffeine (both diuretics)\n`;
    response += `    • Eat water-rich foods: watermelon, cucumber, oranges\n`;
    response += `    • Sports drinks: alternate with water (too much sugar without exercise)\n`;
    response += `    • Signs of dehydration: dark urine, headache, fatigue, dizziness\n`;
    response += `    • Heat exhaustion: heavy sweating, weakness, nausea - rest in cool place\n`;
    response += `    • Heat stroke: hot dry skin, confusion, unconsciousness - CALL EMERGENCY\n`;
  }
  
  if (effectiveTemp < 5) {
    response += `  COLD SAFETY:\n`;
    response += `    • Dress in layers - thermal base, insulating mid, windproof outer\n`;
    response += `    • Cover all exposed skin - frostbite risk on fingers, toes, ears, nose\n`;
    response += `    • Hand and toe warmers help - chemical or rechargeable\n`;
    response += `    • Stay dry - wet clothing increases heat loss 10x\n`;
    response += `    • Warm car before getting in - avoid cold shock\n`;
    response += `    • Signs of hypothermia: shivering, confusion, slurred speech - seek warmth\n`;
  }
  
  if (uvIndex > 6) {
    response += `  UV PROTECTION:\n`;
    response += `    • SPF 50+ broad spectrum, reapply every 2 hours\n`;
    response += `    • UPF clothing: rated 50+ blocks 98% of UV\n`;
    response += `    • Medications that increase sun sensitivity:\n`;
    response += `      • Antibiotics (tetracycline, fluoroquinolones)\n`;
    response += `      • NSAIDs (ibuprofen, naproxen)\n`;
    response += `      • Retinoids (acne medications)\n`;
    response += `      • Diuretics (blood pressure medications)\n`;
    response += `      • Some antidepressants and antipsychotics\n`;
    response += `    • Check your medications for photosensitivity warnings\n`;
  }
  
  if (comfort === "Perfect" || comfort === "Good") {
    response += `  FAVORABLE CONDITIONS:\n`;
    response += `    • Good day for outdoor exercise and activities\n`;
    response += `    • Walk, garden, or sit outside for mental health benefits\n`;
    response += `    • Still: listen to your body and know your limits\n`;
    response += `    • If you have chronic conditions, follow your personal triggers\n`;
  }
  
  response += `\n`;
  
  // Special populations
  if (effectiveTemp > 30 || effectiveTemp < 5 || aqi > 100) {
    response += `=== SPECIAL POPULATIONS ===\n`;
    
    if (effectiveTemp > 30 || effectiveTemp < 5) {
      response += `  ELDERLY:\n`;
      response += `    • Thermoregulation impaired with age\n`;
      response += `    • Reduced thirst sensation = dehydration risk\n`;
      response += `    • Check on elderly neighbors and family twice daily\n`;
      response += `    • Know locations of community cooling or warming centers\n`;
    }
    
    if (effectiveTemp > 30) {
      response += `  INFANTS AND CHILDREN:\n`;
      response += `    • Cannot regulate body temperature well\n`;
      response += `    • Overheat 3-5 times faster than adults\n`;
      response += `    • Never leave in car - even for a minute\n`;
      response += `    • Dress in one more layer than adult, check neck for temperature\n`;
      response += `    • Watch for: lethargy, dry mouth, fewer wet diapers\n`;
    }
    
    if (aqi > 100) {
      response += `  CHILDREN AND AIR QUALITY:\n`;
      response += `    • Children breathe more air per pound of body weight\n`;
      response += `    • Lungs still developing - more vulnerable to pollution damage\n`;
      response += `    • Limit outdoor play. Indoor activities on high AQI days\n`;
    }
    
    response += `\n`;
  }
  
  // Mental health
  response += `=== MENTAL HEALTH ===\n`;
  if (condition === 'rain' || condition === 'drizzle' || condition === 'overcast' || cloudCover > 70) {
    response += `  Weather may affect mood and energy levels:\n`;
    response += `    • Reduced sunlight = reduced serotonin production\n`;
    response += `    • Some people experience SAD symptoms even in non-winter months\n`;
    response += `    • Light therapy: 30 minutes in morning can help\n`;
    response += `    • Vitamin D: consider supplementation (discuss with doctor)\n`;
    response += `    • Still beneficial to go outside briefly for natural light\n`;
    response += `    • Exercise indoors if weather prevents outdoor activity\n`;
  } else if (condition === 'clear' || condition === 'partly-cloudy') {
    response += `  Sunny weather benefits mental health:\n`;
    response += `    • 15-30 minutes morning sunlight helps regulate circadian rhythm\n`;
    response += `    • Outdoor exercise in nature reduces anxiety and depression\n`;
    response += `    • Vitamin D synthesis (use sunscreen after 15 minutes)\n`;
  }
  response += `\n`;
  
  // Emergency preparedness
  response += `=== EMERGENCY PREPAREDNESS ===\n`;
  response += `  • Keep medications in original containers for emergency identification\n`;
  response += `  • Know your nearest emergency department\n`;
  response += `  • MedicAlert or medical ID bracelet recommended\n`;
  response += `  • Emergency contacts: keep updated and accessible\n`;
  if (condition === 'thunderstorm' || condition === 'snow' || wbgt > 32) {
    response += `  • Power outage risk: have backup for medical devices\n`;
    response += `  • Oxygen-dependent: ensure backup tanks (at least 3-day supply)\n`;
    response += `  • CPAP users: battery backup for machine\n`;
    response += `  • Dialysis patients: know nearest center if usual is closed\n`;
  }
  response += `\n`;
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (wbgt >= 32.3 || windChill <= -35 || aqi > 200) {
    response += `  EXTREME DANGER: Stay indoors if possible.\n`;
    response += `  Conditions are life-threatening for vulnerable populations.\n`;
    response += `  If you have chronic conditions: this is a high-risk day.\n`;
    response += `  Keep emergency contacts and medications accessible.\n`;
    response += `  CALL EMERGENCY for any concerning symptoms.\n`;
  } else if (wbgt >= 30.1 || windChill <= -25 || aqi > 150) {
    response += `  HIGH RISK: Limit outdoor exposure.\n`;
    response += `  Vulnerable populations should stay indoors.\n`;
    response += `  Pay attention to early warning signs from your body.\n`;
    response += `  Have a plan: cooling or warming location if needed.\n`;
  } else if (wbgt >= 28.0 || windChill <= -15 || aqi > 100) {
    response += `  ELEVATED RISK: Precautions recommended.\n`;
    response += `  Manageable for most with proper preparation.\n`;
    response += `  Know your personal triggers and take precautions.\n`;
  } else {
    response += `  MANAGEABLE: Conditions acceptable for most people.\n`;
    response += `  Follow normal health precautions.\n`;
    response += `  Still: listen to your body and know your limits.\n`;
  }
  
  const wisdom = [
    "The best doctor gives the least medicines. - Benjamin Franklin",
    "Let food be thy medicine and medicine be thy food. - Hippocrates",
    "An ounce of prevention is worth a pound of cure. - Benjamin Franklin",
    "The greatest wealth is health. - Virgil",
    "Take care of your body. It's the only place you have to live. - Jim Rohn",
    "Health is not valued till sickness comes. - Thomas Fuller",
    "A healthy outside starts from the inside. - Robert Urich",
    "The only way to keep your health is to eat what you don't want, drink what you don't like, and do what you'd rather not. - Mark Twain"
  ];
  response += `\n--- WISDOM ---\n${random(wisdom)}`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getAQIHealthEffects, 
  getThermalStress, 
  getPressureHealthEffects,
  MEDICAL_CONDITIONS,
  POLLEN_TYPES
};

export default getHealthAdvice;
