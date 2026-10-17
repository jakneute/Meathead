// Japan's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   ninja    black pajamas off a costume rack, a hood, a red headband: throws foam throwing stars (shots.ts
//            'shuriken'), and every few seconds pops a SMOKE BOMB and blinks round behind him (a puff where it was, a puff
//            where it lands: the tell), then throws from there
//   sumo     a fat suit and a mawashi (a diaper, he'd say), a topknot wig: up close the SHOVE (a big knock back); out of
//            reach the STOMP (the leg up is the tell): the ground jumps, and whoever's stood on it near him (him, the
//            cast) is knocked about
//   samurai  red-lacquer armor (plastic), a crested helmet, the katana always held out in front: POINTY (shoulder
//            charging into it hurts him: KindDef.pointy); closes and dashes in with a cut
//   cosplay  the anime cosplay kid: a huge spiky wig, a school uniform, a foam sword bigger than they are on the back.
//            Screams a long half-remembered move name (the tell: long) and throws a glittery papier-mache "energy ball"
//            (shots.ts 'ki'); up close, a bonk with the foam sword

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, inHazard } from '../../hazardHit';
import { lookOf } from '../../adventure/temple/people';
import { castKind, meleeHit, womanOf, setState, dirTo, type Costume, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { shootFlat } from '../shots';
import { bark } from '../state';
import { registerHurts } from '../pavilion';
import { HURT, V, NINJA, SUMO, SAMURAI, COSPLAY, SCREAM } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

const BANDS = ['#DC2626', '#1D4ED8', '#F8FAFC', '#16A34A'];
const NINJA_COSTUME: Costume = {
  id: 'ninja', top: '#18181B', legs: '#18181B', shoe: 'shoe', shoeCol: '#27272A', stripe: '#3F3F46',
  // (costume-rack pajamas: the jacket's wrap crossing the chest, folds in steps, the sash knotted at the hip; the
  // shin wraps' lit stripe)
  over: (g, B, F) => {
    for (let k = 0; k < 10; k++) px(g, -B.w / 2 + 2 + k, B.shY + 2 + k * 1.6, 2, 2, '#3F3F46');
    px(g, -B.w / 2 + 2, B.shY + 2, 3, B.hipY - B.shY - 6, '#27272A'); px(g, B.w / 2 - 4, B.shY + 4, 2, B.hipY - B.shY - 8, '#0A0A0C');
    for (const fy of [B.shY + 14, B.shY + 22]) px(g, -4, fy, 8, 1, '#0A0A0C');
    px(g, -B.w / 2, B.hipY - 5, B.w, 4, '#3F3F46'); px(g, -B.w / 2, B.hipY - 5, B.w, 1, '#52525B');
    px(g, B.w / 2 - 4, B.hipY - 4, 4, 3, '#27272A'); px(g, B.w / 2 - 3, B.hipY - 1, 2, 8, '#3F3F46'); void F;
  },
  // (the mask over the nose and mouth, under the eyes, its seam)
  face: (g, B) => { px(g, B.hx - B.rx, B.hy + 1, B.rx * 2 + 1, B.ry, '#18181B'); px(g, B.hx - B.rx, B.hy + 1, B.rx * 2 + 1, 1, '#3F3F46'); px(g, B.hx + 2, B.hy + 3, 3, 1, '#27272A'); },
  // (the hood (lit along its crown), the headband (its color by who's in it) and its two tails)
  hat: (g, B, F) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 1, B.rx + 1.5, B.ry + 1, 0, Math.PI, 0), '#18181B', B.hx - B.rx - 2, B.hy - B.ry - 2, B.rx * 2 + 4, B.ry + 2, 1);
    px(g, B.hx - B.rx + 2, B.hy - B.ry, 6, 1, '#3F3F46');
    const col = pick(F.seed, 2, BANDS);
    px(g, B.hx - B.rx - 1, B.hy - 5, B.rx * 2 + 2, 3, col); px(g, B.hx - B.rx - 1, B.hy - 5, B.rx * 2 + 2, 1, lt(col, 0.4)); px(g, B.hx - B.rx - 1, B.hy - 3, B.rx * 2 + 2, 1, dk(col, 0.3));
    px(g, B.hx - 1, B.hy - 5, 3, 3, '#F8FAFC'); px(g, B.hx, B.hy - 4, 1, 1, '#DC2626');
    limb(g, B.hx - B.rx - 1, B.hy - 4, B.hx - B.rx - 11, B.hy + 3, 2, col); limb(g, B.hx - B.rx - 1, B.hy - 4, B.hx - B.rx - 9, B.hy + 7, 2, dk(col, 0.25));
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 10], [-B.w / 2 - 4, B.shY - 14]] : F.pose === 'strike' ? [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 18, B.shY + 2]] : null),
  // (a foam star fanned in the tell: four points in steps, its hole)
  hold: (g, B, F, x, y) => {
    if (F.pose !== 'tell') return;
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + F.fr, tx = x + Math.cos(a) * 5, ty = y - 4 + Math.sin(a) * 5; px(g, tx - 2, ty - 2, 4, 4, INK); px(g, tx - 1, ty - 1, 2, 2, k % 2 ? '#9CA3AF' : '#D1D5DB'); }
    px(g, x - 1, y - 5, 2, 2, INK);
  },
  eyes: 'angry',
};

