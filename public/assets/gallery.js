(() => {
  "use strict";
  const buttons = document.querySelectorAll("[data-osc-image]");
  if (!buttons.length || !("HTMLDialogElement" in window)) return;
  const dialog=document.createElement("dialog");
  dialog.className="osc-lightbox";
  dialog.setAttribute("aria-label","Xem ảnh sự kiện Our Stage");
  const picture=document.createElement("img");
  picture.className="osc-lightbox-media";
  const caption=document.createElement("p");
  caption.className="osc-lightbox-caption";
  const close=document.createElement("button");
  close.className="osc-lightbox-close";
  close.type="button";close.textContent="×";close.setAttribute("aria-label","Đóng ảnh");
  dialog.append(picture,caption,close);
  document.body.appendChild(dialog);
  close.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",(event)=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener("close",()=>{picture.removeAttribute("src");});
  buttons.forEach(button=>button.addEventListener("click",()=>{
    const source=button.dataset.oscImage||"";
    if (!/^(https:\/\/|\/media\/)/i.test(source)) return;
    picture.src=source;
    picture.alt=button.dataset.oscAlt||"Ảnh hoạt động Our Stage";
    caption.textContent=picture.alt;
    dialog.showModal();
    close.focus();
  }));
})();