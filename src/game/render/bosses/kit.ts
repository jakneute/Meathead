// What the eight bosses are made of: a proper face (a head drawn at Meathead's level of detail, in a
// small unit space and scaled up), the expressions it pulls, the blood that builds up on them as they
// lose health, and a few body parts (limbs, hands, shoes, crinkled tin foil).
//
// The head's unit space: (0,0) its middle, about 22 wide and 24 tall, the face turned toward +x (a
// boss facing left is drawn mirrored). Hair and hats are drawn by the boss in the same space.

import { Enemy, BossState } from '../../../types';
import { smear, drip, cut, bloodFresh, bloodDark } from '../player/gore';

export type Mood =
  | 'smug'     // the true believer at rest: serene, wide-eyed, a knowing little smile
  | 'fierce'   // going for you: brows down, shouting
  | 'roar'     // mouth wide open (fire, a bellow)
  | 'manic'    // losing it: eyes like saucers, pinprick pupils, a grin with every tooth in it
  | 'hurt'     // just been hit: eyes screwed shut, teeth clenched
  | 'dazed'    // knocked silly: lids down, eyes off in two directions, tongue out
  | 'ko'       // out cold: X eyes
  | 'blissed'  // high: heavy lids, pupils like dinner plates, a big dopey smile
  | 'shock';   // electrocuted: bolt upright, eyes wide, teeth rattling

export interface FaceStyle {
  skin: string; shadow: string; highlight: string;
  /** Brows (and any stubble tint). */
  brow: string;
  iris: string;
  jaw?: 'square' | 'round' | 'long' | 'jowly';
  /** Speckled stubble or a shaved jaw's shadow. */
  stubble?: string;
  /** 0..1: forehead lines, crow's feet, folds. */
  age?: number;
  /** Dark rings under the eyes (none of them sleep). */
  bags?: string;
  lips?: string;
  goldTooth?: boolean;
  /** Bushier brows. */
  bushy?: boolean;
  nose?: 'straight' | 'big' | 'red';
}

/** Where the head goes (in the boss's local space), its size, which way it faces, and where it is in the world (for his eyes). */
export interface Head { x: number; y: number; s: number; f: 1 | -1; wx?: number }

/** The usual head: a little over Meathead's size, up top in his 80x80 box. */
export const headAt = (e: Enemy, f: 1 | -1, x = 40, y = 19, s = 1.35): Head => ({ x, y, s, f, wx: e.pos.x + x * (e.width / 80) });

/** Where Meathead is (world x), so they can look at him; unset outside the fight (portraits, photos). */
let lookX: number | null = null;
export const setBossLook = (x: number | null) => { lookX = x; };

/** Which way he faces: at Meathead when there is one, else the way he's already facing (left by default). */
export const facingOf = (e: Enemy): 1 | -1 => {
  if (lookX !== null) return lookX < e.pos.x + e.width / 2 ? -1 : 1;
  return e.facing ?? -1;
};

/** How beaten up he is: nothing at full health, everything at none. */
export const goreOf = (e: Enemy) => (e.maxHealth > 0 ? Math.max(0, Math.min(1, 1 - e.health / e.maxHealth)) : 0);

/**
 * His face this frame: out cold once he's dead, hurt right after a hit, then whatever the fight has him doing, and past two
 * thirds down he's coming apart at rest.
 */
export const moodOf = (e: Enemy, frame: number, map: Partial<Record<BossState, Mood>>): Mood => {
  if (e.health <= 0) return 'ko';
  if ((e.hitCooldown ?? 0) > 30) return 'hurt';
  const m = e.bossState ? map[e.bossState] : undefined;
  if (m) return m;
  if (goreOf(e) > 0.62) return frame % 300 < 40 ? 'fierce' : 'manic';
  return 'smug';
};

/** Draw in the head's unit space. */
export const inHead = (ctx: CanvasRenderingContext2D, h: Head, draw: () => void) => {
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.scale(h.s * h.f, h.s);
  draw();
  ctx.restore();
};

const disc = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const ell = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill(); };
const line = (ctx: CanvasRenderingContext2D, pts: number[], w: number, color: string) => {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
};

const EYE_Y = -3.5, L_EYE = -5, R_EYE = 4.5, MOUTH_Y = 4.6;

