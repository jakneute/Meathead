// The portals: each a small gateway set back off the walk at the top of its path, dressed as its land (Future Land's
// chrome ring, Wilderness Land's log frame, Spooky Land's crooked stone with lanterns, Cartoon Land's candy canes,
// Hollywood Land's deco frame, Fairy Land's gilded storybook arch, Jungle Land's carved idol stone, Foreign Lands' tiled
// arch), its name over it in the land's own lettering. Through the opening, the land itself, the path running on into
// it. Round the outside of it, the swirl: bands of the land's colors winding round the frame, flecks flung round it.
//
// At the path's mouth, where it meets the walk, a gatepost either side (tiki torches, jack-o'-lanterns on pillars,
// chrome pylons, lanterns on log posts, giant candy canes, deco pylons, gilded orbs, flag poles); a queue rail beside
// it, the line waiting in it (crowd.ts).
//
// Still parts stamped (draw.ts); the swirl, the shimmer through the opening and the flames live.

import { type Ctx, INK, mix, hash, checker, box, R6, inked, slab } from './kit';
import { type Land } from './lands';
import { GATE, GATE_MID, ROW, PATH, depthAt } from './geometry';
import { LAND_LOOK, type StretchId } from './stretch';
import { signText, signW } from '../signLetters';

const { base: BASE, halfW: HW, h: H, frame: FR } = GATE;
const TOP = BASE - H;

/** The opening, as a path (round-topped). */
export const openingPath = (c: Ctx, cx: number, grow = 0) => {
  const w = HW + grow, top = TOP - grow;
  c.moveTo(cx - w, BASE); c.lineTo(cx - w, top + w); c.arc(cx, top + w, w, Math.PI, 0); c.lineTo(cx + w, BASE); c.closePath();
};

