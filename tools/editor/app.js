/**
 * tools/editor/app.js — Interactive SVG Editor (WYSIWYG)
 */
import { T, estimateTextWidth, sizeContainer } from "../../scripts/tokens.js";
const P = {
  dreamlight:{s:["#080B18","#1B2140"],i:"#fff",m:"#B8C2D9",a:"#8BE9FF",a2:"#8b7cf6",sh:"#8b7cf6",g:"#8BE9FF",d:1},
  editorial:{s:["#F6F1E8","#F6F1E8"],i:"#111",m:"#555",a:"#5649c2",a2:"#7c6ee0",sh:"#64748b",g:"#a78bfa",d:0},
  glass:{s:["#111827","#030712"],i:"#fff",m:"#94A3B8",a:"#7DD3FC",a2:"#a78bfa",sh:"#1e293b",g:"#7DD3FC",d:1},
  mono:{s:["#1a1a2e","#16213e"],i:"#e6e6e6",m:"#a0a0b0",a:"#0ea5e9",a2:"#0ea5e9",sh:"#000",g:"#0ea5e9",d:1},
  earth:{s:["#fff8ec","#ffedd5"],i:"#4a3826",m:"#63503b",a:"#f59e0b",a2:"#fb923c",sh:"#92400e",g:"#fbbf24",d:0},
  brand:{s:["#eef4ff","#f6efff"],i:"#2b2f55",m:"#5a608f",a:"#8b7cf6",a2:"#38bdf8",sh:"#7c74e8",g:"#8b7cf6",d:0},
};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fst=cjk=>cjk?T.fontStack.cjkSans:T.fontStack.latinSans;
const gD=(id,st,dir="v")=>{const a=dir==="v"?'x1="0" y1="0" x2="0" y2="1"':'x1="0" y1="0" x2="1" y2="1"';const ss=st.map((s,i)=>{const o=s.o??(i/(st.length-1));let r='<stop offset="'+o+'" stop-color="'+s.c+'"';if(s.p!=null)r+=' stop-opacity="'+s.p+'"';return r+"/>";}).join("");return '<linearGradient id="'+id+'" '+a+'>'+ss+'</linearGradient>';};
const rD=(id,c,o=0.4)=>`<radialGradient id="${id}" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const sD=(id,c,o=0.2,dy=10,b=14)=>`<filter id="${id}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${b}" flood-color="${c}" flood-opacity="${o}"/></filter>`;

function banner(cfg) {
  const p=P[cfg.palette||"brand"],c=T.canvas.banner,f1=T.font.title,f2=T.font.body;
  const gap=Math.round(f1*T.titleGapRatio),m=T.space(4);
  const t=cfg.title||"Title",sub=cfg.subtitle||"",cjk=/[\u4e00-\u9fff]/.test(t);
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" role="img" aria-labelledby="bnT">\n<title id="bnT">${esc(t)}</title>\n<defs>\n${gD("bg",[{c:p.s[0]},{c:p.s[1]}])}\n${rD("halo",p.g,p.d?0.35:0.28)}\n</defs>\n\n`;
  x+=`<rect width="${c.w}" height="${c.h}" fill="url(#bg)"/>\n<ellipse cx="${Math.round(c.w*0.2)}" cy="${Math.round(c.h*0.1)}" rx="400" ry="220" fill="url(#halo)"/>\n<ellipse cx="${Math.round(c.w*0.85)}" cy="${Math.round(c.h*0.9)}" rx="400" ry="200" fill="url(#halo)" opacity="0.6"/>\n\n`;
  const ls=T.space(5),lx=m,ly=Math.round((c.h-ls)/2),tx=lx+ls+T.space(3),ty=Math.round(c.h/2-gap/2+f1*0.8);
  x+=`<g data-role="logo"><rect x="${lx}" y="${ly}" width="${ls}" height="${ls}" rx="${T.radius.md}" fill="${p.d?'#1e293b':'#fff'}" stroke="${p.a}" stroke-opacity="0.4" stroke-width="${T.stroke.thin}"/><circle cx="${lx+ls/2}" cy="${ly+ls/2}" r="${ls/4}" fill="${p.a}" opacity="0.8"/></g>\n\n`;
  x+=`<text x="${tx}" y="${ty}" font-family="${fst(cjk)}" font-size="${f1}" font-weight="600" fill="${p.i}">${esc(t)}</text>\n`;
  if(sub)x+=`<text x="${tx}" y="${ty+gap}" font-family="${fst(cjk)}" font-size="${f2}" fill="${p.m}">${esc(sub)}</text>\n`;
  if(cfg.cta){const cf=T.font.caption,cb=sizeContainer(cfg.cta,cf,{paddingH:T.space(2),paddingV:T.space(1),minHeight:T.space(4)}),cx2=c.w-m-cb.width,cy2=Math.round((c.h-cb.height)/2);
    x+=`\n<defs>${gD("cta",[{c:p.d?"#1e293b":"#4f46e5"},{c:p.d?"#0f172a":"#3730a3"}],"h")}</defs>\n<rect x="${cx2}" y="${cy2}" width="${cb.width}" height="${cb.height}" rx="${T.radius.sm}" fill="url(#cta)"/>\n<text x="${cx2+Math.round(cb.width/2)}" y="${cy2+Math.round(cb.height/2)+Math.round(cf*0.35)}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${cf}" font-weight="600" fill="#fff">${esc(cfg.cta)}</text>\n`;}
  return x+`</svg>\n`;
}

