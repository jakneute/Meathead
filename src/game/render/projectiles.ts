// Art for the projectiles: bullets, shotgun pellets, darts, everything the goons throw, Hector's poop logs, Dale's
// cocaine and meth barrels, flying sludge, Barry's dark orbs, Oscar's oil rockets. World space. Drawn the way the
// people are: an ink line round every solid thing, its colour in steps (lit upper left), a glint; anything that glows
// glows in flat stepped rings, and what streams behind streams in flat steps, fading, never a smooth gradient.

import { Projectile } from '../../types';
import { drawFireball, FIRE_RAMP } from './fx/fireball';
import { steppedGlow, pixelBlob } from './pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from './npc/kit';

type Ctx = CanvasRenderingContext2D;

const angleOf = (p: Projectile) => Math.atan2(p.vel.y, p.vel.x);
const speedOf = (p: Projectile) => Math.hypot(p.vel.x, p.vel.y);
const centerOf = (p: Projectile) => ({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
const seedOf = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997; return h; };

/** A shaded, inked box (most of what gets thrown is a few of these). */
const box = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, r?: number) =>
  shaded(ctx, () => (r ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h)), color, x, y, w, h);
/** A shaded, inked circle. */
const ball = (ctx: Ctx, x: number, y: number, r: number, color: string) =>
  shaded(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), color, x - r, y - r, r * 2, r * 2);
/** A white glint, `s` square. */
const glint = (ctx: Ctx, x: number, y: number, s = 1) => { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, s, s); };
/** A stroke with its ink line under it (a handle, a loop, a horseshoe). */
const inkStroke = (ctx: Ctx, path: () => void, color: string, w: number) => {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.beginPath(); path(); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); path(); ctx.stroke();
  ctx.lineCap = 'butt';
};
/**
 * A streak behind something flying +x: `steps` flat slabs back from x0 along -x, `len` long in all, each thinner and
 * fainter than the one before, in the colours given (hot to cool).
 */
const streak = (ctx: Ctx, x0: number, len: number, h: number, colors: string[], a0 = 0.85) => {
  const n = colors.length, w = len / n;
  colors.forEach((c, i) => {
    const hh = Math.max(1, h * (1 - i / (n + 1)));
    ctx.globalAlpha = a0 * (1 - i / (n + 0.5));
    ctx.fillStyle = c;
    ctx.fillRect(x0 - w * (i + 1), -hh / 2, w + 0.5, hh);
  });
  ctx.globalAlpha = 1;
};

