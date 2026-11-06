import {renderPage} from "./site-renderer.mjs";
const key="osc:site:snapshot:v1";
const enc=new TextEncoder();
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
function hex(bytes){return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("")}
async function sha(data){return hex(await crypto.subtle.digest("SHA-1",enc.encode(JSON.stringify(data)+Date.now()+crypto.randomUUID())))}
async function authorized(req,text,secret){
 const stamp=req.headers.get("X-OSC-Timestamp")||"",sig=req.headers.get("X-OSC-Signature")||"";
 if(!secret||!/^\d{13}$/.test(stamp)||!/^[0-9a-f]{64}$/i.test(sig)||Math.abs(Date.now()-Number(stamp))>120000)return false;
 const k=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 return crypto.subtle.verify("HMAC",k,Uint8Array.from(sig.match(/../g),x=>parseInt(x,16)),enc.encode(stamp+"\n"+text));
}
async function privateWrite(req,env){
 if(!env.OSC_CONTENT)return json({ok:false,error:"Missing storage"},503);
 const text=await req.text();
 if(text.length>3300000)return json({ok:false,error:"Request too large"},413);
 if(!await authorized(req,text,env.OSC_CMS_SECRET))return json({ok:false,error:"Publisher not authorized"},403);
 let b;try{b=JSON.parse(text)}catch{return json({ok:false,error:"Invalid JSON"},400)}
 if(b.action==="check")return json({ok:true,canPublish:true});
 if(b.action==="upload"){
  if(!/^\d{13}-[a-f0-9]{16}\.webp$/.test(b.filename||"")||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b.base64||"")||b.base64.length>3000000)return json({ok:false,error:"Invalid image"},400);
  let bin;try{bin=atob(b.base64)}catch{return json({ok:false,error:"Invalid base64"},400)}
  if(bin.length>2200000||bin.length<100||bin.slice(0,4)!=="RIFF"||bin.slice(8,12)!=="WEBP")return json({ok:false,error:"Invalid WebP"},400);
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  await env.OSC_CONTENT.put("media:"+b.filename,bytes);
  return json({ok:true,url:"/media/"+b.filename,size:bytes.length});
 }
 if(b.action!=="save"&&b.action!=="delete")return json({ok:false,error:"Action unavailable"},400);
 const snapshot=await env.OSC_CONTENT.get(key,{type:"json"});
 if(!snapshot?.site?.sha||!Array.isArray(snapshot.events))return json({ok:false,error:"Site not initialized"},503);
 const isSite=b.scope==="site",slug=String(b.slug||"");
 if(!isSite&&(b.scope!=="event"||!/^[a-z0-9][a-z0-9-]{0,70}$/.test(slug)))return json({ok:false,error:"Invalid scope"},400);
 const previous=isSite?snapshot.site:snapshot.events.find(x=>x.slug===slug);
 if(String(previous?.sha||"")!==String(b.sha||""))return json({ok:false,error:"Nội dung đã được người khác chỉnh sửa. Hãy tải lại.",code:"osc/site-conflict"},409);
 if(b.action==="delete"){
  if(isSite||!previous)return json({ok:false,error:"Invalid deletion"},400);
  snapshot.events=snapshot.events.filter(x=>x.slug!==slug);
 }else{
  if(!b.data||Array.isArray(b.data)||typeof b.data!=="object"||JSON.stringify(b.data).length>35000)return json({ok:false,error:"Invalid content"},400);
  const revision=await sha(b.data);
  if(isSite)snapshot.site={sha:revision,data:b.data};
  else if(previous){previous.sha=revision;previous.data=b.data}
  else if(snapshot.events.length<75)snapshot.events.push({slug,sha:revision,data:b.data});
  else return json({ok:false,error:"Event count limit"},400);
 }
 snapshot.updatedAt=new Date().toISOString();
 await env.OSC_CONTENT.put(key,JSON.stringify(snapshot));
 return json({ok:true,sha:isSite?snapshot.site.sha:snapshot.events.find(x=>x.slug===slug)?.sha||"",deploying:false});
}
export default {
 async fetch(req,env){
  const url=new URL(req.url);
  if(url.pathname==="/__osc_cms/private"){
   if(req.method!=="POST")return json({ok:false,error:"Method not allowed"},405);
   try{return await privateWrite(req,env)}catch(e){console.error("CMS write failed",String(e));return json({ok:false,error:"CMS storage failure"},500)}
  }
  if(url.pathname==="/__osc_cms/state"){
   const state=await env.OSC_CONTENT?.get(key,{type:"json"});
   return state?json({ok:true,...state}):json({ok:false,error:"No published state"},503);
  }
  if(url.pathname==="/_osc_template.html")return new Response("Not found",{status:404});
  if(url.pathname.startsWith("/media/")){
   const name=url.pathname.slice(7);
   if(/^\d{13}-[a-f0-9]{16}\.webp$/.test(name)){
    const data=await env.OSC_CONTENT?.get("media:"+name,{type:"arrayBuffer"});
    if(data)return new Response(data,{headers:{"Content-Type":"image/webp","Cache-Control":"public,max-age=31536000,immutable","X-Content-Type-Options":"nosniff"}});
   }
  }
  if(req.method==="GET"&&(url.pathname==="/"||url.pathname==="/index.html")){
   try{
    const current=await env.OSC_CONTENT?.get(key,{type:"json"});
    if(current?.site?.data&&Array.isArray(current.events)){
     const asset=await env.ASSETS.fetch(new Request(new URL("/_osc_template.html",url)));
     if(asset.ok){
      const markup=renderPage(await asset.text(),current.site.data,current.events.map(x=>x.data));
      return new Response(markup,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","X-Frame-Options":"DENY"}});
     }
    }
   }catch(e){console.error("Website render fallback",String(e))}
  }
  return env.ASSETS.fetch(req);
 }
};