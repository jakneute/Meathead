// The MONA LISA, grossed up (the park's rule: a picture singling out one person is a Ren & Stimpy gross-up). Still her
// at a glance (the folded hands, the dark veil and hair, the half smile, the hazy landscape with its winding road and
// its bridge, the browns and greens) but up close: bulging bloodshot eyes with yellowed whites, pores, a greasy sheen
// and sweat running, blackheads, a mustache shadow, a too-wide smirk with yellow teeth and a spit strand, a cold sore,
// a chin wart with its hair, a double chin, flaking skin, dandruff, sausage fingers with dirty nails, a fly on her
// forehead, all under cracked yellowed varnish. Painted once (per hour) into a master canvas at 4x the size she hangs
// at, then put down scaled (smoothed: the sfumato does the rest): one drawImage wherever she appears, at any size.

import { hour, timeOfDay } from '../kit';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];
/** The master's grid (4x the stand's print, 44 x 54). */
const W = 176, H = 216;

const rng = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** Paints her on the 176 x 216 grid; `tint` puts a color in the hour. */
export const paintMonaMaster = (g: Ctx, tint: (c: string) => string) => {
  const T = new Map<string, string>();
  const C = (c: string) => { let t = T.get(c); if (t === undefined) { t = tint(c); T.set(c, t); } return t; };
  const r = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = C(c); g.fillRect(x, y, w, h); };
  const el = (x: number, y: number, rx: number, ry: number, c: string, rot = 0) => { g.fillStyle = C(c); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
  const pg = (pts: Pt[], c: string) => { g.fillStyle = C(c); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); g.fill(); };
  const ln = (pts: Pt[], c: string, w = 1) => { g.strokeStyle = C(c); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.stroke(); };
  const a = (k: number, f: () => void) => { const was = g.globalAlpha; g.globalAlpha = k; f(); g.globalAlpha = was; };
  const rnd = rng(1503);
  /** Her head (hair, veil, neck, face) drawn bigger than life: a gross-up, the neck's foot held over her chest. */
  const head = (f: () => void) => { g.save(); g.translate(88, 114); g.scale(1.2, 1.2); g.translate(-88, -104); f(); g.restore(); };
  const inFace = (x: number, y: number) => ((x - 88) / 22) ** 2 + ((y - 56) / 28) ** 2 < 1;

  // --- The landscape: the hazy sky in bands, the blue-green crags, the lake, the winding road, the bridge -----------
  const SKY = ['#B4BE96', '#A8B68E', '#9CAE88', '#93A684', '#8A9E7E', '#83967A'];
  SKY.forEach((c, k) => r(0, k * 8, W, 9, c));
  for (let k = 1; k < SKY.length; k++) for (let x = (k % 2) * 2; x < W; x += 4) r(x, k * 8 - 1, 2, 1, SKY[k - 1]);
  // (far crags, bluish, both sides; jagged)
  pg([[0, 62], [0, 30], [8, 24], [14, 32], [22, 20], [30, 30], [38, 26], [48, 40], [56, 38], [62, 62]], '#7E9A8E');
  pg([[114, 58], [120, 34], [128, 22], [136, 30], [146, 16], [156, 28], [164, 22], [176, 30], [176, 58]], '#7E9A8E');
  pg([[0, 70], [0, 46], [10, 40], [20, 50], [32, 42], [44, 54], [60, 70]], '#6E8A7A');
  pg([[116, 70], [124, 50], [138, 44], [150, 52], [162, 40], [176, 46], [176, 70]], '#6E8A7A');
  for (const [x, y] of [[22, 20], [146, 16], [128, 22]] as Pt[]) ln([[x - 4, y + 8], [x, y], [x + 3, y + 6]], '#B8CAB8', 1);
  // (the lake on the left, pale; the river on the right)
  el(26, 66, 26, 6, '#B6C4A8'); el(22, 65, 14, 2, '#D0D8C0');
  el(150, 70, 28, 4, '#A8B89E');
  // (mid ground: earthy, rocky, in bands)
  pg([[0, 120], [0, 72], [12, 70], [26, 78], [40, 74], [58, 84], [62, 120]], '#6A6E44');
  pg([[114, 120], [116, 78], [130, 74], [146, 80], [160, 72], [176, 76], [176, 120]], '#6A6E44');
  pg([[0, 120], [0, 92], [14, 88], [34, 96], [50, 92], [62, 104], [62, 120]], '#545A34');
  pg([[114, 120], [118, 96], [134, 92], [150, 98], [176, 92], [176, 120]], '#545A34');
  // (the winding road, left)
  ln([[58, 118], [40, 112], [24, 106], [34, 98], [48, 92], [30, 86], [14, 82], [26, 76]], '#3A3A22', 4);
  ln([[58, 118], [40, 112], [24, 106], [34, 98], [48, 92], [30, 86], [14, 82], [26, 76]], '#B0905E', 2);
  // (the bridge, right: its arches over the river)
  r(132, 96, 36, 4, '#3A3020'); r(132, 96, 36, 1, '#B09068');
  for (let k = 0; k < 3; k++) { const bx = 134 + k * 11; r(bx, 100, 2, 8, '#6A5236'); g.fillStyle = C('#3A3020'); g.beginPath(); g.arc(bx + 6.5, 106, 4, Math.PI, 0); g.fill(); }
  r(132, 106, 36, 3, '#8A9A7E');
  // (the haze over it all: the sfumato)
  a(0.22, () => { for (let k = 0; k < 6; k++) r(0, 18 + k * 16, W, 6, '#D8DEC0'); });
  // (the parapet behind her, the dark below)
  r(0, 120, W, 8, '#3E3820'); r(0, 120, W, 1, '#7A7044'); r(0, 128, W, H - 128, '#2A2414');
  for (const px of [4, 166]) { r(px, 128, 6, H - 128, '#3A321C'); r(px, 128, 1, H - 128, '#5A4E2C'); }

  // --- Her hair and veil (behind her), her dress ---------------------------------------------------------------------
  head(() => {
  pg([[56, 40], [62, 20], [76, 10], [100, 10], [114, 20], [120, 40], [122, 80], [126, 112], [118, 124], [108, 104], [66, 104], [56, 124], [48, 112], [54, 80]], '#22160C');
  for (let k = 0; k < 7; k++) { const s = k < 4 ? -1 : 1, o = (k % 4) * 2; ln([[88 + s * (22 + o), 24], [88 + s * (26 + o), 50], [88 + s * (26 + o), 80], [88 + s * (30 + o), 106]], '#48301C', 1); }
  // (grease in the hair: a shine along the part)
  ln([[78, 14], [72, 22], [66, 34]], '#7A6040', 1.5); ln([[98, 14], [104, 22], [110, 34]], '#6A5034', 1.5);
  });
  // (the dress: dark, olive-brown, widening down; the neckline scooped)
  pg([[52, 112], [70, 102], [106, 102], [124, 112], [150, 150], [160, 216], [16, 216], [26, 150]], '#3A3218');
  pg([[52, 112], [70, 102], [80, 104], [60, 140], [40, 180], [22, 200], [26, 150]], '#2C2612');
  for (let k = 0; k < 10; k++) { const x = 40 + k * 10; ln([[x + 4, 112], [x + 2, 150], [x - 2, 216]], '#2A2410', 1); }
  // (the veil: thin and dark over the hair, down past her shoulders)
  head(() => {
    a(0.45, () => pg([[58, 30], [64, 16], [78, 8], [98, 8], [112, 16], [118, 30], [124, 100], [116, 104], [60, 104], [52, 100]], '#14100A'));
    ln([[60, 26], [70, 14], [88, 10], [106, 14], [116, 26]], '#5A4A38', 0.8);
  });
  // (the chest, the low neckline, its embroidery)
  pg([[62, 108], [114, 108], [110, 122], [100, 132], [76, 132], [66, 122]], '#C4A066');
  pg([[100, 108], [114, 108], [110, 122], [100, 132]], '#9A7A48');
  for (let x = 62; x <= 114; x += 3) { const y = x < 76 ? 108 + (x - 62) * 1.6 : x > 100 ? 108 + (114 - x) * 1.6 : 131; r(x, y, 2, 2, '#A08840'); }
  // (cleavage sweat: a bead running)
  el(88, 126, 1.2, 2, '#F4ECD0'); ln([[88, 119], [88, 125]], '#E8D8A8', 0.8);
  // (the sleeves: mustard-brown, gathered in folds, coming round to the hands)
  pg([[26, 150], [48, 136], [74, 160], [90, 186], [70, 196], [40, 200], [20, 196]], '#7A5E28');
  pg([[150, 150], [130, 136], [110, 166], [100, 184], [124, 190], [150, 196], [158, 190]], '#7A5E28');
  for (let k = 0; k < 6; k++) {
    ln([[30 + k * 8, 150 + k * 2], [40 + k * 7, 196]], '#4E3A14', 1.5); ln([[32 + k * 8, 150 + k * 2], [42 + k * 7, 194]], '#A88A48', 0.8);
    ln([[146 - k * 7, 150 + k * 3], [134 - k * 5, 192]], '#4E3A14', 1.5); ln([[144 - k * 7, 150 + k * 3], [132 - k * 5, 190]], '#A88A48', 0.8);
  }

  // --- Her neck, her double chin, her face ---------------------------------------------------------------------------
  head(() => {
  const SK = '#C4A062', SKd = '#9A7642', SKdd = '#6E5230', SKl = '#DEBE80', SKh = '#F2DCA4';
  r(76, 80, 26, 21, SK); r(94, 80, 8, 21, SKd); ln([[78, 96], [88, 99], [100, 96]], SKd, 1);
  // (the second chin: a jowl hanging under the first)
  el(88, 86, 20, 9, SK); el(96, 88, 10, 6, SKd);
  ln([[70, 86], [78, 92], [88, 94], [98, 92], [106, 86]], SKdd, 1.2);
  el(88, 56, 22, 28, SK);
  // (the light from her right, our left: the shadow down her far cheek; the high bare forehead lit)
  g.save(); g.beginPath(); g.ellipse(88, 56, 22, 28, 0, 0, Math.PI * 2); g.clip();
  el(108, 60, 12, 30, SKd); el(112, 62, 6, 28, SKdd);
  el(82, 36, 14, 10, SKl); el(80, 34, 7, 4, SKh);
  el(74, 64, 6, 5, '#D09068'); el(102, 64, 5, 5, '#B07A52');
  // (pores: all over it)
  for (let k = 0; k < 520; k++) { const x = 66 + rnd() * 44, y = 28 + rnd() * 56; if (inFace(x, y)) r(Math.floor(x), Math.floor(y), 1, 1, rnd() < 0.7 ? '#8E6A3C' : '#E2C890'); }
  // (flaking skin: pale ragged patches on the forehead and the cheek)
  for (const [fx, fy, n] of [[74, 32, 9], [100, 40, 6], [72, 70, 6]] as [number, number, number][]) for (let k = 0; k < n; k++) { const x = fx + rnd() * 8, y = fy + rnd() * 4; r(Math.floor(x), Math.floor(y), 2, 1, '#EEE6C8'); r(Math.floor(x), Math.floor(y) + 1, 1, 1, '#7A5A34'); }
  g.restore();
  // (her jaw's edge, inked soft)
  a(0.5, () => { g.strokeStyle = C('#4A3420'); g.lineWidth = 1; g.beginPath(); g.ellipse(88, 56, 22, 28, 0, 0.1, Math.PI - 0.1); g.stroke(); });

  // (the eyes: bags under them, bulging yellowed whites, veins, the irises off a touch, red raw rims)
  for (const [ex, ix] of [[78, 80], [100, 101]] as Pt[]) {
    el(ex, 57, 9, 5, '#8A6440'); el(ex, 58, 8, 3, '#7A5634'); ln([[ex - 7, 60], [ex, 62], [ex + 7, 60]], '#5A3E22', 0.8);
    el(ex, 51, 8.5, 6.5, '#3A2414');
    el(ex, 51, 7.5, 5.5, '#E2D492'); el(ex - 2, 50, 4, 2.5, '#F4ECBC');
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + 0.3, x0 = ex + Math.cos(ang) * 7, y0 = 51 + Math.sin(ang) * 5; ln([[x0, y0], [ex + Math.cos(ang) * 4.5 + (rnd() - 0.5) * 2, 51 + Math.sin(ang) * 3], [ex + Math.cos(ang) * 3.5, 51 + Math.sin(ang) * 2.4]], '#C42A22', 0.7); }
    el(ix, 51.5, 3.6, 3.6, '#4A2E12'); el(ix, 51.5, 2.4, 2.4, '#6A4420'); el(ix, 51.5, 1.4, 1.4, '#080402'); r(ix - 2, 49, 1.5, 1.5, '#FFFFFF');
    ln([[ex - 8, 50], [ex - 4, 45.5], [ex + 4, 45.5], [ex + 8, 50]], '#2A1A0C', 1.4);
    ln([[ex - 7, 54], [ex, 56.5], [ex + 7, 54]], '#C25A52', 1);
    // (no eyebrows, as painted: a few stray hairs where they'd be)
    for (let k = 0; k < 4; k++) ln([[ex - 5 + k * 3, 42 + rnd()], [ex - 4 + k * 3, 40 + rnd()]], '#4A3220', 0.6);
  }
  // (crusty gunk in the inner corners)
  el(85, 52, 1.2, 1, '#E8D070'); el(93, 52, 1.2, 1, '#E8D070');

  // (the nose: long, shiny, the tip red and bulbous, blackheads, nostril hairs)
  pg([[86, 48], [90, 48], [94, 64], [90, 66]], SKd);
  ln([[87, 48], [86, 60]], SKh, 1.4);
  el(89, 65, 5.5, 4, '#D08A66'); el(87, 63.5, 2, 1.4, '#FFF2D8');
  el(85.5, 67.5, 1.8, 1.2, '#2A1408'); el(92.5, 67.5, 1.8, 1.2, '#2A1408');
  for (const [x, y] of [[85, 62], [87, 66], [91, 63], [93, 65], [90, 61], [84, 65], [92, 60], [88, 58]] as Pt[]) r(x, y, 1, 1, '#140C06');
  ln([[85, 68], [84.5, 70]], '#1A1008', 0.6); ln([[86.5, 68], [87, 70.5]], '#1A1008', 0.6); ln([[93, 68], [93.5, 70]], '#1A1008', 0.6);

  // (the mustache shadow: stubble dithered over the upper lip, a few dark hairs)
  for (let y = 70; y < 74; y++) for (let x = 78 + (y % 2); x < 100; x += 2) if (rnd() < 0.75) r(x, y, 1, 1, '#5E4426');
  for (let k = 0; k < 7; k++) { const x = 80 + k * 3; ln([[x, 71], [x + (k < 3 ? -1 : 1), 73]], '#2A1A0C', 0.6); }

  // (the smirk: too wide, up on her left; thin lips, yellow teeth through it, a gap, one gone gray; spit)
  pg([[72, 76], [80, 75], [90, 75], [100, 73.5], [107, 70], [104, 74.5], [98, 77.5], [90, 79], [80, 78.5], [72, 77]], '#3A120E');
  for (let k = 0; k < 7; k++) { const x = 81 + k * 3, top = 75.6 - (k > 4 ? (k - 4) * 0.6 : 0); r(x, top, 2.4, 2.2, k === 4 ? '#7A7860' : k === 2 ? '#C8A840' : '#DCC468'); r(x, top, 0.6, 2.2, '#5A3810'); }
  r(87, 77, 1.5, 1, '#3A120E');
  ln([[72, 76], [80, 74.5], [90, 74.5], [100, 73], [107, 70]], '#8E4A3A', 1.4);
  ln([[73, 77.5], [80, 79.5], [90, 80], [98, 78], [104, 75]], '#B06452', 1.8); ln([[82, 79.8], [92, 79.8]], '#E8B8A0', 0.6);
  // (spit strands between the lips; a bubble at the corner)
  a(0.85, () => { ln([[84, 76], [84.5, 78], [84, 79.4]], '#E8F4F4', 0.6); ln([[95, 75], [95.5, 77.8]], '#E8F4F4', 0.6); });
  el(71.5, 77, 1.6, 1.6, '#CFE4E4'); r(71, 76, 1, 1, '#FFFFFF');
  // (the dimple, the smirk's crease)
  ln([[106, 68], [109, 72], [107, 77]], SKdd, 0.9);
  // (the cold sore on the lower lip: red, blistered, crusting yellow)
  el(77, 80, 3, 2.2, '#B02A26'); el(76, 79.5, 1.2, 1, '#F0D8A0'); el(78.4, 80.6, 1, 0.9, '#E8C040'); r(75, 81, 1, 1, '#E8C040');
  // (a zit on the cheek, a whitehead on it)
  el(104, 66, 2, 2, '#C04A3A'); el(104, 65.5, 0.9, 0.9, '#FFF6D8');
  // (the wart on her chin and its long hair; stray chin hairs)
  el(96, 85, 2.6, 2.2, '#8A6A3A'); el(95.4, 84.4, 1, 0.8, '#B89A60'); r(96, 86, 1, 1, '#5A4022');
  ln([[96.5, 84], [99, 79], [102, 77]], '#1A1008', 0.6);
  for (const [x, y, dx] of [[84, 88, -1], [88, 90, 0], [91, 89, 1], [80, 86, -1.5]] as [number, number, number][]) ln([[x, y], [x + dx, y + 3]], '#1A1008', 0.6);

  // (grease: a sheen on the forehead, the nose, the cheeks; sweat beading and running from the hairline)
  for (const [x, y, w] of [[76, 32, 6], [94, 36, 4], [72, 60, 3], [98, 58, 2]] as Pt3[]) r(x, y, w, 1, '#FFF8E4');
  for (const [x, y, n] of [[70, 34, 8], [96, 30, 10], [108, 46, 7], [80, 28, 5]] as Pt3[]) { a(0.6, () => ln([[x, y - n], [x + 0.5, y]], '#E4D8B4', 0.7)); el(x + 0.5, y + 1, 1.3, 1.8, '#F4F0DC'); r(x, y, 1, 1, '#FFFFFF'); }

  // (the fly on her forehead: its wings catching the light)
  a(0.55, () => { el(101, 31, 3.4, 1.8, '#DDE8EC', -0.5); el(103, 34, 3.4, 1.8, '#DDE8EC', 0.6); });
  el(100.5, 33, 2.2, 1.6, '#141414', 0.3); el(98.4, 32.4, 1.3, 1.3, '#141414'); r(97.6, 31.8, 1, 1, '#B02020');
  for (const s of [-1, 1]) ln([[100, 33], [100 + s * 2.5, 35.5]], '#141414', 0.5);

  });
  const SK = '#C4A062', SKdd = '#6E5230', SKl = '#DEBE80';

  // --- Her hands, folded: right over left; fat, hairy-knuckled, the nails dirty ----------------------------------------
  // (the left hand under: the back of it, its fingers out to our right)
  pg([[74, 182], [96, 178], [118, 182], [120, 194], [96, 198], [76, 196]], SK);
  for (let k = 0; k < 4; k++) { const y = 184 + k * 3.4; el(124, y, 6.8, 2.6, SKdd); el(124, y, 6, 2, SK); el(129, y, 1.6, 1.4, '#D8C8A0'); r(129.5, y - 0.4, 1, 1.4, '#2A1A0A'); ln([[118, y - 1.6], [128, y - 1.6]], SKdd, 0.5); }
  // (the right hand over it: the back of it plump, the fingers out to our left)
  pg([[86, 172], [112, 168], [128, 172], [130, 186], [108, 192], [88, 190]], SKl);
  el(116, 178, 10, 6, SK);
  for (let k = 0; k < 4; k++) {
    const y = 175 + k * 3.8;
    el(80, y, 8.8, 2.9, SKdd); el(80, y, 8, 2.3, SKl); el(78, y + 0.6, 6, 1.4, SK);
    el(72.5, y, 1.8, 1.6, '#D8C8A0'); r(71, y - 0.6, 1, 1.8, '#2A1A0A');
    ln([[83, y - 2], [83, y + 2]], SKdd, 0.5); ln([[77, y - 2], [77, y + 2]], SKdd, 0.5);
    for (let h = 0; h < 3; h++) ln([[86 + h * 1.4, y - 2], [86.6 + h * 1.4, y - 3.4]], '#2A1A0C', 0.5);
  }
  ln([[88, 190], [108, 192], [130, 186]], SKdd, 1);
  for (let k = 0; k < 14; k++) { const x = 96 + rnd() * 28, y = 172 + rnd() * 12; ln([[x, y], [x + 1, y - 1.6]], '#3A2614', 0.5); }
  ln([[98, 176], [118, 174]], '#6A8AA0', 0.8); ln([[104, 180], [116, 182]], '#6A8AA0', 0.6);
  r(110, 174, 4, 1, '#FFF2D0');

  // (dandruff on her shoulders and in her hair)
  for (let k = 0; k < 40; k++) { const left = k % 2 === 0, x = left ? 50 + rnd() * 24 : 102 + rnd() * 24, y = 98 + rnd() * 22; r(Math.floor(x), Math.floor(y), 1, 1, '#E8E2CC'); }

  // --- The varnish: yellowed, darker at the edges, cracked all over (craquelure) --------------------------------------
  a(0.14, () => r(0, 0, W, H, '#C89A3A'));
  for (let k = 0; k < 6; k++) a(0.07, () => { g.strokeStyle = '#1A1208'; g.lineWidth = 6; g.strokeRect(k * 5 + 3, k * 5 + 3, W - k * 10 - 6, H - k * 10 - 6); });
  const S = 10, cols = Math.ceil(W / S) + 1, rows = Math.ceil(H / S) + 1, P: Pt[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) P.push([i * S + (rnd() - 0.5) * S * 0.8, j * S + (rnd() - 0.5) * S * 0.8]);
  const crack = (p: Pt, q: Pt) => { const mx = (p[0] + q[0]) / 2 + (rnd() - 0.5) * 4, my = (p[1] + q[1]) / 2 + (rnd() - 0.5) * 4; return [p, [mx, my] as Pt, q]; };
  const cracks: Pt[][] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const p = P[j * cols + i];
    if (i + 1 < cols && rnd() < 0.85) cracks.push(crack(p, P[j * cols + i + 1]));
    if (j + 1 < rows && rnd() < 0.85) cracks.push(crack(p, P[(j + 1) * cols + i]));
  }
  a(0.16, () => { for (const c of cracks) ln(c.map(([x, y]) => [x + 0.7, y + 0.7] as Pt), '#F0E0A8', 0.6); });
  a(0.3, () => { for (const c of cracks) ln(c, '#120C06', 0.6); });
};
type Pt3 = [number, number, number];

let master: { key: string; c: HTMLCanvasElement } | null = null;
const masterNow = () => {
  if (typeof document === 'undefined') return null;
  const key = timeOfDay().key;
  if (master?.key === key) return master.c;
  const c = master?.c ?? document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (!g) return null;
  g.clearRect(0, 0, W, H);
  paintMonaMaster(g, col => hour(col));
  master = { key, c };
  return c;
};

/** The Mona Lisa put down in a w x h box at (x, y) (any size: the print, the postcard, the little ones in the rack). */
export const monaLisa = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const m = masterNow();
  if (!m) return;
  g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(m, x, y, w, h);
  g.restore();
};
