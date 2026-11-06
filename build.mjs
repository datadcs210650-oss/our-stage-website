import fs from "node:fs";
import path from "node:path";

const readJSON = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const site = readJSON("content/site.json");
const escapeHTML = (value = "") => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeURL = (value = "") => /^(https:\/\/|\/media\/)/i.test(String(value || "")) ? String(value) : "";
const safeEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "")) ? String(value) : "";
const files = fs.readdirSync("content/events").filter((f) => f.endsWith(".json"));
const events = files.map((f) => readJSON("content/events/" + f)).sort((a,b) => (a.order ?? 999) - (b.order ?? 999));
const imageTag = (url, alt, cls) => url ? '<img class="' + cls + '" src="' + escapeHTML(url) + '" alt="' + escapeHTML(alt) + '" loading="lazy" decoding="async">' : "";
const cards = events.map((e,i) => {
  const accent = ["red","gold","violet","blue"].includes(e.accent) ? e.accent : "red";
  return '<article class="show-card reveal" tabindex="0"><div class="show-art show-art--' + accent + '">' +
  imageTag(safeURL(e.image),e.title,"show-photo") + '<span class="art-rim"></span><span class="art-orb"></span><span class="art-flare"></span><span class="art-watermark" aria-hidden="true">' + String(i+1).padStart(2,"0") + '</span></div>' +
  '<div class="show-details"><span class="micro-label">' + escapeHTML(e.category) + '</span><span class="show-index">' + String(i+1).padStart(2,"0") + ' / ' + String(events.length).padStart(2,"0") + '</span></div>' +
  '<h3>' + escapeHTML(e.title) + '</h3><p>' + escapeHTML(e.description) + '</p></article>';
}).join("\n");
const socials = [];
if (safeURL(site.facebookUrl)) socials.push('<a href="' + escapeHTML(site.facebookUrl) + '" target="_blank" rel="noopener noreferrer">Facebook ↗</a>');
if (safeEmail(site.contactEmail)) socials.push('<a href="mailto:' + escapeHTML(site.contactEmail) + '">' + escapeHTML(site.contactEmail) + ' ↗</a>');
const join = safeURL(site.recruitmentUrl) ? '<a class="button button--light" href="' + escapeHTML(site.recruitmentUrl) + '" rel="noopener noreferrer" target="_blank">Đăng ký tham gia ↗</a>' : '<a class="button button--light" href="#lien-he">Kết nối với OSC ↗</a>';
const values = {
 SITE_TITLE:escapeHTML(site.siteTitle), SITE_DESCRIPTION:escapeHTML(site.siteDescription),
 HERO_EYEBROW:escapeHTML(site.heroEyebrow),HERO_LINE1:escapeHTML(site.heroTitleLine1),HERO_LINE2:escapeHTML(site.heroTitleLine2),HERO_LINE3:escapeHTML(site.heroTitleLine3),HERO_DESCRIPTION:escapeHTML(site.heroDescription),
 HERO_IMAGE:imageTag(safeURL(site.heroImage),"Không gian sân khấu Our Stage","stage-photo"),
 ABOUT_EYEBROW:escapeHTML(site.aboutEyebrow),ABOUT_TITLE:escapeHTML(site.aboutTitle),ABOUT_DESCRIPTION:escapeHTML(site.aboutDescription),ABOUT_QUOTE:escapeHTML(site.aboutQuote),
 MISSION_TITLE:escapeHTML(site.missionTitle),MISSION_DESCRIPTION:escapeHTML(site.missionDescription),PROGRAM_TITLE:escapeHTML(site.programTitle),PROGRAM_DESCRIPTION:escapeHTML(site.programDescription),
 JOIN_TITLE:escapeHTML(site.joinTitle),JOIN_DESCRIPTION:escapeHTML(site.joinDescription),JOIN_LINK:join,
 CONTACT_LINKS:socials.length ? socials.join(" ") : '<p class="contact-wait">' + escapeHTML(site.contactNote) + '</p>',
 FOOTER_NOTE:escapeHTML(site.footerNote),EVENT_CARDS:cards
};
fs.rmSync("dist",{recursive:true,force:true});
fs.mkdirSync("dist",{recursive:true});
fs.cpSync("public","dist",{recursive:true});
const template=fs.readFileSync("src/index.html","utf8");
const html=template.replace(/\{\{([A-Z0-9_]+)\}\}/g,(_match,name)=>{
 if (!(name in values)) throw new Error("Unknown template placeholder: " + name);
 return values[name];
});
fs.writeFileSync("dist/index.html",html,"utf8");
console.log("Built Our Stage website with " + events.length + " event cards");
