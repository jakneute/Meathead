// END THEM: the winner's ending on the loser, one per fighter (seven), crude and cartoon-gross. The loser stands
// there dazed; the winner walks up and does it. Run on its own after the deciding round (the fight's frozen); the
// loser's pose is copied so it can be taken apart (art.ts cut: pieces fly, turning; the copy keeps the holes).
//
//   COUNT DRACULA     THE BIG SUCK            bites, drinks him down to a dry husk, the husk crumbles to dust
//   THE MONSTER       SOME ASSEMBLY REQUIRED  hoists him overhead and tears him in half
//   THE MUMMY         THE SQUEEZE             wraps him head to foot and squeezes till he pops
//   JEKYLL & HYDE     BEDSIDE MANNER          drinks, turns Hyde, stomps him flat; turns back: "OH DEAR"
//   INVISIBLE MAN     NOTHING (PROBABLY)      an arm, the other, the head: off, by nothing at all
//   THE PHANTOM       THE UNMASKING           takes the mask off; the loser's head bursts at the sight
//   QUASIMODO         FOR WHOM THE BELL TOLLS a cathedral bell dropped on him, rung three times, lifted: a pancake
//
// The Invisible Man losing: there's nothing to take apart. The blood still comes out of nowhere; the game says so.

import { pose, flat, wrapped, cut, copyOf, blit, px, INK, artBase, swapForm, type ArtId } from './art';
import type { PoseId } from './data';
import { FLOOR, blood, artOf, type Match, type Fighter } from './sim';

type Ctx = CanvasRenderingContext2D;
interface Piece { cv: HTMLCanvasElement; x: number; y: number; vx: number; vy: number; rot: number; vr: number; rest: boolean }

export interface Fatal {
  w: Fighter; l: Fighter; t: number; dir: number;
  wArt: ArtId; wPose: PoseId; wx: number; wh: number; startX: number;
  body: HTMLCanvasElement; lPose: PoseId; lShown: boolean; lsx: number; lsy: number; lrot: number; ljit: number; tint: number; wrapA: number; smear: number;
  pieces: Piece[];
  /** Quasimodo's bell (its height), the puddle. */
  bell: number; bellShake: number; puddle: number;
  /** The Phantom's mask in his hand. */
  masked: boolean;
  caption: string | null;
  done: boolean;
}

export const LEN = 270;
export const startFatal = (m: Match, winner: 0 | 1): Fatal => {
  const w = m.f[winner], l = m.f[1 - winner];
  const dir = l.x >= w.x ? 1 : -1;
  w.face = dir === 1 ? 1 : -1; l.face = dir === 1 ? -1 : 1;
  w.act = null; w.stun = 0; w.blocking = false; w.crouch = false;
  const sp = pose(artOf(l), 'hit');
  return {
    w, l, t: 0, dir, wArt: artOf(w), wPose: 'walk0', wx: w.x, wh: 0, startX: w.x,
    body: copyOf(sp.cv), lPose: 'hit', lShown: true, lsx: 1, lsy: 1, lrot: 0, ljit: 0, tint: 0, wrapA: 0, smear: 0,
    pieces: [], bell: -1, bellShake: 0, puddle: 0, masked: true, caption: null, done: false,
  };
};

const sfx = (m: Match, name: string, vol = 0.7, pitch = 0) => m.ev.push({ e: 'sfx', name, vol, pitch });
/** A piece of him cut off and sent flying (canvas coords of his 'hit' pose: x, y, w, h). */
const fling = (ft: Fatal, x: number, y: number, w: number, h: number, vx: number, vy: number) => {
  const sp = pose(artOf(ft.l), 'hit'), lf = ft.l.face;
  const pc = cut(ft.body, x, y, w, h);
  const wx = ft.l.x + lf * (x + w / 2 - sp.ox), wy = FLOOR + (y + h / 2 - sp.oy);
  ft.pieces.push({ cv: pc, x: wx, y: wy, vx: vx * -ft.dir, vy, rot: 0, vr: (Math.random() - 0.5) * 0.4, rest: false });
};
/** Where one of his parts is, on screen (canvas coords of his 'hit' pose in). */
const at = (ft: Fatal, q: [number, number]) => { const sp = pose(artOf(ft.l), 'hit'); return { x: ft.l.x + ft.l.face * (q[0] - sp.ox), h: sp.oy - q[1] }; };

