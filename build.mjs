import { compareEvents } from "./event-order.mjs";
import fs from "node:fs";
import path from "node:path";

const readJSON = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const site = readJSON("content/site.json");
const escapeHTML = (value = "") => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeURL = (value = "") => /^(https:\/\/|\/media\/)/i.test(String(value || "")) ? String(value) : "";
const safeEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "")) ? String(value) : "";
const files = fs.readdirSync("content/events").filter((f) => f.endsWith(".json"));
const events = files.map((f) => readJSON("content/events/" + f)).sort(compareEvents);
const imageTag = (url, alt, cls) => url ? '<img class="' + cls + '" src="' + escapeHTML(url) + '" alt="' + escapeHTML(alt) + '" loading="lazy" decoding="async">' : "";
const cards = events.map((e,i) => {
  const accent = ["red","gold","violet","blue"].includes(e.accent) ? e.accent : "red";
  const cover = safeURL(e.image);
  const gallery = (Array.isArray(e.gallery) ? e.gallery : []).map(safeURL).filter(Boolean).slice(0,12);
  const photos = gallery.length
    ? '<div class="event-gallery" role="group" aria-label="Album ảnh '+escapeHTML(e.title)+'">'+gallery.map((src,j) =>
       '<button class="event-gallery-thumb" type="button" data-osc-image="'+escapeHTML(src)+'" data-osc-alt="'+escapeHTML(e.title)+' – ảnh '+(j+1)+'" aria-label="Xem ảnh '+(j+1)+' của '+escapeHTML(e.title)+'">'+imageTag(src,e.title+" – ảnh "+(j+1),"event-gallery-image")+'</button>'
       ).join("")+'</div>'
    : '';
  const meta = [e.eventDate, e.location].filter(Boolean).map(escapeHTML).join(" · ");
  const details = safeURL(e.detailsUrl) ? '<a class="event-detail-link" href="'+escapeHTML(safeURL(e.detailsUrl))+'" rel="noopener noreferrer" target="_blank">Xem thông tin sự kiện ↗</a>' : '';
  return '<article class="show-card reveal' + (e.pinned && i===0 ? " show-card--featured" : "") + '" tabindex="0"><div class="show-art show-art--' + accent + '">' + (e.pinned ? '<span class="pin-label">✦ ĐƯỢC GHIM</span>' : "") +
  imageTag(cover,e.title,"show-photo") + '<span class="art-rim"></span><span class="art-orb"></span><span class="art-flare"></span><span class="art-watermark" aria-hidden="true">' + String(i+1).padStart(2,"0") + '</span></div>' +
  '<div class="show-details"><span class="micro-label">' + escapeHTML(e.category) + '</span><span class="show-index">' + String(i+1).padStart(2,"0") + ' / ' + String(events.length).padStart(2,"0") + '</span></div>' +
  '<h3>' + escapeHTML(e.title) + '</h3><p>' + escapeHTML(e.description) + '</p>' +
  (meta ? '<div class="event-meta">'+meta+'</div>' : '') + photos + details + '</article>';
}).join("\n");
const customSections=(Array.isArray(site.customSections)?site.customSections:[]).slice(0,6);
const customHTML=customSections.map((sec,i)=>{
  const alternate=sec.theme==="light"?"editorial-chapter--light":"editorial-chapter--dark";
  const picture=safeURL(sec.image);
  const cta=safeURL(sec.buttonUrl)&&String(sec.buttonLabel||"").trim()
    ?'<a class="editorial-chapter__link" href="'+escapeHTML(safeURL(sec.buttonUrl))+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(sec.buttonLabel)+' <span aria-hidden="true">↗</span></a>':"";
  return '<section class="editorial-chapter '+alternate+'" id="'+(i===0?"noi-dung-moi":"bo-sung-"+(i+1))+'"><div class="editorial-chapter__ambient" aria-hidden="true"></div><div class="wrap editorial-chapter__inner"><div class="editorial-chapter__copy"><p class="eyebrow accent">'+escapeHTML(sec.eyebrow||"CÂU CHUYỆN OUR STAGE")+'</p><h2 class="display-heading editorial-chapter__title">'+escapeHTML(sec.title||"")+'</h2><p class="editorial-chapter__body">'+escapeHTML(sec.body||"")+'</p>'+cta+'</div><div class="editorial-chapter__visual">'+(picture?imageTag(picture,sec.title||"Ảnh hoạt động OSC","editorial-chapter__photo"):'<span class="editorial-chapter__sigil" aria-hidden="true">✳</span>')+'</div></div></section>';
}).join("\n");
const customNav=customSections.length?'<a href="#noi-dung-moi">'+escapeHTML(site.navExtraLabel||"Khám phá thêm")+'</a>':"";
const favicon=safeURL(site.logoImage)||"/assets/favicon.svg";
const faviconType=/\.webp(?:$|\?)/i.test(favicon)?"image/webp":/\.png(?:$|\?)/i.test(favicon)?"image/png":"image/svg+xml";
const faviconVersion=encodeURIComponent(String(site.logoImage||"fallback")+"-"+String(site.siteTitle||"")).slice(0,120);
const faviconHref=favicon+(favicon.includes("?")?"&":"?")+"v="+faviconVersion;
const socials = [];
if (safeURL(site.facebookUrl)) socials.push('<a href="' + escapeHTML(site.facebookUrl) + '" target="_blank" rel="noopener noreferrer">Facebook ↗</a>');
if (safeEmail(site.contactEmail)) socials.push('<a href="mailto:' + escapeHTML(site.contactEmail) + '">' + escapeHTML(site.contactEmail) + ' ↗</a>');
const join = safeURL(site.recruitmentUrl) ? '<a class="button button--light" href="' + escapeHTML(site.recruitmentUrl) + '" rel="noopener noreferrer" target="_blank">Đăng ký tham gia ↗</a>' : '<a class="button button--light" href="#lien-he">Kết nối với OSC ↗</a>';
const logoURL = safeURL(site.logoImage);
const logoMarkup = logoURL
  ? '<img class="brand-logo" src="'+escapeHTML(logoURL)+'" alt="Logo Our Stage" width="42" height="42" decoding="async">'
  : '<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>';
