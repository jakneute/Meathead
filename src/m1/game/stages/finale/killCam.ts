// The alien's death, in close-up: the kill cam. The moment he dies there's a white flash and a cut in close on him
// (his men, and every bit of them, gone under it: nothing of theirs gets in the shot), the game drops into slow
// motion and eases back up to speed as his death plays out (game/bosses/alienDeath.ts: what happens to him, and where;
// render/bosses/alienDeaths.ts draws it), dipping again as it lands. Then the announcer calls it (the big banner up
// while he does, a stinger under it), Meathead has his word, a beat on the close-up, and it's a hard cut to the
// epilogue: no pulling back out, no VICTORY, no victory lap.
//
// Nobody talks over anybody: his last words, the announcer, Meathead, one after another.

import type { FrameContext } from '../../core/context';
import type { GameState, BossCorpse } from '../../core/state';
import type { Enemy, WeaponType, SoundType } from '../../../types';
import type { BossHelpers } from '../../bosses/shared';
import { ALIEN_LINES, FINALE_LINES, ALIEN_DEATH_CALLOUTS } from '../../../content/dialogue';
import { SPOKEN_TEXT_HOLD, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { say, speak, isTalking, MEATHEAD_VOICE, ANNOUNCER_VOICE } from '../../platform/speech';
import { hasClip } from '../../platform/voiceclips';
import { playSound } from '../../platform/audio';
import { ALIEN_VOICE } from '../../scenes/alienLook';
import { getFinale, KillCam } from './state';
import { VIEW_X, VIEW_Y, VIEW_W, VIEW_H } from './geometry';
import { deathOf, spotFor, timeline, camOn, landAt, waveWall, howOf, ROCK, WAVE, OD, NUKE, AlienDeath } from '../../bosses/alienDeath';
import { flashAlpha } from '../../settings';

/** How long (real ticks) it holds on the close-up once it's all played out and said, before the cut. */
const LINGER = 30;
/** The slow motion: hard at the kill, back up to speed over this long (real ticks); and again, less, as it lands. */
const SLOW = 0.22, SLOW_HOLD = 40, SLOW_RAMP = 90, PAY_SLOW = 0.3, PAY_HOLD = 18, PAY_RAMP = 40;
/** Never longer than this (real ticks), whatever happens. */
const MAX_TICKS = 2400;

// ---------------------------------------------------------------------------
// The kill
// ---------------------------------------------------------------------------

/** He's dead: what death it is, where he comes down, and the close-up on it from the first frame. */
export const startKillCam = (state: GameState, corpse: BossCorpse, boss: Enemy, weapon: WeaponType, _helpers: BossHelpers) => {
  void _helpers;
  const rt = getFinale(state);
  if (!rt) return;
  const how = deathOf(weapon, rt.pleadAt !== undefined, rt.greaseAt === state.frame);
  const from = { x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height };
  const spot = spotFor(how, from.x);
  corpse.own = { how, from, spot, face: boss.facing === -1 ? -1 : 1 };
  // (where what's left of him ends up)
  corpse.x = how === 'wave' ? waveWall(corpse).x - waveWall(corpse).dir * 60 : spot;

  // Everyone else out of the shot, under the flash: his men (whatever kept them going went with him: they go off,
  // out of sight, a crump of it), their bodies, their blood, anything in the air
  const men = state.enemies.filter(e => e.type !== 'boss');
  if (men.some(e => e.health > 0 && !e.isBlownAway)) playSound('boom', 0.5, -8);
  state.enemies = state.enemies.filter(e => e.type === 'boss');
  state.enemyDeaths = [];
  state.particles = [];
  state.projectiles = [];
  state.damageNumbers = [];
  state.groundSmears = [];
  state.blasts = [];
  rt.chunks = []; rt.flameJets = []; rt.lines = []; rt.radioText = null; rt.banner = undefined; rt.beam = null;
  rt.said.agentsPopped = true;
  // (out of his hands: no HUD from this frame)
  state.player.inCutscene = true;

  const at = camOn(corpse, 0);
  const cam: KillCam = {
    t: 0, acc: 0, x: at.x, y: at.y, z: at.z * 0.86, room: closeRegion(corpse), cues: 0,
    lines: [{ who: 'alien', text: ALIEN_LINES.DEATHS[how] }], speakUntil: 0, alienText: null, over: false,
  };
  // (no call for a plain death: his word, Meathead's, and out)
  if (!ALIEN_DEATH_CALLOUTS[how]) cam.lines.push({ who: 'meathead', text: FINALE_LINES.KILLS[how] });
  clampCam(cam);
  rt.cam = cam;
  playSound('crack', 1.2, -10); playSound('thunder', 0.7, 4);
};

/** He's still dying (the eruption phase holds for it). */
export const killCamPlaying = (state: GameState) => {
  const cam = getFinale(state)?.cam;
  return !!cam && !cam.over;
};

/** The part of the room the close-up sees, all of its life (painted sharp once at the closest it gets). */
const closeRegion = (c: BossCorpse) => {
  const { end } = timeline(c);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, zMax = 0;
  for (let a = 0; a <= end + 10; a += 4) {
    const p = camOn(c, a), hw = CANVAS_WIDTH / 2 / p.z, hh = CANVAS_HEIGHT / 2 / p.z;
    const q = clampTo(p.x, p.y, p.z);
    x0 = Math.min(x0, q.x - hw); x1 = Math.max(x1, q.x + hw); y0 = Math.min(y0, q.y - hh); y1 = Math.max(y1, q.y + hh); zMax = Math.max(zMax, p.z);
  }
  const m = 40;
  x0 = Math.max(VIEW_X, x0 - m); y0 = Math.max(VIEW_Y, y0 - m); x1 = Math.min(VIEW_X + VIEW_W, x1 + m); y1 = Math.min(VIEW_Y + VIEW_H, y1 + m);
  // (the device pixels for the closest look, but never a canvas too big to hold)
  let k = zMax * 2;
  k = Math.min(k, 4096 / (x1 - x0), 4096 / (y1 - y0));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, k };
};

