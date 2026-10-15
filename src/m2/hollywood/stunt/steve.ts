// STUNTMAN STEVE, drawn (crude first pass, but he's the boss: he has to read). A washed-up 80s stunt double, a Cliff
// Booth type gone to seed: the yellow stunt jumpsuit (red racing stripes, zipped to the sternum, chest hair out of it),
// a gut over a big gold S buckle, white stunt boots, a neck brace he wears like jewelry, a feathered mullet going gray,
// a horseshoe mustache, cheap gold aviators. Still has his balls; lost everything else.
//
// drawSteve(c, x, feetY, facing, pose, frame, look): his feet at (x, feetY), facing +x unless facing is -1.

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
export const SUIT = '#FACC15', SUIT_LIT = '#FEF08A', SUIT_DK = '#CA8A04', STRIPE = '#DC2626';
const SKIN = '#E0A27A', SKIN_DK = '#B97A55', HAIR = '#8A5A2B', GRAY = '#B8AFA6', BOOT = '#F5F5F4', BRACE = '#F1F5F9';

export type StevePose =
  | 'idle' | 'thumb' | 'wave' | 'angry' | 'flail' | 'slip' | 'hurt' | 'zapped' | 'smoking' | 'towed' | 'getup'
  | 'sidestep' | 'struck' | 'tumble' | 'hoop' | 'down' | 'charred';