/** What's seen through it: the land, the path running on into it. */
const VISTA: Record<string, { sky: string[]; ground: string; path: string; paint: (c: Ctx, cx: number) => void }> = {
  space: { sky: ['#2A1A5A', '#5A3A9A', '#E8659E', '#FBC4A0'], ground: '#C2D0E0', path: '#F1F5F9', paint: (c, cx) => {
    box(c, cx - 4, TOP + 22, 3, 40, '#CBD5E1'); inked(c, () => c.ellipse(cx - 3, TOP + 24, 12, 3, 0, 0, Math.PI * 2), '#E2E8F0');
    inked(c, () => c.arc(cx + 14, TOP + 26, 5, 0, Math.PI * 2), '#A78BFA');
    for (let k = 0; k < 6; k++) box(c, cx - 22 + k * 9, TOP + 10 + (k * 7) % 12, 1, 1, '#FFFFFF');
  } },
  frontier: { sky: ['#F59E0B', '#FBBF24', '#FDE68A', '#FEF3C7'], ground: '#C08A54', path: '#9A6A3E', paint: (c, cx) => {
    c.fillStyle = '#C2410C'; c.beginPath(); c.moveTo(cx - HW, BASE - 26); c.lineTo(cx - 16, BASE - 52); c.lineTo(cx + 10, BASE - 54); c.lineTo(cx + 18, BASE - 26); c.fill();
    box(c, cx - 16, BASE - 52, 26, 3, '#EA580C');
  } },
  spooky: { sky: ['#0E0A1E', '#1E1438', '#3B2A5A', '#5B21B6'], ground: '#2A2438', path: '#4C4560', paint: (c, cx) => {
    inked(c, () => c.arc(cx + 12, TOP + 22, 7, 0, Math.PI * 2), '#F5F5DC');
    c.fillStyle = '#0A0614'; c.beginPath(); c.moveTo(cx - 20, BASE - 30); c.lineTo(cx - 16, BASE - 60); c.lineTo(cx - 12, BASE - 30); c.moveTo(cx - 10, BASE - 30); c.lineTo(cx - 10, BASE - 48); c.lineTo(cx + 4, BASE - 48); c.lineTo(cx + 4, BASE - 30); c.fill();
    box(c, cx - 6, BASE - 44, 3, 4, '#BEF264');
  } },
  cartoon: { sky: ['#86CAF4', '#C6E8FC', '#FFD2E8', '#FFF8C8'], ground: '#6CCC6A', path: '#FFF1F6', paint: (c, cx) => {
    for (const [i, col] of ['#EF4444', '#F59E0B', '#FDE047', '#4ADE80', '#60A5FA'].entries()) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(cx, BASE - 20, 30 - i * 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    c.fillStyle = '#4CC89C'; c.beginPath(); c.arc(cx - 16, BASE - 24, 12, Math.PI, 0); c.fill(); c.beginPath(); c.arc(cx + 18, BASE - 24, 14, Math.PI, 0); c.fill();
  } },
  hollywood: { sky: ['#0F172A', '#1E293B', '#4C1D95', '#BE185D'], ground: '#3F3F46', path: '#B91C1C', paint: (c, cx) => {
    c.fillStyle = '#A16207'; c.beginPath(); c.moveTo(cx - HW, BASE - 26); c.quadraticCurveTo(cx, BASE - 60, cx + HW, BASE - 26); c.fill();
    for (let k = 0; k < 6; k++) box(c, cx - 15 + k * 5, BASE - 46, 3, 4, '#F8FAFC');
    c.fillStyle = 'rgba(254, 249, 195, 0.25)'; c.beginPath(); c.moveTo(cx - 6, BASE - 30); c.lineTo(cx - 24, TOP); c.lineTo(cx - 12, TOP); c.fill();
  } },
  fantasy: { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], ground: '#4E7A4C', path: '#A8A2C0', paint: (c, cx) => {
    box(c, cx - 14, BASE - 54, 28, 26, '#E7E5E4');
    for (const [tx, h] of [[-14, 36], [0, 50], [14, 40]] as const) { box(c, cx + tx - 4, BASE - 28 - h, 8, h, '#F5F5F4'); c.fillStyle = '#2563EB'; c.beginPath(); c.moveTo(cx + tx - 6, BASE - 28 - h); c.lineTo(cx + tx, BASE - 42 - h); c.lineTo(cx + tx + 6, BASE - 28 - h); c.fill(); }
  } },
  adventure: { sky: ['#14532D', '#3F6212', '#A3B53A', '#FDE68A'], ground: '#4D6B22', path: '#9C7A52', paint: (c, cx) => {
    for (let k = 0; k < 4; k++) box(c, cx - 14 + k * 3, BASE - 30 - k * 8, 28 - k * 6, 8, k % 2 ? '#78716C' : '#A8A29E');
    for (const [dx, r] of [[-20, 12], [20, 14], [-6, 9]] as const) { c.fillStyle = '#166534'; c.beginPath(); c.arc(cx + dx, BASE - 52 + r * 0.3, r, 0, Math.PI * 2); c.fill(); }
  } },
  foreign: { sky: ['#7C2D12', '#C2410C', '#FB923C', '#FDE68A'], ground: '#B8A684', path: '#E8DCC4', paint: (c, cx) => {
    c.fillStyle = '#57534E'; c.beginPath(); c.moveTo(cx - 20, BASE - 26); c.lineTo(cx - 12, BASE - 70); c.lineTo(cx - 4, BASE - 26); c.lineTo(cx - 8, BASE - 26); c.lineTo(cx - 12, BASE - 50); c.lineTo(cx - 16, BASE - 26); c.fill();
    c.fillStyle = '#FCD34D'; c.beginPath(); c.moveTo(cx + 2, BASE - 26); c.lineTo(cx + 14, BASE - 44); c.lineTo(cx + 26, BASE - 26); c.fill();
  } },
};

