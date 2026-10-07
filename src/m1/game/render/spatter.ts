// Blood left lying about by the set pieces (a bar gone up, two smokers pasted up a wall, a pool under a body), as
// pixel art instead of ovals: worked out cell by cell on the 2px grid from a seed, so the same one's the same every
// frame. On a wall it's a lumpy splat thrown out along the way the blood was going, fingers out of it, drops flung
// on in streaks, flecks, runs dripping down; on a floor a pool lying on the top, thick in the middle, a crown of
// spikes, fingers and streaks thrown along the floor, flecks; a smear is a pool dragged out, its marks along it. Each
// is cut off at the edges of what it's on (a wall's edges, a sign or a door on it, a ledge's ends). The rim's darker,
// darkest underneath and to the right (lit from the upper left), with a wet shine up on its top left.

type Ctx = CanvasRenderingContext2D;

/**
 * How far the ground at x goes on either side at the height it is there (a run of the stage's ground profile, and
 * the ones carrying straight on from it): a pool there is cut off at its ends, not left hanging off a ledge or a
 * kerb into a pit. No ground at x: nothing either side of it.
 */
export const floorSpan = (runs: { x1: number; x2: number; y1: number; y2: number }[], x: number, y: number) => {
  const r = runs.find(q => x >= q.x1 && x <= q.x2 && Math.abs(q.y1 + ((x - q.x1) / Math.max(1, q.x2 - q.x1)) * (q.y2 - q.y1) - y) < 8);
  if (!r) return { x1: x, x2: x };
  let x1 = r.x1, x2 = r.x2, y1 = r.y1, y2 = r.y2;
  for (let more = true; more;) {
    more = false;
    for (const q of runs) {
      if (Math.abs(q.x2 - x1) <= 2 && Math.abs(q.y2 - y1) <= 4 && q.x1 < x1) { x1 = q.x1; y1 = q.y1; more = true; }
      if (Math.abs(q.x1 - x2) <= 2 && Math.abs(q.y1 - y2) <= 4 && q.x2 > x2) { x2 = q.x2; y2 = q.y2; more = true; }
    }
  }
  return { x1, x2 };
};

export interface Spatter {
  /** Where it hit: on a floor, the middle of the pool, `y` the floor's top. */
  x: number;
  y: number;
  /** How big: a splat's radius; a pool's (or a smear's) reach either side of its middle. */
  size: number;
  seed: number;
  /** What it's on (a wall, unless it's said). A smear is a pool dragged along the way it was going. */
  on?: 'wall' | 'floor' | 'ceiling' | 'smear';
  /** The way it was thrown (away from the blast, the hit): the length of it, 0..1, how hard. */
  dx?: number;
  dy?: number;
  /** All it can be painted on, as x, y, w, h rects: none of it past them. Left out, it can go anywhere. */
  clip?: number[];
  /** A pool: where the floor it's on ends either side. */
  x1?: number;
  x2?: number;
  /** The blood (its shades are worked out from it). */
  color?: string;
  /** Runs down a wall (they're there unless this is false). */
  drips?: boolean;
}

const PIX = 2;
const GW = 260, GH = 220, OX = 130, OY = 100;
const occ = new Uint8Array(GW * GH);
const shade = new Uint8Array(GW * GH);

/** Shades: 1 deep (the shadowed rim), 2 dark, 3 the blood, 4 lit, 5 the wet shine. */
type Ramp = [string, string, string, string, string, string];
const ramps = new Map<string, Ramp>();
const hex = (r: number, g: number, b: number) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const rampOf = (c: string): Ramp => {
  let rp = ramps.get(c);
  if (rp) return rp;
  let r = 127, g = 29, b = 29;
  if (c[0] === '#' && c.length >= 7) { r = parseInt(c.slice(1, 3), 16); g = parseInt(c.slice(3, 5), 16); b = parseInt(c.slice(5, 7), 16); }
  rp = ['', hex(r * 0.45, g * 0.3, b * 0.3), hex(r * 0.7, g * 0.55, b * 0.55), c, hex(r * 1.22 + 34, g * 1.1 + 22, b * 1.1 + 22), hex(r + (255 - r) * 0.68, g + (255 - g) * 0.6, b + (255 - b) * 0.6)];
  ramps.set(c, rp);
  return rp;
};

