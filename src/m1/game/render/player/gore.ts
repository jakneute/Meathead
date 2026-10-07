// Meathead getting bloodier as he loses health: cuts, smears and drips drawn onto
// him in every pose (regular and special moves). drawPlayer sets the level each frame.

export const bloodFresh = '#B91C1C';
export const bloodDark = '#7F1D1D';

/** How beaten up he is this frame (0 at full health, 1 at none). */
let gore = 0;
export const setGore = (level: number) => { gore = Math.max(0, Math.min(1, level)); };
export const getGore = () => gore;

/** An irregular smear of blood. */
export const smear = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = bloodFresh) => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + w * 0.3, y + h * 0.2, w * 0.3, h * 0.35, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bloodDark;
  ctx.beginPath(); ctx.arc(x - w * 0.15, y - h * 0.1, Math.min(w, h) * 0.22, 0, Math.PI * 2); ctx.fill();
};

/** A trickle of blood running down from (x, y), ending in a bead. */
export const drip = (ctx: CanvasRenderingContext2D, x: number, y: number, len: number) => {
  ctx.fillStyle = bloodFresh;
  ctx.fillRect(x - 0.5, y, 1, len);
  ctx.beginPath(); ctx.ellipse(x, y + len, 0.9, 1.3, 0, 0, Math.PI * 2); ctx.fill();
};

/** A slash: a dark gash with a fresh red rim. */
export const cut = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
  ctx.lineCap = 'round';
  ctx.strokeStyle = bloodFresh;
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = '#450A0A';
  ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
};

export const drawHeadBlood = (ctx: CanvasRenderingContext2D, hx: number, hy: number, frame: number) => {
  if (gore < 0.15) return;
  cut(ctx, hx + 4, hy + 1.5, hx + 7, hy - 0.5);                          // cheek
  if (gore >= 0.3) drip(ctx, hx + 2, hy + 1.5, gore >= 0.55 ? 6 : 2);    // nosebleed, down to the chin
  if (gore >= 0.45) {
    cut(ctx, hx - 7, hy - 8, hx - 3, hy - 9);                            // split brow
    drip(ctx, hx - 6.5, hy - 7.5, gore >= 0.6 ? 11 : 4);
  }
  if (gore >= 0.7) {
    // Scalp gash with blood streaming down the forehead
    smear(ctx, hx + 3, hy - 11.5, 5, 2.5);
    drip(ctx, hx + 2, hy - 11, 6);
    drip(ctx, hx + 4.5, hy - 11, 4);
  }
  if (gore >= 0.85) {
    ctx.fillStyle = bloodFresh;
    for (let i = 0; i < 7; i++) ctx.fillRect(hx - 8 + (i * 5.3) % 16, hy - 6 + (i * 3.7) % 13, 1, 1);
  }
  // Blood dripping off his chin when he's in a bad way
  if (gore >= 0.6) {
    const t = (frame % 36) / 36;
    if (t < 0.6) {
      ctx.fillStyle = bloodFresh;
      ctx.beginPath(); ctx.ellipse(hx + 2, hy + 8.5 + t * t * 60, 0.9, 1.4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
};

export const drawTorsoBlood = (ctx: CanvasRenderingContext2D, top: number, h: number, pecY: number) => {
  if (gore < 0.2) return;
  smear(ctx, 6, pecY + 4, 4, 3);
  if (gore >= 0.35) {
    cut(ctx, -10, top + 3, 5, top + 10);                                 // slash across the pecs
    drip(ctx, -6, top + 5, 5);
    drip(ctx, 1, top + 8, 4);
  }
  if (gore >= 0.5) drip(ctx, 2.5, top - 1, Math.min(h - 3, 12));         // running down from his chin
  if (gore >= 0.65) {
    smear(ctx, -4, top + h - 8, 6, 4, bloodDark);                        // abs
    drip(ctx, -3, top + h - 7, 6);
  }
  if (gore >= 0.8) {
    cut(ctx, 7, top + h - 12, 12, top + h - 5);
    smear(ctx, 10, top + h - 5, 6, 4);
  }
};

export const drawLeadArmBlood = (ctx: CanvasRenderingContext2D, ax: number, ay: number, pump: number) => {
  if (gore < 0.25) return;
  cut(ctx, ax + 5, ay, ax + 8, ay + 4);                                  // bicep
  if (gore >= 0.5) smear(ctx, ax + 15 + pump, ay + 7, 5, 3.5);           // bloody knuckles
  if (gore >= 0.75) drip(ctx, ax + 6, ay + 4, 6);
};

/** Badly hurt (under about a third of his health): a black eye, a split lip and sweat running off his temple. */
export const drawBeatenUp = (ctx: CanvasRenderingContext2D, hx: number, hy: number, frame: number) => {
  if (gore <= 0.65) return;
  ctx.fillStyle = 'rgba(88, 28, 135, 0.45)';
  ctx.beginPath(); ctx.ellipse(hx + 4.5, hy - 3, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bloodFresh;
  ctx.fillRect(hx + 3, hy + 6, 1, 2.5);
  const sweat = (frame % 40) / 40;
  ctx.fillStyle = '#7DD3FC';
  ctx.beginPath(); ctx.ellipse(hx - 8, hy - 9 + sweat * 10, 1, 1.5, 0, 0, Math.PI * 2); ctx.fill();
};
