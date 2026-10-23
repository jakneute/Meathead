// The KEY CAST MEMBERS' remains (the user's: "show their remains based on how they died. not exactly like the game
// world shows, but a specially drawn corpse"): once a land's boss is dead, the park map's staff photo is swapped for
// one of these, the evidence photo of how he ended up, one per death (the normal one, the weakness one: store.ts
// bossDeath). Each a small painting of its own (remainsKit.ts: ramps, stepped shading, dithered seams, ink) of the
// scene as it was left, mounted the obituary way: a black-edged card, a black ribbon across its corner, a DECEASED
// stamp over the print, a black caption plate. Painted once per land, death and size, then kept.

import { signText } from '../signLetters';
import type { BossDeath } from '../store';
import { Pix, type Ramp, BLOOD, SHIT, BONE, GOO, ASH, SOOT, GOLD, STEEL, SOCKW } from './remainsKit';

type Ctx = CanvasRenderingContext2D;
const PW = 86, PH = 78;

// ---- the cast's own colors (their drawings' ramps: river/artie.ts, spooky/donnie.ts, steve.ts, harryArt.ts...)
const SKIN: Ramp = ['#FCE2C8', '#F0C29C', '#D89C76', '#B47454', '#6E3C26'];
const PALE: Ramp = ['#FFF4E8', '#FBE4D0', '#E8C4A8', '#CCA084', '#7A5040'];
const KHAKI: Ramp = ['#E4D49E', '#CAB47C', '#A99058', '#80693E', '#4A3C20'];
const HELMET: Ramp = ['#FCF6E2', '#E8DCB2', '#CDBC8A', '#A8956A', '#5E5236'];
const BOOT: Ramp = ['#A07048', '#7C5432', '#5E3E24', '#432C18', '#22150B'];
const RHINO: Ramp = ['#BAB6AE', '#928E86', '#706C66', '#504D48', '#22201E'];
const HORN: Ramp = ['#F4EEDC', '#D8CCAE', '#B2A482', '#867A5C', '#3C3424'];
const POLY: Ramp = ['#4A4A58', '#2C2C36', '#1C1C24', '#101016', '#000000'];
const LINING: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A'];
const BATS: Ramp = ['#C4A0F0', '#9466D8', '#7244B4', '#4E2A86', '#22103E'];
const WIG: Ramp = ['#7C8AA8', '#2A2E3C', '#1A1C26', '#101218', '#000000'];
const DSKIN: Ramp = ['#FBE3D6', '#F2C6AE', '#DCA48A', '#B97E66', '#6E4234'];
const MIRROR: Ramp = ['#FFFFFF', '#DCE4F0', '#A8B4C8', '#707C94', '#2A3040'];
const LAT: Ramp = ['#7C8AAA', '#3E4458', '#242733', '#15161F', '#06070B'];
const CHROME: Ramp = ['#FAFAFA', '#C9CBD3', '#8E8E99', '#52525B', '#18181B'];
const GREEN: Ramp = ['#E4FFC8', '#9BF25E', '#5CC22A', '#2F7A12', '#0B2A06'];
const SUIT: Ramp = ['#FEF08A', '#FACC15', '#D4A20C', '#A16207', '#4A2C04'];
const SSKIN: Ramp = ['#F3BE90', '#D88C5A', '#B66B3F', '#8B4A2A', '#45200F'];
const SPALE: Ramp = ['#FFF1E4', '#F6D7BF', '#E2B699', '#BC8F74', '#6E4B39'];
const BRACE: Ramp = ['#FFFFFF', '#F1F3F0', '#D5D9D0', '#A7AC9F', '#565A50'];
const MAT: Ramp = ['#93C5FD', '#3B82F6', '#2563EB', '#1E40AF', '#0B1A45'];
const BRIEF: Ramp = ['#7FB0F8', '#1D4ED8', '#1E3A8A', '#172554', '#070F2A'];
const HSKIN: Ramp = ['#F6D2B0', '#E0AC82', '#C08660', '#966446', '#4A2C1C'];
const DENIM: Ramp = ['#9CB8E0', '#5A7CB4', '#3E5C92', '#2A406C', '#101C34'];
const CONCRETE: Ramp = ['#D4D2C8', '#B0AEA2', '#8E8C80', '#6C6A60', '#2E2C26'];
const COPPER: Ramp = ['#B8E8D0', '#7CC8A8', '#4E9E80', '#2E7058', '#103828'];
const GUN: Ramp = ['#6A6A74', '#3C3C44', '#28282E', '#18181C', '#050507'];
const SANDAL: Ramp = ['#C49466', '#9A6A40', '#7A4F2C', '#58361C', '#24140A'];
const TSKIN: Ramp = ['#FFE8D2', '#F6C9A6', '#E0A280', '#BC7A5C', '#6E3C28'];
const COAT: Ramp = ['#5A6CA2', '#36467E', '#283662', '#1A2446', '#0A0F22'];
const VEST: Ramp = ['#C25A58', '#982F35', '#76222A', '#54161C', '#28080C'];
const TROUSER: Ramp = ['#9C9CA4', '#7A7A84', '#5E5E68', '#46464E', '#202024'];
const GINGER: Ramp = ['#F6B884', '#DC8A4E', '#B4642E', '#86441C', '#42200C'];
const GLOVE: Ramp = ['#FFFFFF', '#F6F4EE', '#DCD8CC', '#B8B2A2', '#605A4E'];
const PATENT: Ramp = ['#7A7A86', '#2A2A32', '#1A1A20', '#101014', '#020203'];
const WOOD: Ramp = ['#C08A52', '#9A6A3A', '#7A5028', '#5A3818', '#2A1808'];
const GOWN: Ramp = ['#FFB6DE', '#F45AAE', '#D23488', '#A01E64', '#4E0830'];
const PSKIN: Ramp = ['#FFEADC', '#F8CDB4', '#E8A68C', '#C47E6A', '#6E3A30'];
const WING: Ramp = ['#F8F4FF', '#DCD0FF', '#B8A4F0', '#8A74D0', '#4A3A8A'];
const SLIPPER: Ramp = ['#FFFFFF', '#D8F4FF', '#A8DCF4', '#78B4D8', '#2A4A6A'];
const FAT: Ramp = ['#FFF6C0', '#F2DC80', '#D8B850', '#A88A30', '#5A4814'];
const DUST: Ramp = ['#E2DCD4', '#BEB6AC', '#9A9288', '#76706A', '#3A3632'];
const FRIDGE: Ramp = ['#FFFFF4', '#ECE8D6', '#CCC6AE', '#A09A82', '#3E3A30'];
const OSKIN: Ramp = ['#FCE0CF', '#EFBFA6', '#D59B82', '#B27461', '#5E3026'];
const FLUSH: Ramp = ['#F7A3B0', '#DE6178', '#BE4260', '#932C49', '#4A0F20'];
const TANK: Ramp = ['#FFFFFF', '#EEEBE2', '#D2CDBF', '#ABA596', '#5A564C'];
const BOXER: Ramp = ['#EAF2FC', '#C7DCF3', '#9CBAE0', '#7393BE', '#2C3E66'];
const CAN: Ramp = ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'];
const CAR: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#2A0606'];
const COUCH: Ramp = ['#C8A070', '#A07C50', '#7E5E38', '#5C4224', '#2A1C0C'];

