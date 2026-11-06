export function renderPage(template,site,eventsInput){
const events=(Array.isArray(eventsInput)?eventsInput:[]).slice().sort((a,b)=>(a.order??999)-(b.order??999));
const escapeHTML = (value = "") => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeURL = (value = "") => /^(https:\/\/|\/media\/)/i.test(String(value || "")) ? String(value) : "";
const safeEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "")) ? String(value) : "";
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
  return '<article class="show-card reveal" tabindex="0"><div class="show-art show-art--' + accent + '">' +
  imageTag(cover,e.title,"show-photo") + '<span class="art-rim"></span><span class="art-orb"></span><span class="art-flare"></span><span class="art-watermark" aria-hidden="true">' + String(i+1).padStart(2,"0") + '</span></div>' +
  '<div class="show-details"><span class="micro-label">' + escapeHTML(e.category) + '</span><span class="show-index">' + String(i+1).padStart(2,"0") + ' / ' + String(events.length).padStart(2,"0") + '</span></div>' +
  '<h3>' + escapeHTML(e.title) + '</h3><p>' + escapeHTML(e.description) + '</p>' +
  (meta ? '<div class="event-meta">'+meta+'</div>' : '') + photos + details + '</article>';
}).join("\n");
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
 HERO_EYEBROW:escapeHTML(site.heroEyebrow),HERO_LINE1:escapeHTML(site.heroTitleLine1),HERO_LINE2:escapeHTML(site.heroTitleLine2),HERO_LINE3:escapeHTML(site.heroTitleLine3),HERO_DESCRIPTION:escapeHTML(site.heroDescription),
 HERO_IMAGE:imageTag(safeURL(site.heroImage),"Không gian sân khấu Our Stage","stage-photo"),
 ABOUT_EYEBROW:escapeHTML(site.aboutEyebrow),ABOUT_TITLE:escapeHTML(site.aboutTitle),ABOUT_DESCRIPTION:escapeHTML(site.aboutDescription),ABOUT_QUOTE:escapeHTML(site.aboutQuote),
 MISSION_TITLE:escapeHTML(site.missionTitle),MISSION_DESCRIPTION:escapeHTML(site.missionDescription),PROGRAM_TITLE:escapeHTML(site.programTitle),PROGRAM_DESCRIPTION:escapeHTML(site.programDescription),
 JOIN_TITLE:escapeHTML(site.joinTitle),JOIN_DESCRIPTION:escapeHTML(site.joinDescription),JOIN_LINK:join,
 CONTACT_LINKS:socials.length ? socials.join(" ") : '<p class="contact-wait">' + escapeHTML(site.contactNote) + '</p>',
 FOOTER_NOTE:escapeHTML(site.footerNote),EVENT_CARDS:cards
};
return template.replace(/\{\{([A-Z0-9_]+)\}\}/g,(_match,name)=>{
 if (!(name in values))throw new Error("Unknown template placeholder: "+name);
 return values[name];
});
}