/** Meathead's gun: a hot tracer round with a streak behind it, stepping down yellow to orange as it fades. */
export const drawBullet = (ctx: Ctx, p: Projectile) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  const len = Math.min(34, 10 + speedOf(p) * 1.2);
  streak(ctx, -1, len, 5, ['#FDE047', '#FBBF24', '#F59E0B', '#EA580C']);
  steppedGlow(ctx, 2, 0, 10, '#FFC400', 0.32, 0.1, 3);
  // (the round: an orange rim, the yellow, a white-hot core, a glint)
  ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.ellipse(2.5, -0.3, 6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(3.5, -0.4, 3.5, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

/** A pipe wrench along x, the jaws at +x (and, if it has one, a red rubber grip). */
const pipeWrench = (ctx: Ctx, grip: boolean) => {
  box(ctx, -10, -1.5, 16, 3, '#6B7280');
  box(ctx, 4, -5, 6, 4, '#9CA3AF');
  box(ctx, 4, 1, 6, 3, '#9CA3AF');
  ctx.fillStyle = dark('#9CA3AF', 0.4); for (let k = 0; k < 3; k++) ctx.fillRect(5 + k * 1.7, -1.6, 0.8, 0.8); // (the knurled nut)
  if (grip) box(ctx, -10, -2, 6, 4, '#B91C1C', 1);
  glint(ctx, 5, -4);
};

/** What a shield goon's thrown, end over end: a tequila bottle, a water bottle, a coconut, a chunk of ice, a hot rock, tear gas. */
export const drawThrown = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.rotation || 0);
  switch (p.thrown) {
    case 'tequila':
      box(ctx, -2, -9, 4, 7, '#92400E');
      box(ctx, -5, -3, 10, 12, '#92400E', 2);
      ink(ctx, () => ctx.rect(-5, 1, 10, 5), '#FDE68A', 0.8);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(-2, 2, 4, 3);
      ctx.fillStyle = '#FEF3C7'; ctx.fillRect(-1, 2.5, 1, 1);
      box(ctx, -2, -11, 4, 2, '#E5E7EB');
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(-4, -2, 1.5, 3); ctx.fillRect(-4, 6.5, 1.5, 1.5); ctx.fillRect(-1.5, -8, 1, 4);
      glint(ctx, -4, -2);
      break;
    case 'water':
      // A reusable one: steel, a carry loop, a sticker
      inkStroke(ctx, () => ctx.arc(0, -11, 3, Math.PI, 0), '#E5E7EB', 1.5);
      box(ctx, -5, -6, 10, 15, '#0EA5E9', 3);
      box(ctx, -4, -9, 8, 4, '#D1D5DB');
      ink(ctx, () => ctx.arc(0, 2, 2.5, 0, Math.PI * 2), '#A3E635', 0.8);
      ctx.fillStyle = '#ECFCCB'; ctx.fillRect(-1, 0.6, 1, 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(-4, -4, 1.5, 10);
      glint(ctx, -4, -4, 1.5);
      break;
    case 'coconut':
      ball(ctx, 0, 0, 8, '#5B3413');
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, Math.PI * 2); ctx.clip();
      ctx.lineWidth = 1;
      for (let k = 0; k < 5; k++) { // (the husk's fibers, a dark one and a light one)
        ctx.strokeStyle = '#3B200B'; ctx.beginPath(); ctx.moveTo(-7, -5 + k * 2.5); ctx.lineTo(7, -6 + k * 3); ctx.stroke();
        ctx.strokeStyle = '#8A5A2B'; ctx.beginPath(); ctx.moveTo(-7, -4 + k * 2.5); ctx.lineTo(-1, -4.3 + k * 2.75); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#1C1917'; for (const [a, b] of [[-2, -3], [2, -3], [0, 1]]) { ctx.beginPath(); ctx.arc(a, b, 1.3, 0, Math.PI * 2); ctx.fill(); } // its face
      glint(ctx, -5, -5, 1.5);
      break;
    case 'ice': {
      const chunk = () => { ctx.moveTo(-8, -2); ctx.lineTo(-3, -7); ctx.lineTo(6, -6); ctx.lineTo(8, 2); ctx.lineTo(2, 7); ctx.lineTo(-6, 5); ctx.closePath(); };
      ctx.beginPath(); chunk(); ctx.fillStyle = '#BAE6FD'; ctx.fill();
      // (cut faces: a lit one up top, a deep one down the right)
      ctx.fillStyle = '#F0F9FF'; ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(-2, -5); ctx.lineTo(1, -4); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7DD3FC'; ctx.beginPath(); ctx.moveTo(8, 2); ctx.lineTo(2, 7); ctx.lineTo(-1, 4); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#38BDF8'; ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(-6, 5); ctx.lineTo(-1, 4); ctx.closePath(); ctx.fill();
      ctx.beginPath(); chunk(); ctx.strokeStyle = '#0C4A6E'; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
      glint(ctx, -4, -3, 1.5); glint(ctx, 4, -5);
      break;
    }
    case 'rock': {
      const glow = 0.6 + Math.sin(frame * 0.5) * 0.3;
      steppedGlow(ctx, 0, 0, 13, '#F97316', 0.18 * glow, 0.05, 2);
      const lump = () => { ctx.moveTo(-8, 0); ctx.lineTo(-4, -6); ctx.lineTo(5, -6); ctx.lineTo(8, 1); ctx.lineTo(3, 6); ctx.lineTo(-5, 5); ctx.closePath(); };
      shaded(ctx, lump, '#292524', -8, -6, 16, 12);
      ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(-3, -5); ctx.lineTo(2, -5); ctx.closePath(); ctx.fill();
      // (the cracks glowing through it: a wide dim orange, a thin hot yellow)
      const cracks = () => { ctx.moveTo(-5, -1); ctx.lineTo(0, 1); ctx.lineTo(4, -3); ctx.moveTo(0, 1); ctx.lineTo(1, 5); };
      ctx.strokeStyle = `rgba(234, 88, 12, ${glow * 0.7})`; ctx.lineWidth = 2.5; ctx.beginPath(); cracks(); ctx.stroke();
      ctx.strokeStyle = `rgba(253, 224, 71, ${glow})`; ctx.lineWidth = 1; ctx.beginPath(); cracks(); ctx.stroke();
      ctx.fillStyle = `rgba(254, 249, 195, ${glow})`; ctx.fillRect(-0.5, 0.5, 1.5, 1.5);
      break;
    }
    case 'teargas': {
      // (hissing out the top: a chunky puff, a paler one in it)
      const puff = 3 + (frame % 6) * 0.4;
      pixelBlob(ctx, 0, -11, puff + 1, puff + 1, 'rgba(203, 213, 196, 0.55)', 1);
      pixelBlob(ctx, 0, -11.5, puff * 0.6, puff * 0.6, 'rgba(241, 245, 236, 0.8)', 1);
      box(ctx, -4, -7, 8, 14, '#374151');
      box(ctx, -4, -2, 8, 4, '#65A30D');
      box(ctx, -3, -9, 6, 2, '#9CA3AF');
      glint(ctx, -3, -6);
      break;
    }
    case 'forty': {
      // A forty in a paper bag, the neck sticking out of it
      box(ctx, -2, -12, 4, 6, '#78350F');
      box(ctx, -2, -13, 4, 2, '#FACC15');
      const bag = () => { ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(5, 10); ctx.lineTo(-5, 10); ctx.closePath(); };
      shaded(ctx, bag, '#C8A26B', -6, -6, 12, 16);
      ctx.strokeStyle = '#8A6A3C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-3, -3); ctx.lineTo(0, -6); ctx.lineTo(3, -3); ctx.lineTo(6, -6); ctx.stroke();
      ctx.fillStyle = '#A07F4F'; ctx.fillRect(-2, 0, 0.8, 7); ctx.fillRect(2.5, 2, 0.8, 5); // (crumpled)
      glint(ctx, -1.5, -11);
      break;
    }
    case 'coffee': {
      // A paper cup of it, lid on, steaming, the green logo (not that one)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let k = 0; k < 2; k++) { const t = (frame + k * 5) % 10; ctx.fillRect(-2 + k * 3 + (t % 4 < 2 ? 0 : 1), -9 - t * 0.6, 1.5, 1.5); }
      const cup = () => { ctx.moveTo(-5, -5); ctx.lineTo(5, -5); ctx.lineTo(4, 7); ctx.lineTo(-4, 7); ctx.closePath(); };
      shaded(ctx, cup, '#F1F5F9', -5, -5, 10, 12);
      ink(ctx, () => ctx.arc(0, 1, 2.5, 0, Math.PI * 2), '#15803D', 0.8);
      ctx.fillStyle = '#DCFCE7'; ctx.fillRect(-0.5, 0, 1, 1);
      box(ctx, -4, 3, 8, 2, '#A16207'); // the sleeve
      shadedTop(ctx, () => ctx.rect(-6, -7, 12, 3), '#FFFFFF', -6, -7, 12, 3);
      break;
    }
    case 'stapler': {
      box(ctx, -8, -1, 16, 4, '#1F2937');
      const top = () => { ctx.moveTo(-8, -1); ctx.lineTo(7, -4); ctx.lineTo(8, -1); ctx.closePath(); };
      shaded(ctx, top, '#DC2626', -8, -4, 16, 3);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-7.5, 2, 15, 1);
      glint(ctx, 5, -3);
      break;
    }
    case 'cleaner':
      // A spray bottle: blue, the trigger, the nozzle
      box(ctx, 2, -4, 2, 3, '#F8FAFC'); // the trigger
      box(ctx, -5, -2, 10, 12, '#2563EB', 2);
      box(ctx, -3, -8, 6, 6, '#F8FAFC');
      box(ctx, 3, -8, 4, 2, '#F8FAFC');
      ink(ctx, () => ctx.rect(-4, 2, 8, 4), '#FACC15', 0.8);
      ctx.fillStyle = '#B45309'; ctx.fillRect(-3, 3.5, 6, 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(-4, -1, 1.5, 3);
      glint(ctx, -4, -1);
      break;
    case 'flask': {
      // A round-bottomed flask, something green and bubbling in it
      const glass = () => { ctx.rect(-2, -9, 4, 7); ctx.moveTo(6, 3); ctx.arc(0, 3, 6, 0, Math.PI * 2); };
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); glass(); ctx.stroke();
      ctx.fillStyle = 'rgba(224, 242, 254, 0.85)'; ctx.beginPath(); glass(); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 3, 5.4, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#84CC16'; ctx.fillRect(-6, 2, 12, 8);
      ctx.fillStyle = '#BEF264'; ctx.fillRect(-6, 2, 12, 1.2);
      ctx.fillStyle = '#4D7C0F'; ctx.fillRect(1, 5, 6, 4); ctx.fillRect(-6, 7, 12, 3);
      ctx.restore();
      ctx.fillStyle = '#ECFCCB'; for (let k = 0; k < 2; k++) { const by = Math.round(3 - ((frame + k * 4) % 8) * 0.5); ctx.fillRect(-2.5 + k * 3, by, 1.5, 1.5); }
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-4.5, -0.5, 1, 3); ctx.fillRect(-1.2, -8, 0.8, 4);
      break;
    }
    case 'horseshoe':
      // A horseshoe, end over end
      inkStroke(ctx, () => ctx.arc(0, 0, 6, Math.PI * 0.15, Math.PI * 1.85), '#78716C', 3.5); // (open to the right)
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 7, Math.PI * 0.95, Math.PI * 1.6); ctx.stroke();
      for (const a of [0.6, 1.2, 1.8, 2.4]) { const hx = Math.cos(a + Math.PI) * 6, hy = Math.sin(a + Math.PI) * 6; ctx.fillStyle = INK; ctx.fillRect(hx - 1.2, hy - 1.2, 2.4, 2.4); ctx.fillStyle = '#E7E5E4'; ctx.fillRect(hx - 0.8, hy - 0.8, 1.6, 1.6); }
      break;
    case 'lunchpail':
      // What the union throws: a lunch pail, a thermos, a hard hat, a donut box, a pipe wrench
      switch ((p.item ?? 0) % 5) {
        case 0:
          inkStroke(ctx, () => ctx.arc(0, -6, 5, Math.PI, 0), '#9CA3AF', 2);
          box(ctx, -9, -5, 18, 11, '#B91C1C', 1);
          shadedTop(ctx, () => ctx.rect(-9, -5, 18, 3), '#7F1D1D', -9, -5, 18, 3);
          box(ctx, -1.5, -3, 3, 2, '#D1D5DB');
          glint(ctx, -8, -1, 1.5);
          break;
        case 1:
          box(ctx, -4, -9, 8, 18, '#15803D', 1);
          box(ctx, -4, -10, 8, 4, '#D1D5DB');
          ink(ctx, () => ctx.rect(-3, -2, 6, 2), '#F8FAFC', 0.6);
          glint(ctx, -3, -5, 1.5);
          break;
        case 2:
          shaded(ctx, () => { ctx.arc(0, 2, 9, Math.PI, 0); ctx.closePath(); }, '#FACC15', -9, -7, 18, 9);
          box(ctx, -11, 1, 22, 3, '#EAB308', 1);
          box(ctx, -1, -7, 2, 8, '#CA8A04');
          glint(ctx, -6, -3, 1.5);
          break;
        case 3:
          box(ctx, -10, -4, 20, 9, '#F8FAFC');
          box(ctx, -10, -4, 20, 2, '#EC4899');
          for (const dx of [-4, 4]) {
            ink(ctx, () => ctx.arc(dx, 1, 3, 0, Math.PI * 2), '#A16207', 0.8);
            ctx.fillStyle = '#F9A8D4'; ctx.beginPath(); ctx.arc(dx - 0.3, 0.7, 2.1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = INK; ctx.fillRect(dx - 0.6, 0.4, 1.2, 1.2);
          }
          break;
        default:
          pipeWrench(ctx, false);
          break;
      }
      break;
    case 'wrench':
      // A big pipe wrench, spinning
      pipeWrench(ctx, true);
      break;
    case 'household':
      drawHouseholdItem(ctx, p.item ?? 0);
      break;
  }
  ctx.restore();
};