// ---- the places (the backs of the prints)
/** The temple's wall over the clearing's dirt. */
const templeWall = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#9A8A68', '#A8976E', '#B4A47C', '#A8976E', '#8E7E5C']);
  for (let y = 7; y < hz; y += 8) {
    p.line(0, y, PW, y, '#5E5038');
    p.line(0, y + 1, PW, y + 1, '#C8B890');
    const off = (y / 8) & 1 ? 0 : 7;
    for (let x = off; x < PW; x += 14) p.line(x, y + 1, x, y + 8, '#5E5038');
  }
  p.checker(0, hz - 5, PW, 5, '#5E7A3A');
  p.bands(hz, PH, ['#6E5230', '#7E6038', '#8E6C42', '#9E7A4C']);
  for (let i = 0; i < 26; i++) { const x = p.rnd() * PW, y = hz + 2 + p.rnd() * (PH - hz - 2); p.px(x, y, '#5A7A2E'); p.px(x + 1, y - 1, '#7EA040'); }
};
/** The jungle's edge over the clearing's dirt. */
const clearing = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#0E2A12', '#16401A', '#1E5222', '#28642A']);
  for (let i = 0; i < 70; i++) {
    const x = p.rnd() * PW, y = p.rnd() * hz;
    p.ell(x, y, 3 + p.rnd() * 3, 1.6 + p.rnd(), ['#7EC850', '#4E9A30', '#2E6E1E', '#1A4A12', '#0A2408'], { rot: p.rnd() * 3, ink: false });
  }
  p.bands(hz, PH, ['#6E5230', '#7E6038', '#8E6C42', '#9E7A4C']);
  for (let x = 0; x < PW; x += 3) { p.px(x, hz, '#3E6A22'); p.px(x + 1, hz - 1, '#5E8A32'); }
};
/** The ballroom: the dark wallpaper, the wainscot, the parquet. */
const ballroom = (p: Pix, hz: number) => {
  p.bands(0, hz - 8, ['#1E0A1A', '#2A0E24', '#36122E', '#421838']);
  for (let x = 4; x < PW; x += 10) for (let y = 4; y < hz - 10; y += 8) { p.px(x, y, '#6A2A5A'); p.px(x - 1, y + 1, '#52203F'); p.px(x + 1, y + 1, '#52203F'); }
  p.rect(0, hz - 8, PW, 8, '#3A2414'); p.line(0, hz - 8, PW, hz - 8, '#7A5430'); p.line(0, hz - 1, PW, hz - 1, '#1A0E06');
  for (let y = hz; y < PH; y++) for (let x = 0; x < PW; x++) {
    const k = (((x + (y >> 1) * 2) >> 2) + (y >> 1)) & 1, d = (y - hz) / (PH - hz);
    p.px(x, y, k ? (d > 0.5 ? '#9A6434' : '#7A4A24') : (d > 0.5 ? '#B47A42' : '#8E5A2E'));
  }
};
/** The disco: the dark hall, its lights, the lit dance floor. */
const disco = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#08061A', '#0E0A26', '#140E32', '#1A123C']);
  const spot = (x: number, y: number, col: string) => { for (let j = -4; j <= 4; j++) for (let i = -6; i <= 6; i++) if ((i * i) / 36 + (j * j) / 16 <= 1 && ((i + j) & 1) === 0) p.px(x + i, y + j, col); };
  spot(14, 10, '#7E1E6E'); spot(46, 6, '#1E5E7E'); spot(74, 12, '#6E5E10');
  const COLS = [['#C0267E', '#7E1652'], ['#1E9EC0', '#145E78'], ['#C0A01E', '#786214'], ['#5E2EC0', '#3A1C78']];
  for (let y = hz; y < PH; y++) for (let x = 0; x < PW; x++) {
    const tx = Math.floor(x / 11), ty = Math.floor((y - hz) / 7), edge = x % 11 === 0 || (y - hz) % 7 === 0;
    const col = COLS[(tx + ty * 3) % 4];
    p.px(x, y, edge ? '#06040E' : ((y - hz) % 7 === 1 ? col[0] : col[(x + y) & 1 && y - hz < 12 ? 1 : 0]));
  }
  p.checker(0, hz, PW, 6, '#06040E');
};
/** The stunt stage: the night stands, the asphalt, its skids. */
const stage = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#0A0A14', '#12121E', '#1A1A28', '#242434']);
  for (let x = 2; x < PW; x += 4) { const h = 2 + ((x * 7) % 3); p.ell(x, hz - 4 - h, 1.5, 1.6, ['#3A3A4A', '#2A2A38', '#1E1E2A', '#141420', '#0A0A12'], { ink: false }); }
  p.rect(0, hz - 3, PW, 3, '#3A3A48'); p.line(0, hz - 3, PW, hz - 3, '#FACC15');
  p.bands(hz, PH, ['#3A3A40', '#44444A', '#4E4E54', '#56565C']);
  for (let i = 0; i < 40; i++) p.px(p.rnd() * PW, hz + p.rnd() * (PH - hz), '#2E2E34');
};
/** The dig (the America Pavilion): a poured wall, rebar, the slab. */
const dig = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#5A5850', '#66645A', '#727064', '#7E7C70']);
  for (let x = 6; x < PW; x += 12) { p.line(x, 0, x, hz - 2, '#8A4A2A'); p.px(x + 1, 0, '#B06A3A'); }
  for (let x = 0; x < PW; x += 3) p.px(x, 6, '#4A4840');
  p.rect(0, hz - 2, PW, 2, '#4A4840');
  p.bands(hz, PH, ['#8A887E', '#96948A', '#A2A096', '#ACAAA0']);
  for (let i = 0; i < 5; i++) { let x = p.rnd() * PW, y = hz + 4 + p.rnd() * (PH - hz - 6); for (let k = 0; k < 8; k++) { p.px(x, y, '#6C6A60'); x += p.rnd() * 2 - 0.3; y += p.rnd() * 1.4 - 0.7; } }
};
/** The woods: trunks back in the dark, the needles on the ground. */
const woods = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#0C140C', '#121E10', '#1A2814', '#22321A']);
  for (const [x, w] of [[6, 5], [22, 3], [40, 6], [58, 4], [76, 5]]) p.cap(x, -4, x + 1, hz + 2, w, w + 1, ['#5A4630', '#463624', '#34281A', '#241C12', '#100C06'], { ink: false });
  p.bands(hz, PH, ['#3A3420', '#4A4228', '#564C2E', '#625634']);
  for (let i = 0; i < 60; i++) { const x = p.rnd() * PW, y = hz + p.rnd() * (PH - hz); p.px(x, y, p.rnd() < 0.5 ? '#7A6A3A' : '#2E4A1E'); }
};
/** A glade at the forest's edge: trees close either side, the grass. */
const glade = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#2A3A4A', '#3A4E5A', '#4A626A', '#5A747A']);
  p.bands(hz, PH, ['#3E5A22', '#4A6A28', '#567A2E', '#628834']);
  for (let i = 0; i < 70; i++) { const x = p.rnd() * PW, y = hz + p.rnd() * (PH - hz); p.px(x, y, '#7EA040'); p.px(x, y - 1, '#2E4A18'); }
  const tree = (x: number) => {
    p.cap(x, hz - 18, x, PH, 3, 4, ['#4A3824', '#3A2C1C', '#2A2014', '#1C140C', '#0A0604'], { ink: false });
    for (let k = 0; k < 4; k++) p.poly([[x - 12 + k * 2, hz - 4 - k * 9], [x, hz - 22 - k * 9], [x + 12 - k * 2, hz - 4 - k * 9]], ['#2E5A2E', '#1E4220', '#163418', '#0E2410', '#061006'], { l: 0.5, l2: 0.2 });
  };
  tree(4); tree(82);
  p.checker(0, hz, 12, PH - hz, '#1A2A10'); p.checker(PW - 12, hz, 12, PH - hz, '#1A2A10', 1);
};
/** The overflow lot, after dark: the dusk, the asphalt, the bays' lines. */
const lot = (p: Pix, hz: number) => {
  p.bands(0, hz, ['#2A1E4A', '#4A2A5A', '#7A3A5A', '#B0564E', '#D8804A']);
  for (let x = 0; x < PW; x++) { const h = 3 + Math.round(Math.abs(Math.sin(x * 0.3)) * 3 + (x > 50 && x < 58 ? 6 : 0)); for (let y = hz - h; y < hz; y++) p.px(x, y, '#1A1228'); }
  p.bands(hz, PH, ['#2E2E36', '#36363E', '#3E3E46', '#46464E']);
  for (let k = 0; k < 4; k++) { const x = 8 + k * 24; p.line(x, hz + 2, x - 8, PH, '#D8C040'); p.line(x + 1, hz + 2, x - 7, PH, '#A8902A'); }
  for (let i = 0; i < 50; i++) p.px(p.rnd() * PW, hz + p.rnd() * (PH - hz), '#26262C');
};
/** Her bedroom: the pink stripe, the carpet. */
const bedroom = (p: Pix, hz: number) => {
  for (let y = 0; y < hz; y++) for (let x = 0; x < PW; x++) p.px(x, y, (x >> 2) % 3 === 0 ? '#F2A8CC' : y < hz * 0.3 ? '#D884B0' : '#E496BE');
  p.rect(0, hz - 4, PW, 4, '#FFF0F6'); p.line(0, hz - 1, PW, hz - 1, '#B0607E');
  p.bands(hz, PH, ['#B04A82', '#BE5690', '#CA629C', '#D46EA6']);
  p.checker(0, hz, PW, PH - hz, '#A84078');
};
/** The sitcom's living room: the mustard paper, the baseboard, the shag. */
const livingRoom = (p: Pix, hz: number) => {
  for (let y = 0; y < hz; y++) for (let x = 0; x < PW; x++) p.px(x, y, x % 8 < 2 ? '#B8963E' : y < 8 ? '#C4A452' : '#D2B460');
  p.rect(0, hz - 4, PW, 4, '#6A4A26'); p.line(0, hz - 4, PW, hz - 4, '#9A7240');
  p.bands(hz, PH, ['#8A4A1E', '#9A5624', '#A8622A', '#B46E32']);
  for (let i = 0; i < 120; i++) { const x = p.rnd() * PW, y = hz + p.rnd() * (PH - hz); p.px(x, y, '#C47E3A'); p.px(x, y + 1, '#723C14'); }
};

// ---- bits shared between them
/** A pair of X'd-out eyes. */
const xEye = (p: Pix, x: number, y: number, col = '#18181B') => { p.px(x - 1, y - 1, col); p.px(x + 1, y - 1, col); p.px(x, y, col); p.px(x - 1, y + 1, col); p.px(x + 1, y + 1, col); };
/** Stink lines going up. */
const stink = (p: Pix, x: number, y: number) => { for (let k = 0; k < 3; k++) for (let j = 0; j < 7; j++) p.px(x + k * 3 + Math.round(Math.sin(j * 0.9 + k) * 1.2), y - j, j % 2 ? '#8AA040' : '#B4C860'); };
/** A sparkle (fairy dust, a rhinestone, a spark). */
const twinkle = (p: Pix, x: number, y: number, col = '#FFFFFF', big = false) => { p.px(x, y, col); if (big) { p.px(x - 1, y, col); p.px(x + 1, y, col); p.px(x, y - 1, col); p.px(x, y + 1, col); } };

