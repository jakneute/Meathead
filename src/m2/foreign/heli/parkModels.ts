// The park below as 3D models (mesh3d.ts, the landmarks' renderer: the same stepped ramps, dithers, decals and ink), so
// the pavilions he walked read as small but recognizable versions of their street art from up here, seen round as the
// camera goes round the circuit: each built once, local x across the pavilion (along the ring), z out from the lagoon
// (its front, the water side, at -z), y up. No volcano, no clock tower, none of the nine fought landmarks.
//
//   MEXICO: the stepped pyramid and its stair, the temple on top; the cantina (arches, tile roof).
//   NORWAY: the stave church (tier on tier of steep shingled gables, the spire); a turf-roofed log house; the longship
//     and its striped sail on the fjord pool.
//   CHINA: the four-tier pagoda (red walls, jade roofs, a gold finial); the Great Wall's runs and its crenels, a
//     watchtower.
//   GERMANY: half-timbered houses under steep roofs; the giant cuckoo clock (its face, its gable); the castle's round
//     tower and its slate cone.
//   ITALY: the Doge's-ish palace (the arcade, the rose wall's windows); the campanile (brick, the belfry, the green
//     spire, the gold angel).
//   JAPAN: the five-story pagoda; the torii; a little shrine.
//   MOROCCO: the medina's flat-roofed houses (rose and ochre, arched shops), the gate; the minaret-ish gift-shop tower
//     (its tile band, the lantern room, the dome and its gold finial).
//   FRANCE: the Haussmann block (windows in rows, the zinc mansard); THE ARC; the Louvre's glass pyramid.
//   THE UK: the terraces (brick, sash windows, slate, chimney stacks); the pub; THE WORLD'S TALLEST PHONE BOX; Tower
//     Bridge (its two towers, the walkway, the bascules); a double-decker on the plaza.
//   CANADA: the log cabin and its stone chimney; the carved (plywood) poles; the falls down the rock and the pool at
//     their foot, the snow on the clifftop; pines.
//   The lagoon's fireworks barge.

import { MB, mat, box, frustum, lathe, beam, type Mesh, type Mat, type Decal, type V3 } from './mesh3d';

const Q = Math.PI / 4;

// Materials: five steps each, darkest first, the shadows cooler, the lights warmer (the pavilions' street ramps)
const STUC = mat(['#6E5E58', '#A08C7C', '#CBB89C', '#E8D8BC', '#FBF1DE']);
const TERRA = mat(['#4E1E16', '#863824', '#B4562E', '#D47A48', '#EEA676']);
const OCH = mat(['#5E3A18', '#946024', '#C88A34', '#E4AE52', '#F6D084']);
const ROSE = mat(['#5E3434', '#925648', '#C47E64', '#DCA084', '#F0C6AA']);
const LACQ = mat(['#3E0A16', '#741420', '#A8221E', '#CC3A2A', '#EA6A4C']);
const JADE = mat(['#0C3030', '#185444', '#2A7A5A', '#46A076', '#7CC89C']);
const SLATE = mat(['#1A1E2E', '#2E3446', '#485066', '#687288', '#909AB0']);
const DKWOOD = mat(['#1E0E0C', '#3A2016', '#5A3622', '#7C5032', '#A2724A']);
const LOGW = mat(['#36200E', '#663E1E', '#9A6A36', '#BE8C50', '#E0B47C']);
const BRICK = mat(['#42161A', '#742A24', '#A04434', '#C0604A', '#DC8A6C']);
const STONE = mat(['#3E3C40', '#646066', '#8E8880', '#B6AE9E', '#DAD2C2']);
const SANDST = mat(['#5E4030', '#94704A', '#C49C66', '#DEBE88', '#F2DCB0']);
const WHITE = mat(['#7C8090', '#AAAEB8', '#D2D4DA', '#EEEEF0', '#FFFFFF']);
const GOLD = mat(['#5E3410', '#9A5E0A', '#CA8A04', '#EAB308', '#FDE68A']);
const GLASS = mat(['#1A3050', '#2A527A', '#4A82AA', '#7AAACC', '#C4E4F4']);
const COPPER = mat(['#163C38', '#286252', '#448672', '#6AAA90', '#9ACCB2']);
const ZINC = mat(['#242C3C', '#384456', '#526078', '#74829A', '#9EAAC0']);
const TURF = mat(['#1A3014', '#2A4E1C', '#42702A', '#62923C', '#8CB858']);
const PHONE = mat(['#3E060E', '#741014', '#AE1A16', '#D6302A', '#F2604C']);
const PINE = mat(['#0C2018', '#163624', '#225034', '#326C46', '#4C8C5C']);
const ROCK = mat(['#26242A', '#423E40', '#645C58', '#867C74', '#AAA096']);
const FALLS = mat(['#245080', '#4478AA', '#78AAD2', '#B4D8EE', '#F2FAFF']);
const SNOW = mat(['#7C8AA6', '#AEB8CC', '#D4DCE8', '#EEF2F8', '#FFFFFF']);
const PLY = mat(['#5A3818', '#8A5E2E', '#C09254', '#D8AE70', '#ECCC94']);
const SKYB = mat(['#14284E', '#1E3A7A', '#2A52A8', '#3E6EC8', '#6890E0']);
const SAIL = mat(['#6A1414', '#9A1E1E', '#C8302A', '#E25A48', '#F48A70']);
const CANVAS = mat(['#8A8070', '#B4AA98', '#D8D0BE', '#EEE8DA', '#FFFCF2']);
const IRONK = mat(['#121418', '#1E2228', '#2E343C', '#444C56', '#626C78']);

