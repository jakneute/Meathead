import { Vector2, PickupType, VulgarityType, Enemy } from '../../types';
import {
  PARTICLE_PALETTES, BOULDER_SHRAPNEL_DAMAGE, VULGARITY_TEXT_DURATION, VOICE_LINE_COOLDOWN_FRAMES, SPOKEN_TEXT_HOLD, SPOKEN_TEXT_LINGER, isRangeStage } from '../../constants';
import { VULGARITIES, BOSS_DIALOGUE, KILL_LINES, KILL_CALLOUTS, KillCallout, ENEMY_KILL_LINES, GENERIC_KILL_LINES, RANGE_KILL_LINES } from '../../content/dialogue';
import { GameState } from './state';
import { playSound, playGlassShatterSound } from '../platform/audio';
import { say, isSpeaking, isTalking, canSpeak, pickFreshLine, announce, MEATHEAD_VOICE, announcerJustSpoke, silenceAll } from '../platform/speech';
import { pickRandom } from './utils';
import { startEnemyDeath, EnemyDeathKind } from '../enemies/deaths';

const MAX_PARTICLES = 2500;

/**
 * Visual/audio side effects bound to the current game state: particles,
 * floating damage numbers, pickups and Meathead's voice lines.
 */
/** Blood and flesh colours (not the fire reds). */
const GORE_COLORS = new Set([...PARTICLE_PALETTES.GORE, ...PARTICLE_PALETTES.FLESH].filter(c => !PARTICLE_PALETTES.FIRE.includes(c)));
export const isGoreColor = (color: string) => GORE_COLORS.has(color);

/** How often Meathead leaves a kill to the announcer, and how often the announcer takes one he's said nothing over. */
const ANNOUNCER_TAKES = 0.35, ANNOUNCER_WHEN_QUIET = 0.75;
/** How long a callout handed to the announcer waits for its moment before it's let go (frames): barely at all, so it
 * lands with the words going up or not at all. */
const HANDED_WAIT = 6;

