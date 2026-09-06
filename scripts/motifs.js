/**
 * scripts/motifs.js — SVG illustration motifs for cards.
 * Each motif(cx, cy, p, sw) draws a meaningful icon at (cx,cy).
 * Uses palette p (with .a, .a2, .i, .m, .d) and stroke width sw.
 */

// 1. Network: central node + 4 satellites
export function motifNetwork(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle r="48" stroke="${a}" stroke-opacity="0.4" stroke-width="${sw*0.7}" stroke-dasharray="4 7"/>
    <line x1="0" y1="-48" x2="0" y2="-24" stroke="${m}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <line x1="48" y1="0" x2="24" y2="0" stroke="${m}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <line x1="0" y1="48" x2="0" y2="24" stroke="${m}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <line x1="-48" y1="0" x2="-24" y2="0" stroke="${m}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <circle r="14" fill="${a}" stroke="none" opacity="0.9"/>
    <circle r="7" fill="#fff" stroke="none" opacity="${p.d?0.3:1}"/>
    <circle cx="0" cy="-48" r="8" fill="${a2}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="48" cy="0" r="8" fill="${a}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="0" cy="48" r="8" fill="${a2}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="-48" cy="0" r="8" fill="${a}" stroke="#fff" stroke-width="${sw}"/>
  </g>`;
}

// 2. Path flow: curved path with 3 stage nodes
export function motifPath(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  const lbl = p.d ? "#aaa" : "#666";
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-80 28C-40 4 -10 32 20 2C40 -14 60 -20 80 -28" stroke="${a}" stroke-opacity="0.5" stroke-width="${sw}" stroke-dasharray="1 8"/>
    <circle cx="-80" cy="28" r="8" fill="${p.d?'#333':'#eee'}" stroke="${a}" stroke-width="${sw}"/>
    <circle cx="20" cy="2" r="10" fill="${a2}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="20" cy="2" r="16" stroke="${a2}" stroke-opacity="0.35" stroke-width="${sw*0.7}"/>
    <circle cx="80" cy="-28" r="11" fill="${a}" stroke="#fff" stroke-width="${sw}"/>
    <path d="M75 -28l3 3 6-6" stroke="#fff" stroke-width="${sw+0.4}"/>
    <text x="-80" y="52" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="${lbl}" stroke="none">未开始</text>
    <text x="20" y="34" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="${lbl}" stroke="none">进行中</text>
    <text x="80" y="-46" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="${lbl}" stroke="none">已完成</text>
  </g>`;
}

// 3. Shield: document + shield checkmark
export function motifShield(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  const cardBg = p.d ? "#1a1a2e" : "#fff";
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-52" y="-44" width="96" height="72" rx="10" fill="${cardBg}" stroke="${ink}" stroke-width="${sw}"/>
    <line x1="-38" y1="-26" x2="30" y2="-26" stroke="${ink}" stroke-width="${sw}"/>
    <line x1="-38" y1="-10" x2="20" y2="-10" stroke="${ink}" stroke-width="${sw}" stroke-opacity="0.65"/>
    <line x1="-38" y1="6" x2="26" y2="6" stroke="${ink}" stroke-width="${sw}" stroke-opacity="0.4"/>
    <path d="M36 0l14 5v10c0 8-6 14-14 16-8-2-14-8-14-16V5z" fill="${a}" stroke="#fff" stroke-width="${sw}"/>
    <path d="M30 12l4.5 4.5 8-8" stroke="#fff" stroke-width="${sw+0.4}"/>
    <circle cx="62" cy="-32" r="3" fill="${a2}" stroke="none"/>
    <circle cx="54" cy="-44" r="2" fill="${a2}" stroke="none" opacity="0.6"/>
  </g>`;
}

// 4. Outline: hierarchical lines + dots
export function motifOutline(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  const cardBg = p.d ? "#1a1a2e" : "#fff";
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-44" y="-50" width="88" height="96" rx="10" fill="${cardBg}" stroke="${ink}" stroke-width="${sw}"/>
    <circle cx="-28" cy="-34" r="4" fill="${a}" stroke="none"/>
    <line x1="-18" y1="-34" x2="28" y2="-34" stroke="${ink}" stroke-width="${sw}"/>
    <line x1="-18" y1="-18" x2="22" y2="-18" stroke="${ink}" stroke-width="${sw}" stroke-opacity="0.7"/>
    <line x1="-10" y1="2" x2="24" y2="2" stroke="${ink}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <line x1="-10" y1="18" x2="18" y2="18" stroke="${ink}" stroke-width="${sw}" stroke-opacity="0.3" stroke-dasharray="4 5"/>
    <line x1="-32" y1="-18" x2="-32" y2="22" stroke="${a2}" stroke-width="${sw*0.8}" stroke-dasharray="2 5"/>
    <circle cx="-10" cy="2" r="3" fill="${a2}" stroke="none"/>
    <circle cx="-10" cy="18" r="3" fill="${a2}" stroke="none" opacity="0.5"/>
  </g>`;
}