function card(cfg) {
  const p=P[cfg.palette||"brand"],c=T.canvas.card,m=T.space(3),f1=T.font.heading,f2=T.font.caption;
  const gap=Math.round(f1*T.titleGapRatio),t=cfg.title||"Card",sub=cfg.subtitle||"",cjk=/[\u4e00-\u9fff]/.test(t);
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" role="img" aria-labelledby="cdT">\n<title id="cdT">${esc(t)}</title>\n<defs>\n${gD("bg",[{c:p.s[0]},{c:p.s[1]}])}\n${gD("card",[{c:p.d?'#1e293b':'#fff'},{c:p.d?'#0f172a':'#f7f5ff'}])}\n${rD("halo",p.g,0.25)}\n${sD("lift",p.sh,0.2)}\n</defs>\n\n`;
  x+=`<rect width="${c.w}" height="${c.h}" fill="url(#bg)"/>\n<rect x="${m}" y="${m}" width="${c.w-m*2}" height="${c.h-m*2}" rx="${T.radius.lg}" fill="url(#card)" filter="url(#lift)"/>\n`;
  const cx=Math.round(c.w/2);x+=`<ellipse cx="${cx}" cy="${Math.round(c.h*0.35)}" rx="${Math.round((c.w-m*2)*0.45)}" ry="100" fill="url(#halo)"/>\n`;
  const iy=Math.round(c.h*0.38);
  x+=`<g transform="translate(${cx} ${iy})" fill="none" stroke="${p.i}" stroke-width="${T.stroke.medium}" stroke-linecap="round" stroke-linejoin="round"><circle r="32" stroke="${p.a}" stroke-opacity="0.5" stroke-width="${T.stroke.thin}" stroke-dasharray="4 8"/><circle r="8" fill="${p.a}" stroke="none"/></g>\n`;
  const ty=c.h-m-T.space(4)-f2-gap;
  x+=`<text x="${cx}" y="${ty}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${f1}" font-weight="600" fill="${p.i}">${esc(t)}</text>\n`;
  if(sub)x+=`<text x="${cx}" y="${ty+gap}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${f2}" fill="${p.m}">${esc(sub)}</text>\n`;
  return x+`</svg>\n`;
}