/**
 * The whole head: skull and face, the expression, then hair and hat (the boss's own), then the blood.
 * `look` is -1..1, where he's looking across the room (in world terms).
 */
export const drawHead = (
  ctx: CanvasRenderingContext2D, h: Head, st: FaceStyle, mood: Mood, frame: number, gore: number,
  parts: { back?: () => void; hair?: () => void; hat?: () => void; eyewear?: () => void } = {},
) => {
  // Where the pupils go: toward Meathead (in the mirrored space, flipped back)
  const lookWorld = lookX === null ? h.f * 0.6 : Math.max(-1, Math.min(1, (lookX - (h.wx ?? h.x)) / 160));
  const look = lookWorld * h.f;
  inHead(ctx, h, () => {
    parts.back?.();
    skull(ctx, st);
    features(ctx, st, frame);
    if (gore >= 0.6) bruise(ctx, gore);
    brows(ctx, st, mood, frame);
    eyes(ctx, st, mood, frame, look);
    mouth(ctx, st, mood, frame, gore);
    parts.eyewear?.();
    parts.hair?.();
    parts.hat?.();
    faceBlood(ctx, gore, frame);
    if (mood === 'hurt' || mood === 'manic' || mood === 'shock') sweat(ctx, mood, frame);
  });
};

const skull = (ctx: CanvasRenderingContext2D, st: FaceStyle) => {
  const jaw = st.jaw ?? 'square';
  ctx.fillStyle = st.skin;
  ctx.beginPath();
  if (jaw === 'round') ctx.roundRect(-11, -13, 22, 24, [8, 8, 9, 9]);
  else if (jaw === 'long') ctx.roundRect(-10.5, -13.5, 21, 26, [6, 6, 5, 5]);
  else ctx.roundRect(-11, -13, 22, 24, [6, 6, 4, 4]);
  ctx.fill();
  if (jaw === 'jowly') {
    // Jowls hanging off the jaw, and a second chin
    ell(ctx, -8.5, 8.5, 3.5, 3.2);
    ell(ctx, 7.5, 8.8, 3.8, 3.2);
    ell(ctx, 0, 11.2, 6.5, 2.4);
    ctx.fillStyle = st.shadow;
    ctx.fillRect(-5, 10.4, 10, 0.7);
  }
  // Back of the head in shadow, the ear
  ctx.fillStyle = st.shadow;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(-11, -11, 3.5, 19);
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.roundRect(-13, -7, 3.6, 7.5, 1.6); ctx.fill();
  ctx.fillStyle = st.skin;
  ctx.fillRect(-12.2, -5.5, 1.3, 4);
  ctx.fillStyle = st.highlight;
  ctx.fillRect(5, -1, 4.5, 1.2);          // cheekbone
  ctx.fillRect(8.2, -10.5, 1.2, 5);       // temple
  ctx.fillRect(-3, -12.2, 7, 1);          // brow of the skull
};