const rngOf = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// (the one being worked out: where its middle is, what of the grid it's used, what it can be painted on)
let ax = 0, ay = 0, bx0 = GW, bx1 = -1, by0 = GH, by1 = -1;
let clip: number[] | undefined, lim0 = -Infinity, lim1 = Infinity;

const put = (lx: number, ly: number) => {
  lx = Math.round(lx); ly = Math.round(ly);
  const gx = OX + lx, gy = OY + ly;
  if (gx < 1 || gx >= GW - 1 || gy < 1 || gy >= GH - 1) return;
  const wx = ax + lx * PIX + 1, wy = ay + ly * PIX + 1;
  if (wx < lim0 || wx > lim1) return;
  if (clip) {
    let inside = false;
    for (let i = 0; i < clip.length; i += 4) if (wx > clip[i] && wx < clip[i] + clip[i + 2] && wy > clip[i + 1] && wy < clip[i + 1] + clip[i + 3]) { inside = true; break; }
    if (!inside) return;
  }
  occ[gy * GW + gx] = 1;
  if (gx < bx0) bx0 = gx; if (gx > bx1) bx1 = gx; if (gy < by0) by0 = gy; if (gy > by1) by1 = gy;
};
const disc = (x: number, y: number, rad: number) => {
  const k = Math.ceil(rad);
  for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) {
    const cx = Math.round(x) + dx, cy = Math.round(y) + dy;
    if ((cx - x) * (cx - x) + (cy - y) * (cy - y) <= rad * rad + 0.2) put(cx, cy);
  }
};
const at = (gx: number, gy: number) => occ[gy * GW + gx] === 1;