// ---------------------------------------------------------------------------------------------------------------
// Roofs

/** A gable over x0..x1 by z0..z1 from y0, `h` up, its ridge along x (or along z), its slopes' decal; `hip` pulls the
 *  ridge's ends in (a hip roof; 1: to a point). */
const gable = (b: MB, x0: number, x1: number, z0: number, z1: number, y0: number, h: number, alongX = true, dec?: Decal, hip = 0) => {
  const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, c: V3 = { x: xm, y: y0 + h / 3, z: zm };
  const e = [b.v(x0, y0, z0), b.v(x1, y0, z0), b.v(x1, y0, z1), b.v(x0, y0, z1)];
  if (alongX) {
    const ix = ((x1 - x0) / 2) * hip, r0 = b.v(x0 + ix, y0 + h, zm), r1 = b.v(x1 - ix, y0 + h, zm);
    b.f([e[0], e[1], r1, r0], c, dec); b.f([e[2], e[3], r0, r1], c, dec);
    b.f([e[3], e[0], r0], c); b.f([e[1], e[2], r1], c);
  } else {
    const iz = ((z1 - z0) / 2) * hip, r0 = b.v(xm, y0 + h, z0 + iz), r1 = b.v(xm, y0 + h, z1 - iz);
    b.f([e[1], e[2], r1, r0], c, dec); b.f([e[3], e[0], r0, r1], c, dec);
    b.f([e[0], e[1], r0], c); b.f([e[2], e[3], r1], c);
  }
};
/** A hip roof on four sides up to a point (a pagoda's eaves: `k` how far in its top is). */
const eaves = (b: MB, cx: number, cz: number, hw: number, hd: number, y0: number, h: number, k = 0.4) =>
  frustum(b, cx, cz, hw * Math.SQRT2, hd * Math.SQRT2, y0, y0 + h, 4, k, Q, { k: 'hlines', a: 3 });

// ---------------------------------------------------------------------------------------------------------------
// The pavilions

