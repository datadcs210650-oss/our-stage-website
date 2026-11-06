(() => {
"use strict";
const root=document.documentElement;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine=window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced;
root.classList.add("motion-enhanced");
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const hero=document.querySelector(".hero");
const experience=document.querySelector(".experience");
const manifesto=document.querySelector(".manifesto-section");
const culture=document.querySelector(".culture-section");

// Scroll reveals: additional editorial details, with reduced-motion fallback.
const revealSelectors=[".section-header",".section-summary",".about-quote",".manifesto-bottom",
 ".footer-head",".footer-links",".hero-bottom",".culture-heading>p:last-child",".show-note"];
const revealNodes=[...new Set(revealSelectors.flatMap(sel=>Array.from(document.querySelectorAll(sel))))];
if(!reduced && "IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target);}}
 },{threshold:.08,rootMargin:"0px 0px -28px 0px"});
 revealNodes.forEach(el=>{if(!el.classList.contains("reveal")){el.classList.add("motion-appear");observer.observe(el);}});
}else revealNodes.forEach(el=>el.classList.add("in-view"));

let scrollFrame=false;
function onScroll(){
 scrollFrame=false;
 const h=window.innerHeight;
 if(manifesto){
  const r=manifesto.getBoundingClientRect();
  if(r.top<h && r.bottom>0) manifesto.style.setProperty("--manifesto-scroll",clamp((h-r.top)/(h+r.height),0,1).toFixed(3));
 }
 if(culture && !reduced){
  const r=culture.getBoundingClientRect();
  if(r.top<h && r.bottom>0)culture.style.setProperty("--culture-y",(clamp((h-r.top)/(h+r.height),0,1)-.5)*-35+"px");
 }
}
window.addEventListener("scroll",()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(onScroll);}},{passive:true});
window.addEventListener("resize",()=>requestAnimationFrame(onScroll),{passive:true});
onScroll();

// The progress bars double as chapter navigation, usable with mouse and keyboard.
if(experience){
 const chapters=Array.from(experience.querySelectorAll(".experience-pagination span"));
 chapters.forEach((el,i)=>{
  el.setAttribute("role","button");el.setAttribute("tabindex","0");
  el.setAttribute("aria-label","Chuyển đến phần "+(i+1)+" của câu chuyện");
  const go=()=>{
   const range=Math.max(0,experience.offsetHeight-window.innerHeight);
   const top=window.scrollY+experience.getBoundingClientRect().top;
   window.scrollTo({top:top+(range*(i+.12)/Math.max(1,chapters.length)),behavior:reduced?"instant":"smooth"});
  };
  el.addEventListener("click",go);
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
 });
}

// Follow hovered navigation section without forcing a URL change.
const navLinks=Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
if("IntersectionObserver" in window && navLinks.length){
 const navMap=new Map(navLinks.map(link=>[link.getAttribute("href").slice(1),link]));
 const sections=Array.from(navMap.keys()).map(id=>document.getElementById(id)).filter(Boolean);
 const sectionObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
  if(!visible.length)return;
  navLinks.forEach(link=>link.removeAttribute("aria-current"));
  const link=navMap.get(visible[0].target.id);
  if(link)link.setAttribute("aria-current","location");
 },{rootMargin:"-24% 0px -55% 0px",threshold:[0,.1,.3,.6]});
 sections.forEach(section=>sectionObserver.observe(section));
}

