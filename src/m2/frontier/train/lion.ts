// THE CIRCUS LION. The user's (verbatim): "jumping off the train onto the tracks should kill you like jumping off the
// truck in meathead 1 in dale's stage. meathead will stumble onto the tracks and twitch. he'll get up and be like 'i'm
// okay', only for a wild circus lion to come out of nowhere and maul meathead to death. put in circus lion display right
// away so they don't come from nowhere"
//
// THE DISPLAY: the first flatcar's load (layout.ts CIRCUS) is a circus cage wagon (red and gold, sunburst wheels, CIRCUS
// on its header, MAN-EATER and DO NOT FEED on the bars) with the lion in it: a maned circus lion in a little red fez and a
// studded collar, pacing; with him near it follows him along under the bars and roars up at him (he stands on the cage's
// roof crossing the car: the logs' height). Tucker cuts that car loose (the first cut): it blows, and the lion leaps out
// of the fire and off down the bank, THE LION'S LOOSE! Back at the end of the line (a revisit) the cage is there again,
// bent open, empty, ESCAPED.
//
// THE TRACKS (Dale's fall off the truck, Meathead 1, convoy.ts): down on the ties while the train's moving (off the back
// of what's left of it, once cars have been cut loose) is a cutscene from the first frame of it (no controls, no HUD,
// SKIP >> straight to the death screen): the world stands still and the train rolls on away (drawn moved on: `off`); he
// tumbles along the ties, bouncing, smearing, and lies there face down, twitching; gets up, swaying; he's okay (his line,
// by the state of his pants); and the lion comes in from behind at a dead run, leaps on his back and mauls him to death,
// face down on the ties (the gore, CHOMP!, his scream), then lies down on what's left, chewing. The death screen.
// (Down there in the middle of a cut, the cut-off end still rolling behind him, it runs him over: cars.ts, as before.)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { killPlayer, skipDying, clearForDoom } from '../../../m1/game/player/player';
import { drawPlayer } from '../../../m1/game/render/player/player';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { PARTICLE_PALETTES } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { meatheadSays, byPants, hands, label } from '../section';
import { GY } from '../geometry';
import { CARS, CAR_X, DECK, END, TOP, CIRCUS } from './layout';
import { trainOf, type Maul } from './state';
import { carXNow } from './where';
import { viewOf, inView, inDrawn } from './view';
import { type Ctx, box, checker, mix, hash, INK, N, boards, lip, stillAt, BRASS, RED, VARNISH, HAY } from './paint';
import { LION_CAGE, IM_OKAY, HURT } from './lines';
import { drawCircusLion, type LionPose } from './lionArt';

