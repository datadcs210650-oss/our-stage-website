(() => {
"use strict";
// Motion is purely decorative: no scroll hijacking, mouse tracking on touch, or mandatory animation.
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
const coarse=window.matchMedia("(pointer: coarse)");
const chapters=[...document.querySelectorAll(".editorial-chapter")];
const hero=document.querySelector(".hero");
const program=document.querySelector(".program-section");
const header=document.querySelector(".site-header");
const min=(x,a,b)=>Math.max(a,Math.min(b,x));
let onScreen=new Set(),frame=false;
if("IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>{
  for(const e of entries){
   if(e.isIntersecting)onScreen.add(e.target);else onScreen.delete(e.target);
   if(e.isIntersecting)e.target.classList.add("cinema-visible");
  }
 },{rootMargin:"140px 0px 140px 0px",threshold:0});
 chapters.forEach(el=>observer.observe(el));
}else{chapters.forEach(el=>{el.classList.add("cinema-visible");onScreen.add(el)})}
function update(){
 frame=false;
 const vh=window.innerHeight||1;
 if(header){
  const page=document.documentElement;
  const travel=Math.max(1,page.scrollHeight-vh);
  header.style.setProperty("--nav-progress",min(window.scrollY/travel,0,1).toFixed(3));
 }
 if(reduce.matches||coarse.matches)return;
 if(hero){
  const r=hero.getBoundingClientRect();
  if(r.bottom>0 && r.top<vh){
   const p=min(-r.top/Math.max(1,r.height),0,1);
   hero.style.setProperty("--hero-stage-shift",(-p*18).toFixed(1)+"px");
  }
 }
 if(program){
  const r=program.getBoundingClientRect();
  if(r.bottom>0&&r.top<vh){
   program.style.setProperty("--scene-scroll",(min((vh-r.top)/(vh+r.height),0,1)*80-40).toFixed(1)+"px");
  }
 }
 for(const section of onScreen){
  const r=section.getBoundingClientRect();
  const progress=min((vh-r.top)/(vh+r.height),0,1);
  section.style.setProperty("--section-progress",progress.toFixed(3));
 }
}
function schedule(){if(!frame){frame=true;requestAnimationFrame(update)}}
addEventListener("scroll",schedule,{passive:true});
addEventListener("resize",schedule,{passive:true});
reduce.addEventListener?.("change",schedule);
coarse.addEventListener?.("change",schedule);
schedule();
})();