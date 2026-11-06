import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {compareEvents} from "../event-order.mjs";
test("pinned events always precede unpinned ones",()=>{
 const events=[{title:"Yesterday",eventDate:"2026-11-05",order:1},{title:"Pinned old",eventDate:"2025-02-05",pinned:true,order:5},{title:"Today",eventDate:"2026-11-06",order:3}];
 assert.deepEqual(events.sort(compareEvents).map(x=>x.title),["Pinned old","Today","Yesterday"]);
});
test("dated events sort newest first, undated events last",()=>{
 const list=[{title:"No date",order:1},{title:"Old",eventDate:"2026-01-03"},{title:"New",eventDate:"2026-11-06"},{title:"Other",order:2}];
 assert.deepEqual(list.sort(compareEvents).map(x=>x.title),["New","Old","No date","Other"]);
});
test("newly edited undated event takes priority over older undated item",()=>{
 const x=[{title:"Old",updatedAt:"2026-10-01T12:00:00.000Z"},{title:"New",updatedAt:"2026-11-06T12:00:00.000Z"}];
 assert.deepEqual(x.sort(compareEvents).map(e=>e.title),["New","Old"]);
});
test("template includes dynamic favicon, cinematic assets and editable chapters",()=>{
 const index=fs.readFileSync(new URL("../src/index.html",import.meta.url),"utf8");
 const build=fs.readFileSync(new URL("../build.mjs",import.meta.url),"utf8");
 assert.match(index,/href="\{\{FAVICON_LINK\}\}"/);
 assert.match(index,/\{\{CUSTOM_SECTIONS\}\}/);
 assert.match(index,/\{\{EXPERIENCE_1A\}\}/);
 assert.match(index,/\/assets\/cinematic\.css/);
 assert.match(index,/\/assets\/cinematic\.js/);
 assert.match(build,/\.sort\(compareEvents\)/);
 assert.match(build,/pin-label/);
 assert.match(build,/escapeHTML\(sec\.title/);
 assert.match(build,/escapeHTML\(sec\.body/);
});
