import { useEffect, useMemo, useState } from 'react';
import { ENVIRONMENT_METRICS, MARINE_METRICS, adviceForScore, getScoreBand, SCORE_DIRECTION } from './ScoreEngine.js';

export default function ScoreHub({ scores={}, onViewAnalytics=()=>{}, className='' }) {
 const [mode,setMode]=useState('environment'); const [slide,setSlide]=useState(0);
 const metrics=mode==='environment'?ENVIRONMENT_METRICS:MARINE_METRICS;
 const perSlide=4, pageCount=Math.ceil(metrics.length/perSlide);
 useEffect(()=>{setSlide(0);},[mode]);
 useEffect(()=>{const id=setInterval(()=>setSlide(s=>(s+1)%pageCount),10000);return()=>clearInterval(id);},[pageCount,mode]);
 const visible=useMemo(()=>metrics.slice(slide*perSlide,slide*perSlide+perSlide),[metrics,slide]);
 return <section className={`zh-score-hub ${className}`} aria-label="Weather scores">
  <div className="zh-score-head"><div><span className="zh-score-kicker">CONDITIONS AT A GLANCE</span><h2>Environment & Ocean</h2></div><button className="zh-score-analytics" onClick={()=>onViewAnalytics(mode)}>View analytics <span aria-hidden="true">↗</span></button></div>
  <div className="zh-score-toggle" role="tablist" aria-label="Score category"><button role="tab" aria-selected={mode==='environment'} className={mode==='environment'?'active':''} onClick={()=>setMode('environment')}>Environment <span>20</span></button><button role="tab" aria-selected={mode==='ocean'} className={mode==='ocean'?'active':''} onClick={()=>setMode('ocean')}>Ocean <span>12</span></button></div>
  <div className="zh-score-grid">{visible.map(name=>{const score=scores[name]??null;const risk=SCORE_DIRECTION[name]==='risk';return <article className="zh-score-card" key={name}><div className="zh-score-card-top"><span>{name}</span><span className={`zh-score-state ${risk?'risk':'good'}`}>{risk?'RISK':'SCORE'}</span></div><div className="zh-score-value">{score==null?'—':`${score}`}<small>/10</small></div><div className="zh-score-band">{getScoreBand(name,score)}</div><p>{adviceForScore(name,score)}</p></article>})}</div>
  <div className="zh-score-footer"><div className="zh-score-dots" aria-label={`Slide ${slide+1} of ${pageCount}`}>{Array.from({length:pageCount},(_,i)=><button key={i} aria-label={`Show slide ${i+1}`} aria-current={i===slide?'true':undefined} className={i===slide?'active':''} onClick={()=>setSlide(i)}/>)}</div><span>{slide+1} / {pageCount} · changes every 10 seconds</span></div>
  <p className="zh-score-disclaimer">Scores summarize available readings; missing data is left unavailable. They do not guarantee safety, especially for swimming, boating, currents, floods, or coastal hazards.</p>
 </section>
}
