// Meathead, in the cutscenes, once he's shit himself (game/player/gut.ts): the seat of his jeans soaked through brown
// and run down the insides of his legs, the stink coming up off him in wavy lines, a fly or two working him over. One
// look, shared by every cutscene that can catch him like it (the gym's pitch; the White House: the ceremony, the
// alien, the epilogue). Pixel art on the cutscenes' 256 x 144: a stepped brown ramp, dithered at the edges.

type Ctx = CanvasRenderingContext2D;

/** Wet brown, darkest to lightest (light enough to read on dark denim). */
const BROWN = ['#3c2210', '#5c3616', '#7c4c1e', '#9c6428', '#bc8038'];
/** The stink: a sick green-brown, strongest low down. */
const STINK = ['rgba(176, 196, 84, 0.95)', 'rgba(160, 182, 80, 0.7)', 'rgba(146, 168, 76, 0.42)'];
const FLY = '#100c08', WING = '#c8d4dc';

let on = false, clock = 0;
/** Whether the cutscene that's up has him shat (set as it mounts, cleared as it goes). */
export const setShatPants = (shat: boolean) => { on = shat; };
export const shatPants = () => on;
/** The panel's frame, for the flies and the stink (a frozen frame holds them still). */
export const shatClock = (t: number) => { clock = t; };
/** A cutscene panel's draw, keeping the flies and the stink on its frame. */
export const shatClocked = (draw: (c: Ctx, t: number, talking: boolean) => void) => (c: Ctx, t: number, talking: boolean) => { clock = t; draw(c, t, talking); };

