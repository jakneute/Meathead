// TUCKER IN THE CORNER (the user's: "show a pip gross out closeup with tucker yells at you when on the train and he's
// off screen. similar to artie"; "don't interrupt gameplay, just a side panel"): while he's on the speaking tube from
// the cab and the cab's off screen, his gross-up in a TV inset (the shared pip, grossPip.ts: Safari Artie's frame) up
// the left under the HUD (the tube's words go up top right of the HUD, the hazard warnings down the right; the left's
// behind Meathead as he goes on up the train). Nothing stops for it: no pause, no input lock, no camera, the HUD stays.
//
// Him: tuckerCloseGross.ts's Ren & Stimpy head (unwounded: this is before the eye shot), yelling into the brass
// speaking tube's mouthpiece at his lips (its pipe bent off out the bottom of the picture), the open ledger up in his
// other fist (red ink, a column of sums), the cab's soot and the firebox's glow behind him, the steam gauge's needle in
// the red. His mood the line's (tube.ts): 'rage' (his meltdown: red, bloodshot, the veins up, the scream going, spit
// sprayed down the tube; seething after), 'glee' (gleeful spite: manic, red, the grin going on the words) and 'petty'
// (the ledger: manic bookkeeping, his pink self, the pen jabbing at the page).
//
// In as the line starts, out a beat after it ends; a new line while it's up swaps in place (never two); never while he's
// on screen himself (the cab's back in view: it slides off), never in a cutscene (gone at once). Its stamps painted
// ahead in idle moments from the train's start (warmTuckerPip); a line before they're done just goes without it.

import type { GameState } from '../../../m1/game/core/state';
import { idleJob } from '../../../m1/game/scenes/art/raster';
import { grossBackdrop, hash2 } from '../../grossKit';
import { PIP_CW as CW, PIP_CH as CH, PIP_IN as IN, PIP_OUT as OUT, pipEase as ease, pipAt, pipBezel, pipGlass } from '../../grossPip';
import { drawTuckerCloseup, type TuckerFace } from '../tucker';
import { closeFaceWarmer } from '../tuckerCloseGross';
import { trainOf } from './state';
import { inView } from './view';
import { CAR_X, ENGINE } from './layout';
import type { Said } from '../section';

type Ctx = CanvasRenderingContext2D;

export type TubeMood = 'rage' | 'glee' | 'petty';
export interface TuckerPip {
  /** Frames up; when the line it's for ended (-1: still going); the line it's for (another: swapped in place). */
  t: number; endAt: number; said: Said | null; mood: TubeMood;
  /** Slid off by him being on screen (0 in .. 1 off). */
  hid: number;
}

/** Held after his line; how fast it slides off for him being on screen. */
const AFTER = 18, HIDE = 1 / 8;

/** Each mood's faces: on the words, and after them. */
const FACES: Record<TubeMood, { on: TuckerFace; off: TuckerFace; red: boolean }> = {
  rage: { on: 'yell', off: 'angry', red: true },
  glee: { on: 'manic', off: 'manic', red: true },
  petty: { on: 'manic', off: 'manic', red: false },
};
const WARM = [closeFaceWarmer('yell', true), closeFaceWarmer('angry', true), closeFaceWarmer('manic', true), closeFaceWarmer('manic', false)];
const ready = (m: TubeMood) => (m === 'rage' ? WARM[0].ready() && WARM[1].ready() : m === 'glee' ? WARM[2].ready() : WARM[3].ready());
let warming = false;
/** His faces painted ahead, a stamp per idle moment (once: the train's start). */
export const warmTuckerPip = () => {
  if (warming || typeof document === 'undefined') return;
  warming = true;
  const q = WARM.slice();
  idleJob(until => {
    while (q.length) { if (!q[0].run(until)) return false; q.shift(); if (performance.now() >= until) break; }
    return !q.length;
  });
};

/** The cab's back (him at his window, or ducked in it) on screen. */
const CAB_BACK = CAR_X[ENGINE];
const tuckerSeen = (state: GameState) => inView(state, CAB_BACK - 40, CAB_BACK + 40, 0);