const MAWASHI = ['#1E3A8A', '#7F1D1D', '#1C1917', '#A16207', '#5B2A86'];
const SUMO_COSTUME: Costume = {
  id: 'sumo', top: s => lookOf(s).skin, sleeve: s => lookOf(s).skin, legs: s => lookOf(s).skin, shoe: 'paw', shoeCol: '#E8C7A0',
  // (the fat suit's belly (foam, in steps, its navel; the zipper up its side gives it away), the mawashi round the middle
  // (lit along its top, its knot), the stiff strings hanging in front)
  over: (g, B, F) => {
    const skin = lookOf(F.seed).skin, m = pick(F.seed, 2, MAWASHI);
    part(g, () => g.ellipse(4 + B.lean, B.hipY - 12, B.w / 2 + 7, 15, 0, 0, Math.PI * 2), skin, -B.w / 2 - 4, B.hipY - 27, B.w + 14, 30, 1.2);
    part(g, () => g.ellipse(1 + B.lean, B.hipY - 17, B.w / 3, 7, 0, 0, Math.PI * 2), lt(skin, 0.12), -B.w / 3, B.hipY - 24, B.w * 0.66, 14, 0);
    px(g, B.w / 2 + B.lean, B.hipY - 22, 3, 18, dk(skin, 0.18)); px(g, 2 + B.lean, B.hipY - 16, 2, 2, dk(skin, 0.35));
    px(g, -B.w / 2 - 1 + B.lean, B.shY + 6, 1, B.hipY - B.shY - 8, dk(skin, 0.3)); for (let y = B.shY + 8; y < B.hipY - 4; y += 3) px(g, -B.w / 2 - 1 + B.lean, y, 2, 1, '#A8A29E');
    px(g, -B.hipW / 2 - 4, B.hipY - 3, B.hipW + 10, 9, m); px(g, -B.hipW / 2 - 4, B.hipY - 3, B.hipW + 10, 2, lt(m, 0.35)); px(g, -B.hipW / 2 - 4, B.hipY + 4, B.hipW + 10, 2, dk(m, 0.3));
    px(g, -3, B.hipY - 4, 7, 6, dk(m, 0.15)); px(g, -3, B.hipY - 4, 7, 1, lt(m, 0.3));
    for (let k = 0; k < 6; k++) { px(g, -6 + k * 2.5, B.hipY + 6, 1.5, 12 + (k % 2) * 2, dk(m, 0.1)); px(g, -6 + k * 2.5, B.hipY + 6, 1, 3, lt(m, 0.3)); }
  },
  // (the topknot wig: slicked black, combed lines in it, the knot folded on top)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx - 1, B.hy - 3, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#111827', B.hx - B.rx - 2, B.hy - B.ry - 2, B.rx * 2 + 2, B.ry, 1);
    for (let x = -B.rx + 2; x < B.rx - 1; x += 3) px(g, B.hx + x, B.hy - B.ry + 2, 1, 4, '#374151');
    ball(g, B.hx - 1, B.hy - B.ry - 3, 3.5, '#111827', 1); px(g, B.hx - 4, B.hy - B.ry - 4, 8, 2, '#1F2937'); px(g, B.hx - 3, B.hy - B.ry - 5, 4, 1, '#4B5563');
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 8, B.shY + 4], [B.w / 2 + 8, B.shY + 4]] : F.pose === 'strike' ? [[B.w / 2 + 12, B.shY + 6], [B.w / 2 + 20, B.shY + 2]] : [[-B.w / 2 - 6, B.shY + 18], [B.w / 2 + 6, B.shY + 18]]),
  eyes: 'angry', mouth: 'flat',
};

