// The suitors left, in the castle's base: at the PRINCESS MAKEOVER BOUTIQUE (the ones the ride didn't kill, sat in the
// makeover chairs behind its window in tiaras and face masks: they have their say at him in turn, he answers), and on
// the BROOM PORT for the final trial (the user's: "a 'fantasy' themed runway outside for the final trial").
//
// THE RUNWAY'S SCENE (a cutscene: HUD hidden, no controls of his, SKIP >> for the lot): the suitors left sat on their
// brooms hovering over the deck (the ride's survivors (glen/rivals.ts RIVALS, still in their tiaras) and the FASTPASS
// boys, who paid to skip trials one and two: CHET, THADDEUS, DMITRI); he walks up to the spare broom on its cradle; the
// chime; Piper over the broom port's PA: the final trial, the rules (last man flying gets the highest window); the
// suitors trash-talk him (one at a time, never over each other); he hops on (astride it, sat on the shaft, fists on
// it ahead: Player.broomRide, render/player/broomPose.ts; the suitors ride theirs the same way); it lifts him; his line, blunt and horny; Piper says go; they all shoot off up into the sky, him with them; black; on to the
// broomstick deathmatch (DOORS.broom.start). Who flew off is in state.stageMemo (ROSTER_MEMO) for job 6.
//
// Done for good once it's run (RUNWAY_MEMO): a revisit's deck is empty, the brooms gone, the racks bare.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { piperMust } from '../piperLines';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hands, meatheadSays, speak, saidOver, teleport, byPants } from '../section';
import { DOORS } from '../geometry';
import { PIPER_PA_VOICE } from '../talk';
import { drawSuitor, SUITOR_H, type SuitorLook } from '../suitors';
import { RIVALS } from '../glen/rivals';
import { box, onScreen, INK, viewOf, sideBack, topBack, still, rampH, ramp6, GOLD, TIMBER, lit, checker, polyF, type Ctx } from '../kit';
import { LEAVES as LEAF } from './paint';
import { keepOf, RUNWAY_MEMO, ROSTER_MEMO, runwayDone, shopDone, setShopDone, type Flyer, type Keep } from './state';
import { BOUTIQUE, SCENE, X, Y } from './layout';
import { KEEP_VOICES, SHOP_SAY, SHOP_RETORT, RUNWAY_SAY, RUNWAY_BOUNCE, MOUNT, EMPTY, GAGS, PIPER_FINAL, PIPER_RULES, PIPER_GO } from './lines';

type RivalId = 'blake' | 'rafael' | 'hank';
type FastId = 'chet' | 'thaddeus' | 'dmitri';

/** The FASTPASS boys: paid to skip the first two trials, waiting at the broom port. Beefy, every one. */
export const FASTPASS: { id: FastId; look: SuitorLook }[] = [
  { id: 'chet', look: { name: 'CHET', skin: ['#F4C8A0', '#D8A478', '#A87650'], hair: '#E8D090', kit: 'tee', main: '#F472B6', trim: '#FFFFFF', voice: KEEP_VOICES.chet, gut: 0 } },
  { id: 'thaddeus', look: { name: 'THADDEUS', skin: ['#FFE0CC', '#F2BFA0', '#C88E70'], hair: '#5A5A60', kit: 'wizard', main: '#1E3678', trim: '#F6D365', voice: KEEP_VOICES.thaddeus, gut: 0.5 } },
  { id: 'dmitri', look: { name: 'DMITRI', skin: ['#9A6644', '#6E4428', '#4A2A16'], hair: '#140A06', kit: 'cape', main: '#E0AE3A', trim: '#FFFFFF', voice: KEEP_VOICES.dmitri, gut: 0 } },
];
const LOOK: Record<string, SuitorLook> = Object.fromEntries([...RIVALS, ...FASTPASS].map(r => [r.id, r.look]));
/** The ride's survivors (glen/rivals.ts's, not dead on the ride: tragons/ride.ts's `fa-rival-dead-<id>`). */
export const survivors = (state: GameState): RivalId[] => RIVALS.map(r => r.id).filter(id => !state.stageMemo[`fa-rival-dead-${id}`]);
/** Who's in the boutique's chairs: the survivors, till they've flown off from the runway (a revisit's are empty). */
const inShop = (state: GameState): RivalId[] => (runwayDone(state) ? [] : survivors(state));

// ---------------------------------------------------------------------------------------------------------------
// The boutique

export const updateBoutique = (state: GameState) => {
  const k = keepOf(state), p = state.player;
  if (k.shop.step === 'wait' && shopDone()) k.shop.step = 'done';
  if (k.shop.step !== 'wait') return;
  if (p.pos.x + p.width / 2 < X(BOUTIQUE.trigger) || p.pos.x + p.width / 2 > X(BOUTIQUE.b) || p.health <= 0 || p.inCutscene) return;
  k.shop.step = 'talk'; setShopDone();
  const who = inShop(state);
  if (!who.length) { k.shop.step = 'done'; meatheadSays(state, pickLine(byPants(state, GAGS.boutique)), true); return; }
  // (each in turn, never over each other; then him)
  const say = (i: number) => {
    if (i < who.length) { const id = who[i]; speak(LOOK[id].voice, pickLine(byPants(state, SHOP_SAY[id])), s => { k.shop.said = s; k.shop.who = s ? id : null; }, true, () => say(i + 1)); return; }
    meatheadSays(state, pickLine(byPants(state, SHOP_RETORT)), true, () => { k.shop.step = 'done'; });
  };
  say(0);
};