/** Each frame (the train's update, on the train). */
export const stepTuckerPip = (state: GameState) => {
  const tr = trainOf(state), said = tr.tube;
  const away = state.player.inCutscene || !!tr.lion;
  const seen = tuckerSeen(state);
  let r = tr.pip;
  if (r && said && said !== r.said) {
    // (a new line while it's up: swapped in place, fully in)
    r.said = said; r.mood = tr.tubeMood; r.endAt = -1;
    if (r.t < IN) r.t = Math.max(r.t, 1); else r.t = IN;
  }
  if (!r && said && !away && !seen && ready(tr.tubeMood)) r = tr.pip = { t: 0, endAt: -1, said, mood: tr.tubeMood, hid: 0 };
  if (!r) return;
  if (!said && r.endAt < 0) r.endAt = r.t;
  r.t++;
  r.hid = away ? 1 : Math.max(0, Math.min(1, r.hid + (seen ? HIDE : -HIDE)));
  // (gone: its line done and out; or slid off for him, its line done)
  if ((r.endAt >= 0 && r.t >= r.endAt + AFTER + OUT) || (r.hid >= 1 && r.endAt >= 0)) tr.pip = null;
};

/** Screen space (the train's drawHud). */
export const drawTuckerPip = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), r = tr.pip, f = state.frame;
  if (!r || r.t <= 0 || typeof document === 'undefined' || state.player.inCutscene || tr.lion) return;
  const t = r.t, out = r.endAt >= 0 ? ease((t - r.endAt - AFTER) / OUT) : 0;
  const slid = Math.max(1 - ease(t / IN) + out, ease(r.hid));
  if (slid >= 1) return;
  const { X, Y } = pipAt(true, slid);
  const { ox, oy } = pipBezel(c, X, Y, f);
  drawTubeFace(c, ox, oy, f, r.mood, r.endAt < 0, t);
  pipGlass(c, ox, oy, f);
};

/** The picture (its top left at (ox, oy), clipped to it): the cab behind, him, the tube, the ledger. Exported for the
 *  check render. */