/** Keeps a close-up's view inside the room. */
const clampTo = (x: number, y: number, z: number) => {
  const hw = CANVAS_WIDTH / 2 / z, hh = CANVAS_HEIGHT / 2 / z;
  return { x: Math.max(VIEW_X + hw, Math.min(VIEW_X + VIEW_W - hw, x)), y: Math.max(VIEW_Y + hh, Math.min(VIEW_Y + VIEW_H - hh, y)) };
};
const clampCam = (cam: KillCam) => { const q = clampTo(cam.x, cam.y, cam.z); cam.x = q.x; cam.y = q.y; };

// ---------------------------------------------------------------------------
// Each real tick
// ---------------------------------------------------------------------------

/** Runs every real tick while he's dying: the camera, the sounds, who's talking; true when this tick runs no game time. */
export const killCamTick = (ctx: FrameContext): boolean => {
  const { state } = ctx;
  const rt = getFinale(state), cam = rt?.cam, c = state.bossCorpse;
  if (!cam || !c?.own) return false;
  cam.t++;
  const age = state.frame - c.frame0;
  const tl = timeline(c);

  // The camera, onto what matters
  const want = camOn(c, age);
  const ez = cam.t < 40 ? 0.08 : 0.05;
  cam.x += (want.x - cam.x) * 0.14; cam.y += (want.y - cam.y) * 0.14; cam.z += (want.z - cam.z) * ez;
  clampCam(cam);

  // The death's own sounds, as it gets to them
  const cues = cuesFor(c);
  while (cam.cues < cues.length && age >= cues[cam.cues].at) {
    const q = cues[cam.cues++];
    for (const [s, v, p] of q.play) playSound(s, v, p);
    if (q.shake) { state.screenShakeTimer = Math.max(state.screenShakeTimer, q.shake); state.screenShakeMagnitude = q.mag ?? 6; }
  }
  // It's landed: the slow motion dips again, and the announcer's to call it (after whoever's talking)
  const how = howOf(c);
  if (cam.payT === undefined && tl.payoff >= 0 && age >= tl.payoff) {
    cam.payT = cam.t;
    const call = ALIEN_DEATH_CALLOUTS[how];
    if (call) cam.lines.push({ who: 'announcer', text: call.text }, { who: 'meathead', text: FINALE_LINES.KILLS[how] });
  }
  talk(state, cam, how);
  if (cam.meatheadUntil !== undefined && cam.t >= cam.meatheadUntil) { cam.meatheadUntil = undefined; state.playerVulgarityTimer = 0; }
  if (cam.alienUntil !== undefined && cam.t >= cam.alienUntil) { cam.alienUntil = undefined; cam.alienText = null; }

  // Played out, and all of it said: a beat on the close-up, and cut
  if (!cam.over) {
    const said = !cam.lines.length && !isTalking() && cam.t >= cam.speakUntil && (!cam.call || cam.t >= cam.call.until);
    if (cam.doneT === undefined && age >= tl.end && said) cam.doneT = cam.t;
    if ((cam.doneT !== undefined && cam.t - cam.doneT >= LINGER) || cam.t > MAX_TICKS) cam.over = true;
  }

  // The slow motion: does this tick run a frame of the game?
  let rate = cam.t < SLOW_HOLD ? SLOW : Math.min(1, SLOW + (1 - SLOW) * (cam.t - SLOW_HOLD) / SLOW_RAMP);
  if (cam.payT !== undefined) { const d = cam.t - cam.payT; rate = Math.min(rate, d < PAY_HOLD ? PAY_SLOW : Math.min(1, PAY_SLOW + (1 - PAY_SLOW) * (d - PAY_HOLD) / PAY_RAMP)); }
  if (cam.over) rate = 1;
  cam.acc += rate;
  if (cam.acc >= 1) { cam.acc -= 1; return false; }
  return true;
};