/** A pool, side on: flat, thick in the middle, a crown; fingers, streaks and flecks thrown along the floor. A smear's drawn out long the way it went, thin, streaked with drag marks. */
const paintPool = (rnd: () => number, hw: number, vx: number, smear: boolean) => {
  const speed = Math.abs(vx) * 16;
  const dir = vx > 0.05 ? 1 : vx < -0.05 ? -1 : rnd() < 0.5 ? -1 : 1;
  const r = Math.min(10, hw / 1.4);
  const tMax = smear ? (hw >= 10 ? 2 : 1) : hw >= 20 ? 3 : hw >= 6 ? 2 : hw >= 2.5 ? 1 : 0;
  const fwd = hw * (smear ? 1.3 : 1 + Math.min(0.5, speed * 0.04)), back = hw * (smear ? 0.7 : 0.72 + rnd() * 0.22);
  const mid = smear ? 0 : dir * Math.min(2, speed * 0.1);
  const thick: number[] = [];
  const lo = Math.floor(mid - (dir > 0 ? back : fwd)), hi = Math.ceil(mid + (dir > 0 ? fwd : back));
  let wob = 0;
  for (let lx = lo; lx <= hi; lx++) {
    const along = (lx - mid) * dir, u = along / (along >= 0 ? fwd : back);
    wob = wob * 0.6 + (rnd() - 0.5) * 0.9;
    if (Math.abs(u) >= 1) { thick[lx - lo] = -1; continue; }
    // (a smear thins out to the end it was dragged to, in streaks)
    const shape = smear ? Math.max(0, 1 - (u + 1) / 2) : Math.sqrt(1 - u * u);
    const t = Math.max(0, Math.round(tMax * shape + wob));
    thick[lx - lo] = t;
    const edge = Math.abs(u) > 0.8;
    if (smear && u > 0.15 && (lx & 3) === (Math.floor(rnd() * 4))) continue;
    put(lx, 0);
    if (!edge || rnd() < 0.55) for (let ly = -1; ly >= -1 - t; ly--) put(lx, ly);
    if (!smear && hw >= 4 && Math.abs(u) < 0.5 && rnd() < 0.85) put(lx, 1);
  }
  const topOf = (lx: number) => { const t = thick[lx - lo]; return t === undefined || t < 0 ? 0 : -1 - t; };
  const edgeAt = (side: number) => mid + side * (side === dir ? fwd : back);
  if (smear) {
    // Drag marks: streaks running on out the way it went
    const marks = 2 + Math.floor(hw / 6);
    for (let k = 0; k < marks; k++) {
      const s = mid + dir * fwd * (0.3 + rnd() * 0.6), len = 3 + Math.floor(rnd() * hw * 0.6), row = rnd() < 0.5 ? 0 : -1;
      for (let i = 0; i < len; i++) if (rnd() < 0.85) put(s + dir * i, row);
    }
  } else {
    // The crown: spikes stood up round its rim
    const crowns = hw >= 4 ? 2 + Math.floor(rnd() * 3 + hw / 12) : rnd() < 0.5 ? 1 : 0;
    for (let k = 0; k < crowns; k++) {
      const side = rnd() < 0.6 ? dir : -dir;
      const lx = Math.round(mid + side * (0.45 + rnd() * 0.45) * (side === dir ? fwd : back));
      const top = topOf(lx);
      put(lx, top - 1);
      if (rnd() < 0.5) put(lx, top - 2);
    }
  }
  // Fingers running out along the floor, drops past them
  const fingers = 1 + Math.floor(rnd() * (1.5 + r * 0.4));
  for (let k = 0; k < fingers; k++) {
    const side = rnd() < 0.7 ? dir : -dir, e = edgeAt(side);
    const len = 1 + Math.floor(rnd() * (2 + r * 0.6 + speed * 0.15));
    for (let i = 0; i < len; i++) put(e + side * i, 0);
    if (r >= 4) put(e, -1);
    if (rnd() < 0.5) { const d = e + side * (len + 1); put(d, 0); if (r >= 4 && rnd() < 0.6) { put(d + side, 0); put(d, -1); } }
  }
  // Spatter thrown on: streaks, their heads furthest out
  const reach = 4 + r * 1.6 + speed * 0.8;
  const drops = 2 + Math.floor(r * 0.9 + speed * 0.2 + rnd() * 2);
  for (let k = 0; k < drops; k++) {
    const side = rnd() < 0.8 ? dir : -dir, e = edgeAt(side);
    const f = Math.pow(rnd(), 1.5), d = e + side * (2 + f * reach);
    const len = Math.max(1, Math.round((1 + speed * 0.12) * (1 - f) * 2.5 * rnd() + 0.5));
    for (let i = 0; i < len; i++) put(d - side * i, 0);
    if (r >= 4 && rnd() < 0.5) put(d, -1);
  }
  const flecks = 2 + Math.floor(rnd() * 3 + r * 0.4);
  for (let k = 0; k < flecks; k++) { const side = rnd() < 0.65 ? dir : -dir; put(edgeAt(side) + side * (3 + rnd() * (6 + r * 2.2)), rnd() < 0.3 ? 1 : 0); }
  return { hl: Math.round(mid - dir * hw * 0.35), n: hw >= 8 ? 3 + Math.floor(rnd() * 2) : hw >= 3 ? 2 : hw >= 2 ? 1 : 0 };
};