const P = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A column of wet: the core dark, a lit pixel down its left (the light's from the upper left), dithered off at its foot. */
const run = (ctx: Ctx, x: number, y: number, len: number, w = 2) => {
  P(ctx, x, y, w, len, BROWN[2]);
  P(ctx, x + w - 1, y, 1, len, BROWN[1]);
  P(ctx, x, y, 1, Math.max(1, len - 2), BROWN[3]);
  // (a drip gathering at the end of it)
  P(ctx, x, y + len, w, 1, BROWN[1]);
  if (len > 6) P(ctx, x + (w > 1 ? 1 : 0), y + len + 2, 1, 1, BROWN[2]);
};

/** Stink coming up off (x, y): `n` wavy lines, `h` tall, `spread` apart, `thick` pixels wide. */
export const stink = (ctx: Ctx, x: number, y: number, n = 3, h = 18, spread = 7, thick = 1) => {
  const t = clock;
  for (let i = 0; i < n; i++) {
    const rise = ((t * 0.5 + i * 13) % 24);
    const x0 = x + (i - (n - 1) / 2) * spread;
    for (let k = 0; k < h; k++) {
      const u = k / h;
      // (thinning out as it goes up: every other pixel of it, near the top)
      if (u > 0.6 && (k + i + Math.floor(t / 4)) % 2) continue;
      const xx = x0 + Math.round(Math.sin(k * 0.42 + t * 0.12 + i * 2.1) * (1.5 + thick));
      P(ctx, xx, y - k - rise * (h / 24), thick, 1, STINK[u < 0.33 ? 0 : u < 0.66 ? 1 : 2]);
    }
  }
};

/** A fly: a dark body, its wings a blur over it (`s` its size: 1 small, 2 up close). */
const fly = (ctx: Ctx, x: number, y: number, s: number, i: number) => {
  P(ctx, x, y, 2 * s, s, FLY);
  if (s > 1) P(ctx, x + 2 * s - 1, y - 1, s, s, FLY);
  const flap = (Math.floor(clock / 2) + i) % 2;
  P(ctx, x + (flap ? 0 : s), y - s, s, s, WING);
  if (s > 1) P(ctx, x + s * 2 + (flap ? 0 : 1), y - s - 1, s, s, WING);
};

/** `n` flies looping round (cx, cy), `r` out, in their own jittery orbits. */
export const flies = (ctx: Ctx, cx: number, cy: number, r: number, n = 2, s = 1) => {
  for (let i = 0; i < n; i++) {
    const a = clock * (0.13 + i * 0.05) + i * 2.4;
    const x = cx + Math.cos(a) * r + Math.sin(clock * 0.7 + i * 3) * 1.5;
    const y = cy + Math.sin(a * 1.6) * r * 0.55 + Math.cos(clock * 0.9 + i) * 1.5;
    fly(ctx, x, y, s, i);
  }
};

/**
 * Meathead standing, from the front (the cutscenes' small full-body figure: legs cx-8..cx+8, from baseY-24 down to
 * the boots at baseY-4): soaked through at the crotch, run down the inside of each leg, the stink and a couple of flies.
 */
export const shatFront = (ctx: Ctx, cx: number, baseY: number) => {
  const top = baseY - 24;
  P(ctx, cx - 6, top, 12, 4, BROWN[2]); P(ctx, cx - 5, top, 10, 1, BROWN[3]); P(ctx, cx - 1, top + 1, 2, 3, BROWN[1]);
  for (let x = cx - 7; x < cx + 7; x++) if ((x + top) % 2 === 0) P(ctx, x, top + 4, 1, 1, BROWN[2]);
  run(ctx, cx - 4, top + 4, 13, 3); run(ctx, cx + 1, top + 4, 9, 3);
  // (the stink off either side of him, clear of his body: on his chest it'd read as veins)
  stink(ctx, cx - 16, top + 8, 2, 16, 4); stink(ctx, cx + 16, top + 8, 2, 16, 4);
  flies(ctx, cx, top + 6, 17, 2);
};

/** From the side (facing `f`, his seat on the other side): the back of the jeans soaked, run down the back of his leg. */
export const shatSide = (ctx: Ctx, cx: number, baseY: number, f: 1 | -1 = 1) => {
  const top = baseY - 24, sx = cx - f * 8;
  P(ctx, sx - 4, top - 1, 9, 7, BROWN[2]); P(ctx, sx - 3, top - 1, 7, 1, BROWN[3]); P(ctx, sx - f * 4, top, 1, 6, BROWN[1]);
  run(ctx, sx - (f > 0 ? 4 : -1), top + 6, 10, 3);
  stink(ctx, sx - f * 5, top - 2, 3, 16, 8);
  flies(ctx, sx - f * 5, top + 4, 14, 2);
};

/** Up close on someone's face (Meathead's, or whoever's standing near him): the stink coming up into the frame from below, a fly buzzing round. */
export const shatCloseUp = (ctx: Ctx, cx = 128, cy = 64) => {
  stink(ctx, 52, 150, 3, 40, 12, 2);
  stink(ctx, 206, 150, 3, 34, 12, 2);
  flies(ctx, cx, cy, 70, 1, 2);
};

/**
 * His shin up close (the leg-hair singe): what's run down from the seat of his jeans this far: the denim soaked dark
 * down from the top of the frame, brown streaks running out of it down to his boot, a wet shine on them, a fly come to
 * see. (Painted at the panel's own resolution, like the rest of it.)
 */
export const shatLegRun = (ctx: Ctx) => {
  const t = clock;
  // A streak: down from (x, y0) to y1, `w` wide, wandering a little, thinning toward its end, a drip on the end
  const streak = (x: number, y0: number, y1: number, w: number, seed: number) => {
    const at = (y: number) => x + Math.sin(y * 0.07 + seed) * 3 + Math.sin(y * 0.19 + seed * 2) * 1.2;
    const half = (y: number) => w * (1 - 0.55 * (y - y0) / (y1 - y0)) / 2;
    ctx.beginPath();
    for (let y = y0; y <= y1; y += 2) ctx.lineTo(at(y) - half(y), y);
    for (let y = y1; y >= y0; y -= 2) ctx.lineTo(at(y) + half(y), y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(30, 14, 4, 0.5)'; ctx.save(); ctx.translate(1.5, 1); ctx.fill(); ctx.restore();
    ctx.fillStyle = BROWN[2]; ctx.fill();
    ctx.strokeStyle = BROWN[1]; ctx.lineWidth = 0.8; ctx.stroke();
    // (the wet shine down its lit side)
    ctx.strokeStyle = 'rgba(232, 190, 130, 0.55)'; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let y = y0 + 4; y < y1 - 6; y += 2) ctx.lineTo(at(y) - half(y) * 0.45, y);
    ctx.stroke();
    // (the drip on the end of it, swelling)
    const sw = 1.6 + ((t + seed * 20) % 60) / 60 * 1.4;
    ctx.fillStyle = BROWN[2]; ctx.beginPath(); ctx.ellipse(at(y1), y1 + 1.5, half(y1) * 0.9, sw, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232, 190, 130, 0.6)'; ctx.fillRect(at(y1) - 1, y1, 1, 1);
  };
  // The soak, down from the top: the denim gone dark and brown, its edge ragged
  ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(70, -20);
  for (let x = 70; x >= -20; x -= 6) ctx.lineTo(x, 8 + Math.sin(x * 0.15) * 5 + (70 - x) * 0.25);
  ctx.closePath();
  ctx.fillStyle = 'rgba(70, 40, 12, 0.7)'; ctx.fill();
  ctx.strokeStyle = 'rgba(40, 20, 6, 0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
  streak(14, 10, 122, 11, 1);
  streak(40, 4, 84, 7, 4);
  streak(232, -20, 102, 8, 7);
  flies(ctx, 56, 34, 24, 1, 2);
};