/** The land beyond, through the opening (stamped). */
const paintVista = (c: Ctx, land: Land, cx: number) => {
  const V = VISTA[land.id];
  c.save(); c.beginPath(); openingPath(c, cx); c.clip();
  const n = V.sky.length, sh = (BASE - 26 - TOP) / n;
  V.sky.forEach((col, i) => box(c, cx - HW, TOP + i * sh, HW * 2, sh + 1, col));
  for (let i = 1; i < n; i++) checker(c, cx - HW, Math.round(TOP + i * sh) - 2, HW * 2, 2, V.sky[i]);
  V.paint(c, cx);
  box(c, cx - HW, BASE - 26, HW * 2, 26, V.ground);
  checker(c, cx - HW, BASE - 26, HW * 2, 2, mix(V.ground, '#FFFFFF', 0.3));
  // (the path running on into the land, to its own far end)
  c.fillStyle = V.path; c.beginPath(); c.moveTo(cx - PATH.far, BASE); c.lineTo(cx + PATH.far, BASE); c.lineTo(cx + 3, BASE - 26); c.lineTo(cx - 3, BASE - 26); c.closePath(); c.fill();
  c.strokeStyle = mix(V.path, INK, 0.4); c.lineWidth = 1; c.stroke();
  for (let k = 1; k < 5; k++) { const y = BASE - 26 + 26 * (k / 5) ** 1.6, w = 3 + (PATH.far - 3) * (k / 5) ** 1.6; box(c, cx - w, y, w * 2, 1, mix(V.path, INK, 0.25)); }
  c.restore();
};