if(!fine)return;
root.classList.add("has-fine-pointer");
// User's normal cursor stays enabled; these are only decorative lights.
const glow=document.createElement("div"),ring=document.createElement("div");
glow.className="osc-mouse-glow";ring.className="osc-mouse-ring";
glow.setAttribute("aria-hidden","true");ring.setAttribute("aria-hidden","true");
document.body.append(glow,ring);
let px=-100,py=-100,gx=-100,gy=-100,rx=-100,ry=-100,animating=false;
function animateCursor(){
 gx+=(px-gx)*.13;gy+=(py-gy)*.13;
 rx+=(px-rx)*.31;ry+=(py-ry)*.31;
 glow.style.left=gx+"px";glow.style.top=gy+"px";
 ring.style.left=rx+"px";ring.style.top=ry+"px";
 if(Math.abs(px-gx)+Math.abs(py-gy)>.35 || Math.abs(px-rx)+Math.abs(py-ry)>.35){
  requestAnimationFrame(animateCursor);
 } else animating=false;
}
function scheduleCursor(){if(!animating){animating=true;requestAnimationFrame(animateCursor);}}
window.addEventListener("pointermove",e=>{
 if(e.pointerType&&e.pointerType!=="mouse")return;
 px=e.clientX;py=e.clientY;
 if(gx<0){gx=px;gy=py;rx=px;ry=py;}
 scheduleCursor();
 const interactive=Boolean(e.target.closest("a,button,[role=button],.show-card"));
 ring.classList.toggle("is-interactive",interactive);
},{passive:true});
window.addEventListener("pointerdown",()=>ring.classList.add("is-pressed"),{passive:true});
window.addEventListener("pointerup",()=>ring.classList.remove("is-pressed"),{passive:true});
window.addEventListener("blur",()=>{ring.style.opacity="0";glow.style.opacity="0";});
window.addEventListener("focus",()=>{ring.style.opacity="";glow.style.opacity="";});

// Stage spotlight reacts to cursor: subtle enough for text legibility.
if(hero){
 const cue=document.createElement("span");cue.className="interaction-cue";
 cue.textContent="MOVE TO EXPLORE";cue.setAttribute("aria-hidden","true");hero.appendChild(cue);
 hero.addEventListener("pointermove",e=>{
  const r=hero.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width,0,1),y=clamp((e.clientY-r.top)/r.height,0,1);
  hero.style.setProperty("--hero-x",(x*100).toFixed(2)+"%");
  hero.style.setProperty("--hero-y",(y*100).toFixed(2)+"%");
  hero.style.setProperty("--parallax-x",((x-.5)*24).toFixed(1)+"px");
  hero.style.setProperty("--parallax-y",((y-.5)*18).toFixed(1)+"px");
 },{passive:true});
 hero.addEventListener("pointerleave",()=>{
  hero.style.setProperty("--hero-x","50%");hero.style.setProperty("--hero-y","45%");
  hero.style.setProperty("--parallax-x","0px");hero.style.setProperty("--parallax-y","0px");
 });
}

// Magnetic navigation, CTA buttons and brand.
document.querySelectorAll(".main-nav a,.brand,.text-link,.button,.footer-contact a").forEach(el=>{
 let frame=false,x=0,y=0;
 el.addEventListener("pointermove",e=>{
  const rect=el.getBoundingClientRect();x=((e.clientX-rect.left)/rect.width-.5)*10;
  y=((e.clientY-rect.top)/rect.height-.5)*7;
  if(!frame){frame=true;requestAnimationFrame(()=>{frame=false;el.style.setProperty("--mag-x",x.toFixed(1)+"px");el.style.setProperty("--mag-y",y.toFixed(1)+"px");});}
 },{passive:true});
 const reset=()=>{el.style.setProperty("--mag-x","0px");el.style.setProperty("--mag-y","0px");};
 el.addEventListener("pointerleave",reset);el.addEventListener("blur",reset);
});

// 3D event cards use CSS properties only; keep text crisp, avoid DOM reflow.
document.querySelectorAll(".show-card").forEach(card=>{
 const art=card.querySelector(".show-art");if(!art)return;
 let queued=false,lastX=0,lastY=0;
 card.addEventListener("pointermove",e=>{
  const r=art.getBoundingClientRect();
  lastX=clamp((e.clientX-r.left)/r.width,0,1);
  lastY=clamp((e.clientY-r.top)/r.height,0,1);
  if(!queued){queued=true;requestAnimationFrame(()=>{
   queued=false;
   card.style.setProperty("--card-x",(lastX*100).toFixed(2)+"%");
   card.style.setProperty("--card-y",(lastY*100).toFixed(2)+"%");
   card.style.setProperty("--tilt-x",((.5-lastY)*6).toFixed(2)+"deg");
   card.style.setProperty("--tilt-y",((lastX-.5)*7).toFixed(2)+"deg");
  });}
 },{passive:true});
 const reset=()=>{
  card.style.setProperty("--tilt-x","0deg");card.style.setProperty("--tilt-y","0deg");
  card.style.setProperty("--card-x","50%");card.style.setProperty("--card-y","50%");
 };
 card.addEventListener("pointerleave",reset);card.addEventListener("blur",reset,true);
});
})();