const ARMOR = ['#7F1D1D', '#1C1917', '#1E3A8A', '#14532D'];
const LACING = ['#DC2626', '#2563EB', '#F8FAFC', '#CA8A04'];
const SAMURAI_COSTUME: Costume = {
  id: 'samurai', top: s => pick(s, 3, ARMOR), legs: s => pick(s, 4, ['#1C1917', '#44403C', '#292524']), shoe: 'sandal', shoeCol: '#78350F',
  // (plastic lacquer plates in rows, each lit along its top edge, laced up in its color; the gold trim; the shoulder
  // guards in their own steps; the skirt plates)
  over: (g, B, F) => {
    const a = pick(F.seed, 3, ARMOR), lace = pick(F.seed, 5, LACING);
    for (let y = B.shY + 4; y < B.hipY + 8; y += 5) { px(g, -B.w / 2 - 1, y, B.w + 2, 1, lt(a, 0.3)); px(g, -B.w / 2 - 1, y + 3, B.w + 2, 1, dk(a, 0.3)); }
    for (let x = -B.w / 2 + 2; x < B.w / 2; x += 5) px(g, x, B.shY + 4, 1, B.hipY - B.shY + 2, lace);
    px(g, -B.w / 2 - 1, B.shY + 3, B.w + 2, 1, '#CA8A04'); px(g, -B.w / 2 - 1, B.hipY - 1, B.w + 2, 1, '#CA8A04');
    for (const s of [-1, 1]) {
      const sx = s < 0 ? -B.w / 2 - 5 : B.w / 2 - 3;
      px(g, sx, B.shY - 1, 8, 12, dk(a, 0.15)); for (let y = B.shY; y < B.shY + 11; y += 3) { px(g, sx, y, 8, 1, lt(a, 0.25)); px(g, sx + 2, y + 1, 1, 2, lace); }
      px(g, sx, B.shY - 1, 8, 1, '#CA8A04');
    }
    px(g, -B.hipW / 2 - 2, B.hipY + 2, B.hipW + 4, 12, dk(a, 0.1)); for (let y = B.hipY + 4; y < B.hipY + 14; y += 4) px(g, -B.hipW / 2 - 2, y, B.hipW + 4, 1, lt(a, 0.25));
    for (let x = -B.hipW / 2; x < B.hipW / 2; x += 6) px(g, x, B.hipY + 2, 1, 12, lace);
  },
  // (the helmet: the dome (lit, riveted), the neck guard flaring, the turned-back flaps, the gold crest)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 4, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#1C1917', B.hx - B.rx - 1, B.hy - B.ry - 3, B.rx * 2 + 2, B.ry, 1.2);
    px(g, B.hx - B.rx + 2, B.hy - B.ry, 5, 2, '#52525B'); for (let x = -B.rx + 3; x < B.rx; x += 4) px(g, B.hx + x, B.hy - B.ry + 3, 1, 1, '#A8A29E');
    px(g, B.hx - B.rx - 5, B.hy - 4, 7, 9, '#1C1917'); px(g, B.hx - B.rx - 5, B.hy - 4, 7, 1, '#52525B'); px(g, B.hx - B.rx - 5, B.hy, 7, 1, '#3F3F46');
    px(g, B.hx + B.rx - 2, B.hy - 7, 4, 5, '#1C1917'); px(g, B.hx + B.rx - 1, B.hy - 7, 2, 1, '#CA8A04');
    part(g, () => { g.moveTo(B.hx - 9, B.hy - B.ry - 2); g.quadraticCurveTo(B.hx, B.hy - B.ry + 6, B.hx + 9, B.hy - B.ry - 2); g.quadraticCurveTo(B.hx, B.hy - B.ry + 2, B.hx - 9, B.hy - B.ry - 2); g.closePath(); }, '#FCD34D', B.hx - 9, B.hy - B.ry - 4, 18, 8, 0.8);
    px(g, B.hx - 7, B.hy - B.ry - 2, 3, 1, '#FEF9C3');
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY - 6], [-B.w / 2 - 2, B.shY - 12]] : F.pose === 'strike' ? [[B.w / 2 + 4, B.shY + 8], [B.w / 2 + 16, B.shY + 6]] : [[B.w / 2, B.shY + 12], [B.w / 2 + 6, B.shY + 10]]),
  // (the katana: held out in front (the point he'd charge onto), up and back in the tell, out at the end of the cut: the
  // wrapped grip, the gold guard, the blade lit along its edge, its point glinting)
  hold: (g, B, F, x, y) => {
    const a = F.pose === 'tell' ? -2.3 : F.pose === 'strike' ? 0.15 : -0.12, len = 46, ca = Math.cos(a), sa = Math.sin(a);
    limb(g, x - ca * 9, y - sa * 9, x, y, 3.5, INK); limb(g, x - ca * 9, y - sa * 9, x, y, 2.5, '#1C1917');
    for (let k = 1; k < 4; k++) px(g, x - ca * k * 2.4, y - sa * k * 2.4, 1, 1, '#E5E7EB');
    px(g, x - 3, y - 3, 6, 6, INK); px(g, x - 2, y - 2, 4, 4, '#CA8A04'); px(g, x - 2, y - 2, 1, 1, '#FEF3C7');
    limb(g, x, y, x + ca * len, y + sa * len, 3, INK); limb(g, x, y, x + ca * len, y + sa * len, 2, '#CBD5E1');
    limb(g, x - sa * 0.6, y + ca * 0.6, x + ca * (len - 3) - sa * 0.6, y + sa * (len - 3) + ca * 0.6, 1, '#FFFFFF', false);
    px(g, x + ca * len - 1, y + sa * len - 1, 2, 2, '#FFFFFF');
  },
  eyes: 'angry', mouth: 'flat',
};