const GORE = PARTICLE_PALETTES.GORE;
const BLOOD = ['#5F0F0F', '#7F1D1D', '#B91C1C', '#DC2626'];
const GOLD = ['#FFF0A8', '#F2C84A', '#C8962E', '#8A5E14', '#3A2408'];
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); g.fill(); };
const line = (g: Ctx, pts: number[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
const LION_SRC = 'm2:fr_lion';

// ---------------------------------------------------------------------------------------------------------------
// The cage wagon on the circus flat (in place of the logs; its roof at the logs' height, to stand on)

const Dk = DECK - GY;
const TP = (TOP.flat ?? DECK - 132) - GY;
/** The cage's inside: its floor (the straw) and its top (under the header). */
const FLOOR = Dk - 38, HEAD_B = TP + 26;

const paintCageBack = (g: Ctx, len: number) => {
  const a = END, w = len - 2 * END;
  // (the flat's deck)
  box(g, a - 1, Dk - 8, w + 2, 9, INK); boards(g, a, Dk - 7, w, 7, N(VARNISH), 7, 5);
  // (the inside: dark boards, the straw on the floor)
  box(g, a + 6, HEAD_B - 2, w - 12, FLOOR - HEAD_B + 4, '#160A08');
  for (let x = a + 10; x < a + w - 10; x += 18) { box(g, x, HEAD_B, 1, FLOOR - HEAD_B, '#241410'); box(g, x + 1, HEAD_B, 1, FLOOR - HEAD_B, '#0C0604'); }
  checker(g, a + 6, HEAD_B, w - 12, 10, '#0A0404', 0, 2);
  const Hy = N(HAY);
  box(g, a + 6, FLOOR - 6, w - 12, 6, Hy[2]);
  for (let i = 0; i < 60; i++) { const x = a + 8 + hash(i * 3.3) * (w - 18), h2 = 2 + hash(i * 1.7) * 5; box(g, x, FLOOR - h2, 1, h2, i % 3 ? Hy[4] : Hy[5]); }
  // (a gnawed bone in the straw)
  box(g, a + w * 0.7, FLOOR - 4, 14, 3, '#E8E0CC'); box(g, a + w * 0.7 - 2, FLOOR - 5, 3, 5, '#F4ECD8'); box(g, a + w * 0.7 + 13, FLOOR - 5, 3, 5, '#F4ECD8');
};

const paintCageFront = (g: Ctx, len: number, open: boolean) => {
  const a = END, w = len - 2 * END, R = N(RED), B = N(BRASS);
  // (the sunburst wheels under it, on the deck)
  for (const wx of [a + 44, a + 104, a + w - 104, a + w - 44]) {
    const cy = Dk - 21, r = 13;
    ell(g, wx, cy, r + 1.4, r + 1.4, INK); ell(g, wx, cy, r, r, B[3]); ell(g, wx, cy, r - 2.4, r - 2.4, R[2]);
    for (let k = 0; k < 12; k++) { const t = (k / 12) * Math.PI * 2; line(g, [wx, cy, wx + Math.cos(t) * (r - 2), cy + Math.sin(t) * (r - 2)], 1.6, k % 2 ? R[4] : B[4]); }
    ell(g, wx, cy, 3.4, 3.4, INK); ell(g, wx, cy, 2.4, 2.4, B[5]);
  }
  // (the chassis rail along the bottom: red, a gold stripe and scrolls)
  box(g, a - 1, FLOOR - 1, w + 2, 14, INK); box(g, a, FLOOR, w, 12, R[3]); box(g, a, FLOOR, w, 2, R[5]); box(g, a, FLOOR + 10, w, 2, R[1]);
  box(g, a + 4, FLOOR + 5, w - 8, 2, B[4]);
  for (let x = a + 30; x < a + w - 20; x += 60) { g.strokeStyle = B[4]; g.lineWidth = 1; g.beginPath(); g.arc(x, FLOOR + 6, 4, Math.PI * 0.2, Math.PI * 1.8); g.stroke(); }
  // (the bars: brass, lit down their left; the middle ones bent out and apart when it's broken open)
  const bars: number[] = [];
  for (let x = a + 16; x < a + w - 14; x += 15) bars.push(x);
  const midI = Math.floor(bars.length / 2);
  bars.forEach((x, i) => {
    const bent = open && Math.abs(i - midI) <= 1 && i !== midI;
    if (open && i === midI) return;
    if (bent) {
      const dir = i < midI ? -1 : 1;
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, HEAD_B); g.quadraticCurveTo(x + dir * 22, (HEAD_B + FLOOR) / 2, x, FLOOR); g.stroke();
      g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.stroke();
      return;
    }
    box(g, x - 1, HEAD_B, 5, FLOOR - HEAD_B, INK); box(g, x, HEAD_B, 3, FLOOR - HEAD_B, B[3]); box(g, x, HEAD_B, 1, FLOOR - HEAD_B, B[5]); box(g, x + 2, HEAD_B, 1, FLOOR - HEAD_B, B[1]);
  });
  // (the corner posts: carved, gilt)
  for (const px of [a, a + w - 12]) { box(g, px - 1, TP - 1, 14, FLOOR - TP + 14, INK); box(g, px, TP, 12, FLOOR - TP + 12, B[3]); box(g, px, TP, 3, FLOOR - TP + 12, B[5]); box(g, px + 9, TP, 3, FLOOR - TP + 12, B[1]); for (let y = TP + 34; y < FLOOR; y += 12) box(g, px + 3, y, 6, 2, B[2]); }
  // (the header: red, gold-edged, CIRCUS, stars either side; the cornice over it, its top lit: he stands on it)
  box(g, a - 5, TP - 1, w + 10, 28, INK); box(g, a - 4, TP, w + 8, 26, R[3]); box(g, a - 4, TP + 6, w + 8, 2, B[4]); box(g, a - 4, TP + 22, w + 8, 2, B[3]);
  checker(g, a - 4, TP + 8, w + 8, 2, R[4], 0, 1);
  box(g, a - 6, TP - 1, w + 12, 7, INK); box(g, a - 5, TP, w + 10, 5, R[2]); box(g, a - 5, TP + 4, w + 10, 1, R[1]);
  lip(g, a - 5, TP, w + 10, ['#3A0A0C', '#A3262A', '#F09070', '#FFD0B0']);
  signText(g, 'CIRCUS', a + w / 2, TP + 21, { sx: 2, sy: 2, fill: [GOLD[0], GOLD[1], GOLD[2]], shadow: R[0] });
  for (const sx of [a + w / 2 - 80, a + w / 2 + 80, a + 40, a + w - 40]) { g.fillStyle = B[5]; g.beginPath(); for (let k = 0; k < 10; k++) { const t = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 2.4 : 6; if (k) g.lineTo(sx + Math.cos(t) * rr, TP + 15 + Math.sin(t) * rr); else g.moveTo(sx + Math.cos(t) * rr, TP + 15 + Math.sin(t) * rr); } g.closePath(); g.fill(); }
  // (the plaques wired to the bars)
  const plaque = (x: number, text: string, ink: string, col: string) => {
    const pw = text.length * 6 + 10;
    box(g, x - pw / 2 - 1, HEAD_B + 5, pw + 2, 13, INK); box(g, x - pw / 2, HEAD_B + 6, pw, 11, ink); box(g, x - pw / 2, HEAD_B + 6, pw, 1, mix(ink, '#FFFFFF', 0.25));
    line(g, [x - pw / 2 + 4, HEAD_B + 6, x - pw / 2 + 8, HEAD_B], 1, '#9A9AA2'); line(g, [x + pw / 2 - 4, HEAD_B + 6, x + pw / 2 - 8, HEAD_B], 1, '#9A9AA2');
    signText(g, text, x, HEAD_B + 15, { sx: 1, sy: 1, fill: col });
  };
  plaque(a + w * 0.24, 'MAN-EATER', '#3A2410', '#F2E4C4');
  plaque(a + w * 0.78, open ? 'ESCAPED' : 'DO NOT FEED', open ? '#F2E4C4' : '#3A2410', open ? '#B91C1C' : '#F2E4C4');
};

/** The cage wagon on car `CIRCUS` at x (its left end): `live` with the lion in it (by tr.cage), `open` broken open and
 *  empty (the end of the line, the wreck). */
export const drawCage = (c: Ctx, state: GameState, x: number, len: number, mode: 'live' | 'open') => {
  stillAt(c, `tr-cage-back-${len}`, x, GY, END - 4, TP - 4, len - 2 * END + 8, Dk - TP + 8, g => paintCageBack(g, len));
  if (mode === 'live') {
    const cg = trainOf(state).cage;
    const pose: LionPose = cg.roar > 0 ? 'roar' : cg.walk ? 'walk' : 'stand';
    // (kept inside the bars: nothing of it ever pokes out past the header or the posts)
    // (the walk's frame from how far it's paced (its paws planted, never skating); the roar a one-shot over its 54)
    const t = pose === 'walk' ? (cg.facing > 0 ? cg.rx : -cg.rx) / 0.9 : cg.t;
    c.save(); c.beginPath(); c.rect(x + END + 6, GY + HEAD_B - 2, len - 2 * END - 12, FLOOR - HEAD_B + 16); c.clip();
    drawCircusLion(c, x + cg.rx, GY + FLOOR, cg.facing, t, pose, { s: 0.9, k: Math.floor((54 - cg.roar) / 9) });
    c.restore();
  }
  stillAt(c, `tr-cage-front-${len}-${mode}`, x, GY, END - 8, TP - 4, len - 2 * END + 16, Dk - TP + 8, g => paintCageFront(g, len, mode === 'open'));
};

// ---------------------------------------------------------------------------------------------------------------
// The lion in its cage (each frame), and out of it

/** Each frame: the caged lion pacing (following him along under the bars while he's near, roaring up at him); his
 *  line the first time he sees it; the lion out of the wreck and away. */
export const updateCage = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player, cg = tr.cage;
  const cx = p.pos.x + p.width / 2;
  updateEscape(state);
  if (CIRCUS < 0 || tr.cars[CIRCUS]?.gone || tr.phase === 'still' || tr.lion) return;
  cg.t++;
  const x = carXNow(tr, CIRCUS), len = CARS[CIRCUS].len, lo = END + 80, hi = len - END - 80;
  const near = p.health > 0 && Math.abs(cx - (x + len / 2)) < len / 2 + 260;
  const target = near ? Math.max(lo, Math.min(hi, cx - x)) : Math.floor(cg.t / 420) % 2 ? lo + 20 : hi - 20;
  const d = target - cg.rx;
  cg.walk = Math.abs(d) > 3 && cg.roar <= 0;
  if (cg.walk) { cg.rx += Math.sign(d) * Math.min(near ? 2.2 : 0.9, Math.abs(d)); cg.facing = d > 0 ? 1 : -1; }
  else if (near) cg.facing = cx >= x + cg.rx ? 1 : -1;
  if (cg.roar > 0) cg.roar--;
  const seen = inView(state, x + END, x + len - END, 0);
  if (--cg.roarCd <= 0 && near && seen && !p.inCutscene) { cg.roar = 54; cg.roarCd = 170 + Math.floor(Math.random() * 90); playSound('roar', 0.5, -3); }
  // (his line about it: once he's off the caboose (the boarding's said), with it on screen)
  if (!tr.said.lionCage && tr.phase === 'ride' && seen && cx > CAR_X[1] && p.health > 0 && !p.inCutscene) { tr.said.lionCage = true; meatheadSays(state, pickLine(byPants(state, LION_CAGE))); }
};