/**
 * Enemy shots, by what fired them: a pistol or rifle slug (a hot round with a streak behind it), a cryo rifle's frost
 * bolt, a flare-gun flare; anything else, a crackling red plasma ball with a tail.
 */
export const drawEnemyBullet = (ctx: Ctx, p: Projectile, frame: number) => {
  if (p.shot) { drawGunShot(ctx, p, frame); return; }
  // A plain enemy shot: a hard red ball in a thick dark rim, shaded, a white-hot glint, two stepped rings of glow (no
  // soft bloom), and a short stepped streak of itself behind: red means it's theirs, and it reads on anything
  const { x, y } = centerOf(p);
  const r = Math.max(4, Math.min(7, p.width / 2));
  const pulse = frame % 6 < 3;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angleOf(p));
  streak(ctx, -r * 0.4, r * 2.8, r * 1.5, ['#EF4444', '#DC2626', '#991B1B'], 0.5);
  ctx.rotate(-angleOf(p)); // (the ball's lit from the upper left whichever way it's going)
  steppedGlow(ctx, 0, 0, r + 4, '#EF4444', 0.3, 0.14, 2);
  ctx.fillStyle = '#1A0505'; ctx.beginPath(); ctx.arc(0, 0, r + 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = pulse ? '#EF4444' : '#DC2626'; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, r * 1.05, 0, Math.PI * 2); ctx.rect(r, -r, -r * 2, r * 2); ctx.fill('evenodd');
  ctx.restore();
  ctx.fillStyle = '#FECACA'; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(-r * 0.4), Math.round(-r * 0.45), 2, 2);
  ctx.restore();
};

/**
 * An enemy round, the shape every gun of theirs shares: a short pill in a thick dark outline (it reads against sky,
 * sand, fire or night), its color in steps (a lit top, a dark belly), a white-hot tip, and a short stepped streak
 * behind in the same color. Nothing like Meathead's own: his are yellow-white with a long glowing tracer.
 */
