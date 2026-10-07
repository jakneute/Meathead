// The shaft Tommy's fight goes up: endless, so everything in it is laid out in repeating rows that go by with the
// climb (state.tommyScrollY). Slimy brick, darkest up where it's going, lit green from the sludge underneath; the
// sewer's outfalls in the back wall pouring muck down it; the maintenance ladder; the pipes up the full height of it,
// weeping; things scratched into the brick by whoever's been down here (and what Tommy calls the neighbors).

import { brickPattern } from '../../pixelArt';
import { Ctx, hash, box, bevel, label } from './kit';

/** Every period in here divides the scroll's wrap (96000), so nothing jumps when it wraps. */
const ROW = 400;

export const drawTommyShaftBack = (
  ctx: Ctx, L: number, R: number, y0: number, y1: number, view: { y: number; h: number }, scroll: number, f: number,
) => {
  const W = R - L;
  // The brick, going by
  const pat = brickPattern(ctx, 'tommy-shaft', 30, 10, ['#1C3022', '#18291D'], '#0A1610');
  ctx.save();
  ctx.translate(0, ((scroll % 20) + 20) % 20);
  ctx.fillStyle = pat; ctx.fillRect(L, y0 - 20, W, y1 - y0 + 40);
  ctx.restore();
  // Darker going up the view, lit green from the sludge going down it (in bands, by where the view is)
  const bands = 8;
  for (let k = 0; k < bands; k++) {
    const y = view.y + (view.h * k) / bands;
    box(ctx, L, y, W, view.h / bands + 1, `rgba(4, 10, 6, ${(0.5 - k * 0.06).toFixed(2)})`);
  }
  for (let k = 0; k < 4; k++) box(ctx, L, view.y + view.h - 40 - k * 30, W, 30, `rgba(101, 163, 13, ${(0.10 - k * 0.022).toFixed(3)})`);

  // Rows of things, going by with the climb
  const first = Math.floor((y0 - scroll) / ROW) - 1, last = Math.ceil((y1 - scroll) / ROW) + 1;
  for (let i = first; i <= last; i++) {
    const ry = i * ROW + scroll;
    const h = (n: number) => hash(i * 13 + n);
    // grime run down the brick from each row
    for (let k = 0; k < 3; k++) {
      const gx = L + 30 + h(k) * (W - 60);
      box(ctx, gx, ry, 8 + h(k + 3) * 10, 80 + h(k + 6) * 120, 'rgba(6, 14, 8, 0.35)');
    }
    // an outfall in the back wall, muck pouring out of it and down
    if (h(10) > 0.35) {
      const ox = L + 120 + h(11) * (W - 240), oy = ry + 60;
      ctx.fillStyle = '#2E4434'; ctx.beginPath(); ctx.arc(ox, oy, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3E5A44'; ctx.beginPath(); ctx.arc(ox - 2, oy - 2, 22, Math.PI, Math.PI * 1.6); ctx.fill();
      ctx.fillStyle = '#050A06'; ctx.beginPath(); ctx.arc(ox, oy + 2, 17, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < 5; k++) box(ctx, ox - 15 + k * 7, oy - 14, 2, 30, '#1A2A1E');
      // the pour: a column of it falling all the way down into the sludge, frothing where it leaves the pipe
      const ph = Math.max(0, y1 - (oy + 12));
      box(ctx, ox - 8, oy + 12, 16, ph, '#4D7C0F'); box(ctx, ox - 5, oy + 12, 6, ph, '#65A30D');
      for (let y = 0; y < ph; y += 10) box(ctx, ox - 8 + ((y + f * 3) % 7), oy + 12 + ((y + f * 4) % ph), 4, 6, '#84CC16');
      box(ctx, ox - 12, oy + 10, 24, 4, '#A3E635');
    }
    // something scratched into the brick
    if (h(20) > 0.6) {
      const tx = L + 60 + h(21) * (W - 200), ty = ry + 200;
      const words = ['TOMMY WAS HERE', 'THE NEIGHBORS', 'DO NOT DRINK', 'HELP', 'IT TASTES FINE'];
      label(ctx, words[Math.floor(h(22) * words.length)], tx, ty, 'rgba(163, 230, 53, 0.45)', 7, 'left');
    }
    // a biohazard plate bolted on
    if (h(30) > 0.75) {
      const bx = L + 50 + h(31) * (W - 100), by = ry + 140;
      bevel(ctx, bx - 14, by - 14, 28, 28, '#FACC15', '#FEF08A', '#A16207', 2);
      ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 - Math.PI / 2; ctx.beginPath(); ctx.arc(bx + Math.cos(a) * 5, by + Math.sin(a) * 5, 5, 0, Math.PI * 2); ctx.stroke(); }
      box(ctx, bx - 2, by - 2, 4, 4, '#1C1917');
    }
  }

  // The maintenance ladder up the middle of it
  const lx = L + W / 2 - 14;
  box(ctx, lx, y0, 4, y1 - y0, '#3F3F46'); box(ctx, lx + 24, y0, 4, y1 - y0, '#3F3F46');
  box(ctx, lx, y0, 1, y1 - y0, '#71717A'); box(ctx, lx + 24, y0, 1, y1 - y0, '#71717A');
  const ro = ((scroll % 25) + 25) % 25;
  for (let y = Math.floor((y0 - ro) / 25) * 25 + ro; y < y1; y += 25) { box(ctx, lx + 4, y, 20, 3, '#52525B'); box(ctx, lx + 4, y, 20, 1, '#A1A1AA'); }

  // Pipes up the full height, joints going by, weeping slime
  [L + 70, L + 200, R - 216, R - 86].forEach((px, k) => {
    box(ctx, px, y0, 16, y1 - y0, '#1F3326'); box(ctx, px + 3, y0, 4, y1 - y0, '#3B5C45'); box(ctx, px + 13, y0, 3, y1 - y0, '#0F1D14');
    const jo = ((scroll % 200) + 200) % 200;
    for (let jy = Math.floor((y0 - jo) / 200) * 200 + jo; jy < y1; jy += 200) {
      bevel(ctx, px - 3, jy, 22, 10, '#2E4434', '#4A6B52', '#0F1D14', 1);
      box(ctx, px + 2, jy + 10, 3, 20 + hash(Math.round((jy - jo) / 200) + k * 7) * 30, 'rgba(132, 204, 22, 0.55)');
    }
    const span = 900;
    for (let d = Math.floor(y0 / span) * span; d < y1; d += span) {
      const dy = d + ((f * (3 + k) * 2 + k * 211) % span);
      box(ctx, px + 5, dy, 6, 8, '#84CC16'); box(ctx, px + 6, dy - 4, 4, 4, '#84CC16'); box(ctx, px + 6, dy + 1, 2, 2, '#D9F99D');
    }
  });

  // The hazard-striped edges, the full height (the stripes going by with the climb)
  for (const wx of [L, R - 20]) {
    box(ctx, wx, y0, 20, y1 - y0, '#1B241C');
    const off = ((scroll % 40) + 40) % 40;
    for (let y = Math.floor((y0 - off) / 40) * 40 + off; y < y1; y += 40) {
      ctx.fillStyle = '#EAB308';
      ctx.beginPath(); ctx.moveTo(wx, y); ctx.lineTo(wx + 20, y + 18); ctx.lineTo(wx + 20, y + 32); ctx.lineTo(wx, y + 14); ctx.closePath(); ctx.fill();
    }
    box(ctx, wx, y0, 2, y1 - y0, '#3F4A3F'); box(ctx, wx + 18, y0, 2, y1 - y0, '#0A100B');
  }
};