export interface SteveLook {
  /** How singed (0..1: the lightning's left its mark). */
  singe?: number;
  /** His trousers down round his ankles (and then gone). */
  pantsDown?: boolean;
  /** The aviators knocked off. */
  noShades?: boolean;
  /** His hair stood straight up (zapped). */
  frizz?: number;
}

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const limb = (c: Ctx, ax: number, ay: number, bx: number, by: number, col: string, w = 7) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
};
/** An arm: shoulder, elbow, hand (a fist of skin on the end). */
const arm = (c: Ctx, s: [number, number], e: [number, number], h: [number, number], back = false) => {
  limb(c, s[0], s[1], e[0], e[1], back ? SUIT_DK : SUIT, 7);
  limb(c, e[0], e[1], h[0], h[1], back ? SUIT_DK : SUIT, 6);
  c.fillStyle = INK; c.beginPath(); c.arc(h[0], h[1], 4.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = back ? SKIN_DK : SKIN; c.beginPath(); c.arc(h[0], h[1], 3.5, 0, Math.PI * 2); c.fill();
};
const leg = (c: Ctx, hip: [number, number], knee: [number, number], foot: [number, number], back = false, bare = false) => {
  limb(c, hip[0], hip[1], knee[0], knee[1], bare ? (back ? SKIN_DK : SKIN) : back ? SUIT_DK : SUIT, 9);
  limb(c, knee[0], knee[1], foot[0], foot[1] - 5, bare ? (back ? SKIN_DK : SKIN) : back ? SUIT_DK : SUIT, 8);
  // (the white stunt boot)
  box(c, foot[0] - 6, foot[1] - 9, 14, 9, INK); box(c, foot[0] - 5, foot[1] - 8, 12, 6, back ? '#D6D3D1' : BOOT); box(c, foot[0] - 5, foot[1] - 2, 13, 2, '#27272A');
};

/** The head, its chin at (0, 0) of wherever it's put: mullet, aviators, mustache, the neck brace under it. */
const head = (c: Ctx, f: number, look: SteveLook, mood: 'smug' | 'mad' | 'scared' | 'zap' | 'dead') => {
  const frizz = look.frizz ?? 0;
  // (the mullet down the back, gray coming in at the temples; frizzed straight up when he's been zapped)
  if (frizz > 0.05) {
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, r = 14 + frizz * 14 + (i % 2) * 4; limb(c, Math.cos(a) * 6 - 1, -20 + Math.sin(a) * 4, Math.cos(a) * r - 1, -20 + Math.sin(a) * r, i % 3 ? HAIR : GRAY, 3); }
  }
  box(c, -11, -23, 9, 22, INK); box(c, -10, -22, 8, 21, HAIR); box(c, -10, -6, 6, 6, GRAY);
  // (the face)
  c.fillStyle = INK; c.beginPath(); c.ellipse(1, -12, 10, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN; c.beginPath(); c.ellipse(1, -12, 9, 11, 0, 0, Math.PI * 2); c.fill();
  box(c, -6, -6, 3, 4, SKIN_DK);
  // (the feathered top, thinning)
  box(c, -8, -25, 17, 6, INK); box(c, -7, -24, 15, 5, HAIR); box(c, 2, -24, 5, 2, GRAY);
  // (the aviators: gold wire, dark lenses, a glint)
  if (!look.noShades) {
    box(c, -1, -16, 14, 1, '#CA8A04');
    box(c, 0, -15, 6, 5, '#1C1917'); box(c, 7, -15, 6, 5, '#1C1917');
    box(c, 1, -14, 2, 1, (f >> 4) % 6 === 0 ? '#FFFFFF' : '#57534E');
  } else {
    // (his eyes: little, wide with fright or shut)
    if (mood === 'dead') { box(c, 2, -13, 3, 1, INK); box(c, 8, -13, 3, 1, INK); }
    else { box(c, 2, -15, 3, 3, '#FFFFFF'); box(c, 8, -15, 3, 3, '#FFFFFF'); box(c, 3, -14, 1, 1, INK); box(c, 9, -14, 1, 1, INK); }
  }
  // (the horseshoe mustache, the mouth under it)
  box(c, 2, -8, 10, 3, '#5B3A1E'); box(c, 2, -6, 2, 5, '#5B3A1E'); box(c, 10, -6, 2, 5, '#5B3A1E');
  if (mood === 'mad' || mood === 'scared' || mood === 'zap') box(c, 5, -5, 4, mood === 'mad' ? 2 : 3, INK);
  else if (mood === 'smug') box(c, 5, -4, 4, 1, INK);
};

/** The torso from the hips (0, 0) up: the gut, the stripes, the buckle, the chest hair, the neck brace on top. */
const torso = (c: Ctx, look: SteveLook) => {
  // (the gut: out in front, over the belt)
  c.fillStyle = INK; c.beginPath(); c.ellipse(3, -14, 15, 16, 0, 0, Math.PI * 2); c.fill();
  box(c, -12, -38, 22, 30, INK);
  box(c, -11, -37, 20, 28, SUIT);
  c.fillStyle = SUIT; c.beginPath(); c.ellipse(3, -14, 14, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SUIT_LIT; c.beginPath(); c.ellipse(6, -20, 6, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SUIT_DK; c.beginPath(); c.ellipse(1, -4, 12, 4, 0, 0, Math.PI); c.fill();
  // (the racing stripes down his front, the zip open to the sternum, the chest hair out of it)
  box(c, -4, -37, 3, 26, STRIPE); box(c, 0, -37, 2, 26, '#FFFFFF');
  box(c, 3, -37, 5, 9, SKIN); box(c, 4, -35, 1, 1, '#5B3A1E'); box(c, 6, -33, 1, 1, '#5B3A1E'); box(c, 4, -31, 1, 1, '#5B3A1E');
  // (the belt and the big gold S)
  box(c, -12, -6, 28, 5, INK); box(c, -11, -5, 26, 3, '#78350F');
  box(c, 4, -8, 9, 8, INK); box(c, 5, -7, 7, 6, '#FDE047'); box(c, 7, -6, 3, 1, '#A16207'); box(c, 7, -4, 3, 1, '#A16207'); box(c, 7, -2, 3, 1, '#A16207');
  // (the neck brace: white foam, worn like a medal)
  box(c, -8, -44, 18, 8, INK); box(c, -7, -43, 16, 6, BRACE); box(c, -7, -39, 16, 2, '#CBD5E1');
  if (look.singe) { c.fillStyle = `rgba(28, 25, 23, ${(0.55 * look.singe).toFixed(2)})`; c.fillRect(-11, -37, 20, 28); }
};

/** How tall he stands (feet to the top of the mullet). */
export const STEVE_H = 104;

export const drawSteve = (c: Ctx, x: number, feetY: number, facing: 1 | -1, pose: StevePose, f: number, look: SteveLook = {}) => {
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing, 1);
  const bare = !!look.pantsDown;
  const wob = (k: number) => Math.sin(f * k);
  switch (pose) {
    case 'down': {
      // Face down, rear up, trousers round his ankles (his star-spangled briefs), the brace askew, a leg twitching
      c.rotate(0);
      const tw = Math.sin(f * 0.6) > 0.8 ? -3 : 0;
      limb(c, -10, -6, -26, -2 + tw, bare ? SKIN : SUIT, 9); limb(c, -26, -2 + tw, -38, -4 + tw, bare ? SKIN : SUIT, 8);
      if (bare) { box(c, -44, -8, 12, 7, INK); box(c, -43, -7, 10, 5, SUIT_DK); }
      // (the rear, up)
      c.fillStyle = INK; c.beginPath(); c.ellipse(-6, -14, 12, 11, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = bare ? '#1D4ED8' : SUIT; c.beginPath(); c.ellipse(-6, -14, 11, 10, 0, 0, Math.PI * 2); c.fill();
      if (bare) for (const [sx, sy] of [[-10, -18], [-3, -12], [-8, -9]]) { box(c, -6 + sx + 5, sy, 3, 3, '#FFFFFF'); }
      // (the back, down to the floor, the head flat on it)
      box(c, 2, -12, 28, 12, INK); box(c, 3, -11, 26, 10, SUIT); box(c, 3, -8, 26, 2, STRIPE);
      c.save(); c.translate(36, -2); c.rotate(Math.PI / 2); head(c, f, { ...look, noShades: true }, 'dead'); c.restore();
      box(c, 26, -12, 6, 12, BRACE);
      arm(c, [8, -8], [14, 0], [24, 0], true); arm(c, [10, -10], [4, -2], [-2, 0]);
      break;
    }
    case 'charred': {
      // Stood there still in his thumbs-up, black from head to boots, smoking
      // (all of it black: soot over everything he is)
      c.filter = 'brightness(0.22) sepia(0.4)';
      leg(c, [-4, -38], [-6, -20], [-6, 0], true); leg(c, [4, -38], [6, -20], [8, 0]);
      c.save(); c.translate(0, -36); torso(c, { singe: 1 }); c.restore();
      arm(c, [-6, -66], [-12, -50], [-6, -40], true); arm(c, [8, -66], [18, -60], [16, -78]);
      c.save(); c.translate(1, -80); head(c, f, { ...look, frizz: 1, noShades: true }, 'dead'); c.restore();
      c.filter = 'none';
      // (the whites of his eyes, blinking, still)
      box(c, 3, -95, 2, 2, '#FFFFFF'); box(c, 9, -95, 2, 2, '#FFFFFF');
      break;
    }
    case 'towed': {
      // On his belly, being dragged by his fists on the rope out in front of him, legs kicking behind
      const k = wob(0.5) * 3;
      leg(c, [-10, -10], [-26, -8 + k], [-40, -6 - k], true, bare); leg(c, [-10, -8], [-24, -4 - k], [-38, -2 + k], false, bare);
      c.save(); c.translate(-6, -8); c.rotate(Math.PI / 2 + 0.05); torso(c, look); c.restore();
      arm(c, [24, -12], [34, -12], [46, -12]); arm(c, [22, -8], [34, -6], [46, -8], true);
      c.save(); c.translate(36, -20); c.rotate(0.35); head(c, f, look, 'scared'); c.restore();
      break;
    }
    case 'tumble': case 'struck': {
      // Off his feet: limbs everywhere, turned about his middle
      c.translate(0, -44); c.rotate(pose === 'struck' ? -0.5 : f * 0.25); c.translate(0, 44);
      leg(c, [-4, -38], [-14, -24], [-20, -10], true, bare); leg(c, [4, -38], [14, -30], [22, -22], false, bare);
      c.save(); c.translate(0, -36); torso(c, look); c.restore();
      arm(c, [-6, -66], [-18, -76], [-24, -90], true); arm(c, [8, -66], [22, -72], [30, -86]);
      c.save(); c.translate(1, -80); head(c, f, look, 'scared'); c.restore();
      break;
    }
    case 'hoop': {
      // Stuck in a hula hoop at the waist (the hoop's drawn by whoever has him in it), legs kicking, arms flapping
      const k = wob(0.7);
      leg(c, [-3, -38], [-6 + k * 4, -20], [-8 - k * 6, -2], true, bare); leg(c, [4, -38], [8 - k * 4, -22], [10 + k * 6, -4], false, bare);
      if (bare) { box(c, -8, -44, 18, 8, INK); box(c, -7, -43, 16, 6, '#1D4ED8'); box(c, -4, -42, 2, 2, '#FFFFFF'); box(c, 3, -41, 2, 2, '#FFFFFF'); }
      c.save(); c.translate(0, -36); torso(c, look); c.restore();
      arm(c, [-6, -66], [-20, -60 + k * 8], [-30, -70 - k * 10], true); arm(c, [8, -66], [22, -60 - k * 8], [32, -70 + k * 10]);
      c.save(); c.translate(1, -80); head(c, f, look, 'scared'); c.restore();
      break;
    }
    default: {
      // Standing, more or less: his legs by the pose, then the torso, the arms, the head
      const lean = pose === 'hurt' ? -0.12 : pose === 'smoking' ? 0.18 : pose === 'getup' ? 0.3 : pose === 'sidestep' ? -0.06 : 0;
      const jit = pose === 'zapped' ? (f % 2 ? 2 : -2) : 0;
      c.translate(jit, 0);
      if (pose === 'sidestep') { leg(c, [-4, -38], [-14, -20], [-22, 0], true, bare); leg(c, [4, -38], [12, -22], [18, 0], false, bare); }
      else if (pose === 'flail' || pose === 'slip') { const k = wob(0.6) * 4; leg(c, [-4, -38], [-8 + k, -20], [-10, 0], true, bare); leg(c, [4, -38], [8 - k, -20], [10, 0], false, bare); }
      else if (pose === 'smoking' || pose === 'getup') { leg(c, [-4, -38], [-10, -18], [-10, 0], true, bare); leg(c, [4, -38], [14, -20], [10, 0], false, bare); }
      else { leg(c, [-4, -38], [-6, -20], [-7, 0], true, bare); leg(c, [4, -38], [6, -20], [8, 0], false, bare); }
      if (bare) { box(c, -14, -6, 30, 7, INK); box(c, -13, -5, 28, 5, SUIT_DK); }
      c.save(); c.translate(0, -36); c.rotate(lean); c.translate(0, 0);
      torso(c, look);
      // (arms, by the pose)
      const sh = -30, sb: [number, number] = [-6, sh], sf: [number, number] = [8, sh];
      switch (pose) {
        case 'thumb': arm(c, sb, [-10, sh + 14], [-4, sh + 22], true); arm(c, sf, [20, sh + 4], [20, sh - 12]); box(c, 18, sh - 20, 3, 6, SKIN); break;
        case 'wave': { const k = wob(0.35); arm(c, sb, [-12, sh + 12], [-8, sh + 22], true); arm(c, sf, [18, sh - 10], [22 + k * 6, sh - 26]);
          // (the checkered flag)
          c.save(); c.translate(22 + k * 6, sh - 26); c.rotate(-0.3 + k * 0.4); box(c, -1, -24, 2, 26, '#57534E'); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(c, 1 + i * 4, -24 + j * 4, 4, 4, (i + j) % 2 ? '#FFFFFF' : '#18181B'); c.restore(); break; }
        case 'angry': { const k = wob(0.8) * 3; arm(c, sb, [-14, sh + 6], [-12, sh - 8 + k], true); arm(c, sf, [20, sh + 4], [18, sh - 10 - k]); break; }
        case 'flail': case 'slip': { const k = wob(0.7); arm(c, sb, [-16, sh - 6 + k * 8], [-20, sh - 22 - k * 10], true); arm(c, sf, [20, sh - 6 - k * 8], [26, sh - 20 + k * 12]); break; }
        case 'hurt': arm(c, sb, [-14, sh + 4], [-20, sh - 6], true); arm(c, sf, [16, sh + 8], [8, sh + 14]); break;
        case 'zapped': arm(c, sb, [-16, sh - 12], [-22, sh - 28], true); arm(c, sf, [20, sh - 12], [26, sh - 28]); break;
        case 'smoking': case 'getup': arm(c, sb, [-8, sh + 14], [-4, sh + 28], true); arm(c, sf, [14, sh + 14], [16, sh + 28]); break;
        case 'sidestep': arm(c, sb, [-16, sh + 2], [-24, sh - 4], true); arm(c, sf, [18, sh], [28, sh - 6]); break;
        default: arm(c, sb, [-12, sh + 12], [-4, sh + 22], true); arm(c, sf, [16, sh + 12], [8, sh + 22]); break;
      }
      c.save(); c.translate(1, -44);
      head(c, f, look, pose === 'angry' ? 'mad' : pose === 'zapped' ? 'zap' : pose === 'flail' || pose === 'slip' || pose === 'hurt' || pose === 'sidestep' ? 'scared' : 'smug');
      c.restore();
      c.restore();
      // (zapped: his skeleton showing through, every other frame)
      if (pose === 'zapped' && f % 4 < 2) {
        c.fillStyle = 'rgba(255, 255, 255, 0.85)';
        c.fillRect(-1, -78, 3, 40); for (let i = 0; i < 4; i++) c.fillRect(-7, -72 + i * 6, 15, 2);
        c.fillRect(-5, -38, 3, 36); c.fillRect(3, -38, 3, 36);
        c.beginPath(); c.arc(2, -88, 8, 0, Math.PI * 2); c.fill();
        c.fillStyle = INK; c.fillRect(-1, -90, 2, 2); c.fillRect(4, -90, 2, 2);
      }
      break;
    }
  }
  c.restore();
};
