// The stage, painted (art.ts puts each at its depth): THE BAND SHELL (a quarter dome of sun-faded cream and blue panels
// stepping back to its dark heart, steel ribs, panel seams and their bolts bleeding rust, paint peeled to the gray
// primer, water streaks, a few panels gone (the framework behind), pigeons on its lip and what they leave; the lip's
// chasing bulbs, some dead; its straight side a concrete pier), two speaker clusters flown off it on chains, the red
// STUPID DAD LIVE! banner (vinyl, grommets, wrinkles, sun-faded up top, a torn corner), the APPLAUSE box (lit with the
// laugh track). THE SET at its depth: the sitcom living room as the cheap set it is: plywood flats, their seams taped
// (the tape a shade off), their raw top edges, a stage jack and sandbags at each end; mustard diamond wallpaper (a water
// stain, clean squares where pictures hung, a seam lifting), fake-wood paneling, the chair rail, the baseboard; the
// fake window onto a painted backyard (a picket fence, the swing set, the grill, REX's doghouse, the neighbor's roof:
// a crease across the painting), its orange curtains; the family portrait with the black ribbon across its corner; the
// clock stopped at five over IT'S FIVE O'CLOCK SOMEWHERE; a shelf of bowling trophies; the wall phone; the kitchen's
// doorway (dark beyond: backstage) and its swing door with the porthole; the laugh-track horn bolted on top of the flat
// (it shakes when the laughs play). The TV on its cart (wood grain, rabbit ears with foil on them, the VCR flashing
// 12:00; the game: the same tape every show), the braided rug, the Boy's steel track.

import { signText } from '../../signLetters';
import { stamp } from '../../../m1/game/render/stamp';
import { timeOfDay } from '../../timeOfDay';
import { dadArt } from '../bigkid/art';
import { X, STAGE_Y, SHELL, SET, KITCHEN } from './layout';
import {
  box, mix, hash, checker, hour, INK, NR, NC, r6, SHELLC, SHELLB, PRIMER, CONC, STEEL, BRASS, RED, NAVY, WALLP, PANELS, PLY,
  SHOWL, tiny, stencil, paneling, rail, baseboard, drape, peel, streaks, rustRun, bulb, deadBulb, type Ctx,
} from './mats';

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-am-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;

// ---------------------------------------------------------------------------------------------------------------
// The band shell

const SH = { cx: () => X(SHELL.b), rx: SHELL.b - SHELL.a, ry: 400, rings: 7 };
/** A point on the shell at angle a (PI: its foot at the front; 1.5 PI: its crown) and radius k (1 the lip). */
const onShell = (a: number, k: number) => ({ x: SH.cx() + Math.cos(a) * SH.rx * k, y: STAGE_Y + Math.sin(a) * SH.ry * k });