const features = (ctx: CanvasRenderingContext2D, st: FaceStyle, frame: number) => {
  const age = st.age ?? 0;
  // Stubble
  if (st.stubble) {
    ctx.fillStyle = st.stubble;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(-9, 1.5, 18.5, 8.5);
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 18; i++) ctx.fillRect(-8.5 + (i * 3.7) % 17.5, 2.2 + (i * 2.3) % 7, 0.8, 0.8);
    ctx.globalAlpha = 1;
  }
  // Jawline and chin
  ctx.fillStyle = st.shadow;
  ctx.fillRect(-8, (st.jaw === 'long' ? 11.8 : 10.3), 16, 0.8);
  ctx.fillRect(1.2, 8.5, 0.7, 1.6);
  // Nose: bridge, the underside and a nostril
  const big = st.nose === 'big' || st.nose === 'red';
  ctx.fillStyle = st.nose === 'red' ? '#E57373' : st.shadow;
  ctx.fillRect(2, -4, 1.3, 5);
  ctx.beginPath();
  ctx.moveTo(2.2, -1); ctx.lineTo(big ? 6.8 : 5.4, 1.8); ctx.lineTo(0.4, 2.4); ctx.closePath(); ctx.fill();
  if (big) ell(ctx, 4.8, 1.5, 2.4, 1.8);
  ctx.fillStyle = st.highlight;
  ctx.fillRect(big ? 4.4 : 3.6, 0.2, 1, 0.8);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(1, 2.1, 1.2, 0.6);
  // Age: forehead lines, crow's feet, the folds down from the nose
  if (age > 0.2) {
    ctx.fillStyle = st.shadow;
    ctx.fillRect(-6, -10.2, 11, 0.55);
    if (age > 0.5) ctx.fillRect(-5, -8.8, 9, 0.55);
    ctx.fillRect(8.2, -4.2, 1.8, 0.5); ctx.fillRect(8.2, -2.8, 1.6, 0.5);
    ctx.save(); ctx.globalAlpha = 0.8;
    line(ctx, [0, 1.8, -1.6, 5.5], 0.6, st.shadow);
    line(ctx, [6.5, 2.2, 7.6, 5.8], 0.6, st.shadow);
    ctx.restore();
  }
  if (age > 0.7) {
    // Liver spots
    ctx.fillStyle = 'rgba(120, 80, 40, 0.35)';
    disc(ctx, -6, -9, 0.9); disc(ctx, 3, -11, 0.7); disc(ctx, -8, -3, 0.6);
  }
  // Bags under the eyes: none of them sleep
  if (st.bags) {
    ctx.save(); ctx.globalAlpha = 0.7;
    line(ctx, [L_EYE - 2.5, EYE_Y + 2.8, L_EYE, EYE_Y + 3.6, L_EYE + 2.5, EYE_Y + 2.8], 0.8, st.bags);
    line(ctx, [R_EYE - 2.5, EYE_Y + 2.8, R_EYE, EYE_Y + 3.6, R_EYE + 2.5, EYE_Y + 2.8], 0.8, st.bags);
    ctx.restore();
  }
  void frame;
};

const bruise = (ctx: CanvasRenderingContext2D, gore: number) => {
  // A black eye coming up
  ctx.fillStyle = `rgba(88, 28, 135, ${Math.min(0.55, (gore - 0.55) * 1.6)})`;
  ell(ctx, L_EYE, EYE_Y + 0.5, 4, 3.4);
};

const brows = (ctx: CanvasRenderingContext2D, st: FaceStyle, mood: Mood, frame: number) => {
  ctx.fillStyle = st.brow;
  const t = st.bushy ? 2.4 : 1.6;
  const bar = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 + t); ctx.lineTo(x1, y1 + t); ctx.closePath(); ctx.fill();
  };
  const by = EYE_Y - 4.2;
  switch (mood) {
    case 'fierce': case 'roar':
      bar(L_EYE - 3.5, by - 1.5, L_EYE + 3, by + 1.8);
      bar(R_EYE + 3.5, by - 1.5, R_EYE - 3, by + 1.8);
      ctx.fillStyle = st.shadow;
      ctx.fillRect(-0.9, by - 1.5, 0.6, 3); ctx.fillRect(0.6, by - 1.5, 0.6, 3);
      break;
    case 'hurt':
      // Pained: inner ends up
      bar(L_EYE - 3.5, by + 0.8, L_EYE + 3, by - 1.8);
      bar(R_EYE + 3.5, by + 0.8, R_EYE - 3, by - 1.8);
      break;
    case 'manic': {
      // One up, one down, and the high one twitches
      const tw = frame % 50 < 4 ? -0.8 : 0;
      bar(L_EYE - 3.5, by - 2.5 + tw, L_EYE + 3, by - 2);
      bar(R_EYE + 3.5, by - 0.2, R_EYE - 3, by + 1.4);
      break;
    }
    case 'shock':
      bar(L_EYE - 3.5, by - 2.5, L_EYE + 3, by - 2.8);
      bar(R_EYE + 3.5, by - 2.5, R_EYE - 3, by - 2.8);
      break;
    case 'dazed': case 'ko': case 'blissed':
      bar(L_EYE - 3.5, by - 0.5, L_EYE + 3, by - 0.2);
      bar(R_EYE + 3.5, by - 0.5, R_EYE - 3, by - 0.2);
      break;
    default:
      // The believer's brows: lifted, arched, open
      bar(L_EYE - 3.5, by - 0.2, L_EYE, by - 1.8); bar(L_EYE, by - 1.8, L_EYE + 3, by - 1);
      bar(R_EYE + 3.5, by - 0.2, R_EYE, by - 1.8); bar(R_EYE, by - 1.8, R_EYE - 3, by - 1);
  }
};