/** The frame round the opening, by land (stamped), and its name over it. */
const paintFrame = (c: Ctx, land: Land, cx: number) => {
  const ring = (cols: string[], w: number = FR) => {
    // (the frame round the opening: stepped bands out from it, inked both edges; the opening itself left be)
    const band = (outer: number, inner: number, col: string) => { c.beginPath(); openingPath(c, cx, outer); openingPath(c, cx, inner); c.fillStyle = col; c.fill('evenodd'); };
    band(w + 1, w, INK);
    cols.forEach((col, i) => band(w - (i * w) / cols.length, w - ((i + 1) * w) / cols.length, col));
    band(1, 0, INK);
  };

  const L = cx - HW - FR, Rr = cx + HW;
  switch (land.id) {
    case 'space': {
      ring(['#94A3B8', '#E2E8F0', '#F8FAFC', '#CBD5E1']);
      for (const s of [-1, 1]) { inked(c, () => { c.moveTo(cx + s * (HW + FR), BASE); c.lineTo(cx + s * (HW + FR + 14), BASE); c.lineTo(cx + s * (HW + FR + 2), BASE - 46); c.closePath(); }, '#22BCAC'); }
      inked(c, () => c.ellipse(cx, TOP - FR - 4, 22, 5, 0, 0, Math.PI * 2), '#E8659E');
      break;
    }
    case 'frontier': {
      for (const x of [L - 2, Rr]) { slab(c, x, TOP + 8, FR + 2, H - 8, R6('#7A4E2A')); for (let k = 0; k < 6; k++) box(c, x + 1, TOP + 20 + k * 13, FR, 1, '#4A2E18'); }
      slab(c, L - 12, TOP - 6, Rr - L + FR + 26, 14, R6('#8A5A32'));
      for (const x of [L - 12, Rr + FR + 12]) inked(c, () => c.arc(x, TOP + 1, 6, 0, Math.PI * 2), '#B88A5A');
      // (a longhorn skull nailed on)
      inked(c, () => c.ellipse(cx, TOP + 1, 5, 4, 0, 0, Math.PI * 2), '#F5F0E0');
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 4, TOP); c.quadraticCurveTo(cx - 14, TOP - 2, cx - 18, TOP - 8); c.moveTo(cx + 4, TOP); c.quadraticCurveTo(cx + 14, TOP - 2, cx + 18, TOP - 8); c.stroke();
      c.strokeStyle = '#F5F0E0'; c.lineWidth = 1.5; c.stroke();
      break;
    }
    case 'spooky': {
      ring(['#3F3A4C', '#57506A', '#6E6684', '#57506A']);
      // (a crooked pointed gable over it, a skull in the keystone)
      c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.moveTo(L - 4, TOP + 22); c.lineTo(cx + 3, TOP - 30); c.lineTo(Rr + FR + 4, TOP + 20); c.stroke();
      c.strokeStyle = '#57506A'; c.lineWidth = 7; c.stroke();
      inked(c, () => c.arc(cx + 1, TOP - 12, 6, 0, Math.PI * 2), '#E7E5E4'); box(c, cx - 3, TOP - 13, 2, 2, INK); box(c, cx + 2, TOP - 13, 2, 2, INK);
      // (cobwebs in the corners)
      c.strokeStyle = 'rgba(241, 245, 249, 0.6)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(cx - HW, TOP + HW, 6 + k * 4, -Math.PI / 2, -Math.PI * 0.95, true); c.stroke(); }
      break;
    }
    case 'cartoon': {
      ring(['#FDE047', '#FEF08A', '#FDE047', '#EAB308'], FR + 2);
      for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const y = BASE - 12 - k * 20; inked(c, () => c.arc(cx + s * (HW + FR / 2 + 1), y, 3, 0, Math.PI * 2), ['#EC4899', '#60A5FA', '#4ADE80'][k % 3]); }
      // (a cloud on top, googly eyes)
      for (const [dx, r] of [[-16, 11], [0, 15], [16, 11]] as const) inked(c, () => c.arc(cx + dx, TOP - FR - 4, r, 0, Math.PI * 2), '#FFFFFF');
      box(c, cx - 26, TOP - FR - 4, 52, 10, '#FFFFFF');
      break;
    }
    case 'hollywood': {
      ring(['#18181B', '#27272A', '#CA8A04', '#27272A'], FR + 1);
      for (const s of [-1, 1]) { const x = s < 0 ? L - 12 : Rr + FR + 2; slab(c, x, BASE - 90, 10, 90, R6('#27272A')); for (let k = 0; k < 5; k++) box(c, x + 2, BASE - 82 + k * 16, 6, 2, '#CA8A04'); slab(c, x - 2, BASE - 98, 14, 8, R6('#3F3F46')); }
      break;
    }
    case 'fantasy': {
      ring(['#A8A29E', '#D6D3D1', '#E7E5E4', '#D6D3D1'], FR + 1);
      for (const s of [-1, 1]) { const x = s < 0 ? L - 14 : Rr + FR + 2; slab(c, x, BASE - 74, 12, 74, R6('#D6D3D1')); inked(c, () => { c.moveTo(x - 3, BASE - 74); c.lineTo(x + 6, BASE - 100); c.lineTo(x + 15, BASE - 74); c.closePath(); }, '#2563EB'); }
      // (a gilded crown in the keystone)
      inked(c, () => { c.moveTo(cx - 9, TOP - FR + 2); c.lineTo(cx - 9, TOP - FR - 8); c.lineTo(cx - 4, TOP - FR - 3); c.lineTo(cx, TOP - FR - 10); c.lineTo(cx + 4, TOP - FR - 3); c.lineTo(cx + 9, TOP - FR - 8); c.lineTo(cx + 9, TOP - FR + 2); c.closePath(); }, '#F6D365');
      break;
    }
    case 'adventure': {
      ring(['#78716C', '#A8A29E', '#D6D3D1', '#A8A29E'], FR + 1);
      for (let k = 0; k < 6; k++) box(c, cx - HW - FR + 1 + (k % 2) * 2, TOP + 30 + k * 10, 4, 4, '#57534E');
      for (let k = 0; k < 6; k++) box(c, cx + HW + 2 + (k % 2) * 2, TOP + 34 + k * 10, 4, 4, '#57534E');
      // (the idol's face over it: glaring)
      slab(c, cx - 18, TOP - FR - 20, 36, 24, R6('#8A847C'));
      box(c, cx - 12, TOP - FR - 14, 8, 5, INK); box(c, cx + 4, TOP - FR - 14, 8, 5, INK); box(c, cx - 9, TOP - FR - 13, 3, 3, '#F59E0B'); box(c, cx + 7, TOP - FR - 13, 3, 3, '#F59E0B');
      box(c, cx - 9, TOP - FR - 5, 18, 4, INK); for (let k = 0; k < 4; k++) box(c, cx - 8 + k * 4, TOP - FR - 5, 2, 2, '#E7E5E4');
      for (const x of [cx - HW - 2, cx + HW - 2]) for (let k = 0; k < 5; k++) box(c, x + (k % 2) * 2, TOP + 6 + k * 9, 3, 9, '#15803D');
      break;
    }
    case 'foreign': {
      ring(['#1E3A8A', '#F8FAFC', '#1E40AF', '#DC2626'], FR + 1);
      // (tiles round it: the mosaic)
      for (let a = 0; a < 9; a++) { const t = Math.PI + (a / 8) * Math.PI; box(c, cx + Math.cos(t) * (HW + FR / 2) - 1, TOP + HW + Math.sin(t) * (HW + FR / 2) - 1, 3, 3, a % 2 ? '#FDE047' : '#F8FAFC'); }
      break;
    }
  }
  // The sign over it, in the land's lettering
  const look = LAND_LOOK[land.id](land.id !== 'hollywood');
  const big = land.id === 'hollywood' ? LAND_LOOK.hollywood(true) : look;
  const tw = signW(land.name, big) + 14, th = (big.sy ?? 1) * 7 + 10, ty = TOP - FR - (land.id === 'adventure' ? 26 : land.id === 'spooky' ? 34 : land.id === 'cartoon' ? 22 : 8) - th;
  const board = land.sign;
  box(c, cx - tw / 2 - 1, ty - 1, tw + 2, th + 2, INK);
  box(c, cx - tw / 2, ty, tw, th, board); box(c, cx - tw / 2, ty, tw, 2, mix(board, '#FFFFFF', 0.25)); box(c, cx - tw / 2, ty + th - 2, tw, 2, mix(board, '#000000', 0.3));
  if (land.id === 'frontier') for (let k = 3; k < th; k += 4) box(c, cx - tw / 2 + 2, ty + k, tw - 4, 1, mix(board, '#000000', 0.2));
  // (posts up from the frame to it)
  for (const s of [-1, 1]) box(c, cx + s * (tw / 2 - 8) - 1, ty + th, 3, TOP - FR - ty - th + 2, mix(board, '#000000', 0.35));
  signText(c, land.name, cx, ty + th - 5, big);
};