const WIGS = ['#FDE047', '#F472B6', '#60A5FA', '#4ADE80', '#F97316', '#F8FAFC', '#A78BFA'];
const COSPLAY_COSTUME: Costume = {
  id: 'cosplay', top: s => pick(s, 2, ['#F8FAFC', '#1E3A8A', '#111827']), legs: s => pick(s, 3, ['#1E3A8A', '#111827', '#7F1D1D']), shoe: 'shoe', shoeCol: '#7C2D12',
  // (the giant foam sword strapped across the back, bigger than they are: the blade in steps, its duct-tape bands, the
  // cardboard guard, the taped grip)
  back: (g, B) => {
    const ax = -B.w / 2 - 14, ay = -6, bx = B.w / 2 + 6, by = B.shY - 26;
    limb(g, ax, ay, bx, by, 9, INK); limb(g, ax, ay, bx, by, 7, '#D1D5DB'); limb(g, ax, ay - 2, bx, by - 2, 2, '#F3F4F6', false); limb(g, ax + 1, ay + 2, bx + 1, by + 2, 1, '#9CA3AF', false);
    for (let k = 1; k < 4; k++) { const t = k / 4, tx = ax + (bx - ax) * t, ty = ay + (by - ay) * t; px(g, tx - 2, ty - 4, 4, 8, '#9CA3AF'); px(g, tx - 2, ty - 4, 1, 8, '#E5E7EB'); }
    px(g, bx - 7, by - 2, 14, 5, INK); px(g, bx - 6, by - 1, 12, 3, '#A16207'); px(g, bx - 6, by - 1, 12, 1, '#CA8A04');
    px(g, bx - 3, by - 10, 6, 10, INK); px(g, bx - 2, by - 9, 4, 8, '#7C2D12'); for (let y = by - 8; y < by; y += 2) px(g, bx - 2, y, 4, 1, '#B45309');
  },
  // (the sailor collar and its stripes, the red neckerchief and its knot)
  over: (g, B) => {
    px(g, -B.w / 2, B.shY, B.w, 7, '#1E40AF'); px(g, -B.w / 2, B.shY, B.w, 1, '#3B5BDB');
    px(g, -B.w / 2, B.shY + 4, B.w, 1, '#F8FAFC'); px(g, -B.w / 2, B.shY + 6, B.w, 1, '#F8FAFC');
    part(g, () => { g.moveTo(-3, B.shY + 4); g.lineTo(5, B.shY + 4); g.lineTo(1, B.shY + 13); g.closePath(); }, '#DC2626', -3, B.shY + 4, 8, 9, 0.8);
    px(g, -1, B.shY + 4, 4, 3, '#991B1B'); px(g, -2, B.shY + 4, 2, 1, '#F87171');
  },
  // (the wig: spikes everywhere in a cartoon color, each spike lit along its top, a shine streak across)
  hat: (g, B, F) => {
    const col = pick(F.seed, 4, WIGS);
    partTop(g, () => g.ellipse(B.hx, B.hy - 3, B.rx + 2, B.ry, 0, Math.PI, 0), col, B.hx - B.rx - 2, B.hy - B.ry - 3, B.rx * 2 + 4, B.ry, 1);
    for (let k = 0; k < 6; k++) {
      const a = Math.PI + 0.2 + k * 0.5, bx = B.hx + Math.cos(a) * B.rx, by = B.hy - 4 + Math.sin(a) * B.ry;
      part(g, () => { g.moveTo(bx - 3, by + 2); g.lineTo(bx + Math.cos(a) * 12, by + Math.sin(a) * 12); g.lineTo(bx + 3, by + 2); g.closePath(); }, col, bx - 12, by - 12, 24, 16, 0.8);
      px(g, bx + Math.cos(a) * 6 - 1, by + Math.sin(a) * 6 - 1, 2, 2, lt(col, 0.5));
    }
    px(g, B.hx + 2, B.hy - 4, B.rx - 1, 4, col);
    px(g, B.hx - B.rx + 2, B.hy - B.ry + 2, 7, 1, lt(col, 0.6)); px(g, B.hx - B.rx + 4, B.hy - B.ry + 3, 4, 1, lt(col, 0.4));
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 6, B.shY + 16], [-B.w / 2 - 2, B.shY + 18]] : F.pose === 'strike' ? [[B.w / 2 + 10, B.shY + 4], [B.w / 2 + 18, B.shY + 2]] : null),
  // (the glitter ball, cupped at the hip in the tell, glowing, its glitter twinkling)
  hold: (g, B, F, x, y) => {
    if (F.pose !== 'tell') return;
    const r = 6 + Math.sin(F.fr * 0.8) * 1.5;
    g.globalAlpha = 0.45; g.fillStyle = '#93C5FD'; g.beginPath(); g.arc(x - 3, y - 2, r + 3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; ball(g, x - 3, y - 2, r, '#60A5FA', 1); px(g, x - 5, y - 5, 3, 3, '#E0F2FE');
    for (let k = 0; k < 4; k++) { const a = F.fr * 0.6 + k * 1.6; px(g, x - 3 + Math.cos(a) * r, y - 2 + Math.sin(a) * r, 2, 2, k % 2 ? '#FDE047' : '#F9A8D4'); }
  },
  eyes: 'wide', mouth: 'o',
};

