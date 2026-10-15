// The ray gun in space. Space radiation gets into it and it upgrades itself as the shooter goes on, like a shmup's power
// levels, and says so (its own voice: m2.space.raygun, the words over him with a little gun by them):
//   0  rapid fire (a bolt every 5 frames: the ground's is 12)
//   1  twin streams, quicker
//   2  a three-way spread
//   3  a five-way spread
//   4  plasma: five fat bolts, harder hitting
//   5  THE BEAM: held fire is one huge beam the height of a man across the whole screen. Anything in it's gone; the
//      saucer's health pours out of it.
// The level is where the shooter's got to (the scroll), so starting again at a checkpoint puts it right back where it
// was. None of it leaves space: on the ground the gun's itself again ("GOING BACK TO FACTORY SETTINGS": ufo.ts).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Projectile } from '../../../m1/types';
import { say } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { voice, saidOver, box, meatheadSays } from '../section';
import { orbitOf } from './state';
import { steppedGlow, checker } from '../../../m1/game/render/pixelArt';
import { X0, W } from './geo';
import { GUN_UPGRADE, MH_BEAM } from './lines';

type Ctx = CanvasRenderingContext2D;

/** Where (camera offset into the section) each level comes in, every couple of thousand px; the beam last, well before the
 *  saucer (time to enjoy it on the way). */
export const LEVEL_AT = [0, 2000, 4200, 6400, 8800, 11200];
export const MAX_LEVEL = 5;
/** How far out the radiation first gets into it (the plain ray gun till then, at its own rate). */
export const RAPID_AT = 800;
export const levelAt = (off: number) => { let l = 0; for (let i = 0; i < LEVEL_AT.length; i++) if (off >= LEVEL_AT[i]) l = i; return l; };
/** Frames between bolts, by level. */
const COOLDOWN = [4, 3, 3, 3, 3, 3];
/** What a bolt does to the saucer (a share of its usual hit): it barely notices, till the beam. */
export const SAUCER_SHARE = [0.06, 0.05, 0.04, 0.035, 0.035, 0.035];
/** Bolts alone never take it below this share of its health: it's the beam that finishes it. */
export const SAUCER_FLOOR = 0.35;
/** The beam: its height, what it takes out of the saucer a frame (the saucer's left at most 35% by then: ~6.5 s of beam,
 *  so the gun's MAXIMUM RADIATION line is heard whole before it goes), out of anybody else. */
export const BEAM_H = 70, BEAM_SAUCER = 8, BEAM_HIT = 400;

export interface GunTalk { text: string }
const SAY = voice('m2.space.raygun');

/** The gun says something (waits its turn: nobody talks over anybody). */
export const gunSays = (state: GameState, text: string, then?: () => void) => {
  const o = orbitOf(state);
  // (whatever comes after it, once: when it's over, however it ends)
  let fired = false;
  const onDone = () => { if (!fired) { fired = true; then?.(); } };
  const shown = say(text, SAY, 'queue', {
    always: true,
    onShow: spoken => { o.gun = { text }; if (!spoken) setTimeout(() => { if (o.gun?.text === text) o.gun = null; onDone(); }, Math.max(1800, text.length * 70)); },
    onHide: () => { if (o.gun?.text === text) o.gun = null; onDone(); },
    onDropped: () => onDone(),
  });
  if (!shown) onDone();
};