/** A splat on a wall or a ceiling: thrown out along the way it was going, fingers, drops flung on, runs down a wall. */
const paintSplat = (rnd: () => number, R: number, vx: number, vy: number, drips: boolean) => {
  const force = Math.min(1.5, Math.hypot(vx, vy)), speed = force * 16;
  const ang = force > 0.03 ? Math.atan2(vy, vx) : rnd() * Math.PI * 2;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const e = 1 + Math.min(0.55, force * 0.45);
  const p1 = rnd() * 6.28, p2 = rnd() * 6.28, a1 = 0.08 + rnd() * 0.1, a2 = 0.05 + rnd() * 0.08;
  // The body: lumpy, drawn out the way it was going, pushed on a little that way
  const k = Math.ceil(R * e) + 2, sh = R * (e - 1) * 0.5;
  for (let ly = -k; ly <= k; ly++) for (let lx = -k; lx <= k; lx++) {
    const along = (lx * ca + ly * sa - sh) / e, across = -lx * sa + ly * ca;
    const a = Math.atan2(across, along), d = Math.hypot(along, across);
    if (d <= R * (0.86 + a1 * Math.sin(3 * a + p1) + a2 * Math.sin(5 * a + p2))) put(lx, ly);
  }
  // Fingers out of it, most of them on the way it was going, some with a drop on the end
  const fingers = R >= 1.5 ? 3 + Math.floor(rnd() * 4 + R * 0.15) : Math.floor(rnd() * 2.5);
  for (let i = 0; i < fingers; i++) {
    const fa = i < fingers * 0.6 && force > 0.03 ? ang + (rnd() - 0.5) * 1.5 : rnd() * Math.PI * 2;
    const len = R * (0.35 + rnd() * 1.0) + speed * 0.15, w0 = Math.min(3, 0.6 + R * 0.16);
    const s0 = R * 0.6, s1 = R + len;
    for (let s = s0; s <= s1; s += 0.5) disc(Math.cos(fa) * s, Math.sin(fa) * s, w0 * (1 - (s - s0) / (s1 - s0 + 0.01)) + 0.3);
    if (rnd() < 0.55) { const s = s1 + 1.2 + rnd() * 1.5; disc(Math.cos(fa) * s, Math.sin(fa) * s, 0.5 + rnd() * Math.min(1.5, R * 0.12)); }
  }
  // Drops flung on, streaked the way they went, heads out
  const drops = 2 + Math.floor(R * 0.8 + speed * 0.15 + rnd() * 2);
  for (let i = 0; i < drops; i++) {
    const da = force > 0.03 ? ang + (rnd() - 0.5) * 1.3 : rnd() * Math.PI * 2;
    const d = R * 1.35 + 1 + Math.pow(rnd(), 1.3) * (R * 2 + 3 + speed * 0.35);
    const len = 1 + Math.floor(rnd() * (2 + speed * 0.12));
    const c = Math.cos(da), s = Math.sin(da);
    for (let t = d - len; t <= d; t += 0.7) put(c * t, s * t);
    if (rnd() < 0.5) disc(c * d, s * d, 0.5 + rnd() * Math.min(1.2, R * 0.1));
  }
  const flecks = 3 + Math.floor(rnd() * 4 + R * 0.3);
  for (let i = 0; i < flecks; i++) { const fa = rnd() * Math.PI * 2, d = R * 1.6 + rnd() * (R * 2.4 + 4); put(Math.cos(fa) * d, Math.sin(fa) * d); }
  // Runs down the wall, a drop hanging off the end of each
  if (drips) {
    const runs = R >= 2 ? (rnd() < 0.9 ? 1 + Math.floor(rnd() * (2 + R * 0.12)) : 0) : rnd() < 0.35 ? 1 : 0;
    for (let i = 0; i < runs; i++) {
      let lx = Math.round((rnd() - 0.5) * R * 1.3);
      let ly = k + 2;
      while (ly > -k && !at(OX + lx, OY + ly)) ly--;
      if (!at(OX + lx, OY + ly)) continue;
      const len = 2 + Math.floor(rnd() * (4 + R * 2));
      const wide = R >= 4 && rnd() < 0.45, jog = rnd() < 0.25 ? 1 + Math.floor(rnd() * (len - 1)) : -1;
      for (let j = 1; j <= len; j++) {
        if (j === jog) lx += rnd() < 0.5 ? -1 : 1;
        put(lx, ly + j);
        if (wide && j < len * 0.6) put(lx + 1, ly + j);
      }
      put(lx, ly + len + 1); put(lx + 1, ly + len); if (R >= 3) put(lx + 1, ly + len + 1);
    }
  }
  return { hx: Math.round(-R * 0.4), hy: Math.round(-R * 0.45), n: R >= 6 ? 4 : R >= 3 ? 3 : R >= 1.8 ? 1 : 0 };
};