const mexico = (b: MB) => {
  // (the pyramid in four stepped tiers of cut stone, its stair up the water side, the temple on top)
  for (let t = 0; t < 4; t++) { const w = 66 - t * 15, y = t * 20; b.begin(t % 2 ? OCH : TERRA); box(b, -w, w, y, y + 20, 30 - w, 30 + w, { sides: { k: 'courses', a: 2, b: 5 } }); }
  b.begin(STUC);
  { const v = [b.v(-12, 0, -40), b.v(12, 0, -40), b.v(12, 80, 0), b.v(-12, 80, 0)]; b.f(v, { x: 0, y: 30, z: 30 }, { k: 'hlines', a: 12 }); }
  b.begin(STUC); box(b, -14, 14, 80, 98, 14, 42, { front: { k: 'arches', a: 1, col: '#2A1410' }, sides: { k: 'hlines', a: 2 } });
  b.begin(TERRA); box(b, -17, 17, 98, 103, 11, 45);
  // (the cantina: arches along its front, its tile roof)
  b.begin(STUC); box(b, 66, 112, 0, 26, -24, 26, { front: { k: 'arches', a: 3, col: '#3A2018' }, sides: { k: 'windows', a: 2, col: '#3A2018' } });
  b.begin(TERRA); gable(b, 62, 116, -28, 30, 26, 12, true, { k: 'hlines', a: 4 }, 0.3);
  b.begin(OCH, 0, true); box(b, -112, -70, 0, 18, -20, 20, { front: { k: 'arches', a: 2, col: '#3A2018' } });
  b.begin(TERRA, 0, true); box(b, -114, -68, 18, 21, -22, 22);
};

const norway = (b: MB) => {
  // (the stave church: the dark staves, tier on tier of steep shingled gables, the tower and its spire)
  b.begin(DKWOOD); box(b, -34, 14, 0, 28, 6, 56, { sides: { k: 'vlines', a: 7 } });
  b.begin(DKWOOD); gable(b, -40, 20, 0, 62, 28, 26, false, { k: 'hlines', a: 5 });
  b.begin(DKWOOD); box(b, -22, 2, 40, 58, 18, 44, { sides: { k: 'vlines', a: 4 } });
  b.begin(DKWOOD); gable(b, -27, 7, 13, 49, 58, 22, true, { k: 'hlines', a: 4 });
  b.begin(DKWOOD); box(b, -15, -5, 70, 88, 26, 36, { sides: { k: 'arches', a: 1, col: '#120806' } });
  b.begin(DKWOOD); frustum(b, -10, 31, 9, 9, 88, 124, 4, 0, Q, { k: 'hlines', a: 4 });
  b.begin(GOLD, 0, true); box(b, -11, -9, 124, 132, 30, 32);
  // (the log house and its turf roof)
  b.begin(LOGW); box(b, 40, 100, 0, 22, -6, 36, { sides: { k: 'hlines', a: 6 } });
  b.begin(TURF); gable(b, 36, 104, -10, 40, 22, 18, true);
  // (the longship on the fjord pool: the hull, its prow and stern posts, the mast, the striped sail)
  b.begin(DKWOOD); box(b, -64, 0, 0, 8, -96, -80, { sides: { k: 'hlines', a: 2 } });
  b.begin(DKWOOD, 0, true); beam(b, { x: -64, y: 4, z: -88 }, { x: -76, y: 22, z: -88 }, 2.5, 2.5); beam(b, { x: 0, y: 4, z: -88 }, { x: 12, y: 22, z: -88 }, 2.5, 2.5);
  b.begin(DKWOOD, 0, true); box(b, -33, -31, 8, 52, -89, -87);
  for (let k = 0; k < 4; k++) { b.begin(k % 2 ? CANVAS : SAIL, 0, true); box(b, -48 + k * 8, -40 + k * 8, 22, 48, -89, -88); }
};