// ---------------------------------------------------------------------------------------------------------------
// The ninja: a smoke bomb, and round behind him

const NEXT_BLINK = new WeakMap<Enemy, number>();
const puff = (ctx: FrameContext, x: number, y: number) => {
  for (let k = 0; k < 14; k++) ctx.state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: y - Math.random() * 60 }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 1.4 }, life: 28 + Math.random() * 14, color: k % 3 ? '#9CA3AF' : '#E5E7EB', size: 5 + Math.random() * 4 });
};
const ninjaOwn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  if (e.aiState !== 'approach' || (NEXT_BLINK.get(e) ?? 0) > state.frame || !pl.isGrounded || pl.health <= 0 || pl.inCutscene) return false;
  if (Math.abs(p.x - m.x) > 420 || Math.abs(p.y - m.y) > 120) return false;
  NEXT_BLINK.set(e, state.frame + 220 + ((e.variant ?? 0) * 13) % 80);
  // (round the far side of him, on whatever he's stood on, and nothing solid in the way)
  const feet = pl.pos.y + pl.height, side = Math.sign(p.x - m.x) || 1, tx = p.x + side * 110;
  const nx = tx - e.width / 2, ny = feet - e.height;
  const floor = state.blocks.some(b => b.type !== 'pit' && tx > b.x && tx < b.x + b.w && Math.abs(b.y - feet) < 6);
  const blocked = state.blocks.some(b => b.type !== 'pit' && !b.oneWay && nx < b.x + b.w && nx + e.width > b.x && ny < b.y + b.h && feet - 2 > b.y);
  if (!floor || blocked || inHazard(state, e, nx, ny)) return false;
  puff(ctx, m.x, e.pos.y + e.height); playSound('whoosh', 0.6, -10);
  e.pos.x = nx; e.pos.y = ny; e.vel.x = 0; e.vel.y = 0; e.homeX = nx;
  e.facing = dirTo(e, p.x);
  puff(ctx, tx, feet);
  setState(e, 'tell');
  return true;
};
castKind({
  kind: 'm2:fl_ninja', costume: NINJA_COSTUME, stats: { w: 34, h: 70, hp: 75, contact: 5, mass: 150 },
  voice: V.ninja, pool: NINJA, speed: 1.7, range: [110, 420], reachY: 160, tell: 18, after: 16, cooldown: 60,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'shuriken', 6.5),
  own: ninjaOwn,
});