/** A spatter, worked out: its flat runs (x, y, w, h) for each shade. */
interface Runs { ramp: Ramp; runs: number[][] }

const build = (s: Spatter): Runs => {
  const rnd = rngOf((s.seed * 2654435761) ^ 0x5bd1e995);
  const on = s.on ?? 'wall';
  const floor = on === 'floor' || on === 'smear';
  ax = Math.round(s.x / PIX) * PIX; ay = Math.round(s.y / PIX) * PIX;
  bx0 = GW; bx1 = -1; by0 = GH; by1 = -1;
  clip = s.clip; lim0 = s.x1 ?? -Infinity; lim1 = s.x2 ?? Infinity;
  const dx = s.dx ?? 0, dy = s.dy ?? 0;
  let hl: { x: number; y: number; n: number };
  if (floor) {
    const f = paintPool(rnd, Math.max(1.5, s.size / PIX), dx, on === 'smear');
    hl = { x: f.hl, y: 0, n: f.n };
  } else {
    const f = paintSplat(rnd, Math.max(0.8, s.size / PIX), dx, dy, on === 'wall' && s.drips !== false);
    hl = { x: f.hx, y: f.hy, n: f.n };
  }
  // Shading: the rim darker (darkest under and to the right), the far side of a big one stepped darker, dithered
  for (let gy = by0; gy <= by1; gy++) for (let gx = bx0; gx <= bx1; gx++) {
    const i = gy * GW + gx;
    if (!occ[i]) continue;
    const up = at(gx, gy - 1), dn = at(gx, gy + 1), lf = at(gx - 1, gy), rt = at(gx + 1, gy);
    let v: number;
    if (!up && !dn && !lf && !rt) v = 2;
    else if (floor) v = !dn ? 1 : !lf || !rt ? 2 : 3;
    else if (!dn) v = 1;
    else if (!rt) v = lf ? 1 : 2;
    else if (!up || !lf) v = 2;
    else {
      const d = (gx - OX + gy - OY) / Math.max(2, s.size / PIX);
      v = d > 0.9 ? 2 : d > 0.55 && ((gx + gy) & 1) ? 2 : 3;
    }
    shade[i] = v;
  }
  // The wet shine, up on its top left
  for (let k = 0; k < hl.n; k++) {
    let gx: number, gy: number;
    if (floor) {
      gx = OX + hl.x + k; gy = -1;
      for (let ly = -8; ly <= 0; ly++) if (at(gx, OY + ly)) { gy = OY + ly; break; }
      if (gy < 0 || !at(gx, gy + 1)) continue;
    } else { gx = OX + hl.x + (k % 3) - (k === 3 ? 1 : 0); gy = OY + hl.y + (k >= 2 ? 1 : 0); }
    if (gx < 1 || gx >= GW - 1 || gy < 1 || gy >= GH - 1 || !at(gx, gy) || shade[gy * GW + gx] === 1) continue;
    shade[gy * GW + gx] = k === 0 && s.size >= 8 ? 5 : 4;
  }
  // As runs: each row's stretches of one shade, carried on down into the next row's where they line up
  const found: number[][][] = [[], [], [], [], [], []];
  let prev = new Map<number, number[]>(), cur = new Map<number, number[]>();
  for (let gy = by0; gy <= by1; gy++) {
    cur.clear();
    for (let gx = bx0; gx <= bx1;) {
      const i = gy * GW + gx, v = occ[i] ? shade[i] : 0;
      let n = 1;
      while (gx + n <= bx1 && occ[i + n] && shade[i + n] === v && v) n++;
      if (v) {
        const key = (gx * 512 + n) * 8 + v, above = prev.get(key);
        if (above) { above[3] += PIX; cur.set(key, above); }
        else { const run = [ax + (gx - OX) * PIX, ay + (gy - OY) * PIX, n * PIX, PIX]; found[v].push(run); cur.set(key, run); }
      }
      gx += n;
    }
    [prev, cur] = [cur, prev];
  }
  for (let gy = by0; gy <= by1; gy++) { occ.fill(0, gy * GW + bx0, gy * GW + bx1 + 1); shade.fill(0, gy * GW + bx0, gy * GW + bx1 + 1); }
  return { ramp: rampOf(s.color ?? '#7F1D1D'), runs: found.map(f => f.flat()) };
};

