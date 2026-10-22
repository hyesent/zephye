// Zephye local astronomy utilities. Dependency-free; suitable for UI and
// planning, not navigation or professional eclipse circumstances.
const DEG = Math.PI / 180
const RAD = 180 / Math.PI
const DAY = 86400000
const norm = (n, m = 360) => ((n % m) + m) % m
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
export const julianDay = date => date.getTime() / DAY + 2440587.5
const fromJulianDay = jd => new Date((jd - 2440587.5) * DAY)

function equatorialToHorizontal(raDeg, decDeg, date, latDeg, lonDeg) {
  const jd = julianDay(date), t = (jd - 2451545) / 36525
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + .000387933 * t * t - t * t * t / 38710000)
  const ha = (norm(gmst + lonDeg - raDeg + 180) - 180) * DEG
  const lat = latDeg * DEG, dec = decDeg * DEG
  const altitude = Math.asin(clamp(Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(ha),-1,1))*RAD
  const azimuth = norm(Math.atan2(-Math.sin(ha), Math.tan(dec)*Math.cos(lat)-Math.sin(lat)*Math.cos(dec))*RAD+180)
  return { altitude, azimuth }
}

export function getSunPosition(date = new Date(), latitude = 0, longitude = 0) {
  const jd = julianDay(date), t = (jd - 2451545) / 36525
  const l0 = norm(280.46646 + t*(36000.76983 + .0003032*t))
  const m = norm(357.52911 + t*(35999.05029 - .0001537*t))*DEG
  const e = .016708634 - t*(.000042037 + .0000001267*t)
  const c = Math.sin(m)*(1.914602-t*(.004817+.000014*t))+Math.sin(2*m)*(.019993-.000101*t)+Math.sin(3*m)*.000289
  const omega = (125.04-1934.136*t)*DEG
  const apparentLong = (l0+c-.00569-.00478*Math.sin(omega))*DEG
  const meanObliq = 23+(26+(21.448-t*(46.815+t*(.00059-t*.001813)))/60)/60
  const obliq = (meanObliq+.00256*Math.cos(omega))*DEG
  const ra = norm(Math.atan2(Math.cos(obliq)*Math.sin(apparentLong),Math.cos(apparentLong))*RAD)
  const dec = Math.asin(Math.sin(obliq)*Math.sin(apparentLong))*RAD
  return equatorialToHorizontal(ra,dec,date,latitude,longitude)
}

function getMoonEquatorial(date) {
  const d = julianDay(date)-2451543.5
  const N=norm(125.1228-.0529538083*d), i=5.1454, w=norm(318.0634+.1643573223*d), a=60.2666, e=.0549, M=norm(115.3654+13.0649929509*d)
  const Mr=M*DEG; let E=M+RAD*e*Math.sin(Mr)*(1+e*Math.cos(Mr))
  for(let j=0;j<5;j++) E-=(E-RAD*e*Math.sin(E*DEG)-M)/(1-e*Math.cos(E*DEG))
  const xv=a*(Math.cos(E*DEG)-e), yv=a*Math.sqrt(1-e*e)*Math.sin(E*DEG)
  const v=Math.atan2(yv,xv)*RAD, r=Math.hypot(xv,yv), Nr=N*DEG, ir=i*DEG, wr=(w+v)*DEG
  const xh=r*(Math.cos(Nr)*Math.cos(wr)-Math.sin(Nr)*Math.sin(wr)*Math.cos(ir))
  const yh=r*(Math.sin(Nr)*Math.cos(wr)+Math.cos(Nr)*Math.sin(wr)*Math.cos(ir))
  const zh=r*Math.sin(wr)*Math.sin(ir), lon=norm(Math.atan2(yh,xh)*RAD), lat=Math.atan2(zh,Math.hypot(xh,yh))
  const ob=(23.4393-3.563e-7*d)*DEG, lr=lon*DEG
  const ra=norm(Math.atan2(Math.sin(lr)*Math.cos(ob)-Math.tan(lat)*Math.sin(ob),Math.cos(lr))*RAD)
  const dec=Math.asin(Math.sin(lat)*Math.cos(ob)+Math.cos(lat)*Math.sin(ob)*Math.sin(lr))*RAD
  return { ra, dec, eclipticLongitude: lon, eclipticLatitude: lat*RAD }
}
export function getMoonPosition(date = new Date(), latitude = 0, longitude = 0) {
  const eq=getMoonEquatorial(date), horizontal=equatorialToHorizontal(eq.ra,eq.dec,date,latitude,longitude)
  const sun=getSunPosition(date,latitude,longitude)
  const elongation=Math.acos(clamp(Math.sin(sun.altitude*DEG)*Math.sin(horizontal.altitude*DEG)+Math.cos(sun.altitude*DEG)*Math.cos(horizontal.altitude*DEG)*Math.cos((sun.azimuth-horizontal.azimuth)*DEG),-1,1))
  const phaseAngle=norm(eq.eclipticLongitude-(280.466+ .9856474*(julianDay(date)-2451543.5)))
  const illumination=(1-Math.cos(elongation))/2
  return {...horizontal, illumination, waxing: phaseAngle < 180, phaseAngle, eclipticLongitude:eq.eclipticLongitude, eclipticLatitude:eq.eclipticLatitude}
}

