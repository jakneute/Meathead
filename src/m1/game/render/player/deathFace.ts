// His face, dying (see deathAnim): the brows, the eyes and the mouth for however it's getting him, drawn in place of
// his usual scowl. Head-local, the same frame as the head in player.ts (its middle at headX, headY).

type Ctx = CanvasRenderingContext2D;

export type DeathFace = 'scream' | 'agony' | 'dead' | 'shock' | 'frozen' | 'blissed';

export const drawDeathBrows = (ctx: Ctx, face: DeathFace, hx: number, hy: number) => {
  ctx.fillStyle = '#09090B';
  if (face === 'agony') {
    // Crushed together, up in the middle: it hurts
    ctx.beginPath(); ctx.moveTo(hx - 9, hy - 7); ctx.lineTo(hx - 1, hy - 10); ctx.lineTo(hx - 1, hy - 8); ctx.lineTo(hx - 9, hy - 5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 9, hy - 7); ctx.lineTo(hx + 1, hy - 10); ctx.lineTo(hx + 1, hy - 8); ctx.lineTo(hx + 9, hy - 5); ctx.fill();
  } else if (face === 'blissed') {
    ctx.fillRect(hx - 8, hy - 9, 6, 1.5); ctx.fillRect(hx + 2, hy - 9, 6, 1.5);
  } else if (face === 'dead') {
    ctx.fillRect(hx - 8, hy - 8, 6, 1.5); ctx.fillRect(hx + 2, hy - 8, 6, 1.5);
  } else {
    // Way up: terror, shock
    ctx.fillRect(hx - 8, hy - 11, 6, 2); ctx.fillRect(hx + 2, hy - 11, 6, 2);
  }
};

export const drawDeathEyes = (ctx: Ctx, face: DeathFace, lx: number, rx: number, ey: number, frame: number) => {
  if (face === 'dead') {
    // X'd out
    ctx.strokeStyle = '#09090B'; ctx.lineWidth = 1.3;
    for (const x of [lx, rx]) { ctx.beginPath(); ctx.moveTo(x - 2.2, ey - 2.2); ctx.lineTo(x + 2.2, ey + 2.2); ctx.moveTo(x + 2.2, ey - 2.2); ctx.lineTo(x - 2.2, ey + 2.2); ctx.stroke(); }
  } else if (face === 'agony') {
    // Screwed shut
    ctx.fillStyle = '#09090B';
    for (const x of [lx, rx]) { ctx.beginPath(); ctx.moveTo(x - 2.8, ey - 1.5); ctx.lineTo(x + 2.8, ey); ctx.lineTo(x - 2.8, ey + 1.5); ctx.lineTo(x - 2, ey); ctx.closePath(); ctx.fill(); }
  } else if (face === 'blissed') {
    // Heavy lids, pupils like dinner plates
    ctx.fillStyle = '#FFFFFF'; for (const x of [lx, rx]) ctx.fillRect(x - 2.6, ey - 0.6, 5.2, 2.6);
    ctx.fillStyle = '#09090B'; for (const x of [lx, rx]) ctx.fillRect(x - 1.6, ey - 0.4, 3.2, 2.4);
    ctx.fillStyle = '#C68642'; for (const x of [lx, rx]) ctx.fillRect(x - 2.8, ey - 2, 5.6, 1.6);
  } else {
    // Wide, pinprick pupils (frozen: wide and staring; shock: rattling)
    const jit = face === 'shock' ? (frame % 2 ? 0.6 : -0.6) : 0;
    ctx.fillStyle = '#FFFFFF'; for (const x of [lx, rx]) { ctx.beginPath(); ctx.arc(x + jit, ey, 3.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = face === 'frozen' ? '#0EA5E9' : '#09090B'; for (const x of [lx, rx]) ctx.fillRect(x - 0.7 + jit, ey - 0.7, 1.4, 1.4);
  }
};

export const drawDeathMouth = (ctx: Ctx, face: DeathFace, hx: number, my: number, frame: number) => {
  if (face === 'scream') {
    // Wide open, top teeth, tongue at the back
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(hx, my + 2, 4.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 3, my - 1.6, 6, 1.3);
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(hx, my + 4.4, 2.6, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  } else if (face === 'agony') {
    // Teeth clenched wide, lips pulled back
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hx - 6.5, my - 0.5, 13, 4.5);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 6, my, 12, 3.5);
    ctx.fillStyle = '#52525B'; ctx.fillRect(hx - 6, my + 1.6, 12, 0.5); for (const x of [-3.5, -1, 1.5, 4]) ctx.fillRect(hx + x, my, 0.5, 3.5);
  } else if (face === 'dead') {
    // Slack, the tongue lolling out the side
    ctx.fillStyle = '#18181B'; ctx.fillRect(hx - 4, my + 1, 8, 1.4);
    ctx.fillStyle = '#E11D48'; ctx.beginPath(); ctx.roundRect(hx + 1, my + 1.6, 3.4, 4.4, 1.5); ctx.fill();
    ctx.fillStyle = '#9F1239'; ctx.fillRect(hx + 2.4, my + 2, 0.6, 3);
  } else if (face === 'shock') {
    // Teeth rattling
    const o = frame % 2 ? 1.6 : 0.6;
    ctx.fillStyle = '#18181B'; ctx.fillRect(hx - 5, my, 10, 2.5 + o);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 4.5, my, 9, 1.2); ctx.fillRect(hx - 4.5, my + 1.3 + o, 9, 1.2);
  } else if (face === 'frozen') {
    // A little round O, frozen that way
    ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.ellipse(hx, my + 1.5, 2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // A big dopey grin
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.moveTo(hx - 6, my); ctx.quadraticCurveTo(hx, my + 6, hx + 6, my); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 4, my + 0.3, 8, 1.3);
  }
};