const enemyRound = (ctx: Ctx, len: number, h: number, trail: number, body: string, streakCol: string, tip: string) => {
  const s = trail - len * 0.3;
  ctx.fillStyle = streakCol;
  for (let k = 0; k < 3; k++) { const hh = h * 0.7 * (1 - k * 0.28); ctx.fillRect(-len * 0.3 - (s / 3) * (k + 1), -hh / 2, s / 3 + 0.5, hh); }
  ctx.fillStyle = '#140404'; ctx.beginPath(); ctx.ellipse(0, 0, len / 2 + 1.5, h / 2 + 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, len / 2, h / 2, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = body; ctx.fillRect(-len / 2, -h / 2, len, h);
  ctx.fillStyle = dark(body, 0.35); ctx.fillRect(-len / 2, h * 0.12, len, h / 2);
  ctx.fillStyle = lite(body, 0.35); ctx.fillRect(-len / 2, -h / 2, len * 0.75, h * 0.25);
  ctx.restore();
  ctx.fillStyle = tip; ctx.beginPath(); ctx.ellipse(len * 0.18, 0, len * 0.22, h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
};

/** The goons' guns, by the look of what they fire. */
const drawGunShot = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  if (p.shot === 'tracer') {
    // A gangbanger's round: red, a little longer than most, flickering at the tip
    enemyRound(ctx, 14, 6, 28, '#E11D48', 'rgba(244, 63, 94, 0.45)', frame % 4 < 2 ? '#FFFFFF' : '#FECDD3');
  } else if (p.shot === 'slug') {
    // A rifle or pistol round: hot orange-red (theirs: never the yellow of his)
    enemyRound(ctx, 12, 5, 22, '#EA580C', 'rgba(249, 115, 22, 0.45)', '#FFEDD5');
  } else if (p.shot === 'cryo') {
    // A frost bolt: a cut crystal lance in a stepped haze of cold, flakes coming off it
    ctx.fillStyle = 'rgba(125, 211, 252, 0.18)'; ctx.beginPath(); ctx.ellipse(-6, 0, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(125, 211, 252, 0.28)'; ctx.beginPath(); ctx.ellipse(-3, 0, 10, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    const lance = () => { ctx.moveTo(8, 0); ctx.lineTo(1, -4); ctx.lineTo(-7, -2.5); ctx.lineTo(-7, 2.5); ctx.lineTo(1, 4); ctx.closePath(); };
    ctx.beginPath(); lance(); ctx.fillStyle = '#7DD3FC'; ctx.fill();
    ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(1, -4); ctx.lineTo(-7, -2.5); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#38BDF8'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(1, 4); ctx.lineTo(-7, 2.5); ctx.lineTo(-7, 1.2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); lance(); ctx.strokeStyle = '#0C4A6E'; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
    glint(ctx, 2, -2, 2);
    ctx.fillStyle = '#FFFFFF';
    for (let k = 0; k < 3; k++) { // (flakes: little pixel crosses)
      const t = ((frame + k * 5) % 15) / 15, fx = Math.round(-4 - t * 16), fy = Math.round((k - 1) * 4 + Math.sin(frame * 0.3 + k) * 2);
      ctx.fillRect(fx - 1, fy, 3, 1); ctx.fillRect(fx, fy - 1, 1, 3);
    }
  } else if (p.shot === 'spray') {
    // A cloud of bug spray: chunky puffs of yellow-green mist, spreading as it goes
    const age = Math.min(1, ((frame * 7 + seedOf(p.id)) % 60) / 60);
    const tones = ['rgba(217, 249, 157, 0.42)', 'rgba(190, 242, 100, 0.34)', 'rgba(163, 230, 53, 0.26)', 'rgba(132, 204, 22, 0.18)'];
    for (let k = 3; k >= 0; k--) { const rr = 5 + k * 2 + age * 2; pixelBlob(ctx, -k * 5, Math.sin(frame * 0.4 + k) * 2, rr, rr * 0.85, tones[k], 2); }
    pixelBlob(ctx, 1, 0, 3.5, 3, 'rgba(247, 254, 231, 0.7)', 1);
  } else if (p.shot === 'zap') {
    // A ray gun's zap: a crackling green bolt in stepped bands, a hot head on it
    ctx.fillStyle = 'rgba(77, 124, 15, 0.45)'; ctx.fillRect(-16, -3.5, 20, 7);
    ctx.fillStyle = 'rgba(163, 230, 53, 0.6)'; ctx.fillRect(-18, -2.5, 22, 5);
    const bolt = () => { ctx.moveTo(-18, 0); for (let k = 1; k <= 5; k++) ctx.lineTo(-18 + k * 4.4, (((frame + k * 3) % 5) - 2) * 1.6); };
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = '#D9F99D'; ctx.lineWidth = 2.5; ctx.beginPath(); bolt(); ctx.stroke();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.beginPath(); bolt(); ctx.stroke();
    steppedGlow(ctx, 4, 0, 7, '#A3E635', 0.5, 0.15, 3);
    ctx.fillStyle = '#365314'; ctx.beginPath(); ctx.arc(4, 0, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D9F99D'; ctx.beginPath(); ctx.arc(4, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F7FEE7'; ctx.beginPath(); ctx.arc(4.5, -0.5, 1.8, 0, Math.PI * 2); ctx.fill();
  } else {
    // A flare: a blinding red-orange ball throwing sparks and a trail of chunky smoke
    const flick = 0.8 + Math.sin(frame * 0.9) * 0.2;
    for (let k = 3; k >= 1; k--) pixelBlob(ctx, -k * 7, (k % 2 ? -1 : 1) * 1.5, 3 + k, 3 + k, `rgba(120, 113, 108, ${0.45 - k * 0.08})`, 2);
    steppedGlow(ctx, 0, 0, 11, '#EF4444', 0.4 * flick, 0.1, 3);
    drawFireball(ctx, 0, 0, 6 * flick, frame, { seed: 2, vx: 1, vy: 0, tail: 1.2, heat: 1 });
    ctx.fillStyle = '#FDE047'; for (let k = 0; k < 3; k++) { const a = frame * 0.7 + k * 2.1; ctx.fillRect(Math.cos(a) * 8 - 4, Math.sin(a) * 6, 1.5, 1.5); }
  }
  ctx.restore();
};

/** Meathead's shotgun pellets: little spinning ice crystals with a frosty wake. */
export const drawIcePellet = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const r = Math.max(4, p.width / 2);
  ctx.save();
  ctx.translate(x, y);
  // (the wake: three little diamonds of frost, smaller and fainter going back)
  const back = angleOf(p) + Math.PI;
  for (let k = 1; k <= 3; k++) {
    const d = r * (1 - k * 0.22), wx = Math.cos(back) * k * 5, wy = Math.sin(back) * k * 5;
    ctx.fillStyle = `rgba(200, 245, 255, ${0.5 - k * 0.12})`;
    ctx.beginPath(); ctx.moveTo(wx, wy - d); ctx.lineTo(wx + d, wy); ctx.lineTo(wx, wy + d); ctx.lineTo(wx - d, wy); ctx.closePath(); ctx.fill();
  }
  steppedGlow(ctx, 0, 0, r * 1.9, '#80DEEA', 0.35, 0.1, 3);
  const spin = frame * 0.35 + seedOf(p.id);
  ctx.rotate(spin);
  const star = () => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2, rr = i % 2 === 0 ? r * 1.2 : r * 0.6;
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  star();
  ctx.fillStyle = '#81D4FA';
  ctx.fill();
  // (lit on its upper-left half however it's turned: clipped to the crystal, filled in the unturned frame)
  ctx.save(); star(); ctx.clip(); ctx.rotate(-spin);
  ctx.fillStyle = '#E0F7FA'; ctx.beginPath(); ctx.moveTo(-r * 2, r * 1.2); ctx.lineTo(r * 1.2, -r * 2); ctx.lineTo(-r * 2, -r * 2); ctx.closePath(); ctx.fill();
  ctx.restore();
  star();
  ctx.strokeStyle = '#0277BD';
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.rotate(-spin);
  glint(ctx, -1.5, -1.5, 2);
  ctx.restore();
};

/** Needle gun darts: a flying syringe, needle first. */
export const drawDart = (ctx: Ctx, p: Projectile) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  inkStroke(ctx, () => { ctx.moveTo(4, 0); ctx.lineTo(14, 0); }, '#E5E7EB', 1.2);         // needle
  box(ctx, -14, -1, 5, 2, '#9CA3AF');                                                       // plunger
  ink(ctx, () => ctx.rect(-9, -3, 13, 6), 'rgba(255, 255, 255, 0.55)', 1);                 // barrel
  ctx.fillStyle = '#FF2BD6'; ctx.fillRect(-8, -2, 10, 4);                                   // the good stuff
  ctx.fillStyle = '#B5179A'; ctx.fillRect(-8, 1, 10, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(-8, -2.5, 10, 1);
  ctx.fillStyle = 'rgba(26, 11, 6, 0.6)'; for (let k = 0; k < 3; k++) ctx.fillRect(-6 + k * 3, 1, 0.6, 2); // (the marks)
  box(ctx, -10, -5, 1.5, 10, '#E5E7EB');                                                    // flange
  box(ctx, -16, -4, 2, 8, '#EF4444');                                                       // thumb press
  glint(ctx, -7, -2.5);
  ctx.restore();
};

/**
 * Hector's soggy log of shit: a lumpy, glistening turd tumbling end over end,
 * dripping, with corn, stink lines and a couple of flies along for the ride.
 */
export const drawPoopLog = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const seed = seedOf(p.id);
  const hw = p.width / 2, hh = p.height / 2;
  const back = -Math.sign(p.vel.x || 1);
  ctx.save();

  // Stink lines trailing behind (these don't tumble)
  ctx.strokeStyle = 'rgba(150, 190, 60, 0.55)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const sx = x + back * (hw + 6 + k * 9), sy = y - 8 + k * 8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + back * 6, sy - 6 + Math.sin(frame * 0.3 + k) * 3, sx + back * 10, sy + 6, sx + back * 16, sy);
    ctx.stroke();
  }

  // Brown drips flung off it, inked, a wet glint on each
  for (let k = 0; k < 3; k++) {
    const t = ((frame * 1.5 + k * 13 + seed) % 30) / 30;
    const dx = x + back * (hw * 0.5 + t * 26), dy = y + hh + t * t * 30;
    ink(ctx, () => ctx.ellipse(dx, dy, 2, 3, 0, 0, Math.PI * 2), '#4E342E', 0.8);
    ctx.fillStyle = '#A1795F'; ctx.fillRect(dx - 1, dy - 2, 1, 1);
  }

  ctx.translate(x, y);
  ctx.rotate(frame * 0.2 + seed);

  // A lumpy log: fat in the middle, tapering to a point at one end
  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(-hw * 1.1, hh * 0.15);                                   // pointy tail
    ctx.quadraticCurveTo(-hw * 0.95, -hh * 0.6, -hw * 0.55, -hh * 0.75);
    ctx.quadraticCurveTo(-hw * 0.35, -hh * 1.05, -hw * 0.1, -hh * 0.8);  // lump
    ctx.quadraticCurveTo(hw * 0.15, -hh * 1.15, hw * 0.45, -hh * 0.85); // lump
    ctx.quadraticCurveTo(hw * 1.05, -hh * 0.8, hw * 1.0, hh * 0.05);    // blunt end
    ctx.quadraticCurveTo(hw * 0.95, hh * 0.95, hw * 0.4, hh * 0.9);
    ctx.quadraticCurveTo(hw * 0.1, hh * 1.1, -hw * 0.2, hh * 0.85);
    ctx.quadraticCurveTo(-hw * 0.7, hh * 0.95, -hw * 1.1, hh * 0.15);
    ctx.closePath();
  };
  // (in three flat bands, light on top to dark underneath, each seam dithered a row)
  ctx.save(); outline(); ctx.clip();
  const x0 = -hw * 1.2, w = hw * 2.4;
  ctx.fillStyle = '#7B5438'; ctx.fillRect(x0, -hh * 1.2, w, hh * 2.4);
  ctx.fillStyle = '#A1795F'; ctx.fillRect(x0, -hh * 1.2, w, hh * 0.75);
  ctx.fillStyle = '#4A2F1E'; ctx.fillRect(x0, hh * 0.3, w, hh);
  for (let cx = x0; cx < hw * 1.2; cx += 2) {
    ctx.fillStyle = '#A1795F'; ctx.fillRect(cx, -hh * 0.45, 1, 1);
    ctx.fillStyle = '#4A2F1E'; ctx.fillRect(cx + 1, hh * 0.3 - 1, 1, 1);
  }
  ctx.restore();
  outline();
  ctx.strokeStyle = '#2B1A10';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Creases between the lumps
  ctx.strokeStyle = 'rgba(43, 26, 16, 0.75)';
  ctx.lineWidth = 1.5;
  for (const cx of [-hw * 0.3, hw * 0.2]) {
    ctx.beginPath();
    ctx.moveTo(cx - 2, -hh * 0.85);
    ctx.quadraticCurveTo(cx + 3, 0, cx - 1, hh * 0.85);
    ctx.stroke();
  }
  // Glistening wet sheen, and a hard white glint in each
  ctx.fillStyle = 'rgba(255, 236, 210, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-hw * 0.5, -hh * 0.45, hw * 0.22, hh * 0.14, -0.2, 0, Math.PI * 2);
  ctx.ellipse(hw * 0.05, -hh * 0.55, hw * 0.2, hh * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(hw * 0.6, -hh * 0.4, hw * 0.12, hh * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  glint(ctx, -hw * 0.55, -hh * 0.55, 1.5); glint(ctx, 0, -hh * 0.62, 1.5);
  // A couple of undigested corn kernels
  ctx.fillStyle = '#FFD54F';
  ctx.strokeStyle = '#B7860B';
  ctx.lineWidth = 0.8;
  for (const [cx, cy] of [[-hw * 0.15, hh * 0.35], [hw * 0.6, hh * 0.3]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 2.2, 1.6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // Flies buzzing around it
  for (let k = 0; k < 2; k++) {
    const a = frame * (0.35 + k * 0.1) + k * 3 + seed;
    const fx = x + Math.cos(a) * (hw + 8), fy = y + Math.sin(a * 1.3) * (hh + 10);
    ctx.fillStyle = 'rgba(220, 230, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(fx - 2, fy - 3, 2.5, 1.5, -0.6 + (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.ellipse(fx + 2, fy - 3, 2.5, 1.5, 0.6 - (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(fx + 0.5, fy - 1, 1, 1);
  }
};

/** Dale's cocaine: a tumbling knotted baggie leaving a puff of powder. */
export const drawCocaine = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const r = p.width / 2;
  ctx.save();
  // Powder puff trail: chunky, thinning out behind
  for (let k = 3; k >= 1; k--) {
    const pr = r * (0.5 + k * 0.15);
    pixelBlob(ctx, x - p.vel.x * k * 1.2, y - p.vel.y * k * 1.2, pr, pr, `rgba(255, 255, 255, ${0.3 - k * 0.07})`, 2);
  }
  // Fresh out of his hand: a thicker stream of powder off it, and sparkles twinkling along it, dying away
  const age = p.bornAt === undefined ? 99 : frame - p.bornAt;
  if (age >= 0 && age < 10) {
    const fresh = 1 - age / 10, seed = seedOf(p.id);
    for (let k = 1; k <= 5; k++) {
      const pr = r * 0.32 * (1 + k * 0.12);
      pixelBlob(ctx, x - p.vel.x * k * 0.3 + ((k * 5 + seed) % 5 - 2), y - p.vel.y * k * 0.3 + ((k * 3 + seed) % 5 - 2), pr, pr,
        `rgba(255, 255, 255, ${(0.55 * fresh * (1 - k / 6)).toFixed(2)})`, 2);
    }
    for (let i = 0; i < 4; i++) {
      const k = 0.3 + i * 0.3, side = (i % 2 ? 1 : -1) * (6 + ((seed + i * 7) % 5));
      const sx = Math.round(x - p.vel.x * k - Math.sign(p.vel.y || 1) * side * 0.5), sy = Math.round(y - p.vel.y * k + side);
      const arm = (age + i + seed) % 3 === 0 ? 3 : 2;
      ctx.globalAlpha = fresh;
      ctx.fillStyle = '#BAE6FD'; ctx.fillRect(sx - arm, sy, arm * 2 + 1, 1); ctx.fillRect(sx, sy - arm, 1, arm * 2 + 1);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3);
      ctx.globalAlpha = 1;
    }
  }
  drawCocaineBag(ctx, x, y, r, frame * 0.12 + seedOf(p.id));
  ctx.restore();
};

/** One knotted baggie of powder centred on (x, y). */
export const drawCocaineBag = (ctx: Ctx, x: number, y: number, r: number, angle: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const bag = () => {
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r);
    ctx.quadraticCurveTo(-r * 1.1, -r * 0.2, -r * 0.8, r * 0.8);
    ctx.quadraticCurveTo(0, r * 1.15, r * 0.8, r * 0.8);
    ctx.quadraticCurveTo(r * 1.1, -r * 0.2, r * 0.2, -r);
    ctx.closePath();
  };
  // Knot and twist
  const knot = () => { ctx.moveTo(-r * 0.2, -r); ctx.lineTo(-r * 0.5, -r * 1.4); ctx.lineTo(r * 0.5, -r * 1.4); ctx.lineTo(r * 0.2, -r); ctx.closePath(); };
  shaded(ctx, knot, '#CFD8DC', -r * 0.5, -r * 1.4, r, r * 0.4);
  // Bag: clear plastic, a cool shadow down the right, the powder showing through
  ctx.save(); bag(); ctx.clip();
  ctx.fillStyle = '#F1F5F9'; ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.65, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(-r * 0.7, r * 0.55, r * 1.4, r * 0.3);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(r * 0.45, -r * 1.2, r, r * 2.4); ctx.fillRect(-r * 1.2, r * 0.75, r * 2.4, r);
  ctx.restore();
  bag();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // A crease, the plastic's sheen, a glint
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.3); ctx.lineTo(r * 0.1, r * 0.1); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-r * 0.6, -r * 0.4, Math.max(1, r * 0.12), r * 0.6);
  glint(ctx, -r * 0.3, -r * 0.75, Math.max(1, r * 0.14));
  ctx.restore();
};