/** The gateposts at the mouth of the path, by land (stamped; their flames live: drawGateLive). */
export const paintPosts = (c: Ctx, land: Land, cx: number) => {
  const y = ROW.fence + 2, hw = (PATH.far / depthAt(GATE.base)) * depthAt(y) + 8;
  for (const s of [-1, 1]) {
    const x = cx + s * hw;
    switch (land.id) {
      case 'space': inked(c, () => c.roundRect(x - 4, y - 46, 8, 46, 4), '#CBD5E1'); box(c, x - 2, y - 42, 2, 38, '#F8FAFC'); inked(c, () => c.ellipse(x, y - 46, 9, 3, 0, 0, Math.PI * 2), '#22BCAC'); break;
      case 'frontier': slab(c, x - 4, y - 44, 8, 44, R6('#7A4E2A')); inked(c, () => c.rect(x - 5, y - 54, 10, 10), '#3F3F46'); box(c, x - 3, y - 52, 6, 6, '#FDE68A'); break;
      case 'spooky': slab(c, x - 7, y - 34, 14, 34, R6('#6E6684')); inked(c, () => c.ellipse(x, y - 40, 9, 7, 0, 0, Math.PI * 2), '#EA580C'); box(c, x - 1, y - 49, 2, 3, '#3F6212'); box(c, x - 5, y - 42, 3, 2, INK); box(c, x + 2, y - 42, 3, 2, INK); box(c, x - 4, y - 38, 8, 2, INK); break;
      case 'cartoon': {
        c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 46); c.arc(x - s * 8, y - 46, 8, 0, Math.PI, true); c.stroke();
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.stroke(); c.setLineDash([4, 4]); c.strokeStyle = '#DC2626'; c.stroke(); c.setLineDash([]); c.lineCap = 'butt';
        break;
      }
      case 'hollywood': slab(c, x - 5, y - 50, 10, 50, R6('#E8DCC4')); for (let k = 0; k < 3; k++) box(c, x - 3, y - 44 + k * 12, 6, 2, '#C9A227'); inked(c, () => c.arc(x, y - 54, 5, 0, Math.PI * 2), '#FDE68A'); break;
      case 'fantasy': slab(c, x - 6, y - 38, 12, 38, R6('#D6D3D1')); inked(c, () => c.arc(x, y - 43, 6, 0, Math.PI * 2), '#F6D365'); box(c, x - 3, y - 46, 2, 2, '#FFFBEB'); break;
      case 'adventure': {
        // (a tiki torch: lashed bamboo, the cup)
        box(c, x - 2, y - 50, 5, 50, INK); box(c, x - 1, y - 50, 3, 50, '#B4CC5C'); for (let k = 0; k < 4; k++) box(c, x - 2, y - 44 + k * 12, 5, 1, '#6A8A28');
        inked(c, () => { c.moveTo(x - 6, y - 56); c.lineTo(x + 6, y - 56); c.lineTo(x + 3, y - 48); c.lineTo(x - 3, y - 48); c.closePath(); }, '#8A5A32');
        break;
      }
      case 'foreign': box(c, x - 1, y - 60, 3, 60, '#57534E'); inked(c, () => c.arc(x, y - 61, 3, 0, Math.PI * 2), '#C9A227'); break;
    }
  }
};