/** The next line, once nobody's talking. */
const talk = (state: GameState, cam: KillCam, how: AlienDeath) => {
  if (!cam.lines.length || isTalking() || cam.t < cam.speakUntil || (cam.call && cam.t < cam.call.until)) return;
  const l = cam.lines.shift()!;
  const hold = 70 + l.text.length * 2;
  if (l.who === 'alien') {
    say(l.text, ALIEN_VOICE, 'queue', {
      always: true,
      onShow: spoken => { cam.alienText = l.text; if (!spoken) cam.speakUntil = cam.t + hold; },
      onHide: () => { if (cam.alienText === l.text) cam.alienText = null; },
    });
    // (not recorded: up its time)
    if (!hasClip(ALIEN_VOICE.id, l.text)) { cam.speakUntil = cam.t + hold; cam.alienUntil = cam.t + hold; }
    return;
  }
  if (l.who === 'meathead') {
    say(l.text, MEATHEAD_VOICE, 'queue', {
      always: true,
      onShow: spoken => { state.playerLastVulgarity = l.text; state.playerVulgarityTimer = spoken ? SPOKEN_TEXT_HOLD : hold; if (!spoken) { cam.speakUntil = cam.t + hold; cam.meatheadUntil = cam.t + hold; } },
      onHide: () => { if (state.playerLastVulgarity === l.text) state.playerVulgarityTimer = 0; },
    });
    return;
  }
  // The announcer: the banner up while he says it, and the stinger under it
  const color = ALIEN_DEATH_CALLOUTS[how]?.color ?? '#FFFFFF';
  stinger(how);
  if (hasClip(ANNOUNCER_VOICE.id, l.text)) {
    cam.call = { text: l.text, color, from: cam.t, until: Infinity };
    speak(l.text, ANNOUNCER_VOICE, { onDone: () => { if (cam.call?.text === l.text) cam.call.until = cam.t; } });
  } else {
    // (not recorded yet: up a fixed time)
    cam.call = { text: l.text, color, from: cam.t, until: cam.t + 100 };
  }
};

