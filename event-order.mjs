// Stable ordering: pinned first; newest dated events next; last-edited undated events next.
export function compareEvents(a,b){
 if(Boolean(a.pinned)!==Boolean(b.pinned))return a.pinned?-1:1;
 const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(String(x.eventDate||""))?x.eventDate:"";
 const da=date(a),db=date(b);
 if(da!==db)return da?db.localeCompare(da):1;
 const ua=String(a.updatedAt||""),ub=String(b.updatedAt||"");
 if(ua!==ub)return ub.localeCompare(ua);
 const oa=Number.isFinite(Number(a.order))?Number(a.order):999;
 const ob=Number.isFinite(Number(b.order))?Number(b.order):999;
 return oa-ob||String(a.title||"").localeCompare(String(b.title||""),"vi");
}
