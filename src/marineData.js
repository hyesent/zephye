// Only variables documented by Open-Meteo's Marine Weather API.
export const MARINE_VARIABLES = [
  'wave_height','wave_direction','wave_period','wave_peak_period',
  'wind_wave_height','wind_wave_direction','wind_wave_period','wind_wave_peak_period',
  'swell_wave_height','swell_wave_direction','swell_wave_period','swell_wave_peak_period',
  'secondary_swell_wave_height','secondary_swell_wave_direction','secondary_swell_wave_period',
  'tertiary_swell_wave_height','tertiary_swell_wave_direction','tertiary_swell_wave_period',
  'sea_surface_temperature','ocean_current_velocity','ocean_current_direction',
  'sea_level_height_msl','invert_barometer_height'
];
export const MARINE_DAILY_VARIABLES = [
  'wave_height_max','wave_direction_dominant','wave_period_max',
  'wind_wave_height_max','wind_wave_direction_dominant','wind_wave_period_max','wind_wave_peak_period_max',
  'swell_wave_height_max','swell_wave_direction_dominant','swell_wave_period_max','swell_wave_peak_period_max'
];
const hasMarineValues = data => Array.isArray(data?.hourly?.time) && data.hourly.time.length > 0 && Array.isArray(data?.hourly?.wave_height) && data.hourly.wave_height.some(v => v != null);
const distanceKm = (a,b) => { const r=Math.PI/180, dLat=(b.lat-a.lat)*r, dLon=(b.lon-a.lon)*r; const q=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2; return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q)); };
// Retry only nearby grid candidates. A successful proxy is explicitly identified and never called an exact local reading.
export async function fetchMarineWithFallback(lat, lon, { signal, fetchImpl=fetch } = {}) {
 const origin={lat:Number(lat),lon:Number(lon)};
 const offsets=[[0,0],[0,-.05],[0,.05],[-.05,0],[.05,0],[0,-.1],[0,.1],[-.1,0],[.1,0],[-.05,-.05],[-.05,.05],[.05,-.05],[.05,.05]];
 let lastError;
 for (let i=0;i<offsets.length;i++) {
  const [dLat,dLon]=offsets[i], point={lat:origin.lat+dLat,lon:origin.lon+dLon};
  if(point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) continue;
  const params=new URLSearchParams({latitude:String(point.lat),longitude:String(point.lon),hourly:MARINE_VARIABLES.join(','),daily:MARINE_DAILY_VARIABLES.join(','),timezone:'auto',forecast_days:'7',wind_speed_unit:'ms',cell_selection:'sea'});
  try { const response=await fetchImpl(`https://marine-api.open-meteo.com/v1/marine?${params}`,{signal}); if(!response.ok) throw new Error(`Marine service returned ${response.status}`); const data=await response.json(); if(!hasMarineValues(data)) { lastError=new Error('No wave-height data for this grid cell.'); continue; } const distance=distanceKm(origin,point); return {...data,_zephyeGrid:{requested:origin,used:point,distanceKm:Math.round(distance*10)/10,isProxy:distance>1,attempt:i+1}}; }
  catch(error) { if(error?.name==='AbortError') throw error; lastError=error; }
 }
 throw lastError || new Error('No nearby marine grid with wave-height data was found.');
}