function gallery(cfg) {
  const p=P[cfg.palette||"brand"],cols=cfg.cols||3,rows=cfg.rows||2,items=cfg.items||[];
  const cjk=items.some(i=> /[\u4e00-\u9fff]/.test(i.title||""));
  const m=T.space(3),gt=T.space(2),hH=T.space(6),cw=T.canvas.card.w,ch=T.canvas.card.h;
  const W=m*2+cw*cols+gt*(cols-1),H=m+hH+ch*rows+gt*(rows-1)+m;
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="galT">\n<title id="galT">${esc(cfg.title||"Gallery")}</title>\n<defs>\n${gD("bg",[{c:p.s[0]},{c:p.s[1]}])}\n${gD("card",[{c:p.d?'#1e293b':'#fff'},{c:p.d?'#0f172a':'#f7f5ff'}])}\n${rD("halo",p.g,0.22)}\n${sD("lift",p.sh,0.18)}\n</defs>\n\n`;
  x+=`<rect width="${W}" height="${H}" fill="url(#bg)"/>\n`;
  const hf=T.font.heading;x+=`<text x="${m}" y="${m+hf}" font-family="${fst(cjk)}" font-size="${hf}" font-weight="600" fill="${p.i}">${esc(cfg.title||"Gallery")}</text>\n`;
  if(cfg.subtitle)x+=`<text x="${m}" y="${m+hf+Math.round(hf*T.titleGapRatio)-hf+T.font.caption}" font-family="${fst(cjk)}" font-size="${T.font.caption}" fill="${p.m}">${esc(cfg.subtitle)}</text>\n`;
  const f1=T.font.body,f2=T.font.caption,cg=Math.round(f1*T.titleGapRatio);
  for(let r=0;r<rows;r++)for(let cc=0;cc<cols;cc++){const idx=r*cols+cc,it=items[idx]||{title:"",subtitle:""};
    const px=m+cc*(cw+gt),py=m+hH+r*(ch+gt),pcx=px+Math.round(cw/2);
    x+=`\n<g data-motif="${esc(it.title||'card-'+idx)}" data-motif-message="${esc(it.subtitle||"")}">\n<rect x="${px}" y="${py}" width="${cw}" height="${ch}" rx="${T.radius.lg}" fill="url(#card)" filter="url(#lift)"/>\n`;
    x+=`<ellipse cx="${pcx}" cy="${py+Math.round(ch*0.35)}" rx="${Math.round(cw*0.42)}" ry="90" fill="url(#halo)"/>\n`;
    const iy=py+Math.round(ch*0.38);
    x+=`<g transform="translate(${pcx} ${iy})" fill="none" stroke="${p.i}" stroke-width="${T.stroke.medium}" stroke-linecap="round" stroke-linejoin="round"><circle r="28" stroke="${p.a}" stroke-opacity="0.5" stroke-width="${T.stroke.thin}" stroke-dasharray="4 8"/><circle r="7" fill="${p.a}" stroke="none"/></g>\n`;
    const ty=py+ch-T.space(3)-f2-cg;
    x+=`<text x="${pcx}" y="${ty}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${f1}" font-weight="600" fill="${p.i}">${esc(it.title||"")}</text>\n`;
    if(it.subtitle)x+=`<text x="${pcx}" y="${ty+cg}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${f2}" fill="${p.m}">${esc(it.subtitle)}</text>\n`;
    x+=`</g>\n`;}
  return x+`</svg>\n`;
}

function poster(cfg) {
  const p=P[cfg.palette||"editorial"],c=T.canvas.poster,m=T.space(3);
  const t=cfg.title||"Poster",sub=cfg.subtitle||"",cjk=/[\u4e00-\u9fff]/.test(t);
  const df=T.font.display,dg=Math.round(df*T.titleGapRatio);
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" role="img" aria-labelledby="poT">\n<title id="poT">${esc(t)}</title>\n<defs>\n${gD("bg",[{c:p.s[0]},{c:p.s[1]}])}\n${rD("halo",p.g,0.18)}\n</defs>\n\n`;
  x+=`<rect width="${c.w}" height="${c.h}" fill="url(#bg)"/>\n<ellipse cx="${c.w-m}" cy="${Math.round(c.h*0.15)}" rx="340" ry="260" fill="url(#halo)"/>\n`;
  const ty=Math.round(c.h*0.3);
  x+=`<text x="${m}" y="${ty}" font-family="${cjk?T.fontStack.cjkSerif:T.fontStack.latinSerif}" font-size="${df}" font-weight="700" fill="${p.i}">${esc(t)}</text>\n`;
  if(sub)x+=`<text x="${m}" y="${ty+dg}" font-family="${cjk?T.fontStack.cjkSerif:T.fontStack.latinSerif}" font-size="${T.font.title}" fill="${p.i}">${esc(sub)}</text>\n`;
  const ly=ty+dg+Math.round(T.font.title*T.titleGapRatio);
  x+=`<line x1="${m}" y1="${ly}" x2="${c.w-m}" y2="${ly}" stroke="${p.i}" stroke-width="${T.stroke.medium}"/>\n`;
  if(cfg.footer)x+=`<text x="${m}" y="${ly+Math.round(T.font.heading*T.titleGapRatio)}" font-family="${fst(cjk)}" font-size="${T.font.heading}" fill="${p.m}">${esc(cfg.footer)}</text>\n`;
  return x+`</svg>\n`;
}

function generate(cfg) {
  switch(cfg.layout) {
    case "banner": return banner(cfg);
    case "card": return card(cfg);
    case "gallery": return gallery(cfg);
    case "poster": return poster(cfg);
    default: throw new Error("Unknown layout: "+cfg.layout);
  }
}

