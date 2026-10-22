// Zephye score engine. Scores are 1–10; null means the source data is missing.
// Risk metrics are intentionally higher = more risk; comfort/safety metrics higher = better.
export const ENVIRONMENT_METRICS = ['Air Quality','Breathability','Humidity Comfort','Pressure Comfort','Visibility Score','UV Safety','Sunshine Score','Rain Risk','Thunder Risk','Wind Comfort','Gust Risk','Feels Like Score','Sunrise/Sunset Score','Pollen/Allergy','Outdoor Activity','Jogging Score','Heat Index Risk','Cloud Cover Score','Flood Risk','Overall Comfort'];
export const MARINE_METRICS = ['Swim Safety','Surf Score','Boating Safety','Fishing Score','Diving Visibility','Tide Safety','Rip Current Risk','Wave Danger','Water Temp Comfort','Beach Walk Score','Storm Surge Risk','Overall Ocean Score'];
export const SCORE_DIRECTION = Object.fromEntries([...ENVIRONMENT_METRICS,...MARINE_METRICS].map(n=>[n,['Rain Risk','Thunder Risk','Gust Risk','Heat Index Risk','Flood Risk','Rip Current Risk','Wave Danger','Storm Surge Risk'].includes(n)?'risk':'good']));
const num = (x) => x == null || x === '' || !Number.isFinite(Number(x)) ? null : Number(x);
const clamp = x => Math.max(1,Math.min(10,Math.round(x)));
const scale = (v,lo,hi,invert=false) => { v=num(v); if(v==null) return null; const r=Math.max(0,Math.min(1,(v-lo)/(hi-lo))); return clamp((invert?1-r:r)*9+1); };
const avg = (xs,min=1) => { const a=xs.filter(Number.isFinite); return a.length<min?null:clamp(a.reduce((s,v)=>s+v,0)/a.length); };
const inverseComfort = (v,ideal,span) => v==null?null:clamp(10-Math.abs(v-ideal)/span);
const raw = (w,a,m={}) => {
 const c=w?.current||{}, h=w?.hourly||{}, d=w?.daily||{}, marine=m?.hourly||m||{};
 const at=(obj,key,i=0)=>num(Array.isArray(obj?.[key])?obj[key][i]:obj?.[key]);
 const times=Array.isArray(h.time)?h.time:[];
 const hourIndex=times.length?times.reduce((best,t,i)=>Math.abs(new Date(t).getTime()-Date.now())<Math.abs(new Date(times[best]).getTime()-Date.now())?i:best,0):0;
 const aq=num(a?.us_aqi??a?.european_aqi), pm=num(a?.pm2_5);
 const pollenData=a?.pollen||a||{};
 const temp=at(c,'temperature_2m'), feels=at(c,'apparent_temperature'), humidity=at(c,'relative_humidity_2m'), pressure=at(c,'pressure_msl'), vis=at(c,'visibility') ?? at(h,'visibility',hourIndex);
 const precipProb=at(h,'precipitation_probability',hourIndex), precip=at(h,'precipitation',hourIndex), gust=at(c,'wind_gusts_10m'), wind=at(c,'wind_speed_10m');
 return {aqi:aq,pm2_5:pm,visibility:vis,humidity,dew_point:at(c,'dew_point_2m'),pressure,uv:at(c,'uv_index') ?? at(h,'uv_index',hourIndex),sunshine_hours:at(d,'sunshine_duration')==null?null:at(d,'sunshine_duration')/3600,cloud_cover:at(c,'cloud_cover'),precip_probability:precipProb,precip_mm:precip,wind_kmh:wind,gust_kmh:gust,feels_like:feels,temp,precip_sum:at(d,'precipitation_sum'),soil_moisture:at(h,'soil_moisture_0_to_1cm',hourIndex),solar:at(h,'shortwave_radiation',hourIndex),daylight:at(d,'daylight_duration'),heat_index:at(c,'apparent_temperature'),pollen:num(pollenData.grass??pollenData.grass_pollen??pollenData.birch??pollenData.birch_pollen??pollenData.ragweed??pollenData.ragweed_pollen),wave_height:at(marine,'wave_height'),wind_wave_height:at(marine,'wind_wave_height'),swell_height:at(marine,'swell_wave_height'),swell_period:at(marine,'swell_wave_period')??at(marine,'wave_period'),sea_temp:at(marine,'sea_surface_temperature'),current_speed:at(marine,'ocean_current_velocity'),sea_level:at(marine,'sea_level_height_msl'),marine_wind_kmh:at(marine,'wind_speed_10m') ?? at(c,'wind_speed_10m'),marine_gust_kmh:at(marine,'wind_gusts_10m') ?? at(c,'wind_gusts_10m')};
};
export function calculateScores(weather, aqi, marine) {
 const x=raw(weather,aqi,marine), S=(v,lo,hi,inv=false)=>scale(v,lo,hi,inv), A=(...v)=>avg(v), C=(v,i,s)=>inverseComfort(v,i,s);
 const air=A(S(x.aqi,0,150,true),S(x.pm2_5,0,55,true),S(x.visibility,1000,10000));
 const humidityScore=C(x.humidity,45,8), pressureScore=C(x.pressure,1013,8), visScore=S(x.visibility,0,10000);
 const uvScore=S(x.uv,0,11,true), rainRisk=S((x.precip_probability??0)*.6+(x.precip_mm??0)*4,0,100,false);
 const windComfort=S(x.wind_kmh,0,70,true), gustRisk=S(x.gust_kmh,0,100), feelsScore=C(x.feels_like,22,3);
 const cloudScore=C(x.cloud_cover,40,10), seaSafety=A(S(x.wave_height,0,2,true),S(x.current_speed,0,1.2,true),S(x.sea_temp,16,29));
 const surf=A(S(x.swell_height,.3,2.5),S(x.swell_period,5,16),S(x.marine_wind_kmh,0,45,true));
 const waveDanger=A(S(x.wave_height,0,4),S(x.wind_wave_height,0,3),S(x.swell_height,0,3));
 const stormRisk=A(S(x.marine_wind_kmh,15,90),S(x.sea_level,0,1.5),S(marine?.hourly?.storm_surge?.[0],0,2));
 const scores={
 'Air Quality':air,
 'Breathability':A(humidityScore,C(x.dew_point,12,10),pressureScore,air),
 'Humidity Comfort':humidityScore,'Pressure Comfort':pressureScore,'Visibility Score':visScore,'UV Safety':uvScore,
 'Sunshine Score':A(S(x.sunshine_hours,0,12),S(x.cloud_cover,0,100,true)),
 'Rain Risk':rainRisk,
 'Thunder Risk':x.cloud_cover==null?null: A(S(x.cloud_cover,0,100),S(x.pressure,970,1030,true),S(x.precip_probability,0,100)),
 'Wind Comfort':windComfort,'Gust Risk':gustRisk,'Feels Like Score':feelsScore,
 'Sunrise/Sunset Score':A(S(x.daylight,8*3600,16*3600),S(x.solar,0,900)),
 'Pollen/Allergy':x.pollen==null?null:avg([S(x.pollen,0,100,true),S(x.wind_kmh,0,60,true),S(x.humidity,40,100,true)]),
 'Outdoor Activity':A(windComfort,rainRisk==null?null:11-rainRisk,air,uvScore),
 'Jogging Score':A(feelsScore,air,rainRisk==null?null:11-rainRisk,windComfort),
 'Heat Index Risk':x.heat_index==null?null:avg([S(x.heat_index,26,43),S(x.humidity,45,100)]),
 'Cloud Cover Score':cloudScore,
 'Flood Risk':x.precip_sum==null||x.soil_moisture==null?null:avg([S(x.precip_sum,0,100),S(x.soil_moisture,0.1,.6),S(x.precip_mm,0,25)]),
 'Swim Safety':(x.wave_height==null||x.current_speed==null)?null:avg([S(x.wave_height,0,2,true),S(x.current_speed,0,1.2,true),S(x.sea_temp,16,29)],2),'Surf Score':surf,
 'Boating Safety':(x.wave_height==null||x.marine_wind_kmh==null)?null:avg([S(x.wave_height,0,4,true),S(x.marine_wind_kmh,10,80,true),S(x.marine_gust_kmh,10,100,true),S(x.sea_level,0,1.5,true)],2),
 'Fishing Score':A(C(x.sea_temp,25,8),S(x.current_speed,0,1.2,true),C(x.pressure,1013,10),S(x.marine_wind_kmh,0,50,true)),
 'Diving Visibility':A(S(x.current_speed,0,1.2,true),S(x.swell_height,0,3,true),S(x.wave_height,0,3,true)),
 'Tide Safety':x.sea_level==null?null:S(Math.abs(x.sea_level),0,1.5,true),
 'Rip Current Risk':x.wave_height==null||x.swell_period==null?null:avg([S(x.wave_height,0,3),S(x.swell_period,4,14,true),S(x.marine_wind_kmh,0,60)]),
 'Wave Danger':waveDanger,'Water Temp Comfort':C(x.sea_temp,27,2),
 'Beach Walk Score':A(S(x.marine_wind_kmh,0,45,true),S(x.wave_height,0,3,true),uvScore,S(Math.abs(x.sea_level??NaN),0,1,true)),
 'Storm Surge Risk':stormRisk,
 };
 scores['Overall Comfort']=avg([scores['Air Quality'],scores['Feels Like Score'],scores['Rain Risk']==null?null:11-scores['Rain Risk'],scores['Wind Comfort'],scores['UV Safety'],scores['Visibility Score'],scores['Pressure Comfort']],4);
 scores['Overall Ocean Score']=avg([scores['Swim Safety'],scores['Boating Safety'],scores['Wave Danger']==null?null:11-scores['Wave Danger'],scores['Water Temp Comfort'],scores['Tide Safety'],scores['Rip Current Risk']==null?null:11-scores['Rip Current Risk']],4);
 return Object.fromEntries([...ENVIRONMENT_METRICS,...MARINE_METRICS].map(name=>[name,scores[name]??null]));
}
const adviceLevels = ['Very unfavourable readings; avoid relying on this metric for decisions.','High concern; reconsider plans and check official/local guidance.','Unfavourable conditions; use extra caution.','Below favourable; check the detailed forecast before deciding.','Mixed conditions; use judgement and seek local information.','Fair measured conditions, with important factors possibly unmeasured.','Generally favourable readings; conditions can change quickly.','Favourable readings for this metric; check current local conditions.','Very favourable measured conditions, not a guarantee.','Best range in the available data; never treat this as a safety guarantee.'];
export function adviceForScore(metric, score) { if(score==null)return 'Not enough reliable data to calculate this metric.'; const n=Math.max(1,Math.min(10,Math.round(score))); const risk=SCORE_DIRECTION[metric]==='risk'; return `${risk?`Risk level ${n}/10 (higher means more risk). `:`Score ${n}/10 (higher is more favourable). `}${adviceLevels[n-1]}`; }
export function getScoreBand(metric, score) { if(score==null)return 'Unavailable'; const risk=SCORE_DIRECTION[metric]==='risk'; if (risk) return score<=3?'Low risk':score<=5?'Moderate risk':score<=7?'Elevated risk':'High risk'; return score<=3?'Poor':score<=5?'Fair':score<=7?'Good':'Very good'; }