const fill = (ctx: Ctx, r: Runs) => {
  for (let k = 1; k <= 5; k++) {
    const a = r.runs[k];
    if (!a.length) continue;
    ctx.fillStyle = r.ramp[k];
    for (let i = 0; i < a.length; i += 4) ctx.fillRect(a[i], a[i + 1], a[i + 2], a[i + 3]);
  }
};

/** The ones drawn lately, worked out, so one that's there frame after frame is only worked out the once. */
const cache = new Map<string, Runs>();
const keyOf = (s: Spatter) => `${s.on ?? 'wall'}|${Math.round(s.x)}|${Math.round(s.y)}|${Math.round(s.size * 2) / 2}|${s.seed}|${(s.dx ?? 0).toFixed(2)}|${(s.dy ?? 0).toFixed(2)}|${s.clip?.join(',') ?? ''}|${s.x1 ?? ''}|${s.x2 ?? ''}|${s.color ?? ''}|${s.drips ?? ''}`;

/** Draws a spatter (worked out the first time it's drawn, as it is: one that grows is worked out again as it does). */
export const drawSpatter = (ctx: Ctx, s: Spatter) => {
  const key = keyOf(s);
  let r = cache.get(key);
  if (!r) {
    r = build(s);
    if (cache.size >= 600) cache.delete(cache.keys().next().value!);
    cache.set(key, r);
  }
  fill(ctx, r);
};

/** A pool on the floor at x, its top y, reaching `size` either side (cut off at x1, x2), thrown `dx` (-1..1) along it. */
export const drawBloodPool = (ctx: Ctx, x: number, y: number, size: number, seed: number, o: { dx?: number; x1?: number; x2?: number; color?: string } = {}) =>
  drawSpatter(ctx, { x, y, size, seed, on: 'floor', ...o });

/**
 * Lots of spatter that stays put (a room's walls after a blast): painted once onto a layer of its own, the box it's
 * all in, and the layer drawn. Made again only if `owner` (whatever the spatter belongs to) is a new one.
 */
const layers = new WeakMap<object, { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number }>();
export const drawSpatterLayer = (ctx: Ctx, owner: object, box: { x: number; y: number; w: number; h: number }, list: () => Spatter[]) => {
  let l = layers.get(owner);
  if (!l) {
    if (typeof document === 'undefined') { for (const s of list()) drawSpatter(ctx, s); return; }
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(box.w * 2); canvas.height = Math.ceil(box.h * 2);
    const g = canvas.getContext('2d')!;
    g.setTransform(2, 0, 0, 2, -box.x * 2, -box.y * 2);
    for (const s of list()) fill(g, build(s));
    l = { canvas, ...box };
    layers.set(owner, l);
  }
  ctx.drawImage(l.canvas, l.x, l.y, l.w, l.h);
};