// ---- UI State ----
let state = { layout:"banner", palette:"brand", title:"知了学习 · 知识组织与核验助手", subtitle:"把章节连成关系网，让每次复习都有据可查", cta:"开始核验", cols:3, rows:2 };
const $ = id => document.getElementById(id);
const canvasSvg = $("canvasSvg"), statusEl = $("status"), sizeEl = $("sizeIndicator"), jsonEl = $("jsonConfig");

function buildCfg() {
  const cfg = { layout:state.layout, palette:state.palette, title:state.title, subtitle:state.subtitle, cta:state.cta };
  if (state.layout === "gallery") { cfg.cols=+state.cols; cfg.rows=+state.rows; cfg.items=[]; const n=cfg.cols*cfg.rows;
    for (let i=0;i<n;i++) cfg.items.push({title:`卡片 ${i+1}`, subtitle:"描述文字"}); }
  if (state.layout === "poster") { cfg.footer="Footer text"; }
  return cfg;
}

function render() {
  try {
    const cfg = buildCfg();
    const svg = generate(cfg);
    canvasSvg.innerHTML = svg;
    const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (m) sizeEl.textContent = `${m[1]} × ${m[2]}`;
    statusEl.textContent = "已更新"; statusEl.style.color = "var(--success)";
    setTimeout(() => { statusEl.textContent="就绪"; statusEl.style.color="var(--text-muted)"; }, 1500);
    jsonEl.value = JSON.stringify(cfg, null, 2);
  } catch(e) { statusEl.textContent = "错误: "+e.message; statusEl.style.color="var(--danger)"; }
}

$("layoutGroup").addEventListener("click", e => {
  const btn = e.target.closest("[data-layout]"); if (!btn) return;
  document.querySelectorAll("#layoutGroup .seg-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); state.layout = btn.dataset.layout;
  $("galleryControls").style.display = state.layout==="gallery" ? "block" : "none";
  render();
});

$("paletteGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-palette]"); if (!btn) return;
  document.querySelectorAll("#paletteGrid .palette-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); state.palette = btn.dataset.palette; render();
});

["titleInput","subtitleInput","ctaInput"].forEach(id => {
  const key = id.replace("Input","");
  $(id).addEventListener("input", e => { state[key]=e.target.value; render(); });
});

$("colsInput").addEventListener("input", e => { state.cols=Math.max(1,Math.min(5,+e.target.value)); render(); });
$("rowsInput").addEventListener("input", e => { state.rows=Math.max(1,Math.min(4,+e.target.value)); render(); });

$("applyJson").addEventListener("click", () => {
  try { const cfg = JSON.parse(jsonEl.value); Object.assign(state, cfg); render();
    document.querySelectorAll("#layoutGroup .seg-btn").forEach(b=>b.classList.toggle("active",b.dataset.layout===state.layout));
    document.querySelectorAll("#paletteGrid .palette-btn").forEach(b=>b.classList.toggle("active",b.dataset.palette===state.palette));
    $("galleryControls").style.display = state.layout==="gallery" ? "block" : "none";
  } catch(e) { statusEl.textContent="JSON 解析错误"; statusEl.style.color="var(--danger)"; }
});

$("exportSvg").addEventListener("click", () => {
  const svg = canvasSvg.querySelector("svg"); if (!svg) return;
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], {type:"image/svg+xml"});
  const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="export.svg"; a.click();
  statusEl.textContent="SVG 已导出"; statusEl.style.color="var(--success)";
});

$("exportPng").addEventListener("click", () => {
  const svg = canvasSvg.querySelector("svg"); if (!svg) return;
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image(); const blob = new Blob([data],{type:"image/svg+xml"});
  img.onload = () => { const cv=document.createElement("canvas"); cv.width=img.width*2; cv.height=img.height*2;
    const ctx=cv.getContext("2d"); ctx.drawImage(img,0,0,cv.width,cv.height);
    cv.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="export.png";a.click();}); };
  img.src = URL.createObjectURL(blob);
  statusEl.textContent="PNG 已导出"; statusEl.style.color="var(--success)";
});

$("copySvg").addEventListener("click", () => {
  const svg = canvasSvg.querySelector("svg"); if (!svg) return;
  const data = new XMLSerializer().serializeToString(svg);
  navigator.clipboard.writeText(data).then(()=>{
    statusEl.textContent="已复制到剪贴板"; statusEl.style.color="var(--success)";
  }).catch(()=>{ statusEl.textContent="复制失败"; statusEl.style.color="var(--danger)"; });
});

render();