const tiara = (c: Ctx, x: number, top: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 9, top + 4); c.lineTo(x - 7, top - 3); c.lineTo(x - 3, top + 1); c.lineTo(x + 1, top - 7); c.lineTo(x + 5, top + 1); c.lineTo(x + 9, top - 3); c.lineTo(x + 11, top + 4); c.closePath(); c.fill();
  c.fillStyle = '#F6D365'; c.beginPath(); c.moveTo(x - 8, top + 3); c.lineTo(x - 7, top - 1); c.lineTo(x - 3, top + 2); c.lineTo(x + 1, top - 5); c.lineTo(x + 5, top + 2); c.lineTo(x + 9, top - 1); c.lineTo(x + 10, top + 3); c.closePath(); c.fill();
  box(c, x, top - 2, 3, 3, '#F472B6');
};
/** A suitor sat (in a makeover chair, on a broom), his tiara on; a face mask too, at the boutique. */
const sitSuitor = (c: Ctx, x: number, feetY: number, face: 1 | -1, f: number, L: SuitorLook, talking: boolean, mask: boolean, crowned = true, astride = false) => {
  drawSuitor(c, x, feetY, face, f, L, astride ? 'ride' : talking ? 'talk' : 'sit', { talking });
  if (mask) { c.save(); c.globalAlpha = 0.85; c.fillStyle = '#86EFAC'; c.beginPath(); c.ellipse(x + face * 6, feetY - 89, 8, 9, 0, 0, Math.PI * 2); c.fill(); c.restore(); box(c, x + face * 4 - 3, feetY - 92, 4, 4, '#BBF7D0'); box(c, x + face * 9 - 3, feetY - 92, 4, 4, '#BBF7D0'); }
  if (crowned) tiara(c, x + face * (astride ? 12 : 2), feetY - (astride ? 102 : 104));
};

/** The boutique's front (behind him): pink plaster in steps, its sides going back (one eye), pilasters and a gilt
 *  cornice, a striped scalloped awning (dimmed: it's not stood on), the window (the salon inside: heart wallpaper,
 *  vanity mirrors ringed with bulbs, a chandelier, pink chairs under chrome dryer hoods, whoever's in them), a glass
 *  door with its OPEN heart. */