export const tickFatal = (m: Match, ft: Fatal) => {
  m.ev = [];
  ft.t++;
  const t = ft.t, l = ft.l, meta = pose(artOf(l), 'hit').meta, id = ft.w.ch;
  // (walk up to him first; close enough to touch, for the hands-on ones)
  const reach = id === 'invis' || id === 'phantom' ? 70 : id === 'mummy' ? 60 : id === 'quasi' ? 44 : 26;
  if (t <= 30) {
    const goal = l.x - ft.dir * reach, k = t / 30;
    ft.wx = ft.startX + (goal - ft.startX) * Math.min(1, k * 1.4);
    ft.wPose = Math.floor(t / 8) % 2 ? 'walk1' : 'walk0';
    if (Math.abs(goal - ft.startX) < 4) ft.wPose = 'idle0';
  }
  ft.ljit = 0;
  for (const p of ft.pieces) {
    if (p.rest) continue;
    p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.rot += p.vr;
    if (p.y > FLOOR - 3) { p.y = FLOOR - 3; p.vy *= -0.3; p.vx *= 0.5; p.vr *= 0.5; if (Math.abs(p.vy) < 0.6) { p.rest = true; p.vy = 0; } }
  }
  const neck = at(ft, meta.neck), head = at(ft, meta.head);
  switch (id) {
    case 'drac': {
      if (t === 32) { ft.wPose = 'sd'; sfx(m, 'crunch', 0.9); ft.caption = null; }
      if (t > 32 && t < 150) {
        ft.lsy = 1 - 0.45 * ((t - 32) / 118); ft.tint = (t - 32) / 118;
        if (t % 4 === 0) blood(m, neck.x + ft.dir * 2, neck.h * ft.lsy, 2, ft.dir, 0.7);
        if (t % 14 === 0) sfx(m, 'suck', 0.6, -6 + (t - 32) / 12);
        ft.ljit = t % 4 < 2 ? 1 : -1;
      }
      if (t === 150) {
        ft.lShown = false; sfx(m, 'crack', 0.8, -6);
        for (let i = 0; i < 50; i++) m.gore.push({ x: l.x + (Math.random() - 0.5) * 16, y: FLOOR - Math.random() * 40, vx: (Math.random() - 0.5) * 1.6, vy: -Math.random() * 1.2, life: 60 + Math.random() * 60, col: i % 3 ? '#6A5638' : '#3A2E1C', size: 1 + Math.round(Math.random()) });
      }
      if (t === 175) ft.wPose = 'win';
      if (t === 160) ft.caption = 'DRAINED DRY';
      break;
    }
    case 'monster': {
      if (t === 32) { ft.wPose = 'su'; sfx(m, 'bellow', 0.7); }
      if (t > 32 && t < 104) ft.ljit = t > 70 && t % 4 < 2 ? 1 : 0;
      if (t === 104) {
        // (torn in half at the waist: the top one way, the legs the other)
        const sp = pose(artOf(l), 'hit'), cutY = meta.hip[1] - 2;
        const top = cut(ft.body, 0, 0, sp.cv.width, cutY), bot = cut(ft.body, 0, cutY, sp.cv.width, sp.cv.height - cutY);
        const cx = ft.wx, cy = FLOOR - 92;
        ft.pieces.push({ cv: top, x: cx, y: cy, vx: -1.5, vy: -3.4, rot: -Math.PI / 2, vr: -0.1, rest: false });
        ft.pieces.push({ cv: bot, x: cx, y: cy, vx: 1.5, vy: -3.4, rot: -Math.PI / 2, vr: 0.1, rest: false });
        ft.lShown = false; sfx(m, 'gorespray', 1); sfx(m, 'crunch', 1, -8); m.shake = 12;
      }
      if (t > 104 && t < 160 && t % 2 === 0) blood(m, ft.wx, 92, 4, t % 4 ? 1 : -1, 1.5);
      if (t === 120) ft.caption = 'TORN IN HALF';
      if (t === 170) ft.wPose = 'win';
      break;
    }
    case 'mummy': {
      if (t === 32) { ft.wPose = 'sn'; sfx(m, 'whoosh', 0.8); }
      if (t > 32 && t <= 80) ft.wrapA = (t - 32) / 48;
      if (t === 80) { ft.wPose = 'idle0'; sfx(m, 'grind', 0.6); }
      if (t > 80 && t < 160) {
        const k = (t - 80) / 80;
        ft.lsx = 1 - 0.62 * k; ft.lsy = 1 + 0.18 * k; ft.ljit = t % 3 === 0 ? 1 : 0;
        if (t > 100 && t % 3 === 0) { blood(m, l.x, 66 * ft.lsy, 2, 0, 1.6); blood(m, l.x, 2, 2, ft.dir, 1); }
        if (t % 20 === 0) sfx(m, 'splat', 0.6, k * 8);
      }
      if (t === 160) {
        ft.lShown = false; sfx(m, 'gorespray', 1); sfx(m, 'boom', 0.5, 10); m.shake = 10;
        blood(m, l.x, 30, 40, 1, 2); blood(m, l.x, 30, 40, -1, 2);
      }
      if (t === 170) ft.caption = 'SQUEEZED';
      if (t === 185) ft.wPose = 'win';
      break;
    }
    case 'jekyll': {
      if (t === 32 && artBase(ft.wArt) === 'jekyll') { ft.wPose = 'sd'; sfx(m, 'glug', 0.8); }
      if (t === 62 && artBase(ft.wArt) === 'jekyll') { ft.wArt = swapForm(ft.wArt, 'hyde'); m.fx.push({ kind: 'flash', x: ft.wx, h: 34, t: 0, life: 24, dir: 1 }); sfx(m, 'roar', 0.9, -4); m.shake = 8; }
      if (t === 74) { ft.lPose = 'down'; ft.body = copyOf(pose(artOf(l), 'down').cv); sfx(m, 'thud', 0.6); }
      if (t >= 84 && t < 200) {
        const k = t - 84, n = Math.floor(k / 20);
        // (up, and down on him with both feet)
        const ph = k % 20;
        ft.wx = l.x - ft.dir * 4;
        ft.wh = ph < 8 ? 34 * (1 - ph / 8) : 34 * Math.sin(((ph - 8) / 12) * Math.PI / 2);
        ft.wPose = ph < 8 ? 'jk' : ph < 11 ? 'crouch' : 'jump';
        if (k % 20 === 8 && n < 5) {
          ft.lsy = Math.max(0.12, ft.lsy * 0.62); m.shake = 8;
          sfx(m, 'stomp', 1, -6); sfx(m, n > 1 ? 'splat' : 'crunch', 0.8, -4);
          blood(m, l.x, 4, 10 + n * 4, 1, 1.4); blood(m, l.x, 4, 10 + n * 4, -1, 1.4);
          ft.smear = Math.min(1, ft.smear + 0.22);
        }
      }
      if (t === 200) { ft.wPose = 'idle0'; ft.wh = 0; ft.wx = l.x - ft.dir * 30; }
      if (t === 214) { ft.wArt = swapForm(ft.wArt, 'jekyll'); m.fx.push({ kind: 'flash', x: ft.wx, h: 34, t: 0, life: 24, dir: 1 }); sfx(m, 'ding', 0.7, 6); ft.wPose = 'hit'; }
      if (t === 224) ft.caption = 'OH DEAR';
      break;
    }
    case 'invis': {
      const sp = pose(artOf(l), 'hit');
      const swish = (x: number, h: number) => m.fx.push({ kind: 'swoosh', x, h, t: 0, life: 10, dir: ft.dir });
      if (t === 40) { swish(l.x, 40); const a = meta.neck, b = meta.fh; fling(ft, Math.min(a[0], b[0]) - 3, Math.min(a[1], b[1]) - 3, Math.abs(b[0] - a[0]) + 7, Math.abs(b[1] - a[1]) + 7, 2, -4); sfx(m, 'crunch', 0.9); blood(m, at(ft, a).x, at(ft, a).h, 12, ft.dir, 1.3); m.shake = 5; }
      if (t === 75) { swish(l.x, 36); const a = meta.neck, b = meta.bh; fling(ft, Math.min(a[0], b[0]) - 5, Math.min(a[1], b[1]) - 2, Math.abs(b[0] - a[0]) + 6, Math.abs(b[1] - a[1]) + 7, -1.5, -4.5); sfx(m, 'crunch', 0.9, -2); blood(m, neck.x, neck.h, 12, -ft.dir, 1.3); m.shake = 5; }
      if (t === 110) { swish(head.x, head.h); fling(ft, meta.head[0] - 9, meta.head[1] - 12, 19, 21, 1, -7); sfx(m, 'gorespray', 1); m.shake = 8; }
      if (t > 110 && t < 170 && t % 2 === 0) blood(m, neck.x, neck.h - 4, 3, (t % 4) - 1, 1.6);
      if (t > 150 && t <= 175) ft.lrot = -ft.dir * ((t - 150) / 25) * (Math.PI / 2) * 0.95;
      if (t === 175) { sfx(m, 'thud', 0.8); m.shake = 4; }
      if (t === 60) ft.caption = 'WE ASSUME THIS IS AMAZING';
      void sp;
      break;
    }
    case 'phantom': {
      if (t === 32) { ft.wPose = 'sd'; }
      if (t === 56) { ft.masked = false; sfx(m, 'screams', 0.6, 6); ft.caption = null; }
      if (t > 56 && t < 116) { ft.ljit = t % 2 ? 2 : -2; if (t % 16 === 0) sfx(m, 'hurt', 0.4, 10); }
      if (t === 116) {
        // (his head bursts: nothing left of it but the bits)
        cut(ft.body, meta.head[0] - 9, meta.head[1] - 12, 19, 21);
        sfx(m, 'gorespray', 1); sfx(m, 'boom', 0.6, 4); m.shake = 12;
        blood(m, head.x, head.h, 50, 1, 2); blood(m, head.x, head.h, 30, -1, 2);
        for (let i = 0; i < 14; i++) m.gore.push({ x: head.x, y: FLOOR - head.h, vx: (Math.random() - 0.5) * 6, vy: -2 - Math.random() * 4, life: 80, col: i % 2 ? '#E8E4D0' : '#F0B0B0', size: 2 });
      }
      if (t > 116 && t < 175 && t % 3 === 0) blood(m, neck.x, neck.h - 4, 3, 0, 1.8);
      if (t > 175 && t <= 195) ft.lrot = -ft.dir * ((t - 175) / 20) * (Math.PI / 2) * 0.95;
      if (t === 195) sfx(m, 'thud', 0.8);
      if (t === 130) ft.caption = 'HE SAW THE FACE';
      if (t === 205) { ft.wPose = 'win'; ft.masked = true; }
      break;
    }
    case 'quasi': {
      if (t === 32) { ft.wPose = 'sd'; ft.bell = 280; sfx(m, 'whoosh', 0.8, -8); }
      if (ft.bell > 0 && t < 70) { ft.bell = Math.max(0, ft.bell - 11); if (ft.bell === 0) { ft.lShown = false; sfx(m, 'clang', 1, -12); sfx(m, 'crunch', 0.8, -8); m.shake = 14; blood(m, l.x, 2, 20, 1, 1.4); blood(m, l.x, 2, 20, -1, 1.4); } }
      for (const k of [90, 120, 150]) if (t === k) { ft.wPose = 'sp'; ft.bellShake = 10; sfx(m, 'clang', 1, -10 + (k - 90) / 15); m.shake = 8; blood(m, l.x + 20, 1, 8, 1, 1); blood(m, l.x - 20, 1, 8, -1, 1); }
      for (const k of [100, 130, 160]) if (t === k) ft.wPose = 'idle0';
      if (t > 70 && ft.bell === 0) ft.puddle = Math.min(46, ft.puddle + 0.3);
      if (ft.bellShake > 0) ft.bellShake--;
      if (t >= 185 && t < 230) ft.bell = Math.min(320, ft.bell + 8);
      if (t === 185) { ft.lShown = true; ft.lPose = 'down'; ft.body = copyOf(pose(artOf(l), 'down').cv); ft.lsy = 0.12; ft.smear = 1; sfx(m, 'splat', 0.8); }
      if (t === 195) ft.caption = 'DING DONG. DEAD.';
      if (t === 200) ft.wPose = 'win';
      break;
    }
  }
  if (ft.w.ch === 'invis' && t <= 30 && t % 9 === 0) m.fx.push({ kind: 'dust', x: ft.wx, h: 0, t: 0, life: 16, dir: ft.dir });
  if (l.ch === 'invis' && t === 90 && !ft.caption) ft.caption = '(IMAGINE IT. IT IS GROSS.)';
  if (t >= LEN) ft.done = true;
};

