export function computeSnap({ moving, scene, canvas, opts }) {
  const o = { threshold: 6, guide: true, spacing: true, semantic: true, ...opts };
  const res = { dx: 0, dy: 0, guides: [], equalities: [], semantic: null };
  if (!o.guide || !moving) return res;
  const targets = [];
  for (const s of scene) {
    if (s.id === moving.id) continue;
    targets.push(s.x, s.x + s.w, s.x + s.w / 2, s.y, s.y + s.h, s.y + s.h / 2);
  }
  targets.push(canvas.x, canvas.x + canvas.w, canvas.x + canvas.w / 2,
               canvas.y, canvas.y + canvas.h, canvas.y + canvas.h / 2);
  let bestX = null, bestY = null;
  const consider = (t, mv, isX) => {
    const d = t - mv;
    if (Math.abs(d) > o.threshold) return;
    const rank = (mv === (isX ? moving.x + moving.w / 2 : moving.y + moving.h / 2)) ? 0 : 1;
    const cur = isX ? bestX : bestY;
    const better = !cur || rank < cur.rank || (rank === cur.rank && Math.abs(d) < Math.abs(cur.d));
    if (better) { if (isX) bestX = { d, t, rank }; else bestY = { d, t, rank }; }
  };
  for (const t of targets) {
    consider(t, moving.x, true); consider(t, moving.x + moving.w / 2, true); consider(t, moving.x + moving.w, true);
    consider(t, moving.y, false); consider(t, moving.y + moving.h / 2, false); consider(t, moving.y + moving.h, false);
  }
  if (bestX) { res.dx = bestX.d; res.guides.push({ axis: 'v', pos: bestX.t }); }
  if (bestY) { res.dy = bestY.d; res.guides.push({ axis: 'h', pos: bestY.t }); }
  if (res.guides.length > 4) res.guides = res.guides.slice(0, 4);
  return res;
}