const china = (b: MB) => {
  // (the pagoda: four tiers, red walls and their windows, the jade eaves, the gold finial)
  for (let t = 0; t < 4; t++) {
    const w = 28 - t * 5, y = t * 26;
    b.begin(LACQ); box(b, -w, w, y, y + 17, 30 - w, 30 + w, { sides: { k: 'windows', a: 2, col: '#2A0A0A' } });
    b.begin(JADE); eaves(b, 0, 30, w + 11, w + 11, y + 17, 9, 0.62);
  }
  b.begin(GOLD, 0, true); frustum(b, 0, 30, 3, 3, 104, 124, 4, 0.2, Q);
  // (the wall's runs, their crenels; the watchtower)
  for (const [x0, x1] of [[44, 104], [-120, -46]]) {
    b.begin(STONE); box(b, x0, x1, 0, 24, -10, 14, { sides: { k: 'courses', a: 3, b: 6 } });
    for (let x = x0 + 2; x < x1 - 4; x += 10) { b.begin(STONE, 0, true); box(b, x, x + 5, 24, 30, -12, -8); }
  }
  b.begin(STONE); box(b, 98, 124, 0, 44, -16, 18, { sides: { k: 'arches', a: 2, col: '#1E1612' } });
  b.begin(LACQ); gable(b, 94, 128, -20, 22, 44, 14, true, { k: 'hlines', a: 3 }, 0.4);
};

const germany = (b: MB) => {
  // (the half-timbered houses, their steep roofs gable end to the street)
  b.begin(STUC); box(b, -80, -28, 0, 40, 0, 50, { front: { k: 'timber', a: 3 }, back: { k: 'timber', a: 3 }, sides: { k: 'timber', a: 4 } });
  b.begin(TERRA); gable(b, -84, -24, -4, 54, 40, 36, false, { k: 'hlines', a: 6 });
  b.begin(STUC); box(b, -22, 26, 0, 46, 4, 56, { front: { k: 'timber', a: 3 }, back: { k: 'timber', a: 3 }, sides: { k: 'timber', a: 4 } });
  b.begin(BRICK); gable(b, -26, 30, 0, 60, 46, 38, false, { k: 'hlines', a: 6 });
  // (the giant cuckoo clock: its carved case, the face, the gable over it)
  b.begin(DKWOOD); box(b, 34, 62, 0, 66, -14, 4, { front: { k: 'clock', a: 0.32, b: 0.62 }, sides: { k: 'vlines', a: 3 } });
  b.begin(DKWOOD); gable(b, 30, 66, -18, 8, 66, 22, false, { k: 'hlines', a: 3 });
  // (the castle's round tower: cut stone, its slate cone)
  b.begin(STONE); frustum(b, 92, 34, 16, 16, 0, 96, 8, 1, Math.PI / 8, { k: 'courses', a: 6, b: 2 }, false);
  b.begin(SLATE); frustum(b, 92, 34, 20, 20, 96, 140, 8, 0, Math.PI / 8, { k: 'hlines', a: 4 });
};

const italy = (b: MB) => {
  // (the palace: the arcade along its foot, the rose wall over it and its windows, the crenels along its top)
  b.begin(STONE); box(b, -96, 22, 0, 20, 0, 56, { front: { k: 'arches', a: 8, col: '#2A2018' }, sides: { k: 'arches', a: 4, col: '#2A2018' } });
  b.begin(ROSE); box(b, -96, 22, 20, 46, 0, 56, { front: { k: 'windows', a: 6, col: '#3A1E1A' }, sides: { k: 'windows', a: 3, col: '#3A1E1A' } });
  for (let x = -94; x < 20; x += 9) { b.begin(STUC, 0, true); box(b, x, x + 4, 46, 51, -1, 3); }
  // (the campanile: brick shaft, the belfry's arches, the green spire, the gold angel on its tip)
  b.begin(BRICK); box(b, 36, 60, 0, 118, 18, 42, { sides: { k: 'vlines', a: 3 } });
  b.begin(STUC); box(b, 34, 62, 118, 138, 16, 44, { sides: { k: 'arches', a: 3, col: '#22160E' } });
  b.begin(COPPER); frustum(b, 48, 30, 15 * Math.SQRT2, 15 * Math.SQRT2, 138, 170, 4, 0, Q, { k: 'hlines', a: 3 });
  b.begin(GOLD, 0, true); box(b, 46.5, 49.5, 170, 180, 28.5, 31.5);
};