/** Each frame flying: the level (and its announcement), the rate, the extra bolts, the beam. Returns the controls. */
export const updateGun = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, o = orbitOf(state), p = state.player;
  const lv = o.quiet ? 0 : levelAt(o.scroll - X0);
  if (lv > o.level) {
    o.level = lv;
    // (said once each, as it gets there; starting again past one, it's just there)
    if (!o.levelSaid.includes(lv)) { o.levelSaid.push(lv); gunSays(state, GUN_UPGRADE[lv], lv === MAX_LEVEL ? () => meatheadSays(state, MH_BEAM, true) : undefined); playSound('powerup', 0.8, lv); o.flashUp = 30; }
  }
  if (o.flashUp > 0) o.flashUp--;
  // (the saucer's got him (or it's on its way to): no beam, no bolts)
  const sc = o.saucer;
  if (sc && sc.st !== 'fight' && sc.st !== 'enter') { o.beam = false; return { ...controls, shoot: false }; }
  // The beam: held fire is the beam, not bolts
  if (o.level >= MAX_LEVEL) {
    o.beam = !!controls.shoot && p.health > 0 && !p.inCutscene;
    if (o.beam) beam(ctx);
    return { ...controls, shoot: false };
  }
  o.beam = false;
  // (a bolt out since last frame (the engine's): its brothers with it)
  extraBolts(state, o.level);
  // (plain till the radiation's in it: the ground's own rate)
  if (o.level > 0 || state.stageMemo['m2:orbit:rapid']) p.shootCooldown = Math.min(p.shootCooldown, COOLDOWN[o.level]);
  return controls;
};

/** Bolts already given their brothers (or brothers themselves). */
const done = new WeakSet<Projectile>();
const extraBolts = (state: GameState, lv: number) => {
  const fresh = state.projectiles.filter(q => q.owner === 'player' && q.isRay && !done.has(q));
  for (const src of fresh) {
    done.add(src);
    const speed = Math.hypot(src.vel.x, src.vel.y);
    const make = (dy: number, a: number): Projectile => ({ ...src, id: `${src.id}-${dy}-${a}`, pos: { x: src.pos.x, y: src.pos.y + dy }, vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed } });
    if (lv >= 4) { src.width = 26; src.height = 12; src.pos.y -= 3; src.damage = src.damage * 1.6; }
    const extra: Projectile[] = [];
    if (lv === 1) { src.pos.y -= 6; extra.push(make(12, 0)); }
    if (lv === 2) extra.push(make(0, -0.14), make(0, 0.14));
    if (lv >= 3) extra.push(make(0, -0.12), make(0, 0.12), make(0, -0.26), make(0, 0.26));
    for (const q of extra) done.add(q);
    state.projectiles.push(...extra);
  }
};

/** The beam: from his gun to the screen's right edge. */
const beamBox = (state: GameState) => {
  const p = state.player;
  const x0 = p.pos.x + p.width - 4, y = p.pos.y + p.height * 0.45;
  return { x0, x1: state.camera.x + W + 40, y0: y - BEAM_H / 2, y1: y + BEAM_H / 2, y };
};
const beam = (ctx: FrameContext) => {
  const { state } = ctx, o = orbitOf(state), b = beamBox(state);
  if (state.frame % 8 === 0) playSound('alienBeam', 0.5, 8);
  // (everybody in it, their bolts, the rocks)
  for (const e of hazardVictims(state)) if (e.pos.x + e.width > b.x0 && e.pos.x < b.x1 && e.pos.y + e.height > b.y0 && e.pos.y < b.y1) hazardHit(ctx, e, BEAM_HIT, b.x0, 'VAPORIZED!', { color: '#F9A8D4' });
  for (const q of state.projectiles) if (q.owner === 'enemy' && q.pos.x + q.width > b.x0 && q.pos.y + q.height > b.y0 && q.pos.y < b.y1) q.health = 0;
  for (const k of o.rocks) if (k.x > b.x0 && Math.abs(k.y - b.y) < BEAM_H / 2 + k.r && !k.junk) k.hp -= 30;
  // (the saucer: ufo.ts takes it out of it, if it's in it)
  const s = o.saucer;
  if (s && s.st === 'fight' && s.e.pos.x + s.e.width > b.x0 && s.e.pos.y < b.y1 && s.e.pos.y + s.e.height > b.y0) { s.hp -= BEAM_SAUCER; s.flash = 2; }
};