export const drawTubeFace = (c: Ctx, ox: number, oy: number, f: number, mood: TubeMood, talking: boolean, t: number) => {
  const box = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(ox + x), Math.round(oy + y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
  const rage = mood === 'rage';
  // ---- behind him: the cab's sooty iron in bands, the firebox's glow coming up from below, the steam gauge
  c.save(); c.translate(ox, oy);
  grossBackdrop(c, CW, CH, ['#120A08', '#1A0E0A', '#24120C', '#3A1A0E', '#5A260E', '#7A3410']);
  c.restore();
  // (the firebox's flicker up the bottom)
  const fl = 0.5 + 0.5 * Math.sin(f * 0.37) * Math.sin(f * 0.13);
  for (let x = 0; x < CW; x += 2) if (hash2(x, Math.floor(f / 4)) < 0.25 + fl * 0.2) box(x, CH - 4 - hash2(x, 7) * 8 * fl, 2, 2, '#E8742A');
  // (rivets along a seam)
  for (let x = 6; x < CW; x += 16) { box(x, 40, 3, 3, '#4A2A18'); box(x, 40, 1, 1, '#8A5A38'); }
  // (the steam gauge, up behind his far shoulder: brass rim, its needle shaking in the red)
  {
    const gx = 26, gy = 22, gr = 15;
    for (let a = 0; a < Math.PI * 2; a += 0.05) { box(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr, 2, 2, Math.cos(a + 2.3) > 0.2 ? '#F4CC4E' : '#926E16'); }
    c.fillStyle = '#E8E0CC'; c.beginPath(); c.arc(ox + gx + 1, oy + gy + 1, gr - 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C42A2A'; c.beginPath(); c.moveTo(ox + gx + 1, oy + gy + 1); c.arc(ox + gx + 1, oy + gy + 1, gr - 2, -0.6, 0.5); c.closePath(); c.fill();
    const na = (rage ? 0.15 : -0.5) + Math.sin(f * 1.3) * (rage ? 0.25 : 0.08);
    c.strokeStyle = '#120A08'; c.lineWidth = 2; c.beginPath(); c.moveTo(ox + gx + 1, oy + gy + 1); c.lineTo(ox + gx + 1 + Math.cos(na) * (gr - 4), oy + gy + 1 + Math.sin(na) * (gr - 4)); c.stroke();
    box(gx, gy, 3, 3, '#120A08');
  }
  // ---- him: the gross-up, the face the mood's (the words going: its mouth going)
  const fc = FACES[mood], face = talking ? fc.on : fc.off;
  const jolt = rage ? (talking ? 0.35 : 0.12) : talking ? 0.12 : 0.04;
  const HX = 96, HY = 90, SC = 4.4;
  drawTuckerCloseup(c, ox + HX, oy + HY, SC, f, { face, talking, red: fc.red, jolt });
  // (the mouth: where it is in the picture, his head's units to here)
  const mx = HX + 5.2 * SC, my = HY + 9.2 * SC;
  // (the veins up his temple throbbing: lit up a beat each pulse, raging)
  if (rage && f % 14 < 4) { box(HX - 40, HY - 26, 2, 16, '#FFB0B0'); box(HX - 38, HY - 12, 2, 8, '#FFB0B0'); }
  // ---- the speaking tube: the brass mouthpiece at his lips, its bell open to him, the pipe bent off out the bottom
  {
    const bx = mx + 22, by = my + 4, bell = 17;
    // (the pipe: over to the right, then down out of the picture; inked, stepped brass, lit along its top/left)
    const pipe = (x: number, y: number, w: number, h: number, horiz: boolean) => {
      box(x - 1, y - 1, w + 2, h + 2, '#2A1A04');
      box(x, y, w, h, '#CC9E2C');
      if (horiz) { box(x, y, w, 2, '#FFF6BE'); box(x, y + 2, w, 2, '#F4CC4E'); box(x, y + h - 3, w, 3, '#926E16'); }
      else { box(x, y, 2, h, '#FFF6BE'); box(x + 2, y, 2, h, '#F4CC4E'); box(x + w - 3, y, 3, h, '#926E16'); }
    };
    pipe(bx + 18, by - 5, 26, 10, true);
    pipe(bx + 40, by - 5, 10, CH - by + 10, false);
    // (the elbow's collar)
    box(bx + 38, by - 7, 14, 14, '#2A1A04'); box(bx + 39, by - 6, 12, 12, '#F4CC4E'); box(bx + 39, by - 6, 12, 3, '#FFFCE0'); box(bx + 39, by + 3, 12, 3, '#926E16');
    // (the bell: a flared cone, wide end toward his mouth (seen a little side on: an ellipse), the dark down inside it)
    for (let i = 0; i <= 20; i++) {
      const k = i / 20, x = bx + 20 - k * 20, h = 5 + (bell - 5) * k * k;
      box(x - 1, by - h - 1, 2, h * 2 + 2, '#2A1A04');
      box(x, by - h, 1.5, h * 2, k > 0.75 ? '#926E16' : '#CC9E2C');
      box(x, by - h, 1.5, Math.max(1, h * 0.4), '#F4CC4E');
      if (i % 5 === 0) box(x, by - h, 1.5, 2, '#FFFCE0');
    }
    c.fillStyle = '#2A1A04'; c.beginPath(); c.ellipse(ox + bx, oy + by, 6, bell + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F4CC4E'; c.beginPath(); c.ellipse(ox + bx, oy + by, 5, bell, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#140C02'; c.beginPath(); c.ellipse(ox + bx + 1, oy + by, 3, bell - 3, 0, 0, Math.PI * 2); c.fill();
    box(bx - 4, by - bell + 3, 2, 6, '#FFFCE0');
    // (spit sprayed down it on the words: off his lips into the bell and back at the lens; strung across the gap)
    if (talking) {
      const n = rage ? 10 : 5;
      for (let i = 0; i < n; i++) {
        const ph = ((f * (rage ? 1.6 : 1.1) + i * 23) % 28) / 28, back = i % 3 === 0;
        const x = mx + 6 + (back ? -ph * 50 : ph * 24), y = my + (hash2(i, Math.floor((f + i * 23) / 28)) - 0.5) * 16 + (back ? ph * ph * 30 : 0);
        const z = back ? 1 + Math.round(ph * 3) : 1;
        box(x, y, z + 1, z + 1, '#DCEBFA'); box(x, y, 1, 1, '#FFFFFF');
      }
      if (f % 6 < 4) { box(mx + 6, my + 2, bx - mx - 8, 1, '#E8F0FA'); }
    }
  }
  // ---- the ledger: open, up in his other fist at the bottom left (red ink, the sums), shaken at the tube
  {
    const sh = talking ? (rage ? Math.sin(f * 1.1) * 4 : Math.sin(f * 0.5) * 2) : 0;
    const lx = 6, ly = CH - 66 + Math.round(sh), w = 66, h = 50;
    // (the covers, a hint of them, the pages: cream, a gutter down the middle)
    box(lx - 2, ly - 2, w + 4, h + 4, '#1A0A06'); box(lx - 1, ly - 1, w + 2, h + 2, '#5A1A12');
    box(lx, ly, w, h, '#F4ECD0'); box(lx, ly, w, 2, '#FFFCE8');
    box(lx + w / 2 - 1, ly, 2, h, '#B8A880'); box(lx + w / 2 + 1, ly, 1, h, '#D8CCA8');
    // (the rules, the red columns, the sums: scrawled numbers in blocks, the big one at the bottom circled)
    for (let row = 0; row < 7; row++) {
      const y = ly + 5 + row * 6;
      box(lx + 2, y + 3, w / 2 - 4, 1, '#9AC0D8'); box(lx + w / 2 + 2, y + 3, w / 2 - 4, 1, '#9AC0D8');
      for (let k = 0; k < 4; k++) if (hash2(row, k) > 0.25) box(lx + 4 + k * 6, y, 4, 2, '#3A2A1A');
      for (let k = 0; k < 3; k++) if (hash2(row + 9, k) > 0.2) box(lx + w / 2 + 6 + k * 6, y, 4, 2, row > 3 ? '#B01C1C' : '#3A2A1A');
    }
    box(lx + w / 2 + 4, ly + h - 9, 26, 1, '#B01C1C');
    c.strokeStyle = '#D62828'; c.lineWidth = 1; c.beginPath(); c.ellipse(ox + lx + w / 2 + 17, oy + ly + h - 4, 14, 4, 0, 0, Math.PI * 2); c.stroke();
    box(lx + w / 2 + 6, ly + h - 6, 4, 3, '#B01C1C'); box(lx + w / 2 + 12, ly + h - 6, 4, 3, '#B01C1C'); box(lx + w / 2 + 18, ly + h - 6, 4, 3, '#B01C1C'); box(lx + w / 2 + 24, ly + h - 6, 4, 3, '#B01C1C');
    // (his fist round its spine, the knuckles red, hairy)
    const fx = lx + w / 2 - 9, fy = ly + h - 6;
    box(fx - 1, fy - 1, 20, 16, '#4A0E0A');
    const skin = FACES[mood].red ? ['#FFB09A', '#F27A66', '#D85848', '#B03A34'] : ['#FFD8C4', '#F4B49A', '#DC8E76', '#B4685A'];
    box(fx, fy, 18, 14, skin[1]);
    for (let k = 0; k < 4; k++) { box(fx + k * 4 + 1, fy, 3, 4, skin[0]); box(fx + k * 4, fy + 4, 1, 6, skin[3]); }
    box(fx, fy + 10, 18, 4, skin[2]);
    for (let k = 0; k < 5; k++) box(fx + 2 + k * 3, fy + 6 + (k % 2), 1, 2, '#86441C');
    // (petty: the pen in the fist's thumb, jabbing at the sums)
    if (!rage) { const j = talking && f % 10 < 5 ? 2 : 0; box(fx + 14, fy - 14 + j, 2, 16, '#1A1A20'); box(fx + 14, fy - 16 + j, 2, 2, '#F4CC4E'); }
  }
  // (the rage: steam off him, his ears' tops: going white at the edges)
  if (rage) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const a = ((f + k * 11) % 33) / 33, x = HX + s * (70 + a * 12) + 2, y = HY - 14 - a * 36;
    box(x - 3 - a * 4, y - 3 - a * 4, 6 + a * 8, 6 + a * 8, `rgba(244, 244, 245, ${(0.6 * (1 - a)).toFixed(2)})`);
  }
  void t;
};