export function getLunarPhase(date = new Date()) {
  const moon=getMoonPosition(date,0,0), ageDays=norm(moon.phaseAngle)/360*29.530588853
  const names=['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent']
  const index=Math.round(norm(moon.phaseAngle)/45)%8
  return { name:names[index], ageDays, illumination:moon.illumination, waxing:moon.waxing, phaseAngle:moon.phaseAngle }
}

// Solar-event hour angle. Returns null when the Sun does not cross the requested altitude.
function solarEvent(date, latitude, longitude, altitudeDeg) {
  const noon=new Date(date); noon.setUTCHours(12,0,0,0)
  const p=getSunPosition(noon,latitude,longitude)
  // Correct solar noon using the computed azimuth/altitude and solve altitude crossings.
  let best=null, bestDiff=Infinity
  const start=new Date(noon.getTime()-18*3600000), end=new Date(noon.getTime()+18*3600000)
  for(let t=start.getTime();t<=end.getTime();t+=60000){ const d=new Date(t), a=getSunPosition(d,latitude,longitude).altitude-altitudeDeg
    if(best!==null && a*best.value<=0){
      const diff=Math.abs(t-noon.getTime()); if(diff<bestDiff){bestDiff=diff; const lo=t-60000, hi=t; let l=lo,h=hi,lv=getSunPosition(new Date(l),latitude,longitude).altitude-altitudeDeg
        for(let k=0;k<18;k++){const mid=(l+h)/2,mv=getSunPosition(new Date(mid),latitude,longitude).altitude-altitudeDeg;if(lv*mv<=0)h=mid;else{l=mid;lv=mv}}
        const crossing=(l+h)/2; if(!solarEvent._seen) solarEvent._seen=[]; solarEvent._seen.push(crossing)
      }
    }
    best={value:a};
  }
  const events=(solarEvent._seen||[]).filter(x=>x>=start.getTime()&&x<=end.getTime()).sort((a,b)=>a-b); solarEvent._seen=[]
  if(!events.length) return null
  const rising=events.find(x=>getSunPosition(new Date(x+60000),latitude,longitude).altitude>getSunPosition(new Date(x-60000),latitude,longitude).altitude)
  const setting=events.find(x=>x!==rising)
  return { sunrise:rising==null?null:new Date(rising), sunset:setting==null?null:new Date(setting), events:events.map(x=>new Date(x)) }
}
export function getSolarEvents(date = new Date(), latitude = 0, longitude = 0) {
  const day=new Date(date); day.setUTCHours(0,0,0,0)
  const find=alt=>solarEvent(day,latitude,longitude,alt)
  const standard=find(-0.833), civil=find(-6), nautical=find(-12), astronomical=find(-18)
  return { sunrise:standard?.sunrise||null, sunset:standard?.sunset||null,
    civilDawn:civil?.sunrise||null,civilDusk:civil?.sunset||null,
    nauticalDawn:nautical?.sunrise||null,nauticalDusk:nautical?.sunset||null,
    astronomicalDawn:astronomical?.sunrise||null,astronomicalDusk:astronomical?.sunset||null,
    daylightMinutes:standard?.sunrise&&standard?.sunset?(standard.sunset-standard.sunrise)/60000:null }
}