/** The ending, drawn on the cabinet's screen (both fighters, the pieces, the bell; the blood's the fight's own). */
export const drawFatal = (c: Ctx, ft: Fatal, f: number) => {
  const l = ft.l, lsp = pose(artOf(l), ft.lPose);
  // (the puddle under the bell)
  if (ft.puddle > 0) { c.fillStyle = '#6A0810'; c.beginPath(); c.ellipse(l.x, FLOOR + 1, ft.puddle, 3, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A0101A'; c.beginPath(); c.ellipse(l.x - 3, FLOOR, ft.puddle * 0.7, 1.5, 0, 0, Math.PI * 2); c.fill(); }
  // THE LOSER
  if (ft.lShown) {
    const lx = l.x + ft.ljit, held = ft.w.ch === 'monster' && ft.t > 32 && ft.t < 104;
    if (held) {
      // (up over the monster's head, flat across)
      const up = Math.min(1, (ft.t - 32) / 16);
      blit(c, ft.body, lsp.ox, lsp.oy - 30, ft.wx + ft.dir * (1 - up) * 20, FLOOR - 10 - up * 62, l.face, 1, 1, -ft.dir * Math.PI / 2 * up);
    } else if (ft.smear > 0 && ft.lsy < 0.3) {
      blit(c, flat(artOf(l), ft.lPose, '#6A0810'), lsp.ox, lsp.oy, lx, FLOOR, l.face, 1.2, ft.lsy);
      blit(c, ft.body, lsp.ox, lsp.oy, lx, FLOOR, l.face, 1.15, ft.lsy, 0, 0.5);
    } else {
      blit(c, ft.body, lsp.ox, lsp.oy, lx, FLOOR, l.face, ft.lsx, ft.lsy, ft.lrot);
      if (ft.tint > 0) blit(c, flat(artOf(l), 'hit', '#5A4630'), lsp.ox, lsp.oy, lx, FLOOR, l.face, ft.lsx, ft.lsy, ft.lrot, ft.tint * 0.9);
      if (ft.wrapA > 0) blit(c, wrapped(artOf(l), 'hit'), lsp.ox, lsp.oy, lx, FLOOR, l.face, ft.lsx, ft.lsy, ft.lrot, Math.min(1, ft.wrapA));
    }
    // (the mummy's bandages flying across to him)
    if (ft.w.ch === 'mummy' && ft.t > 32 && ft.t < 84) {
      const hx = ft.wx + ft.dir * 22, hy = FLOOR - 40;
      for (let k = 0; k < 4; k++) { c.strokeStyle = k % 2 ? '#E2D4AA' : '#AE9A70'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo((hx + lx) / 2, hy - 12 + k * 8 + Math.sin(f * 0.4 + k) * 4, lx, FLOOR - 10 - k * 14); c.stroke(); }
    }
  }
  // (the pile of bandages left after the pop)
  if (ft.w.ch === 'mummy' && ft.t >= 160) for (let k = 0; k < 7; k++) { px(c, l.x - 10 + k * 3, FLOOR - 2 - (k % 3), 6, 2, k % 2 ? '#E2D4AA' : '#AE9A70'); px(c, l.x - 8 + k * 3, FLOOR - 1, 2, 1, '#8A0A14'); }
  // THE PIECES
  for (const p of ft.pieces) blit(c, p.cv, p.cv.width / 2, p.cv.height / 2, p.x, p.y, l.face, 1, 1, p.rot);
  // THE WINNER
  const wsp = pose(ft.wArt, ft.wPose);
  blit(c, wsp.cv, wsp.ox, wsp.oy, ft.wx, FLOOR - ft.wh, ft.dir);
  if (ft.w.ch === 'phantom' && !ft.masked) {
    // (the mask in his hand, held out; his face toward him, not us)
    const hx = ft.wx + ft.dir * 14, hy = FLOOR - 70;
    px(c, hx - 4, hy - 5, 8, 10, INK); px(c, hx - 3, hy - 4, 6, 8, '#F1F0EA'); px(c, hx - 2, hy - 2, 2, 2, INK);
  }
  // QUASIMODO'S BELL
  if (ft.bell >= 0 && ft.bell < 300) drawBigBell(c, l.x + (ft.bellShake ? (ft.bellShake % 2 ? 2 : -2) : 0), FLOOR - ft.bell);
};

/** A cathedral bell, mouth down at y: bronze, banded, its lip lit, the clapper showing. */
const drawBigBell = (c: Ctx, x: number, y: number) => {
  const B = ['#4A2E0A', '#7A4E14', '#A8701C', '#D49A30', '#F4C860'];
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 32, y + 1); c.quadraticCurveTo(x - 28, y - 70, x, y - 74); c.quadraticCurveTo(x + 28, y - 70, x + 32, y + 1); c.closePath(); c.fill();
  for (let k = 0; k < 5; k++) { c.fillStyle = B[k]; c.beginPath(); c.moveTo(x - 30 + k * 5, y - 1); c.quadraticCurveTo(x - 26 + k * 5, y - 66 + k * 2, x + k * 2, y - 71 + k * 2); c.quadraticCurveTo(x + 24 - k * 4, y - 66, x + 28 - k * 6, y - 1); c.closePath(); c.fill(); }
  px(c, x - 34, y - 6, 68, 6, B[0]); px(c, x - 34, y - 6, 68, 1, B[4]);
  px(c, x - 26, y - 46, 52, 3, B[1]); px(c, x - 4, y - 84, 8, 10, B[0]); px(c, x - 2, y - 84, 2, 10, B[3]);
  c.font = '6px "Press Start 2P"'; c.fillStyle = B[0]; c.textAlign = 'center'; c.fillText('1482', x, y - 22); c.textAlign = 'left';
};