export const createFx = (state: GameState) => {
  const spawnDamageNumber = (pos: Vector2, value: number | string, isCritical: boolean = false, color?: string) => {
    const isText = typeof value === 'string';
    state.damageNumbers.push({
      id: `dmg-${Date.now()}-${Math.random()}`,
      value: isText ? undefined : Math.floor(value),
      text: isText ? value : undefined,
      pos: { ...pos },
      vel: { x: (Math.random() - 0.5) * 4, y: -4 - Math.random() * 2 },
      life: isText ? 90 : 45,
      maxLife: isText ? 90 : 45,
      isCritical,
      color,
    });
  };

  /** Big "SPLAT!"-style callout over a special kill. */
  const spawnKillCallout = (e: { pos: Vector2, width: number, kind?: string }, kind: KillCallout) => {
    if (e.kind === 'tenant') return;
    const { lines, color } = KILL_CALLOUTS[kind];
    const text = pickRandom(lines);
    // (who says it, if anybody, is settled next frame: see settleKillVoice)
    (state.killVoice ??= {}).callout = { text, at: state.frame };
    state.damageNumbers.push({
      id: `callout-${Date.now()}-${Math.random()}`,
      text,
      pos: { x: e.pos.x + e.width / 2, y: e.pos.y - 10 },
      vel: { x: (Math.random() - 0.5) * 1.5, y: -3 },
      life: 75,
      maxLife: 75,
      isCritical: true,
      isCallout: true,
      color,
    });
  };

  const spawnExplosion = (pos: Vector2, color: string, count: number, baseVelX: number = 0, spread: number = 15, isGlass: boolean = false, isBossGore: boolean = false) => {
    for (let i = 0; i < count; i++) {
      if (state.particles.length > MAX_PARTICLES) break;
      state.particles.push({
        pos: { ...pos },
        vel: { x: baseVelX + (Math.random() - 0.5) * spread, y: (Math.random() - 0.5) * spread },
        life: isGlass ? 150 + Math.random() * 200 : (isBossGore ? 180 + Math.random() * 120 : 20 + Math.random() * 80),
        color,
        size: i % 3 === 0 ? 1 + Math.random() * 4 : 2 + Math.random() * 12,
        isGlass,
        isBossGore,
      });
    }
  };

  /** A burst of `count` particles drawn from a palette. */
  const spawnBurst = (pos: Vector2, palette: string[], count: number, speed: number, life: [number, number], size: [number, number], liftY = 0) => {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        pos: { ...pos },
        vel: { x: (Math.random() - 0.5) * speed, y: (Math.random() - 0.5) * speed + liftY },
        life: life[0] + Math.random() * life[1],
        color: pickRandom(palette),
        size: size[0] + Math.random() * size[1],
      });
    }
  };

  const spawnSteamExplosionParticles = (pos: Vector2, count: number = 30) =>
    spawnBurst(pos, PARTICLE_PALETTES.STEAM, count, 12, [35, 25], [10, 18], -4);

  const spawnPowderExplosion = (pos: Vector2, count: number = 25) =>
    spawnBurst(pos, PARTICLE_PALETTES.POWDER, count, 8, [40, 40], [4, 12]);

  const spawnMethExplosion = (pos: Vector2, count: number = 40) =>
    spawnBurst(pos, PARTICLE_PALETTES.METH, count, 15, [60, 60], [6, 10]);

  const spawnOilSplatter = (pos: Vector2) =>
    spawnBurst(pos, PARTICLE_PALETTES.OIL, 30, 20, [40, 40], [8, 12]);

  const spawnPoopExplosion = (pos: Vector2, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const isCorn = Math.random() < 0.35;
      state.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 16 },
        life: 50 + Math.random() * 60,
        color: isCorn ? '#FFEB3B' : pickRandom(PARTICLE_PALETTES.POOP),
        size: i % 3 === 0 ? 4 + Math.random() * 3 : 6 + Math.random() * 8,
      });
    }
  };

  const spawnBoulderShrapnel = (pos: Vector2, count: number, direction: number) => {
    for (let i = 0; i < count; i++) {
      const ang = (Math.random() - 0.5) * Math.PI;
      const speed = 12 + Math.random() * 18;
      state.projectiles.push({
        id: `shrap-${Date.now()}-${i}`,
        pos: { ...pos },
        vel: { x: -direction * Math.cos(ang) * speed, y: Math.sin(ang) * speed - 8 },
        width: 12, height: 12, health: 1, maxHealth: 1, type: 'projectile',
        damage: BOULDER_SHRAPNEL_DAMAGE, owner: 'player', life: 45, isShrapnel: true,
      });
    }
  };

  const spawnRockShatter = (pos: Vector2) => {
    PARTICLE_PALETTES.ROCK.forEach(c => spawnExplosion(pos, c, 8, 0, 20));
  };

  const spawnDeathShower = (pos: Vector2, facing: number = 0, multiplier: number = 1, isBossDeath: boolean = false, spreadOverride?: number) => {
    const spread = spreadOverride !== undefined ? spreadOverride : (isBossDeath ? 45 : 35);
    PARTICLE_PALETTES.FLESH.forEach(c => spawnExplosion(pos, c, Math.ceil(8 * multiplier), facing * 18, spread, false, isBossDeath));
    PARTICLE_PALETTES.GORE.forEach(c => spawnExplosion(pos, c, Math.ceil(12 * multiplier), facing * 22, spread + 10, false, isBossDeath));
    if (!isBossDeath) {
      spawnExplosion(pos, '#FF4500', Math.ceil(10 * multiplier), facing * 12, 40);
      spawnExplosion(pos, '#FFFF00', Math.ceil(5 * multiplier), facing * 8, 30);
    }
  };

  const spawnGlassShatter = (pos: Vector2) => {
    PARTICLE_PALETTES.GLASS.forEach(c => spawnExplosion(pos, c, 5, 0, 25, true));
    playGlassShatterSound();
  };

  /** 60% chance to drop a random health or ammo pickup. */
  const spawnPickup = (pos: Vector2) => {
    // Nothing drops in the weapon test range
    if (isRangeStage(state.stageId) || Math.random() >= 0.6) return;
    const r = Math.random();
    let type: PickupType;
    if (r < 0.25) type = 'small_health';
    else if (r < 0.35) type = 'large_health';
    else if (r < 0.8) type = 'small_ammo';
    else type = 'large_ammo';
    state.pickups.push({
      id: `pickup-${Date.now()}-${Math.random()}`, pos: { ...pos }, vel: { x: (Math.random() - 0.5) * 4, y: -5 },
      width: 20, height: 20, type, life: 600,
    });
  };

  const getHurtLines = (hurtSource?: string): string[] => {
    // (the same thing hurting him in another city: its lines for there, where they'd name the place, e.g. 'rat@Toxic Tommy')
    const here = hurtSource && state.stageId ? BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[`${hurtSource}@${state.stageId}`] : undefined;
    if (here) return here;
    if (hurtSource && BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[hurtSource]) return BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[hurtSource];
    if (hurtSource && BOSS_DIALOGUE.HURT[hurtSource]) return BOSS_DIALOGUE.HURT[hurtSource];
    if (state.stageId && BOSS_DIALOGUE.HURT[state.stageId]) return BOSS_DIALOGUE.HURT[state.stageId];
    return VULGARITIES.HURT;
  };

  /** Who was just killed (the kind of him): the first body this frame that nobody's said anything over yet. */
  const noted = new WeakSet<Enemy>();
  const victimOf = (): string | undefined => {
    const e = state.enemies.find(x => (x.health <= 0 || x.isBlownAway) && !noted.has(x));
    if (!e) return undefined;
    noted.add(e);
    return e.kind;
  };

  /**
   * What he says over a kill: sometimes about who it was (if he's got anything for them), sometimes about how (the
   * weapon's lines), sometimes nothing in particular ("FUCK YOU!"). Whichever's picked, if it's all been said lately,
   * one of the others.
   */
  const killLine = (category: VulgarityType, victim?: string): string | null => {
    const who = victim ? ENEMY_KILL_LINES[victim] : undefined;
    const how = KILL_LINES[category as Exclude<VulgarityType, 'hurt'>];
    // (the practice range's two have their own, and that's all: about what he used on them, or about them)
    if (victim === 'dummy-boxer' || victim === 'dummy-balloon') {
      const which = victim === 'dummy-boxer' ? 'boxer' : 'balloon';
      const withIt = RANGE_KILL_LINES[which][category] ?? [], them = KILL_LINES[which === 'boxer' ? 'range_boxer_kill' : 'range_balloon_kill'];
      for (const pool of Math.random() < 0.6 ? [withIt, them] : [them, withIt]) { const t = pool.length ? pickFreshLine(pool) : null; if (t) return t; }
      return null;
    }
    const r = Math.random();
    const order = who
      ? (r < 0.45 ? [who, how, GENERIC_KILL_LINES] : r < 0.65 ? [GENERIC_KILL_LINES, who, how] : [how, who, GENERIC_KILL_LINES])
      : (r < 0.25 ? [GENERIC_KILL_LINES, how] : [how, GENERIC_KILL_LINES]);
    for (const pool of order) { const t = pickFreshLine(pool); if (t) return t; }
    return null;
  };

  /**
   * Meathead shouts a line. Death always interrupts; otherwise a new line
   * never talks over one that is still playing, and respects cooldowns.
   */
  const speakVulgarity = (category: VulgarityType, hurtSource?: string, held = false, victim?: string): boolean => {
    // (what hurt him, for the death screen: whether or not he says anything about it)
    if (category === 'hurt' && hurtSource) state.lastHurt = { source: hurtSource, at: state.frame };
    // A kill: who gets it (Meathead or the announcer) is settled next frame, with the callout, if any, in hand
    const kill = category !== 'hurt' && category !== 'death';
    if (kill && !held) {
      const kv = (state.killVoice ??= {});
      if (!kv.forced && !kv.handed) kv.quip = { category, at: state.frame, kind: victimOf() };
      return false;
    }
    if (category !== 'death') {
      if (isSpeaking() || isTalking() || state.isMeatheadSpeaking) return false; // (asking first lets a line whose end got lost time out)
      // (the announcer's only just had its say: he gives it a moment)
      if (announcerJustSpoke()) return false;
      if (category === 'hurt' ? state.hurtVoiceCooldown > 0 : state.voiceLineCooldown > 0) return false;
    }
    // (a big kill the announcer's calling: he keeps quiet for it)
    if (kill && (state.killVoice?.forced || state.killVoice?.handed)) return false;
    // Skip entirely if every line in the pool was said recently
    const text = category === 'hurt' ? pickFreshLine(getHurtLines(hurtSource)) : kill ? killLine(category, victim) : pickFreshLine(KILL_LINES[category]);
    if (!text) return false;

    // Dying cuts off whoever's talking; anything else only speaks up when it's quiet.
    // The text over his head goes up when he starts saying it and down when he's done.
    const said = say(text, MEATHEAD_VOICE, category === 'death' ? 'urgent' : 'casual', {
      onShow: spoken => {
        state.playerLastVulgarity = text;
        state.playerVulgarityTimer = spoken ? SPOKEN_TEXT_HOLD : VULGARITY_TEXT_DURATION;
      },
      onHide: () => {
        if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, SPOKEN_TEXT_LINGER);
      },
      onDone: () => {
        state.isMeatheadSpeaking = false;
        state.voiceLineCooldown = VOICE_LINE_COOLDOWN_FRAMES;
      },
    });
    if (!said) return false;
    if (kill) (state.killVoice ??= {}).quippedAt = state.frame;
    state.isMeatheadSpeaking = canSpeak() && isSpeaking();
    if (category === 'death') {
      state.voiceLineCooldown = 0;
      state.hurtVoiceCooldown = 0;
    } else if (category === 'hurt') {
      state.voiceLineCooldown = 0;
      state.hurtVoiceCooldown = 45;
    }
    return true;
  };

  /**
   * The frame after a kill: one voice for it, never two. A quip Meathead held back goes to the announcer (or, if the
   * announcer can't, back to him); a callout Meathead said nothing over (his lines all used up, a cooldown, whatever)
   * usually gets the announcer; one he did say something over stays his.
   */
  const settleKillVoice = () => {
    const kv = state.killVoice;
    if (!kv) return;
    // A mid-boss down, a set piece: the announcer always calls it, and cuts off whoever was talking to do it
    if (kv.forced) {
      silenceAll();
      announce(kv.forced.text, 1, true);
      kv.forced = undefined; kv.callout = undefined; kv.quip = undefined;
      return;
    }
    // The announcer's been handed one: it goes as soon as it can (whoever's talking done, a breath after), or not at
    // all if that's too long coming (and a quip Meathead held back for it is his again)
    if (kv.handed) {
      const h = kv.handed;
      if (announce(h.text, 1)) { kv.handed = undefined; return; }
      if (state.frame - h.at > HANDED_WAIT) kv.handed = undefined;
      return;
    }
    const due = (at: number) => state.frame - at >= 1;
    const c = kv.callout && due(kv.callout.at) ? kv.callout : undefined;
    const q = kv.quip && due(kv.quip.at) ? kv.quip : undefined;
    if (!c && !q) return;
    if (c) kv.callout = undefined;
    if (q) kv.quip = undefined;
    // A kill with a callout: one of them says something. Usually Meathead; sometimes the announcer (and the announcer
    // for sure, near enough, when Meathead's got nothing to say right now: his lines on cooldown, used up, someone talking)
    if (c) {
      if (q && Math.random() >= ANNOUNCER_TAKES && speakVulgarity(q.category, undefined, true, q.kind)) return;
      if (q || Math.random() < ANNOUNCER_WHEN_QUIET) kv.handed = { text: c.text, at: state.frame };
      return;
    }
    // A kill with no callout: it's his (if he's got something to say)
    if (q) speakVulgarity(q.category, undefined, true, q.kind);
  };

  /** A big one (a mid-boss down, a set piece): the announcer calls it, always, and Meathead leaves it to him. */
  const announceKill = (text: string) => { (state.killVoice ??= {}).forced = { text, at: state.frame }; };

  /** A non-boss kill with its own death animation in place of the usual gore burst. */
  const killWithAnimation = (e: Enemy, kind: EnemyDeathKind, category: VulgarityType, callout?: KillCallout, vel?: Vector2) => {
    e.health = 0;
    // (a tenant goes out of his window however he's killed: the stage does all of that)
    if (e.kind === 'tenant') return;
    startEnemyDeath(state, e, kind, vel);
    spawnPickup(e.pos);
    speakVulgarity(category);
    if (callout) spawnKillCallout(e, callout);
    state.player.killSatisfactionTimer = 60;
  };

  /** Standard non-boss kill: fling the body, spray gore, maybe drop loot, taunt. */
  const blowAwayEnemy = (e: Enemy, vel: Vector2, category: VulgarityType, showerDir: number = 0, showerMult: number = 1) => {
    // (a tenant always goes out of his window, however he's killed: the stage does all of that)
    if (e.kind === 'tenant') { e.health = Math.min(e.health, 0); return; }
    e.isBlownAway = true; e.vel = vel; e.frozenTimer = 0;
    spawnDeathShower(e.pos, showerDir, showerMult);
    playSound('splat');
    spawnPickup(e.pos);
    speakVulgarity(category);
  };

  return {
    spawnDamageNumber,
    spawnKillCallout,
    settleKillVoice,
    announceKill,
    spawnExplosion,
    spawnSteamExplosionParticles,
    spawnPoopExplosion,
    spawnPowderExplosion,
    spawnMethExplosion,
    spawnOilSplatter,
    spawnBoulderShrapnel,
    spawnRockShatter,
    spawnDeathShower,
    spawnGlassShatter,
    spawnPickup,
    speakVulgarity,
    blowAwayEnemy,
    killWithAnimation,
    playGunSound: playSound,
  };
};

export type Fx = ReturnType<typeof createFx>;