const eyes = (ctx: CanvasRenderingContext2D, st: FaceStyle, mood: Mood, frame: number, look: number) => {
  const px = look * 1.1;
  const pair = (draw: (x: number, i: number) => void) => { draw(L_EYE, 0); draw(R_EYE, 1); };
  const white = '#F8FAFC', pupil = '#0B0B0F';
  const blink = frame % 170 < 6;
  switch (mood) {
    case 'hurt':
      pair(x => line(ctx, [x - 2.5, EYE_Y - 1, x + 0.5, EYE_Y + 0.3, x - 2.5, EYE_Y + 1.4], 0.9, pupil));
      return;
    case 'ko':
      pair(x => { line(ctx, [x - 2, EYE_Y - 2, x + 2, EYE_Y + 2], 1, pupil); line(ctx, [x + 2, EYE_Y - 2, x - 2, EYE_Y + 2], 1, pupil); });
      return;
    case 'fierce': case 'roar':
      pair(x => {
        ctx.fillStyle = white; ctx.fillRect(x - 2.6, EYE_Y - 0.6, 5.2, 2.4);
        ctx.fillStyle = st.iris; ctx.fillRect(x - 1 + px, EYE_Y - 0.6, 2.2, 2.4);
        ctx.fillStyle = pupil; ctx.fillRect(x - 0.4 + px, EYE_Y - 0.2, 1.1, 1.6);
        ctx.fillStyle = st.shadow; ctx.fillRect(x - 2.6, EYE_Y - 1, 5.2, 0.6);
      });
      return;
    case 'dazed':
      pair((x, i) => {
        ctx.fillStyle = white; ell(ctx, x, EYE_Y + 0.5, 2.4, 1.6);
        ctx.fillStyle = pupil; disc(ctx, x + (i ? 1.2 : -1.2), EYE_Y + 0.9 + (i ? -0.6 : 0.4), 0.9);
        ctx.fillStyle = st.skin; ctx.fillRect(x - 2.6, EYE_Y - 1.6, 5.2, 1.6);
        ctx.fillStyle = st.shadow; ctx.fillRect(x - 2.6, EYE_Y - 0.2, 5.2, 0.5);
      });
      return;
    case 'blissed':
      pair(x => {
        ctx.fillStyle = white; ell(ctx, x, EYE_Y + 0.4, 2.7, 2.2);
        ctx.fillStyle = st.iris; disc(ctx, x + px * 0.5, EYE_Y + 0.6, 1.9);
        ctx.fillStyle = pupil; disc(ctx, x + px * 0.5, EYE_Y + 0.6, 1.5);
        ctx.fillStyle = white; ctx.fillRect(x + 0.2 + px * 0.5, EYE_Y - 0.2, 0.7, 0.7);
        ctx.fillStyle = st.skin; ctx.fillRect(x - 2.8, EYE_Y - 2.2, 5.6, 2);
        ctx.fillStyle = st.shadow; ctx.fillRect(x - 2.8, EYE_Y - 0.4, 5.6, 0.5);
      });
      return;
    default: {
      // Wide open (smug, manic, shock): the stare of a man who has read everything and slept not at all
      const big = mood === 'smug' ? 2.6 : 3.1;
      const pupilR = mood === 'smug' ? 0.95 : 0.7;
      if (mood === 'smug' && blink) {
        pair(x => line(ctx, [x - 2.5, EYE_Y + 0.3, x + 2.5, EYE_Y + 0.3], 0.9, pupil));
        return;
      }
      pair((x, i) => {
        ctx.fillStyle = white; ell(ctx, x, EYE_Y, big, big * 0.85);
        if (mood !== 'smug') {
          // Bloodshot
          ctx.save(); ctx.globalAlpha = 0.8;
          line(ctx, [x - big, EYE_Y, x - big * 0.4, EYE_Y + 0.4], 0.35, '#DC2626');
          line(ctx, [x + big, EYE_Y - 0.3, x + big * 0.45, EYE_Y + 0.2], 0.35, '#DC2626');
          ctx.restore();
        }
        const jit = mood === 'shock' ? (Math.sin(frame * 2.3 + i) * 0.5) : mood === 'manic' && i === 1 ? Math.sin(frame * 0.7) * 0.3 : 0;
        ctx.fillStyle = st.iris; disc(ctx, x + px + jit, EYE_Y + 0.2, mood === 'smug' ? 1.6 : 1.3);
        ctx.fillStyle = pupil; disc(ctx, x + px + jit, EYE_Y + 0.2, i === 1 && mood === 'manic' ? pupilR * 0.7 : pupilR);
        ctx.fillStyle = white; ctx.fillRect(x + px + 0.4, EYE_Y - 0.9, 0.7, 0.7);
        // Upper lid
        ctx.fillStyle = st.shadow; ctx.fillRect(x - big, EYE_Y - big * 0.85 - 0.2, big * 2, 0.6);
      });
    }
  }
};

