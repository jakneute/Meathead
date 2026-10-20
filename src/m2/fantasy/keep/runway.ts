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
import { box, onScreen, INK, type Ctx } from '../kit';
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

/** The boutique's front (behind him): its window, the chairs behind it, whoever's in them; its sign. */
export const drawBoutique = (c: Ctx, state: GameState) => {
  const a = X(BOUTIQUE.a), b = X(BOUTIQUE.b);
  if (!onScreen(state, a - 40, b + 40)) return;
  const k = keepOf(state), f = state.frame, gy = Y(0);
  // (the shopfront: pink plaster, a striped awning (dimmed: it's not stood on), the door)
  box(c, a - 1, gy - 231, b - a + 2, 231, INK); box(c, a, gy - 230, b - a, 230, '#E8A8C8'); box(c, a, gy - 230, b - a, 8, '#F4C8DC');
  for (let x = a; x < b; x += 24) { box(c, x, gy - 196, 12, 22, '#C86A9A'); box(c, x + 12, gy - 196, 12, 22, '#F4E4EC'); }
  box(c, a, gy - 176, b - a, 3, '#9A4A74');
  // (the window: the salon inside, its chairs, the suitors in them)
  const wa = a + 40, wb = b - 90, wt = gy - 160, wbot = gy - 20;
  box(c, wa - 3, wt - 3, wb - wa + 6, wbot - wt + 6, INK); box(c, wa, wt, wb - wa, wbot - wt, '#FBE4F0');
  for (let x = wa + 10; x < wb; x += 40) box(c, x, wt + 10, 22, 30, '#E8D0F0');
  c.save(); c.beginPath(); c.rect(wa, wt, wb - wa, wbot - wt); c.clip();
  const who = inShop(state);
  BOUTIQUE.seats.forEach((sx, i) => {
    // (the chair: a pink salon chair, a dryer hood over it)
    box(c, X(sx) - 16, gy - 70, 34, 50, '#C86A9A'); box(c, X(sx) - 20, gy - 132, 30, 18, '#D4D4D8');
    const id = who[i];
    if (id) sitSuitor(c, X(sx), gy - 10, -1, f + i * 17, LOOK[id], k.shop.who === id && !!k.shop.said, true);
  });
  c.restore();
  // (the glass: a shine across it; the sill)
  c.save(); c.globalAlpha = 0.18; c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(wa + 20, wt); c.lineTo(wa + 70, wt); c.lineTo(wa + 20, wbot); c.lineTo(wa - 30, wbot); c.closePath(); c.fill(); c.restore();
  box(c, wa - 6, wbot, wb - wa + 12, 6, '#9A4A74');
  // (the door)
  box(c, b - 70, gy - 120, 50, 120, INK); box(c, b - 67, gy - 117, 44, 117, '#9A4A74'); box(c, b - 30, gy - 62, 4, 4, '#F6D365');
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
  box(c, Math.min(tip, bind) - 1, y - 3, Math.abs(tip - bind) + 2, 6, INK);
  box(c, Math.min(tip, bind), y - 2, Math.abs(tip - bind), 4, '#8A5A30'); box(c, Math.min(tip, bind), y - 2, Math.abs(tip - bind), 1, '#B8864A');
  c.fillStyle = INK; c.beginPath(); c.moveTo(bind, y - 5); c.lineTo(end, y - 10); c.lineTo(end, y + 10); c.lineTo(bind, y + 5); c.closePath(); c.fill();
  c.fillStyle = '#D8B060'; c.beginPath(); c.moveTo(bind, y - 4); c.lineTo(end + face, y - 8); c.lineTo(end + face, y + 8); c.lineTo(bind, y + 4); c.closePath(); c.fill();
  for (let k = -6; k <= 6; k += 3) box(c, Math.min(bind, end) + 4, y + k, Math.abs(end - bind) - 6, 1, '#A8803A');
  box(c, bind - (face > 0 ? 4 : 0), y - 5, 4, 10, '#B91C1C');
  if (flying || f % 6 < 3) sparkle(c, end, y, f);
};
const sparkle = (c: Ctx, x: number, y: number, f: number) => {
  for (let k = 0; k < 3; k++) { const sx = x + Math.sin(f * 0.3 + k * 2) * 6, sy = y + Math.cos(f * 0.27 + k) * 6; box(c, sx - 1, sy, 3, 1, '#FFF6C8'); box(c, sx, sy - 1, 1, 3, '#FFF6C8'); }
};

/** The runway's brooms and suitors (behind him); his spare broom on its cradle till he's on it (and under him after). */
export const drawRunway = (c: Ctx, state: GameState) => {
  const s = keepOf(state).scene, f = state.frame;
  if (!onScreen(state, X(SCENE.cradle.x) - 300, X(SCENE.spots[SCENE.spots.length - 1]) + 400) && s.step !== 'launch' && s.step !== 'fade') return;
  // (the cradle: a little wooden stand, BROOM 7 on it)
  const cx = X(SCENE.cradle.x), ch = Y(SCENE.cradle.h);
  for (const dx of [-26, 22]) { box(c, cx + dx - 1, ch, 6, Y(0) - ch, INK); box(c, cx + dx, ch + 1, 4, Y(0) - ch - 1, '#7A5230'); }
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
