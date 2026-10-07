import type { PadFamily } from '../platform/device';

// A controller's face button drawn on the canvas (the React prompts' PadButton, for the in-game ones): by where it is
// (A the bottom, B the right, X the left, Y the top: gameplay buttons stay put on every controller), with what that
// controller prints on it. An Xbox's coloured letters, a PlayStation's shapes, a Switch's letters (the other way round
// to an Xbox's: B on the bottom, A on the right), one sideways Joy-Con's little diamond with the one that's meant lit.

export type PadFace = 'A' | 'B' | 'X' | 'Y';
const XBOX_COLORS: Record<PadFace, string> = { A: '#16A34A', B: '#DC2626', X: '#2563EB', Y: '#CA8A04' };
const PS_COLORS: Record<PadFace, string> = { A: '#7DD3FC', B: '#F87171', X: '#F9A8D4', Y: '#6EE7B7' };
const SWITCH_LETTERS: Record<PadFace, string> = { A: 'B', B: 'A', X: 'Y', Y: 'X' };

/** The face button at `face`'s spot, centred on (x, y), radius r. `lit`: pressed (brighter). */
export const drawPadFace = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, face: PadFace, family: PadFamily, lit = false) => {
  ctx.save();
  if (family === 'joycon-l' || family === 'joycon-r') {
    const spots: Record<PadFace, [number, number]> = { A: [0, 0.5], B: [0.5, 0], X: [-0.5, 0], Y: [0, -0.5] };
    ctx.fillStyle = '#27272A'; ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const f of Object.keys(spots) as PadFace[]) {
      ctx.fillStyle = f === face ? (lit ? '#FFFFFF' : '#E4E4E7') : '#52525B';
      ctx.beginPath(); ctx.arc(x + spots[f][0] * r, y + spots[f][1] * r, r * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  const xbox = family === 'xbox', ps = family === 'playstation';
  // The button: an Xbox's in its colour; a PlayStation's and a Switch's dark, what's on it in colour (or white)
  ctx.fillStyle = xbox ? XBOX_COLORS[face] : family === 'switch' ? '#3F3F46' : '#1F2937';
  if (lit) ctx.filter = 'brightness(1.35)';
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.filter = 'none';
  if (ps) {
    const s = r * 0.45;
    ctx.strokeStyle = PS_COLORS[face]; ctx.lineWidth = Math.max(1.5, r * 0.2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (face === 'A') { ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); }
    else if (face === 'B') ctx.arc(x, y, s, 0, Math.PI * 2);
    else if (face === 'X') ctx.rect(x - s * 0.85, y - s * 0.85, s * 1.7, s * 1.7);
    else { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.75); ctx.lineTo(x - s, y + s * 0.75); ctx.closePath(); }
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(r * 0.9)}px "Press Start 2P"`;
    ctx.fillText(family === 'switch' ? SWITCH_LETTERS[face] : face, x + 1, y + 1);
  }
  ctx.restore();
};
