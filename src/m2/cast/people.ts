// Meathead 2's cast, each their own drawing. Taken from the user's characters (their stories, their personalities),
// but redesigned to be legally distinct from the reference art: different species, silhouettes, palettes and outfits;
// only the people inside them carried over. Feet at (0, 0), facing right; `f` the frame, for the idle and the talking.

import { type Ctx, INK, dk, lt, blob, rect, dot, legs, walkFeet, torso, arm, head, eyes, mouth, nose, specs, breathe, type MouthStyle } from './kit';

export interface CastMember {
  id: string;
  name: string;
  /** Drawn standing at (0, 0) facing right. `talk`: mouth going. */
  draw: (c: Ctx, f: number, talk: boolean) => void;
}

const SKIN = { pale: '#F6DCC8', light: '#F0C8A2', tan: '#D9A877', brown: '#A86B43', dark: '#6E4426', burnt: '#F2A584', pink: '#F4C2B0' };
const t = (talk: boolean, s: MouthStyle): MouthStyle => (talk ? 'talk' : s);

export const CAST: CastMember[] = [
  {
    // ARTIE: the dimwit with the gator thing. A lanky guy in a lime tracksuit, a foam gator-head hat on (jaws open,
    // teeth, googly eyes up top), buck teeth, a can of spray cheese he keeps hitting
    id: 'artie', name: 'ARTIE',
    draw: (c, f, talk) => {
      const b = breathe(f, 1);
      legs(c, -32, 4, 6, '#65A30D', SKIN.light, '#F8FAFC');
      for (const s of [-1, 1]) dot(c, s * 4 - 0.5, -31, 1, 27, '#F8FAFC');
      c.translate(0, b);
      torso(c, -32, -55, 20, 16, '#84CC16');
      dot(c, -1, -55, 2, 22, '#F8FAFC');
      arm(c, -8, -52, -10, -32, '#84CC16', SKIN.light, 1);
      const sq = (f % 120) < 10;
      arm(c, 8, -52, 12, -62, '#84CC16', SKIN.light, 0.85);
      rect(c, 10, -72, 5, 10, '#F97316', 1.5); dot(c, 11, -74, 3, 2, '#E5E7EB');
      if (sq) for (let k = 0; k < 4; k++) dot(c, 10 - k * 2, -76 - k * 2, 2, 2, '#FDBA74');
      head(c, 0, -68, 9, 10, SKIN.light);
      eyes(c, 1, -69, 4, 'droopy', f, 0.6, 2.4, dk(SKIN.light, 0.1));
      nose(c, 4, -65, 2.2, SKIN.light);
      mouth(c, 2, -61, 7, t(talk, 'teeth'), f);
      dot(c, 0.5, -60.5, 3, 2.6, '#FFFFFF'); c.strokeStyle = INK; c.lineWidth = 0.6; c.strokeRect(0.5, -60.5, 3, 2.6);
      // (the gator hat: the upper jaw out over his face, teeth down, its eyes up top, the snout's nostrils)
      blob(c, () => { c.moveTo(-11, -72); c.quadraticCurveTo(-8, -84, 6, -82); c.lineTo(24, -78); c.quadraticCurveTo(27, -76, 24, -73); c.lineTo(-11, -72); c.closePath(); }, '#16A34A', -11, 27);
      for (let x = 2; x < 23; x += 4) { c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(x, -73); c.lineTo(x + 1.5, -70); c.lineTo(x + 3, -73); c.fill(); }
      for (const ex of [-2, 6]) { blob(c, () => c.arc(ex, -84, 3.2, 0, Math.PI * 2), '#F8FAFC', ex - 3, ex + 3, 1); dot(c, ex + 0.5, -84.5, 1.6, 1.6, INK); }
      dot(c, 21, -79, 1.5, 1, INK); dot(c, 18, -79, 1.5, 1, INK);
      for (let x = -6; x < 20; x += 6) dot(c, x, -80, 2, 1, '#15803D');
    },
  },
  {
    // CHUCK: the 38-year-old man-child who thinks he's a superhero. Big and soft, a beard, swim goggles for a mask, a
    // black trash-bag cape, a gray tee with a bat drawn on it in marker, cargo shorts, crocs, hands on his hips
    id: 'chuck', name: 'CHUCK',
    draw: (c, f, talk) => {
      const b = breathe(f, 2), wave = Math.sin(f * 0.07) * 2;
      blob(c, () => { c.moveTo(-10, -56 + b); c.lineTo(-18 + wave, -6); c.lineTo(-4, -10); c.lineTo(10, -6); c.lineTo(10, -56 + b); c.closePath(); }, '#18181B', -18, 10);
      legs(c, -28, 5, 8, '#A3A27A', SKIN.tan, '#84CC16', 'shorts', 10);
      c.translate(0, b);
      torso(c, -28, -52, 26, 30, '#9CA3AF');
      blob(c, () => c.ellipse(1, -42, 7, 4, 0, 0, Math.PI * 2), '#FDE047', -6, 8, 1);
      c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -43); c.lineTo(-1, -40); c.lineTo(1, -44); c.lineTo(3, -40); c.lineTo(6, -43); c.stroke();
      arm(c, -12, -50, -15, -32, '#9CA3AF', SKIN.tan, 0.3, 6.5);
      arm(c, 12, -50, 15, -32, '#9CA3AF', SKIN.tan, 0.3, 6.5);
      head(c, 0, -63, 10, 10, SKIN.tan);
      blob(c, () => { c.moveTo(-9, -63); c.quadraticCurveTo(-9, -50, 0, -50); c.quadraticCurveTo(9, -50, 9, -63); c.quadraticCurveTo(0, -58, -9, -63); }, '#6B4423', -9, 9);
      mouth(c, 2, -58, 6, t(talk, 'grin'), f);
      blob(c, () => c.ellipse(0, -73, 10, 3.5, 0, Math.PI, 0), '#6B4423', -10, 10);
      eyes(c, 1, -65, 4, 'wide', f, 0.5, 2.4);
      specs(c, 1, -65, 4, 3.4, '#38BDF8', 'round');
      dot(c, -10, -66, 3, 1.2, '#38BDF8'); dot(c, 8, -66, 3, 1.2, '#38BDF8');
    },
  },
  {
    // GARY: the sad sack. A big gray hoodie, hood half up, hands shoved in the pocket, shoulders down, a sad goatee
    id: 'gary', name: 'GARY',
    draw: (c, f, talk) => {
      const b = breathe(f, 3) * 0.5;
      legs(c, -28, 4, 7, '#1E293B', SKIN.dark, '#E5E7EB');
      c.translate(0, b + 1);
      torso(c, -26, -50, 22, 22, '#6B7280');
      rect(c, -7, -38, 14, 7, dk('#6B7280', 0.15), 3);
      arm(c, -10, -48, -3, -35, '#6B7280', SKIN.dark, 1, 6);
      arm(c, 10, -48, 3, -35, '#6B7280', SKIN.dark, 1, 6);
      blob(c, () => c.ellipse(-1, -62, 12, 11, 0, Math.PI * 0.9, Math.PI * 2.1), '#6B7280', -13, 11);
      head(c, 0, -61, 9, 10, SKIN.dark, false);
      eyes(c, 1, -62, 4, 'tired', f, 0.2, 2.4, dk(SKIN.dark, 0.1));
      nose(c, 3, -58, 2.2, SKIN.dark);
      mouth(c, 1, -54, 5, t(talk, 'frown'), f);
      dot(c, -1, -52, 4, 2, '#1C1917');
    },
  },
  {
    // GUS: the crude prankster. A sunburnt kid with a red mullet, a tank top with a hot dog on it, jorts, tube
    // socks, finger guns, a smug grin (and a dusting of something white on his nose)
    id: 'gus', name: 'GUS',
    draw: (c, f, talk) => {
      const b = breathe(f, 4);
      legs(c, -28, 4, 7, '#60A5FA', SKIN.burnt, '#DC2626', 'shorts');
      for (const s of [-1, 1]) { dot(c, s * 4 - 3, -12, 6, 8, '#F8FAFC'); dot(c, s * 4 - 3, -10, 6, 1, '#DC2626'); }
      c.translate(0, b);
      torso(c, -28, -50, 18, 17, '#F8FAFC');
      rect(c, -4, -44, 9, 4, '#F59E0B', 2); dot(c, -3, -43, 7, 1, '#DC2626');
      arm(c, -8, -48, -9, -30, '#F8FAFC', SKIN.burnt, 0, 5);
      arm(c, 8, -48, 18, -44, '#F8FAFC', SKIN.burnt, 0, 5);
      dot(c, 19, -46, 5, 1.6, SKIN.burnt); c.strokeStyle = INK; c.lineWidth = 0.6; c.strokeRect(19, -46, 5, 1.6);
      head(c, 0, -61, 9, 10, SKIN.burnt);
      blob(c, () => { c.moveTo(-9, -63); c.quadraticCurveTo(-8, -73, 2, -72); c.quadraticCurveTo(9, -71, 9, -65); c.lineTo(-2, -67); c.lineTo(-10, -52); c.lineTo(-12, -58); c.closePath(); }, '#C2410C', -12, 9);
      eyes(c, 2, -62, 4, 'smug', f, 0.6, 2.4, dk(SKIN.burnt, 0.1));
      nose(c, 6, -58, 2.6, SKIN.burnt, 3);
      dot(c, 7, -57, 2, 1, '#F8FAFC');
      mouth(c, 2, -54, 7, t(talk, 'grin'), f);
    },
  },
  {
    // GLENN: the greasy one. A comb-over, a pornstache, an open short-sleeve shirt over a stained undershirt, shorts
    // too short, socks with sandals, a beer
    id: 'glenn', name: 'GLENN',
    draw: (c, f, talk) => {
      const b = breathe(f, 5);
      legs(c, -27, 4, 7, '#C8B88A', SKIN.pale, '#78350F', 'shorts', 9);
      for (const s of [-1, 1]) dot(c, s * 4 - 3, -9, 6, 5, '#F8FAFC');
      c.translate(0, b);
      torso(c, -27, -50, 21, 24, '#F5F5F4');
      blob(c, () => c.ellipse(2, -33, 4, 3, 0, 0, Math.PI * 2), '#CA8A04', -2, 6, 0.6);
      for (const s of [-1, 1]) blob(c, () => { c.moveTo(s * 2, -50); c.lineTo(s * 11, -50); c.lineTo(s * 12, -27); c.lineTo(s * 4, -27); c.closePath(); }, '#B45309', s < 0 ? -12 : 2, s < 0 ? -2 : 12);
      for (let k = 0; k < 4; k++) { dot(c, -10 + (k % 2) * 2, -46 + k * 5, 2, 2, '#FDE047'); dot(c, 6 + (k % 2) * 2, -44 + k * 5, 2, 2, '#FDE047'); }
      arm(c, -10, -48, -12, -30, '#B45309', SKIN.pale, 0.35, 5);
      arm(c, 10, -48, 16, -40, '#B45309', SKIN.pale, 0.35, 5);
      rect(c, 14, -47, 5, 8, '#DC2626', 1.2); dot(c, 14.5, -44, 4, 2, '#F5F5F4');
      head(c, 0, -61, 9, 10, SKIN.pale);
      for (let k = 0; k < 5; k++) { c.strokeStyle = '#1C1917'; c.lineWidth = 1; c.beginPath(); c.moveTo(-9, -66 + k); c.quadraticCurveTo(0, -73 + k * 0.6, 8, -68 + k); c.stroke(); }
      dot(c, -2, -71, 6, 1, '#F8FAFC');
      eyes(c, 1, -62, 4, 'smug', f, 0.6, 2.3, dk(SKIN.pale, 0.12));
      nose(c, 4, -58, 2.4, SKIN.pale);
      blob(c, () => c.ellipse(2, -55.5, 5, 1.6, 0, 0, Math.PI * 2), '#292524', -3, 7, 0.6);
      mouth(c, 2, -53, 5, t(talk, 'smirk'), f);
    },
  },
  {
    // MATT: the pompous one who makes bombs. Lanky and pale, a towering lacquered pompadour (it shines), a black
    // turtleneck, a gray blazer, a monocle; an alarm clock with wires in his hand, ticking
    id: 'matt', name: 'MATT',
    draw: (c, f, talk) => {
      const b = breathe(f, 6);
      legs(c, -33, 3.5, 6, '#1F2937', SKIN.pale, '#18181B');
      c.translate(0, b);
      torso(c, -33, -56, 18, 15, '#4B5563');
      blob(c, () => { c.moveTo(-4, -56); c.lineTo(4, -56); c.lineTo(2, -36); c.lineTo(-2, -36); c.closePath(); }, '#18181B', -4, 4, 0.8);
      arm(c, -8, -54, -9, -34, '#4B5563', SKIN.pale, 1, 4.5);
      arm(c, 8, -54, 14, -42, '#4B5563', SKIN.pale, 0.9, 4.5);
      blob(c, () => c.arc(18, -44, 4.5, 0, Math.PI * 2), '#DC2626', 13, 22);
      dot(c, 17.5, -47, 1, 3, INK); dot(c, 17.5, -44.5, 2.5, 1, INK);
      c.strokeStyle = (f >> 4) % 2 ? '#EF4444' : '#3B82F6'; c.lineWidth = 1; c.beginPath(); c.moveTo(14, -41); c.quadraticCurveTo(10, -36, 13, -32); c.stroke();
      dot(c, -2, -60, 4, 4, '#18181B');
      head(c, 0, -67, 8, 10, SKIN.pale);
      blob(c, () => { c.moveTo(-8, -70); c.quadraticCurveTo(-10, -84, 2, -88); c.quadraticCurveTo(14, -90, 12, -80); c.quadraticCurveTo(9, -74, 7, -72); c.closePath(); }, '#7C4A1E', -10, 14);
      dot(c, -1, -86, 7, 1.4, '#F5F5F4'); dot(c, 6, -84, 3, 1, '#F5F5F4');
      eyes(c, 1, -68, 3.6, 'smug', f, 0.5, 2.3, dk(SKIN.pale, 0.12));
      c.strokeStyle = '#CA8A04'; c.lineWidth = 1; c.beginPath(); c.arc(4.6, -68, 3.2, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(7.5, -67); c.lineTo(8, -58); c.stroke();
      nose(c, 4, -63, 2.4, SKIN.pale, 2);
      mouth(c, 2, -59, 5, t(talk, 'smirk'), f);
    },
  },
  {
    // JJ: the burned-out customer service worker. A sloth: shaggy brown, the dark mask round the eyes, long claws; a
    // headset, a teal work polo with a name tag, dead eyes, holding his phone
    id: 'jj', name: 'JJ',
    draw: (c, f, talk) => {
      const FUR = '#8B6F4E', b = breathe(f, 7) * 0.4;
      legs(c, -27, 4, 7, '#A8A29E', FUR, '#44403C');
      c.translate(0, b);
      torso(c, -27, -50, 20, 21, '#0D9488');
      rect(c, 3, -46, 6, 4, '#F8FAFC', 1); dot(c, 4, -45, 4, 1, '#1E3A8A');
      arm(c, -9, -48, -11, -30, '#0D9488', FUR, 0.3, 6);
      arm(c, 9, -48, 10, -38, '#0D9488', FUR, 0.3, 6);
      for (let k = 0; k < 3; k++) dot(c, 8 + k * 2, -35, 1, 4, '#E7E5E4');
      rect(c, 6, -46, 6, 9, '#18181B', 1); dot(c, 7, -45, 4, 6, '#38BDF8');
      head(c, 0, -61, 10, 9.5, FUR, false);
      blob(c, () => c.ellipse(0, -60, 8, 6, 0, 0, Math.PI * 2), '#D6C2A4', -8, 8, 0.8);
      for (const s of [-1, 1]) blob(c, () => c.ellipse(s * 4 + 1, -62, 4, 2.6, s * -0.3, 0, Math.PI * 2), '#3F2E1F', s * 4 - 3, s * 4 + 5, 0.6);
      eyes(c, 1, -62, 4, 'dead', f, 0.3, 2, '#3F2E1F');
      dot(c, 0, -58, 3, 2, INK);
      mouth(c, 1, -55, 5, t(talk, 'flat'), f);
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(0, -63, 11, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      rect(c, -12, -66, 4, 6, '#18181B', 1); c.beginPath(); c.moveTo(-10, -61); c.quadraticCurveTo(-8, -54, -2, -55); c.stroke();
    },
  },
  {
    // CHARLOTTE: the rogue cop. A big, broad woman in park security navy, a buzz cut, mirrored aviators, a badge, a
    // belt loaded down, the taser out and crackling, grinning
    id: 'charlotte', name: 'CHARLOTTE',
    draw: (c, f, talk) => {
      const b = breathe(f, 8);
      legs(c, -29, 5, 8, '#1E293B', SKIN.brown, '#18181B');
      c.translate(0, b);
      torso(c, -29, -53, 26, 20, '#1E3A8A');
      dot(c, -12, -31, 24, 3, '#18181B'); dot(c, 6, -32, 4, 5, '#CA8A04');
      blob(c, () => c.arc(-5, -46, 2.4, 0, Math.PI * 2), '#FACC15', -7, -3, 0.8);
      dot(c, 2, -48, 8, 2, '#F8FAFC');
      arm(c, -12, -51, -14, -32, '#1E3A8A', SKIN.brown, 0.4, 7);
      arm(c, 12, -51, 20, -42, '#1E3A8A', SKIN.brown, 0.4, 7);
      rect(c, 18, -46, 9, 5, '#FACC15', 1.5); dot(c, 26, -45, 2, 3, INK);
      if (f % 20 < 10) { c.strokeStyle = '#7DD3FC'; c.lineWidth = 1; c.beginPath(); c.moveTo(28, -46); c.lineTo(31, -48); c.lineTo(29, -44); c.lineTo(33, -45); c.stroke(); }
      head(c, 0, -64, 9.5, 10, SKIN.brown);
      blob(c, () => c.ellipse(0, -70, 9.5, 5, 0, Math.PI, 0), '#1C1917', -9.5, 9.5, 1);
      for (let k = 0; k < 6; k++) dot(c, -7 + k * 3, -73, 1, 1, '#44403C');
      specs(c, 1, -65, 4.2, 3.4, '#A1A1AA', 'square', '#D4D4D8');
      dot(c, -2, -67, 2, 1, '#FFFFFF'); dot(c, 6, -67, 2, 1, '#FFFFFF');
      mouth(c, 2, -58, 7, t(talk, 'teeth'), f);
    },
  },
  {
    // SID: the old boss. Short and stout, a huge white walrus mustache, a flat cap, a navy track jacket with stripes
    // down the sleeves, a hearing aid, a flask
    id: 'sid', name: 'SID',
    draw: (c, f, talk) => {
      const b = breathe(f, 9) * 0.5;
      legs(c, -22, 4.5, 8, '#1E3A8A', SKIN.pink, '#18181B');
      c.translate(0, b);
      torso(c, -22, -44, 24, 26, '#1E3A8A');
      dot(c, -1, -44, 2, 22, '#F8FAFC');
      arm(c, -11, -42, -13, -24, '#1E3A8A', SKIN.pink, 1, 6.5);
      arm(c, 11, -42, 14, -32, '#1E3A8A', SKIN.pink, 1, 6.5);
      dot(c, -14, -41, 1.5, 15, '#F8FAFC'); dot(c, 12, -41, 1.5, 8, '#F8FAFC');
      rect(c, 12, -40, 6, 8, '#A1A1AA', 1.5);
      head(c, 0, -55, 10, 9.5, SKIN.pink);
      blob(c, () => { c.moveTo(-11, -60); c.quadraticCurveTo(-10, -70, 2, -69); c.quadraticCurveTo(14, -68, 13, -61); c.lineTo(-11, -60); c.closePath(); }, '#57534E', -11, 13);
      dot(c, -9, -55, 2, 3, '#F5D0FE');
      eyes(c, 2, -56, 4, 'tired', f, 0.4, 2.1, dk(SKIN.pink, 0.1));
      nose(c, 4, -52, 3, SKIN.pink);
      blob(c, () => { c.moveTo(-6, -50); c.quadraticCurveTo(2, -54, 10, -50); c.quadraticCurveTo(12, -44, 8, -45); c.quadraticCurveTo(2, -48, -4, -45); c.quadraticCurveTo(-8, -45, -6, -50); }, '#F5F5F4', -8, 12);
      if (talk) mouth(c, 2, -44, 4, 'talk', f);
    },
  },
  {
    // SUSAN: the mom who's seen it all. In a wheelchair, a frizzy perm, a leopard top, a cigarette going, a pocketknife
    // she keeps flicking open and shut
    id: 'susan', name: 'SUSAN',
    draw: (c, f, talk) => {
      const b = breathe(f, 10) * 0.4;
      // (the chair: the big wheel, the frame, the push handles)
      c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(-4, -13, 13, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#71717A'; c.lineWidth = 1.5; c.stroke();
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(-4 - Math.cos(a) * 12, -13 - Math.sin(a) * 12); c.lineTo(-4 + Math.cos(a) * 12, -13 + Math.sin(a) * 12); c.stroke(); }
      blob(c, () => c.arc(14, -4, 3.5, 0, Math.PI * 2), '#27272A', 10, 18, 1);
      dot(c, -16, -46, 2, 26, '#52525B'); dot(c, -14, -24, 26, 3, '#52525B');
      c.translate(0, b);
      rect(c, -12, -26, 22, 6, '#1D4ED8', 2);
      rect(c, 6, -26, 6, 18, '#1D4ED8', 2); blob(c, () => c.roundRect(5, -8, 10, 4, 2), '#F5F5F4', 5, 15, 1);
      torso(c, -24, -46, 18, 18, '#D97706');
      for (let k = 0; k < 10; k++) blob(c, () => c.ellipse(-7 + (k * 5) % 14, -44 + Math.floor(k / 3) * 6, 1.4, 1, 0, 0, Math.PI * 2), '#422006', -8, 8, 0.4);
      arm(c, -8, -44, -6, -28, '#D97706', SKIN.light, 0.3, 5);
      arm(c, 8, -44, 14, -32, '#D97706', SKIN.light, 0.3, 5);
      const open = (f % 90) < 45;
      dot(c, 13, -34, 6, 2, '#57534E'); if (open) { dot(c, 18, -36, 7, 1.5, '#E5E7EB'); }
      head(c, 0, -57, 8.5, 9.5, SKIN.light);
      for (let k = 0; k < 9; k++) blob(c, () => c.arc(-8 + (k % 5) * 4, -65 + Math.floor(k / 5) * 4 - (k % 2), 3.6, 0, Math.PI * 2), '#FCD34D', -12, 12, 0.8);
      eyes(c, 1, -58, 3.8, 'smug', f, 0.5, 2.2, dk(SKIN.light, 0.12));
      nose(c, 4, -54, 2.2, SKIN.light);
      mouth(c, 2, -50, 5, t(talk, 'flat'), f);
      dot(c, 4, -51, 6, 1.4, '#F5F5F4'); dot(c, 10, -51, 1.4, 1.4, '#F97316');
      for (let k = 0; k < 3; k++) { const s = ((f * 0.6 + k * 20) % 60) / 60; c.fillStyle = `rgba(200, 200, 200, ${(0.6 * (1 - s)).toFixed(2)})`; c.beginPath(); c.arc(11 + Math.sin(s * 6 + k) * 2, -53 - s * 18, 1.5 + s * 2.5, 0, Math.PI * 2); c.fill(); }
    },
  },
  {
    // LILLY: the honor student. Slim, dark braids, round glasses, a mint cardigan, a plaid skirt, knee socks, a stack
    // of books held to her chest
    id: 'lilly', name: 'LILLY',
    draw: (c, f, talk) => {
      const b = breathe(f, 11);
      legs(c, -28, 3.5, 5, '#F8FAFC', SKIN.brown, '#18181B', 'skirt', 8);
      for (const s of [-1, 1]) dot(c, s * 3.5 - 2.5, -14, 5, 10, '#F8FAFC');
      c.translate(0, b);
      blob(c, () => { c.moveTo(-8, -30); c.lineTo(8, -30); c.lineTo(11, -18); c.lineTo(-11, -18); c.closePath(); }, '#7F1D1D', -11, 11);
      for (let k = -9; k < 10; k += 4) dot(c, k, -29, 1, 11, '#1E3A8A');
      torso(c, -29, -50, 17, 16, '#6EE7B7');
      rect(c, -2, -46, 12, 10, '#DC2626', 1); rect(c, -1, -50, 11, 4, '#2563EB', 1);
      arm(c, -8, -48, -9, -30, '#6EE7B7', SKIN.brown, 1, 4.5);
      arm(c, 8, -48, 6, -40, '#6EE7B7', SKIN.brown, 1, 4.5);
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) blob(c, () => c.ellipse(s * 9, -60 + k * 4, 2.4, 2.2, 0, 0, Math.PI * 2), '#1C1917', s * 9 - 2, s * 9 + 2, 0.6);
      head(c, 0, -62, 8.5, 9.5, SKIN.brown);
      blob(c, () => c.ellipse(0, -69, 9, 4.5, 0, Math.PI, 0), '#1C1917', -9, 9);
      eyes(c, 1, -63, 3.8, 'open', f, 0.5, 2.2);
      specs(c, 1, -63, 3.8, 3, '#7C3AED', 'round');
      nose(c, 3, -59, 2, SKIN.brown);
      mouth(c, 1, -55, 5, t(talk, 'smile'), f);
    },
  },
  {
    // ED: the teacher. Balding, gray at the sides, a mustache, a sweater vest over a shirt and tie, khakis, a mug of
    // coffee he looks like he needs
    id: 'ed', name: 'ED',
    draw: (c, f, talk) => {
      const b = breathe(f, 12);
      legs(c, -30, 4, 7, '#C8B88A', SKIN.light, '#78350F');
      c.translate(0, b);
      torso(c, -30, -53, 21, 20, '#F8FAFC');
      blob(c, () => { c.moveTo(-9, -50); c.lineTo(0, -40); c.lineTo(9, -50); c.lineTo(9, -30); c.lineTo(-9, -30); c.closePath(); }, '#92400E', -9, 9);
      dot(c, -1, -52, 2, 10, '#B91C1C');
      arm(c, -10, -51, -12, -32, '#F8FAFC', SKIN.light, 1, 5);
      arm(c, 10, -51, 14, -40, '#F8FAFC', SKIN.light, 1, 5);
      rect(c, 13, -46, 7, 8, '#F5F5F4', 1.5); c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(21, -42, 2.2, -1.4, 1.4); c.stroke();
      head(c, 0, -64, 9.5, 10, SKIN.light);
      for (const s of [-1, 1]) blob(c, () => c.ellipse(s * 8, -66, 2.5, 5, 0, 0, Math.PI * 2), '#9CA3AF', s * 8 - 3, s * 8 + 3, 0.8);
      dot(c, -2, -73, 5, 1.2, lt(SKIN.light, 0.4));
      eyes(c, 1, -65, 4, 'tired', f, 0.4, 2.3, dk(SKIN.light, 0.12));
      nose(c, 4, -61, 2.4, SKIN.light);
      blob(c, () => c.ellipse(2, -58, 5, 1.7, 0, 0, Math.PI * 2), '#78716C', -3, 7, 0.6);
      mouth(c, 2, -55.5, 4, t(talk, 'flat'), f);
    },
  },
  {
    // BEV: the old church lady. Tiny, a little stooped, a blue-rinse hairdo under a purple church hat with a flower,
    // a floral dress, a purse the size of a suitcase, a cane, a sweet smile and eyes that aren't sweet at all
    id: 'bev', name: 'BEV',
    draw: (c, f, talk) => {
      const b = breathe(f, 13) * 0.5;
      legs(c, -22, 3.5, 5, '#E7E5E4', SKIN.pink, '#292524', 'skirt', 7);
      c.translate(0, b);
      c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(14, 0); c.lineTo(13, -26); c.quadraticCurveTo(13, -30, 9, -29); c.stroke(); c.strokeStyle = '#78350F'; c.lineWidth = 1.2; c.stroke();
      blob(c, () => { c.moveTo(-7, -42); c.lineTo(7, -42); c.lineTo(12, -12); c.lineTo(-12, -12); c.closePath(); }, '#F9A8D4', -12, 12);
      for (let k = 0; k < 8; k++) blob(c, () => c.arc(-7 + (k * 5) % 15, -38 + Math.floor(k / 3) * 9, 1.8, 0, Math.PI * 2), k % 2 ? '#FDE047' : '#A78BFA', -9, 9, 0.5);
      arm(c, -7, -40, -12, -26, '#F9A8D4', SKIN.pink, 0.5, 4.5);
      rect(c, -20, -28, 12, 11, '#7C2D12', 2); c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.arc(-14, -28, 4, Math.PI, 0); c.stroke();
      arm(c, 7, -40, 12, -28, '#F9A8D4', SKIN.pink, 0.5, 4.5);
      head(c, 1, -50, 8, 8.5, SKIN.pink);
      blob(c, () => { c.ellipse(1, -57, 10, 5, 0, Math.PI, 0); }, '#93C5FD', -9, 11);
      blob(c, () => { c.ellipse(1, -60, 12, 3, 0, 0, Math.PI * 2); }, '#7E22CE', -11, 13, 1);
      blob(c, () => { c.ellipse(1, -63, 7, 4, 0, Math.PI, 0); }, '#7E22CE', -6, 8);
      blob(c, () => c.arc(8, -63, 2.5, 0, Math.PI * 2), '#F472B6', 5, 11, 0.8);
      eyes(c, 2, -51, 3.4, 'smug', f, 0.8, 2, dk(SKIN.pink, 0.1));
      nose(c, 4, -48, 1.8, SKIN.pink);
      mouth(c, 2, -45, 4, t(talk, 'smile'), f);
    },
  },
  {
    // TIFFANIE: the bank villain. Tall, slim, huge teased auburn hair, a red power suit with shoulder pads, pearls, red
    // nails, a briefcase, the smile of someone foreclosing on you
    id: 'tiffanie', name: 'TIFFANIE',
    draw: (c, f, talk) => {
      const b = breathe(f, 14);
      legs(c, -33, 3, 5, '#B91C1C', SKIN.light, '#18181B', 'skirt', 7);
      c.translate(0, b);
      blob(c, () => { c.moveTo(-8, -33); c.lineTo(8, -33); c.lineTo(9, -18); c.lineTo(-9, -18); c.closePath(); }, '#B91C1C', -9, 9);
      torso(c, -33, -56, 26, 14, '#DC2626');
      for (let k = 0; k < 7; k++) blob(c, () => c.arc(-6 + k * 2, -53 + Math.sin(k / 6 * Math.PI) * 3, 1.2, 0, Math.PI * 2), '#F8FAFC', -7, 7, 0.4);
      arm(c, -12, -54, -15, -34, '#DC2626', SKIN.light, 1, 4.5);
      rect(c, -22, -34, 12, 10, '#292524', 1.5); dot(c, -17, -36, 3, 2, '#CA8A04');
      arm(c, 12, -54, 14, -44, '#DC2626', SKIN.light, 1, 4.5);
      dot(c, 13, -42, 2, 1, '#DC2626');
      blob(c, () => { c.ellipse(0, -72, 15, 13, 0, 0, Math.PI * 2); }, '#9A3412', -15, 15);
      head(c, 0, -66, 8, 10, SKIN.light, false);
      eyes(c, 1, -67, 3.6, 'smug', f, 0.6, 2.2, '#C084FC');
      nose(c, 4, -63, 2, SKIN.light, 1.5);
      mouth(c, 1.5, -59, 5, t(talk, 'smirk'), f);
      dot(c, -1, -59.5, 5, 1.2, '#DC2626');
    },
  },
  {
    // BILLIE: the executive at the burger chain. A navy skirt suit with a burger pin, a slicked black bun, a lanyard,
    // on her phone, always
    id: 'billie', name: 'BILLIE',
    draw: (c, f, talk) => {
      const b = breathe(f, 15);
      legs(c, -30, 3, 5, '#1E293B', SKIN.tan, '#18181B', 'skirt', 7);
      c.translate(0, b);
      blob(c, () => { c.moveTo(-8, -30); c.lineTo(8, -30); c.lineTo(9, -16); c.lineTo(-9, -16); c.closePath(); }, '#1E293B', -9, 9);
      torso(c, -30, -52, 19, 16, '#1E3A8A');
      blob(c, () => c.ellipse(-5, -46, 2.6, 1.8, 0, 0, Math.PI * 2), '#F59E0B', -8, -2, 0.6); dot(c, -7, -46, 4, 0.8, '#65A30D');
      c.strokeStyle = '#DC2626'; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, -52); c.lineTo(0, -40); c.lineTo(3, -52); c.stroke(); rect(c, -2, -41, 4, 5, '#F8FAFC', 0.8);
      arm(c, -9, -50, -11, -31, '#1E3A8A', SKIN.tan, 1, 4.5);
      arm(c, 9, -50, 7, -64, '#1E3A8A', SKIN.tan, 0.85, 4.5);
      rect(c, 6, -70, 3, 8, '#18181B', 1);
      head(c, 0, -64, 8.5, 9.5, SKIN.tan);
      blob(c, () => c.ellipse(-1, -70, 9, 5, 0, Math.PI, 0), '#18181B', -10, 8);
      blob(c, () => c.arc(-8, -72, 4, 0, Math.PI * 2), '#18181B', -12, -4, 1);
      eyes(c, 1, -65, 3.6, 'open', f, 0.2, 2.2);
      nose(c, 3.5, -61, 2, SKIN.tan);
      mouth(c, 1.5, -57, 4.5, 'talk', f);
    },
  },
  {
    // LUCILLE: the curse-caster. A purple headscarf hung with coins, big hoop earrings, a red shawl, a long skirt, a
    // crystal ball glowing in her hands, heavy eye shadow
    id: 'lucille', name: 'LUCILLE',
    draw: (c, f, talk) => {
      const b = breathe(f, 16);
      walkFeet(c, 5, '#18181B');
      blob(c, () => { c.moveTo(-10, -30); c.lineTo(10, -30); c.lineTo(14, -2); c.lineTo(-14, -2); c.closePath(); }, '#15803D', -14, 14);
      for (let k = -12; k < 13; k += 5) dot(c, k, -6, 3, 3, '#FACC15');
      c.translate(0, b);
      torso(c, -30, -52, 20, 20, '#7C3AED');
      blob(c, () => { c.moveTo(-12, -52); c.lineTo(12, -52); c.lineTo(4, -34); c.lineTo(-4, -34); c.closePath(); }, '#B91C1C', -12, 12);
      arm(c, -10, -50, -2, -40, '#B91C1C', SKIN.brown, 0.6, 5);
      arm(c, 10, -50, 6, -40, '#B91C1C', SKIN.brown, 0.6, 5);
      const glow = 0.4 + 0.3 * Math.sin(f * 0.1);
      c.fillStyle = `rgba(167, 139, 250, ${glow.toFixed(2)})`; c.beginPath(); c.arc(2, -46, 9, 0, Math.PI * 2); c.fill();
      blob(c, () => c.arc(2, -46, 6, 0, Math.PI * 2), '#C4B5FD', -4, 8, 1);
      dot(c, -1, -49, 2, 2, '#FFFFFF');
      head(c, 0, -63, 8.5, 9.5, SKIN.brown);
      blob(c, () => { c.ellipse(0, -66, 10.5, 8, 0, Math.PI, 0); c.lineTo(-12, -58); c.lineTo(-10, -66); }, '#6D28D9', -12, 11);
      for (let k = 0; k < 6; k++) blob(c, () => c.arc(-8 + k * 3.2, -66, 1.2, 0, Math.PI * 2), '#FACC15', -10, 10, 0.4);
      for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(s * 9, -57, 3, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#FACC15'; c.lineWidth = 1; c.stroke(); }
      eyes(c, 1, -63, 3.8, 'smug', f, 0.4, 2.3, '#7C3AED');
      nose(c, 4, -59, 2.6, SKIN.brown, 1);
      mouth(c, 1.5, -55, 5, t(talk, 'grin'), f);
    },
  },
  {
    // LARRY: the one who's very online. Pale, a neckbeard, a black brimmed hat, a tee with a pink anime face on it,
    // cargo shorts, an energy drink, never looks at anybody
    id: 'larry', name: 'LARRY',
    draw: (c, f, talk) => {
      const b = breathe(f, 17);
      legs(c, -28, 4, 7, '#78716C', SKIN.pale, '#E5E7EB', 'shorts');
      c.translate(0, b);
      torso(c, -28, -50, 21, 25, '#18181B');
      blob(c, () => c.ellipse(1, -40, 5.5, 5, 0, 0, Math.PI * 2), '#FBCFE8', -5, 7, 0.8);
      dot(c, -1.5, -41, 1.5, 2, '#1E3A8A'); dot(c, 2.5, -41, 1.5, 2, '#1E3A8A'); dot(c, -4, -45, 10, 2, '#F472B6');
      arm(c, -10, -48, -12, -30, '#18181B', SKIN.pale, 0.3, 5.5);
      arm(c, 10, -48, 13, -40, '#18181B', SKIN.pale, 0.3, 5.5);
      rect(c, 11, -48, 5, 10, '#22C55E', 1.5); dot(c, 12, -45, 3, 2, '#18181B');
      head(c, 0, -61, 9.5, 10, SKIN.pale);
      for (let k = 0; k < 12; k++) dot(c, -7 + (k * 5) % 15, -55 + Math.floor(k / 4) * 2, 1.5, 1.5, '#57534E');
      eyes(c, 1, -63, 4, 'droopy', f, -0.8, 2.2, dk(SKIN.pale, 0.12));
      nose(c, 3.5, -59, 2.4, SKIN.pale);
      mouth(c, 1.5, -56, 4, t(talk, 'flat'), f);
      blob(c, () => c.ellipse(0, -69, 15, 3, 0, 0, Math.PI * 2), '#18181B', -15, 15, 1);
      blob(c, () => { c.moveTo(-8, -69); c.lineTo(-7, -78); c.quadraticCurveTo(0, -81, 7, -78); c.lineTo(8, -69); c.closePath(); }, '#18181B', -8, 8);
      dot(c, -8, -71, 16, 2, '#7F1D1D');
    },
  },
  {
    // JENNY: the TV host. A sleek black bob, a hot-pink blazer, a microphone held out to whoever's next, a big smile
    id: 'jenny', name: 'JENNY',
    draw: (c, f, talk) => {
      const b = breathe(f, 18);
      legs(c, -30, 3.5, 5, '#18181B', SKIN.dark, '#DB2777', 'pants', 7);
      c.translate(0, b);
      torso(c, -30, -52, 20, 17, '#DB2777');
      blob(c, () => { c.moveTo(-3, -52); c.lineTo(3, -52); c.lineTo(0, -42); c.closePath(); }, '#F8FAFC', -3, 3, 0.6);
      arm(c, -9, -50, -10, -31, '#DB2777', SKIN.dark, 1, 4.5);
      arm(c, 9, -50, 20, -50, '#DB2777', SKIN.dark, 0.9, 4.5);
      rect(c, 21, -55, 3, 9, '#18181B', 1); blob(c, () => c.arc(22.5, -56, 3, 0, Math.PI * 2), '#9CA3AF', 19.5, 25.5, 1);
      rect(c, 19.5, -50, 6, 3, '#1D4ED8', 0.8);
      blob(c, () => { c.moveTo(-10, -58); c.quadraticCurveTo(-11, -74, 0, -74); c.quadraticCurveTo(11, -74, 10, -58); c.lineTo(10, -56); c.lineTo(-10, -56); c.closePath(); }, '#0C0A09', -11, 11);
      head(c, 0, -64, 8.5, 9.5, SKIN.dark, false);
      blob(c, () => c.ellipse(1, -71, 9, 3.5, 0.1, Math.PI, 0), '#0C0A09', -8, 10);
      eyes(c, 1, -65, 3.8, 'open', f, 0.7, 2.2);
      nose(c, 3.5, -61, 2, SKIN.dark);
      mouth(c, 1.5, -57, 6, t(talk, 'grin'), f);
    },
  },
  {
    // RUTH: the one who might be from somewhere else. Short white hair, big round tinted glasses, a silver jumpsuit,
    // a lanyard, a tablet she's always writing on
    id: 'ruth', name: 'RUTH',
    draw: (c, f, talk) => {
      const b = breathe(f, 19);
      legs(c, -30, 3.5, 6, '#A1A1AA', SKIN.pale, '#F8FAFC');
      c.translate(0, b);
      torso(c, -30, -52, 19, 18, '#D4D4D8');
      dot(c, -1, -52, 2, 22, '#A1A1AA');
      c.strokeStyle = '#2563EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -52); c.lineTo(0, -40); c.lineTo(4, -52); c.stroke(); rect(c, -2, -41, 4, 5, '#F8FAFC', 0.8);
      arm(c, -9, -50, -1, -40, '#D4D4D8', SKIN.pale, 1, 4.5);
      arm(c, 9, -50, 10, -40, '#D4D4D8', SKIN.pale, 1, 4.5);
      rect(c, -2, -46, 12, 9, '#18181B', 1.5); dot(c, -1, -45, 10, 7, (f >> 5) % 2 ? '#22D3EE' : '#67E8F9');
      head(c, 0, -63, 8.5, 9.5, SKIN.pale);
      blob(c, () => c.ellipse(0, -68, 9.5, 6, 0, Math.PI, 0), '#F5F5F4', -9.5, 9.5);
      eyes(c, 1, -64, 4, 'open', f, 0.3, 2.3);
      specs(c, 1, -64, 4, 3.8, '#A855F7', 'round', 'rgba(168, 85, 247, 0.35)');
      nose(c, 4, -60, 2, SKIN.pale);
      mouth(c, 1.5, -56, 4, t(talk, 'flat'), f);
    },
  },
  {
    // ANNA: long box braids in a high ponytail, a denim jacket over a yellow tee, black jeans, arms folded, unimpressed
    id: 'anna', name: 'ANNA',
    draw: (c, f, talk) => {
      const b = breathe(f, 20);
      legs(c, -30, 3.5, 6, '#18181B', SKIN.dark, '#F8FAFC');
      c.translate(0, b);
      const sway = Math.sin(f * 0.06) * 2;
      for (let k = 0; k < 4; k++) { c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-4, -74); c.quadraticCurveTo(-14 + sway, -66, -12 - k * 1.5 + sway, -48 + k * 2); c.stroke(); c.strokeStyle = '#292524'; c.lineWidth = 2; c.stroke(); }
      torso(c, -30, -52, 20, 17, '#60A5FA');
      blob(c, () => { c.moveTo(-4, -52); c.lineTo(4, -52); c.lineTo(3, -32); c.lineTo(-3, -32); c.closePath(); }, '#FDE047', -4, 4, 0.6);
      arm(c, -9, -50, 6, -40, '#60A5FA', SKIN.dark, 1, 5);
      arm(c, 9, -50, -6, -38, '#60A5FA', SKIN.dark, 1, 5);
      head(c, 0, -63, 8.5, 9.5, SKIN.dark);
      blob(c, () => c.ellipse(0, -68, 9, 5.5, 0, Math.PI, 0), '#292524', -9, 9);
      blob(c, () => c.arc(-4, -74, 3.4, 0, Math.PI * 2), '#292524', -7.5, -0.5, 1);
      eyes(c, 1, -64, 3.8, 'smug', f, 0.2, 2.2, dk(SKIN.dark, 0.12));
      nose(c, 3.5, -60, 2.2, SKIN.dark);
      mouth(c, 1.5, -56, 4.5, t(talk, 'smirk'), f);
    },
  },
  {
    // STELLA: long red hair, a green beret, painter's overalls spattered with every color, a brush behind her ear
    id: 'stella', name: 'STELLA',
    draw: (c, f, talk) => {
      const b = breathe(f, 21);
      legs(c, -30, 3.5, 6, '#93C5FD', SKIN.light, '#A16207');
      c.translate(0, b);
      blob(c, () => c.roundRect(-11, -60, 22, 46, 6), '#DC2626', -11, 11);
      torso(c, -30, -52, 19, 18, '#F8FAFC');
      rect(c, -8, -46, 16, 17, '#93C5FD', 2); for (const s of [-1, 1]) dot(c, s * 6 - 1, -52, 2, 7, '#93C5FD');
      for (const [x, y, col] of [[-5, -42, '#F472B6'], [3, -38, '#FDE047'], [-2, -34, '#22C55E'], [5, -44, '#A855F7']] as const) blob(c, () => c.arc(x, y, 1.5, 0, Math.PI * 2), col, x - 2, x + 2, 0.4);
      arm(c, -9, -50, -11, -31, '#F8FAFC', SKIN.light, 0.3, 4.5);
      arm(c, 9, -50, 13, -33, '#F8FAFC', SKIN.light, 0.3, 4.5);
      head(c, 0, -64, 8.5, 9.5, SKIN.light, false);
      blob(c, () => c.ellipse(0, -69, 9.5, 5.5, 0, Math.PI, 0), '#DC2626', -9.5, 9.5);
      blob(c, () => c.ellipse(-1, -73, 9, 3.6, -0.2, 0, Math.PI * 2), '#15803D', -10, 8);
      dot(c, 6, -70, 9, 1.5, '#A16207'); dot(c, 14, -71, 2, 3, '#3B82F6');
      eyes(c, 1, -65, 3.8, 'open', f, 0.5, 2.2);
      for (let k = 0; k < 5; k++) dot(c, -5 + k * 2.5, -61, 1, 1, '#C2410C');
      nose(c, 3.5, -61, 2, SKIN.light);
      mouth(c, 1.5, -57, 5, t(talk, 'smile'), f);
    },
  },
  {
    // THE BABY: in a stroller, slicked-back hair, a pacifier, eyes far too old for him
    id: 'baby', name: 'BABY',
    draw: (c, f) => {
      for (const x of [-9, 9]) { c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.arc(x, -5, 4.5, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#52525B'; c.lineWidth = 1.4; c.stroke(); }
      blob(c, () => { c.moveTo(-14, -12); c.lineTo(14, -12); c.quadraticCurveTo(16, -30, 4, -32); c.lineTo(-14, -30); c.closePath(); }, '#F9A8D4', -14, 16);
      blob(c, () => { c.moveTo(-14, -30); c.quadraticCurveTo(-18, -46, -2, -46); c.lineTo(-4, -30); c.closePath(); }, '#DB2777', -18, -2);
      c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(14, -18); c.lineTo(22, -36); c.lineTo(26, -36); c.stroke();
      head(c, 3, -34, 7, 6.5, SKIN.light);
      blob(c, () => c.ellipse(3, -39, 7, 3, 0, Math.PI, 0), '#1C1917', -4, 10);
      dot(c, -2, -40, 9, 0.8, '#57534E');
      eyes(c, 4, -35, 2.8, 'smug', f, 0.5, 1.7, dk(SKIN.light, 0.15));
      blob(c, () => c.arc(5, -30.5, 2.2, 0, Math.PI * 2), '#38BDF8', 3, 7.5, 0.8);
      dot(c, 4.5, -31, 1, 1, '#F8FAFC');
    },
  },
];