/** Where a portal's queue runs (beside its path, along the back of the walk): its left and right ends. */
export const queueSpan = (cx: number) => { const hw = (PATH.far / depthAt(GATE.base)) * depthAt(ROW.fence + 2) + 8; return [cx - hw - 112, cx - hw - 16] as const; };
/** A queue rail (one run of it, feet at ry): posts, the rope swagged between, and at its head (`sign`) the wait. */
export const paintQueueRail = (c: Ctx, land: Land, cx: number, ry: number, sign: boolean) => {
  const [qx0, qx1] = queueSpan(cx);
  for (let x = qx0; x <= qx1 + 1; x += 32) { box(c, x - 1, ry - 15, 3, 15, INK); box(c, x, ry - 15, 1, 15, '#D6D3D1'); box(c, x - 3, ry - 2, 7, 2, '#57534E'); }
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); for (let x = qx0; x < qx1; x += 32) { c.moveTo(x, ry - 12); c.quadraticCurveTo(x + 16, ry - 7, x + 32, ry - 12); } c.stroke();
  c.strokeStyle = land.swirl[1]; c.lineWidth = 1.5; c.stroke();
  if (!sign) return;
  box(c, qx1 + 1, ry - 34, 2, 20, INK);
  box(c, qx1 - 20, ry - 46, 44, 14, INK); box(c, qx1 - 19, ry - 45, 42, 12, land.sign);
  signText(c, 'WAIT 5 MIN', qx1 + 2, ry - 36, { sx: 1, sy: 1, fill: land.signText });
};