// ---- the scenes
type Scene = (p: Pix) => void;
const SCENES: Record<string, Record<BossDeath, Scene>> = {
  adventure: {
    // Gored by his own rhino: the both of them in a heap against the temple's wall, him folded backward over the horn.
    normal: p => {
      templeWall(p, 46);
      // (the wall's crack where they hit, the smear down it)
      for (const [dx, dy] of [[1, -1], [1, 0.4], [-0.6, -1], [-1, 0.2], [0.3, 1]]) { let x = 66, y = 22; for (let k = 0; k < 9; k++) { p.px(x, y, '#3A3020'); x += dx + (p.rnd() - 0.5) * 0.6; y += dy + (p.rnd() - 0.5) * 0.6; } }
      p.cap(67, 24, 68, 40, 2.5, 1.5, BLOOD, { ink: false });
      p.pool(52, 68, 26, 6, BLOOD, 2);
      // (the rhino, dead on its side against the wall, legs out stiff)
      p.cap(22, 58, 14, 70, 3, 2.5, RHINO); p.cap(30, 61, 26, 73, 3, 2.5, RHINO);
      p.ell(36, 54, 24, 13, RHINO, { rot: -0.08 });
      p.cap(44, 62, 46, 74, 3, 2.5, RHINO); p.cap(52, 60, 56, 72, 3, 2.5, RHINO);
      for (let k = 0; k < 4; k++) p.line(22 + k * 7, 46 + (k & 1), 24 + k * 7, 62, '#5E5A54');
      p.ell(61, 47, 10, 8, RHINO, { rot: -0.6 });
      p.ell(57, 52, 4, 3, RHINO);
      xEye(p, 60, 45);
      p.px(53, 52, '#22201E'); p.px(53, 54, '#22201E');
      p.poly([[64, 41], [69, 29], [71, 30], [68, 43]], HORN, { l: 0.8, l2: 0.4 });
      p.cap(69, 31, 66, 44, 1, 0.8, BLOOD, { ink: false });
      // (Artie: the hips on the horn's point, the legs hung down the far side, the rest of him bent back the wrong way)
      p.cap(73, 34, 78, 45, 2.6, 2.2, PALE); p.cap(78, 45, 80, 55, 2.2, 2, SKIN);
      p.cap(80, 52, 80, 59, 2.4, 2.4, SOCKW); p.line(78, 53, 82, 53, '#C02020'); p.line(78, 55, 82, 55, '#2563EB');
      p.ell(81, 61, 4, 2.4, BOOT);
      p.cap(71, 35, 74, 42, 2.6, 2.2, PALE); p.cap(74, 42, 70, 50, 2.2, 2, SKIN);
      p.cap(70, 48, 68, 54, 2.4, 2.4, SOCKW); p.ell(67, 56, 4, 2.4, BOOT);
      p.ell(71, 31, 5.5, 4, KHAKI, { rot: 0.3 });
      p.cap(68, 31, 58, 36, 4.5, 4, KHAKI);
      p.cap(60, 34, 56, 46, 1.8, 1.6, SKIN); p.cap(57, 37, 51, 44, 1.8, 1.6, SKIN);
      p.ell(55, 39, 4.2, 4, SKIN);
      p.px(53, 40, '#3A1C10'); p.px(54, 41, '#3A1C10'); p.px(52, 37, '#18181B'); p.px(55, 37, '#18181B');
      p.rect(54, 42, 2, 2, '#FFFFF2');
      // (the pith helmet, rolled off in the dirt)
      p.ell(18, 70, 8, 4, HELMET); p.ell(18, 68, 6, 4, HELMET); p.line(12, 69, 24, 69, '#7C4E2A');
      p.marker(8, 64); p.marker(36, 74);
    },
    // Eaten alive by the spawner's litter: the bones in a heap, the socks, the boots and the heart boxers (they don't
    // eat those), the skull rolled off, the buck teeth out of it, the litter burst where it ate.
    weakness: p => {
      clearing(p, 34);
      p.pool(44, 60, 30, 9, BLOOD, 4);
      // (burst litter: green splats, a husk or two)
      for (const [x, y] of [[20, 44], [66, 46], [34, 72], [76, 70]]) { p.pool(x, y, 4, 2, GOO, x); p.ell(x + 1, y - 1, 1.6, 1.2, ['#5A6A4A', '#3A4A2E', '#26321E', '#18200E', '#080C04']); }
      // (the spine, the ribs up off it)
      p.cap(28, 58, 50, 57, 1.4, 1.4, BONE);
      for (let k = 0; k < 5; k++) { const x = 31 + k * 4; p.cap(x, 57, x - 1, 50, 1, 1, BONE); p.cap(x - 1, 50, x + 3, 48, 1, 1, BONE); }
      // (the heart boxers on the pelvis)
      p.ell(53, 58, 6, 4.2, ['#FFFFFF', '#F4ECEC', '#DCCACA', '#B49C9C', '#5E4A4A']);
      for (const [x, y] of [[51, 56], [55, 58], [52, 60], [56, 55]]) { p.px(x, y, '#E11D48'); p.px(x + 1, y, '#E11D48'); p.px(x, y + 1, '#BE123C'); }
      // (the legs' bones down into the socks, the socks into the boots)
      p.cap(57, 59, 65, 62, 1.3, 1.2, BONE); p.cap(56, 61, 62, 67, 1.3, 1.2, BONE);
      p.cap(65, 62, 74, 62, 2.4, 2.4, SOCKW); p.line(66, 60, 66, 64, '#C02020'); p.line(68, 60, 68, 64, '#2563EB');
      p.ell(77, 62, 3, 3.6, BOOT);
      p.cap(62, 67, 67, 72, 2.4, 2.4, SOCKW); p.line(62, 69, 64, 67, '#C02020');
      p.ell(69, 74, 3.6, 2.6, BOOT);
      // (an arm, off on its own, the hand's bones)
      p.cap(10, 66, 22, 64, 1.2, 1.2, BONE);
      for (let k = 0; k < 4; k++) p.line(8, 64 + k, 5, 63 + k * 1.4, BONE[1]);
      // (the skull, rolled away; the teeth out of it)
      p.ell(15, 52, 5.5, 5, BONE);
      p.ell(13, 51, 1.4, 1.6, ['#4A4232', '#2A2418', '#1A160E', '#0E0C08', '#000000'], { ink: false }); p.ell(17, 51, 1.4, 1.6, ['#4A4232', '#2A2418', '#1A160E', '#0E0C08', '#000000'], { ink: false });
      p.px(15, 54, '#2A2418');
      p.rect(23, 56, 2, 3, '#FFFFF2'); p.rect(26, 57, 2, 3, '#FFFFF2'); p.px(23, 58, '#A0946E'); p.px(26, 59, '#A0946E');
      // (the helmet, chewed)
      p.ell(70, 42, 7, 3.6, HELMET); p.ell(70, 40, 5.5, 3.6, HELMET); p.px(68, 39, '#4A3C20'); p.px(72, 40, '#4A3C20');
      p.marker(40, 44); p.marker(82, 54);
    },
  },
  spooky: {
    // Belly flop, the trousers round his ankles, the bat boxers up, the mirror ball on them, and he shat.
    normal: p => {
      ballroom(p, 36);
      // (mirror shards)
      for (let i = 0; i < 14; i++) twinkle(p, 6 + p.rnd() * 76, 40 + p.rnd() * 36, i & 1 ? '#DCE4F0' : '#FFFFFF');
      p.pool(60, 66, 9, 3, SHIT, 1);
      // (the cape out flat round him, the lining up)
      p.poly([[8, 62], [20, 50], [46, 48], [58, 56], [52, 70], [14, 72]], LINING, { l: 0.65, l2: 0.3 });
      p.ell(32, 60, 17, 8.5, POLY);
      p.cap(14, 66, 6, 70, 2, 1.8, DSKIN);
      p.ell(14, 60, 5.2, 4.6, DSKIN);
      p.ell(12, 56, 6, 3, WIG, { rot: -0.4 }); p.rect(14, 54, 2, 1, '#FFFFFF');
      // (the bat boxers, up; the seat gone brown; the legs out; the trousers round the ankles)
      p.cap(56, 58, 70, 62, 2.6, 2.2, ['#FFFFFF', '#F6EEEA', '#E0D2CC', '#BCAAA2', '#6E5E58']);
      for (let x = 58; x < 70; x += 2) p.px(x, 59 + (x % 3), '#5A4A40');
      p.ell(73, 62, 4, 3.2, POLY); p.ell(79, 63, 3.6, 2.2, POLY);
      p.ell(50, 54, 9, 8, BATS);
      for (const [x, y] of [[46, 50], [52, 52], [48, 56], [54, 57]]) { p.px(x, y, '#22103E'); p.px(x - 1, y - 1, '#22103E'); p.px(x + 1, y - 1, '#22103E'); }
      p.checker(48, 56, 9, 5, '#6C4420'); p.ell(53, 59, 3, 1.8, SHIT, { ink: false });
      // (the mirror ball, sat on his rear)
      p.ell(50, 38, 8, 8, MIRROR);
      for (let k = -6; k <= 6; k += 3) { p.line(42, 38 + k, 58, 38 + k, '#707C94'); p.line(50 + k, 31, 50 + k, 45, '#707C94'); }
      twinkle(p, 47, 34, '#FFFFFF', true); twinkle(p, 54, 37, '#FFFFFF');
      p.line(50, 30, 50, 22, '#9EA2AC'); p.px(49, 22, '#6C707A');
      stink(p, 60, 52);
      p.marker(4, 76); p.marker(80, 72);
    },
    // Burned up by a souvenir Redeemer: a pile of ash on a scorched floor, his wig on it, the little statue stood in it.
    weakness: p => {
      ballroom(p, 36);
      p.pool(43, 62, 32, 9, ['#3A2A1A', '#2A1C10', '#1E140A', '#140C06', '#0A0604'], 3);
      p.checker(10, 54, 66, 16, '#1A1008');
      // (the pile)
      p.fill(20, 46, 66, 66, (x, y) => { const dx = (x - 43) / 21, dy = (y - 64) / 14; return y <= 64.5 + Math.sin(x * 0.7) && dx * dx + dy * dy <= 1; }, (x, y) => 0.75 - ((y - 50) / 14) * 0.4 - (x - 43) / 60, ASH);
      for (let i = 0; i < 14; i++) p.px(26 + p.rnd() * 34, 54 + p.rnd() * 9, i & 1 ? '#F97316' : '#FDE047');
      // (the wig on top, its tag; the fangs in the ash)
      p.ell(38, 51, 7, 3.4, WIG, { rot: -0.15 }); p.rect(41, 49, 2, 1, '#FFFFFF');
      p.px(28, 62, '#FFFFF2'); p.px(28, 63, '#ECE6CC'); p.px(31, 62, '#FFFFF2'); p.px(31, 63, '#ECE6CC');
      // (the Redeemer, arms out, stood in it)
      const ST: Ramp = ['#FFFFFF', '#E8E8EC', '#C4C4CC', '#9898A4', '#4A4A54'];
      p.poly([[54, 44], [58, 44], [59, 58], [53, 58]], ST, { l: 0.75, l2: 0.45 });
      p.cap(48, 45, 64, 45, 1.2, 1.2, ST);
      p.ell(56, 41.5, 1.8, 2, ST);
      p.rect(52, 58, 8, 2, '#9898A4');
      twinkle(p, 52, 38, '#FEF9C3'); twinkle(p, 61, 39, '#FEF9C3');
      p.smoke(36, 46, 22); p.smoke(46, 47, 26, '#7A7A84');
      p.marker(12, 72); p.marker(76, 70);
    },
  },
  space: {
    // Her circuits gone: slumped on the dance floor, head down, crest bent, the green fluid out of her, her young dead.
    normal: p => {
      disco(p, 34);
      p.pool(44, 64, 32, 8, GREEN, 5);
      // (the tail, curled out behind, its blade)
      p.cap(58, 56, 70, 48, 3.2, 2.4, LAT); p.cap(70, 48, 79, 50, 2.4, 1.8, LAT); p.cap(79, 50, 81, 60, 1.8, 1.2, LAT);
      for (const [x, y] of [[64, 52], [72, 48], [79, 54]]) p.px(x, y - 2, '#7C8AAA');
      p.poly([[79, 60], [84, 66], [80, 64]], CHROME, { l: 0.8 });
      // (the legs folded, the arms flopped on the floor)
      p.cap(52, 60, 64, 54, 2.8, 2.2, LAT); p.cap(64, 54, 70, 68, 2.2, 1.8, LAT);
      p.cap(36, 58, 26, 72, 2.2, 1.6, LAT); p.cap(44, 61, 42, 75, 2.2, 1.6, LAT);
      p.cap(50, 58, 58, 70, 2.2, 1.6, LAT); p.cap(46, 55, 60, 62, 2, 1.5, LAT);
      p.ell(42, 54, 14, 9, LAT, { rot: -0.2 });
      for (let k = 0; k < 4; k++) p.ell(36 + k * 5, 47 + k * 0.5, 2.6, 1.8, CHROME);
      // (her back torn open: the wiring out, the zip ties)
      p.ell(46, 55, 4, 2.6, ['#2A2A30', '#1C1C21', '#141418', '#0A0A0C', '#000000']);
      p.line(44, 55, 48, 66, '#DC2626'); p.line(46, 55, 51, 64, '#2563EB'); p.line(47, 56, 46, 66, '#FACC15');
      p.px(45, 58, '#FFFFFF'); p.px(49, 60, '#FFFFFF');
      // (the long head, down on the floor, the jaws open, the speaker on its side)
      p.cap(31, 50, 15, 66, 6, 3, LAT);
      p.ell(14, 68, 3.4, 2.4, LAT);
      for (let k = 0; k < 4; k++) p.px(12 + k, 70, '#E2E6EE');
      p.rect(24, 54, 4, 3, '#3F3F46'); p.px(25, 55, '#9EA2AC'); p.px(27, 55, '#9EA2AC');
      // (the crest, bent)
      for (let k = 0; k < 5; k++) { const a = -2.3 + k * 0.32; p.cap(33, 48, 33 + Math.cos(a) * 11, 48 + Math.sin(a) * 9, 1.4, 0.6, LAT); }
      p.cap(25, 40, 21, 44, 0.8, 0.6, LAT);
      // (sparks)
      for (const [x, y] of [[36, 46], [48, 52], [20, 60]]) { twinkle(p, x, y, '#FDE047', true); p.px(x + 2, y - 2, '#FFFFFF'); }
      // (one of hers, legs up)
      p.ell(74, 72, 4, 2.6, LAT);
      for (let k = 0; k < 4; k++) p.line(71 + k * 2, 70, 70 + k * 2.6, 66, '#3E4458');
      p.marker(6, 74);
    },
    // In pieces, all over the disco: the head under where the ball was (still talking), arms, legs, plates, bolts, hoses.
    weakness: p => {
      disco(p, 34);
      for (const [x, y, r, red] of [[18, 66, 7, 0], [52, 58, 9, 1], [72, 70, 6, 0], [36, 74, 5, 1], [62, 44, 4, 0]] as const) p.pool(x, y, r, r / 3, red ? BLOOD : GREEN, x);
      // (the tail's bones, strung out)
      for (let k = 0; k < 6; k++) p.ell(56 + k * 4.5, 40 + Math.sin(k) * 2, 2, 1.6, LAT);
      p.poly([[83, 40], [86, 34], [86, 44]], CHROME, { l: 0.8 });
      // (arms, a leg)
      p.cap(60, 52, 72, 48, 2.2, 1.6, LAT); p.line(72, 48, 76, 46, '#3E4458'); p.line(72, 48, 76, 50, '#3E4458');
      p.cap(8, 70, 16, 62, 2.2, 1.6, LAT); p.cap(70, 66, 80, 74, 2.2, 1.6, LAT);
      p.cap(40, 66, 50, 72, 3, 2.4, LAT); p.cap(50, 72, 58, 64, 2.4, 2, LAT);
      // (hoses and wires, loose)
      p.line(46, 54, 58, 58, '#16A34A'); p.line(46, 55, 56, 61, '#16A34A');
      p.line(22, 56, 28, 62, '#DC2626'); p.line(23, 56, 30, 60, '#2563EB');
      // (plates, servos, bolts)
      for (const [x, y] of [[10, 52], [44, 46], [66, 60], [80, 56], [30, 70], [56, 76]]) p.ell(x, y, 2.6, 1.6, CHROME, { rot: x * 0.3 });
      for (let i = 0; i < 12; i++) p.px(4 + p.rnd() * 78, 40 + p.rnd() * 36, '#C9CBD3');
      // (the head on its side, the crest, the speaker still going)
      p.cap(22, 56, 38, 50, 5, 3, LAT); p.ell(39, 50, 3, 2.2, LAT);
      for (let k = 0; k < 3; k++) p.px(39 + k, 52, '#E2E6EE');
      for (let k = 0; k < 4; k++) { const a = 3.6 + k * 0.32; p.cap(22, 56, 22 + Math.cos(a) * 9, 56 + Math.sin(a) * 8, 1.2, 0.6, LAT); }
      p.rect(27, 49, 4, 3, '#3F3F46'); p.px(28, 50, '#9EA2AC'); p.px(30, 50, '#9EA2AC');
      for (let k = 0; k < 3; k++) { p.px(32 + k * 2, 45 - k, '#FFFFFF'); p.px(33 + k * 2, 44 - k * 2, '#BFDBFE'); }
      twinkle(p, 46, 50, '#FDE047', true); twinkle(p, 14, 60, '#FDE047');
      p.marker(4, 58); p.marker(84, 76);
    },
  },
  hollywood: {
    // THE STEVE SIDESTEP, the end of it: off his burning loop headfirst onto the pavement, a foot short of the crash mat,
    // in a heap: folded on his head, the rear up in his star-print briefs (the rhinestone waistband), both boots in the
    // air, an arm out for the mat. His pants still burning under the loop; his neck brace made it onto the mat.
    normal: p => {
      stage(p, 30);
      // (the loop up top, still lit, still swinging a little)
      p.fill(10, 2, 40, 32, (x, y) => { const d = Math.hypot(x - 24, (y - 16) * 1.1); return d <= 14 && d >= 11; }, (x, y) => 0.7 - (y - 4) / 40, ['#FFF1BE', '#FDBA4A', '#EA7A1E', '#B0480E', '#4A1A04']);
      for (let k = 0; k < 14; k++) { const a = Math.PI + (k / 13) * Math.PI, x = 24 + Math.cos(a) * 12.5, y = 16 + Math.sin(a) * 11.5; p.px(x, y - 2, '#FDE047'); p.px(x, y - 3, k & 1 ? '#F97316' : '#FDE047'); }
      p.line(24, 3, 23, 0, '#6C707A');
      // (the crash mat, right there)
      p.poly([[57, 52], [86, 49], [86, 70], [59, 74]], MAT, { l: 0.85, l2: 0.35 });
      for (let k = 1; k < 4; k++) p.line(57 + k * 7, 52 - k, 58 + k * 7, 74 - k, '#1E40AF');
      // (his neck brace, on it: it made it)
      p.ell(70, 58, 3.6, 2.6, BRACE); p.px(69, 58, '#565A50'); p.px(70, 58, '#565A50');
      twinkle(p, 72, 57, '#FFFFFF', true);
      // (his pants under the loop, burnt off him and still going; bits of them about)
      p.cap(12, 50, 24, 51, 2.6, 2.6, SUIT); p.line(13, 49, 23, 50, '#DC2626'); p.checker(14, 48, 8, 5, '#1C1917');
      for (let k = 0; k < 4; k++) { p.px(14 + k * 3, 47, '#F97316'); p.px(14 + k * 3, 46 - (k & 1), '#FDE047'); }
      for (let i = 0; i < 9; i++) p.px(10 + p.rnd() * 30, 44 + p.rnd() * 14, '#1C1917');
      // (him: the legs bent at the knee with the boots up in the air, soles to the sky, one flopped over the other)
      p.cap(33, 61, 26, 66, 2.6, 2.4, SPALE); p.cap(26, 66, 24, 55, 2.4, 2.2, SPALE);
      p.cap(34, 62, 30, 67, 2.6, 2.4, SPALE); p.cap(30, 67, 29, 56, 2.4, 2.2, SPALE);
      p.ell(26, 66, 2.2, 1.8, POLY); p.ell(30, 67, 2.2, 1.8, POLY);
      p.ell(24, 53, 2.6, 2.2, SOCKW); p.line(22, 51, 26, 51, '#2A2A2E');
      p.ell(29, 54, 2.6, 2.2, SOCKW); p.line(27, 52, 31, 52, '#2A2A2E'); p.px(26, 54, '#DC2626'); p.px(31, 55, '#DC2626');
      // (the gut on the deck, the suit scorched round the bottom of it; the head folded under him at the neck)
      p.ell(41, 64, 7, 4.5, SUIT); p.cap(42, 63, 47, 64, 4.4, 3.8, SUIT); p.checker(35, 62, 6, 4, '#3A3430');
      p.ell(50, 66, 3.6, 3.2, SSKIN); p.ell(49, 64, 3.6, 2, ['#C99A62', '#9A6A36', '#774D24', '#563416', '#2A1808']);
      p.px(51, 67, '#FACC15'); p.px(53, 67, '#FACC15'); p.px(52, 67, '#CA8A04');
      p.pool(52, 69, 4, 1.4, BLOOD);
      // (an arm flung out for the mat: short)
      p.cap(46, 62, 50, 60, 1.8, 1.6, SUIT); p.cap(50, 60, 54, 63, 1.6, 1.5, SSKIN); p.ell(55, 64, 1.5, 1.3, SSKIN);
      // (the rear up in the briefs: blue, stars, the rhinestones along the waistband; the burnt edge smoking)
      p.ell(34, 59, 4.6, 4, BRIEF);
      p.px(33, 58, '#FFFFFF'); p.px(35, 60, '#FFFFFF'); p.px(32, 61, '#FFFFFF');
      for (let x = 31; x <= 37; x += 2) p.px(x, 55 + (x === 31 || x === 37 ? 1 : 0), '#DBEAFE');
      twinkle(p, 35, 55, '#FFFFFF');
      p.smoke(36, 54, 12); p.smoke(18, 45, 14, '#6C707A');
      p.marker(46, 75); p.marker(76, 76);
    },
    // Struck by lightning: burnt to a man-shaped heap of ash, the gold come through it, a charred thumbs-up still up.
    weakness: p => {
      stage(p, 30);
      // (the strike's burn on the deck)
      p.fill(6, 44, 80, 76, (x, y) => { const dx = x - 43, dy = (y - 62) * 2.2, a = Math.atan2(dy, dx), r = Math.hypot(dx, dy); return r < 18 + 12 * Math.abs(Math.sin(a * 4)); }, () => 0.3, ['#3A3430', '#2A2420', '#1E1A16', '#141210', '#0A0808'], { ink: false });
      p.fill(20, 54, 66, 68, (x, y) => { const dx = (x - 43) / 22, dy = (y - 63) / 5; return dx * dx + dy * dy <= 1 + 0.2 * Math.sin(x); }, (x, y) => 0.7 - (y - 58) / 14, SOOT);
      p.ell(24, 60, 4.5, 3.6, SOOT);
      // (the gold: the aviators, the buckle, the tooth, the chain)
      p.ell(25, 59, 1.8, 1.2, GOLD, { ink: false }); p.ell(29, 59, 1.8, 1.2, GOLD, { ink: false }); p.px(27, 58, '#CA8A04');
      p.rect(41, 61, 3, 2, '#FACC15'); p.px(41, 61, '#FEF9C3');
      p.px(33, 62, '#FEF9C3');
      for (let k = 0; k < 7; k++) p.px(30 + k, 63 + (k & 1), '#CA8A04');
      for (let i = 0; i < 8; i++) twinkle(p, 22 + p.rnd() * 40, 58 + p.rnd() * 7, '#FFFFFF');
      // (the thumbs-up, up out of it)
      p.cap(52, 62, 52, 47, 2.4, 2.2, SOOT);
      p.ell(52, 45, 3.4, 3, SOOT);
      p.cap(53, 43, 54, 36, 1.4, 1.2, SOOT);
      p.px(51, 44, '#7D756E'); p.px(53, 37, '#7D756E');
      for (let k = 0; k < 4; k++) p.px(55 + (k & 1), 46 + k, '#F97316');
      p.smoke(52, 34, 18); p.smoke(38, 55, 14, '#6C707A');
      p.marker(14, 72); p.marker(74, 72);
    },
  },
  foreign: {
    // On his back on the slab, the M60 still pointed at the sky, the casings in a ring round him from the spinning, the
    // jeans split and the tie-dye showing.
    normal: p => {
      dig(p, 30);
      // (a chunk of her, fallen in the dig: a big green finger)
      p.cap(60, 22, 84, 26, 6, 5, COPPER); p.line(70, 18, 70, 31, '#2E7058');
      p.cap(4, 28, 16, 20, 4, 3, COPPER);
      // (the casings, in a ring)
      for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2, x = 40 + Math.cos(a) * 34, y = 60 + Math.sin(a) * 13; p.px(x, y, '#F4CC4E'); p.px(x + 1, y, '#926E16'); }
      p.pool(40, 63, 18, 4, BLOOD, 7);
      // (him, on his back, feet to the right)
      p.cap(46, 59, 62, 56, 3.4, 2.8, DENIM); p.cap(46, 62, 62, 66, 3.4, 2.8, DENIM);
      p.ell(64, 55, 2.4, 2, SOCKW); p.ell(64, 67, 2.4, 2, SOCKW);
      p.ell(67, 55, 2, 2.6, SANDAL); p.ell(67, 67, 2, 2.6, SANDAL);
      p.ell(45, 60, 5, 4, DENIM);
      const TD = ['#DC2626', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'];
      for (let y = 57; y <= 63; y++) for (let x = 41; x <= 49; x++) if (((x - 45) / 3.6) ** 2 + ((y - 60) / 2.6) ** 2 <= 1) p.px(x, y, TD[Math.floor(Math.hypot(x - 45, (y - 60) * 1.4) * 1.3 + Math.atan2(y - 60, x - 45) * 1.2 + 12) % 6]);
      p.ell(31, 60, 11, 6.5, HSKIN);
      p.line(28, 56, 28, 64, '#966446'); p.line(34, 57, 34, 63, '#966446'); p.line(24, 60, 38, 60, '#C08660');
      p.cap(28, 54, 22, 48, 2.2, 2, HSKIN); p.cap(30, 66, 24, 72, 2.2, 2, HSKIN);
      p.ell(17, 60, 4.8, 4.4, HSKIN);
      p.cap(14, 57, 15, 63, 1.8, 1.8, ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A']);
      xEye(p, 18, 59);
      p.rect(20, 61, 2, 1, '#4A2C1C');
      // (the M60 on his chest, muzzle up, smoking; the belt run out)
      p.cap(31, 56, 31, 40, 2, 2, GUN); p.cap(31, 40, 31, 30, 0.9, 0.9, GUN);
      p.rect(29, 46, 4, 3, '#18181C');
      p.line(33, 52, 38, 57, '#926E16');
      p.smoke(31, 28, 20);
      p.marker(8, 72); p.marker(78, 74);
    },
    // Under her concrete: a mound of it, setting, face down, just the socks and sandals up out of the top.
    weakness: p => {
      dig(p, 30);
      p.cap(68, 18, 84, 22, 5, 4, COPPER);
      // (the mound, slumped, its drips)
      p.fill(8, 30, 80, 72, (x, y) => { const dx = (x - 44) / 32, dy = (y - 70) / 26; return y <= 70.5 + Math.sin(x * 0.5) && dx * dx + dy * dy <= 1 + 0.06 * Math.sin(x * 0.9); }, (x, y) => 0.95 - ((y - 44) / 26) * 0.6 - (x - 44) / 90, CONCRETE);
      for (let k = 0; k < 6; k++) { const x = 18 + k * 10, y = 56 + (k & 1) * 4; p.cap(x, y - 6, x, y, 1.2, 1.4, CONCRETE, { ink: false }); }
      for (let i = 0; i < 30; i++) p.px(14 + p.rnd() * 60, 48 + p.rnd() * 20, '#8E8C80');
      // (the legs up out of it: the jeans, the socks, the sandals)
      p.cap(40, 46, 36, 34, 3, 2.6, DENIM); p.cap(36, 34, 34, 26, 2.6, 2.4, HSKIN);
      p.cap(49, 46, 52, 35, 3, 2.6, DENIM); p.cap(52, 35, 55, 27, 2.6, 2.4, HSKIN);
      p.cap(34, 26, 33, 20, 2.6, 2.6, SOCKW); p.cap(55, 27, 56, 21, 2.6, 2.6, SOCKW);
      p.ell(32, 17, 2.4, 3.8, SANDAL, { rot: -0.3 }); p.ell(57, 18, 2.4, 3.8, SANDAL, { rot: 0.3 });
      p.line(30, 19, 35, 19, '#24140A'); p.line(54, 20, 59, 20, '#24140A');
      p.ell(44, 47, 9, 3, CONCRETE, { flat: true });
      // (a cone; his airsick pills, on the slab)
      p.poly([[74, 72], [78, 58], [82, 72]], ['#FDBA74', '#F97316', '#C2410C', '#7C2D12', '#3A1406'], { l: 0.8, l2: 0.4 });
      p.line(75, 66, 81, 66, '#FFFFFF');
      p.rect(10, 70, 4, 5, '#F97316'); p.rect(10, 69, 4, 1, '#FFFFFF'); p.px(10, 71, '#FDBA74');
      p.marker(22, 76); p.marker(64, 76);
    },
  },
  frontier: {
    // The grizzly's: chunks of him all over the forest floor, the paw prints off into the woods, a leg gone with it.
    normal: p => {
      woods(p, 38);
      for (const [x, y, r] of [[30, 60, 12], [60, 54, 7], [14, 70, 6], [70, 70, 5]]) p.pool(x, y, r, r / 3.2, BLOOD, x);
      // (the paw prints, off right)
      for (let k = 0; k < 4; k++) { const x = 52 + k * 9, y = 66 - k * 3 + (k & 1) * 3; p.ell(x, y, 2.2, 1.4, ['#4A2A1A', '#3A2014', '#2A160C', '#1C0E06', '#0A0402'], { ink: false }); for (let t = 0; t < 4; t++) p.px(x - 2 + t * 1.4, y - 2, '#2A160C'); }
      // (the torso: the coat, the vest, torn off at the waist)
      p.ell(32, 58, 10, 6.5, COAT, { rot: 0.25 });
      p.poly([[28, 53], [36, 55], [36, 63], [28, 62]], VEST, { l: 0.6 });
      p.px(32, 56, '#F4CC4E'); p.px(32, 59, '#F4CC4E');
      for (let k = 0; k < 5; k++) p.px(41 + (k & 1), 56 + k * 1.5, '#C02020');
      p.cap(26, 56, 18, 50, 2.4, 2.2, COAT); p.ell(17, 49, 2.2, 2, GLOVE);
      // (the head, its split, the moustache, the X'd eyes)
      p.ell(18, 62, 5, 4.6, TSKIN);
      p.line(18, 57, 18, 61, '#C02020');
      p.cap(15, 64, 21, 64, 1.4, 1.4, GINGER);
      xEye(p, 16, 61); xEye(p, 20, 61);
      // (an arm on its own, the one leg left behind)
      p.cap(56, 50, 66, 54, 2.2, 2, COAT); p.ell(67, 55, 2.2, 2, GLOVE); p.line(55, 49, 55, 52, '#C02020');
      p.cap(46, 70, 60, 72, 2.6, 2.2, TROUSER); p.ell(62, 72, 3.2, 2.2, PATENT); p.ell(45, 70, 2, 2.4, BLOOD);
      // (chunks; the ticket punch; the punched tickets)
      for (let i = 0; i < 9; i++) p.ell(8 + p.rnd() * 70, 44 + p.rnd() * 30, 1.3, 1, BLOOD, { ink: false });
      p.cap(74, 60, 79, 58, 1, 1, STEEL); p.px(74, 61, '#2E3036');
      for (let i = 0; i < 8; i++) { const x = 40 + p.rnd() * 40, y = 42 + p.rnd() * 10; p.rect(x, y, 2, 1, '#F4F0E6'); }
      p.marker(6, 54); p.marker(82, 46);
    },
    // The mountain lions': torn in two and dragged off half each into the trees; just his cap left on the grass.
    weakness: p => {
      glade(p, 38);
      // (the drag marks, off either way into the dark)
      for (let x = 0; x < PW; x++) {
        const left = x < 43, y = left ? 58 - (43 - x) * 0.14 : 58 - (x - 43) * 0.08, w = 2 + Math.round(Math.sin(x * 0.7) * 0.8);
        for (let k = -w; k <= w; k++) if (((x + k) & 1) === 0 || Math.abs(k) < w - 1) p.px(x, y + k + Math.round(Math.sin(x * 0.4)), Math.abs(k) < w - 1 ? '#921414' : '#640A0A');
      }
      p.pool(43, 60, 10, 4, BLOOD, 1);
      // (the cap: the crown, the patent brim, the brass badge)
      p.ell(44, 58, 9, 3.2, PATENT, { flat: true });
      p.cap(39, 54, 49, 54, 4.2, 4.2, COAT);
      p.rect(36, 50, 16, 2, '#36467E');
      p.rect(42, 53, 4, 2, '#F4CC4E'); p.px(42, 53, '#FFF6BE');
      // (the flintlock, in the grass)
      p.cap(60, 70, 68, 68, 1.6, 1.4, WOOD); p.cap(68, 68, 77, 67, 0.9, 0.9, STEEL);
      // (eyes in the trees, both sides)
      for (const [x, y] of [[6, 40], [80, 44]]) { p.px(x, y, '#FDE047'); p.px(x + 3, y, '#FDE047'); }
      p.marker(30, 72); p.marker(56, 50);
    },
  },
  fantasy: {
    // The cork's landing: head first in the overflow lot, a mile off, upside down, the gown fallen over her.
    normal: p => {
      lot(p, 26);
      // (a car's back end, parked; the trail she came down on)
      p.poly([[72, 40], [86, 36], [86, 60], [74, 58]], CAR, { l: 0.85, l2: 0.35 });
      p.rect(74, 44, 3, 4, '#FCA5A5'); p.rect(74, 52, 12, 3, '#18181B');
      for (let y = 0; y < 30; y++) p.px(44 + Math.round(Math.sin(y * 0.3)), y, y & 1 ? '#6C4420' : '#8A5C2C');
      // (the crater, the cracks)
      p.pool(44, 64, 16, 5, ['#26262C', '#1A1A20', '#121216', '#0A0A0E', '#000000'], 2);
      for (const [dx, dy] of [[1, 0.2], [-1, 0.3], [0.7, 0.6], [-0.8, 0.5]]) { let x = 44 + dx * 14, y = 64; for (let k = 0; k < 8; k++) { p.px(x, y, '#1A1A20'); x += dx; y += dy; } }
      // (the gown, hanging down over her like a tulip; the bloomers; the legs up in a V; the slippers)
      p.poly([[36, 46], [52, 46], [60, 64], [28, 64]], GOWN, { l: 0.85, l2: 0.3 });
      for (let k = 0; k < 4; k++) p.line(36 + k * 5, 47, 31 + k * 8, 63, '#A01E64');
      p.ell(44, 45, 9, 3.4, ['#FFFFFF', '#F4F0F4', '#DCD2DC', '#B4A6B4', '#5A4E5A']);
      p.cap(39, 44, 30, 26, 5, 3.6, PSKIN); p.cap(49, 44, 58, 26, 5, 3.6, PSKIN);
      p.ell(29, 23, 3.4, 4, SLIPPER, { rot: -0.4 }); p.ell(59, 23, 3.4, 4, SLIPPER, { rot: 0.4 });
      // (the little wings, bent flat against the gown)
      p.ell(28, 56, 5, 3, WING, { rot: -0.5 }); p.ell(60, 56, 5, 3, WING, { rot: 0.5 });
      // (the fairy dust settling; the turd that came down after her; the tiara on the asphalt)
      for (let i = 0; i < 14; i++) twinkle(p, 22 + p.rnd() * 44, 18 + p.rnd() * 40, i % 3 ? '#FDE68A' : '#FFFFFF', i % 5 === 0);
      p.ell(16, 70, 3, 2, SHIT); p.ell(17, 68, 2, 1.6, SHIT); stink(p, 13, 66);
      p.poly([[64, 72], [66, 69], [68, 71], [70, 68], [72, 71], [74, 69], [75, 72]], GOLD, { l: 0.8 }); p.px(70, 70, '#F45AAE');
      p.marker(6, 50);
    },
    // Deflated: a heap of gown on her floor, a little pile of dust on it, the tiara on top; the fat up the walls.
    weakness: p => {
      bedroom(p, 40);
      // (the fat and the gore up the walls and on the floor)
      for (const [x, y, r] of [[12, 16, 5], [34, 8, 4], [62, 20, 6], [78, 10, 3], [20, 30, 3]]) { p.pool(x, y, r, r * 0.8, FAT, x); p.cap(x, y, x, y + r * 2.2, 1, 0.6, FAT, { ink: false }); p.px(x + 1, y + 1, '#C02020'); }
      for (const [x, y] of [[70, 74], [12, 70], [76, 52]]) p.pool(x, y, 5, 2, FAT, y);
      // (the wings, flat behind; the gown in a heap, its folds, the two bullet holes)
      p.ell(30, 56, 10, 4, WING, { rot: -0.2 }); p.ell(56, 56, 10, 4, WING, { rot: 0.2 });
      p.fill(16, 54, 72, 72, (x, y) => { const dx = (x - 44) / 26, dy = (y - 64) / 8; return dx * dx + dy * dy <= 1 + 0.18 * Math.sin(x * 0.6); }, (x, y) => 0.7 - (y - 58) / 20 + 0.15 * Math.sin(x * 0.5), GOWN);
      for (let k = 0; k < 5; k++) p.line(24 + k * 9, 60, 28 + k * 8, 70, '#A01E64');
      for (const [x, y] of [[32, 64], [54, 66]]) { p.ell(x, y, 1.8, 1.2, ['#3A0A1A', '#2A0612', '#1A040C', '#0E0206', '#000000']); p.px(x + 2, y, '#C02020'); p.px(x - 2, y + 1, '#F2DC80'); }
      // (the dust, the tiara on it)
      p.fill(36, 52, 52, 62, (x, y) => { const dx = (x - 44) / 7, dy = (y - 61) / 6; return y <= 61 && dx * dx + dy * dy <= 1; }, (x, y) => 0.8 - (y - 55) / 10, DUST);
      p.poly([[38, 54], [40, 49], [42, 52], [44, 47], [46, 52], [48, 49], [50, 54]], GOLD, { l: 0.85, l2: 0.4 });
      p.px(44, 50, '#F45AAE'); twinkle(p, 41, 48, '#FFFFFF'); twinkle(p, 47, 47, '#FFFFFF', true);
      // (the slippers)
      p.ell(74, 66, 3.4, 2, SLIPPER); p.ell(79, 68, 3.4, 2, SLIPPER);
      p.marker(8, 76); p.marker(60, 50);
    },
  },
  cartoon: {
    // FINE. I'LL GET IT MYSELF: the fridge flat on top of him, his head and hands out the end, the seep, the can gone off.
    normal: p => {
      livingRoom(p, 36);
      p.pool(62, 68, 14, 4, SHIT, 3);
      // (the fridge, on its face, on him)
      p.poly([[14, 48], [70, 46], [74, 56], [18, 60]], FRIDGE, { l: 0.95, l2: 0.6 });
      p.poly([[18, 60], [74, 56], [74, 66], [18, 70]], FRIDGE, { l: 0.55, l2: 0.35 });
      p.line(48, 47, 50, 68, '#A09A82');
      p.cap(26, 64, 40, 64, 0.8, 0.8, STEEL); p.cap(56, 61, 66, 61, 0.8, 0.8, STEEL);
      for (const [x, y, c] of [[30, 51, '#DC2626'], [40, 50, '#2563EB'], [58, 50, '#FACC15'], [64, 52, '#16A34A']]) p.rect(x as number, y as number, 2, 2, c as string);
      // (his head out the end: the bald top, the white fringe, the red nose, the tongue)
      p.ell(10, 62, 6, 5.4, OSKIN);
      p.ell(14, 60, 3, 3.6, ['#FFFFFF', '#E8E8E8', '#C4C4C4', '#9A9A9A', '#545454'], { rot: 0.3 });
      p.ell(6, 63, 2.2, 2, FLUSH);
      xEye(p, 8, 60);
      p.ell(8, 67, 1.6, 1.4, ['#F7A3B0', '#DE6178', '#BE4260', '#932C49', '#4A0F20']);
      // (the hands, flat out either side of it)
      p.ell(12, 72, 3, 1.8, OSKIN); p.ell(4, 54, 2.6, 1.8, OSKIN);
      for (let k = 0; k < 3; k++) { p.px(15 + k, 72, '#B27461'); p.px(2 - k, 53, '#B27461'); }
      // (the can, off across the carpet, cracked and foaming)
      p.cap(74, 72, 81, 70, 2.4, 2.4, CAN); p.ell(82, 70, 1.6, 2.4, STEEL);
      p.px(83, 68, '#FFFFFF'); p.px(84, 67, '#F4F0E6'); p.px(84, 69, '#FFFFFF');
      stink(p, 66, 62);
      p.marker(30, 76);
    },
    // The sixth car: him in bits all over the set, his head sat up on its stump in a puddle, the car on its nose burning,
    // the couch crushed at the back (the user's: "his parts will be everywhere").
    weakness: p => {
      livingRoom(p, 36);
      // (the couch, crushed, at the back; a robot arm out of the wreckage)
      p.poly([[4, 28], [34, 26], [36, 40], [6, 42]], COUCH, { l: 0.7, l2: 0.3 });
      for (let k = 0; k < 4; k++) p.line(8 + k * 7, 28, 10 + k * 7, 40, '#5C4224');
      p.px(20, 32, '#9EA2AC'); p.px(21, 31, '#9EA2AC'); p.px(22, 32, '#9EA2AC');
      p.cap(36, 42, 44, 38, 1.4, 1.2, STEEL); p.line(44, 38, 47, 36, '#DC2626'); p.line(44, 38, 47, 40, '#2563EB');
      // (the blood: the lake under the car, splats where the bits came down)
      p.pool(66, 60, 16, 5, BLOOD, 3);
      for (const [x, y, r] of [[14, 70, 7], [40, 54, 5], [30, 74, 4], [52, 72, 5], [8, 50, 3], [80, 74, 4]]) p.pool(x, y, r, r / 3, BLOOD, x);
      // (the car, on its nose where it landed on him, burning)
      p.poly([[56, 30], [80, 22], [82, 56], [62, 54]], CAR, { l: 0.85, l2: 0.3 });
      p.line(58, 36, 80, 30, '#FFFFFF'); p.line(58, 37, 80, 31, '#FFFFFF');
      p.ell(62, 52, 3, 3, GUN); p.rect(66, 42, 4, 3, '#FEF9C3');
      for (const [x, y] of [[64, 26], [74, 22], [70, 30]]) { p.ell(x, y, 2.4, 3.4, ['#FEF08A', '#FACC15', '#F97316', '#DC2626', '#7F1D1D'], { ink: false }); }
      p.smoke(76, 16, 20); p.smoke(64, 20, 14, '#6C707A');
      // (the beer gut, whole, in its stained tank top)
      p.fill(34, 58, 50, 70, (x, y) => ((x - 42) / 8) ** 2 + ((y - 64) / 6) ** 2 <= 1, (x, y) => 0.75 - (y - 58) / 18, TANK);
      p.ell(40, 63, 2.2, 1.4, ['#F2E2A8', '#DCC67C', '#BCA45A', '#94803E', '#4A3E1A'], { ink: false });
      p.ell(48, 66, 2.4, 1.6, BLOOD, { ink: false });
      // (an arm, the anchor on it; a leg, the boxer cuff, the slipper still on)
      p.cap(6, 64, 18, 60, 2.2, 1.8, OSKIN); p.ell(4, 65, 2.2, 2, OSKIN); p.ell(19, 60, 1.8, 1.8, BLOOD);
      p.px(11, 61, '#1E3A8A'); p.px(12, 62, '#1E3A8A'); p.px(11, 63, '#1E3A8A');
      p.cap(22, 76, 36, 74, 2.6, 2, OSKIN); p.ell(22, 75, 3, 2.6, BOXER); p.ell(38, 74, 3.6, 2, SLIPPER); p.ell(20, 76, 1.8, 1.6, BLOOD);
      // (the ropes of gut, a run of spine, lumps of him)
      for (let k = 0; k < 10; k++) p.ell(50 + k * 2.2, 74 - Math.sin(k * 0.9) * 2, 1.6, 1.4, ['#F4A6A6', '#E07A7A', '#C25454', '#8E3434', '#4A1414'], { ink: k % 3 === 0 });
      for (let k = 0; k < 5; k++) { p.rect(24 + k * 3, 48 - k, 2, 2, BONE[1]); p.px(25 + k * 3, 47 - k, BONE[0]); }
      for (const [x, y] of [[30, 66], [54, 62], [12, 54], [78, 66]]) { p.ell(x, y, 2, 1.6, ['#C25454', '#A43C3C', '#862C2C', '#5E1C1C', '#2A0A0A']); p.px(x, y - 1, '#F4A6A6'); }
      // (rags of the tank top and the boxers; the can, crushed)
      p.poly([[44, 46], [50, 45], [49, 49], [45, 49]], TANK, { l: 0.8, l2: 0.4 });
      p.poly([[70, 70], [75, 69], [76, 73], [71, 73]], BOXER, { l: 0.8, l2: 0.4 });
      p.cap(82, 64, 86, 62, 1.8, 1.6, CAN);
      // (his head: sat up on its stump, front and center, crossed eyes, the tongue out, the snapped headset)
      p.pool(14, 44, 6, 2, BLOOD, 9);
      p.ell(14, 43, 3.6, 1.4, ['#F4A6A6', '#C25454', '#8E3434', '#5E1C1C', '#2A0A0A']);
      p.ell(14, 37, 6, 6, OSKIN);
      p.ell(18, 34, 2.6, 3.4, ['#FFFFFF', '#E8E8E8', '#C4C4C4', '#9A9A9A', '#545454'], { rot: 0.3 });
      p.ell(10, 38, 2.2, 2, FLUSH);
      xEye(p, 12, 35, '#4A0F20'); xEye(p, 16, 35, '#4A0F20');
      p.ell(13, 42, 1.6, 1.8, ['#F7A3B0', '#DE6178', '#BE4260', '#932C49', '#4A0F20']);
      p.px(11, 40, '#FFFFFF'); p.px(12, 41, '#F4F0E6');
      p.line(19, 33, 23, 39, '#2E2E35'); p.line(23, 39, 22, 42, '#2E2E35'); p.px(22, 43, '#3F3F46');
      p.marker(14, 48); p.marker(44, 72);
    },
  },
};

/** What the caption plate says, by land and death. */
const CAPTIONS: Record<string, Record<BossDeath, [string, string]>> = {
  adventure: { normal: ['GORED AND', 'FOLDED'], weakness: ['DENTAL', 'RECORDS'] },
  spooky: { normal: ['FOUND', 'FACE DOWN'], weakness: ['ASHES TO', 'ASHES'] },
  space: { normal: ['BATTERY', 'DEAD'], weakness: ['PARTS NOT', 'INCLUDED'] },
  hollywood: { normal: ['MISSED', 'THE MAT'], weakness: ['STILL', 'THUMBS-UP'] },
  foreign: { normal: ['OUT OF', 'AMMO'], weakness: ['LAID IN', 'CONCRETE'] },
  frontier: { normal: ['AAHHH!', '(LAST WORDS)'], weakness: ['ALL THAT', 'REMAINS'] },
  fantasy: { normal: ['SPACE C-14', 'OVERFLOW LOT'], weakness: ['SIZE', 'ZERO'] },
  cartoon: { normal: ['GOT IT', 'HIMSELF'], weakness: ['IN BITS', 'ALL OVER'] },
};
const SEEDS: Record<string, number> = { adventure: 11, spooky: 23, space: 37, hollywood: 41, foreign: 53, frontier: 67, fantasy: 71, cartoon: 89 };

/** The print itself (86 x 78): the scene, then the flash's falloff at the edges. */
const PRINTS = new Map<string, HTMLCanvasElement>();
const print = (land: string, how: BossDeath) => {
  const key = `${land}:${how}`;
  let cv = PRINTS.get(key);
  if (cv) return cv;
  const p = new Pix(PW, PH, SEEDS[land] ?? 1);
  SCENES[land][how](p);
  cv = document.createElement('canvas'); cv.width = PW; cv.height = PH;
  const g = cv.getContext('2d')!;
  g.putImageData(p.img, 0, 0);
  // (the flash: hard on the middle, the corners falling off in steps)
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, 0, PW, 1); g.fillRect(0, PH - 1, PW, 1); g.fillRect(0, 0, 1, PH); g.fillRect(PW - 1, 0, 1, PH);
  g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(1, 1, PW - 2, 1); g.fillRect(1, PH - 2, PW - 2, 1); g.fillRect(1, 1, 1, PH - 2); g.fillRect(PW - 2, 1, 1, PH - 2);
  for (const [x, y] of [[0, 0], [PW - 6, 0], [0, PH - 6], [PW - 6, PH - 6]]) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, y, 6, 6); }
  PRINTS.set(key, cv);
  return cv;
};