export function getSkyPath(body='sun', date=new Date(), latitude=0, longitude=0, stepMinutes=15) {
  const start=new Date(date); start.setHours(0,0,0,0)
  const points=[]
  for(let m=0;m<1440;m+=Math.max(1,stepMinutes)){const at=new Date(start.getTime()+m*60000),p=body==='moon'?getMoonPosition(at,latitude,longitude):getSunPosition(at,latitude,longitude);points.push({time:at,minuteOfDay:m,...p,visible:p.altitude>0})}
  return points
}

// Rise/set crossings use the same approximate lunar orbit as the sky renderer.
export function getMoonEvents(date=new Date(),latitude=0,longitude=0,stepMinutes=10) {
  const start=new Date(date);start.setHours(0,0,0,0);const end=new Date(start.getTime()+DAY);let prev=getMoonPosition(start,latitude,longitude),rise=null,set=null
  for(let t=start.getTime()+stepMinutes*60000;t<=end.getTime();t+=stepMinutes*60000){const cur=getMoonPosition(new Date(t),latitude,longitude)
    if((prev.altitude<=0&&cur.altitude>0)||(prev.altitude>=0&&cur.altitude<0)){let lo=t-stepMinutes*60000,hi=t;const rising=cur.altitude>prev.altitude
      for(let i=0;i<16;i++){const mid=(lo+hi)/2,a=getMoonPosition(new Date(mid),latitude,longitude).altitude;if((a>0)===rising)hi=mid;else lo=mid}
      if(rising&&rise===null)rise=new Date((lo+hi)/2);if(!rising&&set===null)set=new Date((lo+hi)/2)
    } prev=cur
  }
  return {moonrise:rise,moonset:set, note:'Approximate times from a low-order lunar orbit; verify before observational use.'}
}

// Approximate phase dates around the current lunation. Event times are estimates.
export function getNextLunarPhases(date=new Date()) {
  const synodic=29.530588853, knownNew=Date.UTC(2000,0,6,18,14), age=((date.getTime()-knownNew)/DAY%synodic+synodic)%synodic
  const phases=[['New Moon',0],['First Quarter',synodic/4],['Full Moon',synodic/2],['Last Quarter',synodic*3/4]]
  return phases.map(([name,targetAge])=>{let delta=targetAge-age;if(delta<=0)delta+=synodic;return{name,date:new Date(date.getTime()+delta*DAY),approximate:true}}).sort((a,b)=>a.date-b.date)
}

export function skyPoint(position,width=1000,height=1000){const az=position.azimuth*DEG,x=width*(.5+.49*Math.sin(az)),y=430-clamp(position.altitude,-6,90)*4;return{x:clamp(x,35,width-35),y:clamp(y,45,height*.58)}}

// Screening-only eclipse candidates: useful to flag dates for further checking,
// not a substitute for Besselian elements or local circumstance calculations.
export function getEclipseCandidates(fromDate=new Date(), months=12) {
  const phases=getNextLunarPhases(fromDate), candidates=[]
  // Sample every half-synodic month; evaluate the Moon's ecliptic latitude near
  // syzygy. An actual eclipse requires more detailed geometry than this screen.
  const synodic=29.530588853, knownNew=Date.UTC(2000,0,6,18,14)
  let k=Math.floor((fromDate.getTime()-knownNew)/(synodic*DAY))-1
  const end=fromDate.getTime()+months*30.436875*DAY
  for(;knownNew+k*synodic*DAY<end;k++){
    const jd=(knownNew+k*synodic*DAY)/DAY+2440587.5, date=fromJulianDay(jd)
    if(date<fromDate) continue
    const lunar=getMoonPosition(date,0,0), phase=getLunarPhase(date)
    const isNew=phase.illumination<0.08, isFull=phase.illumination>0.92
    if((isNew||isFull)&&Math.abs(lunar.eclipticLatitude)<1.8){
      candidates.push({date,type:isNew?'Possible solar eclipse':'Possible lunar eclipse',
        confidence:'screening estimate',eclipticLatitude:lunar.eclipticLatitude,
        note:'Candidate only. Exact eclipse type, contact times, magnitude and local visibility require a dedicated eclipse ephemeris.'})
    }
  }
  return candidates
}