const mouth = (ctx: CanvasRenderingContext2D, st: FaceStyle, mood: Mood, frame: number, gore: number) => {
  const my = MOUTH_Y;
  const dark = '#3B0A0A', teeth = '#FAFAF0', lip = st.lips ?? st.shadow;
  const gap = gore > 0.5; // a tooth knocked out
  const toothLines = (x0: number, x1: number, y0: number, h: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    for (let x = x0 + 2.4; x < x1 - 0.5; x += 2.4) ctx.fillRect(x, y0, 0.45, h);
    if (gap) { ctx.fillStyle = dark; ctx.fillRect(x0 + 2.9, y0, 1.8, h * 0.9); }
    if (st.goldTooth) { ctx.fillStyle = '#FACC15'; ctx.fillRect(x1 - 3.4, y0, 1.9, h * 0.9); }
  };
  switch (mood) {
    case 'fierce': {
      ctx.fillStyle = dark; ctx.beginPath(); ctx.roundRect(-5.5, my - 1.2, 11, 5, 1.8); ctx.fill();
      ctx.fillStyle = teeth; ctx.fillRect(-4.8, my - 1.2, 9.6, 1.5); ctx.fillRect(-4.2, my + 2.5, 8.4, 1.2);
      toothLines(-4.8, 4.8, my - 1.2, 1.5);
      ctx.fillStyle = '#B91C1C'; ell(ctx, 0.5, my + 2.3, 2.6, 0.9);
      break;
    }
    case 'roar': {
      ctx.fillStyle = dark; ell(ctx, 0.5, my + 1.4, 5, 4.4);
      ctx.fillStyle = teeth; ctx.fillRect(-3.8, my - 2.8, 8.6, 1.4);
      toothLines(-3.8, 4.8, my - 2.8, 1.4);
      ctx.fillStyle = '#DC2626'; ell(ctx, 0.8, my + 3.6, 3, 1.3);
      break;
    }
    case 'manic': {
      // A grin with every tooth in it, corners hooked up
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.moveTo(-6.5, my - 1.5); ctx.quadraticCurveTo(0, my + 5.5, 7, my - 1.8); ctx.quadraticCurveTo(0, my + 1.2, -6.5, my - 1.5); ctx.fill();
      ctx.fillStyle = teeth;
      ctx.beginPath(); ctx.moveTo(-5.8, my - 1); ctx.quadraticCurveTo(0, my + 4.2, 6.3, my - 1.3); ctx.quadraticCurveTo(0, my + 1.6, -5.8, my - 1); ctx.fill();
      toothLines(-5, 5.6, my, 2.2);
      line(ctx, [-6.5, my - 1.5, -7.3, my - 2.6], 0.6, st.shadow);
      line(ctx, [7, my - 1.8, 7.8, my - 3], 0.6, st.shadow);
      break;
    }
    case 'hurt': case 'shock': {
      // Teeth clenched in a grimace (rattling if it's the current)
      const j = mood === 'shock' ? (frame % 4 < 2 ? 0.4 : -0.4) : 0;
      ctx.fillStyle = dark; ctx.beginPath(); ctx.roundRect(-6, my - 1, 12, 4, 1); ctx.fill();
      ctx.fillStyle = teeth; ctx.fillRect(-5.4, my - 0.6 + j, 10.8, 1.5); ctx.fillRect(-5.4, my + 1.1 - j, 10.8, 1.4);
      toothLines(-5.4, 5.4, my - 0.6, 3.1);
      break;
    }
    case 'dazed': {
      ctx.fillStyle = dark; ell(ctx, 1, my + 1, 3, 2);
      ctx.fillStyle = '#F472B6'; ell(ctx, 2.5, my + 3, 1.8, 1.6, 0.4);
      const d = (frame % 60) / 60;
      ctx.fillStyle = 'rgba(191, 219, 254, 0.8)'; ctx.fillRect(3.4, my + 3 + d * 5, 0.8, 1.6); // drool
      break;
    }
    case 'ko':
      ctx.fillStyle = dark; ell(ctx, 1, my + 1, 2.2, 1.4);
      break;
    case 'blissed': {
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.moveTo(-5, my - 0.5); ctx.quadraticCurveTo(0.5, my + 5, 6, my - 0.8); ctx.quadraticCurveTo(0.5, my + 1.5, -5, my - 0.5); ctx.fill();
      ctx.fillStyle = teeth; ctx.fillRect(-3.5, my, 7.5, 1.2);
      break;
    }
    default: {
      // Smug: lips pressed in a knowing smile, one corner up, a dimple
      line(ctx, [-5, my + 0.6, -1, my + 1.6, 3.5, my + 1.2, 6.5, my - 0.8], 1.1, lip);
      ctx.fillStyle = st.shadow; ctx.fillRect(7, my - 1.6, 0.6, 1.4);
      ctx.fillStyle = st.highlight; ctx.fillRect(-2, my + 2.6, 4, 0.6);
    }
  }
};