const japan = (b: MB) => {
  // (the five-story pagoda: each storey a little smaller, its wide dark eaves, the spire of rings)
  for (let t = 0; t < 5; t++) {
    const w = 22 - t * 3, y = t * 22;
    b.begin(LACQ); box(b, -w - 10, w - 10, y, y + 13, 40 - w, 40 + w, { sides: { k: 'grid', a: 2, b: 1, col: '#2A0A0A' } });
    b.begin(SLATE); eaves(b, -10, 40, w + 10, w + 10, y + 13, 9, 0.55);
  }
  b.begin(GOLD, 0, true); frustum(b, -10, 40, 2.5, 2.5, 110, 140, 4, 0.5, Q, { k: 'hlines', a: 6, col: '#713F12' });
  // (the torii: two posts, the tie beam, the top beam black over red)
  for (const x of [72, 100]) { b.begin(LACQ); box(b, x, x + 5, 0, 52, -54, -49); }
  b.begin(LACQ); box(b, 68, 109, 40, 45, -54, -49);
  b.begin(LACQ); box(b, 64, 113, 50, 55, -56, -47);
  b.begin(IRONK); box(b, 62, 115, 55, 59, -57, -46);
  // (a little shrine)
  b.begin(DKWOOD, 0, true); box(b, 60, 100, 0, 16, 10, 40, { front: { k: 'grid', a: 3, b: 1, col: '#E8DCC0' } });
  b.begin(SLATE, 0, true); gable(b, 56, 104, 6, 44, 16, 12, true, { k: 'hlines', a: 3 });
};

const morocco = (b: MB) => {
  // (the medina: flat-roofed houses in rose and ochre, arched shops along their foot; the gate)
  b.begin(ROSE); box(b, -72, -14, 0, 36, 0, 60, { front: { k: 'arches', a: 2, col: '#3A1A14' }, sides: { k: 'windows', a: 2, col: '#3A1A14' } });
  b.begin(OCH); box(b, -14, 46, 0, 28, 4, 56, { front: { k: 'arches', a: 3, col: '#3A1A14' }, sides: { k: 'windows', a: 2, col: '#3A1A14' } });
  for (const [x0, x1, y] of [[-72, -14, 36], [-14, 46, 28]] as const) for (let x = x0 + 1; x < x1 - 3; x += 8) { b.begin(SANDST, 0, true); box(b, x, x + 4, y, y + 4, -1, 3); }
  b.begin(SANDST); box(b, -116, -78, 0, 44, -14, 10, { front: { k: 'arches', a: 1, col: '#1E1210' }, sides: { k: 'hlines', a: 2 } });
  b.begin(JADE, 0, true); box(b, -118, -76, 30, 34, -16, 12);
  // (the tower: sandstone, its zellige band, the lantern room's arches, the green dome and its gold balls)
  b.begin(SANDST); box(b, 60, 84, 0, 112, 20, 44, { sides: { k: 'vlines', a: 2 } });
  b.begin(JADE); box(b, 59, 85, 98, 106, 19, 45, { sides: { k: 'vlines', a: 6, col: '#F2DCB0' } });
  b.begin(SANDST, 0, true); box(b, 58, 86, 112, 116, 18, 46);
  b.begin(WHITE); box(b, 64, 80, 116, 132, 24, 40, { sides: { k: 'arches', a: 1, col: '#2A2018' } });
  b.begin(COPPER); lathe(b, 72, 32, [[9, 132], [9, 136], [6, 142], [0, 146]], 8);
  b.begin(GOLD, 0, true); frustum(b, 72, 32, 1.5, 1.5, 146, 160, 4, 0.6, Q);
};