/** The big hit under the announcer: each its own, loud (the bus holds it in short of clipping). */
const STINGERS: Record<AlienDeath, [SoundType, number, number][]> = {
  ice: [['nuke', 0.9, 6], ['glass', 1.5, -6], ['ice', 1.4, -8]],
  fire: [['nuke', 1, 0], ['ignite', 1.5, -8], ['roar', 1.1, -4]],
  rock: [['nuke', 0.9, 4], ['clang', 1.5, -10], ['crunch', 1.4, -6]],
  wave: [['nuke', 0.9, 2], ['tsunami', 1.4, -6], ['slam', 1.5, -6]],
  od: [['nuke', 0.9, 8], ['boing', 1.5, -10], ['splat', 1.5, -8]],
  zap: [['nuke', 0.9, 6], ['taser', 1.5, -8], ['thunder', 1.3, 0]],
  melt: [['nuke', 0.9, 4], ['glug', 1.5, -10], ['barf', 1.4, -8]],
  nuke: [['nuke', 1.2, -4], ['boom', 1.5, -10], ['thunder', 1.3, -4]],
  skull: [['nuke', 1, 2], ['gun', 1.6, -14], ['crack', 1.5, -10]],
  plain: [],
};
const stinger = (how: AlienDeath) => { for (const [s, v, p] of STINGERS[how]) playSound(s, v, p); };

/** What his death sounds like, frame by frame (from when he died). */
interface Cue { at: number; play: [SoundType, number, number][]; shake?: number; mag?: number }
const cueCache = new WeakMap<BossCorpse, Cue[]>();
const cuesFor = (c: BossCorpse): Cue[] => {
  let q = cueCache.get(c);
  if (q) return q;
  const L = landAt(c);
  const land: Cue = { at: L, play: [['thud', 1.3, -8], ['slam', 0.8, -4]], shake: 10, mag: 6 };
  switch (howOf(c)) {
    case 'ice': q = [{ at: 0, play: [['ice', 1.2, -6]] }, { at: 12, play: [['crack', 0.9, 2]] }, { at: L, play: [['glass', 1.5, -4], ['crash', 1.2, -2], ['crunch', 1, -4]], shake: 16, mag: 9 }, { at: L + 26, play: [['clink', 0.8, 0]] }]; break;
    case 'fire': q = [{ at: 0, play: [['ignite', 1.2, -4], ['flame', 1, -6]] }, land, { at: L + 20, play: [['flame', 0.9, -8]] }, { at: L + 50, play: [['boom', 1.2, 2], ['clang', 0.8, 6]], shake: 10, mag: 6 }, { at: L + 84, play: [['thud', 1.2, -10]], shake: 8 }]; break;
    case 'rock': q = [{ at: 0, play: [['crunch', 1.4, -6], ['splat', 1.2, -4]], shake: 12, mag: 8 }, { at: ROCK.bonk, play: [['clang', 1.4, -4], ['boing', 1, -6]] }, { at: ROCK.floor, play: [['thud', 1, 2], ['splat', 0.7, 2]] }, land, { at: ROCK.toppled + 14, play: [['thud', 1.2, -10]], shake: 8 }]; break;
    case 'wave': q = [land, { at: L + WAVE.rise, play: [['tsunami', 1.3, -4]] }, { at: L + WAVE.slam, play: [['slam', 1.5, -8], ['splat', 1.5, -6], ['splash', 1.2, -4]], shake: 18, mag: 10 }, { at: L + WAVE.peel, play: [['glug', 0.8, -4]] }, { at: L + WAVE.heap, play: [['splat', 1, -8]] }]; break;
    case 'od': q = [land, { at: L + 6, play: [['dart', 0.8, -6]] }, { at: L + OD.swell, play: [['glug', 1, 8]] }, { at: L + OD.lift, play: [['whoosh', 0.8, 6]] }, { at: L + OD.top, play: [['boing', 1, -2]] }, { at: L + OD.pop, play: [['boom', 1.4, 6], ['splat', 1.5, -2]], shake: 14, mag: 8 }]; break;
    case 'zap': q = [{ at: 0, play: [['taser', 1.3, -4]] }, land, { at: L + 2, play: [['thunder', 1, 6], ['taser', 1.2, 0]], shake: 8, mag: 4 }, { at: L + 40, play: [['taser', 1, 4]] }, { at: L + 96, play: [['thud', 1.3, -10]], shake: 8 }]; break;
    case 'melt': q = [land, { at: L + 2, play: [['splash', 1.2, -6], ['barf', 0.9, -6]] }, { at: L + 50, play: [['glug', 1.3, -8]] }, { at: L + 110, play: [['glug', 1, -12]] }]; break;
    case 'nuke': q = [land, { at: L + 4, play: [['beep', 0.6, 0]] }, { at: L + 10, play: [['beep', 0.7, 4]] }, { at: L + 15, play: [['beep', 0.8, 8]] }, { at: L + NUKE.blast, play: [['nuke', 1.4, -2], ['splat', 1.5, -6]], shake: 22, mag: 12 }]; break;
    case 'skull': q = [{ at: 0, play: [['gun', 1.5, -10], ['splat', 1.4, -4], ['crunch', 1.1, 2]], shake: 10, mag: 6 }, land, { at: L + 30, play: [['thud', 1.3, -10], ['splat', 0.9, -8]], shake: 8 }]; break;
    default: q = [land, { at: L + 20, play: [['thud', 1.2, -10]], shake: 8 }];
  }
  q.sort((a, b) => a.at - b.at);
  cueCache.set(c, q);
  return q;
};