const BQ_H = 230;
export const drawBoutique = (c: Ctx, state: GameState) => {
  const a = X(BOUTIQUE.a), b = X(BOUTIQUE.b);
  if (!onScreen(state, a - 120, b + 120)) return;
  const k = keepOf(state), f = state.frame, gy = Y(0), v = viewOf(state);
  const Pk = rampH(ramp6('#E8A8C8')), Pd = rampH(ramp6('#E8A8C8'), true);
  // (its sides and roof going back)
  sideBack(c, v.eye, a, -1, gy - BQ_H, gy, 1, 0.88, Pd, 3);
  sideBack(c, v.eye, b, 1, gy - BQ_H, gy, 1, 0.88, Pd, 3);
  topBack(c, v.eye, a, b, gy - BQ_H, 1, 0.88, rampH(ramp6('#9A6A8A'), true), 2);
  const wa = a + 40, wb = b - 90, wt = gy - 160, wbot = gy - 20, ww = wb - wa;
  // (the salon inside, live: who's in the chairs changes)
  still(c, 'kp-salon', wa, wt, 0, 0, ww, wbot - wt, g => {
    const W = rampH(ramp6('#F4C8DC'), true), Gd = rampH(GOLD), Ch = rampH(ramp6('#C8CCD8'));
    box(g, 0, 0, ww, wbot - wt, W[3]);
    for (let y = 4; y < wbot - wt; y += 14) for (let x = ((y / 14) % 2) * 9; x < ww; x += 18) { box(g, x, y, 2, 2, W[2]); box(g, x + 2, y, 2, 2, W[2]); box(g, x + 1, y + 2, 2, 2, W[2]); }
    box(g, 0, 70, ww, 70, W[2]); box(g, 0, 70, ww, 2, W[5]); for (let x = 6; x < ww; x += 16) box(g, x, 76, 10, 56, W[1]);
    // (vanity mirrors ringed with bulbs over each chair)
    for (const sx of BOUTIQUE.seats) { const mx = X(sx) - wa; box(g, mx - 22, 10, 44, 50, INK); box(g, mx - 21, 11, 42, 48, Gd[3]); box(g, mx - 18, 14, 36, 42, '#C8DCF0'); box(g, mx - 18, 14, 10, 42, '#E4F0FA'); for (let k2 = 0; k2 < 5; k2++) { box(g, mx - 20 + k2 * 9, 9, 3, 3, lit() ? '#FFF6C8' : '#F4ECD8'); box(g, mx - 23, 16 + k2 * 9, 3, 3, lit() ? '#FFF6C8' : '#F4ECD8'); box(g, mx + 20, 16 + k2 * 9, 3, 3, lit() ? '#FFF6C8' : '#F4ECD8'); } }
    // (a chandelier)
    const cx = ww / 2; box(g, cx, 0, 1, 8, INK); box(g, cx - 14, 8, 28, 3, Gd[3]); for (let k2 = -2; k2 <= 2; k2++) { box(g, cx + k2 * 6 - 1, 4, 2, 4, '#F4ECD8'); box(g, cx + k2 * 6 - 1, 2, 2, 2, '#FDE68A'); box(g, cx + k2 * 6, 11, 1, 4, '#E4F0FA'); }
    // (the chairs' backs and the dryer hoods on their stalks)
    for (const sx of BOUTIQUE.seats) { const mx = X(sx) - wa; box(g, mx + 4, 50, 3, 40, INK); box(g, mx + 5, 50, 1, 40, Ch[4]); g.fillStyle = INK; g.beginPath(); g.ellipse(mx - 4, 40, 19, 13, 0, Math.PI, 0); g.fill(); box(g, mx - 23, 40, 38, 6, INK); g.fillStyle = Ch[3]; g.beginPath(); g.ellipse(mx - 4, 40, 17, 11, 0, Math.PI, 0); g.fill(); box(g, mx - 21, 40, 34, 4, Ch[2]); box(g, mx - 14, 32, 8, 3, Ch[5]); }
  });
  c.save(); c.beginPath(); c.rect(wa, wt, ww, wbot - wt); c.clip();
  const who = inShop(state), Ch = rampH(ramp6('#C86A9A')), Cr = rampH(ramp6('#C8CCD8'));
  BOUTIQUE.seats.forEach((sx, i) => {
    // (the chair: pink vinyl, buttoned, on a chrome base)
    const x = X(sx);
    box(c, x - 18, gy - 72, 36, 54, INK); box(c, x - 17, gy - 71, 34, 52, Ch[3]); box(c, x - 17, gy - 71, 6, 52, Ch[4]); box(c, x + 10, gy - 71, 7, 52, Ch[2]);
    for (const [bx, by] of [[-6, -60], [4, -60], [-6, -44], [4, -44]]) box(c, x + bx, gy + by, 2, 2, Ch[1]);
    box(c, x - 4, gy - 20, 8, 6, Cr[3]); box(c, x - 14, gy - 16, 28, 4, INK); box(c, x - 13, gy - 15, 26, 2, Cr[4]);
    const id = who[i];
    if (id) sitSuitor(c, x, gy - 10, -1, f + i * 17, LOOK[id], k.shop.who === id && !!k.shop.said, true);
  });
  c.restore();
  // (the shopfront over it, the window and the door cut out of it)
  still(c, 'kp-boutique', a, gy, -14, -BQ_H - 30, b - a + 28, BQ_H + 34, g => {
    const w = b - a, Gd = rampH(GOLD), Aw = rampH(ramp6('#C86A9A'), true), Wh = rampH(ramp6('#F4E4EC'), true), Dr = rampH(ramp6('#9A4A74'));
    g.save(); g.beginPath(); g.rect(-14, -BQ_H - 30, w + 28, BQ_H + 34); g.rect(wa - a, wt - gy, ww, wbot - wt); g.rect(w - 67, -117, 44, 117); g.clip('evenodd');
    box(g, -1, -BQ_H - 1, w + 2, BQ_H + 1, INK); box(g, 0, -BQ_H, w, BQ_H, Pk[3]);
    for (let y = -BQ_H + 6; y < 0; y += 9) for (let x = (Math.floor(y / 9) % 2) * 5; x < w; x += 10) box(g, x, y, 3, 1, Pk[2]);
    box(g, 0, -BQ_H, 3, BQ_H, Pk[5]); box(g, w - 6, -BQ_H, 6, BQ_H, Pk[1]); box(g, w - 10, -BQ_H, 4, BQ_H, Pk[2]);
    // (pilasters with gilt capitals)
    for (const px2 of [8, wa - a - 14, wb - a + 4, w - 84, w - 18]) { box(g, px2 - 1, -BQ_H + 30, 12, BQ_H - 30, INK); box(g, px2, -BQ_H + 30, 10, BQ_H - 30, Pk[4]); box(g, px2, -BQ_H + 30, 2, BQ_H - 30, Pk[5]); box(g, px2 + 7, -BQ_H + 30, 3, BQ_H - 30, Pk[2]); box(g, px2 - 2, -BQ_H + 28, 14, 5, Gd[3]); box(g, px2 - 2, -8, 14, 8, Pk[2]); }
    // (the cornice: gilt, dentils, a crown over the middle)
    box(g, -6, -BQ_H - 8, w + 12, 12, INK); box(g, -5, -BQ_H - 7, w + 10, 10, Pk[4]); box(g, -5, -BQ_H - 7, w + 10, 2, Pk[5]); box(g, -5, -BQ_H + 1, w + 10, 2, Gd[3]);
    for (let x = -4; x < w + 4; x += 6) box(g, x, -BQ_H + 3, 3, 3, Pk[2]);
    const cx = w / 2; g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 30, -BQ_H - 7); g.lineTo(cx - 30, -BQ_H - 24); g.lineTo(cx - 16, -BQ_H - 14); g.lineTo(cx, -BQ_H - 30); g.lineTo(cx + 16, -BQ_H - 14); g.lineTo(cx + 30, -BQ_H - 24); g.lineTo(cx + 30, -BQ_H - 7); g.closePath(); g.fill();
    g.fillStyle = Gd[3]; g.beginPath(); g.moveTo(cx - 28, -BQ_H - 8); g.lineTo(cx - 28, -BQ_H - 21); g.lineTo(cx - 16, -BQ_H - 12); g.lineTo(cx, -BQ_H - 27); g.lineTo(cx + 16, -BQ_H - 12); g.lineTo(cx + 28, -BQ_H - 21); g.lineTo(cx + 28, -BQ_H - 8); g.closePath(); g.fill();
    box(g, cx - 2, -BQ_H - 20, 4, 4, '#F472B6'); box(g, cx - 28, -BQ_H - 10, 56, 2, Gd[2]);
    // (the awning: pink and white stripes, scalloped, its shadow under (dimmed: not stood on))
    box(g, -8, -200, w + 16, 26, INK);
    for (let x = -7; x < w + 8; x += 24) { box(g, x, -199, 12, 22, Aw[3]); box(g, x + 12, -199, 12, 22, Wh[3]); box(g, x, -199, 12, 2, Aw[5]); box(g, x + 12, -199, 12, 2, Wh[5]); g.fillStyle = INK; g.beginPath(); g.arc(x + 6, -177, 6, 0, Math.PI); g.arc(x + 18, -177, 6, 0, Math.PI); g.fill(); g.fillStyle = Aw[3]; g.beginPath(); g.arc(x + 6, -177, 5, 0, Math.PI); g.fill(); g.fillStyle = Wh[3]; g.beginPath(); g.arc(x + 18, -177, 5, 0, Math.PI); g.fill(); }
    box(g, 0, -170, w, 4, Pk[1]); checker(g, 0, -166, w, 4, Pk[1], 0, 1);
    // (the window's frame: a gilt moulding, mullions, a sill with a box of roses)
    g.restore();
    const fx = wa - a, fy2 = wt - gy;
    box(g, fx - 5, fy2 - 5, ww + 10, 5, INK); box(g, fx - 4, fy2 - 4, ww + 8, 3, Gd[3]); box(g, fx - 5, fy2, 5, wbot - wt, INK); box(g, fx - 4, fy2, 3, wbot - wt, Gd[3]); box(g, fx + ww, fy2, 5, wbot - wt, INK); box(g, fx + ww + 1, fy2, 3, wbot - wt, Gd[2]);
    for (let k2 = 1; k2 < 3; k2++) { box(g, fx + (ww * k2) / 3 - 1, fy2, 3, 40, INK); box(g, fx + (ww * k2) / 3, fy2, 1, 40, Gd[3]); }
    box(g, fx, fy2 + 40, ww, 3, INK); box(g, fx, fy2 + 41, ww, 1, Gd[3]);
    for (let k2 = 0; k2 < 6; k2++) { const lx = fx + 4 + k2 * ((ww - 8) / 6); g.fillStyle = INK; g.beginPath(); g.arc(lx + (ww - 8) / 12, fy2 + 20, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FBE4F0'; g.beginPath(); g.arc(lx + (ww - 8) / 12, fy2 + 20, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F472B6'; g.beginPath(); g.arc(lx + (ww - 8) / 12 - 2, fy2 + 19, 2.5, 0, Math.PI * 2); g.arc(lx + (ww - 8) / 12 + 2, fy2 + 19, 2.5, 0, Math.PI * 2); g.fill(); }
    box(g, fx - 8, wbot - gy, ww + 16, 7, INK); box(g, fx - 7, wbot - gy + 1, ww + 14, 5, Pk[5]); box(g, fx - 7, wbot - gy + 5, ww + 14, 1, Pk[1]);
    box(g, fx - 2, wbot - gy + 7, ww + 4, 12, INK); box(g, fx - 1, wbot - gy + 8, ww + 2, 10, Dr[2]);
    for (let x = fx; x < fx + ww; x += 7) { box(g, x, wbot - gy + 2, 6, 6, LEAF[3]); box(g, x + 1, wbot - gy + 1, 3, 3, (x / 7) % 2 ? '#E11D48' : '#F472B6'); }
    // (the door: glass panes in a pink frame, a brass handle, its OPEN heart hung in it)
    box(g, w - 70, -120, 50, 120, INK); box(g, w - 69, -119, 48, 119, Dr[3]); box(g, w - 69, -119, 2, 119, Dr[5]);
    box(g, w - 63, -112, 36, 60, INK); box(g, w - 62, -111, 34, 58, '#C8DCF0'); box(g, w - 62, -111, 10, 58, '#E4F0FA'); box(g, w - 45, -111, 1, 58, INK);
    box(g, w - 63, -46, 36, 40, Dr[2]); box(g, w - 63, -46, 36, 1, Dr[4]);
    box(g, w - 30, -64, 5, 4, Gd[3]); box(g, w - 30, -64, 5, 1, Gd[5]);
    g.fillStyle = INK; g.beginPath(); g.arc(w - 50, -86, 8, 0, Math.PI * 2); g.arc(w - 40, -86, 8, 0, Math.PI * 2); g.fill(); polyF(g, [[w - 59, -84], [w - 45, -68], [w - 31, -84]], INK);
    g.fillStyle = '#F472B6'; g.beginPath(); g.arc(w - 50, -86, 7, 0, Math.PI * 2); g.arc(w - 40, -86, 7, 0, Math.PI * 2); g.fill(); polyF(g, [[w - 57, -84], [w - 45, -70], [w - 33, -84]], '#F472B6');
    box(g, w - 53, -88, 16, 4, '#FFFFFF'); box(g, w - 52, -87, 14, 2, '#F472B6');
    box(g, w - 76, -6, 62, 6, INK); box(g, w - 75, -5, 60, 4, Pk[2]);
  });
  // (the glass: a shine across the window)
  c.save(); c.beginPath(); c.rect(wa, wt, ww, wbot - wt); c.clip(); c.globalAlpha = 0.16; c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(wa + 20, wt + 42); c.lineTo(wa + 70, wt + 42); c.lineTo(wa + 20, wbot); c.lineTo(wa - 30, wbot); c.closePath(); c.fill(); c.restore();
};
/** What they're saying, over them (in front of everything). */
export const drawBoutiqueFront = (c: Ctx, state: GameState) => {
  const k = keepOf(state);
  if (!k.shop.said || !k.shop.who) return;
  const i = inShop(state).indexOf(k.shop.who as RivalId);
  if (i < 0) return;
  saidOver(c, k.shop.said.text, X(BOUTIQUE.seats[i]), Y(0) - 10 - SUITOR_H - 16, '#FDE68A', 220);
};