const faceBlood = (ctx: CanvasRenderingContext2D, gore: number, frame: number) => {
  if (gore < 0.12) return;
  cut(ctx, 4, 1.5, 7.5, -0.8);                                         // cheek
  if (gore >= 0.28) drip(ctx, 2.2, 2.4, gore >= 0.5 ? 8 : 3);          // nosebleed, down past the lip
  if (gore >= 0.42) {
    cut(ctx, -7.5, -8.4, -3, -9.4);                                    // split brow
    drip(ctx, -6.5, -7.8, gore >= 0.6 ? 12 : 4);
  }
  if (gore >= 0.55) cut(ctx, -2, 7.5, 1.5, 9);                          // chin
  if (gore >= 0.7) {
    // Scalp gash, blood running down the forehead
    smear(ctx, 3, -11.8, 5.5, 2.6);
    drip(ctx, 2, -11, 7); drip(ctx, 4.8, -11, 5);
  }
  if (gore >= 0.85) {
    ctx.fillStyle = bloodFresh;
    for (let i = 0; i < 9; i++) ctx.fillRect(-9 + (i * 5.3) % 18, -7 + (i * 3.7) % 16, 1, 1);
    smear(ctx, -9, 2, 3, 4, bloodDark);
  }
  if (gore >= 0.5) {
    // Dripping off his chin
    const t = (frame % 40) / 40;
    if (t < 0.7) { ctx.fillStyle = bloodFresh; ell(ctx, 2.2, 11 + t * 9, 0.8, 1.2); }
  }
};

const sweat = (ctx: CanvasRenderingContext2D, mood: Mood, frame: number) => {
  ctx.fillStyle = '#7DD3FC';
  if (mood === 'hurt') { disc(ctx, -13, -8, 1.4); disc(ctx, -9, -15, 1.7); disc(ctx, 12, -12, 1.2); return; }
  const t = (frame % 70) / 70;
  ell(ctx, 9.5, -8 + t * 8, 0.9, 1.3);
  if (mood === 'shock') {
    // Sparks off him
    line(ctx, [-12, -14, -10, -12, -12.5, -10], 0.7, '#FDE047');
    line(ctx, [12, -15, 10.5, -12.5, 13, -11], 0.7, '#FDE047');
  }
};

// ---------------------------------------------------------------------------
// Body parts
// ---------------------------------------------------------------------------

/** A limb from joint to joint: a rounded stroke with a shaded underside. */
export const limb = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, w: number, fill: string, shade?: string) => {
  ctx.lineCap = 'round';
  ctx.strokeStyle = fill; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  if (shade) {
    const nx = -(y2 - y1), ny = x2 - x1, len = Math.hypot(nx, ny) || 1;
    const ox = (nx / len) * w * 0.28, oy = (ny / len) * w * 0.28;
    ctx.strokeStyle = shade; ctx.lineWidth = w * 0.35;
    ctx.beginPath(); ctx.moveTo(x1 + ox, y1 + oy); ctx.lineTo(x2 + ox, y2 + oy); ctx.stroke();
  }
};