/** World: the beam (in front of everything), and the gun's words over him. */
export const drawGun = (c: Ctx, state: GameState) => {
  const o = orbitOf(state), f = state.frame;
  if (o.beam) {
    const b = beamBox(state), h = BEAM_H + (f % 4) * 3;
    box(c, b.x0, b.y - h / 2 - 10, b.x1 - b.x0, h + 20, 'rgba(244, 114, 182, 0.22)');
    checker(c, b.x0, b.y - h / 2 - 12, b.x1 - b.x0, 2, 'rgba(244, 114, 182, 0.55)', f % 2); checker(c, b.x0, b.y + h / 2 + 10, b.x1 - b.x0, 2, 'rgba(244, 114, 182, 0.55)', f % 2);
    box(c, b.x0, b.y - h / 2, b.x1 - b.x0, h, '#DB2777');
    box(c, b.x0, b.y - h / 3, b.x1 - b.x0, h * 0.66, '#F472B6');
    box(c, b.x0, b.y - h / 6, b.x1 - b.x0, h / 3, '#FBCFE8');
    box(c, b.x0, b.y - 3, b.x1 - b.x0, 6, '#FFFFFF');
    for (let i = 0; i < 8; i++) { const x = b.x0 + ((f * 23 + i * 97) % (b.x1 - b.x0)); box(c, x, b.y - h / 2 - 6 + (i % 3) * (h / 2), 30, 3, '#FFFFFF'); }
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(b.x0 + 4, b.y, 18 + (f % 3) * 3, 0, Math.PI * 2); c.fill();
  }
  // (plasma: the fat bolts glow fat)
  for (const q of state.projectiles) {
    if (q.owner !== 'player' || !q.isRay || q.width < 26 || q.health <= 0) continue;
    const x = q.pos.x + q.width / 2, y = q.pos.y + q.height / 2;
    steppedGlow(c, x, y, 17, '#F472B6', 0.6, 0.12, 4);
    c.fillStyle = '#DB2777'; c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FBCFE8'; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x + 2, y - 1, 4, 0, Math.PI * 2); c.fill();
  }
  const p = state.player;
  // (powered up: rings of pink light going out off him, stepped, each with a darker ring under it; sparkles)
  if (o.flashUp > 0) {
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2, r = 46 + (30 - o.flashUp) * 1.4;
    for (const [dr, col, lw] of [[0, '#9D174D', 5], [0, '#F472B6', 3], [-10, '#FBCFE8', 2]] as const) {
      if (o.flashUp % 6 >= 3 && dr < 0) continue;
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(Math.round(cx), Math.round(cy), Math.max(4, r + dr), 0, Math.PI * 2); c.stroke();
    }
    for (let i = 0; i < 8; i++) { const a = i * 0.785 + o.flashUp * 0.1, d = r * 0.8; box(c, cx + Math.cos(a) * d - 2, cy + Math.sin(a) * d - 2, 4, 4, i % 2 ? '#FFFFFF' : '#F9A8D4'); }
  }
  if (o.gun) gunWords(c, o.gun.text, p.pos.x + p.width / 2, p.pos.y - 30);
};
/** The gun's words, a little ray gun over them (so it's the gun talking, not him), kept whole on screen. */
export const gunWords = (c: Ctx, text: string, x: number, y: number) => {
  saidOver(c, text, x, y, '#F9A8D4');
  // (the icon, over the words, kept in from the edges)
  const m = c.getTransform(), L = -m.e / m.a + 20, R = (c.canvas.width - m.e) / m.a - 20;
  const ix = Math.max(L, Math.min(R, x)), lines = Math.ceil(text.length / 30), iy = y - lines * 11 - 10;
  box(c, ix - 10, iy - 5, 16, 6, '#A1A1AA'); box(c, ix - 10, iy - 5, 16, 2, '#E4E4E7');
  box(c, ix + 6, iy - 4, 6, 4, '#DB2777'); box(c, ix - 8, iy + 1, 4, 6, '#52525B');
};