/** Dale's meth barrel: a banded steel drum with a hazard label, leaking blue crystal. */
export const drawMethBarrel = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  // (its spin starts with a wobble: rocking off true the first few frames out of his hands, settling into the roll)
  const age = p.bornAt === undefined ? 99 : frame - p.bornAt;
  const wobble = age >= 0 && age < 14 ? Math.sin(age * 1.7) * 0.28 * (1 - age / 14) : 0;
  drawMethDrum(ctx, x, y, p.width, p.height, (p.rotation || 0) + wobble, frame);
};

/** One METH drum centred on (x, y). */
export const drawMethDrum = (ctx: Ctx, x: number, y: number, width: number, height: number, rotation: number, frame: number) => {
  const hw = width / 2, hh = height / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const drum = () => {
    ctx.beginPath();
    ctx.moveTo(-hw, -hh + 4); ctx.quadraticCurveTo(0, -hh - 3, hw, -hh + 4);
    ctx.lineTo(hw, hh - 4); ctx.quadraticCurveTo(0, hh + 3, -hw, hh - 4);
    ctx.closePath();
  };
  // Drum, rounded in flat vertical bands: dark edges, a sheen left of middle
  ctx.save(); drum(); ctx.clip();
  const bands: [number, string][] = [[0, '#0B0B0B'], [0.12, '#1E1E1E'], [0.24, '#333333'], [0.34, '#4A4A4A'], [0.44, '#2E2E2E'], [0.62, '#1E1E1E'], [0.82, '#101010']];
  bands.forEach(([u, c], i) => { ctx.fillStyle = c; ctx.fillRect(-hw + u * width, -hh - 4, ((bands[i + 1]?.[0] ?? 1) - u) * width + 0.5, height + 8); });
  ctx.fillStyle = '#6B6B6B'; ctx.fillRect(-hw + 0.36 * width, -hh - 4, 1, height + 8);
  ctx.restore();
  drum();
  ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.5; ctx.stroke();
  // Rolling hoops, each with a lit edge
  for (const by of [-hh * 0.45, hh * 0.45]) {
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-hw, by); ctx.quadraticCurveTo(0, by + 3, hw, by); ctx.stroke();
    ctx.strokeStyle = '#555555'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-hw, by); ctx.quadraticCurveTo(0, by + 3, hw, by); ctx.stroke();
    ctx.strokeStyle = '#8A8A8A'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-hw * 0.7, by - 0.6); ctx.quadraticCurveTo(-hw * 0.3, by + 0.6, 0, by + 0.9); ctx.stroke();
  }
  // Yellow label with the hazard mark, shaded like the drum under it
  const lx = -hw + 4, ly = -hh * 0.3, lw = width - 8, lh = hh * 0.6;
  ctx.fillStyle = '#FFD600'; ctx.fillRect(lx, ly, lw, lh);
  ctx.fillStyle = '#FFEB66'; ctx.fillRect(lx, ly, lw * 0.3, lh);
  ctx.fillStyle = '#C9A800'; ctx.fillRect(lx + lw * 0.75, ly, lw * 0.25, lh);
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 7px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('METH', 0, 3);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1;
  ctx.strokeRect(lx, ly, lw, lh);
  // Lid rim
  ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(0, -hh + 3, hw + 0.8, 3.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B6B6B'; ctx.beginPath(); ctx.ellipse(0, -hh + 3, hw, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3A3A3A'; ctx.beginPath(); ctx.ellipse(0, -hh + 3.4, hw - 2.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A3A3A3'; ctx.fillRect(-hw * 0.6, -hh + 0.6, hw * 0.5, 1);
  // A crack leaking blue crystal: inked shards, a glint in each
  const blue = frame % 10 < 5 ? '#4FC3F7' : '#81D4FA';
  for (let k = 0; k < 3; k++) {
    const sx = hw * 0.4 + k * 3, sy = hh * 0.55;
    ink(ctx, () => { ctx.moveTo(sx, sy); ctx.lineTo(sx + 2, sy + 4 + k * 2); ctx.lineTo(sx - 2, sy + 3); ctx.closePath(); }, blue, 0.6);
    glint(ctx, sx - 0.5, sy + 1);
  }
  ctx.restore();
};

/** Flying sludge/vomit: a wobbling goo blob with a stringy tail. */
export const drawSludgeBlob = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const r = Math.max(6, Math.min(p.width, p.height) / 2);
  const toxic = p.owner === 'enemy'; // Tommy's puke is lurid; Meathead's barf is murkier
  const base = toxic ? '#7CB342' : '#2E7D32';
  const light = toxic ? '#C6FF00' : '#66BB6A';
  const a = angleOf(p), seed = seedOf(p.id);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  const tail = () => { ctx.moveTo(-r * 0.2, -r * 0.5); ctx.quadraticCurveTo(-r * 2.2, 0, -r * 0.2, r * 0.5); ctx.closePath(); };
  const blob = () => {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const rr = r * (0.85 + 0.15 * Math.sin(frame * 0.5 + i * 1.7 + seed));
      if (i === 0) ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
      else ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    ctx.closePath();
  };
  // (one ink line round tail and blob together: both stroked fat, then both filled over)
  ctx.lineJoin = 'round';
  ctx.strokeStyle = dark(base, 0.6); ctx.lineWidth = 2;
  ctx.beginPath(); tail(); blob(); ctx.stroke();
  ctx.fillStyle = base;
  ctx.beginPath(); tail(); blob(); ctx.fill();
  // (shaded in steps, lit from the upper left whichever way it's flying)
  ctx.save(); ctx.beginPath(); blob(); ctx.clip(); ctx.rotate(-a);
  ctx.fillStyle = dark(base, 0.3); ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 1.15, 0, Math.PI * 2); ctx.rect(r * 2, -r * 2, -r * 4, r * 4); ctx.fill('evenodd');
  ctx.fillStyle = lite(base, 0.2); ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Chunks, bubbles and a slimy shine
  ctx.fillStyle = toxic ? '#FFEB3B' : '#8D6E63';
  ctx.beginPath();
  ctx.arc(r * 0.25, r * 0.2, r * 0.18, 0, Math.PI * 2);
  ctx.arc(-r * 0.3, -r * 0.25, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.35, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(-a);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(-r * 0.55, -r * 0.55, r * 0.45, Math.max(1, r * 0.14));
  glint(ctx, -r * 0.5, -r * 0.4, Math.max(1, r * 0.16));
  ctx.restore();
};