/** The DECEASED stamp: red, crooked, worn (the ink missing in specks). */
const stamp = (c: Ctx, x: number, y: number, small: boolean) => {
  const t = document.createElement('canvas'); t.width = 70; t.height = 16;
  const g = t.getContext('2d')!;
  g.fillStyle = '#B91C1C'; g.fillRect(0, 0, 70, 1); g.fillRect(0, 15, 70, 1); g.fillRect(0, 0, 1, 16); g.fillRect(69, 0, 1, 16);
  g.fillRect(2, 2, 66, 1); g.fillRect(2, 13, 66, 1);
  signText(g, 'DECEASED', 35, 11, { sx: 1, sy: 1, bold: true, fill: '#B91C1C' });
  // (worn: specks of it never took)
  let s = 7;
  for (let i = 0; i < 90; i++) { s = (s * 16807) % 2147483647; const px = s % 70; s = (s * 16807) % 2147483647; g.clearRect(px, s % 16, 1, 1); }
  c.save();
  c.globalAlpha = 0.85;
  c.translate(x, y); c.rotate(-0.22);
  if (small) c.scale(0.5, 0.5);
  c.imageSmoothingEnabled = false;
  c.drawImage(t, -35, -8);
  c.restore();
};

/** The black ribbon across the card's top left corner. */
const ribbon = (c: Ctx, ox: number, oy: number, k: number) => {
  c.save();
  c.beginPath(); c.moveTo(ox, oy + 12 * k); c.lineTo(ox + 12 * k, oy); c.lineTo(ox + 18 * k, oy); c.lineTo(ox, oy + 18 * k); c.closePath();
  c.fillStyle = '#0A0A0C'; c.fill();
  c.beginPath(); c.moveTo(ox, oy + 13 * k); c.lineTo(ox + 13 * k, oy); c.lineTo(ox + 14 * k, oy); c.lineTo(ox, oy + 14 * k); c.closePath();
  c.fillStyle = '#3F3F46'; c.fill();
  c.restore();
};