// ---------------------------------------------------------------------------------------------------------------
// The sumo: the shove, the stomp

const sumoStrike = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), d = Math.abs(p.x - m.x);
  if (d < 90) { if (meleeHit(ctx, e, 96, 12, 'm2:fl_sumo', 18, 60)) playSound('slam', 0.8, -8); return; }
  // (the stomp: the ground jumps under whoever's stood near)
  playSound('stomp', 1, -12); shakeScreen(state, 7, 4);
  const feet = e.pos.y + e.height;
  for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * 60, y: feet }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 20, color: '#A8A29E', size: 3 });
  if (pl.isGrounded && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene && d < 270 && Math.abs(pl.pos.y + pl.height - feet) < 30) {
    hurtPlayer(ctx, 7, 'm2:fl_sumo_stomp', { x: Math.sign(p.x - m.x || 1) * 4, y: -9 }, 20);
    state.playerStunTimer = Math.max(state.playerStunTimer, 20);
  }
  for (const o of hazardVictims(state)) if (o !== e && Math.abs(mid(o).x - m.x) < 220 && Math.abs(o.pos.y + o.height - feet) < 20) hazardHit(ctx, o, 18, m.x, 'STOMPED!', { color: '#FCD34D' });
};
castKind({
  kind: 'm2:fl_sumo', costume: SUMO_COSTUME, stats: { w: 54, h: 80, hp: 260, contact: 8, mass: 420 },
  head: { x: 1, y: -72, r: 10 }, grab: 'none',
  voice: V.sumo, pool: SUMO, speed: 0.8, range: [40, 250], reachY: 60, tell: 32, after: 30, cooldown: 70,
  strike: sumoStrike,
});

// ---------------------------------------------------------------------------------------------------------------
// The samurai: the dash and cut (the blade always out front: pointy)

const CUT = new WeakSet<Enemy>();
castKind({
  kind: 'm2:fl_samurai', costume: SAMURAI_COSTUME, stats: { w: 38, h: 74, hp: 150, contact: 6, mass: 210 },
  voice: V.samurai, pool: SAMURAI, speed: 1.2, range: [60, 190], reachY: 70, tell: 22, strikeFor: 14, after: 30, cooldown: 55,
  strike: (_ctx, e) => { CUT.delete(e); playSound('whoosh', 0.9, 10); },
  striking: (ctx, e) => {
    e.vel.x = e.aiTimer < 9 ? (e.facing ?? 1) * 5.5 : 0;
    if (!CUT.has(e) && e.aiTimer >= 3 && meleeHit(ctx, e, 92, 14, 'm2:fl_samurai', 11)) { CUT.add(e); playSound('crunch', 0.8, 6); }
  },
  pointy: { source: 'm2:fl_samurai_blade', label: 'KATANA!' },
});

// ---------------------------------------------------------------------------------------------------------------
// The cosplay kid: the scream, the ball

castKind({
  kind: 'm2:fl_cosplay', costume: COSPLAY_COSTUME, stats: { w: 34, h: 68, hp: 85, contact: 4, mass: 150 },
  voice: V.cosplay, pool: COSPLAY, speed: 1.3, range: [50, 480], reachY: 160, tell: 56, after: 24, cooldown: 90,
  own: (ctx, e) => { if (e.aiState === 'tell' && e.aiTimer === 1 && Math.abs(mid(ctx.state.player).x - mid(e).x) > 90) bark(ctx.state, e, womanOf(e) ? V.cosplay.f : V.cosplay.m, SCREAM, 0.9); return false; },
  strike: (ctx, e) => {
    if (Math.abs(mid(ctx.state.player).x - mid(e).x) < 90) { if (meleeHit(ctx, e, 80, 7, 'm2:fl_cosplay', 9)) playSound('thud', 0.6, 14); }
    else shootFlat(ctx.state, e, 'ki', 3.6);
  },
});

void INK;
