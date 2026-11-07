import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const root=new URL("../",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),"utf8");
test("board section is included in the public template and navigation",()=>{
 const page=read("src/index.html");
 assert.match(page,/\{\{BOARD_SECTION\}\}/);
 assert.match(page,/\{\{BOARD_NAV\}\}/);
});
test("board has editable directors with names, positions and honest empty portraits",()=>{
 const s=JSON.parse(read("content/site.json"));
 assert.equal(s.boardEnabled,true);
 assert.ok(s.boardMembers.length>=4);
 assert.ok(s.boardMembers.every(x=>x.name&&x.role));
 assert.ok(s.boardMembers.every(x=>x.image===""||x.image.startsWith("/media/")||x.image.startsWith("https://")));
 assert.ok(s.boardTitle.includes("BAN CHỦ NHIỆM"));
});
test("board markup escapes names and descriptions and uses only declared portraits",()=>{
 const build=read("build.mjs");
 assert.match(build,/escapeHTML\(name\)/);
 assert.match(build,/escapeHTML\(role\)/);
 assert.match(build,/safeURL\(p\.image/);
 assert.match(build,/board-avatar-fallback/);
 assert.match(build,/id="ban-chu-nhiem"/);
 assert.match(build,/BOARD_SECTION:boardSection/);
});
test("leadership motion is progressive and respects reduced motion",()=>{
 const js=read("public/assets/cinematic.js");
 const css=read("public/assets/cinematic.css");
 assert.match(js,/data-board-reveal/);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(css,/\.board-grid/);
 assert.match(css,/\.board-card\.board-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