const france = (b: MB) => {
  // (the Haussmann block: cream stone, its windows in rows; the zinc mansard over it)
  b.begin(STUC); box(b, -94, 30, 0, 40, 10, 66, { front: { k: 'windows', a: 8, b: 3, col: '#2A2430' }, back: { k: 'windows', a: 8, b: 3, col: '#2A2430' }, sides: { k: 'windows', a: 3, b: 3, col: '#2A2430' } });
  b.begin(ZINC); gable(b, -96, 32, 8, 68, 40, 20, true, { k: 'windows', a: 7, b: 1, col: '#C8B490' }, 0.12);
  // (THE ARC: two piers, the vault through them, the attic on top)
  b.begin(STUC); box(b, 40, 86, 0, 54, -8, 14, { front: { k: 'arches', a: 1, col: '#3A3028' }, back: { k: 'arches', a: 1, col: '#3A3028' }, sides: { k: 'arches', a: 1, col: '#3A3028' } });
  b.begin(STUC); box(b, 38, 88, 54, 64, -10, 16, { sides: { k: 'hlines', a: 2 } });
  // (the Louvre's glass pyramid)
  b.begin(GLASS); frustum(b, 100, 44, 26 * Math.SQRT2, 26 * Math.SQRT2, 0, 40, 4, 0, Q, { k: 'lattice', a: 3 });
};

const uk = (b: MB) => {
  // (the terraces: brick, sash windows in rows, the slate roof, the chimney stacks)
  b.begin(BRICK); box(b, -104, -12, 0, 38, 4, 50, { front: { k: 'windows', a: 6, b: 3, col: '#E8E0D0' }, back: { k: 'windows', a: 6, b: 3, col: '#2A2430' }, sides: { k: 'windows', a: 2, b: 3, col: '#2A2430' } });
  b.begin(SLATE); gable(b, -106, -10, 0, 54, 38, 18, true, { k: 'hlines', a: 4 });
  for (const x of [-90, -58, -26]) { b.begin(BRICK, 0, true); box(b, x, x + 8, 44, 62, 24, 32); }
  // (the pub: its green front, the gold-lit windows)
  b.begin(JADE); box(b, -12, 22, 0, 24, 2, 40, { front: { k: 'windows', a: 2, col: '#E8B04A' }, sides: { k: 'windows', a: 2, col: '#E8B04A' } });
  b.begin(SLATE); gable(b, -14, 24, -2, 44, 24, 14, true);
  // (THE WORLD'S TALLEST PHONE BOX: red, glazed up its whole height in little panes, its crown and domed top)
  b.begin(PHONE); box(b, 40, 58, 0, 118, 16, 34, { sides: { k: 'grid', a: 3, b: 12, col: '#C8DCEC' } });
  b.begin(PHONE); box(b, 38, 60, 118, 126, 14, 36, { sides: { k: 'hlines', a: 2, col: '#F2F0EA' } });
  b.begin(PHONE); frustum(b, 49, 25, 11 * Math.SQRT2, 11 * Math.SQRT2, 126, 134, 4, 0.45, Q);
  b.begin(GOLD, 0, true); box(b, 47, 51, 134, 139, 23, 27);
  // (Tower Bridge: the two towers, their gothic windows and slate tops; the high walkway, the bascules)
  for (const x of [66, 100]) {
    b.begin(STONE); box(b, x, x + 12, 0, 58, -44, -32, { sides: { k: 'windows', a: 1, b: 3, col: '#2A2430' } });
    b.begin(SLATE); frustum(b, x + 6, -38, 8 * Math.SQRT2, 8 * Math.SQRT2, 58, 74, 4, 0, Q);
  }
  b.begin(SKYB); box(b, 78, 100, 46, 51, -42, -34, { front: { k: 'lattice', a: 3 } });
  b.begin(SKYB); box(b, 78, 100, 12, 15, -43, -33);
  // (a double-decker on the plaza)
  b.begin(PHONE, 0, true); box(b, -70, -34, 0, 18, -76, -64, { sides: { k: 'grid', a: 5, b: 2, col: '#2A2430' } });
};

