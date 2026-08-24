export function computeSnap({ moving, scene, canvas, opts, signatures }) {
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
  // 同类识别：同签名且尺寸 ±15% 的最近兄弟 → 大捕获半径(48px)直接吸到列 x
  const sigOf = (id) => (signatures ? signatures[id] : undefined);
  if (o.semantic && signatures && sigOf(moving.id)) {
    const sibs = scene.filter(s => s.id !== moving.id && sigOf(s.id) === sigOf(moving.id)
      && Math.abs(s.w - moving.w) / moving.w <= 0.15);
    if (sibs.length) {
      const near = sibs.reduce((p, c) => Math.abs(c.x - moving.x) < Math.abs(p.x - moving.x) ? c : p);
      if (Math.abs(near.x - moving.x) <= 48) {
        bestX = { d: near.x - moving.x, t: near.x, rank: -1 };
        res.semantic = { reason: '同类对齐 · 宽 ' + Math.round(moving.w) + ' = 同类' };
      }
    }
  }
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

export function detectEquality({ moving, neighbors }) {
  for (const axis of ['h', 'v']) {
    const pos = axis === 'h' ? (b) => [b.x, b.x + b.w] : (b) => [b.y, b.y + b.h];
    for (const n of neighbors) {
      if (n.id === moving.id) continue;
      const gapL = Math.abs(pos(moving)[0] - pos(n)[1]);
      for (const m2 of neighbors) {
        if (m2.id === n.id || m2.id === moving.id) continue;
        const gapR = Math.abs(pos(m2)[0] - pos(moving)[1]);
        if (gapL > 0 && Math.abs(gapL - gapR) < 0.5 && gapL < 200)
          return { axis, gap: Math.round(gapL * 10) / 10,
            range: [pos(n)[1], pos(m2)[0]].sort((a, b) => a - b) };
      }
    }
  }
  return null;
}

export function clusterSimilar(items, sizeTolerance = 0.15) {
  const groups = []; const used = new Set();
  for (const it of items) {
    if (used.has(it.id)) continue;
    const g = [it.id]; used.add(it.id);
    for (const other of items) {
      if (used.has(other.id)) continue;
      if (other.signature !== it.signature) continue;
      if (Math.abs(other.w - it.w) / it.w <= sizeTolerance && Math.abs(other.h - it.h) / it.h <= sizeTolerance) {
        g.push(other.id); used.add(other.id);
      }
    }
    if (g.length > 1) groups.push(g);
  }
  return groups;
}