export const drawShell = (c: Ctx, f: number) => {
  const cx = SH.cx(), cy = STAGE_Y, rx = SH.rx, ry = SH.ry;
  stamp(c, key('shell2'), cx - rx - 40, cy - ry - 40, rx + 90, ry + 44, g => {
    const q = (k: number, pad = 0) => { g.beginPath(); g.ellipse(cx, cy, rx * k + pad, ry * k + pad, 0, Math.PI, Math.PI * 1.5); g.lineTo(cx, cy); g.closePath(); };
    const fillQ = (k: number, col: string, pad = 0) => { q(k, pad); g.fillStyle = col; g.fill(); };
    const ditherQ = (k: number, col: string) => { g.save(); q(k); g.clip(); checker(g, cx - rx - 20, cy - ry - 20, rx + 40, ry + 24, col, 0, 1); g.restore(); };
    // (the lip: a thick concrete rim, lit along its top, the stain under it)
    const L = NR(CONC);
    fillQ(1, INK, 22); fillQ(1, L[2], 20); fillQ(1, L[3], 17); fillQ(1, L[4], 15); fillQ(1, L[3], 12); fillQ(1, L[1], 6); fillQ(1, INK, 2);
    // (the rings: each stepping back under the one outside it: lit at its outer edge, shaded into its inner one)
    const band = 1 / SH.rings;
    for (let i = 0; i < SH.rings - 1; i++) {
      const k = 1 - i * band, R = NR(i % 2 ? SHELLB : SHELLC);
      fillQ(k, R[4]); fillQ(k - 0.01, R[3]);
      ditherQ(k - band * 0.5, R[2]); fillQ(k - band * 0.58, R[2]);
      ditherQ(k - band * 0.8, R[1]); fillQ(k - band * 0.86, R[1]);
      fillQ(k - band, INK, 2);
    }
    // (its heart: the back of the dome, dark, stepped)
    const N = NR(NAVY);
    fillQ(band, N[2]); fillQ(band * 0.7, N[1]); ditherQ(band * 0.85, N[1]); fillQ(band * 0.4, N[0]);
    // (the panels' seams, radial, each end bolted; rust bleeding off some of the bolts)
    g.save(); q(1); g.clip();
    for (let i = 0; i < SH.rings - 1; i++) {
      const k0 = 1 - i * band, k1 = k0 - band, R = NR(i % 2 ? SHELLB : SHELLC), n = 6 + i * 2;
      for (let j = 1; j < n; j++) {
        const a = Math.PI + (j / n) * Math.PI * 0.5 + (i % 2) * 0.02, p0 = onShell(a, k0 - 0.01), p1 = onShell(a, k1 + 0.004);
        g.strokeStyle = R[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
        g.strokeStyle = R[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(p0.x - 2, p0.y); g.lineTo(p1.x - 2, p1.y); g.stroke();
        for (const p of [onShell(a, k0 - band * 0.12), onShell(a, k1 + band * 0.12)]) { box(g, p.x - 1, p.y - 1, 3, 3, R[0]); box(g, p.x - 1, p.y - 1, 1, 1, R[5]); if (hash(i * 31 + j * 7.3) > 0.55) rustRun(g, p.x, p.y + 2, 8 + hash(i + j) * 22, NR(['#3A1606', '#5E260C', '#8A3A14', '#B4561E', '#D47C3E', '#F0AE7A'])); }
      }
      // (water streaks down off the ring above; paint peeled to the primer)
      for (let s = 0; s < 6 + i * 2; s++) {
        const a = Math.PI + hash(i * 9.1 + s) * Math.PI * 0.48 + 0.01, p = onShell(a, k0 - 0.012);
        streaks(g, p.x - 4, p.y, 12, 18 + hash(s * 3 + i) * 36, i * 17 + s, R[2], 1);
        if (hash(s * 5.3 + i) > 0.45) { const pp = onShell(a + 0.03, k0 - band * (0.3 + hash(s + i * 2) * 0.4)); peel(g, pp.x - 14, pp.y - 8, 34, 18, i * 13 + s, NR(PRIMER)[3], NR(PRIMER)[1], R[5], 2); }
      }
    }
    // (three panels gone: the dark of the framework behind, its angle iron)
    for (const [a0, i] of [[1.08, 1], [1.28, 3], [1.18, 4]] as const) {
      const k0 = 1 - i * band - 0.012, k1 = k0 - band + 0.024, a = Math.PI * a0, da = 0.05;
      const pts = [onShell(a, k0), onShell(a + da, k0), onShell(a + da, k1), onShell(a, k1)];
      g.fillStyle = INK; g.beginPath(); pts.forEach((p, n) => (n ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill();
      g.fillStyle = N[0]; g.beginPath(); pts.forEach((p, n) => (n ? g.lineTo(p.x + (n === 1 || n === 2 ? -2 : 2), p.y + 2) : g.moveTo(p.x + 2, p.y + 2))); g.closePath(); g.fill();
      const m0 = onShell(a + da / 2, k0), m1 = onShell(a + da / 2, k1); g.strokeStyle = NR(STEEL)[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(m0.x, m0.y + 2); g.lineTo(m1.x, m1.y - 2); g.moveTo(pts[0].x + 3, pts[0].y + 3); g.lineTo(pts[2].x - 3, pts[2].y - 3); g.stroke();
    }
    g.restore();
    // (the ribs: steel, from the heart out to the lip, stepped)
    const S = NR(STEEL);
    for (let j = 1; j < 8; j++) {
      const a = Math.PI + (j / 8) * Math.PI * 0.5, p0 = onShell(a, band * 0.7), p1 = onShell(a, 1.01);
      g.lineCap = 'butt';
      g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
      g.strokeStyle = S[2]; g.lineWidth = 5; g.stroke();
      g.strokeStyle = S[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(p0.x - 1.5, p0.y - 1); g.lineTo(p1.x - 1.5, p1.y - 1); g.stroke();
      for (let k = 0.2; k < 1; k += 0.14) { const p = onShell(a, k); box(g, p.x - 2, p.y - 2, 4, 4, S[1]); box(g, p.x - 2, p.y - 2, 2, 2, S[4]); }
    }
    // (pigeons on the lip, and what they leave down the panels under them)
    for (const a0 of [1.12, 1.19, 1.33, 1.41]) {
      const a = Math.PI * a0, p = onShell(a, 1.03);
      streaks(g, p.x - 2, p.y + 6, 6, 40, a0 * 100, '#F4F1EA', 1);
      box(g, p.x - 5, p.y - 6, 9, 6, INK); box(g, p.x - 4, p.y - 5, 7, 4, '#8A8A96'); box(g, p.x - 4, p.y - 5, 3, 2, '#B4B4C0'); box(g, p.x - 7, p.y - 7, 4, 4, INK); box(g, p.x - 6, p.y - 6, 2, 2, '#7A7A88'); box(g, p.x - 8, p.y - 5, 1, 1, '#E8A040'); box(g, p.x + 3, p.y - 3, 3, 2, '#5A5A66');
    }
    // (the straight side: a concrete pier down to the deck; the footing at the front)
    box(g, cx - 2, cy - ry - 24, 34, ry + 24, INK); box(g, cx, cy - ry - 22, 30, ry + 22, L[3]); box(g, cx, cy - ry - 22, 4, ry + 22, L[4]); box(g, cx + 22, cy - ry - 22, 8, ry + 22, L[2]); checker(g, cx + 20, cy - ry - 22, 2, ry + 22, L[2], 0, 1);
    for (let y = cy - ry; y < cy; y += 40) box(g, cx, y, 30, 1, L[1]);
    streaks(g, cx + 2, cy - ry - 20, 26, ry * 0.6, 77, L[1], 4);
    box(g, cx - rx - 26, cy - 34, 52, 34, INK); box(g, cx - rx - 25, cy - 33, 50, 33, L[3]); box(g, cx - rx - 25, cy - 33, 50, 3, L[4]); box(g, cx - rx + 17, cy - 33, 8, 33, L[2]);
  });
  // (the lip's bulbs: chasing; the dead ones dead)
  const n = 52;
  for (let k = 0; k < n; k++) {
    const a = Math.PI + (k / (n - 1)) * Math.PI * 0.5, bx = cx + Math.cos(a) * (rx + 10), by = cy + Math.sin(a) * (ry + 10);
    bulb(c, Math.round(bx), Math.round(by), 2, deadBulb(k, 3) ? 'dead' : (k + Math.floor(f / 6)) % 3 === 0 ? 'on' : 'off');
  }
};

/** How high the shell's surface is over the deck at rx (its quarter ellipse). */
export const shellH = (rx: number) => { const u = (SHELL.b - rx) / SH.rx; return u >= 1 ? 0 : SH.ry * Math.sqrt(1 - u * u); };

/** A speaker cluster flown off the shell on chains (`n` cabinets, the bar at `bar` over the deck), at its own depth. */
export const drawFlown = (c: Ctx, rx: number, n: number, bar: number) => {
  const x = X(rx), top = STAGE_Y - shellH(rx) + 10, by = STAGE_Y - bar;
  stamp(c, key(`flown-${rx}`), x - 40, top - 4, 80, by - top + n * 38 + 10, g => {
    const S = NR(STEEL), K = NR(['#0C0C10', '#16161C', '#22222A', '#30303A', '#44444F', '#5E5E6A']);
    for (const s of [-1, 1]) { for (let y = top; y < by - 2; y += 6) { box(g, x + s * 14 - 1, y, 3, 4, S[2]); box(g, x + s * 14, y + 1, 1, 2, S[4]); } }
    box(g, x - 22, by - 2, 44, 5, INK); box(g, x - 21, by - 1, 42, 3, S[3]);
    for (let i = 0; i < n; i++) {
      const y = by + 4 + i * 38, dx = i * 3;
      box(g, x - 20 + dx - 1, y - 1, 38, 36, INK); box(g, x - 20 + dx, y, 36, 34, K[2]); box(g, x - 20 + dx, y, 36, 2, K[4]); box(g, x + 12 + dx, y, 4, 34, K[0]);
      g.fillStyle = K[0]; g.beginPath(); g.arc(x - 4 + dx, y + 20, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = K[3]; g.beginPath(); g.arc(x - 4 + dx, y + 20, 4, 0, Math.PI * 2); g.fill(); box(g, x - 6 + dx, y + 18, 2, 2, K[5]);
      box(g, x - 12 + dx, y + 4, 16, 6, K[1]); for (let k = 0; k < 4; k++) box(g, x - 11 + dx + k * 4, y + 5, 2, 4, K[3]);
      box(g, x - 18 + dx, y + 30, 6, 2, '#C8A848');
    }
  });
};

/** The banner hung off the shell on chains (STUPID DAD LIVE!), the APPLAUSE box under it (lit with the laughs). */
export const drawBanner = (c: Ctx, f: number, applause: boolean) => {
  const mid = (SET.a + SET.b) / 2, bx = X(mid), by = STAGE_Y - 300, S = NR(STEEL);
  for (const s of [-1, 1]) for (let y = STAGE_Y - shellH(mid + s * 160) + 8; y < by + 2; y += 6) { box(c, bx + s * 160 - 1, y, 3, 4, S[1]); box(c, bx + s * 160, y + 1, 1, 2, S[4]); }
  stamp(c, key('banner2'), bx - 196, by - 8, 392, 92, g => {
    const R = NR(RED), w = 364, h = 72, l = bx - w / 2;
    const sheet = () => { g.beginPath(); g.moveTo(l, by); g.lineTo(l + w, by); g.lineTo(l + w, by + h - 10); g.lineTo(l + w - 14, by + h - 2); g.lineTo(l + w - 22, by + h + 6); g.lineTo(l + w - 30, by + h); g.quadraticCurveTo(bx, by + h + 6, l, by + h); g.closePath(); };
    g.fillStyle = INK; g.save(); g.translate(0, 0); sheet(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.restore();
    g.save(); sheet(); g.clip();
    box(g, l, by, w, h + 8, R[3]); box(g, l, by, w, 14, mix(R[3], '#F4E0D0', 0.25)); checker(g, l, by + 14, w, 2, mix(R[3], '#F4E0D0', 0.25), 0, 1);
    box(g, l, by + h - 12, w, 20, R[2]); checker(g, l, by + h - 14, w, 2, R[2], 1, 1);
    // (the wrinkles off the grommets)
    for (const [gx, d] of [[l + 8, 1], [l + w - 8, -1]] as const) for (let k = 0; k < 3; k++) { g.strokeStyle = R[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(gx, by + 6); g.lineTo(gx + d * (30 + k * 18), by + 22 + k * 10); g.stroke(); g.strokeStyle = R[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(gx, by + 4); g.lineTo(gx + d * (30 + k * 18), by + 20 + k * 10); g.stroke(); }
    box(g, l, by, w, 3, R[5]); box(g, l, by + 3, w, 1, R[1]);
    g.restore();
    for (const gx of [l + 8, l + w - 8, bx]) { box(g, gx - 3, by + 3, 6, 6, INK); box(g, gx - 2, by + 4, 4, 4, NR(BRASS)[4]); box(g, gx - 1, by + 5, 2, 2, INK); }
    signText(g, 'STUPID DAD', bx - 40, by + 44, SHOWL(3));
    signText(g, 'LIVE!', bx + 120, by + 44, { sx: 3, sy: 3, bold: true, slant: 1, fill: ['#FFFFFF', '#FDE68A'], dither: true, ink: INK, shadow: '#3B0764', drop: 2 });
    signText(g, 'PRESENTED BY SWILL LITE', bx, by + 62, tiny(mix('#FDE68A', R[3], 0.3)));
  });
  // (the APPLAUSE box: steel, riveted, the red glass lit while the laughs play)
  const ay = STAGE_Y - 216;
  for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + s * 40, by + 74); c.lineTo(bx + s * 40, ay); c.stroke(); }
  box(c, bx - 56, ay - 2, 112, 30, INK); box(c, bx - 55, ay - 1, 110, 28, S[2]); box(c, bx - 55, ay - 1, 110, 1, S[4]); box(c, bx + 51, ay - 1, 4, 28, S[1]);
  for (const rx of [bx - 52, bx + 49]) for (const ry of [ay + 1, ay + 23]) box(c, rx, ry, 2, 2, S[4]);
  const on = applause && (f % 20) < 16;
  box(c, bx - 50, ay + 3, 100, 20, on ? '#F43F3F' : '#3A0E10');
  if (on) { box(c, bx - 50, ay + 3, 100, 4, '#FF8A80'); checker(c, bx - 50, ay + 7, 100, 2, '#FF8A80', 0, 1); }
  else { box(c, bx - 50, ay + 3, 100, 2, '#5A1A1A'); box(c, bx - 46, ay + 5, 20, 2, '#6A2A2A'); }
  signText(c, 'APPLAUSE', bx, ay + 18, on ? { sx: 1, sy: 2, bold: true, fill: '#FFFFFF', glow: '#FF6060' } : { sx: 1, sy: 2, bold: true, fill: '#6A2828' });
};

// ---------------------------------------------------------------------------------------------------------------
// The set (the sitcom living room, as the cheap set it is)

const WIN_X = 2990, PORTRAIT_X = 3226, CLOCK_X = 3460;

/** The painted backyard in the fake window (x, y its top left, 120 x 80): naive flat paint, a crease across it. */
const backyard = (g: Ctx, x: number, y: number) => {
  const sky = ['#7EC4F0', '#94D0F2', '#AEDCF4', '#C8E8F6'];
  sky.forEach((col, i) => box(g, x, y + i * 9, 120, 10, col));
  g.fillStyle = '#FFFFFF'; for (const [cx, cy] of [[30, 10], [86, 16]]) { g.beginPath(); g.arc(x + cx, y + cy, 6, 0, Math.PI * 2); g.arc(x + cx + 8, y + cy - 2, 7, 0, Math.PI * 2); g.arc(x + cx + 16, y + cy, 5, 0, Math.PI * 2); g.fill(); }
  // (the neighbor's house over the fence; a tree)
  box(g, x + 64, y + 26, 50, 22, '#E8D4B0'); g.fillStyle = '#9A3A2A'; g.beginPath(); g.moveTo(x + 60, y + 27); g.lineTo(x + 89, y + 12); g.lineTo(x + 118, y + 27); g.closePath(); g.fill();
  box(g, x + 72, y + 32, 8, 8, '#5A8AC0'); box(g, x + 96, y + 32, 8, 8, '#5A8AC0');
  g.fillStyle = '#3A8A3A'; g.beginPath(); g.arc(x + 22, y + 30, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5AAA4A'; g.beginPath(); g.arc(x + 18, y + 26, 8, 0, Math.PI * 2); g.fill(); box(g, x + 20, y + 40, 4, 12, '#6A4A2A');
  // (the lawn, the picket fence)
  box(g, x, y + 50, 120, 30, '#5ABA4A'); box(g, x, y + 50, 120, 3, '#7ACA5A'); for (let k = 0; k < 12; k++) box(g, x + 4 + k * 10, y + 60 + (k % 3) * 5, 2, 2, '#4AA03A');
  for (let k = 0; k < 15; k++) { box(g, x + k * 8 + 1, y + 42, 5, 14, '#FAFAF0'); box(g, x + k * 8 + 2, y + 40, 3, 2, '#FAFAF0'); } box(g, x, y + 46, 120, 2, '#E0E0D4'); box(g, x, y + 52, 120, 2, '#E0E0D4');
  // (the swing set, the grill, REX's doghouse)
  g.strokeStyle = '#C83A3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, y + 74); g.lineTo(x + 18, y + 54); g.lineTo(x + 28, y + 74); g.moveTo(x + 42, y + 74); g.lineTo(x + 52, y + 54); g.lineTo(x + 62, y + 74); g.moveTo(x + 18, y + 54); g.lineTo(x + 52, y + 54); g.stroke();
  g.strokeStyle = '#3A3A3A'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 30, y + 55); g.lineTo(x + 30, y + 68); g.moveTo(x + 38, y + 55); g.lineTo(x + 38, y + 68); g.stroke(); box(g, x + 29, y + 68, 10, 2, '#3A3A3A');
  g.fillStyle = '#2A2A2A'; g.beginPath(); g.arc(x + 76, y + 64, 6, 0, Math.PI); g.fill(); box(g, x + 75, y + 68, 2, 8, '#2A2A2A'); box(g, x + 72, y + 74, 8, 1, '#2A2A2A');
  box(g, x + 92, y + 62, 18, 14, '#B86A3A'); g.fillStyle = '#7A3A1A'; g.beginPath(); g.moveTo(x + 90, y + 63); g.lineTo(x + 101, y + 54); g.lineTo(x + 112, y + 63); g.closePath(); g.fill(); box(g, x + 97, y + 67, 8, 9, '#2A1A10'); signText(g, 'REX', x + 101, y + 62, tiny('#FFFFFF'));
  // (the crease across the painted drop, a stain at its corner)
  box(g, x, y + 36, 120, 1, 'rgba(40,30,20,0.25)'); box(g, x, y + 37, 120, 1, 'rgba(255,255,255,0.25)'); checker(g, x + 92, y + 2, 26, 14, 'rgba(120,90,40,0.25)', 0, 1);
};

/** The set's wall (stamped; `cleared`: the show's over, the stage lights off). The swing door's drawn live after. */
export const drawSetWall = (c: Ctx, cleared: boolean) => {
  const a = X(SET.a), b = X(SET.b), top = STAGE_Y - 180;
  stamp(c, key(`setwall2-${cleared ? 1 : 0}`), a - 70, top - 10, b - a + 140, STAGE_Y - top + 12, g => {
    const P = NR(PLY), Wp = NR(WALLP), Pn = NR(PANELS);
    // (the stage jacks behind the flats' ends, sandbags on their feet)
    for (const [ex, s] of [[a, -1], [b, 1]] as const) {
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(ex + s * 2, top + 6); g.lineTo(ex + s * 56, STAGE_Y - 2); g.lineTo(ex + s * 2, STAGE_Y - 2); g.moveTo(ex + s * 2, top + 90); g.lineTo(ex + s * 30, STAGE_Y - 40); g.stroke();
      g.strokeStyle = P[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = P[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(ex + s * 2 - 1, top + 6); g.lineTo(ex + s * 56 - 1, STAGE_Y - 3); g.stroke();
      const sx = ex + s * 40; box(g, sx - 12, STAGE_Y - 12, 24, 12, INK); box(g, sx - 11, STAGE_Y - 11, 22, 10, '#B4A07A'); box(g, sx - 11, STAGE_Y - 11, 22, 3, '#D4C09A'); box(g, sx - 2, STAGE_Y - 14, 4, 4, '#8A7A5A');
    }
    // (the flats: plywood edges, the wallpaper over the top two-thirds)
    box(g, a - 1, top - 1, b - a + 2, STAGE_Y - top + 1, INK);
    box(g, a, top, b - a, 4, P[4]); box(g, a, top, b - a, 1, P[5]); box(g, a, top + 4, b - a, 1, P[1]);
    const wy = top + 5, wh = STAGE_Y - 56 - wy;
    box(g, a, wy, b - a, wh, Wp[3]);
    // (the diamonds: stepped, a lit upper-left edge on each)
    for (let x = a + 14, col = 0; x < b; x += 28, col++) for (let y = wy + 14 + (col % 2) * 14; y < wy + wh - 6; y += 28) {
      g.fillStyle = Wp[2]; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 6, y); g.lineTo(x, y + 7); g.lineTo(x - 6, y); g.closePath(); g.fill();
      g.fillStyle = Wp[4]; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x - 6, y); g.lineTo(x - 4, y); g.lineTo(x, y - 4); g.closePath(); g.fill();
      box(g, x - 1, y - 1, 2, 2, Wp[1]);
    }
    checker(g, a, wy, b - a, 4, Wp[1], 0, 1); box(g, a, wy + wh - 4, b - a, 4, Wp[2]); checker(g, a, wy + wh - 8, b - a, 4, Wp[2], 1, 1);
    // (clean squares where pictures used to hang; a water stain; a seam lifting)
    for (const [px, py, pw, ph] of [[3110, 28, 40, 30], [3610, 22, 34, 44], [2900, 60, 26, 26]] as const) { box(g, X(px), top + py, pw, ph, mix(Wp[3], '#FFFFFF', 0.12)); box(g, X(px) + pw / 2, top + py - 6, 1, 1, Wp[0]); }
    { const sx = X(3540), sy = wy; g.fillStyle = mix(Wp[2], '#6A4A20', 0.35); g.beginPath(); g.ellipse(sx, sy + 18, 26, 20, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = mix(Wp[1], '#4A3010', 0.4); g.lineWidth = 1; g.beginPath(); g.ellipse(sx, sy + 18, 26, 20, 0, 0, Math.PI * 2); g.stroke(); checker(g, sx - 26, sy + 30, 52, 10, Wp[3], 0, 1); }
    // (the flats' seams every 4 ft, the tape over them a shade off)
    for (let x = a + 96; x < b - 20; x += 96) { box(g, x - 4, wy, 8, wh + 52, mix(Wp[3], '#E8DCC0', 0.25)); box(g, x - 4, wy + wh, 8, 52, mix(Pn[3], '#C8B49A', 0.25)); box(g, x, wy, 1, wh + 52, Wp[1]); if (hash(x) > 0.5) { box(g, x - 4, wy + 30 + hash(x * 3) * 40, 8, 6, Wp[4]); box(g, x - 4, wy + 36 + hash(x * 3) * 40, 8, 1, Wp[0]); } }
    // (the paneling, the chair rail, the baseboard)
    paneling(g, a, STAGE_Y - 50, b - a, 42, Pn, 41, 24);
    rail(g, a, STAGE_Y - 55, b - a, Pn);
    baseboard(g, a, STAGE_Y - 9, b - a, 8, Pn);
    // (the fake window: the frame, the painted backyard, the mullions, the orange curtains on their rod, the valance)
    const wx = X(WIN_X), wy2 = top + 30;
    box(g, wx - 7, wy2 - 7, 134, 94, INK); box(g, wx - 6, wy2 - 6, 132, 92, '#F4F0E4'); box(g, wx - 6, wy2 - 6, 132, 2, '#FFFFFF'); box(g, wx + 122, wy2 - 6, 4, 92, '#C8C0AC');
    box(g, wx - 1, wy2 - 1, 122, 82, INK); backyard(g, wx, wy2);
    box(g, wx + 58, wy2, 4, 80, '#F4F0E4'); box(g, wx, wy2 + 38, 120, 4, '#F4F0E4'); box(g, wx + 61, wy2, 1, 80, '#C8C0AC'); box(g, wx, wy2 + 41, 120, 1, '#C8C0AC');
    box(g, wx + 4, wy2 + 4, 16, 2, 'rgba(255,255,255,0.5)'); box(g, wx + 4, wy2 + 6, 2, 10, 'rgba(255,255,255,0.4)');
    box(g, wx - 10, wy2 + 82, 140, 6, INK); box(g, wx - 9, wy2 + 83, 138, 4, '#F4F0E4');
    const Cu = NC('#E2701E');
    drape(g, wx - 20, wy2 - 10, 26, 100, Cu, 9); drape(g, wx + 114, wy2 - 10, 26, 100, Cu, 9);
    for (const tx of [wx - 8, wx + 128]) { box(g, tx - 3, wy2 + 36, 6, 4, NR(BRASS)[3]); }
    box(g, wx - 26, wy2 - 16, 172, 5, INK); box(g, wx - 25, wy2 - 15, 170, 3, NR(BRASS)[3]); box(g, wx - 25, wy2 - 15, 170, 1, NR(BRASS)[5]);
    box(g, wx - 22, wy2 - 12, 164, 12, Cu[2]); for (let k = 0; k < 164; k += 10) { box(g, wx - 22 + k, wy2 - 12, 5, 12, Cu[3]); box(g, wx - 22 + k, wy2 - 12, 1, 12, Cu[4]); } box(g, wx - 22, wy2 - 1, 164, 1, Cu[0]);
    // (the family portrait: the cast as the show drew them, the gold frame stepped, a black ribbon across its corner)
    const px0 = X(PORTRAIT_X), py0 = top + 24, G = NR(BRASS);
    box(g, px0 - 6, py0 - 6, 96, 72, INK); box(g, px0 - 5, py0 - 5, 94, 70, G[3]); box(g, px0 - 5, py0 - 5, 94, 2, G[5]); box(g, px0 - 5, py0 - 5, 2, 70, G[4]); box(g, px0 + 86, py0 - 5, 3, 70, G[1]); box(g, px0 - 5, py0 + 62, 94, 3, G[1]);
    box(g, px0 - 1, py0 - 1, 86, 62, G[2]); box(g, px0 + 1, py0 + 1, 82, 58, INK);
    box(g, px0 + 2, py0 + 2, 80, 56, '#7DD3FC'); box(g, px0 + 2, py0 + 2, 80, 20, '#A8E0FC');
    g.save(); g.beginPath(); g.rect(px0 + 2, py0 + 2, 80, 56); g.clip(); dadArt(g, px0 + 46, py0 + 60, 0.5, 0.05, '#7DD3FC', false, true); g.restore();
    box(g, px0 + 6, py0 + 4, 20, 2, 'rgba(255,255,255,0.45)');
    g.fillStyle = INK; g.beginPath(); g.moveTo(px0 + 56, py0 - 6); g.lineTo(px0 + 90, py0 - 6); g.lineTo(px0 + 90, py0 + 28); g.closePath(); g.fill();
    g.fillStyle = '#1A1A1E'; g.beginPath(); g.moveTo(px0 + 62, py0 - 5); g.lineTo(px0 + 89, py0 - 5); g.lineTo(px0 + 89, py0 + 22); g.closePath(); g.fill();
    g.fillStyle = '#3A3A44'; g.beginPath(); g.moveTo(px0 + 68, py0 - 5); g.lineTo(px0 + 89, py0 + 16); g.lineTo(px0 + 89, py0 + 10); g.lineTo(px0 + 76, py0 - 5); g.closePath(); g.fill();
    box(g, px0 + 30, py0 + 66, 24, 5, G[2]); box(g, px0 + 31, py0 + 67, 22, 3, G[4]);
    // (the clock: stopped at five; the plaque under it)
    const cx = X(CLOCK_X), cy = top + 40;
    g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2); g.fill(); g.fillStyle = Pn[3]; g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fill(); g.fillStyle = Pn[4]; g.beginPath(); g.arc(cx - 1, cy - 1, 15, Math.PI, Math.PI * 1.6); g.fill();
    g.fillStyle = '#FEF3C7'; g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F4E4B0'; g.beginPath(); g.arc(cx + 1, cy + 1, 12, 0, Math.PI * 0.8); g.fill();
    for (let k = 0; k < 12; k++) { const an = (k / 12) * Math.PI * 2; box(g, cx + Math.cos(an) * 10 - 0.5, cy + Math.sin(an) * 10 - 0.5, 1, 1, '#5A3A1A'); }
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - 10); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(Math.PI * (-0.5 + 5 / 6)) * 7, cy + Math.sin(Math.PI * (-0.5 + 5 / 6)) * 7); g.stroke();
    box(g, cx - 1, cy - 1, 2, 2, '#C83A3A');
    box(g, cx - 46, cy + 22, 92, 26, INK); box(g, cx - 45, cy + 23, 90, 24, Pn[4]); box(g, cx - 45, cy + 23, 90, 2, Pn[5]); box(g, cx + 41, cy + 23, 4, 24, Pn[2]);
    signText(g, "IT'S FIVE O'CLOCK", cx, cy + 33, tiny(Pn[0])); signText(g, 'SOMEWHERE', cx, cy + 43, tiny(Pn[0]));
    // (the shelf of bowling trophies, a stein)
    const sx = X(3600), sy = top + 92; box(g, sx - 34, sy, 68, 5, INK); box(g, sx - 33, sy + 1, 66, 3, Pn[4]); box(g, sx - 30, sy + 5, 4, 6, Pn[2]); box(g, sx + 26, sy + 5, 4, 6, Pn[2]);
    for (const [tx, th] of [[-24, 26], [-10, 18], [4, 30]] as const) { box(g, sx + tx - 4, sy - 5, 10, 5, '#3A2A1A'); box(g, sx + tx - 1, sy - th, 4, th - 5, G[3]); box(g, sx + tx - 1, sy - th, 1, th - 5, G[5]); box(g, sx + tx - 4, sy - th - 6, 10, 7, G[4]); box(g, sx + tx - 2, sy - th - 9, 6, 4, G[3]); }
    box(g, sx + 16, sy - 16, 12, 16, '#E8E0D0'); box(g, sx + 16, sy - 16, 12, 3, '#F8F4EC'); box(g, sx + 27, sy - 12, 4, 8, '#C8C0B0'); box(g, sx + 18, sy - 10, 8, 4, '#3A5A8A');
    // (the wall phone by the kitchen: beige, its cord coiled down)
    const phx = X(3660), phy = STAGE_Y - 110; box(g, phx - 7, phy - 1, 14, 26, INK); box(g, phx - 6, phy, 12, 24, '#D8CCAA'); box(g, phx - 6, phy, 3, 24, '#ECE2C4'); box(g, phx - 8, phy + 2, 4, 20, '#C8BC9A');
    g.strokeStyle = '#C8BC9A'; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 12; k++) g.arc(phx - 6, phy + 26 + k * 2.4, 1.6, 0, Math.PI * 2); g.stroke();
    box(g, phx + 10, phy + 10, 6, 10, '#F4F0E4'); box(g, phx + 12, phy + 12, 2, 6, '#C8C0AC');
    // (the kitchen doorway: the trim, the dark beyond it (backstage), a work light's sliver, a cable)
    const kx = X(KITCHEN.x);
    box(g, kx - 34, STAGE_Y - 132, 68, 132, INK); box(g, kx - 33, STAGE_Y - 131, 66, 131, '#F4F0E4'); box(g, kx - 33, STAGE_Y - 131, 66, 2, '#FFFFFF'); box(g, kx + 29, STAGE_Y - 131, 4, 131, '#C8C0AC');
    box(g, kx - 28, STAGE_Y - 124, 56, 124, '#0E0A10'); box(g, kx + 10, STAGE_Y - 124, 18, 124, '#16121A'); checker(g, kx + 6, STAGE_Y - 124, 4, 124, '#16121A', 0, 1);
    box(g, kx + 18, STAGE_Y - 124, 2, 40, '#2A2430'); box(g, kx + 14, STAGE_Y - 86, 10, 6, '#3A3440');
    g.strokeStyle = '#1C1C1C'; g.lineWidth = 2; g.beginPath(); g.moveTo(kx - 20, STAGE_Y - 2); g.quadraticCurveTo(kx, STAGE_Y - 10, kx + 22, STAGE_Y - 2); g.stroke();
    // (the light switch; the outlet with a cheater plug)
    box(g, X(3610) - 4, STAGE_Y - 96, 8, 12, '#F4F0E4'); box(g, X(3610) - 1, STAGE_Y - 93, 2, 4, '#C8C0AC');
    box(g, X(3070) - 4, STAGE_Y - 30, 8, 10, '#F4F0E4'); box(g, X(3070) - 2, STAGE_Y - 28, 1, 2, INK); box(g, X(3070) + 1, STAGE_Y - 28, 1, 2, INK);
    if (cleared) { g.fillStyle = 'rgba(14,10,30,0.32)'; g.fillRect(a - 70, top - 10, b - a + 140, STAGE_Y - top + 12); }
  });
};

/** The swing door (live: it swings while the Boy goes through). */
export const drawSwingDoor = (c: Ctx, doorOpen: number) => {
  const kx = X(KITCHEN.x), k = Math.max(0, Math.min(1, doorOpen)), dw = Math.max(4, 54 * (1 - k * 0.85)), D = NR(r6('#A8742A'));
  box(c, kx - 28, STAGE_Y - 122, dw, 120, INK);
  box(c, kx - 27, STAGE_Y - 121, dw - 2, 118, D[3]); box(c, kx - 27, STAGE_Y - 121, Math.max(1, dw * 0.12), 118, D[4]); box(c, kx - 27 + dw - 2 - Math.max(1, dw * 0.12), STAGE_Y - 121, Math.max(1, dw * 0.12), 118, D[2]);
  if (dw > 20) {
    const m = kx - 28 + dw / 2, s = dw / 54;
    box(c, kx - 24, STAGE_Y - 58, dw - 8, 1, D[1]); box(c, kx - 24, STAGE_Y - 26, dw - 8, 1, D[1]);
    c.fillStyle = INK; c.beginPath(); c.ellipse(m, STAGE_Y - 88, 9 * s, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = NR(BRASS)[3]; c.beginPath(); c.ellipse(m, STAGE_Y - 88, 8 * s, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5A7A8A'; c.beginPath(); c.ellipse(m, STAGE_Y - 88, 6 * s, 6, 0, 0, Math.PI * 2); c.fill();
    box(c, m - 3 * s, STAGE_Y - 92, 2 * s, 3, '#BAE6FD');
    box(c, kx - 26, STAGE_Y - 66, 6 * s, 14, NR(STEEL)[3]);
  }
};

/** The laugh-track horn on top of the flat (shaking while the laughs play). */
export const drawLaughHorn = (c: Ctx, f: number, laughing: boolean) => {
  const x = X(SET.b - 40), y = STAGE_Y - 182, j = laughing ? ((f >> 1) % 2 ? 1 : -1) : 0, S = NR(STEEL);
  box(c, x - 2, y - 14, 4, 14, INK); box(c, x - 1, y - 14, 2, 14, S[3]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 10 + j, y - 30); c.lineTo(x - 30 + j, y - 44); c.lineTo(x - 30 + j, y - 10); c.lineTo(x + 10 + j, y - 22); c.closePath(); c.fill();
  c.fillStyle = S[3]; c.beginPath(); c.moveTo(x + 9 + j, y - 29); c.lineTo(x - 28 + j, y - 42); c.lineTo(x - 28 + j, y - 12); c.lineTo(x + 9 + j, y - 23); c.closePath(); c.fill();
  c.fillStyle = S[4]; c.beginPath(); c.moveTo(x + 9 + j, y - 29); c.lineTo(x - 28 + j, y - 42); c.lineTo(x - 28 + j, y - 36); c.lineTo(x + 9 + j, y - 27); c.closePath(); c.fill();
  box(c, x - 31 + j, y - 44, 4, 34, S[1]); box(c, x + 8 + j, y - 32, 10, 12, INK); box(c, x + 9 + j, y - 31, 8, 10, S[2]);
  signText(c, 'LAFF', x - 12 + j, y - 24, stencil('#E8E4D8'));
  if (laughing) for (let i = 0; i < 3; i++) { const r = 8 + i * 7 + ((f * 0.6) % 7); c.strokeStyle = 'rgba(255,240,200,0.6)'; c.lineWidth = 1; c.beginPath(); c.arc(x - 30, y - 27, r, Math.PI * 0.75, Math.PI * 1.25); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The TV on its cart (turned toward the couch, three-quarters to us), the VCR flashing 12:00

/** A 3x5 pixel font for the TV's score bug and the VCR's clock, drawn live (a stamped sign comes down off its spot at
 *  the TV's depth, where the scale isn't a whole number). */
const TV_FONT: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '4': '101101111001001', ':': '000010000010000', ' ': '000000000000000',
  U: '101101101101111', B: '110101110101110', X: '101101010101101',
};
const tvText = (c: Ctx, text: string, x: number, y: number, col: string) => {
  let dx = x;
  for (const ch of text) { const m = TV_FONT[ch] ?? TV_FONT[' ']; for (let k = 0; k < 15; k++) if (m[k] === '1') box(c, dx + (k % 3), y + Math.floor(k / 3), 1, 1, col); dx += ch === ':' ? 3 : 4; }
};

export const drawTV = (c: Ctx, x: number, f: number, mode: 'game' | 'roll' | 'off') => {
  const y = STAGE_Y, S = NR(STEEL), Wd = NR(r6('#7A4A2A'));
  // (the cart: two shelves on casters, the VCR on the low one; its top shelf as wide as the set that sits on it. Painted
  // live, not stamped: at the TV's depth (a scale that isn't a whole number) a stamp of it came down off to one side of
  // the set, so the TV hung off the end of its shelf)
  {
    const g = c;
    for (const s of [-1, 1]) { box(g, x + s * 38 - 2, y - 46, 4, 40, INK); box(g, x + s * 38 - 1, y - 46, 2, 40, S[4]); }
    box(g, x - 48, y - 48, 98, 6, INK); box(g, x - 47, y - 47, 96, 4, S[3]); box(g, x - 47, y - 47, 96, 1, S[5]);
    box(g, x - 43, y - 19, 86, 5, INK); box(g, x - 42, y - 18, 84, 3, S[3]); box(g, x - 42, y - 18, 84, 1, S[5]);
    for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.arc(x + s * 38, y - 4, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = S[2]; g.beginPath(); g.arc(x + s * 38, y - 4, 2, 0, Math.PI * 2); g.fill(); }
    // (the VCR)
    box(g, x - 30, y - 34, 54, 15, INK); box(g, x - 29, y - 33, 52, 13, '#2A2A30'); box(g, x - 29, y - 33, 52, 2, '#4A4A54'); box(g, x - 24, y - 28, 22, 3, '#141418'); for (let k = 0; k < 4; k++) box(g, x + 4 + k * 4, y - 26, 3, 2, '#5A5A64');
    box(g, x + 4, y - 31, 16, 4, '#0A1A10');
    // (the cable down to the floor)
    g.strokeStyle = '#1A1A1A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 40, y - 40); g.quadraticCurveTo(x + 52, y - 20, x + 48, y); g.stroke();
  }
  // (the VCR's 12:00, blinking)
  if (mode !== 'off' && (f >> 5) % 2 === 0) tvText(c, '12:00', x + 3, y - 32, '#5CF06A');
  // (the set: a wood-grain box, turned, the screen on its near face)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 46, y - 46); c.lineTo(x + 26, y - 46); c.lineTo(x + 48, y - 55); c.lineTo(x + 48, y - 114); c.lineTo(x - 24, y - 114); c.lineTo(x - 46, y - 105); c.closePath(); c.fill();
  c.fillStyle = Wd[2]; c.beginPath(); c.moveTo(x + 26, y - 48); c.lineTo(x + 46, y - 56); c.lineTo(x + 46, y - 112); c.lineTo(x + 26, y - 104); c.closePath(); c.fill();
  for (let k = 0; k < 4; k++) { c.strokeStyle = Wd[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 27, y - 96 + k * 12); c.lineTo(x + 45, y - 104 + k * 12); c.stroke(); }
  c.fillStyle = Wd[4]; c.beginPath(); c.moveTo(x - 44, y - 105); c.lineTo(x - 24, y - 112); c.lineTo(x + 46, y - 112); c.lineTo(x + 26, y - 104); c.closePath(); c.fill();
  box(c, x - 44, y - 104, 70, 57, Wd[3]); box(c, x - 44, y - 104, 70, 2, Wd[5]); box(c, x - 44, y - 104, 2, 57, Wd[4]);
  for (let k = 0; k < 5; k++) box(c, x - 42, y - 98 + k * 11, 66, 1, Wd[2]);
  const sx = x - 39, sy = y - 99, sw = 50, sh = 44;
  c.fillStyle = INK; c.beginPath(); c.roundRect(sx - 3, sy - 3, sw + 6, sh + 6, 5); c.fill();
  c.fillStyle = '#3A3A40'; c.beginPath(); c.roundRect(sx - 2, sy - 2, sw + 4, sh + 4, 5); c.fill();
  c.save(); c.beginPath(); c.roundRect(sx, sy, sw, sh, 4); c.clip();
  if (mode === 'off') { box(c, sx, sy, sw, sh, '#1C2228'); box(c, sx, sy + sh * 0.6, sw, sh * 0.4, '#141A1E'); box(c, sx + 4, sy + 4, 12, 3, 'rgba(255,255,255,0.14)'); }
  else {
    // (the game: the field banded, yard lines rolling by, the players, the score bug; the same tape every show)
    box(c, sx, sy, sw, 10, '#5A6A7A'); for (let k = 0; k < 10; k++) box(c, sx + k * 5, sy + 2 + (k % 2), 4, 3, ['#C83A3A', '#3A5AC8', '#E8E4D8'][k % 3]);
    box(c, sx, sy + 10, sw, sh - 10, '#2F8A3A'); box(c, sx, sy + 22, sw, sh - 22, '#2A7A34'); checker(c, sx, sy + 20, sw, 2, '#2A7A34', 0, 1);
    const scroll = (f * 0.6) % 16;
    for (let k = -1; k < 5; k++) box(c, sx + k * 16 - scroll, sy + 10, 2, sh, '#E8F5E9');
    for (let k = 0; k < 8; k++) { const px = sx + ((k * 13 + f * (k % 2 ? 0.4 : 0.3)) % sw), py = sy + 14 + (k * 7) % 22; box(c, px, py, 2, 3, k % 2 ? '#DC2626' : '#FFFFFF'); box(c, px, py - 1, 2, 1, k % 2 ? '#FDE047' : '#C0C0C0'); }
    box(c, sx, sy + sh - 8, sw, 8, '#111827');
    tvText(c, 'UBX', sx + 3, sy + sh - 6, '#FDE047'); tvText(c, '14 10', sx + 26, sy + sh - 6, '#FFFFFF');
    if (mode === 'roll') {
      const band = (f * 3) % (sh + 20) - 10;
      box(c, sx, sy + band, sw, 6, '#111111');
      for (let k = 0; k < 30; k++) box(c, sx + hash(k + f) * sw, sy + hash(k * 3 + f) * sh, 2, 1, hash(k * 7 + f) > 0.5 ? '#FFFFFF' : '#6B7280');
    }
    for (let ly = sy; ly < sy + sh; ly += 2) box(c, sx, ly, sw, 1, 'rgba(0,0,0,0.16)');
  }
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(sx + 2, sy + 2, 14, 3); c.fillRect(sx + 2, sy + 5, 3, 8);
  // (the knobs, the speaker grille; the rabbit ears with foil on their tips)
  for (const ky of [y - 92, y - 80]) { box(c, x + 15, ky, 8, 8, INK); box(c, x + 16, ky + 1, 6, 6, S[3]); box(c, x + 16, ky + 1, 3, 3, S[5]); }
  for (let k = 0; k < 4; k++) box(c, x + 15, y - 68 + k * 3, 8, 1, Wd[1]);
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, y - 114); c.lineTo(x - 18, y - 150); c.moveTo(x + 8, y - 114); c.lineTo(x + 32, y - 146); c.stroke();
  c.strokeStyle = S[4]; c.lineWidth = 1; c.stroke();
  box(c, x - 1, y - 118, 14, 5, INK); box(c, x, y - 117, 12, 3, S[2]);
  for (const [fx, fy] of [[x - 20, y - 154], [x + 30, y - 150]] as const) { box(c, fx - 1, fy - 1, 7, 7, INK); box(c, fx, fy, 5, 5, '#D4D8E0'); box(c, fx, fy, 2, 2, '#FFFFFF'); box(c, fx + 3, fy + 3, 2, 2, '#8A90A0'); }
  c.fillStyle = '#F5F5F4'; c.beginPath(); c.arc(x - 8, y - 52, 2.5, 0, Math.PI * 2); c.fill();
  if (mode !== 'off') { box(c, x - 6, y - 53, 2, 2, '#FF5050'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The braided rug and the Boy's track, on the deck (projected to the eye by the caller's `at`)

export const drawRug = (c: Ctx, at: (x: number, d: number) => { x: number; y: number }, track: { a: { x: number; d: number }; b: { x: number; d: number } }) => {
  const cx = X(3350), cd = 0.925, ax = 300, ad = 0.064;
  const ring = (k: number) => { const pts: { x: number; y: number }[] = []; for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2; pts.push(at(cx + Math.cos(t) * ax * k, cd + Math.sin(t) * ad * k)); } return pts; };
  const path = (pts: { x: number; y: number }[]) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); };
  const cols = ['#6A3A1A', '#B8622A', '#7A8A3A', '#C88A3A', '#8A3A2A', '#D8A858', '#5A6A3A'].map(col => hour(col, 0.06));
  path(ring(1.03)); c.fillStyle = 'rgba(14,8,24,0.35)'; c.fill();
  cols.forEach((col, i) => {
    const k = 1 - i * 0.14; if (k <= 0) return;
    const pts = ring(k); path(pts); c.fillStyle = col; c.fill();
    c.setLineDash([3, 3]); c.strokeStyle = cols[(i + 2) % cols.length]; c.lineWidth = 1.5; path(ring(k - 0.05)); c.stroke(); c.setLineDash([]);
  });
  // (the track: a steel slot in the boards, dead straight, the couch's end back to the kitchen door; bolts along it)
  const p0 = at(X(track.a.x), track.a.d), p1 = at(X(track.b.x), track.b.d);
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
  c.strokeStyle = NR(STEEL)[3]; c.lineWidth = 3; c.stroke();
  c.strokeStyle = '#0A0A0E'; c.lineWidth = 1; c.stroke();
  c.strokeStyle = NR(STEEL)[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y - 1.5); c.lineTo(p1.x, p1.y - 1.5); c.stroke();
  for (let t = 0.05; t < 1; t += 0.09) { const x = p0.x + (p1.x - p0.x) * t, y = p0.y + (p1.y - p0.y) * t; box(c, x - 1, y - 2, 2, 1, NR(STEEL)[5]); }
};