const canada = (b: MB) => {
  // (the log cabin, its shake roof, the fieldstone chimney)
  b.begin(LOGW); box(b, -86, -36, 0, 24, 0, 40, { sides: { k: 'hlines', a: 7 }, front: { k: 'windows', a: 2, col: '#2A1A10' } });
  b.begin(DKWOOD); gable(b, -90, -32, -4, 44, 24, 18, true, { k: 'hlines', a: 4 });
  b.begin(STONE, 0, true); box(b, -40, -32, 0, 50, 14, 24, { sides: { k: 'courses', a: 5, b: 2 } });
  // (the carved poles: plywood, painted in bands, the wings bolted across the top)
  for (const [x, z, n] of [[-20, -16, 4], [6, -24, 3]] as const) {
    const cols = [PLY, LACQ, SKYB, OCH];
    for (let k = 0; k < n; k++) { b.begin(cols[((Math.floor(k + (x < 0 ? 0 : 1)) % 4) + 4) % 4]); box(b, x, x + 8, k * 14, k * 14 + 14, z, z + 6, { front: { k: 'panel' } }); }
    b.begin(PLY, 0, true); box(b, x - 8, x + 16, n * 14 - 4, n * 14, z + 1, z + 4);
  }
  // (THE FALLS: the rock in strata, the snow on its top, the water down its face, the pool at its foot)
  b.begin(ROCK); box(b, 30, 116, 0, 78, 20, 72, { sides: { k: 'hlines', a: 5 } });
  b.begin(SNOW); box(b, 28, 118, 78, 84, 18, 74);
  b.begin(FALLS); box(b, 62, 78, 0, 79, 17, 20, { front: { k: 'vlines', a: 4, col: '#F2FAFF' } });
  b.begin(FALLS); box(b, 48, 92, 0, 2, -6, 17);
  // (pines)
  for (const [x, z, h] of [[-112, 10, 46], [-102, 34, 38], [118, -10, 42], [24, 50, 50]] as const) {
    b.begin(DKWOOD, 0, true); box(b, x - 2, x + 2, 0, 8, z - 2, z + 2);
    for (let t = 0; t < 3; t++) { b.begin(PINE); frustum(b, x, z, 12 - t * 3, 12 - t * 3, 6 + t * (h / 4), 6 + t * (h / 4) + h / 2.2, 6, 0, 0); }
  }
};

/** The fireworks barge on the lagoon: a gray hull, its racks of mortar tubes, a flag. */
const barge = (b: MB) => {
  b.begin(IRONK); box(b, -34, 34, 0, 8, -14, 14, { sides: { k: 'hlines', a: 2 } });
  b.begin(SLATE); box(b, -30, 30, 8, 10, -11, 11);
  for (let i = 0; i < 6; i++) { b.begin(i % 2 ? LACQ : SKYB, 0, true); frustum(b, -22 + i * 9, -2 + (i % 2) * 6, 2.5, 2.5, 10, 20, 6, 1, 0); }
  b.begin(IRONK, 0, true); box(b, 24, 26, 10, 34, -1, 1);
  b.begin(LACQ, 0, true); box(b, 26, 38, 26, 33, -0.5, 0.5);
};

export type ParkModel = 'mexico' | 'norway' | 'china' | 'germany' | 'italy' | 'japan' | 'morocco' | 'france' | 'uk' | 'canada' | 'barge';
const BUILD: Record<ParkModel, (b: MB) => void> = { mexico, norway, china, germany, italy, japan, morocco, france, uk, canada, barge };
const built = new Map<ParkModel, Mesh>();
/** A pavilion's model (built once). */
export const parkModel = (id: ParkModel): Mesh => {
  let m = built.get(id);
  if (!m) { const b = new MB(); BUILD[id](b); m = b.done(); built.set(id, m); }
  return m;
};
export type { Mat };