// ---------------------------------------------------------------------------------------------------------------
// The runway

const HOVER = 46;
const AWAY = -99999;

export const buildRunway = (state: GameState) => {
  const k = keepOf(state), s = k.scene;
  if (runwayDone(state)) { s.step = 'done'; s.flyers = []; s.broom = null; return; }
  const ids = [...survivors(state), ...FASTPASS.map(r => r.id)];
  s.flyers = ids.map((id, i): Flyer => ({ id, x: X(SCENE.spots[i]), y: Y(HOVER), said: null, vx: 0, vy: 0, gone: false }));
  // (the spare broom on its cradle: a ledge he could stand on)
  const b: Block = { x: X(SCENE.cradle.x) - 36, y: Y(SCENE.cradle.h), w: 72, h: 10, type: 'platform', oneWay: true, hidden: true, tag: 'fa-keep-broom' } as Block;
  state.blocks.push(b);
  s.broom = b;
};

const piperSays = (k: Keep, text: string | null, then: () => void) => {
  if (!text) { then(); return; }
  k.scene.who = 'piper';
  speak(PIPER_PA_VOICE, text, x => { k.scene.said = x; }, true, () => { k.scene.said = null; k.scene.who = null; then(); });
};
const suitorSays = (state: GameState, k: Keep, id: string, then: () => void) => {
  const fl = k.scene.flyers.find(f => f.id === id);
  k.scene.who = id;
  speak(LOOK[id].voice, pickLine(byPants(state, RUNWAY_SAY[id as RivalId | FastId])), x => { if (fl) fl.said = x; }, true, () => { if (fl) fl.said = null; k.scene.who = null; then(); });
};