/** Its car's blown (cars.ts derail): the lion leaps out of the fire, lands on the near bank and is off back down the
 *  line (his line on it is cars.ts's, if he made it across). */
export const lionEscapes = (state: GameState, x: number) => {
  const tr = trainOf(state);
  tr.escape = { x, y: DECK - 50, vx: -2.4, vy: -11, t: 0 };
  playSound('roar', 1, 0);
};
/** The ground the escape lands on: the near lane (the robbers' (kinds.ts FG_GROUND), nearer, so bigger). */
const BANK = GY + 40;
const updateEscape = (state: GameState) => {
  const tr = trainOf(state), e = tr.escape;
  if (!e) return;
  e.t++;
  if (e.y < BANK) { e.vy += 0.6; e.y = Math.min(BANK, e.y + e.vy); e.x += e.vx; if (e.y >= BANK) { playSound('thud', 0.6, -6); shakeScreen(state, 4, 2); } }
  else e.x += -9 - tr.v * 1.25;
  if (e.t > 600 || (e.y >= BANK && e.x < viewOf(state).x - 300)) tr.escape = null;
};
/** The leap's frame by how it's moving (launched, rising, over the top, coming down). */
const pounceFrame = (vy: number) => (vy < -5 ? 0 : vy < -1 ? 1 : vy < 3 ? 2 : 3);
export const drawEscape = (c: Ctx, state: GameState) => {
  const e = trainOf(state).escape;
  if (!e || !inDrawn(state, e.x - 120, e.x + 120)) return;
  const air = e.y < BANK;
  drawCircusLion(c, e.x, e.y, -1, e.t, air ? 'pounce' : 'run', { s: 1.2, k: pounceFrame(e.vy) });
  if (e.t < 120 && (e.t >> 3) % 4 !== 3) label(c, "THE LION'S LOOSE!", e.x, e.y - 96, '#FDE047', 8);
};