const CACHE = new Map<string, HTMLCanvasElement>();

/** Big: the cast panel's (the card, the caption plate, the ribbon, the stamp), the staff photo's size. Small: the YOU
 *  ARE GOING HERE card's (a thumbnail on a thin black border). */
export const remainsPhoto = (land: string, how: BossDeath, size: 'big' | 'small' = 'big'): HTMLCanvasElement | null => {
  if (!SCENES[land]) return null;
  const key = `${land}:${how}:${size}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const big = size === 'big';
  const PWs = big ? PW : 40, PHs = big ? PH : 36;
  const M = big ? 4 : 0, B = big ? 4 : 2, PLATE = big ? 25 : 0;
  const CW = PWs + B * 2, CH = PHs + B * 2 + PLATE;
  const cv = document.createElement('canvas');
  cv.width = CW + M * 2 + (big ? 2 : 1); cv.height = CH + M * 2 + (big ? 2 : 1);
  const c = cv.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  const ox = M, oy = M;
  // (the card: its shadow, black-edged, a dull white stock)
  c.fillStyle = 'rgba(20,12,4,0.4)'; c.fillRect(ox + 2, oy + 2, CW, CH);
  c.fillStyle = '#0A0A0C'; c.fillRect(ox, oy, CW, CH);
  c.fillStyle = '#ECE9E0'; c.fillRect(ox + 1, oy + 1, CW - 2, CH - 2);
  c.fillStyle = '#FFFFFF'; c.fillRect(ox + 1, oy + 1, CW - 2, 1);
  c.fillStyle = '#CFCABC'; c.fillRect(ox + 1, oy + CH - 2, CW - 2, 1); c.fillRect(ox + CW - 2, oy + 1, 1, CH - 2);
  const px = ox + B, py = oy + B;
  const src = print(land, how);
  if (big) c.drawImage(src, px, py);
  else { c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(src, 0, 0, PW, PH, px, py, PWs, PHs); c.imageSmoothingEnabled = false; }
  c.fillStyle = 'rgba(10,10,12,0.6)'; c.fillRect(px, py - 1, PWs, 1); c.fillRect(px - 1, py, 1, PHs);
  stamp(c, px + PWs * 0.62, py + PHs * 0.8, !big);
  if (big) {
    // (the caption plate: black, the words in silver)
    const ty = py + PHs + 3, tw = PWs, th = PLATE - 5;
    c.fillStyle = '#000000'; c.fillRect(px, ty, tw, th);
    c.fillStyle = '#27272A'; c.fillRect(px + 1, ty + 1, tw - 2, th - 2);
    c.fillStyle = '#52525B'; c.fillRect(px + 1, ty + 1, tw - 2, 1);
    c.fillStyle = '#18181B'; c.fillRect(px + 1, ty + th - 2, tw - 2, 1);
    const cap = CAPTIONS[land][how];
    const L = { sx: 1, sy: 1, bold: false, fill: '#E4E4E7' } as const;
    signText(c, cap[0], px + tw / 2, ty + 9, L, 'center');
    signText(c, cap[1], px + tw / 2, ty + 17, L, 'center');
  }
  ribbon(c, ox, oy, big ? 1 : 0.6);
  CACHE.set(key, cv);
  return cv;
};

const URLS = new Map<string, { url: string; w: number; h: number } | null>();
/** The remains as an image (for an <img>): its data URL and size, made once. */
export const remainsPhotoImg = (land: string, how: BossDeath, size: 'big' | 'small' = 'big') => {
  const key = `${land}:${how}:${size}`;
  if (!URLS.has(key)) { const cv = remainsPhoto(land, how, size); URLS.set(key, cv ? { url: cv.toDataURL(), w: cv.width, h: cv.height } : null); }
  return URLS.get(key)!;
};