/** The scene's over (run through, or skipped): on to the broomstick deathmatch. */
const finish = (state: GameState, skipped: boolean) => {
  const k = keepOf(state), s = k.scene;
  if (skipped) silenceAll();
  state.stageMemo[RUNWAY_MEMO] = '1';
  state.stageMemo[ROSTER_MEMO] = s.flyers.map(f => f.id).join(',');
  s.step = 'done'; s.said = null; s.who = null; s.fade = 0; s.hearts = 0;
  for (const fl of s.flyers) { fl.gone = true; fl.said = null; }
  if (s.broom) { s.broom.y = AWAY; s.broom = null; }
  for (const e of state.enemies) if (e.puppet && Math.abs(e.pos.x - X(SCENE.cam)) < 1600) e.puppet = false;
  const p = state.player;
  p.inCutscene = false; p.broomRide = undefined;
  state.cameraOverride = null;
  teleport(state, DOORS.broom.start.x, DOORS.broom.start.y);
};

/** Each frame on the runway: the shots bouncing off them, the scene. */
export const updateRunway = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, k = keepOf(state), s = k.scene, p = state.player, f = state.frame;
  const cx = p.pos.x + p.width / 2;
  if (s.step === 'done') {
    if (runwayDone(state) && cx > X(9300) && cx < X(11000) && !k.said.empty && p.health > 0) { k.said.empty = true; meatheadSays(state, pickLine(byPants(state, EMPTY)), true); }
    return controls;
  }
  // (shot at: it bounces off them)
  state.projectiles = state.projectiles.filter(q => {
    if (q.owner !== 'player') return true;
    const qx = q.pos.x + (q.width ?? 0) / 2, qy = q.pos.y + (q.height ?? 0) / 2;
    const fl = s.flyers.find(r => !r.gone && Math.abs(qx - r.x) < 26 && qy > r.y + 34 - SUITOR_H && qy < r.y + 10);
    if (!fl) return true;
    playSound('clink', 0.7, 6);
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: qx, y: qy }, vel: { x: -Math.sign(q.vel.x || 1) * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 16, color: i % 2 ? '#FEF08A' : '#FFFFFF', size: 2 });
    if (!k.said.bounce && s.step === 'wait') { k.said.bounce = true; speak(LOOK[fl.id].voice, pickLine(RUNWAY_BOUNCE), x => { fl.said = x; }, false); }
    return false;
  });
  // (the brooms bob as they hover)
  for (const fl of s.flyers) if (!fl.gone && s.step !== 'launch' && s.step !== 'fade') fl.y = Y(HOVER) + Math.sin((f + fl.x) * 0.06) * 3;
  s.t++;
  if (s.step === 'wait') {
    if (cx > X(SCENE.trigger) && cx < X(SCENE.spots[0]) && p.health > 0 && !p.inCutscene && p.isGrounded) {
      s.step = 'walk'; s.t = 0; s.all = 0; s.line = 0;
      p.inCutscene = true;
      state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
      k.throws = [];
      for (const e of state.enemies) if (e.health > 0 && Math.abs(e.pos.x - X(SCENE.cam)) < 1600) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; }
      // (who gets a line: up to two of the ride's survivors, and a FASTPASS boy (the gag))
      const sv = survivors(state).sort(() => Math.random() - 0.5).slice(0, 2);
      s.talkers = [...sv, FASTPASS[Math.floor(Math.random() * FASTPASS.length)].id];
    }
    return controls;
  }
  // (the cutscene: no HUD, no controls, SKIP >> for the lot)
  s.all++;
  p.inCutscene = true;
  for (const e of state.enemies) if (e.puppet) { e.pauseTimer = 2; e.vel.x = 0; }
  state.cameraOverride = { x: X(SCENE.cam), y: state.camera.y };
  state.camera.x += (X(SCENE.cam) - state.camera.x) * 0.12;
  if (s.all > SKIP_AFTER) {
    offerSkip();
    if (takeSkip()) { finish(state, true); return hands(); }
  }
  if (s.hearts > 0) {
    s.hearts--;
    if (s.hearts % 7 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 20, y: p.pos.y - 6 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1.4 }, life: 40, color: Math.random() < 0.5 ? '#F472B6' : '#FB7185', size: 5 });
  }
  // (on his broom: it carries him (lifting, then off with the rest))
  const b = s.broom;
  const carry = (dx: number, dy: number) => { if (!b) return; b.x += dx; b.y += dy; if (s.mounted) { p.pos.x += dx; p.pos.y += dy; p.vel.x = 0; p.vel.y = 0; } };
  if (s.mounted && s.lift > 0) { s.lift--; carry(0, -1); }
  // (astride it, sat on the shaft (render/player/broomPose.ts): sat up hovering, tucked low as it shoots off)
  if (s.mounted) p.broomRide = { lean: s.step === 'launch' ? Math.min(1, 0.15 + s.t / 16) : s.step === 'fade' ? 1 : 0.15 };
  switch (s.step) {
    case 'walk':
      p.facing = 1;
      if (cx < X(SCENE.stop)) return { ...hands(), right: true } as Controls;
      p.vel.x = 0; s.step = 'talk'; s.t = 0;
      return hands();
    case 'talk': {
      if (!s.mounted) { p.vel.x = 0; p.facing = 1; }
      if (s.t === 16) playSound('ding', 0.8, 7);
      if (s.t === 30) playSound('ding', 0.8, 0);
      if (s.t === 56 && s.line === 0) s.line = 1;
      const next = () => { s.line = -1; };
      const after = (n: number) => () => { s.line = n; };
      const nT = s.talkers.length;
      if (s.line === 1) { next(); piperSays(k, piperMust(PIPER_FINAL), after(2)); }
      else if (s.line === 2) { next(); piperSays(k, piperMust(PIPER_RULES), after(3)); }
      else if (s.line >= 3 && s.line < 3 + nT) { const i = s.line - 3; next(); suitorSays(state, k, s.talkers[i], after(4 + i)); }
      else if (s.line === 3 + nT) {
        // (the hop onto the spare broom)
        next(); s.t = 0; s.line = 100;
      } else if (s.line === 100) {
        if (b) {
          const k01 = Math.min(1, s.t / 18), sx = X(SCENE.stop), tx = X(SCENE.cradle.x), ty = b.y;
          p.pos.x = sx + (tx - sx) * k01 - p.width / 2;
          p.pos.y = (Y(0) + (ty - Y(0)) * k01 - Math.sin(k01 * Math.PI) * 40) - p.height;
          p.vel.x = 0; p.vel.y = 0;
          if (s.t === 1) playSound('whoosh', 0.6, 4);
          if (k01 >= 1) {
            s.mounted = true; s.lift = 30; s.hearts = 120; playSound('boing', 0.8, -6);
            s.line = -1;
            meatheadSays(state, pickLine(byPants(state, MOUNT)), true, () => { s.line = 101; });
          }
        } else s.line = 101;
      } else if (s.line === 101) { next(); piperSays(k, piperMust(PIPER_GO), () => { s.step = 'launch'; s.t = 0; }); }
      return hands();
    }
    case 'launch': {
      // (off they go: the suitors one after the other, up and to the right into the sky; him with them)
      s.flyers.forEach((fl, i) => {
        if (s.t < i * 6) return;
        fl.vx = Math.min(8, fl.vx + 0.35); fl.vy = Math.max(-4.5, fl.vy - 0.2);
        fl.x += fl.vx; fl.y += fl.vy;
      });
      if (s.t === 1) { playSound('whoosh', 0.8, -4); playSound('twinkle', 0.5, 0); }
      if (s.t > 10) { const v = Math.min(8, (s.t - 10) * 0.35); carry(v, -v * 0.55); }
      if (s.t > 50) { s.step = 'fade'; s.t = 0; }
      return hands();
    }
    case 'fade': {
      for (const fl of s.flyers) { fl.x += fl.vx; fl.y += fl.vy; }
      carry(8, -4.4);
      s.fade = Math.min(1, s.t / 40);
      if (s.t > 50) finish(state, false);
      return hands();
    }
  }
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A broom: the handle (its front to `face`), bound bristles out the back; a sparkle trail flying. */
export const drawBroom = (c: Ctx, x: number, y: number, face: 1 | -1, f: number, flying = false) => {
  const tip = x + face * 40, bind = x - face * 22, end = x - face * 50;
  const l = Math.min(tip, bind), w = Math.abs(tip - bind);
  // (the handle: polished ash in steps, a knob at its tip, a leather grip)
  box(c, l - 1, y - 3, w + 2, 7, INK);
  box(c, l, y - 2, w, 5, '#8A5A30'); box(c, l, y - 2, w, 1, '#C8965A'); box(c, l, y - 1, w, 1, '#A87440'); box(c, l, y + 2, w, 1, '#5A3A1E');
  for (let k = 0; k < w; k += 9) box(c, l + k, y, 3, 1, '#6A4422');
  c.fillStyle = INK; c.beginPath(); c.arc(tip, y, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A87440'; c.beginPath(); c.arc(tip, y, 3, 0, Math.PI * 2); c.fill(); box(c, tip - 2, y - 2, 1, 1, '#E8C080');
  const gx = x + face * 6; box(c, gx - 7, y - 3, 14, 7, INK); box(c, gx - 6, y - 2, 12, 5, '#4A2A14'); for (let k = -6; k < 6; k += 3) box(c, gx + k, y - 2, 1, 5, '#2A160A');
  // (the bristles: straw bound tight at the handle, flaring out the back in steps, strands, a clipped end)
  c.fillStyle = INK; c.beginPath(); c.moveTo(bind, y - 5); c.quadraticCurveTo((bind + end) / 2, y - 12, end, y - 11); c.lineTo(end, y + 11); c.quadraticCurveTo((bind + end) / 2, y + 12, bind, y + 5); c.closePath(); c.fill();
  c.fillStyle = '#C8A050'; c.beginPath(); c.moveTo(bind, y - 4); c.quadraticCurveTo((bind + end) / 2, y - 11, end + face, y - 10); c.lineTo(end + face, y + 10); c.quadraticCurveTo((bind + end) / 2, y + 11, bind, y + 4); c.closePath(); c.fill();
  c.fillStyle = '#E8C878'; c.beginPath(); c.moveTo(bind, y - 4); c.quadraticCurveTo((bind + end) / 2, y - 11, end + face, y - 10); c.lineTo(end + face, y - 4); c.quadraticCurveTo((bind + end) / 2, y - 4, bind, y - 1); c.closePath(); c.fill();
  c.fillStyle = '#9A7A34'; c.beginPath(); c.moveTo(bind, y + 2); c.quadraticCurveTo((bind + end) / 2, y + 5, end + face, y + 5); c.lineTo(end + face, y + 10); c.quadraticCurveTo((bind + end) / 2, y + 11, bind, y + 4); c.closePath(); c.fill();
  for (let k = -8; k <= 8; k += 2) { const sx = Math.min(bind, end) + 4, sw = Math.abs(end - bind) - 6 - Math.abs(k) * 0.6; box(c, face > 0 ? sx : sx + Math.abs(k) * 0.6, y + k, sw, 1, k % 4 ? '#A8803A' : '#F4DC98'); }
  for (let k = -9; k <= 9; k += 3) box(c, end - face * (1 + (k & 1)), y + k, 2, 1, '#F4DC98');
  // (its bindings: copper bands, a red ribbon in a bow)
  for (const o of [0, 5]) { box(c, bind - face * o - 2, y - 6, 4, 12, INK); box(c, bind - face * o - 1, y - 5, 2, 10, '#C87A3A'); box(c, bind - face * o - 1, y - 5, 1, 10, '#F0A868'); }
  box(c, bind - face * 10 - 2, y - 7, 4, 4, '#B91C1C'); box(c, bind - face * 13 - 2, y - 9, 4, 3, '#DC2626'); box(c, bind - face * 7 - 2, y - 9, 4, 3, '#DC2626');
  if (flying || f % 6 < 3) sparkle(c, end, y, f);
};
const sparkle = (c: Ctx, x: number, y: number, f: number) => {
  for (let k = 0; k < 3; k++) { const sx = x + Math.sin(f * 0.3 + k * 2) * 6, sy = y + Math.cos(f * 0.27 + k) * 6; box(c, sx - 1, sy, 3, 1, '#FFF6C8'); box(c, sx, sy - 1, 1, 3, '#FFF6C8'); }
};

/** The runway's brooms and suitors (behind him); his spare broom on its cradle till he's on it (and under him after). */
export const drawRunway = (c: Ctx, state: GameState) => {
  const s = keepOf(state).scene, f = state.frame;
  if (!onScreen(state, X(SCENE.cradle.x) - 300, X(SCENE.spots[SCENE.spots.length - 1]) + 400) && s.step !== 'launch' && s.step !== 'fade') return;
  // (the cradle: a little oak stand, its two forked posts, a gilt plate: BROOM 7)
  const cx = X(SCENE.cradle.x);
  still(c, 'kp-cradle', cx, Y(0), -40, -SCENE.cradle.h - 10, 80, SCENE.cradle.h + 14, g => {
    const Tm = rampH(TIMBER), Gd = rampH(GOLD), h = SCENE.cradle.h;
    box(g, -36, -6, 72, 6, INK); box(g, -35, -5, 70, 4, Tm[3]); box(g, -35, -5, 70, 1, Tm[5]);
    for (const dx of [-26, 22]) { box(g, dx - 1, -h, 7, h, INK); box(g, dx, -h, 5, h, Tm[3]); box(g, dx, -h, 1, h, Tm[5]); box(g, dx + 4, -h, 1, h, Tm[1]); box(g, dx - 3, -h - 4, 3, 6, INK); box(g, dx + 5, -h - 4, 3, 6, INK); box(g, dx - 2, -h - 3, 1, 4, Tm[4]); box(g, dx + 6, -h - 3, 1, 4, Tm[4]); }
    box(g, -14, -26, 28, 10, INK); box(g, -13, -25, 26, 8, Gd[3]); box(g, -13, -25, 26, 1, Gd[5]);
    for (let k = 0; k < 5; k++) box(g, -10 + k * 4, -22, 3, 3, '#3A2208');
    box(g, 9, -23, 2, 4, '#3A2208');
  });
  if (s.broom) drawBroom(c, s.broom.x + 36, s.broom.y + 4, 1, f, s.step === 'launch' || s.step === 'fade');
  for (const fl of s.flyers) {
    if (fl.gone) continue;
    const face: 1 | -1 = s.step === 'launch' || s.step === 'fade' ? 1 : -1;
    drawBroom(c, fl.x, fl.y, face, f, s.step === 'launch' || s.step === 'fade');
    sitSuitor(c, fl.x - face * 4, fl.y + 34, face, f + fl.x, LOOK[fl.id], !!fl.said, false, RIVALS.some(r => r.id === fl.id), true);
  }
};
/** What's being said: Piper's out of the PA, a suitor's over him. */
export const drawRunwayFront = (c: Ctx, state: GameState) => {
  const s = keepOf(state).scene;
  if (s.who === 'piper' && s.said) saidOver(c, s.said.text, X(SCENE.horn.x) + 30, Y(SCENE.horn.h) - 34, '#F9A8D4', 260);
  for (const fl of s.flyers) if (fl.said && !fl.gone) saidOver(c, fl.said.text, fl.x, fl.y + 34 - SUITOR_H - 22, '#FDE68A', 220);
};
/** Screen space: the fade to black, SKIP >>. */
export const drawRunwayHud = (c: Ctx, state: GameState) => {
  const s = keepOf(state).scene;
  if (s.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${s.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if ((s.step === 'walk' || s.step === 'talk' || s.step === 'launch' || s.step === 'fade') && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
/** Is Piper talking out of the broom port's horn (for its rings)? */
export const runwayPiper = (state: GameState) => { const s = keepOf(state).scene; return s.who === 'piper' && !!s.said; };