/** Barry's dark orb: a hole in the light, purple stepping down to nothing round it, specks of it orbiting. */
export const drawDarkOrb = (ctx: Ctx, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const pulse = 0.8 + Math.sin(frame * 0.15) * 0.2;
  const R = (p.width / 2) * pulse;
  ctx.save();
  ctx.translate(x, y);
  const rings: [number, string][] = [[1.5, 'rgba(46, 26, 71, 0.45)'], [1.22, 'rgba(76, 29, 149, 0.6)'], [0.98, 'rgba(126, 34, 206, 0.75)'], [0.76, 'rgba(189, 0, 255, 0.9)']];
  for (const [k, c] of rings) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, R * k, 0, Math.PI * 2); ctx.fill(); }
  // Core: the void, a thin lit rim round it
  ctx.fillStyle = '#E9D5FF'; ctx.beginPath(); ctx.arc(0, 0, p.width / 4 + 1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(0, 0, p.width / 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2E1A47'; ctx.beginPath(); ctx.arc(-p.width / 16, -p.width / 16, p.width / 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F5D0FE';
  for (let k = 0; k < 3; k++) { const ang = frame * 0.1 + k * 2.09; ctx.fillRect(Math.round(Math.cos(ang) * R * 1.1) - 1, Math.round(Math.sin(ang) * R * 1.1) - 1, 2, 2); }
  ctx.restore();
};

/** Oscar's oil rocket: a black body, a red nose, fins, oil slopping off it, a stepped flame out the back. */
export const drawOilRocket = (ctx: Ctx, p: Projectile, frame: number) => {
  ctx.save();
  ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
  if (p.vel.x < 0) ctx.scale(-1, 1);
  ctx.rotate(Math.atan2(p.vel.y, Math.abs(p.vel.x))); // nose follows the steering
  // Exhaust: flat bands out of the back, red outside to a white-hot throat, each shivering on its own
  [[0, 14, 6], [1, 11, 5], [3, 8, 3.5], [4, 5, 2], [5, 3, 1]].forEach(([c, len, hw], i) => {
    const l = len + Math.sin(frame * (0.9 + i * 0.37) + i) * 2.5;
    ctx.fillStyle = FIRE_RAMP[c];
    for (let s = 0; s < l; s += 2) { const h = Math.max(0.5, hw * (1 - s / l)); ctx.fillRect(-22 - s, -h, 2, h * 2); }
  });
  // Fins
  box(ctx, -20, -12, 6, 4, '#757575');
  box(ctx, -20, 8, 6, 4, '#757575');
  // Body: dark steel in steps, a red band, rivets
  shadedTop(ctx, () => ctx.rect(-20, -8, 30, 16), '#2A2A2A', -20, -8, 30, 16);
  ctx.fillStyle = '#6B6B6B'; ctx.fillRect(-18, -6, 24, 1);
  box(ctx, 0, -8, 3, 16, '#B71C1C');
  ctx.fillStyle = '#8A8A8A'; for (const rx of [-16, -8]) { ctx.fillRect(rx, -6, 1, 1); ctx.fillRect(rx, 5, 1, 1); }
  // Nose Cone
  shaded(ctx, () => { ctx.moveTo(10, -8); ctx.lineTo(25, 0); ctx.lineTo(10, 8); ctx.closePath(); }, '#D32F2F', 10, -8, 15, 16);
  ctx.fillStyle = '#FFCDD2'; ctx.fillRect(12, -5, 3, 1);
  // Oil coating, wet: an inked glob or two, a shine on each
  ink(ctx, () => { ctx.arc(-5, 8, 4, 0, Math.PI * 2); ctx.moveTo(8, -8); ctx.arc(5, -8, 3, 0, Math.PI * 2); }, '#050505', 0.8);
  ctx.fillStyle = '#5A5A5A'; ctx.fillRect(-7, 6, 1.5, 1); ctx.fillRect(4, -10, 1.5, 1);
  glint(ctx, -6, 6);
  ctx.restore();
};

/**
 * Whatever a tenant had to hand: a pot, a toaster, a shoe, a potted plant, a phone; up the swanky building (5 on), the
 * good stuff: a bottle of champagne, an espresso machine, a designer handbag, a gold statuette, a laptop. Centred on
 * (0, 0). (In his hand before he throws it, and in the air after.)
 */
export const drawHouseholdItem = (ctx: Ctx, item: number) => {
  if (item >= 5) {
    switch (item % 5) {
      case 0: // champagne
        box(ctx, 5, -2, 5, 4, '#14532D');
        box(ctx, -9, -3, 14, 7, '#14532D', 2);
        box(ctx, 8, -2, 3, 4, '#FACC15');
        box(ctx, -5, -2, 6, 5, '#F5F5F4');
        ctx.fillStyle = '#B45309'; ctx.fillRect(-4, 0, 4, 1);
        glint(ctx, -8, -2, 1.5);
        break;
      case 1: // espresso machine
        box(ctx, -8, -7, 16, 13, '#A1A1AA');
        box(ctx, -6, -2, 12, 3, '#27272A');
        box(ctx, -7, -7, 14, 2, '#E4E4E7');
        ctx.fillStyle = '#DC2626'; ctx.fillRect(4, -5, 2, 2); glint(ctx, 4, -5);
        glint(ctx, -7, -4, 1.5);
        break;
      case 2: // handbag
        inkStroke(ctx, () => ctx.arc(0, -3, 5, Math.PI, 0), '#FACC15', 1.5);
        box(ctx, -8, -3, 16, 9, '#7C2D12', 2);
        box(ctx, -2, 0, 4, 2, '#FACC15');
        glint(ctx, -7, -2, 1.5);
        break;
      case 3: // gold statuette
        box(ctx, -4, 2, 8, 5, '#CA8A04');
        box(ctx, -2, -4, 4, 7, '#EAB308');
        ball(ctx, 0, -6, 3, '#EAB308');
        ctx.fillStyle = '#FEF08A'; ctx.fillRect(-1, -5, 1, 6);
        glint(ctx, -1.5, -8);
        break;
      default: // laptop
        box(ctx, -8, -8, 16, 10, '#A1A1AA');
        ink(ctx, () => ctx.rect(-6, -6, 12, 7), '#60A5FA', 0.8);
        ctx.fillStyle = '#93C5FD'; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-2, -6); ctx.lineTo(1, -6); ctx.lineTo(-6, 1); ctx.closePath(); ctx.fill();
        box(ctx, -9, 1, 18, 3, '#D4D4D8');
        break;
    }
    return;
  }
  switch (item % 5) {
    case 0: // pot
      box(ctx, 5, -3, 6, 2, '#4B5563');
      box(ctx, -7, -4, 12, 9, '#6B7280', 1);
      box(ctx, -7, -5, 12, 2, '#9CA3AF');
      glint(ctx, -6, -2, 1.5);
      break;
    case 1: // toaster
      box(ctx, 8, -1, 2, 3, '#111827');
      box(ctx, -8, -5, 16, 11, '#D1D5DB', 3);
      ctx.fillStyle = INK; ctx.fillRect(-5, -6, 3, 3); ctx.fillRect(1, -6, 3, 3);
      ctx.fillStyle = '#374151'; ctx.fillRect(-4.5, -5.5, 2, 2); ctx.fillRect(1.5, -5.5, 2, 2);
      glint(ctx, -6, -3, 1.5); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-6, -1, 1, 4);
      break;
    case 2: { // shoe
      const shoe = () => { ctx.moveTo(-8, 3); ctx.lineTo(-8, -5); ctx.lineTo(-3, -5); ctx.lineTo(-2, 0); ctx.lineTo(8, 1); ctx.lineTo(8, 4); ctx.closePath(); };
      shaded(ctx, shoe, '#7C2D12', -8, -5, 16, 9);
      box(ctx, -8, 4, 16, 2, '#1C1917');
      ctx.fillStyle = '#F5F5F4'; for (let k = 0; k < 3; k++) ctx.fillRect(-1 + k * 2.2, -0.2 + k * 0.2, 1.4, 0.8); // (laces)
      glint(ctx, -7, -4);
      break;
    }
    case 3: // potted plant
      for (const a of [-1, 0, 1]) {
        ink(ctx, () => ctx.ellipse(a * 4, -4, 2.5, 5, a * 0.5, 0, Math.PI * 2), '#15803D', 0.8);
        ctx.fillStyle = '#4ADE80'; ctx.fillRect(a * 4 - 0.5 - a, -7, 1, 4);
      }
      shaded(ctx, () => { ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); }, '#C2410C', -6, 0, 12, 8);
      box(ctx, -6.5, -0.5, 13, 2, '#EA580C');
      break;
    default: // phone
      box(ctx, -7, -4, 14, 9, '#F5F5F4', 1);
      box(ctx, -8, -7, 16, 3, '#1C1917', 1.5);
      for (let k = 0; k < 3; k++) { ctx.fillStyle = INK; ctx.fillRect(-4 + k * 3, -1, 2, 2); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(-4 + k * 3, -1, 1.4, 1.4); }
      glint(ctx, -7, -6.5);
      break;
  }
};
