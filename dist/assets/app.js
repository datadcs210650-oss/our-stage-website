(() => {
 const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const header=document.querySelector(".site-header");
 const meter=document.querySelector(".scroll-meter");
 const hero=document.querySelector(".hero");
 const scene=document.querySelector(".hero-scene");
 const experience=document.querySelector(".experience");
 const slides=Array.from(document.querySelectorAll("[data-experience]"));
 const bullets=Array.from(document.querySelectorAll(".experience-pagination span"));
 const toggle=document.querySelector("#menu-toggle");
 const nav=document.querySelector("#main-nav");
 const year=document.querySelector("#year");
 if(year) year.textContent=new Date().getFullYear();
 const close=()=>{if(!nav||!toggle)return;nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");document.body.classList.remove("nav-open");};
 if(toggle&&nav){
   toggle.addEventListener("click",()=>{const open=!nav.classList.contains("is-open");nav.classList.toggle("is-open",open);toggle.setAttribute("aria-expanded",String(open));document.body.classList.toggle("nav-open",open);});
   nav.querySelectorAll("a").forEach((a)=>a.addEventListener("click",close));
   document.addEventListener("keydown",(e)=>{if(e.key==="Escape")close();});
 }
 const observer="IntersectionObserver" in window? new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");observer.unobserve(e.target);}})},{threshold:.1,rootMargin:"0px 0px -24px 0px"}):null;
 document.querySelectorAll(".reveal").forEach(el=>observer?observer.observe(el):el.classList.add("is-visible"));
 if(reduced){document.documentElement.classList.add("reduce-motion");document.querySelectorAll(".reveal").forEach(el=>el.classList.add("is-visible"));}
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 let queued=false;
 const update=()=>{
   queued=false;
   const y=window.scrollY;
   const scrollable=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
   if(meter)meter.style.transform="scaleX("+clamp(y/scrollable,0,1)+")";
   if(header)header.classList.toggle("is-scrolled",y>35);
   if(!reduced&&scene&&hero){
     const hp=clamp(y/Math.max(1,hero.offsetHeight),0,1);
     scene.style.transform="scale("+(1+hp*.16)+") translateY("+(hp*22)+"px)";
   }
   if(experience){
     const rect=experience.getBoundingClientRect();
     if(rect.top<window.innerHeight&&rect.bottom>0){
       const progress=clamp(-rect.top/Math.max(1,experience.offsetHeight-window.innerHeight),0,1);
       const index=clamp(Math.floor(progress*3),0,2);
       slides.forEach((s,i)=>s.classList.toggle("is-current",i===index));
       bullets.forEach((b,i)=>b.classList.toggle("is-current",i===index));
       experience.style.setProperty("--act-progress",String(progress));
     }
   }
 };
 window.addEventListener("scroll",()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});
 window.addEventListener("resize",()=>requestAnimationFrame(update),{passive:true});
 update();
})();