// ---------------------------------------------------------------------------
// The view, and what's over it
// ---------------------------------------------------------------------------

/** The camera while it's on: the room pushed in on him (null: the usual whole room). */
export const killCamZoom = (state: GameState) => {
  const cam = getFinale(state)?.cam;
  if (!cam) return null;
  const s = cam.z;
  return { scale: s, x: VIEW_X, y: VIEW_Y, shiftX: CANVAS_WIDTH / 2 - (cam.x - VIEW_X) * s, shiftY: CANVAS_HEIGHT / 2 - (cam.y - VIEW_Y) * s };
};

/** Over the screen: the flash it cuts in on, the bars, and the announcer's banner while he calls it. */
export const drawKillCamHud = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const cam = getFinale(state)?.cam;
  if (!cam) return;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  // (the bars, sliding in)
  const bar = Math.round(Math.min(1, cam.t / 20) * 44);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  // The banner: slammed in huge, a shake to it, held while it's said
  const call = cam.call;
  if (call && cam.t < call.until) {
    const u = cam.t - call.from;
    const s = u < 6 ? 2.6 - u * 0.27 : 1 + Math.max(0, 0.08 - (u - 6) * 0.01);
    const j = u < 14 ? (u % 2 ? 3 : -3) : 0;
    ctx.save();
    ctx.translate(W / 2 + j, 132); ctx.scale(s, s);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const size = call.text.length > 16 ? 26 : call.text.length > 11 ? 32 : 40;
    ctx.font = `bold ${size}px "Press Start 2P"`;
    // (a hard black outline, a drop, the color, a lit top edge: no blur)
    ctx.fillStyle = '#000';
    for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3], [-3, 3], [3, -3], [6, 6]]) ctx.fillText(call.text, dx, dy);
    ctx.fillStyle = call.color; ctx.fillText(call.text, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(-W, -size, W * 2, size * 0.45); ctx.clip(); ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillText(call.text, 0, 0); ctx.restore();
    ctx.restore();
  }
  // (Meathead's word, while he says it, along the bottom if he's out of the shot)
  const p = state.player, v = state.view;
  if (state.playerVulgarityTimer > 0 && state.playerLastVulgarity && v && (p.pos.x + p.width < v.x || p.pos.x > v.x + v.w || p.pos.y > v.y + v.h || p.pos.y + p.height < v.y)) {
    ctx.save(); ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    const y = H - bar - 16;
    ctx.fillStyle = '#000'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [2, 2]]) ctx.fillText(state.playerLastVulgarity, W / 2 + dx, y + dy);
    ctx.fillStyle = '#ffffff'; ctx.fillText(state.playerLastVulgarity, W / 2, y);
    ctx.restore();
  }
  // The flash it cuts in on
  if (cam.t < 10) { ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha(1 - cam.t / 10).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
};