const values = {
 SITE_TITLE:escapeHTML(site.siteTitle), SITE_DESCRIPTION:escapeHTML(site.siteDescription), BRAND_MARK:logoMarkup,
 FAVICON_LINK:escapeHTML(faviconHref),FAVICON_TYPE:escapeHTML(faviconType),CUSTOM_SECTIONS:customHTML,CUSTOM_NAV:customNav,
 NAV_INTRO:escapeHTML(site.navIntroLabel||""),
 NAV_EVENTS:escapeHTML(site.navEventsLabel||""),
 NAV_PEOPLE:escapeHTML(site.navPeopleLabel||""),
 NAV_JOIN:escapeHTML(site.navJoinLabel||""),
 HERO_EXPLORE_TEXT:escapeHTML(site.heroExploreText||""),
 HERO_SERIAL:escapeHTML(site.heroSerial||""),
 SCROLL_HINT:escapeHTML(site.scrollHint||""),
 PROGRAM_FOOTER_NOTE:escapeHTML(site.programFooterNote||""),
 CULTURE_CENTER:escapeHTML(site.cultureCenter||""),
 CULTURE_LABEL_ONE:escapeHTML(site.cultureLabelOne||""),
 CULTURE_LABEL_TWO:escapeHTML(site.cultureLabelTwo||""),
 CULTURE_LABEL_THREE:escapeHTML(site.cultureLabelThree||""),
 EXPERIENCE_RIGHT_LABEL:escapeHTML(site.experienceRightLabel||""),
 ABOUT_SIDE_LABEL:escapeHTML(site.aboutSideLabel||""),
 TOTAL_CHAPTERS:String(5+customSections.length).padStart(2,"0"),
 BRAND_SUBTITLE:escapeHTML(site.brandSubtitle||""),
 HEADER_EDITION:escapeHTML(site.headerEdition||""),
 MARQUEE_TEXT:escapeHTML(site.marqueeText||""),
 EXPERIENCE_KICKER:escapeHTML(site.experienceKicker||""),
 EXPERIENCE_GIANT_WORD:escapeHTML(site.experienceGiantWord||""),
 EXPERIENCE_FOOTER:escapeHTML(site.experienceFooter||""),
 EXPERIENCE_1A:escapeHTML(site.experienceAct1Top||""),
 EXPERIENCE_1B:escapeHTML(site.experienceAct1Bottom||""),
 EXPERIENCE_2A:escapeHTML(site.experienceAct2Top||""),
 EXPERIENCE_2B:escapeHTML(site.experienceAct2Bottom||""),
 EXPERIENCE_3A:escapeHTML(site.experienceAct3Top||""),
 EXPERIENCE_3B:escapeHTML(site.experienceAct3Bottom||""),
 MISSION_EYEBROW:escapeHTML(site.missionEyebrow||""),
 PROGRAM_EYEBROW:escapeHTML(site.programEyebrow||""),
 CULTURE_EYEBROW:escapeHTML(site.cultureEyebrow||""),
 CULTURE_1:escapeHTML(site.cultureTitleLine1||""),
 CULTURE_2:escapeHTML(site.cultureTitleLine2||""),
 CULTURE_DESCRIPTION:escapeHTML(site.cultureDescription||""),
 JOIN_EYEBROW:escapeHTML(site.joinEyebrow||""),
 FOOTER_SLOGAN_1:escapeHTML(site.footerSloganLine1||""),
 FOOTER_SLOGAN_2:escapeHTML(site.footerSloganLine2||""),
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