// 5. Chart: growing bars
export function motifChart(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  const bars = [{x:-48,h:20,c:a2,op:0.4},{x:-24,h:36,c:a2,op:0.6},{x:0,h:28,c:a,op:0.7},{x:24,h:48,c:a,op:0.85},{x:48,h:38,c:a,op:1}];
  let s = `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">`;
  s += `<line x1="-60" y1="32" x2="60" y2="32" stroke="${ink}" stroke-width="${sw}" stroke-opacity="0.3"/>`;
  for (const b of bars) s += `<rect x="${b.x-8}" y="${32-b.h}" width="16" height="${b.h}" rx="3" fill="${b.c}" opacity="${b.op}"/>`;
  s += `<path d="M-48 12 Q0 -8 48 -6" stroke="${a}" stroke-width="${sw}" stroke-dasharray="3 5" stroke-opacity="0.5"/>`;
  s += `</g>`;
  return s;
}

// 6. Layers: nested hexagons
export function motifLayers(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  const cardBg = p.d ? "#1a1a2e" : "#fff";
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 -48 L42 -24 L42 24 L0 48 L-42 24 L-42 -24 Z" fill="${cardBg}" stroke="${ink}" stroke-width="${sw}"/>
    <path d="M0 -28 L28 -14 L28 14 L0 28 L-28 14 L-28 -14 Z" fill="${a}" fill-opacity="0.15" stroke="${a}" stroke-width="${sw*0.8}"/>
    <path d="M0 -12 L14 -6 L14 6 L0 12 L-14 6 L-14 -6 Z" fill="${a2}" fill-opacity="0.3" stroke="${a2}" stroke-width="${sw*0.8}"/>
    <circle r="5" fill="${a2}" stroke="none"/>
  </g>`;
}

// 7. Spark: branching nodes (like a mind map)
export function motifSpark(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle r="10" fill="${a}" stroke="none"/>
    <path d="M0 -10 C-10 -25 -30 -30 -40 -38" stroke="${a2}" stroke-width="${sw}" stroke-opacity="0.6"/>
    <path d="M0 -10 C10 -25 30 -30 40 -38" stroke="${a}" stroke-width="${sw}" stroke-opacity="0.6"/>
    <path d="M10 0 C25 -5 40 -5 48 -8" stroke="${a2}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <path d="M-10 0 C-25 5 -40 5 -48 8" stroke="${a}" stroke-width="${sw}" stroke-opacity="0.5"/>
    <path d="M0 10 C-8 25 -20 35 -30 42" stroke="${a2}" stroke-width="${sw}" stroke-opacity="0.4"/>
    <path d="M0 10 C8 25 20 35 30 42" stroke="${a}" stroke-width="${sw}" stroke-opacity="0.4"/>
    <circle cx="-40" cy="-38" r="6" fill="${a2}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="40" cy="-38" r="6" fill="${a}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="48" cy="-8" r="5" fill="${a2}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="-48" cy="8" r="5" fill="${a}" stroke="#fff" stroke-width="${sw}"/>
    <circle cx="-30" cy="42" r="5" fill="${a2}" stroke="#fff" stroke-width="${sw}" opacity="0.7"/>
    <circle cx="30" cy="42" r="5" fill="${a}" stroke="#fff" stroke-width="${sw}" opacity="0.7"/>
  </g>`;
}

// 8. Target: concentric rings with center dot
export function motifTarget(cx, cy, p, sw = 2) {
  const a = p.a, a2 = p.a2 || p.a, ink = p.i, m = p.m;
  return `<g transform="translate(${cx} ${cy})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle r="46" stroke="${m}" stroke-width="${sw}" stroke-opacity="0.2"/>
    <circle r="32" stroke="${a2}" stroke-width="${sw}" stroke-opacity="0.4"/>
    <circle r="18" stroke="${a}" stroke-width="${sw}" stroke-opacity="0.7"/>
    <circle r="6" fill="${a}" stroke="none"/>
    <path d="M0 -46 L0 -56 M0 46 L0 56 M-46 0 L-56 0 M46 0 L56 0" stroke="${a}" stroke-width="${sw}" stroke-opacity="0.5"/>
  </g>`;
}

export const MOTIFS = [motifNetwork, motifPath, motifShield, motifOutline, motifChart, motifLayers, motifSpark, motifTarget];
export const MOTIF_NAMES = ["network", "path", "shield", "outline", "chart", "layers", "spark", "target"];