/** The still part of a portal (one stamp): the land through its opening, its frame and sign. */
export const paintGate = (c: Ctx, land: Land, cx: number) => {
  // (a glow round the opening, under the swirl: the land's light stepped out)
  for (let k = 3; k >= 1; k--) { c.fillStyle = mix(land.swirl[0], land.swirl[1], k / 4); c.globalAlpha = 0.18 + 0.1 * (3 - k); c.beginPath(); c.ellipse(cx, GATE_MID - 4, HW + FR + GATE.halo + k * 3, H * 0.5 + FR + GATE.halo + k * 3, 0, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  paintVista(c, land, cx);
  paintFrame(c, land, cx);
};

/**
 * The swirl round the outside of the portal (live): a band of the land's deep color round the frame, its arms (the
 * mid and the bright colors) curving out round it and turning, a lit rim crawling round the outside, flecks flung off. `f` the swirl's clock (run ahead as it takes
 * him). Only the part above the ground.
 */
export const drawSwirl = (c: Ctx, land: Land, cx: number, f: number, surge = 0) => {
  const rx0 = HW + FR + 3, ry0 = H * 0.5 + FR + 3, cy = GATE_MID - 4;
  // (the angles of the ellipse that are above the portal's foot)
  const lim = (r: number) => Math.asin(Math.max(-1, Math.min(1, (BASE - cy) / r)));
  const [deep, mid, hi] = land.swirl, halo = GATE.halo + surge * 6;
  c.save();
  c.lineCap = 'round';
  // (the bed of it: the deep color, a band round the frame)
  { const rx = rx0 + halo / 2, ry = ry0 + halo / 2, a = lim(ry); c.globalAlpha = 0.75; c.strokeStyle = deep; c.lineWidth = halo; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI - a, Math.PI * 2 + a); c.stroke(); c.globalAlpha = 1; }
  // (its arms: curving out round it as they go, turning; the bright ones over the mid ones)
  const spin = f * (0.035 + surge * 0.12);
  for (let pass = 0; pass < 2; pass++) for (let j = pass; j < 12; j += 2) {
    const th0 = (j / 12) * Math.PI * 2 + spin;
    c.strokeStyle = pass ? hi : mid; c.lineWidth = pass ? 2 : 3;
    c.beginPath();
    let pen = false;
    for (let k = 0; k <= 6; k++) {
      const t = k / 6, th = th0 + t * 0.8, x = cx + Math.cos(th) * (rx0 + t * halo), y = cy + Math.sin(th) * (ry0 + t * halo);
      if (y > BASE - 1) { pen = false; continue; }
      if (pen) c.lineTo(x, y); else { c.moveTo(x, y); pen = true; }
    }
    c.stroke();
  }
  // (a lit rim round the outside of it)
  { const rx = rx0 + halo, ry = ry0 + halo, a = lim(ry); c.setLineDash([3, 5]); c.lineDashOffset = -f * 0.5; c.strokeStyle = hi; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI - a, Math.PI * 2 + a); c.stroke(); c.setLineDash([]); }
  // (flecks going round, spiraling out)
  for (let k = 0; k < 10; k++) {
    const t = ((f * (0.012 + surge * 0.03) + k / 10) % 1), ang = k * 2.4 + f * 0.05 * (k % 2 ? 1 : -1), r = 1 + t * 0.35;
    const x = cx + Math.cos(ang) * (rx0 + 6) * r, y = cy + Math.sin(ang) * (ry0 + 6) * r;
    if (y > BASE - 2) continue;
    box(c, x - 1, y - 1, 2, 2, k % 3 ? '#FFFFFF' : hi);
  }
  c.restore();
};

/** The shimmer through the opening (live): a light band rising up it now and then. */
export const drawShimmer = (c: Ctx, land: Land, cx: number, f: number) => {
  const t = (f % 150) / 150;
  if (t > 0.5) return;
  const y = BASE - (t / 0.5) * H;
  c.save(); c.beginPath(); openingPath(c, cx); c.clip();
  c.globalAlpha = 0.35 * Math.sin((t / 0.5) * Math.PI);
  box(c, cx - HW, y, HW * 2, 2, '#FFFFFF'); box(c, cx - HW, y + 4, HW * 2, 1, land.swirl[2]);
  c.restore();
};

/** The flames and lights at the posts (live). */
export const drawPostsLive = (c: Ctx, land: Land, cx: number, f: number) => {
  const y = ROW.fence + 2, hw = (PATH.far / depthAt(GATE.base)) * depthAt(y) + 8;
  for (const s of [-1, 1]) {
    const x = cx + s * hw, fl = Math.sin(f * 0.4 + s * 2) * 1.5;
    if (land.id === 'adventure') { box(c, x - 4, y - 66 + fl, 8, 10, '#F97316'); box(c, x - 2, y - 63 + fl, 4, 6, '#FDE047'); box(c, x - 1, y - 70 + fl * 2, 2, 4, '#FB923C'); }
    else if (land.id === 'spooky') { box(c, x - 4, y - 42, 2, 2, (f + s * 7) % 23 < 3 ? '#7C2D12' : '#FDE047'); box(c, x + 2, y - 42, 2, 2, (f + s * 7) % 23 < 3 ? '#7C2D12' : '#FDE047'); }
    else if (land.id === 'space') { if (((f >> 4) + (s > 0 ? 1 : 0)) % 2) box(c, x - 1, y - 50, 2, 2, '#FFFFFF'); }
    else if (land.id === 'foreign') { c.fillStyle = s < 0 ? '#DC2626' : '#1E40AF'; c.beginPath(); c.moveTo(x + 1, y - 58); c.lineTo(x + 16, y - 55 + Math.sin(f * 0.1 + s) * 2); c.lineTo(x + 1, y - 50); c.fill(); }
  }
  void hash;
};

export type { StretchId };