/** A fist: knuckles and a thumb. */
export const hand = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, skin: string, shade: string) => {
  ctx.fillStyle = skin; disc(ctx, x, y, r);
  ctx.fillStyle = shade;
  ctx.fillRect(x - r * 0.7, y - r * 0.15, r * 1.4, r * 0.18);
  ctx.fillRect(x - r * 0.1, y - r * 0.7, r * 0.18, r * 0.55);
};

/** A shoe or boot, toe toward `dir`. */
export const shoe = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dir: number, color: string, sole: string, shine = 'rgba(255,255,255,0.25)') => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x - w / 2 + dir * 2, y - h, w, h, [h * 0.6, h * 0.6, 1, 1]); ctx.fill();
  ctx.fillStyle = sole; ctx.fillRect(x - w / 2 + dir * 2, y - 1.6, w, 1.6);
  ctx.fillStyle = shine; ctx.fillRect(x + dir * (w * 0.2), y - h + 1.2, w * 0.25, 1);
};

/** Crinkled tin foil over a shape: facets catching the light, and the odd glint. */
export const foil = (ctx: CanvasRenderingContext2D, pts: number[], frame: number, seed = 0) => {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ctx.fillStyle = '#B8C0C8'; ctx.fill();
  ctx.clip();
  let cx = 0, cy = 0; const n = pts.length / 2;
  for (let i = 0; i < pts.length; i += 2) { cx += pts[i]; cy += pts[i + 1]; }
  cx /= n; cy /= n;
  // Facets fanning out from the middle, light and dark by turns
  const shades = ['#E5E9ED', '#8E98A2', '#D3D9DF', '#A5AEB7', '#F3F5F7', '#98A1AA'];
  for (let i = 0; i < n; i++) {
    const a = i * 2, b = ((i + 1) % n) * 2;
    const mx = (pts[a] + pts[b]) / 2 + Math.sin(i * 2.7 + seed) * 1.5, my = (pts[a + 1] + pts[b + 1]) / 2 + Math.cos(i * 1.9 + seed) * 1.5;
    ctx.fillStyle = shades[(i + seed) % shades.length];
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pts[a], pts[a + 1]); ctx.lineTo(mx, my); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shades[(i + seed + 3) % shades.length];
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.lineTo(pts[b], pts[b + 1]); ctx.closePath(); ctx.fill();
  }
  // Crease lines
  ctx.strokeStyle = 'rgba(75, 85, 99, 0.45)'; ctx.lineWidth = 0.4;
  for (let i = 0; i < n; i += 2) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pts[i * 2], pts[i * 2 + 1]); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath(); ctx.stroke();
  // A glint going across it now and then
  const g = (frame + seed * 37) % 90;
  if (g < 8) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(cx - 0.5, cy - 2.5, 1, 5); ctx.fillRect(cx - 2.5, cy - 0.5, 5, 1);
  }
};

/**
 * Blood on his clothes and skin, building up with the damage: the first spots go on first, so it
 * spreads rather than moving about. Spots are [x, y, size].
 */
export const bodyBlood = (ctx: CanvasRenderingContext2D, gore: number, spots: [number, number, number][], frame: number) => {
  if (gore < 0.15) return;
  const n = Math.min(spots.length, Math.ceil((gore - 0.1) / 0.9 * spots.length));
  for (let i = 0; i < n; i++) {
    const [x, y, s] = spots[i];
    smear(ctx, x, y, s * 1.6, s * 1.1, i % 3 === 2 ? bloodDark : bloodFresh);
    if (i % 2 === 0) drip(ctx, x + s * 0.2, y + s * 0.3, s * (0.8 + gore * 1.6));
  }
  if (gore > 0.75) {
    // Fresh drops falling off him
    const t = (frame % 34) / 34;
    ctx.fillStyle = bloodFresh;
    const [x, y] = spots[0];
    ell(ctx, x, y + 4 + t * 22, 0.9, 1.4);
  }
};

/** A slow breath: how far his upper body rises this frame. */
export const breath = (frame: number, speed = 0.07) => Math.sin(frame * speed) * 0.9;
