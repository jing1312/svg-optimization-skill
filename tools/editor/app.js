/**
 * tools/editor/app.js — Interactive SVG Editor (WYSIWYG)
 */
import { T, estimateTextWidth, sizeContainer } from "../../scripts/tokens.js";
import { MOTIFS, MOTIF_NAMES } from "../../scripts/motifs.js";
const P = {
  dreamlight:{s:["#080B18","#1B2140"],i:"#fff",m:"#B8C2D9",a:"#8BE9FF",a2:"#8b7cf6",sh:"#8b7cf6",g:"#8BE9FF",d:1},
  editorial:{s:["#F6F1E8","#EDE6D6"],i:"#111",m:"#555",a:"#5649c2",a2:"#7c6ee0",sh:"#64748b",g:"#a78bfa",d:0},
  glass:{s:["#111827","#030712"],i:"#fff",m:"#94A3B8",a:"#7DD3FC",a2:"#a78bfa",sh:"#1e293b",g:"#7DD3FC",d:1},
  mono:{s:["#1a1a2e","#16213e"],i:"#e6e6e6",m:"#a0a0b0",a:"#0ea5e9",a2:"#0ea5e9",sh:"#000",g:"#0ea5e9",d:1},
  earth:{s:["#fff8ec","#ffedd5"],i:"#4a3826",m:"#63503b",a:"#f59e0b",a2:"#fb923c",sh:"#92400e",g:"#fbbf24",d:0},
  brand:{s:["#eef4ff","#f6efff"],i:"#2b2f55",m:"#5a608f",a:"#8b7cf6",a2:"#38bdf8",sh:"#7c74e8",g:"#8b7cf6",d:0},
};
const CARD_ACCENTS=[
  {a:"#8b7cf6",a2:"#38bdf8"},{a:"#38bdf8",a2:"#8b7cf6"},{a:"#f472b6",a2:"#8b7cf6"},
  {a:"#34d399",a2:"#38bdf8"},{a:"#fbbf24",a2:"#f472b6"},{a:"#a78bfa",a2:"#34d399"},
  {a:"#60a5fa",a2:"#a78bfa"},{a:"#fb923c",a2:"#34d399"},
];
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fst=cjk=>cjk?T.fontStack.cjkSans:T.fontStack.latinSans;
const gD=(id,st,dir="v")=>{const a=dir==="v"?'x1="0" y1="0" x2="0" y2="1"':'x1="0" y1="0" x2="1" y2="1"';const ss=st.map((s,i)=>{const o=s.o??(i/(st.length-1));let r='<stop offset="'+o+'" stop-color="'+s.c+'"';if(s.p!=null)r+=' stop-opacity="'+s.p+'"';return r+"/>";}).join("");return '<linearGradient id="'+id+'" '+a+'>'+ss+'</linearGradient>';};
const rD=(id,c,o=0.4)=>`<radialGradient id="${id}" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const sD=(id,c,o=0.2,dy=10,b=14)=>`<filter id="${id}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${b}" flood-color="${c}" flood-opacity="${o}"/></filter>`;
const stk=T.stroke.medium;

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
  const p=P[cfg.palette||"brand"];
  const c={w:520,h:380},m=T.space(3);
  const t=cfg.title||"功能卡片",sub=cfg.subtitle||"描述文字",cjk=/[\u4e00-\u9fff]/.test(t);
  const motifIdx=cfg.motif?MOTIF_NAMES.indexOf(cfg.motif):0;
  const motifFn=MOTIFS[Math.max(0,Math.min(MOTIFS.length-1,motifIdx))]||MOTIFS[0];
  const cardBg=p.d?'#1e293b':'#fff',headerH=160;
  const tag=cfg.tag||"核心功能",stat=cfg.stat||"2.4k",statLabel=cfg.statLabel||"使用次数";
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" role="img" aria-labelledby="cdT">\n<title id="cdT">${esc(t)}</title>\n<defs>\n${gD("bg",[{c:p.s[0]},{c:p.s[1]}])}\n${gD("cardG",[{c:cardBg},{c:p.d?'#0f172a':'#f7f5ff'}])}\n${gD("hdr",[{c:p.a},{c:p.a2||p.a}],"h")}\n${rD("halo",p.g,0.3)}\n${sD("lift",p.sh,0.22)}\n</defs>\n\n`;
  x+=`<rect width="${c.w}" height="${c.h}" fill="url(#bg)"/>\n`;
  x+=`<rect x="${m}" y="${m}" width="${c.w-m*2}" height="${c.h-m*2}" rx="${T.radius.lg}" fill="url(#cardG)" filter="url(#lift)"/>\n`;
  x+=`<rect x="${m+6}" y="${m+6}" width="${c.w-m*2-12}" height="${c.h-m*2-12}" rx="${T.radius.lg-6}" fill="none" stroke="${p.a}" stroke-opacity="0.15" stroke-width="${T.stroke.thin}"/>\n`;
  const hdrX=m,hdrY=m,hdrW=c.w-m*2;
  x+=`<defs><clipPath id="clip"><rect x="${hdrX}" y="${hdrY}" width="${hdrW}" height="${headerH}" rx="${T.radius.lg}"/></clipPath></defs>\n`;
  x+=`<g clip-path="url(#clip)"><rect x="${hdrX}" y="${hdrY}" width="${hdrW}" height="${headerH}" fill="url(#hdr)"/>\n`;
  x+=`<ellipse cx="${Math.round(c.w*0.7)}" cy="${hdrY+20}" rx="180" ry="120" fill="url(#halo)"/>\n`;
  x+=`<circle cx="${Math.round(c.w*0.3)}" cy="${hdrY+headerH-10}" r="80" fill="#fff" fill-opacity="${p.d?0.04:0.08}"/>\n</g>\n`;
  const mcx=Math.round(c.w/2),mcy=hdrY+Math.round(headerH/2);
  x+=motifFn(mcx,mcy,p,stk)+`\n`;
  const contentY=hdrY+headerH+T.space(3);
  const tagW=estimateTextWidth(tag,T.font.caption)+T.space(3);
  x+=`<rect x="${m+T.space(3)}" y="${contentY}" width="${tagW}" height="${T.space(4)}" rx="${T.radius.sm}" fill="${p.a}" fill-opacity="${p.d?0.2:0.1}"/>\n`;
  x+=`<text x="${m+T.space(3)+Math.round(tagW/2)}" y="${contentY+Math.round(T.space(4)/2)+Math.round(T.font.caption*0.35)}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${T.font.caption}" font-weight="600" fill="${p.a}">${esc(tag)}</text>\n`;
  const titleY=contentY+T.space(4)+T.font.heading;
  x+=`<text x="${m+T.space(3)}" y="${titleY}" font-family="${fst(cjk)}" font-size="${T.font.heading}" font-weight="600" fill="${p.i}">${esc(t)}</text>\n`;
  x+=`<text x="${m+T.space(3)}" y="${titleY+Math.round(T.font.body*T.lineHeight.body)}" font-family="${fst(cjk)}" font-size="${T.font.body}" fill="${p.m}">${esc(sub)}</text>\n`;
  const barY=c.h-m-T.space(4);
  x+=`<text x="${m+T.space(3)}" y="${barY}" font-family="${fst(cjk)}" font-size="${T.font.heading}" font-weight="700" fill="${p.a}">${esc(stat)}</text>\n`;
  x+=`<text x="${m+T.space(3)}" y="${barY+T.space(3)}" font-family="${fst(cjk)}" font-size="${T.font.caption}" fill="${p.m}">${esc(statLabel)}</text>\n`;
  const actText="查看详情 →",actW=estimateTextWidth(actText,T.font.caption)+T.space(4);
  const actX=c.w-m-T.space(3)-actW,actY=barY-Math.round(T.space(4)/2);
  x+=`<rect x="${actX}" y="${actY}" width="${actW}" height="${T.space(4)}" rx="${T.radius.sm}" fill="${p.a}" fill-opacity="${p.d?0.15:0.08}"/>\n`;
  x+=`<text x="${actX+Math.round(actW/2)}" y="${actY+Math.round(T.space(4)/2)+Math.round(T.font.caption*0.35)}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${T.font.caption}" font-weight="600" fill="${p.a}">${esc(actText)}</text>\n`;
  return x+`</svg>\n`;
}

