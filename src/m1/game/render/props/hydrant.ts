// A fire hydrant, as the streets have them: a flanged foot bolted to the sidewalk, the barrel, a collar band, two side
// nozzles with their caps (chained on), the big pumper nozzle out the front, the domed bonnet with its pentagon nut
// on top. Red, three tones, lit from the left, pixel-stepped. Feet at (x, y), about 40 tall.
// `open`: the side cap's off (it's been opened, or knocked open) and that nozzle's a dark hole.

type Ctx = CanvasRenderingContext2D;

const RED = { lit: '#EF4444', mid: '#DC2626', dark: '#991B1B', deep: '#7F1D1D' };

export const drawHydrant = (ctx: Ctx, x: number, y: number, opts: { open?: boolean; tint?: typeof RED } = {}) => {
  const c = opts.tint ?? RED;
  const r = (cx: number, cy: number, w: number, h: number, col: string) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x + cx), Math.round(y + cy), w, h); };
  // The foot: a flange on the pavement, its bolts
  r(-12, -4, 24, 4, c.dark); r(-12, -4, 24, 1, c.mid);
  r(-10, -3, 2, 2, '#44403C'); r(8, -3, 2, 2, '#44403C');
  // The barrel: lit down the left, shadowed down the right
  r(-8, -30, 16, 26, c.mid);
  r(-8, -30, 4, 26, c.lit);
  r(4, -30, 4, 26, c.dark);
  r(-6, -28, 1, 20, '#FCA5A5'); // (a glint)
  // The side nozzles, each with its cap and the chain looping down from it
  for (const side of [-1, 1]) {
    const nx = side < 0 ? -14 : 8;
    r(nx, -22, 6, 7, side < 0 ? c.lit : c.dark);
    if (opts.open && side > 0) { r(nx + 4, -21, 3, 5, '#1C1917'); }
    else { r(side < 0 ? nx - 2 : nx + 4, -23, 3, 9, '#A8A29E'); r(side < 0 ? nx - 2 : nx + 6, -23, 1, 9, '#78716C'); }
    ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + (side < 0 ? nx : nx + 6), y - 16); ctx.quadraticCurveTo(x + side * 6, y - 8, x + side * 3, y - 14); ctx.stroke();
  }
  // The pumper nozzle out the front: a big round cap, its nut
  r(-5, -20, 10, 8, '#A8A29E'); r(-5, -20, 10, 2, '#D6D3D1'); r(-5, -14, 10, 2, '#78716C'); r(-2, -18, 4, 4, '#57534E');
  // The collar band, a bolt row round it
  r(-10, -32, 20, 4, c.dark); r(-10, -32, 20, 1, c.mid);
  for (let k = -8; k <= 6; k += 4) r(k, -31, 2, 2, c.deep);
  // The bonnet: a dome, the nut on top
  ctx.fillStyle = c.mid; ctx.beginPath(); ctx.moveTo(x - 8, y - 32); ctx.quadraticCurveTo(x - 8, y - 40, x, y - 40); ctx.quadraticCurveTo(x + 8, y - 40, x + 8, y - 32); ctx.closePath(); ctx.fill();
  r(-6, -38, 3, 5, c.lit); r(3, -37, 4, 5, c.dark);
  r(-3, -44, 6, 4, '#A8A29E'); r(-3, -44, 6, 1, '#D6D3D1'); r(2, -43, 1, 3, '#78716C'); r(-1, -46, 2, 2, '#78716C');
};
