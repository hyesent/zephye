import { useMemo, useState } from 'react';
import { MARINE_REGIONS, flattenMarinePresets } from './data/marinePresets.js';

export default function MarinePresetPicker({ onSelect, selectedLocation }) {
 const [open,setOpen]=useState(false); const [regionId,setRegionId]=useState(MARINE_REGIONS[0]?.id||''); const [query,setQuery]=useState('');
 const region=MARINE_REGIONS.find(r=>r.id===regionId)||MARINE_REGIONS[0];
 const locations=useMemo(()=>flattenMarinePresets(MARINE_REGIONS).filter(p=>(!regionId||p.id.startsWith(`${regionId}:`))&&p.name.toLowerCase().includes(query.toLowerCase())),[regionId,query]);
 return <section className="zh-preset-picker"><div className="zh-preset-heading"><div><span>COASTAL PRESETS</span><h3>Choose a marine location</h3><p>Choose a supplied coastal point; the marine provider may use a nearby sea-grid cell.</p></div><button onClick={()=>setOpen(v=>!v)}>{open?'Close':'Browse locations'}</button></div>
 {open&&<div className="zh-preset-browser"><div className="zh-preset-regions">{MARINE_REGIONS.map(r=><button key={r.id} className={regionId===r.id?'active':''} onClick={()=>setRegionId(r.id)}>{r.name}</button>)}</div>{region&&<div className="zh-preset-about"><strong>About this region</strong><p>{region.about}</p></div>}<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search coastal locations" aria-label="Search coastal locations"/><div className="zh-preset-locations">{locations.map(p=><button key={p.id} className={selectedLocation?.lat===p.lat&&selectedLocation?.lon===p.lon?'active':''} onClick={()=>{onSelect?.({...p,country_code:regionId==='nigeria'?'NG':undefined});setOpen(false);setQuery('')}}>{p.name}</button>)}</div></div>}
 </section>
}