// ---------------------------------------------------------------------------------------------------------------
// Off the train onto the tracks

/** How long he lies there twitching once he's stopped; getting up; when he says he's okay (frames from stopping). */
const TWITCH = 84, RISE = 28, OK_AT = TWITCH + RISE + 12;
/** The maul (frames from the lion landing on him), and the least time it lies on him chewing before that's it. */
const MAUL = 150, CHEW = 56;
const MAUL_POPS = ['CHOMP!', 'RIP!', 'SHAKE!', 'GNAW!', 'SPLORT!'];

/** Down on the ties while it's moving: the scene, from this frame on. */
export const startMaul = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  if (tr.lion) return;
  const cx = p.pos.x + p.width / 2;
  tr.lion = {
    t: 0, x: cx, h: Math.max(0, GY - (p.pos.y + p.height)), vx: Math.max(3.5, Math.min(7.5, 5.5 + p.vel.x * 0.3)), vh: -5, rot: 0, spin: 0.32,
    stoppedAt: -1, okAt: -1, saidOk: false, off: 0, trainV: Math.max(6, tr.v), smears: [], lion: null, hitAt: -1, screamDone: -1, kill: '',
  };
  p.inCutscene = true; p.hidden = true; p.vel = { x: 0, y: 0 }; p.invincibilityTimer = 0; p.facing = 1;
  // (it's sealed: nobody else gets in on it; what's on the train goes with the train; a cut being warned of is off)
  clearForDoom(state);
  tr.riders = []; tr.horses = []; tr.shots = []; tr.stash = []; tr.tube = null; tr.tubeBusy = false;
  if (tr.cut && tr.cut.phase === 'tell') tr.cut = null;
  state.pickups = state.pickups.filter(q => !q.id.startsWith('train-'));
  playSound('slam', 1, -4); playSound('crunch', 0.6, -2); shakeScreen(state, 14, 7);
  for (let n = 0; n < 14; n++) state.particles.push({ pos: { x: cx, y: GY - 8 }, vel: { x: 1 + Math.random() * 5, y: -Math.random() * 5 }, life: 30, color: n % 2 ? '#8A8278' : GORE[n % GORE.length], size: 2 + Math.random() * 3 });
};