function gallery(cfg) {
  const baseP=P[cfg.palette||"brand"];
  const cols=cfg.cols||3,rows=cfg.rows||2,items=cfg.items||[];
  const cjk=items.some(i=> /[\u4e00-\u9fff]/.test(i.title||""));
  const m=T.space(3),gt=T.space(2),hH=T.space(7),cw=520,ch=380;
  const W=m*2+cw*cols+gt*(cols-1),H=m+hH+ch*rows+gt*(rows-1)+m;
  const cardBg=baseP.d?'#1e293b':'#fff';
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="galT">\n<title id="galT">${esc(cfg.title||"Gallery")}</title>\n<defs>\n${gD("bg",[{c:baseP.s[0]},{c:baseP.s[1]}])}\n${sD("lift",baseP.sh,0.18)}\n</defs>\n\n`;
  x+=`<rect width="${W}" height="${H}" fill="url(#bg)"/>\n`;
  const hf=T.font.section;
  x+=`<text x="${m}" y="${m+hf}" font-family="${fst(cjk)}" font-size="${hf}" font-weight="700" fill="${baseP.i}">${esc(cfg.title||"Gallery")}</text>\n`;
  if(cfg.subtitle)x+=`<text x="${m}" y="${m+hf+Math.round(T.font.body*T.lineHeight.body)}" font-family="${fst(cjk)}" font-size="${T.font.body}" fill="${baseP.m}">${esc(cfg.subtitle)}</text>\n`;
  const count=cols*rows,countText=String(count),countW=estimateTextWidth(countText,T.font.caption)+T.space(3);
  x+=`<rect x="${W-m-countW}" y="${m}" width="${countW}" height="${T.space(4)}" rx="${T.radius.sm}" fill="${baseP.a}" fill-opacity="${baseP.d?0.2:0.1}"/>\n`;
  x+=`<text x="${W-m-Math.round(countW/2)}" y="${m+Math.round(T.space(4)/2)+Math.round(T.font.caption*0.35)}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${T.font.caption}" font-weight="600" fill="${baseP.a}">${countText} 项</text>\n`;
  const headerH=160;
  for(let r=0;r<rows;r++)for(let cc=0;cc<cols;cc++){
    const idx=r*cols+cc,it=items[idx]||{title:"",subtitle:""};
    const px=m+cc*(cw+gt),py=m+hH+r*(ch+gt);
    const motifFn=MOTIFS[idx%MOTIFS.length];
    const accents=CARD_ACCENTS[idx%CARD_ACCENTS.length];
    const cp={...baseP,...accents};
    const sid="G"+idx;
    x+=`\n<g data-motif="${esc(it.title||'card-'+idx)}">\n`;
    x+=`<defs>${gD("cardG"+sid,[{c:cardBg},{c:baseP.d?'#0f172a':'#f7f5ff'}])}\n${gD("hdr"+sid,[{c:cp.a},{c:cp.a2}],"h")}\n${rD("halo"+sid,cp.a2,0.3)}\n</defs>\n`;
    x+=`<rect x="${px}" y="${py}" width="${cw}" height="${ch}" rx="${T.radius.lg}" fill="url(#cardG${sid})" filter="url(#lift)"/>\n`;
    x+=`<rect x="${px+6}" y="${py+6}" width="${cw-12}" height="${ch-12}" rx="${T.radius.lg-6}" fill="none" stroke="${cp.a}" stroke-opacity="0.15" stroke-width="${T.stroke.thin}"/>\n`;
    x+=`<defs><clipPath id="clip${sid}"><rect x="${px}" y="${py}" width="${cw}" height="${headerH}" rx="${T.radius.lg}"/></clipPath></defs>\n`;
    x+=`<g clip-path="url(#clip${sid})"><rect x="${px}" y="${py}" width="${cw}" height="${headerH}" fill="url(#hdr${sid})"/>\n`;
    x+=`<ellipse cx="${px+Math.round(cw*0.7)}" cy="${py+20}" rx="180" ry="120" fill="url(#halo${sid})"/>\n`;
    x+=`<circle cx="${px+Math.round(cw*0.3)}" cy="${py+headerH-10}" r="80" fill="#fff" fill-opacity="${baseP.d?0.04:0.08}"/>\n</g>\n`;
    const mcx=px+Math.round(cw/2),mcy=py+Math.round(headerH/2);
    x+=motifFn(mcx,mcy,cp,stk)+`\n`;
    const contentY=py+headerH+T.space(3);
    const tag=it.tag||"核心功能",tagW=estimateTextWidth(tag,T.font.caption)+T.space(3);
    x+=`<rect x="${px+T.space(3)}" y="${contentY}" width="${tagW}" height="${T.space(4)}" rx="${T.radius.sm}" fill="${cp.a}" fill-opacity="${baseP.d?0.2:0.1}"/>\n`;
    x+=`<text x="${px+T.space(3)+Math.round(tagW/2)}" y="${contentY+Math.round(T.space(4)/2)+Math.round(T.font.caption*0.35)}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${T.font.caption}" font-weight="600" fill="${cp.a}">${esc(tag)}</text>\n`;
    const titleY=contentY+T.space(4)+T.font.heading;
    x+=`<text x="${px+T.space(3)}" y="${titleY}" font-family="${fst(cjk)}" font-size="${T.font.heading}" font-weight="600" fill="${baseP.i}">${esc(it.title||"")}</text>\n`;
    x+=`<text x="${px+T.space(3)}" y="${titleY+Math.round(T.font.body*T.lineHeight.body)}" font-family="${fst(cjk)}" font-size="${T.font.body}" fill="${baseP.m}">${esc(it.subtitle||"")}</text>\n`;
    const stat=it.stat||(idx+1)+".0k",barY=py+ch-T.space(4);
    x+=`<text x="${px+T.space(3)}" y="${barY}" font-family="${fst(cjk)}" font-size="${T.font.heading}" font-weight="700" fill="${cp.a}">${esc(stat)}</text>\n`;
    x+=`<text x="${px+T.space(3)}" y="${barY+T.space(3)}" font-family="${fst(cjk)}" font-size="${T.font.caption}" fill="${baseP.m}">使用次数</text>\n`;
    const actW2=estimateTextWidth("查看详情 →",T.font.caption)+T.space(4);
    const actX2=px+cw-T.space(3)-actW2,actY2=barY-Math.round(T.space(4)/2);
    x+=`<rect x="${actX2}" y="${actY2}" width="${actW2}" height="${T.space(4)}" rx="${T.radius.sm}" fill="${cp.a}" fill-opacity="${baseP.d?0.15:0.08}"/>\n`;
    x+=`<text x="${actX2+Math.round(actW2/2)}" y="${actY2+Math.round(T.space(4)/2)+Math.round(T.font.caption*0.35)}" text-anchor="middle" font-family="${fst(cjk)}" font-size="${T.font.caption}" font-weight="600" fill="${cp.a}">查看详情 →</text>\n`;
    x+=`</g>\n`;
  }
  return x+`</svg>\n`;
}

function poster(cfg) {
  const p=P[cfg.palette||"editorial"],c=T.canvas.poster,m=T.space(3);
  const t=cfg.title||"Poster",sub=cfg.subtitle||"",cjk=/[\u4e00-\u9fff]/.test(t);
  const df=T.font.display;
  let x=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" role="img" aria-labelledby="poT">\n<title id="poT">${esc(t)}</title>\n<defs>\n${gD("bg",[{c:p.s[0]},{c:p.s[1]}])}\n${rD("halo",p.g,0.2)}\n${gD("accent",[{c:p.a},{c:p.a2||p.a}],"h")}\n${gD("accent2",[{c:p.a2||p.a},{c:p.a}],"v")}\n</defs>\n\n`;
  x+=`<rect width="${c.w}" height="${c.h}" fill="url(#bg)"/>\n`;
  x+=`<rect x="0" y="0" width="${c.w}" height="8" fill="url(#accent)"/>\n`;
  x+=`<circle cx="${c.w-80}" cy="120" r="200" fill="none" stroke="${p.a}" stroke-opacity="0.12" stroke-width="2"/>\n`;
  x+=`<circle cx="${c.w-80}" cy="120" r="140" fill="none" stroke="${p.a2||p.a}" stroke-opacity="0.08" stroke-width="1.5"/>\n`;
  x+=`<circle cx="${c.w-80}" cy="120" r="80" fill="url(#halo)"/>\n`;
  x+=`<rect x="${m}" y="${m+T.space(2)}" width="6" height="${T.font.heading}" rx="3" fill="url(#accent)"/>\n`;
  x+=`<text x="${m+18}" y="${m+T.space(2)+Math.round(T.font.heading*0.8)}" font-family="${fst(cjk)}" font-size="${T.font.caption}" font-weight="600" fill="${p.m}" letter-spacing="3">${esc((sub||"POSTER").toUpperCase())}</text>\n`;
  const ty=Math.round(c.h*0.28);
  x+=`<text x="${m}" y="${ty}" font-family="${cjk?T.fontStack.cjkSerif:T.fontStack.latinSerif}" font-size="${df}" font-weight="700" fill="${p.i}">${esc(t)}</text>\n`;
  const subY=ty+Math.round(df*0.45);
  x+=`<text x="${m}" y="${subY}" font-family="${cjk?T.fontStack.cjkSerif:T.fontStack.latinSerif}" font-size="${T.font.title}" fill="${p.m}">${esc(cfg.desc||"探索设计与创新的可能性")}</text>\n`;
  const ly=subY+T.space(4);
  x+=`<line x1="${m}" y1="${ly}" x2="${c.w-m}" y2="${ly}" stroke="${p.i}" stroke-width="${T.stroke.medium}" stroke-opacity="0.3"/>\n`;
  const cx2=Math.round(c.w/2),cy2=ly+T.space(6)+100;
  x+=`<g transform="translate(${cx2} ${cy2})" fill="none" stroke-linecap="round" stroke-linejoin="round">\n`;
  x+=`<circle r="90" fill="url(#accent)" fill-opacity="0.08" stroke="${p.a}" stroke-width="2" stroke-opacity="0.3"/>\n`;
  x+=`<rect x="-70" y="-70" width="140" height="140" rx="20" fill="url(#accent2)" fill-opacity="0.06" stroke="${p.a2||p.a}" stroke-width="2" stroke-opacity="0.25" transform="rotate(15)"/>\n`;
  x+=`<path d="M0 -80 L70 0 L0 80 L-70 0 Z" fill="none" stroke="${p.a}" stroke-width="2" stroke-opacity="0.2"/>\n`;
  x+=`<circle r="30" fill="${p.a}" fill-opacity="0.15"/>\n`;
  x+=`<circle r="12" fill="${p.a}" stroke="none"/>\n</g>\n`;
  const gridY=cy2+140;
  const colW=Math.round((c.w-m*2-T.space(4))/2);
  const labels=cfg.sections||["主题","时间","地点","主办"];
  const values=cfg.values||["设计与创新","2026 春季","线上 + 线下","知了学习"];
  for(let i=0;i<4;i++){
    const col=i%2,row=Math.floor(i/2);
    const lx2=m+col*(colW+T.space(4)),ly2=gridY+row*T.space(6);
    x+=`<text x="${lx2}" y="${ly2}" font-family="${fst(cjk)}" font-size="${T.font.caption}" fill="${p.m}" letter-spacing="2">${esc(labels[i])}</text>\n`;
    x+=`<text x="${lx2}" y="${ly2+T.space(4)}" font-family="${fst(cjk)}" font-size="${T.font.heading}" font-weight="600" fill="${p.i}">${esc(values[i])}</text>\n`;
  }
  const featY=gridY+T.space(7);
  const feats=cfg.features||["关系网可视化","路径核验","提纲生成","数据统计"];
  x+=`<line x1="${m}" y1="${featY-T.space(3)}" x2="${c.w-m}" y2="${featY-T.space(3)}" stroke="${p.i}" stroke-width="${T.stroke.thin}" stroke-opacity="0.15"/>\n`;
  for(let i=0;i<feats.length;i++){
    const fy=featY+i*T.space(4);
    x+=`<circle cx="${m+6}" cy="${fy-4}" r="4" fill="${p.a}"/>\n`;
    x+=`<text x="${m+T.space(4)}" y="${fy}" font-family="${fst(cjk)}" font-size="${T.font.body}" fill="${p.i}">${esc(feats[i])}</text>\n`;
  }
  x+=`<rect x="0" y="${c.h-8}" width="${c.w}" height="8" fill="url(#accent)"/>\n`;
  x+=`<text x="${m}" y="${c.h-m}" font-family="${fst(cjk)}" font-size="${T.font.caption}" fill="${p.m}">${esc(cfg.footer||"")}</text>\n`;
  x+=`<text x="${c.w-m}" y="${c.h-m}" text-anchor="end" font-family="${fst(cjk)}" font-size="${T.font.caption}" fill="${p.m}">No. 001</text>\n`;
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

const DEFAULT_ITEMS = [
  {title:"章节关系网",subtitle:"概念自动连成可核验的关系图",tag:"关系网",stat:"2.4k"},
  {title:"复习路径",subtitle:"按掌握度推进，每步可回溯",tag:"路径",stat:"1.8k"},
  {title:"卡片核验",subtitle:"核验通过后才允许入库",tag:"核验",stat:"3.2k"},
  {title:"提纲生成",subtitle:"原文一键生成层级提纲",tag:"提纲",stat:"1.5k"},
  {title:"数据统计",subtitle:"学习进度可视化分析",tag:"统计",stat:"2.9k"},
  {title:"知识分层",subtitle:"结构化知识体系构建",tag:"分层",stat:"2.1k"},
];
let state = { layout:"banner", palette:"brand", title:"知了学习 · 知识组织与核验助手", subtitle:"把章节连成关系网，让每次复习都有据可查", cta:"开始核验", cols:3, rows:2, motif:"network" };
const $ = id => document.getElementById(id);
const canvasSvg = $("canvasSvg"), statusEl = $("status"), sizeEl = $("sizeIndicator"), jsonEl = $("jsonConfig");

function buildCfg() {
  const cfg = { layout:state.layout, palette:state.palette, title:state.title, subtitle:state.subtitle, cta:state.cta };
  if (state.layout === "card") { cfg.motif = state.motif; }
  if (state.layout === "gallery") { cfg.cols=+state.cols; cfg.rows=+state.rows; cfg.items=[];
    const n=cfg.cols*cfg.rows; for (let i=0;i<n;i++) cfg.items.push(DEFAULT_ITEMS[i%DEFAULT_ITEMS.length]); }
  if (state.layout === "poster") { cfg.footer="知了学习 出品"; cfg.desc="探索设计与创新的可能性"; }
  return cfg;
}

function render() {
  try {
    const cfg = buildCfg();
    const svg = generate(cfg);
    canvasSvg.innerHTML = svg;
    const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (m) sizeEl.textContent = m[1] + " × " + m[2];
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
  $("motifControls").style.display = state.layout==="card" ? "block" : "none";
  render();
});
$("paletteGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-palette]"); if (!btn) return;
  document.querySelectorAll("#paletteGrid .palette-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); state.palette = btn.dataset.palette; render();
});
$("motifGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-motif]"); if (!btn) return;
  document.querySelectorAll("#motifGrid .seg-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); state.motif = btn.dataset.motif; render();
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
    $("motifControls").style.display = state.layout==="card" ? "block" : "none";
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
