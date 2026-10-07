// The four assholes (and the four more), in silhouette: each his actual sprite, as he stands in his fight, filled
// black with the backlight catching his edges, rising up one after another over the red. (Its own file: the bosses'
// sprites pull in the stages, and one of those pulls in the intro's scenes.)

import { ART_W, ART_H, C, R } from './ending';
import { bands } from './art/snes';
import { drawBoss, makeSitter } from '../render/bosses';

type Ctx = CanvasRenderingContext2D;

/** Which boss each slide key is (for his sprite). */
const BOSS_IDS: Record<string, string> = {
  artie: 'Artie Avalanche', victor: 'Victor Volcano', ernie: 'Ernie Earthquake', hector: 'Hector Hurricane',
  tommy: 'Toxic Tommy', barry: 'Blackout Barry', oscar: 'Oily Oscar', dale: 'Drug Trade Dale',
};
/** Where his eyes are on his sprite (its 80x80 box): his head's where the sprite puts it, the eyes either side of it. */
const EYES: Record<string, [number, number]> = { tommy: [42, 13], ernie: [40, 15.5] };
/** How big each is drawn in his silhouette (art pixels a sprite pixel), so they come out their own sizes, not one size. */
const BUILD: Record<string, number> = { artie: 0.98, victor: 1.04, ernie: 0.86, hector: 0.96, tommy: 0.98, barry: 1.0, oscar: 0.96, dale: 0.96 };

/**
 * A boss in silhouette: his actual sprite (the way he stands in his fight), filled solid black, a rim of the backlight
 * round his top edges. Painted once at each size and kept.
 */
const SIL = new Map<string, HTMLCanvasElement>();
const PAD = 40;
const silhouette = (key: string, scale: number, rim: string) => {
  const id = `${key}@${scale}@${rim}`;
  let c = SIL.get(id);
  if (c) return c;
  const size = Math.ceil((80 + PAD * 2) * scale);
  const paint = (fill: string) => {
    const k = document.createElement('canvas'); k.width = size; k.height = size;
    const g = k.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.save(); g.scale(scale, scale); g.translate(PAD, PAD);
    drawBoss(g, makeSitter(BOSS_IDS[key]), BOSS_IDS[key], 0);
    g.restore();
    g.globalCompositeOperation = 'source-in'; g.fillStyle = fill; g.fillRect(0, 0, size, size);
    return k;
  };
  const black = paint('#050102'), edge = paint(rim);
  c = document.createElement('canvas'); c.width = size; c.height = size;
  const g = c.getContext('2d')!;
  // (the rim: the light from behind catching his top and sides, a pixel out; then him, solid, over it)
  for (const [dx, dy] of [[-1, -1], [1, -1], [0, -1], [-1, 0], [1, 0]]) g.drawImage(edge, dx, dy);
  g.drawImage(black, 0, 0);
  // (and the faintest bounce off the floor glow up his near side, in a dither)
  SIL.set(id, c);
  return c;
};

/** Draw a boss's silhouette with his feet at (cx, base), lit eyes if `eyes` (a colour). */
const bossSil = (ctx: Ctx, key: string, cx: number, base: number, scale: number, rim: string, eyes?: string) => {
  const c = silhouette(key, scale, rim);
  const x = Math.round(cx - (PAD + 40) * scale), y = Math.round(base - (PAD + 80) * scale);
  ctx.drawImage(c, x, y);
  if (eyes) {
    const [ex, ey] = EYES[key] ?? [40, 14.5];
    for (const s of [-1, 1]) { R(ctx, Math.round(x + (PAD + ex + s * 6) * scale) - 1, Math.round(y + (PAD + ey) * scale), 3, 2, eyes); R(ctx, Math.round(x + (PAD + ex + s * 6) * scale), Math.round(y + (PAD + ey) * scale), 1, 1, '#ffd0a0'); }
  }
};

/** A set's four in silhouette, rising up one after another in the dark over red, eyes lit: evenly spaced, on the one floor. */
const drawFour = (ctx: Ctx, t: number, keys: string[]) => {
  bands(ctx, 0, 0, ART_W, ART_H, ['#1a0000', '#2a0200', '#3c0402', '#520804', '#6a0e06', '#841808', '#a0240c', '#bc3410', '#d84c18']);
  ctx.fillStyle = 'rgba(255, 140, 60, 0.1)'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(128, ART_H, 160 - k * 40, 50 - k * 12, 0, 0, Math.PI * 2); ctx.fill(); }
  keys.forEach((k, i) => {
    const rise = Math.max(0, 50 - (t - i * 14) * 2.5);
    const cx = 34 + i * 63;
    bossSil(ctx, k, cx, ART_H + 1 + rise, BUILD[k], '#ff7a2e', t > 40 + i * 14 && (t + i * 9) % 90 > 4 ? C.red : undefined);
  });
};

/** The first four: Artie, Victor, Ernie, Hector, each as he stands in his fight. */
export const drawFirstFour = (ctx: Ctx, t: number) => drawFour(ctx, t, ['artie', 'victor', 'ernie', 'hector']);

/** The second four: Tommy, Barry, Oscar, Dale. */
export const drawSecondFour = (ctx: Ctx, t: number) => drawFour(ctx, t, ['tommy', 'barry', 'oscar', 'dale']);