/** How far the train's gone on since he came off it (it's drawn moved on by that). */
export const trainOff = (state: GameState) => trainOf(state).lion?.off ?? 0;

/** Each frame of it (the train section's update hands over to this). */
export const updateMaul = (ctx: FrameContext): Controls => {
  const { state, fx } = ctx, tr = trainOf(state), p = state.player, m = tr.lion!;
  if (state.deathTimer > 0) return hands();
  m.t++;
  if (skipDying(ctx, m.t, () => (m.kill = pickLine(HURT[LION_SRC].death)))) return hands();
  p.inCutscene = true; p.hidden = true; p.vel = { x: 0, y: 0 }; p.facing = 1;
  // (the world's stood still under him; the train goes on without him)
  tr.v = 0; tr.vTarget = 0;
  m.off += m.trainV;
  if (m.stoppedAt < 0) tumble(state, fx, m);
  else afterTumble(ctx, m);
  // (his words go up over where he is: the real him is hidden, his feet kept on the ties (never down through them))
  p.pos = { x: m.x - p.width / 2, y: GY - m.h - p.height };
  return hands();
};

/** Off the train along the ties: bouncing, spinning, smearing, slowing; stopped, face down. */
const tumble = (state: GameState, fx: FrameContext['fx'], m: Maul) => {
  m.vh += 0.75; m.h -= m.vh;
  if (m.h <= 0) {
    m.h = 0;
    if (m.vh > 3 && m.vx > 1.5) {
      m.vh = -m.vh * 0.5; m.spin = (Math.random() < 0.5 ? -1 : 1) * (0.22 + m.vx * 0.03);
      shakeScreen(state, 8, 4); playSound('thud', 1, -4);
      fx.spawnDeathShower({ x: m.x, y: GY - 10 }, 1, 0.3);
      m.smears.push({ x: m.x, w: 16 + m.vx * 3 });
      // (the once: he's not under the wheels, but he's on the tracks)
      if (m.t > 3 && m.smears.length === 1) meatheadSays(state, pickLine(HURT['m2:fr_tracks'].hurt.slice(0, 1)), false);
    } else m.vh = 0;
  }
  const scraping = m.h <= 0.5;
  m.vx = Math.max(0, m.vx - (scraping ? 0.2 : 0.05));
  m.x += m.vx;
  m.rot += m.vx > 0.4 ? m.spin * (m.h > 0 ? 1 : 0.5) : 0;
  if (scraping && m.vx > 0.5 && m.t % 3 === 0) m.smears.push({ x: m.x, w: 6 + m.vx * 2 });
  if (m.vx <= 0 && m.h <= 0) { m.stoppedAt = m.t; playSound('thud', 0.6, -8); }
};

/** Stopped: twitching; up; okay; the lion. */
const afterTumble = (ctx: FrameContext, m: Maul) => {
  const { state, fx } = ctx;
  const s = m.t - m.stoppedAt;
  if (s === TWITCH) playSound('land', 0.5, 2);
  // (he's okay: said in full before anything else happens (no talking over it))
  if (s === OK_AT) { m.saidOk = true; meatheadSays(state, pickLine(byPants(state, IM_OKAY)), true, () => { if (m.okAt < 0) m.okAt = m.t; }); }
  if (m.saidOk && m.okAt < 0 && s > OK_AT + 480) m.okAt = m.t;
  // (a beat; then it comes in from behind at a dead run)
  if (m.okAt >= 0 && !m.lion && m.t >= m.okAt + 16) {
    m.lion = { x: viewOf(state).x - 140, h: 0, vx: 14, vh: 0, t: 0, mode: 'run' };
    playSound('roar', 1, -2); shakeScreen(state, 6, 3);
  }
  const L = m.lion;
  if (!L) return;
  L.t++;
  if (L.mode === 'run') {
    L.x += L.vx;
    if (L.t % 8 === 0) playSound('stomp', 0.5, 4);
    if (L.x >= m.x - 210) { L.mode = 'leap'; L.vx = 7; L.vh = -8.5; playSound('roar', 1, 2); }
  } else if (L.mode === 'leap') {
    L.x += L.vx; L.vh += 0.7; L.h = Math.max(0, L.h - L.vh);
    if (L.h <= 0 && L.vh > 0) {
      // (on his back: down he goes, face first onto the ties)
      L.mode = 'maul'; L.t = 0; L.h = 0; L.x = m.x - 40; m.hitAt = m.t;
      shakeScreen(state, 20, 10); playSound('crunch', 1, -4); playSound('splat', 1, -2); playSound('roar', 1, -6);
      fx.spawnDeathShower({ x: m.x + 10, y: GY - 30 }, 1, 0.7);
    }
  } else if (L.mode === 'maul') {
    if (L.t === 8) meatheadSays(state, pickLine(HURT[LION_SRC].hurt), false, () => { if (m.screamDone < 0) m.screamDone = m.t; });
    if (L.t % 7 === 0) playSound(L.t % 21 === 0 ? 'crunch' : 'gnaw', 0.85, (Math.random() - 0.5) * 6);
    if (L.t % 2 === 0) for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: m.x + 2 + (Math.random() - 0.5) * 34, y: GY - 18 - Math.random() * 6 }, vel: { x: (Math.random() - 0.4) * 6, y: -2 - Math.random() * 6 }, life: 40, color: GORE[(L.t + k) % GORE.length], size: 2 + Math.random() * 4, grav: 0.35 });
    if (L.t % 30 === 15) {
      fx.spawnDamageNumber({ x: m.x - 30 + Math.random() * 30, y: GY - 120 }, MAUL_POPS[Math.floor(L.t / 30) % MAUL_POPS.length], true, '#F87171');
      fx.spawnDeathShower({ x: m.x + 6, y: GY - 24 }, Math.random() < 0.5 ? -1 : 1, 0.25);
      shakeScreen(state, 8, 4);
    }
    if (L.t >= MAUL) { L.mode = 'chew'; L.t = 0; playSound('roar', 0.5, -9); }
  } else if (L.mode === 'chew') {
    if (L.t % 18 === 0) playSound('gnaw', 0.5, -4);
    // (that's it, once his scream's done (it's never talked over))
    const quiet = m.screamDone >= 0 || L.t > 300;
    if (L.t >= CHEW && quiet && state.deathTimer <= 0) {
      m.kill = pickLine(HURT[LION_SRC].death);
      state.lastHurt = { source: LION_SRC, at: state.frame };
      killPlayer(ctx, m.kill, false);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing it (world, in front of the train; the train itself is drawn moved on by `off`, index.ts)

const drawBody = (c: Ctx, state: GameState, cx: number, cy: number, rot: number, extra: Record<string, unknown>) => {
  const p = state.player;
  c.save(); c.translate(cx, cy); c.rotate(rot);
  const b = {
    ...p, pos: { x: -p.width / 2, y: -p.height / 2 }, facing: 1, hidden: false, headless: 0, shownDead: false, isGrounded: true,
    vel: { x: 0, y: 0 }, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false,
    isDivekicking: false, isDucking: false, squash: 0, hurtForm: null, hurtFormTimer: 0, filthShieldTimer: 0, ...extra,
  };
  drawPlayer(c, b as typeof p, { ...state, blocks: [], groundRuns: [], deathTimer: 0, playerVulgarityTimer: extra.talking ? state.playerVulgarityTimer : 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  c.restore();
};

export const drawMaul = (c: Ctx, state: GameState) => {
  const m = trainOf(state).lion;
  if (!m) return;
  const f = state.frame;
  // (what he's left on the ties)
  for (const s of m.smears) { box(c, s.x - s.w, GY - 6, s.w, 4, 'rgba(127, 29, 29, 0.85)'); box(c, s.x - s.w * 0.7, GY - 5, s.w * 0.6, 2, 'rgba(185, 28, 28, 0.9)'); }
  const stopped = m.stoppedAt >= 0, s = stopped ? m.t - m.stoppedAt : 0, hit = m.hitAt >= 0 ? m.t - m.hitAt : -1;
  if (stopped) drawBloodPool(c, Math.round(m.x), GY - 2, Math.round(Math.min(hit >= 0 ? 90 : 30, 12 + s * 0.25 + Math.max(0, hit) * 0.5)), 731, { dx: -0.3 });
  const L = m.lion;
  const LYING = Math.PI / 2, lieY = GY - 13, standY = GY - 32;
  if (!stopped) {
    drawBody(c, state, m.x, GY - m.h - 30, m.rot, { deathFace: 'scream', hurtTimer: 30, vel: { x: -3, y: 4 }, isGrounded: false });
  } else if (hit >= 0) {
    // (knocked flat under it, face down; kicking, then not)
    const k = Math.min(1, hit / 8), kick = hit < MAUL && ((hit >> 2) & 1) && hit % 40 < 26;
    const jit = hit < MAUL ? Math.sin(hit * 1.7) * 0.05 : 0;
    drawBody(c, state, m.x + k * 14, standY + (lieY - standY) * k, LYING * k + jit, { deathFace: hit < 60 ? 'scream' : hit < MAUL ? 'agony' : 'dead', vel: { x: kick ? 3 : 0, y: 0 } });
    // (torn up: blood all over his back, more and more)
    const torn = Math.min(1, hit / 90);
    for (let i = 0; i < 9; i++) {
      if (hash(i * 3.7) > torn) continue;
      const bx = m.x + 14 - 26 + hash(i * 1.3) * 52, by = lieY - 10 + hash(i * 5.1) * 9;
      c.fillStyle = BLOOD[i % 3]; c.beginPath(); c.ellipse(bx, by, 4 + hash(i) * 6, 2 + hash(i * 2) * 2, 0, 0, Math.PI * 2); c.fill();
    }
  } else if (s < TWITCH) {
    // (face down on the ties, twitching)
    const tw = s % 37 < 4 || s % 59 < 3 ? (Math.random() - 0.5) * 0.3 : 0;
    drawBody(c, state, m.x + (tw ? Math.random() * 2 - 1 : 0), lieY, LYING + tw, { deathFace: 'agony' });
    if (s % 37 < 4) box(c, m.x + 34, GY - 10 - (s % 4), 8, 3, '#E0AC69');
  } else {
    // (up on his feet, swaying, a twitch now and then: he's okay)
    const up = Math.min(1, (s - TWITCH) / RISE), jerk = s % 23 < 2 || s % 41 < 2 ? (Math.random() - 0.5) * 4 : 0;
    drawBody(c, state, m.x + jerk, lieY + (standY - lieY) * up, LYING * (1 - up) + up * (Math.sin(s * 0.08) * 0.08 + jerk * 0.02), { talking: up >= 1, hurtTimer: up < 1 ? 20 : 0 });
  }
  if (L) {
    // (the landing and the settling down eased in over a few frames (down onto him as he goes over; down onto what's
    // left), never snapped from one pose to the next)
    const SET = 8;
    const pose: LionPose = L.mode === 'run' ? 'run' : L.mode === 'leap' ? 'pounce' : L.mode === 'maul' ? (L.t < SET ? 'land' : 'maul') : L.t < SET ? 'settle' : 'chew';
    const k = L.mode === 'leap' ? pounceFrame(L.vh) : Math.floor(L.t / 2);
    const feet = L.mode === 'chew' ? GY - 4 - Math.round(6 * Math.min(1, L.t / SET)) : L.mode === 'maul' ? GY - Math.round(4 * Math.min(1, L.t / SET)) : GY - L.h;
    drawCircusLion(c, L.x, feet, 1, L.mode === 'maul' || L.mode === 'chew' ? Math.max(0, L.t - SET) : f, pose, { k, bloody: L.mode === 'maul' ? Math.min(1, L.t / 30) : L.mode === 'chew' ? 1 : 0 });
  }
};
